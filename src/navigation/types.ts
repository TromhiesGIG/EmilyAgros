// src/navigation/types.ts

import { PromotionType, PlanDuration, BundleName, PromotionStatus } from '../types/promotions';

export type HomeStackParamList = {
  Home: undefined;
  FAQs: undefined;
  About: undefined;
  DeleteAccount: undefined;
  SignInMethods: undefined;
  UseCredits: { creditId?: string } | undefined;
  HelpSupport: undefined;
  TransactionHistory: undefined;
  AllCategories: undefined;
  Subcategories: {
    categoryId: number;
    categoryName: string;
  };
  CategoryProducts: {
    categoryId: number;
    categoryName: string;
    subcategoryId?: number;
    subcategoryName?: string;
  };
  ProductDetail: { productId: string };
  AdDetails: { adId: string };
  // Profile & Account
  Profile: undefined;
  AccountSettings: undefined;
  PersonalInfo: undefined;
  EmailAddress: undefined;
  ChangePassword: undefined;
  // Settings
  GeneralSettings: undefined;
  ManageNotifications: undefined;
  LocationAccess: undefined;
  Permissions: undefined;
  // Marketplace & Social
  MyAds: undefined;
  SavedItems: undefined;
  Follows: undefined;
  SellerProfile: { sellerId: string };
  LeaveReview: { sellerId: string; sellerName: string };
  // Chat
  ChatDetail: {
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    adId?: string;
  };
  // Financial
  MyWallet: undefined;
  WalletRecharge: undefined;
  Subscriptions: undefined;
  PlanManagement: undefined;
  // Promotions (entry from MyAds Boost button or post-ad success)
  PromotionType: { productId?: string } | undefined;
  AdSelection: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    preselectedProductId?: string;
  };
  PlanSelection: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    productId: string;
    productTitle: string;
  };
  PromotionPayment: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    productId: string;
    productTitle: string;
    planDuration: PlanDuration;
    amount: number;
  };
  PromotionConfirmation: {
    promotionType: PromotionType;
    planDuration: PlanDuration;
    expiresAt?: string;
    status: PromotionStatus;
    amount?: number;
    productTitle?: string;
  };
  MyPromotions: undefined;
};

export type PromotionsStackParamList = {
  MyPromotions: undefined;
  PromotionType: { productId?: string } | undefined;
  AdSelection: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    preselectedProductId?: string;
  };
  PlanSelection: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    productId: string;
    productTitle: string;
  };
  PromotionPayment: {
    promotionType: PromotionType;
    bundleName?: BundleName;
    productId: string;
    productTitle: string;
    planDuration: PlanDuration;
    amount: number;
  };
  PromotionConfirmation: {
    promotionType: PromotionType;
    planDuration: PlanDuration;
    expiresAt?: string;
    status: PromotionStatus;
    amount?: number;
    productTitle?: string;
  };
};

export type RootTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  SellTab: undefined;
  MessagesTab: undefined;
  MoreTab: undefined;
  PromotionsTab: undefined;
};

export type SellStackParamList = {
  CategorySelection: {
    currentCategory?: Category;
  };
  SubcategorySelection: {
    category: Category;
    currentSubcategory?: SubCategory;
  };
  PostNewAd: {
    selectedCategory?: Category;
    selectedSubcategory?: SubCategory;
    category?: Category;
    subcategory?: SubCategory;
  };
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: any;
  subcategories?: SubCategory[];
  adCount?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  category_id?: number;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: number;
  subcategory_id?: number;
  price: number;
  negotiable: boolean;
  images: string[];
  status: string;
  location_state: string;
  location_lga: string;
  location_address?: string;
  contact_name?: string;
  contact_business?: string;
  contact_phone: string;
  contact_whatsapp: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export type MainTabParamList = RootTabParamList;