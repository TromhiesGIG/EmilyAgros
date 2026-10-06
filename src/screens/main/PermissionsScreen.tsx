// src/screens/main/PermissionsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';

const GREEN = '#008102';
const RED   = '#EF4444';

export const PermissionsScreen = ({ navigation }: any) => {
  const [cameraPermission] = useCameraPermissions();
  const [perms, setPerms]  = useState({
    camera:        false,
    location:      false,
    storage:       false,
    notifications: false, // disabled until development build
  });

  useEffect(() => { checkAll(); }, [cameraPermission]);

  const checkAll = async () => {
    const loc = await Location.getForegroundPermissionsAsync();
    setPerms({
      camera:        cameraPermission?.granted ?? false,
      location:      loc.status === 'granted',
      storage:       false, // TODO: re-enable with development build
      notifications: false, // TODO: re-enable with development build
    });
  };

  const StatusBadge = ({ enabled }: { enabled: boolean }) => (
    <View style={[styles.badge, enabled ? styles.badgeOn : styles.badgeOff]}>
      <View style={[styles.dot, { backgroundColor: enabled ? GREEN : RED }]} />
      <Text style={[styles.badgeText, { color: enabled ? GREEN : RED }]}>
        {enabled ? 'Enabled' : 'Disabled'}
      </Text>
    </View>
  );

  const PermRow = ({ label, enabled }: { label: string; enabled: boolean }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <StatusBadge enabled={enabled} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <PermRow label="Camera"        enabled={perms.camera} />
        <PermRow label="Location"      enabled={perms.location} />
        <PermRow label="Storage"       enabled={perms.storage} />
        <PermRow label="Notifications" enabled={perms.notifications} />

        <Text style={styles.note}>
          Some features may not work properly without these permissions.
        </Text>

        <TouchableOpacity style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.settingsBtnText}>Manage in device settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#FFFFFF' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: '#111827' },
  content:         { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  row:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLabel:        { fontSize: 16, color: '#111827' },
  badge:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeOn:         { backgroundColor: '#DCFCE7' },
  badgeOff:        { backgroundColor: '#FEE2E2' },
  dot:             { width: 8, height: 8, borderRadius: 4 },
  badgeText:       { fontSize: 13, fontWeight: '600' },
  note:            { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 40, marginBottom: 20, lineHeight: 20 },
  settingsBtn:     { height: 56, backgroundColor: '#008102', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  settingsBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});