import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const leaderboardData = [
  { name: "Sipho M.", score: 985, digitalRate: 98, position: 1, trend: "up", bonus: "R850" },
  { name: "Nomsa K.", score: 947, digitalRate: 95, position: 2, trend: "stable", bonus: "R720" },
  { name: "Thabo L.", score: 923, digitalRate: 92, position: 3, trend: "up", bonus: "R680" },
  { name: "You", score: 892, digitalRate: 80, position: 4, trend: "up", bonus: "R540" },
  { name: "Zanele P.", score: 876, digitalRate: 78, position: 5, trend: "down", bonus: "R490" },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export const DriverLeaderboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Weekly Leaderboard
        </CardTitle>
        <CardDescription>
          Top drivers earn bonus payouts + priority rank position. Score = digital trips × rating × compliance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboardData.map((driver) => (
            <div
              key={driver.position}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                driver.name === 'You'
                  ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    driver.position === 1
                      ? 'bg-yellow-500 text-white'
                      : driver.position === 2
                      ? 'bg-gray-400 text-white'
                      : driver.position === 3
                      ? 'bg-orange-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {driver.position}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{driver.name}</span>
                    {driver.name === 'You' && <Badge variant="outline" className="text-xs">You</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{driver.digitalRate}% digital</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{driver.bonus}</Badge>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm">{driver.score}</span>
                  <TrendIcon trend={driver.trend} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Top 3 drivers get R200 extra + priority queue positioning next week
        </p>
      </CardContent>
    </Card>
  );
};
