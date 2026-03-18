// src/components/VoiceMessage.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  isMe: boolean;
  deliveryStatus?: string;
  timestamp?: string;
  onLongPress?: (event: any) => void;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ audioUrl, duration, isMe, deliveryStatus, timestamp, onLongPress }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playPause = async () => {
    console.log('🎵 VoiceMessage playPause:', { audioUrl, hasSound: !!sound, isPlaying, hasFinished });
    try {
      if (!sound) {
        console.log('📥 Loading audio from:', audioUrl);
        setLoading(true);
        setHasFinished(false); // Reset finished flag
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        console.log('✅ Audio loaded successfully');
        setSound(newSound);
        setIsPlaying(true);
        setLoading(false);
      } else {
        if (isPlaying) {
          console.log('⏸️ Pausing audio');
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log('▶️ Resuming audio');
          setHasFinished(false); // Reset finished flag
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('❌ Audio playback error:', error);
      console.error('Failed URL:', audioUrl);
      setLoading(false);
      // Reset everything on error
      setSound(null);
      setHasFinished(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    console.log('🎧 Playback status update:', {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      didJustFinish: status.didJustFinish,
      positionMillis: status.positionMillis,
      durationMillis: status.durationMillis,
    });

    if (status.isLoaded) {
      setPosition(status.positionMillis);
      
      if (status.didJustFinish) {
        console.log('✅ Playback finished, resetting...');
        console.log('🔍 Current state before reset:', { hasSound: !!sound, isPlaying });
        
        setIsPlaying(false);
        setHasFinished(true);
        setPosition(0);
        
        // Unload the sound so it can be played again
        if (sound) {
          sound.unloadAsync()
            .then(() => {
              console.log('🔄 Sound unloaded successfully');
              setSound(null);
              console.log('✅ Ready to replay - sound set to null');
            })
            .catch((error) => {
              console.error('❌ Error unloading sound:', error);
              setSound(null); // Force reset even on error
            });
        } else {
          console.log('⚠️ No sound to unload');
          setSound(null); // Reset anyway
        }
      }
    } else {
      console.log('⚠️ Status not loaded:', status);
    }
  };

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={600}>
      <View>
        <View style={[styles.container, isMe ? styles.myVoice : styles.theirVoice]}>
          <TouchableOpacity onPress={playPause} disabled={loading} style={styles.playButton}>
            {loading ? (
              <ActivityIndicator size="small" color={isMe ? '#FFFFFF' : '#008102'} />
            ) : isPlaying ? (
              <Pause size={20} color={isMe ? '#FFFFFF' : '#008102'} fill={isMe ? '#FFFFFF' : '#008102'} />
            ) : (
              <Play size={20} color={isMe ? '#FFFFFF' : '#008102'} fill={isMe ? '#FFFFFF' : '#008102'} />
            )}
          </TouchableOpacity>

          <View style={styles.waveform}>
            <View style={[styles.progress, { width: `${(position / (duration || 1000)) * 100}%` }]} />
          </View>

          <Text style={[styles.time, isMe ? styles.myText : styles.theirText]}>
            {formatTime(position || 0)}
          </Text>
        </View>

        {/* Show timestamp and status */}
        {(timestamp || deliveryStatus) && (
          <View style={styles.footer}>
            {timestamp && (
              <Text style={[styles.footerTime, isMe ? styles.myFooterText : styles.theirFooterText]}>
                {timestamp}
              </Text>
            )}
            {isMe && deliveryStatus && (
              <Text style={[styles.footerStatus, deliveryStatus.includes('✓✓') && styles.footerStatusRead]}>
                {deliveryStatus}
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 180,
  },
  myVoice: {
    backgroundColor: '#008102',
  },
  theirVoice: {
    backgroundColor: '#F3F4F6',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waveform: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#4B5563',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    paddingHorizontal: 4,
  },
  footerTime: {
    fontSize: 10,
  },
  myFooterText: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirFooterText: {
    color: '#9CA3AF',
  },
  footerStatus: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  footerStatusRead: {
    color: '#34D399',
  },
});