// src/screens/auth/ConfirmationCodeScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { CustomTextInput, PrimaryButton } from '../../components/auth';
import { verifyPhoneOTP, sendPhoneOTP } from '../../services/termiiAuth';

type ConfirmationCodeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ConfirmationCode'>;
  route: RouteProp<RootStackParamList, 'ConfirmationCode'>;
};

export const ConfirmationCodeScreen: React.FC<ConfirmationCodeScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { phoneNumber } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPhoneOTP(phoneNumber, code);
      
      if (result.success) {
        // Navigate to password reset screen
        navigation.navigate('UpdatePassword', { phoneNumber });
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#111827" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Confirmation code</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Enter the 4-digit code that we sent to your phone number so we can 
            verify your identity, and you can continue to reset your password
          </Text>

          {/* Code Input - TODO: Create 4-box component */}
          <View style={styles.codeContainer}>
            <CustomTextInput
              label=""
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="0000"
              maxLength={4}
              autoCorrect={false}
            />
          </View>

          {/* Resend Link */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>I didn't receive a code </Text>
            <TouchableOpacity 
              onPress={handleResendCode} 
              disabled={resending}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                RESEND
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <PrimaryButton
            title="Continue to password reset"
            onPress={handleVerify}
            loading={loading}
            disabled={code.length !== 4}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0D0F11',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5768',
    marginBottom: 32,
    lineHeight: 24,
  },
  codeContainer: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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