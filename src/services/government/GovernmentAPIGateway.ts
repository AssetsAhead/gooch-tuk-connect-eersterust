// Government API Gateway for GovZuma and Sovereign Services Integration
import { ExternalAPIService, type ExternalService } from '@/services/ExternalAPIService';
import { ZeroTrustSecurityService } from '@/services/security/ZeroTrustSecurityService';

export interface GovernmentEndpoint {
  service: 'SASSA' | 'SAPS' | 'HOME_AFFAIRS' | 'MUNICIPALITY' | 'ESKOM';
  endpoint: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  requiresEncryption: boolean;
  govZumaEnabled: boolean;
}

export interface PKICredentials {
  certificateId: string;
  publicKey: string;
  privateKeyRef: string; // Reference to secure storage, not actual key
  issuer: string;
  validUntil: Date;
}

export class GovernmentAPIGateway {
  private securityService: ZeroTrustSecurityService;
  private pkiCredentials: PKICredentials | null = null;

  // Government service configurations
  private governmentServices: Record<string, ExternalService> = {
    SASSA: {
      name: 'SASSA_API',
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.sassa.gov.za/v1' 
        : 'https://staging-api.sassa.gov.za/v1',
      requiresAuth: true,
      rateLimit: { requests: 100, window: 3600 }
    },
    SAPS: {
      name: 'SAPS_API',
      baseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api.saps.gov.za/v1'
        : 'https://staging-api.saps.gov.za/v1',
      requiresAuth: true,
      rateLimit: { requests: 50, window: 3600 }
    },
    HOME_AFFAIRS: {
      name: 'DHA_API',
      baseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api.dha.gov.za/v1'
        : 'https://staging-api.dha.gov.za/v1',
      requiresAuth: true,
      rateLimit: { requests: 200, window: 3600 }
    },
    MUNICIPALITY: {
      name: 'MUNICIPAL_API',
      baseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api.municipalities.gov.za/v1'
        : 'https://staging-api.municipalities.gov.za/v1',
      requiresAuth: true,
      rateLimit: { requests: 150, window: 3600 }
    },
    ESKOM: {
      name: 'ESKOM_API',
      baseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api.eskom.co.za/v1'
        : 'https://staging-api.eskom.co.za/v1',
      requiresAuth: true,
      rateLimit: { requests: 100, window: 3600 }
    }
  };

  constructor() {
    this.securityService = ZeroTrustSecurityService.getInstance();
  }

  // Initialize PKI credentials for government communication
  async initializePKI(credentials: PKICredentials): Promise<void> {
    // Validate certificate
    if (new Date() > credentials.validUntil) {
      throw new Error('PKI certificate has expired');
    }

    // Verify issuer is trusted government CA
    const trustedIssuers = [
      'South African Government Root CA',
      'SITA Certificate Authority',
      'Government IT Security Branch CA'
    ];

    if (!trustedIssuers.includes(credentials.issuer)) {
      throw new Error('PKI certificate not from trusted government issuer');
    }

    this.pkiCredentials = credentials;
  }

  // Secure government API call with PKI and encryption
  async callGovernmentAPI<T>(
    endpoint: GovernmentEndpoint,
    data?: any,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      useGovZuma?: boolean;
      encryptPayload?: boolean;
    } = {}
  ): Promise<T> {
    const { method = 'GET', useGovZuma = endpoint.govZumaEnabled, encryptPayload = endpoint.requiresEncryption } = options;

    // Validate security context
    const securityValidation = await this.securityService.validateDataAccess(
      {
        level: endpoint.classification,
        governmentData: true,
        piiData: true,
        requiresEncryption: endpoint.requiresEncryption,
        retentionDays: 2555 // 7 years for government records
      },
      method === 'GET' ? 'read' : 'write'
    );

    if (!securityValidation.allowed) {
      throw new Error(`Access denied: ${securityValidation.reason}`);
    }

    // Prepare headers for government communication
    const headers: Record<string, string> = {
      'X-Government-API': 'true',
      'X-PoortLink-Version': '1.0',
      'X-RSA-Compliance': 'POPIA-COMPLIANT',
    };

    // Add PKI authentication if available
    if (this.pkiCredentials) {
      headers['X-PKI-Certificate-ID'] = this.pkiCredentials.certificateId;
      headers['X-PKI-Signature'] = await this.signRequest(data || '', this.pkiCredentials);
    }

    // Encrypt payload if required
    let processedData = data;
    if (encryptPayload && data) {
      processedData = await this.encryptPayload(data);
      headers['Content-Encoding'] = 'aes-256-gcm';
    }

    // Use GovZuma routing if enabled
    if (useGovZuma) {
      headers['X-Network-Route'] = 'GovZuma';
      headers['X-Security-Level'] = 'GOVERNMENT-SECURE';
    }

    const service = this.governmentServices[endpoint.service];
    if (!service) {
      throw new Error(`Government service ${endpoint.service} not configured`);
    }

    try {
      const response = await ExternalAPIService.callService<T>(
        service,
        endpoint.endpoint,
        {
          method,
          body: processedData,
          headers,
          cacheTTL: this.getCacheTTL(endpoint.classification),
          useCache: method === 'GET' && endpoint.classification !== 'restricted'
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Government API call failed');
      }

      // Decrypt response if it was encrypted
      let finalData = response.data;
      if (response.data && typeof response.data === 'string' && encryptPayload) {
        finalData = await this.decryptPayload(response.data);
      }

      // Log government API interaction
      await this.logGovernmentInteraction(endpoint, method, true);

      return finalData;
    } catch (error) {
      await this.logGovernmentInteraction(endpoint, method, false, error);
      throw error;
    }
  }

  // SASSA-specific methods
  async verifySASSABeneficiary(idNumber: string): Promise<{
    isValid: boolean;
    benefitType?: string;
    paymentDate?: string;
    amount?: number;
  }> {
    return this.callGovernmentAPI({
      service: 'SASSA',
      endpoint: `/beneficiary/verify/${idNumber}`,
      classification: 'confidential',
      requiresEncryption: true,
      govZumaEnabled: true
    });
  }

  async getSASSAPaymentSchedule(province: string): Promise<{
    schedules: Array<{
      benefitType: string;
      paymentDates: string[];
      venues: Array<{
        name: string;
        address: string;
        coordinates: [number, number];
      }>;
    }>;
  }> {
    return this.callGovernmentAPI({
      service: 'SASSA',
      endpoint: `/payment-schedule/${province}`,
      classification: 'public',
      requiresEncryption: false,
      govZumaEnabled: false
    });
  }

  // SAPS-specific methods
  async reportCrimeIncident(incident: {
    type: string;
    location: { lat: number; lng: number };
    description: string;
    evidence?: string[];
  }): Promise<{ caseNumber: string; referenceId: string }> {
    return this.callGovernmentAPI({
      service: 'SAPS',
      endpoint: '/incident/report',
      classification: 'confidential',
      requiresEncryption: true,
      govZumaEnabled: true
    }, incident, { method: 'POST' });
  }

  async getCrimeStatistics(area: string): Promise<{
    crimeStats: Array<{
      type: string;
      count: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    safetyRating: number;
  }> {
    return this.callGovernmentAPI({
      service: 'SAPS',
      endpoint: `/statistics/${area}`,
      classification: 'internal',
      requiresEncryption: false,
      govZumaEnabled: false
    });
  }

  // Home Affairs methods
  async verifyIdentity(idNumber: string): Promise<{
    isValid: boolean;
    name?: string;
    surname?: string;
    dateOfBirth?: string;
  }> {
    return this.callGovernmentAPI({
      service: 'HOME_AFFAIRS',
      endpoint: `/identity/verify/${idNumber}`,
      classification: 'restricted',
      requiresEncryption: true,
      govZumaEnabled: true
    });
  }

  // Municipal services
  async getLoadSheddingSchedule(area: string): Promise<{
    currentStage: number;
    schedule: Array<{
      date: string;
      slots: Array<{
        startTime: string;
        endTime: string;
        areas: string[];
      }>;
    }>;
  }> {
    return this.callGovernmentAPI({
      service: 'MUNICIPALITY',
      endpoint: `/loadshedding/${area}`,
      classification: 'public',
      requiresEncryption: false,
      govZumaEnabled: false
    });
  }

  // Eskom integration
  async reportPowerOutage(location: { lat: number; lng: number }): Promise<{
    ticketNumber: string;
    estimatedRepairTime?: string;
  }> {
    return this.callGovernmentAPI({
      service: 'ESKOM',
      endpoint: '/outage/report',
      classification: 'internal',
      requiresEncryption: true,
      govZumaEnabled: false
    }, { location }, { method: 'POST' });
  }

  // Private helper methods
  private async signRequest(data: string, credentials: PKICredentials): Promise<string> {
    // Mock PKI signing - in production would use actual cryptographic signing
    const timestamp = Date.now();
    const payload = `${data}:${timestamp}:${credentials.certificateId}`;
    return btoa(payload);
  }

  private async encryptPayload(data: any): Promise<string> {
    // Mock encryption - in production would use actual AES-256-GCM
    return btoa(JSON.stringify(data));
  }

  private async decryptPayload(encryptedData: string): Promise<any> {
    // Mock decryption - in production would use actual decryption
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return encryptedData;
    }
  }

  private getCacheTTL(classification: string): number {
    switch (classification) {
      case 'public': return 3600; // 1 hour
      case 'internal': return 1800; // 30 minutes
      case 'confidential': return 300; // 5 minutes
      case 'restricted': return 0; // No caching
      default: return 600; // 10 minutes
    }
  }

  private async logGovernmentInteraction(
    endpoint: GovernmentEndpoint,
    method: string,
    success: boolean,
    error?: any
  ): Promise<void> {
    try {
      // In production, this would log to secure government audit system
      console.log('Government API Interaction:', {
        service: endpoint.service,
        endpoint: endpoint.endpoint,
        method,
        success,
        error: error?.message,
        timestamp: new Date().toISOString(),
        classification: endpoint.classification
      });
    } catch (logError) {
      console.error('Failed to log government interaction:', logError);
    }
  }
}