import { ExternalAPIService, ExternalService, APIResponse } from '../ExternalAPIService';

export interface SecurityIncident {
  id: string;
  type: 'burglary' | 'assault' | 'theft' | 'vandalism' | 'suspicious_activity';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
  description: string;
}

export interface PatrolRoute {
  id: string;
  area: string;
  lastPatrol: string;
  nextPatrol: string;
  frequency: 'hourly' | 'bi-hourly' | 'daily';
  status: 'active' | 'delayed' | 'completed';
}

export interface SecurityAlert {
  id: string;
  type: 'panic_button' | 'intrusion' | 'medical' | 'fire';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: string;
  userId: string;
  responseTime?: number; // seconds
  status: 'active' | 'responding' | 'resolved';
}

// Example security company services
const ADT_SERVICE: ExternalService = {
  name: 'ADT Security',
  baseUrl: 'https://api.adt.co.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 200, window: 3600 }
};

const FIDELITY_SERVICE: ExternalService = {
  name: 'Fidelity Services',
  baseUrl: 'https://api.fidelityservices.co.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 150, window: 3600 }
};

export class PrivateSecurityAPI {
  static async getIncidents(
    provider: string,
    area: string,
    timeframe: string = '24h'
  ): Promise<APIResponse<SecurityIncident[]>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Security provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService<SecurityIncident[]>(
      service,
      `/incidents?area=${area}&timeframe=${timeframe}`,
      { cacheTTL: 300 } // Cache for 5 minutes
    );
  }

  static async getPatrolStatus(
    provider: string,
    area: string
  ): Promise<APIResponse<PatrolRoute[]>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Security provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService<PatrolRoute[]>(
      service,
      `/patrols/status/${area}`,
      { cacheTTL: 180 } // Cache for 3 minutes
    );
  }

  static async reportIncident(
    provider: string,
    incident: Partial<SecurityIncident>
  ): Promise<APIResponse<{ incidentId: string; responseETA: string }>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Security provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService(
      service,
      `/incidents/report`,
      {
        method: 'POST',
        body: incident,
        useCache: false
      }
    );
  }

  static async triggerPanicAlert(
    provider: string,
    location: { latitude: number; longitude: number },
    userId: string
  ): Promise<APIResponse<{ alertId: string; responseETA: string }>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Security provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService(
      service,
      `/alerts/panic`,
      {
        method: 'POST',
        body: { location, userId, timestamp: new Date().toISOString() },
        useCache: false
      }
    );
  }

  private static getServiceConfig(provider: string): ExternalService | null {
    const configs: Record<string, ExternalService> = {
      'adt': ADT_SERVICE,
      'fidelity': FIDELITY_SERVICE,
    };

    return configs[provider.toLowerCase()] || null;
  }

  static getSupportedProviders(): string[] {
    return ['adt', 'fidelity'];
  }
}