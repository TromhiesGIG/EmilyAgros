// src/screens/promotions/PromotionPaymentScreen.tsx
// Matches Figma: "Confirm Subscription" bottom sheet style

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PromotionsStackParamList } from '../../navigation/types';
import { getWalletBalance, payWithWalletAndPromote } from '../../services/promotionService';
import { PLAN_DURATION_LABELS } from '../../types/promotions';
import { useAuth } from '../../providers/AuthProvider';

type Props = {
  navigation: NativeStackNavigationProp<PromotionsStackParamList, 'PromotionPayment'>;
  route: RouteProp<PromotionsStackParamList, 'PromotionPayment'>;
};

const GREEN = '#008102';
const GRAY  = '#6B7280';

const TYPE_LABEL: Record<string, string> = {
  carousel: 'Carousel', trending: 'Trending',
  search_ad: 'Search Ads', bundle: 'Bundle',
};

export const PromotionPaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { promotionType, bundleName, productId, productTitle, planDuration, amount } = route.params;
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [processing, setProcessing]       = useState(false);

  useEffect(() => {
    if (!user) return;
    getWalletBalance(user.id)
      .then(setWalletBalance)
      .catch(() => setWalletBalance(0))
      .finally(() => setLoading(false));
  }, [user]);

  const insufficient = walletBalance < amount;

  const handlePay = async () => {
    if (!user || insufficient) return;
    setProcessing(true);
    try {
      const promotion = await payWithWalletAndPromote({
        sellerId:      user.id,
        productId,
        promotionType,
        planDuration,
        paymentMethod: 'wallet',
        amountPaid:    amount,
        bundleName,
      });
      navigation.replace('PromotionConfirmation', {
        promotionType,
        planDuration,
        expiresAt:    promotion.expires_at ?? undefined,
        status:       promotion.status,
        amount,
        productTitle,
      });
    } catch (err: any) {
      setProcessing(false);
      const message = err?.message === 'INSUFFICIENT_BALANCE'
        ? 'Your wallet balance is too low. Please recharge and try again.'
        : err?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Payment Failed', message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={GREEN} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Wallet balance bar */}
        <View style={styles.walletBar}>
          <Wallet size={16} color={GRAY} />
          <Text style={styles.walletText}>
            Current wallet balance:{' '}
            <Text style={styles.walletValue}>₦{walletBalance.toLocaleString()}</Text>
          </Text>
        </View>

        {/* Bottom sheet card */}
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Confirm Subscription</Text>
          </View>

          {/* Plan summary box */}
          <View style={styles.planBox}>
            <Text style={styles.planBoxName}>
              {TYPE_LABEL[promotionType]}{bundleName ? ` — ${bundleName.replace(/_/g,' ')}` : ''}
            </Text>
            <Text style={styles.planBoxPrice}>
              ₦{amount.toLocaleString()}{' '}
              <Text style={styles.planBoxPeriod}>/{PLAN_DURATION_LABELS[planDuration]?.toLowerCase()}</Text>
            </Text>
            <Text style={styles.planBoxAd} numberOfLines={1}>{productTitle}</Text>
          </View>

          {/* Wallet payment row */}
          <View style={styles.paymentRow}>
            <Wallet size={20} color="#4B5563" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.paymentTitle}>Wallet Payment</Text>
              <Text style={styles.paymentSub}>
                Current wallet balance: ₦{walletBalance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Insufficient funds warning */}
          {insufficient && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Insufficient wallet balance. You need more funds to complete this subscription
              </Text>
            </View>
          )}

          {/* Buttons */}
          {insufficient ? (
            <>
              <TouchableOpacity
                style={styles.darkBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.darkBtnText}>Choose another plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => navigation.navigate('WalletRecharge' as any)}
              >
                <Text style={styles.ghostBtnText}>Recharge Wallet</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.greenBtn, processing && styles.btnDisabled]}
                onPress={handlePay}
                disabled={processing}
              >
                {processing
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.greenBtnText}>Subscribe</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFFFFF' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:         { padding: 20 },
  walletBar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 24, gap: 6 },
  walletText:     { fontSize: 14, color: '#4B5563' },
  walletValue:    { fontWeight: '700', color: '#111827' },
  sheetCard:      { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', padding: 24 },
  sheetHeader:    { marginBottom: 24 },
  sheetTitle:     { fontSize: 22, fontWeight: '700', color: '#111827' },
  planBox:        { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 24 },
  planBoxName:    { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4, textTransform: 'capitalize' },
  planBoxPrice:   { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  planBoxPeriod:  { fontSize: 14, fontWeight: '400', color: '#6B7280' },
  planBoxAd:      { fontSize: 13, color: '#6B7280' },
  paymentRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  paymentTitle:   { fontSize: 15, fontWeight: '600', color: '#111827' },
  paymentSub:     { fontSize: 14, color: '#6B7280', marginTop: 2 },
  warningBox:     { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 24 },
  warningText:    { fontSize: 14, color: '#EF4444', lineHeight: 20 },
  greenBtn:       { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  greenBtnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  darkBtn:        { height: 56, backgroundColor: '#111827', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  darkBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ghostBtn:       { height: 56, backgroundColor: '#F9FAFB', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  ghostBtnText:   { color: '#111827', fontSize: 16, fontWeight: '600' },
  btnDisabled:    { opacity: 0.6 },
});