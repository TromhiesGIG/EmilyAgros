// src/components/MessageActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Trash2, Forward, Star, Reply, X } from 'lucide-react-native';

interface MessageActionsProps {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onStar: () => void;
  onDelete: () => void;
  onForward: () => void;
  isMyMessage: boolean;
  isStarred: boolean;
  position: { x: number; y: number };
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  visible,
  onClose,
  onReply,
  onStar,
  onDelete,
  onForward,
  isMyMessage,
  isStarred,
  position,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.menu, { top: position.y - 120, left: position.x - 100 }]}>
          <TouchableOpacity style={styles.menuItem} onPress={onReply}>
            <Reply size={20} color="#111827" />
            <Text style={styles.menuText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onStar}>
            <Star size={20} color={isStarred ? "#FCD34D" : "#111827"} fill={isStarred ? "#FCD34D" : "none"} />
            <Text style={styles.menuText}>{isStarred ? 'Unstar' : 'Star'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onForward}>
            <Forward size={20} color="#111827" />
            <Text style={styles.menuText}>Forward</Text>
          </TouchableOpacity>

          {isMyMessage && (
            <TouchableOpacity style={[styles.menuItem, styles.deleteItem]} onPress={onDelete}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.menuText, styles.deleteText]}>Delete for everyone</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteText: {
    color: '#EF4444',
  },
});