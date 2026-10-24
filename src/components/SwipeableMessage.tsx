// src/components/SwipeableMessage.tsx
import React from 'react';
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
  const translateX  = useSharedValue(0);
  const iconOpacity = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX(isMe ? [-20, 20] : [20, -20])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const maxSwipe = 60;
      if (isMe) {
        translateX.value = Math.max(Math.min(event.translationX, 0), -maxSwipe);
      } else {
        translateX.value = Math.min(Math.max(event.translationX, 0), maxSwipe);
      }
      iconOpacity.value = Math.abs(translateX.value) / maxSwipe;
    })
    .onEnd(() => {
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
    position: 'absolute',
    top: '50%',
    marginTop: -10,
    zIndex: -1,
    ...(isMe ? { left: -28 } : { right: -28 }),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <Animated.View style={iconStyle}>
          <Reply size={20} color="#6B7280" />
        </Animated.View>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};