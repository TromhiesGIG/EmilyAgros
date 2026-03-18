// src/navigation/SellStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SellStackParamList } from './types';
import { PostNewAdScreen } from '../screens/sell/PostNewAdScreen';
import { CategorySelectionScreen } from '../screens/sell/CategorySelectionScreen';
import { SubcategorySelectionScreen } from '../screens/sell/SubcategorySelectionScreen';

const Stack = createStackNavigator<SellStackParamList>();

export const SellStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PostNewAd" component={PostNewAdScreen} />
      <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />
      <Stack.Screen name="SubcategorySelection" component={SubcategorySelectionScreen} />
    </Stack.Navigator>
    
  );
};