// src/screens/auth/ResetLinkSentScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { PrimaryButton } from '../../components/auth';

type ResetLinkSentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetLinkSent'>;
  route: RouteProp<RootStackParamList, 'ResetLinkSent'>;
};

export const ResetLinkSentScreen: React.FC<ResetLinkSentScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { email } = route.params;

  const handleReturnToSignIn = () => {
    // Navigate back to AuthWelcome (Sign In screen)
    navigation.navigate('AuthWelcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Check your email</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          If the email you provided was correct, you will receive a link with reset 
          information. Follow the instructions in the email to reset your password 
          and then come back to log in. If you have not received the verification 
          email within 10 minutes, please try again.
        </Text>

        {/* Return to Sign In Button */}
        <PrimaryButton
          title="Return to Sign In"
          onPress={handleReturnToSignIn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0D0F11',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5768',
    marginBottom: 40,
    lineHeight: 24,
  },
});