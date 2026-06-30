// src/types/promotions.ts

export type PromotionType = 'carousel' | 'trending' | 'search_ad' | 'bundle';
export type PlanDuration = '1_week' | '1_month' | '3_months';
export type PromotionStatus = 'pending' | 'active' | 'expired' | 'rejected' | 'cancelled';
export type PaymentMethod = 'wallet' | 'flutterwave';
export type BundleName = 'starter' | 'grower' | 'agri_pro' | 'market_leader';
export type ViewSource = 'carousel' | 'trending' | 'search_ad';

export interface Promotion {
  id: string;
  seller_id: string;
  product_id: string;
  promotion_type: PromotionType;
  bundle_name: BundleName | null;
  plan_duration: PlanDuration;
  status: PromotionStatus;
  payment_method: PaymentMethod | null;
  amount_paid: number;
  flutterwave_tx_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerPromotionSummary extends Promotion {
  view_count: number;
}

export interface CarouselSlot {
  id: string;
  slot_number: 1 | 2 | 3;
  promotion_id: string | null;
  product_id: string | null;
  seller_id: string | null;
  is_available: boolean;
  expires_at: string | null;
  updated_at: string;
}

// ── Phase 0 (TestFlight) Pricing — from Pricing Strategy PDF ─────────────────
// All prices end in 9 (psychological pricing principle)
// Phase 0 = ~60% of Phase 1 rates

export const PROMOTION_PRICES: Record<string, Record<PlanDuration, number>> = {
  carousel: {
    '1_week':   2999,
    '1_month':  8999,
    '3_months': 22999,
  },
  trending: {
    '1_week':   1499,
    '1_month':  4499,
    '3_months': 11999,
  },
  search_ad: {
    '1_week':   499,
    '1_month':  1499,
    '3_months': 4999,   // 5 Ads/Month at Phase 0
  },
};

export const BUNDLE_PRICES: Record<BundleName, number> = {
  starter:       5999,
  grower:        17999,
  agri_pro:      29999,
  market_leader: 59999,
};

export const BUNDLE_DETAILS: Record<BundleName, {
  label: string;
  description: string;
  includes: string[];
  hasCarousel: boolean;
  isPremium: boolean;
  tag?: string;
}> = {
  starter: {
    label: 'Starter',
    description: 'Perfect for new sellers getting started',
    includes: ['Trending — 1 Week', '5 Search Ads — 1 Month'],
    hasCarousel: false,
    isPremium: false,
  },
  grower: {
    label: 'Grower',
    description: 'Most popular — best value for active sellers',
    includes: ['Carousel Slot — 1 Month', 'Trending — 1 Month', '5 Search Ads'],
    hasCarousel: true,
    isPremium: false,
    tag: 'Most Popular',
  },
  agri_pro: {
    label: 'Agri-Pro',
    description: 'For serious agro sellers who want maximum reach',
    includes: ['Carousel Slot — 1 Month', 'Trending — 1 Month', '15 Search Ads', 'Verified Seller Badge'],
    hasCarousel: true,
    isPremium: true,
  },
  market_leader: {
    label: 'Market Leader',
    description: 'Own the entire app — all 3 carousel slots',
    includes: ['All 3 Carousel Slots — 1 Month', 'Trending — 1 Month', '30 Search Ads', 'Verified Seller Badge', 'Push Notification Blast'],
    hasCarousel: true,
    isPremium: true,
  },
};

export const PLAN_DURATION_LABELS: Record<PlanDuration, string> = {
  '1_week':   '1 Week',
  '1_month':  '1 Month',
  '3_months': '3 Months',
};

export const PLAN_DURATION_DAYS: Record<PlanDuration, number> = {
  '1_week':   7,
  '1_month':  30,
  '3_months': 90,
};

export interface PromotionFlowParams {
  promotionType: PromotionType;
  productId: string;
  productTitle: string;
  planDuration: PlanDuration;
  amount: number;
  bundleName?: BundleName;
}