// src/hooks/usePresence.ts
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../providers/AuthProvider';

export const usePresence = () => {
  const { user } = useAuth();

  const updatePresence = async (isOnline: boolean) => {
    if (!user) return;

    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  };

  useEffect(() => {
    if (!user) return;

    // Set online when component mounts
    updatePresence(true);

    // Track app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updatePresence(true);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        updatePresence(false);
      }
    });

    // Set offline when component unmounts
    return () => {
      updatePresence(false);
      subscription.remove();
    };
  }, [user]);

  return { updatePresence };
};