import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { ClockingType } from '@/hooks/useFacialClocking';

export const FacialClockingPanel = ({
  isProcessing,
  hasRegistration,
  selectedType,
  onClock,
  onGoRegister,
}: {
  isProcessing: boolean;
  hasRegistration: boolean;
  selectedType: ClockingType;
  onClock: (base64: string, type: ClockingType) => void;
  onGoRegister: () => void;
}) => {
  if (!hasRegistration) {
    return (
      <div className="text-center py-6 space-y-3">
        <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500" />
        <p className="text-sm text-muted-foreground">Register your face first for AI verification</p>
        <Button onClick={onGoRegister} size="sm">Register Face</Button>
      </div>
    );
  }

  return (
    <CameraCapture
      onCapture={(b64) => onClock(b64, selectedType)}
      isProcessing={isProcessing}
      buttonLabel={isProcessing ? 'Verifying...' : `Scan & Clock`}
    />
  );
};
