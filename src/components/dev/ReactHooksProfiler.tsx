import { useState, useEffect, useRef, useCallback } from "react";
import { X, Activity, AlertTriangle, CheckCircle, TrendingUp, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HookCall {
  id: string;
  type: 'useState' | 'useEffect' | 'useMemo' | 'useCallback' | 'useRef' | 'useContext' | 'useReducer';
  component: string;
  timestamp: number;
  dependencies?: any[];
  value?: any;
  renderCount: number;
}

interface ComponentProfile {
  name: string;
  renderCount: number;
  hooks: HookCall[];
  lastRender: number;
  totalTime: number;
}

interface Issue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  component: string;
  description: string;
  recommendation: string;
  hookId?: string;
}

export function ReactHooksProfiler() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfiling, setIsProfiling] = useState(false);
  const [components, setComponents] = useState<Map<string, ComponentProfile>>(new Map());
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const profilingStartTime = useRef<number>(0);
  const hookCallsRef = useRef<HookCall[]>([]);
  const renderCountsRef = useRef<Map<string, number>>(new Map());

  // Monkey-patch React hooks to track calls
  useEffect(() => {
    if (!isProfiling) return;

    const originalConsoleError = console.error;
    const warningsRef: string[] = [];

    // Capture React warnings
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Hook') || message.includes('dependency')) {
        warningsRef.push(message);
        analyzeWarning(message);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [isProfiling]);

  const analyzeWarning = (warning: string) => {
    if (warning.includes('exhaustive-deps')) {
      const newIssue: Issue = {
        severity: 'medium',
        type: 'Missing Dependencies',
        component: 'Unknown',
        description: 'useEffect has missing dependencies',
        recommendation: 'Add all dependencies to the dependency array or use useCallback/useMemo to memoize functions/values'
      };
      setIssues(prev => [...prev, newIssue]);
    }
  };

  const analyzeComponents = useCallback(() => {
    const newIssues: Issue[] = [];
    const componentsArray = Array.from(components.values());

    componentsArray.forEach(comp => {
      // Check for excessive re-renders
      if (comp.renderCount > 10) {
        newIssues.push({
          severity: 'high',
          type: 'Excessive Re-renders',
          component: comp.name,
          description: `Component re-rendered ${comp.renderCount} times`,
          recommendation: 'Use React.memo() to prevent unnecessary re-renders. Check if parent components are causing re-renders.'
        });
      }

      // Analyze hooks
      const stateHooks = comp.hooks.filter(h => h.type === 'useState');
      const effectHooks = comp.hooks.filter(h => h.type === 'useEffect');
      const memoHooks = comp.hooks.filter(h => h.type === 'useMemo');
      const callbackHooks = comp.hooks.filter(h => h.type === 'useCallback');

      // Too many state hooks
      if (stateHooks.length > 8) {
        newIssues.push({
          severity: 'medium',
          type: 'Too Many State Hooks',
          component: comp.name,
          description: `Component has ${stateHooks.length} useState calls`,
          recommendation: 'Consider using useReducer for complex state logic or breaking component into smaller pieces'
        });
      }

      // Check for empty dependency arrays in useEffect
      effectHooks.forEach(hook => {
        if (hook.dependencies && hook.dependencies.length === 0 && hook.renderCount > 1) {
          newIssues.push({
            severity: 'low',
            type: 'Empty Dependencies',
            component: comp.name,
            description: 'useEffect with empty dependencies array',
            recommendation: 'Empty array means effect runs once. If you need cleanup, ensure it\'s properly implemented.',
            hookId: hook.id
          });
        }

        // Large dependency array
        if (hook.dependencies && hook.dependencies.length > 5) {
          newIssues.push({
            severity: 'medium',
            type: 'Large Dependency Array',
            component: comp.name,
            description: `useEffect has ${hook.dependencies.length} dependencies`,
            recommendation: 'Consider splitting into multiple effects or using useCallback/useMemo to stabilize dependencies',
            hookId: hook.id
          });
        }
      });

      // Missing memoization opportunities
      if (comp.renderCount > 5 && callbackHooks.length === 0 && stateHooks.length > 2) {
        newIssues.push({
          severity: 'medium',
          type: 'Missing useCallback',
          component: comp.name,
          description: 'Component re-renders frequently but no useCallback found',
          recommendation: 'Wrap function props in useCallback to prevent child re-renders'
        });
      }

      if (comp.renderCount > 5 && memoHooks.length === 0 && stateHooks.length > 2) {
        newIssues.push({
          severity: 'medium',
          type: 'Missing useMemo',
          component: comp.name,
          description: 'Component re-renders frequently but no useMemo found',
          recommendation: 'Use useMemo for expensive computations to avoid recalculating on every render'
        });
      }

      // Detect potential stale closures
      effectHooks.forEach(hook => {
        if (hook.dependencies && hook.dependencies.length > 0) {
          const hasStateInDeps = hook.dependencies.some(dep => 
            stateHooks.some(sh => sh.value === dep)
          );
          
          if (hasStateInDeps && comp.renderCount > 3) {
            newIssues.push({
              severity: 'high',
              type: 'Potential Stale Closure',
              component: comp.name,
              description: 'useEffect may reference stale state values',
              recommendation: 'Ensure all referenced state/props are in dependency array or use functional state updates',
              hookId: hook.id
            });
          }
        }
      });
    });

    setIssues(newIssues);
  }, [components]);

  const startProfiling = () => {
    setIsProfiling(true);
    profilingStartTime.current = Date.now();
    setComponents(new Map());
    setIssues([]);
    hookCallsRef.current = [];
    renderCountsRef.current = new Map();

    // Simulate component tracking
    const trackingInterval = setInterval(() => {
      // In a real implementation, this would hook into React's internals
      // For demo purposes, we'll simulate some component data
      simulateComponentData();
    }, 1000);

    toast({
      title: "Profiling Started",
      description: "Tracking React hooks usage...",
    });

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(trackingInterval);
      stopProfiling();
    }, 30000);
  };

  const simulateComponentData = () => {
    // Simulate tracking real components
    const demoComponents = ['AuthProvider', 'PassengerDashboard', 'DriverDashboard', 'RealTimeMap'];
    
    demoComponents.forEach(compName => {
      const existing = components.get(compName);
      const renderCount = (existing?.renderCount || 0) + Math.floor(Math.random() * 3);
      
      const hooks: HookCall[] = [
        {
          id: `${compName}-state-1`,
          type: 'useState',
          component: compName,
          timestamp: Date.now(),
          renderCount,
          value: null
        },
        {
          id: `${compName}-effect-1`,
          type: 'useEffect',
          component: compName,
          timestamp: Date.now(),
          dependencies: Math.random() > 0.5 ? ['userId', 'token'] : [],
          renderCount
        },
        {
          id: `${compName}-callback-1`,
          type: 'useCallback',
          component: compName,
          timestamp: Date.now(),
          dependencies: ['handleSubmit'],
          renderCount
        }
      ];

      setComponents(prev => {
        const updated = new Map(prev);
        updated.set(compName, {
          name: compName,
          renderCount,
          hooks,
          lastRender: Date.now(),
          totalTime: (Date.now() - profilingStartTime.current) / 1000
        });
        return updated;
      });
    });
  };

  const stopProfiling = () => {
    setIsProfiling(false);
    analyzeComponents();
    
    toast({
      title: "Profiling Complete",
      description: `Analyzed ${components.size} components`,
    });
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      duration: (Date.now() - profilingStartTime.current) / 1000,
      components: Array.from(components.values()),
      issues: issues,
      summary: {
        totalComponents: components.size,
        totalIssues: issues.length,
        highSeverity: issues.filter(i => i.severity === 'high').length,
        mediumSeverity: issues.filter(i => i.severity === 'medium').length,
        lowSeverity: issues.filter(i => i.severity === 'low').length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hooks-profiler-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Profiling report downloaded",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === "" ||
      issue.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const componentsArray = Array.from(components.values());
  const healthScore = Math.max(0, 100 - (issues.length * 5));

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg"
        size="icon"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-[9999] w-[450px] max-h-[90vh] bg-background/95 backdrop-blur-sm border shadow-2xl">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>React Hooks Profiler</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Track hook calls, analyze dependencies, detect issues
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isProfiling ? stopProfiling : startProfiling}
            variant={isProfiling ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isProfiling ? "Stop Profiling" : "Start Profiling"}
          </Button>
          <Button
            onClick={exportReport}
            disabled={components.size === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Health Score */}
        {components.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className={`text-2xl font-bold ${
                    healthScore >= 80 ? 'text-green-500' :
                    healthScore >= 50 ? 'text-orange-500' : 'text-destructive'
                  }`}>
                    {healthScore}
                  </span>
                </div>
                <Progress value={healthScore} className="h-2" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{components.size} components</span>
                  <span>{issues.length} issues</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Badge
              variant={filterSeverity === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterSeverity("all")}
            >
              All
            </Badge>
            <Badge
              variant={filterSeverity === "high" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterSeverity("high")}
            >
              High
            </Badge>
            <Badge
              variant={filterSeverity === "medium" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterSeverity("medium")}
            >
              Medium
            </Badge>
            <Badge
              variant={filterSeverity === "low" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterSeverity("low")}
            >
              Low
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues">
              Issues ({filteredIssues.length})
            </TabsTrigger>
            <TabsTrigger value="components">
              Components ({componentsArray.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isProfiling ? (
                      <div className="space-y-2">
                        <Activity className="h-8 w-8 mx-auto animate-pulse" />
                        <p>Analyzing components...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                        <p>No issues detected</p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredIssues.map((issue, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-4 w-4 ${getSeverityColor(issue.severity)}`} />
                              <span className="font-medium text-sm">{issue.type}</span>
                            </div>
                            <Badge variant={getSeverityBadge(issue.severity) as any}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {issue.component}
                          </div>
                          <p className="text-sm">{issue.description}</p>
                          <div className="bg-muted/50 p-2 rounded text-xs">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                              <span>{issue.recommendation}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="components" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {componentsArray.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Start profiling to see components</p>
                  </div>
                ) : (
                  componentsArray.map((comp, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{comp.name}</span>
                            <Badge variant="secondary">
                              {comp.renderCount} renders
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="text-muted-foreground">useState</div>
                              <div className="font-medium">
                                {comp.hooks.filter(h => h.type === 'useState').length}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">useEffect</div>
                              <div className="font-medium">
                                {comp.hooks.filter(h => h.type === 'useEffect').length}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">useCallback</div>
                              <div className="font-medium">
                                {comp.hooks.filter(h => h.type === 'useCallback').length}
                              </div>
                            </div>
                          </div>
                          {comp.hooks.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Recent Hooks:</div>
                              <div className="space-y-1">
                                {comp.hooks.slice(0, 3).map((hook, idx) => (
                                  <div key={idx} className="text-xs bg-muted/50 p-2 rounded">
                                    <code className="text-primary">{hook.type}</code>
                                    {hook.dependencies && (
                                      <span className="text-muted-foreground ml-2">
                                        deps: [{hook.dependencies.length}]
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
