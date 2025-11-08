import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PanResponder,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const onboardingData: OnboardingData[] = [
  {
    image: require('../../../assets/onboarding1.png'),
    title: 'Your trusted Nigerian marketplace for everything Agriculture',
    description: 'Built for Nigerian farmers, traders and buyers.',
    showSkip: true,
  },
  {
    image: require('../../../assets/onboarding2.png'),
    title: 'Seamless Buying and Selling!',
    description: 'Showcase your products or find what you need - quick, simple, secure.',
    showSkip: true,
  },
  {
    image: require('../../../assets/onboarding3.png'),
    title: 'Safe and Reliable',
    description: 'Verified listings, fair prices, and secure transactions every time.',
    showSkip: false,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const currentStepRef = useRef(currentStep);

  const isLastStep = currentStep === onboardingData.length - 1;
  const currentContent = onboardingData[currentStep];

  // Update the ref whenever currentStep changes
  React.useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, { dx }) => {
        if (isGestureActive) return;

        const swipeThreshold = screenWidth / 5;

        // Swipe left to go to the next step
        if (dx < -swipeThreshold && currentStepRef.current < onboardingData.length - 1) {
          setIsGestureActive(true);
          setCurrentStep(prevStep => prevStep + 1);
          setTimeout(() => setIsGestureActive(false), 300);
        }
        // Swipe right to go to the previous step
        else if (dx > swipeThreshold && currentStepRef.current > 0) {
          setIsGestureActive(true);
          setCurrentStep(prevStep => prevStep - 1);
          setTimeout(() => setIsGestureActive(false), 300);
        }
      },
    })
  ).current;

  const handleSkip = () => {
    setCurrentStep(onboardingData.length - 1);
  };

  const handleContinue = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('AuthWelcome');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicators */}
      <View style={styles.progressContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index <= currentStep ? styles.activeSegment : styles.inactiveSegment,
            ]}
          />
        ))}
      </View>

      {/* Animated content view with swipe handlers */}
      <Animated.View
        key={currentStep}
        style={styles.content}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        {...panResponder.panHandlers}
      >
        <Image
          source={currentContent.image}
          style={styles.illustration}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentContent.title}</Text>
          <Text style={styles.description}>{currentContent.description}</Text>
        </View>
      </Animated.View>

      {/* Bottom buttons */}
      <View
        style={[
          styles.buttonContainer,
          {
            flexDirection: isLastStep ? 'column' : 'row',
            paddingHorizontal: isLastStep ? 0 : 20,
            justifyContent: isLastStep ? 'center' : 'space-between',
          },
        ]}
      >
        {currentContent.showSkip && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleContinue}
          style={[
            styles.continueButton,
            {
              width: isLastStep ? '90%' : 'auto',
              minWidth: isLastStep ? undefined : 160,
              marginHorizontal: isLastStep ? 20 : 0,
            },
          ]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles are unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  activeSegment: {
    backgroundColor: '#1aff1e',
  },
  inactiveSegment: {
    backgroundColor: '#E5E5E5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  illustration: {
    width: screenWidth,
    height: screenHeight * 0.5,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    letterSpacing: 0.32,
  },
  buttonContainer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    minWidth: 160,
    alignItems: 'center',
    backgroundColor: '#f7f8f9',
  },
  skipText: {
    fontSize: 16,
    color: '#323A46',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#008102',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});