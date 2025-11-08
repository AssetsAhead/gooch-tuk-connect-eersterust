import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSignedUrlRefresh } from "@/hooks/useSignedUrlRefresh";
import { adminVerificationNotesSchema, optionalAdminNotesSchema } from "@/lib/validationSchemas";

interface SassaVerification {
  id: string;
  user_id: string;
  status: string;
  grant_type: string;
  card_photo_url?: string;
  file_path?: string;
  verification_notes?: string;
  created_at: string;
  verified_at?: string;
  profiles?: {
    display_name?: string;
  };
}

export const AdminSassaVerifications = () => {
  const [verifications, setVerifications] = useState<SassaVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<SassaVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<SassaVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    filterVerificationsList();
  }, [verifications, filterStatus, searchQuery]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sassa_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile data separately for each verification
      if (data) {
        const verificationsWithProfiles = await Promise.all(
          data.map(async (verification) => {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', verification.user_id)
              .maybeSingle();
            
            return {
              ...verification,
              profiles: profile || { display_name: 'Unknown User' }
            };
          })
        );
        setVerifications(verificationsWithProfiles as SassaVerification[]);
      }
    } catch (error) {
      console.error('Error fetching SASSA verifications:', error);
      toast({
        title: "Error",
        description: "Failed to load SASSA verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVerificationsList = () => {
    let filtered = [...verifications];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(v => v.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.grant_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVerifications(filtered);
  };

  const handleApprove = async (verificationId: string) => {
    try {
      // Validate optional notes
      const notesToSave = verificationNotes || 'Approved by admin';
      const validationResult = optionalAdminNotesSchema.safeParse({ 
        notes: notesToSave 
      });

      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('sassa_verifications')
        .update({
          status: 'approved',
          verification_notes: validationResult.data.notes,
          verified_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Verification Approved",
        description: "SASSA verification has been approved successfully.",
      });

      setIsDialogOpen(false);
      setVerificationNotes("");
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (verificationId: string) => {
    if (!verificationNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    // Validate required notes for rejection
    const validationResult = adminVerificationNotesSchema.safeParse({ 
      notes: verificationNotes 
    });

    if (!validationResult.success) {
      toast({
        title: "Validation Error",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sassa_verifications')
        .update({
          status: 'rejected',
          verification_notes: validationResult.data.notes,
          verified_at: null
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Verification Rejected",
        description: "SASSA verification has been rejected.",
      });

      setIsDialogOpen(false);
      setVerificationNotes("");
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive",
      });
    }
  };

  const getGrantTypeName = (grantType: string): string => {
    const types: Record<string, string> = {
      "older_persons": "Older Persons Grant",
      "disability": "Disability Grant",
      "children": "Child Support Grant",
      "care_dependency": "Care Dependency Grant",
      "foster_care": "Foster Care Grant",
      "old_age_pension": "Old Age Pension",
      "disability_grant": "Disability Grant",
      "child_support_grant": "Child Support Grant",
      "foster_child_grant": "Foster Child Grant",
      "care_dependency_grant": "Care Dependency Grant",
      "war_veterans_grant": "War Veterans Grant"
    };
    return types[grantType] || grantType;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">SASSA Verification Dashboard</h1>
              <p className="text-muted-foreground">Review and approve SASSA grant verifications</p>
            </div>
          </div>
          <Button onClick={fetchVerifications} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by name or grant type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:w-1/2"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Verifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Submissions</CardTitle>
            <CardDescription>
              {filteredVerifications.length} verification{filteredVerifications.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading verifications...</div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No verifications found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((verification) => (
                  <VerificationCard
                    key={verification.id}
                    verification={verification}
                    onReview={() => {
                      setSelectedVerification(verification);
                      setVerificationNotes(verification.verification_notes || "");
                      setIsDialogOpen(true);
                    }}
                    getGrantTypeName={getGrantTypeName}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review SASSA Verification</DialogTitle>
              <DialogDescription>
                Carefully review the submitted SASSA card and user information
              </DialogDescription>
            </DialogHeader>

            {selectedVerification && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Applicant Name</label>
                    <p className="text-lg">{selectedVerification.profiles?.display_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Grant Type</label>
                    <p className="text-lg">{getGrantTypeName(selectedVerification.grant_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Submitted</label>
                    <p className="text-lg">{new Date(selectedVerification.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                  </div>
                </div>

                {/* SASSA Card Image with Auto-refresh */}
                <SecureImageViewer verification={selectedVerification} />

                {/* Verification Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Verification Notes {selectedVerification.status === 'pending' && <span className="text-red-500">*</span>}
                  </label>
                  <Textarea
                    placeholder="Add notes about this verification (required for rejection)..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {verificationNotes.length}/1000 characters
                  </p>
                </div>

                {/* Action Buttons */}
                {selectedVerification.status === 'pending' && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleApprove(selectedVerification.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Verification
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedVerification.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Verification
                    </Button>
                  </div>
                )}

                {selectedVerification.verification_notes && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Previous Notes</AlertTitle>
                    <AlertDescription>
                      {selectedVerification.verification_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Verification Card Component
const VerificationCard = ({ 
  verification, 
  onReview, 
  getGrantTypeName, 
  getStatusBadge 
}: { 
  verification: SassaVerification; 
  onReview: () => void;
  getGrantTypeName: (type: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                {verification.profiles?.display_name || 'Unknown User'}
              </h3>
              {getStatusBadge(verification.status)}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Grant Type: {getGrantTypeName(verification.grant_type)}</p>
              <p>Submitted: {new Date(verification.created_at).toLocaleString()}</p>
              {verification.verified_at && (
                <p>Verified: {new Date(verification.verified_at).toLocaleString()}</p>
              )}
            </div>
          </div>
          <Button onClick={onReview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Secure Image Viewer Component with Auto-refresh
const SecureImageViewer = ({ verification }: { verification: SassaVerification }) => {
  const [imageError, setImageError] = useState(false);

  // Use the file_path for auto-refreshing signed URLs
  const signedUrlConfig = useMemo(() => {
    if (!verification.file_path) return null;

    return {
      bucketName: 'sassa-cards',
      filePath: verification.file_path,
      expirySeconds: 3600,
    };
  }, [verification.file_path]);

  const { signedUrl, isRefreshing, error } = useSignedUrlRefresh(signedUrlConfig);

  if (!verification.file_path && !verification.card_photo_url) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Image Available</AlertTitle>
        <AlertDescription>
          No SASSA card image has been uploaded for this verification.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Image</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">SASSA Card Image</label>
        {isRefreshing && (
          <Badge variant="secondary">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Refreshing URL...
          </Badge>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden bg-muted">
        {signedUrl || verification.card_photo_url ? (
          <img
            src={signedUrl || verification.card_photo_url}
            alt="SASSA Card"
            className="w-full h-auto"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Loading secure image...</p>
            </div>
          </div>
        )}
        {imageError && (
          <div className="flex items-center justify-center h-64 bg-muted">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>Failed to load image</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Images are loaded using secure time-limited URLs and automatically refresh before expiry
      </p>
    </div>
  );
};
