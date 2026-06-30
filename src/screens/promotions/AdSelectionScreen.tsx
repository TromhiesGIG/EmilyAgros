// src/screens/promotions/AdSelectionScreen.tsx
// Step 2 of 5 — Select the ad to promote (1 ad per promotion)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, ImageOff } from 'lucide-react-native';
import { PromotionsStackParamList } from '../../navigation/types';
import { getSellerActiveAds } from '../../services/promotionService';
import { useAuth } from '../../providers/AuthProvider';

type Props = {
  navigation: NativeStackNavigationProp<PromotionsStackParamList, 'AdSelection'>;
  route: RouteProp<PromotionsStackParamList, 'AdSelection'>;
};

const GREEN = '#008102';
const GRAY  = '#6B7280';

interface Ad {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
}

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  carousel:  'Carousel',
  trending:  'Trending',
  search_ad: 'Search Ad',
  bundle:    'Bundle',
};

export const AdSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { promotionType, bundleName, preselectedProductId } = route.params;
  const { user } = useAuth();

  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedProductId ?? null);
  const [loading, setLoading] = useState(true);

  const typeLabel = PROMOTION_TYPE_LABELS[promotionType] ?? promotionType;

  useEffect(() => {
    if (!user) return;
    getSellerActiveAds(user.id)
      .then(setAds)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleContinue = () => {
    if (!selectedId) return;
    const ad = ads.find((a) => a.id === selectedId);
    if (!ad) return;

    navigation.navigate('PlanSelection', {
      promotionType,
      bundleName,
      productId:    selectedId,
      productTitle: ad.title,
    });
  };

  const renderAd = ({ item }: { item: Ad }) => {
    const selected  = item.id === selectedId;
    const imageUri  = item.images?.[0] ?? null;

    return (
      <TouchableOpacity
        style={[styles.adCard, selected && styles.adCardSelected]}
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.85}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <ImageOff size={20} color={GRAY} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.adInfo}>
          <Text style={styles.adTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.adPrice}>₦{Number(item.price).toLocaleString()}</Text>
        </View>

        {/* Tick */}
        {selected && (
          <CheckCircle2 size={22} color={GREEN} style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Ad</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          Select the ad you want to promote with <Text style={{ fontWeight: '700', color: GREEN }}>{typeLabel}</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : ads.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You have no active ads.</Text>
          <Text style={styles.emptySubText}>Post an ad first, then come back to boost it.</Text>
        </View>
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => item.id}
          renderItem={renderAd}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Continue button */}
      {ads.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !selectedId && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selectedId}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#FFFFFF' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn:            { width: 38, height: 38, justifyContent: 'center' },
  headerTitle:        { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  hint:               { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F0FDF4', borderBottomWidth: 1, borderBottomColor: '#D1FAE5' },
  hintText:           { fontSize: 13, color: '#374151' },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText:          { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  emptySubText:       { fontSize: 13, color: GRAY, textAlign: 'center' },
  list:               { padding: 16, gap: 12 },
  adCard:             { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', padding: 12, backgroundColor: '#FFFFFF' },
  adCardSelected:     { borderColor: GREEN, backgroundColor: '#F0FDF4' },
  thumbWrap:          { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', marginRight: 12, flexShrink: 0 },
  thumb:              { width: '100%', height: '100%' },
  thumbPlaceholder:   { width: '100%', height: '100%', backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  adInfo:             { flex: 1 },
  adTitle:            { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4, lineHeight: 20 },
  adPrice:            { fontSize: 13, fontWeight: '600', color: GREEN },
  footer:             { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  continueBtn:        { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  continueBtnDisabled:{ backgroundColor: '#9CA3AF' },
  continueBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});