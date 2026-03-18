import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, Image, KeyboardAvoidingView, 
  Platform, Linking, Alert 
} from 'react-native';
import { ArrowLeft, Phone, MoreVertical, Plus, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../providers/AuthProvider';

export const ChatDetail = ({ route, navigation }: any) => {
  const { chatId, sellerName, adTitle, adPrice, adImage, phoneNumber } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // 1. Clinical Call Sign Function
  const handleCall = () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Seller's phone number is not available.");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // 2. Real-time Subscription (The "Toronto Sync")
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId) // Assuming you have a chat_id grouping messages
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  // 3. Sending logic (Quick Chips & Input)
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const { error } = await supabase.from('messages').insert([{
      chat_id: chatId,
      sender_id: user?.id,
      content: text,
      is_read: false
    }]);
    if (!error) setInputText("");
  };

  const QuickChip = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.chip} onPress={() => sendMessage(label)}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header - Matching Figma */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.senderName}>{sellerName}</Text>
          <Text style={styles.lastSeen}>last seen: online</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCall}><Phone size={22} color="#111827" /></TouchableOpacity>
          <TouchableOpacity><MoreVertical size={22} color="#111827" style={{ marginLeft: 15 }} /></TouchableOpacity>
        </View>
      </View>

      {/* Ad Context Bar */}
      <View style={styles.adContext}>
        <Image source={{ uri: adImage }} style={styles.adThumb} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.adTitleContext}>{adTitle}</Text>
          <Text style={styles.adPriceContext}>₦ {adPrice.toLocaleString()}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msgBubble, item.sender_id === user?.id ? styles.myMsg : styles.theirMsg]}>
            <Text style={[styles.msgText, item.sender_id === user?.id ? styles.myText : styles.theirText]}>
              {item.content}
            </Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Quick Chips (Empty State Logic) */}
      {messages.length === 0 && (
        <View style={styles.chipRow}>
          <QuickChip label="Is this available?" />
          <QuickChip label="Is this your last price?" />
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.plusBtn}><Plus size={24} color="#6B7280" /></TouchableOpacity>
        <TextInput 
          style={styles.input} 
          placeholder="Type your message here" 
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={() => sendMessage(inputText)}><Send size={24} color="#008102" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerInfo: { flex: 1, marginLeft: 12 },
  senderName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  lastSeen: { fontSize: 12, color: '#10B981' },
  headerActions: { flexDirection: 'row' },
  adContext: { flexDirection: 'row', padding: 12, backgroundColor: '#F9FAFB', alignItems: 'center' },
  adThumb: { width: 40, height: 40, borderRadius: 4 },
  adTitleContext: { fontSize: 14, color: '#4B5563' },
  adPriceContext: { fontSize: 14, fontWeight: '700', color: '#008102' },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginVertical: 4, marginHorizontal: 16 },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#008102', borderBottomRightRadius: 2 },
  theirMsg: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', borderBottomLeftRadius: 2 },
  myText: { color: '#FFFFFF' },
  theirText: { color: '#111827' },
  msgText: { fontSize: 15 },
  chipRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  chipText: { fontSize: 13, color: '#4B5563' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  input: { flex: 1, height: 44, backgroundColor: '#F9FAFB', borderRadius: 22, paddingHorizontal: 16, marginHorizontal: 12 },
  plusBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});