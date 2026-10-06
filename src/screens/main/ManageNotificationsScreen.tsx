// src/screens/main/ManageNotificationsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const GREEN = '#008102';
const GRAY  = '#6B7280';
const SUB   = 'Messages, Ad updates, Promotions, System alerts';

export const ManageNotificationsScreen = ({ navigation }: any) => {
  const [push, setPush]     = useState(false);
  const [email, setEmail]   = useState(false);
  const [inApp, setInApp]   = useState(true);

  const NotifRow = ({ title, subtitle, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: GREEN }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <NotifRow title="Push Notifications"  subtitle={SUB} value={push}  onValueChange={setPush} />
        <NotifRow title="Email Notifications" subtitle={SUB} value={email} onValueChange={setEmail} />
        <NotifRow title="In-app Notifications" subtitle={SUB} value={inApp} onValueChange={setInApp} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFFFFF' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:      { flex: 1 },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLeft:     { flex: 1, marginRight: 16 },
  rowTitle:    { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  rowSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
});