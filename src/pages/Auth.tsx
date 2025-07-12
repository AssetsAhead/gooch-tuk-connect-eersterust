import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { VerificationSent } from '@/components/auth/VerificationSent';
import { useAuth } from '@/hooks/useAuth';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { loading, handleEmailAuth, handlePhoneAuth } = useAuth();

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

  if (verificationSent) {
    return (
      <VerificationSent 
        email={email || undefined}
        phone={phone || undefined}
        onBack={() => setVerificationSent(false)}
      />
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
            Safe, affordable transport with SASSA integration. Verify with your phone number - just like WhatsApp!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            loading={loading}
            email={email}
            phone={phone}
            name={name}
            role={role}
            authMode={authMode}
            setEmail={setEmail}
            setPhone={setPhone}
            setName={setName}
            setRole={setRole}
            setAuthMode={setAuthMode}
            onPhoneAuth={onPhoneAuth}
            onEmailAuth={onEmailAuth}
          />

          <div className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};