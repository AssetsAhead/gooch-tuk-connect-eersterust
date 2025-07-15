
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone } from 'lucide-react';

export const MFASetup = () => {
  const [phone, setPhone] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
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
      // For now, just simulate MFA setup
      // In production, integrate with actual MFA service
      setTimeout(() => {
        setIsEnabled(true);
        toast({
          title: "MFA Enabled",
          description: "Two-factor authentication has been enabled for your account",
        });
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      toast({
        title: "MFA Setup Error",
        description: "Failed to enable MFA. Please try again.",
        variant: "destructive",
      });
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
        {!isEnabled ? (
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
                Enhanced security for your account
              </p>
            </div>
            <Button onClick={setupMFA} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Enable MFA'}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              MFA is enabled for {phone}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
