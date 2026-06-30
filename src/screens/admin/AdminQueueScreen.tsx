// src/screens/admin/AdminQueueScreen.tsx
// Carousel approval queue

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Image, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, XCircle, ImageOff } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

interface QueueItem {
  id: string;
  promotion_id: string;
  seller_id: string;
  product_id: string;
  status: string;
  created_at: string;
  promotion: {
    plan_duration: string;
    amount_paid: number;
  };
  product: {
    title: string;
    images: string[];
    price: number;
  };
  seller: {
    full_name: string;
    phone_number: string;
  };
}

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week', '1_month': '1 Month', '3_months': '3 Months',
};

export const AdminQueueScreen = () => {
  const [items, setItems]           = useState<QueueItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [processing, setProcessing]   = useState(false);

  useFocusEffect(useCallback(() => { fetchQueue(); }, []));

  const fetchQueue = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_queue')
        .select(`
          *,
          promotion:promotions(plan_duration, amount_paid),
          product:products(title, images, price),
          seller:profiles(full_name, phone_number)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (!error) setItems((data as any) ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleApprove = async (item: QueueItem) => {
    Alert.alert(
      'Approve Carousel',
      `Approve ${item.seller?.full_name}'s carousel submission for ${DURATION_LABELS[item.promotion?.plan_duration]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              // 1. Find an available carousel slot
              const { data: slots } = await supabase
                .from('carousel_slots')
                .select('*')
                .eq('is_available', true)
                .eq('slot_type', 'empty')
                .order('slot_number', { ascending: true })
                .limit(1);

              if (!slots || slots.length === 0) {
                Alert.alert('No Slots Available', 'All 3 carousel slots are currently full.');
                setProcessing(false);
                return;
              }

              const slot = slots[0];
              const now  = new Date();
              const durationDays: Record<string, number> = {
                '1_week': 7, '1_month': 30, '3_months': 90,
              };
              const expiresAt = new Date(now);
              expiresAt.setDate(expiresAt.getDate() + (durationDays[item.promotion?.plan_duration] ?? 30));

              // 2. Assign slot to this promotion
              await supabase.from('carousel_slots').update({
                slot_type:    'promotion',
                promotion_id: item.promotion_id,
                product_id:   item.product_id,
                seller_id:    item.seller_id,
                is_available: false,
                expires_at:   expiresAt.toISOString(),
              }).eq('id', slot.id);

              // 3. Activate the promotion
              await supabase.from('promotions').update({
                status:    'active',
                starts_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
              }).eq('id', item.promotion_id);

              // 4. Update queue entry
              await supabase.from('admin_queue').update({
                status:      'approved',
                reviewed_at: now.toISOString(),
              }).eq('id', item.id);

              await fetchQueue();
              Alert.alert('Approved!', 'The carousel slot has been activated.');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Something went wrong.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    try {
      // Update queue entry
      await supabase.from('admin_queue').update({
        status:      'rejected',
        admin_note:  rejectNote || 'Does not meet carousel guidelines.',
        reviewed_at: new Date().toISOString(),
      }).eq('id', rejectModal);

      // Update promotion status
      const item = items.find(i => i.id === rejectModal);
      if (item) {
        await supabase.from('promotions')
          .update({ status: 'rejected' })
          .eq('id', item.promotion_id);
      }

      setRejectModal(null);
      setRejectNote('');
      await fetchQueue();
      Alert.alert('Rejected', 'The submission has been rejected and the seller will be notified.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: QueueItem }) => {
    const imageUri = item.product?.images?.[0] ?? null;
    return (
      <View style={styles.card}>
        {/* Product image + info */}
        <View style={styles.cardTop}>
          <View style={styles.thumbWrap}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
              : <View style={styles.thumbPlaceholder}><ImageOff size={20} color={GRAY} /></View>
            }
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>{item.product?.title}</Text>
            <Text style={styles.productPrice}>₦{Number(item.product?.price).toLocaleString()}</Text>
            <Text style={styles.sellerName}>{item.seller?.full_name}</Text>
            <Text style={styles.planText}>
              {DURATION_LABELS[item.promotion?.plan_duration]} · ₦{Number(item.promotion?.amount_paid).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.submittedAt}>
          Submitted {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setRejectModal(item.id)}
            disabled={processing}
          >
            <XCircle size={18} color="#DC2626" />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item)}
            disabled={processing}
          >
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carousel Queue</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length} pending</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>All clear!</Text>
          <Text style={styles.emptySub}>No pending carousel submissions.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchQueue(true)} tintColor={GREEN} />
          }
        />
      )}

      {/* Reject modal */}
      <Modal visible={!!rejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Submission</Text>
            <Text style={styles.modalSub}>Add a note for the seller (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Image quality too low, please resubmit"
              placeholderTextColor={GRAY}
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.confirmRejectBtn}
              onPress={handleReject}
              disabled={processing}
            >
              {processing
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmRejectText}>Confirm Rejection</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setRejectModal(null); setRejectNote(''); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#FFFFFF' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:        { fontSize: 18, fontWeight: '700', color: '#111827' },
  countBadge:         { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText:          { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  card:               { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 12 },
  cardTop:            { flexDirection: 'row', marginBottom: 10 },
  thumbWrap:          { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  thumb:              { width: '100%', height: '100%' },
  thumbPlaceholder:   { width: '100%', height: '100%', backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  cardInfo:           { flex: 1 },
  productTitle:       { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2, lineHeight: 20 },
  productPrice:       { fontSize: 14, fontWeight: '700', color: GREEN, marginBottom: 2 },
  sellerName:         { fontSize: 13, color: GRAY, marginBottom: 2 },
  planText:           { fontSize: 12, color: GRAY },
  submittedAt:        { fontSize: 12, color: GRAY, marginBottom: 12 },
  actions:            { flexDirection: 'row', gap: 10 },
  rejectBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#DC2626' },
  rejectBtnText:      { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  approveBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, backgroundColor: GREEN },
  approveBtnText:     { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  empty:              { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle:         { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub:           { fontSize: 14, color: GRAY },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:       { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:         { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  modalSub:           { fontSize: 14, color: GRAY, marginBottom: 16 },
  noteInput:          { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  confirmRejectBtn:   { height: 52, backgroundColor: '#DC2626', borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  confirmRejectText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  cancelBtn:          { height: 52, backgroundColor: '#F9FAFB', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText:      { color: '#111827', fontWeight: '600', fontSize: 16 },
});