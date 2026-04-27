// src/screens/categories/SubcategoriesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';

type SubcategoriesScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'Subcategories'
>;

type SubcategoriesScreenRouteProp = RouteProp<HomeStackParamList, 'Subcategories'>;

interface SubcategoriesScreenProps {
  navigation: SubcategoriesScreenNavigationProp;
  route: SubcategoriesScreenRouteProp;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  ad_count?: number;
}

export const SubcategoriesScreen: React.FC<SubcategoriesScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { categoryId, categoryName } = route.params;
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      // Fetch subcategories
      const { data: subData, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

      if (subError) throw subError;

      if (subData) {
        // Fetch ad counts for each subcategory
        const { data: countData, error: countError } = await supabase
          .from('products')
          .select('subcategory_id')
          .eq('category_id', categoryId)
          .eq('status', 'Active');

        if (!countError && countData) {
          // Count ads per subcategory
          const countMap: Record<number, number> = {};
          countData.forEach((row: any) => {
            if (row.subcategory_id) {
              countMap[row.subcategory_id] = (countMap[row.subcategory_id] || 0) + 1;
            }
          });

          // Add counts to subcategories
          const subWithCounts = subData.map(sub => ({
            ...sub,
            ad_count: countMap[sub.id] || 0,
          }));

          setSubcategories(subWithCounts);
        } else {
          setSubcategories(subData);
        }
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    navigation.navigate('CategoryProducts', {
      categoryId,
      categoryName,
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 24 }} />
        </View>
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
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Subcategories List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {subcategories.map((subcategory) => (
          <TouchableOpacity
            key={subcategory.id}
            style={styles.subcategoryItem}
            onPress={() => handleSubcategoryPress(subcategory)}
            activeOpacity={0.7}
          >
            <View style={styles.subcategoryContent}>
              <Text style={styles.subcategoryName}>{subcategory.name}</Text>
              <Text style={styles.adCount}>
                {subcategory.ad_count || 0} ads
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
        
        {subcategories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No subcategories available</Text>
          </View>
        )}
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
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  adCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});