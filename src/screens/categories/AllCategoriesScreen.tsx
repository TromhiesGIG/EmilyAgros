// src/screens/categories/AllCategoriesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, LayoutGrid, List as ListIcon } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { ChevronRight } from 'lucide-react-native';

type AllCategoriesScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'AllCategories'
>;

interface AllCategoriesScreenProps {
  navigation: AllCategoriesScreenNavigationProp;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  has_subcategories: boolean;
}

export const AllCategoriesScreen: React.FC<AllCategoriesScreenProps> = ({ navigation }) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayout = () => {
    setLayout(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const handleCategoryPress = (category: Category) => {
    // Categories 14 & 15 are "Coming Soon"
    if (category.id === 14 || category.id === 15) {
      return; // Do nothing for coming soon categories
    }

    // If category has subcategories, show subcategories screen
    if (category.has_subcategories) {
      navigation.navigate('Subcategories', { 
        categoryId: category.id,
        categoryName: category.name 
      });
    } else {
      // Otherwise, show products directly
      navigation.navigate('CategoryProducts', { 
        categoryId: category.id,
        categoryName: category.name 
      });
    }
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

  const renderGridItem = (category: Category) => {
    const isComingSoon = category.id === 14 || category.id === 15;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={styles.gridItem}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={isComingSoon ? 1 : 0.7}
      >
        <View style={[styles.gridIconContainer, isComingSoon && styles.comingSoonContainer]}>
          <Image 
            source={getCategoryIcon(category.slug)} 
            style={[styles.gridIcon, isComingSoon && styles.comingSoonIcon]} 
          />
        </View>
        <Text style={[styles.gridName, isComingSoon && styles.comingSoonText]} numberOfLines={2}>
          {category.name}
        </Text>
        {isComingSoon && <Text style={styles.comingSoonLabel}>Coming Soon</Text>}
      </TouchableOpacity>
    );
  };

  const renderListItem = (category: Category) => {
    const isComingSoon = category.id === 14 || category.id === 15;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={styles.listItem}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={isComingSoon ? 1 : 0.7}
      >
        <View style={[styles.listIconContainer, isComingSoon && styles.comingSoonContainer]}>
          <Image 
            source={getCategoryIcon(category.slug)} 
            style={[styles.listIcon, isComingSoon && styles.comingSoonIcon]} 
          />
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listName, isComingSoon && styles.comingSoonText]}>
            {category.name}
          </Text>
          {isComingSoon && <Text style={styles.comingSoonLabelList}>Coming Soon</Text>}
        </View>
        {!isComingSoon && <ChevronRight size={20} color="#9CA3AF" />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#008102" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <TouchableOpacity onPress={toggleLayout}>
          {layout === 'grid' ? (
            <ListIcon size={24} color="#111827" />
          ) : (
            <LayoutGrid size={24} color="#111827" />
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {layout === 'grid' ? (
          <View style={styles.categoriesGrid}>
            {categories.map(category => renderGridItem(category))}
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {categories.map(category => renderListItem(category))}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  gridIconContainer: {
    width: 85,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#F7F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridIcon: {
    width: 70,
    height: 70,
  },
  gridName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#111827',
    fontWeight: '500',
  },
  categoriesList: {
    backgroundColor: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F7F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listIcon: {
    width: 48,
    height: 48,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  // Coming Soon Styles
  comingSoonContainer: {
    opacity: 0.5,
  },
  comingSoonIcon: {
    opacity: 0.6,
  },
  comingSoonText: {
    color: '#9CA3AF',
  },
  comingSoonLabel: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
  comingSoonLabelList: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});