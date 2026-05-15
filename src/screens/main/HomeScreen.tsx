// src/screens/main/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  Linking, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, LayoutGrid } from 'lucide-react-native';
import { Carousel } from '../../components/Carousel';
import { ProductCard } from '../../components/ProductCard';
import { supabase } from '../../services/supabase';

export const HomeScreen = ({ navigation }: any) => {
  const [trendingAds, setTrendingAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories from database
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (!categoriesError && categoriesData) {
        // Fetch ad counts per category
        const { data: countData, error: countError } = await supabase
          .from('products')
          .select('category_id')
          .eq('status', 'Active');

        if (!countError && countData) {
          // Count ads per category
          const countMap: Record<number, number> = {};
          countData.forEach((row: any) => {
            if (row.category_id) {
              countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
            }
          });

          // Add counts and icons to categories
          const categoriesWithCounts = categoriesData.map(cat => ({
            ...cat,
            adCount: countMap[cat.id] || 0,
            icon: getCategoryIcon(cat.slug),
          }));

          setCategories(categoriesWithCounts);
        }
      }

      // Fetch live ads from products table
      const { data: adsData, error: adsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!adsError) setTrendingAds(adsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getCategoryIcon = (slug: string) => {
    const iconMap: Record<string, any> = {
      'trending': require('../../../assets/trending.png'),
      'livestock-pets': require('../../../assets/livestock.png'),
      'services': require('../../../assets/services.png'),
      'food-fruits-vegetables': require('../../../assets/fruit.png'),
      'animal-feed': require('../../../assets/feed.png'),
      'tractors-farm-equipments': require('../../../assets/tractors.png'),
      'fertilizers': require('../../../assets/fertilizer.png'),
      'animal-accessories': require('../../../assets/accessories.png'),
      'seedlings': require('../../../assets/seed.png'),
      'animal-pharmacy': require('../../../assets/pharmacy.png'),
      'animal-mating': require('../../../assets/Animal.png'),
      'agro-chemicals': require('../../../assets/chemicals.png'),
      'horticulture': require('../../../assets/hort.png'),
      'agro-loan': require('../../../assets/loan.png'),
      'agro-insurance': require('../../../assets/insurance.png'),
    };
    return iconMap[slug] || require('../../../assets/trending.png');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryPress = (category: any) => {
    // Skip coming soon categories
    if (category.id === 14 || category.id === 15) {
      return;
    }

    // If category has subcategories, navigate to subcategories
    if (category.has_subcategories) {
      navigation.navigate('Subcategories', {
        categoryId: category.id,
        categoryName: category.name,
      });
    } else {
      // Otherwise navigate directly to products
      navigation.navigate('CategoryProducts', {
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  };

  // Only show featured categories (first 8) on home screen
  const featuredCategories = categories.slice(0, 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008102']} />
        }
      >
        <Carousel />

        {/* How To Section */}
        <View style={styles.howToSection}>
          <TouchableOpacity
            style={styles.howToCard}
            onPress={() => Linking.openURL('https://youtu.be/tnv1IrkUPts')}
          >
            <Image source={require('../../../assets/sell.png')} style={styles.howToIcon} />
            <View style={styles.howToButton}>
              <Text style={styles.howToText}>How to Sell</Text>
              <ChevronRight size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.howToCard}
            onPress={() => Linking.openURL('https://youtu.be/Mgqi9CW6XGc')}
          >
            <Image source={require('../../../assets/buy.png')} style={styles.howToIcon} />
            <View style={styles.howToButton}>
              <Text style={styles.howToText}>How to Buy</Text>
              <ChevronRight size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllCategories')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={18} color="#008102" />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {featuredCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryIcon}>
                  <Image source={category.icon} style={styles.iconImage} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Ads Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              <LayoutGrid size={24} color="#4B5768" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#008102" style={{ marginVertical: 20 }} />
          ) : trendingAds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No ads yet. Be the first to post!</Text>
              <TouchableOpacity
                style={styles.postAdBtn}
                onPress={() => navigation.navigate('SellTab')}
              >
                <Text style={styles.postAdText}>Post an Ad</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={viewMode === 'grid' ? styles.trendingGrid : styles.trendingList}>
              {trendingAds.map(ad => (
                <ProductCard
                  key={ad.id}
                  product={ad}
                  viewMode={viewMode}
                  onPress={() => navigation.navigate('AdDetails', { adId: ad.id })}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F9' },
  container: { flex: 1 },
  howToSection: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    marginVertical: 16, 
    gap: 12 
  },
  howToCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    alignItems: 'center' 
  },
  howToIcon: { width: 32, height: 32 },
  howToButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  howToText: { fontSize: 13, fontWeight: '600', color: '#111827', marginRight: 2 },
  section: { marginBottom: 12, backgroundColor: '#FFFFFF', paddingVertical: 16 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0D0F11' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 14, color: '#008102', fontWeight: '600' },
  categoriesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 8 
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F7F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 50,
    height: 50,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#111827',
  },
  emptyContainer: { 
    alignItems: 'center', 
    paddingVertical: 32, 
    paddingHorizontal: 16 
  },
  emptyText: { 
    fontSize: 15, 
    color: '#6B7280', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  postAdBtn: { 
    backgroundColor: '#008102', 
    paddingHorizontal: 24, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  postAdText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  trendingList: {
    paddingHorizontal: 0,
  },
  bottomPadding: { height: 40 },
});