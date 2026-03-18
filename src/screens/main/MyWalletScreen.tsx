import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft, Info, Wallet } from 'lucide-react-native';
import { useSyncData, Transaction } from '../../hooks/useSyncData';

export const MyWalletScreen = ({ navigation }: any) => {
  const { walletData, loading, refresh } = useSyncData();

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'Successful': return { bg: '#DCFCE7', text: '#166534' };
      case 'Pending': return { bg: '#FEF3C7', text: '#92400E' };
      case 'Failed': return { bg: '#FEE2E2', text: '#991B1B' };
    }
  };

  const TransactionItem = ({ item }: { item: Transaction }) => {
    const style = getStatusStyle(item.status);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transRow}>
          <View style={styles.transLeft}>
            <Text style={styles.transType}>{item.type.toUpperCase()}</Text>
            <View style={styles.methodBadge}><Text style={styles.methodText}>{item.method}</Text></View>
          </View>
          <Text style={styles.amount}>
            {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
          </Text>
        </View>
        <View style={styles.transRow}>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
            <Text style={[styles.statusText, { color: style.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#008102']} />}
      >
        <View style={styles.infoBanner}>
          <Info size={16} color="#1D4ED8" />
          <Text style={styles.infoText}>Wallet balance is non-refundable and can only be used in-app.</Text>
        </View>

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>

        {walletData.transactions.length > 0 ? (
          walletData.transactions.map(t => <TransactionItem key={t.id} item={t} />)
        ) : (
          <View style={styles.emptyBox}>
            {loading ? <ActivityIndicator color="#008102" /> : <Text style={styles.emptyText}>No transactions yet</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  infoBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: '#1D4ED8' },
  balanceContainer: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  balanceLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: '#111827', marginBottom: 24 },
  rechargeBtn: { width: '60%', height: 48, borderWidth: 2, borderColor: '#008102', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  rechargeBtnText: { fontSize: 16, fontWeight: '700', color: '#008102' },
  sectionHeader: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  transactionItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  transLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transType: { fontSize: 14, fontWeight: '700', color: '#111827' },
  methodBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  methodText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 }
});