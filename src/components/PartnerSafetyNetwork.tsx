import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield,
  Camera,
  Church,
  Building2,
  ShoppingBag,
  School,
  Hospital,
  MapPin,
  Users,
  Eye,
  AlertTriangle,
  Wifi,
  Network,
  Clock,
  CheckCircle,
  RadioIcon as Radio,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SafetyPartner {
  id: string;
  name: string;
  type: 'church' | 'mall' | 'municipal' | 'school' | 'hospital' | 'business' | 'residential';
  location: { lat: number; lng: number; address: string };
  cameras: {
    active: number;
    total: number;
    coverage: string[];
  };
  emergencyContacts: {
    primary: string;
    security?: string;
    management?: string;
  };
  operatingHours: string;
  specialCapabilities: string[];
  status: 'active' | 'pending' | 'offline';
  lastUpdate: string;
  integrationLevel: 'basic' | 'advanced' | 'premium';
}

interface NetworkAlert {
  id: string;
  partnerId: string;
  type: 'incident' | 'suspicious' | 'emergency' | 'maintenance';
  description: string;
  timestamp: string;
  witnesses: number;
  crossReferences: string[];
  status: 'active' | 'investigating' | 'resolved';
}

export const PartnerSafetyNetwork = () => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [networkView, setNetworkView] = useState<'grid' | 'map'>('grid');
  const { toast } = useToast();

  const safetyPartners: SafetyPartner[] = [
    {
      id: 'partner-001',
      name: 'Central Methodist Church',
      type: 'church',
      location: { lat: -25.7479, lng: 28.2293, address: '123 Church Street, Pretoria East' },
      cameras: { active: 8, total: 10, coverage: ['main_entrance', 'parking', 'community_hall', 'children_area'] },
      emergencyContacts: { primary: '012-345-6789', security: '082-123-4567' },
      operatingHours: 'Sun: 06:00-21:00, Wed: 18:00-21:00',
      specialCapabilities: ['large_gathering_monitoring', 'community_events', 'safe_haven'],
      status: 'active',
      lastUpdate: '2 minutes ago',
      integrationLevel: 'advanced'
    },
    {
      id: 'partner-002',
      name: 'Denlyn Shopping Center',
      type: 'mall',
      location: { lat: -25.7489, lng: 28.2303, address: 'Denlyn Road, Mamelodi East' },
      cameras: { active: 24, total: 28, coverage: ['entrances', 'parking_levels', 'atm_areas', 'food_court', 'corridors'] },
      emergencyContacts: { primary: '012-987-6543', security: '083-987-6543', management: '071-456-7890' },
      operatingHours: 'Mon-Sat: 09:00-18:00, Sun: 09:00-17:00',
      specialCapabilities: ['high_traffic_monitoring', 'vehicle_tracking', 'facial_recognition', 'emergency_broadcast'],
      status: 'active',
      lastUpdate: '1 minute ago',
      integrationLevel: 'premium'
    },
    {
      id: 'partner-003',
      name: 'Mamelodi East Municipal Offices',
      type: 'municipal',
      location: { lat: -25.7469, lng: 28.2283, address: 'Municipal Complex, Mamelodi East' },
      cameras: { active: 12, total: 15, coverage: ['public_areas', 'service_points', 'parking', 'perimeter'] },
      emergencyContacts: { primary: '012-111-2222', security: '082-111-2222' },
      operatingHours: 'Mon-Fri: 08:00-16:30',
      specialCapabilities: ['government_liaison', 'emergency_coordination', 'public_address'],
      status: 'active',
      lastUpdate: '5 minutes ago',
      integrationLevel: 'advanced'
    },
    {
      id: 'partner-004',
      name: 'Mamelodi High School',
      type: 'school',
      location: { lat: -25.7459, lng: 28.2273, address: 'School Avenue, Mamelodi East' },
      cameras: { active: 6, total: 8, coverage: ['main_gate', 'sports_field', 'admin_block'] },
      emergencyContacts: { primary: '012-444-5555', security: '084-444-5555' },
      operatingHours: 'Mon-Fri: 07:00-16:00',
      specialCapabilities: ['child_safety_protocols', 'parent_notification', 'emergency_lockdown'],
      status: 'active',
      lastUpdate: '3 minutes ago',
      integrationLevel: 'basic'
    },
    {
      id: 'partner-005',
      name: 'Mamelodi Community Clinic',
      type: 'hospital',
      location: { lat: -25.7449, lng: 28.2263, address: 'Health Street, Mamelodi East' },
      cameras: { active: 4, total: 6, coverage: ['entrance', 'waiting_area', 'parking'] },
      emergencyContacts: { primary: '012-777-8888', security: '085-777-8888' },
      operatingHours: '24/7',
      specialCapabilities: ['medical_emergency_response', 'ambulance_coordination', 'victim_care'],
      status: 'active',
      lastUpdate: '4 minutes ago',
      integrationLevel: 'advanced'
    }
  ];

  const networkAlerts: NetworkAlert[] = [
    {
      id: 'alert-001',
      partnerId: 'partner-002',
      type: 'incident',
      description: 'Suspicious individuals near ATM area - 3 cameras tracking movement',
      timestamp: '3 minutes ago',
      witnesses: 2,
      crossReferences: ['partner-001', 'partner-003'],
      status: 'investigating'
    },
    {
      id: 'alert-002',
      partnerId: 'partner-001',
      type: 'emergency',
      description: 'Medical emergency in community hall - ambulance requested',
      timestamp: '8 minutes ago',
      witnesses: 1,
      crossReferences: ['partner-005'],
      status: 'active'
    },
    {
      id: 'alert-003',
      partnerId: 'partner-004',
      type: 'suspicious',
      description: 'Unidentified vehicle circling school perimeter during hours',
      timestamp: '15 minutes ago',
      witnesses: 3,
      crossReferences: ['partner-003'],
      status: 'resolved'
    }
  ];

  const getPartnerIcon = (type: string) => {
    switch (type) {
      case 'church': return <Church className="h-5 w-5" />;
      case 'mall': return <ShoppingBag className="h-5 w-5" />;
      case 'municipal': return <Building2 className="h-5 w-5" />;
      case 'school': return <School className="h-5 w-5" />;
      case 'hospital': return <Hospital className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-black';
      case 'offline': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIntegrationBadge = (level: string) => {
    switch (level) {
      case 'premium': return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium AI</Badge>;
      case 'advanced': return <Badge className="bg-primary text-white">Advanced</Badge>;
      case 'basic': return <Badge variant="outline">Basic</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handlePartnerAction = (action: string, partnerId: string) => {
    const partner = safetyPartners.find(p => p.id === partnerId);
    toast({
      title: `${action} initiated`,
      description: `Action sent to ${partner?.name}`,
    });
  };

  const calculateNetworkCoverage = () => {
    const totalCameras = safetyPartners.reduce((sum, partner) => sum + partner.cameras.active, 0);
    const activePartners = safetyPartners.filter(p => p.status === 'active').length;
    const coveragePercentage = Math.round((activePartners / safetyPartners.length) * 100);
    
    return { totalCameras, activePartners, coveragePercentage };
  };

  const networkStats = calculateNetworkCoverage();

  return (
    <div className="space-y-6">
      {/* Network Overview Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Community Safety Partners Network
            <Badge className="bg-success text-white animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{networkStats.activePartners}</div>
              <div className="text-sm text-muted-foreground">Active Partners</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{networkStats.totalCameras}</div>
              <div className="text-sm text-muted-foreground">Live Cameras</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{networkStats.coveragePercentage}%</div>
              <div className="text-sm text-muted-foreground">Area Coverage</div>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-muted-foreground">Real-time Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="live-feed" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Network
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {safetyPartners.map((partner) => (
              <Card key={partner.id} className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPartnerIcon(partner.type)}
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{partner.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Camera Status */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Cameras</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">{partner.cameras.active}/{partner.cameras.total}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>

                  {/* Coverage Areas */}
                  <div>
                    <div className="text-sm font-medium mb-2">Coverage Areas</div>
                    <div className="flex flex-wrap gap-1">
                      {partner.cameras.coverage.slice(0, 3).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area.replace('_', ' ')}
                        </Badge>
                      ))}
                      {partner.cameras.coverage.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.cameras.coverage.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Integration Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Integration:</span>
                    {getIntegrationBadge(partner.integrationLevel)}
                  </div>

                  {/* Special Capabilities */}
                  <div>
                    <div className="text-sm font-medium mb-2">Special Capabilities</div>
                    <div className="flex flex-wrap gap-1">
                      {partner.specialCapabilities.slice(0, 2).map((capability) => (
                        <Badge key={capability} className="bg-purple-500/10 text-purple-700 text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{partner.operatingHours}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePartnerAction('View Live Feed', partner.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Live Feed
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() => handlePartnerAction('Contact', partner.id)}
                    >
                      <Radio className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>

                  {/* Last Update */}
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Last update: {partner.lastUpdate}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Network Feed */}
        <TabsContent value="live-feed">
          <div className="space-y-6">
            {/* Active Alerts */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Live Network Alerts
                  <Badge className="bg-warning text-black animate-pulse">
                    {networkAlerts.filter(a => a.status === 'active').length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {networkAlerts.map((alert) => (
                    <Card key={alert.id} className={`border-l-4 ${
                      alert.status === 'active' ? 'border-l-destructive bg-destructive/5' :
                      alert.status === 'investigating' ? 'border-l-warning bg-warning/5' :
                      'border-l-success bg-success/5'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                alert.type === 'emergency' ? 'bg-destructive text-white' :
                                alert.type === 'incident' ? 'bg-warning text-black' :
                                'bg-primary text-white'
                              }>
                                {alert.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                            </div>
                            <p className="text-sm font-medium mb-2">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {alert.witnesses} witness cameras
                              </div>
                              <div className="flex items-center gap-1">
                                <Network className="h-3 w-3" />
                                {alert.crossReferences.length} cross-references
                              </div>
                            </div>
                          </div>
                          <Badge className={
                            alert.status === 'active' ? 'bg-destructive text-white' :
                            alert.status === 'investigating' ? 'bg-warning text-black' :
                            'bg-success text-white'
                          }>
                            {alert.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multi-Perspective Incident View */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Multi-Perspective Incident Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-purple-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="font-medium">Mall Camera A3</span>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">Angle: Entrance view</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-success/5 to-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Church className="h-4 w-4 text-success" />
                      <span className="font-medium">Church Parking</span>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">Angle: Adjacent street</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-warning/5 to-success/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-warning" />
                      <span className="font-medium">Municipal Cam</span>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">Angle: Street overview</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">AI Cross-Analysis Complete</span>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mt-1">
                    3 camera angles analyzed • Movement tracked • Suspect identified
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Management */}
        <TabsContent value="integration">
          <div className="space-y-6">
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Partner Integration Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Integration Levels Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-muted/50">
                      <CardContent className="p-4">
                        <Badge variant="outline" className="mb-2">Basic</Badge>
                        <h4 className="font-medium mb-2">Community Partner</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Camera feed sharing</li>
                          <li>• Basic alert notifications</li>
                          <li>• Emergency contact integration</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-primary/50">
                      <CardContent className="p-4">
                        <Badge className="bg-primary text-white mb-2">Advanced</Badge>
                        <h4 className="font-medium mb-2">Strategic Partner</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Real-time data sharing</li>
                          <li>• Cross-reference analysis</li>
                          <li>• Automated response protocols</li>
                          <li>• Resource coordination</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-500/50">
                      <CardContent className="p-4">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-2">Premium AI</Badge>
                        <h4 className="font-medium mb-2">Intelligence Hub</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• AI-powered analytics</li>
                          <li>• Predictive threat detection</li>
                          <li>• Multi-angle reconstruction</li>
                          <li>• Evidence chain automation</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Partner Onboarding */}
                  <Card className="border-success/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Safety Partner</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Partner name" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Partner type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="church">Church/Religious</SelectItem>
                            <SelectItem value="mall">Shopping Center</SelectItem>
                            <SelectItem value="municipal">Municipal Building</SelectItem>
                            <SelectItem value="school">Educational Institution</SelectItem>
                            <SelectItem value="hospital">Healthcare Facility</SelectItem>
                            <SelectItem value="business">Business Complex</SelectItem>
                            <SelectItem value="residential">Residential Complex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="Address" />
                        <Input placeholder="Contact person" />
                        <Input placeholder="Phone number" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Number of cameras" type="number" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Integration level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Partnership</SelectItem>
                            <SelectItem value="advanced">Advanced Integration</SelectItem>
                            <SelectItem value="premium">Premium AI Hub</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button className="w-full bg-success hover:bg-success/90">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Partnership Application
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Analytics */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Cost Reduction Analysis */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Cost Reduction & Efficiency Gains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">R 2.3M</div>
                    <div className="text-sm text-muted-foreground">Annual Savings</div>
                    <div className="text-xs text-success">vs. State-only infrastructure</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">67%</div>
                    <div className="text-sm text-muted-foreground">Coverage Increase</div>
                    <div className="text-xs text-primary">through partnerships</div>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-warning">45s</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    <div className="text-xs text-warning">multi-angle detection</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-muted-foreground">Incident Resolution</div>
                    <div className="text-xs text-purple-600">with cross-references</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Network Coverage Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-success/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Interactive coverage visualization</p>
                      <Button variant="outline" className="mt-2">View Full Map</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/20">
                <CardHeader>
                  <CardTitle className="text-lg">Partnership Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <span className="text-sm font-medium">State Resource Reduction</span>
                      <span className="font-bold text-success">-72%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="text-sm font-medium">Community Engagement</span>
                      <span className="font-bold text-primary">+240%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <span className="text-sm font-medium">Crime Deterrence</span>
                      <span className="font-bold text-warning">+156%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm font-medium">Evidence Quality</span>
                      <span className="font-bold text-purple-600">+203%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};