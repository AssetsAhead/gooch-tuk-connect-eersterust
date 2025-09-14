import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRoleSwitching } from '@/hooks/useRoleSwitching';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  Building, 
  Shield, 
  Crown, 
  BadgeCheck,
  UserCheck,
  Users,
  Loader2,
  ArrowLeft
} from 'lucide-react';

const roleIcons = {
  passenger: User,
  driver: Car,
  owner: Building,
  marshall: Shield,
  admin: Crown,
  police: BadgeCheck,
};

const roleColors = {
  passenger: 'default',
  driver: 'tuk-blue',
  owner: 'tuk-orange', 
  marshall: 'success',
  admin: 'danger',
  police: 'warning',
} as const;

const roleDescriptions = {
  passenger: 'Book rides and travel safely',
  driver: 'Drive and earn income',
  owner: 'Manage fleet and operations',
  marshall: 'Ensure rank compliance',
  admin: 'Full system administration',
  police: 'Security and law enforcement',
};

export const RoleSwitcher: React.FC = () => {
  const { availableRoles, currentRole, loading, switchRole, addRole } = useRoleSwitching();
  const navigate = useNavigate();

  const allRoles = ['passenger', 'driver', 'owner', 'marshall', 'admin', 'police'];
  const unavailableRoles = allRoles.filter(role => 
    !availableRoles.some(ar => ar.role === role)
  );

  if (loading && availableRoles.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading roles...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Role Display */}
      <Card className="w-full max-w-4xl mx-auto border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Current Active Role
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {currentRole && roleIcons[currentRole as keyof typeof roleIcons] && (
              <>
                {React.createElement(roleIcons[currentRole as keyof typeof roleIcons], { 
                  className: "h-8 w-8" 
                })}
                <div>
                  <h3 className="text-xl font-bold capitalize">{currentRole}</h3>
                  <p className="text-muted-foreground">{roleDescriptions[currentRole as keyof typeof roleDescriptions]}</p>
                </div>
                <Badge variant="default" className="ml-auto">Active</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Roles */}
      {availableRoles.length > 1 && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Switch to Another Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRoles
                .filter(role => role.role !== currentRole)
                .map((role) => {
                  const Icon = roleIcons[role.role as keyof typeof roleIcons] || User;
                  return (
                    <Card 
                      key={role.id} 
                      className="cursor-pointer transition-all hover:scale-105 border-2 hover:border-primary"
                      onClick={() => switchRole(role.role)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2" />
                        <h4 className="font-bold capitalize">{role.role}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {roleDescriptions[role.role as keyof typeof roleDescriptions]}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Switch Role'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Roles */}
      {unavailableRoles.length > 0 && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Request Additional Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unavailableRoles.map((role) => {
                const Icon = roleIcons[role as keyof typeof roleIcons] || User;
                return (
                  <Card 
                    key={role} 
                    className="cursor-pointer transition-all hover:scale-105 border-2 hover:border-secondary"
                    onClick={() => addRole(role)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-60" />
                      <h4 className="font-bold capitalize">{role}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {roleDescriptions[role as keyof typeof roleDescriptions]}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Role'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};