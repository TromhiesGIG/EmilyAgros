// src/screens/main/DeleteAccountScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../services/supabase';

const RED  = '#EF4444';
const GRAY = '#6B7280';

export const DeleteAccountScreen = ({ navigation }: any) => {
  const { user, signOut }       = useAuth();
  const [input, setInput]       = useState('');
  const [deleting, setDeleting] = useState(false);

  const isValid = input === 'DELETE';

  const handleDelete = async () => {
    if (!isValid || !user) return;
    setDeleting(true);
    try {
      await Promise.all([
        supabase.from('promotions').delete().eq('seller_id', user.id),
        supabase.from('products').delete().eq('user_id', user.id),
        supabase.from('promotion_waitlist').delete().eq('seller_id', user.id),
        supabase.from('bundle_credits').delete().eq('seller_id', user.id),
        supabase.from('saved_ads').delete().eq('user_id', user.id),
        supabase.from('saved_searches').delete().eq('user_id', user.id),
        supabase.from('follows').delete().eq('follower_id', user.id),
        supabase.from('follows').delete().eq('following_id', user.id),
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('search_history').delete().eq('user_id', user.id),
        supabase.from('messages').delete().eq('sender_id', user.id),
      ]);
      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
    } catch (e) {
      setDeleting(false);
      Alert.alert('Error', 'Could not delete account. Please contact support.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete my account</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Trash icon */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Trash2 size={48} color="#FFFFFF" />
            </View>
          </View>

          {/* Warning card */}
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>This action is permanent</Text>
            <Text style={styles.warningDesc}>
              Deleting your account will permanently remove:
            </Text>
            {['Your Ads', 'Wallet balance', 'Messages & saved items'].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Type DELETE */}
          <Text style={styles.inputLabel}>Type 'DELETE'</Text>
          <TextInput
            style={[styles.input, isValid && styles.inputValid]}
            value={input}
            onChangeText={setInput}
            placeholder="DELETE"
            placeholderTextColor="#D1D5DB"
            autoCapitalize="characters"
          />

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.deleteBtn, !isValid && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={!isValid || deleting}
          >
            {deleting
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={[styles.deleteBtnText, !isValid && styles.deleteBtnTextDisabled]}>
                  Delete my account permanently
                </Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: '#FFFFFF' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:               { padding: 24 },
  iconWrap:             { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  iconCircle:           { width: 100, height: 100, borderRadius: 50, backgroundColor: RED, justifyContent: 'center', alignItems: 'center' },
  warningCard:          { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 20, marginBottom: 28 },
  warningTitle:         { fontSize: 16, fontWeight: '700', color: RED, marginBottom: 8 },
  warningDesc:          { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 20 },
  bulletRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bullet:               { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B7280', marginRight: 12 },
  bulletText:           { fontSize: 14, color: '#374151' },
  inputLabel:           { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  input:                { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', marginBottom: 24 },
  inputValid:           { borderColor: RED },
  deleteBtn:            { height: 56, backgroundColor: RED, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  deleteBtnDisabled:    { backgroundColor: '#E5E7EB' },
  deleteBtnText:        { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteBtnTextDisabled:{ color: '#9CA3AF' },
});