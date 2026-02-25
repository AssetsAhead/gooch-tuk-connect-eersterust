import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, KeyRound, QrCode, UserCheck } from 'lucide-react';
import { VerificationMethod } from '@/hooks/useFacialClocking';

const methods: { value: VerificationMethod; label: string; icon: any; desc: string; bonus?: string }[] = [
  { value: 'pin', label: 'PIN Code', icon: KeyRound, desc: 'Enter your 4-digit PIN' },
  { value: 'facial', label: 'Face Scan', icon: Camera, desc: 'AI-verified selfie', bonus: '+5 rep' },
  { value: 'qr', label: 'QR Scan', icon: QrCode, desc: 'Scan rank/zone QR code' },
  { value: 'marshal', label: 'Marshal', icon: UserCheck, desc: 'Marshal verifies you' },
];

export const ClockingMethodSelector = ({
  selected,
  onSelect,
}: {
  selected: VerificationMethod;
  onSelect: (m: VerificationMethod) => void;
}) => (
  <div>
    <p className="text-sm font-medium mb-2 text-muted-foreground">Choose clocking method:</p>
    <div className="grid grid-cols-2 gap-2">
      {methods.map((m) => (
        <Button
          key={m.value}
          variant={selected === m.value ? 'default' : 'outline'}
          className="flex flex-col items-center gap-1 h-auto py-3 relative"
          onClick={() => onSelect(m.value)}
        >
          <m.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{m.label}</span>
          <span className="text-[10px] text-muted-foreground">{m.desc}</span>
          {m.bonus && (
            <Badge variant="secondary" className="absolute -top-2 -right-2 text-[9px] px-1 py-0">
              {m.bonus}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  </div>
);
