// src/navigation/HomeStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';

// Existing Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { AllCategoriesScreen } from '../screens/categories/AllCategoriesScreen';
import { SubcategoriesScreen } from '../screens/categories/SubcategoriesScreen';
import { CategoryProductsScreen } from '../screens/categories/CategoryProductsScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';

// New Profile & Account Screens
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AccountSettingsScreen } from '../screens/main/AccountSettingsScreen';
import { PersonalInfo } from '../screens/main/PersonalInfo';
import { EmailAddressScreen } from '../screens/main/EmailAddressScreen';
import { ChangePasswordScreen } from '../screens/main/ChangePasswordScreen';

// New Settings & System Screens
import { GeneralSettingsScreen } from '../screens/main/GeneralSettingsScreen';
import { ManageNotifications } from '../screens/main/ManageNotifications';
import { LocationAccessScreen } from '../screens/main/LocationAccessScreen';
import { PermissionsScreen } from '../screens/main/PermissionsScreen';

// New Marketplace & Social Screens
import { MyAdsScreen } from '../screens/main/MyAdsScreen';
import { AdDetailsScreen } from '../screens/main/AdDetailsScreen';
import { SavedItemsScreen } from '../screens/main/SavedItemsScreen';
import { FollowsScreen } from '../screens/main/FollowsScreen';

// New Financial & Subscription Screens
import { MyWalletScreen } from '../screens/main/MyWalletScreen';
import { WalletRechargeScreen } from '../screens/main/WalletRechargeScreen';
import { SubscriptionsScreen } from '../screens/main/SubscriptionsScreen';
import { PlanManagementScreen } from '../screens/main/PlanManagmentScreen';
import { ChatDetail } from '../screens/main/ChatDetail';

// Seller Profile & Reviews
import { SellerProfileScreen } from '../screens/main/SellerProfileScreen';
import { LeaveReviewScreen } from '../screens/main/LeaveReviewScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Core Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AllCategories" component={AllCategoriesScreen} />
      <Stack.Screen name="Subcategories" component={SubcategoriesScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

      {/* Profile & Account Management */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="EmailAddress" component={EmailAddressScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

      {/* Settings & System */}
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
      <Stack.Screen name="ManageNotifications" component={ManageNotifications} />
      <Stack.Screen name="LocationAccess" component={LocationAccessScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />

      {/* Marketplace & Social */}
      <Stack.Screen name="MyAds" component={MyAdsScreen} />
      <Stack.Screen name="AdDetails" component={AdDetailsScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="Follows" component={FollowsScreen} />
      
      {/* Seller Profile & Reviews */}
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
      <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} />
      
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetail}
        options={{ 
          presentation: 'card',
          headerShown: false
        }} 
      />

      {/* Financials & Subscriptions */}
      <Stack.Screen name="MyWallet" component={MyWalletScreen} />
      <Stack.Screen name="WalletRecharge" component={WalletRechargeScreen} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Stack.Screen name="PlanManagement" component={PlanManagementScreen} />
    </Stack.Navigator>
  );
};