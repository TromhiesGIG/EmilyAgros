// src/screens/admin/AdminWaitlistScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, Phone, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

const BUNDLE_LABELS: Record<string, string> = {
  grower:        'Grower',
  agri_pro:      'Agri-Pro',
  market_leader: 'Market Leader',
  carousel:      'Carousel',
};

export const AdminWaitlistScreen = () => {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { fetchWaitlist(); }, []));

  const fetchWaitlist = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data: waitlistData, error } = await supabase
        .from('promotion_waitlist')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!waitlistData || waitlistData.length === 0) {
        setItems([]);
        return;
      }

      const sellerIds = waitlistData.map((w: any) => w.seller_id);
      const { data: sellers } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .in('id', sellerIds);

      const sellerMap: Record<string, any> = {};
      (sellers ?? []).forEach((s: any) => { sellerMap[s.id] = s; });

      setItems(waitlistData.map((w: any) => ({
        ...w,
        seller: sellerMap[w.seller_id] ?? null,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markNotified = async (id: string) => {
    await supabase
      .from('promotion_waitlist')
      .update({ status: 'notified', notified_at: new Date().toISOString() })
      .eq('id', id);
    await fetchWaitlist();
  };

  const getContactPhone = (item: any) =>
    item.contact_phone || item.seller?.phone_number || '';

  const contactWhatsApp = (item: any) => {
    const phone     = getContactPhone(item);
    const formatted = phone.replace(/^0/, '234');
    const name      = item.seller?.full_name ?? 'there';
    const bundle    = BUNDLE_LABELS[item.bundle_name] ?? item.bundle_name ?? 'bundle';
    const msg       = encodeURIComponent(
      `Hi ${name}! Great news. A carousel slot just opened up on EmilyAgros. Your ${bundle} bundle is now available. Go to your profile on the app to get started or reply to this message and we will set it up for you right away.`
    );
    Linking.openURL(`https://wa.me/${formatted}?text=${msg}`);
  };

  const contactCall = (item: any) => {
    Linking.openURL(`tel:${getContactPhone(item)}`);
  };

  const contactSMS = (item: any) => {
    const phone  = getContactPhone(item);
    const name   = item.seller?.full_name ?? 'there';
    const bundle = BUNDLE_LABELS[item.bundle_name] ?? item.bundle_name ?? 'bundle';
    const msg    = encodeURIComponent(
      `Hi ${name}! A carousel slot just opened on EmilyAgros. Your ${bundle} bundle is now available. Reply to this message to get started.`
    );
    Linking.openURL(`sms:${phone}?body=${msg}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Waitlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length} waiting</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No one waiting</Text>
          <Text style={styles.emptySub}>When carousel slots fill up, waitlisted sellers appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchWaitlist(true)} tintColor={GREEN} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.sellerName}>{item.seller?.full_name ?? 'Unknown'}</Text>
                  <Text style={styles.sellerPhone}>{item.seller?.phone_number ?? 'No phone'}</Text>
                </View>
                <View style={styles.bundleBadge}>
                  <Text style={styles.bundleText}>
                    {BUNDLE_LABELS[item.bundle_name] ?? item.bundle_name ?? 'Carousel'}
                  </Text>
                </View>
              </View>

              <Text style={styles.waitingSince}>
                Waiting since {formatDate(item.created_at)}
              </Text>

              {/* Contact info */}
              <View style={styles.contactInfo}>
                <Text style={styles.contactInfoText}>
                  Prefers: {item.preferred_contact === 'whatsapp' ? 'WhatsApp' : item.preferred_contact === 'sms' ? 'SMS' : 'Call'}
                </Text>
                <Text style={styles.contactInfoText}>
                  Number: {item.contact_phone || item.seller?.phone_number || 'Not provided'}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => contactWhatsApp(item)}
                >
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={styles.waBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smsBtn}
                  onPress={() => contactSMS(item)}
                >
                  <MessageCircle size={16} color="#1565C0" />
                  <Text style={styles.smsBtnText}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => contactCall(item)}
                >
                  <Phone size={16} color={GREEN} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.notifiedBtn}
                  onPress={() => {
                    Alert.alert(
                      'Mark as Notified',
                      'This removes them from the waiting list. Only do this after you have contacted them.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Mark Notified', onPress: () => markNotified(item.id) },
                      ]
                    );
                  }}
                >
                  <CheckCircle2 size={16} color={GRAY} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFFFFF' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: '#111827' },
  countBadge:     { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText:      { fontSize: 12, fontWeight: '700', color: '#92400E' },
  empty:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle:     { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub:       { fontSize: 14, color: GRAY, textAlign: 'center' },
  card:           { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 12 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  sellerName:     { fontSize: 15, fontWeight: '700', color: '#111827' },
  sellerPhone:    { fontSize: 13, color: GRAY, marginTop: 2 },
  bundleBadge:    { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bundleText:     { fontSize: 12, fontWeight: '700', color: GREEN },
  waitingSince:   { fontSize: 12, color: GRAY, marginBottom: 12 },
  actions:        { flexDirection: 'row', gap: 8 },
  contactInfo:     { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8, marginBottom: 12, gap: 3 },
  contactInfoText: { fontSize: 12, color: GRAY },
  waBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 38, borderRadius: 19, backgroundColor: '#075E54' },
  waBtnText:       { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  smsBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: '#1565C0' },
  smsBtnText:      { color: '#1565C0', fontWeight: '600', fontSize: 12 },
  callBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: GREEN },
  callBtnText:     { color: GREEN, fontWeight: '600', fontSize: 12 },
  notifiedBtn:     { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
});