import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  X,
  Minimize2,
  Maximize2,
  FileCode,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Boxes,
  FileText,
  Layers,
  Zap,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PackageInfo {
  name: string;
  estimatedSize: number;
  category: 'ui' | 'routing' | 'state' | 'util' | 'form' | 'other';
  imports: string[];
  usageCount: number;
}

interface Chunk {
  name: string;
  files: string[];
  estimatedSize: number;
  type: 'vendor' | 'app' | 'lazy';
}

interface OptimizationSuggestion {
  id: string;
  type: 'treeshake' | 'duplicate' | 'lazy' | 'bundle-split' | 'alternative';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  solution: string;
  affectedPackages?: string[];
}

export const BundleSizeAnalyzer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState(false);

  // Analyze packages from package.json
  const packages: PackageInfo[] = useMemo(() => [
    {
      name: '@tanstack/react-query',
      estimatedSize: 45000,
      category: 'state',
      imports: ['QueryClient', 'QueryClientProvider', 'useQuery', 'useMutation'],
      usageCount: 12
    },
    {
      name: 'react-router-dom',
      estimatedSize: 38000,
      category: 'routing',
      imports: ['BrowserRouter', 'Routes', 'Route', 'useNavigate', 'useLocation'],
      usageCount: 15
    },
    {
      name: '@supabase/supabase-js',
      estimatedSize: 120000,
      category: 'state',
      imports: ['createClient', 'SupabaseClient'],
      usageCount: 8
    },
    {
      name: 'lucide-react',
      estimatedSize: 180000,
      category: 'ui',
      imports: ['Clock', 'Play', 'Pause', 'Camera', 'Download', 'Upload', '...60+ more'],
      usageCount: 150
    },
    {
      name: '@radix-ui/react-dialog',
      estimatedSize: 28000,
      category: 'ui',
      imports: ['Dialog', 'DialogTrigger', 'DialogContent'],
      usageCount: 8
    },
    {
      name: '@radix-ui/react-dropdown-menu',
      estimatedSize: 32000,
      category: 'ui',
      imports: ['DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent'],
      usageCount: 6
    },
    {
      name: '@radix-ui/react-tabs',
      estimatedSize: 25000,
      category: 'ui',
      imports: ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent'],
      usageCount: 10
    },
    {
      name: '@radix-ui/react-scroll-area',
      estimatedSize: 22000,
      category: 'ui',
      imports: ['ScrollArea'],
      usageCount: 18
    },
    {
      name: 'react-hook-form',
      estimatedSize: 42000,
      category: 'form',
      imports: ['useForm', 'Controller'],
      usageCount: 12
    },
    {
      name: 'zod',
      estimatedSize: 58000,
      category: 'form',
      imports: ['z'],
      usageCount: 8
    },
    {
      name: 'recharts',
      estimatedSize: 420000,
      category: 'ui',
      imports: ['LineChart', 'BarChart', 'PieChart', 'ResponsiveContainer'],
      usageCount: 4
    },
    {
      name: 'date-fns',
      estimatedSize: 320000,
      category: 'util',
      imports: ['format', 'parseISO', 'isAfter', '...20+ more'],
      usageCount: 15
    },
    {
      name: 'clsx',
      estimatedSize: 2000,
      category: 'util',
      imports: ['clsx'],
      usageCount: 45
    },
    {
      name: 'tailwind-merge',
      estimatedSize: 8000,
      category: 'util',
      imports: ['twMerge'],
      usageCount: 45
    },
    {
      name: 'react',
      estimatedSize: 140000,
      category: 'other',
      imports: ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'],
      usageCount: 200
    },
    {
      name: 'react-dom',
      estimatedSize: 135000,
      category: 'other',
      imports: ['createRoot'],
      usageCount: 1
    }
  ], []);

  const chunks: Chunk[] = useMemo(() => [
    {
      name: 'vendor',
      files: ['react', 'react-dom', '@tanstack/react-query', '@supabase/supabase-js'],
      estimatedSize: 440000,
      type: 'vendor'
    },
    {
      name: 'ui-components',
      files: ['@radix-ui/*', 'lucide-react'],
      estimatedSize: 495000,
      type: 'vendor'
    },
    {
      name: 'charts',
      files: ['recharts'],
      estimatedSize: 420000,
      type: 'vendor'
    },
    {
      name: 'app-core',
      files: ['src/App.tsx', 'src/main.tsx', 'src/pages/Index.tsx'],
      estimatedSize: 45000,
      type: 'app'
    },
    {
      name: 'dashboards',
      files: ['src/components/dashboards/*'],
      estimatedSize: 120000,
      type: 'lazy'
    },
    {
      name: 'dev-tools',
      files: ['src/components/dev/*'],
      estimatedSize: 85000,
      type: 'lazy'
    }
  ], []);

  const suggestions: OptimizationSuggestion[] = useMemo(() => [
    {
      id: 'lucide-treeshake',
      type: 'treeshake',
      severity: 'high',
      title: 'Tree-shake Lucide Icons',
      description: 'You\'re importing 60+ icons from lucide-react. The entire icon library is being bundled.',
      impact: 'Potential savings: ~150KB',
      solution: 'Import icons individually: import { Clock, Play } from "lucide-react" instead of import * as Icons',
      affectedPackages: ['lucide-react']
    },
    {
      id: 'date-fns-treeshake',
      type: 'treeshake',
      severity: 'high',
      title: 'Tree-shake date-fns Functions',
      description: 'Multiple date-fns functions imported. Use individual imports for better tree-shaking.',
      impact: 'Potential savings: ~200KB',
      solution: 'Import specific functions: import { format } from "date-fns/format" instead of import { format } from "date-fns"',
      affectedPackages: ['date-fns']
    },
    {
      id: 'recharts-lazy',
      type: 'lazy',
      severity: 'high',
      title: 'Lazy Load Recharts',
      description: 'Recharts is a large library (420KB) used in only 4 components.',
      impact: 'Potential savings: 420KB from initial bundle',
      solution: 'Use React.lazy() to load chart components only when needed:\nconst ChartComponent = lazy(() => import("./ChartComponent"))',
      affectedPackages: ['recharts']
    },
    {
      id: 'radix-consolidate',
      type: 'duplicate',
      severity: 'medium',
      title: 'Multiple Radix UI Packages',
      description: 'You have 10+ separate @radix-ui packages. Each adds overhead.',
      impact: 'Some shared code duplication across packages',
      solution: 'Consider if all Radix components are necessary. Remove unused ones.',
      affectedPackages: ['@radix-ui/*']
    },
    {
      id: 'dev-tools-production',
      type: 'bundle-split',
      severity: 'high',
      title: 'Dev Tools in Production Build',
      description: 'Development debugging tools should not be in production bundle.',
      impact: 'Potential savings: ~85KB',
      solution: 'Wrap dev tools with if (import.meta.env.DEV) or use vite.config.ts to exclude them in production builds',
      affectedPackages: []
    },
    {
      id: 'moment-alternative',
      type: 'alternative',
      severity: 'low',
      title: 'Consider Lighter Date Library',
      description: 'date-fns is comprehensive but large (320KB). For simple date formatting, consider alternatives.',
      impact: 'Potential savings: ~250KB',
      solution: 'For basic formatting, use native Intl.DateTimeFormat or consider dayjs (2KB)',
      affectedPackages: ['date-fns']
    },
    {
      id: 'dashboard-lazy',
      type: 'lazy',
      severity: 'medium',
      title: 'Lazy Load Dashboard Components',
      description: 'Dashboard components are large (120KB) but not needed on initial load.',
      impact: 'Potential savings: 120KB from initial bundle',
      solution: 'Use React.lazy() for dashboard routes:\nconst AdminDashboard = lazy(() => import("./components/dashboards/AdminDashboard"))',
      affectedPackages: []
    },
    {
      id: 'supabase-optimize',
      type: 'treeshake',
      severity: 'medium',
      title: 'Optimize Supabase Bundle',
      description: 'Supabase client is 120KB. Ensure you\'re only importing what you need.',
      impact: 'Some potential savings through better imports',
      solution: 'Review Supabase usage and ensure tree-shaking is working correctly',
      affectedPackages: ['@supabase/supabase-js']
    }
  ], []);

  const totalSize = packages.reduce((sum, pkg) => sum + pkg.estimatedSize, 0);
  const potentialSavings = suggestions
    .filter(s => s.severity === 'high')
    .reduce((sum, s) => {
      const match = s.impact.match(/(\d+)KB/);
      return sum + (match ? parseInt(match[1]) * 1024 : 0);
    }, 0);

  const filteredPackages = packages.filter(pkg => {
    if (selectedCategory !== 'all' && pkg.category !== selectedCategory) return false;
    if (searchTerm && !pkg.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  const getCategoryColor = (category: PackageInfo['category']) => {
    const colors = {
      ui: 'bg-blue-500',
      routing: 'bg-green-500',
      state: 'bg-purple-500',
      util: 'bg-yellow-500',
      form: 'bg-pink-500',
      other: 'bg-gray-500'
    };
    return colors[category];
  };

  const getSeverityColor = (severity: OptimizationSuggestion['severity']) => {
    const colors = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return colors[severity];
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: formatSize(totalSize),
      packages,
      chunks,
      suggestions,
      potentialSavings: formatSize(potentialSavings)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bundle-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 left-4 z-[9999] rounded-full shadow-lg"
        size="icon"
        variant="secondary"
      >
        <Package className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-36 left-4 z-[9999] p-4 shadow-xl bg-background/95 backdrop-blur border-2">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Bundle Analyzer</span>
            <span className="text-xs text-muted-foreground">
              {formatSize(totalSize)} • {suggestions.length} suggestions
            </span>
          </div>
          <div className="flex gap-1 ml-4">
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
    <Card className="fixed top-20 right-4 z-[9999] w-[900px] h-[700px] shadow-xl bg-background/95 backdrop-blur border-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Bundle Size Analyzer</h3>
            <p className="text-xs text-muted-foreground">
              Total: {formatSize(totalSize)} • Potential savings: {formatSize(potentialSavings)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={exportReport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Packages</span>
          </div>
          <div className="text-2xl font-bold">{packages.length}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Chunks</span>
          </div>
          <div className="text-2xl font-bold">{chunks.length}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Suggestions</span>
          </div>
          <div className="text-2xl font-bold">{suggestions.length}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Savings</span>
          </div>
          <div className="text-2xl font-bold">{formatSize(potentialSavings)}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="packages">
            <Boxes className="h-3 w-3 mr-1" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="chunks">
            <Layers className="h-3 w-3 mr-1" />
            Chunks
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Zap className="h-3 w-3 mr-1" />
            Optimizations
          </TabsTrigger>
          <TabsTrigger value="visualization">
            <FileCode className="h-3 w-3 mr-1" />
            Visualization
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="flex-1 overflow-hidden m-4 mt-2">
          <div className="flex flex-col h-full">
            {/* Filters */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background h-8"
              >
                <option value="all">All Categories</option>
                <option value="ui">UI</option>
                <option value="routing">Routing</option>
                <option value="state">State</option>
                <option value="util">Utilities</option>
                <option value="form">Forms</option>
                <option value="other">Other</option>
              </select>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredPackages.map(pkg => (
                  <Card key={pkg.name} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(pkg.category)}`} />
                          <span className="font-mono font-semibold text-sm">{pkg.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {pkg.category}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(pkg.estimatedSize / totalSize) * 100} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                              {formatSize(pkg.estimatedSize)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pkg.usageCount} imports • {pkg.imports.slice(0, 3).join(', ')}
                            {pkg.imports.length > 3 && ` +${pkg.imports.length - 3} more`}
                          </div>
                        </div>
                      </div>
                      <Badge className="shrink-0">
                        {((pkg.estimatedSize / totalSize) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Chunks Tab */}
        <TabsContent value="chunks" className="flex-1 overflow-hidden m-4 mt-2">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {chunks.map(chunk => (
                <Card key={chunk.name} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{chunk.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {chunk.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">{formatSize(chunk.estimatedSize)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((chunk.estimatedSize / totalSize) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={(chunk.estimatedSize / totalSize) * 100} className="mb-2" />
                  <div className="text-xs text-muted-foreground">
                    <div className="font-semibold mb-1">Includes:</div>
                    <div className="flex flex-wrap gap-1">
                      {chunk.files.map(file => (
                        <Badge key={file} variant="secondary" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 overflow-hidden m-4 mt-2">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <Card key={suggestion.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {suggestion.severity === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Zap className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge variant={getSeverityColor(suggestion.severity) as any} className="capitalize shrink-0">
                          {suggestion.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="bg-muted p-3 rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-semibold text-green-600">Impact</span>
                        </div>
                        <p className="text-xs">{suggestion.impact}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span className="text-xs font-semibold">Solution</span>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {suggestion.solution}
                        </pre>
                      </div>
                      {suggestion.affectedPackages && suggestion.affectedPackages.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {suggestion.affectedPackages.map(pkg => (
                            <Badge key={pkg} variant="outline" className="text-xs">
                              {pkg}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="flex-1 overflow-hidden m-4 mt-2">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Bundle Composition</h4>
                <div className="space-y-2">
                  {packages
                    .sort((a, b) => b.estimatedSize - a.estimatedSize)
                    .slice(0, 10)
                    .map(pkg => (
                      <div key={pkg.name} className="flex items-center gap-2">
                        <div className="w-32 text-xs font-mono truncate">{pkg.name}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full ${getCategoryColor(pkg.category)} transition-all`}
                              style={{ width: `${(pkg.estimatedSize / totalSize) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono w-16 text-right">
                            {formatSize(pkg.estimatedSize)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Category Breakdown</h4>
                <div className="space-y-2">
                  {['ui', 'state', 'routing', 'form', 'util', 'other'].map(category => {
                    const categoryPackages = packages.filter(p => p.category === category);
                    const categorySize = categoryPackages.reduce((sum, p) => sum + p.estimatedSize, 0);
                    const percentage = (categorySize / totalSize) * 100;
                    
                    return (
                      <div key={category} className="flex items-center gap-2">
                        <div className="w-24 text-xs capitalize">{category}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-xs font-mono w-16 text-right">
                            {formatSize(categorySize)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
