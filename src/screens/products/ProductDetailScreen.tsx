// src/screens/products/ProductDetailScreen.tsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

type ProductDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'ProductDetail'
>;

type ProductDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

interface ProductDetailScreenProps {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  location: string;
  created_at: string;
  description: string;
  state: string;
  transmission: string;
  year_of_manufacture: string;
  category: string;
  sub_category: string;
  breed: string;
  age: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
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

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatPreviewVisible, setChatPreviewVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sellerLastSeen, setSellerLastSeen] = useState<string>('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Fetch existing messages if any
      if (user) {
        fetchMessages(data.user_id);
        fetchSellerPresence(data.user_id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sellerId: string) => {
    try {
      const chatRoom = [user!.id, sellerId, productId].sort().join('_');
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room', chatRoom)
        .order('created_at', { ascending: false })
        .limit(10);

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

  const handleQuickMessage = async (message: string) => {
    setChatPreviewVisible(true);
    await sendMessage(message);
  };

  const handleCustomMessage = async () => {
    if (!customMessage.trim()) return;
    await sendMessage(customMessage);
    setCustomMessage('');
  };

  const sendMessage = async (content: string) => {
    if (!product || !user) return;

    try {
      const chatRoom = [user.id, product.user_id, productId].sort().join('_');
      
      const { error } = await supabase.from('messages').insert({
        chat_room: chatRoom,
        sender_id: user.id,
        receiver_id: product.user_id,
        ad_id: productId,
        content,
        message_type: 'text',
      });

      if (error) throw error;
      
      // Refresh messages
      fetchMessages(product.user_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMakeOffer = () => {
    // TODO: Open make offer modal
    console.log('Make offer clicked');
  };

  const handleCall = () => {
    // TODO: Implement call functionality
    console.log('Call clicked');
  };

  const handleStartChatting = () => {
    if (!product) return;
    
    // Generate chatId using the same format as messaging system
    const chatId = [user!.id, product.user_id, productId].sort().join('_');
    
    navigation.navigate('ChatDetail', {
      chatId: chatId,
      sellerName: product.profiles?.full_name || 'Seller',
      adTitle: product.title,
      adPrice: product.price,
      adImage: product.images?.[0] || '',
    });
  };

  if (loading || !product) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image
          source={{ uri: product.images?.[0] }}
          style={styles.image}
        />

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{product.location}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.createdText}>
              Created on {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
            <Text style={styles.negotiable}>Negotiable</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.makeOfferButton} onPress={handleMakeOffer}>
              <Text style={styles.makeOfferIcon}>💰</Text>
              <Text style={styles.makeOfferText}>Make offer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Text style={styles.callIcon}>📞</Text>
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

          <TouchableOpacity style={styles.startChattingButton} onPress={handleStartChatting}>
            <Text style={styles.startChattingText}>Start chatting</Text>
          </TouchableOpacity>

          {/* Details */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>State</Text>
              <Text style={styles.detailLabel}>Location</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{product.state || 'N/A'}</Text>
              <Text style={styles.detailValue}>Yes</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowMargin]}>
              <Text style={styles.detailLabel}>Transmission</Text>
              <Text style={styles.detailLabel}>Year of Manufacture</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{product.transmission || 'N/A'}</Text>
              <Text style={styles.detailValue}>{product.year_of_manufacture || 'N/A'}</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowMargin]}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailLabel}>Sub-Category</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{product.category || 'N/A'}</Text>
              <Text style={styles.detailValue}>{product.sub_category || 'N/A'}</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowMargin]}>
              <Text style={styles.detailLabel}>Breed</Text>
              <Text style={styles.detailLabel}>Age</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{product.breed || 'N/A'}</Text>
              <Text style={styles.detailValue}>{product.age || 'N/A'}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Seller info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller info</Text>
            <TouchableOpacity style={styles.viewProfileLink}>
              <Text style={styles.viewProfileText}>View seller profile</Text>
              <Text style={styles.viewProfileArrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {product.profiles?.full_name?.charAt(0).toUpperCase() || 'O'}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.profiles?.full_name || 'Unknown Seller'}</Text>
              <Text style={styles.sellerFollowers}>1.2k Followers • Aug 4th</Text>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreReviews}>See more reviews (5) →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>E</Text>
              </View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>El Muba</Text>
                <Text style={styles.reviewStars}>⭐⭐⭐⭐☆</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>
              Service was top notch and the product was in perfect condition
            </Text>
            <Text style={styles.reviewDate}>13/11/25</Text>
          </View>

          <TouchableOpacity style={styles.leaveReviewButton}>
            <Text style={styles.leaveReviewText}>Leave review</Text>
          </TouchableOpacity>

          {/* Similar Ads */}
          <Text style={styles.sectionTitle}>Similar Ads</Text>
          {/* TODO: Add similar ads list */}
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
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setChatPreviewVisible(false)}
        >
          <Pressable style={styles.chatPreviewModal} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.chatPreviewHeader}>
              <View style={styles.chatPreviewUser}>
                <View style={styles.chatPreviewAvatar}>
                  <Text style={styles.chatPreviewInitial}>
                    {product.profiles?.full_name?.charAt(0).toUpperCase() || 'C'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chatPreviewName}>{product.profiles?.full_name || 'Seller'}</Text>
                  <Text style={styles.chatPreviewLastSeen}>{sellerLastSeen}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setChatPreviewVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView style={styles.chatMessages}>
              {messages.length > 0 ? (
                <FlatList
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View
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
                  )}
                />
              ) : (
                <Text style={styles.noMessages}>No messages yet</Text>
              )}
            </ScrollView>

            {/* Quick chips in modal */}
            <View style={styles.quickMessagesModal}>
              {QUICK_MESSAGES.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickChipModal}
                  onPress={() => handleQuickMessage(msg)}
                >
                  <Text style={styles.quickChipTextModal}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input */}
            <View style={styles.chatInputContainer}>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message here"
                placeholderTextColor="#9CA3AF"
                value={customMessage}
                onChangeText={setCustomMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleCustomMessage}>
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  },
  content: {
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A651',
  },
  negotiable: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
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
  },
  makeOfferIcon: {
    fontSize: 16,
    marginRight: 6,
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
  },
  callIcon: {
    fontSize: 16,
    marginRight: 6,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRowMargin: {
    marginTop: 16,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
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
  },
  viewProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 13,
    color: '#00A651',
    fontWeight: '500',
  },
  viewProfileArrow: {
    fontSize: 13,
    color: '#00A651',
    marginLeft: 4,
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
  sellerFollowers: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeMoreReviews: {
    fontSize: 13,
    color: '#00A651',
    fontWeight: '500',
  },
  reviewCard: {
    marginBottom: 16,
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
  reviewStars: {
    fontSize: 12,
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
  leaveReviewButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A651',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  leaveReviewText: {
    color: '#00A651',
    fontSize: 14,
    fontWeight: '600',
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
    paddingBottom: 20,
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
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    padding: 4,
  },
  chatMessages: {
    maxHeight: 300,
    padding: 16,
  },
  noMessages: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 40,
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
  addButtonText: {
    fontSize: 20,
    color: '#6B7280',
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
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});