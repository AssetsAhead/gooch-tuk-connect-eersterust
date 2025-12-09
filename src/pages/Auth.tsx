import React, { useState } from 'react';
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { VerificationSent } from '@/components/auth/VerificationSent';
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useSmsOtp } from '@/hooks/useSmsOtp';

export const AuthPage = () => {
  const { role } = useParams<{ role?: string }>();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { loading: smsLoading, otpSent, phone: smsPhone, sendOtp, verifyOtp, resetOtp } = useSmsOtp();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // If user is already authenticated, show sign-out option or redirect
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold text-sa-green mb-4">Already Signed In</h1>
          <p className="text-muted-foreground mb-6">You're logged in as {user.email || user.phone}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-sa-green hover:bg-sa-green-light text-white"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out (Test Login Again)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const onPhoneAuth = async () => {
    const formattedPhone = phone.startsWith('+27') ? phone : `+27${phone.replace(/^0/, '')}`;
    await sendOtp(formattedPhone);
  };

  const onEmailAuth = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We sent you a magic link to sign in",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset sent",
        description: "Check your email for a password reset link.",
      });
      
      setShowForgotPassword(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    const result = await verifyOtp(otp);
    if (result.success) {
      // Auth state will update automatically via AuthContext listener
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-sa-green mb-2">Verify Phone</h1>
            <p className="text-muted-foreground">Enter the 6-digit code sent via SMS</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onVerifyOtp()}
              placeholder="123456"
            />
            <Button 
              onClick={onVerifyOtp}
              disabled={smsLoading || otp.length < 4}
              className="w-full bg-sa-green hover:bg-sa-green-light text-white"
            >
              {smsLoading ? "Verifying..." : "Verify Code"}
            </Button>
            <Button variant="ghost" onClick={resetOtp} className="w-full">
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        {showForgotPassword ? (
          // Forgot Password Form
          <>
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
                className="p-0 h-auto mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-sa-green">Reset Password</h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && onResetPassword()}
                />
              </div>

              <Button 
                onClick={onResetPassword}
                disabled={resetLoading || !email}
                className="w-full bg-sa-green hover:bg-sa-green-light text-white"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </>
        ) : (
          // Main Auth Form
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-sa-green mb-2">
                {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Login"}
              </h1>
              <p className="text-muted-foreground">
                Enter your phone number to sign in to PoortLink
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number (Primary Method)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0XX XXX XXXX"
                  onKeyDown={(e) => e.key === 'Enter' && onPhoneAuth()}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  We'll send you a code via SMS - just like WhatsApp verification
                </div>
              </div>

              <Button 
                onClick={onPhoneAuth}
                disabled={smsLoading || !phone}
                className="w-full bg-sa-green hover:bg-sa-green-light text-white"
              >
                {smsLoading ? "Sending..." : "Send SMS Code"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or use email</span>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address (Alternative)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && onEmailAuth()}
                />
              </div>

              <Button 
                onClick={onEmailAuth}
                disabled={emailLoading || !email}
                variant="outline"
                className="w-full"
              >
                {emailLoading ? "Sending..." : "Send Email Link"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <GoogleAuthButton disabled={smsLoading || emailLoading} />

              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sa-green"
                >
                  Forgot your password?
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Phone is fastest - no email account needed</p>
              <p className="mt-2">No passwords required!</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};