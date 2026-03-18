// src/components/WaveformRecording.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface WaveformRecordingProps {
  duration: number; // in seconds
}

export const WaveformRecording: React.FC<WaveformRecordingProps> = ({ duration }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {[...Array(5)].map((_, i) => (
          <WaveformBar key={i} delay={i * 100} />
        ))}
      </View>
      <Text style={styles.time}>{formatTime(duration)}</Text>
    </View>
  );
};

const WaveformBar: React.FC<{ delay: number }> = ({ delay }) => {
  const height = useSharedValue(8);

  useEffect(() => {
    height.value = withRepeat(
      withSequence(
        withTiming(24, { duration: 400 }),
        withTiming(8, { duration: 400 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  bar: {
    width: 3,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  time: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});