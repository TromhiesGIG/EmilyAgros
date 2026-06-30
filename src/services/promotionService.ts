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

// ── Carousel Slots ───────────────────────────────────────────────────────────

/** Fetch all 3 carousel slots with their availability status */
export async function getCarouselSlots(): Promise<CarouselSlot[]> {
  const { data, error } = await supabase
    .from('carousel_slots')
    .select('*')
    .order('slot_number', { ascending: true });

  if (error) throw error;
  return data as CarouselSlot[];
}

/** Returns true if at least one carousel slot is available */
export async function isCarouselAvailable(): Promise<boolean> {
  const { data, error } = await supabase
    .from('carousel_slots')
    .select('id')
    .eq('is_available', true)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ── Seller's Ads ─────────────────────────────────────────────────────────────

/** Fetch seller's active ads for the AdSelectionScreen */
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

// ── Create Promotion ─────────────────────────────────────────────────────────

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

/**
 * Creates a promotion record. 
 * - Trending / Search Ads → status = 'active', sets starts_at + expires_at immediately
 * - Carousel → status = 'pending', also inserts into admin_queue
 * - Bundle → status depends on whether it contains carousel
 */
export async function createPromotion(params: CreatePromotionParams): Promise<Promotion> {
  const {
    sellerId,
    productId,
    promotionType,
    planDuration,
    paymentMethod,
    amountPaid,
    bundleName,
    flutterwaveTxId,
  } = params;

  const needsApproval = promotionType === 'carousel' ||
    (promotionType === 'bundle' && (bundleName === 'agri_pro' || bundleName === 'market_leader'));

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + PLAN_DURATION_DAYS[planDuration]);

  const promotionRecord = {
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
  };

  const { data, error } = await supabase
    .from('promotions')
    .insert(promotionRecord)
    .select()
    .single();

  if (error) throw error;

  const promotion = data as Promotion;

  // If carousel / premium bundle → add to admin_queue
  if (needsApproval) {
    const { error: queueError } = await supabase
      .from('admin_queue')
      .insert({
        promotion_id: promotion.id,
        seller_id:    sellerId,
        product_id:   productId,
        status:       'pending',
      });

    if (queueError) throw queueError;
  }

  return promotion;
}

// ── Wallet Payment ───────────────────────────────────────────────────────────

/**
 * Deducts from wallet and creates the promotion in one flow.
 * Returns the created promotion on success.
 * Throws if balance is insufficient.
 */
export async function payWithWalletAndPromote(
  params: CreatePromotionParams
): Promise<Promotion> {
  const { sellerId, amountPaid } = params;

  // 1. Check wallet balance from profiles
  const { data: profile, error: walletError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', sellerId)
    .single();

  if (walletError) throw walletError;
  if (!profile || profile.wallet_balance < amountPaid) {
    throw new Error('INSUFFICIENT_BALANCE');
  }

  // 2. Deduct from profiles.wallet_balance
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ wallet_balance: profile.wallet_balance - amountPaid })
    .eq('id', sellerId);

  if (deductError) throw deductError;

  // 3. Create promotion
  return createPromotion({ ...params, paymentMethod: 'wallet' });
}

// ── Seller Promotions ────────────────────────────────────────────────────────

/** Fetch seller's promotions from the summary view (includes view_count) */
export async function getMyPromotions(sellerId: string): Promise<SellerPromotionSummary[]> {
  const { data, error } = await supabase
    .from('seller_promotions_summary')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SellerPromotionSummary[];
}

/** Fetch wallet balance from profiles.wallet_balance */
export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.wallet_balance ?? 0;
}

// ── View Tracking ────────────────────────────────────────────────────────────

/** Record a view for a promoted product. Call when a promoted ad appears on screen. */
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
  // Fire-and-forget — don't block UI on view recording
}