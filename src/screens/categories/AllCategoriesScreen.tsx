// src/screens/categories/AllCategoriesScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Grid, List } from 'lucide-react-native';
import { HomeStackParamList } from '../../navigation/types';
import { CategoryItem } from '../../components/CategoryItem';
import { categories } from '../../data/mockData';

type AllCategoriesScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'AllCategories'
>;

interface AllCategoriesScreenProps {
  navigation: AllCategoriesScreenNavigationProp;
}

export const AllCategoriesScreen: React.FC<AllCategoriesScreenProps> = ({ navigation }) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const toggleLayout = () => {
    setLayout(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <TouchableOpacity onPress={toggleLayout}>
          {layout === 'grid' ? (
            <List size={24} color="#111827" />
          ) : (
            <Grid size={24} color="#111827" />
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {layout === 'grid' ? (
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                layout="grid"
                gridStyle="square" 
                onPress={() => {
                  // TODO: Navigate to category products
                  console.log('Category pressed:', category.name);
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                layout="list"
                onPress={() => {
                  // TODO: Navigate to category products
                  console.log('Category pressed:', category.name);
                }}
              />
            ))}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 28,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  categoriesList: {
    padding: 16,
  },
  bottomPadding: {
    height: 20,
  },
});