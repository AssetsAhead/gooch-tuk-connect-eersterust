import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  Scale,
  Bell,
  Trash2,
  Download,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";

interface RegistrationItem {
  id?: string;
  organization_code: string;
  organization_name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  deadline?: string;
  registration_number?: string;
  submitted_date?: string;
  notes?: string;
  website?: string;
  icon: React.ReactNode;
  requirements: string[];
}

interface DocumentItem {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  version: number;
  is_current: boolean;
  document_type: string;
  notes: string;
  uploaded_at: string;
}

interface ReminderItem {
  id: string;
  title: string;
  description: string;
  deadline_date: string;
  reminder_days: number[];
  is_active: boolean;
}

const DEFAULT_REGISTRATIONS: Omit<RegistrationItem, 'id'>[] = [
  {
    organization_code: 'ndot',
    organization_name: 'National Department of Transport (NPTR)',
    description: 'E-Hailing Platform License under National Land Transport Amendment Act 23 of 2023 - covers all vehicles registered on your platform',
    status: 'not_started',
    deadline: '2026-03-12',
    website: 'https://www.transport.gov.za',
    icon: <Truck className="h-6 w-6" />,
    requirements: [
      'Company registration documents (CIPC)',
      'Platform technology specifications & app demo',
      'Vehicle registry system for registered vehicles',
      'Driver onboarding procedures with PDP verification',
      'Safety and compliance policies',
      'Third-party & public liability insurance certificates',
      'Data protection policy (POPIA compliant)',
      'Operator-vehicle agreement template',
      'Proof of operating area (Eersterust to Mamelodi Taxi Rank zone)'
    ]
  },
  {
    organization_code: 'cipc',
    organization_name: 'Companies and Intellectual Property Commission',
    description: 'Register PoortLink as a legal entity and trademark the brand',
    status: 'not_started',
    website: 'https://www.cipc.co.za',
    icon: <Building2 className="h-6 w-6" />,
    requirements: [
      'Company name reservation (CM1 form)',
      'Memorandum of Incorporation (MOI)',
      'Director ID documents',
      'Registered address proof',
      'Trademark application (TM1 form)'
    ]
  },
  {
    organization_code: 'pre',
    organization_name: 'Provincial Regulatory Entity (Gauteng)',
    description: 'Register with provincial transport authority for operating licence coordination',
    status: 'not_started',
    website: 'https://www.gauteng.gov.za/departments/roads-transport',
    icon: <Scale className="h-6 w-6" />,
    requirements: [
      'NDoT registration confirmation',
      'Fleet vehicle details',
      'Driver operating licence tracking system',
      'Route designations',
      'Proof of financial standing'
    ]
  },
  {
    organization_code: 'santaco',
    organization_name: 'South African National Taxi Council',
    description: 'Industry body coordination and recognition for taxi operator integration',
    status: 'not_started',
    website: 'https://www.santaco.co.za',
    icon: <Users className="h-6 w-6" />,
    requirements: [
      'Membership application',
      'Proof of local taxi association engagement',
      'Fleet details and route coverage',
      'Community benefit statement',
      'Conflict resolution policy'
    ]
  },
  {
    organization_code: 'popia',
    organization_name: 'Information Regulator (POPIA)',
    description: 'Data protection registration under the Protection of Personal Information Act',
    status: 'not_started',
    website: 'https://www.justice.gov.za/inforeg/',
    icon: <Shield className="h-6 w-6" />,
    requirements: [
      'Information Officer appointment letter',
      'POPIA compliance manual',
      'Data processing register',
      'Privacy policy',
      'Data subject request procedures',
      'Breach notification procedures'
    ]
  }
];

const getIconForCode = (code: string) => {
  switch (code) {
    case 'ndot': return <Truck className="h-6 w-6" />;
    case 'cipc': return <Building2 className="h-6 w-6" />;
    case 'pre': return <Scale className="h-6 w-6" />;
    case 'santaco': return <Users className="h-6 w-6" />;
    case 'popia': return <Shield className="h-6 w-6" />;
    default: return <FileText className="h-6 w-6" />;
  }
};

export const RegulatoryRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('ndot');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [submittedDate, setSubmittedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Reminder form
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderDesc, setNewReminderDesc] = useState('');

  useEffect(() => {
    if (user) {
      loadRegistrations();
      loadReminders();
    } else {
      // Use defaults for non-authenticated users
      setRegistrations(DEFAULT_REGISTRATIONS.map((r, i) => ({ ...r, id: `temp-${i}` })));
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedOrg) {
      loadDocuments();
      const selected = registrations.find(r => r.organization_code === selectedOrg);
      if (selected) {
        setRegNumber(selected.registration_number || '');
        setSubmittedDate(selected.submitted_date || '');
        setNotes(selected.notes || '');
      }
    }
  }, [selectedOrg, user, registrations]);

  const loadRegistrations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('regulatory_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Merge with defaults
      const merged = DEFAULT_REGISTRATIONS.map(def => {
        const existing = data?.find(d => d.organization_code === def.organization_code);
        if (existing) {
          return {
            ...def,
            id: existing.id,
            status: existing.status as RegistrationItem['status'],
            registration_number: existing.registration_number,
            submitted_date: existing.submitted_date,
            notes: existing.notes,
            deadline: existing.deadline || def.deadline
          };
        }
        return def;
      });

      setRegistrations(merged);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrations(DEFAULT_REGISTRATIONS);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!user) return;
    
    const selected = registrations.find(r => r.organization_code === selectedOrg);
    if (!selected?.id || selected.id.startsWith('temp-')) return;

    try {
      const { data, error } = await supabase
        .from('regulatory_documents')
        .select('*')
        .eq('registration_id', selected.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadReminders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deadline_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

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

  const saveRegistration = async (orgCode: string, updates: Partial<RegistrationItem>) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to save changes.", variant: "destructive" });
      return;
    }

    const existing = registrations.find(r => r.organization_code === orgCode);
    const defaultReg = DEFAULT_REGISTRATIONS.find(r => r.organization_code === orgCode);

    try {
      if (existing?.id && !existing.id.startsWith('temp-')) {
        // Update existing
        const { error } = await supabase
          .from('regulatory_registrations')
          .update({
            status: updates.status || existing.status,
            registration_number: updates.registration_number ?? existing.registration_number,
            submitted_date: updates.submitted_date ?? existing.submitted_date,
            notes: updates.notes ?? existing.notes
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('regulatory_registrations')
          .insert({
            user_id: user.id,
            organization_code: orgCode,
            organization_name: defaultReg?.organization_name || orgCode,
            description: defaultReg?.description,
            status: updates.status || 'not_started',
            registration_number: updates.registration_number,
            submitted_date: updates.submitted_date,
            deadline: defaultReg?.deadline,
            notes: updates.notes
          });

        if (error) throw error;
      }

      await loadRegistrations();
      toast({ title: "Saved", description: "Registration details updated." });
    } catch (error) {
      console.error('Error saving registration:', error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    }
  };

  const updateStatus = (orgCode: string, status: RegistrationItem['status']) => {
    saveRegistration(orgCode, { status });
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingDoc(true);

    try {
      // Ensure registration exists first
      let regId = registrations.find(r => r.organization_code === selectedOrg)?.id;
      
      if (!regId || regId.startsWith('temp-')) {
        await saveRegistration(selectedOrg, { status: 'in_progress' });
        await loadRegistrations();
        regId = registrations.find(r => r.organization_code === selectedOrg)?.id;
      }

      if (!regId || regId.startsWith('temp-')) {
        throw new Error('Could not create registration');
      }

      // Get current version
      const currentDocs = documents.filter(d => d.is_current);
      const newVersion = currentDocs.length > 0 ? Math.max(...currentDocs.map(d => d.version)) + 1 : 1;

      // Upload to storage
      const filePath = `${user.id}/${selectedOrg}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('regulatory-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Mark previous versions as not current
      if (currentDocs.length > 0) {
        await supabase
          .from('regulatory_documents')
          .update({ is_current: false })
          .eq('registration_id', regId)
          .eq('is_current', true);
      }

      // Save document record
      const { error: docError } = await supabase
        .from('regulatory_documents')
        .insert({
          registration_id: regId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          version: newVersion,
          is_current: true,
          document_type: selectedOrg
        });

      if (docError) throw docError;

      await loadDocuments();
      toast({ title: "Document Uploaded", description: `${file.name} (v${newVersion}) uploaded successfully.` });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({ title: "Upload Failed", description: "Could not upload document.", variant: "destructive" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const downloadDocument = async (doc: DocumentItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('regulatory-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({ title: "Download Failed", variant: "destructive" });
    }
  };

  const deleteDocument = async (doc: DocumentItem) => {
    try {
      await supabase.storage.from('regulatory-documents').remove([doc.file_path]);
      await supabase.from('regulatory_documents').delete().eq('id', doc.id);
      await loadDocuments();
      toast({ title: "Document Deleted" });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const addReminder = async () => {
    if (!user || !newReminderTitle || !newReminderDate) {
      toast({ title: "Missing Fields", description: "Please fill in title and deadline date.", variant: "destructive" });
      return;
    }

    const selectedReg = registrations.find(r => r.organization_code === selectedOrg);

    try {
      const { error } = await supabase
        .from('deadline_reminders')
        .insert({
          user_id: user.id,
          registration_id: selectedReg?.id?.startsWith('temp-') ? null : selectedReg?.id,
          title: newReminderTitle,
          description: newReminderDesc,
          deadline_date: newReminderDate,
          reminder_days: [30, 14, 7, 1],
          is_active: true
        });

      if (error) throw error;

      setNewReminderTitle('');
      setNewReminderDate('');
      setNewReminderDesc('');
      await loadReminders();
      toast({ title: "Reminder Created", description: "You'll be notified before the deadline." });
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({ title: "Error", description: "Could not create reminder.", variant: "destructive" });
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('deadline_reminders').update({ is_active: isActive }).eq('id', id);
      await loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await supabase.from('deadline_reminders').delete().eq('id', id);
      await loadReminders();
      toast({ title: "Reminder Deleted" });
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const selectedRegistration = registrations.find(r => r.organization_code === selectedOrg);

  const upcomingDeadlines = reminders
    .filter(r => r.is_active && new Date(r.deadline_date) > new Date())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Regulatory Registration</h1>
              <p className="text-muted-foreground mt-1">
                Track PoortLink's registration status with government bodies and industry organizations
              </p>
            </div>
            
            <div className="flex gap-4">
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
        </div>

        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines.length > 0 && (
          <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-500 text-lg">
                <Bell className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {upcomingDeadlines.map(r => {
                  const daysLeft = differenceInDays(new Date(r.deadline_date), new Date());
                  return (
                    <Badge 
                      key={r.id} 
                      variant={daysLeft <= 7 ? "destructive" : daysLeft <= 30 ? "default" : "secondary"}
                    >
                      {r.title}: {daysLeft} days left
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {registrations.map((reg) => (
            <Card 
              key={reg.organization_code}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedOrg === reg.organization_code ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedOrg(reg.organization_code)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getIconForCode(reg.organization_code)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{reg.organization_code.toUpperCase()}</CardTitle>
                      <CardDescription className="text-xs">{reg.organization_name}</CardDescription>
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
                      <span>Deadline: {format(new Date(reg.deadline), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{documents.filter(d => d.is_current).length} documents</span>
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getIconForCode(selectedRegistration.organization_code)}
                  </div>
                  <div>
                    <CardTitle>{selectedRegistration.organization_name}</CardTitle>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="reminders">Reminders</TabsTrigger>
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
                      Upload supporting documents for {selectedRegistration.organization_code.toUpperCase()}
                    </p>
                    <Label htmlFor="doc-upload" className="cursor-pointer">
                      <Button disabled={uploadingDoc || !user} asChild>
                        <span>{uploadingDoc ? 'Uploading...' : 'Select Document'}</span>
                      </Button>
                    </Label>
                    <Input 
                      id="doc-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={handleDocumentUpload}
                      disabled={uploadingDoc || !user}
                    />
                    {!user && <p className="text-xs text-muted-foreground mt-2">Please log in to upload documents</p>}
                  </div>
                  
                  {documents.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <History className="h-4 w-4" /> Document History
                      </h4>
                      {documents.map((doc) => (
                        <div 
                          key={doc.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-lg ${doc.is_current ? 'bg-primary/10' : 'bg-muted/50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <span className="text-sm font-medium">{doc.file_name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>v{doc.version}</span>
                                <span>•</span>
                                <span>{format(new Date(doc.uploaded_at), 'dd MMM yyyy HH:mm')}</span>
                                {doc.is_current && <Badge variant="outline" className="text-xs">Current</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => downloadDocument(doc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteDocument(doc)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="status" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Registration Number (if received)</Label>
                      <Input 
                        placeholder="e.g., NDT-2025-001234" 
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Submission Date</Label>
                      <Input 
                        type="date" 
                        value={submittedDate}
                        onChange={(e) => setSubmittedDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Add any notes or updates about this registration..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <Button onClick={() => saveRegistration(selectedOrg, {
                      registration_number: regNumber,
                      submitted_date: submittedDate,
                      notes: notes
                    })}>
                      Save Details
                    </Button>
                    
                    <div className="space-y-2">
                      <Label>Update Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {(['not_started', 'in_progress', 'submitted', 'approved', 'rejected'] as const).map((status) => (
                          <Button
                            key={status}
                            variant={selectedRegistration.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedOrg, status)}
                          >
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reminders" className="space-y-4 mt-4">
                  <div className="grid gap-4 p-4 border rounded-lg">
                    <h4 className="font-medium">Add New Reminder</h4>
                    <div className="grid gap-3">
                      <Input 
                        placeholder="Reminder title" 
                        value={newReminderTitle}
                        onChange={(e) => setNewReminderTitle(e.target.value)}
                      />
                      <Input 
                        type="date" 
                        value={newReminderDate}
                        onChange={(e) => setNewReminderDate(e.target.value)}
                      />
                      <Textarea 
                        placeholder="Description (optional)"
                        value={newReminderDesc}
                        onChange={(e) => setNewReminderDesc(e.target.value)}
                      />
                      <Button onClick={addReminder} disabled={!user}>
                        <Bell className="h-4 w-4 mr-2" />
                        Add Reminder
                      </Button>
                    </div>
                  </div>

                  {reminders.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Reminders</h4>
                      {reminders.map((reminder) => {
                        const daysLeft = differenceInDays(new Date(reminder.deadline_date), new Date());
                        return (
                          <div 
                            key={reminder.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Bell className={`h-4 w-4 ${reminder.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div>
                                <span className="text-sm font-medium">{reminder.title}</span>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(reminder.deadline_date), 'dd MMM yyyy')} 
                                  {daysLeft > 0 && ` • ${daysLeft} days left`}
                                  {daysLeft <= 0 && ' • Overdue!'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={reminder.is_active}
                                onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                              />
                              <Button size="icon" variant="ghost" onClick={() => deleteReminder(reminder.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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