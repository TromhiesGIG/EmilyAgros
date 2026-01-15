// src/screens/main/ChangePasswordScreen.tsx
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
  ScrollView
} from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility states for the three fields
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormValid = currentPassword && newPassword && confirmPassword && (newPassword === confirmPassword);

  const handleUpdate = () => {
    // Implement Supabase auth.updateUser({ password: newPassword }) logic here
    console.log("Password update initiated");
    navigation.goBack();
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Current Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder="Enter current password"
              />
              <TouchableOpacity 
                onPress={() => setShowCurrent(!showCurrent)}
                style={styles.eyeIcon}
              >
                {showCurrent ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder="Enter new password"
              />
              <TouchableOpacity 
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeIcon}
              >
                {showNew ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm new password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholder="Confirm new password"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeIcon}
              >
                {showConfirm ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity 
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={!isFormValid}
          >
            <Text style={[styles.buttonText, !isFormValid && styles.buttonTextDisabled]}>
              Update password
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot current password?</Text>
          </TouchableOpacity>
        </ScrollView>
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
  container: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 8 },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: { paddingHorizontal: 16 },
  button: {
    height: 56,
    backgroundColor: '#008102',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonDisabled: { backgroundColor: '#E5E7EB' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  buttonTextDisabled: { color: '#9CA3AF' },
  forgotLink: { alignSelf: 'center' },
  forgotText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#008102', 
    textDecorationLine: 'underline' 
  },
});