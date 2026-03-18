// src/hooks/useTypingIndicator.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../providers/AuthProvider';

interface TypingIndicatorProps {
  chatRoom: string; // format: "userId1_userId2_adId"
  otherUserId: string;
}

export const useTypingIndicator = ({ chatRoom, otherUserId }: TypingIndicatorProps) => {
  const { user } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to other user's typing status
  useEffect(() => {
    if (!user || !otherUserId) return;

    console.log('👂 Subscribing to typing for:', { chatRoom, otherUserId });

    const channel = supabase
      .channel(`typing-${chatRoom}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `chat_room=eq.${chatRoom}`,
        },
        (payload) => {
          console.log('⚡ Typing event received:', payload);
          const typingData = payload.new as any;
          if (typingData.user_id === otherUserId) {
            console.log('✅ Other user typing status:', typingData.is_typing);
            setIsOtherUserTyping(typingData.is_typing);
          }
        }
      )
      .subscribe();

    // Initial fetch
    supabase
      .from('typing_status')
      .select('*')
      .eq('chat_room', chatRoom)
      .eq('user_id', otherUserId)
      .single()
      .then(({ data }) => {
        console.log('📥 Initial typing status:', data);
        if (data) setIsOtherUserTyping(data.is_typing);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoom, otherUserId, user]);

  // Update my typing status
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!user) return;

    console.log('🔤 Setting typing status:', { isTyping, chatRoom, userId: user.id });

    const { error } = await supabase
      .from('typing_status')
      .upsert({
        user_id: user.id,
        chat_room: chatRoom,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,chat_room' });

    if (error) {
      console.error('❌ Typing status error:', error);
    } else {
      console.log('✅ Typing status updated');
    }
  }, [user, chatRoom]);

  // Debounced typing indicator
  const handleTyping = useCallback(() => {
    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000); // Stop typing after 2 seconds of inactivity
  }, [setTyping]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
  }, [setTyping]);

  return {
    isOtherUserTyping,
    handleTyping,
    stopTyping,
  };
};