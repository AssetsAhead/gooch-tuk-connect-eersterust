import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Wallet,
  PieChart,
  Download
} from 'lucide-react';

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  averageRide: number;
  cashPayments: number;
  digitalPayments: number;
  driverEarnings: number;
  ownerEarnings: number;
  platformFees: number;
}

interface PaymentDashboardProps {
  userType: 'driver' | 'owner' | 'admin';
  userId: string;
}

export default function PaymentDashboard({ userType, userId }: PaymentDashboardProps) {
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageRide: 0,
    cashPayments: 0,
    digitalPayments: 0,
    driverEarnings: 0,
    ownerEarnings: 0,
    platformFees: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentStats();
  }, [userId, timeFilter]);

  const fetchPaymentStats = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date();
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (userType === 'driver') {
        const { data: rideData } = await supabase
          .from('rides')
          .select('id')
          .eq('driver_id', userId);
        
        const rideIds = rideData?.map(ride => ride.id) || [];
        if (rideIds.length > 0) {
          query = query.in('ride_id', rideIds);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const transactions = data || [];
      
      const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      const totalTransactions = transactions.length;
      const averageRide = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      
      const cashPayments = transactions
        .filter(t => t.payment_method === 'cash')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      
      const digitalPayments = totalRevenue - cashPayments;
      
      const driverEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.driver_share.toString()), 0);
      const ownerEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.owner_share.toString()), 0);
      const platformFees = transactions.reduce((sum, t) => sum + parseFloat(t.platform_fee.toString()), 0);

      setStats({
        totalRevenue,
        totalTransactions,
        averageRide,
        cashPayments,
        digitalPayments,
        driverEarnings,
        ownerEarnings,
        platformFees
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast({
        title: "Error",
        description: "Failed to load payment statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: string;
  }) => (
    <Card className={`border-l-4 border-l-${color}-500`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? `R${value.toFixed(2)}` : value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Dashboard</h2>
        <Tabs value={timeFilter} onValueChange={setTimeFilter}>
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Total Rides"
              value={stats.totalTransactions}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Average Ride"
              value={stats.averageRide}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Active Period"
              value={timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
              icon={Calendar}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Cash Payments</span>
                    </div>
                    <span className="font-medium">R{stats.cashPayments.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Digital Payments</span>
                    </div>
                    <span className="font-medium">R{stats.digitalPayments.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{
                        width: `${stats.totalRevenue > 0 ? (stats.cashPayments / stats.totalRevenue) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {stats.totalRevenue > 0 ? Math.round((stats.cashPayments / stats.totalRevenue) * 100) : 0}% Cash, {' '}
                    {stats.totalRevenue > 0 ? Math.round((stats.digitalPayments / stats.totalRevenue) * 100) : 0}% Digital
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userType !== 'driver' && (
                    <div className="flex items-center justify-between">
                      <span>Driver Share (70%)</span>
                      <Badge variant="secondary">R{stats.driverEarnings.toFixed(2)}</Badge>
                    </div>
                  )}
                  {userType !== 'owner' && (
                    <div className="flex items-center justify-between">
                      <span>Owner Share (20%)</span>
                      <Badge variant="secondary">R{stats.ownerEarnings.toFixed(2)}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Platform Fee (10%)</span>
                    <Badge variant="outline">R{stats.platformFees.toFixed(2)}</Badge>
                  </div>
                  
                  {userType === 'driver' && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between font-medium">
                        <span>Your Earnings</span>
                        <span className="text-green-600">R{stats.driverEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {userType === 'owner' && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between font-medium">
                        <span>Your Earnings</span>
                        <span className="text-green-600">R{stats.ownerEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}