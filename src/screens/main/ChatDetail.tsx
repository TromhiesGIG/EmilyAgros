// src/screens/main/ChatDetail.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, Linking, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ArrowLeft, Phone, MoreVertical, Send, ImageIcon,
  Mic, X, Camera, Copy, Trash2, Store, Ban,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { ImageMessage } from '../../components/ImageMessage';
import { VoiceMessage } from '../../components/VoiceMessage';
import { ReplyPreview } from '../../components/ReplyPreview';
import { ReactionPicker } from '../../components/ReactionPicker';
import { LinkPreview } from '../../components/LinkPreview';
import { WaveformRecording } from '../../components/WaveformRecording';
import { extractUrls, fetchLinkPreview } from '../../utils/linkPreviewUtil';
import { SwipeableMessage } from '../../components/SwipeableMessage';

const GREEN = '#008102';
const GRAY  = '#6B7280';

export const ChatDetail = ({ route, navigation }: any) => {
  const { adId, receiverId, sellerName, adTitle, adPrice, adImage, phoneNumber } = route.params;
  const { user } = useAuth();

  const [messages, setMessages]               = useState<any[]>([]);
  const [inputText, setInputText]             = useState('');
  const [loading, setLoading]                 = useState(true);
  const [sending, setSending]                 = useState(false);
  const [adInfo, setAdInfo]                   = useState<any>(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [lastSeen, setLastSeen]               = useState<string>('');
  const [isRecording, setIsRecording]         = useState(false);
  const [recordingDuration, setRecordingDuration]     = useState(0);
  const [recordingAmplitudes, setRecordingAmplitudes] = useState<number[]>([]);
  const [showMediaMenu, setShowMediaMenu]     = useState(false);
  const [uploadingMedia, setUploadingMedia]   = useState(false);
  const [replyingTo, setReplyingTo]           = useState<any>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [selectedMessage, setSelectedMessage]       = useState<any>(null);
  const [showChatMenu, setShowChatMenu]             = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<any>(null);
  const [reactionPickerPosition, setReactionPickerPosition]         = useState({ x: 0, y: 0 });

  // Fix 2: track which voice note is currently playing
  const [currentlyPlayingUrl, setCurrentlyPlayingUrl] = useState<string | null>(null);

  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());

  const flatListRef    = useRef<FlatList>(null);
  // Fix 3: stable ref for recording interval
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Fix 4: hide bottom tab bar
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: { paddingBottom: 8, paddingTop: 8, height: 60, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    });
  }, [navigation]);

  const recorder = useAudioRecorder(
    { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true },
    (status: any) => {
      if (status.isRecording && status.metering !== undefined) {
        const m = status.metering ?? -60;
        let h = m < -45 ? 0.2 : m <= -5 ? 0.2 + ((m + 45) / 40) * 0.7 : Math.min(1.0, 0.9 + ((m + 5) / 5) * 0.1);
        setRecordingAmplitudes(prev => [...prev, h].slice(-30));
      }
    }
  );

  const chatRoom = React.useMemo(() => {
    const ids = [user?.id, receiverId].filter(Boolean).sort();
    return `${ids[0]}_${ids[1]}_${adId || 'general'}`;
  }, [user?.id, receiverId, adId]);

  const { isOtherUserTyping, handleTyping, stopTyping } = useTypingIndicator({ chatRoom, otherUserId: receiverId });

  useEffect(() => {
    if (!receiverId) return;
    const channel = supabase.channel(`presence-${receiverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence', filter: `user_id=eq.${receiverId}` },
        (payload) => { const p = payload.new as any; setOtherUserOnline(p.is_online); setLastSeen(p.last_seen); })
      .subscribe();
    supabase.from('user_presence').select('*').eq('user_id', receiverId).single()
      .then(({ data }) => { if (data) { setOtherUserOnline(data.is_online); setLastSeen(data.last_seen); } });
    return () => { supabase.removeChannel(channel); };
  }, [receiverId]);

  useEffect(() => {
    if (adTitle) setAdInfo({ title: adTitle, price: adPrice, images: adImage ? [adImage] : [] });
    else if (adId) supabase.from('products').select('title, price, images').eq('id', adId).single()
      .then(({ data }) => { if (data) setAdInfo(data); });
  }, [adId, adTitle, adPrice, adImage]);

  const fetchMessages = useCallback(async () => {
    if (!user || !receiverId) { setLoading(false); return; }
    try {
      // Fix: no ad_id filter — one conversation per seller
      const { data, error } = await supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (error) { setLoading(false); return; }
      setMessages(data || []);
      const unreadIds = (data || []).filter((m: any) => m.receiver_id === user.id && !m.is_read).map((m: any) => m.id);
      if (unreadIds.length > 0) {
        const now = new Date().toISOString();
        await supabase.from('messages').update({ is_read: true, read_at: now, delivered_at: now }).in('id', unreadIds);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [user, receiverId]);

  useEffect(() => {
    fetchMessages();
    if (user) supabase.from('typing_status').upsert({ user_id: user.id, chat_room: chatRoom, is_typing: false, updated_at: new Date().toISOString() });

    const channel = supabase.channel(`chat-${chatRoom}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        const isThisConvo =
          (newMsg.sender_id === user?.id && newMsg.receiver_id === receiverId) ||
          (newMsg.sender_id === receiverId && newMsg.receiver_id === user?.id);
        if (!isThisConvo) return;

        setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);

        // Fix 1: mark as read immediately and update local state
        if (newMsg.receiver_id === user?.id) {
  fetchMessages();
}
      })
     

      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
  const updated = payload.new as any;
  console.log('MESSAGE UPDATE RECEIVED:', {
    id: updated.id,
    read_at: updated.read_at,
    delivered_at: updated.delivered_at,
  });
  if (updated.read_at) {
    setReadMessages(prev => new Set([...prev, updated.id]));
  }
  setMessages(prev => {
    const exists = prev.some(m => String(m.id) === String(updated.id));
    if (!exists) return prev;
    return prev.map(m =>
      String(m.id) === String(updated.id) ? { ...m, ...updated } : m
    );
  });
})
      .subscribe();

    return () => {
      if (user) supabase.from('typing_status').upsert({ user_id: user.id, chat_room: chatRoom, is_typing: false, updated_at: new Date().toISOString() });
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, user, chatRoom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    stopTyping();
    const urls = extractUrls(text);
    let linkPreview = null;
    if (urls.length > 0) linkPreview = await fetchLinkPreview(urls[0]);
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, sender_id: user.id, receiver_id: receiverId, ad_id: adId,
      content: text.trim(), created_at: new Date().toISOString(),
      is_read: false, delivered_at: null, read_at: null,
      message_type: 'text', reply_to_id: replyingTo?.id || null,
      link_preview: linkPreview, _optimistic: true,
    }]);
    setInputText('');
    setReplyingTo(null);
    const messageData: any = { sender_id: user.id, receiver_id: receiverId, content: text.trim(), is_read: false, message_type: 'text' };
    if (adId) messageData.ad_id = adId;
    if (replyingTo) messageData.reply_to_id = replyingTo.id;
    if (linkPreview) messageData.link_preview = linkPreview;
    const { data, error } = await supabase.from('messages').insert(messageData).select().single();
    if (error) { setMessages(prev => prev.filter(m => m.id !== tempId)); Alert.alert('Error', 'Failed to send message.'); }
    else setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    setSending(false);
  };

  const decode = (base64: string) => {
    const b = atob(base64);
    const bytes = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) bytes[i] = b.charCodeAt(i);
    return bytes;
  };

  const takePhoto = async () => {
    setShowMediaMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) await uploadImage(result.assets[0].uri);
  };

  const pickImage = async () => {
    setShowMediaMenu(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow photo access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled && result.assets[0]) await uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    setUploadingMedia(true);
    try {
      const fileName = `${user.id}_${Date.now()}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(fileName, decode(base64), { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      const msg: any = { sender_id: user.id, receiver_id: receiverId, content: 'Photo', message_type: 'image', media_url: publicUrl, is_read: false };
      if (adId) msg.ad_id = adId;
      await supabase.from('messages').insert(msg);
    } catch { Alert.alert('Error', 'Failed to upload image'); }
    setUploadingMedia(false);
  };

  const startRecording = async () => {
    setShowMediaMenu(false);
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) { Alert.alert('Permission needed', 'Please allow microphone access'); return; }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    setRecordingDuration(0);
    setRecordingAmplitudes([]);

    // Fix 3: use stable ref for interval — clears properly on Android
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setUploadingMedia(true);
    // Fix 3: clear interval via ref
    if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
    try {
      await recorder.stop();
      if (recorder.uri) await uploadVoice(recorder.uri);
      setRecordingDuration(0); setRecordingAmplitudes([]);
    } catch { Alert.alert('Error', 'Failed to save recording'); }
    setUploadingMedia(false);
  };

  const cancelRecording = async () => {
    setIsRecording(false);
    // Fix 3: clear interval via ref
    if (recordingTimer.current) { clearInterval(recordingTimer.current); recordingTimer.current = null; }
    try { await recorder.stop(); setRecordingDuration(0); setRecordingAmplitudes([]); } catch {}
  };

  const uploadVoice = async (uri: string) => {
    if (!user) return;
    try {
      const fileName = `${user.id}_${Date.now()}.m4a`;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(fileName, decode(base64), { contentType: 'audio/m4a' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      const msg: any = { sender_id: user.id, receiver_id: receiverId, content: 'Voice message', message_type: 'voice', media_url: publicUrl, is_read: false };
      if (adId) msg.ad_id = adId;
      await supabase.from('messages').insert(msg);
    } catch { Alert.alert('Error', 'Failed to send voice message'); }
  };

  const handleLongPress = (message: any) => { setSelectedMessage(message); setShowMessageActions(true); };

  const handleCopyText = async () => {
    if (!selectedMessage) return;
    await Clipboard.setStringAsync(selectedMessage.content ?? '');
    setShowMessageActions(false);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) return;
    setShowMessageActions(false);
    Alert.alert('Delete message', 'This message will be deleted for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('messages').update({
          is_deleted: true, deleted_at: new Date().toISOString(),
          content: 'This message was deleted', media_url: null, message_type: 'text',
        }).eq('id', selectedMessage.id);
        setMessages(prev => prev.map(m => m.id === selectedMessage.id
          ? { ...m, is_deleted: true, content: 'This message was deleted', media_url: null, message_type: 'text' } : m));
      }},
    ]);
  };

  const handleMoveToSpam = () => {
    setShowChatMenu(false);
    Alert.alert('Move to Spam', 'This chat will be moved to spam.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move to Spam', onPress: async () => {
        await supabase.from('messages').update({ status: 'spam' })
          .or(`and(sender_id.eq.${receiverId},receiver_id.eq.${user?.id}),and(sender_id.eq.${user?.id},receiver_id.eq.${receiverId})`);
        navigation.goBack();
      }},
    ]);
  };

  const handleDeleteChat = () => {
    setShowChatMenu(false);
    Alert.alert('Delete Chat', 'This will hide the chat for you only. The other person will still see it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('hidden_chats').upsert({
          user_id: user?.id, other_user_id: receiverId, hidden_at: new Date().toISOString(),
        });
        if (error) { Alert.alert('Error', 'Could not delete chat.'); return; }
        navigation.goBack();
      }},
    ]);
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => {
    const date = new Date(d), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };
  const formatLastSeen = (s: string) => {
    if (!s) return '';
    const diff = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} mins ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    const d2 = Math.floor(h / 24);
    return d2 === 1 ? 'yesterday' : `${d2}d ago`;
  };

    
const getStatus = (msg: any) => {
  if (msg._optimistic) return '⏳';

  const messageId = String(msg.id);
  const isRead =
    Boolean(msg.read_at) || readMessages.has(messageId);

  if (isRead) return '✓✓';
  if (msg.delivered_at) return '✓✓';

  return '✓';
};
  const getWithSeparators = () => {
    const result: any[] = [];
    let lastDate = '';
    messages.forEach(msg => {
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) { result.push({ type: 'date', id: `date-${d}-${msg.id}`, label: formatDate(msg.created_at) }); lastDate = d; }
      result.push({ type: 'message', ...msg });
    });
    return result;
  };

  const isMyMsg = (msg: any) => msg?.sender_id === user?.id;
  const hasText  = inputText.trim().length > 0;

  const QuickChip = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.chip} onPress={() => sendMessage(label)}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSep}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const isMe    = item.sender_id === user?.id;
    const replied = item.reply_to_id ? messages.find(m => m.id === item.reply_to_id) : null;
    const reactions = item.reactions || {};
    const rxKeys = Object.keys(reactions).filter(e => reactions[e].length > 0);

    return (
      <View style={isMe ? styles.rowMe : styles.rowThem}>
    <SwipeableMessage
        isMe={isMe}
        onSwipeReply={() => setReplyingTo(item)}
      >
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        style={isMe ? styles.bubbleMe : styles.bubbleThem}
      >
          {item.message_type === 'image' && item.media_url ? (
            <ImageMessage imageUrl={item.media_url} isMe={isMe}
              deliveryStatus={isMe ? getStatus(item) : undefined}
              timestamp={formatTime(item.created_at)}
              onLongPress={() => handleLongPress(item)} />
          ) : item.message_type === 'voice' && item.media_url ? (
            // Fix 2: pass currentlyPlayingUrl and onPlay so only one plays at a time
            <VoiceMessage
              audioUrl={item.media_url} isMe={isMe}
              deliveryStatus={isMe ? getStatus(item) : undefined}
              timestamp={formatTime(item.created_at)}
              onLongPress={() => handleLongPress(item)}
              isActive={currentlyPlayingUrl === item.media_url}
              onPlay={(url) => setCurrentlyPlayingUrl(url)}
              onStop={() => setCurrentlyPlayingUrl(null)}
            />
          ) : (
            <>
              {replied && (
                <View style={styles.repliedBox}>
                  <View style={styles.repliedBar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repliedName}>{replied.sender_id === user?.id ? 'You' : sellerName}</Text>
                    <Text style={styles.repliedText} numberOfLines={1}>
                      {replied.message_type === 'image' ? 'Photo' : replied.message_type === 'voice' ? 'Voice message' : replied.content}
                    </Text>
                  </View>
                </View>
              )}
              <Text style={isMe ? styles.textMe : styles.textThem}>{item.content}</Text>
              {item.link_preview && <LinkPreview preview={item.link_preview} isMe={isMe} />}
              <View style={styles.footer}>
                <Text style={isMe ? styles.timeMe : styles.timeThem}>{formatTime(item.created_at)}</Text>
                
                {isMe && (
                  <Text
                    style={[
                      styles.status,
                      (
                        item.read_at ||
                        readMessages.has(String(item.id))
                      ) && styles.statusRead,
                    ]}
                  >
                    {getStatus(item)}
                  </Text>
                )}

              </View>
            </>
          )}
        </TouchableOpacity>
           </SwipeableMessage>
        {rxKeys.length > 0 && (
          <View style={isMe ? styles.rxRight : styles.rxLeft}>
            {rxKeys.map(e => (
              <View key={e} style={styles.rxBubble}>
                <Text style={styles.rxEmoji}>{e}</Text>
                <Text style={styles.rxCount}>{reactions[e].length}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const displayTitle = adInfo?.title ?? adTitle;
  const displayPrice = adInfo?.price ?? adPrice;
  const displayImage = adInfo?.images?.[0] ?? adImage;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        {/* Fix 4: proper KeyboardAvoidingView behavior per platform */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.headerName}>{sellerName || 'Agro Member'}</Text>
              <Text style={[styles.headerSub, otherUserOnline && { color: '#10B981' }]}>
                {otherUserOnline ? '● Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => phoneNumber && Linking.openURL(`tel:${phoneNumber}`)} style={{ marginLeft: 16 }}>
              <Phone size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowChatMenu(true)} style={{ marginLeft: 16 }}>
              <MoreVertical size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Ad context */}
          {displayTitle && (
            <View style={styles.adBar}>
              {displayImage
                ? <Image source={{ uri: displayImage }} style={styles.adThumb} />
                : <View style={[styles.adThumb, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }]}><ImageIcon size={18} color={GRAY} /></View>
              }
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.adTitle} numberOfLines={1}>{displayTitle}</Text>
                {displayPrice !== undefined && <Text style={styles.adPrice}>₦{Number(displayPrice).toLocaleString()}</Text>}
              </View>
            </View>
          )}

          {/* Messages */}
          {loading
            ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={GREEN} /></View>
            : (
              <FlatList
                ref={flatListRef}
                data={getWithSeparators()}
                
                keyExtractor={(item) =>
                  item.type === 'date'
                    ? item.id
                    : `message-${item.id}`
                }
                extraData={readMessages}

                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                ListEmptyComponent={
                  <View style={{ flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 }}>
                    <Text style={styles.emptyTitle}>How can we help you?</Text>
                    <Text style={styles.emptySub}>Ask a question about this item to get started.</Text>
                  </View>
                }
              />
            )
          }

          {/* Typing */}
          {isOtherUserTyping && (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 }}>
              {[1, 0.7, 0.4].map((o, i) => <View key={i} style={[styles.typingDot, { opacity: o }]} />)}
              <Text style={{ fontSize: 12, color: GRAY, marginLeft: 4, fontStyle: 'italic' }}>{sellerName} is typing...</Text>
            </View>
          )}

          {/* Quick chips */}
          {!loading && messages.length === 0 && (
            <View style={styles.chipRow}>
              <QuickChip label="Is this available?" />
              <QuickChip label="Is this your last price?" />
              <QuickChip label="What's the condition?" />
            </View>
          )}

          {/* Reply preview */}
          {replyingTo && (
          <ReplyPreview
            message={replyingTo}
            onCancel={() => setReplyingTo(null)}
            senderName={replyingTo.sender_id === user?.id ? 'You' : sellerName}
          />
        )}

          {/* Fix 4+5: input bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity onPress={() => setShowMediaMenu(true)}>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type your message here"
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={text => { setInputText(text); if (text.length > 0) handleTyping(); else stopTyping(); }}
              multiline
              maxLength={500}
            />
            {/* Fix 5: green circle background when text exists */}
            <TouchableOpacity
              style={[styles.sendBtn, hasText && styles.sendBtnActive]}
              onPress={() => sendMessage(inputText)}
              disabled={!hasText || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color={hasText ? '#FFFFFF' : GRAY} />
                : <Send size={20} color={hasText ? '#FFFFFF' : '#D1D5DB'} />
              }
            </TouchableOpacity>
          </View>

          {/* Recording bar */}
          {isRecording && (
            <View style={styles.recBar}>
              <TouchableOpacity style={styles.recCancel} onPress={cancelRecording}><X size={18} color="#EF4444" /></TouchableOpacity>
              <View style={{ flex: 1 }}><WaveformRecording duration={recordingDuration} amplitudes={recordingAmplitudes} /></View>
              <TouchableOpacity style={styles.recSend} onPress={stopRecording}><Send size={18} color="#FFFFFF" /></TouchableOpacity>
            </View>
          )}

          {/* Uploading */}
          {uploadingMedia && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="large" color={GREEN} />
              <Text style={{ marginTop: 12, color: GREEN, fontWeight: '600' }}>Uploading...</Text>
            </View>
          )}

          {/* Media menu */}
          <Modal visible={showMediaMenu} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMediaMenu(false)}>
              <View style={styles.menuCard}>
                <TouchableOpacity style={styles.menuRow} onPress={takePhoto}>
                  <Camera size={20} color="#111827" /><Text style={styles.menuText}>Take a photo</Text>
                </TouchableOpacity>
                <View style={styles.menuDiv} />
                <TouchableOpacity style={styles.menuRow} onPress={pickImage}>
                  <ImageIcon size={20} color="#111827" /><Text style={styles.menuText}>Upload from Gallery</Text>
                </TouchableOpacity>
                <View style={styles.menuDiv} />
                <TouchableOpacity style={styles.menuRow} onPress={startRecording}>
                  <Mic size={20} color="#111827" /><Text style={styles.menuText}>Voice Note</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cancelCircle} onPress={() => setShowMediaMenu(false)}>
                <X size={22} color="#111827" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Long press actions */}
          <Modal visible={showMessageActions} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMessageActions(false)}>
              <View style={[styles.actionsCard, isMyMsg(selectedMessage) ? { right: 16 } : { left: 16 }, { position: 'absolute', top: '42%' }]}>
                <TouchableOpacity style={styles.menuRow} onPress={handleCopyText}>
                  <Copy size={18} color="#111827" /><Text style={styles.menuText}>Copy text</Text>
                </TouchableOpacity>
                {isMyMsg(selectedMessage) && !selectedMessage?.is_deleted && (
                  <>
                    <View style={styles.menuDiv} />
                    <TouchableOpacity style={styles.menuRow} onPress={handleDeleteMessage}>
                      <Trash2 size={18} color="#DC2626" /><Text style={[styles.menuText, { color: '#DC2626' }]}>Delete message</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Three dots menu */}
          <Modal visible={showChatMenu} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowChatMenu(false)}>
              <View style={[styles.actionsCard, { position: 'absolute', top: 56, right: 16 }]}>
                <TouchableOpacity style={styles.menuRow} onPress={() => { setShowChatMenu(false); navigation.navigate('SellerProfile', { sellerId: receiverId }); }}>
                  <Store size={18} color="#111827" /><Text style={styles.menuText}>See ads from this seller</Text>
                </TouchableOpacity>
                <View style={styles.menuDiv} />
                <TouchableOpacity style={styles.menuRow} onPress={handleMoveToSpam}>
                  <Ban size={18} color="#111827" /><Text style={styles.menuText}>Move to Spam</Text>
                </TouchableOpacity>
                <View style={styles.menuDiv} />
                <TouchableOpacity style={styles.menuRow} onPress={handleDeleteChat}>
                  <Trash2 size={18} color="#DC2626" /><Text style={[styles.menuText, { color: '#DC2626' }]}>Delete chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Reaction picker */}
          <ReactionPicker
            visible={showReactionPicker}
            onClose={() => setShowReactionPicker(false)}
            onSelectReaction={async (emoji: string) => {
              if (!selectedMessageForReaction || !user) return;
              const reactions = { ...(selectedMessageForReaction.reactions || {}) };
              if (reactions[emoji]?.includes(user.id)) {
                reactions[emoji] = reactions[emoji].filter((id: string) => id !== user.id);
                if (!reactions[emoji].length) delete reactions[emoji];
              } else {
                reactions[emoji] = [...(reactions[emoji] || []), user.id];
              }
              await supabase.from('messages').update({ reactions }).eq('id', selectedMessageForReaction.id);
              setMessages(prev => prev.map(m => m.id === selectedMessageForReaction.id ? { ...m, reactions } : m));
            }}
            position={reactionPickerPosition}
          />

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerName:    { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub:     { fontSize: 12, color: GRAY, marginTop: 1 },
  adBar:         { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  adThumb:       { width: 44, height: 44, borderRadius: 6 },
  adTitle:       { fontSize: 14, color: '#374151', fontWeight: '500' },
  adPrice:       { fontSize: 14, fontWeight: '700', color: GREEN, marginTop: 2 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySub:      { fontSize: 14, color: GRAY, textAlign: 'center', lineHeight: 22 },
  dateSep:       { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dateLine:      { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dateLabel:     { fontSize: 12, color: '#9CA3AF', marginHorizontal: 12 },
  rowMe:         { marginVertical: 3, alignItems: 'flex-end' },
  rowThem:       { marginVertical: 3, alignItems: 'flex-start' },
  bubbleMe:      { alignSelf: 'flex-end', maxWidth: '78%', backgroundColor: GREEN, borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleThem:    { alignSelf: 'flex-start', maxWidth: '78%', backgroundColor: '#F0F0F0', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  textMe:        { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  textThem:      { color: '#111827', fontSize: 15, lineHeight: 22 },
  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3, gap: 3 },
  timeMe:        { fontSize: 10, color: 'rgba(255,255,255,0.65)' },
  timeThem:      { fontSize: 10, color: '#9CA3AF' },
  status:        { fontSize: 10, color: 'rgba(255,255,255,0.65)' },
  statusRead:    { color: '#34D399' },
  typingDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: GRAY, marginRight: 4 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  chipText:      { fontSize: 13, color: '#374151' },

  // Fix 4+5: input bar
  inputBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF', gap: 8 },
  plusIcon:      { fontSize: 28, color: '#374151', lineHeight: 32, paddingHorizontal: 4 },
  input:         { flex: 1, minHeight: 40, maxHeight: 100, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },

  // Fix 5: send button with green background when active
  sendBtn:       { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sendBtnActive: { backgroundColor: GREEN },

  recBar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FEE2E2', gap: 10 },
  recCancel:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  recSend:       { width: 36, height: 36, borderRadius: 18, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  uploadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', paddingBottom: 36, paddingHorizontal: 20 },
  menuCard:      { backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  actionsCard:   { backgroundColor: '#FFFFFF', borderRadius: 14, minWidth: 210, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  menuText:      { fontSize: 16, color: '#111827' },
  menuDiv:       { height: 1, backgroundColor: '#F3F4F6' },
  cancelCircle:  { alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  repliedBox:    { flexDirection: 'row', marginBottom: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 8, padding: 8 },
  repliedBar:    { width: 3, backgroundColor: '#FFFFFF', borderRadius: 2, marginRight: 8 },
  repliedName:   { fontSize: 12, fontWeight: '600', color: '#DCFCE7', marginBottom: 2 },
  repliedText:   { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  rxRight:       { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 3, gap: 4 },
  rxLeft:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginTop: 3, gap: 4 },
  rxBubble:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  rxEmoji:       { fontSize: 13 },
  rxCount:       { fontSize: 10, marginLeft: 2, color: GRAY, fontWeight: '600' },
});