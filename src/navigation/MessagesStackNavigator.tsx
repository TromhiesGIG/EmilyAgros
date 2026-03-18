// src/navigation/MessagesStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MessagesInbox } from '../screens/main/MessagesInbox';
import { ChatDetail } from '../screens/main/ChatDetail';

const Stack = createStackNavigator();

export const MessagesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesInbox" component={MessagesInbox} />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetail}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
};