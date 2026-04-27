// src/components/WaveformRecording.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

interface WaveformRecordingProps {
  duration: number;
  amplitudes?: number[]; // Audio amplitude data
}

export const WaveformRecording: React.FC<WaveformRecordingProps> = ({ duration, amplitudes = [] }) => {
  const NUM_BARS = 30;
  
  // Create animated values for each bar
  const barAnimations = useRef(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (amplitudes.length === 0) {
      console.log('🎨 WaveformRecording: No amplitudes, using random animation');
      // Fallback: random animation if no amplitude data
      const animations = barAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.5 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        )
      );

      Animated.stagger(50, animations).start();
    } else {
      // Use real amplitude data - animate EVERY bar on EVERY update
      const latestAmplitudes = amplitudes.slice(-NUM_BARS);
      
      console.log('🎨 WaveformRecording UPDATE:', {
        totalAmplitudes: amplitudes.length,
        latestCount: latestAmplitudes.length,
        min: Math.min(...latestAmplitudes).toFixed(3),
        max: Math.max(...latestAmplitudes).toFixed(3),
        avg: (latestAmplitudes.reduce((a, b) => a + b, 0) / latestAmplitudes.length).toFixed(3),
        last5: latestAmplitudes.slice(-5).map(a => a.toFixed(3)),
      });
      
      // Pad with low values if we don't have enough samples yet
      const paddedAmplitudes = Array(NUM_BARS).fill(0.2);
      latestAmplitudes.forEach((amp, idx) => {
        const barIndex = NUM_BARS - latestAmplitudes.length + idx;
        if (barIndex >= 0) {
          paddedAmplitudes[barIndex] = amp;
        }
      });

      // Animate each bar to its current amplitude value
      paddedAmplitudes.forEach((amplitude, index) => {
        Animated.timing(barAnimations[index], {
          toValue: Math.max(0.2, Math.min(1, amplitude)),
          duration: 50, // Fast response
          useNativeDriver: false,
        }).start();
      });
    }
  }, [amplitudes]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {barAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['20%', '100%'],
                }),
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    gap: 2,
  },
  bar: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    minHeight: 4,
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    minWidth: 45,
  },
});