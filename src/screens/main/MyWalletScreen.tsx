// src/screens/main/MyWalletScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Info, ChevronRight } from 'lucide-react-native';
import { useSyncData, Transaction } from '../../hooks/useSyncData';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const MyWalletScreen = ({ navigation }: any) => {
  const { walletData, loading, refresh } = useSyncData();

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'Successful': return { bg: '#DCFCE7', text: '#166534' };
      case 'Pending':    return { bg: '#FEF3C7', text: '#92400E' };
      case 'Failed':     return { bg: '#FEE2E2', text: '#991B1B' };
      default:           return { bg: '#F3F4F6', text: GRAY };
    }
  };

  const isCredit = (t: Transaction) => t.amount > 0;

  const TransactionItem = ({ item }: { item: Transaction }) => {
    const statusStyle = getStatusStyle(item.status);
    const credit      = isCredit(item);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transRow}>
          <View style={styles.transLeft}>
            <Text style={styles.transType}>
              {item.description ?? item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{item.method}</Text>
            </View>
          </View>
          <Text style={[styles.amount, { color: credit ? GREEN : '#DC2626' }]}>
            {credit ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
          </Text>
        </View>
        <View style={styles.transRow}>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('en-NG', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Show only last 3 on wallet screen — full list on Transaction History screen
  const recentTransactions = walletData.transactions.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={[GREEN]} />
        }
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={16} color="#1D4ED8" />
          <Text style={styles.infoText}>
            Wallet balance is non-refundable and can only be used in-app.
          </Text>
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceAmount}>₦ {walletData.balance.toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => navigation.navigate('WalletRecharge')}
          >
            <Text style={styles.rechargeBtnText}>Recharge</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={16} color={GREEN} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={GREEN} style={{ padding: 24 }} />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map(t => <TransactionItem key={t.id} item={t} />)
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}

        {/* Subscriptions section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={16} color={GREEN} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.subscriptionCard}
          onPress={() => navigation.navigate('Subscriptions')}
          activeOpacity={0.8}
        >
          <Text style={styles.subscriptionCardLabel}>Active Promotions</Text>
          <Text style={styles.subscriptionCardDesc}>
            View and manage your active ads promotions and bundles.
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:             { flex: 1, backgroundColor: '#FFFFFF' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  infoBanner:           { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  infoText:             { flex: 1, fontSize: 12, color: '#1D4ED8' },
  balanceContainer:     { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  balanceLabel:         { fontSize: 14, color: GRAY, marginBottom: 8 },
  balanceAmount:        { fontSize: 36, fontWeight: '700', color: '#111827', marginBottom: 24 },
  rechargeBtn:          { width: '60%', height: 48, borderWidth: 2, borderColor: GREEN, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  rechargeBtnText:      { fontSize: 16, fontWeight: '700', color: GREEN },
  sectionHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle:         { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAllBtn:            { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText:           { fontSize: 14, fontWeight: '600', color: GREEN },
  transactionItem:      { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  transLeft:            { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  transType:            { fontSize: 14, fontWeight: '700', color: '#111827' },
  methodBadge:          { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  methodText:           { fontSize: 10, color: GRAY, fontWeight: '600' },
  amount:               { fontSize: 16, fontWeight: '700' },
  statusBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText:           { fontSize: 11, fontWeight: '700' },
  dateText:             { fontSize: 12, color: '#9CA3AF' },
  emptyBox:             { padding: 40, alignItems: 'center' },
  emptyText:            { color: '#9CA3AF', fontSize: 14 },
  subscriptionCard:     { marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  subscriptionCardLabel:{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subscriptionCardDesc: { fontSize: 13, color: GRAY, lineHeight: 19 },
});