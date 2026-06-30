// src/screens/admin/AdminPromotionsScreen.tsx
// View all promotions across all sellers

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
  carousel: 'Carousel', trending: 'Trending',
  search_ad: 'Search Ads', bundle: 'Bundle',
};

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week', '1_month': '1 Month', '3_months': '3 Months',
};

export const AdminPromotionsScreen = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]               = useState<FilterTab>('active');

  useFocusEffect(useCallback(() => { fetchPromotions(); }, []));

  const fetchPromotions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select(`
          *,
          product:products(title, price),
          seller:profiles(full_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (!error) setPromotions(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const filtered = promotions.filter(p => {
    if (tab === 'all')     return true;
    if (tab === 'active')  return p.status === 'active';
    if (tab === 'pending') return p.status === 'pending';
    return ['expired', 'rejected', 'cancelled'].includes(p.status);
  });

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Promotions</Text>
        <Text style={styles.headerSub}>{promotions.length} total</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'active', 'pending', 'expired'] as FilterTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
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
                  <Text style={styles.typeText}>{TYPE_LABELS[item.promotion_type] ?? item.promotion_type}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.productTitle} numberOfLines={1}>{item.product?.title}</Text>
                <Text style={styles.sellerName}>{item.seller?.full_name}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.metaText}>
                    {DURATION_LABELS[item.plan_duration]} · ₦{Number(item.amount_paid).toLocaleString()}
                  </Text>
                  <Text style={styles.metaText}>Expires {formatDate(item.expires_at)}</Text>
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
  safe:         { flex: 1, backgroundColor: '#FFFFFF' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSub:    { fontSize: 13, color: GRAY },
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 3, borderBottomColor: GREEN },
  tabText:      { fontSize: 13, color: GRAY, fontWeight: '500' },
  tabTextActive:{ color: GREEN, fontWeight: '700' },
  card:         { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeText:     { fontSize: 14, fontWeight: '700', color: '#111827' },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  productTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  sellerName:   { fontSize: 13, color: GRAY, marginBottom: 8 },
  cardBottom:   { flexDirection: 'row', justifyContent: 'space-between' },
  metaText:     { fontSize: 12, color: GRAY },
  empty:        { alignItems: 'center', marginTop: 60 },
  emptyText:    { fontSize: 15, color: GRAY },
});