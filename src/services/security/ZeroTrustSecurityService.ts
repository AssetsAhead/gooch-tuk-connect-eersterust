// Zero-Trust Security Framework for Sovereign Infrastructure
import { supabase } from '@/integrations/supabase/client';

export interface SecurityContext {
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  location?: GeolocationPosition;
  riskScore: number;
  complianceFlags: string[];
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  governmentData: boolean;
  piiData: boolean;
  requiresEncryption: boolean;
  retentionDays: number;
}

export class ZeroTrustSecurityService {
  private static instance: ZeroTrustSecurityService;
  private securityContext: SecurityContext | null = null;

  static getInstance(): ZeroTrustSecurityService {
    if (!this.instance) {
      this.instance = new ZeroTrustSecurityService();
    }
    return this.instance;
  }

  // Initialize security context
  async initializeSecurityContext(userId: string): Promise<SecurityContext> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const ipAddress = await this.getClientIP();
    const location = await this.getCurrentLocation();
    
    const riskScore = await this.calculateRiskScore({
      userId,
      deviceFingerprint,
      ipAddress,
      location
    });

    const complianceFlags = await this.checkComplianceFlags(userId);

    this.securityContext = {
      userId,
      deviceFingerprint,
      ipAddress,
      location,
      riskScore,
      complianceFlags
    };

    // Log security context initialization
    await this.auditLog('SECURITY_CONTEXT_INIT', {
      userId,
      riskScore,
      complianceFlags,
      timestamp: new Date().toISOString()
    });

    return this.securityContext;
  }

  // Validate data access request
  async validateDataAccess(
    dataClassification: DataClassification,
    requestedOperation: 'read' | 'write' | 'delete'
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.securityContext) {
      return { allowed: false, reason: 'Security context not initialized' };
    }

    // POPIA compliance check
    if (dataClassification.piiData && !this.hasPopiaClearance()) {
      return { allowed: false, reason: 'POPIA clearance required for PII data' };
    }

    // Government data access validation
    if (dataClassification.governmentData && !this.hasGovernmentAccess()) {
      return { allowed: false, reason: 'Government access clearance required' };
    }

    // Risk-based access control
    if (this.securityContext.riskScore > this.getRiskThreshold(dataClassification.level)) {
      return { allowed: false, reason: 'Risk score exceeds threshold for data classification' };
    }

    // Log data access validation
    await this.auditLog('DATA_ACCESS_VALIDATION', {
      userId: this.securityContext.userId,
      dataClassification,
      operation: requestedOperation,
      allowed: true,
      timestamp: new Date().toISOString()
    });

    return { allowed: true };
  }

  // Generate device fingerprint
  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      canvas: canvas.toDataURL(),
      timestamp: Date.now()
    };

    return btoa(JSON.stringify(fingerprint));
  }

  // Get client IP (mock for demo - would use actual service)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Get current location if permitted
  private async getCurrentLocation(): Promise<GeolocationPosition | undefined> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          () => resolve(undefined),
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve(undefined);
      }
    });
  }

  // Calculate risk score based on context
  private async calculateRiskScore(context: Partial<SecurityContext>): Promise<number> {
    let score = 0;

    // Check for unusual IP patterns
    if (context.ipAddress && !this.isKnownSafeIP(context.ipAddress)) {
      score += 30;
    }

    // Check device fingerprint
    if (context.deviceFingerprint && !this.isKnownDevice(context.deviceFingerprint)) {
      score += 20;
    }

    // Location-based risk (outside RSA)
    if (context.location && !this.isWithinRSA(context.location)) {
      score += 50;
    }

    return Math.min(score, 100);
  }

  // Check compliance flags for user
  private async checkComplianceFlags(userId: string): Promise<string[]> {
    const flags: string[] = [];

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        if (profile.is_government_verified) flags.push('GOVERNMENT_VERIFIED');
        if (profile.popia_consent) flags.push('POPIA_CONSENT');
        if (profile.is_law_enforcement) flags.push('LAW_ENFORCEMENT');
      }
    } catch (error) {
      console.error('Failed to check compliance flags:', error);
    }

    return flags;
  }

  // Audit logging
  private async auditLog(event: string, details: any): Promise<void> {
    try {
      await supabase.from('security_audit_logs').insert({
        event_type: event,
        user_id: this.securityContext?.userId,
        details,
        ip_address: this.securityContext?.ipAddress,
        device_fingerprint: this.securityContext?.deviceFingerprint,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  // Helper methods
  private hasPopiaClearance(): boolean {
    return this.securityContext?.complianceFlags.includes('POPIA_CONSENT') || false;
  }

  private hasGovernmentAccess(): boolean {
    return this.securityContext?.complianceFlags.includes('GOVERNMENT_VERIFIED') || 
           this.securityContext?.complianceFlags.includes('LAW_ENFORCEMENT') || false;
  }

  private getRiskThreshold(level: string): number {
    switch (level) {
      case 'public': return 100;
      case 'internal': return 70;
      case 'confidential': return 40;
      case 'restricted': return 20;
      default: return 50;
    }
  }

  private isKnownSafeIP(ip: string): boolean {
    // Would check against whitelist of RSA IP ranges
    return true; // Mock implementation
  }

  private isKnownDevice(fingerprint: string): boolean {
    // Would check against user's registered devices
    return localStorage.getItem(`device_${fingerprint}`) !== null;
  }

  private isWithinRSA(location: GeolocationPosition): boolean {
    // RSA coordinates: approximately -22° to -35° latitude, 16° to 33° longitude
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;
    return lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33;
  }
}