import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Zap, 
  Droplets, 
  Home, 
  CreditCard, 
  Upload,
  Download,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MunicipalService {
  id: string;
  service_type: string;
  account_number: string;
  municipality: string;
  property_address: string;
  current_balance: number;
  due_date: string;
  status: string;
  auto_pay_enabled: boolean;
}

interface MunicipalBill {
  id: string;
  service_id: string;
  bill_date: string;
  due_date: string;
  amount: number;
  consumption: number;
  payment_status: string;
  bill_number: string;
}

export default function MunicipalServices() {
  const [services, setServices] = useState<MunicipalService[]>([]);
  const [bills, setBills] = useState<MunicipalBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newService, setNewService] = useState({
    service_type: '',
    account_number: '',
    municipality: '',
    property_address: '',
    current_balance: 0,
    due_date: ''
  });

  useEffect(() => {
    fetchServices();
    fetchBills();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('municipal_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load municipal services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('municipal_bills')
        .select('*')
        .order('bill_date', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const addService = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('municipal_services')
        .insert([{
          ...newService,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Municipal service added successfully",
      });

      setIsDialogOpen(false);
      setNewService({
        service_type: '',
        account_number: '',
        municipality: '',
        property_address: '',
        current_balance: 0,
        due_date: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add municipal service",
        variant: "destructive",
      });
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'rates_taxes': return <Home className="h-5 w-5" />;
      case 'water': return <Droplets className="h-5 w-5" />;
      case 'electricity': return <Zap className="h-5 w-5" />;
      case 'property_valuation': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'rates_taxes': return 'Municipal Rates & Taxes';
      case 'water': return 'Water Services';
      case 'electricity': return 'Electricity';
      case 'property_valuation': return 'Property Valuation';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'active': return 'bg-blue-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading municipal services...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Municipal Services</h1>
          <p className="text-muted-foreground">Manage your municipal accounts and bills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Municipal Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={newService.service_type} onValueChange={(value) => 
                  setNewService(prev => ({ ...prev, service_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rates_taxes">Municipal Rates & Taxes</SelectItem>
                    <SelectItem value="water">Water Services</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="property_valuation">Property Valuation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={newService.account_number}
                  onChange={(e) => setNewService(prev => ({ ...prev, account_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="municipality">Municipality</Label>
                <Input
                  id="municipality"
                  value={newService.municipality}
                  onChange={(e) => setNewService(prev => ({ ...prev, municipality: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="property_address">Property Address</Label>
                <Input
                  id="property_address"
                  value={newService.property_address}
                  onChange={(e) => setNewService(prev => ({ ...prev, property_address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="current_balance">Current Balance (R)</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  value={newService.current_balance}
                  onChange={(e) => setNewService(prev => ({ ...prev, current_balance: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newService.due_date}
                  onChange={(e) => setNewService(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <Button onClick={addService} className="w-full">
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">My Services</TabsTrigger>
          <TabsTrigger value="bills">Bills & History</TabsTrigger>
          <TabsTrigger value="payments">Payment Options</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getServiceIcon(service.service_type)}
                    {getServiceName(service.service_type)}
                  </CardTitle>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      R{service.current_balance.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Account: {service.account_number}</div>
                      <div>Municipality: {service.municipality}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(service.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
              <CardDescription>Your municipal bill history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Bill #{bill.bill_number}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(bill.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">R{bill.amount.toFixed(2)}</div>
                      <Badge 
                        variant={bill.payment_status === 'paid' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {bill.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Auto-Pay Setup
                </CardTitle>
                <CardDescription>
                  Automatically pay your municipal bills on time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configure Auto-Pay
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  Upload Bill
                </CardTitle>
                <CardDescription>
                  Upload your paper bills for digital tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Bill due date reminders</span>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment confirmations</span>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service disconnection warnings</span>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}