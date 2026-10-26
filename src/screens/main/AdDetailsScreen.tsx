// src/screens/main/AdDetailsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
  Share,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { 
  ArrowLeft, 
  Heart, 
  MoreVertical, 
  Phone, 
  MessageCircle,
  Send,
  Plus,
  X,
  MapPin,
  Tag,
  Star,
  Share2,
  UserPlus,
  UserMinus,
  EyeOff,
  Flag,
} from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';
import type { ScrollViewInstance } from 'react-native';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  location_state: string;
  location_lga: string;
  location_address: string;
  created_at: string;
  description: string;
  category_id: number;
  subcategory_id: number;
  user_id: string;
  views: number;
  status: string;
  negotiable: boolean;
  contact_name?: string;
  contact_phone?: string;
  contact_business?: string;
  contact_whatsapp?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
}

interface Seller {
  id: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
}

const QUICK_MESSAGES = [
  'Is this available?',
  "What's your last price?",
  "What's the location?",
];

export const AdDetailsScreen = ({ route, navigation }: any) => {
  const { adId } = route.params;
  const { user } = useAuth();

  const [ad, setAd] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [categoryDetails, setCategoryDetails] = useState<any>(null); // ← NEW: Category-specific details
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [chatPreviewVisible, setChatPreviewVisible] = useState(false);
 const messagesScrollRef = useRef<ScrollViewInstance>(null);
 const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sellerLastSeen, setSellerLastSeen] = useState<string>('');
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [makeOfferModalVisible, setMakeOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    fetchAd();
    if (user) {
      checkIfSaved();
    }
  }, [adId, user]);

  const fetchAd = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', adId)
        .single();

      if (productError || !productData) {
        console.error('Error fetching product:', productError);
        setLoading(false);
        return;
      }
      setAd(productData);

      // Fetch category name
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', productData.category_id)
          .single();
        
        if (categoryData) setCategoryName(categoryData.name);
      }

      // Fetch subcategory name
      if (productData.subcategory_id) {
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('name')
          .eq('id', productData.subcategory_id)
          .single();
        
        if (subcategoryData) setSubcategoryName(subcategoryData.name);
      }

      if (productData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, avatar_url')
          .eq('id', productData.user_id)
          .single();

        if (profileData) setSeller(profileData);

        // Fetch existing messages if user is not the seller
        if (user && user.id !== productData.user_id) {
          fetchMessages(productData.user_id);
          fetchSellerPresence(productData.user_id);
          checkFollowStatus(productData.user_id);
          checkBlockStatus(productData.user_id);
        }
      }

      // ✅ NEW: Fetch category-specific details
      if (productData.category_id) {
        await fetchCategoryDetails(productData.id, productData.category_id);
      }

      // Increment views
      await supabase
        .from('products')
        .update({ views: (productData.views || 0) + 1 })
        .eq('id', adId);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  // ✅ NEW: Fetch category-specific details from appropriate table
  const fetchCategoryDetails = async (productId: string, categoryId: number) => {
    try {
      console.log('🔍 Fetching category details for:', { productId, categoryId });
      
      // Map category_id to detail table name (CORRECTED MAPPING)
      const categoryTableMap: Record<number, string> = {
        2: 'livestock_details',              // Livestock & Pets
        3: 'service_details',                // Services
        4: 'produce_details',                // Food, Fruits and Vegetables
        5: 'animal_feed_details',            // Animal Feed
        6: 'equipment_details',              // Tractors/Farm Equipments
        7: 'fertilizer_details',             // Fertilizers
        8: 'animal_accessories_details',     // Animal Accessories
        9: 'seedling_details',               // Seedlings
        10: 'animal_pharmacy_details',       // Animal Pharmacy
        11: 'animal_mating_details',         // Animal Mating
        12: 'agro_chemicals_details',        // Agro Chemicals
        13: 'horticulture_details',          // Horticulture
        // Note: 1 (Trending), 14 (Agro Loan), 15 (Agro Insurance) have no detail tables
      };

      const tableName = categoryTableMap[categoryId];
      console.log('📊 Table name:', tableName);
      
      if (!tableName) {
        console.log('❌ No table mapping for category:', categoryId);
        return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        console.log(`❌ Error fetching from ${tableName}:`, error);
        return;
      }

      if (data) {
        console.log('✅ Category details found:', data);
        setCategoryDetails(data);
      } else {
        console.log('⚠️ No data found in', tableName);
      }
    } catch (err) {
      console.error('💥 Error fetching category details:', err);
    }
  };

  useEffect(() => {
  if (chatPreviewVisible) {
    setTimeout(() => messagesScrollRef.current?.scrollToEnd({ animated: false }), 100);
  }
}, [chatPreviewVisible, messages]);
useEffect(() => {
  const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
  const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
  const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
  const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);
    const fetchMessages = async (sellerId: string) => {
    try {
      // When did this user deleted the chat with this seller (if ever)?
      const { data: hidden } = await supabase
        .from('hidden_chats')
        .select('hidden_at')
        .eq('user_id', user!.id)
        .eq('other_user_id', sellerId)
        .maybeSingle();

      let query = supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: false })
        .limit(10);

      // Only show messages newer than the deletion time
      if (hidden?.hidden_at) {
        query = query.gt('created_at', hidden.hidden_at);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages(data?.reverse() || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchSellerPresence = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('last_seen, is_online')
        .eq('user_id', sellerId)
        .single();

      if (error) throw error;

      if (data?.is_online) {
        setSellerLastSeen('Online');
      } else if (data?.last_seen) {
        const lastSeenDate = new Date(data.last_seen);
        const now = new Date();
        const diffMs = now.getTime() - lastSeenDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
          setSellerLastSeen(`last seen: ${diffMins} mins ago`);
        } else if (diffMins < 1440) {
          setSellerLastSeen(`last seen: ${Math.floor(diffMins / 60)} hours ago`);
        } else {
          setSellerLastSeen(`last seen: ${Math.floor(diffMins / 1440)} days ago`);
        }
      }
    } catch (error) {
      console.error('Error fetching presence:', error);
    }
  };

  // ✅ NEW: Helper to format specification labels
  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ✅ NEW: Helper to format specification values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    
    if (typeof value === 'object') {
      // Handle JSONB fields like health_condition, features_traits
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      
      // Handle JSONB objects - format as readable text
      try {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'N/A';
        
        // Format as "Key: Value, Key: Value"
        return entries
          .map(([key, val]) => {
            // Convert camelCase to readable text
            const readableKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            
            // Format the value
            let readableVal = val;
            if (typeof val === 'boolean') {
              readableVal = val ? 'Yes' : 'No';
            }
            
            return `${readableKey}: ${readableVal}`;
          })
          .join(', ');
      } catch (e) {
        return String(value);
      }
    }
    
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  };

  // ✅ NEW: Render category-specific specifications
  const renderSpecifications = () => {
    console.log('🎨 Rendering specifications, categoryDetails:', categoryDetails);
    
    if (!categoryDetails) {
      console.log('⚠️ No categoryDetails to render');
      return null;
    }

    // Filter out internal fields
    const excludedFields = ['id', 'product_id', 'created_at', 'updated_at'];
    const specifications = Object.entries(categoryDetails)
      .filter(([key, value]) => !excludedFields.includes(key) && value !== null && value !== '')
      .map(([key, value]) => ({
        label: formatLabel(key),
        value: formatValue(value)
      }));

    console.log('📋 Specifications to display:', specifications);

    if (specifications.length === 0) {
      console.log('⚠️ No specifications after filtering');
      return null;
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.specificationsContainer}>
          {specifications.map((spec, index) => (
            <View key={index} style={styles.specificationRow}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>
      </>
    );
  };

    // Checks shared by chips and "Start chatting"
  const canMessage = () => {
    if (!ad) return false;
    if (!user) {
      Alert.alert('Sign In', 'Please log in to message the seller.');
      return false;
    }
    if (user.id === ad.user_id) {
      Alert.alert('Notification', 'This is your own advertisement.');
      return false;
    }
    return true;
  };

  // Opens the popup with text pre-filled. Nothing is sent here.
  const openChatPreview = (prefill: string) => {
    if (!canMessage()) return;
    setCustomMessage(prefill);
    fetchMessages(ad!.user_id);
    setChatPreviewVisible(true);
  };

  // Chip tapped: on the page it opens the popup, inside the popup it fills the input
  const handleQuickMessage = (message: string) => {
    if (chatPreviewVisible) {
      setCustomMessage(message);
      return;
    }
    openChatPreview(message);
  };

  // Green send button in the popup: the only place a message is sent
  const handleCustomMessage = async () => {
    if (!customMessage.trim()) return;
    await sendMessage(customMessage.trim());
    setCustomMessage('');
  };

  const sendMessage = async (content: string) => {
    if (!ad || !user) return;

    try {
      // ✅ FIXED: Using chat_id and actual database columns
      const chatId = [user.id, ad.user_id, adId].sort().join('_');

      const { error } = await supabase.from('messages').insert({
        // chat_id: chatId,
        sender_id: user.id,
        receiver_id: ad.user_id,
        ad_id: adId,
        content,
        message_type: 'text',
      });

      if (error) throw error;

      // Refresh messages
      fetchMessages(ad.user_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMakeOffer = () => {
    if (!user) {
      Alert.alert('Sign In', 'Please log in to make an offer.');
      return;
    }
    if (user.id === ad?.user_id) {
      Alert.alert('Error', 'You cannot make an offer on your own ad.');
      return;
    }
    setMakeOfferModalVisible(true);
  };

  const handleCallSeller = () => {
    const phone = ad?.contact_phone || seller?.phone_number;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Error', 'This seller has not provided a contact number.');
    }
  };

    const handleStartChatting = () => {
    openChatPreview(customMessage);
  };

  const checkIfSaved = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', adId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      Alert.alert('Sign In', 'Please log in to save items.');
      return;
    }

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', adId);

        if (error) throw error;
        setIsSaved(false);
        Alert.alert('Removed', 'Item removed from saved items');
      } else {
        // Save
        const { error } = await supabase
          .from('saved_items')
          .insert({
            user_id: user.id,
            product_id: adId,
          });

        if (error) throw error;
        setIsSaved(true);
        Alert.alert('Saved', 'Item saved successfully');
      }
    } catch (error) {
      console.error('Save toggle error:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const checkFollowStatus = async (sellerId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkBlockStatus = async (sellerId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('blocked_sellers')
        .select('id')
        .eq('user_id', user.id)
        .eq('blocked_seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsBlocked(!!data);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${ad?.title} on EmilyAgros!\nPrice: ₦${ad?.price.toLocaleString()}\nhttps://emilyagros.com/ads/${adId}`,
      });
      setActionMenuVisible(false);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !ad) return;

    // Prevent self-follow
    if (user.id === ad.user_id) {
      Alert.alert('Error', 'You cannot follow yourself.');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', ad.user_id);

        if (error) throw error;
        setIsFollowing(false);
        Alert.alert('Success', 'You unfollowed this seller');
      } else {
        // Follow - check if already following first
        const { data: existingFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', ad.user_id)
          .single();

        if (existingFollow) {
          // Already following, just update UI state
          setIsFollowing(true);
          Alert.alert('Notice', 'You are already following this seller');
          setActionMenuVisible(false);
          return;
        }

        // Insert new follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: ad.user_id,
          });

        if (error) {
          // Handle duplicate key error gracefully
          if (error.code === '23505') {
            setIsFollowing(true);
            Alert.alert('Notice', 'You are already following this seller');
          } else {
            throw error;
          }
        } else {
          setIsFollowing(true);
          Alert.alert('Success', 'You are now following this seller');
        }
      }
      setActionMenuVisible(false);
    } catch (error) {
      console.error('Follow toggle error:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleHideAds = async () => {
    if (!user || !ad) return;

    Alert.alert(
      'Hide ads from this seller?',
      'You will no longer see ads from this seller',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blocked_sellers')
                .insert({
                  user_id: user.id,
                  blocked_seller_id: ad.user_id,
                });

              if (error) throw error;
              setIsBlocked(true);
              setActionMenuVisible(false);
              Alert.alert('Success', 'You will no longer see ads from this seller');
            } catch (error) {
              console.error('Block error:', error);
              Alert.alert('Error', 'Failed to block seller');
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setActionMenuVisible(false);
    setReportModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!user || !ad) return;

    if (!reportReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for reporting');
      return;
    }

    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_seller_id: ad.user_id,
        reason: reportReason.trim(),
        status: 'pending',
      });

      if (error) throw error;

      setReportModalVisible(false);
      setReportReason('');
      Alert.alert('Success', 'Report submitted. We will review it shortly.');
    } catch (error) {
      console.error('Report error:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const handleSubmitOffer = async () => {
    if (!user || !ad) return;

    if (!offerAmount.trim()) {
      Alert.alert('Error', 'Please enter an offer amount');
      return;
    }

    const amount = parseFloat(offerAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmittingOffer(true);

    try {
      // 1. Save offer to offers table
      const { error: offerError } = await supabase.from('offers').insert({
        product_id: adId,
        buyer_id: user.id,
        seller_id: ad.user_id,
        offer_amount: amount,
        message: offerMessage.trim() || null,
        status: 'pending',
      });

      if (offerError) throw offerError;

      // 2. Send offer as a message in chat
      const chatId = [user.id, ad.user_id, adId].sort().join('_');
      const offerMessageText = offerMessage.trim() 
        ? `💰 Offer: ₦${amount.toLocaleString()}\n\n${offerMessage.trim()}`
        : `💰 Offer: ₦${amount.toLocaleString()}`;

      const { error: messageError } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        receiver_id: ad.user_id,
        ad_id: adId,
        content: offerMessageText,
        message_type: 'text',
      });

      if (messageError) throw messageError;

      setMakeOfferModalVisible(false);
      setOfferAmount('');
      setOfferMessage('');
      Alert.alert(
        'Offer Sent!',
        'Your offer has been sent to the seller. You can continue the conversation in your messages.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Offer error:', error);
      Alert.alert('Error', 'Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00A651" />
      </View>
    );
  }

  if (!ad) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ad Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Ad not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const location = [ad.location_state, ad.location_lga, ad.location_address]
    .filter(Boolean)
    .join(', ') || 'Location not specified';
  const sellerName = seller?.full_name || ad.contact_name || 'EmilyAgros User';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleSaveToggle} 
            style={styles.headerIcon}
          >
            <Heart 
              size={20} 
              color={isSaved ? '#EF4444' : '#111827'} 
              fill={isSaved ? '#EF4444' : 'none'} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MoreVertical size={20} color="#111827" onPress={() => setActionMenuVisible(true)} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image 
          source={{ uri: ad.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image' }} 
          style={styles.image} 
        />

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{location}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.createdText}>
              Created on {new Date(ad.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          <Text style={styles.title}>{ad.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{ad.price.toLocaleString()}</Text>
            {ad.negotiable && (
              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>Negotiable</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.makeOfferButton} 
              onPress={handleMakeOffer}
            >
              <Tag size={16} color="#111827" />
              <Text style={styles.makeOfferText}>Make offer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.callButton} 
              onPress={handleCallSeller}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>

          {/* Chat with the seller */}
          <Text style={styles.sectionTitle}>Chat with the seller</Text>

          {/* Quick message chips */}
          <View style={styles.quickMessages}>
            {QUICK_MESSAGES.map((msg, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickChip}
                onPress={() => handleQuickMessage(msg)}
              >
                <Text style={styles.quickChipText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom message input */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here"
              placeholderTextColor="#9CA3AF"
              value={customMessage}
              onChangeText={setCustomMessage}
            />
          </View>

          <TouchableOpacity 
            style={styles.startChattingButton} 
            onPress={handleStartChatting}
          >
            <Text style={styles.startChattingText}>Start chatting</Text>
          </TouchableOpacity>

          {/* Details */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            {categoryName && (
              <>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{categoryName}</Text>
              </>
            )}
            
            {subcategoryName && (
              <>
                <Text style={styles.detailLabel}>Subcategory</Text>
                <Text style={styles.detailValue}>{subcategoryName}</Text>
              </>
            )}

            {ad.status && (
              <>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{ad.status}</Text>
              </>
            )}

            <>
              <Text style={styles.detailLabel}>Negotiable</Text>
              <Text style={styles.detailValue}>{ad.negotiable ? 'Yes' : 'No'}</Text>
            </>

            {ad.contact_whatsapp !== undefined && (
              <>
                <Text style={styles.detailLabel}>Contact via WhatsApp</Text>
                <Text style={styles.detailValue}>{ad.contact_whatsapp ? 'Yes' : 'No'}</Text>
              </>
            )}

            <>
              <Text style={styles.detailLabel}>Posted</Text>
              <Text style={styles.detailValue}>
                {new Date(ad.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </>
          </View>

          {/* ✅ NEW: Specifications Section */}
          {renderSpecifications()}

          {/* Description */}
          {ad.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{ad.description}</Text>
            </>
          )}

          {/* Seller info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller info</Text>
            <TouchableOpacity 
              style={styles.viewProfileLink}
              onPress={() => navigation.navigate('SellerProfile', { sellerId: ad.user_id })}
            >
              <Text style={styles.viewProfileText}>View seller profile</Text>
              <ArrowLeft size={14} color="#00A651" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              {seller?.avatar_url ? (
                <Image 
                  source={{ uri: seller.avatar_url }} 
                  style={styles.sellerAvatarImage}
                />
              ) : (
                <Text style={styles.sellerInitial}>
                  {sellerName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{sellerName}</Text>
              {ad.contact_business && (
                <Text style={styles.sellerBusiness}>{ad.contact_business}</Text>
              )}
            </View>
          </View>

          {/* Reviews Section - Coming in Priority 2 */}
          <TouchableOpacity 
            style={styles.leaveReviewButton}
            onPress={() => {
              if (!user) {
                Alert.alert('Sign In', 'Please log in to leave a review.');
                return;
              }
              if (user.id === ad.user_id) {
                Alert.alert('Error', 'You cannot review yourself.');
                return;
              }
              navigation.navigate('LeaveReview', { 
                sellerId: ad.user_id, 
                sellerName: sellerName 
              });
            }}
          >
            <Text style={styles.leaveReviewText}>Leave review</Text>
          </TouchableOpacity>

          {/* Views */}
          <View style={styles.viewsContainer}>
            <Text style={styles.viewsText}>{ad.views || 0} views</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Chat Preview Modal */}
      <Modal
        visible={chatPreviewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChatPreviewVisible(false)}
      >
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setChatPreviewVisible(false)}
        >
          
          <Pressable 
            style={styles.chatPreviewModal} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.chatPreviewHeader}>
              <View style={styles.chatPreviewUser}>
                <View style={styles.chatPreviewAvatar}>
                  {seller?.avatar_url ? (
                    <Image 
                      source={{ uri: seller.avatar_url }} 
                      style={styles.chatPreviewAvatarImage}
                    />
                  ) : (
                    <Text style={styles.chatPreviewInitial}>
                      {sellerName.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.chatPreviewName}>{sellerName}</Text>
                  {sellerLastSeen && (
                    <Text style={styles.chatPreviewLastSeen}>{sellerLastSeen}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setChatPreviewVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                  ref={messagesScrollRef}
                  style={styles.chatMessages}
                  contentContainerStyle={{ paddingBottom: 12 }}
                  keyboardShouldPersistTaps="handled"
                >
              {messages.length > 0 ? (
                <>
                  {messages.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.messageBubble,
                        item.sender_id === user?.id
                          ? styles.messageBubbleRight
                          : styles.messageBubbleLeft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          item.sender_id === user?.id
                            ? styles.messageTextRight
                            : styles.messageTextLeft,
                        ]}
                      >
                        {item.content}
                      </Text>
                      <Text style={styles.messageTime}>
                        {new Date(item.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.noMessagesContainer}>
                  <MessageCircle size={48} color="#D1D5DB" />
                  <Text style={styles.noMessages}>No messages yet</Text>
                  <Text style={styles.noMessagesSubtext}>
                    Start the conversation with a quick message
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Quick chips in modal */}
          {!keyboardVisible && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {QUICK_MESSAGES.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickChipModal}
                  onPress={() => handleQuickMessage(msg)}
                >
                  <Text style={styles.quickChipTextModal}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

          )}

            {/* Input */}
            <View style={styles.chatInputContainer}>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color="#6B7280" />
              </TouchableOpacity>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message here"
                placeholderTextColor="#9CA3AF"
                value={customMessage}
                onChangeText={setCustomMessage}
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleCustomMessage}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView> 
        
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        visible={actionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setActionMenuVisible(false)}
        >
          <Pressable 
            style={styles.actionMenuModal} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Share this ad */}
            <TouchableOpacity style={styles.actionMenuItem} onPress={handleShare}>
              <Share2 size={20} color="#374151" />
              <Text style={styles.actionMenuText}>Share this ad</Text>
            </TouchableOpacity>

            {/* Follow/Unfollow seller */}
            {(() => {
              const shouldShow = user && ad && user.id !== ad.user_id;
              console.log('Follow button check:', {
                hasUser: !!user,
                hasAd: !!ad,
                userId: user?.id,
                adUserId: ad?.user_id,
                shouldShow
              });
              return shouldShow ? (
                <TouchableOpacity style={styles.actionMenuItem} onPress={handleFollowToggle}>
                  {isFollowing ? (
                    <>
                      <UserMinus size={20} color="#374151" />
                      <Text style={styles.actionMenuText}>Unfollow this seller</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} color="#374151" />
                      <Text style={styles.actionMenuText}>Follow this seller</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null;
            })()}

            {/* Hide ads from seller */}
            {!isBlocked && (
              <TouchableOpacity style={styles.actionMenuItem} onPress={handleHideAds}>
                <EyeOff size={20} color="#374151" />
                <Text style={styles.actionMenuText}>Hide ads from this seller</Text>
              </TouchableOpacity>
            )}

            {/* Report seller */}
            <TouchableOpacity style={styles.actionMenuItem} onPress={handleReport}>
              <Flag size={20} color="#EF4444" />
              <Text style={[styles.actionMenuText, styles.actionMenuTextDanger]}>
                Report this seller
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setReportModalVisible(false)}
        >
          <Pressable 
            style={styles.reportModal} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Report Seller</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.reportLabel}>Reason for reporting</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Please describe the issue..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={reportReason}
              onChangeText={setReportReason}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.reportSubmitButton} 
              onPress={handleSubmitReport}
            >
              <Text style={styles.reportSubmitText}>Submit Report</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Make Offer Modal */}
      <Modal
        visible={makeOfferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMakeOfferModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMakeOfferModalVisible(false)}
        >
          <Pressable 
            style={styles.offerModal} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setMakeOfferModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {ad && (
              <View style={styles.offerProductInfo}>
                <Image 
                  source={{ uri: ad.images?.[0] || 'https://via.placeholder.com/60' }} 
                  style={styles.offerProductImage}
                />
                <View style={styles.offerProductDetails}>
                  <Text style={styles.offerProductTitle} numberOfLines={2}>
                    {ad.title}
                  </Text>
                  <Text style={styles.offerProductPrice}>
                    Asking: ₦{ad.price.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.offerLabel}>
              Your Offer Amount<Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.offerAmountContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.offerAmountInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={offerAmount}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  const numericValue = text.replace(/[^0-9]/g, '');
                  // Add thousand separators
                  const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  setOfferAmount(formatted);
                }}
              />
            </View>

            <Text style={styles.offerLabel}>Message (Optional)</Text>
            <TextInput
              style={styles.offerMessageInput}
              placeholder="Add a message to the seller..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={offerMessage}
              onChangeText={setOfferMessage}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[
                styles.offerSubmitButton,
                (!offerAmount.trim() || submittingOffer) && styles.offerSubmitButtonDisabled
              ]} 
              onPress={handleSubmitOffer}
              disabled={!offerAmount.trim() || submittingOffer}
            >
              {submittingOffer ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.offerSubmitText}>Send Offer</Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notFoundText: { 
    fontSize: 18, 
    color: '#6B7280', 
    marginBottom: 16 
  },
  goBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#00A651',
    borderRadius: 20,
  },
  goBackText: { 
    color: '#FFFFFF', 
    fontWeight: '600' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  separator: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  createdText: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A651',
  },
  negotiableBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  negotiableText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  makeOfferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  makeOfferText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A651',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  callText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickChipText: {
    fontSize: 13,
    color: '#374151',
  },
  messageInputContainer: {
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  startChattingButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  startChattingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsGrid: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    marginTop: 12,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  // ✅ NEW: Specifications styles
  specificationsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  specLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 24,
  },
  sellerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  viewProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileText: {
    fontSize: 13,
    color: '#00A651',
    fontWeight: '500',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  sellerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  sellerBusiness: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaveReviewButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A651',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveReviewText: {
    color: '#00A651',
    fontSize: 14,
    fontWeight: '600',
  },
  viewsContainer: {
    marginBottom: 8,
  },
  viewsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 40,
  },

  // Chat Preview Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatPreviewModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  chatPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatPreviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatPreviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  chatPreviewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  chatPreviewInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatPreviewName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  chatPreviewLastSeen: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatMessages: {
    maxHeight: 300,
    padding: 16,
  },
  noMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMessages: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  noMessagesSubtext: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  messageBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#00A651',
  },
  messageBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  messageTextLeft: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  quickMessagesModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickChipModal: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickChipTextModal: {
    fontSize: 12,
    color: '#374151',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A651',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Action Menu Modal
  actionMenuModal: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  actionMenuText: {
    fontSize: 15,
    color: '#374151',
  },
  actionMenuTextDanger: {
    color: '#EF4444',
  },

  // Report Modal
  reportModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  reportInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    marginBottom: 16,
  },
  reportSubmitButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Make Offer Modal
  offerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  offerProductInfo: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  offerProductImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  offerProductDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  offerProductTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  offerProductPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  offerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  offerAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  offerAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 12,
  },
  offerMessageInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    marginBottom: 16,
  },
  offerSubmitButton: {
    backgroundColor: '#00A651',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  offerSubmitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  offerSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});