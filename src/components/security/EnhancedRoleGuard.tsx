
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { useServerVerifiedAdmin } from '@/hooks/useServerVerifiedAdmin';
import { useSecureAuth } from '@/hooks/useSecureAuth';

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
  const { isAdmin: isVerifiedAdmin, loading: verifying } = useServerVerifiedAdmin();
  const { getPrimaryRole } = useSecureAuth();
  const userRole = getPrimaryRole();

  // SECURITY: Only check verified roles from user_roles table (handled by useSecureAuth)
  // This component should use useSecureAuth hook instead of directly checking metadata
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(userRole) || isVerifiedAdmin;

  // Check permissions (you can extend this based on your permission system)
  const userPermissions = (userProfile as any)?.permissions || [];
  const hasRequiredPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );

  // Enhanced security checks for South African context
  const isVerifiedUser = (userProfile as any)?.sassa_verified || (userProfile as any)?.id_verified;
  const isHighSecurityRole = ['police', 'admin', 'marshall'].includes(userRole);

  // Allow direct rendering if admin role is verified
  if (isVerifiedAdmin) {
    return <>{children}</>;
  }

  // High security roles require additional verification
  if (isHighSecurityRole && !isVerifiedUser && !isVerifiedAdmin) {
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
