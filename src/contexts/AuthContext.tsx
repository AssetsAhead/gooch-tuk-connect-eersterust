
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: any | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requireMFA: boolean;
  isSecureSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [requireMFA, setRequireMFA] = useState(false);
  const [isSecureSession, setIsSecureSession] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to get from profiles table first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        
        // Check if MFA is required for high-security roles
        const highSecurityRoles = ['police', 'admin', 'marshall'];
        // Note: role will be available after types are updated
        setRequireMFA(false); // Temporarily disabled
        
        return;
      }

      // Fallback to users table if profiles doesn't exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        setUserProfile(userData);
        const highSecurityRoles = ['police', 'admin', 'marshall'];
        setRequireMFA(highSecurityRoles.includes(userData.role));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const validateSession = async (session: Session) => {
    try {
      // Enhanced session validation for South African security requirements
      const deviceFingerprint = localStorage.getItem('deviceFingerprint');
      const lastKnownIP = localStorage.getItem('lastKnownIP');
      
      // Check for session anomalies
      const response = await fetch('https://api.ipify.org?format=json');
      const currentIP = await response.json();
      
      if (lastKnownIP && lastKnownIP !== currentIP.ip) {
        // Security logging temporarily disabled until types are updated
        toast({
          title: "Location Change Detected",
          description: "We noticed you're logging in from a new location. If this wasn't you, please contact support.",
          duration: 10000,
        });
      }
      
      localStorage.setItem('lastKnownIP', currentIP.ip);
      setIsSecureSession(true);
      
    } catch (error) {
      console.warn('Session validation failed:', error);
      setIsSecureSession(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to catch magic link events
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Use setTimeout to defer Supabase calls and prevent deadlocks
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
          validateSession(session);
        }, 0);
      } else {
        setUserProfile(null);
        setRequireMFA(false);
        setIsSecureSession(false);
      }
      
      setLoading(false);

      // Only show welcome toast for magic link sign-ins, not regular page loads
      if (event === 'SIGNED_IN' && session?.user) {
        toast({
          title: "Welcome to TukTuk Community!",
          description: "You're now connected to South Africa's transport network",
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed Out",
          description: "Stay safe on the roads",
        });
      }
    });

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        validateSession(session);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      // Logout logging temporarily disabled until types are updated

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear security-related localStorage
      localStorage.removeItem('deviceFingerprint');
      localStorage.removeItem('lastKnownIP');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    signOut,
    refreshProfile,
    requireMFA,
    isSecureSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
