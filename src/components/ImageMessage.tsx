// src/components/ImageMessage.tsx
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Modal, Dimensions, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface ImageMessageProps {
  imageUrl: string;
  isMe: boolean;
  deliveryStatus?: string;
  timestamp?: string;
  onLongPress?: (event: any) => void;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ imageUrl, isMe, deliveryStatus, timestamp, onLongPress }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View>
        <Pressable 
          onPress={() => setModalVisible(true)} 
          onLongPress={onLongPress}
          delayLongPress={600}
        >
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        </Pressable>
        
        {/* Show timestamp and status */}
        {(timestamp || deliveryStatus) && (
          <View style={styles.footer}>
            {timestamp && (
              <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
                {timestamp}
              </Text>
            )}
            {isMe && deliveryStatus && (
              <Text style={[styles.status, deliveryStatus.includes('✓✓') && styles.statusRead]}>
                {deliveryStatus}
              </Text>
            )}
          </View>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <X size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    paddingHorizontal: 4,
  },
  time: {
    fontSize: 10,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTime: {
    color: '#9CA3AF',
  },
  status: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  statusRead: {
    color: '#34D399',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: width,
    height: height,
  },
});