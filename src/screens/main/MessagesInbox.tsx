// src/screens/main/MessagesInbox.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  other_user_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  last_ad_id: string;
  last_ad_title: string;
  last_ad_image: string;
  last_ad_price: number;
}

export const MessagesInbox = ({ navigation }: any) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [activeTab, setActiveTab]         = useState<'All' | 'Unread'>('All');

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all messages for this user
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

      // Fetch hidden chats for this user
      const { data: hiddenChats } = await supabase
        .from('hidden_chats')
        .select('other_user_id')
        .eq('user_id', user.id);

      const hiddenIds = new Set((hiddenChats || []).map((h: any) => h.other_user_id));

      // Group by other_user_id only — one conversation per seller
      const convMap = new Map<string, any>();
      messages.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        // Skip hidden chats
        if (hiddenIds.has(otherUserId)) return;

        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            otherUserId,
            last_message:      msg.content || '',
            last_message_time: msg.created_at,
            last_ad_id:        msg.ad_id || null,
            unread_count:      0,
          });
        }

        // Count unread
        if (msg.receiver_id === user.id && !msg.is_read) {
          const existing = convMap.get(otherUserId);
          existing.unread_count = (existing.unread_count || 0) + 1;
          convMap.set(otherUserId, existing);
        }
      });

      const convList = Array.from(convMap.values());
      if (convList.length === 0) { setConversations([]); setLoading(false); return; }

      const userIds = convList.map(c => c.otherUserId).filter(Boolean);
      const adIds   = [...new Set(convList.map(c => c.last_ad_id).filter(Boolean))];

      const [profilesRes, productsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, phone_number').in('id', userIds),
        adIds.length > 0
          ? supabase.from('products').select('id, title, images, price').in('id', adIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const productMap = new Map((productsRes.data || []).map((p: any) => [p.id, p]));

      const final: Conversation[] = convList.map(conv => {
        const profile = profileMap.get(conv.otherUserId);
        const product = conv.last_ad_id ? productMap.get(conv.last_ad_id) : null;
        return {
          other_user_id:     conv.otherUserId,
          other_user_name:   profile?.full_name    || 'Agro Member',
          other_user_avatar: profile?.avatar_url   || '',
          other_user_phone:  profile?.phone_number || '',
          last_message:      conv.last_message,
          last_message_time: conv.last_message_time,
          unread_count:      conv.unread_count,
          last_ad_id:        conv.last_ad_id        || '',
          last_ad_title:     product?.title         || 'General Inquiry',
          last_ad_image:     product?.images?.[0]   || '',
          last_ad_price:     product?.price         || 0,
        };
      });

      setConversations(final);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
    const channel = supabase.channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if (msg?.receiver_id === user?.id || msg?.sender_id === user?.id) fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleDeleteChat = (otherUserId: string, otherUserName: string) => {
    Alert.alert(
      'Delete Chat',
      `Delete your conversation with ${otherUserName}? This will only hide it for you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await supabase.from('hidden_chats').upsert({
              user_id:       user?.id,
              other_user_id: otherUserId,
              hidden_at:     new Date().toISOString(),
            });
            setConversations(prev => prev.filter(c => c.other_user_id !== otherUserId));
          },
        },
      ]
    );
  };

  const formatTime = (dateStr: string) => {
    const date  = new Date(dateStr);
    const now   = new Date();
    const diff  = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1)  return 'Now';
    if (diff < 60) return `${diff}m`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const filtered = conversations.filter(c => activeTab === 'Unread' ? c.unread_count > 0 : true);

  const ConvItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ChatDetail', {
        receiverId:   item.other_user_id,
        sellerName:   item.other_user_name,
        adId:         item.last_ad_id,
        adTitle:      item.last_ad_title,
        adPrice:      item.last_ad_price,
        adImage:      item.last_ad_image,
        phoneNumber:  item.other_user_phone,
      })}
      onLongPress={() => handleDeleteChat(item.other_user_id, item.other_user_name)}
      delayLongPress={600}
    >
      <View style={styles.avatarWrap}>
        {item.last_ad_image
          ? <Image source={{ uri: item.last_ad_image }} style={styles.thumb} />
          : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={styles.thumbChar}>{item.other_user_name.charAt(0).toUpperCase()}</Text>
            </View>
          )
        }
        {item.unread_count > 0 && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text style={[styles.name, item.unread_count > 0 && styles.bold]}>{item.other_user_name}</Text>
          <Text style={styles.time}>{formatTime(item.last_message_time)}</Text>
        </View>
        <Text style={[styles.adTitle, item.unread_count > 0 && styles.bold]} numberOfLines={1}>
          {item.last_ad_title}
        </Text>
        <Text style={styles.snippet} numberOfLines={1}>{item.last_message}</Text>
      </View>

      {item.unread_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity><Search size={22} color="#111827" /></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['All', 'Unread'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.other_user_id}
          renderItem={({ item }) => <ConvItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Start a conversation by tapping "Chat" on any product listing.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle:   { fontSize: 24, fontWeight: '700', color: '#111827' },
  tabs:          { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingHorizontal: 20 },
  tabItem:       { marginRight: 32, paddingVertical: 12, position: 'relative' },
  tabText:       { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: GREEN, fontWeight: '700' },
  tabIndicator:  { height: 3, backgroundColor: GREEN, width: '100%', position: 'absolute', bottom: 0 },
  row:           { flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  avatarWrap:    { position: 'relative' },
  thumb:         { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F3F4F6' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCFCE7' },
  thumbChar:     { fontSize: 20, fontWeight: '700', color: GREEN },
  onlineDot:     { position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: GREEN, borderWidth: 2, borderColor: '#FFFFFF' },
  info:          { flex: 1, marginLeft: 12 },
  infoTop:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name:          { fontSize: 13, color: '#6B7280' },
  bold:          { fontWeight: '700', color: '#111827' },
  time:          { fontSize: 12, color: GREEN, fontWeight: '600' },
  adTitle:       { fontSize: 15, color: '#111827', marginBottom: 2 },
  snippet:       { fontSize: 13, color: '#9CA3AF' },
  badge:         { width: 22, height: 22, borderRadius: 11, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  badgeText:     { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  empty:         { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText:     { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});