import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, TrendingUp, Fuel, Zap } from 'lucide-react';

const bonusTiers = [
  {
    name: "Digital Starter",
    threshold: 10,
    bonus: "R2/trip",
    monthlyPotential: "R60/mo",
    icon: Smartphone,
    unlocked: true,
  },
  {
    name: "Cash-Free Champion",
    threshold: 25,
    bonus: "R3/trip",
    monthlyPotential: "R225/mo",
    icon: TrendingUp,
    unlocked: true,
  },
  {
    name: "Platform Pro",
    threshold: 40,
    bonus: "R5/trip",
    monthlyPotential: "R600/mo",
    icon: Zap,
    unlocked: false,
  },
  {
    name: "Elite Driver",
    threshold: 50,
    bonus: "R5/trip + fuel voucher",
    monthlyPotential: "R850/mo",
    icon: Fuel,
    unlocked: false,
  },
];

export const DigitalTripBonus = () => {
  const currentDigitalTrips = 28;
  const totalTrips = 35;
  const digitalRate = Math.round((currentDigitalTrips / totalTrips) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          Digital Trip Bonus
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Every trip logged digitally earns you a cash bonus. More digital = more money.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Your Digital Rate</span>
            <span className="text-2xl font-bold text-primary">{digitalRate}%</span>
          </div>
          <Progress value={digitalRate} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {currentDigitalTrips} of {totalTrips} trips logged digitally this week
          </p>
        </div>

        <div className="space-y-3">
          {bonusTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  tier.unlocked
                    ? 'bg-accent/50 border-primary/30'
                    : 'bg-muted/30 border-muted opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${tier.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="font-medium text-sm">{tier.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {tier.threshold}+ digital trips/week
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={tier.unlocked ? 'default' : 'secondary'}>
                    {tier.bonus}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{tier.monthlyPotential}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs font-medium text-destructive">
            💡 Anti-Skim Logic: Cash trips without digital logs = no bonus, lower rank priority, and owner visibility into gaps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
