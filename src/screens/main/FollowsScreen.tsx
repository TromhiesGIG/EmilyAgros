// src/screens/main/FollowsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { CommonActions } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

interface FollowUser {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
  isFollowingBack?: boolean; // For followers - are we following them back?
}

export const FollowsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Followers' | 'Following'>('Followers');
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFollows();
    }
  }, [user, activeTab]);

  const fetchFollows = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (activeTab === 'Followers') {
        // Get users who follow ME
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id);

        if (error) throw error;

        // Fetch profiles for all followers
        if (data && data.length > 0) {
          const followerIds = data.map(f => f.follower_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', followerIds);

          // Check which followers we're following back
          const { data: followingBackData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)
            .in('following_id', followerIds);

          const followingBackIds = new Set(followingBackData?.map(f => f.following_id) || []);

          const followersList = profilesData?.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'EmilyAgros User',
            avatar: profile.avatar_url,
            initials: profile.full_name?.charAt(0).toUpperCase() || 'U',
            isFollowingBack: followingBackIds.has(profile.id),
          })) || [];

          setFollowers(followersList);
        } else {
          setFollowers([]);
        }
      } else {
        // Get users I AM FOLLOWING
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (error) throw error;

        // Fetch profiles for all following
        if (data && data.length > 0) {
          const followingIds = data.map(f => f.following_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', followingIds);

          const followingList = profilesData?.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'EmilyAgros User',
            avatar: profile.avatar_url,
            initials: profile.full_name?.charAt(0).toUpperCase() || 'U',
          })) || [];

          setFollowing(followingList);
        } else {
          setFollowing([]);
        }
      }
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowBack = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      // Update UI
      setFollowers(prev => 
        prev.map(f => f.id === userId ? { ...f, isFollowingBack: true } : f)
      );
    } catch (error) {
      console.error('Error following back:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      // Remove from following list
      setFollowing(prev => prev.filter(f => f.id !== userId));
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const FollowItem = ({ item }: { item: FollowUser }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => {
        // Get the root navigator (tab navigator)
        const rootNav = navigation.getParent();
        if (rootNav) {
          rootNav.navigate('HomeTab', {
            screen: 'SellerProfile',
            params: { sellerId: item.id }
          });
        }
      }}
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
      
      {activeTab === 'Followers' ? (
        // Show "Follow back" button if not following them back
        !item.isFollowingBack ? (
          <TouchableOpacity 
            style={styles.followBackBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleFollowBack(item.id);
            }}
          >
            <Text style={styles.followBackText}>Follow back</Text>
          </TouchableOpacity>
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )
      ) : (
        // Following tab - show unfollow button
        <TouchableOpacity 
          style={styles.unfollowBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleUnfollow(item.id);
          }}
        >
          <Text style={styles.unfollowText}>Unfollow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const EmptyState = ({ tab }: { tab: string }) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {tab === 'Followers' ? "You don't have any followers yet." : "You're not following anyone yet."}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'Followers' 
          ? "When anyone follows you, you will see them here" 
          : "Follow sellers to see their latest ads."}
      </Text>
    </View>
  );

  const currentData = activeTab === 'Followers' ? followers : following;

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
            <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>
              Followers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Following' && styles.activeTab]}
            onPress={() => setActiveTab('Following')}
          >
            <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FollowItem item={item} />}
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchFollows}
            colors={['#00A651']}
          />
        }
        contentContainerStyle={currentData.length === 0 ? styles.emptyList : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827' 
  },
  tabBar: { 
    flexDirection: 'row', 
    paddingHorizontal: 40 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 16, 
    alignItems: 'center' 
  },
  activeTab: { 
    borderBottomWidth: 3, 
    borderBottomColor: '#00A651' 
  },
  tabText: { 
    fontSize: 16, 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  activeTabText: { 
    color: '#00A651' 
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  leftContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#1F2937', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827' 
  },
  followBackBtn: {
    borderWidth: 1,
    borderColor: '#00A651',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followBackText: {
    color: '#00A651',
    fontWeight: '600',
    fontSize: 14,
  },
  unfollowBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  unfollowText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 20 
  },
});