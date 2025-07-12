import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin, 
  Star,
  UserCheck,
  Receipt,
  Calendar,
  BarChart3
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const metrics = [
    {
      title: "Total SASSA Rides",
      value: "2,847",
      change: "+18%",
      trend: "up",
      icon: Users,
      description: "This month"
    },
    {
      title: "Cost Savings Generated",
      value: "R284,700",
      change: "+24%",
      trend: "up",
      icon: DollarSign,
      description: "For beneficiaries"
    },
    {
      title: "Average Rating",
      value: "4.7",
      change: "+0.3",
      trend: "up",
      icon: Star,
      description: "Driver satisfaction"
    },
    {
      title: "Verified Users",
      value: "1,234",
      change: "+156",
      trend: "up",
      icon: UserCheck,
      description: "SASSA verified"
    }
  ];

  const topRoutes = [
    { from: "Khayelitsha", to: "Cape Town CBD", rides: 234, savings: "R23,400" },
    { from: "Soweto", to: "Johannesburg CBD", rides: 189, savings: "R18,900" },
    { from: "Mitchells Plain", to: "Claremont", rides: 156, savings: "R15,600" },
    { from: "Gugulethu", to: "Wynberg", rides: 143, savings: "R14,300" }
  ];

  const weeklyStats = [
    { day: "Mon", rides: 45, revenue: "R4,500" },
    { day: "Tue", rides: 52, revenue: "R5,200" },
    { day: "Wed", rides: 38, revenue: "R3,800" },
    { day: "Thu", rides: 61, revenue: "R6,100" },
    { day: "Fri", rides: 73, revenue: "R7,300" },
    { day: "Sat", rides: 89, revenue: "R8,900" },
    { day: "Sun", rides: 67, revenue: "R6,700" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">{metric.change}</span>
                  <span className="ml-1">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top SASSA Routes
            </CardTitle>
            <CardDescription>Most popular routes for beneficiaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{route.from} → {route.to}</div>
                  <div className="text-sm text-muted-foreground">{route.rides} rides</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">{route.savings}</div>
                  <div className="text-xs text-muted-foreground">saved</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Rides and revenue this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-sm font-medium">{stat.day}</div>
                  <Progress value={(stat.rides / 100) * 100} className="h-2 w-24" />
                </div>
                <div className="text-right">
                  <div className="font-medium">{stat.rides} rides</div>
                  <div className="text-sm text-green-600">{stat.revenue}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            SASSA Impact Summary
          </CardTitle>
          <CardDescription>Monthly impact on the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">R284,700</div>
              <div className="text-sm text-muted-foreground">Total savings generated</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">2,847</div>
              <div className="text-sm text-muted-foreground">Beneficiaries helped</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">68%</div>
              <div className="text-sm text-muted-foreground">Cost reduction vs regular fare</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};