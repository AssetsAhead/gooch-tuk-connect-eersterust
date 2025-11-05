import React from 'react';
import { SecurityProvider } from './SecurityProvider';
import { ZeroTrustSecurityService } from '@/services/security/ZeroTrustSecurityService';
import { GovernmentAPIGateway } from '@/services/government/GovernmentAPIGateway';
import { POPIAComplianceService } from '@/services/compliance/POPIAComplianceService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, FileCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedSecurityProviderProps {
  children: React.ReactNode;
}

export const EnhancedSecurityProvider: React.FC<EnhancedSecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = React.useState<{
    initialized: boolean;
    riskScore: number;
    complianceFlags: string[];
    govAccess: boolean;
    popiaClearance: boolean;
  }>({
    initialized: false,
    riskScore: 0,
    complianceFlags: [],
    govAccess: false,
    popiaClearance: false
  });

  const [showSecurityAlert, setShowSecurityAlert] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      initializeEnhancedSecurity();
    }
  }, [user]);

  const initializeEnhancedSecurity = async () => {
    try {
      // Initialize Zero Trust Security
      const securityService = ZeroTrustSecurityService.getInstance();
      const securityContext = await securityService.initializeSecurityContext(user!.id);

      // Initialize POPIA Compliance
      const complianceService = POPIAComplianceService.getInstance();
      const hasPopiaClearance = await complianceService.hasValidConsent(user!.id, 'data_processing');

      // Check government access clearance
      const govAccess = securityContext.complianceFlags.includes('GOVERNMENT_VERIFIED') ||
                       securityContext.complianceFlags.includes('LAW_ENFORCEMENT');

      setSecurityStatus({
        initialized: true,
        riskScore: securityContext.riskScore,
        complianceFlags: securityContext.complianceFlags,
        govAccess,
        popiaClearance: hasPopiaClearance
      });

      // Show security alert if risk score is high
      if (securityContext.riskScore > 70) {
        setShowSecurityAlert(true);
      }

      // Initialize Government API Gateway if user has clearance
      if (govAccess) {
        const govGateway = new GovernmentAPIGateway();
        // Initialize with mock PKI credentials for demo
        await govGateway.initializePKI({
          certificateId: 'RSA-GOV-TAXI-001',
          publicKey: 'mock-public-key',
          privateKeyRef: 'secure-storage-ref',
          issuer: 'South African Government Root CA',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        });
      }

    } catch (error) {
      console.error('Failed to initialize enhanced security:', error);
      setShowSecurityAlert(true);
    }
  };

  const getSecurityBadgeVariant = (riskScore: number) => {
    if (riskScore < 30) return 'default';
    if (riskScore < 70) return 'secondary';
    return 'destructive';
  };

  const getSecurityStatus = (riskScore: number) => {
    if (riskScore < 30) return 'Secure';
    if (riskScore < 70) return 'Moderate Risk';
    return 'High Risk';
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Enhanced Security Status Display */}
      {securityStatus.initialized && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {/* Security Score Badge */}
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Security:</span>
            <Badge variant={getSecurityBadgeVariant(securityStatus.riskScore)}>
              {getSecurityStatus(securityStatus.riskScore)}
            </Badge>
          </div>

          {/* Compliance Badges */}
          {securityStatus.complianceFlags.length > 0 && (
            <div className="flex flex-wrap gap-1 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
              {securityStatus.popiaClearance && (
                <Badge variant="outline" className="text-xs">
                  <FileCheck className="h-3 w-3 mr-1" />
                  POPIA
                </Badge>
              )}
              {securityStatus.govAccess && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Gov Access
                </Badge>
              )}
              {securityStatus.complianceFlags.includes('LAW_ENFORCEMENT') && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Law Enforcement
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* High Risk Security Alert */}
      {showSecurityAlert && (
        <div className="fixed top-20 right-4 z-50 w-80">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Security risk detected. Enhanced monitoring is active. Contact administrator if this persists.
              <button 
                onClick={() => setShowSecurityAlert(false)}
                className="ml-2 underline text-sm"
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Wrap with original security provider */}
      <SecurityProvider>
        {children}
      </SecurityProvider>
    </>
  );
};