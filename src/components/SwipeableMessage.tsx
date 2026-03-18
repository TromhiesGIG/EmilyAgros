// src/components/SwipeableMessage.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Reply } from 'lucide-react-native';

interface SwipeableMessageProps {
  children: React.ReactNode;
  onSwipeReply: () => void;
  isMe: boolean;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = ({
  children,
  onSwipeReply,
  isMe,
}) => {
  const translateX = useSharedValue(0);
  const iconOpacity = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX(isMe ? [-20, 20] : [20, -20]) // Increased from 10 to 20 - less sensitive
    .failOffsetY([-10, 10]) // Add vertical threshold - allows scrolling
    .onUpdate((event) => {
      const maxSwipe = 60;
      if (isMe) {
        // Swipe left for "me" messages
        translateX.value = Math.max(Math.min(event.translationX, 0), -maxSwipe);
      } else {
        // Swipe right for "their" messages
        translateX.value = Math.min(Math.max(event.translationX, 0), maxSwipe);
      }
      iconOpacity.value = Math.abs(translateX.value) / maxSwipe;
      console.log('🔄 Swipe:', { translateX: translateX.value, isMe });
    })
    .onEnd(() => {
      console.log('✅ Swipe ended:', { distance: Math.abs(translateX.value) });
      if (Math.abs(translateX.value) > 40) {
        runOnJS(onSwipeReply)();
      }
      translateX.value = withSpring(0);
      iconOpacity.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={[styles.replyIcon, iconStyle, isMe ? styles.iconLeft : styles.iconRight]}>
          <Reply size={20} color="#6B7280" />
        </Animated.View>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  replyIcon: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
    zIndex: -1,
  },
  iconLeft: {
    left: 10,
  },
  iconRight: {
    right: 10,
  },
});