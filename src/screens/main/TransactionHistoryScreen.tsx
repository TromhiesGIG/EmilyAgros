// src/screens/main/TransactionHistoryScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useSyncData, Transaction } from '../../hooks/useSyncData';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const TransactionHistoryScreen = ({ navigation }: any) => {
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

  const renderItem = ({ item }: { item: Transaction }) => {
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
          <Text style={[styles.amount, { color: item.status === 'Failed' ? GRAY : credit ? GREEN : '#DC2626' }]}>
            {item.status === 'Failed' ? '* ' : credit ? '+ ' : '- '}₦{Math.abs(item.amount).toLocaleString()}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={GREEN} style={{ marginTop: 60 }} size="large" />
      ) : (
        <FlatList
          data={walletData.transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} colors={[GREEN]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No transactions yet!</Text>
              <Text style={styles.emptyText}>Your wallet activity will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: '#FFFFFF' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: '#111827' },
  transactionItem: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  transLeft:       { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  transType:       { fontSize: 14, fontWeight: '700', color: '#111827' },
  methodBadge:     { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  methodText:      { fontSize: 10, color: GRAY, fontWeight: '600' },
  amount:          { fontSize: 16, fontWeight: '700' },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText:      { fontSize: 11, fontWeight: '700' },
  dateText:        { fontSize: 12, color: '#9CA3AF' },
  emptyBox:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText:       { fontSize: 14, color: GRAY },
});