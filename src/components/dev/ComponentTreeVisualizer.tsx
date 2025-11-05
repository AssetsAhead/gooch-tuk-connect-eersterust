import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  GitBranch, 
  X, 
  Minimize2, 
  Maximize2,
  Search,
  RefreshCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Circle,
  Square,
  Triangle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ComponentNode {
  id: string;
  name: string;
  type: 'component' | 'context-provider' | 'context-consumer' | 'hook';
  depth: number;
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  children: ComponentNode[];
  props?: Record<string, any>;
  contexts?: string[];
  hooks?: string[];
  parent?: ComponentNode;
  isExpanded?: boolean;
  recentlyRerendered?: boolean;
}

interface RerenderEvent {
  componentId: string;
  componentName: string;
  timestamp: number;
  reason?: string;
  duration: number;
}

// Global component tracking
const componentRegistry = new Map<string, ComponentNode>();
const rerenderEvents: RerenderEvent[] = [];
const treeListeners: Set<(nodes: ComponentNode[]) => void> = new Set();

const notifyTreeListeners = () => {
  const rootNodes = Array.from(componentRegistry.values()).filter(node => node.depth === 0);
  treeListeners.forEach(listener => listener(rootNodes));
};

// Track component renders
export const trackComponentRender = (
  componentName: string,
  depth: number,
  duration: number,
  props?: Record<string, any>
) => {
  const id = `${componentName}-${depth}`;
  const existing = componentRegistry.get(id);

  if (existing) {
    existing.renderCount++;
    existing.lastRenderTime = duration;
    existing.avgRenderTime = (existing.avgRenderTime * (existing.renderCount - 1) + duration) / existing.renderCount;
    existing.recentlyRerendered = true;
    existing.props = props;

    // Record rerender event
    rerenderEvents.push({
      componentId: id,
      componentName,
      timestamp: Date.now(),
      duration
    });

    // Clear recently rerendered flag after animation
    setTimeout(() => {
      existing.recentlyRerendered = false;
      notifyTreeListeners();
    }, 1000);
  } else {
    const node: ComponentNode = {
      id,
      name: componentName,
      type: 'component',
      depth,
      renderCount: 1,
      lastRenderTime: duration,
      avgRenderTime: duration,
      children: [],
      props,
      isExpanded: depth < 2 // Auto-expand first 2 levels
    };
    componentRegistry.set(id, node);
  }

  notifyTreeListeners();
};

export const ComponentTreeVisualizer: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [rootNodes, setRootNodes] = React.useState<ComponentNode[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedNode, setSelectedNode] = React.useState<ComponentNode | null>(null);
  const [recentRerenders, setRecentRerenders] = React.useState<RerenderEvent[]>([]);
  const [showOnlyProblematic, setShowOnlyProblematic] = React.useState(false);
  const { user } = useAuth();

  // Only run in development
  if (import.meta.env.MODE !== 'development') return null;

  React.useEffect(() => {
    const listener = (nodes: ComponentNode[]) => {
      setRootNodes(nodes);
    };

    treeListeners.add(listener);
    
    // Build initial tree from known components
    buildComponentTree();
    
    return () => {
      treeListeners.delete(listener);
    };
  }, []);

  React.useEffect(() => {
    // Update recent rerenders
    const interval = setInterval(() => {
      const recent = rerenderEvents.filter(e => Date.now() - e.timestamp < 5000);
      setRecentRerenders(recent);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const buildComponentTree = () => {
    // Build tree based on known app structure
    const tree: ComponentNode[] = [
      {
        id: 'App',
        name: 'App',
        type: 'component',
        depth: 0,
        renderCount: 1,
        lastRenderTime: 0,
        avgRenderTime: 0,
        isExpanded: true,
        children: [
          {
            id: 'QueryClientProvider',
            name: 'QueryClientProvider',
            type: 'context-provider',
            depth: 1,
            renderCount: 1,
            lastRenderTime: 0,
            avgRenderTime: 0,
            contexts: ['ReactQuery'],
            isExpanded: true,
            children: [
              {
                id: 'AuthProvider',
                name: 'AuthProvider',
                type: 'context-provider',
                depth: 2,
                renderCount: user ? 2 : 1,
                lastRenderTime: 0,
                avgRenderTime: 0,
                contexts: ['Auth'],
                isExpanded: true,
                children: [
                  {
                    id: 'AnalyticsProvider',
                    name: 'AnalyticsProvider',
                    type: 'context-provider',
                    depth: 3,
                    renderCount: 1,
                    lastRenderTime: 0,
                    avgRenderTime: 0,
                    contexts: ['Analytics'],
                    isExpanded: true,
                    children: [
                      {
                        id: 'BrowserRouter',
                        name: 'BrowserRouter',
                        type: 'component',
                        depth: 4,
                        renderCount: 1,
                        lastRenderTime: 0,
                        avgRenderTime: 0,
                        isExpanded: true,
                        children: [
                          {
                            id: 'EnhancedSecurityProvider',
                            name: 'EnhancedSecurityProvider',
                            type: 'context-provider',
                            depth: 5,
                            renderCount: user ? 2 : 1,
                            lastRenderTime: 0,
                            avgRenderTime: 0,
                            contexts: ['Security'],
                            isExpanded: false,
                            children: [
                              {
                                id: 'Routes',
                                name: 'Routes',
                                type: 'component',
                                depth: 6,
                                renderCount: 1,
                                lastRenderTime: 0,
                                avgRenderTime: 0,
                                isExpanded: false,
                                children: []
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    setRootNodes(tree);
  };

  const clearTree = () => {
    componentRegistry.clear();
    rerenderEvents.length = 0;
    setRootNodes([]);
    setSelectedNode(null);
    buildComponentTree();
  };

  const toggleExpanded = (node: ComponentNode) => {
    node.isExpanded = !node.isExpanded;
    notifyTreeListeners();
    setRootNodes([...rootNodes]);
  };

  const matchesSearch = (node: ComponentNode, term: string): boolean => {
    if (!term) return true;
    const search = term.toLowerCase();
    return node.name.toLowerCase().includes(search) ||
           node.type.toLowerCase().includes(search) ||
           node.contexts?.some(c => c.toLowerCase().includes(search)) ||
           node.hooks?.some(h => h.toLowerCase().includes(search));
  };

  const isProblematic = (node: ComponentNode): boolean => {
    return node.renderCount > 10 || node.avgRenderTime > 16;
  };

  const shouldShowNode = (node: ComponentNode): boolean => {
    if (!matchesSearch(node, searchTerm)) return false;
    if (showOnlyProblematic && !isProblematic(node)) return false;
    return true;
  };

  const getNodeIcon = (node: ComponentNode) => {
    switch (node.type) {
      case 'context-provider':
        return <Circle className="h-3 w-3 text-blue-500" />;
      case 'context-consumer':
        return <Square className="h-3 w-3 text-green-500" />;
      case 'hook':
        return <Triangle className="h-3 w-3 text-purple-500" />;
      default:
        return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getNodeColor = (node: ComponentNode) => {
    if (node.recentlyRerendered) return 'text-orange-500 animate-pulse';
    if (isProblematic(node)) return 'text-red-500';
    if (node.type === 'context-provider') return 'text-blue-500';
    return 'text-foreground';
  };

  const renderTreeNode = (node: ComponentNode, level: number = 0): React.ReactNode => {
    if (!shouldShowNode(node)) return null;

    const hasChildren = node.children && node.children.length > 0;
    const isProblematicNode = isProblematic(node);

    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors",
            selectedNode?.id === node.id && "bg-primary/10 border-l-2 border-primary"
          )}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node);
              }}
              className="hover:bg-muted rounded p-0.5"
            >
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          {getNodeIcon(node)}
          
          <span className={cn("text-sm font-mono flex-1", getNodeColor(node))}>
            {node.name}
          </span>

          <div className="flex items-center gap-1">
            {node.renderCount > 1 && (
              <Badge variant="outline" className="text-[10px] h-4">
                {node.renderCount}
              </Badge>
            )}
            {isProblematicNode && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            {node.contexts && node.contexts.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4">
                {node.contexts.length} ctx
              </Badge>
            )}
          </div>
        </div>

        {node.isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Select a component to view details
        </div>
      );
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Component Info */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getNodeIcon(selectedNode)}
                {selectedNode.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedNode.type.replace('-', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-muted-foreground">Render Count</div>
                  <div className={cn(
                    "font-bold",
                    selectedNode.renderCount > 10 && "text-red-500"
                  )}>
                    {selectedNode.renderCount}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Avg Render Time</div>
                  <div className={cn(
                    "font-bold",
                    selectedNode.avgRenderTime > 16 && "text-red-500"
                  )}>
                    {selectedNode.avgRenderTime.toFixed(2)}ms
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last Render</div>
                  <div className="font-bold">
                    {selectedNode.lastRenderTime.toFixed(2)}ms
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Depth</div>
                  <div className="font-bold">{selectedNode.depth}</div>
                </div>
              </div>

              {isProblematic(selectedNode) && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium text-xs">Performance Issue Detected</span>
                  </div>
                  <div className="text-[10px]">
                    {selectedNode.renderCount > 10 && (
                      <div>• Too many renders ({selectedNode.renderCount})</div>
                    )}
                    {selectedNode.avgRenderTime > 16 && (
                      <div>• Slow render time ({selectedNode.avgRenderTime.toFixed(2)}ms)</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contexts */}
          {selectedNode.contexts && selectedNode.contexts.length > 0 && (
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Context Providers</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1">
                  {selectedNode.contexts.map(ctx => (
                    <div key={ctx} className="flex items-center gap-2 text-xs">
                      <Circle className="h-2 w-2 text-blue-500" />
                      <span className="font-mono">{ctx}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hooks */}
          {selectedNode.hooks && selectedNode.hooks.length > 0 && (
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Hooks Used</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1">
                  {selectedNode.hooks.map(hook => (
                    <div key={hook} className="flex items-center gap-2 text-xs">
                      <Triangle className="h-2 w-2 text-purple-500" />
                      <span className="font-mono">{hook}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Props */}
          {selectedNode.props && Object.keys(selectedNode.props).length > 0 && (
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Props</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(selectedNode.props, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Optimization Tips */}
          <Card className="bg-muted/50">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 text-xs">
              <div>• Use React.memo() to prevent unnecessary re-renders</div>
              <div>• Wrap callbacks with useCallback()</div>
              <div>• Memoize expensive computations with useMemo()</div>
              <div>• Split large components into smaller ones</div>
              <div>• Use Context selectively to avoid prop drilling</div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-[368px] right-4 z-[9998] rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <GitBranch className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 z-[9998] w-64">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <CardTitle className="text-sm">Component Tree</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {recentRerenders.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {recentRerenders.length}
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
          <div className="text-xs text-muted-foreground">
            {recentRerenders.length > 0 
              ? `${recentRerenders.length} recent re-renders` 
              : 'No recent activity'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9998] w-[900px] h-[650px] shadow-2xl flex flex-col">
      <CardHeader className="p-4 flex-shrink-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">Component Tree Visualizer</CardTitle>
            <CardDescription className="text-xs">
              React component hierarchy with re-render tracking
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={showOnlyProblematic ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowOnlyProblematic(!showOnlyProblematic)}
            className="h-7 text-xs"
            title="Show only problematic components"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Issues
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTree}
            className="h-7 w-7 p-0"
            title="Reset tree"
          >
            <Trash2 className="h-3 w-3" />
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

      {/* Search */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components, contexts, hooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Recent Re-renders Banner */}
      {recentRerenders.length > 0 && (
        <div className="px-3 py-2 bg-orange-500/10 border-b flex items-center justify-between">
          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            {recentRerenders.length} component{recentRerenders.length !== 1 ? 's' : ''} re-rendered in last 5s
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Component Tree */}
        <div className="w-[450px] border-r flex flex-col">
          <div className="p-2 border-b flex items-center justify-between bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">Component Hierarchy</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] h-4">
                <Circle className="h-2 w-2 mr-1 text-blue-500" />
                Provider
              </Badge>
              <Badge variant="outline" className="text-[10px] h-4">
                <Circle className="h-2 w-2 mr-1 text-muted-foreground" />
                Component
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {rootNodes.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No component tree data available
                </div>
              ) : (
                rootNodes.map(node => renderTreeNode(node, 0))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Component Details */}
        <div className="flex-1 min-w-0">
          {renderNodeDetails()}
        </div>
      </div>
    </Card>
  );
};
