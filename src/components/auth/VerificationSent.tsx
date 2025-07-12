import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface VerificationSentProps {
  email?: string;
  phone?: string;
  onBack: () => void;
}

export const VerificationSent = ({ email, phone, onBack }: VerificationSentProps) => {
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
            onClick={onBack}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};