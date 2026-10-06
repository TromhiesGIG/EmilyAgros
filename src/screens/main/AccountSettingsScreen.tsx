// src/screens/main/AccountSettingsScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, AtSign, Lock, LogOut, Trash2, ChevronRight, ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';
const RED   = '#EF4444';

export const AccountSettingsScreen = ({ navigation }: any) => {
  const { signOut } = useAuth();

  const SettingItem = ({ icon: Icon, title, onPress, iconBg, iconColor }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Icon size={22} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); }
          catch { Alert.alert('Error', 'Failed to log out. Please try again.'); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* Section 1 */}
        <View style={styles.section}>
          <SettingItem icon={User}   title="Personal Info"    iconBg={GREEN}   iconColor="#FFFFFF" onPress={() => navigation.navigate('PersonalInfo')} />
          <SettingItem icon={AtSign} title="Email address"    iconBg={GREEN}   iconColor="#FFFFFF" onPress={() => navigation.navigate('EmailAddress')} />
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <SettingItem icon={Lock} title="Change password" iconBg={GREEN} iconColor="#FFFFFF" onPress={() => navigation.navigate('ChangePassword')} />
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <SettingItem icon={LogOut} title="Log out"                       iconBg="#FEF2F2" iconColor={RED} onPress={handleLogout} />
          <SettingItem icon={Trash2} title="Delete my account permanently" iconBg="#FEF2F2" iconColor={RED} onPress={() => navigation.navigate('DeleteAccount')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#F3F4F6' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container:   { flex: 1, paddingTop: 8 },
  section:     { backgroundColor: '#FFFFFF', marginBottom: 8 },
  item:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  leftContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox:     { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  title:       { fontSize: 16, fontWeight: '500', color: '#111827' },
});