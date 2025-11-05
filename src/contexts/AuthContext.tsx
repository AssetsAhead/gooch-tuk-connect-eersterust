
import * as React from 'react';
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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Debug diagnostics
  // eslint-disable-next-line no-console
  console.log('AuthProvider init: React keys', Object.keys(React || {}));
  // eslint-disable-next-line no-console
  console.log('AuthProvider init: typeof useState', typeof React?.useState);
  
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<any | null>(null);
  const [requireMFA, setRequireMFA] = React.useState(false);
  const [isSecureSession, setIsSecureSession] = React.useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        setUserProfile(userData);
      }

      // Compute MFA requirement from user_roles table (authoritative roles source)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);

      const highSecurityRoles = ['police', 'admin', 'marshall'];
      const roleNames = roles?.map((r: any) => r.role) ?? [];
      setRequireMFA(roleNames.some((r: string) => highSecurityRoles.includes(r)));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
        
        // Let React Router handle navigation instead of forced redirects
      } else {
        setUserProfile(null);
        setRequireMFA(false);
      }
      
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
