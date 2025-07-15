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
  const [role, setRole] = useState('admin'); // Default to admin to help with initial setup
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
        {/* Multi-stakeholder Header */}
        <div className="text-center mb-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            TukTuk Community Network
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Connecting South Africa's transport ecosystem - passengers, drivers, taxi owners, marshalls, police, and administrators
          </p>
          
          {/* Stakeholder Icons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Passengers</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm">Drivers</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Owners</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm">Marshalls</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Police</span>
            </div>
          </div>
          
          {/* Future Platform Integration Notice */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              🚀 <strong>Platform Integration Ready:</strong> Built for seamless integration with Uber, Bolt, and other transport platforms
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md backdrop-blur-sm bg-background/95 border shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Join the Network</CardTitle>
            <CardDescription>
              SASSA-verified transport • WhatsApp-style verification • Multi-platform ready
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
    </div>
  );
};