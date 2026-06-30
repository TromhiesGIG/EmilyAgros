// src/screens/promotions/PromotionTypeScreen.tsx
// Step 1 of 5 — Choose promotion type

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, TrendingUp, Search, LayoutDashboard, Package } from 'lucide-react-native';
import { PromotionsStackParamList } from '../../navigation/types';
import { isCarouselAvailable } from '../../services/promotionService';
import { BUNDLE_DETAILS, BUNDLE_PRICES, BundleName } from '../../types/promotions';

type Props = {
  navigation: NativeStackNavigationProp<PromotionsStackParamList, 'PromotionType'>;
  route: RouteProp<PromotionsStackParamList, 'PromotionType'>;
};

const GREEN = '#008102';
const GRAY  = '#6B7280';
const BUNDLE_KEYS: BundleName[] = ['starter', 'grower', 'agri_pro', 'market_leader'];

export const PromotionTypeScreen: React.FC<Props> = ({ navigation, route }) => {
  const preselectedProductId = route.params?.productId;
  const [carouselAvailable, setCarouselAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isCarouselAvailable()
      .then(setCarouselAvailable)
      .catch(() => setCarouselAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  const goToAdSelection = (type: 'carousel' | 'trending' | 'search_ad') => {
    navigation.navigate('AdSelection', { promotionType: type, preselectedProductId });
  };

  const goToBundle = (bundleName: BundleName) => {
    const bundle = BUNDLE_DETAILS[bundleName];
    if (bundle.hasCarousel && !carouselAvailable) {
      Alert.alert('Carousel Slots Full',
        'All 3 carousel slots are currently reserved. This premium bundle requires a carousel slot.\n\nCheck back soon!',
        [{ text: 'Got it' }]);
      return;
    }
    navigation.navigate('AdSelection', { promotionType: 'bundle', bundleName, preselectedProductId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boost Your Ad</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose how you want to promote your ad</Text>

        <Text style={styles.sectionLabel}>Individual Promotions</Text>

        {/* Carousel */}
        <TouchableOpacity
          style={[styles.card, !carouselAvailable && styles.cardDisabled]}
          onPress={() => {
            if (!carouselAvailable) {
              Alert.alert('Carousel Slots Full', 'All 3 carousel slots are currently reserved. Check back soon!');
              return;
            }
            goToAdSelection('carousel');
          }}
          activeOpacity={0.85}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#FFF3E0' }]}>
            <LayoutDashboard size={24} color="#E65100" />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Carousel</Text>
              {carouselAvailable
                ? <View style={styles.badgeGreen}><Text style={styles.badgeText}>Available</Text></View>
                : <View style={styles.badgeRed}><Text style={styles.badgeText}>Slots Full</Text></View>}
            </View>
            <Text style={styles.cardDesc}>Featured on the home screen carousel — the most visible spot in the app.</Text>
            <Text style={styles.cardPrice}>From ₦4,999 / week</Text>
          </View>
        </TouchableOpacity>

        {/* Trending */}
        <TouchableOpacity style={styles.card} onPress={() => goToAdSelection('trending')} activeOpacity={0.85}>
          <View style={[styles.iconWrap, { backgroundColor: '#E8F5E9' }]}>
            <TrendingUp size={24} color={GREEN} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Trending</Text>
              <View style={styles.badgeGreen}><Text style={styles.badgeText}>Instant</Text></View>
            </View>
            <Text style={styles.cardDesc}>Appear in the Trending section on the home screen. Activates immediately.</Text>
            <Text style={styles.cardPrice}>From ₦499 / week</Text>
          </View>
        </TouchableOpacity>

        {/* Search Ads */}
        <TouchableOpacity style={styles.card} onPress={() => goToAdSelection('search_ad')} activeOpacity={0.85}>
          <View style={[styles.iconWrap, { backgroundColor: '#E3F2FD' }]}>
            <Search size={24} color="#1565C0" />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Search Ads</Text>
              <View style={styles.badgeGreen}><Text style={styles.badgeText}>Instant</Text></View>
            </View>
            <Text style={styles.cardDesc}>Show at the top of the search page before users type anything.</Text>
            <Text style={styles.cardPrice}>From ₦299 / week</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Bundles — Save More</Text>

        {BUNDLE_KEYS.map((key: BundleName) => {
          const bundle = BUNDLE_DETAILS[key];
          const price  = BUNDLE_PRICES[key];
          const locked = bundle.hasCarousel && !carouselAvailable;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.card, locked && styles.cardDisabled]}
              onPress={() => goToBundle(key)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, { backgroundColor: bundle.isPremium ? '#EDE9FE' : '#F3E5F5' }]}>
                <Package size={24} color={bundle.isPremium ? '#6D28D9' : '#7B1FA2'} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{bundle.label}</Text>
                  {bundle.isPremium && <View style={styles.badgePurple}><Text style={styles.badgeText}>Premium</Text></View>}
                  {locked && <View style={styles.badgeRed}><Text style={styles.badgeText}>Slots Full</Text></View>}
                </View>
                <Text style={styles.cardDesc}>{bundle.includes.join('  ·  ')}</Text>
                <Text style={styles.cardPrice}>₦{price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn:          { width: 38, height: 38, justifyContent: 'center' },
  headerTitle:      { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  scroll:           { paddingHorizontal: 16, paddingTop: 16 },
  subtitle:         { fontSize: 14, color: GRAY, marginBottom: 20 },
  sectionLabel:     { fontSize: 13, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 4 },
  card:             { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 12, alignItems: 'flex-start' },
  cardDisabled:     { opacity: 0.5 },
  iconWrap:         { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  cardBody:         { flex: 1 },
  cardTitleRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  cardTitle:        { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardDesc:         { fontSize: 13, color: GRAY, lineHeight: 18, marginBottom: 6 },
  cardPrice:        { fontSize: 13, fontWeight: '600', color: GREEN },
  badgeGreen:       { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeRed:         { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgePurple:      { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },
});