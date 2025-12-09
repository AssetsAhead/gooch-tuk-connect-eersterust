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
  devCode?: string;
  email?: string;
  tempPassword?: string;
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

      // In dev mode, show the code
      if (data?.devCode) {
        console.log('DEV: OTP Code is', data.devCode);
        toast({
          title: "Dev Mode",
          description: `Your code is: ${data.devCode}`,
        });
      }

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

      if (data?.verified && data?.email && data?.tempPassword) {
        // Sign in using the temporary password created by the edge function
        console.log('Signing in with email:', data.email);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.tempPassword,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          toast({
            title: "Authentication Error",
            description: "Verification successful but sign-in failed. Please try again.",
            variant: "destructive",
          });
          return { success: false };
        }

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
