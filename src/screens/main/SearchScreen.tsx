// src/screens/main/SearchScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Image, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, ArrowUpRight, Zap } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

const GREEN      = '#008102';
const GRAY       = '#6B7280';
const { width }  = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface SponsoredAd {
  promotion_id: string;
  product_id:   string;
  product: {
    id:             string;
    title:          string;
    price:          number;
    images:         string[];
    location_state: string;
  };
}

export const SearchScreen = ({ navigation }: any) => {
  const { user }                                = useAuth();
  const [query, setQuery]                       = useState('');
  const [suggestions, setSuggestions]           = useState<string[]>([]);
  const [sponsoredAds, setSponsoredAds]         = useState<SponsoredAd[]>([]);
  const [searchHistory, setSearchHistory]       = useState<string[]>([]);
  const [topSearches, setTopSearches]           = useState<string[]>([]);
  const [loadingSponsored, setLoadingSponsored] = useState(true);
  const [loadingTop, setLoadingTop]             = useState(true);
  const [isFocused, setIsFocused]               = useState(false);
  const inputRef                                = useRef<TextInput>(null);

  useFocusEffect(useCallback(() => {
    fetchSponsoredAds();
    fetchTopSearches();
    fetchSearchHistory();
  }, [user]));

  const fetchSponsoredAds = async () => {
    try {
      const { data: promos } = await supabase
        .from('promotions')
        .select('id, product_id, seller_id')
        .eq('promotion_type', 'search_ad')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (!promos || promos.length === 0) { setSponsoredAds([]); return; }

      const productIds = promos.map((p: any) => p.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, title, price, images, location_state')
        .in('id', productIds)
        .eq('status', 'Active');

      const productMap: Record<string, any> = {};
      (products ?? []).forEach((p: any) => { productMap[p.id] = p; });

      setSponsoredAds(
        promos
          .map((p: any) => ({
            promotion_id: p.id,
            product_id:   p.product_id,
            product:      productMap[p.product_id],
          }))
          .filter((p: any) => p.product)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSponsored(false);
    }
  };

  const fetchTopSearches = async () => {
    try {
      const { data } = await supabase
        .from('search_history')
        .select('query')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!data) { setTopSearches([]); return; }

      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        const q = row.query.toLowerCase().trim();
        counts[q] = (counts[q] ?? 0) + 1;
      });

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([q]) => q);

      setTopSearches(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchSearchHistory = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('search_history')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const unique = [...new Set((data ?? []).map((r: any) => r.query as string))];
      setSearchHistory(unique);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeText = async (text: string) => {
    setQuery(text);
    if (!text.trim()) { setSuggestions([]); return; }
    try {
      const { data } = await supabase
        .from('products')
        .select('title')
        .eq('status', 'Active')
        .ilike('title', `%${text}%`)
        .limit(7);

      const unique = [...new Set((data ?? []).map((p: any) => p.title as string))];
      setSuggestions(unique);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSearch = async (q: string) => {
    if (!user || !q.trim()) return;
    await supabase.from('search_history').insert({ user_id: user.id, query: q.trim() });
  };

  const submitSearch = async (q: string) => {
    if (!q.trim()) return;
    await saveSearch(q);
    setSuggestions([]);
    setQuery(q);
    inputRef.current?.blur();
    navigation.navigate('SearchResults', { query: q });
  };

  const isTyping = query.trim().length > 0;

  // ── Sponsored ad grid card ───────────────────────────────────────────────
  const renderSponsoredCard = ({ item }: { item: SponsoredAd }) => {
    const imageUri = item.product.images?.[0];
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => navigation.navigate('HomeTab', {
          screen: 'AdDetails',
          params: { adId: item.product_id },
        })}
        activeOpacity={0.85}
      >
        <View style={styles.gridImageWrap}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.gridImage} resizeMode="cover" />
            : <View style={[styles.gridImage, { backgroundColor: '#F3F4F6' }]} />
          }
          <View style={styles.sponsoredBadge}>
            <Zap size={9} color={GREEN} />
            <Text style={styles.sponsoredBadgeText}>Sponsored</Text>
          </View>
        </View>
        <View style={styles.gridInfo}>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.product.title}</Text>
          <Text style={styles.gridPrice}>₦{Number(item.product.price).toLocaleString()}</Text>
          <Text style={styles.gridLocation}>{item.product.location_state}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBarWrap}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={18} color={isFocused ? GREEN : GRAY} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="What are you looking for?"
            placeholderTextColor={GRAY}
            value={query}
            onChangeText={handleChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => submitSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }}>
              <X size={18} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Autocomplete suggestions */}
      {isTyping && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionRow}
              onPress={() => submitSearch(s)}
            >
              <Text style={styles.suggestionText} numberOfLines={1}>{s}</Text>
              <ArrowUpRight size={16} color={GRAY} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main content — shown when not typing */}
      {!isTyping && (
        <>
          {/* Sponsored ads — 2 column grid using FlatList */}
          {loadingSponsored ? (
            <ActivityIndicator color={GREEN} style={{ marginTop: 24 }} />
          ) : sponsoredAds.length > 0 ? (
            <FlatList
              data={sponsoredAds}
              keyExtractor={item => item.promotion_id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <>
                  <Text style={styles.sectionLabel}>Sponsored</Text>
                </>
              }
              ListFooterComponent={
                <>
                  {/* Search history */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Your Search History</Text>
                    {searchHistory.length > 0 ? (
                      searchHistory.map((h, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.historyRow}
                          onPress={() => submitSearch(h)}
                        >
                          <Search size={14} color={GRAY} />
                          <Text style={styles.historyText}>{h}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.emptyHistoryText}>
                        You don't have any searches yet.{'\n'}You will find all your searches here
                      </Text>
                    )}
                  </View>

                  {/* Top searches */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Top Searches Right Now</Text>
                    {loadingTop ? (
                      <ActivityIndicator color={GREEN} />
                    ) : topSearches.length > 0 ? (
                      <View style={styles.chipsWrap}>
                        {topSearches.map((t, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.chip}
                            onPress={() => submitSearch(t)}
                          >
                            <Text style={styles.chipText}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.emptyHistoryText}>No top searches yet.</Text>
                    )}
                  </View>
                </>
              }
              renderItem={renderSponsoredCard}
            />
          ) : (
            // No sponsored ads — just show history and top searches
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Your Search History</Text>
                {searchHistory.length > 0 ? (
                  searchHistory.map((h, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.historyRow}
                      onPress={() => submitSearch(h)}
                    >
                      <Search size={14} color={GRAY} />
                      <Text style={styles.historyText}>{h}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyHistoryText}>
                    You don't have any searches yet.{'\n'}You will find all your searches here
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Top Searches Right Now</Text>
                {loadingTop ? (
                  <ActivityIndicator color={GREEN} />
                ) : topSearches.length > 0 ? (
                  <View style={styles.chipsWrap}>
                    {topSearches.map((t, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.chip}
                        onPress={() => submitSearch(t)}
                      >
                        <Text style={styles.chipText}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyHistoryText}>No top searches yet.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#F7F8F9' },
  header:             { paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle:        { fontSize: 22, fontWeight: '700', color: '#111827' },
  searchBarWrap:      { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar:          { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  searchBarFocused:   { borderColor: GREEN },
  searchInput:        { flex: 1, fontSize: 15, color: '#111827' },
  suggestionsBox:     { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  suggestionRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggestionText:     { fontSize: 15, color: '#111827', flex: 1, marginRight: 8 },
  listContent:        { padding: 16 },
  sectionLabel:       { fontSize: 13, fontWeight: '600', color: GRAY, marginBottom: 12 },
  gridRow:            { justifyContent: 'space-between', marginBottom: 12 },
  gridCard:           { width: CARD_WIDTH, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  gridImageWrap:      { position: 'relative' },
  gridImage:          { width: '100%', height: CARD_WIDTH * 0.8 },
  sponsoredBadge:     { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  sponsoredBadgeText: { fontSize: 10, fontWeight: '700', color: GREEN },
  gridInfo:           { padding: 8 },
  gridTitle:          { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 3, lineHeight: 17 },
  gridPrice:          { fontSize: 13, fontWeight: '700', color: GREEN, marginBottom: 2 },
  gridLocation:       { fontSize: 11, color: GRAY },
  section:            { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, marginTop: 12 },
  historyRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  historyText:        { fontSize: 14, color: '#374151' },
  emptyHistoryText:   { fontSize: 14, color: GRAY, lineHeight: 22, textAlign: 'center', paddingVertical: 8 },
  chipsWrap:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:               { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  chipText:           { fontSize: 13, color: '#111827', fontWeight: '500' },
});