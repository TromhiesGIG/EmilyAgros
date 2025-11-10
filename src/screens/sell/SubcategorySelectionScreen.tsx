// src/screens/sell/SubcategorySelectionScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SellStackParamList, Subcategory } from '../../navigation/types';
import { getSubcategoriesByCategory } from '../../data/categoryConfig';

type SubcategorySelectionNavigationProp = StackNavigationProp<
  SellStackParamList,
  'SubcategorySelection'
>;

type SubcategorySelectionRouteProp = RouteProp<
  SellStackParamList,
  'SubcategorySelection'
>;

interface SubcategorySelectionScreenProps {
  navigation: SubcategorySelectionNavigationProp;
  route: SubcategorySelectionRouteProp;
}

export const SubcategorySelectionScreen: React.FC<
  SubcategorySelectionScreenProps
> = ({ navigation, route }) => {
  const { category, currentSubcategory } = route.params;
  const subcategories = getSubcategoriesByCategory(category.id);

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    // Navigate back to PostNewAd with selected subcategory
    navigation.navigate('PostNewAd', {
      selectedCategory: category,
      selectedSubcategory: subcategory,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Subcategories List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {subcategories.map((subcategory) => {
            const isSelected = currentSubcategory?.id === subcategory.id;

            return (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.listItem,
                  isSelected && styles.listItemSelected,
                ]}
                onPress={() => handleSubcategorySelect(subcategory)}
                activeOpacity={0.7}
              >
                <Text style={styles.listItemText}>{subcategory.name}</Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
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
    backgroundColor: '#F9FAFB',
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
  listContainer: {
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listItemSelected: {
    borderColor: '#00A651',
    backgroundColor: '#F0FDF4',
  },
  listItemText: {
    fontSize: 16,
    color: '#111827',
  },
  checkmark: {
    color: '#00A651',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});