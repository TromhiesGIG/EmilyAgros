// src/screens/promotions/UseCreditsScreen.tsx
// Seller picks which ad to apply a search ad credit to

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, ImageOff, Zap } from 'lucide-react-native';
import { useAuth } from '../../providers/AuthProvider';
import { getSellerActiveAds, getBundleCredits, useSearchAdCredit } from '../../services/promotionService';

const GREEN = '#008102';
const GRAY  = '#6B7280';

const BUNDLE_LABELS: Record<string, string> = {
  starter:       'Starter',
  grower:        'Grower',
  agri_pro:      'Agri-Pro',
  market_leader: 'Market Leader',
};

export const UseCreditsScreen = ({ navigation, route }: any) => {
  const { creditId } = route.params ?? {};
  const { user }     = useAuth();

  const [credits, setCredits]         = useState<any[]>([]);
  const [ads, setAds]                 = useState<any[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [selectedAdId, setSelectedAdId]     = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [applying, setApplying]       = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [creditsData, adsData] = await Promise.all([
        getBundleCredits(user!.id),
        getSellerActiveAds(user!.id),
      ]);
      setCredits(creditsData);
      setAds(adsData);

      // Pre-select credit if passed via route params
      if (creditId) {
        const found = creditsData.find((c: any) => c.id === creditId);
        if (found) setSelectedCredit(found);
      } else if (creditsData.length === 1) {
        setSelectedCredit(creditsData[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedCredit || !selectedAdId || !user) return;

    setApplying(true);
    try {
      await useSearchAdCredit(
        selectedCredit.id,
        user.id,
        selectedAdId,
        selectedCredit.expires_at
      );

      Alert.alert(
        'Search Ad Applied!',
        'Your ad will now appear in the sponsored section of the search page.',
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const message =
        err?.message === 'NO_CREDITS_REMAINING'
          ? 'You have no credits remaining for this bundle.'
          : err?.message === 'ALREADY_ACTIVE'
          ? 'This ad already has an active search ad promotion.'
          : err?.message ?? 'Something went wrong.';
      Alert.alert('Failed', message);
    } finally {
      setApplying(false);
    }
  };

  const formatExpiry = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Use Search Ad Credits</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={ads}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            {/* Credit selector */}
            {credits.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Search Ad Credits</Text>
                {credits.map(credit => (
                  <TouchableOpacity
                    key={credit.id}
                    style={[styles.creditCard, selectedCredit?.id === credit.id && styles.creditCardSelected]}
                    onPress={() => setSelectedCredit(credit)}
                  >
                    <View style={styles.creditLeft}>
                      <View style={styles.creditBadge}>
                        <Zap size={14} color={GREEN} />
                        <Text style={styles.creditBadgeText}>{BUNDLE_LABELS[credit.bundle_name] ?? credit.bundle_name}</Text>
                      </View>
                      <Text style={styles.creditCount}>
                        {credit.remaining} of {credit.total_credits} credits remaining
                      </Text>
                      <Text style={styles.creditExpiry}>Expires {formatExpiry(credit.expires_at)}</Text>
                    </View>
                    {selectedCredit?.id === credit.id && (
                      <CheckCircle2 size={22} color={GREEN} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCredits}>
                <Text style={styles.emptyTitle}>No credits available</Text>
                <Text style={styles.emptySub}>
                  Purchase a bundle to get Search Ad credits.
                </Text>
              </View>
            )}

            {credits.length > 0 && (
              <Text style={styles.sectionTitle}>Select an Ad to Promote</Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          if (credits.length === 0) return null;
          const imageUri  = item.images?.[0];
          const isSelected = selectedAdId === item.id;
          return (
            <TouchableOpacity
              style={[styles.adCard, isSelected && styles.adCardSelected]}
              onPress={() => setSelectedAdId(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.thumbWrap}>
                {imageUri
                  ? <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
                  : <View style={styles.thumbPlaceholder}><ImageOff size={20} color={GRAY} /></View>
                }
              </View>
              <View style={styles.adInfo}>
                <Text style={styles.adTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.adPrice}>₦{Number(item.price).toLocaleString()}</Text>
              </View>
              {isSelected && <CheckCircle2 size={22} color={GREEN} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          credits.length > 0 ? (
            <View style={styles.emptyCredits}>
              <Text style={styles.emptyTitle}>No active ads</Text>
              <Text style={styles.emptySub}>Post an ad first to apply a credit to it.</Text>
            </View>
          ) : null
        }
      />

      {/* Apply button */}
      {credits.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.applyBtn,
              (!selectedCredit || !selectedAdId || applying) && styles.applyBtnDisabled,
            ]}
            onPress={handleApply}
            disabled={!selectedCredit || !selectedAdId || applying}
          >
            {applying
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.applyBtnText}>
                  Apply Credit to Ad
                  {selectedCredit ? ` (${selectedCredit.remaining} remaining)` : ''}
                </Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#F9FAFB' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:        { fontSize: 17, fontWeight: '700', color: '#111827' },
  scroll:             { padding: 16 },
  section:            { marginBottom: 20 },
  sectionTitle:       { fontSize: 14, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  creditCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  creditCardSelected: { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  creditLeft:         { flex: 1 },
  creditBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  creditBadgeText:    { fontSize: 13, fontWeight: '700', color: GREEN },
  creditCount:        { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  creditExpiry:       { fontSize: 12, color: GRAY },
  adCard:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', padding: 12, marginBottom: 10 },
  adCardSelected:     { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  thumbWrap:          { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  thumb:              { width: '100%', height: '100%' },
  thumbPlaceholder:   { width: '100%', height: '100%', backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  adInfo:             { flex: 1 },
  adTitle:            { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4, lineHeight: 20 },
  adPrice:            { fontSize: 13, fontWeight: '600', color: GREEN },
  emptyCredits:       { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
  emptyTitle:         { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub:           { fontSize: 14, color: GRAY, textAlign: 'center' },
  footer:             { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  applyBtn:           { height: 56, backgroundColor: GREEN, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  applyBtnDisabled:   { backgroundColor: '#9CA3AF' },
  applyBtnText:       { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});