import React, { useState } from 'react';
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { VerificationSent } from '@/components/auth/VerificationSent';
import { useAuth } from '@/hooks/useAuth';
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AuthPage = () => {
  const { role } = useParams<{ role?: string }>();
  const { user } = useAuthContext();
  const { loading, handleEmailAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  // If user is already authenticated, redirect to main page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onEmailAuth = async () => {
    const success = await handleEmailAuth(email);
    if (success) {
      setVerificationSent(true);
    }
  };

  if (verificationSent) {
    return <VerificationSent onBack={() => setVerificationSent(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-sa-green mb-2">
            {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Login"}
          </h1>
          <p className="text-muted-foreground">
            Enter your email to sign in to PoortLink
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
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
            disabled={loading || !email}
            className="w-full bg-sa-green hover:bg-sa-green-light text-white"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>We'll send you a secure login link via email</p>
          <p className="mt-2">No passwords required!</p>
        </div>
      </Card>
    </div>
  );
};