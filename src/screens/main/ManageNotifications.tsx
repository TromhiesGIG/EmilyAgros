// src/screens/main/ManageNotifications.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export const ManageNotifications = ({ navigation }: any) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  const NotificationRow = ({ title, subtitle, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#008102' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <NotificationRow 
          title="Push Notifications"
          subtitle="Messages, Ad updates, Promotions, System alerts"
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <NotificationRow 
          title="Email Notifications"
          subtitle="Messages, Ad updates, Promotions, System alerts"
          value={emailEnabled}
          onValueChange={setEmailEnabled}
        />
        <NotificationRow 
          title="In-app Notifications"
          subtitle="Messages, Ad updates, Promotions, System alerts"
          value={inAppEnabled}
          onValueChange={setInAppEnabled}
        />
      </View>
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
  container: { flex: 1, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  textContainer: { flex: 1, marginRight: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});