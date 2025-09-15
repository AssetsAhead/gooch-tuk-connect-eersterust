import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorBoundarySystem } from './ErrorBoundarySystem';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  services: {
    auth: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
    realtime: 'online' | 'offline' | 'degraded';
  };
  metrics: {
    errorRate: number;
    responseTime: number;
    activeUsers: number;
    systemLoad: number;
  };
}

export const HealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    lastCheck: new Date().toISOString(),
    services: {
      auth: 'online',
      database: 'online',
      storage: 'online',
      realtime: 'online',
    },
    metrics: {
      errorRate: 0,
      responseTime: 0,
      activeUsers: 0,
      systemLoad: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      // Check authentication service
      const authCheck = await checkAuthService();
      
      // Check database service
      const dbCheck = await checkDatabaseService();
      
      // Check storage service
      const storageCheck = await checkStorageService();
      
      // Check realtime service
      const realtimeCheck = await checkRealtimeService();

      // Calculate overall status
      const services = {
        auth: authCheck,
        database: dbCheck,
        storage: storageCheck,
        realtime: realtimeCheck,
      };

      const overallStatus = calculateOverallStatus(services);
      
      // Get performance metrics
      const metrics = await getPerformanceMetrics();

      setHealth({
        status: overallStatus,
        uptime: Date.now() - performance.timeOrigin,
        lastCheck: new Date().toISOString(),
        services,
        metrics,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        ...prev,
        status: 'critical',
        lastCheck: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkAuthService = async (): Promise<'online' | 'offline' | 'degraded'> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return error ? 'degraded' : 'online';
    } catch {
      return 'offline';
    }
  };

  const checkDatabaseService = async (): Promise<'online' | 'offline' | 'degraded'> => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const responseTime = performance.now() - start;
      
      if (error) return 'degraded';
      return responseTime > 2000 ? 'degraded' : 'online';
    } catch {
      return 'offline';
    }
  };

  const checkStorageService = async (): Promise<'online' | 'offline' | 'degraded'> => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      return error ? 'degraded' : 'online';
    } catch {
      return 'offline';
    }
  };

  const checkRealtimeService = async (): Promise<'online' | 'offline' | 'degraded'> => {
    try {
      // Check if realtime connection is active
      const channel = supabase.channel('health-check');
      const status = channel.state;
      return status === 'joined' ? 'online' : 'degraded';
    } catch {
      return 'offline';
    }
  };

  const calculateOverallStatus = (services: SystemHealth['services']): 'healthy' | 'warning' | 'critical' => {
    const serviceStatuses = Object.values(services);
    
    if (serviceStatuses.includes('offline')) return 'critical';
    if (serviceStatuses.includes('degraded')) return 'warning';
    return 'healthy';
  };

  const getPerformanceMetrics = async (): Promise<SystemHealth['metrics']> => {
    // Simulate getting metrics - in a real app, these would come from monitoring services
    return {
      errorRate: Math.random() * 5, // 0-5% error rate
      responseTime: 200 + Math.random() * 800, // 200-1000ms response time
      activeUsers: Math.floor(Math.random() * 1000), // 0-1000 active users
      systemLoad: Math.random() * 100, // 0-100% system load
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Alert */}
      {health.status !== 'healthy' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {health.status === 'critical' 
              ? 'Critical system issues detected. Some features may be unavailable.'
              : 'System degradation detected. Performance may be impacted.'
            }
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Dashboard
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkSystemHealth}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(health.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Uptime:</strong> {Math.floor(health.uptime / 1000 / 60)} minutes</p>
                <p><strong>Last Check:</strong> {new Date(health.lastCheck).toLocaleString()}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-2xl font-bold">{health.metrics.errorRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-2xl font-bold">{health.metrics.responseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-2xl font-bold">{health.metrics.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-2xl font-bold">{health.metrics.systemLoad.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">System Load</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <PerformanceMonitor />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};