// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, PlusCircle, MessageSquare, MoreHorizontal } from 'lucide-react-native';
import { MainTabParamList } from './types';
import { HomeStackNavigator } from './HomeStackNavigator';
import { SellStackNavigator } from './SellStackNavigator';
import { PlaceholderScreen } from '../screens/main/PlaceholderScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00A651',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      >
        {() => (
          <PlaceholderScreen
            title="Search"
            message="Search functionality coming soon"
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SellTab"
        component={SellStackNavigator}
        options={{
          tabBarLabel: 'Sell',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      >
        {() => (
          <PlaceholderScreen
            title="Messages"
            message="Messaging functionality coming soon"
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MoreTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};