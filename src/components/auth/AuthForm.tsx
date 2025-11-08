import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

interface AuthFormProps {
  loading: boolean;
  email: string;
  phone: string;
  name: string;
  role: string;
  authMode: 'signin' | 'signup';
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setName: (name: string) => void;
  setRole: (role: string) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  onPhoneAuth: () => void;
  onEmailAuth: () => void;
}

export const AuthForm = ({
  loading,
  email,
  phone,
  name,
  role,
  authMode,
  setEmail,
  setPhone,
  setName,
  setRole,
  setAuthMode,
  onPhoneAuth,
  onEmailAuth,
}: AuthFormProps) => {
  return (
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
              </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="signin" className="mt-6">
        <div className="text-center text-sm text-muted-foreground mb-4">
          Enter your phone number to continue
        </div>
      </TabsContent>

      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
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
          <div className="text-xs text-muted-foreground">
            We'll send you a code via SMS - just like WhatsApp verification
          </div>
        </div>

        <Button
          onClick={onPhoneAuth}
          disabled={loading || !phone}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Phone className="h-4 w-4 mr-2" />
          )}
          {authMode === 'signup' ? 'Get Started' : 'Continue'} with Phone
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or use email</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address (Alternative)</Label>
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
          onClick={onEmailAuth}
          disabled={loading || !email}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Continue with Email
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <GoogleAuthButton disabled={loading} />
      </div>
    </Tabs>
  );
};