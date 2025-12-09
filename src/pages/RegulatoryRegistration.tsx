import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Shield,
  Truck,
  Users,
  Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegistrationItem {
  id: string;
  organization: string;
  fullName: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  deadline?: string;
  documents: string[];
  requirements: string[];
  registrationNumber?: string;
  submittedDate?: string;
  notes?: string;
  website?: string;
  icon: React.ReactNode;
}

export const RegulatoryRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<RegistrationItem[]>([
    {
      id: 'ndot',
      organization: 'NDoT',
      fullName: 'National Department of Transport',
      description: 'E-Hailing Platform Registration under the National Land Transport Amendment Act 23 of 2023',
      status: 'not_started',
      deadline: '2026-03-12',
      documents: [],
      requirements: [
        'Company registration documents (CIPC)',
        'Platform technology specifications',
        'Driver onboarding procedures',
        'Safety and compliance policies',
        'Insurance certificates',
        'Data protection policy (POPIA compliant)'
      ],
      website: 'https://www.transport.gov.za',
      icon: <Truck className="h-6 w-6" />
    },
    {
      id: 'cipc',
      organization: 'CIPC',
      fullName: 'Companies and Intellectual Property Commission',
      description: 'Register PoortLink as a legal entity and trademark the brand',
      status: 'not_started',
      documents: [],
      requirements: [
        'Company name reservation (CM1 form)',
        'Memorandum of Incorporation (MOI)',
        'Director ID documents',
        'Registered address proof',
        'Trademark application (TM1 form)'
      ],
      website: 'https://www.cipc.co.za',
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: 'pre',
      organization: 'PRE',
      fullName: 'Provincial Regulatory Entity (Gauteng)',
      description: 'Register with provincial transport authority for operating licence coordination',
      status: 'not_started',
      documents: [],
      requirements: [
        'NDoT registration confirmation',
        'Fleet vehicle details',
        'Driver operating licence tracking system',
        'Route designations',
        'Proof of financial standing'
      ],
      website: 'https://www.gauteng.gov.za/departments/roads-transport',
      icon: <Scale className="h-6 w-6" />
    },
    {
      id: 'santaco',
      organization: 'SANTACO',
      fullName: 'South African National Taxi Council',
      description: 'Industry body coordination and recognition for taxi operator integration',
      status: 'not_started',
      documents: [],
      requirements: [
        'Membership application',
        'Proof of local taxi association engagement',
        'Fleet details and route coverage',
        'Community benefit statement',
        'Conflict resolution policy'
      ],
      website: 'https://www.santaco.co.za',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'popia',
      organization: 'Information Regulator',
      fullName: 'Information Regulator (POPIA)',
      description: 'Data protection registration under the Protection of Personal Information Act',
      status: 'not_started',
      documents: [],
      requirements: [
        'Information Officer appointment letter',
        'POPIA compliance manual',
        'Data processing register',
        'Privacy policy',
        'Data subject request procedures',
        'Breach notification procedures'
      ],
      website: 'https://www.justice.gov.za/inforeg/',
      icon: <Shield className="h-6 w-6" />
    }
  ]);

  const [selectedOrg, setSelectedOrg] = useState<string>('ndot');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const getStatusBadge = (status: RegistrationItem['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>;
    }
  };

  const getOverallProgress = () => {
    const total = registrations.length;
    const completed = registrations.filter(r => r.status === 'approved').length;
    const inProgress = registrations.filter(r => ['in_progress', 'submitted'].includes(r.status)).length;
    return Math.round(((completed * 100) + (inProgress * 50)) / total);
  };

  const updateStatus = (id: string, status: RegistrationItem['status']) => {
    setRegistrations(prev => prev.map(r => 
      r.id === id ? { ...r, status } : r
    ));
    toast({
      title: "Status Updated",
      description: `Registration status has been updated to ${status.replace('_', ' ')}.`
    });
  };

  const handleDocumentUpload = async () => {
    setUploadingDoc(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRegistrations(prev => prev.map(r => 
      r.id === selectedOrg 
        ? { ...r, documents: [...r.documents, `Document_${Date.now()}.pdf`] } 
        : r
    ));
    
    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded successfully."
    });
    setUploadingDoc(false);
  };

  const selectedRegistration = registrations.find(r => r.id === selectedOrg);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/compliance')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Compliance
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Regulatory Registration</h1>
              <p className="text-muted-foreground mt-1">
                Track PoortLink's registration status with government bodies and industry organizations
              </p>
            </div>
            
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{getOverallProgress()}%</div>
                    <div className="text-xs text-muted-foreground">Overall Progress</div>
                  </div>
                  <Progress value={getOverallProgress()} className="w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {registrations.map((reg) => (
            <Card 
              key={reg.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedOrg === reg.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedOrg(reg.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {reg.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{reg.organization}</CardTitle>
                      <CardDescription className="text-xs">{reg.fullName}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(reg.status)}
                  
                  {reg.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(reg.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{reg.documents.length} / {reg.requirements.length} documents</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Organization Details */}
        {selectedRegistration && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {selectedRegistration.icon}
                  </div>
                  <div>
                    <CardTitle>{selectedRegistration.fullName}</CardTitle>
                    <CardDescription>{selectedRegistration.description}</CardDescription>
                  </div>
                </div>
                {selectedRegistration.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedRegistration.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="requirements">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="status">Update Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {selectedRegistration.requirements.map((req, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload supporting documents for {selectedRegistration.organization}
                    </p>
                    <Button onClick={handleDocumentUpload} disabled={uploadingDoc}>
                      {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                  
                  {selectedRegistration.documents.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium text-sm">Uploaded Documents</h4>
                      {selectedRegistration.documents.map((doc, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="status" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Registration Number (if received)</Label>
                      <Input placeholder="e.g., NDT-2025-001234" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Submission Date</Label>
                      <Input type="date" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Add any notes or updates about this registration..." />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Update Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {(['not_started', 'in_progress', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                          <Button
                            key={status}
                            variant={selectedRegistration.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedRegistration.id, status)}
                          >
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Important Deadlines Alert */}
        <Card className="mt-8 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Important Deadline Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <strong>E-Hailing Operating Licence Conversion:</strong> As per the National Department of Transport announcement, 
              e-hailing operators have 180 days from 12 September 2025 to convert charter permits and meter taxi operating 
              licences to e-hailing operating licences. The deadline is <strong>12 March 2026</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegulatoryRegistration;
