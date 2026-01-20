import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSmsOtp } from '@/hooks/useSmsOtp';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface SmsOtpAuthProps {
  onSuccess: (userId: string, isNewUser: boolean) => void;
}

export const SmsOtpAuth = ({ onSuccess }: SmsOtpAuthProps) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const { loading, otpSent, phone, sendOtp, verifyOtp, resetOtp } = useSmsOtp();

  const handleSendOtp = async () => {
    // Prepend +27 country code before sending
    const formattedPhone = `+27${phoneInput.replace(/\D/g, '')}`;
    console.log('Sending OTP to formatted phone:', formattedPhone);
    await sendOtp(formattedPhone);
  };

  const handleVerifyOtp = async () => {
    const result = await verifyOtp(otpCode);
    if (result.success && result.userId) {
      onSuccess(result.userId, result.isNewUser || false);
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.startsWith('+27')) {
      return phone;
    }
    if (phone.startsWith('0')) {
      return `+27 ${phone.substring(1)}`;
    }
    return `+27 ${phone}`;
  };

  if (otpSent) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Phone className="h-10 w-10 mx-auto mb-2 text-primary" />
          <h3 className="font-semibold">Enter Verification Code</h3>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {formatPhoneDisplay(phone)}
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            onComplete={handleVerifyOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerifyOtp}
          disabled={loading || otpCode.length !== 6}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="flex justify-between items-center text-sm">
          <Button
            variant="link"
            size="sm"
            onClick={() => sendOtp(phone)}
            disabled={loading}
            className="p-0 h-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Resend Code
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={resetOtp}
            className="p-0 h-auto"
          >
            Change Number
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && phoneInput.length >= 9) {
      handleSendOtp();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <Phone className="h-10 w-10 mx-auto mb-2 text-primary" />
        <h3 className="font-semibold">Sign in with Phone</h3>
        <p className="text-sm text-muted-foreground">
          We'll send you a verification code via SMS
        </p>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0">
            <span className="text-sm text-muted-foreground">+27</span>
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phoneInput}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              // Strip leading 27 or 0 since UI already shows +27 prefix
              if (value.startsWith('27') && value.length > 9) {
                value = value.substring(2);
              } else if (value.startsWith('0') && value.length > 9) {
                value = value.substring(1);
              }
              setPhoneInput(value);
            }}
            placeholder="82 637 0673"
            className="rounded-l-none"
            maxLength={15}
            autoComplete="tel-national"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your SA mobile number
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || phoneInput.length < 9}
        className="w-full touch-manipulation"
      >
        {loading ? 'Sending...' : 'Send Verification Code'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </form>
  );
};
