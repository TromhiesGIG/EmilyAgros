// src/screens/main/EmailAddressScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider'; // This is your live session provider

export const EmailAddressScreen = ({ navigation }: any) => {
  const { user } = useAuth(); // Access the real logged-in user
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // This ensures that if the user session updates, the UI reflects it immediately
  useEffect(() => {
    if (user?.email) {
      console.log("Syncing live email:", user.email);
    }
  }, [user]);

  const handleUpdateEmail = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to change your email.');
      return;
    }

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      Alert.alert('No Change', 'This is already your current email address.');
      return;
    }

    setLoading(true);

    // Securely trigger Supabase Auth email update
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    setLoading(false);

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      Alert.alert(
        'Check your inbox',
        `We've sent a confirmation link to ${newEmail}. Your email won't change until you verify it.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Email</Text>
          <View style={styles.readOnlyBox}>
            {/* THIS IS THE REAL AUTH EMAIL */}
            <Text style={styles.readOnlyText}>
              {user?.email || 'Loading email...'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.disabledBtn]} 
          onPress={handleUpdateEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Update Email</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ... Styles remain the same as the previous response ...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { padding: 20 },
  infoBox: { 
    backgroundColor: '#F9FAFB', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 32 
  },
  infoText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  readOnlyBox: { 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  readOnlyText: { color: '#9CA3AF', fontSize: 16 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    paddingHorizontal: 12 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 48, fontSize: 16, color: '#111827' },
  submitBtn: { 
    backgroundColor: '#008102', 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#A3E635' }
});