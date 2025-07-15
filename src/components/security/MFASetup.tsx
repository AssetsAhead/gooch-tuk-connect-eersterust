
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone } from 'lucide-react';

export const MFASetup = () => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupMFA = async () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number for MFA setup",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Format South African phone number
      const formattedPhone = phone.startsWith('+27') ? phone : `+27${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.mfa.enroll({ 
        factorType: 'phone',
        phone: formattedPhone 
      });
      
      if (error) throw error;
      
      setStep('verify');
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "MFA Setup Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({ 
        factorId: 'phone',
        code: verificationCode 
      });
      
      if (error) throw error;
      
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Enhanced Security</CardTitle>
        <CardDescription>
          Set up two-factor authentication for additional account protection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="mfa-phone">Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mfa-phone"
                  type="tel"
                  placeholder="0XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send you a verification code for enhanced security
              </p>
            </div>
            <Button onClick={setupMFA} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Enable MFA'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <Button onClick={verifyMFA} disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <Button variant="outline" onClick={() => setStep('setup')} className="w-full">
              Back to Setup
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
