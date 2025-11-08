// src/components/auth/SocialAuthButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

type SocialAuthButtonProps = {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
};

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({ 
  provider, 
  onPress,
  disabled = false 
}) => {
  const isGoogle = provider === 'google';
  const icon = isGoogle
    ? require('../../../assets/google.png')
    : require('../../../assets/apple.png');
  const text = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {disabled ? (
        <ActivityIndicator size="small" color="#6B7280" style={styles.icon} />
      ) : (
        <Image source={icon} style={styles.icon} />
      )}
      <Text style={[styles.text, disabled && styles.textDisabled]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#F7F8F9',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  textDisabled: {
    color: '#6B7280',
  },
});