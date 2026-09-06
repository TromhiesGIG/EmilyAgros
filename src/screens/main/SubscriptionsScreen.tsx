// src/screens/main/SubscriptionsScreen.tsx

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Modal, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, X, MessageCircle, Phone } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import {
  isCarouselAvailable,
  isBundleCarouselAvailable,
  getMyPromotions,
  getWalletBalance,
  joinWaitlist,
} from '../../services/promotionService';
import {
  PLAN_DURATION_LABELS,
  SellerPromotionSummary,
} from '../../types/promotions';

const GREEN        = '#008102';
const GRAY         = '#6B7280';
const ADMIN_PHONE  = '+2348168817063';
const ADMIN_WA     = 'https://wa.me/2348168817063';

type MainTab  = 'promote' | 'my_promotions';
type PromoTab = 'active' | 'pending' | 'expired';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: GREEN,     bg: '#DCFCE7' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  expired:   { label: 'Expired',   color: GRAY,      bg: '#F3F4F6' },
  rejected:  { label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: GRAY,      bg: '#F3F4F6' },
};

const TYPE_LABELS: Record<string, string> = {
  carousel:  'Carousel',
  trending:  'Trending',
  search_ad: 'Search Ads',
  bundle:    'Bundle',
};

const INDIVIDUAL_CARDS = [
  {
    key:         'carousel',
    name:        'Carousel',
    fromPrice:   '₦2,999',
    description: 'The most visible spot in the app. Your ad rotates on the home screen carousel.',
  },
  {
    key:         'trending',
    name:        'Trending',
    fromPrice:   '₦1,499',
    description: 'Appear in the Trending section on the home screen. Activates immediately after payment.',
  },
  {
    key:         'search_ad',
    name:        'Search Ads',
    fromPrice:   '₦499',
    description: 'Show at the top of the search page before buyers type anything. Highest intent placement.',
  },
];

const BUNDLE_CARDS = [
  {
    key:         'starter',
    name:        'Starter',
    price:       '₦5,999',
    duration:    '1 Month',
    description: 'Trending for 1 Week + 5 Search Ads for 1 Month',
    hasCarousel: false,
    isEnterprise: false,
  },
  {
    key:         'grower',
    name:        'Grower',
    price:       '₦17,999',
    duration:    '1 Month',
    description: '1 Carousel Slot for 1 Month + Trending for 1 Month + 5 Search Ads for 1 Month',
    hasCarousel: true,
    isEnterprise: false,
  },
  {
    key:         'agri_pro',
    name:        'Agri-Pro',
    price:       '₦29,999',
    duration:    '1 Month',
    description: '1 Carousel Slot for 1 Month + Trending for 1 Month + 15 Search Ads for 1 Month + Verified Seller Badge',
    hasCarousel: true,
    isEnterprise: false,
  },
  {
    key:         'market_leader',
    name:        'Market Leader',
    price:       '₦59,999',
    duration:    '1 Month',
    description: 'All 3 Carousel Slots for 1 Month + Trending for 1 Month + 30 Search Ads for 1 Month + Verified Seller Badge + 1 Push Notification Blast',
    hasCarousel: true,
    isEnterprise: true,
  },
];

export const SubscriptionsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [mainTab, setMainTab]                   = useState<MainTab>('promote');
  const [promoTab, setPromoTab]                 = useState<PromoTab>('active');
  const [walletBalance, setWallet]              = useState(0);
  const [carouselAvailable, setCarousel]        = useState(true);
  const [bundleCarouselAvailable, setBundleCarousel] = useState(true);
  const [promotions, setPromotions]             = useState<SellerPromotionSummary[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [refreshing, setRefreshing]             = useState(false);

  // Modals
  const [waitlistModal, setWaitlistModal]       = useState<string | null>(null);
  const [waitlistJoined, setWaitlistJoined]     = useState(false);
  const [waitlistLoading, setWaitlistLoading]   = useState(false);
  const [contactModal, setContactModal]         = useState(false);

  useFocusEffect(useCallback(() => {
    fetchAll();
  }, [user]));

  const fetchAll = async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [bal, slots, bundleSlots, promos] = await Promise.all([
        getWalletBalance(user.id),
        isCarouselAvailable(),
        isBundleCarouselAvailable(),
        getMyPromotions(user.id),
      ]);
      setWallet(bal);
      setCarousel(slots);
      setBundleCarousel(bundleSlots);
      setPromotions(promos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCardPress = (key: string, bundleName?: string) => {
    if (key === 'carousel' && !carouselAvailable) return;
    navigation.navigate('AdSelection', {
      promotionType: key,
      bundleName:    bundleName ?? undefined,
    });
  };

  const handleBundlePress = (bundle: typeof BUNDLE_CARDS[0]) => {
    if (bundle.isEnterprise) {
      setContactModal(true);
      return;
    }
    if (bundle.hasCarousel && !bundleCarouselAvailable) {
      setWaitlistModal(bundle.key);
      return;
    }
    handleCardPress('bundle', bundle.key);
  };

  const handleJoinWaitlist = async (bundleKey: string) => {
    if (!user) return;
    setWaitlistLoading(true);
    try {
      await joinWaitlist(user.id, 'bundle', bundleKey);
      setWaitlistJoined(true);
    } catch (e) {
      Alert.alert('Error', 'Could not join waitlist. Please try again.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi EmilyAgros! I'm interested in the Market Leader package. Please contact me to discuss.`
    );
    Linking.openURL(`${ADMIN_WA}?text=${message}`);
  };

  const openCall = () => Linking.openURL(`tel:${ADMIN_PHONE}`);
  const openSMS  = () => {
    const message = encodeURIComponent(
      `Hi EmilyAgros! I'm interested in the Market Leader package.`
    );
    Linking.openURL(`sms:${ADMIN_PHONE}?body=${message}`);
  };

  // ── Promote Tab ──────────────────────────────────────────────────────────
  const renderPromote = () => (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={GREEN} />
      }
    >
      <View style={styles.walletBar}>
        <Wallet size={16} color={GRAY} />
        <Text style={styles.walletText}>
          Current wallet balance:{' '}
          <Text style={styles.walletValue}>₦{walletBalance.toLocaleString()}</Text>
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Individual Promotions</Text>

      {INDIVIDUAL_CARDS.map(card => {
        const isCarouselCard = card.key === 'carousel';
        const unavailable    = isCarouselCard && !carouselAvailable;
        return (
          <View key={card.key} style={[styles.planCard, unavailable && styles.planCardDisabled]}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{card.name}</Text>
              {isCarouselCard && (
                <View style={carouselAvailable ? styles.availableBadge : styles.soldOutBadge}>
                  <Text style={carouselAvailable ? styles.availableText : styles.soldOutText}>
                    {carouselAvailable ? 'Available' : 'Slots Full'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>From {card.fromPrice}</Text>
            <Text style={styles.planDesc}>{card.description}</Text>
            <TouchableOpacity
              style={[styles.subscribeBtn, unavailable && styles.subscribeBtnDisabled]}
              onPress={() => handleCardPress(card.key)}
              disabled={unavailable}
            >
              <Text style={styles.subscribeBtnText}>
                {unavailable ? 'Currently Unavailable' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Bundles</Text>

      {BUNDLE_CARDS.map(bundle => {
        const slotsFullForBundle = bundle.hasCarousel && !bundle.isEnterprise && !bundleCarouselAvailable;
        return (
          <View key={bundle.key} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{bundle.name}</Text>
              {bundle.isEnterprise && (
                <View style={styles.enterpriseBadge}>
                  <Text style={styles.enterpriseText}>Enterprise</Text>
                </View>
              )}
              {slotsFullForBundle && (
                <View style={styles.soldOutBadge}>
                  <Text style={styles.soldOutText}>Slots Full</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>{bundle.price}</Text>
            <Text style={styles.planDesc}>{bundle.description}</Text>
            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                bundle.isEnterprise && styles.enterpriseBtn,
              ]}
              onPress={() => handleBundlePress(bundle)}
            >
              <Text style={styles.subscribeBtnText}>
                {bundle.isEnterprise
                  ? 'Get in Touch'
                  : slotsFullForBundle
                  ? 'Join Waitlist'
                  : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── My Promotions Tab ────────────────────────────────────────────────────
  const filtered = promotions.filter(p => {
    if (promoTab === 'active')  return p.status === 'active';
    if (promoTab === 'pending') return p.status === 'pending';
    return ['expired', 'rejected', 'cancelled'].includes(p.status);
  });

  const counts = {
    active:  promotions.filter(p => p.status === 'active').length,
    pending: promotions.filter(p => p.status === 'pending').length,
    expired: promotions.filter(p => ['expired','rejected','cancelled'].includes(p.status)).length,
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    }) : 'N/A';

  const renderMyPromotions = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.subTabs}>
        {(['active', 'pending', 'expired'] as PromoTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.subTab, promoTab === t && styles.subTabActive]}
            onPress={() => setPromoTab(t)}
          >
            <Text style={[styles.subTabText, promoTab === t && styles.subTabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {counts[t] > 0 ? ` (${counts[t]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No {promoTab} promotions</Text>
          <Text style={styles.emptySubtitle}>
            {promoTab === 'active' ? 'Boost an ad to get more visibility.'
              : promoTab === 'pending' ? 'No submissions awaiting review.'
              : 'Your past promotions will show here.'}
          </Text>
          {promoTab === 'active' && (
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setMainTab('promote')}>
              <Text style={styles.emptyBtnText}>Boost an Ad</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={GREEN} />}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.expired;
            return (
              <View style={styles.promoCard}>
                <View style={styles.promoTopRow}>
                  <Text style={styles.promoName}>
                    {TYPE_LABELS[item.promotion_type] ?? item.promotion_type}
                    {item.bundle_name ? ` — ${item.bundle_name.replace(/_/g, ' ')}` : ''}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.promoPriceText}>
                  ₦{Number(item.amount_paid).toLocaleString()}{' '}
                  <Text style={styles.promoPeriod}>/{PLAN_DURATION_LABELS[item.plan_duration]?.toLowerCase()}</Text>
                </Text>
                <View style={styles.promoDatesRow}>
                  <Text style={styles.promoDateText}>Expires: {formatDate(item.expires_at)}</Text>
                  {item.status === 'active' && (
                    <Text style={styles.promoViews}>{(item.view_count ?? 0).toLocaleString()} views</Text>
                  )}
                </View>
                {['expired', 'rejected'].includes(item.status) && (
                  <TouchableOpacity
                    style={styles.renewBtn}
                    onPress={() => navigation.navigate('AdSelection', {
                      promotionType: item.promotion_type,
                      bundleName: item.bundle_name ?? undefined,
                      preselectedProductId: item.product_id,
                    })}
                  >
                    <Text style={styles.renewBtnText}>Renew</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mainTabs}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'promote' && styles.mainTabActive]}
          onPress={() => setMainTab('promote')}
        >
          <Text style={[styles.mainTabText, mainTab === 'promote' && styles.mainTabTextActive]}>Promote</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'my_promotions' && styles.mainTabActive]}
          onPress={() => setMainTab('my_promotions')}
        >
          <Text style={[styles.mainTabText, mainTab === 'my_promotions' && styles.mainTabTextActive]}>
            My Promotions{promotions.length > 0 ? ` (${promotions.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && mainTab === 'promote' ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : mainTab === 'promote' ? renderPromote() : renderMyPromotions()}

      {/* ── Waitlist Modal ── */}
      <Modal visible={!!waitlistModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => { setWaitlistModal(null); setWaitlistJoined(false); }}
            >
              <X size={24} color="#111827" />
            </TouchableOpacity>

            {waitlistJoined ? (
              <>
                <Text style={styles.modalTitle}>You're on the list! 🎉</Text>
                <Text style={styles.modalDesc}>
                  We'll notify you the moment a carousel slot opens up. You'll be first in line.
                </Text>
                <TouchableOpacity
                  style={styles.greenBtn}
                  onPress={() => { setWaitlistModal(null); setWaitlistJoined(false); }}
                >
                  <Text style={styles.greenBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Carousel Slots Full 🎠</Text>
                <Text style={styles.modalDesc}>
                  All carousel slots for bundles are currently reserved. Join the waitlist and we'll notify you the moment one opens up.
                </Text>
                <TouchableOpacity
                  style={[styles.greenBtn, waitlistLoading && { opacity: 0.6 }]}
                  onPress={() => waitlistModal && handleJoinWaitlist(waitlistModal)}
                  disabled={waitlistLoading}
                >
                  {waitlistLoading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.greenBtnText}>Join Waitlist — Free</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => setWaitlistModal(null)}
                >
                  <Text style={styles.ghostBtnText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Market Leader Contact Modal ── */}
      <Modal visible={contactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setContactModal(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Get Market Leader 👑</Text>
            <Text style={styles.modalDesc}>
              Our team will set this up for you personally. Reach us instantly — we respond fast.
            </Text>

            <TouchableOpacity style={styles.contactBtn} onPress={openWhatsApp}>
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>WhatsApp Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={openCall}>
              <Phone size={20} color={GREEN} />
              <Text style={[styles.contactBtnText, { color: GREEN }]}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactBtn, styles.smsBtn]} onPress={openSMS}>
              <MessageCircle size={20} color="#1565C0" />
              <Text style={[styles.contactBtnText, { color: '#1565C0' }]}>Send SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: '#FFFFFF' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  mainTabs:             { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  mainTab:              { flex: 1, paddingVertical: 13, alignItems: 'center' },
  mainTabActive:        { borderBottomWidth: 3, borderBottomColor: GREEN },
  mainTabText:          { fontSize: 15, color: GRAY, fontWeight: '500' },
  mainTabTextActive:    { color: GREEN, fontWeight: '700' },
  scroll:               { padding: 20 },
  walletBar:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 24, gap: 6 },
  walletText:           { fontSize: 14, color: '#4B5563' },
  walletValue:          { fontWeight: '700', color: '#111827' },
  sectionTitle:         { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16, marginTop: 8 },
  planCard:             { padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16, backgroundColor: '#FFFFFF' },
  planCardDisabled:     { opacity: 0.5 },
  planHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName:             { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  availableBadge:       { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  availableText:        { fontSize: 12, fontWeight: '700', color: '#166534' },
  soldOutBadge:         { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  soldOutText:          { fontSize: 12, fontWeight: '700', color: '#B91C1C' },
  enterpriseBadge:      { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  enterpriseText:       { fontSize: 12, fontWeight: '700', color: '#92400E' },
  planPrice:            { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  planDesc:             { fontSize: 14, color: GRAY, lineHeight: 20, marginBottom: 20 },
  subscribeBtn:         { height: 48, backgroundColor: GREEN, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  subscribeBtnDisabled: { backgroundColor: '#9CA3AF' },
  subscribeBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  enterpriseBtn:        { backgroundColor: '#92400E' },
  subTabs:              { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  subTab:               { flex: 1, paddingVertical: 12, alignItems: 'center' },
  subTabActive:         { borderBottomWidth: 3, borderBottomColor: GREEN },
  subTabText:           { fontSize: 14, color: GRAY, fontWeight: '500' },
  subTabTextActive:     { color: GREEN, fontWeight: '700' },
  emptyContainer:       { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle:           { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle:        { fontSize: 14, color: GRAY, textAlign: 'center', marginBottom: 24 },
  emptyBtn:             { backgroundColor: GREEN, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText:         { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  promoCard:            { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 12 },
  promoTopRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  promoName:            { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  statusBadge:          { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText:           { fontSize: 12, fontWeight: '700' },
  promoPriceText:       { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  promoPeriod:          { fontSize: 14, fontWeight: '400', color: GRAY },
  promoDatesRow:        { flexDirection: 'row', justifyContent: 'space-between' },
  promoDateText:        { fontSize: 13, color: GRAY },
  promoViews:           { fontSize: 13, color: GRAY },
  renewBtn:             { marginTop: 12, height: 40, borderWidth: 1.5, borderColor: GREEN, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  renewBtnText:         { color: GREEN, fontWeight: '700', fontSize: 14 },
  // Modals
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent:         { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  modalClose:           { alignSelf: 'flex-end', marginBottom: 8 },
  modalTitle:           { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 10 },
  modalDesc:            { fontSize: 14, color: GRAY, lineHeight: 22, marginBottom: 24 },
  greenBtn:             { height: 52, backgroundColor: GREEN, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  greenBtnText:         { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  ghostBtn:             { height: 52, backgroundColor: '#F9FAFB', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  ghostBtnText:         { color: '#111827', fontWeight: '600', fontSize: 16 },
  contactBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, backgroundColor: '#075E54', borderRadius: 26, marginBottom: 12 },
  contactBtnText:       { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  callBtn:              { backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: GREEN },
  smsBtn:               { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#1565C0' },
});