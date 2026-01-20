import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Target, Gift, Zap, Award, AlertTriangle } from 'lucide-react';
import { EnhancedDriverIncentives } from './EnhancedDriverIncentives';
import { SANTACOComplianceTracker } from './SANTACOComplianceTracker';

export const DriverIncentives = () => {
  const incentives = [
    {
      title: "SASSA Champion",
      description: "Help 50 SASSA beneficiaries this month",
      progress: 32,
      total: 50,
      reward: "R500 bonus + Champion badge",
      icon: Trophy,
      color: "text-yellow-600"
    },
    {
      title: "Community Hero",
      description: "Maintain 4.8+ rating with 100+ rides",
      progress: 87,
      total: 100,
      reward: "R300 bonus + Priority bookings",
      icon: Star,
      color: "text-blue-600"
    },
    {
      title: "Peak Hour Pro",
      description: "Complete 20 rides during peak hours",
      progress: 14,
      total: 20,
      reward: "20% bonus on peak rides next week",
      icon: Zap,
      color: "text-purple-600"
    }
  ];

  const achievements = [
    { title: "SASSA Specialist", earned: true, icon: Award },
    { title: "5-Star Driver", earned: true, icon: Star },
    { title: "Early Bird", earned: false, icon: Target },
    { title: "Weekend Warrior", earned: true, icon: Gift }
  ];

  return (
    <div className="space-y-6">
      {/* SANTACO Context Alert */}
      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">SANTACO Compliance Focus</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Following recent industry discussions, MojaRide emphasizes transparent, 
                data-driven operations that support both driver earnings and community harmony.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="enhanced" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced">Enhanced Targets</TabsTrigger>
          <TabsTrigger value="compliance">SANTACO Compliance</TabsTrigger>
          <TabsTrigger value="legacy">Legacy System</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced">
          <EnhancedDriverIncentives />
        </TabsContent>

        <TabsContent value="compliance">
          <SANTACOComplianceTracker />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-sa-gold" />
                Basic Driver Incentives
              </CardTitle>
              <CardDescription>
                Traditional incentive structure - being enhanced with multi-dimensional targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incentives.map((incentive, index) => {
                const Icon = incentive.icon;
                return (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${incentive.color}`} />
                        <div>
                          <h3 className="font-medium">{incentive.title}</h3>
                          <p className="text-sm text-muted-foreground">{incentive.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{incentive.progress}/{incentive.total}</Badge>
                    </div>
                    <Progress value={(incentive.progress / incentive.total) * 100} className="h-2" />
                    <p className="text-sm text-success font-medium">{incentive.reward}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your earned badges and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        achievement.earned
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-muted/50 border-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{achievement.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};