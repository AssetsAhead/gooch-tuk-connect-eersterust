import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  X, 
  Minimize2, 
  Maximize2, 
  AlertTriangle,
  TrendingUp,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProfilerData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

interface ComponentStats {
  name: string;
  renderCount: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
  lastRenderTime: number;
  mountTime?: number;
  updates: number;
}

interface FlameNode {
  name: string;
  duration: number;
  children: FlameNode[];
  depth: number;
  startTime: number;
}

export const PerformanceProfiler: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(true);
  const [stats, setStats] = React.useState<Map<string, ComponentStats>>(new Map());
  const [flameData, setFlameData] = React.useState<FlameNode[]>([]);
  const [currentFrame, setCurrentFrame] = React.useState<ProfilerData[]>([]);

  // Only run in development
  if (import.meta.env.MODE !== 'development') return null;

  const handleProfilerData = React.useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<any>
  ) => {
    if (!isRecording) return;

    const data: ProfilerData = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    };

    // Update current frame data
    setCurrentFrame(prev => [...prev, data]);

    // Update component stats
    setStats(prevStats => {
      const newStats = new Map(prevStats);
      const existing = newStats.get(id);

      if (existing) {
        const updates = phase === 'update' ? existing.updates + 1 : existing.updates;
        newStats.set(id, {
          name: id,
          renderCount: existing.renderCount + 1,
          totalTime: existing.totalTime + actualDuration,
          avgTime: (existing.totalTime + actualDuration) / (existing.renderCount + 1),
          maxTime: Math.max(existing.maxTime, actualDuration),
          minTime: Math.min(existing.minTime, actualDuration),
          lastRenderTime: actualDuration,
          mountTime: phase === 'mount' ? actualDuration : existing.mountTime,
          updates
        });
      } else {
        newStats.set(id, {
          name: id,
          renderCount: 1,
          totalTime: actualDuration,
          avgTime: actualDuration,
          maxTime: actualDuration,
          minTime: actualDuration,
          lastRenderTime: actualDuration,
          mountTime: phase === 'mount' ? actualDuration : undefined,
          updates: phase === 'update' ? 1 : 0
        });
      }

      return newStats;
    });

    // Build flame graph data
    setFlameData(prev => {
      const node: FlameNode = {
        name: id,
        duration: actualDuration,
        children: [],
        depth: 0,
        startTime
      };
      return [...prev.slice(-20), node]; // Keep last 20 renders
    });
  }, [isRecording]);

  const sortedStats = React.useMemo(() => {
    return Array.from(stats.values()).sort((a, b) => b.totalTime - a.totalTime);
  }, [stats]);

  const bottlenecks = React.useMemo(() => {
    return sortedStats.filter(stat => 
      stat.avgTime > 16 || // Over 16ms (60fps threshold)
      stat.renderCount > 10 // Frequent re-renders
    );
  }, [sortedStats]);

  const totalRenders = React.useMemo(() => {
    return Array.from(stats.values()).reduce((sum, stat) => sum + stat.renderCount, 0);
  }, [stats]);

  const totalTime = React.useMemo(() => {
    return Array.from(stats.values()).reduce((sum, stat) => sum + stat.totalTime, 0);
  }, [stats]);

  const resetStats = () => {
    setStats(new Map());
    setFlameData([]);
    setCurrentFrame([]);
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
  };

  const getPerformanceColor = (time: number) => {
    if (time < 8) return 'text-green-500';
    if (time < 16) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceBadge = (time: number) => {
    if (time < 8) return 'default';
    if (time < 16) return 'secondary';
    return 'destructive';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-[9998] rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <Activity className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 z-[9998] w-64">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <CardTitle className="text-sm">Performance</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={isRecording ? 'default' : 'secondary'} className="text-xs">
              {isRecording ? 'Recording' : 'Paused'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Components</div>
              <div className="font-bold">{stats.size}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Renders</div>
              <div className="font-bold">{totalRenders}</div>
            </div>
          </div>
          {bottlenecks.length > 0 && (
            <Badge variant="destructive" className="w-full justify-center text-xs">
              {bottlenecks.length} Bottlenecks
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9998] w-[600px] max-h-[600px] shadow-2xl">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">Performance Profiler</CardTitle>
            <CardDescription className="text-xs">
              Component render tracking & bottleneck detection
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={isRecording ? 'default' : 'secondary'}
            size="sm"
            onClick={toggleRecording}
            className="h-7 text-xs"
          >
            {isRecording ? 'Recording' : 'Paused'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetStats}
            className="h-7 w-7 p-0"
            title="Reset stats"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-7 w-7 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full rounded-none border-b h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
            <TabsTrigger value="bottlenecks" className="text-xs">
              Bottlenecks
              {bottlenecks.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1 text-[10px]">
                  {bottlenecks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="flame" className="text-xs">Flame Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="m-0 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-3">
                  <CardDescription className="text-xs">Total Components</CardDescription>
                  <CardTitle className="text-2xl">{stats.size}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-3">
                  <CardDescription className="text-xs">Total Renders</CardDescription>
                  <CardTitle className="text-2xl">{totalRenders}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-3">
                  <CardDescription className="text-xs">Total Time</CardDescription>
                  <CardTitle className="text-2xl">{totalTime.toFixed(0)}ms</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2 text-xs">
                <div>• Components over 16ms may cause frame drops (60fps)</div>
                <div>• Frequent re-renders indicate missing memoization</div>
                <div>• Check bottlenecks tab for optimization targets</div>
                <div>• Use React.memo() for expensive pure components</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {sortedStats.map((stat) => (
                  <Card key={stat.name} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs font-medium truncate">
                          {stat.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">
                            {stat.renderCount} renders
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {stat.updates} updates
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={getPerformanceBadge(stat.avgTime)}
                        className="text-xs"
                      >
                        {stat.avgTime.toFixed(2)}ms
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground text-[10px]">Total</div>
                        <div className="font-medium">{stat.totalTime.toFixed(1)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[10px]">Min</div>
                        <div className="font-medium">{stat.minTime.toFixed(1)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[10px]">Max</div>
                        <div className={`font-medium ${getPerformanceColor(stat.maxTime)}`}>
                          {stat.maxTime.toFixed(1)}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[10px]">Last</div>
                        <div className="font-medium">{stat.lastRenderTime.toFixed(1)}ms</div>
                      </div>
                    </div>
                  </Card>
                ))}
                {sortedStats.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No profiling data yet. Start recording to see component stats.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bottlenecks" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {bottlenecks.length === 0 ? (
                  <Card className="p-6 text-center bg-green-500/10 border-green-500/50">
                    <div className="text-green-500 font-medium mb-2">
                      No Performance Bottlenecks Detected!
                    </div>
                    <div className="text-xs text-muted-foreground">
                      All components are rendering efficiently
                    </div>
                  </Card>
                ) : (
                  bottlenecks.map((stat) => (
                    <Card key={stat.name} className="p-3 border-destructive/50">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs font-medium truncate mb-1">
                            {stat.name}
                          </div>
                          <div className="space-y-1 text-xs">
                            {stat.avgTime > 16 && (
                              <div className="text-destructive">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Slow render: {stat.avgTime.toFixed(2)}ms avg (target: &lt;16ms)
                              </div>
                            )}
                            {stat.renderCount > 10 && (
                              <div className="text-destructive">
                                <RotateCcw className="h-3 w-3 inline mr-1" />
                                Frequent re-renders: {stat.renderCount} times
                              </div>
                            )}
                          </div>
                          <div className="mt-2 p-2 bg-muted/50 rounded text-[10px] space-y-1">
                            <div className="font-medium">Optimization suggestions:</div>
                            {stat.avgTime > 16 && (
                              <div>• Use React.memo() to prevent unnecessary renders</div>
                            )}
                            {stat.renderCount > 10 && (
                              <div>• Check parent components for state updates</div>
                            )}
                            <div>• Memoize expensive calculations with useMemo()</div>
                            <div>• Wrap callbacks with useCallback()</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="flame" className="m-0 p-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-4">
                Recent component renders (newest at bottom)
              </div>
              <ScrollArea className="h-[350px]">
                {flameData.slice(-15).map((node, idx) => {
                  const widthPercent = Math.min((node.duration / 50) * 100, 100);
                  const color = node.duration < 8 
                    ? 'bg-green-500' 
                    : node.duration < 16 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500';
                  
                  return (
                    <div key={idx} className="mb-1">
                      <div className="flex items-center gap-2 text-xs mb-0.5">
                        <span className="font-mono text-[10px] truncate flex-1">
                          {node.name}
                        </span>
                        <span className={`font-medium ${getPerformanceColor(node.duration)}`}>
                          {node.duration.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="h-6 bg-muted rounded overflow-hidden">
                        <div 
                          className={`h-full ${color} transition-all duration-200`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {flameData.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No flame graph data yet. Interact with the app to see renders.
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Wrapper component that adds Profiler to component tree
export const ProfilerWrapper: React.FC<{ 
  id: string; 
  children: React.ReactNode 
}> = ({ id, children }) => {
  const onRender: React.ProfilerOnRenderCallback = React.useCallback((
    profileId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Emit custom event that PerformanceProfiler listens to
    window.dispatchEvent(new CustomEvent('profiler-data', {
      detail: { 
        id: profileId, 
        phase, 
        actualDuration, 
        baseDuration, 
        startTime, 
        commitTime, 
        interactions: new Set() 
      }
    }));
  }, []);

  if (import.meta.env.MODE !== 'development') {
    return <>{children}</>;
  }

  return (
    <React.Profiler id={id} onRender={onRender}>
      {children}
    </React.Profiler>
  );
};
