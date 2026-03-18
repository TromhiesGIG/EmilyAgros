// src/navigation/types.ts
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: any;
  subcategories: SubCategory[];
}

// 1. Define the Bottom Tab routes
export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  MessagesTab: undefined;
  SellTab: undefined;
  ChatTab: undefined;
  MoreTab: undefined; // This will hold your ProfileStackNavigator
};

// 2. Define the Stack routes (This matches your current list)
export type SellStackParamList = {
  CategorySelection: { currentCategory?: Category };
  SubcategorySelection: { category: Category; currentSubcategory?: SubCategory };
  PostNewAd: { selectedCategory?: Category; selectedSubcategory?: SubCategory };
};

export type HomeStackParamList = {
  Home: undefined;
  AllCategories: undefined;
  ProductDetail: { productId: string };
  
  Profile: undefined;
  AccountSettings: undefined;
  PersonalInfo: undefined;
  EmailAddress: undefined;
  ChangePassword: undefined;
  
  GeneralSettings: undefined;
  ManageNotifications: undefined;
  LocationAccess: undefined;
  Permissions: undefined;
  
  MyAds: undefined;
  AdDetails: { adId: string };
  SavedItems: undefined;
  Follows: undefined;
  
  MyWallet: undefined;
  WalletRecharge: undefined;
  Subscriptions: undefined;
  PlanManagement: undefined;

  ChatDetail: { 
    chatId: string; 
    sellerName: string; 
    adTitle: string; 
    adPrice: number; 
    adImage: string; 
    phoneNumber?: string; 
  };
};

// 3. Helper type for screen props (Optional but very helpful for your components)
export type ProfileStackScreenProps<T extends keyof HomeStackParamList> = 
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;