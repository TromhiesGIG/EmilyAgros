// src/screens/auth/CreateAccountWelcomeScreen.tsx - UPDATED
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeOut, Layout } from 'react-native-reanimated';
import { RootStackParamList } from '../../../App';
import { 
  SocialAuthButton, 
  PrimaryButton, 
  DividerWithText,
  CustomTextInput,
  PasswordInput,
  CustomCheckbox 
} from '../../components/auth';
import { signInWithGoogle } from '../../services/auth';
import { sendPhoneOTP, formatNigerianPhone } from '../../services/termiiAuth';

type CreateAccountWelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAccountWelcome'>;
};

export const CreateAccountWelcomeScreen: React.FC<CreateAccountWelcomeScreenProps> = ({ navigation }) => {
  const [isFormActive, setIsFormActive] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isEmail = (input: string): boolean => input.includes('@');
  const isPhone = (input: string): boolean => {
    const digits = input.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      const result = await signInWithGoogle();
      
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        if (result.error !== 'Authentication cancelled') {
          Alert.alert('Error', result.error || 'Failed to sign in with Google');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Google auth error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleAuth = () => {
    Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
  };

  const handleEmailSignUp = () => {
    setIsFormActive(true);
  };

  const handleContinue = async () => {
    if (!emailOrPhone) {
      Alert.alert('Missing Information', 'Please enter your email or phone number');
      return;
    }

    setLoading(true);

    try {
      if (isEmail(emailOrPhone)) {
        // Email signup flow
        if (!password) {
          Alert.alert('Error', 'Please enter a password');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          Alert.alert('Invalid Password', 'Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        navigation.navigate('NameCollection', { 
          email: emailOrPhone, 
          password, 
          keepLoggedIn 
        });
      } else if (isPhone(emailOrPhone)) {
        // Phone signup flow
        const formattedPhone = formatNigerianPhone(emailOrPhone);
        const result = await sendPhoneOTP(formattedPhone);
        
        if (result.success) {
          navigation.navigate('PhoneVerify', { 
            phoneNumber: formattedPhone,
            isSignup: true  // This is signup, not sign in
          });
        } else {
          Alert.alert('Error', result.error || 'Failed to send OTP');
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

  const handleSignIn = () => {
    navigation.goBack();
  };

  const needsPassword = isEmail(emailOrPhone);
  const buttonText = isPhone(emailOrPhone) ? 'Send Code' : 'Continue';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo - Only shows in initial state */}
        {!isFormActive && (
          <Animated.View 
            style={styles.logoContainer} 
            layout={Layout.springify()}
            exiting={FadeOut.duration(300)}
          >
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {/* Title & Subtitle */}
        <Animated.View layout={Layout.springify().delay(100)}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            {isFormActive 
              ? 'Enter your email and set a password to create your account'
              : 'Create an account with us to continue your journey'
            }
          </Text>
        </Animated.View>

        {/* Form - Only shows when isFormActive is true */}
        {isFormActive && (
          <Animated.View layout={Layout.springify().delay(200)}>
            <CustomTextInput
              label="Email or phone"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="email@example.com or 0801 234 5678"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {isEmail(emailOrPhone) && (
              <Animated.View layout={Layout.springify()}>
                <PasswordInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                />
              </Animated.View>
            )}

            <PrimaryButton
              title={buttonText}
              onPress={handleContinue}
              loading={loading}
              disabled={!emailOrPhone || (isEmail(emailOrPhone) && !password)}
            />
          </Animated.View>
        )}

        {/* Persistent Social Buttons */}
        <Animated.View layout={Layout.springify().delay(200)} style={styles.socialContainer}>
          <SocialAuthButton 
            provider="google" 
            onPress={handleGoogleAuth}
            disabled={googleLoading}
          />
          <SocialAuthButton provider="apple" onPress={handleAppleAuth} />
        </Animated.View>

        {/* Persistent Divider */}
        <Animated.View layout={Layout.springify().delay(200)} style={styles.dividerContainer}>
          <DividerWithText />
        </Animated.View>

        {/* Email Sign Up Button - Only shows in initial state */}
        {!isFormActive && (
          <Animated.View layout={Layout.springify().delay(250)}>
            <PrimaryButton
              title="Create an account with email or phone"
              onPress={handleEmailSignUp}
            />
          </Animated.View>
        )}

        {/* Persistent Footer */}
        <Animated.View style={styles.footer} layout={Layout.springify().delay(300)}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Terms and Conditions Footer - Only in initial state */}
        {!isFormActive && (
          <Animated.View style={styles.termsFooter} layout={Layout.springify().delay(350)}>
            <Text style={styles.termsText}>By continuing you agree to our </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://emilyagros.com')} activeOpacity={0.7}>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://emilyagros.com')} activeOpacity={0.7}>
              <Text style={styles.termsLink}>Privacy Policy.</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0D0F11',
    marginBottom: 8,
    lineHeight: 38,
    letterSpacing: -0.32,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5768',
    marginBottom: 32,
    lineHeight: 20,
    letterSpacing: -0.32,
    fontWeight: '400',
  },
  socialContainer: {
    marginTop: 32,
  },
  dividerContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#0D0F11',
    letterSpacing: -0.32,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 16,
    color: '#008102',
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  termsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 100,
    lineHeight: 15,
  },
  termsText: {
    fontSize: 12,
    color: '#0D0F11',
    fontWeight: '400',
    letterSpacing: -0.32,
  },
  termsLink: {
    fontSize: 12,
    color: '#008102',
    fontWeight: '600',
  },
});