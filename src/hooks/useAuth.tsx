import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (email: string, name?: string, role?: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      if (name && role) {
        // Sign up with email and magic link
        const { error } = await supabase.auth.signUp({
          email,
          password: 'temp-password-123!', // Temporary password for signup
          options: {
            emailRedirectTo: `${window.location.origin}/#/register-complete`,
            data: {
              full_name: name,
              role: role,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link to complete your registration",
        });
      } else {
        // Sign in with magic link
        const { error } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/#/`,
          }
        });
        if (error) throw error;

        toast({
          title: "Check Your Email", 
          description: "We've sent you a magic link to sign in",
        });
      }

      
      return true;
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (phone: string) => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+27') ? phone : `+27${phone.replace(/^0/, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      toast({
        title: "Check Your Phone",
        description: "We've sent you a verification code",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
    
    /* Commented out until phone auth is properly configured in Supabase
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+27') ? phone : `+27${phone.replace(/^0/, '')}`,
      });

      if (error) throw error;

      toast({
        title: "Check Your Phone",
        description: "We've sent you a verification code",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
    */
  };

  return {
    loading,
    handleEmailAuth,
    handlePhoneAuth,
  };
};