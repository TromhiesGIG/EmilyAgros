// src/screens/promotions/MyPromotionsScreen.tsx

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Eye, TrendingUp, Search, LayoutDashboard, Package, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { PromotionsStackParamList } from '../../navigation/types';
import { getMyPromotions } from '../../services/promotionService';
import { SellerPromotionSummary, PLAN_DURATION_LABELS } from '../../types/promotions';
import { useAuth } from '../../providers/AuthProvider';

type Props = {
  navigation: NativeStackNavigationProp<PromotionsStackParamList, 'MyPromotions'>;
};

const GREEN = '#008102';
const GRAY  = '#6B7280';

type Tab = 'active' | 'pending' | 'expired';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  carousel:  <LayoutDashboard size={16} color="#E65100" />,
  trending:  <TrendingUp size={16} color={GREEN} />,
  search_ad: <Search size={16} color="#1565C0" />,
  bundle:    <Package size={16} color="#6D28D9" />,
};

const TYPE_LABELS: Record<string, string> = {
  carousel:  'Carousel',
  trending:  'Trending',
  search_ad: 'Search Ads',
  bundle:    'Bundle',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: GREEN,     bg: '#D1FAE5' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  expired:   { label: 'Expired',   color: '#6B7280', bg: '#F3F4F6' },
  rejected:  { label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
};

export const MyPromotionsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<SellerPromotionSummary[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('active');

  const fetchPromotions = async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getMyPromotions(user.id);
      setPromotions(data);
    } catch (err) {
      console.error('MyPromotions fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPromotions(); }, [user]));

  const filtered = promotions.filter((p) => {
    if (activeTab === 'active')  return p.status === 'active';
    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'expired') return ['expired', 'rejected', 'cancelled'].includes(p.status);
    return false;
  });

  const counts = {
    active:  promotions.filter((p) => p.status === 'active').length,
    pending: promotions.filter((p) => p.status === 'pending').length,
    expired: promotions.filter((p) => ['expired', 'rejected', 'cancelled'].includes(p.status)).length,
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderPromotion = ({ item }: { item: SellerPromotionSummary }) => {
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.expired;

    return (
      <View style={styles.card}>
        {/* Top row: type + status badge */}
        <View style={styles.cardTopRow}>
          <View style={styles.typeRow}>
            {TYPE_ICONS[item.promotion_type]}
            <Text style={styles.typeLabel}>{TYPE_LABELS[item.promotion_type] ?? item.promotion_type}</Text>
            {item.bundle_name && (
              <Text style={styles.bundleLabel}>({item.bundle_name.replace(/_/g, ' ')})</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Plan duration */}
        <Text style={styles.durationText}>{PLAN_DURATION_LABELS[item.plan_duration]}</Text>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Started</Text>
            <Text style={styles.dateValue}>{formatDate(item.starts_at)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Expires</Text>
            <Text style={styles.dateValue}>{formatDate(item.expires_at)}</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Paid</Text>
            <Text style={styles.dateValue}>₦{Number(item.amount_paid).toLocaleString()}</Text>
          </View>
        </View>

        {/* Views (active only) */}
        {item.status === 'active' && (
          <View style={styles.viewsRow}>
            <Eye size={14} color={GRAY} />
            <Text style={styles.viewsText}>{item.view_count.toLocaleString()} views</Text>
          </View>
        )}

        {/* Renew button (expired) */}
        {['expired', 'rejected'].includes(item.status) && (
          <TouchableOpacity
            style={styles.renewBtn}
            onPress={() =>
              navigation.navigate('PromotionType', { productId: item.product_id })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.renewBtnText}>Renew</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Promotions</Text>
        <TouchableOpacity
          style={styles.boostBtn}
          onPress={() => navigation.navigate('PromotionType', {})}
        >
          <Text style={styles.boostBtnText}>+ Boost</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['active', 'pending', 'expired'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] > 0 ? ` (${counts[tab]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No {activeTab} promotions</Text>
          {activeTab === 'active' && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PromotionType', {})}
            >
              <Text style={styles.emptyBtnText}>Boost an Ad</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderPromotion}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPromotions(true)}
              tintColor={GREEN}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFFFFF' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn:        { width: 38, height: 38, justifyContent: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  boostBtn:       { backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  boostBtnText:   { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  tabs:           { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab:            { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:      { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText:        { fontSize: 13, color: GRAY, fontWeight: '500' },
  tabTextActive:  { color: GREEN, fontWeight: '700' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText:      { fontSize: 15, color: GRAY, textAlign: 'center', marginBottom: 16 },
  emptyBtn:       { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:   { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  list:           { padding: 16, gap: 12 },
  card:           { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  cardTopRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeLabel:      { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  bundleLabel:    { fontSize: 11, color: GRAY, textTransform: 'capitalize' },
  statusBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:     { fontSize: 11, fontWeight: '700' },
  durationText:   { fontSize: 12, color: GRAY, marginBottom: 10 },
  datesRow:       { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dateCol:        { flex: 1 },
  dateLabel:      { fontSize: 10, color: GRAY, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  dateValue:      { fontSize: 12, color: '#374151', fontWeight: '500' },
  viewsRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  viewsText:      { fontSize: 12, color: GRAY },
  renewBtn:       { marginTop: 10, borderWidth: 1.5, borderColor: GREEN, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  renewBtnText:   { color: GREEN, fontWeight: '700', fontSize: 13 },
});