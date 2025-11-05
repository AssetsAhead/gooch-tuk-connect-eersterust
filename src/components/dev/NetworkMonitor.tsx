import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  X, 
  Minimize2, 
  Maximize2,
  Search,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  Play,
  Clock,
  AlertCircle,
  CheckCircle,
  Database,
  Cloud,
  Globe
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface NetworkRequest {
  id: string;
  type: 'supabase' | 'edge-function' | 'rest-api';
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
  supabaseOperation?: string;
  tableName?: string;
  functionName?: string;
}

// Global request storage
const requestStore: NetworkRequest[] = [];
const requestListeners: Set<(requests: NetworkRequest[]) => void> = new Set();

const notifyListeners = () => {
  requestListeners.forEach(listener => listener([...requestStore]));
};

// Intercept Supabase requests
const interceptSupabase = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : resource.toString());
    const method = config?.method || 'GET';
    
    // Only track Supabase and API requests
    const isSupabase = url.includes('supabase.co');
    const isEdgeFunction = url.includes('/functions/v1/');
    const isRestAPI = url.startsWith('http') && !url.includes(window.location.hostname);
    
    if (!isSupabase && !isRestAPI) {
      return originalFetch(...args);
    }
    
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    const request: NetworkRequest = {
      id: requestId,
      type: isEdgeFunction ? 'edge-function' : isSupabase ? 'supabase' : 'rest-api',
      method,
      url,
      startTime,
      requestHeaders: config?.headers as Record<string, string>,
      requestBody: config?.body ? JSON.parse(config.body as string) : undefined,
    };
    
    // Extract Supabase operation details
    if (isSupabase) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      if (pathname.includes('/rest/v1/')) {
        request.supabaseOperation = 'query';
        const parts = pathname.split('/rest/v1/');
        if (parts[1]) {
          request.tableName = parts[1].split('?')[0];
        }
      } else if (pathname.includes('/auth/v1/')) {
        request.supabaseOperation = 'auth';
      } else if (pathname.includes('/storage/v1/')) {
        request.supabaseOperation = 'storage';
      }
    }
    
    // Extract edge function name
    if (isEdgeFunction) {
      const match = url.match(/\/functions\/v1\/([^?]+)/);
      if (match) {
        request.functionName = match[1];
      }
    }
    
    requestStore.push(request);
    notifyListeners();
    
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      
      request.endTime = endTime;
      request.duration = endTime - startTime;
      request.status = response.status;
      request.statusText = response.statusText;
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      try {
        const responseText = await clonedResponse.text();
        request.responseBody = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        request.responseBody = 'Unable to parse response';
      }
      
      // Extract response headers
      request.responseHeaders = {};
      response.headers.forEach((value, key) => {
        request.responseHeaders![key] = value;
      });
      
      notifyListeners();
      return response;
    } catch (error) {
      const endTime = performance.now();
      request.endTime = endTime;
      request.duration = endTime - startTime;
      request.error = error instanceof Error ? error.message : 'Unknown error';
      request.status = 0;
      notifyListeners();
      throw error;
    }
  };
};

// Initialize interceptor
if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  interceptSupabase();
}

export const NetworkMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [requests, setRequests] = React.useState<NetworkRequest[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRequest, setSelectedRequest] = React.useState<NetworkRequest | null>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Only run in development
  if (import.meta.env.MODE !== 'development') return null;

  React.useEffect(() => {
    const listener = (updatedRequests: NetworkRequest[]) => {
      setRequests(updatedRequests);
      if (autoScroll && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
    requestListeners.add(listener);
    listener([...requestStore]);
    
    return () => {
      requestListeners.delete(listener);
    };
  }, [autoScroll]);

  const clearRequests = () => {
    requestStore.length = 0;
    setRequests([]);
    setSelectedRequest(null);
  };

  const exportRequests = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-requests-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  const replayRequest = async (request: NetworkRequest) => {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.requestHeaders,
        body: request.requestBody ? JSON.stringify(request.requestBody) : undefined,
      });
      
      toast({
        title: "Request replayed",
        description: `Status: ${response.status} ${response.statusText}`,
      });
    } catch (error) {
      toast({
        title: "Replay failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const filteredRequests = React.useMemo(() => {
    return requests.filter(req => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        req.url.toLowerCase().includes(search) ||
        req.method.toLowerCase().includes(search) ||
        req.tableName?.toLowerCase().includes(search) ||
        req.functionName?.toLowerCase().includes(search) ||
        req.status?.toString().includes(search)
      );
    });
  }, [requests, searchTerm]);

  const supabaseRequests = filteredRequests.filter(r => r.type === 'supabase');
  const edgeFunctionRequests = filteredRequests.filter(r => r.type === 'edge-function');
  const restApiRequests = filteredRequests.filter(r => r.type === 'rest-api');

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-red-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-blue-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status?: number) => {
    if (!status) return 'destructive';
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400) return 'destructive';
    return 'secondary';
  };

  const renderRequestItem = (request: NetworkRequest) => (
    <Card
      key={request.id}
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-muted/50",
        selectedRequest?.id === request.id && "border-primary bg-primary/5"
      )}
      onClick={() => setSelectedRequest(request)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] h-4">
              {request.method}
            </Badge>
            {request.tableName && (
              <Badge variant="outline" className="text-[10px] h-4">
                {request.tableName}
              </Badge>
            )}
            {request.functionName && (
              <Badge variant="outline" className="text-[10px] h-4">
                {request.functionName}
              </Badge>
            )}
            {request.duration && (
              <Badge variant="secondary" className="text-[10px] h-4">
                {request.duration.toFixed(0)}ms
              </Badge>
            )}
          </div>
          <div className="font-mono text-xs truncate text-muted-foreground">
            {request.url}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {request.status ? (
            <Badge variant={getStatusBadge(request.status)} className="text-xs">
              {request.status}
            </Badge>
          ) : request.error ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );

  const renderRequestDetails = () => {
    if (!selectedRequest) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Select a request to view details
        </div>
      );
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Status and Timing */}
          <Card>
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Request Info</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replayRequest(selectedRequest)}
                    className="h-7 text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Replay
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className={cn("font-medium", getStatusColor(selectedRequest.status))}>
                    {selectedRequest.status || 'Failed'} {selectedRequest.statusText}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">
                    {selectedRequest.duration ? `${selectedRequest.duration.toFixed(2)}ms` : 'Pending...'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Method</div>
                  <div className="font-medium">{selectedRequest.method}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">{selectedRequest.type}</div>
                </div>
              </div>
              {selectedRequest.error && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive">
                  <div className="font-medium mb-1">Error</div>
                  <div className="font-mono text-[10px]">{selectedRequest.error}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* URL */}
          <Card>
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">URL</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedRequest.url)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                {selectedRequest.url}
              </div>
            </CardContent>
          </Card>

          {/* Request Headers */}
          {selectedRequest.requestHeaders && Object.keys(selectedRequest.requestHeaders).length > 0 && (
            <Card>
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Request Headers</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedRequest.requestHeaders, null, 2))}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Request Body */}
          {selectedRequest.requestBody && (
            <Card>
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Request Body</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedRequest.requestBody, null, 2))}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-40">
                  {JSON.stringify(selectedRequest.requestBody, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Response Headers */}
          {selectedRequest.responseHeaders && Object.keys(selectedRequest.responseHeaders).length > 0 && (
            <Card>
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Response Headers</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(selectedRequest.responseHeaders, null, 2))}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(selectedRequest.responseHeaders, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Response Body */}
          {selectedRequest.responseBody && (
            <Card>
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Response Body</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(
                      typeof selectedRequest.responseBody === 'string' 
                        ? selectedRequest.responseBody 
                        : JSON.stringify(selectedRequest.responseBody, null, 2)
                    )}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-60">
                  {typeof selectedRequest.responseBody === 'string'
                    ? selectedRequest.responseBody
                    : JSON.stringify(selectedRequest.responseBody, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    );
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-52 right-4 z-[9998] rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <Network className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 z-[9998] w-64">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <CardTitle className="text-sm">Network Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {requests.length}
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
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Supabase</div>
              <div className="font-bold">{supabaseRequests.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Edge Fn</div>
              <div className="font-bold">{edgeFunctionRequests.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">REST</div>
              <div className="font-bold">{restApiRequests.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9998] w-[900px] h-[650px] shadow-2xl flex flex-col">
      <CardHeader className="p-4 flex-shrink-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">Network Monitor</CardTitle>
            <CardDescription className="text-xs">
              Track Supabase queries, edge functions & API calls
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportRequests}
            className="h-7 w-7 p-0"
            title="Export requests"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRequests}
            className="h-7 w-7 p-0"
            title="Clear requests"
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
            placeholder="Search URL, method, table, function..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Request List */}
        <div className="w-[400px] border-r flex flex-col">
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b h-9 flex-shrink-0">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                  {filteredRequests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="supabase" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                {supabaseRequests.length}
              </TabsTrigger>
              <TabsTrigger value="edge" className="text-xs">
                <Cloud className="h-3 w-3 mr-1" />
                {edgeFunctionRequests.length}
              </TabsTrigger>
              <TabsTrigger value="rest" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                {restApiRequests.length}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0 flex-1 min-h-0">
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="p-2 space-y-2">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No requests recorded yet
                    </div>
                  ) : (
                    filteredRequests.map(renderRequestItem)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="supabase" className="m-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {supabaseRequests.map(renderRequestItem)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="edge" className="m-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {edgeFunctionRequests.map(renderRequestItem)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rest" className="m-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {restApiRequests.map(renderRequestItem)}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Request Details */}
        <div className="flex-1 min-w-0">
          {renderRequestDetails()}
        </div>
      </div>
    </Card>
  );
};
