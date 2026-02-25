import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, KeyRound, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CameraCapture } from './CameraCapture';
import { FaceRegistration } from '@/hooks/useFacialClocking';
import { format } from 'date-fns';

export const RegistrationPanel = ({
  registration,
  isProcessing,
  onRegisterFace,
  onSetPin,
}: {
  registration: FaceRegistration | null;
  isProcessing: boolean;
  onRegisterFace: (base64: string) => Promise<boolean>;
  onSetPin: (pin: string) => Promise<boolean>;
}) => {
  const [pin, setPin] = useState('');
  const [showFaceReg, setShowFaceReg] = useState(false);

  const handleSetPin = async () => {
    if (pin.length !== 4) return;
    const ok = await onSetPin(pin);
    if (ok) setPin('');
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      {registration && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-medium">Registered</p>
            <p className="text-xs text-muted-foreground">
              Since {format(new Date(registration.registered_at), 'dd MMM yyyy')}
              {registration.clocking_pin && ' • PIN set ✓'}
            </p>
          </div>
        </div>
      )}

      {/* PIN Setup */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Clocking PIN</p>
          {registration?.clocking_pin && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          Set a 4-digit PIN for quick, non-biometric clocking. Recommended for all drivers.
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            maxLength={4}
            placeholder="Set 4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center tracking-widest"
          />
          <Button onClick={handleSetPin} disabled={isProcessing || pin.length !== 4} size="sm">
            {registration?.clocking_pin ? 'Update' : 'Set PIN'}
          </Button>
        </div>
      </div>

      {/* Face Registration (optional) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Face Registration</p>
          <Badge variant="outline" className="text-[10px]">Optional • +5 rep per clock</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Register your face for AI-verified clocking. This is completely optional — it earns you bonus reputation points for higher trust.
        </p>
        {!showFaceReg ? (
          <Button variant="outline" size="sm" onClick={() => setShowFaceReg(true)}>
            {registration?.photo_path && registration.photo_path !== 'pin-only'
              ? 'Update Face Photo'
              : 'Register Face (Optional)'}
          </Button>
        ) : (
          <CameraCapture
            onCapture={onRegisterFace}
            isProcessing={isProcessing}
            buttonLabel={isProcessing ? 'Registering...' : 'Capture Face'}
          />
        )}
      </div>
    </div>
  );
};
