import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, FlatList, 
  TouchableOpacity, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { ArrowLeft, Star, MessageCircle, Share2 } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useSyncData } from '../../hooks/useSyncData';
import { useAuth } from '../../providers/AuthProvider';

export const SellerProfileScreen = ({ route, navigation }: any) => {
  const { sellerId } = route.params;
  const { user } = useAuth();
  const { refresh, following } = useSyncData();
  
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [sellerAds, setSellerAds] = useState<any[]>([]);

  const isFollowing = following.some(f => f.following_id === sellerId);

  useEffect(() => {
    fetchSellerInfo();
  }, [sellerId]);

  const fetchSellerInfo = async () => {
    setLoading(true);
    try {
      const [profileRes, adsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sellerId).single(),
        supabase.from('ads').select('*').eq('seller_id', sellerId).eq('status', 'Active')
      ]);

      if (profileRes.data) setSellerData(profileRes.data);
      setSellerAds(adsRes.data || []);
    } catch (error) {
      console.error("Error loading seller profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to follow sellers.");
      return;
    }

    try {
      if (isFollowing) {
        await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', sellerId);
      } else {
        await supabase.from('follows')
          .insert({ follower_id: user.id, following_id: sellerId });
      }
      await refresh(); // Syncs the Follows tab immediately
    } catch (error) {
      Alert.alert("Error", "Action failed. Please try again.");
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#008102" size="large" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <TouchableOpacity><Share2 size={22} color="#111827" /></TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: sellerData?.avatar_url || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
              />
            </View>
            <Text style={styles.name}>{sellerData?.full_name || 'Agro Member'}</Text>
            <Text style={styles.bio}>{sellerData?.bio || "Agricultural Entrepreneur"}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{sellerAds.length}</Text>
                <Text style={styles.statLabel}>Ads</Text>
              </View>
              <View style={[styles.statBox, styles.statBorder]}>
                <Text style={styles.statNumber}>4.8</Text>
                <View style={styles.ratingRow}><Star size={12} color="#F59E0B" fill="#F59E0B" /><Text style={styles.statLabel}>Rating</Text></View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.followBtn, isFollowing && styles.followingBtn]} 
                onPress={toggleFollow}
              >
                <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageBtn}>
                <MessageCircle size={20} color="#008102" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Sellers Ads</Text>
          </View>
        }
        data={sellerAds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.adCard}>
            <Image source={{ uri: item.images?.[0] }} style={styles.adImage} />
            <View style={styles.adInfo}>
              <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.adPrice}>₦ {item.price.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={styles.adRow}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  profileHeader: { alignItems: 'center', padding: 20 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 12, borderWidth: 3, borderColor: '#F3F4F6' },
  avatar: { width: '100%', height: '100%' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  bio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 12, width: '100%', marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 30 },
  followBtn: { flex: 1, height: 48, backgroundColor: '#008102', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  followingBtn: { backgroundColor: '#F3F4F6' },
  followBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  followingBtnText: { color: '#111827' },
  messageBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#008102', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', alignSelf: 'flex-start', marginTop: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  adRow: { justifyContent: 'space-between' },
  adCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  adImage: { width: '100%', height: 120, backgroundColor: '#F3F4F6' },
  adInfo: { padding: 10 },
  adTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  adPrice: { fontSize: 15, fontWeight: '700', color: '#008102' }
});