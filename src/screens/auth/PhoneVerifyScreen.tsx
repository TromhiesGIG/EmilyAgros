// src/screens/auth/PhoneVerifyScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { CustomTextInput, PrimaryButton } from '../../components/auth';
import { verifyPhoneOTP, sendPhoneOTP } from '../../services/termiiAuth';

type PhoneVerifyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PhoneVerify'>;
  route: RouteProp<RootStackParamList, 'PhoneVerify'>;
};

export const PhoneVerifyScreen: React.FC<PhoneVerifyScreenProps> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyPhoneOTP(phoneNumber, code);

      if (result.success) {
        // AuthProvider will automatically redirect to MainApp
        // No need to navigate manually
      } else {
        Alert.alert('Error', result.error || 'Invalid code');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      const result = await sendPhoneOTP(phoneNumber);

      if (result.success) {
        Alert.alert('Success', 'Code resent to your phone');
      } else {
        Alert.alert('Error', result.error || 'Failed to resend code');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Resend OTP error:', error);
    } finally {
      setResending(false);
    }
  };

  // Mask phone number for display (show first 3 and last 3 digits)
  const maskedPhone = phoneNumber.replace(/(\+234)(\d{3})(\d{4})(\d{3})/, '$1$2****$4');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to {maskedPhone}
      </Text>

      <CustomTextInput
        label="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        placeholder="000000"
        autoCorrect={false}
      />

      <PrimaryButton
        title="Verify"
        onPress={handleVerify}
        loading={loading}
        disabled={code.length !== 6}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <TouchableOpacity 
          onPress={handleResendCode} 
          disabled={resending}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
            {resending ? 'Sending...' : 'Resend'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    color: '#008102',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },
});