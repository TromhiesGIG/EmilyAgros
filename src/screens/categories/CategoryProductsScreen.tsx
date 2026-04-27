// src/screens/categories/CategoryProductsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, LayoutGrid, List as ListIcon } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { ProductCard } from '../../components/ProductCard';

type CategoryProductsScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'CategoryProducts'
>;

type CategoryProductsScreenRouteProp = RouteProp<HomeStackParamList, 'CategoryProducts'>;

interface CategoryProductsScreenProps {
  navigation: CategoryProductsScreenNavigationProp;
  route: CategoryProductsScreenRouteProp;
}

export const CategoryProductsScreen: React.FC<CategoryProductsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { categoryId, categoryName, subcategoryId, subcategoryName } = route.params;
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, subcategoryId]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'Active')
        .eq('category_id', categoryId);

      // Filter by subcategory if provided
      if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

  const toggleLayout = () => {
    setLayout(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const displayTitle = subcategoryName || categoryName;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        <TouchableOpacity onPress={toggleLayout}>
          {layout === 'grid' ? (
            <ListIcon size={24} color="#111827" />
          ) : (
            <LayoutGrid size={24} color="#111827" />
          )}
        </TouchableOpacity>
      </View>

      {/* Products */}
      {loading ? (
        <ActivityIndicator size="large" color="#008102" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008102']} />
          }
        >
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No products yet in this category</Text>
              <Text style={styles.emptySubtext}>Be the first to post!</Text>
              <TouchableOpacity
                style={styles.postButton}
                onPress={() => {
                  // Navigate to root tab navigator's Sell tab
                  const rootNav = navigation.getParent();
                  if (rootNav) {
                    rootNav.navigate('SellTab');
                  }
                }}
              >
                <Text style={styles.postButtonText}>Post an Ad</Text>
              </TouchableOpacity>
            </View>
          ) : layout === 'list' ? (
            <View style={styles.listContainer}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => navigation.navigate('AdDetails', { adId: product.id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout="grid"
                  onPress={() => navigation.navigate('AdDetails', { adId: product.id })}
                />
              ))}
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  listContainer: {
    paddingTop: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#008102',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});