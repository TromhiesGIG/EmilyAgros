// src/navigation/AdminNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ListChecks, Image, Users } from 'lucide-react-native';
import { AdminDashboardScreen }  from '../screens/admin/AdminDashboardScreen';
import { AdminQueueScreen }      from '../screens/admin/AdminQueueScreen';
import { AdminCarouselScreen }   from '../screens/admin/AdminCarouselScreen';
import { AdminPromotionsScreen } from '../screens/admin/AdminPromotionsScreen';
import { useAuth }               from '../providers/AuthProvider';

const Tab = createBottomTabNavigator();

export const AdminNavigator = ({ navigation }: any) => {
  const { user, isAdmin, loading } = useAuth();

  // Security guard — only redirect after auth has finished loading
  React.useEffect(() => {
    if (!loading && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'AuthWelcome' }] });
    } else if (!loading && user && !isAdmin) {
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    }
  }, [user, isAdmin, loading]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   '#008102',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Queue"
        component={AdminQueueScreen}
        options={{
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Carousel"
        component={AdminCarouselScreen}
        options={{
          tabBarLabel: 'Carousel',
          tabBarIcon: ({ color, size }) => <Image size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Promotions"
        component={AdminPromotionsScreen}
        options={{
          tabBarLabel: 'All Promos',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};