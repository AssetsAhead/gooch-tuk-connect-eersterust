export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  lastUpdated?: string;
}

export interface ExternalService {
  name: string;
  baseUrl: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

export class ExternalAPIService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static async callService<T>(
    service: ExternalService,
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      cacheTTL?: number; // seconds
      useCache?: boolean;
    } = {}
  ): Promise<APIResponse<T>> {
    const { method = 'GET', body, headers = {}, cacheTTL = 300, useCache = true } = options;
    const cacheKey = `${service.name}:${endpoint}:${JSON.stringify(body)}`;

    // Check cache first
    if (useCache && method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
        return {
          success: true,
          data: cached.data,
          cached: true,
          lastUpdated: new Date(cached.timestamp).toISOString()
        };
      }
    }

    try {
      const response = await fetch(`${service.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET requests
      if (useCache && method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });
      }

      return {
        success: true,
        data,
        cached: false,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`External API call failed for ${service.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}