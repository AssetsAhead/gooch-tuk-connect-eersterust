import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Phone, Mail, MapPin, Users, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PassengerApplication {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  homeArea: string;
  workArea: string;
  transportNeeds: string[];
  currentTransport: string;
  weeklyTrips: string;
  monthlyBudget: string;
  painPoints: string;
  expectations: string;
  hasSmartphone: boolean;
  internetAccess: boolean;
  paymentPreference: string;
  status: 'pending' | 'approved' | 'contacted' | 'onboarded' | 'rejected';
  appliedAt: string;
  notes?: string;
}

const PassengerRecruitmentDashboard = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PassengerApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<PassengerApplication | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data for demo - in production this would come from database
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    // Load from localStorage for demo
    const storedProfiles = Object.keys(localStorage)
      .filter(key => key.startsWith('passenger_profile_'))
      .map(key => {
        const profile = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          id: key.replace('passenger_profile_', ''),
          ...profile,
          status: 'pending' as const,
          appliedAt: new Date().toISOString()
        };
      });
    
    setApplications(storedProfiles);
    setLoading(false);
  };

  const filteredApplications = applications.filter(app =>
    app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone.includes(searchTerm) ||
    app.homeArea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateApplicationStatus = async (appId: string, newStatus: PassengerApplication['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, status: newStatus, notes } : app
      )
    );
    
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}`,
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    onboarded: applications.filter(app => app.status === 'onboarded').length,
  };

  const getStatusBadge = (status: PassengerApplication['status']) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      contacted: 'outline',
      onboarded: 'default',
      rejected: 'destructive'
    } as const;
    
    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return <div className="p-6">Loading applications...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Passenger Recruitment Dashboard</h1>
          <p className="text-muted-foreground">Manage pilot program applications and recruitment</p>
        </div>
        <Button className="bg-sa-green hover:bg-sa-green-light">
          Export Applications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Requires action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Ready for onboarding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pilots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onboarded}</div>
            <p className="text-xs text-muted-foreground">
              Currently in program
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="onboarded">Active ({stats.onboarded})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <ApplicationsTable 
                applications={filteredApplications} 
                onViewDetails={setSelectedApplication}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <ApplicationsTable 
                applications={filteredApplications.filter(app => app.status === 'pending')} 
                onViewDetails={setSelectedApplication}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="approved" className="mt-4">
              <ApplicationsTable 
                applications={filteredApplications.filter(app => app.status === 'approved')} 
                onViewDetails={setSelectedApplication}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            
            <TabsContent value="onboarded" className="mt-4">
              <ApplicationsTable 
                applications={filteredApplications.filter(app => app.status === 'onboarded')} 
                onViewDetails={setSelectedApplication}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review and manage passenger application for {selectedApplication.firstName} {selectedApplication.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-24">Name:</span>
                      <span>{selectedApplication.firstName} {selectedApplication.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{selectedApplication.phone}</span>
                    </div>
                    {selectedApplication.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{selectedApplication.email}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Home: {selectedApplication.homeArea}</span>
                    </div>
                    {selectedApplication.workArea && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Work: {selectedApplication.workArea}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Transport Profile</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Current Transport:</span> {selectedApplication.currentTransport}</div>
                    <div><span className="font-medium">Weekly Trips:</span> {selectedApplication.weeklyTrips}</div>
                    <div><span className="font-medium">Monthly Budget:</span> {selectedApplication.monthlyBudget}</div>
                    <div><span className="font-medium">Payment Preference:</span> {selectedApplication.paymentPreference}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Technology</h3>
                  <div className="space-y-1 text-sm">
                    <div>Smartphone: {selectedApplication.hasSmartphone ? '✅ Yes' : '❌ No'}</div>
                    <div>Internet Access: {selectedApplication.internetAccess ? '✅ Yes' : '❌ No'}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Transport Needs</h3>
                  <div className="space-y-1">
                    {selectedApplication.transportNeeds.map(need => (
                      <Badge key={need} variant="outline" className="mr-2 mb-1">{need}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Pain Points</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedApplication.painPoints || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Expectations</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedApplication.expectations || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                    className="bg-sa-green hover:bg-sa-green-light"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'contacted')}
                    variant="outline"
                  >
                    Mark Contacted
                  </Button>
                  <Button 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface ApplicationsTableProps {
  applications: PassengerApplication[];
  onViewDetails: (application: PassengerApplication) => void;
  getStatusBadge: (status: PassengerApplication['status']) => React.ReactNode;
}

const ApplicationsTable = ({ applications, onViewDetails, getStatusBadge }: ApplicationsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Area</TableHead>
          <TableHead>Transport Needs</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">
              {app.firstName} {app.lastName}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Phone className="w-3 h-3 mr-1" />
                  {app.phone}
                </div>
                {app.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-3 h-3 mr-1" />
                    {app.email}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">{app.homeArea}</div>
                {app.workArea && (
                  <div className="text-xs text-muted-foreground">→ {app.workArea}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">{app.weeklyTrips} trips/week</div>
                <div className="text-xs text-muted-foreground">{app.monthlyBudget}</div>
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(app.status)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(app.appliedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(app)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PassengerRecruitmentDashboard;