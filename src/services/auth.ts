import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Sign up with email
  async signUp({ email, password, firstName, lastName }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // Update profile with name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', data.user.id);

    if (profileError) throw profileError;

    return data;
  }

  // Sign in with email
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();

// ============== GOOGLE OAUTH ==============

export const signInWithGoogle = async () => {
  try {
    const redirectTo = makeRedirectUri({
      scheme: 'emilyagros',
      path: 'auth/callback',
    });

    console.log('Redirect URL:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    console.log('Opening browser...');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    console.log('Browser result type:', result.type);

    if (result.type === 'success') {
      const url = result.url;
      console.log('Result URL:', url);

      // Extract tokens from HASH params
      const hashParams = url.split('#')[1] || '';
      const params = new URLSearchParams(hashParams);
      
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      console.log('Has tokens:', { access: !!access_token, refresh: !!refresh_token });

      if (access_token && refresh_token) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) throw sessionError;

        const user = sessionData.user;
        console.log('User ID:', user?.id);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profile) {
            const fullName = user.user_metadata?.full_name || '';
            const [firstName = '', ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');

            await supabase.from('profiles').insert({
              id: user.id,
              first_name: firstName || user.user_metadata?.name || user.email?.split('@')[0],
              last_name: lastName,
            });
          }

          return { success: true, user };
        }
      } else {
        return { success: false, error: 'No tokens received from Google' };
      }
    }

    if (result.type === 'cancel') {
      return { success: false, error: 'Authentication cancelled' };
    }

    return { success: false, error: 'Authentication failed' };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

// ============== PHONE AUTHENTICATION ==============

/**
 * Format Nigerian phone number to E.164 format
 * Accepts: 08012345678, 8012345678, +2348012345678
 * Returns: +2348012345678
 */
export const formatNigerianPhone = (phone: string): string => {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 234, add +
  if (digits.startsWith('234')) {
    return '+' + digits;
  }
  
  // If starts with 0, replace with +234
  if (digits.startsWith('0')) {
    return '+234' + digits.slice(1);
  }
  
  // If just the number without 0 or 234
  if (digits.length === 10) {
    return '+234' + digits;
  }
  
  // Default: assume it needs +234
  return '+234' + digits;
};

/**
 * Send OTP to phone number
 * @param phoneNumber - Must be in E.164 format: +234XXXXXXXXXX
 */
export const sendPhoneOTP = async (phoneNumber: string) => {
  try {
    // Remove any spaces or dashes
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    
    // Validate format
    if (!cleanPhone.startsWith('+234')) {
      throw new Error('Phone number must start with +234 for Nigeria');
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OTP code
 * @param phoneNumber - Same format as sent: +234XXXXXXXXXX
 * @param token - 6-digit OTP code
 */
export const verifyPhoneOTP = async (phoneNumber: string, token: string) => {
  try {
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: cleanPhone,
      token,
      type: 'sms',
    });

    if (error) throw error;

    const user = data.user;

    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create profile with phone number
        await supabase.from('profiles').insert({
          id: user.id,
          phone: cleanPhone,
        });
      } else if (!profile.phone) {
        // Update existing profile with phone
        await supabase
          .from('profiles')
          .update({ phone: cleanPhone })
          .eq('id', user.id);
      }

      return { success: true, user };
    }

    return { success: false, error: 'Verification failed' };
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return { success: false, error: error.message };
  }
};