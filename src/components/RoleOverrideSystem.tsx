import React from 'react';
import { useRoleHierarchy } from '@/hooks/useRoleHierarchy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Car, Crown, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleIcons = {
  admin: Crown,
  marshall: Shield,
  owner: Users,
  driver: Car,
  passenger: Users,
  police: Eye,
};

const roleColors = {
  admin: 'destructive',
  marshall: 'default',
  owner: 'secondary',
  driver: 'outline',
  passenger: 'outline',
  police: 'destructive',
} as const;

export const RoleOverrideSystem: React.FC = () => {
  const {
    getAccessibleRoles,
    canAccessRole,
    switchToRole,
    getCurrentActiveRole,
    loading,
    isAdmin,
  } = useRoleHierarchy();
  
  const navigate = useNavigate();
  const accessibleRoles = getAccessibleRoles();
  const currentRole = getCurrentActiveRole();

  const handleRoleSwitch = async (role: string) => {
    const success = await switchToRole(role);
    if (success) {
      // Navigate to the role's dashboard
      navigate(`/${role}`, { replace: true });
    }
  };

  if (!isAdmin && accessibleRoles.length <= 1) {
    return null; // Don't show if user only has one role
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Role Override System
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "As admin, you have access to all portals for system monitoring and debugging."
            : "Switch between your authorized roles as needed."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {accessibleRoles.map((role) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            const isCurrentRole = role === currentRole;
            
            return (
              <div key={role} className="text-center">
                <Button
                  variant={isCurrentRole ? "default" : "outline"}
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleRoleSwitch(role)}
                  disabled={loading || isCurrentRole}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs capitalize">{role}</span>
                </Button>
                {isCurrentRole && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        
        {isAdmin && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Admin Privileges:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Access all portals for system debugging</li>
              <li>• Override role restrictions during emergencies</li>
              <li>• Monitor all user activities and system performance</li>
              <li>• Assign and manage user roles</li>
            </ul>
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Current Role Capabilities:</strong>
          <ul className="mt-1 space-y-1">
            {currentRole === 'admin' && <li>• Full system access and user management</li>}
            {currentRole === 'marshall' && <li>• Can override driver operations in emergencies</li>}
            {currentRole === 'owner' && <li>• Manage fleet and driver assignments</li>}
            {currentRole === 'driver' && <li>• Vehicle operations and passenger management</li>}
            {currentRole === 'passenger' && <li>• Book rides and view trip history</li>}
            {currentRole === 'police' && <li>• Law enforcement tools and monitoring</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};