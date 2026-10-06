// src/hooks/useSyncData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../providers/AuthProvider';

export interface Ad {
  id: string;
  title: string;
  category_id: number;
  price: number;
  status: 'Active' | 'Cancelled' | 'Sold';
  images: string[];
  views: number;
  negotiable: boolean;
  location_state: string;
  location_lga: string;
  location_address: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
}

export interface FollowRecord {
  follower_id?: string;
  following_id?: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'recharge' | 'subscription' | 'boost' | 'withdrawal';
  status: 'Pending' | 'Successful' | 'Failed';
  method: string;
  created_at: string;
  description?: string;
}

export interface SavedAd {
  id: string;
  ad_id: string;
  user_id: string;
  created_at: string;
  ads: Ad;
}

export interface SavedSearch {
  id: string;
  query: string;
  category_name?: string;
  location_name: string;
  created_at: string;
}

export interface Profile {
  full_name: string;
  avatar_url: string;
  bio?: string;
  phone_number?: string;
  activePlan?: string;
  activePlanId?: string;
  auto_renewal?: boolean;
  subscription_expires_at?: string;
}

export interface ChatMessage {
  id: string;
  sender_name: string;
  ad_title: string;
  ad_image: string;
  last_message: string;
  time_label: string;
  is_read: boolean;
  status: 'active' | 'spam';
}

const PROMO_LABELS: Record<string, string> = {
  carousel:  'Carousel Promotion',
  trending:  'Trending Promotion',
  search_ad: 'Search Ad Promotion',
  bundle:    'Bundle Subscription',
};

const BUNDLE_LABELS: Record<string, string> = {
  starter:       'Starter Bundle',
  grower:        'Grower Bundle',
  agri_pro:      'Agri-Pro Bundle',
  market_leader: 'Market Leader Bundle',
};

export const useSyncData = () => {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [myAds, setMyAds]             = useState<Ad[]>([]);
  const [savedAds, setSavedAds]       = useState<SavedAd[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [walletData, setWalletData]   = useState<{ balance: number; transactions: Transaction[] }>({
    balance: 0,
    transactions: [],
  });
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [followers, setFollowers]     = useState<FollowRecord[]>([]);
  const [following, setFollowing]     = useState<FollowRecord[]>([]);
  const [plans, setPlans]             = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [
        profileRes,
        adsRes,
        transRes,
        promoRes,
        savedRes,
        searchRes,
        followersRes,
        followingRes,
        plansRes,
        messagesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*, subscription_plans(name)').eq('id', user.id).single(),

        supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),

        // Fetch subscription payments
        supabase
          .from('promotions')
          .select('id, promotion_type, bundle_name, amount_paid, created_at, status')
          .eq('seller_id', user.id)
          .gt('amount_paid', 0)
          .order('created_at', { ascending: false }),

        supabase.from('saved_ads').select('*, ads(*)').eq('user_id', user.id),
        supabase.from('saved_searches').select('*').eq('user_id', user.id),
        supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(full_name, avatar_url)')
          .eq('following_id', user.id),
        supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(full_name, avatar_url)')
          .eq('follower_id', user.id),
        supabase.from('subscription_plans').select('*').order('price_amount', { ascending: true }),
        supabase
          .from('messages')
          .select('*, products(title, images), profiles!sender_id(full_name)')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      // Handle subscription expiry
      if (profileRes.data?.subscription_expires_at) {
        const expiry = new Date(profileRes.data.subscription_expires_at).getTime();
        const now    = new Date().getTime();
        const buffer = 5 * 60 * 1000;
        if (now > expiry + buffer && profileRes.data.active_plan_id !== 'free') {
          await supabase
            .from('profiles')
            .update({ active_plan_id: 'free', auto_renewal: false })
            .eq('id', user.id);
        }
      }

      if (profileRes.data) {
        const subData = profileRes.data.subscription_plans as any;
        setProfileData({
          full_name:                profileRes.data.full_name,
          avatar_url:               profileRes.data.avatar_url,
          bio:                      profileRes.data.bio,
          phone_number:             profileRes.data.phone_number,
          activePlan:               subData?.name || 'Free',
          activePlanId:             profileRes.data.active_plan_id,
          auto_renewal:             profileRes.data.auto_renewal ?? true,
          subscription_expires_at:  profileRes.data.subscription_expires_at,
        });

        // Convert promotions to Transaction shape (negative amount = debit)
        const promoTx: Transaction[] = (promoRes.data ?? []).map((p: any) => ({
          id:          `promo_${p.id}`,
          amount:      -Number(p.amount_paid),
          type:        'subscription' as const,
          status:      'Successful' as const,
          method:      'Wallet',
          created_at:  p.created_at,
          description: p.bundle_name
            ? BUNDLE_LABELS[p.bundle_name] ?? 'Bundle Subscription'
            : PROMO_LABELS[p.promotion_type] ?? 'Subscription',
        }));

        // Merge recharges + subscriptions, sort newest first
        const allTransactions: Transaction[] = [
          ...(transRes.data ?? []),
          ...promoTx,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setWalletData({
          balance:      profileRes.data.wallet_balance || 0,
          transactions: allTransactions,
        });
      }

      // Map Messages
      const mappedMessages: ChatMessage[] = (messagesRes.data || []).map((m: any) => ({
        id:           m.id,
        sender_name:  m.profiles?.full_name || 'Agro Member',
        ad_title:     m.products?.title || 'General Inquiry',
        ad_image:     m.products?.images?.[0] || 'https://via.placeholder.com/50',
        last_message: m.content,
        time_label:   'Now',
        is_read:      m.is_read,
        status:       m.status || 'active',
      }));

      setFollowers((followersRes.data as any) || []);
      setFollowing((followingRes.data as any) || []);
      setPlans(plansRes.data || []);
      setUserMessages(mappedMessages);
      setMyAds(adsRes.data || []);
      setSavedAds(savedRes.data || []);
      setSavedSearches(searchRes.data || []);
    } catch (error) {
      console.error('Sync Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteSavedItem = async (id: string, type: 'Ad' | 'Search') => {
    const table = type === 'Ad' ? 'saved_ads' : 'saved_searches';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) refreshAll();
    return !error;
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    profileData, myAds, walletData, savedAds, savedSearches,
    followers, following, loading, plans, userMessages,
    refresh: refreshAll, deleteSavedItem,
  };
};