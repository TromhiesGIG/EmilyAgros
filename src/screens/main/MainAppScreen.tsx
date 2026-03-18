// src/screens/main/MainAppScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { usePresence } from '../../hooks/usePresence';

export const MainAppScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  usePresence

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Success State */}
      <View style={styles.content}>
        <View style={styles.successBadge}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Welcome to EmilyAgros!</Text>
        <Text style={styles.subtitle}>
          You're now signed in and ready to explore the agricultural marketplace
        </Text>

        {/* User Info */}
        {user && (
          <View style={styles.userCard}>
            <Text style={styles.userLabel}>Signed in as:</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.user_metadata?.full_name && (
              <Text style={styles.userName}>{user.user_metadata.full_name}</Text>
            )}
          </View>
        )}

        {/* Placeholder for future features */}
        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderTitle}>Coming Soon:</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Browse agricultural products</Text>
            <Text style={styles.featureItem}>• Connect with farmers and sellers</Text>
            <Text style={styles.featureItem}>• Secure payment with Paystack</Text>
            <Text style={styles.featureItem}>• Real-time messaging</Text>
            <Text style={styles.featureItem}>• Order tracking</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A651',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  userCard: {
    width: '100%',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  userLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: '#6B7280',
  },
  placeholderSection: {
    width: '100%',
    marginBottom: 40,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    padding: 20,
  },
  featureItem: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 28,
  },
  signOutButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#008102',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008102',
  },
});