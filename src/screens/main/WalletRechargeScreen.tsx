import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { ArrowLeft} from 'lucide-react-native';
import PayWithFlutterwave from 'flutterwave-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useSyncData } from '../../hooks/useSyncData';

export const WalletRechargeScreen = ({ navigation }: any) => {
  console.log('🔵 1. WalletRechargeScreen component rendering');
  
  const { user } = useAuth();
  const { refresh } = useSyncData();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTxRef, setCurrentTxRef] = useState('');

  console.log('🔵 2. State values:', { amount, loading, currentTxRef });

  const generateTransactionRef = () => `FLW-${Date.now()}-${user?.id?.slice(0, 5)}`;

  const handlePaymentSuccess = async (data: any) => {
    console.log('🟢 handlePaymentSuccess called with:', data);
    setLoading(true);
    
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'Successful', 
        flw_id: data.transaction_id.toString() 
      })
      .eq('tx_ref', data.tx_ref);

    if (error) {
      console.error("❌ Ledger Update Error:", error);
      Alert.alert("Sync Issue", "Payment was successful but balance update failed. Please contact support.");
    } else {
      console.log('✅ Payment success handler completed');
      await refresh();
      Alert.alert("Success", "Wallet recharged successfully!", [
        { text: "View Wallet", onPress: () => navigation.goBack() }
      ]);
    }
    setLoading(false);
  };

  const createPendingTransaction = async (txRef: string) => {
    console.log('🟡 createPendingTransaction called with txRef:', txRef);
    if (!user) return false;

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      type: 'recharge',
      status: 'Pending',
      method: 'Flutterwave',
      tx_ref: txRef
    });

    if (error) {
      console.error("❌ Supabase Insertion Error:", error.message);
      console.error("❌ Error Code:", error.code);
      return false;
    }

    console.log('✅ Transaction created successfully');
    return true;
  };

  const handleInitiatePayment = async () => {
    console.log('🟡 handleInitiatePayment called');
    console.log('🟡 Current state - amount:', amount, 'loading:', loading);
    
    if (!amount || loading) {
      console.log('⚠️ Returning early - validation failed');
      return;
    }
    
    console.log('🟡 Setting loading to true...');
    setLoading(true);
    
    const txRef = generateTransactionRef();
    console.log('🟡 Generated txRef:', txRef);
    
    const success = await createPendingTransaction(txRef);
    console.log('🟡 Transaction creation result:', success);
    
    if (success) {
      console.log('🟡 Setting currentTxRef to:', txRef);
      setCurrentTxRef(txRef);
    } else {
      console.log('❌ Transaction creation failed');
      Alert.alert("Error", "Could not initialize transaction.");
      setLoading(false);
    }
  };

  console.log('🔵 3. About to render JSX - currentTxRef:', currentTxRef);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharge Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount to Recharge (₦)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>₦</Text>
            <TextInput 
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 5000"
              keyboardType="numeric"
            />
          </View>
        </View>

        {currentTxRef ? (
          (console.log('🔵 4. Rendering PayWithFlutterwave'),
          <PayWithFlutterwave
            onRedirect={(data) => {
              console.log('🟣 onRedirect called with data:', data);
              console.log('🟣 Resetting currentTxRef');
              setCurrentTxRef('');
              
              if (data.status === 'successful') {
                console.log('🟣 Payment successful, calling handlePaymentSuccess');
                handlePaymentSuccess(data);
              } else {
                console.log('🟣 Payment not successful, status:', data.status);
                Alert.alert("Cancelled", "Payment was not completed.");
                setLoading(false);
              }
            }}
            options={{
              tx_ref: currentTxRef,
              authorization: process.env.EXPO_PUBLIC_FLW_PUBLIC_KEY || '',
              amount: parseFloat(amount || '0'),
              currency: 'NGN',
              customer: {
                email: user?.email || '',
                name: user?.user_metadata?.full_name || 'Agro Member',
                phonenumber: user?.user_metadata?.phone_number || ''
              },
              customizations: {
                title: 'EmilyAgros Wallet',
                description: 'Recharge your in-app wallet',
                logo: 'https://your-logo-url.com/logo.png',
              },
            }}
          />)
        ) : (
          <>
          {console.log('🔵 5. Rendering custom Pay Now button')}
          <TouchableOpacity 
            style={[styles.payBtn, (!amount || loading) && styles.disabledBtn]} 
            onPress={() => {
              console.log('🔴 Pay Now button pressed');
              handleInitiatePayment();
            }}
            disabled={!amount || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payBtnText}>Pay Now</Text>
            )}
          </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { padding: 20 },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 60 },
  currencyPrefix: { fontSize: 20, fontWeight: '700', color: '#111827', marginRight: 8 },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: '#111827' },
  payBtn: { backgroundColor: '#008102', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#A3E635' }
});