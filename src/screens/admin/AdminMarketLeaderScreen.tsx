// src/screens/admin/AdminMarketLeaderScreen.tsx
// Admin manually activates Market Leader after WhatsApp negotiation

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

const DURATION_OPTIONS = [
  { label: '1 Month',   days: 30  },
  { label: '3 Months',  days: 90  },
  { label: '6 Months',  days: 180 },
  { label: '1 Year',    days: 365 },
];

export const AdminMarketLeaderScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [agreedAmount, setAgreedAmount]     = useState('59999');
  const [paymentMethod, setPaymentMethod]   = useState<'wallet' | 'external'>('wallet');
  const [processing, setProcessing]         = useState(false);
  const [searching, setSearching]           = useState(false);

  const searchSellers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, wallet_balance')
        .or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
        .limit(5);
      setSearchResults(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const selectSeller = async (seller: any) => {
    setSelectedSeller(seller);
    setSearchResults([]);
    setSearchQuery(seller.full_name);

    // Fetch seller's active ads
    const { data } = await supabase
      .from('products')
      .select('id, title, images')
      .eq('user_id', seller.id)
      .eq('status', 'Active')
      .limit(10);
    setSellerProducts(data ?? []);
  };

  const handleActivate = async () => {
    if (!selectedSeller) {
      Alert.alert('Missing Info', 'Please select a seller.');
      return;
    }
    if (!selectedProduct) {
      Alert.alert('Missing Info', 'Please select an ad to promote.');
      return;
    }

    const amount = parseFloat(agreedAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid agreed amount.');
      return;
    }

    Alert.alert(
      'Activate Market Leader',
      `Activate Market Leader for ${selectedSeller.full_name}?\n\nDuration: ${selectedDuration.label}\nAmount: ₦${amount.toLocaleString()}\nPayment: ${paymentMethod === 'wallet' ? 'Deduct from wallet' : 'Marked as externally paid'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            setProcessing(true);
            try {
              // Check wallet if deducting
              if (paymentMethod === 'wallet') {
                if (selectedSeller.wallet_balance < amount) {
                  Alert.alert(
                    'Insufficient Balance',
                    `Seller has ₦${selectedSeller.wallet_balance.toLocaleString()} but amount is ₦${amount.toLocaleString()}. Use external payment instead.`
                  );
                  setProcessing(false);
                  return;
                }
                // Deduct wallet
                await supabase
                  .from('profiles')
                  .update({ wallet_balance: selectedSeller.wallet_balance - amount })
                  .eq('id', selectedSeller.id);
              }

              const now = new Date();
              const expiresAt = new Date(now);
              expiresAt.setDate(expiresAt.getDate() + selectedDuration.days);

              // Create promotion
              const { data: promotion, error } = await supabase
                .from('promotions')
                .insert({
                  seller_id:      selectedSeller.id,
                  product_id:     selectedProduct.id,
                  promotion_type: 'bundle',
                  bundle_name:    'market_leader',
                  plan_duration:  '1_month',
                  status:         'active',
                  payment_method: paymentMethod === 'wallet' ? 'wallet' : 'flutterwave',
                  amount_paid:    amount,
                  starts_at:      now.toISOString(),
                  expires_at:     expiresAt.toISOString(),
                })
                .select()
                .single();

              if (error) throw error;

              // Assign all 3 carousel slots (slots 1, 2, 3 — all purposes)
              const { data: slots } = await supabase
                .from('carousel_slots')
                .select('id')
                .eq('is_available', true)
                .order('slot_number', { ascending: true })
                .limit(3);

              for (const slot of (slots ?? [])) {
                await supabase.from('carousel_slots').update({
                  slot_type:    'promotion',
                  promotion_id: promotion.id,
                  product_id:   selectedProduct.id,
                  seller_id:    selectedSeller.id,
                  is_available: false,
                  expires_at:   expiresAt.toISOString(),
                }).eq('id', slot.id);
              }

              Alert.alert(
                'Activated!',
                `Market Leader is now live for ${selectedSeller.full_name} until ${expiresAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
              );
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activate Market Leader</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 1: Find seller */}
        <Text style={styles.stepTitle}>Step 1: Find Seller</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone number"
            placeholderTextColor={GRAY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchSellers}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchSellers} disabled={searching}>
            {searching
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Search size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsBox}>
            {searchResults.map(seller => (
              <TouchableOpacity
                key={seller.id}
                style={styles.resultRow}
                onPress={() => selectSeller(seller)}
              >
                <Text style={styles.resultName}>{seller.full_name}</Text>
                <Text style={styles.resultSub}>{seller.phone_number} · ₦{Number(seller.wallet_balance).toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedSeller && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedLabel}>Selected Seller</Text>
            <Text style={styles.selectedName}>{selectedSeller.full_name}</Text>
            <Text style={styles.selectedSub}>Wallet: ₦{Number(selectedSeller.wallet_balance).toLocaleString()}</Text>
          </View>
        )}

        {/* Step 2: Select ad */}
        {sellerProducts.length > 0 && (
          <>
            <Text style={styles.stepTitle}>Step 2: Select Ad to Promote</Text>
            {sellerProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[styles.productRow, selectedProduct?.id === product.id && styles.productRowSelected]}
                onPress={() => setSelectedProduct(product)}
              >
                <Text style={[styles.productTitle, selectedProduct?.id === product.id && { color: GREEN }]}>
                  {product.title}
                </Text>
                {selectedProduct?.id === product.id && (
                  <Text style={styles.selectedTick}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Step 3: Duration */}
        <Text style={styles.stepTitle}>Step 3: Duration Agreed</Text>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.durationBtn, selectedDuration.label === opt.label && styles.durationBtnSelected]}
              onPress={() => setSelectedDuration(opt)}
            >
              <Text style={[styles.durationBtnText, selectedDuration.label === opt.label && { color: GREEN }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 4: Amount */}
        <Text style={styles.stepTitle}>Step 4: Amount Agreed (₦)</Text>
        <TextInput
          style={styles.amountInput}
          value={agreedAmount}
          onChangeText={setAgreedAmount}
          keyboardType="numeric"
          placeholder="59999"
          placeholderTextColor={GRAY}
        />

        {/* Step 5: Payment */}
        <Text style={styles.stepTitle}>Step 5: Payment Method</Text>
        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[styles.paymentBtn, paymentMethod === 'wallet' && styles.paymentBtnSelected]}
            onPress={() => setPaymentMethod('wallet')}
          >
            <Text style={[styles.paymentBtnText, paymentMethod === 'wallet' && { color: GREEN }]}>
              Deduct from Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentBtn, paymentMethod === 'external' && styles.paymentBtnSelected]}
            onPress={() => setPaymentMethod('external')}
          >
            <Text style={[styles.paymentBtnText, paymentMethod === 'external' && { color: GREEN }]}>
              Paid Externally
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.activateBtn, processing && { opacity: 0.6 }]}
          onPress={handleActivate}
          disabled={processing}
        >
          {processing
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.activateBtnText}>Activate Market Leader</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                  { flex: 1, backgroundColor: '#FFFFFF' },
  header:                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:           { fontSize: 17, fontWeight: '700', color: '#111827' },
  scroll:                { padding: 16 },
  stepTitle:             { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 20 },
  searchRow:             { flexDirection: 'row', gap: 8 },
  searchInput:           { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },
  searchBtn:             { width: 44, height: 44, backgroundColor: GREEN, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resultsBox:            { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  resultRow:             { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultName:            { fontSize: 14, fontWeight: '600', color: '#111827' },
  resultSub:             { fontSize: 12, color: GRAY, marginTop: 2 },
  selectedCard:          { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#D1FAE5', marginTop: 8 },
  selectedLabel:         { fontSize: 11, color: GRAY, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  selectedName:          { fontSize: 15, fontWeight: '700', color: '#111827' },
  selectedSub:           { fontSize: 13, color: GRAY, marginTop: 2 },
  productRow:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginBottom: 8 },
  productRowSelected:    { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  productTitle:          { fontSize: 14, fontWeight: '500', color: '#111827', flex: 1 },
  selectedTick:          { color: GREEN, fontWeight: '700', fontSize: 16 },
  durationRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationBtn:           { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
  durationBtnSelected:   { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  durationBtnText:       { fontSize: 14, fontWeight: '600', color: '#111827' },
  amountInput:           { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: '#111827' },
  paymentRow:            { flexDirection: 'row', gap: 10 },
  paymentBtn:            { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  paymentBtnSelected:    { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  paymentBtnText:        { fontSize: 14, fontWeight: '600', color: '#111827' },
  footer:                { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  activateBtn:           { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  activateBtnText:       { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});