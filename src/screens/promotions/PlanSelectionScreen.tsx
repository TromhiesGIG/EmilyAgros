// src/screens/promotions/PlanSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import {
  PlanDuration,
  PROMOTION_PRICES,
  BUNDLE_PRICES,
  BUNDLE_DETAILS,
  PLAN_DURATION_LABELS,
  PLAN_DURATION_DAYS,
  BundleName,
} from '../../types/promotions';

const GREEN = '#008102';
const GRAY  = '#6B7280';
const DURATIONS: PlanDuration[] = ['1_week', '1_month', '3_months'];

export const PlanSelectionScreen: React.FC<any> = ({ navigation, route }) => {
  console.log('PlanSelection params:', JSON.stringify(route.params)); // ADD THIS
  const { promotionType, bundleName, productId, productTitle } = route.params;
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('1_month');

  const isBundle   = promotionType === 'bundle' && !!bundleName;
  const bundleInfo = isBundle && bundleName ? BUNDLE_DETAILS[bundleName as BundleName] : null;
  const bundlePrice = isBundle && bundleName ? BUNDLE_PRICES[bundleName as BundleName] : 0;

  const getPrice = (duration: PlanDuration): number => {
    if (isBundle) return bundlePrice;
    const typePrice = PROMOTION_PRICES[promotionType];
    return typePrice ? typePrice[duration] : 0;
  };

  const effectiveDuration: PlanDuration = isBundle ? '1_month' : selectedDuration;
  const totalPrice = getPrice(effectiveDuration);

  const promotionLabel: Record<string, string> = {
    carousel:  'Carousel',
    trending:  'Trending',
    search_ad: 'Search Ads',
    bundle:    bundleInfo?.label ?? 'Bundle',
  };

  const handleContinue = () => {
    navigation.navigate('PromotionPayment', {
      promotionType,
      bundleName,
      productId,
      productTitle,
      planDuration: effectiveDuration,
      amount:       totalPrice,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Plan</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Ad preview */}
        <View style={styles.adPreview}>
          <Text style={styles.adPreviewLabel}>Promoting</Text>
          <Text style={styles.adPreviewTitle} numberOfLines={1}>{productTitle}</Text>
          <Text style={styles.adPreviewType}>{promotionLabel[promotionType]}</Text>
        </View>

        {/* Bundle includes */}
        {isBundle && bundleInfo && (
          <View style={styles.bundleBox}>
            <Text style={styles.bundleBoxTitle}>What's included</Text>
            {bundleInfo.includes.map((item: string, i: number) => (
              <View key={i} style={styles.bundleIncludeRow}>
                <CheckCircle2 size={15} color={GREEN} />
                <Text style={styles.bundleIncludeText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Duration</Text>

        {/* Individual promotion durations */}
        {!isBundle && DURATIONS.map((d: PlanDuration) => {
          const price    = getPrice(d);
          const selected = selectedDuration === d;
          const days     = PLAN_DURATION_DAYS[d];
          const perDay   = days > 0 ? Math.round(price / days) : 0;

          return (
            <TouchableOpacity
              key={d}
              style={[styles.durationCard, selected && styles.durationCardSelected]}
              onPress={() => setSelectedDuration(d)}
              activeOpacity={0.85}
            >
              <View style={styles.durationLeft}>
                <Text style={[styles.durationLabel, selected && { color: GREEN }]}>
                  {PLAN_DURATION_LABELS[d]}
                </Text>
                <Text style={styles.durationPerDay}>≈ ₦{perDay.toLocaleString()} / day</Text>
              </View>
              <View style={styles.durationRight}>
                <Text style={[styles.durationPrice, selected && { color: GREEN }]}>
                  ₦{price.toLocaleString()}
                </Text>
                {selected && <CheckCircle2 size={18} color={GREEN} style={{ marginLeft: 8 }} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bundle fixed duration */}
        {isBundle && (
          <View style={[styles.durationCard, styles.durationCardSelected]}>
            <View style={styles.durationLeft}>
              <Text style={[styles.durationLabel, { color: GREEN }]}>1 Month</Text>
              <Text style={styles.durationPerDay}>All components active for 30 days</Text>
            </View>
            <View style={styles.durationRight}>
              <Text style={[styles.durationPrice, { color: GREEN }]}>
                ₦{totalPrice.toLocaleString()}
              </Text>
              <CheckCircle2 size={18} color={GREEN} style={{ marginLeft: 8 }} />
            </View>
          </View>
        )}

        {/* Info box */}
        <View style={styles.infoBox}>
          {(promotionType === 'carousel' || (isBundle && bundleInfo?.hasCarousel))
            ? <Text style={styles.infoText}>⏳ Carousel submissions are reviewed within 24 hours before going live.</Text>
            : <Text style={styles.infoText}>⚡ Your promotion activates immediately after payment.</Text>
          }
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryPrice}>₦{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: '#FFFFFF' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn:              { width: 38, height: 38, justifyContent: 'center' },
  headerTitle:          { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  scroll:               { padding: 16 },
  adPreview:            { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  adPreviewLabel:       { fontSize: 11, color: GRAY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  adPreviewTitle:       { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  adPreviewType:        { fontSize: 12, color: GREEN, fontWeight: '600' },
  bundleBox:            { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  bundleBoxTitle:       { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  bundleIncludeRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  bundleIncludeText:    { fontSize: 13, color: '#374151', flex: 1 },
  sectionLabel:         { fontSize: 13, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  durationCard:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', padding: 14, marginBottom: 10, backgroundColor: '#FFFFFF' },
  durationCardSelected: { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  durationLeft:         { flex: 1 },
  durationLabel:        { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  durationPerDay:       { fontSize: 12, color: GRAY },
  durationRight:        { flexDirection: 'row', alignItems: 'center' },
  durationPrice:        { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  infoBox:              { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FDE68A' },
  infoText:             { fontSize: 13, color: '#92400E', lineHeight: 19 },
  footer:               { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12 },
  summaryRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel:         { fontSize: 15, color: GRAY, fontWeight: '600' },
  summaryPrice:         { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  continueBtn:          { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  continueBtnText:      { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});