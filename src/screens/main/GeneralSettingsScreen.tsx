// src/screens/main/GeneralSettingsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Switch, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, MessageSquare, Bell, MapPin,
  LayoutGrid, Info, Star, ChevronRight,
} from 'lucide-react-native';
import { rateUs } from '../../utils/rateUs';

const GREEN = '#008102';

export const GeneralSettingsScreen = ({ navigation }: any) => {
  const [allowMessaging, setAllowMessaging] = useState(true);
  const [allowFeedback, setAllowFeedback]   = useState(true);

  const SwitchRow = ({ icon: Icon, title, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={styles.leftContent}>
        <View style={styles.iconBox}>
          <Icon size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: GREEN }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const NavRow = ({ icon: Icon, title, onPress, darkIcon = false }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <View style={[styles.iconBox, darkIcon && styles.iconBoxDark]}>
          <Icon size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SwitchRow icon={MessageSquare} title="Allow users to message me" value={allowMessaging} onValueChange={setAllowMessaging} />
          <SwitchRow icon={MessageSquare} title="Allow feedback on my ads"  value={allowFeedback}  onValueChange={setAllowFeedback} />
          <NavRow    icon={Bell}          title="Manage notifications"      onPress={() => navigation.navigate('ManageNotifications')} />
        </View>

        <View style={styles.section}>
          <NavRow icon={MapPin}    title="Location access" onPress={() => navigation.navigate('LocationAccess')} />
          <NavRow icon={LayoutGrid} title="Permissions"    onPress={() => navigation.navigate('Permissions')} />
        </View>

        <View style={styles.section}>
          <NavRow icon={Info} title="About EmilyAgros" onPress={() => navigation.navigate('About')} darkIcon />
          <NavRow icon={Star} title="Rate us"          onPress={rateUs} darkIcon />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#F3F4F6' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container:   { flex: 1 },
  section:     { backgroundColor: '#FFFFFF', marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  leftContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox:     { width: 40, height: 40, borderRadius: 10, backgroundColor: '#008102', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxDark: { backgroundColor: '#374151' },
  title:       { fontSize: 16, fontWeight: '500', color: '#111827' },
});