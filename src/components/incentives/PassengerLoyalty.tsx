import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gift, Star, Users, Ticket, Zap, ShieldCheck } from 'lucide-react';

const loyaltyTiers = [
  { name: "Commuter", minRides: 0, color: "bg-muted", benefits: "Base fare rates" },
  { name: "Regular", minRides: 20, color: "bg-blue-500", benefits: "5% discount on fares" },
  { name: "Champion", minRides: 50, color: "bg-purple-500", benefits: "10% off + priority pickup" },
  { name: "Legend", minRides: 100, color: "bg-yellow-500", benefits: "15% off + free ride monthly" },
];

const rewards = [
  { title: "Free Ride Voucher", points: 500, icon: Ticket, available: true },
  { title: "SASSA Fare Top-up", points: 200, icon: ShieldCheck, available: true },
  { title: "Airtime R10", points: 150, icon: Zap, available: true },
  { title: "Refer & Earn R20", points: 0, icon: Users, available: true },
];

export const PassengerLoyalty = () => {
  const currentPoints = 340;
  const currentRides = 37;
  const nextTier = loyaltyTiers[2]; // Champion
  const progressToNext = Math.round((currentRides / nextTier.minRides) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            Passenger Loyalty Program
          </CardTitle>
          <CardDescription>
            Every digital ride earns points. Use the app, save more, ride better.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/30 border">
            <div>
              <p className="text-sm text-muted-foreground">Your Points</p>
              <p className="text-3xl font-bold text-primary">{currentPoints}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <Badge className="bg-blue-500 text-white">Regular</Badge>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Champion</span>
              <span>{currentRides}/{nextTier.minRides} rides</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {loyaltyTiers.map((tier) => (
              <div key={tier.name} className="text-center p-2 rounded-lg border bg-card">
                <div className={`w-3 h-3 rounded-full ${tier.color} mx-auto mb-1`} />
                <p className="text-xs font-medium">{tier.name}</p>
                <p className="text-[10px] text-muted-foreground">{tier.minRides}+ rides</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Redeem Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = currentPoints >= reward.points;
              return (
                <div key={reward.title} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{reward.title}</p>
                      {reward.points > 0 && (
                        <p className="text-xs text-muted-foreground">{reward.points} pts</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={canAfford ? 'default' : 'outline'}
                    disabled={!canAfford && reward.points > 0}
                  >
                    {reward.points === 0 ? 'Share' : 'Redeem'}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-accent/50 border">
            <p className="text-xs text-muted-foreground">
              <strong>How to earn:</strong> +10 pts per digital ride • +25 pts for rating your driver • +50 pts per referral • +5 pts for SASSA-verified ride
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
