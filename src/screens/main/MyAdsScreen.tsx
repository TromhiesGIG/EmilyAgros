// src/screens/main/MyAdsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  Image,
  ScrollView
} from 'react-native';
import { ArrowLeft, Search, MoreVertical, ChevronDown } from 'lucide-react-native';

// Mock data based on your "My Ads (All)" design
const MOCK_ADS = [
  {
    id: '1',
    title: 'Massey Ferguson 399',
    category: 'Tractor/Farm Equipments',
    status: 'Active',
    views: 0,
    chats: 0,
    created: 'Today',
    image: 'https://images.unsplash.com/photo-1592919016327-0460f336c2a6?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Ecofloat Fish Feed 4mm',
    category: 'Animal Feed',
    status: 'Cancelled',
    views: 79,
    chats: 10,
    created: 'Sep 25',
    image: 'https://images.unsplash.com/photo-1615827341235-9856a908906a?q=80&w=1000&auto=format&fit=crop'
  }
];

export const MyAdsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('All');

  const AdCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <Image source={{ uri: item.image }} style={styles.adImage} />
        <View style={styles.adInfo}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, item.status === 'Active' ? styles.activeBadge : styles.cancelledBadge]}>
              <Text style={[styles.statusText, item.status === 'Active' ? styles.activeText : styles.cancelledText]}>
                {item.status}
              </Text>
            </View>
            <TouchableOpacity>
              <MoreVertical size={20} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.adCategory}>{item.category}</Text>
          
          <Text style={styles.metrics}>
            {item.views} views • {item.chats} chats
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.createdText}>Created {item.created}</Text>
        <TouchableOpacity 
          style={[styles.actionButton, item.status === 'Cancelled' ? styles.reactivateButton : styles.boostButton]}
          onPress={() => item.status === 'Active' ? console.log("Boost pressed") : console.log("Reactivate pressed")}
        >
          <Text style={[styles.actionButtonText, item.status === 'Cancelled' && styles.reactivateButtonText]}>
            {item.status === 'Active' ? 'Boost' : 'Reactivate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredAds = activeTab === 'All' 
    ? MOCK_ADS 
    : MOCK_ADS.filter(ad => ad.status === activeTab);

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

        {/* Custom Tab Bar */}
        <View style={styles.tabBar}>
          {['All', 'Active', 'Cancelled'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sorting Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlText}>Sort: Category</Text>
          <ChevronDown size={18} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlText}>Ascending</Text>
          <ChevronDown size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Expiry Warning for Cancelled Tab */}
      {activeTab === 'Cancelled' && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Cancelled ads will be permanently deleted after 7 days
          </Text>
        </View>
      )}

      <FlatList
        data={filteredAds}
        renderItem={({ item }) => <AdCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No ads created!</Text>
            <Text style={styles.emptySubtitle}>You haven't posted any ads yet.</Text>
            <TouchableOpacity style={styles.emptyLink}>
              <Text style={styles.emptyLinkText}>Create your first ad</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#008102' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#008102', fontWeight: '700' },
  controls: { flexDirection: 'row', padding: 16, gap: 12 },
  controlBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  controlText: { fontSize: 14, color: '#111827' },
  warningBanner: { backgroundColor: '#FEF2F2', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8 },
  warningText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', padding: 12 },
  adImage: { width: 100, height: 100, borderRadius: 8 },
  adInfo: { flex: 1, marginLeft: 12 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  activeBadge: { backgroundColor: '#DCFCE7' },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '600' },
  activeText: { color: '#166534' },
  cancelledText: { color: '#B91C1C' },
  adTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  adCategory: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  metrics: { fontSize: 12, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  createdText: { fontSize: 13, color: '#6B7280' },
  actionButton: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  boostButton: { backgroundColor: '#008102' },
  reactivateButton: { borderWidth: 1, borderColor: '#008102' },
  actionButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  reactivateButtonText: { color: '#008102' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  emptyLink: {
    marginTop: 8,
    padding: 10,
  },
  emptyLinkText: { fontSize: 16, color: '#008102', fontWeight: '600', textDecorationLine: 'underline' }
});