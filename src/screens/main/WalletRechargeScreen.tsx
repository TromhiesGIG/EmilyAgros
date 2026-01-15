// src/screens/main/WalletRechargeScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export const WalletRechargeScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('0');
  const quickAmounts = ['1,000', '2,000', '5,000', '10,000', '15,000', '20,000'];

  // Validation logic based on your "Wallet Recharge 2" design
  const numericAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const isError = numericAmount > 0 && numericAmount < 1000;
  const isValid = numericAmount >= 1000;

  const handleQuickSelect = (val: string) => {
    setAmount(val);
  };

  const handleConfirm = () => {
    if (isValid) {
      // Navigation to payment gateway or summary would go here
      console.log(`Processing recharge for: ₦${amount}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet recharge</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.container}>
          {/* Amount Input Card */}
          <View style={[styles.inputCard, isError && styles.inputCardError]}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.inputWrapper}>
              <Text style={[styles.currencyPrefix, isError && styles.errorText]}>₦</Text>
              <TextInput 
                style={[styles.input, isError && styles.errorText]}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9,]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isError ? '#EF4444' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Error Message */}
          {isError && (
            <Text style={styles.errorMessage}>
              The minimum amount you can recharge is ₦1000
            </Text>
          )}

          {/* Quick Select Grid */}
          <View style={styles.grid}>
            {quickAmounts.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[
                  styles.quickBtn, 
                  amount === item && styles.quickBtnSelected
                ]}
                onPress={() => handleQuickSelect(item)}
              >
                <Text style={[
                  styles.quickBtnText,
                  amount === item && styles.quickBtnTextSelected
                ]}>
                  ₦{item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />

          {/* Confirm Button */}
          <TouchableOpacity 
            style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!isValid}
          >
            <Text style={[styles.confirmBtnText, !isValid && styles.confirmBtnTextDisabled]}>
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flex: 1, padding: 20 },
  inputCard: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  inputCardError: { borderColor: '#EF4444' },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { fontSize: 32, fontWeight: '700', color: '#111827', marginRight: 8 },
  input: { flex: 1, fontSize: 32, fontWeight: '700', color: '#111827', padding: 0 },
  errorText: { color: '#EF4444' },
  errorMessage: { color: '#EF4444', fontSize: 13, marginBottom: 24, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  quickBtn: { 
    width: '31%', 
    height: 44, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  quickBtnSelected: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#008102' },
  quickBtnText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  quickBtnTextSelected: { color: '#166534', fontWeight: '700' },
  spacer: { flex: 1 },
  confirmBtn: {
    height: 56,
    backgroundColor: '#008102',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmBtnDisabled: { backgroundColor: '#A7D7A9' }, // Light green/grayed out per design
  confirmBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  confirmBtnTextDisabled: { color: '#FFFFFF' },
});