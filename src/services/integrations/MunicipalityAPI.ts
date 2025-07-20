import { ExternalAPIService, ExternalService, APIResponse } from '../ExternalAPIService';

export interface MunicipalBill {
  accountNumber: string;
  serviceType: 'electricity' | 'water' | 'refuse' | 'rates';
  currentBalance: number;
  dueDate: string;
  consumption: number;
  previousReading: string;
  currentReading: string;
  billPeriod: string;
}

export interface LoadSheddingSchedule {
  area: string;
  stage: number;
  nextSlot: {
    start: string;
    end: string;
  };
  schedule: Array<{
    date: string;
    slots: Array<{ start: string; end: string }>;
  }>;
}

// Example service definitions - these would be configured per municipality
const CAPE_TOWN_SERVICE: ExternalService = {
  name: 'Cape Town Municipality',
  baseUrl: 'https://api.capetown.gov.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 100, window: 3600 }
};

const JOBURG_SERVICE: ExternalService = {
  name: 'City of Johannesburg',
  baseUrl: 'https://api.joburg.org.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 50, window: 3600 }
};

export class MunicipalityAPI {
  static async getBill(
    municipality: string,
    accountNumber: string,
    serviceType: string
  ): Promise<APIResponse<MunicipalBill>> {
    const service = this.getServiceConfig(municipality);
    if (!service) {
      return {
        success: false,
        error: `Municipality ${municipality} not supported`
      };
    }

    return await ExternalAPIService.callService<MunicipalBill>(
      service,
      `/billing/account/${accountNumber}/${serviceType}`,
      { cacheTTL: 3600 } // Cache for 1 hour
    );
  }

  static async getLoadSheddingSchedule(
    municipality: string,
    area: string
  ): Promise<APIResponse<LoadSheddingSchedule>> {
    const service = this.getServiceConfig(municipality);
    if (!service) {
      return {
        success: false,
        error: `Municipality ${municipality} not supported`
      };
    }

    return await ExternalAPIService.callService<LoadSheddingSchedule>(
      service,
      `/loadshedding/schedule/${area}`,
      { cacheTTL: 900 } // Cache for 15 minutes
    );
  }

  static async submitMeterReading(
    municipality: string,
    accountNumber: string,
    reading: string,
    serviceType: string
  ): Promise<APIResponse<{ success: boolean; reference: string }>> {
    const service = this.getServiceConfig(municipality);
    if (!service) {
      return {
        success: false,
        error: `Municipality ${municipality} not supported`
      };
    }

    return await ExternalAPIService.callService(
      service,
      `/meter-reading/submit`,
      {
        method: 'POST',
        body: { accountNumber, reading, serviceType },
        useCache: false
      }
    );
  }

  private static getServiceConfig(municipality: string): ExternalService | null {
    const configs: Record<string, ExternalService> = {
      'cape-town': CAPE_TOWN_SERVICE,
      'johannesburg': JOBURG_SERVICE,
    };

    return configs[municipality.toLowerCase()] || null;
  }

  static getSupportedMunicipalities(): string[] {
    return ['cape-town', 'johannesburg'];
  }
}