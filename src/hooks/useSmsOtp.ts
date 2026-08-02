import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmsOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  verified?: boolean;
  userId?: string;
  isNewUser?: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  };
}

const FN_URL = 'https://iiompkhsodkztxllbvkm.supabase.co/functions/v1/sms-otp';
const FN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb21wa2hzb2RrenR4bGxidmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzQ2NjcsImV4cCI6MjA2Njk1MDY2N30.GgqF-D88r5HJcZ9qOAyfXhJUjFIRWyQncYUx2SVs9bY';

/**
 * Calls the sms-otp edge function. Uses supabase.functions.invoke first and
 * falls back to a plain fetch when the SDK request fails at the network layer
 * (seen on some mobile browsers / restrictive mobile networks).
 */
async function callSmsOtp(body: Record<string, unknown>): Promise<SmsOtpResult> {
  try {
    const { data, error } = await supabase.functions.invoke<SmsOtpResult>('sms-otp', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as SmsOtpResult;
  } catch (primaryError: any) {
    console.warn('functions.invoke failed, retrying with direct fetch:', primaryError?.message);
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: FN_KEY,
        Authorization: `Bearer ${FN_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      throw new Error(json?.error || primaryError?.message || 'Request failed');
    }
    return json as SmsOtpResult;
  }
}

export const useSmsOtp = () => {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const { toast } = useToast();


  const sendOtp = async (phoneNumber: string): Promise<boolean> => {
    if (!phoneNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('Sending OTP to:', phoneNumber);
      const { data, error } = await supabase.functions.invoke<SmsOtpResult>('sms-otp', {
        body: { phone: phoneNumber, action: 'send' },
      });

      console.log('Send OTP response:', data, error);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPhone(phoneNumber);
      setOtpSent(true);
      
      toast({
        title: "Code Sent",
        description: "Check your phone for the verification code",
      });

      return true;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string): Promise<{ success: boolean; userId?: string; isNewUser?: boolean }> => {
    if (!code || code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    try {
      console.log('Verifying OTP for phone:', phone);
      const { data, error } = await supabase.functions.invoke<SmsOtpResult>('sms-otp', {
        body: { phone, action: 'verify', code },
      });

      console.log('Verify OTP response:', data, error);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.verified && data?.session) {
        // Set the session directly from the edge function response
        console.log('Setting session from edge function response');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('Failed to set session:', sessionError);
          toast({
            title: "Authentication Error",
            description: "Failed to establish session. Please try again.",
            variant: "destructive",
          });
          return { success: false };
        }

        console.log('Session set successfully!');
        toast({
          title: "Verified!",
          description: data.isNewUser ? "Account created successfully" : "Welcome back!",
        });

        return { 
          success: true, 
          userId: data.userId,
          isNewUser: data.isNewUser,
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setPhone('');
  };

  return {
    loading,
    otpSent,
    phone,
    sendOtp,
    verifyOtp,
    resetOtp,
  };
};
