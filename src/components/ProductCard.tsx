// src/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface ProductCardProps {
  product: any;
  onPress: () => void;
  viewMode?: 'list' | 'grid';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress,
  viewMode = 'list'
}) => {
  const imageUri = product.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';
  const price = product.price ? `₦${Number(product.price).toLocaleString()}` : 'Price on request';
  const location = [product.location_state, product.location_lga]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity 
        style={styles.gridCard} 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUri }} style={styles.gridImage} />
        <View style={styles.gridInfo}>
          <Text style={styles.gridTitle} numberOfLines={2}>{product.title || 'Untitled'}</Text>
          <Text style={styles.gridPrice}>{price}</Text>
          <View style={styles.gridLocationRow}>
            <MapPin size={12} color="#6B7280" />
            <Text style={styles.gridLocation} numberOfLines={1}>{location}</Text>
          </View>
          {product.negotiable && <Text style={styles.gridNegotiable}>Negotiable</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title || 'Untitled'}</Text>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>
        {product.negotiable && <Text style={styles.negotiable}>Negotiable</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List Layout
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  negotiable: {
    fontSize: 11,
    color: '#008102',
    fontWeight: '500',
  },
  
  // Grid Layout
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    marginHorizontal: '1%',
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
  gridImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  gridInfo: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    height: 36,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008102',
    marginBottom: 4,
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  gridLocation: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  gridNegotiable: {
    fontSize: 10,
    color: '#008102',
    fontWeight: '500',
    marginTop: 2,
  },
});