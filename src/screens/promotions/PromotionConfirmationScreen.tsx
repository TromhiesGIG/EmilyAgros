// src/screens/promotions/PromotionConfirmationScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { PlanDuration, PLAN_DURATION_LABELS } from '../../types/promotions';

const GREEN = '#008102';
const GRAY  = '#6B7280';

const TYPE_LABEL: Record<string, string> = {
  carousel:  'Carousel',
  trending:  'Trending',
  search_ad: 'Search Ads',
  bundle:    'Bundle',
};

export const PromotionConfirmationScreen: React.FC<any> = ({ navigation, route }) => {
  const { promotionType, planDuration, expiresAt, status, amount, productTitle } = route.params;
  const [autoRenew, setAutoRenew] = useState(true);

  const isPending  = status === 'pending';
  const typeLabel  = TYPE_LABEL[promotionType] ?? promotionType;
  const duration   = PLAN_DURATION_LABELS[planDuration as PlanDuration] ?? planDuration;

  const formatExpiry = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetCard}>
          <Text style={styles.sheetTitle}>
            {isPending ? 'Submitted for Review!' : "You're Subscribed!"}
          </Text>

          <Text style={styles.successDesc}>
            {isPending
              ? `Your ${typeLabel} submission is being reviewed. We'll activate it within 24 hours.`
              : `You are now subscribed to `}
            {!isPending && <Text style={styles.boldText}>{typeLabel}</Text>}
          </Text>

          {/* Plan summary */}
          <View style={styles.planBox}>
            <Text style={styles.planBoxName}>{typeLabel}</Text>
            <Text style={styles.planBoxPrice}>
              {amount ? `₦${Number(amount).toLocaleString()}` : ''}{' '}
              <Text style={styles.planBoxPeriod}>/{duration?.toLowerCase()}</Text>
            </Text>
            {productTitle && (
              <Text style={styles.planBoxAd} numberOfLines={1}>{productTitle}</Text>
            )}
            {expiresAt && !isPending && (
              <Text style={styles.expiryText}>Expires {formatExpiry(expiresAt)}</Text>
            )}
          </View>

          {/* Auto renew toggle */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>
                  Auto renew is {autoRenew ? 'ON' : 'OFF'}
                </Text>
                <Text style={styles.toggleSub}>
                  Renews your subscription automatically from your wallet upon expiry.
                </Text>
              </View>
              <Switch
                value={autoRenew}
                onValueChange={setAutoRenew}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
              />
            </View>
          </View>

          {/* Done */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:        { padding: 20 },
  sheetCard:     { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', padding: 24 },
  sheetTitle:    { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12 },
  successDesc:   { fontSize: 15, color: GRAY, marginBottom: 24, lineHeight: 22 },
  boldText:      { fontWeight: '700', color: '#111827' },
  planBox:       { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 32 },
  planBoxName:   { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  planBoxPrice:  { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  planBoxPeriod: { fontSize: 14, fontWeight: '400', color: GRAY },
  planBoxAd:     { fontSize: 13, color: GRAY, marginTop: 4 },
  expiryText:    { fontSize: 13, color: GRAY, marginTop: 4 },
  toggleSection: { marginBottom: 40 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft:    { flex: 1, marginRight: 16 },
  toggleTitle:   { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  toggleSub:     { fontSize: 14, color: GRAY, lineHeight: 20 },
  doneBtn:       { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  doneBtnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});