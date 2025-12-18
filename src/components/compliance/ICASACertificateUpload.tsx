import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Radio, 
  Upload, 
  FileCheck, 
  AlertTriangle, 
  Loader2,
  Trash2,
  Download,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ICASADevice {
  id: string;
  deviceName: string;
  deviceType: string;
  certificateNumber: string;
  certificatePath?: string;
  uploadedAt?: string;
}

interface ICASACertificateUploadProps {
  userId: string;
}

export const ICASACertificateUpload = ({ userId }: ICASACertificateUploadProps) => {
  const [devices, setDevices] = useState<ICASADevice[]>([]);
  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    deviceType: 'smartphone',
    certificateNumber: ''
  });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Load devices from localStorage (or could be from DB)
  useEffect(() => {
    const saved = localStorage.getItem(`icasa-devices-${userId}`);
    if (saved) {
      setDevices(JSON.parse(saved));
    }
  }, [userId]);

  const saveDevices = (updated: ICASADevice[]) => {
    setDevices(updated);
    localStorage.setItem(`icasa-devices-${userId}`, JSON.stringify(updated));
  };

  const handleAddDevice = async () => {
    if (!newDevice.deviceName || !newDevice.certificateNumber) {
      toast({
        title: 'Missing information',
        description: 'Please enter device name and certificate number',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      let certificatePath = '';

      // Upload certificate file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `icasa-certificates/${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('regulatory-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        certificatePath = filePath;
      }

      const device: ICASADevice = {
        id: crypto.randomUUID(),
        deviceName: newDevice.deviceName,
        deviceType: newDevice.deviceType,
        certificateNumber: newDevice.certificateNumber,
        certificatePath,
        uploadedAt: new Date().toISOString()
      };

      saveDevices([...devices, device]);

      toast({
        title: 'Device added',
        description: `${newDevice.deviceName} ICASA certificate recorded`
      });

      // Reset form
      setNewDevice({ deviceName: '', deviceType: 'smartphone', certificateNumber: '' });
      setFile(null);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDevice = (id: string) => {
    saveDevices(devices.filter(d => d.id !== id));
    toast({ title: 'Device removed' });
  };

  const handleDownload = async (device: ICASADevice) => {
    if (!device.certificatePath) return;

    try {
      const { data, error } = await supabase.storage
        .from('regulatory-documents')
        .download(device.certificatePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ICASA_${device.deviceName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download certificate',
        variant: 'destructive'
      });
    }
  };

  const deviceTypes = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'gps_tracker', label: 'GPS Tracker' },
    { value: 'panic_button', label: 'Panic Button Device' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            ICASA Type-Approval Certificates
          </CardTitle>
          <Badge variant={devices.length > 0 ? 'default' : 'destructive'}>
            {devices.length} device{devices.length !== 1 ? 's' : ''} registered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p>
              All electronic equipment used for e-hailing must have valid ICASA type-approval 
              certificates. This includes smartphones, tablets, GPS trackers, and panic buttons.
            </p>
          </div>
        </div>

        {/* Existing devices */}
        {devices.length > 0 && (
          <div className="space-y-2">
            {devices.map((device) => (
              <div 
                key={device.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{device.deviceName}</span>
                    <Badge variant="outline" className="text-xs">
                      {deviceTypes.find(t => t.value === device.deviceType)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Certificate: {device.certificateNumber}
                  </p>
                  {device.uploadedAt && (
                    <p className="text-xs text-muted-foreground">
                      Added {format(new Date(device.uploadedAt), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {device.certificatePath && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(device)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new device form */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Device Name</Label>
              <Input
                placeholder="e.g., Samsung Galaxy A23"
                value={newDevice.deviceName}
                onChange={(e) => setNewDevice(prev => ({ ...prev, deviceName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Device Type</Label>
              <select
                value={newDevice.deviceType}
                onChange={(e) => setNewDevice(prev => ({ ...prev, deviceType: e.target.value }))}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {deviceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-sm">ICASA Certificate Number</Label>
            <Input
              placeholder="e.g., TA-2023/12345"
              value={newDevice.certificateNumber}
              onChange={(e) => setNewDevice(prev => ({ ...prev, certificateNumber: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Certificate Document (Optional)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PDF or image of the ICASA type-approval certificate
            </p>
          </div>

          <Button
            onClick={handleAddDevice}
            disabled={uploading || !newDevice.deviceName || !newDevice.certificateNumber}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Add Device
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
