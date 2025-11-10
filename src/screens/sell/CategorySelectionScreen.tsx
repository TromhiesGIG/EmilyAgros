import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SellStackParamList, Category } from '../../navigation/types';
import { CATEGORIES } from '../../data/categoryConfig';

type CategorySelectionNavigationProp = StackNavigationProp<
  SellStackParamList,
  'CategorySelection'
>;

type CategorySelectionRouteProp = RouteProp<SellStackParamList, 'CategorySelection'>;

interface CategorySelectionScreenProps {
  navigation: CategorySelectionNavigationProp;
  route: CategorySelectionRouteProp;
}

export const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const currentCategory = route.params?.currentCategory;

  const handleCategorySelect = (category: Category) => {
    // Navigate back to PostNewAd with selected category
    navigation.navigate('PostNewAd', {
      selectedCategory: category,
      selectedSubcategory: undefined, // Clear subcategory when category changes
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Category</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Categories Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((category) => {
            const isSelected = currentCategory?.id === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Image source={category.icon} style={styles.categoryIcon} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
    position: 'relative',
  },
  categoryItemSelected: {
    opacity: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  categoryIcon: {
    width: 50,
    height: 50,
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#111827',
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00A651',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});