import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const GREEN   = '#008102';
const GRAY    = '#6B7280';
const MIN_AMT = 1000;

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 15000, 20000];

export const WalletRechargeScreen = ({ navigation }: any) => {
  const [amount, setAmount]       = useState('');
  const [selected, setSelected]   = useState<number | null>(null);
  const [touched, setTouched]     = useState(false);

  const numericAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const isBelowMin    = touched && numericAmount > 0 && numericAmount < MIN_AMT;
  const isValid       = numericAmount >= MIN_AMT;

  const handleQuickAmount = (val: number) => {
    setSelected(val);
    setAmount(val.toLocaleString());
    setTouched(true);
  };

  const handleChangeText = (text: string) => {
    // Only allow digits
    const digits = text.replace(/[^0-9]/g, '');
    setSelected(null);
    setTouched(digits.length > 0);
    setAmount(digits ? parseInt(digits).toLocaleString() : '');
  };

  const handleConfirm = () => {
    if (!isValid) return;
    // TODO: integrate Flutterwave payment here
    // For now just go back
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet recharge</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount input card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={[
              styles.inputWrap,
              isBelowMin && styles.inputWrapError,
              isValid && styles.inputWrapValid,
            ]}>
              <Text style={styles.nairaSymbol}>₦</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={handleChangeText}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {isBelowMin && (
              <Text style={styles.errorText}>
                The minimum amount you can recharge is ₦1,000
              </Text>
            )}

            {/* Quick amount chips */}
            <View style={styles.chipsGrid}>
              {QUICK_AMOUNTS.map(val => {
                const isChipSelected = selected === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.chip, isChipSelected && styles.chipSelected]}
                    onPress={() => handleQuickAmount(val)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isChipSelected && styles.chipTextSelected]}>
                      #{val.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Confirm button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#F7F8F9' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:        { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:             { padding: 16 },
  card:               { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  inputLabel:         { fontSize: 14, color: GRAY, marginBottom: 8 },
  inputWrap:          { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 },
  inputWrapValid:     { borderColor: GREEN },
  inputWrapError:     { borderColor: '#DC2626' },
  nairaSymbol:        { fontSize: 24, fontWeight: '700', color: '#111827', marginRight: 4 },
  input:              { flex: 1, fontSize: 24, fontWeight: '700', color: '#111827' },
  errorText:          { fontSize: 12, color: '#DC2626', marginBottom: 12 },
  chipsGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chip:               { width: '30%', paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  chipSelected:       { backgroundColor: '#DCFCE7' },
  chipText:           { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTextSelected:   { color: GREEN },
  footer:             { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  confirmBtn:         { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#9CA3AF' },
  confirmBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});