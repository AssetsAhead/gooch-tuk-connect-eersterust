import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  X, 
  Minimize2, 
  Maximize2,
  History,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Save,
  SkipBack,
  SkipForward,
  Trash2,
  Download
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface StateSnapshot {
  id: string;
  timestamp: number;
  label: string;
  state: Record<string, any>;
}

interface QueryCacheEntry {
  queryKey: readonly any[];
  data: any;
  state: 'fresh' | 'fetching' | 'stale' | 'error';
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  fetchStatus: string;
}

export const StateDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showSensitive, setShowSensitive] = React.useState(false);
  const [snapshots, setSnapshots] = React.useState<StateSnapshot[]>([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = React.useState(-1);
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();
  const authContext = useAuth();

  // Only run in development
  if (import.meta.env.MODE !== 'development') return null;

  // Get React Query cache
  const queryCache = React.useMemo((): QueryCacheEntry[] => {
    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      return queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data,
        state: query.state.status === 'success' ? 'fresh' : 
               query.state.status === 'pending' ? 'fetching' :
               query.state.status === 'error' ? 'error' : 'stale',
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
        fetchStatus: query.state.fetchStatus
      }));
    } catch (error) {
      console.error('Error reading query cache:', error);
      return [];
    }
  }, [queryClient]);

  // Collect all context values
  const contextValues = React.useMemo(() => {
    const contexts: Record<string, any> = {
      'AuthContext': {
        user: authContext.user ? {
          id: authContext.user.id,
          email: authContext.user.email,
          created_at: authContext.user.created_at,
          // Hide sensitive data unless explicitly shown
          ...(showSensitive ? authContext.user : {})
        } : null,
        userProfile: authContext.userProfile,
        loading: authContext.loading,
        requireMFA: authContext.requireMFA,
        isSecureSession: authContext.isSecureSession
      }
    };

    return contexts;
  }, [authContext, showSensitive]);

  // Create snapshot of current state
  const createSnapshot = React.useCallback((label?: string) => {
    const snapshot: StateSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      label: label || `Snapshot ${snapshots.length + 1}`,
      state: {
        contexts: contextValues,
        queryCache: queryCache,
        localStorage: showSensitive ? JSON.parse(JSON.stringify(localStorage)) : 'Hidden'
      }
    };

    setSnapshots(prev => [...prev, snapshot]);
    setCurrentSnapshotIndex(snapshots.length);
  }, [contextValues, queryCache, snapshots.length, showSensitive]);

  // Navigate through snapshots
  const goToSnapshot = React.useCallback((index: number) => {
    if (index >= 0 && index < snapshots.length) {
      setCurrentSnapshotIndex(index);
    }
  }, [snapshots.length]);

  // Clear all snapshots
  const clearSnapshots = React.useCallback(() => {
    setSnapshots([]);
    setCurrentSnapshotIndex(-1);
  }, []);

  // Export snapshots
  const exportSnapshots = React.useCallback(() => {
    const dataStr = JSON.stringify(snapshots, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `state-snapshots-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [snapshots]);

  // Toggle expanded state for nested objects
  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Render JSON tree
  const renderValue = (value: any, path: string = '', depth: number = 0): React.ReactNode => {
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (value === undefined) return <span className="text-muted-foreground">undefined</span>;
    
    const type = typeof value;
    
    if (type === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    }
    
    if (type === 'number' || type === 'boolean') {
      return <span className="text-blue-600 dark:text-blue-400">{String(value)}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">[]</span>;
      
      const isExpanded = expandedKeys.has(path);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="text-yellow-600 dark:text-yellow-400 hover:underline"
          >
            Array[{value.length}] {isExpanded ? '▼' : '▶'}
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-2 mt-1">
              {value.map((item, index) => (
                <div key={index} className="py-0.5">
                  <span className="text-muted-foreground">{index}: </span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (type === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return <span className="text-muted-foreground">{'{}'}</span>;
      
      const isExpanded = expandedKeys.has(path);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Object{'{' + keys.length + '}'} {isExpanded ? '▼' : '▶'}
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-2 mt-1">
              {keys.map(key => (
                <div key={key} className="py-0.5">
                  <span className="text-cyan-600 dark:text-cyan-400">{key}: </span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-muted-foreground">{String(value)}</span>;
  };

  // Filter function for search
  const matchesSearch = (obj: any, term: string): boolean => {
    if (!term) return true;
    const searchLower = term.toLowerCase();
    
    const search = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.toLowerCase().includes(searchLower)) return true;
      if (typeof val === 'object') {
        return Object.entries(val).some(([key, value]) => 
          key.toLowerCase().includes(searchLower) || search(value)
        );
      }
      return false;
    };
    
    return search(obj);
  };

  const currentState = currentSnapshotIndex >= 0 
    ? snapshots[currentSnapshotIndex].state 
    : { contexts: contextValues, queryCache };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 right-4 z-[9998] rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <Database className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 z-[9998] w-64">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <CardTitle className="text-sm">State Debugger</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {currentSnapshotIndex >= 0 && (
              <Badge variant="secondary" className="text-xs">
                Snapshot {currentSnapshotIndex + 1}
              </Badge>
            )}
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
              <div className="text-muted-foreground">Contexts</div>
              <div className="font-bold">{Object.keys(contextValues).length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Queries</div>
              <div className="font-bold">{queryCache.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9998] w-[700px] max-h-[650px] shadow-2xl">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">State Debugger</CardTitle>
            <CardDescription className="text-xs">
              Inspect contexts, queries & time-travel debugging
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSensitive(!showSensitive)}
            className="h-7 text-xs gap-1"
            title={showSensitive ? 'Hide sensitive data' : 'Show sensitive data'}
          >
            {showSensitive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createSnapshot()}
            className="h-7 text-xs gap-1"
            title="Create snapshot"
          >
            <Save className="h-3 w-3" />
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
        {/* Time Travel Controls */}
        {snapshots.length > 0 && (
          <div className="p-3 bg-muted/50 border-b space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">Time Travel</span>
                {currentSnapshotIndex >= 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {snapshots[currentSnapshotIndex].label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToSnapshot(currentSnapshotIndex - 1)}
                  disabled={currentSnapshotIndex <= 0}
                  className="h-7 w-7 p-0"
                  title="Previous snapshot"
                >
                  <SkipBack className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentSnapshotIndex(-1)}
                  disabled={currentSnapshotIndex === -1}
                  className="h-7 text-xs"
                  title="Back to live"
                >
                  <RefreshCw className="h-3 w-3" />
                  Live
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToSnapshot(currentSnapshotIndex + 1)}
                  disabled={currentSnapshotIndex >= snapshots.length - 1}
                  className="h-7 w-7 p-0"
                  title="Next snapshot"
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportSnapshots}
                  className="h-7 w-7 p-0"
                  title="Export snapshots"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSnapshots}
                  className="h-7 w-7 p-0"
                  title="Clear snapshots"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentSnapshotIndex >= 0 
                ? `Viewing snapshot ${currentSnapshotIndex + 1} of ${snapshots.length} (${new Date(snapshots[currentSnapshotIndex].timestamp).toLocaleTimeString()})`
                : `${snapshots.length} snapshot${snapshots.length === 1 ? '' : 's'} saved`
              }
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search state keys and values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="contexts" className="w-full">
          <TabsList className="w-full rounded-none border-b h-9">
            <TabsTrigger value="contexts" className="text-xs">
              Contexts
              <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                {Object.keys(currentState.contexts || {}).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="queries" className="text-xs">
              React Query
              <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                {(currentState.queryCache || []).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="snapshots" className="text-xs">
              Snapshots
              <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                {snapshots.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contexts" className="m-0">
            <ScrollArea className="h-[430px]">
              <div className="p-4 space-y-3">
                {Object.entries(currentState.contexts || {})
                  .filter(([key, value]) => matchesSearch(value, searchTerm))
                  .map(([contextName, contextValue]) => (
                    <Card key={contextName} className="p-3">
                      <div className="font-mono text-sm font-medium mb-2 text-primary">
                        {contextName}
                      </div>
                      <div className="font-mono text-xs space-y-1">
                        {renderValue(contextValue, contextName)}
                      </div>
                    </Card>
                  ))}
                {Object.keys(currentState.contexts || {}).length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No context values available
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="queries" className="m-0">
            <ScrollArea className="h-[430px]">
              <div className="p-4 space-y-3">
                {(currentState.queryCache || [])
                  .filter((query: QueryCacheEntry) => matchesSearch(query, searchTerm))
                  .map((query: QueryCacheEntry, idx: number) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-xs text-primary flex-1 min-w-0">
                          {JSON.stringify(query.queryKey)}
                        </div>
                        <Badge 
                          variant={
                            query.state === 'fresh' ? 'default' :
                            query.state === 'fetching' ? 'secondary' :
                            query.state === 'error' ? 'destructive' : 'outline'
                          }
                          className="ml-2 text-[10px]"
                        >
                          {query.state}
                        </Badge>
                      </div>
                      <div className="font-mono text-xs space-y-1">
                        <div className="text-muted-foreground text-[10px]">
                          Updated: {new Date(query.dataUpdatedAt).toLocaleTimeString()}
                        </div>
                        {renderValue(query.data, `query-${idx}`)}
                      </div>
                    </Card>
                  ))}
                {(currentState.queryCache || []).length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No React Query cache entries
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="snapshots" className="m-0">
            <ScrollArea className="h-[430px]">
              <div className="p-4 space-y-2">
                {snapshots.length === 0 ? (
                  <Card className="p-6 text-center">
                    <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm font-medium mb-1">No Snapshots Yet</div>
                    <div className="text-xs text-muted-foreground mb-4">
                      Create snapshots to enable time-travel debugging
                    </div>
                    <Button onClick={() => createSnapshot()} size="sm">
                      <Save className="h-3 w-3 mr-1" />
                      Create First Snapshot
                    </Button>
                  </Card>
                ) : (
                  snapshots.map((snapshot, idx) => (
                    <Card 
                      key={snapshot.id}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        currentSnapshotIndex === idx && "border-primary bg-primary/5"
                      )}
                      onClick={() => goToSnapshot(idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{snapshot.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(snapshot.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {currentSnapshotIndex === idx && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
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
};
