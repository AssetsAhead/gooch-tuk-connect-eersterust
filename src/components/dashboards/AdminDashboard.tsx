import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Car, User, Settings, Shield, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { IPDocumentationSystem } from "@/components/IPDocumentationSystem";
import { RoleRequestsManager } from "@/components/admin/RoleRequestsManager";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import FleetDataImport from "@/components/admin/FleetDataImport";
import OwnerRegistration from "@/components/admin/OwnerRegistration";
import DriverOnboarding from "@/components/admin/DriverOnboarding";
import { SmsUsageTracker } from "@/components/admin/SmsUsageTracker";
import { RevenueIntelligence } from "@/components/fleet/RevenueIntelligence";
import { VideoFrameExtractor } from "@/components/camera/VideoFrameExtractor";

export const AdminDashboard = () => {
  const [sassaVerifications, setSassaVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const pendingApprovals = [
    { name: "Lucky Mthembu", type: "New Driver", vehicle: "TT012", status: "pending" },
    { name: "Grace Sibeko", type: "New Owner", vehicles: "2", status: "pending" },
    { name: "John Mokgosi", type: "License Renewal", vehicle: "TT005", status: "urgent" }
  ];

  useEffect(() => {
    fetchSassaVerifications();
  }, []);

  const fetchSassaVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('sassa_verifications')
        .select(`
          id,
          user_id,
          status,
          grant_type,
          card_photo_url,
          verification_notes,
          created_at,
          profiles!inner(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSassaVerifications(data || []);
    } catch (error) {
      console.error('Error fetching SASSA verifications:', error);
    }
  };

  const handleVerificationAction = async (id, status, notes = '') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sassa_verifications')
        .update({
          status,
          verification_notes: notes,
          verified_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `SASSA verification ${status}`,
        description: `The verification has been ${status} successfully.`,
      });

      fetchSassaVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} verification: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recentIncidents = [
    { id: "INC001", type: "Theft Report", reporter: "Sipho M.", severity: "high", status: "investigating" },
    { id: "INC002", type: "Lost Item", reporter: "Mary K.", severity: "low", status: "resolved" },
    { id: "INC003", type: "Vehicle Damage", reporter: "Thabo N.", severity: "medium", status: "pending" }
  ];

  const systemStats = {
    totalDrivers: 127,
    activeDrivers: 89,
    totalVehicles: 95,
    activeVehicles: 67,
    totalOwners: 45,
    todayRides: 234,
    monthlyRevenue: "R45,670",
    platformFees: "R2,280"
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Admin Dashboard - {userProfile?.display_name || user?.email}
            </h1>
            <p className="text-muted-foreground">Complete oversight of the PoortLink ecosystem</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-success/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{systemStats.totalDrivers}</div>
              <p className="text-xs text-muted-foreground">Total Drivers</p>
              <Badge variant="outline" className="text-xs mt-1 border-success text-success">
                {systemStats.activeDrivers} Active
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{systemStats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">Total Vehicles</p>
              <Badge variant="outline" className="text-xs mt-1 border-primary text-primary">
                {systemStats.activeVehicles} Active
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-tuk-orange/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tuk-orange">{systemStats.todayRides}</div>
              <p className="text-xs text-muted-foreground">Today's Rides</p>
            </CardContent>
          </Card>
          <Card className="border-tuk-blue/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tuk-blue">{systemStats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              <div className="text-xs text-muted-foreground mt-1">Fees: {systemStats.platformFees}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-8">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
            <TabsList className="inline-flex w-max min-w-full md:min-w-0 gap-1 p-1">
              <TabsTrigger value="approvals" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Approvals</TabsTrigger>
              <TabsTrigger value="role-requests" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Roles</TabsTrigger>
              <TabsTrigger value="revenue" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Revenue</TabsTrigger>
              <TabsTrigger value="roles" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Switch</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Analytics</TabsTrigger>
              <TabsTrigger value="sms-usage" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">SMS</TabsTrigger>
              <TabsTrigger value="sassa" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">SASSA</TabsTrigger>
              <TabsTrigger value="monitoring" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Monitor</TabsTrigger>
              <TabsTrigger value="incidents" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Incidents</TabsTrigger>
              <TabsTrigger value="reports" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Reports</TabsTrigger>
              <TabsTrigger value="ip-docs" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">IP</TabsTrigger>
              <TabsTrigger value="video-scan" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Video</TabsTrigger>
              <TabsTrigger value="fleet-import" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Fleet</TabsTrigger>
              <TabsTrigger value="owner-reg" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Owner</TabsTrigger>
              <TabsTrigger value="driver-onboard" className="whitespace-nowrap text-xs px-2 py-1.5 md:text-sm md:px-3">Driver</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{approval.name}</div>
                        <p className="text-sm text-muted-foreground">
                          {approval.type} - {approval.vehicle || `${approval.vehicles} vehicles`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={approval.status === "urgent" ? "destructive" : "outline"}>
                          {approval.status}
                        </Badge>
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-danger text-danger">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blacklist Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Search drivers/owners..." />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-danger/10 rounded">
                      <span className="text-sm">Moses Tshwane (TT008)</span>
                      <Badge variant="destructive">Blacklisted</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-warning/10 rounded">
                      <span className="text-sm">Peter Mabaso (TT015)</span>
                      <Badge className="bg-warning text-white">Under Review</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Champion Recognition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-success/10 rounded">
                      <span className="text-sm">Sipho Mthembu (TT001)</span>
                      <Badge className="bg-success text-white">Champion</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-tuk-blue/10 rounded">
                      <span className="text-sm">Maria Santos (TT009)</span>
                      <Badge className="bg-tuk-blue text-white">Rising Star</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Send Recognition Awards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="role-requests" className="space-y-6">
            <RoleRequestsManager />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueIntelligence />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Role Management & Switching
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Switch between your available roles or request new ones. As an admin, you can access all dashboards.
                </p>
              </CardHeader>
              <CardContent>
                <RoleSwitcher />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="sms-usage" className="space-y-6">
            <SmsUsageTracker />
          </TabsContent>

          <TabsContent value="sassa" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      SASSA Verification Review
                    </CardTitle>
                  </div>
                  <Button onClick={() => navigate('/admin/sassa-verifications')}>
                    View Full Dashboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sassaVerifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No SASSA verifications to review
                    </div>
                  ) : (
                    sassaVerifications.slice(0, 5).map((verification) => (
                      <SassaVerificationReview
                        key={verification.id}
                        verification={verification}
                        onAction={handleVerificationAction}
                        loading={loading}
                      />
                    ))
                  )}
                  {sassaVerifications.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/admin/sassa-verifications')}
                      >
                        View All {sassaVerifications.length} Verifications
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Live Vehicle Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <Car className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Live GPS tracking map would be integrated here
                    </p>
                    <Button variant="outline" className="mt-2">
                      View Full Map
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-2 bg-danger/10 rounded">
                      <div className="w-2 h-2 bg-danger rounded-full"></div>
                      <span className="text-sm">TT007 - Speed limit exceeded</span>
                      <Badge variant="destructive" className="ml-auto">HIGH</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-warning/10 rounded">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span className="text-sm">TT003 - Route deviation</span>
                      <Badge className="ml-auto bg-warning text-white">MEDIUM</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-tuk-blue/10 rounded">
                      <div className="w-2 h-2 bg-tuk-blue rounded-full"></div>
                      <span className="text-sm">TT012 - Maintenance due</span>
                      <Badge variant="outline" className="ml-auto">INFO</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Recent Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{incident.id}</Badge>
                          <span className="font-medium">{incident.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reported by: {incident.reporter}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={incident.severity === "high" ? "destructive" : 
                                 incident.severity === "medium" ? "default" : "outline"}
                        >
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={incident.status === "resolved" ? "default" : "outline"}>
                          {incident.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Daily Operations Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Driver Performance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Car className="mr-2 h-4 w-4" />
                    Vehicle Utilization Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Route Analysis Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>App Uptime</span>
                      <Badge className="bg-success text-white">99.8%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment Success Rate</span>
                      <Badge className="bg-success text-white">97.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>GPS Accuracy</span>
                      <Badge className="bg-tuk-blue text-white">95.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Satisfaction</span>
                      <Badge className="bg-primary text-white">4.6/5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ip-docs" className="space-y-6">
            <IPDocumentationSystem />
          </TabsContent>

          <TabsContent value="video-scan" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <VideoFrameExtractor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet-import" className="space-y-6">
            <FleetDataImport />
          </TabsContent>

          <TabsContent value="owner-reg" className="space-y-6">
            <OwnerRegistration />
          </TabsContent>

          <TabsContent value="driver-onboard" className="space-y-6">
            <DriverOnboarding />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const SassaVerificationReview = ({ verification, onAction, loading }) => {
  const [notes, setNotes] = useState(verification.verification_notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{verification.profiles?.display_name || 'Unknown User'}</div>
          <p className="text-sm text-muted-foreground">
            Grant Type: {verification.grant_type} • Submitted: {formatDate(verification.created_at)}
          </p>
        </div>
        {getStatusBadge(verification.status)}
      </div>

      {verification.card_photo_url && (
        <div className="space-y-2">
          <p className="text-sm font-medium">SASSA Card Photo:</p>
          <img 
            src={verification.card_photo_url} 
            alt="SASSA Card" 
            className="max-w-xs rounded border"
          />
        </div>
      )}

      {verification.verification_notes && (
        <div className="bg-muted/30 p-3 rounded">
          <p className="text-sm"><strong>Admin Notes:</strong> {verification.verification_notes}</p>
        </div>
      )}

      {verification.status === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              variant="outline"
            >
              {showNotes ? 'Hide' : 'Add'} Notes
            </Button>
          </div>

          {showNotes && (
            <Textarea
              placeholder="Add verification notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onAction(verification.id, 'approved', notes)}
              disabled={loading}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              onClick={() => onAction(verification.id, 'rejected', notes)}
              disabled={loading}
              variant="outline"
              className="border-danger text-danger hover:bg-danger/10"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};