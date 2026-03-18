import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  FlatList, Image, Animated, RefreshControl 
} from 'react-native';
import { ArrowLeft, X, MapPin } from 'lucide-react-native';
import { useSyncData } from '../../hooks/useSyncData';

export const SavedItemsScreen = ({ navigation }: any) => {
  const { savedAds, savedSearches, loading, refresh, deleteSavedItem } = useSyncData();
  const [activeTab, setActiveTab] = useState<'Ads' | 'Searches'>('Ads');
  
  // Undo Logic State
  const [showUndo, setShowUndo] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ id: string, type: 'Ad' | 'Search' } | null>(null);
  const undoTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDelete = (id: string, type: 'Ad' | 'Search') => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    
    setLastDeleted({ id, type });
    setShowUndo(true);

    // Finalize deletion after 4 seconds if not undone
    undoTimer.current = setTimeout(() => {
      deleteSavedItem(id, type);
      setShowUndo(false);
      setLastDeleted(null);
    }, 4000);
  };

  const handleUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setShowUndo(false);
    setLastDeleted(null);
  };

  const renderAdCard = ({ item }: any) => {
    if (lastDeleted?.id === item.id) return null; // Optimistic UI hiding
    const ad = item.ads;
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Image source={{ uri: ad.images?.[0] }} style={styles.adImage} />
          <View style={styles.adInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id, 'Ad')}><X size={20} color="#111827" /></TouchableOpacity>
            </View>
            <Text style={styles.adPrice}>₦{ad.price.toLocaleString()}</Text>
            <View style={styles.metaRow}>
               <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('AdDetails', { adId: ad.id })}>
          <Text style={styles.viewBtnText}>View ad</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Saved</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.tabBar}>
          {['Ads', 'Searches'].map((tab: any) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
    data={(activeTab === 'Ads' ? savedAds : savedSearches) as any[]} // Added 'as any[]' to solve type mismatch
    keyExtractor={(item) => item.id}
    renderItem={activeTab === 'Ads' ? renderAdCard : renderAdCard}
    refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#008102']} />}
    contentContainerStyle={styles.listContent}
    ListEmptyComponent={<Text style={styles.emptyText}>No saved {activeTab.toLowerCase()} yet.</Text>}
    />

      {showUndo && (
        <View style={styles.undoToast}>
          <Text style={styles.undoText}>Item removed</Text>
          <TouchableOpacity onPress={handleUndo}><Text style={styles.undoAction}>UNDO</Text></TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 40 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#008102' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  activeTabText: { color: '#008102' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', padding: 12 },
  adImage: { width: 80, height: 80, borderRadius: 8 },
  adInfo: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  adTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  adPrice: { fontSize: 15, fontWeight: '700', color: '#008102', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#6B7280' },
  viewBtn: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center' },
  viewBtnText: { fontSize: 14, color: '#008102', fontWeight: '600', textDecorationLine: 'underline' },
  undoToast: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#111827', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 5 },
  undoText: { color: '#FFFFFF', fontSize: 14 },
  undoAction: { color: '#008102', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' }
});