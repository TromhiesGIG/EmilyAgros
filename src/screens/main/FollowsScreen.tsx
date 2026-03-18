// src/screens/main/FollowsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  Image
} from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useSyncData } from '../../hooks/useSyncData';

export const FollowsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('Followers');
  const { followers, following, loading, refresh } = useSyncData();

  // FIX TS2304: Integrated FollowItem
  const FollowItem = ({ item, isFollowersTab }: { item: any, isFollowersTab: boolean }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => navigation.navigate('SellerProfile', { sellerId: item.id })}
    >
      <View style={styles.leftContent}>
        <View style={styles.avatar}>
           {item.avatar ? (
             <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
           ) : (
             <Text style={styles.avatarText}>{item.initials}</Text>
           )}
        </View>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // FIX TS2304: Integrated EmptyState
  const EmptyState = ({ tab }: { tab: string }) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {tab === 'Followers' ? "You don’t have any followers yet." : "You’re not following anyone yet."}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'Followers' 
          ? "When anyone follows you, you will see them here" 
          : "Follow sellers to see their latest ads."}
      </Text>
    </View>
  );

  const liveData = activeTab === 'Followers' 
    ? followers.map(f => ({
        id: f.follower_id,
        name: f.profiles?.full_name || 'Agro Member',
        avatar: f.profiles?.avatar_url,
        initials: f.profiles?.full_name?.[0] || 'A'
      }))
    : following.map(f => ({
        id: f.following_id,
        name: f.profiles?.full_name || 'Agro Member',
        avatar: f.profiles?.avatar_url,
        initials: f.profiles?.full_name?.[0] || 'O'
      }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Follows</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Followers' && styles.activeTab]}
            onPress={() => setActiveTab('Followers')}
          >
            <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Following' && styles.activeTab]}
            onPress={() => setActiveTab('Following')}
          >
            <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={liveData}
        // FIX TS2769: Ensured id is a string and fallback to index
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <FollowItem item={item} isFollowersTab={activeTab === 'Followers'} />
        )}
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        refreshing={loading}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22, // Keep it circular
  },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 40 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#008102' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  activeTabText: { color: '#008102' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  leftContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  followBackBtn: { borderWidth: 1, borderColor: '#008102', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  followBackText: { color: '#008102', fontWeight: '600', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});