// App.tsx - UPDATED with MainTabNavigator and Presence
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import { usePresence } from './src/hooks/usePresence'; // ✅ ADD THIS
import SplashScreen from './src/screens/splash/SplashScreen';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { AuthWelcomeScreen } from './src/screens/auth/AuthWelcomeScreen';
import { CreateAccountWelcomeScreen } from './src/screens/auth/CreateAccountWelcomeScreen';
import { NameCollectionScreen } from './src/screens/auth/NameCollectionScreen';
import { AccountSuccessScreen } from './src/screens/auth/AccountSuccessScreen';
import { PhoneVerifyScreen } from './src/screens/auth/PhoneVerifyScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthWelcome: undefined;
  SignIn: undefined;
  CreateAccountWelcome: undefined;
  CreateAccountForm: undefined;
  NameCollection: {
    email: string;
    password: string;
    keepLoggedIn?: boolean;
  };
  AccountSuccess: undefined;
  MainApp: undefined;
  PhoneVerify: { phoneNumber: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { user, loading } = useAuth();
  usePresence(); // ✅ ADD THIS - Tracks online/offline status

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008102" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
            <Stack.Screen
              name="CreateAccountWelcome"
              component={CreateAccountWelcomeScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 600,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 600,
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="NameCollection"
              component={NameCollectionScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
            <Stack.Screen name="AccountSuccess" component={AccountSuccessScreen} />
            <Stack.Screen name="PhoneVerify" component={PhoneVerifyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});