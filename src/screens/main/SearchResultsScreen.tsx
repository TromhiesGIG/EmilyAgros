// src/screens/main/SearchResultsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X, SlidersHorizontal } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const SearchResultsScreen = ({ navigation, route }: any) => {
  const { user }                                  = useAuth();
  const initialQuery                              = route.params?.query ?? '';
  const [query, setQuery]                         = useState(initialQuery);
  const [results, setResults]                     = useState<any[]>([]);
  const [filtered, setFiltered]                   = useState<any[]>([]);
  const [categoryChips, setCategoryChips]         = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory]   = useState<string | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [sortBy, setSortBy]                       = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [showSortMenu, setShowSortMenu]           = useState(false);

  useEffect(() => { doSearch(initialQuery); }, []);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSelectedCategory(null);

    try {
      const { data } = await supabase
        .from('products')
        .select('id, title, price, images, location_state, location_lga, category_id')
        .eq('status', 'Active')
        .ilike('title', `%${q}%`)
        .limit(50);

      const items = data ?? [];
      setResults(items);
      applyFilters(items, null, sortBy);

      // Build category chips
      const catCounts: Record<number, number> = {};
      items.forEach((p: any) => {
        catCounts[p.category_id] = (catCounts[p.category_id] ?? 0) + 1;
      });

      // Fetch category names
      if (Object.keys(catCounts).length > 0) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', Object.keys(catCounts).map(Number));

        const chips = (cats ?? []).map((c: any) => ({
          name:  c.name,
          count: catCounts[c.id] ?? 0,
          id:    c.id,
        })).sort((a, b) => b.count - a.count);

        setCategoryChips(chips as any);
      }

      // Save search
      if (user) {
        await supabase.from('search_history').insert({ user_id: user.id, query: q.trim() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    items: any[],
    category: string | null,
    sort: typeof sortBy
  ) => {
    let list = category
      ? items.filter((p: any) => p.category_name === category || true)
      : items;

    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);

    setFiltered(list);
  };

  const handleCategoryChip = (name: string) => {
    const next = selectedCategory === name ? null : name;
    setSelectedCategory(next);
    applyFilters(results, next, sortBy);
  };

  const handleSort = (s: typeof sortBy) => {
    setSortBy(s);
    setShowSortMenu(false);
    applyFilters(results, selectedCategory, s);
  };

  const handleNewSearch = () => {
    if (!query.trim()) return;
    doSearch(query);
  };

  const SORT_LABELS: Record<typeof sortBy, string> = {
    recent:     'Most Recent',
    price_asc:  'Price: Low to High',
    price_desc: 'Price: High to Low',
  };

  const ResultCard = ({ item }: { item: any }) => {
    const imageUri = item.images?.[0];
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => navigation.navigate('HomeTab', { screen: 'AdDetails', params: { adId: item.id } })}
        activeOpacity={0.85}
      >
        {imageUri
          ? <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
          : <View style={[styles.resultImage, { backgroundColor: '#F3F4F6' }]} />
        }
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.resultPrice}>₦{Number(item.price).toLocaleString()}</Text>
          <Text style={styles.resultLocation}>{item.location_state}{item.location_lga ? `, ${item.location_lga}` : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with search bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={16} color={GRAY} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleNewSearch}
            returnKeyType="search"
            placeholder="Search..."
            placeholderTextColor={GRAY}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : (
        <>
          {/* Category chips */}
          {categoryChips.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {(categoryChips as any[]).map((chip: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, selectedCategory === chip.name && styles.chipActive]}
                  onPress={() => handleCategoryChip(chip.name)}
                >
                  <Text style={[styles.chipText, selectedCategory === chip.name && styles.chipTextActive]}>
                    {chip.name} ({chip.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Results count + sort */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsCount}>
              Found {filtered.length} ad{filtered.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <SlidersHorizontal size={14} color="#111827" />
              <Text style={styles.sortBtnText}>{SORT_LABELS[sortBy]}</Text>
            </TouchableOpacity>
          </View>

          {/* Sort dropdown */}
          {showSortMenu && (
            <View style={styles.sortMenu}>
              {(Object.keys(SORT_LABELS) as (typeof sortBy)[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sortMenuItem, sortBy === s && styles.sortMenuItemActive]}
                  onPress={() => handleSort(s)}
                >
                  <Text style={[styles.sortMenuText, sortBy === s && { color: GREEN }]}>
                    {SORT_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Results */}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try a different search term or category</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <ResultCard item={item} />}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#F7F8F9' },
  header:              { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBar:           { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput:         { flex: 1, fontSize: 14, color: '#111827' },
  chipsScroll:         { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip:                { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  chipActive:          { backgroundColor: GREEN, borderColor: GREEN },
  chipText:            { fontSize: 13, color: '#111827', fontWeight: '500' },
  chipTextActive:      { color: '#FFFFFF', fontWeight: '700' },
  resultsRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  resultsCount:        { fontSize: 13, color: GRAY },
  sortBtn:             { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  sortBtnText:         { fontSize: 12, fontWeight: '600', color: '#111827' },
  sortMenu:            { position: 'absolute', top: 130, right: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 8 },
  sortMenuItem:        { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sortMenuItemActive:  { backgroundColor: '#F0FDF4' },
  sortMenuText:        { fontSize: 14, color: '#111827', fontWeight: '500' },
  listContent:         { padding: 16 },
  resultCard:          { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginBottom: 10 },
  resultImage:         { width: 100, height: 100 },
  resultInfo:          { flex: 1, padding: 12 },
  resultTitle:         { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4, lineHeight: 19 },
  resultPrice:         { fontSize: 15, fontWeight: '700', color: GREEN, marginBottom: 4 },
  resultLocation:      { fontSize: 12, color: GRAY },
  empty:               { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle:          { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub:            { fontSize: 14, color: GRAY, textAlign: 'center' },
});