// src/screens/main/LocationAccessScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Linking } from 'react-native';
import { ArrowLeft, MapPin } from 'lucide-react-native';

export const LocationAccessScreen = ({ navigation }: any) => {
  // In a real app, you would use a library like 'react-native-permissions' to detect this
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const handleOpenSettings = () => {
    // This opens the app's specific settings in the OS
    Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location access</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
             {/*  */}
             <MapPin size={80} color="#008102" strokeWidth={1} />
          </View>

          <Text style={styles.description}>
            We use your location to show nearby listings and improve recommendations.
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Location Access</Text>
            <View style={[styles.badge, isLocationEnabled ? styles.badgeEnabled : styles.badgeDisabled]}>
              <View style={[styles.dot, { backgroundColor: isLocationEnabled ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.badgeText, { color: isLocationEnabled ? '#059669' : '#DC2626' }]}>
                {isLocationEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleOpenSettings}>
          <Text style={styles.buttonText}>Enable in device settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  content: { alignItems: 'center', marginTop: 40 },
  imageContainer: { marginBottom: 32 },
  description: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  statusLabel: { fontSize: 16, fontWeight: '500', color: '#111827' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeEnabled: { backgroundColor: '#D1FAE5' },
  badgeDisabled: { backgroundColor: '#FEE2E2' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  button: { height: 56, backgroundColor: '#008102', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});