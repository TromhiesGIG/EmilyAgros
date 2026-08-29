// src/screens/promotions/PromotionPaymentScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, Modal, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { getWalletBalance, payWithWalletAndPromote } from '../../services/promotionService';
import { PLAN_DURATION_LABELS } from '../../types/promotions';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';
const GRAY  = '#6B7280';

const TYPE_LABEL: Record<string, string> = {
  carousel: 'Carousel', trending: 'Trending',
  search_ad: 'Search Ads', bundle: 'Bundle',
};

export const PromotionPaymentScreen: React.FC<any> = ({ navigation, route }) => {
  const { promotionType, bundleName, productId, productTitle, planDuration, amount } = route.params;
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [processing, setProcessing]       = useState(false);
  const [autoRenew, setAutoRenew]         = useState(true);

  // Two modals — confirmation first, then success
  const [showConfirmModal, setShowConfirmModal]   = useState(false);
  const [showSuccessModal, setShowSuccessModal]   = useState(false);
  const [promotionStatus, setPromotionStatus]     = useState('active');
  const [expiresAt, setExpiresAt]                 = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getWalletBalance(user.id)
      .then(setWalletBalance)
      .catch(() => setWalletBalance(0))
      .finally(() => setLoading(false));
  }, [user]);

  const insufficient    = walletBalance < amount;
  const balanceAfter    = walletBalance - amount;
  const typeLabel       = TYPE_LABEL[promotionType] ?? promotionType;
  const duration        = PLAN_DURATION_LABELS[planDuration] ?? planDuration;
  const isPending       = promotionStatus === 'pending';

  const handleSubscribePress = () => {
    if (insufficient) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPay = async () => {
    if (!user) return;
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
      setPromotionStatus(promotion.status);
      setExpiresAt(promotion.expires_at ?? null);
      setShowConfirmModal(false);
      setProcessing(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      setProcessing(false);
      setShowConfirmModal(false);
      const message =
        err?.message === 'INSUFFICIENT_BALANCE'
          ? 'Your wallet balance is too low. Please recharge and try again.'
          : err?.message === 'ALREADY_ACTIVE'
          ? 'You already have an active promotion for this ad. Wait for it to expire before renewing.'
          : err?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Payment Failed', message);
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigation.navigate('Subscriptions');
  };

  const formatExpiry = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

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
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Wallet balance */}
        <View style={styles.walletBar}>
          <Wallet size={16} color={GRAY} />
          <Text style={styles.walletText}>
            Wallet balance:{' '}
            <Text style={styles.walletValue}>₦{walletBalance.toLocaleString()}</Text>
          </Text>
        </View>

        {/* Order summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Promotion</Text>
            <Text style={styles.summaryValue}>{typeLabel}</Text>
          </View>

          {bundleName && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bundle</Text>
              <Text style={styles.summaryValue}>{bundleName.replace(/_/g, ' ')}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ad</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{productTitle}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={[styles.summaryValue, { fontWeight: '700', fontSize: 16 }]}>
              ₦{amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentCardTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            <View style={styles.walletIcon}>
              <Wallet size={20} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethod}>Wallet</Text>
              <Text style={styles.paymentBalance}>Balance: ₦{walletBalance.toLocaleString()}</Text>
            </View>
            <CheckCircle2 size={20} color={GREEN} />
          </View>
        </View>

        {/* Insufficient funds warning */}
        {insufficient && (
          <View style={styles.warningCard}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.warningText}>
              Insufficient balance. You need ₦{(amount - walletBalance).toLocaleString()} more to proceed.
            </Text>
          </View>
        )}

        {/* Info for carousel */}
        {promotionType === 'carousel' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              ⏳ Carousel submissions are reviewed by our team within 24 hours before going live.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {insufficient ? (
          <>
            <TouchableOpacity
              style={styles.rechargeBtn}
              onPress={() => navigation.navigate('WalletRecharge')}
            >
              <Text style={styles.rechargeBtnText}>Recharge Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Choose Another Plan</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribePress}>
            <Text style={styles.subscribeBtnText}>Subscribe — ₦{amount.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── STEP 1: Confirmation Modal ── */}
      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalSubtitle}>
              You are about to subscribe to{' '}
              <Text style={{ fontWeight: '700', color: '#111827' }}>{typeLabel}</Text>
            </Text>

            {/* Transaction breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Ad</Text>
                <Text style={styles.breakdownValue} numberOfLines={1}>{productTitle}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Duration</Text>
                <Text style={styles.breakdownValue}>{duration}</Text>
              </View>
              <View style={[styles.breakdownRow, { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
                <Text style={styles.breakdownLabel}>Current Balance</Text>
                <Text style={styles.breakdownValue}>₦{walletBalance.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Amount</Text>
                <Text style={[styles.breakdownValue, { color: '#DC2626' }]}>
                  - ₦{amount.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.breakdownRow, { marginTop: 4 }]}>
                <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#111827' }]}>Balance After</Text>
                <Text style={[styles.breakdownValue, { fontWeight: '700', color: GREEN }]}>
                  ₦{balanceAfter.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.modalWarning}>
              ⚠️ This amount will be deducted from your wallet immediately.
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, processing && { opacity: 0.6 }]}
              onPress={handleConfirmPay}
              disabled={processing}
            >
              {processing
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>Confirm & Pay ₦{amount.toLocaleString()}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowConfirmModal(false)}
              disabled={processing}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── STEP 2: Success Modal ── */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.iconWrap, isPending ? styles.iconAmber : styles.iconGreen]}>
              {isPending
                ? <Clock size={40} color="#D97706" />
                : <CheckCircle2 size={40} color={GREEN} />
              }
            </View>

            <Text style={styles.modalTitle}>
              {isPending ? 'Submitted for Review!' : "You're Subscribed! 🎉"}
            </Text>

            <Text style={styles.modalSubtitle}>
              {isPending
                ? `Your ${typeLabel} submission is being reviewed. We'll activate it within 24 hours.`
                : `Your ${typeLabel} promotion is now live.`}
            </Text>

            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Promotion</Text>
                <Text style={styles.breakdownValue}>{typeLabel}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Duration</Text>
                <Text style={styles.breakdownValue}>{duration}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Amount Paid</Text>
                <Text style={styles.breakdownValue}>₦{amount.toLocaleString()}</Text>
              </View>
              {expiresAt && !isPending && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Expires</Text>
                  <Text style={styles.breakdownValue}>{formatExpiry(expiresAt)}</Text>
                </View>
              )}
            </View>

            {/* Auto renew */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Auto renew {autoRenew ? 'ON' : 'OFF'}</Text>
                <Text style={styles.toggleSub}>Renews automatically from your wallet upon expiry.</Text>
              </View>
              <Switch
                value={autoRenew}
                onValueChange={setAutoRenew}
                trackColor={{ false: '#E5E7EB', true: GREEN }}
              />
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F9FAFB' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:           { padding: 16, gap: 12 },
  walletBar:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  walletText:       { fontSize: 14, color: GRAY },
  walletValue:      { fontWeight: '700', color: '#111827' },
  summaryCard:      { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  summaryTitle:     { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel:     { fontSize: 14, color: GRAY },
  summaryValue:     { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right', textTransform: 'capitalize' },
  divider:          { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  paymentCard:      { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  paymentCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  paymentRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon:       { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  paymentMethod:    { fontSize: 14, fontWeight: '600', color: '#111827' },
  paymentBalance:   { fontSize: 13, color: GRAY, marginTop: 2 },
  warningCard:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA' },
  warningText:      { fontSize: 13, color: '#DC2626', flex: 1, lineHeight: 18 },
  infoCard:         { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  infoText:         { fontSize: 13, color: '#92400E', lineHeight: 19 },
  footer:           { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 10 },
  subscribeBtn:     { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  subscribeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  rechargeBtn:      { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  rechargeBtnText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelBtn:        { height: 48, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText:    { color: GRAY, fontSize: 15, fontWeight: '600' },
  // Modals
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  modalTitle:       { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' },
  modalSubtitle:    { fontSize: 14, color: GRAY, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  breakdownCard:    { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 16 },
  breakdownRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel:   { fontSize: 13, color: GRAY },
  breakdownValue:   { fontSize: 13, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  modalWarning:     { fontSize: 13, color: '#D97706', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  confirmBtn:       { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  confirmBtnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalCancelBtn:   { height: 48, justifyContent: 'center', alignItems: 'center' },
  modalCancelText:  { color: GRAY, fontSize: 15, fontWeight: '600' },
  iconWrap:         { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  iconGreen:        { backgroundColor: '#D1FAE5' },
  iconAmber:        { backgroundColor: '#FEF3C7' },
  toggleRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  toggleLeft:       { flex: 1, marginRight: 16 },
  toggleTitle:      { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  toggleSub:        { fontSize: 13, color: GRAY, lineHeight: 18 },
  doneBtn:          { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  doneBtnText:      { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});