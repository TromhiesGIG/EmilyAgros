// src/navigation/SearchStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchScreen }        from '../screens/main/SearchScreen';
import { SearchResultsScreen } from '../screens/main/SearchResultsScreen';

const Stack = createStackNavigator();

export const SearchStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchHome"    component={SearchScreen} />
    <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
  </Stack.Navigator>
);