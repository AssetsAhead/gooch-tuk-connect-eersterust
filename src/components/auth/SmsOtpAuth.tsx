import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSmsOtp } from '@/hooks/useSmsOtp';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { getRememberedPhone, maskPhone, rememberPhone } from '@/lib/rememberedPhone';

interface SmsOtpAuthProps {
  onSuccess: (userId: string, isNewUser: boolean) => void;
}

/** Strip the +27 prefix / leading 0 so the input only ever holds the 9 local digits. */
const toLocalDigits = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length > 9) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length > 9) digits = digits.slice(1);
  return digits.slice(0, 9);
};

export const SmsOtpAuth = ({ onSuccess }: SmsOtpAuthProps) => {
  const { toast } = useToast();
  const remembered = getRememberedPhone();
  const [phoneInput, setPhoneInput] = useState(() =>
    remembered ? toLocalDigits(remembered) : ''
  );
  const [otpCode, setOtpCode] = useState('');
  const { loading, otpSent, phone, sendOtp, verifyOtp, resetOtp } = useSmsOtp();
  const submittedCode = useRef<string | null>(null);

  const handleSendOtp = async (raw?: string) => {
    const digitsOnly = toLocalDigits(raw ?? phoneInput);
    const formattedPhone = `+27${digitsOnly}`;
    await sendOtp(formattedPhone);
  };

  const handleVerifyOtp = async (code?: string) => {
    const value = code ?? otpCode;
    if (value.length !== 6 || submittedCode.current === value) return;
    submittedCode.current = value;
    const result = await verifyOtp(value);
    if (result.success && result.userId) {
      rememberPhone(phone);
      onSuccess(result.userId, result.isNewUser || false);
    } else {
      submittedCode.current = null;
    }
  };

  // Auto-submit as soon as six digits are present — no "now press Verify" step.
  useEffect(() => {
    if (otpSent && otpCode.length === 6 && !loading) {
      handleVerifyOtp(otpCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode, otpSent]);

  // WebOTP: on supporting browsers (Android/Chrome) the SMS code is read
  // automatically the moment it arrives, so the user types nothing at all.
  useEffect(() => {
    if (!otpSent) return;
    const anyNavigator = navigator as any;
    if (!('OTPCredential' in window) || !anyNavigator.credentials?.get) return;

    const controller = new AbortController();
    anyNavigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: controller.signal })
      .then((credential: any) => {
        if (credential?.code) setOtpCode(String(credential.code).slice(0, 6));
      })
      .catch(() => {
        /* user dismissed, unsupported, or aborted — normal manual entry continues */
      });

    return () => controller.abort();
  }, [otpSent]);

  const formatPhoneDisplay = (value: string) => {
    if (value.startsWith('+27')) return value;
    if (value.startsWith('0')) return `+27 ${value.substring(1)}`;
    return `+27 ${value}`;
  };

  if (otpSent) {
    return (
      <div className="space-y-5">
        <div className="text-center mb-2">
          <Phone className="h-10 w-10 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Enter the code</h3>
          <p className="text-sm text-muted-foreground">
            Sent to {formatPhoneDisplay(phone)}. It fills in by itself on most phones.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            containerClassName="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-14 w-11 text-xl" />
              <InputOTPSlot index={1} className="h-14 w-11 text-xl" />
              <InputOTPSlot index={2} className="h-14 w-11 text-xl" />
              <InputOTPSlot index={3} className="h-14 w-11 text-xl" />
              <InputOTPSlot index={4} className="h-14 w-11 text-xl" />
              <InputOTPSlot index={5} className="h-14 w-11 text-xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">Signing you in…</p>
        )}

        <div className="flex justify-between items-center text-sm">
          <Button
            variant="link"
            size="sm"
            onClick={() => sendOtp(phone)}
            disabled={loading}
            className="p-0 h-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Send again
          </Button>
          <Button variant="link" size="sm" onClick={resetOtp} className="p-0 h-auto">
            Change number
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (toLocalDigits(phoneInput).length < 9) {
      toast({
        title: 'Check the number',
        description: 'Enter your 9-digit SA mobile number, e.g. 82 637 0673',
        variant: 'destructive',
      });
      return;
    }

    handleSendOtp();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <Phone className="h-10 w-10 mx-auto mb-2 text-primary" />
        <h3 className="text-lg font-semibold">Sign in with your cellphone</h3>
        <p className="text-sm text-muted-foreground">
          One tap. You stay signed in — no passwords, ever.
        </p>
      </div>

      {remembered && (
        <Button
          type="button"
          onClick={() => handleSendOtp(remembered)}
          disabled={loading}
          className="w-full h-14 text-base"
        >
          Send code to {maskPhone(remembered)}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      <div>
        <Label htmlFor="phone" className="text-base">
          {remembered ? 'Or use a different number' : 'Cellphone number'}
        </Label>
        <div className="flex gap-0 mt-1">
          <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 text-base">
            +27
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phoneInput}
            onChange={(e) => setPhoneInput(toLocalDigits(e.target.value))}
            placeholder="82 637 0673"
            className="rounded-l-none h-14 text-lg"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || toLocalDigits(phoneInput).length < 9}
        className="w-full h-14 text-base touch-manipulation"
      >
        {loading ? 'Sending…' : 'Send my code'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </form>
  );
};
