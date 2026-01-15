// src/screens/main/AdDetailsScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView,
  Share
} from 'react-native';
import { ArrowLeft, Share2, MapPin } from 'lucide-react-native';

export const AdDetailsScreen = ({ navigation, route }: any) => {
  // In a real app, this data would come from Supabase via route.params.adId
  const ad = {
    title: 'Massey Ferguson 399',
    price: '₦ 40,000,000',
    isNegotiable: true,
    location: 'Ibadan, Oyo State',
    date: 'Aug 4th',
    status: 'Active', // or 'Cancelled'
    description: 'This tractor is very strong and fairly used. It is in great condition and needs no repairs.',
    views: '1,200',
    chats: '89',
    image: 'https://images.unsplash.com/photo-1592919016327-0460f336c2a6?q=80&w=1000&auto=format&fit=crop',
    attributes: [
      { label: 'Category', value: 'Farm Equipments' },
      { label: 'Sub-Category', value: 'Tractors' },
      { label: 'Brand', value: 'Massey Ferguson' },
      { label: 'Condition', value: 'Fairly Used' },
      { label: 'Power', value: '80hp' },
      { label: 'Fuel Type', value: 'Diesel' },
      { label: 'Transmission', value: 'Manual' },
      { label: 'Year of Manufacture', value: '2022' },
    ]
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this ${ad.title} on EmilyAgros!` });
    } catch (error) {
      console.log(error);
    }
  };

  const AttributeItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.attributeItem}>
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={styles.attributeValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ad details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Share2 size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ad Image with Status Badge */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: ad.image }} style={styles.mainImage} />
          <View style={[styles.statusBadge, ad.status === 'Active' ? styles.activeBadge : styles.cancelledBadge]}>
            <Text style={[styles.statusText, ad.status === 'Active' ? styles.activeText : styles.cancelledText]}>
              {ad.status}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{ad.location} • Created on {ad.date}</Text>
          </View>
          
          <Text style={styles.title}>{ad.title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{ad.price}</Text>
            {ad.isNegotiable && <Text style={styles.negotiable}>Negotiable</Text>}
          </View>

          {/* Contextual Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            
            {ad.status === 'Active' ? (
              <TouchableOpacity style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.reactivateBtn}>
                <Text style={styles.reactivateBtnText}>Reactivate</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.boostBtn}>
              <Text style={styles.boostBtnText}>Boost</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attributes Grid */}
        <View style={styles.section}>
          <View style={styles.attributesGrid}>
            {ad.attributes.map((attr, index) => (
              <AttributeItem key={index} label={attr.label} value={attr.value} />
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionText}>{ad.description}</Text>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Views</Text>
            <Text style={styles.metricValue}>{ad.views}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Chats</Text>
            <Text style={styles.metricValue}>{ad.chats}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  imageContainer: { position: 'relative', width: '100%', height: 250 },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#D1FAE5' },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontWeight: '700' },
  activeText: { color: '#065F46' },
  cancelledText: { color: '#991B1B' },
  infoCard: { backgroundColor: '#FFFFFF', marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { marginLeft: 4, fontSize: 13, color: '#6B7280' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  price: { fontSize: 18, fontWeight: '700', color: '#008102', marginRight: 8 },
  negotiable: { fontSize: 14, color: '#6B7280' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  editBtn: { flex: 1, height: 44, backgroundColor: '#F3F4F6', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cancelBtn: { flex: 1, height: 44, backgroundColor: '#EF4444', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  reactivateBtn: { flex: 1, height: 44, borderWidth: 1, borderColor: '#008102', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  reactivateBtnText: { fontSize: 15, fontWeight: '600', color: '#008102' },
  boostBtn: { flex: 1, height: 44, backgroundColor: '#008102', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  boostBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  section: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  attributesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  attributeItem: { width: '50%', marginBottom: 16 },
  attributeLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  attributeValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  descriptionText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  metricsContainer: { flexDirection: 'row', padding: 20 },
  metricItem: { flex: 1 },
  metricLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
});