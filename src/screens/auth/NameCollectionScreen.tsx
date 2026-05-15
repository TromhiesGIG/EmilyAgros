// src/screens/auth/NameCollectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { 
  FadeInRight,
  SlideInRight,
  Layout
} from 'react-native-reanimated';
import { RootStackParamList } from '../../../App';
import { CustomTextInput, PrimaryButton } from '../../components/auth';
import { authService } from '../../services/auth';
import { RouteProp } from '@react-navigation/native';

type NameCollectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NameCollection'>;
  route: RouteProp<RootStackParamList, 'NameCollection'>;
};

export const NameCollectionScreen: React.FC<NameCollectionScreenProps> = ({ navigation, route }) => {
  const { email, password, phoneNumber, isPhoneAuth } = route.params;
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }

    setLoading(true);
    
    try {
      if (isPhoneAuth && phoneNumber) {
        // Phone signup
        await authService.signUpWithPhone({
          phoneNumber,
          firstName,
          lastName,
        });
      } else if (email && password) {
        // Email signup
        await authService.signUp({
          email,
          password,
          firstName,
          lastName,
        });
      }
      
      setLoading(false);
      navigation.navigate('AccountSuccess');
      
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Signup Error', error.message || 'Failed to create account');
      console.error('Signup error:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button - Slides in from left */}
        <Animated.View entering={SlideInRight.delay(100).springify()}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Title - Slides in from right */}
        <Animated.Text 
          style={styles.title}
          entering={SlideInRight.delay(200).springify()}
        >
          What's your name?
        </Animated.Text>
        
        <Animated.Text 
          style={styles.subtitle}
          entering={SlideInRight.delay(300).springify()}
        >
          How would you like us to address you?
        </Animated.Text>

        {/* First Name Input - Slides in from right */}
        <Animated.View 
          entering={SlideInRight.delay(400).springify()}
          layout={Layout.springify()}
        >
          <CustomTextInput
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </Animated.View>

        {/* Last Name Input - Slides in from right */}
        <Animated.View 
          entering={SlideInRight.delay(500).springify()}
          layout={Layout.springify()}
        >
          <CustomTextInput
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </Animated.View>

        {/* Continue Button - Slides in from right */}
        <Animated.View entering={FadeInRight.delay(600).springify()}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!firstName || !lastName}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 28,
    color: '#111827',
    marginRight: 4,
    marginTop: -2,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5768',
    marginBottom: 32,
    lineHeight: 24,
  },
});