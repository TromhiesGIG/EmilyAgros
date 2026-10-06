// src/screens/main/MyAdsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, MoreVertical } from 'lucide-react-native';
import { useSyncData, Ad } from '../../hooks/useSyncData';

export const MyAdsScreen = ({ navigation }: any) => {
  const { myAds, loading, refresh } = useSyncData();
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Cancelled'>('All');

  const filteredAds = myAds.filter(ad => {
    if (activeTab === 'All') return true;
    return ad.status === activeTab;
  });

  const AdCard = ({ item }: { item: Ad }) => {
    const imageUri = item.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';
    const location = [item.location_state, item.location_lga].filter(Boolean).join(', ') || 'Location not set';
    const price = item.price ? `₦${Number(item.price).toLocaleString()}` : 'Price not set';

    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <Image source={{ uri: imageUri }} style={styles.adImage} />
          <View style={styles.adInfo}>
            <View style={styles.statusHeader}>
              <View style={[
                styles.statusBadge,
                item.status === 'Active' ? styles.activeBadge : styles.cancelledBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Active' ? styles.activeText : styles.cancelledText
                ]}>
                  {item.status}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AdDetails', { adId: item.id })}>
                <MoreVertical size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.adPrice}>{price}</Text>
            <Text style={styles.adLocation} numberOfLines={1}>📍 {location}</Text>
            <Text style={styles.metrics}>{item.views || 0} views</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.createdText}>
            {new Date(item.created_at).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </Text>

          {item.status === 'Active' ? (
            // ⚡ Boost button — opens promotion flow pre-selecting this ad
            <TouchableOpacity
              style={styles.boostButton}
                onPress={() => navigation.navigate('Subscriptions', {
                  initialTab: 'boost',
                  preselectedProductId: item.id,
                })}
            >
              <Text style={styles.boostButtonText}>⚡ Boost</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reactivateButton}>
              <Text style={styles.reactivateButtonText}>Reactivate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Ads</Text>
          <TouchableOpacity>
            <Search size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['All', 'Active', 'Cancelled'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredAds}
        renderItem={({ item }) => <AdCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#008102']} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No ads found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'All'
                  ? "You haven't posted any ads yet."
                  : `You have no ${activeTab.toLowerCase()} ads.`}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SellTab')}
                style={styles.postBtn}
              >
                <Text style={styles.postBtnText}>Post an Ad</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#008102" style={{ marginTop: 50 }} />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:             { flex: 1, backgroundColor: '#FFFFFF' },
  header:               { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTop:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  tabBar:               { flexDirection: 'row', paddingHorizontal: 16 },
  tab:                  { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab:            { borderBottomWidth: 3, borderBottomColor: '#008102' },
  tabText:              { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  activeTabText:        { color: '#008102', fontWeight: '700' },
  listContent:          { padding: 16 },
  card:                 { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardMain:             { flexDirection: 'row', padding: 12 },
  adImage:              { width: 100, height: 100, borderRadius: 8, backgroundColor: '#F3F4F6' },
  adInfo:               { flex: 1, marginLeft: 12 },
  statusHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  statusBadge:          { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  activeBadge:          { backgroundColor: '#DCFCE7' },
  cancelledBadge:       { backgroundColor: '#FEE2E2' },
  statusText:           { fontSize: 11, fontWeight: '600' },
  activeText:           { color: '#166534' },
  cancelledText:        { color: '#B91C1C' },
  adTitle:              { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  adPrice:              { fontSize: 15, fontWeight: '700', color: '#008102', marginBottom: 2 },
  adLocation:           { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  metrics:              { fontSize: 12, color: '#6B7280' },
  cardFooter:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  createdText:          { fontSize: 13, color: '#6B7280' },
  boostButton:          { backgroundColor: '#008102', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  boostButtonText:      { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  reactivateButton:     { borderWidth: 1, borderColor: '#008102', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  reactivateButtonText: { color: '#008102', fontWeight: '600', fontSize: 14 },
  emptyContainer:       { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle:           { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle:        { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  postBtn:              { backgroundColor: '#008102', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  postBtnText:          { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});