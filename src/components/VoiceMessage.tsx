// src/components/VoiceMessage.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  isMe: boolean;
  deliveryStatus?: string;
  timestamp?: string;
  onLongPress?: (event: any) => void;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioUrl, duration, isMe, deliveryStatus, timestamp, onLongPress,
}) => {
  const player = useAudioPlayer({ uri: audioUrl });
  const status = useAudioPlayerStatus(player);

  const isPlaying  = status.playing;
  const position   = status.currentTime * 1000; // convert to ms
  const isLoading  = !status.isLoaded;

  const playPause = async () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        if (status.didJustFinish || status.currentTime >= (status.duration ?? 0)) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins    = Math.floor(seconds / 60);
    const secs    = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = (status.duration ?? 0) * 1000 || duration || 1000;
  const progress      = Math.min(position / totalDuration, 1);

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={600}>
      <View>
        <View style={[styles.container, isMe ? styles.myVoice : styles.theirVoice]}>
          <TouchableOpacity onPress={playPause} disabled={isLoading} style={styles.playButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color={isMe ? '#FFFFFF' : '#008102'} />
            ) : isPlaying ? (
              <Pause size={20} color={isMe ? '#FFFFFF' : '#008102'} fill={isMe ? '#FFFFFF' : '#008102'} />
            ) : (
              <Play size={20} color={isMe ? '#FFFFFF' : '#008102'} fill={isMe ? '#FFFFFF' : '#008102'} />
            )}
          </TouchableOpacity>

          <View style={styles.waveform}>
            <View style={[styles.progress, { width: `${progress * 100}%` }]} />
          </View>

          <Text style={[styles.time, isMe ? styles.myText : styles.theirText]}>
            {formatTime(position)}
          </Text>
        </View>

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
  container:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, minWidth: 180 },
  myVoice:          { backgroundColor: '#008102' },
  theirVoice:       { backgroundColor: '#F3F4F6' },
  playButton:       { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  waveform:         { flex: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden', marginRight: 8 },
  progress:         { height: '100%', backgroundColor: 'rgba(255,255,255,0.3)' },
  time:             { fontSize: 11, fontWeight: '600' },
  myText:           { color: '#FFFFFF' },
  theirText:        { color: '#4B5563' },
  footer:           { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4, paddingHorizontal: 4 },
  footerTime:       { fontSize: 10 },
  myFooterText:     { color: 'rgba(255,255,255,0.7)' },
  theirFooterText:  { color: '#9CA3AF' },
  footerStatus:     { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  footerStatusRead: { color: '#34D399' },
});