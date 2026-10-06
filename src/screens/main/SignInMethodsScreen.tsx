// src/screens/main/SignInMethodsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const SignInMethodsScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  const isGoogle = user?.app_metadata?.provider === 'google' ||
    user?.identities?.some((i: any) => i.provider === 'google');
  const isEmail  = !isGoogle;

  const MethodItem = ({ icon, label, value, connected }: any) => (
    <View style={styles.item}>
      <View style={styles.leftContent}>
        <View style={[styles.iconBox, connected && styles.iconBoxActive]}>
          {icon}
        </View>
        <View>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      {connected && (
        <View style={styles.badge}>
          <CheckCircle2 size={14} color={GREEN} />
          <Text style={styles.badgeText}>Connected</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign-in Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <MethodItem
            icon={<FontAwesome name="google" size={22} color={isGoogle ? '#DB4437' : '#9CA3AF'} />}
            label="Google"
            value={isGoogle ? user?.email ?? '' : 'Not connected'}
            connected={isGoogle}
          />
          <MethodItem
            icon={<Mail size={22} color={isEmail ? GREEN : '#9CA3AF'} />}
            label="Email and Password"
            value={isEmail ? user?.email ?? '' : 'Not connected'}
            connected={isEmail}
          />
        </View>

        <Text style={styles.note}>
          To add or remove a sign-in method, please contact us via Help & Support.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: '#FFFFFF' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  section:       { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  item:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  leftContent:   { flexDirection: 'row', alignItems: 'center' },
  iconBox:       { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxActive: { backgroundColor: '#F0FDF4' },
  title:         { fontSize: 16, fontWeight: '500', color: '#111827' },
  value:         { fontSize: 13, color: GRAY, marginTop: 2 },
  badge:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontSize: 12, fontWeight: '600', color: GREEN },
  note:          { fontSize: 13, color: GRAY, paddingHorizontal: 20, paddingTop: 20, lineHeight: 20 },
});