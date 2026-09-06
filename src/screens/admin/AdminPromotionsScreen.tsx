// src/screens/admin/AdminPromotionsScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

type FilterTab = 'all' | 'active' | 'pending' | 'expired';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: GREEN,     bg: '#D1FAE5' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  expired:   { label: 'Expired',   color: GRAY,      bg: '#F3F4F6' },
  rejected:  { label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: GRAY,      bg: '#F3F4F6' },
};

const TYPE_LABELS: Record<string, string> = {
  carousel:  'Carousel',
  trending:  'Trending',
  search_ad: 'Search Ads',
  bundle:    'Bundle',
};

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week', '1_month': '1 Month', '3_months': '3 Months',
};

export const AdminPromotionsScreen = ({ navigation }: any) => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]               = useState<FilterTab>('active');

  useFocusEffect(useCallback(() => { fetchPromotions(); }, []));

  const fetchPromotions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data: promoData, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!promoData || promoData.length === 0) { setPromotions([]); return; }

      const productIds = [...new Set(promoData.map((p: any) => p.product_id))];
      const sellerIds  = [...new Set(promoData.map((p: any) => p.seller_id))];

      const [productsRes, sellersRes] = await Promise.all([
        supabase.from('products').select('id, title, price').in('id', productIds),
        supabase.from('profiles').select('id, full_name').in('id', sellerIds),
      ]);

      const productMap: Record<string, any> = {};
      (productsRes.data ?? []).forEach((p: any) => { productMap[p.id] = p; });

      const sellerMap: Record<string, any> = {};
      (sellersRes.data ?? []).forEach((s: any) => { sellerMap[s.id] = s; });

      setPromotions(promoData.map((p: any) => ({
        ...p,
        product: productMap[p.product_id] ?? null,
        seller:  sellerMap[p.seller_id] ?? null,
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleExpire = (item: any) => {
    Alert.alert(
      'Expire Promotion',
      `Expire ${item.seller?.full_name}'s ${TYPE_LABELS[item.promotion_type]} promotion? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Expire',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('promotions')
                .update({ status: 'expired', updated_at: new Date().toISOString() })
                .eq('id', item.id);

              // Free up carousel slot if applicable
              if (item.promotion_type === 'carousel' || item.promotion_type === 'bundle') {
                await supabase
                  .from('carousel_slots')
                  .update({
                    slot_type:    'empty',
                    is_available: true,
                    promotion_id: null,
                    product_id:   null,
                    seller_id:    null,
                    expires_at:   null,
                  })
                  .eq('promotion_id', item.id);
              }

              await fetchPromotions();
              Alert.alert('Done', 'Promotion has been expired.');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  const handleActivate = (item: any) => {
    Alert.alert(
      'Activate Promotion',
      `Activate ${item.seller?.full_name}'s ${TYPE_LABELS[item.promotion_type]} promotion?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              const now = new Date();
              const durationDays: Record<string, number> = {
                '1_week': 7, '1_month': 30, '3_months': 90,
              };
              const expiresAt = new Date(now);
              expiresAt.setDate(expiresAt.getDate() + (durationDays[item.plan_duration] ?? 30));

              await supabase
                .from('promotions')
                .update({
                  status:     'active',
                  starts_at:  now.toISOString(),
                  expires_at: expiresAt.toISOString(),
                })
                .eq('id', item.id);

              await fetchPromotions();
              Alert.alert('Activated!', 'Promotion is now live.');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  const filtered = promotions.filter(p => {
    if (tab === 'all')     return true;
    if (tab === 'active')  return p.status === 'active';
    if (tab === 'pending') return p.status === 'pending';
    return ['expired', 'rejected', 'cancelled'].includes(p.status);
  });

  const counts = {
    all:     promotions.length,
    active:  promotions.filter(p => p.status === 'active').length,
    pending: promotions.filter(p => p.status === 'pending').length,
    expired: promotions.filter(p => ['expired','rejected','cancelled'].includes(p.status)).length,
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Promotions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminMarketLeader')}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Market Leader</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['all', 'active', 'pending', 'expired'] as FilterTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPromotions(true)} tintColor={GREEN} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No {tab} promotions</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.expired;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.typeText}>
                    {TYPE_LABELS[item.promotion_type] ?? item.promotion_type}
                    {item.bundle_name ? ` (${item.bundle_name.replace(/_/g, ' ')})` : ''}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {item.product?.title ?? 'Unknown product'}
                </Text>
                <Text style={styles.sellerName}>{item.seller?.full_name ?? 'Unknown seller'}</Text>
                <View style={styles.cardMid}>
                  <Text style={styles.metaText}>
                    {DURATION_LABELS[item.plan_duration] ?? item.plan_duration} · ₦{Number(item.amount_paid).toLocaleString()}
                  </Text>
                  <Text style={styles.metaText}>Expires {formatDate(item.expires_at)}</Text>
                </View>

                {/* Admin action buttons */}
                <View style={styles.actionRow}>
                  {item.status === 'active' && (
                    <TouchableOpacity
                      style={styles.expireBtn}
                      onPress={() => handleExpire(item)}
                    >
                      <Text style={styles.expireBtnText}>Expire Now</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => handleActivate(item)}
                    >
                      <Text style={styles.activateBtnText}>Activate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText:    { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  tabs:          { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab:           { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabActive:     { borderBottomWidth: 3, borderBottomColor: GREEN },
  tabText:       { fontSize: 11, color: GRAY, fontWeight: '500' },
  tabTextActive: { color: GREEN, fontWeight: '700' },
  card:          { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeText:      { fontSize: 14, fontWeight: '700', color: '#111827' },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:    { fontSize: 11, fontWeight: '700' },
  productTitle:  { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  sellerName:    { fontSize: 13, color: GRAY, marginBottom: 8 },
  cardMid:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaText:      { fontSize: 12, color: GRAY },
  actionRow:     { flexDirection: 'row', gap: 8 },
  expireBtn:     { flex: 1, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#DC2626', justifyContent: 'center', alignItems: 'center' },
  expireBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  activateBtn:   { flex: 1, height: 36, borderRadius: 18, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  activateBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  empty:         { alignItems: 'center', marginTop: 60 },
  emptyText:     { fontSize: 15, color: GRAY },
});