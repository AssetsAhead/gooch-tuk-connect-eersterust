import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { phoneAuthSchema, emailAuthSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

interface PublicAuthFormProps {
  onPhoneAuth: (phone: string) => Promise<void>;
  onEmailAuth: (email: string) => Promise<void>;
  loading: boolean;
}

export const PublicAuthForm: React.FC<PublicAuthFormProps> = ({
  onPhoneAuth,
  onEmailAuth,
  loading
}) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const { toast } = useToast();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = phoneAuthSchema.parse({ phone });
      await onPhoneAuth(validatedData.phone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Invalid Phone Number", 
          description: error.errors[0].message,
          variant: "destructive" 
        });
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = emailAuthSchema.parse({ email });
      await onEmailAuth(validatedData.email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Invalid Email", 
          description: error.errors[0].message,
          variant: "destructive" 
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Quick Access</CardTitle>
        <CardDescription>
          Sign in with your phone number (recommended) or email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={authMethod === 'phone' ? 'default' : 'outline'}
            onClick={() => setAuthMethod('phone')}
            className="flex-1"
            size="sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            Phone
          </Button>
          <Button
            variant={authMethod === 'email' ? 'default' : 'outline'}
            onClick={() => setAuthMethod('email')}
            className="flex-1"
            size="sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>

        {authMethod === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-3">
            <Input
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Continue with Phone
            </Button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Continue with Email
            </Button>
          </form>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>• Everyone gets passenger access automatically</p>
          <p>• Additional roles require admin approval</p>
          <p>• Community Safety & Business portals are always accessible</p>
        </div>
      </CardContent>
    </Card>
  );
};