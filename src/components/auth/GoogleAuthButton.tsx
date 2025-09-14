import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GoogleAuthButtonProps {
  disabled?: boolean;
  className?: string;
}

export const GoogleAuthButton = ({ disabled = false, className = "" }: GoogleAuthButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      variant="outline"
      className={`w-full ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        <img 
          src="/google-oauth-logo.png" 
          alt="Google" 
          className="w-5 h-5"
          onError={(e) => {
            // Fallback if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
        <span>{loading ? "Connecting..." : "Continue with Google"}</span>
      </div>
    </Button>
  );
};