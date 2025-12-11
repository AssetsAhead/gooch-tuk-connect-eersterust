import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, AlertTriangle, CheckCircle, Clock, Trash2, Download, Bell } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  expiry_date: string | null;
  uploaded_at: string;
  is_current: boolean;
}

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string | null;
}

const DOCUMENT_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'pdp', label: 'PDP (Professional Driving Permit)' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'other', label: 'Other' },
];

export const DriverDocumentUpload = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [selectedDriver, setSelectedDriver] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDriversAndDocuments();
  }, []);

  const fetchDriversAndDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch drivers from user_registrations
      const { data: driversData } = await supabase
        .from('user_registrations')
        .select('id, first_name, last_name, user_id')
        .order('first_name');

      if (driversData) {
        setDrivers(driversData);
      }

      // Fetch documents - use raw query since table is new
      const { data: docsData, error } = await supabase
        .from('driver_documents' as any)
        .select('*')
        .eq('is_current', true)
        .order('uploaded_at', { ascending: false });

      if (docsData && !error) {
        setDocuments(docsData as unknown as DriverDocument[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedDriver || !documentType || !file) {
      toast({
        title: 'Missing information',
        description: 'Please select a driver, document type, and file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedDriver}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Mark previous documents of same type as not current
      await supabase
        .from('driver_documents' as any)
        .update({ is_current: false })
        .eq('driver_id', selectedDriver)
        .eq('document_type', documentType);

      // Insert document record
      const { error: insertError } = await supabase
        .from('driver_documents' as any)
        .insert({
          driver_id: selectedDriver,
          document_type: documentType,
          file_path: filePath,
          file_name: file.name,
          expiry_date: expiryDate || null,
          is_current: true,
        });

      if (insertError) throw insertError;

      // Create renewal reminder if expiry date is set
      if (expiryDate) {
        const driver = drivers.find(d => d.id === selectedDriver);
        await supabase.from('deadline_reminders').insert({
          user_id: user.id,
          title: `${DOCUMENT_TYPES.find(t => t.value === documentType)?.label} Renewal - ${driver?.first_name} ${driver?.last_name}`,
          description: `Document expiry reminder for ${driver?.first_name} ${driver?.last_name}`,
          deadline_date: expiryDate,
          reminder_days: [90, 60, 30, 14, 7],
          is_active: true,
        });
      }

      toast({
        title: 'Document uploaded',
        description: 'Document has been uploaded successfully',
      });

      // Reset form and refresh
      setSelectedDriver('');
      setDocumentType('');
      setExpiryDate('');
      setFile(null);
      setDialogOpen(false);
      fetchDriversAndDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DriverDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('driver-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (doc: DriverDocument) => {
    try {
      await supabase.storage.from('driver-documents').remove([doc.file_path]);
      await supabase.from('driver_documents' as any).delete().eq('id', doc.id);
      
      toast({ title: 'Document deleted' });
      fetchDriversAndDocuments();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: 'unknown', label: 'No expiry', color: 'secondary' as const };
    
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'destructive' as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiry} days`, color: 'destructive' as const };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', label: `${daysUntilExpiry} days`, color: 'outline' as const };
    }
    return { status: 'valid', label: `${daysUntilExpiry} days`, color: 'default' as const };
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown';
  };

  // Group documents by driver
  const documentsByDriver = documents.reduce((acc, doc) => {
    const driverId = doc.driver_id;
    if (!acc[driverId]) acc[driverId] = [];
    acc[driverId].push(doc);
    return acc;
  }, {} as Record<string, DriverDocument[]>);

  // Find expiring/expired documents
  const urgentDocuments = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const days = differenceInDays(new Date(doc.expiry_date), new Date());
    return days <= 30;
  });

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Urgent Renewals Alert */}
      {urgentDocuments.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Document Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentDocuments.map(doc => {
                const expiry = getExpiryStatus(doc.expiry_date);
                return (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <span>
                      {getDriverName(doc.driver_id)} - {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                    </span>
                    <Badge variant={expiry.color}>
                      {expiry.status === 'expired' ? 'EXPIRED' : `Expires in ${expiry.label}`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Driver Documents</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Driver Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Driver</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <Bell className="inline h-3 w-3 mr-1" />
                  Automatic reminders at 90, 60, 30, 14, and 7 days before expiry
                </p>
              </div>

              <div>
                <Label>Document File</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </div>

              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents by Driver */}
      {Object.keys(documentsByDriver).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload driver licenses and PDPs to track expiry dates</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(documentsByDriver).map(([driverId, driverDocs]) => (
            <Card key={driverId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{getDriverName(driverId)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverDocs.map(doc => {
                    const expiry = getExpiryStatus(doc.expiry_date);
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {format(new Date(doc.uploaded_at), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={expiry.color} className="flex items-center gap-1">
                            {expiry.status === 'expired' ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : expiry.status === 'valid' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {expiry.label}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
