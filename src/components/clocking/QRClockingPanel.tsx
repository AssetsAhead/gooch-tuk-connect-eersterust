import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Loader2 } from 'lucide-react';
import { ClockingType } from '@/hooks/useFacialClocking';

export const QRClockingPanel = ({
  isProcessing,
  selectedType,
  onClock,
}: {
  isProcessing: boolean;
  selectedType: ClockingType;
  onClock: (qrData: string, type: ClockingType) => Promise<any>;
}) => {
  const [qrInput, setQrInput] = useState('');

  const handleSubmit = async () => {
    if (!qrInput.trim()) return;
    await onClock(qrInput.trim(), selectedType);
    setQrInput('');
  };

  return (
    <div className="space-y-3">
      <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
        <QrCode className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Scan the QR code displayed at your rank or loading zone
        </p>
        <Input
          placeholder='Paste or scan QR data (e.g. {"zone_name":"Bree Taxi Rank"})'
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          className="text-xs"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isProcessing || !qrInput.trim()} className="w-full">
        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
        Clock with QR
      </Button>
    </div>
  );
};
