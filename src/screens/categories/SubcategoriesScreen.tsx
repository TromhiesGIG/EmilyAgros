// src/screens/categories/SubcategoriesScreen.tsx - FIXED QUERY
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { SearchBar } from '../../components/search/SearchBar';
import { supabase } from '../../services/supabase';

type SubcategoriesScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Subcategories'>;
  route: RouteProp<HomeStackParamList, 'Subcategories'>;
};

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  ad_count: number;
}

export const SubcategoriesScreen: React.FC<SubcategoriesScreenProps> = ({
  navigation,
  route,
}) => {
  const { categoryId, categoryName } = route.params;

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  useEffect(() => {
    filterSubcategories();
  }, [searchQuery, subcategories]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      
      // FIXED: Get subcategories first
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

      if (subcategoriesError) throw subcategoriesError;

      if (!subcategoriesData || subcategoriesData.length === 0) {
        setSubcategories([]);
        setFilteredSubcategories([]);
        setLoading(false);
        return;
      }

      // FIXED: Get product counts separately
      const subcategoriesWithCount = await Promise.all(
        subcategoriesData.map(async (sub) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('subcategory_id', sub.id);

          if (countError) {
            console.error('Error counting products:', countError);
          }

          return {
            ...sub,
            ad_count: count || 0,
          };
        })
      );

      setSubcategories(subcategoriesWithCount);
      setFilteredSubcategories(subcategoriesWithCount);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubcategories = () => {
    if (!searchQuery.trim()) {
      setFilteredSubcategories(subcategories);
      return;
    }

    const filtered = subcategories.filter((sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubcategories(filtered);
  };

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    navigation.navigate('CategoryProducts', {
      categoryId,
      categoryName,
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
    });
  };

  const renderSubcategory = ({ item }: { item: Subcategory }) => (
    <TouchableOpacity
      style={styles.subcategoryItem}
      onPress={() => handleSubcategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.subcategoryInfo}>
        <Text style={styles.subcategoryName}>{item.name}</Text>
        <Text style={styles.adCount}>{item.ad_count} ads</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>{categoryName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008102" />
        </View>
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
        <Text style={styles.title}>{categoryName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="What are you looking for?"
        />
      </View>

      {/* Subcategories List */}
      <FlatList
        data={filteredSubcategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSubcategory}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? `No subcategories found for "${searchQuery}"`
                : 'No subcategories available'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  adCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});