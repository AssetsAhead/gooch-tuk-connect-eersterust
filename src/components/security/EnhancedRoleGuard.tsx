
import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedRoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const EnhancedRoleGuard: React.FC<EnhancedRoleGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback
}) => {
  const { user, userProfile } = useAuth();

  // Check if user has required role
  const userRole = (userProfile as any)?.role || (user as any)?.user_metadata?.role;
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(userRole);

  // Check permissions (you can extend this based on your permission system)
  const userPermissions = (userProfile as any)?.permissions || [];
  const hasRequiredPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );

  // Enhanced security checks for South African context
  const isVerifiedUser = (userProfile as any)?.sassa_verified || (userProfile as any)?.id_verified;
  const isHighSecurityRole = ['police', 'admin', 'marshall'].includes(userRole);
  const isAdminUser = userRole === 'admin';

  // Admin master password gate (prompt once per session)
  const [masterPassword, setMasterPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('admin_master_unlocked') === 'true';
  });

  // Check if user is admin (bypass all checks for admins once master password is entered)
  if (isAdminUser && unlocked) {
    return <>{children}</>;
  }

  const shouldPromptMaster = useMemo(() => isAdminUser && !unlocked, [isAdminUser, unlocked]);

  const verifyMaster = async () => {
    setVerifying(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-master', {
        body: { password: masterPassword }
      });
      if (error) throw error;
      if (data?.valid) {
        localStorage.setItem('admin_master_unlocked', 'true');
        setUnlocked(true);
      } else {
        setError('Invalid master password');
      }
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Admins must pass master password first
  if (shouldPromptMaster) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle>Admin Access Gate</CardTitle>
          <CardDescription>Enter the master password to unlock all portals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyMaster()}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button onClick={verifyMaster} disabled={verifying || masterPassword.length < 4} className="w-full">
              {verifying ? 'Verifying…' : 'Unlock Admin Access'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // High security roles require additional verification
  if (isHighSecurityRole && !isVerifiedUser && !isAdminUser) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Verification Required</CardTitle>
          <CardDescription>
            Your role requires additional identity verification for security purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Please complete ID verification and SASSA authentication to access this area
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasRequiredRole || !hasRequiredPermissions) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Access Restricted</CardTitle>
          <CardDescription>
            You don't have the required permissions to access this area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            {requiredRoles.length > 0 && (
              <p>Required roles: {requiredRoles.join(', ')}</p>
            )}
            {requiredPermissions.length > 0 && (
              <p>Required permissions: {requiredPermissions.join(', ')}</p>
            )}
            <p className="text-center mt-4">
              Contact your administrator if you believe this is an error
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
