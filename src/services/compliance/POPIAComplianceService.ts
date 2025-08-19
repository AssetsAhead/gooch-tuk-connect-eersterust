// POPIA Compliance Service for Data Protection and Privacy
import { supabase } from '@/integrations/supabase/client';
type SupabaseClient = typeof supabase;

export interface PIIData {
  type: 'identity_number' | 'phone_number' | 'email' | 'address' | 'biometric' | 'financial';
  value: string;
  source: string;
  purpose: string;
  consentGiven: boolean;
  retentionDays: number;
}

export interface ConsentRecord {
  userId: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: string;
  operation: 'collect' | 'process' | 'store' | 'transmit' | 'delete';
  purpose: string;
  timestamp: Date;
  lawfulBasis: string;
}

export class POPIAComplianceService {
  private static instance: POPIAComplianceService;

  static getInstance(): POPIAComplianceService {
    if (!this.instance) {
      this.instance = new POPIAComplianceService();
    }
    return this.instance;
  }

  // Record consent for data processing
  async recordConsent(consent: ConsentRecord): Promise<void> {
    try {
      const { error } = await (supabase as any).from('popia_consent_records').insert({
        user_id: consent.userId,
        purpose: consent.purpose,
        consent_given: consent.consentGiven,
        consent_date: consent.consentDate.toISOString(),
        withdrawal_date: consent.withdrawalDate?.toISOString(),
        legal_basis: consent.legalBasis,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Log consent action
      await this.logDataProcessing({
        id: crypto.randomUUID(),
        userId: consent.userId,
        dataType: 'consent_record',
        operation: 'collect',
        purpose: consent.purpose,
        timestamp: new Date(),
        lawfulBasis: consent.legalBasis
      });
    } catch (error) {
      console.error('Failed to record POPIA consent:', error);
      throw new Error('Consent recording failed');
    }
  }

  // Check if user has given consent for specific purpose
  async hasValidConsent(userId: string, purpose: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any)
        .from('popia_consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('purpose', purpose)
        .eq('consent_given', true)
        .is('withdrawal_date', null)
        .order('consent_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Failed to check consent:', error);
      return false;
    }
  }

  // Withdraw consent
  async withdrawConsent(userId: string, purpose: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('popia_consent_records')
        .update({
          withdrawal_date: new Date().toISOString(),
          consent_given: false
        })
        .eq('user_id', userId)
        .eq('purpose', purpose)
        .is('withdrawal_date', null);

      if (error) throw error;

      // Log consent withdrawal
      await this.logDataProcessing({
        id: crypto.randomUUID(),
        userId,
        dataType: 'consent_withdrawal',
        operation: 'process',
        purpose,
        timestamp: new Date(),
        lawfulBasis: 'consent'
      });

      // Trigger data deletion if required
      await this.handleConsentWithdrawal(userId, purpose);
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      throw new Error('Consent withdrawal failed');
    }
  }

  // Process PII data with POPIA compliance
  async processPIIData(
    userId: string,
    piiData: PIIData,
    operation: 'collect' | 'process' | 'store' | 'transmit'
  ): Promise<{ success: boolean; encryptedValue?: string }> {
    // Check consent
    const hasConsent = await this.hasValidConsent(userId, piiData.purpose);
    if (!hasConsent && piiData.consentGiven === false) {
      throw new Error('No valid consent for PII data processing');
    }

    try {
      // Encrypt PII data
      const encryptedValue = await this.encryptPII(piiData.value, piiData.type);

      // Store encrypted PII with metadata
      const { error } = await (supabase as any).from('pii_data_records').insert({
        user_id: userId,
        data_type: piiData.type,
        encrypted_value: encryptedValue,
        source: piiData.source,
        purpose: piiData.purpose,
        retention_days: piiData.retentionDays,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + piiData.retentionDays * 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) throw error;

      // Log data processing
      await this.logDataProcessing({
        id: crypto.randomUUID(),
        userId,
        dataType: piiData.type,
        operation,
        purpose: piiData.purpose,
        timestamp: new Date(),
        lawfulBasis: piiData.consentGiven ? 'consent' : 'legal_obligation'
      });

      return { success: true, encryptedValue };
    } catch (error) {
      console.error('Failed to process PII data:', error);
      throw new Error('PII data processing failed');
    }
  }

  // Get user's data processing records (for transparency)
  async getUserDataProcessingRecords(userId: string): Promise<DataProcessingRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('data_processing_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data?.map((record: any) => ({
        id: record.id,
        userId: record.user_id,
        dataType: record.data_type,
        operation: record.operation,
        purpose: record.purpose,
        timestamp: new Date(record.timestamp),
        lawfulBasis: record.lawful_basis
      })) || [];
    } catch (error) {
      console.error('Failed to get user data processing records:', error);
      return [];
    }
  }

  // Delete user data (right to erasure)
  async deleteUserData(userId: string, dataTypes?: string[]): Promise<void> {
    try {
      // Delete from all relevant tables
      const tables = [
        'pii_data_records',
        'popia_consent_records', 
        'data_processing_logs'
      ];

      for (const table of tables) {
        let query = (supabase as any).from(table).delete().eq('user_id', userId);
        
        if (dataTypes && table === 'pii_data_records') {
          query = query.in('data_type', dataTypes);
        }
        
        const { error } = await query;
        if (error) throw error;
      }

      // Log data deletion
      await this.logDataProcessing({
        id: crypto.randomUUID(),
        userId,
        dataType: dataTypes?.join(',') || 'all',
        operation: 'delete',
        purpose: 'right_to_erasure',
        timestamp: new Date(),
        lawfulBasis: 'consent'
      });
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw new Error('Data deletion failed');
    }
  }

  // Generate POPIA compliance report
  async generateComplianceReport(userId: string): Promise<{
    consentRecords: ConsentRecord[];
    dataProcessingRecords: DataProcessingRecord[];
    piiDataSummary: Array<{
      type: string;
      count: number;
      purposes: string[];
      oldestRecord: Date;
      expirationDates: Date[];
    }>;
    complianceScore: number;
  }> {
    try {
      // Get consent records
      const { data: consentData } = await (supabase as any)
        .from('popia_consent_records')
        .select('*')
        .eq('user_id', userId);

      const consentRecords: ConsentRecord[] = consentData?.map((record: any) => ({
        userId: record.user_id,
        purpose: record.purpose,
        consentGiven: record.consent_given,
        consentDate: new Date(record.consent_date),
        withdrawalDate: record.withdrawal_date ? new Date(record.withdrawal_date) : undefined,
        legalBasis: record.legal_basis
      })) || [];

      // Get processing records
      const dataProcessingRecords = await this.getUserDataProcessingRecords(userId);

      // Get PII data summary
      const { data: piiData } = await (supabase as any)
        .from('pii_data_records')
        .select('data_type, purpose, created_at, expires_at')
        .eq('user_id', userId);

      const piiSummary = this.aggregatePIIData(piiData || []);

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(consentRecords, dataProcessingRecords, piiSummary);

      return {
        consentRecords,
        dataProcessingRecords,
        piiDataSummary: piiSummary,
        complianceScore
      };
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw new Error('Compliance report generation failed');
    }
  }

  // Private helper methods
  private async encryptPII(value: string, type: string): Promise<string> {
    // Mock encryption - in production would use proper encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(`${type}:${value}:${Date.now()}`);
    return btoa(String.fromCharCode(...data));
  }

  private async logDataProcessing(record: DataProcessingRecord): Promise<void> {
    try {
      const { error } = await (supabase as any).from('data_processing_logs').insert({
        id: record.id,
        user_id: record.userId,
        data_type: record.dataType,
        operation: record.operation,
        purpose: record.purpose,
        timestamp: record.timestamp.toISOString(),
        lawful_basis: record.lawfulBasis
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log data processing:', error);
    }
  }

  private async handleConsentWithdrawal(userId: string, purpose: string): Promise<void> {
    // Delete data that was collected solely based on withdrawn consent
    try {
      const { error } = await (supabase as any)
        .from('pii_data_records')
        .delete()
        .eq('user_id', userId)
        .eq('purpose', purpose);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to handle consent withdrawal:', error);
    }
  }

  private aggregatePIIData(piiData: any[]): Array<{
    type: string;
    count: number;
    purposes: string[];
    oldestRecord: Date;
    expirationDates: Date[];
  }> {
    const aggregated = new Map();

    piiData.forEach(record => {
      const type = record.data_type;
      if (!aggregated.has(type)) {
        aggregated.set(type, {
          type,
          count: 0,
          purposes: new Set(),
          oldestRecord: new Date(record.created_at),
          expirationDates: []
        });
      }

      const entry = aggregated.get(type);
      entry.count++;
      entry.purposes.add(record.purpose);
      entry.expirationDates.push(new Date(record.expires_at));
      
      if (new Date(record.created_at) < entry.oldestRecord) {
        entry.oldestRecord = new Date(record.created_at);
      }
    });

    return Array.from(aggregated.values()).map(entry => ({
      ...entry,
      purposes: Array.from(entry.purposes)
    }));
  }

  private calculateComplianceScore(
    consentRecords: ConsentRecord[],
    processingRecords: DataProcessingRecord[],
    piiSummary: any[]
  ): number {
    let score = 100;

    // Deduct points for missing consent
    const activeConsents = consentRecords.filter(c => c.consentGiven && !c.withdrawalDate).length;
    const totalPurposes = new Set(processingRecords.map(r => r.purpose)).size;
    if (activeConsents < totalPurposes) {
      score -= (totalPurposes - activeConsents) * 10;
    }

    // Deduct points for old data without recent consent
    const oldDataCount = piiSummary.filter(p => 
      Date.now() - p.oldestRecord.getTime() > 365 * 24 * 60 * 60 * 1000
    ).length;
    score -= oldDataCount * 5;

    // Deduct points for expired data not deleted
    const expiredDataCount = piiSummary.filter(p => 
      p.expirationDates.some(date => date < new Date())
    ).length;
    score -= expiredDataCount * 15;

    return Math.max(0, Math.min(100, score));
  }
}