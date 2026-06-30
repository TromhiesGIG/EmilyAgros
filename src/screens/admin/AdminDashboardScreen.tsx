// src/screens/admin/AdminDashboardScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { signOut } = useAuth();
  const [stats, setStats]       = useState({
    pendingQueue:    0,
    activeCarousel:  0,
    activeTrending:  0,
    activeSearchAds: 0,
    totalRevenue:    0,
    todayRevenue:    0,
  });
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    fetchStats();
  }, []));

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [queueRes, carouselRes, trendingRes, searchRes, revenueRes, todayRes] =
        await Promise.all([
          supabase.from('admin_queue').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('promotions').select('id', { count: 'exact' }).eq('promotion_type', 'carousel').eq('status', 'active'),
          supabase.from('promotions').select('id', { count: 'exact' }).eq('promotion_type', 'trending').eq('status', 'active'),
          supabase.from('promotions').select('id', { count: 'exact' }).eq('promotion_type', 'search_ad').eq('status', 'active'),
          supabase.from('promotions').select('amount_paid').eq('status', 'active'),
          supabase.from('promotions').select('amount_paid').gte('created_at', today.toISOString()),
        ]);

      const totalRevenue = (revenueRes.data ?? []).reduce((sum: number, r: any) => sum + Number(r.amount_paid), 0);
      const todayRevenue = (todayRes.data ?? []).reduce((sum: number, r: any) => sum + Number(r.amount_paid), 0);

      setStats({
        pendingQueue:    queueRes.count ?? 0,
        activeCarousel:  carouselRes.count ?? 0,
        activeTrending:  trendingRes.count ?? 0,
        activeSearchAds: searchRes.count ?? 0,
        totalRevenue,
        todayRevenue,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const StatCard = ({ label, value, color = '#111827', onPress }: any) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>EmilyAgros</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchStats(true)} tintColor={GREEN} />
          }
        >
          {/* Revenue */}
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.row}>
            <StatCard label="Total Active Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} color={GREEN} />
            <StatCard label="Today" value={`₦${stats.todayRevenue.toLocaleString()}`} color={GREEN} />
          </View>

          {/* Queue */}
          <Text style={styles.sectionTitle}>Action Required</Text>
          <StatCard
            label="Pending Carousel Approvals"
            value={stats.pendingQueue}
            color={stats.pendingQueue > 0 ? '#DC2626' : '#111827'}
            onPress={() => navigation.navigate('Queue')}
          />

          {/* Active promotions */}
          <Text style={styles.sectionTitle}>Active Promotions</Text>
          <View style={styles.row}>
            <StatCard label="Carousel Slots" value={`${stats.activeCarousel}/3`} />
            <StatCard label="Trending"        value={stats.activeTrending} />
          </View>
          <View style={styles.row}>
            <StatCard label="Search Ads" value={stats.activeSearchAds} />
            <View style={styles.statCard} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#FFFFFF' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSub:    { fontSize: 13, color: GRAY, marginTop: 2 },
  signOutBtn:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  signOutText:  { fontSize: 13, fontWeight: '600', color: '#DC2626' },
  scroll:       { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 20 },
  row:          { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard:     { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  statValue:    { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statLabel:    { fontSize: 13, color: GRAY },
});