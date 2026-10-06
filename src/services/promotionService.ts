// src/services/promotionService.ts

import { supabase } from './supabase';
import {
  Promotion,
  SellerPromotionSummary,
  CarouselSlot,
  PromotionType,
  PlanDuration,
  PaymentMethod,
  BundleName,
  PLAN_DURATION_DAYS,
} from '../types/promotions';

// Search ad credits per bundle
const BUNDLE_SEARCH_AD_CREDITS: Record<string, number> = {
  starter:       5,
  grower:        5,
  agri_pro:      15,
  market_leader: 30,
};

/** Fetch all carousel slots */
export async function getCarouselSlots(): Promise<CarouselSlot[]> {
  const { data, error } = await supabase
    .from('carousel_slots')
    .select('*')
    .order('slot_number', { ascending: true });
  if (error) throw error;
  return data as CarouselSlot[];
}

/** Returns true if at least one STANDALONE carousel slot is available */
export async function isCarouselAvailable(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_standalone_carousel_available');
  if (error) {
    const { data: slots } = await supabase
      .from('carousel_slots')
      .select('id')
      .eq('slot_purpose', 'standalone')
      .eq('is_available', true)
      .limit(1);
    return (slots?.length ?? 0) > 0;
  }
  return data === true;
}

/** Returns true if at least one BUNDLE carousel slot is available */
export async function isBundleCarouselAvailable(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_bundle_carousel_available');
  if (error) {
    const { data: slots } = await supabase
      .from('carousel_slots')
      .select('id')
      .eq('slot_purpose', 'bundle')
      .eq('is_available', true)
      .limit(1);
    return (slots?.length ?? 0) > 0;
  }
  return data === true;
}

/** Fetch seller's active ads for AdSelectionScreen */
export async function getSellerActiveAds(sellerId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, images, status')
    .eq('user_id', sellerId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Join the waitlist for a carousel-dependent promotion */
export async function joinWaitlist(
  sellerId: string,
  promotionType: 'carousel' | 'bundle',
  bundleName?: string,
  contactPhone?: string,
  preferredContact?: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('promotion_waitlist')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('bundle_name', bundleName ?? null)
    .eq('status', 'waiting')
    .maybeSingle();

  if (existing) return;

  await supabase.from('promotion_waitlist').insert({
    seller_id:         sellerId,
    promotion_type:    promotionType,
    bundle_name:       bundleName ?? null,
    status:            'waiting',
    contact_phone:     contactPhone ?? null,
    preferred_contact: preferredContact ?? 'whatsapp',
  });
}

/** Fetch seller's bundle credits */
export async function getBundleCredits(sellerId: string) {
  const { data, error } = await supabase
    .from('bundle_credits')
    .select('*')
    .eq('seller_id', sellerId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    ...c,
    remaining: c.total_credits - c.used_credits,
  }));
}

/** Use one search ad credit to promote an ad */
export async function useSearchAdCredit(
  creditId: string,
  sellerId: string,
  productId: string,
  expiresAt: string
): Promise<void> {
  // 1. Get the credit
  const { data: credit, error: creditError } = await supabase
    .from('bundle_credits')
    .select('*')
    .eq('id', creditId)
    .eq('seller_id', sellerId)
    .single();

  if (creditError || !credit) throw new Error('Credit not found');
  if (credit.used_credits >= credit.total_credits) throw new Error('NO_CREDITS_REMAINING');

  // 2. Check no active search_ad for this product already
  const { data: existing } = await supabase
    .from('promotions')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('product_id', productId)
    .eq('promotion_type', 'search_ad')
    .eq('status', 'active')
    .maybeSingle();

  if (existing) throw new Error('ALREADY_ACTIVE');

  // 3. Create search_ad promotion (free — paid through bundle)
  const now = new Date();
  await supabase.from('promotions').insert({
    seller_id:      sellerId,
    product_id:     productId,
    promotion_type: 'search_ad',
    plan_duration:  '1_month',
    status:         'active',
    payment_method: 'wallet',
    amount_paid:    0, // covered by bundle
    starts_at:      now.toISOString(),
    expires_at:     expiresAt, // same expiry as the bundle credit
  });

  // 4. Deduct credit
  await supabase
    .from('bundle_credits')
    .update({ used_credits: credit.used_credits + 1 })
    .eq('id', creditId);
}

interface CreatePromotionParams {
  sellerId: string;
  productId: string;
  promotionType: PromotionType;
  planDuration: PlanDuration;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  bundleName?: BundleName;
  flutterwaveTxId?: string;
}

export async function createPromotion(params: CreatePromotionParams): Promise<Promotion> {
  const {
    sellerId, productId, promotionType, planDuration,
    paymentMethod, amountPaid, bundleName, flutterwaveTxId,
  } = params;

  const needsApproval = promotionType === 'carousel' ||
    (promotionType === 'bundle' &&
      (bundleName === 'agri_pro' || bundleName === 'market_leader' || bundleName === 'grower'));

  const now       = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + PLAN_DURATION_DAYS[planDuration]);

  const { data, error } = await supabase
    .from('promotions')
    .insert({
      seller_id:         sellerId,
      product_id:        productId,
      promotion_type:    promotionType,
      bundle_name:       bundleName ?? null,
      plan_duration:     planDuration,
      status:            needsApproval ? 'pending' : 'active',
      payment_method:    paymentMethod,
      amount_paid:       amountPaid,
      flutterwave_tx_id: flutterwaveTxId ?? null,
      starts_at:         needsApproval ? null : now.toISOString(),
      expires_at:        needsApproval ? null : expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  const promotion = data as Promotion;

  // Add to admin queue if needs approval
  if (needsApproval) {
    await supabase.from('admin_queue').insert({
      promotion_id: promotion.id,
      seller_id:    sellerId,
      product_id:   productId,
      status:       'pending',
    });
  }

  // If bundle — auto-create search ad credits
  if (promotionType === 'bundle' && bundleName) {
    const creditCount = BUNDLE_SEARCH_AD_CREDITS[bundleName] ?? 0;
    if (creditCount > 0) {
      await supabase.from('bundle_credits').insert({
        seller_id:     sellerId,
        bundle_name:   bundleName,
        promotion_id:  promotion.id,
        credit_type:   'search_ad',
        total_credits: creditCount,
        used_credits:  0,
        expires_at:    expiresAt.toISOString(),
      });
    }

    // Auto-activate Trending for starter bundle (no carousel needed)
    if (bundleName === 'starter') {
      const trendingExpiry = new Date(now);
      trendingExpiry.setDate(trendingExpiry.getDate() + 7); // 1 week trending
      await supabase.from('promotions').insert({
        seller_id:      sellerId,
        product_id:     productId,
        promotion_type: 'trending',
        plan_duration:  '1_week',
        status:         'active',
        payment_method: paymentMethod,
        amount_paid:    0, // covered by bundle
        starts_at:      now.toISOString(),
        expires_at:     trendingExpiry.toISOString(),
      });
    }

    // Auto-activate Trending for Grower, Agri-Pro, Market Leader (1 month)
    if (['grower', 'agri_pro', 'market_leader'].includes(bundleName)) {
      await supabase.from('promotions').insert({
        seller_id:      sellerId,
        product_id:     productId,
        promotion_type: 'trending',
        plan_duration:  '1_month',
        status:         'active',
        payment_method: paymentMethod,
        amount_paid:    0, // covered by bundle
        starts_at:      now.toISOString(),
        expires_at:     expiresAt.toISOString(),
      });
    }
  }

  return promotion;
}

export async function payWithWalletAndPromote(
  params: CreatePromotionParams
): Promise<Promotion> {
  const { sellerId, productId, promotionType, amountPaid } = params;

  // 1. Check for duplicate
  const { data: existing } = await supabase
    .from('promotions')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('product_id', productId)
    .eq('promotion_type', promotionType)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) throw new Error('ALREADY_ACTIVE');

  // 2. Check wallet
  const { data: profile, error: walletError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', sellerId)
    .single();

  if (walletError) throw walletError;
  if (!profile || profile.wallet_balance < amountPaid) {
    throw new Error('INSUFFICIENT_BALANCE');
  }

  // 3. Deduct wallet
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ wallet_balance: profile.wallet_balance - amountPaid })
    .eq('id', sellerId);

  if (deductError) throw deductError;

  // 4. Create promotion (credits + trending auto-activated inside)
  return createPromotion({ ...params, paymentMethod: 'wallet' });
}

/** Fetch seller's promotions with view counts */
export async function getMyPromotions(sellerId: string): Promise<SellerPromotionSummary[]> {
  const { data, error } = await supabase
    .from('seller_promotions_summary')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SellerPromotionSummary[];
}

/** Fetch wallet balance */
export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data?.wallet_balance ?? 0;
}

/** Record a promotion view */
export async function recordPromotionView(
  promotionId: string,
  productId: string,
  sellerId: string,
  viewSource: 'carousel' | 'trending' | 'search_ad',
  viewerId?: string
): Promise<void> {
  await supabase.from('promotion_views').insert({
    promotion_id: promotionId,
    product_id:   productId,
    seller_id:    sellerId,
    viewer_id:    viewerId ?? null,
    view_source:  viewSource,
  });
}