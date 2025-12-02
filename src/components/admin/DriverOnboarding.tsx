import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Save, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  registration_number: string;
  route_number: string | null;
  notes: string | null;
}

const DriverOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    driversLicenseNumber: '',
    pdpNumber: '',
    vehicleId: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('id, registration_number, route_number, notes')
      .eq('status', 'active')
      .order('route_number');
    
    if (data) setVehicles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create driver registration record
      const { error: regError } = await supabase
        .from('user_registrations')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          id_number: formData.idNumber || null,
          drivers_license_number: formData.driversLicenseNumber || null,
          pdp_number: formData.pdpNumber || null,
          registration_status: formData.driversLicenseNumber ? 'pending' : 'needs_license'
        });

      if (regError) throw regError;

      // If vehicle selected, update vehicle notes with driver info
      if (formData.vehicleId) {
        const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (selectedVehicle) {
          const driverInfo = `Driver: ${formData.firstName} ${formData.lastName}${formData.idNumber ? ` | ID: ${formData.idNumber}` : ''}`;
          const updatedNotes = selectedVehicle.notes 
            ? `${selectedVehicle.notes} | ${driverInfo}`
            : driverInfo;

          await supabase
            .from('vehicles')
            .update({ 
              notes: updatedNotes,
              assigned_driver_id: null // Will be linked when driver has user account
            })
            .eq('id', formData.vehicleId);
        }
      }

      toast({
        title: "Driver Onboarded",
        description: `${formData.firstName} ${formData.lastName} has been registered for the Driver Licence Initiative.`,
      });

      setFormData({
        firstName: '',
        lastName: '',
        idNumber: '',
        phone: '',
        driversLicenseNumber: '',
        pdpNumber: '',
        vehicleId: '',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Onboarding Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Driver Onboarding
        </CardTitle>
        <CardDescription className="space-y-1">
          <span className="block">Register drivers for the Driver Licence Initiative</span>
          <Badge variant="outline" className="text-xs">
            <GraduationCap className="h-3 w-3 mr-1" />
            Cllr Debbie Williams - SALGA Regulatory Compliance
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverFirstName">First Name *</Label>
              <Input
                id="driverFirstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="e.g. Jayvandrey"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverLastName">Last Name *</Label>
              <Input
                id="driverLastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="e.g. Vyfers"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverIdNumber">SA ID Number *</Label>
              <Input
                id="driverIdNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                placeholder="e.g. 0411045090080"
                maxLength={13}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Phone Number</Label>
              <Input
                id="driverPhone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 0821234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driversLicense">Driver's License Number</Label>
              <Input
                id="driversLicense"
                value={formData.driversLicenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, driversLicenseNumber: e.target.value }))}
                placeholder="Leave blank if needs license"
              />
              <p className="text-xs text-muted-foreground">Leave blank for licence initiative candidates</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdpNumber">PDP Number</Label>
              <Input
                id="pdpNumber"
                value={formData.pdpNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, pdpNumber: e.target.value }))}
                placeholder="Professional Driving Permit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleAssign">Assign to Vehicle</Label>
            <Select
              value={formData.vehicleId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle (optional)" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.route_number} - {vehicle.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverNotes">Notes</Label>
            <Textarea
              id="driverNotes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes, training requirements, etc..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Registering...' : 'Onboard Driver'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverOnboarding;
