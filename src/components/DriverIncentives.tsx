import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { DigitalTripBonus } from './incentives/DigitalTripBonus';
import { DriverLeaderboard } from './incentives/DriverLeaderboard';
import { AntiSkimDashboard } from './incentives/AntiSkimDashboard';
import { SANTACOComplianceTracker } from './SANTACOComplianceTracker';

export const DriverIncentives = () => {
  return (
    <div className="space-y-6">
      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">Anti-Skimming Incentive System</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Digital transparency pays more than skimming. Every logged trip earns bonuses, 
                builds your reputation, and unlocks premium rewards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bonuses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bonuses">Digital Bonuses</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="bonuses">
          <DigitalTripBonus />
        </TabsContent>

        <TabsContent value="transparency">
          <AntiSkimDashboard />
        </TabsContent>

        <TabsContent value="leaderboard">
          <DriverLeaderboard />
        </TabsContent>

        <TabsContent value="compliance">
          <SANTACOComplianceTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};
