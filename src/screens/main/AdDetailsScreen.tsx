// src/screens/main/AdDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Share, Alert, Linking
} from 'react-native';
import { ArrowLeft, Share2, Heart, MessageCircle, Phone, MapPin } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

export const AdDetailsScreen = ({ route, navigation }: any) => {
  const { adId } = route.params;
  const { user } = useAuth();
  const [ad, setAd] = useState<any | null>(null);
  const [seller, setSeller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [adId]);

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

      if (productData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, avatar_url')
          .eq('id', productData.user_id)
          .single();

        if (profileData) setSeller(profileData);
      }

      await supabase
        .from('products')
        .update({ views: (productData.views || 0) + 1 })
        .eq('id', adId);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  const handleCallSeller = () => {
    const phone = ad?.contact_phone || seller?.phone_number;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Error', 'This seller has not provided a contact number.');
    }
  };

  const handleStartChat = () => {
    if (!user) {
      Alert.alert('Sign In', 'Please log in to message the seller.');
      return;
    }
    // ✅ FIXED: Use user_id instead of seller_id
    if (user.id === ad?.user_id) {
      Alert.alert('Notification', 'This is your own advertisement.');
      return;
    }
    navigation.navigate('ChatDetail', {
      adId: ad.id,
      receiverId: ad.user_id, // ✅ FIXED: Changed from ad.seller_id to ad.user_id
      sellerName: seller?.full_name || ad.contact_name || 'Agro Member',
      adTitle: ad.title,
      adPrice: ad.price,
      adImage: ad.images?.[0],
      phoneNumber: seller?.phone_number || ad.contact_phone,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${ad?.title} on EmilyAgros!\nhttps://emilyagros.com/ads/${adId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#008102" />
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
    .filter(Boolean).join(', ') || 'Location not specified';
  const sellerName = ad.contact_name || seller?.full_name || 'EmilyAgros User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{ad.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={{ marginRight: 16 }}>
            <Share2 size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
            <Heart size={24} color={isSaved ? '#EF4444' : '#111827'} fill={isSaved ? '#EF4444' : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: ad.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image' }}
            style={styles.mainImage}
          />
          <View style={[styles.statusBadge, ad.status === 'Active' ? styles.activeBadge : styles.cancelledBadge]}>
            <Text style={[styles.statusText, ad.status === 'Active' ? styles.activeText : styles.cancelledText]}>
              {ad.status}
            </Text>
          </View>
        </View>

        {ad.images?.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
            {ad.images.map((img: string, index: number) => (
              <Image key={index} source={{ uri: img }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        )}

        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <Text style={styles.title}>{ad.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{Number(ad.price)?.toLocaleString()}</Text>
            {ad.negotiable && <Text style={styles.negotiable}>• Negotiable</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{ad.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seller Information</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.avatarText}>{sellerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.sellerName}>{sellerName}</Text>
              {ad.contact_business && <Text style={styles.sellerBusiness}>{ad.contact_business}</Text>}
              <Text style={styles.sellerSince}>Verified Seller</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.viewsText}>👁 {ad.views || 0} views</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleStartChat}>
          <MessageCircle color="#008102" size={22} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={handleCallSeller}>
          <Phone color="#FFFFFF" size={22} />
          <Text style={styles.callBtnText}>Call Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: '#6B7280', marginBottom: 16 },
  goBackBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#008102', borderRadius: 20 },
  goBackText: { color: '#FFFFFF', fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, marginHorizontal: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  scrollContainer: { paddingBottom: 100 },
  imageContainer: { width: '100%', height: 280, position: 'relative', backgroundColor: '#F3F4F6' },
  mainImage: { width: '100%', height: '100%' },
  thumbnailRow: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F9FAFB' },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 8, backgroundColor: '#E5E7EB' },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#DCFCE7' },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontWeight: '700' },
  activeText: { color: '#166534' },
  cancelledText: { color: '#B91C1C' },
  infoCard: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { marginLeft: 4, fontSize: 13, color: '#6B7280' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 24, fontWeight: '800', color: '#008102' },
  negotiable: { fontSize: 14, color: '#6B7280', marginLeft: 8 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  descriptionText: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#008102', fontWeight: '700', fontSize: 18 },
  sellerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  sellerBusiness: { fontSize: 13, color: '#6B7280' },
  sellerSince: { fontSize: 12, color: '#6B7280' },
  viewsText: { fontSize: 13, color: '#6B7280' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#FFFFFF', flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 20 },
  chatBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#008102', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  chatBtnText: { color: '#008102', fontWeight: '700', fontSize: 16 },
  callBtn: { flex: 1, height: 50, borderRadius: 25, backgroundColor: '#008102', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  callBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});