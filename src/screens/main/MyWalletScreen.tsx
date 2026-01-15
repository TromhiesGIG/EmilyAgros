// src/screens/main/MyWalletScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  FlatList 
} from 'react-native';
import { ArrowLeft, Info, ChevronRight } from 'lucide-react-native';

export const MyWalletScreen = ({ navigation }: any) => {
  // Mock data based on your "My Wallet" and "Transaction History" designs
  const transactions = [
    { id: '1', type: 'Recharge', method: 'Bank Transfer', amount: '+ ₦1,000', date: '12 Dec 2025. 10:34:49', status: 'Pending' },
    { id: '2', type: 'Subscription', method: 'Wallet', amount: '- ₦3,500', date: '12 Dec 2025. 10:34:49', status: 'Successful' },
    { id: '3', type: 'Recharge', method: 'USSD', amount: '+ ₦1,000', date: '11 Dec 2025. 06:27:30', status: 'Failed' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Successful': return { bg: '#DCFCE7', text: '#166534' };
      case 'Pending': return { bg: '#FFEDD5', text: '#9A3412' };
      case 'Failed': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const TransactionItem = ({ item }: any) => {
    const colors = getStatusStyle(item.status);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transRow}>
          <View style={styles.transLeft}>
            <Text style={styles.transType}>{item.type}</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{item.method}</Text>
            </View>
          </View>
          <Text style={[styles.amount, item.amount.startsWith('+') ? styles.positive : styles.negative]}>
            {item.amount}
          </Text>
        </View>
        <View style={styles.transRow}>
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Wallet Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={18} color="#1D4ED8" />
          <Text style={styles.infoText}>
            Wallet balance is non-refundable and can only be used in-app
          </Text>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceAmount}>₦ 12,000</Text>
          <TouchableOpacity 
            style={styles.rechargeBtn}
            onPress={() => navigation.navigate('WalletRecharge')}
          >
            <Text style={styles.rechargeBtnText}>Recharge</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {transactions.map(item => (
            <TransactionItem key={item.id} item={item} />
          ))}
        </View>

        {/* Current Plan Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.planCard} onPress={() => navigation.navigate('Subscriptions')}>
          <View>
            <Text style={styles.planLabel}>Your current Plan</Text>
            <Text style={styles.planName}>Free <Text style={styles.planPrice}>₦ 0</Text></Text>
            <Text style={styles.planHint}>Unlock more benefits by subscribing to a paid plan.</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContainer: { paddingBottom: 40 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  balanceContainer: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  balanceLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 24 },
  rechargeBtn: { width: '80%', height: 50, borderWidth: 1.5, borderColor: '#008102', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rechargeBtnText: { fontSize: 16, fontWeight: '700', color: '#008102' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: '#008102', fontWeight: '600' },
  transactionList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  transactionItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  transLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transType: { fontSize: 16, fontWeight: '600', color: '#111827' },
  methodBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  methodText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '700' },
  positive: { color: '#111827' },
  negative: { color: '#111827' },
  dateText: { fontSize: 13, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  planCard: { marginHorizontal: 20, padding: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  planName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  planPrice: { fontSize: 16, fontWeight: '700' },
  planHint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});