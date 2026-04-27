import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  FlatList, Image, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

interface SavedItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    location_state: string;
    negotiable: boolean;
  } | null;
}

export const SavedItemsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [savedAds, setSavedAds] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Undo Logic State
  const [showUndo, setShowUndo] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ id: string, item: SavedItem } | null>(null);
  const undoTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]);

  const fetchSavedItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            title,
            price,
            images,
            location_state,
            negotiable
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAds((data as unknown as SavedItem[]) || []);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: SavedItem) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    
    // Optimistically remove from UI
    setSavedAds(prev => prev.filter(ad => ad.id !== item.id));
    
    setLastDeleted({ id: item.id, item });
    setShowUndo(true);

    // Finalize deletion after 4 seconds if not undone
    undoTimer.current = setTimeout(async () => {
      await deleteSavedItem(item.id);
      setShowUndo(false);
      setLastDeleted(null);
    }, 4000);
  };

  const deleteSavedItem = async (savedItemId: string) => {
    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', savedItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting saved item:', error);
    }
  };

  const handleUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    
    // Restore the deleted item
    if (lastDeleted) {
      setSavedAds(prev => {
        // Add back in chronological order
        const newList = [...prev, lastDeleted.item];
        return newList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }
    
    setShowUndo(false);
    setLastDeleted(null);
  };

  const renderAdCard = ({ item }: { item: SavedItem }) => {
    const ad = item.products;
    
    if (!ad) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Image 
            source={{ uri: ad.images?.[0] || 'https://via.placeholder.com/80' }} 
            style={styles.adImage} 
          />
          <View style={styles.adInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <X size={20} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={styles.adPrice}>
              {ad.negotiable ? 'Negotiable' : `₦${ad.price.toLocaleString()}`}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Saved {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewBtn} 
          onPress={() => navigation.navigate('AdDetails', { adId: ad.id })}
        >
          <Text style={styles.viewBtnText}>View ad</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Saved Ads</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <FlatList
        data={savedAds}
        keyExtractor={(item) => item.id}
        renderItem={renderAdCard}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchSavedItems} 
            colors={['#00A651']} 
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved ads yet.</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any ad to save it here
            </Text>
          </View>
        }
      />

      {showUndo && (
        <View style={styles.undoToast}>
          <Text style={styles.undoText}>Item removed</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoAction}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827' 
  },
  listContent: { 
    padding: 16 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    marginBottom: 16, 
    overflow: 'hidden' 
  },
  cardContent: { 
    flexDirection: 'row', 
    padding: 12 
  },
  adImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  adInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  titleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 4 
  },
  adTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827', 
    flex: 1, 
    marginRight: 8 
  },
  adPrice: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#00A651', 
    marginBottom: 8 
  },
  metaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  metaText: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
  viewBtn: { 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    alignItems: 'center' 
  },
  viewBtnText: { 
    fontSize: 14, 
    color: '#00A651', 
    fontWeight: '600', 
    textDecorationLine: 'underline' 
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  undoToast: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20, 
    backgroundColor: '#111827', 
    padding: 16, 
    borderRadius: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  undoText: { 
    color: '#FFFFFF', 
    fontSize: 14 
  },
  undoAction: { 
    color: '#00A651', 
    fontWeight: '700' 
  },
});