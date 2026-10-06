// src/screens/admin/AdminFAQsScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const GREEN = '#008102';
const GRAY  = '#6B7280';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

const EMPTY_FAQ = { question: '', answer: '' };

export const AdminFAQsScreen = () => {
  const [faqs, setFaqs]           = useState<FAQ[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<FAQ | null>(null);
  const [form, setForm]           = useState(EMPTY_FAQ);
  const [saving, setSaving]       = useState(false);

  useFocusEffect(useCallback(() => { fetchFAQs(); }, []));

  const fetchFAQs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      setFaqs(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FAQ);
    setModal(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      Alert.alert('Missing Info', 'Please fill in both question and answer.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await supabase
          .from('faqs')
          .update({ question: form.question.trim(), answer: form.answer.trim(), updated_at: new Date().toISOString() })
          .eq('id', editing.id);
      } else {
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.display_order)) : 0;
        await supabase.from('faqs').insert({
          question:      form.question.trim(),
          answer:        form.answer.trim(),
          display_order: maxOrder + 1,
          is_active:     true,
        });
      }
      setModal(false);
      await fetchFAQs();
    } catch (e) {
      Alert.alert('Error', 'Could not save FAQ. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (faq: FAQ) => {
    Alert.alert(
      'Delete FAQ',
      `Delete "${faq.question}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('faqs').delete().eq('id', faq.id);
            await fetchFAQs();
          },
        },
      ]
    );
  };

  const toggleActive = async (faq: FAQ) => {
    await supabase
      .from('faqs')
      .update({ is_active: !faq.is_active })
      .eq('id', faq.id);
    await fetchFAQs();
  };

  const moveOrder = async (faq: FAQ, direction: 'up' | 'down') => {
    const index = faqs.findIndex(f => f.id === faq.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= faqs.length) return;

    const swapFaq = faqs[swapIndex];
    await Promise.all([
      supabase.from('faqs').update({ display_order: swapFaq.display_order }).eq('id', faq.id),
      supabase.from('faqs').update({ display_order: faq.display_order }).eq('id', swapFaq.id),
    ]);
    await fetchFAQs();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FAQs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add FAQ</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={faqs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchFAQs(true)} tintColor={GREEN} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No FAQs yet</Text>
              <Text style={styles.emptyText}>Tap Add FAQ to create your first one.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={[styles.card, !item.is_active && styles.cardInactive]}>
              <View style={styles.cardTop}>
                <Text style={styles.orderBadge}>{item.display_order}</Text>
                <Text style={styles.question} numberOfLines={2}>{item.question}</Text>
              </View>
              <Text style={styles.answer} numberOfLines={3}>{item.answer}</Text>

              <View style={styles.actions}>
                {/* Reorder buttons */}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => moveOrder(item, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp size={18} color={index === 0 ? '#D1D5DB' : GRAY} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => moveOrder(item, 'down')}
                  disabled={index === faqs.length - 1}
                >
                  <ChevronDown size={18} color={index === faqs.length - 1 ? '#D1D5DB' : GRAY} />
                </TouchableOpacity>

                {/* Toggle active */}
                <TouchableOpacity
                  style={[styles.toggleBtn, item.is_active && styles.toggleBtnActive]}
                  onPress={() => toggleActive(item)}
                >
                  <Text style={[styles.toggleBtnText, item.is_active && { color: GREEN }]}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </Text>
                </TouchableOpacity>

                {/* Edit */}
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                  <Pencil size={18} color={GREEN} />
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit FAQ' : 'Add FAQ'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Question</Text>
            <TextInput
              style={styles.inputField}
              value={form.question}
              onChangeText={v => setForm(f => ({ ...f, question: v }))}
              placeholder="e.g. How do I post an ad?"
              placeholderTextColor={GRAY}
              multiline
            />

            <Text style={styles.inputLabel}>Answer</Text>
            <TextInput
              style={[styles.inputField, styles.inputFieldTall]}
              value={form.answer}
              onChangeText={v => setForm(f => ({ ...f, answer: v }))}
              placeholder="Write a clear and helpful answer..."
              placeholderTextColor={GRAY}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.saveBtnText}>{editing ? 'Save Changes' : 'Add FAQ'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#FFFFFF' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: '#111827' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText:       { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  list:             { padding: 16 },
  card:             { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  cardInactive:     { opacity: 0.5 },
  cardTop:          { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  orderBadge:       { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: '700', color: GRAY, overflow: 'hidden' },
  question:         { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  answer:           { fontSize: 13, color: GRAY, lineHeight: 19, marginBottom: 12 },
  actions:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn:          { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#F9FAFB' },
  toggleBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', flex: 1, alignItems: 'center' },
  toggleBtnActive:  { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  toggleBtnText:    { fontSize: 12, fontWeight: '600', color: GRAY },
  empty:            { alignItems: 'center', marginTop: 60 },
  emptyTitle:       { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText:        { fontSize: 14, color: GRAY },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:       { fontSize: 18, fontWeight: '700', color: '#111827' },
  inputLabel:       { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 6 },
  inputField:       { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', marginBottom: 16 },
  inputFieldTall:   { height: 120 },
  saveBtn:          { height: 52, backgroundColor: GREEN, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:      { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});