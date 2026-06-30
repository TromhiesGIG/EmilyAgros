// src/screens/admin/AdminCarouselScreen.tsx
// Manage all 3 carousel slots + upload announcements

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Image, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { X, Upload, ImageOff } from 'lucide-react-native';

const GREEN = '#008102';
const GRAY  = '#6B7280';

interface CarouselSlot {
  id: string;
  slot_number: number;
  slot_type: 'empty' | 'promotion' | 'announcement';
  is_available: boolean;
  expires_at: string | null;
  product_id: string | null;
  announcement_image_url: string | null;
  announcement_title: string | null;
  announcement_link: string | null;
  product?: { title: string; images: string[] };
  seller?: { full_name: string };
}

export const AdminCarouselScreen = () => {
  const [slots, setSlots]           = useState<CarouselSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading]   = useState(false);

  // Announcement modal state
  const [announcementModal, setAnnouncementModal] = useState<number | null>(null);
  const [annImage, setAnnImage]   = useState<string | null>(null);
  const [annTitle, setAnnTitle]   = useState('');
  const [annLink, setAnnLink]     = useState('');

  useFocusEffect(useCallback(() => { fetchSlots(); }, []));

  const fetchSlots = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carousel_slots')
        .select(`
          *,
          product:products(title, images),
          seller:profiles(full_name)
        `)
        .order('slot_number', { ascending: true });

      if (!error) setSlots((data as any) ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]) {
      setAnnImage(result.assets[0].uri);
    }
  };

  const uploadAnnouncement = async (slotNumber: number) => {
    if (!annImage) {
      Alert.alert('Image Required', 'Please select an image for the announcement.');
      return;
    }

    setUploading(true);
    try {
      // Upload image to Supabase Storage
      const filename  = `announcement_${slotNumber}_${Date.now()}.jpg`;
      const response  = await fetch(annImage);
      const blob      = await response.blob();
      const arrayBuf  = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('carousel-images')
        .upload(filename, arrayBuf, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('carousel-images')
        .getPublicUrl(filename);

      const publicUrl = urlData.publicUrl;

      // Update the carousel slot
      const slot = slots.find(s => s.slot_number === slotNumber);
      if (!slot) return;

      await supabase.from('carousel_slots').update({
        slot_type:              'announcement',
        is_available:           false,
        announcement_image_url: publicUrl,
        announcement_title:     annTitle || null,
        announcement_link:      annLink || null,
        promotion_id:           null,
        product_id:             null,
        seller_id:              null,
        expires_at:             null,
      }).eq('id', slot.id);

      setAnnouncementModal(null);
      setAnnImage(null);
      setAnnTitle('');
      setAnnLink('');
      await fetchSlots();
      Alert.alert('Published!', `Announcement is now live on Slot ${slotNumber}.`);
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message ?? 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  const clearSlot = async (slot: CarouselSlot) => {
    Alert.alert(
      'Clear Slot',
      `Are you sure you want to clear Slot ${slot.slot_number}? ${slot.slot_type === 'promotion' ? 'The active promotion will be cancelled.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // If it's a promotion, expire it
              if (slot.slot_type === 'promotion' && slot.product_id) {
                await supabase.from('promotions')
                  .update({ status: 'expired' })
                  .eq('id', slot.id);
              }

              // Clear the slot
              await supabase.from('carousel_slots').update({
                slot_type:              'empty',
                is_available:           true,
                promotion_id:           null,
                product_id:             null,
                seller_id:              null,
                expires_at:             null,
                announcement_image_url: null,
                announcement_title:     null,
                announcement_link:      null,
              }).eq('id', slot.id);

              await fetchSlots();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const SlotCard = ({ slot }: { slot: CarouselSlot }) => {
    const isEmpty       = slot.slot_type === 'empty';
    const isPromotion   = slot.slot_type === 'promotion';
    const isAnnouncement = slot.slot_type === 'announcement';
    const imageUri = isPromotion
      ? slot.product?.images?.[0]
      : isAnnouncement
      ? slot.announcement_image_url
      : null;

    return (
      <View style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <Text style={styles.slotNumber}>Slot {slot.slot_number}</Text>
          <View style={[
            styles.slotBadge,
            isEmpty       ? styles.badgeEmpty :
            isPromotion   ? styles.badgePromo :
            styles.badgeAnn
          ]}>
            <Text style={[
              styles.slotBadgeText,
              isEmpty       ? { color: GRAY } :
              isPromotion   ? { color: GREEN } :
              { color: '#1565C0' }
            ]}>
              {isEmpty ? 'Empty' : isPromotion ? 'Promoted Ad' : 'Announcement'}
            </Text>
          </View>
        </View>

        {/* Preview image */}
        <View style={styles.previewWrap}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            : <View style={styles.previewEmpty}><ImageOff size={32} color="#D1D5DB" /></View>
          }
        </View>

        {/* Content info */}
        {isPromotion && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle} numberOfLines={1}>{slot.product?.title}</Text>
            <Text style={styles.infoSub}>By {slot.seller?.full_name}</Text>
            {slot.expires_at && (
              <Text style={styles.infoSub}>
                Expires {new Date(slot.expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            )}
          </View>
        )}

        {isAnnouncement && slot.announcement_title && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{slot.announcement_title}</Text>
            {slot.announcement_link && (
              <Text style={styles.infoSub} numberOfLines={1}>{slot.announcement_link}</Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.slotActions}>
          <TouchableOpacity
            style={styles.announcementBtn}
            onPress={() => setAnnouncementModal(slot.slot_number)}
          >
            <Upload size={15} color="#1565C0" />
            <Text style={styles.announcementBtnText}>Post Announcement</Text>
          </TouchableOpacity>
          {!isEmpty && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => clearSlot(slot)}>
              <X size={15} color="#DC2626" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carousel Manager</Text>
        <Text style={styles.headerSub}>3 slots total</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSlots(true)} tintColor={GREEN} />}
        >
          {slots.map(slot => <SlotCard key={slot.id} slot={slot} />)}
        </ScrollView>
      )}

      {/* Announcement upload modal */}
      <Modal visible={announcementModal !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Post Announcement</Text>
              <TouchableOpacity onPress={() => { setAnnouncementModal(null); setAnnImage(null); setAnnTitle(''); setAnnLink(''); }}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Slot {announcementModal}</Text>

            {/* Image picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {annImage
                ? <Image source={{ uri: annImage }} style={styles.pickedImage} resizeMode="cover" />
                : (
                  <View style={styles.imagePickerEmpty}>
                    <Upload size={28} color={GRAY} />
                    <Text style={styles.imagePickerText}>Tap to select image</Text>
                    <Text style={styles.imagePickerHint}>16:9 ratio recommended</Text>
                  </View>
                )
              }
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Announcement title (optional)"
              placeholderTextColor={GRAY}
              value={annTitle}
              onChangeText={setAnnTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Link URL (optional)"
              placeholderTextColor={GRAY}
              value={annLink}
              onChangeText={setAnnLink}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[styles.publishBtn, uploading && { opacity: 0.6 }]}
              onPress={() => announcementModal && uploadAnnouncement(announcementModal)}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.publishBtnText}>Publish to Slot {announcementModal}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#FFFFFF' },
  header:              { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:         { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSub:           { fontSize: 13, color: GRAY, marginTop: 2 },
  scroll:              { padding: 16 },
  slotCard:            { borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 16 },
  slotHeader:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  slotNumber:          { fontSize: 16, fontWeight: '700', color: '#111827' },
  slotBadge:           { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeEmpty:          { backgroundColor: '#F3F4F6' },
  badgePromo:          { backgroundColor: '#D1FAE5' },
  badgeAnn:            { backgroundColor: '#DBEAFE' },
  slotBadgeText:       { fontSize: 12, fontWeight: '700' },
  previewWrap:         { borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  preview:             { width: '100%', height: 140 },
  previewEmpty:        { width: '100%', height: 140, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  infoBox:             { marginBottom: 10 },
  infoTitle:           { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  infoSub:             { fontSize: 12, color: GRAY },
  slotActions:         { flexDirection: 'row', gap: 10 },
  announcementBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#1565C0' },
  announcementBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  clearBtn:            { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#DC2626' },
  clearBtnText:        { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:        { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeaderRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle:          { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalSub:            { fontSize: 13, color: GRAY, marginBottom: 16 },
  imagePicker:         { borderRadius: 12, overflow: 'hidden', marginBottom: 14, height: 160 },
  pickedImage:         { width: '100%', height: '100%' },
  imagePickerEmpty:    { width: '100%', height: '100%', backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12 },
  imagePickerText:     { fontSize: 14, color: GRAY, marginTop: 8, fontWeight: '600' },
  imagePickerHint:     { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  input:               { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', marginBottom: 12 },
  publishBtn:          { height: 52, backgroundColor: GREEN, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  publishBtnText:      { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});