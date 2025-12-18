import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DriverPhotoUploadProps {
  driverId: string;
  driverName: string;
  currentPhotoUrl?: string;
  onPhotoUpdated?: (url: string) => void;
}

export const DriverPhotoUpload = ({
  driverId,
  driverName,
  currentPhotoUrl,
  onPhotoUpdated
}: DriverPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG)',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `driver-photos/${driverId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(filePath);

      const newPhotoUrl = urlData.publicUrl;

      // Update driver record
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ photo_url: newPhotoUrl })
        .eq('id', driverId);

      if (updateError) throw updateError;

      setPhotoUrl(newPhotoUrl);
      onPhotoUpdated?.(newPhotoUrl);

      toast({
        title: 'Photo uploaded',
        description: 'Your profile photo has been updated successfully'
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Driver Photo (DOT Required)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Avatar className="h-32 w-32 border-4 border-primary/20">
          <AvatarImage src={photoUrl} alt={driverName} />
          <AvatarFallback className="text-3xl bg-primary/10">
            {driverName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {photoUrl ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Photo uploaded</span>
          </div>
        ) : (
          <p className="text-sm text-destructive text-center">
            Photo required for passenger identification
          </p>
        )}

        <label className="w-full">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button 
            variant={photoUrl ? 'outline' : 'default'} 
            className="w-full" 
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground text-center">
          Clear, recent photo required. JPG or PNG, max 5MB.
        </p>
      </CardContent>
    </Card>
  );
};
