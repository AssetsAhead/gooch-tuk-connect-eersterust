import { useState, useEffect } from "react";
import { Camera, Upload, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SassaVerification {
  id: string;
  status: string;
  grant_type: string;
  card_photo_url?: string;
  verified_at?: string;
  created_at: string;
}

export const SassaVerification = () => {
  const [verification, setVerification] = useState<SassaVerification | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGrantType, setSelectedGrantType] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("sassa_verifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching verification:", error);
      return;
    }

    if (data && data.length > 0) {
      setVerification(data[0]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedGrantType) {
      toast({
        title: "Please select grant type first",
        description: "Choose your SASSA grant type before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("sassa-cards")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("sassa-cards")
        .getPublicUrl(fileName);

      // Save verification record
      const { error: dbError } = await supabase
        .from("sassa_verifications")
        .upsert({
          user_id: user.id,
          grant_type: selectedGrantType,
          card_photo_url: publicUrl,
          status: "pending"
        });

      if (dbError) throw dbError;

      toast({
        title: "Photo uploaded successfully!",
        description: "Your SASSA card is being verified. You'll be notified once approved.",
      });

      fetchVerification();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const grantTypes = [
    { value: "older_persons", label: "Older Persons Grant" },
    { value: "disability", label: "Disability Grant" },
    { value: "children", label: "Child Support Grant" },
    { value: "care_dependency", label: "Care Dependency Grant" },
    { value: "foster_care", label: "Foster Care Grant" }
  ];

  if (verification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SASSA Verification
            {getStatusBadge(verification.status)}
          </CardTitle>
          <CardDescription>
            Grant Type: {grantTypes.find(g => g.value === verification.grant_type)?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verification.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">🎉 You're eligible for 33% off on SASSA payment days!</p>
              <p className="text-green-600 text-sm mt-1">
                Next payment dates: Check the app for your grant type
              </p>
            </div>
          )}
          
          {verification.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">⏳ Your verification is being reviewed</p>
              <p className="text-yellow-600 text-sm mt-1">
                We'll notify you once it's approved (usually within 24 hours)
              </p>
            </div>
          )}

          {verification.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">❌ Verification unsuccessful</p>
              <p className="text-red-600 text-sm mt-1">
                Please upload a clearer photo of your SASSA card
              </p>
              <Button 
                onClick={() => setVerification(null)} 
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SASSA Grant Verification</CardTitle>
        <CardDescription>
          Get 33% off rides on SASSA payment days. Quick photo verification required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Grant Type</label>
          <Select value={selectedGrantType} onValueChange={setSelectedGrantType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your grant type" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {grantTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📸 Photo Tips:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Make sure all text is clearly visible</li>
            <li>• Good lighting - avoid shadows</li>
            <li>• Take photo straight on (not angled)</li>
            <li>• Include your name and ID number</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Upload SASSA Card Photo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={isUploading || !selectedGrantType}
              className="hidden"
              id="sassa-upload"
            />
            <label
              htmlFor="sassa-upload"
              className={`cursor-pointer ${!selectedGrantType ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="space-y-2">
                <Camera className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isUploading ? "Uploading..." : "Tap to take photo or upload"}
                </p>
              </div>
            </label>
          </div>
        </div>

        <Button 
          disabled={!selectedGrantType}
          onClick={() => document.getElementById('sassa-upload')?.click()}
          className="w-full"
          size="lg"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload SASSA Card"}
        </Button>
      </CardContent>
    </Card>
  );
};