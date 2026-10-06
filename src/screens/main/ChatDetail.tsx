// src/screens/main/ChatDetail.tsx - BATCH 1: Reply, Reactions, Swipe, Hold-to-Record
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, Linking, Alert, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArrowLeft, Phone, MoreVertical, Send, ImageIcon, Mic, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { ImageMessage } from '../../components/ImageMessage';
import { VoiceMessage } from '../../components/VoiceMessage';
import { ReplyPreview } from '../../components/ReplyPreview';
import { ReactionPicker } from '../../components/ReactionPicker';
import { SwipeableMessage } from '../../components/SwipeableMessage';
import { MessageActions } from '../../components/MessageActions';
import { ForwardModal } from '../../components/ForwardModal';
import { LinkPreview } from '../../components/LinkPreview';
import { WaveformRecording } from '../../components/WaveformRecording';
import { notificationService } from '../../services/notificationService';
import { extractUrls, fetchLinkPreview } from '../../utils/linkPreviewUtil';

export const ChatDetail = ({ route, navigation }: any) => {

  
  const { adId, receiverId, sellerName, adTitle, adPrice, adImage, phoneNumber } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adInfo, setAdInfo] = useState<any>(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingAmplitudes, setRecordingAmplitudes] = useState<number[]>([]);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<any>(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageActionsPosition, setMessageActionsPosition] = useState({ x: 0, y: 0 });
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  const recorder = useAudioRecorder(
  { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true },
  (status: any) => {
    if (status.isRecording && status.metering !== undefined) {
      const metering = status.metering ?? -60;
      let normalizedHeight;
      if (metering < -45) {
        normalizedHeight = 0.2;
      } else if (metering <= -5) {
        normalizedHeight = 0.2 + ((metering - (-45)) / 40) * 0.7;
      } else {
        normalizedHeight = Math.min(1.0, 0.9 + ((metering + 5) / 5) * 0.1);
      }
      setRecordingAmplitudes(prev => [...prev, normalizedHeight].slice(-30));
    }
  }
);
  // Chat room ID for typing status - ALWAYS sorted to ensure both users get same ID
  const chatRoom = React.useMemo(() => {
    const ids = [user?.id, receiverId].filter(Boolean).sort();
    return `${ids[0]}_${ids[1]}_${adId || 'general'}`;
  }, [user?.id, receiverId, adId]);

  // Typing indicator hook
  const { isOtherUserTyping, handleTyping, stopTyping } = useTypingIndicator({
    chatRoom,
    otherUserId: receiverId,
  });

  // Subscribe to other user's presence
  useEffect(() => {
    if (!receiverId) return;

    const channel = supabase
      .channel(`presence-${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${receiverId}`,
        },
        (payload) => {
          const presence = payload.new as any;
          setOtherUserOnline(presence.is_online);
          setLastSeen(presence.last_seen);
        }
      )
      .subscribe();

    // Initial fetch
    supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', receiverId)
      .single()
      .then(({ data }) => {
        if (data) {
          setOtherUserOnline(data.is_online);
          setLastSeen(data.last_seen);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [receiverId]);

  useEffect(() => {
    if (adTitle) {
      setAdInfo({ title: adTitle, price: adPrice, images: adImage ? [adImage] : [] });
    } else if (adId) {
      supabase
        .from('products')
        .select('title, price, images')
        .eq('id', adId)
        .single()
        .then(({ data }) => { if (data) setAdInfo(data); });
    }

    // Register for push notifications
    // if (user) {
    //   notificationService.registerForPushNotifications(user.id);
    // }
  }, [adId, adTitle, adPrice, adImage, user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !receiverId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (adId) {
        query = query.eq('ad_id', adId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch messages error:', error);
        setLoading(false);
        return;
      }

      setMessages(data || []);

      // Mark as read AND update delivered/read timestamps
      const unreadIds = (data || [])
        .filter((m: any) => m.receiver_id === user.id && !m.is_read)
        .map((m: any) => m.id);

      if (unreadIds.length > 0) {
        const now = new Date().toISOString();
        await supabase
          .from('messages')
          .update({ 
            is_read: true,
            read_at: now,
            delivered_at: now, // Also mark as delivered
          })
          .in('id', unreadIds);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  }, [user, receiverId, adId]);

  useEffect(() => {
    fetchMessages();

    // Set typing to false on mount
    if (user) {
      supabase.from('typing_status').upsert({
        user_id: user.id,
        chat_room: chatRoom,
        is_typing: false,
        updated_at: new Date().toISOString(),
      });
    }

    const channel = supabase
      .channel(`chat-${chatRoom}`) // Use chatRoom which is already sorted
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new as any;
        const isThisConvo =
          (newMsg.sender_id === user?.id && newMsg.receiver_id === receiverId) ||
          (newMsg.sender_id === receiverId && newMsg.receiver_id === user?.id);

        if (isThisConvo) {
          console.log('📨 New message received via realtime:', newMsg.id);
          
          // Check if this message already exists (could be optimistic update)
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping duplicate');
              return prev;
            }
            console.log('✅ Adding new message to list');
            return [...prev, newMsg];
          });
          
          // Auto-mark as read if it's for me
          if (newMsg.receiver_id === user?.id) {
            console.log('📖 Marking message as read:', newMsg.id);
            const now = new Date().toISOString();
            supabase.from('messages').update({ 
              is_read: true,
              read_at: now,
              delivered_at: now,
            }).eq('id', newMsg.id).then(({ error }) => {
              if (error) {
                console.error('❌ Error marking as read:', error);
              } else {
                console.log('✅ Message marked as read in DB');
              }
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const updatedMsg = payload.new as any;
        console.log('🔄 Message updated via realtime:', {
          id: updatedMsg.id,
          is_read: updatedMsg.is_read,
          read_at: updatedMsg.read_at,
          delivered_at: updatedMsg.delivered_at,
        });
        
        setMessages(prev => {
          const updated = prev.map(m => {
            if (m.id === updatedMsg.id) {
              console.log('✅ Updating local message:', {
                oldReadStatus: m.is_read,
                newReadStatus: updatedMsg.is_read,
              });
              return updatedMsg;
            }
            return m;
          });
          return updated;
        });
      })
      .subscribe();

    return () => {
      // Cleanup: stop typing on unmount
      if (user) {
        supabase.from('typing_status').upsert({
          user_id: user.id,
          chat_room: chatRoom,
          is_typing: false,
          updated_at: new Date().toISOString(),
        });
      }
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, user, chatRoom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    stopTyping();

    // Check for URLs and fetch preview
    const urls = extractUrls(text);
    let linkPreview = null;
    if (urls.length > 0) {
      linkPreview = await fetchLinkPreview(urls[0]);
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: receiverId,
      ad_id: adId,
      content: text.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
      delivered_at: null,
      read_at: null,
      message_type: 'text',
      reply_to_id: replyingTo?.id || null,
      link_preview: linkPreview,
      _optimistic: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputText('');
    setReplyingTo(null);

    const messageData: any = {
      sender_id: user.id,
      receiver_id: receiverId,
      content: text.trim(),
      is_read: false,
      message_type: 'text',
    };

    if (adId) messageData.ad_id = adId;
    if (replyingTo) messageData.reply_to_id = replyingTo.id;
    if (linkPreview) messageData.link_preview = linkPreview;

    const { data, error } = await supabase.from('messages').insert(messageData).select().single();

    if (error) {
      console.error('❌ Send error:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'Failed to send message.');
    } else {
      console.log('✅ Message sent, replacing optimistic:', { tempId, realId: data.id });
      setMessages(prev => prev.map(m => {
        if (m.id === tempId) {
          console.log('🔄 Replacing optimistic message with real one');
          return data;
        }
        return m;
      }));
    }
    setSending(false);
  };

  // Image picker
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
    setShowMediaMenu(false);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (uri: string) => {
    if (!user) return;
    setUploadingMedia(true);

    try {
      const fileName = `${user.id}_${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      // Send message with image
      const messageData: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: 'Photo',
        message_type: 'image',
        media_url: publicUrl,
        is_read: false,
      };

      if (adId) messageData.ad_id = adId;

      await supabase.from('messages').insert(messageData);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
    setUploadingMedia(false);
  };

  // Helper to decode base64
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Start voice recording
// Start voice recording with amplitude tracking
const startRecording = async () => {
  try {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Please allow microphone access');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    setRecordingDuration(0);
    setRecordingAmplitudes([]);
    const durationInterval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    (recorder as any).durationInterval = durationInterval;
  } catch (error) {
    console.error('Recording error:', error);
    Alert.alert('Error', 'Failed to start recording');
  }
  setShowMediaMenu(false);
};
  // Stop and upload voice
const stopRecording = async () => {
  setIsRecording(false);
  setUploadingMedia(true);
  const durationInterval = (recorder as any).durationInterval;
  if (durationInterval) clearInterval(durationInterval);
  try {
    await recorder.stop();
    const uri = recorder.uri;
    if (uri) await uploadVoice(uri);
    setRecordingDuration(0);
    setRecordingAmplitudes([]);
  } catch (error) {
    Alert.alert('Error', 'Failed to save recording');
  }
  setUploadingMedia(false);
};

const cancelRecording = async () => {
  setIsRecording(false);
  const durationInterval = (recorder as any).durationInterval;
  if (durationInterval) clearInterval(durationInterval);
  try {
    await recorder.stop();
    setRecordingDuration(0);
    setRecordingAmplitudes([]);
  } catch (error) {
    console.error('Cancel recording error:', error);
  }
};
  // Upload voice to storage
  const uploadVoice = async (uri: string) => {
    if (!user) return;

    try {
      const fileName = `${user.id}_${Date.now()}.m4a`;
      const filePath = `${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, decode(base64), {
          contentType: 'audio/m4a',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      const messageData: any = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: 'Voice message',
        message_type: 'voice',
        media_url: publicUrl,
        is_read: false,
      };

      if (adId) messageData.ad_id = adId;

      await supabase.from('messages').insert(messageData);
    } catch (error) {
      console.error('Voice upload error:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  // Handle long press for message actions menu
  const handleLongPress = (message: any, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setSelectedMessage(message);
    setMessageActionsPosition({ x: pageX, y: pageY });
    setShowMessageActions(true);
  };

  // Show reaction picker from actions menu
  const showReactions = () => {
    setShowMessageActions(false);
    setSelectedMessageForReaction(selectedMessage);
    setShowReactionPicker(true);
  };

  // Add reaction to message
  const handleReaction = async (emoji: string) => {
    if (!selectedMessageForReaction || !user) return;

    try {
      const message = selectedMessageForReaction;
      const reactions = message.reactions || {};
      
      // Toggle reaction
      if (reactions[emoji]?.includes(user.id)) {
        // Remove reaction
        reactions[emoji] = reactions[emoji].filter((id: string) => id !== user.id);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        // Add reaction
        reactions[emoji] = [...(reactions[emoji] || []), user.id];
      }

      await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', message.id);

      // Update local state
      setMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, reactions } : m)
      );
    } catch (error) {
      console.error('Reaction error:', error);
    }
  };

  // Handle swipe to reply
  const handleSwipeReply = (message: any) => {
    setReplyingTo(message);
  };

  // Delete message for everyone
  const handleDeleteMessage = async () => {
    if (!selectedMessage || !user) return;

    console.log('🗑️ Delete initiated for message:', {
      id: selectedMessage.id,
      type: selectedMessage.message_type,
      content: selectedMessage.content,
    });

    setShowMessageActions(false);

    Alert.alert(
      'Delete for everyone',
      'This message will be deleted for everyone in this chat.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔴 Deleting message from database...');
              const { data, error } = await supabase
                .from('messages')
                .update({
                  is_deleted: true,
                  deleted_at: new Date().toISOString(),
                  content: 'This message was deleted',
                  media_url: null, // CRITICAL: Clear media URL
                  message_type: 'text', // Change to text type
                })
                .eq('id', selectedMessage.id)
                .select();

              if (error) {
                console.error('❌ Delete error:', error);
                Alert.alert('Error', 'Failed to delete message');
                return;
              }

              console.log('✅ Message deleted from DB:', data);

              // Update local state
              setMessages(prev =>
                prev.map(m =>
                  m.id === selectedMessage.id
                    ? { ...m, is_deleted: true, content: 'This message was deleted', media_url: null, message_type: 'text' }
                    : m
                )
              );
              console.log('✅ Local state updated');
            } catch (error) {
              console.error('❌ Delete exception:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  // Star/Unstar message
  const handleStarMessage = async () => {
    if (!selectedMessage) return;

    setShowMessageActions(false);

    try {
      const newStarredState = !selectedMessage.is_starred;

      await supabase
        .from('messages')
        .update({ is_starred: newStarredState })
        .eq('id', selectedMessage.id);

      // Update local state
      setMessages(prev =>
        prev.map(m =>
          m.id === selectedMessage.id ? { ...m, is_starred: newStarredState } : m
        )
      );
    } catch (error) {
      console.error('Star error:', error);
      Alert.alert('Error', 'Failed to star message');
    }
  };

  // Forward message
  const handleForwardMessage = () => {
    setShowMessageActions(false);
    setShowForwardModal(true);
  };

  // Reply from actions menu
  const handleReplyFromMenu = () => {
    setShowMessageActions(false);
    setReplyingTo(selectedMessage);
  };

  const handleCall = () => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', "Phone number not available.");
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const formatLastSeen = (lastSeenStr: string) => {
    const lastSeenDate = new Date(lastSeenStr);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeenDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const getMessagesWithDateSeparators = () => {
    const result: any[] = [];
    let lastDate = '';
    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== lastDate) {
        result.push({ type: 'date', id: `date-${msgDate}-${msg.id}`, label: formatDate(msg.created_at) });
        lastDate = msgDate;
      }
      result.push({ type: 'message', ...msg });
    });
    return result;
  };

  const QuickChip = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.chip} onPress={() => sendMessage(label)}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );

  const getMessageStatus = (msg: any) => {
    if (msg._optimistic) return '⏳'; // Sending
    if (msg.read_at) return '✓✓'; // Read
    if (msg.delivered_at) return '✓✓'; // Delivered
    return '✓'; // Sent
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }
    const isMe = item.sender_id === user?.id;

    // Find replied message
    const repliedMessage = item.reply_to_id
      ? messages.find(m => m.id === item.reply_to_id)
      : null;

    // Get reactions
    const reactions = item.reactions || {};
    const reactionKeys = Object.keys(reactions).filter(emoji => reactions[emoji].length > 0);

    const messageContent = (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={(e) => {
          console.log('🔴 Long press detected on message type:', item.message_type);
          handleLongPress(item, e);
        }}
        delayLongPress={600}
      >
        {item.message_type === 'image' && item.media_url ? (
          <ImageMessage 
            imageUrl={item.media_url} 
            isMe={isMe}
            deliveryStatus={isMe ? getMessageStatus(item) : undefined}
            timestamp={formatTime(item.created_at)}
            onLongPress={(e) => handleLongPress(item, e)}
          />
        ) : item.message_type === 'voice' && item.media_url ? (
          <VoiceMessage 
            audioUrl={item.media_url} 
            isMe={isMe}
            deliveryStatus={isMe ? getMessageStatus(item) : undefined}
            timestamp={formatTime(item.created_at)}
            onLongPress={(e) => handleLongPress(item, e)}
          />
        ) : (
          <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.theirMsg]}>
            {/* Show replied message */}
            {repliedMessage && (
              <View style={styles.repliedMsg}>
                <View style={styles.repliedBar} />
                <View style={styles.repliedContent}>
                  <Text style={styles.repliedName}>
                    {repliedMessage.sender_id === user?.id ? 'You' : sellerName}
                  </Text>
                  <Text style={styles.repliedText} numberOfLines={1}>
                    {repliedMessage.message_type === 'image' ? '📷 Photo' :
                     repliedMessage.message_type === 'voice' ? '🎤 Voice' :
                     repliedMessage.content}
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText, item.is_deleted && styles.deletedText]}>
              {item.content}
            </Text>

            {/* Show link preview */}
            {item.link_preview && (
              <LinkPreview preview={item.link_preview} isMe={isMe} />
            )}

            <View style={styles.msgFooter}>
              {item.is_starred && (
                <Text style={styles.starIcon}>⭐</Text>
              )}
              <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime]}>
                {formatTime(item.created_at)}
              </Text>
              {isMe && (
                <Text style={[styles.msgStatus, item.read_at && styles.msgStatusRead]}>
                  {getMessageStatus(item)}
                </Text>
              )}
            </View>
          </View>
        )}

          {/* Show reactions */}
          {reactionKeys.length > 0 && (
            <View style={[styles.reactionsContainer, isMe ? styles.reactionsRight : styles.reactionsLeft]}>
              {reactionKeys.map(emoji => (
                <View key={emoji} style={styles.reactionBubble}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{reactions[emoji].length}</Text>
                </View>
              ))}
            </View>
          )}
      </TouchableOpacity>
    );

    return (
      <View style={[styles.msgWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
        {messageContent}
      </View>
    );
  };

  const displayTitle = adInfo?.title ?? adTitle;
  const displayPrice = adInfo?.price ?? adPrice;
  const displayImage = adInfo?.images?.[0] ?? adImage;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.senderName}>{sellerName || 'Agro Member'}</Text>
            <Text style={[styles.onlineStatus, otherUserOnline && styles.onlineActive]}>
              {otherUserOnline ? '● Online' : `Last seen ${formatLastSeen(lastSeen)}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleCall} style={styles.headerBtn}>
              <Phone size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => setShowStarredMessages(true)}
            >
              <MoreVertical size={22} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {displayTitle && (
          <View style={styles.adContext}>
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.adThumb} />
            ) : (
              <View style={[styles.adThumb, styles.placeholderThumb]}>
                <Text style={styles.placeholderChar}>📦</Text>
              </View>
            )}
            <View style={styles.adContextInfo}>
              <Text style={styles.adTitleContext} numberOfLines={1}>{displayTitle}</Text>
              {displayPrice !== undefined && (
                <Text style={styles.adPriceContext}>₦{Number(displayPrice).toLocaleString()}</Text>
              )}
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008102" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={getMessagesWithDateSeparators()}
            keyExtractor={(item, index) => item.type === 'date' ? item.id : `${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={[styles.messagesList, messages.length === 0 && styles.emptyList]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubText}>Say hello! 👋</Text>
              </View>
            }
          />
        )}

        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotDelay1]} />
            <View style={[styles.typingDot, styles.typingDotDelay2]} />
            <Text style={styles.typingText}>{sellerName} is typing...</Text>
          </View>
        )}

        {!loading && messages.length === 0 && (
          <View style={styles.chipRow}>
            <QuickChip label="Is this available?" />
            <QuickChip label="Last price?" />
            <QuickChip label="Can you deliver?" />
          </View>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() => setShowMediaMenu(true)}
          >
            <ImageIcon size={24} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (text.length > 0) {
                handleTyping();
              } else {
                stopTyping();
              }
            }}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Media Menu Modal */}
        <Modal visible={showMediaMenu} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMediaMenu(false)}
          >
            <View style={styles.mediaMenu}>
              <TouchableOpacity style={styles.mediaOption} onPress={pickImage}>
                <View style={[styles.mediaIcon, { backgroundColor: '#3B82F6' }]}>
                  <ImageIcon size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.mediaText}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={startRecording}>
                <View style={[styles.mediaIcon, { backgroundColor: '#EF4444' }]}>
                  <Mic size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.mediaText}>Voice</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={() => setShowMediaMenu(false)}>
                <View style={[styles.mediaIcon, { backgroundColor: '#6B7280' }]}>
                  <X size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.mediaText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Recording Indicator with Waveform */}
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <TouchableOpacity style={styles.cancelRecordingBtn} onPress={cancelRecording}>
              <Text style={styles.cancelRecordingText}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <WaveformRecording 
                duration={recordingDuration} 
                amplitudes={recordingAmplitudes}
              />
            </View>
            <TouchableOpacity style={styles.stopRecordingBtn} onPress={stopRecording}>
              <Text style={styles.stopRecordingText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Uploading Indicator */}
        {uploadingMedia && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#008102" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}

        {/* Reply Preview */}
        {replyingTo && (
          <ReplyPreview
            message={replyingTo}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        {/* Reaction Picker */}
        <ReactionPicker
          visible={showReactionPicker}
          onClose={() => setShowReactionPicker(false)}
          onSelectReaction={handleReaction}
          position={reactionPickerPosition}
        />

        {/* Message Actions Menu */}
        <MessageActions
          visible={showMessageActions}
          onClose={() => setShowMessageActions(false)}
          onReply={handleReplyFromMenu}
          onStar={handleStarMessage}
          onDelete={handleDeleteMessage}
          onForward={handleForwardMessage}
          isMyMessage={selectedMessage?.sender_id === user?.id}
          isStarred={selectedMessage?.is_starred || false}
          position={messageActionsPosition}
        />

        {/* Forward Modal */}
        <ForwardModal
          visible={showForwardModal}
          onClose={() => setShowForwardModal(false)}
          message={selectedMessage}
        />

        {/* Starred Messages Modal */}
        <Modal visible={showStarredMessages} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowStarredMessages(false)}>
                <ArrowLeft size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Starred Messages</Text>
              <View style={{ width: 24 }} />
            </View>

            <FlatList
              data={messages.filter(m => m.is_starred)}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isMe = item.sender_id === user?.id;
                return (
                  <TouchableOpacity
                    style={styles.starredItem}
                    onPress={() => {
                      setShowStarredMessages(false);
                      // Scroll to message (optional - requires more work)
                    }}
                  >
                    <View style={[styles.starredBubble, isMe ? styles.myMsg : styles.theirMsg]}>
                      {item.message_type === 'image' ? (
                        <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                          📷 Photo
                        </Text>
                      ) : item.message_type === 'voice' ? (
                        <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                          🎤 Voice message
                        </Text>
                      ) : (
                        <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                          {item.content}
                        </Text>
                      )}
                      <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime, { marginTop: 4 }]}>
                        {formatDate(item.created_at)} {formatTime(item.created_at)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No starred messages</Text>
                  <Text style={styles.emptySubText}>Long press a message and tap ⭐ to star it</Text>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
  headerInfo: { flex: 1, marginLeft: 12 },
  senderName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  onlineStatus: { fontSize: 12, color: '#6B7280' },
  onlineActive: { color: '#10B981' },
  headerActions: { flexDirection: 'row' },
  headerBtn: { marginLeft: 16 },
  adContext: { flexDirection: 'row', padding: 12, backgroundColor: '#F9FAFB', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  adThumb: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#E5E7EB' },
  placeholderThumb: { justifyContent: 'center', alignItems: 'center' },
  placeholderChar: { fontSize: 20 },
  adContextInfo: { marginLeft: 12, flex: 1 },
  adTitleContext: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  adPriceContext: { fontSize: 15, fontWeight: '700', color: '#008102' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '600', marginBottom: 4 },
  emptySubText: { fontSize: 14, color: '#9CA3AF' },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dateLabel: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 12 },
  menuButton: { padding: 8, opacity: 0.6 },
  menuDots: { fontSize: 20, color: '#6B7280', fontWeight: 'bold' },
  msgWrapper: { marginVertical: 2 },
  myWrapper: { alignItems: 'flex-end' },
  theirWrapper: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myMsg: { backgroundColor: '#008102', borderBottomRightRadius: 4 },
  theirMsg: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  myText: { color: '#FFFFFF', fontSize: 15 },
  theirText: { color: '#111827', fontSize: 15 },
  msgText: { lineHeight: 22 },
  msgFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  msgTime: { fontSize: 10 },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  theirTime: { color: '#9CA3AF' },
  msgStatus: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  msgStatusRead: { color: '#34D399' },
  deletedText: { fontStyle: 'italic', opacity: 0.6 },
  starIcon: { fontSize: 12, marginRight: 4 }, // Green for read
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9FAFB' },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B7280', marginRight: 4 },
  typingDotDelay1: { opacity: 0.7 },
  typingDotDelay2: { opacity: 0.5 },
  typingText: { fontSize: 12, color: '#6B7280', marginLeft: 4, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' },
  chipText: { fontSize: 13, color: '#008102', fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
  plusBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: '#F9FAFB', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#008102', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  mediaMenu: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-around' },
  mediaOption: { alignItems: 'center' },
  mediaIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  mediaText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  recordingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FEE2E2', paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recordingPulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', marginRight: 12 },
  recordingText: { flex: 1, fontSize: 16, color: '#DC2626', fontWeight: '600' },
  cancelRecordingBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cancelRecordingText: { fontSize: 20, color: '#EF4444', fontWeight: '700' },
  stopRecordingBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#008102', borderRadius: 20 },
  stopRecordingText: { color: '#FFFFFF', fontWeight: '700' },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { marginTop: 12, fontSize: 16, color: '#008102', fontWeight: '600' },
  // Reply styles
  repliedMsg: { flexDirection: 'row', marginBottom: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 8 },
  repliedBar: { width: 3, backgroundColor: '#008102', borderRadius: 2, marginRight: 8 },
  repliedContent: { flex: 1 },
  repliedName: { fontSize: 12, fontWeight: '600', color: '#008102', marginBottom: 2 },
  repliedText: { fontSize: 13, color: '#6B7280' },
  // Reaction styles
  reactionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4 },
  reactionsLeft: { justifyContent: 'flex-start' },
  reactionsRight: { justifyContent: 'flex-end' },
  reactionBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 10, marginLeft: 2, color: '#6B7280', fontWeight: '600' },
  // Starred messages modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  starredItem: { marginBottom: 12 },
  starredBubble: { maxWidth: '100%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
});