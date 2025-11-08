// src/components/CategoryItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../navigation/types';

interface CategoryItemProps {
  category: Category;
  onPress: () => void;
  layout?: 'grid' | 'list';
  gridStyle?: 'circular' | 'square';
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  onPress,
  layout = 'grid',
  gridStyle = 'circular',
}) => {
  if (layout === 'list') {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.listIconContainer}>
          <Image source={category.icon} style={styles.listIcon} />
        </View>
        <Text style={styles.listName}>{category.name}</Text>
      </TouchableOpacity>
    );
  }

  const isSquare = gridStyle === 'square';
  const containerStyle = isSquare ? styles.squareContainer : styles.circularContainer;
  const iconStyle = isSquare ? styles.squareIcon : styles.circularIcon;

  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, containerStyle]}>
        <Image source={category.icon} style={iconStyle} />
      </View>
      <Text style={styles.gridName} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Grid: Circular Style (for Home Screen)
  circularContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F7F8F9',
  },
  circularIcon: {
    width: 50,
    height: 50,
  },

  // Grid: Square Style (for All Categories Screen)
  squareContainer: {
    width: 85,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  squareIcon: {
    width: 70,
    height: 70,
  },

  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  gridName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#111827',
    marginTop: 4,
  },
  
  // List Layout
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  listIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listIcon: {
    width: 60,
    height: 60,
  },
  
  listName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 16,
  },
});