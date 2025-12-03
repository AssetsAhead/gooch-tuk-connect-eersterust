import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthForm } from '@/components/auth/AuthForm';
import { VerificationSent } from '@/components/auth/VerificationSent';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Shield, Car, Users, CreditCard, UserCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

const roleConfig = {
  passenger: {
    title: 'Passenger Portal',
    subtitle: 'Book safe, reliable rides',
    icon: Users,
    color: 'tuk-blue',
    gradient: 'from-tuk-blue/20 to-info/10'
  },
  driver: {
    title: 'Driver Portal', 
    subtitle: 'Manage rides and earnings',
    icon: Car,
    color: 'tuk-orange',
    gradient: 'from-tuk-orange/20 to-warning/10'
  },
  owner: {
    title: 'Vehicle Owner Portal',
    subtitle: 'Fleet management dashboard',
    icon: CreditCard,
    color: 'success',
    gradient: 'from-success/20 to-secondary/10'
  },
  marshall: {
    title: 'Rank Marshall Portal',
    subtitle: 'Manage rank operations',
    icon: UserCheck,
    color: 'secondary',
    gradient: 'from-secondary/20 to-success/10'
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'System oversight and management',
    icon: Shield,
    color: 'primary',
    gradient: 'from-primary/20 to-warning/10'
  },
  police: {
    title: 'Police & Traffic Portal',
    subtitle: 'Compliance and incident management', 
    icon: AlertTriangle,
    color: 'danger',
    gradient: 'from-danger/20 to-accent/10'
  }
};

export const RoleAuth = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [verificationSent, setVerificationSent] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  
  const { loading, handleEmailAuth, handlePhoneAuth } = useAuth();
  const { toast } = useToast();

  const config = roleConfig[role as keyof typeof roleConfig];

  // Check for password reset flow on page load (Supabase uses hash fragment)
  useEffect(() => {
    // Check both search params and hash fragment for recovery type
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace('#', ''));
    
    if (urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
      setIsResettingPassword(true);
    }
  }, [location.search, location.hash]);
  
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Role</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const onEmailAuth = async () => {
    const success = await handleEmailAuth(
      email, 
      authMode === 'signup' ? name : undefined, 
      authMode === 'signup' ? role : undefined
    );
    if (success) setVerificationSent(true);
  };

  const onPhoneAuth = async () => {
    const success = await handlePhoneAuth(phone);
    if (success) setVerificationSent(true);
  };

  const onGoogleAuth = async () => {
    try {
      setSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google auth error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const adminSignIn = async () => {
    setAdminError(null);
    setSigningIn(true);
    try {
      const emailLc = email.trim().toLowerCase();
      
      // Sign in with password
      const { error } = await supabase.auth.signInWithPassword({
        email: emailLc,
        password
      });
      if (error) throw error;

      // Verify admin role exists in database (server-side check)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not found');

      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      if (roleError || !adminRole) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: No active admin role found');
      }

      navigate('/');
    } catch (e: any) {
      setAdminError(e?.message || 'Admin sign-in failed');
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setAdminError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setAdminError('Password must be at least 6 characters long');
      return;
    }

    setAdminError(null);
    setSigningIn(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordResetSuccess(true);
      setIsResettingPassword(false);
      
      // Clear the URL parameters
      navigate('/auth/admin', { replace: true });
      
    } catch (error: any) {
      setAdminError(error.message || 'Failed to reset password');
    } finally {
      setSigningIn(false);
    }
  };
  if (verificationSent) {
    return (
      <VerificationSent 
        email={email || undefined}
        phone={phone || undefined}
        onBack={() => setVerificationSent(false)}
      />
    );
  }

  const IconComponent = config.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} p-4`}>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="self-start mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role Selection
        </Button>

        {/* Role-specific Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-${config.color}/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-${config.color}/30`}>
            <IconComponent className={`h-10 w-10 text-${config.color}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </div>

        {/* Platform Integration Notice */}
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 mb-6 w-full">
          <p className="text-sm text-center">
            🚀 <strong>Future Platform Integration:</strong> This portal will connect with Uber, Bolt, and other transport platforms for enhanced market reach
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full backdrop-blur-sm bg-background/95 border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Access Your {config.title}</CardTitle>
            <CardDescription>
              Secure authentication with role-based access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'admin' ? (
              passwordResetSuccess ? (
                <div className="space-y-4 text-center">
                  <div className="text-success text-lg font-semibold">
                    ✅ Password Reset Successful!
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                  <Button onClick={() => setPasswordResetSuccess(false)} className="w-full">
                    Sign In Now
                  </Button>
                </div>
              ) : isResettingPassword ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Reset Your Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your new password below
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                    />
                  </div>
                  {adminError && (
                    <p className="text-sm text-destructive">{adminError}</p>
                  )}
                  <Button 
                    onClick={handlePasswordReset} 
                    disabled={signingIn || !newPassword || !confirmPassword} 
                    className="w-full"
                  >
                    {signingIn ? 'Updating Password...' : 'Update Password'}
                  </Button>
                  <div className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setIsResettingPassword(false);
                        navigate('/auth/admin', { replace: true });
                      }}
                      className="text-xs p-0 h-auto"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@email.com"
                      onKeyDown={(e) => e.key === 'Enter' && adminSignIn()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={(e) => e.key === 'Enter' && adminSignIn()}
                    />
                  </div>
                  {adminError && (
                    <p className="text-sm text-destructive">{adminError}</p>
                  )}
                  <GoogleAuthButton disabled={signingIn} />
                  <div className="relative mb-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button onClick={adminSignIn} disabled={signingIn || !email || !password} className="w-full">
                    {signingIn ? 'Signing in…' : 'Admin Sign In'}
                  </Button>
                  <div className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={async () => {
                        if (!email) {
                          setAdminError('Please enter your email address first');
                          return;
                        }
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(email, {
                            redirectTo: `${window.location.origin}/auth/admin`
                          });
                          if (error) throw error;
                          setAdminError(null);
                          alert('Password reset email sent! Check your inbox.');
                        } catch (error: any) {
                          setAdminError(error.message || 'Failed to send reset email');
                        }
                      }}
                      className="text-xs p-0 h-auto"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Only whitelisted admin emails can sign in here
                  </div>
                </div>
              )
            ) : (
              <>
                <AuthForm
                  loading={loading}
                  email={email}
                  phone={phone}
                  name={name}
                  role={role || 'passenger'}
                  authMode={authMode}
                  setEmail={setEmail}
                  setPhone={setPhone}
                  setName={setName}
                  setRole={() => {}} // Role is fixed based on route
                  setAuthMode={setAuthMode}
                  onPhoneAuth={onPhoneAuth}
                  onEmailAuth={onEmailAuth}
                />
                <div className="mt-6 text-center text-xs text-muted-foreground">
                  Role-specific access • SASSA verification • WhatsApp-style auth
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};