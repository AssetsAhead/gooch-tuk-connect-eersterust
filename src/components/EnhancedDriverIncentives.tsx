import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Star, Target, Gift, Zap, Award, 
  Shield, Users, DollarSign, AlertTriangle,
  TrendingUp, Clock, MapPin, CheckCircle
} from 'lucide-react';

export const EnhancedDriverIncentives = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  // Multi-dimensional targets based on KPIs
  const dailyTargets = {
    financial: {
      title: "Financial Performance",
      targets: [
        {
          name: "Daily Revenue",
          current: 380,
          target: 500,
          unit: "R",
          icon: DollarSign,
          color: "text-sa-green"
        },
        {
          name: "Digital Payments",
          current: 12,
          target: 15,
          unit: "rides",
          icon: Target,
          color: "text-sa-blue"
        },
        {
          name: "SASSA Beneficiaries",
          current: 8,
          target: 10,
          unit: "rides",
          icon: Users,
          color: "text-sa-gold"
        }
      ]
    },
    safety: {
      title: "Safety & Compliance",
      targets: [
        {
          name: "Route Compliance",
          current: 95,
          target: 100,
          unit: "%",
          icon: CheckCircle,
          color: "text-success"
        },
        {
          name: "Safety Reports",
          current: 2,
          target: 3,
          unit: "reports",
          icon: Shield,
          color: "text-info"
        },
        {
          name: "On-Time Performance",
          current: 87,
          target: 90,
          unit: "%",
          icon: Clock,
          color: "text-warning"
        }
      ]
    },
    community: {
      title: "Community Engagement",
      targets: [
        {
          name: "Customer Rating",
          current: 4.7,
          target: 4.8,
          unit: "★",
          icon: Star,
          color: "text-sa-red"
        },
        {
          name: "Crime Reports",
          current: 1,
          target: 2,
          unit: "reports",
          icon: AlertTriangle,
          color: "text-danger"
        },
        {
          name: "Community Patrols",
          current: 3,
          target: 5,
          unit: "hours",
          icon: MapPin,
          color: "text-tuk-blue"
        }
      ]
    }
  };

  const achievements = [
    { 
      title: "SASSA Champion", 
      description: "50+ SASSA rides this month",
      earned: true, 
      icon: Trophy,
      tier: "gold",
      reward: "R500 bonus + Priority bookings"
    },
    { 
      title: "Community Hero", 
      description: "4.8+ rating with 100+ rides",
      earned: true, 
      icon: Star,
      tier: "silver", 
      reward: "R300 bonus + Badge"
    },
    { 
      title: "Safety Guardian", 
      description: "Perfect compliance score",
      earned: false, 
      icon: Shield,
      tier: "bronze",
      reward: "R200 bonus + Recognition"
    },
    { 
      title: "Digital Pioneer", 
      description: "90% digital payments",
      earned: true, 
      icon: Zap,
      tier: "platinum",
      reward: "Lower platform fees"
    }
  ];

  const weeklyLeaderboard = [
    { name: "Sipho M.", score: 985, position: 1, trend: "up" },
    { name: "Nomsa K.", score: 947, position: 2, trend: "stable" },
    { name: "Thabo L.", score: 923, position: 3, trend: "up" },
    { name: "You", score: 892, position: 4, trend: "down" },
    { name: "Zanele P.", score: 876, position: 5, trend: "up" }
  ];

  const getBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'default';
      case 'gold': return 'secondary';
      case 'silver': return 'outline';
      case 'bronze': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderTargetCard = (target: any) => {
    const Icon = target.icon;
    const progress = (target.current / target.target) * 100;
    const isComplete = progress >= 100;

    return (
      <div key={target.name} className="p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${target.color}`} />
            <span className="font-medium text-sm">{target.name}</span>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {target.current}{target.unit} / {target.target}{target.unit}
          </Badge>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
        {isComplete && (
          <div className="flex items-center gap-1 text-xs text-success">
            <CheckCircle className="h-3 w-3" />
            Target achieved!
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-sa-gold" />
                Multi-Dimensional Target System
              </CardTitle>
              <CardDescription>
                Data-driven targets addressing SANTACO concerns and community needs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('daily')}
              >
                Daily
              </Button>
              <Button 
                variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="targets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="targets">Daily Targets</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-4">
          <div className="grid gap-6">
            {Object.entries(dailyTargets).map(([category, data]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{data.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.targets.map(renderTargetCard)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className={`transition-all ${
                  achievement.earned 
                    ? 'bg-gradient-to-br from-sa-green/10 to-sa-gold/10 border-sa-green/30' 
                    : 'bg-muted/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned 
                            ? 'bg-sa-green text-sa-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      <Badge variant={getBadgeVariant(achievement.tier)}>
                        {achievement.tier}
                      </Badge>
                    </div>
                    <div className="text-xs text-sa-green font-medium">
                      {achievement.reward}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Community Leaderboard</CardTitle>
              <CardDescription>
                Based on combined performance across all target dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyLeaderboard.map((driver, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                    driver.name === 'You' ? 'bg-sa-blue/10 border-sa-blue/30' : 'bg-card'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        driver.position === 1 ? 'bg-sa-gold text-sa-white' :
                        driver.position === 2 ? 'bg-muted text-muted-foreground' :
                        driver.position === 3 ? 'bg-tuk-orange text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {driver.position}
                      </div>
                      <div>
                        <span className="font-medium">{driver.name}</span>
                        {driver.name === 'You' && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{driver.score}</span>
                      <TrendingUp className={`h-4 w-4 ${
                        driver.trend === 'up' ? 'text-success' : 
                        driver.trend === 'down' ? 'text-danger' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Weekly Target Bonus</span>
                    <p className="text-sm text-muted-foreground">Meet all targets for 5 days</p>
                  </div>
                  <Badge variant="default">R200</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Data & Airtime</span>
                    <p className="text-sm text-muted-foreground">Safety compliance bonus</p>
                  </div>
                  <Badge variant="secondary">R50</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Platform Fee Reduction</span>
                    <p className="text-sm text-muted-foreground">Digital payment milestone</p>
                  </div>
                  <Badge variant="outline">-2%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-gradient-to-br from-sa-green/20 to-sa-gold/20 rounded-lg">
                  <div className="text-2xl font-bold text-sa-green">847</div>
                  <div className="text-sm text-muted-foreground">SASSA beneficiaries helped this month</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-sa-blue/20 to-tuk-blue/20 rounded-lg">
                  <div className="text-2xl font-bold text-sa-blue">23</div>
                  <div className="text-sm text-muted-foreground">Crime incidents reported</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-sa-red/20 to-danger/20 rounded-lg">
                  <div className="text-2xl font-bold text-sa-red">156</div>
                  <div className="text-sm text-muted-foreground">Community patrol hours</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};