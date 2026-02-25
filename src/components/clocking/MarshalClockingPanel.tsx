import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Loader2 } from 'lucide-react';
import { ClockingType } from '@/hooks/useFacialClocking';

export const MarshalClockingPanel = ({
  isProcessing,
  selectedType,
  onClock,
}: {
  isProcessing: boolean;
  selectedType: ClockingType;
  onClock: (marshalCode: string, type: ClockingType) => Promise<any>;
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    if (code.length < 4) return;
    await onClock(code, selectedType);
    setCode('');
  };

  return (
    <div className="space-y-3">
      <div className="p-4 border rounded-lg bg-muted/30 text-center space-y-2">
        <UserCheck className="h-10 w-10 mx-auto text-primary/60" />
        <p className="text-sm text-muted-foreground">
          Ask your marshal to provide their approval code
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Marshal approval code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center tracking-wider uppercase"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={isProcessing || code.length < 4}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
