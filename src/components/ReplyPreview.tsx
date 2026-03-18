// src/components/ReplyPreview.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface ReplyPreviewProps {
  message: any;
  onCancel: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ message, onCancel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.replyBar} />
      <View style={styles.content}>
        <Text style={styles.replyingTo}>Replying to {message.sender_name || 'User'}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {message.message_type === 'image' ? '📷 Photo' : 
           message.message_type === 'voice' ? '🎤 Voice message' : 
           message.content}
        </Text>
      </View>
      <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
        <X size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  replyBar: {
    width: 4,
    height: 40,
    backgroundColor: '#008102',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  replyingTo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#008102',
    marginBottom: 2,
  },
  messagePreview: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeBtn: {
    padding: 4,
  },
});