import { ExternalAPIService, ExternalService, APIResponse } from '../ExternalAPIService';

export interface AccountBalance {
  accountNumber: string;
  currentBalance: number;
  currency: 'ZAR';
  lastUpdated: string;
  dataBalance?: {
    remaining: number;
    total: number;
    unit: 'MB' | 'GB';
    expiryDate: string;
  };
  airtime?: {
    balance: number;
    expiryDate: string;
  };
}

export interface UsageHistory {
  period: string;
  calls: {
    minutes: number;
    cost: number;
  };
  sms: {
    count: number;
    cost: number;
  };
  data: {
    used: number;
    unit: 'MB' | 'GB';
    cost: number;
  };
  totalCost: number;
}

export interface TopUpOption {
  amount: number;
  description: string;
  validity: string;
  bonus?: {
    data?: string;
    airtime?: number;
    sms?: number;
  };
}

// Major South African cellular providers
const VODACOM_SERVICE: ExternalService = {
  name: 'Vodacom',
  baseUrl: 'https://api.vodacom.co.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 500, window: 3600 }
};

const MTN_SERVICE: ExternalService = {
  name: 'MTN',
  baseUrl: 'https://api.mtn.co.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 400, window: 3600 }
};

const CELL_C_SERVICE: ExternalService = {
  name: 'Cell C',
  baseUrl: 'https://api.cellc.co.za', // Hypothetical
  requiresAuth: true,
  rateLimit: { requests: 300, window: 3600 }
};

export class CellularProviderAPI {
  static async getAccountBalance(
    provider: string,
    phoneNumber: string
  ): Promise<APIResponse<AccountBalance>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService<AccountBalance>(
      service,
      `/account/${phoneNumber}/balance`,
      { cacheTTL: 300 } // Cache for 5 minutes
    );
  }

  static async getUsageHistory(
    provider: string,
    phoneNumber: string,
    months: number = 3
  ): Promise<APIResponse<UsageHistory[]>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService<UsageHistory[]>(
      service,
      `/account/${phoneNumber}/usage?months=${months}`,
      { cacheTTL: 1800 } // Cache for 30 minutes
    );
  }

  static async getTopUpOptions(
    provider: string
  ): Promise<APIResponse<TopUpOption[]>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService<TopUpOption[]>(
      service,
      `/topup/options`,
      { cacheTTL: 3600 } // Cache for 1 hour
    );
  }

  static async purchaseTopUp(
    provider: string,
    phoneNumber: string,
    amount: number,
    paymentMethod: string
  ): Promise<APIResponse<{ transactionId: string; confirmationCode: string }>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService(
      service,
      `/topup/purchase`,
      {
        method: 'POST',
        body: { phoneNumber, amount, paymentMethod },
        useCache: false
      }
    );
  }

  static async transferAirtime(
    provider: string,
    fromNumber: string,
    toNumber: string,
    amount: number
  ): Promise<APIResponse<{ transactionId: string; confirmationCode: string }>> {
    const service = this.getServiceConfig(provider);
    if (!service) {
      return {
        success: false,
        error: `Provider ${provider} not supported`
      };
    }

    return await ExternalAPIService.callService(
      service,
      `/transfer/airtime`,
      {
        method: 'POST',
        body: { fromNumber, toNumber, amount },
        useCache: false
      }
    );
  }

  private static getServiceConfig(provider: string): ExternalService | null {
    const configs: Record<string, ExternalService> = {
      'vodacom': VODACOM_SERVICE,
      'mtn': MTN_SERVICE,
      'cell-c': CELL_C_SERVICE,
    };

    return configs[provider.toLowerCase()] || null;
  }

  static getSupportedProviders(): string[] {
    return ['vodacom', 'mtn', 'cell-c'];
  }
}