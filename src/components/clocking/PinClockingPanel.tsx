import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { ClockingType } from '@/hooks/useFacialClocking';

export const PinClockingPanel = ({
  isProcessing,
  hasPin,
  selectedType,
  onClock,
  onGoSetup,
}: {
  isProcessing: boolean;
  hasPin: boolean;
  selectedType: ClockingType;
  onClock: (pin: string, type: ClockingType) => Promise<any>;
  onGoSetup: () => void;
}) => {
  const [pin, setPin] = useState('');

  if (!hasPin) {
    return (
      <div className="text-center py-6 space-y-3">
        <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500" />
        <p className="text-sm text-muted-foreground">Set up your 4-digit clocking PIN first</p>
        <Button onClick={onGoSetup} size="sm">Set PIN</Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    await onClock(pin, selectedType);
    setPin('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="password"
          maxLength={4}
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className="text-center text-lg tracking-widest"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={isProcessing || pin.length !== 4}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Enter your 4-digit PIN to clock {selectedType.replace('_', ' ')}
      </p>
    </div>
  );
};
