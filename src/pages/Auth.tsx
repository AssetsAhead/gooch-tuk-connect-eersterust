import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Phone, User, Shield } from 'lucide-react';

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        // Sign up with email
        const { error } = await supabase.auth.signUp({
          email,
          password: 'temp-password', // We'll use magic links primarily
          options: {
            data: {
              full_name: name,
              role: role,
              phone: phone
            }
          }
        });

        if (error) throw error;

        // Send magic link
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              full_name: name,
              role: role,
              phone: phone
            }
          }
        });

        if (magicError) throw magicError;
      } else {
        // Sign in with magic link
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      }

      setVerificationSent(true);
      toast({
        title: "Check Your Email",
        description: "We've sent you a magic link to sign in",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+27') ? phone : `+27${phone.replace(/^0/, '')}`,
      });

      if (error) throw error;

      setVerificationSent(true);
      toast({
        title: "Check Your Phone",
        description: "We've sent you a verification code",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Check Your {email ? 'Email' : 'Phone'}</CardTitle>
            <CardDescription>
              We've sent a {email ? 'magic link' : 'verification code'} to {email || phone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setVerificationSent(false)}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Welcome to TukTuk Community</CardTitle>
          <CardDescription>
            Safe, affordable transport with SASSA integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger">Passenger - I need rides</SelectItem>
                    <SelectItem value="driver">Driver - I provide rides</SelectItem>
                    <SelectItem value="owner">Taxi Owner - I own vehicles</SelectItem>
                    <SelectItem value="marshall">Taxi Marshall - I manage routes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="signin" className="mt-6">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Choose your preferred sign-in method
              </div>
            </TabsContent>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleEmailAuth}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {authMode === 'signup' ? 'Sign Up' : 'Sign In'} with Email
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handlePhoneAuth}
                disabled={loading || !phone}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                {authMode === 'signup' ? 'Sign Up' : 'Sign In'} with Phone
              </Button>
            </div>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};