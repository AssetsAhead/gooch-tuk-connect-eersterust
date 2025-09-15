import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Wifi, Zap, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  pageLoadTime: number;
  networkLatency: number;
  memoryUsage: number;
  connectionType: string;
  batteryLevel?: number;
  isOnline: boolean;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    networkLatency: 0,
    memoryUsage: 0,
    connectionType: 'unknown',
    isOnline: navigator.onLine,
  });
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    measureInitialMetrics();
    
    // Monitor network status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Monitor performance periodically
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const measureInitialMetrics = () => {
    // Measure page load time
    if (performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    }

    // Get connection info
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setMetrics(prev => ({ 
        ...prev, 
        connectionType: connection.effectiveType || 'unknown' 
      }));
    }

    // Get battery info
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setMetrics(prev => ({ 
          ...prev, 
          batteryLevel: Math.round(battery.level * 100) 
        }));
      });
    }

    updateMetrics();
  };

  const updateMetrics = async () => {
    // Measure memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }

    // Measure network latency (simplified)
    const latencyStart = performance.now();
    try {
      // Use a simple ping approach
      await new Promise(resolve => setTimeout(resolve, 10));
      const latency = performance.now() - latencyStart;
      setMetrics(prev => ({ ...prev, networkLatency: latency }));
    } catch (error) {
      // Network error, set high latency
      setMetrics(prev => ({ ...prev, networkLatency: 5000 }));
    }

    checkPerformanceAlerts();
  };

  const handleOnlineStatus = () => {
    setMetrics(prev => ({ ...prev, isOnline: navigator.onLine }));
  };

  const checkPerformanceAlerts = () => {
    const newAlerts: PerformanceAlert[] = [];

    // Check page load time
    if (metrics.pageLoadTime > 5000) {
      newAlerts.push({
        type: 'warning',
        message: 'Slow page load detected',
        metric: 'pageLoadTime',
        value: metrics.pageLoadTime,
        threshold: 5000,
      });
    }

    // Check memory usage
    if (metrics.memoryUsage > 80) {
      newAlerts.push({
        type: 'error',
        message: 'High memory usage detected',
        metric: 'memoryUsage',
        value: metrics.memoryUsage,
        threshold: 80,
      });
    }

    // Check network latency
    if (metrics.networkLatency > 2000) {
      newAlerts.push({
        type: 'warning',
        message: 'High network latency detected',
        metric: 'networkLatency',
        value: metrics.networkLatency,
        threshold: 2000,
      });
    }

    setAlerts(newAlerts);
    
    // Log performance issues
    if (newAlerts.length > 0) {
      logPerformanceIssue(newAlerts);
    }
  };

  const logPerformanceIssue = async (performanceAlerts: PerformanceAlert[]) => {
    if (!user) return;

    try {
      // Save to localStorage for now
      const performanceLog = {
        user_id: user.id,
        metrics: metrics,
        alerts: performanceAlerts,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      const existingLogs = JSON.parse(localStorage.getItem('performance_logs') || '[]');
      existingLogs.push(performanceLog);
      localStorage.setItem('performance_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log performance issue:', error);
    }
  };

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.pageLoadTime > 3000) score -= 20;
    if (metrics.memoryUsage > 60) score -= 15;
    if (metrics.networkLatency > 1000) score -= 15;
    if (!metrics.isOnline) score -= 50;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const score = getPerformanceScore();

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Performance issues detected: {alerts.map(alert => alert.message).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitor
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                Score: {score}/100
              </span>
              <Badge variant={metrics.isOnline ? 'default' : 'destructive'}>
                {metrics.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Page Load</span>
                </div>
                <span className="text-sm font-medium">
                  {(metrics.pageLoadTime / 1000).toFixed(1)}s
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.pageLoadTime / 5000) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Network</span>
                </div>
                <span className="text-sm font-medium">
                  {metrics.networkLatency.toFixed(0)}ms
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.networkLatency / 2000) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className="text-sm font-medium">
                  {metrics.memoryUsage}%
                </span>
              </div>
              <Progress 
                value={metrics.memoryUsage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Connection</span>
                </div>
                <span className="text-sm font-medium capitalize">
                  {metrics.connectionType}
                </span>
              </div>
              {metrics.batteryLevel !== undefined && (
                <div className="text-xs text-muted-foreground">
                  Battery: {metrics.batteryLevel}%
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Performance Score:</strong> Based on load time, memory usage, and network performance</p>
            <p><strong>Monitoring:</strong> {isMonitoring ? 'Active' : 'Inactive'} | Updates every 30 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};