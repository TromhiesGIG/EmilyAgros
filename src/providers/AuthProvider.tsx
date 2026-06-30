// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Check admin separately — never blocks auth state
      if (currentUser) checkAdminStatus(currentUser.id);
      else setIsAdmin(false);
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Check admin separately — never blocks loading
      if (currentUser) checkAdminStatus(currentUser.id);
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
    } finally {
      // Always unblock loading — admin check runs independently
      setLoading(false);
    }
  };

  const checkAdminStatus = (userId: string) => {
    // Hard-coded admin IDs — no DB query, no RLS, no hanging
    const ADMIN_IDS = ['33a9846a-b70a-40c4-a041-c311c4a0f647'];
    setIsAdmin(ADMIN_IDS.includes(userId));
  };


  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};