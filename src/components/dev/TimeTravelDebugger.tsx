import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  Bug,
  Database,
  Globe,
  HardDrive,
  GitBranch,
  Activity,
  Filter,
  Search
} from 'lucide-react';

interface Action {
  id: string;
  type: string;
  timestamp: number;
  category: 'state' | 'localStorage' | 'url' | 'query' | 'context';
  payload: any;
  previousState?: any;
  nextState?: any;
  metadata?: {
    component?: string;
    duration?: number;
    affectedKeys?: string[];
  };
}

interface TimelineState {
  actions: Action[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

export const TimeTravelDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeline, setTimeline] = useState<TimelineState>({
    actions: [],
    currentIndex: -1,
    isPlaying: false,
    playbackSpeed: 1
  });
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  
  const queryClient = useQueryClient();
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const previousLocationRef = useRef(location.pathname);
  const previousLocalStorageRef = useRef<Record<string, string>>({});
  const previousQueryCacheRef = useRef<any>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize localStorage snapshot
  useEffect(() => {
    const snapshot: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        snapshot[key] = localStorage.getItem(key) || '';
      }
    }
    previousLocalStorageRef.current = snapshot;
  }, []);

  // Track URL navigation
  useEffect(() => {
    if (previousLocationRef.current !== location.pathname) {
      const action: Action = {
        id: `url-${Date.now()}`,
        type: 'NAVIGATE',
        timestamp: Date.now(),
        category: 'url',
        payload: {
          from: previousLocationRef.current,
          to: location.pathname,
          search: location.search,
          hash: location.hash
        },
        previousState: previousLocationRef.current,
        nextState: location.pathname
      };
      
      addAction(action);
      previousLocationRef.current = location.pathname;
    }
  }, [location]);

  // Track localStorage changes
  useEffect(() => {
    const checkLocalStorage = () => {
      const currentSnapshot: Record<string, string> = {};
      const changes: Record<string, { old: string | null; new: string | null }> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          currentSnapshot[key] = localStorage.getItem(key) || '';
          if (previousLocalStorageRef.current[key] !== currentSnapshot[key]) {
            changes[key] = {
              old: previousLocalStorageRef.current[key] || null,
              new: currentSnapshot[key]
            };
          }
        }
      }
      
      // Check for removed keys
      Object.keys(previousLocalStorageRef.current).forEach(key => {
        if (!currentSnapshot[key]) {
          changes[key] = {
            old: previousLocalStorageRef.current[key],
            new: null
          };
        }
      });
      
      if (Object.keys(changes).length > 0) {
        const action: Action = {
          id: `storage-${Date.now()}`,
          type: 'LOCALSTORAGE_CHANGE',
          timestamp: Date.now(),
          category: 'localStorage',
          payload: changes,
          previousState: previousLocalStorageRef.current,
          nextState: currentSnapshot,
          metadata: {
            affectedKeys: Object.keys(changes)
          }
        };
        
        addAction(action);
        previousLocalStorageRef.current = currentSnapshot;
      }
    };
    
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track React Query cache changes
  useEffect(() => {
    const checkQueryCache = () => {
      const cache = queryClient.getQueryCache().getAll();
      const cacheSnapshot = cache.map(query => ({
        key: JSON.stringify(query.queryKey),
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt
      }));
      
      if (JSON.stringify(previousQueryCacheRef.current) !== JSON.stringify(cacheSnapshot)) {
        const action: Action = {
          id: `query-${Date.now()}`,
          type: 'QUERY_CACHE_UPDATE',
          timestamp: Date.now(),
          category: 'query',
          payload: cacheSnapshot,
          previousState: previousQueryCacheRef.current,
          nextState: cacheSnapshot
        };
        
        addAction(action);
        previousQueryCacheRef.current = cacheSnapshot;
      }
    };
    
    const interval = setInterval(checkQueryCache, 2000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const addAction = useCallback((action: Action) => {
    setTimeline(prev => {
      const newActions = [...prev.actions.slice(0, prev.currentIndex + 1), action];
      return {
        ...prev,
        actions: newActions,
        currentIndex: newActions.length - 1
      };
    });
  }, []);

  const goToAction = useCallback((index: number) => {
    if (index < 0 || index >= timeline.actions.length) return;
    
    const action = timeline.actions[index];
    
    // Restore state based on action type
    try {
      switch (action.category) {
        case 'url':
          if (action.nextState) {
            navigate(action.nextState);
          }
          break;
        case 'localStorage':
          if (action.nextState) {
            Object.entries(action.nextState).forEach(([key, value]) => {
              localStorage.setItem(key, value as string);
            });
          }
          break;
        case 'query':
          // Query cache restoration would require more complex logic
          console.log('Query cache restoration', action);
          break;
      }
      
      setTimeline(prev => ({ ...prev, currentIndex: index }));
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
  }, [timeline.actions, navigate]);

  const stepBackward = useCallback(() => {
    if (timeline.currentIndex > 0) {
      goToAction(timeline.currentIndex - 1);
    }
  }, [timeline.currentIndex, goToAction]);

  const stepForward = useCallback(() => {
    if (timeline.currentIndex < timeline.actions.length - 1) {
      goToAction(timeline.currentIndex + 1);
    }
  }, [timeline.currentIndex, timeline.actions.length, goToAction]);

  const togglePlayback = useCallback(() => {
    setTimeline(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  useEffect(() => {
    if (timeline.isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        if (timeline.currentIndex < timeline.actions.length - 1) {
          stepForward();
        } else {
          setTimeline(prev => ({ ...prev, isPlaying: false }));
        }
      }, 1000 / timeline.playbackSpeed);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }
    
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [timeline.isPlaying, timeline.currentIndex, timeline.actions.length, timeline.playbackSpeed, stepForward]);

  const resetTimeline = useCallback(() => {
    setTimeline({
      actions: [],
      currentIndex: -1,
      isPlaying: false,
      playbackSpeed: 1
    });
    setSelectedAction(null);
  }, []);

  const exportTimeline = useCallback(() => {
    const data = JSON.stringify(timeline.actions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [timeline.actions]);

  const importTimeline = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const actions = JSON.parse(e.target?.result as string);
        setTimeline(prev => ({
          ...prev,
          actions,
          currentIndex: actions.length - 1
        }));
      } catch (error) {
        console.error('Failed to import timeline:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  const getCategoryIcon = (category: Action['category']) => {
    switch (category) {
      case 'state': return <Database className="h-3 w-3" />;
      case 'localStorage': return <HardDrive className="h-3 w-3" />;
      case 'url': return <Globe className="h-3 w-3" />;
      case 'query': return <Activity className="h-3 w-3" />;
      case 'context': return <GitBranch className="h-3 w-3" />;
      default: return <Bug className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: Action['category']) => {
    switch (category) {
      case 'state': return 'bg-blue-500';
      case 'localStorage': return 'bg-purple-500';
      case 'url': return 'bg-green-500';
      case 'query': return 'bg-orange-500';
      case 'context': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredActions = timeline.actions.filter(action => {
    if (filter !== 'all' && action.category !== filter) return false;
    if (searchTerm && !action.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-[9999] rounded-full shadow-lg"
        size="icon"
        variant="secondary"
      >
        <Clock className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 left-4 z-[9999] p-4 shadow-xl bg-background/95 backdrop-blur border-2">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Time Travel</span>
            <span className="text-xs text-muted-foreground">
              {timeline.actions.length} actions tracked
            </span>
          </div>
          <div className="flex gap-1 ml-4">
            <Button size="icon" variant="ghost" onClick={stepBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={togglePlayback}>
              {timeline.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={stepForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed top-20 left-4 z-[9999] w-[800px] h-[600px] shadow-xl bg-background/95 backdrop-blur border-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Time Travel Debugger</h3>
            <p className="text-xs text-muted-foreground">
              {timeline.actions.length} actions • Index: {timeline.currentIndex + 1}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={exportTimeline}>
            <Download className="h-4 w-4" />
          </Button>
          <label>
            <Button size="icon" variant="ghost" asChild>
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
            <input
              type="file"
              accept="application/json"
              onChange={importTimeline}
              className="hidden"
            />
          </label>
          <Button size="icon" variant="ghost" onClick={resetTimeline}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Button size="sm" variant="outline" onClick={stepBackward} disabled={timeline.currentIndex <= 0}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={togglePlayback}>
          {timeline.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={stepForward} disabled={timeline.currentIndex >= timeline.actions.length - 1}>
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToAction(timeline.actions.length - 1)}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Live
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <select
          value={timeline.playbackSpeed}
          onChange={(e) => setTimeline(prev => ({ ...prev, playbackSpeed: Number(e.target.value) }))}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'state' ? 'default' : 'outline'}
            onClick={() => setFilter('state')}
          >
            <Database className="h-3 w-3 mr-1" />
            State
          </Button>
          <Button
            size="sm"
            variant={filter === 'localStorage' ? 'default' : 'outline'}
            onClick={() => setFilter('localStorage')}
          >
            <HardDrive className="h-3 w-3 mr-1" />
            Storage
          </Button>
          <Button
            size="sm"
            variant={filter === 'url' ? 'default' : 'outline'}
            onClick={() => setFilter('url')}
          >
            <Globe className="h-3 w-3 mr-1" />
            URL
          </Button>
          <Button
            size="sm"
            variant={filter === 'query' ? 'default' : 'outline'}
            onClick={() => setFilter('query')}
          >
            <Activity className="h-3 w-3 mr-1" />
            Query
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-2 ml-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          {/* Action List */}
          <ScrollArea className="border-r">
            <div className="p-2 space-y-1">
              {filteredActions.map((action, index) => {
                const actualIndex = timeline.actions.indexOf(action);
                const isActive = actualIndex === timeline.currentIndex;
                
                return (
                  <div
                    key={action.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-primary/20 border-2 border-primary'
                        : selectedAction?.id === action.id
                        ? 'bg-accent'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => {
                      setSelectedAction(action);
                      goToAction(actualIndex);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`p-1 rounded ${getCategoryColor(action.category)} text-white`}>
                          {getCategoryIcon(action.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm font-semibold truncate">
                            {action.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {actualIndex + 1}
                      </Badge>
                    </div>
                    {action.metadata?.affectedKeys && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {action.metadata.affectedKeys.slice(0, 3).map(key => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}
                          </Badge>
                        ))}
                        {action.metadata.affectedKeys.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{action.metadata.affectedKeys.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Action Details */}
          <ScrollArea>
            {selectedAction ? (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      {getCategoryIcon(selectedAction.category)}
                      {selectedAction.type}
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Time: {new Date(selectedAction.timestamp).toLocaleString()}</div>
                      <div>Category: {selectedAction.category}</div>
                      {selectedAction.metadata?.component && (
                        <div>Component: {selectedAction.metadata.component}</div>
                      )}
                      {selectedAction.metadata?.duration && (
                        <div>Duration: {selectedAction.metadata.duration}ms</div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h5 className="font-semibold mb-2 text-sm">Payload</h5>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedAction.payload, null, 2)}
                    </pre>
                  </div>

                  {selectedAction.previousState && (
                    <>
                      <Separator />
                      <div>
                        <h5 className="font-semibold mb-2 text-sm">Previous State</h5>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedAction.previousState, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}

                  {selectedAction.nextState && (
                    <>
                      <Separator />
                      <div>
                        <h5 className="font-semibold mb-2 text-sm">Next State</h5>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedAction.nextState, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToAction(timeline.actions.indexOf(selectedAction))}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Jump to This State
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedAction, null, 2));
                      }}
                    >
                      Copy Action
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Select an action to view details
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};
