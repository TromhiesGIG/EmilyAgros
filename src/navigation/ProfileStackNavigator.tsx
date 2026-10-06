// src/navigation/ProfileStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';
import { FAQsScreen } from '../screens/main/FAQsScreen';
import { AboutScreen } from '../screens/main/AboutScreen';
import { SignInMethodsScreen } from '../screens/main/SignInMethodsScreen';


import { ProfileScreen }          from '../screens/main/ProfileScreen';
import { AccountSettingsScreen }  from '../screens/main/AccountSettingsScreen';
import { PersonalInfo }           from '../screens/main/PersonalInfo';
import { EmailAddressScreen }     from '../screens/main/EmailAddressScreen';
import { ChangePasswordScreen }   from '../screens/main/ChangePasswordScreen';
import { GeneralSettingsScreen }  from '../screens/main/GeneralSettingsScreen';
import { ManageNotifications }    from '../screens/main/ManageNotifications';
import { MyAdsScreen }            from '../screens/main/MyAdsScreen';
import { AdDetailsScreen }        from '../screens/main/AdDetailsScreen';
import { MyWalletScreen }         from '../screens/main/MyWalletScreen';
import { WalletRechargeScreen }   from '../screens/main/WalletRechargeScreen';
import { FollowsScreen }          from '../screens/main/FollowsScreen';
import { SavedItemsScreen }       from '../screens/main/SavedItemsScreen';
import { SubscriptionsScreen }    from '../screens/main/SubscriptionsScreen';

import { UseCreditsScreen } from '../screens/promotions/UseCreditsScreen';
import { LocationAccessScreen }   from '../screens/main/LocationAccessScreen';
import { TransactionHistoryScreen } from '../screens/main/TransactionHistoryScreen';
import { DeleteAccountScreen }        from '../screens/main/DeleteAccountScreen';
import { ManageNotificationsScreen }  from '../screens/main/ManageNotificationsScreen';

import { PermissionsScreen }          from '../screens/main/PermissionsScreen';




// Promotion flow screens
import { AdSelectionScreen }           from '../screens/promotions/AdSelectionScreen';
import { PlanSelectionScreen }         from '../screens/promotions/PlanSelectionScreen';
import { PromotionPaymentScreen }      from '../screens/promotions/PromotionPaymentScreen';
import { PromotionConfirmationScreen } from '../screens/promotions/PromotionConfirmationScreen';
import { HelpSupportScreen } from '../screens/main/HelpSupportScreen';


const Stack = createStackNavigator<HomeStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile"          component={ProfileScreen} />
      <Stack.Screen name="UseCredits" component={UseCreditsScreen} />
      <Stack.Screen name="AccountSettings"  component={AccountSettingsScreen} />
      <Stack.Screen name="PersonalInfo"     component={PersonalInfo} />
      <Stack.Screen name="EmailAddress"     component={EmailAddressScreen} />
      <Stack.Screen name="ChangePassword"   component={ChangePasswordScreen} />
      <Stack.Screen name="GeneralSettings"  component={GeneralSettingsScreen} />
      <Stack.Screen name="LocationAccess"   component={LocationAccessScreen} />
      <Stack.Screen name="Permissions"      component={PermissionsScreen} />
      <Stack.Screen name="ManageNotifications" component={ManageNotifications} />
      <Stack.Screen name="MyAds"            component={MyAdsScreen} />
      <Stack.Screen name="AdDetails"        component={AdDetailsScreen} />
      <Stack.Screen name="MyWallet"         component={MyWalletScreen} />
      <Stack.Screen name="WalletRecharge"   component={WalletRechargeScreen} />
      <Stack.Screen name="Follows"          component={FollowsScreen} />
      <Stack.Screen name="SavedItems"       component={SavedItemsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="SignInMethods" component={SignInMethodsScreen} />
      <Stack.Screen name="DeleteAccount"       component={DeleteAccountScreen} />
   
      {/* Subscriptions — now home of the full promotions system */}
      <Stack.Screen name="Subscriptions"    component={SubscriptionsScreen} />

      {/* Promotion flow — pushed from SubscriptionsScreen or MyAds Boost button */}
      <Stack.Screen name="AdSelection"           component={AdSelectionScreen} />
      <Stack.Screen name="PlanSelection"         component={PlanSelectionScreen} />
      <Stack.Screen name="PromotionPayment"      component={PromotionPaymentScreen} />
      <Stack.Screen name="PromotionConfirmation" component={PromotionConfirmationScreen} />
    </Stack.Navigator>
  );
};