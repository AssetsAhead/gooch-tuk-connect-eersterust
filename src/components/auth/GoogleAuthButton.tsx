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
    // Prevent double-clicks
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Build redirect URL - use the current origin
      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('Google OAuth: Starting with redirect to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Skip browser redirect handling - let Supabase handle it directly
          skipBrowserRedirect: false,
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to start Google authentication",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If we have a URL, redirect manually (mobile fix)
      if (data?.url) {
        console.log('Google OAuth: Redirecting to:', data.url);
        // Use window.location.href for more reliable mobile redirect
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Google auth exception:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with Google",
        variant: "destructive",
      });
      setLoading(false);
    }
    // Don't setLoading(false) on success - we're navigating away
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      variant="outline"
      className={`w-full ${className}`}
      type="button"
    >
      <div className="flex items-center justify-center space-x-2">
        <img 
          src="/google-oauth-logo.png" 
          alt="Google" 
          className="w-5 h-5"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span>{loading ? "Connecting..." : "Continue with Google"}</span>
      </div>
    </Button>
  );
};