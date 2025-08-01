import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  Database, 
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineCapability {
  feature: string;
  status: 'available' | 'syncing' | 'error';
  lastSync: string;
  dataSize: string;
}

export const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineCapability[]>([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, available: 0 });
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your offline data...",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Don't worry! You can still use core features.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize offline capabilities
    initializeOfflineData();
    checkStorageUsage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeOfflineData = () => {
    const capabilities: OfflineCapability[] = [
      {
        feature: 'SASSA Verifications',
        status: 'available',
        lastSync: new Date().toLocaleString(),
        dataSize: '2.3 MB'
      },
      {
        feature: 'Emergency Contacts',
        status: 'available',
        lastSync: new Date().toLocaleString(),
        dataSize: '156 KB'
      },
      {
        feature: 'Ward Messages',
        status: 'syncing',
        lastSync: '2 hours ago',
        dataSize: '512 KB'
      },
      {
        feature: 'Analytics Events',
        status: 'available',
        lastSync: '5 minutes ago',
        dataSize: '1.1 MB'
      },
      {
        feature: 'Municipal Bills',
        status: 'error',
        lastSync: '1 day ago',
        dataSize: '789 KB'
      }
    ];
    
    setOfflineData(capabilities);
  };

  const checkStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          available: estimate.quota || 0
        });
      } catch (error) {
        console.error('Storage estimation failed:', error);
      }
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncProgress(i);
      }

      // Update offline data status
      setOfflineData(prev => prev.map(item => ({
        ...item,
        status: 'available' as const,
        lastSync: new Date().toLocaleString()
      })));

      toast({
        title: "Sync Complete",
        description: "All offline data synchronized successfully",
      });

    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Some data couldn't be synchronized",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const clearOfflineData = async () => {
    try {
      localStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      toast({
        title: "Cache Cleared",
        description: "All offline data has been removed",
      });
      
      initializeOfflineData();
      checkStorageUsage();
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Couldn't clear all offline data",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-danger" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-6 w-6 text-success" />
            ) : (
              <WifiOff className="h-6 w-6 text-warning" />
            )}
            Offline Capabilities
          </h2>
          <p className="text-muted-foreground">
            {isOnline ? 'Connected - All features available' : 'Offline mode - Core features still work'}
          </p>
        </div>
        <Badge variant={isOnline ? 'default' : 'secondary'} className={isOnline ? 'bg-success' : 'bg-warning'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">📱 Features</TabsTrigger>
          <TabsTrigger value="storage">💾 Storage</TabsTrigger>
          <TabsTrigger value="sync">🔄 Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Offline Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offlineData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.feature}</h4>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {item.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.dataSize}</div>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                  <h4 className="font-semibold">Available Offline</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Request taxi rides</li>
                  <li>• View emergency contacts</li>
                  <li>• Access SASSA info</li>
                  <li>• Read ward messages</li>
                  <li>• Use panic button</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <WifiOff className="h-6 w-6 text-warning" />
                  <h4 className="font-semibold">Requires Internet</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Real-time driver tracking</li>
                  <li>• Payment processing</li>
                  <li>• Live chat messaging</li>
                  <li>• Municipal bill payments</li>
                  <li>• Live safety alerts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Used Storage</span>
                  <span className="text-sm font-medium">
                    {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.available)}
                  </span>
                </div>
                <Progress 
                  value={(storageUsage.used / storageUsage.available) * 100} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatBytes(storageUsage.used)}</div>
                  <div className="text-xs text-muted-foreground">Used</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {formatBytes(storageUsage.available - storageUsage.used)}
                  </div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={clearOfflineData}
                className="w-full"
              >
                Clear Offline Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                Data Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing data...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={syncOfflineData}
                  disabled={!isOnline || isSyncing}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Sync Now
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={checkStorageUsage}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Auto-Sync Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>When back online</span>
                    <Badge className="bg-success text-white">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Background sync</span>
                    <Badge className="bg-success text-white">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>WiFi only</span>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};