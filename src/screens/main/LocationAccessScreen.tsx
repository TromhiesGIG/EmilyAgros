// src/screens/main/LocationAccessScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

const GREEN = '#008102';
const GRAY  = '#6B7280';
const RED   = '#EF4444';

export const LocationAccessScreen = ({ navigation }: any) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => { checkPermission(); }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setEnabled(status === 'granted');
  };

  const handleEnable = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setEnabled(true);
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location access</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Map pin illustration */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <MapPin size={56} color={RED} />
          </View>
        </View>

        <Text style={styles.desc}>
          We use your location to show nearby listings and improve recommendations.
        </Text>

        {/* Status row */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Location Access</Text>
          <View style={[styles.statusBadge, enabled ? styles.statusBadgeOn : styles.statusBadgeOff]}>
            <View style={[styles.statusDot, { backgroundColor: enabled ? GREEN : RED }]} />
            <Text style={[styles.statusText, { color: enabled ? GREEN : RED }]}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Permissions card */}
        <TouchableOpacity
          style={styles.permCard}
          onPress={() => navigation.navigate('Permissions')}
          activeOpacity={0.8}
        >
          <Text style={styles.permCardTitle}>Permissions</Text>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.permHint}>
          Look for an option that looks like this in the app's info, tap it then toggle on 'Location'
        </Text>
      </View>

      {/* Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.enableBtn} onPress={handleEnable}>
          <Text style={styles.enableBtnText}>Enable in device settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#FFFFFF' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: '#111827' },
  content:         { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  iconWrap:        { alignItems: 'center', marginBottom: 24 },
  iconCircle:      { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  desc:            { fontSize: 15, color: GRAY, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  statusRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statusLabel:     { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusBadgeOn:   { backgroundColor: '#DCFCE7' },
  statusBadgeOff:  { backgroundColor: '#FEE2E2' },
  statusDot:       { width: 8, height: 8, borderRadius: 4 },
  statusText:      { fontSize: 13, fontWeight: '600' },
  permCard:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 8 },
  permCardTitle:   { fontSize: 15, fontWeight: '600', color: '#111827' },
  permHint:        { fontSize: 13, color: GRAY, textAlign: 'center', lineHeight: 20 },
  footer:          { padding: 24 },
  enableBtn:       { height: 56, backgroundColor: '#008102', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  enableBtnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});