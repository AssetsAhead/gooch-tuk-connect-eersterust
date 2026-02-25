import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Route, CheckCircle } from 'lucide-react';
import { ClockingType } from '@/hooks/useFacialClocking';

const options = [
  { value: 'shift_start' as const, label: 'Shift Start', icon: Play, color: 'text-green-500' },
  { value: 'shift_end' as const, label: 'Shift End', icon: Square, color: 'text-red-500' },
  { value: 'trip_start' as const, label: 'Trip Start', icon: Route, color: 'text-blue-500' },
  { value: 'trip_end' as const, label: 'Trip End', icon: CheckCircle, color: 'text-orange-500' },
];

export const ClockingTypeSelector = ({
  selected,
  onSelect,
  disabled,
}: {
  selected: ClockingType;
  onSelect: (t: ClockingType) => void;
  disabled: boolean;
}) => (
  <div className="grid grid-cols-2 gap-2">
    {options.map((opt) => (
      <Button
        key={opt.value}
        variant={selected === opt.value ? 'default' : 'outline'}
        className="flex items-center gap-2 h-auto py-2 text-xs"
        onClick={() => onSelect(opt.value)}
        disabled={disabled}
      >
        <opt.icon className={`h-3.5 w-3.5 ${selected === opt.value ? '' : opt.color}`} />
        {opt.label}
      </Button>
    ))}
  </div>
);
