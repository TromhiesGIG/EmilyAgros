// src/services/termiiAuth.ts
import { supabase } from './supabase';

const SUPABASE_URL = 'https://nstrcagacssakwwouryh.supabase.co';

/**
 * Format Nigerian phone number to E.164 format
 */
export const formatNigerianPhone = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('234')) {
    return '+' + digits;
  }
  
  if (digits.startsWith('0')) {
    return '+234' + digits.slice(1);
  }
  
  if (digits.length === 10) {
    return '+234' + digits;
  }
  
  return '+234' + digits;
};

/**
 * Send OTP via Termii (calls Edge Function)
 */
export const sendPhoneOTP = async (phoneNumber: string) => {
  try {
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    
    if (!cleanPhone.startsWith('+234')) {
      throw new Error('Phone number must be Nigerian (+234)');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: cleanPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OTP and sign in (calls Edge Function)
 */
export const verifyPhoneOTP = async (phoneNumber: string, otp: string) => {
  try {
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phoneNumber: cleanPhone,
        otp: otp.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid code');
    }

    // Use the access token to establish session
    if (data.accessToken) {
      // Exchange token for session
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.accessToken,
        type: 'magiclink',
      });

      if (sessionError) throw sessionError;

      return { 
        success: true, 
        user: sessionData.user,
        isNewUser: data.isNewUser,
      };
    }

    return { success: true, user: null };
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return { success: false, error: error.message };
  }
};