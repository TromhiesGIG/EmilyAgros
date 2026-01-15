// src/screens/main/EmailAddressScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react-native';

export const EmailAddressScreen = ({ navigation }: any) => {
  const [currentEmail] = useState('bambodire@gmail.com');
  const [newEmail, setNewEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const triggerToast = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  };

  const handleSendLink = () => {
    if (newEmail.includes('@')) {
      // Logic for Supabase auth.updateUser({email: newEmail}) would go here
      triggerToast();
      setNewEmail('');
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
          <Text style={styles.headerTitle}>Email Address</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.container}>
          {/* Current Email Card */}
          <View style={styles.currentEmailCard}>
            <View>
              <Text style={styles.cardLabel}>Current email</Text>
              <Text style={styles.cardEmail}>{currentEmail}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          {/* Update Email Form */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>New email address</Text>
            <TextInput 
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email address"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.hintText}>
              We'll send a verification code to this new email.
            </Text>

            <TouchableOpacity 
              style={[styles.button, !newEmail && styles.buttonDisabled]}
              onPress={handleSendLink}
              disabled={!newEmail}
            >
              <Text style={[styles.buttonText, !newEmail && styles.buttonTextDisabled]}>
                Send verification link
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Success Toast - Aligned with your design "Email address updated" */}
        {showToast && (
          <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
            <View style={styles.toastContent}>
              <View>
                <Text style={styles.toastTitle}>Success!</Text>
                <Text style={styles.toastMessage}>New email address updated!</Text>
              </View>
              <TouchableOpacity onPress={() => setShowToast(false)}>
                <X size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
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
  currentEmailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardEmail: { fontSize: 14, color: '#4B5563' },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  form: { marginTop: 10 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 8 },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  hintText: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  button: {
    height: 56,
    backgroundColor: '#008102',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#E5E7EB' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  buttonTextDisabled: { color: '#9CA3AF' },
  // Toast Styles
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  toastContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toastTitle: { fontSize: 16, fontWeight: '700', color: '#008102' },
  toastMessage: { fontSize: 14, color: '#111827', marginTop: 4 },
});