// src/screens/main/PlanManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useSyncData } from '../../hooks/useSyncData';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

export const PlanManagementScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { profileData, refresh, loading } = useSyncData();
  const [updating, setUpdating] = useState(false);

  // Sync local switch state with database state
  const [autoRenewal, setAutoRenewal] = useState(profileData?.auto_renewal ?? true);

  useEffect(() => {
    if (profileData) setAutoRenewal(profileData.auto_renewal ?? true);
  }, [profileData]);

  const toggleAutoRenewal = async (newValue: boolean) => {
    if (!user) return;
    setAutoRenewal(newValue); // Optimistic UI update
    
    const { error } = await supabase
      .from('profiles')
      .update({ auto_renewal: newValue })
      .eq('id', user.id);

    if (error) {
      Alert.alert("Error", "Could not update setting");
      setAutoRenewal(!newValue); // Rollback on error
    } else {
      refresh();
    }
  };

  const handleCancelSubscription = () => {
  Alert.alert(
    "Cancel Subscription",
    `Your ${profileData?.activePlan} plan will remain active until ${expiryDate}. After that, you'll be downgraded to the Free plan.`,
    [
      { text: "Keep Subscription", style: "cancel" },
      { 
        text: "Turn Off Auto-Renewal", 
        style: "destructive", 
        onPress: async () => {
          setUpdating(true);
          // ONLY turn off auto-renewal, DON'T change the plan
          const { error } = await supabase
            .from('profiles')
            .update({ auto_renewal: false }) // Remove active_plan_id change
            .eq('id', user?.id);
          
          if (!error) {
            await refresh();
            Alert.alert(
              "Auto-Renewal Disabled", 
              `Your ${profileData?.activePlan} remains active until ${expiryDate}. You won't be charged again.`
            );
          }
          setUpdating(false);
        } 
      }
    ]
  );
};
  // Format date for display
  const expiryDate = profileData?.subscription_expires_at 
    ? new Date(profileData.subscription_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Plan management</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#008102" />
        ) : (
          <>
            <View style={styles.planStatusCard}>
              <Text style={styles.planName}>{profileData?.activePlan || 'Free Plan'}</Text>
              <Text style={styles.planPrice}>
                {profileData?.activePlanId === 'free' ? '₦ 0' : 'Current Active Plan'} 
              </Text>
              
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: autoRenewal ? '#008102' : '#EF4444' }]}>
                  Auto renewal is {autoRenewal ? 'ON' : 'OFF'} .
                </Text>
                {profileData?.subscription_expires_at && (
                  <Text style={styles.expiryText}>Plan expires on {expiryDate}</Text>
                )}
              </View>
            </View>

            <View style={styles.toggleSection}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Auto renewal</Text>
                  <Text style={styles.toggleSubtitle}>Renews your subscription automatically from your wallet upon expiry.</Text>
                </View>
                <Switch 
                  value={autoRenewal} 
                  onValueChange={toggleAutoRenewal}
                  trackColor={{ false: '#E5E7EB', true: '#008102' }}
                />
              </View>
            </View>

            {profileData?.activePlanId !== 'free' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelSubscription} disabled={updating}>
                {updating ? <ActivityIndicator color="#EF4444" /> : <Text style={styles.cancelBtnText}>Cancel subscription</Text>}
              </TouchableOpacity>
            )}
          </>
        )}
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
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flex: 1, padding: 20 },
  planStatusCard: { marginBottom: 32 },
  planName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  planPrice: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12 },
  planPeriod: { fontSize: 16, fontWeight: '400', color: '#6B7280' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusLabel: { fontSize: 14, fontWeight: '700', marginRight: 8 },
  expiryText: { fontSize: 14, color: '#6B7280' },
  toggleSection: { 
    paddingVertical: 24, 
    borderTopWidth: 1, 
    borderBottomWidth: 1, 
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    paddingHorizontal: 20
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleTextContainer: { flex: 1, marginRight: 24 },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  toggleSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  cancelBtn: { 
    marginTop: 40, 
    height: 56, 
    backgroundColor: '#FEF2F2', 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});