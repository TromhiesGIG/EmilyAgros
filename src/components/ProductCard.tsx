// src/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ProductCardProps {
  product: any;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const imageUri = product.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';
  const price = product.price ? `₦${Number(product.price).toLocaleString()}` : 'Price on request';
  const location = [product.location_state, product.location_lga]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title || 'Untitled'}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.location} numberOfLines={1}>📍 {location}</Text>
        {product.negotiable && <Text style={styles.negotiable}>Negotiable</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#008102',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  negotiable: {
    fontSize: 11,
    color: '#008102',
    fontWeight: '500',
  },
});