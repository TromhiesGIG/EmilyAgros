// src/screens/auth/AccountSuccessScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { PrimaryButton } from '../../components/auth';
import { useAuth } from '../../providers/AuthProvider';

type AccountSuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AccountSuccess'>;
};

export const AccountSuccessScreen: React.FC<AccountSuccessScreenProps> = ({ navigation }) => {
  const { isAdmin } = useAuth();

  const handleEnterApp = () => {
    // MainApp is always registered now — this will always work
    navigation.reset({
      index: 0,
      routes: [{ name: isAdmin ? 'AdminApp' : 'MainApp' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.badge}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
      <Text style={styles.title}>Account created successfully</Text>
      <Text style={styles.subtitle}>
        Your account has been created successfully.
      </Text>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Enter the app!"
          onPress={handleEnterApp}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  iconContainer:   { marginBottom: 32 },
  badge:           { width: 120, height: 120, backgroundColor: '#008102', borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#008102', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  checkmark:       { fontSize: 60, color: '#FFFFFF', fontWeight: 'bold' },
  title:           { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle:        { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  buttonContainer: { width: '100%' },
});