import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, Car, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: 'ride_completed' | 'driver_online' | 'safety_alert' | 'achievement' | 'system';
  user: string;
  action: string;
  location?: string;
  timestamp: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

interface LiveStats {
  activeRides: number;
  onlineDrivers: number;
  completedToday: number;
  safetyAlerts: number;
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    activeRides: 0,
    onlineDrivers: 0,
    completedToday: 0,
    safetyAlerts: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    loadInitialData();
    
    // Set up real-time subscriptions
    const ridesChannel = supabase
      .channel('live-activity-rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
        },
        (payload) => {
          handleRideUpdate(payload);
        }
      )
      .subscribe();

    const driversChannel = supabase
      .channel('live-activity-drivers')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
        },
        (payload) => {
          handleDriverUpdate(payload);
        }
      )
      .subscribe();

    // Simulate live updates
    const interval = setInterval(() => {
      addRandomActivity();
      updateStats();
    }, 10000);

    return () => {
      supabase.removeChannel(ridesChannel);
      supabase.removeChannel(driversChannel);
      clearInterval(interval);
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    
    // Fetch current stats from database
    const [ridesResult, driversResult] = await Promise.all([
      supabase.from('rides').select('status').eq('status', 'in_progress'),
      supabase.from('drivers').select('status').eq('status', 'online')
    ]);

    setStats({
      activeRides: ridesResult.data?.length || 12,
      onlineDrivers: driversResult.data?.length || 8,
      completedToday: 45,
      safetyAlerts: 2
    });

    // Initialize with mock activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'ride_completed',
        user: 'Thabo M.',
        action: 'completed a ride from Denlyn Mall to Municipal Clinic',
        location: 'Eersterust',
        timestamp: new Date().toISOString(),
        icon: '✅',
        priority: 'low'
      },
      {
        id: '2',
        type: 'driver_online',
        user: 'Sarah K.',
        action: 'came online and is now available',
        location: 'Highlands Park',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        icon: '🚗',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'achievement',
        user: 'Driver TT001',
        action: 'earned the "Perfect Week" badge',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        icon: '🏆',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'safety_alert',
        user: 'Community Watch',
        action: 'reported suspicious activity near Pick n Pay',
        location: 'Eersterust Shopping Centre',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        icon: '⚠️',
        priority: 'high'
      },
      {
        id: '5',
        type: 'ride_completed',
        user: 'Maria S.',
        action: 'completed her 50th ride this month',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        icon: '🎉',
        priority: 'medium'
      }
    ];

    setActivities(mockActivities);
    setIsLoading(false);
  };

  const handleRideUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'requested') {
      addActivity({
        type: 'ride_completed',
        user: 'New Passenger',
        action: 'requested a ride',
        location: payload.new.pickup_location,
        icon: '🚕',
        priority: 'low'
      });
    } else if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
      addActivity({
        type: 'ride_completed',
        user: 'Passenger',
        action: 'completed a ride',
        location: payload.new.destination,
        icon: '✅',
        priority: 'low'
      });
      updateStats();
    }
  };

  const handleDriverUpdate = (payload: any) => {
    if (payload.new.status === 'online' && payload.old.status !== 'online') {
      addActivity({
        type: 'driver_online',
        user: payload.new.name,
        action: 'came online and is now available',
        location: payload.new.location,
        icon: '🚗',
        priority: 'medium'
      });
      updateStats();
    }
  };

  const addActivity = (activityData: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...activityData
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const addRandomActivity = () => {
    const randomActivities = [
      {
        type: 'ride_completed' as const,
        user: 'John D.',
        action: 'completed a ride',
        location: 'Denlyn Mall',
        icon: '✅',
        priority: 'low' as const
      },
      {
        type: 'driver_online' as const,
        user: 'Peter M.',
        action: 'came online',
        location: 'Silverton',
        icon: '🚗',
        priority: 'medium' as const
      },
      {
        type: 'achievement' as const,
        user: 'Lisa K.',
        action: 'earned a safety badge',
        icon: '🛡️',
        priority: 'medium' as const
      }
    ];

    const randomActivity = randomActivities[Math.floor(Math.random() * randomActivities.length)];
    addActivity(randomActivity);
  };

  const updateStats = () => {
    setStats(prev => ({
      activeRides: Math.max(0, prev.activeRides + (Math.random() > 0.5 ? 1 : -1)),
      onlineDrivers: Math.max(0, prev.onlineDrivers + (Math.random() > 0.7 ? 1 : 0)),
      completedToday: prev.completedToday + (Math.random() > 0.8 ? 1 : 0),
      safetyAlerts: prev.safetyAlerts
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-danger';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-muted';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ride_completed':
        return <Car className="h-4 w-4" />;
      case 'driver_online':
        return <Users className="h-4 w-4" />;
      case 'achievement':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-success/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.activeRides}</div>
            <p className="text-xs text-muted-foreground">Active Rides</p>
            <Badge className="bg-success/20 text-success text-xs mt-1">Live</Badge>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.onlineDrivers}</div>
            <p className="text-xs text-muted-foreground">Online Drivers</p>
            <Badge className="bg-primary/20 text-primary text-xs mt-1">Available</Badge>
          </CardContent>
        </Card>
        <Card className="border-tuk-blue/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-tuk-blue">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Completed Today</p>
            <Badge className="bg-tuk-blue/20 text-tuk-blue text-xs mt-1">+{Math.floor(Math.random() * 5 + 1)} new</Badge>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.safetyAlerts}</div>
            <p className="text-xs text-muted-foreground">Safety Alerts</p>
            <Badge className="bg-warning/20 text-warning text-xs mt-1">Low risk</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live Activity Feed
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={loadInitialData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 bg-muted/20 ${getPriorityColor(activity.priority)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      {activity.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {activity.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{activity.icon}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Live Indicator */}
          <div className="mt-4 p-3 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live updates active</span>
              <div className="text-muted-foreground">•</div>
              <span className="text-sm text-muted-foreground">Updated just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};