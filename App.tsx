// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import { usePresence } from './src/hooks/usePresence';
import SplashScreen from './src/screens/splash/SplashScreen';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { AuthWelcomeScreen } from './src/screens/auth/AuthWelcomeScreen';
import { CreateAccountWelcomeScreen } from './src/screens/auth/CreateAccountWelcomeScreen';
import { NameCollectionScreen } from './src/screens/auth/NameCollectionScreen';
import { AccountSuccessScreen } from './src/screens/auth/AccountSuccessScreen';
import { PhoneVerifyScreen } from './src/screens/auth/PhoneVerifyScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { ConfirmationCodeScreen } from './src/screens/auth/ConfirmationCodeScreen';
import { ResetLinkSentScreen } from './src/screens/auth/ResetLinkSentScreen';
import { UpdatePasswordScreen } from './src/screens/auth/UpdatePasswordScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { AdminNavigator } from './src/navigation/AdminNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthWelcome: undefined;
  SignIn: undefined;
  CreateAccountWelcome: undefined;
  CreateAccountForm: undefined;
  NameCollection: {
    email?: string;
    password?: string;
    phoneNumber?: string;
    isPhoneAuth?: boolean;
    keepLoggedIn?: boolean;
  };
  AccountSuccess: undefined;
  MainApp: undefined;
  AdminApp: undefined;
  PhoneVerify: {
    phoneNumber: string;
    isSignup?: boolean;
  };
  ForgotPassword: undefined;
  ConfirmationCode: { phoneNumber: string };
  ResetLinkSent: { email: string };
  UpdatePassword: {
    phoneNumber?: string;
    access_token?: string;
    refresh_token?: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { user, isAdmin, loading } = useAuth();
  usePresence();

  // Show spinner OUTSIDE NavigationContainer while auth loads
  // This ensures NavigationContainer only mounts ONCE with the correct initialRouteName
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008102" />
      </View>
    );
  }

  const linking = {
    prefixes: ['emilyagros://', 'https://emilyagros.com'],
    config: {
      screens: {
        UpdatePassword: {
          path: 'reset-password',
          parse: {
            access_token: (token: string) => token,
            refresh_token: (token: string) => token,
          },
        },
        AuthWelcome: 'auth/welcome',
        Splash: '',
      },
    },
  };

  // By the time we get here, loading is false and user/isAdmin are definitive
  // initialRouteName is set correctly on the very first and only mount
  const initialRoute = user
    ? isAdmin ? 'AdminApp' : 'MainApp'
    : 'Splash';

  return (
    // Key prop forces NavigationContainer to fully remount if auth state changes
    // e.g. after sign out — this guarantees initialRouteName is always respected
    <NavigationContainer key={user?.id ?? 'guest'} linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* ── Auth Screens ── */}
        <Stack.Screen name="Splash"             component={SplashScreen} />
        <Stack.Screen name="Onboarding"         component={OnboardingScreen} />
        <Stack.Screen name="AuthWelcome"        component={AuthWelcomeScreen} />
        <Stack.Screen
          name="CreateAccountWelcome"
          component={CreateAccountWelcomeScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            transitionSpec: {
              open:  { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 600 } },
            },
          }}
        />
        <Stack.Screen
          name="NameCollection"
          component={NameCollectionScreen}
          options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
        />
        <Stack.Screen name="AccountSuccess"   component={AccountSuccessScreen} />
        <Stack.Screen name="PhoneVerify"      component={PhoneVerifyScreen} />
        <Stack.Screen name="ForgotPassword"   component={ForgotPasswordScreen} />
        <Stack.Screen name="ConfirmationCode" component={ConfirmationCodeScreen} />
        <Stack.Screen name="ResetLinkSent"    component={ResetLinkSentScreen} />
        <Stack.Screen name="UpdatePassword"   component={UpdatePasswordScreen} />

        {/* ── App Screens ── */}
        <Stack.Screen name="MainApp"  component={MainTabNavigator} />
        <Stack.Screen name="AdminApp" component={AdminNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
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