// src/screens/main/FAQsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

export const FAQsScreen = ({ navigation }: any) => {
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    try {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      setFaqs(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={faqs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.subtitle}>
              Find answers to the most common questions about EmilyAgros.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No FAQs available yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isOpen = expanded === item.id;
            return (
              <TouchableOpacity
                style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.questionRow}>
                  <Text style={[styles.question, isOpen && { color: GREEN }]}>
                    {item.question}
                  </Text>
                  {isOpen
                    ? <ChevronUp size={18} color={GREEN} />
                    : <ChevronDown size={18} color={GRAY} />
                  }
                </View>
                {isOpen && (
                  <Text style={styles.answer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F7F8F9' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  list:          { padding: 16 },
  subtitle:      { fontSize: 14, color: GRAY, lineHeight: 22, marginBottom: 20 },
  faqCard:       { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  faqCardOpen:   { borderColor: GREEN },
  questionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  question:      { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, lineHeight: 22 },
  answer:        { fontSize: 14, color: GRAY, lineHeight: 22, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  empty:         { alignItems: 'center', marginTop: 60 },
  emptyText:     { fontSize: 14, color: GRAY },
});