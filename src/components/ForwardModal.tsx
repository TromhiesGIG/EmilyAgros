// src/components/ForwardModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../providers/AuthProvider';

interface ForwardModalProps {
  visible: boolean;
  onClose: () => void;
  message: any;
}

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  adId: string;
  adTitle: string;
  adImage?: string;
  lastMessageTime: string;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ visible, onClose, message }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);

  useEffect(() => {
    if (visible && user) {
      fetchConversations();
    }
  }, [visible, user]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          ad_id,
          created_at,
          products (
            id,
            title,
            images,
            user_id
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation (unique combination of user + ad)
      const conversationMap = new Map<string, any>();

      for (const msg of messages || []) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${otherUserId}-${msg.ad_id}`;

        if (!conversationMap.has(key)) {
          // products is returned as an array, get first element
          const product = Array.isArray(msg.products) ? msg.products[0] : msg.products;
          
          conversationMap.set(key, {
            id: key,
            otherUserId,
            adId: msg.ad_id,
            adTitle: product?.title || 'Unknown Product',
            adImage: product?.images?.[0],
            lastMessageTime: msg.created_at,
          });
        }
      }

      // Get unique user IDs
      const uniqueUserIds = Array.from(new Set(
        Array.from(conversationMap.values()).map(c => c.otherUserId)
      ));

      // Fetch user profiles for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', uniqueUserIds);

      // Create a map of userId -> profile
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Merge profiles into conversations
      const conversationsWithNames = Array.from(conversationMap.values()).map(conv => ({
        ...conv,
        otherUserName: profileMap.get(conv.otherUserId)?.full_name || 'Unknown User',
        otherUserAvatar: profileMap.get(conv.otherUserId)?.avatar_url,
      }));

      setConversations(conversationsWithNames);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const handleForward = async (conversation: Conversation) => {
    if (!user || !message) return;
    setForwarding(true);

    try {
      console.log('📤 Forwarding message to:', conversation.otherUserName);

      const forwardData: any = {
        sender_id: user.id,
        receiver_id: conversation.otherUserId,
        ad_id: conversation.adId,
        content: message.content,
        message_type: message.message_type,
        is_read: false,
      };

      if (message.media_url) {
        forwardData.media_url = message.media_url;
      }

      const { error } = await supabase.from('messages').insert(forwardData);

      if (error) throw error;

      console.log('✅ Message forwarded successfully');
      onClose();
    } catch (error) {
      console.error('Forward error:', error);
      Alert.alert('Error', 'Failed to forward message');
    }
    setForwarding(false);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleForward(item)}
      disabled={forwarding}
    >
      {item.otherUserAvatar ? (
        <Image source={{ uri: item.otherUserAvatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]}>
          <Text style={styles.placeholderText}>
            {item.otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.conversationInfo}>
        <Text style={styles.userName}>{item.otherUserName}</Text>
        <Text style={styles.adTitle} numberOfLines={1}>
          {item.adTitle}
        </Text>
      </View>

      <Send size={20} color="#008102" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Forward message to...</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#008102" />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversation}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No conversations found</Text>
                  <Text style={styles.emptySubText}>
                    Start a conversation first to forward messages
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: '#008102',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  adTitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});