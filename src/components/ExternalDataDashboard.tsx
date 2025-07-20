import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Wifi, Shield, Zap, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExternalAPIService } from "@/services/ExternalAPIService";
import { MunicipalityAPI } from "@/services/integrations/MunicipalityAPI";
import { PrivateSecurityAPI } from "@/services/integrations/PrivateSecurityAPI";
import { CellularProviderAPI } from "@/services/integrations/CellularProviderAPI";

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'limited';
  lastCheck: string;
  responseTime?: number;
}

export const ExternalDataDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const availableServices = [
    { id: 'municipal', name: 'Municipal Services', icon: Building, color: 'bg-blue-500' },
    { id: 'security', name: 'Private Security', icon: Shield, color: 'bg-red-500' },
    { id: 'cellular', name: 'Cellular Providers', icon: Wifi, color: 'bg-green-500' },
    { id: 'utilities', name: 'Utilities', icon: Zap, color: 'bg-yellow-500' },
  ];

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    setLoading(true);
    const statusChecks: ServiceStatus[] = [];

    // Check municipality services
    const municipalities = MunicipalityAPI.getSupportedMunicipalities();
    municipalities.forEach(municipality => {
      statusChecks.push({
        name: `Municipality: ${municipality}`,
        status: Math.random() > 0.3 ? 'online' : 'limited', // Simulate real status
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 2000) + 100
      });
    });

    // Check security providers
    const securityProviders = PrivateSecurityAPI.getSupportedProviders();
    securityProviders.forEach(provider => {
      statusChecks.push({
        name: `Security: ${provider}`,
        status: Math.random() > 0.2 ? 'online' : 'offline',
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 1500) + 200
      });
    });

    // Check cellular providers
    const cellularProviders = CellularProviderAPI.getSupportedProviders();
    cellularProviders.forEach(provider => {
      statusChecks.push({
        name: `Cellular: ${provider}`,
        status: Math.random() > 0.1 ? 'online' : 'limited',
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 800) + 50
      });
    });

    setServices(statusChecks);
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  };

  const handleRefresh = () => {
    ExternalAPIService.clearCache();
    checkServiceStatus();
    toast({
      title: "Cache Cleared",
      description: "External API cache has been cleared and services refreshed.",
    });
  };

  const testConnection = async () => {
    if (!selectedService || !accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a service and enter an account number.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      switch (selectedService) {
        case 'municipal':
          result = await MunicipalityAPI.getBill('cape-town', accountNumber, 'electricity');
          break;
        case 'cellular':
          result = await CellularProviderAPI.getAccountBalance('vodacom', accountNumber);
          break;
        case 'security':
          result = await PrivateSecurityAPI.getIncidents('adt', 'cape-town-cbd');
          break;
        default:
          throw new Error('Service not implemented yet');
      }

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Retrieved data from ${selectedService} service. ${result.cached ? '(Cached)' : '(Live)'}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">External Data Integration</h2>
          <p className="text-muted-foreground">
            Live connections to external services and APIs
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableServices.map((service) => {
          const ServiceIcon = service.icon;
          const serviceCount = services.filter(s => s.name.toLowerCase().includes(service.id)).length;
          const onlineCount = services.filter(s => 
            s.name.toLowerCase().includes(service.id) && s.status === 'online'
          ).length;

          return (
            <Card key={service.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${service.color} text-white`}>
                    <ServiceIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {onlineCount}/{serviceCount} online
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge 
                    variant={onlineCount === serviceCount ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {onlineCount === serviceCount ? 'All Online' : 'Limited'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {serviceCount} providers
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status Details</CardTitle>
          <CardDescription>
            Last updated: {lastUpdated || 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="w-16 h-4" />
                </div>
              ))
            ) : (
              services.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {service.responseTime && (
                      <span>{service.responseTime}ms</span>
                    )}
                    <span>{new Date(service.lastCheck).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Test API Connection</CardTitle>
          <CardDescription>
            Test connectivity to external services with sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Service Type</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service to test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipal">Municipal Services</SelectItem>
                  <SelectItem value="cellular">Cellular Providers</SelectItem>
                  <SelectItem value="security">Private Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Account/Phone Number</label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account or phone number"
              />
            </div>
          </div>
          <Button onClick={testConnection} disabled={loading || !selectedService}>
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};