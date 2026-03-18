// src/components/LinkPreview.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

interface LinkPreviewProps {
  preview: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  isMe: boolean;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ preview, isMe }) => {
  const handlePress = () => {
    if (preview.url) {
      Linking.openURL(preview.url);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isMe ? styles.myPreview : styles.theirPreview]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {preview.image && (
        <Image source={{ uri: preview.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        {preview.title && (
          <Text style={[styles.title, isMe ? styles.myText : styles.theirText]} numberOfLines={2}>
            {preview.title}
          </Text>
        )}
        {preview.description && (
          <Text style={[styles.description, isMe ? styles.myDesc : styles.theirDesc]} numberOfLines={2}>
            {preview.description}
          </Text>
        )}
        <View style={styles.urlRow}>
          <ExternalLink size={12} color={isMe ? 'rgba(255,255,255,0.7)' : '#6B7280'} />
          <Text style={[styles.url, isMe ? styles.myUrl : styles.theirUrl]} numberOfLines={1}>
            {preview.url}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    maxWidth: 280,
    borderWidth: 1,
  },
  myPreview: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  theirPreview: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#111827',
  },
  description: {
    fontSize: 12,
    marginBottom: 6,
  },
  myDesc: {
    color: 'rgba(255,255,255,0.8)',
  },
  theirDesc: {
    color: '#6B7280',
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  url: {
    fontSize: 11,
    flex: 1,
  },
  myUrl: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirUrl: {
    color: '#9CA3AF',
  },
});