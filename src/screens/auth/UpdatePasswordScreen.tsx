// src/screens/auth/UpdatePasswordScreen.tsx
import React, { useState, useEffect } from 'react';
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
import { PasswordInput, PrimaryButton } from '../../components/auth';
import { authService } from '../../services/auth';
import { supabase } from '../../services/supabase';

type UpdatePasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UpdatePassword'>;
  route: RouteProp<RootStackParamList, 'UpdatePassword'>;
};

export const UpdatePasswordScreen: React.FC<UpdatePasswordScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { phoneNumber, access_token, refresh_token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);

  // Handle email reset: Set session from tokens
  useEffect(() => {
    const setSessionFromTokens = async () => {
      if (access_token && refresh_token && !sessionSet) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('Error setting session:', error);
            Alert.alert('Error', 'Invalid or expired reset link. Please request a new one.');
            navigation.navigate('ForgotPassword');
          } else {
            setSessionSet(true);
            console.log('Session set successfully for password reset');
          }
        } catch (error) {
          console.error('Session error:', error);
          Alert.alert('Error', 'Failed to verify reset link');
          navigation.navigate('ForgotPassword');
        }
      }
    };

    setSessionFromTokens();
  }, [access_token, refresh_token, sessionSet]);

  const handleSaveChanges = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (phoneNumber) {
        // Phone reset flow
        await authService.updatePasswordWithPhone(phoneNumber, newPassword);
      } else {
        // Email reset flow - user is already authenticated via session
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
      }
      
      Alert.alert(
        'Success', 
        'Password updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Sign out after password reset (best practice)
              authService.signOut();
              navigation.navigate('AuthWelcome');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Update your password</Text>

          {/* Subtitle - Only show for email reset */}
          {access_token && (
            <Text style={styles.subtitle}>
              Enter your new password below to complete the reset process.
            </Text>
          )}

          {/* New Password Input */}
          <PasswordInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          {/* Confirm Password Input */}
          <PasswordInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Save Changes Button */}
          <PrimaryButton
            title="Save changes"
            onPress={handleSaveChanges}
            loading={loading}
            disabled={!newPassword || !confirmPassword}
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
    marginBottom: 24,
    lineHeight: 24,
  },
});