// src/navigation/AdminNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LayoutDashboard, ListChecks, Image, Users, Clock } from 'lucide-react-native';
import { AdminDashboardScreen }      from '../screens/admin/AdminDashboardScreen';
import { AdminQueueScreen }          from '../screens/admin/AdminQueueScreen';
import { AdminCarouselScreen }       from '../screens/admin/AdminCarouselScreen';
import { AdminPromotionsScreen }     from '../screens/admin/AdminPromotionsScreen';
import { AdminWaitlistScreen }       from '../screens/admin/AdminWaitlistScreen';
import { AdminMarketLeaderScreen }   from '../screens/admin/AdminMarketLeaderScreen';
import { useAuth }                   from '../providers/AuthProvider';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Promotions stack — includes Market Leader activation screen
const PromotionsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminPromotionsList" component={AdminPromotionsScreen} />
    <Stack.Screen name="AdminMarketLeader"   component={AdminMarketLeaderScreen} />
  </Stack.Navigator>
);

export const AdminNavigator = ({ navigation }: any) => {
  const { user, isAdmin, loading } = useAuth();

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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
        component={PromotionsStack}
        options={{
          tabBarLabel: 'Promos',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Waitlist"
        component={AdminWaitlistScreen}
        options={{
          tabBarLabel: 'Waitlist',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};