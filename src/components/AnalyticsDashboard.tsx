import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  Download,
  Filter,
  TrendingDown,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalRides: number;
  totalRevenue: number;
  sassaRides: number;
  averageRating: number;
  verifiedUsers: number;
  costSavings: number;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRides: 0,
    totalRevenue: 0,
    sassaRides: 0,
    averageRating: 0,
    verifiedUsers: 0,
    costSavings: 0
  });
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      switch (timeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Fetch rides data
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ridesError) throw ridesError;

      // Fetch transactions data
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (transactionsError) throw transactionsError;

      // Fetch SASSA verifications
      const { data: sassaData, error: sassaError } = await supabase
        .from('sassa_verifications')
        .select('*')
        .eq('status', 'verified');

      if (sassaError) throw sassaError;

      // Fetch driver ratings
      const { data: driverRatings, error: ratingsError } = await supabase
        .from('driver_reputation')
        .select('rating');

      if (ratingsError) throw ratingsError;

      // Calculate analytics
      const totalRides = rides?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const sassaRides = Math.floor(totalRides * 0.4); // Estimate based on SASSA users
      const averageRating = driverRatings?.reduce((sum, r) => sum + Number(r.rating), 0) / (driverRatings?.length || 1) || 4.5;
      const verifiedUsers = sassaData?.length || 0;
      const costSavings = sassaRides * 100; // R100 average savings per SASSA ride

      setAnalytics({
        totalRides,
        totalRevenue,
        sassaRides,
        averageRating,
        verifiedUsers,
        costSavings
      });

    } catch (error: any) {
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Total SASSA Rides",
      value: analytics.sassaRides.toLocaleString(),
      change: "+18%",
      trend: "up",
      icon: Users,
      description: `Last ${timeframe}`
    },
    {
      title: "Cost Savings Generated",
      value: `R${analytics.costSavings.toLocaleString()}`,
      change: "+24%",
      trend: "up",
      icon: DollarSign,
      description: "For beneficiaries"
    },
    {
      title: "Average Rating",
      value: analytics.averageRating.toFixed(1),
      change: "+0.3",
      trend: "up",
      icon: Star,
      description: "Driver satisfaction"
    },
    {
      title: "Verified Users",
      value: analytics.verifiedUsers.toLocaleString(),
      change: "+156",
      trend: "up",
      icon: UserCheck,
      description: "SASSA verified"
    }
  ];

  const topRoutes = [
    { from: "Khayelitsha", to: "Cape Town CBD", rides: 234, savings: "R23,400", growth: "+12%" },
    { from: "Soweto", to: "Johannesburg CBD", rides: 189, savings: "R18,900", growth: "+8%" },
    { from: "Mitchells Plain", to: "Claremont", rides: 156, savings: "R15,600", growth: "+15%" },
    { from: "Gugulethu", to: "Wynberg", rides: 143, savings: "R14,300", growth: "+5%" }
  ];

  const weeklyStats = [
    { day: "Mon", rides: 45, revenue: "R4,500", efficiency: 89 },
    { day: "Tue", rides: 52, revenue: "R5,200", efficiency: 92 },
    { day: "Wed", rides: 38, revenue: "R3,800", efficiency: 78 },
    { day: "Thu", rides: 61, revenue: "R6,100", efficiency: 95 },
    { day: "Fri", rides: 73, revenue: "R7,300", efficiency: 97 },
    { day: "Sat", rides: 89, revenue: "R8,900", efficiency: 98 },
    { day: "Sun", rides: 67, revenue: "R6,700", efficiency: 85 }
  ];

  const realtimeMetrics = [
    { label: "Active Drivers", value: 127, change: "+3", icon: Activity, color: "text-green-600" },
    { label: "Pending Rides", value: 23, change: "-5", icon: Clock, color: "text-orange-600" },
    { label: "Safety Incidents", value: 2, change: "-1", icon: Shield, color: "text-red-600" },
    { label: "System Uptime", value: "99.8%", change: "+0.1%", icon: Zap, color: "text-blue-600" }
  ];

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value', 'Change'],
      ['Total SASSA Rides', analytics.sassaRides, '+18%'],
      ['Cost Savings', `R${analytics.costSavings}`, '+24%'],
      ['Average Rating', analytics.averageRating.toFixed(1), '+0.3'],
      ['Verified Users', analytics.verifiedUsers, '+156']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics data downloaded successfully",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
          <p className="text-muted-foreground">Comprehensive insights into your TukTuk Community</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : metric.value}</div>
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

          {/* Charts and Details */}
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
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium">{route.from} → {route.to}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {route.rides} rides
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {route.growth}
                        </Badge>
                      </div>
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
                <CardDescription>Rides, revenue and efficiency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-sm font-medium">{stat.day}</div>
                        <div className="text-sm text-muted-foreground">{stat.rides} rides</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{stat.revenue}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.efficiency} className="h-2 flex-1" />
                      <div className="text-xs text-muted-foreground w-12">{stat.efficiency}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                SASSA Impact Summary
              </CardTitle>
              <CardDescription>Community impact over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="text-2xl font-bold text-blue-600">R{analytics.costSavings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total savings generated</div>
                  <div className="text-xs text-green-600 mt-1">+24% vs last period</div>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-green-50 transition-colors">
                  <div className="text-2xl font-bold text-green-600">{analytics.sassaRides.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Beneficiaries helped</div>
                  <div className="text-xs text-green-600 mt-1">+18% vs last period</div>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="text-2xl font-bold text-purple-600">68%</div>
                  <div className="text-sm text-muted-foreground">Cost reduction vs regular fare</div>
                  <div className="text-xs text-green-600 mt-1">+3% improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Performance</CardTitle>
                <CardDescription>Top performing drivers this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {rank}
                      </div>
                      <div>
                        <div className="font-medium">Driver {rank}</div>
                        <div className="text-sm text-muted-foreground">{120 - rank * 5} rides completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{(4.9 - rank * 0.1).toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-green-600">R{(15000 - rank * 500).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Efficiency</CardTitle>
                <CardDescription>Most efficient routes by time and cost</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { route: "Khayelitsha → Cape Town", time: "25 min", cost: "R45", efficiency: 95 },
                  { route: "Soweto → Sandton", time: "35 min", cost: "R65", efficiency: 88 },
                  { route: "Mitchell's Plain → CBD", time: "30 min", cost: "R55", efficiency: 92 },
                  { route: "Gugulethu → Wynberg", time: "20 min", cost: "R40", efficiency: 94 }
                ].map((route, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{route.route}</div>
                      <div className="text-sm text-muted-foreground">{route.efficiency}%</div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{route.time} avg time</span>
                      <span>{route.cost} avg cost</span>
                    </div>
                    <Progress value={route.efficiency} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {realtimeMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {metric.change.includes('+') ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span className={metric.change.includes('+') ? 'text-green-600' : 'text-red-600'}>
                        {metric.change}
                      </span>
                      <span className="ml-1">from last hour</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time system events and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "2 mins ago", event: "New SASSA verification approved", type: "success" },
                { time: "5 mins ago", event: "Driver John completed ride to Wynberg", type: "info" },
                { time: "8 mins ago", event: "Peak hours started - increased demand", type: "warning" },
                { time: "12 mins ago", event: "Route optimization updated", type: "info" },
                { time: "15 mins ago", event: "Safety incident resolved", type: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-600' :
                      activity.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`} />
                    <div className="text-sm">{activity.event}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};