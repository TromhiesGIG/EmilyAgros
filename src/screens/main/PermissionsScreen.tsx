// src/screens/main/PermissionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export const PermissionsScreen = ({ navigation }: any) => {
  
  const PermissionItem = ({ title, isEnabled }: { title: string, isEnabled: boolean }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{title}</Text>
      <View style={[styles.badge, isEnabled ? styles.badgeEnabled : styles.badgeDisabled]}>
        <View style={[styles.dot, { backgroundColor: isEnabled ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.badgeText, { color: isEnabled ? '#059669' : '#DC2626' }]}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.list}>
          <PermissionItem title="Push Notifications" isEnabled={false} />
          <PermissionItem title="Email Notifications" isEnabled={true} />
          <PermissionItem title="In-app Notifications" isEnabled={false} />
          <PermissionItem title="In-app Notifications" isEnabled={true} />
        </View>

        <Text style={styles.footerHint}>
          Some features may not work properly without these permissions.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>Manage in device settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flexGrow: 1, padding: 20 },
  list: { marginBottom: 40 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#111827' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeEnabled: { backgroundColor: '#D1FAE5' },
  badgeDisabled: { backgroundColor: '#FEE2E2' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  footerHint: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40, lineHeight: 20 },
  button: { height: 56, backgroundColor: '#008102', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});