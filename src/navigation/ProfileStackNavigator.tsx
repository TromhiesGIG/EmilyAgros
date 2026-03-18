// src/navigation/ProfileStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';

// Import all the screens
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AccountSettingsScreen } from '../screens/main/AccountSettingsScreen';
import { PersonalInfo } from '../screens/main/PersonalInfo';
import { EmailAddressScreen } from '../screens/main/EmailAddressScreen';
import { ChangePasswordScreen } from '../screens/main/ChangePasswordScreen';
import { GeneralSettingsScreen } from '../screens/main/GeneralSettingsScreen';
import { ManageNotifications } from '../screens/main/ManageNotifications';
import { MyAdsScreen } from '../screens/main/MyAdsScreen';
import { AdDetailsScreen } from '../screens/main/AdDetailsScreen';
import { MyWalletScreen } from '../screens/main/MyWalletScreen';
import { WalletRechargeScreen } from '../screens/main/WalletRechargeScreen';
import { FollowsScreen } from '../screens/main/FollowsScreen';
import { SavedItemsScreen } from '../screens/main/SavedItemsScreen';
import { SubscriptionsScreen } from '../screens/main/SubscriptionsScreen';
import { PlanManagementScreen } from '../screens/main/PlanManagmentScreen';
import { PermissionsScreen } from '../screens/main/PermissionsScreen';
import { LocationAccessScreen } from '../screens/main/LocationAccessScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="EmailAddress" component={EmailAddressScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
      <Stack.Screen name="LocationAccess" component={LocationAccessScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />

      <Stack.Screen name="ManageNotifications" component={ManageNotifications} />
      <Stack.Screen name="MyAds" component={MyAdsScreen} />
      <Stack.Screen name="AdDetails" component={AdDetailsScreen} />
      <Stack.Screen name="MyWallet" component={MyWalletScreen} />
      <Stack.Screen name="WalletRecharge" component={WalletRechargeScreen} />
      <Stack.Screen name="Follows" component={FollowsScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Stack.Screen name="PlanManagement" component={PlanManagementScreen} />
    </Stack.Navigator>
  );
};
