import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wifi, Smartphone, Signal, AlertCircle } from 'lucide-react';

interface ConnectivityPlan {
  id: string;
  label: string;
  monthlyCost: number;
  description: string;
  smsFallbackCost: number;
}

const PLANS: ConnectivityPlan[] = [
  {
    id: 'whatsapp_only',
    label: 'Vodacom WhatsApp R5',
    monthlyCost: 5,
    description: '100MB WhatsApp – cheapest, covers messaging & location',
    smsFallbackCost: 0,
  },
  {
    id: 'social_cellc',
    label: 'Cell C Social R7',
    monthlyCost: 7,
    description: '150MB WhatsApp + Facebook',
    smsFallbackCost: 0,
  },
  {
    id: 'social_mtn',
    label: 'MTN Social R10',
    monthlyCost: 10,
    description: '200MB WhatsApp + YouTube',
    smsFallbackCost: 0,
  },
  {
    id: 'full_data',
    label: 'Telkom 1GB R29',
    monthlyCost: 29,
    description: '1GB full data – covers maps & everything',
    smsFallbackCost: 0,
  },
  {
    id: 'sms_only',
    label: 'SMS Fallback Only',
    monthlyCost: 0,
    description: 'No data bundle – relies on SMS at ~R0.30/message',
    smsFallbackCost: 156,
  },
];

export const ConnectivityCostCalculator: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('whatsapp_only');
  const [fleetSize, setFleetSize] = useState(10);

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[0];
  const perDriverMonthly = plan.monthlyCost + plan.smsFallbackCost;
  const totalFleetMonthly = perDriverMonthly * fleetSize;
  const totalFleetAnnual = totalFleetMonthly * 12;

  // Comparison: what SMS fallback would cost without a data bundle
  const smsFallbackTotal = 156 * fleetSize;
  const savings = smsFallbackTotal - totalFleetMonthly;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Signal className="h-5 w-5" />
          Driver Connectivity Budget
        </CardTitle>
        <CardDescription>
          Owner-subsidised SIM/data costs per driver • Include in fleet kitting budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Plan Selector */}
        <div className="space-y-2">
          <Label>Data Plan per Driver</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANS.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label} — R{p.monthlyCost + p.smsFallbackCost}/mo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{plan.description}</p>
        </div>

        {/* Fleet Size */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Fleet Size
            </Label>
            <span className="font-mono text-sm">{fleetSize} drivers</span>
          </div>
          <Slider
            value={[fleetSize]}
            onValueChange={([v]) => setFleetSize(v)}
            min={1}
            max={50}
            step={1}
          />
        </div>

        <Separator />

        {/* Cost Breakdown */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Data bundle per driver</span>
            <span className="font-mono">R{plan.monthlyCost}/mo</span>
          </div>
          {plan.smsFallbackCost > 0 && (
            <div className="flex justify-between items-center text-destructive">
              <span className="text-sm">SMS fallback cost</span>
              <span className="font-mono">R{plan.smsFallbackCost}/mo</span>
            </div>
          )}
          <div className="flex justify-between items-center font-medium">
            <span className="text-sm">Per driver total</span>
            <span className="font-mono">R{perDriverMonthly}/mo</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm">Fleet monthly ({fleetSize} drivers)</span>
            <span className="font-mono font-semibold">R{totalFleetMonthly.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Fleet annual</span>
            <span className="font-mono font-semibold">R{totalFleetAnnual.toLocaleString()}/yr</span>
          </div>
        </div>

        {/* Savings vs SMS-only */}
        {plan.id !== 'sms_only' && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-2">
              <Wifi className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">
                  Saves R{savings.toLocaleString()}/mo vs SMS-only fallback
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  A R{plan.monthlyCost} data bundle per driver is {Math.round(savings / smsFallbackTotal * 100)}% cheaper
                  than relying on SMS at R0.30/message (~20 messages/day).
                </p>
              </div>
            </div>
          </div>
        )}

        {plan.id === 'sms_only' && (
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">
                  SMS-only costs R{smsFallbackTotal.toLocaleString()}/mo for {fleetSize} drivers
                </p>
                <p className="text-amber-700 text-xs mt-0.5">
                  A R5/mo WhatsApp bundle would reduce this to R{(5 * fleetSize).toLocaleString()}/mo – 
                  saving R{(smsFallbackTotal - 5 * fleetSize).toLocaleString()}/mo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Recommendation:</strong> Include R5–R10/driver/month in your fleet operating budget.
            Deduct from driver earnings or provide as a benefit. This covers WhatsApp-based ride alerts,
            location sharing, and passenger messaging — eliminating the need for expensive SMS fallback.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
