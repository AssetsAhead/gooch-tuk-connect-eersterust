import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, XCircle, Search, Phone, Car, Users } from 'lucide-react';

interface UserRegistration {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  registration_status: string;
  created_at: string;
  phone_numbers: Array<{
    phone_number: string;
    is_primary: boolean;
    is_verified: boolean;
  }>;
  portal_access: Array<{
    portal_type: string;
    access_granted: boolean;
    granted_at: string | null;
  }>;
}

export const PortalAccessManager = () => {
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data: registrations, error } = await supabase
        .from('user_registrations')
        .select(`
          *,
          user_phone_numbers(phone_number, is_primary, is_verified),
          portal_access(portal_type, access_granted, granted_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (registrations || [])
        .filter(reg => reg && typeof reg === 'object')
        .map(reg => ({
          id: reg.id,
          user_id: reg.user_id,
          first_name: reg.first_name,
          last_name: reg.last_name,
          registration_status: reg.registration_status,
          created_at: reg.created_at,
          phone_numbers: Array.isArray(reg.user_phone_numbers) ? reg.user_phone_numbers : [],
          portal_access: Array.isArray(reg.portal_access) ? reg.portal_access : []
        }));
      
      setRegistrations(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const grantPortalAccess = async (userId: string, portalType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('portal_access')
        .upsert({
          user_id: userId,
          portal_type: portalType,
          access_granted: true,
          granted_by: user.id,
          granted_at: new Date().toISOString(),
          notes: notes.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Access Granted",
        description: `Portal access granted for ${portalType}`,
      });

      setNotes('');
      setSelectedUser(null);
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const revokePortalAccess = async (userId: string, portalType: string) => {
    try {
      const { error } = await supabase
        .from('portal_access')
        .update({
          access_granted: false,
          revoked_at: new Date().toISOString(),
          notes: notes.trim() || null
        })
        .eq('user_id', userId)
        .eq('portal_type', portalType);

      if (error) throw error;

      toast({
        title: "Access Revoked",
        description: `Portal access revoked for ${portalType}`,
      });

      setNotes('');
      setSelectedUser(null);
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone_numbers.some(phone => phone.phone_number.includes(searchTerm))
  );

  const getPortalIcon = (portalType: string) => {
    switch (portalType) {
      case 'driver': return <Car className="h-4 w-4" />;
      case 'passenger': return <Users className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Portal Access Management
          </CardTitle>
          <CardDescription>
            Manage user registrations and portal access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {registration.first_name} {registration.last_name}
                      </h3>
                      <Badge variant={registration.registration_status === 'trial' ? 'secondary' : 'default'}>
                        {registration.registration_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {registration.phone_numbers.map((phone, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {phone.phone_number}
                          {phone.is_primary && ' (Primary)'}
                          {phone.is_verified && ' ✓'}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {['passenger', 'driver', 'admin'].map((portalType) => {
                        const access = registration.portal_access.find(
                          a => a.portal_type === portalType
                        );
                        
                        return (
                          <div key={portalType} className="flex items-center gap-1">
                            {getPortalIcon(portalType)}
                            <span className="text-sm capitalize">{portalType}:</span>
                            {access?.access_granted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedUser === registration.user_id ? (
                      <div className="space-y-2 min-w-[200px]">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes for this action..."
                          className="h-20"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(null)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {['passenger', 'driver', 'admin'].map((portalType) => {
                          const access = registration.portal_access.find(
                            a => a.portal_type === portalType
                          );
                          
                          return (
                            <div key={portalType} className="flex gap-2">
                              <Button
                                size="sm"
                                variant={access?.access_granted ? "destructive" : "default"}
                                onClick={() => {
                                  setSelectedUser(registration.user_id);
                                  if (access?.access_granted) {
                                    revokePortalAccess(registration.user_id, portalType);
                                  } else {
                                    grantPortalAccess(registration.user_id, portalType);
                                  }
                                }}
                              >
                                {access?.access_granted ? 'Revoke' : 'Grant'} {portalType}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredRegistrations.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No registrations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};