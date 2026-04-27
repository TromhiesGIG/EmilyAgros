// src/screens/main/SellerProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  ChevronDown,
  Star,
} from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

interface Seller {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  location_state: string;
  category_id: number;
  negotiable: boolean;
}

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
  reviewer_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const SellerProfileScreen = ({ route, navigation }: any) => {
  const { sellerId } = route.params;
  const { user } = useAuth();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    average_rating: 0,
    total_reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (profileError) throw profileError;
      setSeller(profileData);

      // Fetch seller's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Extract unique category IDs and fetch their names
      const uniqueCategoryIds = [...new Set(productsData?.map(p => p.category_id).filter(Boolean))];
      
      if (uniqueCategoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', uniqueCategoryIds);

        // Create map of category_id -> name
        const catMap: Record<number, string> = {};
        categoriesData?.forEach(cat => {
          catMap[cat.id] = cat.name;
        });
        setCategoryMap(catMap);

        const categoryNames = ['All', ...(categoriesData?.map(c => c.name) || [])];
        setCategories(categoryNames as string[]);
      } else {
        setCategories(['All']);
      }

      // Fetch follower count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', sellerId);

      setFollowerCount(followersCount || 0);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      // Fetch reviewer profiles separately
      if (reviewsData && reviewsData.length > 0) {
        const reviewerIds = reviewsData.map(r => r.reviewer_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', reviewerIds);

        // Map profiles to reviews
        const reviewsWithProfiles = reviewsData.map(review => ({
          ...review,
          profiles: profilesData?.find(p => p.id === review.reviewer_id) || null,
        }));

        setReviews(reviewsWithProfiles);

        // Calculate review summary
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviewsData.length;
        
        // Get total count of all reviews
        const { count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', sellerId);

        setReviewSummary({
          average_rating: Math.round(avgRating * 10) / 10,
          total_reviews: count || reviewsData.length,
        });
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      Alert.alert('Error', 'Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    // Filter is handled by selectedCategory state change
    // FlatList will re-render automatically
  };

  const getFilteredProducts = () => {
    if (selectedCategory === 'All') {
      return products;
    }
    
    // Find category ID from map
    const categoryId = Object.keys(categoryMap).find(
      id => categoryMap[Number(id)] === selectedCategory
    );
    
    if (!categoryId) return products;
    
    return products.filter(p => p.category_id === Number(categoryId));
  };

  const handleCall = () => {
    if (seller?.phone_number) {
      Linking.openURL(`tel:${seller.phone_number}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleMessage = () => {
    if (!user) {
      Alert.alert('Sign In', 'Please log in to message this seller.');
      return;
    }
    if (user.id === sellerId) {
      Alert.alert('Notification', 'This is your own profile.');
      return;
    }

    navigation.navigate('MessagesInbox');
  };

  const handleLeaveReview = () => {
    if (!user) {
      Alert.alert('Sign In', 'Please log in to leave a review.');
      return;
    }
    if (user.id === sellerId) {
      Alert.alert('Error', 'You cannot review yourself.');
      return;
    }

    navigation.navigate('LeaveReview', { sellerId, sellerName: seller?.full_name });
  };

  const handleSeeAllReviews = () => {
    // TODO: Navigate to all reviews screen
    console.log('See all reviews');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? '#F59E0B' : 'none'}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('AdDetails', { adId: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          {item.negotiable ? 'Contact for price' : `₦${item.price.toLocaleString()}`}
        </Text>
        {item.location_state && (
          <Text style={styles.productLocation} numberOfLines={1}>
            {item.location_state}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderReviewCard = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          {item.profiles?.avatar_url ? (
            <Image
              source={{ uri: item.profiles.avatar_url }}
              style={styles.reviewerAvatarImage}
            />
          ) : (
            <Text style={styles.reviewerInitial}>
              {item.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {item.profiles?.full_name || 'Anonymous'}
          </Text>
          {renderStars(item.rating)}
        </View>
      </View>
      {item.comment && (
        <Text style={styles.reviewText} numberOfLines={3}>
          {item.comment}
        </Text>
      )}
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00A651" />
      </View>
    );
  }

  if (!seller) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Seller not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={getFilteredProducts()}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productsRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Seller Info */}
            <View style={styles.sellerSection}>
              <View style={styles.sellerAvatar}>
                {seller.avatar_url ? (
                  <Image source={{ uri: seller.avatar_url }} style={styles.sellerAvatarImage} />
                ) : (
                  <Text style={styles.sellerInitial}>{seller.full_name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <Text style={styles.sellerName}>{seller.full_name}</Text>
              <Text style={styles.sellerMeta}>
                {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'} • {memberSince}
              </Text>

              {/* Call & Message Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                  <Phone size={18} color="#00A651" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                  <MessageCircle size={18} color="#FFFFFF" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reviews Summary */}
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity onPress={handleSeeAllReviews}>
                <Text style={styles.seeReviewsLink}>See reviews →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewsSummary}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingNumber}>{reviewSummary.average_rating.toFixed(1)}</Text>
              </View>
              <View style={styles.ratingDetails}>
                {renderStars(Math.round(reviewSummary.average_rating))}
                <Text style={styles.ratingText}>(Overall rating)</Text>
                <Text style={styles.reviewCount}>{reviewSummary.total_reviews} reviews</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.leaveReviewButton} onPress={handleLeaveReview}>
              <Text style={styles.leaveReviewText}>Leave a review</Text>
            </TouchableOpacity>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <View style={styles.recentReviews}>
                {reviews.map((item) => (
                  <View key={item.id}>
                    {renderReviewCard({ item })}
                  </View>
                ))}
              </View>
            )}

            {/* Ads Section */}
            <View style={styles.adsHeader}>
              <Text style={styles.sectionTitle}>Ads</Text>
              <TouchableOpacity
                style={styles.categoryDropdown}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.categoryDropdownText}>{selectedCategory}</Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Category Dropdown */}
            {showCategoryDropdown && (
              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryItem}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedCategory === category && styles.categoryItemTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No ads found</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  sellerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sellerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  sellerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sellerMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A651',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A651',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A651',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  seeReviewsLink: {
    fontSize: 13,
    color: '#00A651',
    fontWeight: '500',
  },
  reviewsSummary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  ratingBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaveReviewButton: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A651',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  leaveReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A651',
  },
  recentReviews: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  reviewerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  adsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  categoryDropdownText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryItemTextActive: {
    color: '#00A651',
    fontWeight: '600',
  },
  productsRow: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A651',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 40,
  },
});