// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { CustomTextInput, PrimaryButton } from '../../components/auth';
import { authService } from '../../services/auth';
import { sendPhoneOTP, formatNigerianPhone } from '../../services/termiiAuth';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmail = (input: string): boolean => input.includes('@');
  const isPhone = (input: string): boolean => {
    const digits = input.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  };

  const handleSendReset = async () => {
    if (!emailOrPhone) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }

    setLoading(true);

    try {
      if (isEmail(emailOrPhone)) {
        // Send password reset email via Supabase
        const { error } = await authService.resetPassword(emailOrPhone);
        
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          navigation.navigate('ResetLinkSent', { email: emailOrPhone });
        }
      } else if (isPhone(emailOrPhone)) {
        // Send OTP to phone
        const formattedPhone = formatNigerianPhone(emailOrPhone);
        const result = await sendPhoneOTP(formattedPhone);
        
        if (result.success) {
          navigation.navigate('ConfirmationCode', { 
            phoneNumber: formattedPhone 
          });
        } else {
          Alert.alert('Error', result.error || 'Failed to send code');
        }
      } else {
        Alert.alert('Error', 'Please enter a valid email or phone number');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isPhone(emailOrPhone) ? 'Send confirmation code' : 'Send reset link';

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
          <Text style={styles.title}>Forgot password?</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Please enter the email address or phone number you use to log in, 
            and we will send you a password reset link or confirmation code.
          </Text>

          {/* Email or Phone Input */}
          <CustomTextInput
            label="Email or phone"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="name@mail.com  or  08123456789"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Send Reset Button */}
          <PrimaryButton
            title={buttonText}
            onPress={handleSendReset}
            loading={loading}
            disabled={!emailOrPhone}
          />

          {/* Terms Footer */}
          <View style={styles.termsFooter}>
            <Text style={styles.termsText}>By continuing you agree to our </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://emilyagros.com')} activeOpacity={0.7}>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://emilyagros.com')} activeOpacity={0.7}>
              <Text style={styles.termsLink}>Privacy Policy.</Text>
            </TouchableOpacity>
          </View>
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
  termsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 100,
  },
  termsText: {
    fontSize: 12,
    color: '#0D0F11',
    fontWeight: '400',
  },
  termsLink: {
    fontSize: 12,
    color: '#008102',
    fontWeight: '400',
  },
});