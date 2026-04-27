
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert, // Added missing Alert import
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, ChevronDown, X } from 'lucide-react-native';
import { supabase } from '../../services/supabase'; // Added missing supabase import
import { useAuth } from '../../providers/AuthProvider'; // Added missing useAuth import
import { useSyncData } from '../../hooks/useSyncData'; // Added missing useSyncData import

export const SubscriptionsScreen = ({ navigation }: any) => {
  const { user } = useAuth(); // Defined user
  const { walletData, profileData, plans, refresh, loading } = useSyncData(); // Pulling live data
  const [saving, setSaving] = useState(false); // Defined saving state
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any>(null);
  const PLAN_WEIGHTS: Record<string, number> = {
  'free': 0,
  'new_sprout': 1,
  'grower': 2,
  'harvester': 3
};


const handleConfirmSubscription = async () => {
  if (!selectedPlanForModal || !user) return;

  const planPrice = selectedPlanForModal.price_amount;
  const currentWeight = PLAN_WEIGHTS[profileData?.activePlanId || 'free'];
  const targetWeight = PLAN_WEIGHTS[selectedPlanForModal.id];
  const isUpgrade = targetWeight > currentWeight;
  const isDowngrade = targetWeight < currentWeight;

  // Check if current plan is still active
  const now = new Date();
  const expiryDate = profileData?.subscription_expires_at ? new Date(profileData.subscription_expires_at) : null;
  const planIsActive = expiryDate && expiryDate > now;

  // BLOCK DOWNGRADES if current plan is active
  if (isDowngrade && planIsActive) {
    Alert.alert(
      "Downgrade Not Allowed", 
      `You cannot downgrade while your ${profileData?.activePlan} is still active. Please wait until ${expiryDate?.toLocaleDateString()} or cancel auto-renewal.`
    );
    return;
  }

  // Wallet check
  if (walletData.balance < planPrice) {
    Alert.alert("Insufficient Funds", "Please recharge your wallet first.");
    return;
  }

  setSaving(true);
  
  try {
    const { error } = await supabase.rpc('process_subscription', {
      target_plan_id: selectedPlanForModal.id,
      cost: planPrice
    });

    if (error) throw error;

    await refresh();
    setSelectedPlanForModal(null);
    
    if (isUpgrade) {
      Alert.alert("Upgrade Successful", `You've been upgraded to ${selectedPlanForModal.name}!`);
    } else {
      Alert.alert("Subscription Activated", `Welcome to ${selectedPlanForModal.name}!`);
    }
    
  } catch (error: any) {
    Alert.alert("Transaction Failed", error.message);
  } finally {
    setSaving(false);
  }
};

  const PlanCard = ({ plan }: any) => {
  const currentWeight = PLAN_WEIGHTS[profileData?.activePlanId || 'free'];
  const targetWeight = PLAN_WEIGHTS[plan.id];
  const now = new Date();
  const expiryDate = profileData?.subscription_expires_at ? new Date(profileData.subscription_expires_at) : null;
  const planIsActive = expiryDate && expiryDate > now;
  
  // User is on this plan if IDs match AND plan hasn't expired
  const isCurrentPlan = profileData?.activePlanId === plan.id && planIsActive;
  
  // Can only downgrade if current plan has expired
  const isDowngrade = targetWeight < currentWeight && planIsActive;
  const isUpgrade = targetWeight > currentWeight;

  return (
    <View style={[styles.planCard, isCurrentPlan && styles.activePlanCard]}>
      {/* Plan Header */}
      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>
            ₦ {plan.price_amount.toLocaleString()} <Text style={styles.planPeriod}>/{plan.period}</Text>
          </Text>
        </View>
        {isCurrentPlan && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        )}
      </View>

      {/* Plan Details */}
      <TouchableOpacity style={styles.detailsRow}>
        <Text style={styles.detailsText}>{plan.description}</Text>
        <View style={styles.detailsAction}>
          <Text style={styles.detailsActionText}>Details</Text>
          <ChevronDown size={16} color="#008102" />
        </View>
      </TouchableOpacity>

      {/* Action Button */}
      {!isCurrentPlan ? (
        <TouchableOpacity 
          style={[
            styles.subscribeBtn, 
            isDowngrade && { backgroundColor: '#9CA3AF' }
          ]}
          onPress={() => {
            if (isDowngrade) {
              Alert.alert(
                "Downgrade Blocked", 
                `You cannot downgrade to ${plan.name} while your ${profileData?.activePlan} is active until ${expiryDate?.toLocaleDateString()}.`
              );
            } else {
              setSelectedPlanForModal(plan);
            }
          }}
          disabled={isDowngrade || saving}
        >
          <Text style={styles.subscribeBtnText}>
            {isUpgrade ? 'Upgrade Now' : isDowngrade ? 'Available After Expiry' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.manageBtn}
          onPress={() => navigation.navigate('PlanManagement')}
        >
          <Text style={styles.manageBtnText}>Manage Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceBar}>
          <Wallet size={18} color="#4B5563" />
          <Text style={styles.balanceText}>Current wallet balance: <Text style={styles.balanceValue}>₦ {walletData.balance.toLocaleString()}</Text></Text>
        </View>

        <Text style={styles.sectionTitle}>All Plans</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#008102" />
        ) : (
          plans.map(plan => <PlanCard key={plan.id} plan={plan} />)
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={!!selectedPlanForModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Subscription</Text>
              <TouchableOpacity onPress={() => setSelectedPlanForModal(null)}><X size={24} color="#111827" /></TouchableOpacity>
            </View>

            <View style={styles.selectedPlanBox}>
              <Text style={styles.selectedPlanName}>{selectedPlanForModal?.name}</Text>
              <Text style={styles.selectedPlanPrice}>₦ {selectedPlanForModal?.price_amount.toLocaleString()} <Text style={styles.planPeriod}>/{selectedPlanForModal?.period}</Text></Text>
            </View>

            <View style={styles.paymentMethod}>
              <Wallet size={20} color="#4B5563" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.methodTitle}>Wallet Payment</Text>
                <Text style={styles.methodBalance}>Current balance: ₦ {walletData.balance.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSubscribeBtn} 
              onPress={handleConfirmSubscription}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubscribeText}>Subscribe</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSelectedPlanForModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { padding: 20 },
  balanceBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 32 },
  balanceText: { marginLeft: 8, fontSize: 14, color: '#4B5563' },
  balanceValue: { fontWeight: '700', color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  planCard: { padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, backgroundColor: '#FFFFFF' },
  activePlanCard: { borderColor: '#008102', borderWidth: 2 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '700', color: '#111827' },
  planPeriod: { fontSize: 14, fontWeight: '400', color: '#6B7280' },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  activeBadgeText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  detailsText: { fontSize: 14, color: '#6B7280' },
  detailsAction: { flexDirection: 'row', alignItems: 'center' },
  detailsActionText: { fontSize: 14, color: '#008102', fontWeight: '600', marginRight: 4 },
  subscribeBtn: { height: 48, backgroundColor: '#008102', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  subscribeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  manageBtn: { height: 48, backgroundColor: '#F3F4F6', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  manageBtnText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  selectedPlanBox: { padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 24 },
  selectedPlanName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  selectedPlanPrice: { fontSize: 18, fontWeight: '700', color: '#111827' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  methodTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  methodBalance: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  modalSubscribeBtn: { height: 56, backgroundColor: '#008102', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalSubscribeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalCancelBtn: { height: 56, backgroundColor: '#F9FAFB', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#111827', fontSize: 16, fontWeight: '600' },
  activeLabelBox: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Fixes TS2551: Property 'activeLabelText' does not exist
  activeLabelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },

});