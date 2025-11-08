import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Linking,
  SafeAreaView 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronRight, LayoutGrid } from 'lucide-react-native'; 
import { HomeStackParamList } from '../../navigation/types';
import { Carousel } from '../../components/Carousel';
import { CategoryItem } from '../../components/CategoryItem';
import { ProductCard } from '../../components/ProductCard';
import { getFeaturedCategories, trendingProducts } from '../../data/mockData';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const featuredCategories = getFeaturedCategories();

  return (
    // 1. Replaced ScrollView/Header with SafeAreaView
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Carousel Banner */}
        <Carousel />

        {/* How To Cards */}
        <View style={styles.howToSection}>
          {/* 2. Fixed Nested Touchable: Outer card is now the button */}
          <TouchableOpacity 
            style={styles.howToCard} 
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://youtu.be/tnv1IrkUPts?si=kmMzyJcF4LCVsDFt')}
          >
            <Image source={require('../../../assets/sell.png')} style={styles.howToIcon} />
            
            {/* 2. Fixed Nested Touchable: Inner button is now a View */}
            <View style={styles.howToButton}>
              <Text style={styles.howToText}>How to Sell</Text>
              <ChevronRight size={20} color="#6B7280" />
            </View>

          </TouchableOpacity>
          
          {/* 2. Fixed Nested Touchable: Outer card is now the button */}
          <TouchableOpacity 
            style={styles.howToCard} 
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://youtu.be/Mgqi9CW6XGc?si=Lnew0E-PHl9JvkEJ')}
          >
            <Image source={require('../../../assets/buy.png')} style={styles.howToIcon} />
            
            {/* 2. Fixed Nested Touchable: Inner button is now a View */}
            <View style={styles.howToButton}>
              <Text style={styles.howToText}>How to Buy</Text>
              <ChevronRight size={20} color="#6B7280" />
            </View>

          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate('AllCategories')}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={20} color="#008102" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {featuredCategories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                onPress={() => {
                  console.log('Category pressed:', category.name);
                }}
              />
            ))}
          </View>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            {/* 4. Added Grid/List Toggle Icon */}
            <TouchableOpacity onPress={() => console.log('Toggle grid/list view')}>
              <LayoutGrid size={24} color="#4B5768" fill="#4B5768" />
            </TouchableOpacity>
          </View>
          {trendingProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { product })}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  container: {
    flex: 1,
  },
  howToSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
    gap: 12,
  },
  howToCard: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  howToIcon: {
    width: 40,
    height: 40,
  },
  howToButton: {
    flexDirection: 'row',     
    alignItems: 'center',
    padding: 16,
  },
  howToText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827', 
    marginRight: 4, 
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF', 
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D0F11',
    letterSpacing: -0.32,
    lineHeight: 25,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#008102',
    fontWeight: '400',
    letterSpacing: -0.32,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  bottomPadding: {
    height: 20,
  },
});