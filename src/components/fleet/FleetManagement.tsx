import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, Plus, AlertTriangle, CheckCircle, Clock, 
  Edit, Trash2, User, Calendar, FileText, Shield
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInDays, isPast, addDays } from 'date-fns';

interface Vehicle {
  id: string;
  registration_number: string;
  route_number: string | null;
  vehicle_type: string;
  color: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  owner_id: string | null;
  assigned_driver_id: string | null;
  status: string;
  insurance_expiry: string | null;
  roadworthy_expiry: string | null;
  operating_license_number: string | null;
  notes: string | null;
  created_at: string;
}

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string | null;
}

export const FleetManagement = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    registration_number: '',
    route_number: '',
    vehicle_type: 'tuk_tuk',
    color: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    assigned_driver_id: '',
    status: 'active',
    insurance_expiry: '',
    roadworthy_expiry: '',
    operating_license_number: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchAvailableDrivers();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_registrations')
        .select('id, first_name, last_name, user_id')
        .in('registration_status', ['approved', 'trial']);

      if (error) throw error;
      setAvailableDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      registration_number: '',
      route_number: '',
      vehicle_type: 'tuk_tuk',
      color: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      assigned_driver_id: '',
      status: 'active',
      insurance_expiry: '',
      roadworthy_expiry: '',
      operating_license_number: '',
      notes: ''
    });
    setEditingVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.registration_number) {
      toast.error('Registration number is required');
      return;
    }

    try {
      const vehicleData = {
        registration_number: formData.registration_number.toUpperCase(),
        route_number: formData.route_number || null,
        vehicle_type: formData.vehicle_type,
        color: formData.color || null,
        make: formData.make || null,
        model: formData.model || null,
        year: formData.year || null,
        owner_id: user?.id,
        assigned_driver_id: formData.assigned_driver_id || null,
        status: formData.status,
        insurance_expiry: formData.insurance_expiry || null,
        roadworthy_expiry: formData.roadworthy_expiry || null,
        operating_license_number: formData.operating_license_number || null,
        notes: formData.notes || null
      };

      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) throw error;
        toast.success('Vehicle updated successfully');
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (error) throw error;
        toast.success('Vehicle added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast.error(error.message || 'Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number,
      route_number: vehicle.route_number || '',
      vehicle_type: vehicle.vehicle_type,
      color: vehicle.color || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      assigned_driver_id: vehicle.assigned_driver_id || '',
      status: vehicle.status,
      insurance_expiry: vehicle.insurance_expiry || '',
      roadworthy_expiry: vehicle.roadworthy_expiry || '',
      operating_license_number: vehicle.operating_license_number || '',
      notes: vehicle.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const getComplianceStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: 'unknown', label: 'Not Set', color: 'bg-muted' };
    
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, new Date());

    if (isPast(expiry)) {
      return { status: 'expired', label: 'Expired', color: 'bg-destructive' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', label: `${daysUntilExpiry} days`, color: 'bg-warning' };
    } else {
      return { status: 'valid', label: 'Valid', color: 'bg-success' };
    }
  };

  const getFilteredVehicles = () => {
    switch (activeTab) {
      case 'compliance':
        return vehicles.filter(v => {
          const insurance = getComplianceStatus(v.insurance_expiry);
          const roadworthy = getComplianceStatus(v.roadworthy_expiry);
          return insurance.status !== 'valid' || roadworthy.status !== 'valid';
        });
      case 'active':
        return vehicles.filter(v => v.status === 'active');
      case 'inactive':
        return vehicles.filter(v => v.status !== 'active');
      default:
        return vehicles;
    }
  };

  const complianceIssues = vehicles.filter(v => {
    const insurance = getComplianceStatus(v.insurance_expiry);
    const roadworthy = getComplianceStatus(v.roadworthy_expiry);
    return insurance.status === 'expired' || roadworthy.status === 'expired';
  }).length;

  const upcomingRenewals = vehicles.filter(v => {
    const insurance = getComplianceStatus(v.insurance_expiry);
    const roadworthy = getComplianceStatus(v.roadworthy_expiry);
    return insurance.status === 'warning' || roadworthy.status === 'warning';
  }).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-xs text-muted-foreground">Total Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={complianceIssues > 0 ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-8 w-8 ${complianceIssues > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-2xl font-bold">{complianceIssues}</p>
                <p className="text-xs text-muted-foreground">Compliance Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={upcomingRenewals > 0 ? 'border-warning' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className={`h-8 w-8 ${upcomingRenewals > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-2xl font-bold">{upcomingRenewals}</p>
                <p className="text-xs text-muted-foreground">Renewals Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Fleet Management
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number *</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      placeholder="LC 97TZGP"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route_number">Route Number</Label>
                    <Input
                      id="route_number"
                      value={formData.route_number}
                      onChange={(e) => setFormData({ ...formData, route_number: e.target.value })}
                      placeholder="E153"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select 
                      value={formData.vehicle_type} 
                      onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tuk_tuk">Tuk Tuk</SelectItem>
                        <SelectItem value="minibus_taxi">Minibus Taxi</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="bakkie">Bakkie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Yellow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="Bajaj"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="RE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_driver">Assigned Driver</Label>
                    <Select 
                      value={formData.assigned_driver_id} 
                      onValueChange={(value) => setFormData({ ...formData, assigned_driver_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.user_id || driver.id}>
                            {driver.first_name} {driver.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">In Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                      <Input
                        id="insurance_expiry"
                        type="date"
                        value={formData.insurance_expiry}
                        onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roadworthy_expiry">Roadworthy Expiry</Label>
                      <Input
                        id="roadworthy_expiry"
                        type="date"
                        value={formData.roadworthy_expiry}
                        onChange={(e) => setFormData({ ...formData, roadworthy_expiry: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="operating_license_number">Operating License Number</Label>
                    <Input
                      id="operating_license_number"
                      value={formData.operating_license_number}
                      onChange={(e) => setFormData({ ...formData, operating_license_number: e.target.value })}
                      placeholder="License number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({vehicles.length})</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="compliance" className={complianceIssues > 0 ? 'text-destructive' : ''}>
                Compliance {complianceIssues > 0 && `(${complianceIssues})`}
              </TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {getFilteredVehicles().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No vehicles found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    Add your first vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredVehicles().map((vehicle) => {
                    const insuranceStatus = getComplianceStatus(vehicle.insurance_expiry);
                    const roadworthyStatus = getComplianceStatus(vehicle.roadworthy_expiry);
                    const driver = availableDrivers.find(d => d.user_id === vehicle.assigned_driver_id);

                    return (
                      <div
                        key={vehicle.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${vehicle.status === 'active' ? 'bg-success/10' : 'bg-muted'}`}>
                            <Car className={`h-6 w-6 ${vehicle.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{vehicle.registration_number}</h4>
                              {vehicle.route_number && (
                                <Badge variant="outline">{vehicle.route_number}</Badge>
                              )}
                              <Badge className={vehicle.status === 'active' ? 'bg-success' : 'bg-muted'}>
                                {vehicle.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {vehicle.color && `${vehicle.color} `}
                              {vehicle.vehicle_type.replace('_', ' ')}
                              {vehicle.make && ` • ${vehicle.make}`}
                              {vehicle.model && ` ${vehicle.model}`}
                              {vehicle.year && ` (${vehicle.year})`}
                            </div>
                            {driver && (
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <User className="h-3 w-3" />
                                <span>{driver.first_name} {driver.last_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4 md:mt-0">
                          <div className="flex gap-2">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Insurance</p>
                              <Badge className={insuranceStatus.color}>{insuranceStatus.label}</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Roadworthy</p>
                              <Badge className={roadworthyStatus.color}>{roadworthyStatus.label}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
