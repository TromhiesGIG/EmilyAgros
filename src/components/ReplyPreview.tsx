// src/components/ReplyPreview.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface ReplyPreviewProps {
  message:    any;
  onCancel:   () => void;
  senderName: string;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ message, onCancel, senderName }) => {
  const content = message.message_type === 'image'
    ? 'Photo'
    : message.message_type === 'voice'
    ? 'Voice message'
    : message.content;

  return (
    <View style={styles.container}>
      <View style={styles.replyBar} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{senderName}</Text>
        <Text style={styles.preview} numberOfLines={1}>{content}</Text>
      </View>
      <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
        <X size={18} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  replyBar:   { width: 3, height: 32, backgroundColor: '#008102', borderRadius: 2, marginRight: 10 },
  content:    { flex: 1 },
  name:       { fontSize: 12, fontWeight: '700', color: '#008102', marginBottom: 1 },
  preview:    { fontSize: 12, color: '#6B7280' },
  closeBtn:   { padding: 4, marginLeft: 8 },
});