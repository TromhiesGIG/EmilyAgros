// src/screens/main/MessagesInbox.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

interface Conversation {
  id: string;
  ad_id: string;
  sender_id: string;
  receiver_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  other_user_phone: string;
  ad_title: string;
  ad_image: string;
  ad_price: number;
  last_message: string;
  created_at: string;
  is_read: boolean;
  unread_count: number;
}

export const MessagesInbox = ({ navigation }: any) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convMap = new Map<string, any>();
      messages.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.ad_id || 'general'}_${otherUserId}`;
        
        if (!convMap.has(key)) {
          convMap.set(key, { ...msg, otherUserId, unread_count: 0 });
        }
        
        if (msg.receiver_id === user.id && !msg.is_read) {
          const existing = convMap.get(key);
          existing.unread_count = (existing.unread_count || 0) + 1;
          convMap.set(key, existing);
        }
      });

      const convList = Array.from(convMap.values());
      const adIds = [...new Set(convList.map(c => c.ad_id).filter(Boolean))];
      const userIds = [...new Set(convList.map(c => c.otherUserId).filter(Boolean))];

      // ✅ FIXED: Fetch from 'products' not 'ads'
      const { data: products } = await supabase
        .from('products')
        .select('id, title, images, price')
        .in('id', adIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone_number')
        .in('id', userIds);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const finalConversations: Conversation[] = convList.map(conv => {
        const product = productMap.get(conv.ad_id);
        const profile = profileMap.get(conv.otherUserId);
        return {
          id: conv.id,
          ad_id: conv.ad_id,
          sender_id: conv.sender_id,
          receiver_id: conv.receiver_id,
          other_user_id: conv.otherUserId,
          other_user_name: profile?.full_name || 'Agro Member',
          other_user_avatar: profile?.avatar_url || '',
          other_user_phone: profile?.phone_number || '',
          ad_title: product?.title || 'Product',
          ad_image: product?.images?.[0] || '',
          ad_price: product?.price || 0,
          last_message: conv.content || '',
          created_at: conv.created_at,
          is_read: conv.is_read,
          unread_count: conv.unread_count || 0,
        };
      });

      setConversations(finalConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as any;
        if (msg?.receiver_id === user?.id || msg?.sender_id === user?.id) {
          fetchConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'Unread') return conv.unread_count > 0;
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const MessageItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.messageRow}
      onPress={() => navigation.navigate('ChatDetail', {
        adId: item.ad_id,
        receiverId: item.other_user_id,
        sellerName: item.other_user_name,
        adTitle: item.ad_title,
        adPrice: item.ad_price,
        adImage: item.ad_image,
        phoneNumber: item.other_user_phone,
      })}
    >
      <View style={styles.avatarContainer}>
        {item.ad_image ? (
          <Image source={{ uri: item.ad_image }} style={styles.adThumb} />
        ) : (
          <View style={[styles.adThumb, styles.placeholderThumb]}>
            <Text style={styles.placeholderText}>{item.other_user_name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {item.unread_count > 0 && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.senderName, item.unread_count > 0 && styles.boldText]}>
            {item.other_user_name}
          </Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={[styles.adTitle, item.unread_count > 0 && styles.boldText]} numberOfLines={1}>
          {item.ad_title}
        </Text>
        <Text style={styles.snippet} numberOfLines={1}>{item.last_message}</Text>
      </View>

      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity><Search size={22} color="#111827" /></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['All', 'Unread'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#008102" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => `${item.ad_id}_${item.other_user_id}`}
          renderItem={({ item }) => <MessageItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008102']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Start a conversation by clicking "Chat" on any product listing.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingHorizontal: 20 },
  tabItem: { marginRight: 32, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#008102', fontWeight: '700' },
  activeIndicator: { height: 3, backgroundColor: '#008102', width: '100%', position: 'absolute', bottom: 0 },
  messageRow: { flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  avatarContainer: { position: 'relative' },
  adThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F3F4F6' },
  placeholderThumb: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCFCE7' },
  placeholderText: { fontSize: 20, fontWeight: '700', color: '#008102' },
  unreadDot: { position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#008102', borderWidth: 2, borderColor: '#FFFFFF' },
  content: { flex: 1, marginLeft: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  senderName: { fontSize: 13, color: '#6B7280' },
  boldText: { fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#008102', fontWeight: '600' },
  adTitle: { fontSize: 15, color: '#111827', marginBottom: 2 },
  snippet: { fontSize: 13, color: '#9CA3AF' },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#008102', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});