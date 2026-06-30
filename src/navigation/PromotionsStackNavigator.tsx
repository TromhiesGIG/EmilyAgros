// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/navigation/PromotionsStackNavigator.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PromotionsStackParamList } from './types';
import { PromotionTypeScreen }        from '../screens/promotions/PromotionTypeScreen';
import { AdSelectionScreen }          from '../screens/promotions/AdSelectionScreen';
import { PlanSelectionScreen }        from '../screens/promotions/PlanSelectionScreen';
import { PromotionPaymentScreen }     from '../screens/promotions/PromotionPaymentScreen';
import { PromotionConfirmationScreen } from '../screens/promotions/PromotionConfirmationScreen';
import { MyPromotionsScreen }         from '../screens/promotions/MyPromotionsScreen';

const Stack = createNativeStackNavigator<PromotionsStackParamList>();

export const PromotionsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyPromotions"          component={MyPromotionsScreen} />
    <Stack.Screen name="PromotionType"         component={PromotionTypeScreen} />
    <Stack.Screen name="AdSelection"           component={AdSelectionScreen} />
    <Stack.Screen name="PlanSelection"         component={PlanSelectionScreen} />
    <Stack.Screen name="PromotionPayment"      component={PromotionPaymentScreen} />
    <Stack.Screen name="PromotionConfirmation" component={PromotionConfirmationScreen} />
  </Stack.Navigator>
);


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: ADDITIONS TO src/navigation/types.ts
// Add PromotionsStackParamList + HomeStack additions below your existing types
// ─────────────────────────────────────────────────────────────────────────────

/*
import { PromotionType, PlanDuration, BundleName, PromotionStatus } from '../types/promotions';

// ── Promotions Stack ─────────────────────────────────────────────────────────
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
  };
};

// ── Add these to your HomeStackParamList ────────────────────────────────────
// (merge into your existing HomeStackParamList, don't replace it)
//
//   PromotionType:         { productId?: string } | undefined;
//   AdSelection:           { promotionType: PromotionType; bundleName?: BundleName; preselectedProductId?: string; };
//   PlanSelection:         { promotionType: PromotionType; bundleName?: BundleName; productId: string; productTitle: string; };
//   PromotionPayment:      { promotionType: PromotionType; bundleName?: BundleName; productId: string; productTitle: string; planDuration: PlanDuration; amount: number; };
//   PromotionConfirmation: { promotionType: PromotionType; planDuration: PlanDuration; expiresAt?: string; status: PromotionStatus; };
//   MyPromotions:          undefined;
//   WalletRecharge:        undefined;   // already exists — confirm it's in HomeStackParamList
*/


// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: CHANGES TO src/navigation/HomeStackNavigator.tsx
// Add these 6 screens inside your existing Stack.Navigator
// ─────────────────────────────────────────────────────────────────────────────

/*
// Add these imports at the top of HomeStackNavigator.tsx:
import { PromotionTypeScreen }         from '../screens/promotions/PromotionTypeScreen';
import { AdSelectionScreen }           from '../screens/promotions/AdSelectionScreen';
import { PlanSelectionScreen }         from '../screens/promotions/PlanSelectionScreen';
import { PromotionPaymentScreen }      from '../screens/promotions/PromotionPaymentScreen';
import { PromotionConfirmationScreen } from '../screens/promotions/PromotionConfirmationScreen';
import { MyPromotionsScreen }          from '../screens/promotions/MyPromotionsScreen';

// Add these Stack.Screen entries inside your <Stack.Navigator>:
<Stack.Screen name="PromotionType"         component={PromotionTypeScreen} />
<Stack.Screen name="AdSelection"           component={AdSelectionScreen} />
<Stack.Screen name="PlanSelection"         component={PlanSelectionScreen} />
<Stack.Screen name="PromotionPayment"      component={PromotionPaymentScreen} />
<Stack.Screen name="PromotionConfirmation" component={PromotionConfirmationScreen} />
<Stack.Screen name="MyPromotions"          component={MyPromotionsScreen} />
*/


// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: CHANGES TO src/navigation/MainTabNavigator.tsx
// Add the Promotions tab (the tab version — lightning bolt icon)
// ─────────────────────────────────────────────────────────────────────────────

/*
// Add this import:
import { PromotionsStackNavigator } from './PromotionsStackNavigator';
import { Zap } from 'lucide-react-native';   // or whichever icon fits your tab bar style

// Add this Tab.Screen inside your <Tab.Navigator>:
<Tab.Screen
  name="PromotionsTab"
  component={PromotionsStackNavigator}
  options={{
    tabBarLabel: 'Promote',
    tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
    headerShown: false,
  }}
/>
*/


// ─────────────────────────────────────────────────────────────────────────────
// FILE 5: BOOST BUTTON ON MyAdsScreen
// Add a "Boost" button to each ad row in MyAdsScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────

/*
// In MyAdsScreen.tsx, inside renderItem for each ad card, add:

<TouchableOpacity
  style={boostBtnStyle}
  onPress={() => navigation.navigate('PromotionType', { productId: item.id })}
>
  <Text>⚡ Boost</Text>
</TouchableOpacity>

// Style suggestion:
const boostBtnStyle = {
  backgroundColor: '#FFF3E0',
  borderWidth: 1,
  borderColor: '#E65100',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 6,
};
*/