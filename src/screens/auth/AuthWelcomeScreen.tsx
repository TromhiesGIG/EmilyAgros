import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeOut, Layout, FadeIn } from 'react-native-reanimated';
import { RootStackParamList } from '../../../App';
import { 
  SocialAuthButton, 
  PrimaryButton, 
  DividerWithText, 
  CustomTextInput, 
  PasswordInput, 
  CustomCheckbox 
} from '../../components/auth';
import { signInWithGoogle, authService } from '../../services/auth';
import { sendPhoneOTP, formatNigerianPhone } from '../../services/termiiAuth';

type AuthWelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AuthWelcome'>;
};

export const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({ navigation }) => {
  const [isEmailSignIn, setIsEmailSignIn] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Reset to state 1 whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setIsEmailSignIn(false);
    }, [])
  );

  // Reset to state 1 whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setIsEmailSignIn(false);
    }, [])
  );

  const isEmail = (input: string): boolean => input.includes('@');
  const isPhone = (input: string): boolean => {
    const digits = input.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  };

  const handleSignIn = async () => {
    if (!emailOrPhone) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }
    setLoading(true);
    try {
      if (isEmail(emailOrPhone)) {
        if (!password) {
          Alert.alert('Error', 'Please enter your password');
          setLoading(false);
          return;
        }
        await authService.signIn({ email: emailOrPhone, password });
      } else if (isPhone(emailOrPhone)) {
        const formattedPhone = formatNigerianPhone(emailOrPhone);
        const result = await sendPhoneOTP(formattedPhone);
        if (result.success) {
          navigation.navigate('PhoneVerify', { phoneNumber: formattedPhone });
        } else {
          Alert.alert('Error', result.error || 'Failed to send OTP');
        }
      } else {
        Alert.alert('Error', 'Please enter a valid email or phone number');
      }
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
        const result = await signInWithGoogle();
        if (result.success) {
            navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
        } else {
            if (result.error !== 'Authentication cancelled') {
                Alert.alert('Error', result.error || 'Failed to sign in with Google');
            }
        }
    } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
    } finally {
        setGoogleLoading(false);
    }
  };
  
  const handleAppleAuth = () => Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
  const handleForgotPassword = () => console.log('Forgot password pressed');
  const handleCreateAccount = () => navigation.navigate('CreateAccountWelcome');
  
  const handleShowEmailSignIn = () => setIsEmailSignIn(true);
  const handleBack = () => setIsEmailSignIn(false);

  const needsPassword = isEmail(emailOrPhone);
  const buttonText = isPhone(emailOrPhone) ? 'Send Code' : 'Sign In';

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


        {!isEmailSignIn && (
          <Animated.View 
            style={styles.logoContainer} 
            layout={Layout.springify()}
            exiting={FadeOut.duration(300)}
          >
            <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain"/>
          </Animated.View>
        )}

        <Animated.View layout={Layout.springify().delay(100)}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
            {isEmailSignIn 
                ? 'Enter your email and password to access your account' 
                : 'Log In to access your account'
            }
            </Text>
        </Animated.View>
        
        {/* Email Form - Only shows when isEmailSignIn is true */}
        {isEmailSignIn && (
          <Animated.View layout={Layout.springify().delay(200)}>
            <CustomTextInput
                label="Email or phone"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder="email@example.com or 0801 234 5678"
            />
            {!isPhone(emailOrPhone) && (
                <Animated.View layout={Layout.springify()}>
                    <PasswordInput label="Password" value={password} onChangeText={setPassword} />
                    <View style={styles.optionsRow}>
                        <CustomCheckbox checked={keepLoggedIn} onPress={() => setKeepLoggedIn(!keepLoggedIn)} label="Keep me logged in"/>
                        <TouchableOpacity onPress={handleForgotPassword}><Text style={styles.forgotPassword}>Forgot Password?</Text></TouchableOpacity>
                    </View>
                </Animated.View>
            )}
            <PrimaryButton
                title={buttonText}
                onPress={handleSignIn}
                loading={loading}
                disabled={!emailOrPhone || (!isPhone(emailOrPhone) && !password)}
            />
          </Animated.View>
        )}

        {/* Persistent Social Buttons - Always on screen, animates position */}
        <Animated.View layout={Layout.springify().delay(200)} style={styles.socialContainer}>
          <SocialAuthButton provider="google" onPress={handleGoogleAuth} disabled={googleLoading} />
          <SocialAuthButton provider="apple" onPress={handleAppleAuth} />
        </Animated.View>

        {/* Persistent Divider - Always on screen, animates position */}
        <Animated.View layout={Layout.springify().delay(200)} style={styles.dividerContainer}>
          <DividerWithText />
        </Animated.View>

        {/* Email/Phone Button - Only shows when NOT in email form */}
        {!isEmailSignIn && (
          <Animated.View layout={Layout.springify().delay(250)}>
            <PrimaryButton title="Sign In with email or phone" onPress={handleShowEmailSignIn} />
          </Animated.View>
        )}

        {/* Persistent Footer - Always on screen, animates position */}
        <Animated.View style={styles.footer} layout={Layout.springify().delay(300)}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
            <Text style={styles.linkText}>Create one now</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Terms and Conditions Footer - Only in initial state */}
        {!isEmailSignIn && (
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
    backButtonContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 28,
        color: '#111827',
    },
    logoContainer: {
        alignItems: 'center',
        // marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    title: {
        fontSize: 30,
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
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    forgotPassword: {
        fontSize: 14,
        color: '#008102',
        fontWeight: '400',
        letterSpacing: -0.32,
        lineHeight: 18,
    },
    helpText: {
        fontSize: 14,
        color: '#4B5768',
        marginTop: -12,
        marginBottom: 24,
        lineHeight: 20,
    },
    dividerContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    socialContainer: {
        marginTop: 32,
        // marginBottom: 32,
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
        fontWeight: '400',
        letterSpacing: -0.32,
    },
});