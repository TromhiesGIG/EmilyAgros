// src/components/ForwardModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../providers/AuthProvider';

interface ForwardModalProps {
  visible: boolean;
  onClose: () => void;
  message: any;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ visible, onClose, message }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchConversations();
    }
  }, [visible]);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get unique conversations
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, ad_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique conversation partners
      const uniqueConvos = new Map();
      data?.forEach((msg: any) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${otherId}_${msg.ad_id || 'general'}`;
        if (!uniqueConvos.has(key)) {
          uniqueConvos.set(key, { userId: otherId, adId: msg.ad_id });
        }
      });

      setConversations(Array.from(uniqueConvos.values()));
    } catch (error) {
      console.error('Fetch conversations error:', error);
    }
    setLoading(false);
  };

  const handleForward = async (receiverId: string, adId: string | null) => {
    if (!user || forwarding) return;

    setForwarding(true);
    try {
      const forwardData: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: message.content,
        message_type: message.message_type,
        is_read: false,
      };

      if (adId) forwardData.ad_id = adId;
      if (message.media_url) forwardData.media_url = message.media_url;

      const { error } = await supabase.from('messages').insert(forwardData);

      if (error) throw error;

      Alert.alert('Success', 'Message forwarded!');
      onClose();
    } catch (error) {
      console.error('Forward error:', error);
      Alert.alert('Error', 'Failed to forward message');
    }
    setForwarding(false);
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.convoItem}
      onPress={() => handleForward(item.userId, item.adId)}
      disabled={forwarding}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.convoInfo}>
        <Text style={styles.convoName}>Conversation</Text>
        <Text style={styles.convoPreview}>Tap to forward here</Text>
      </View>
      {forwarding ? (
        <ActivityIndicator size="small" color="#008102" />
      ) : (
        <Send size={20} color="#6B7280" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Forward Message</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008102" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item, index) => `${item.userId}_${item.adId}_${index}`}
            renderItem={renderConversation}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No conversations yet</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  convoItem: {
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
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  convoInfo: {
    flex: 1,
  },
  convoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  convoPreview: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});