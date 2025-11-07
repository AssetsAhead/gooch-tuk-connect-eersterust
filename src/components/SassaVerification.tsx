import { useState, useEffect, useMemo } from "react";
import { Camera, Upload, Check, Clock, X, Smartphone, MapPin, AlertCircle, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrlRefresh } from "@/hooks/useSignedUrlRefresh";

interface SassaVerification {
  id: string;
  status: string;
  grant_type: string;
  card_photo_url?: string;
  verified_at?: string;
  created_at: string;
  biometric_required?: boolean;
  biometric_status?: string;
  sms_link_verified?: boolean;
}

interface SassaOffice {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance?: number;
  phone?: string;
  hours: string;
}

export const SassaVerification = () => {
  const [verification, setVerification] = useState<SassaVerification | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGrantType, setSelectedGrantType] = useState("");
  const [nearbyOffices, setNearbyOffices] = useState<SassaOffice[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [smsLink, setSmsLink] = useState("");
  const [activeTab, setActiveTab] = useState("verification");
  const { toast } = useToast();

  // Parse file path from card_photo_url for signed URL refresh
  const signedUrlConfig = useMemo(() => {
    if (!verification?.card_photo_url) return null;
    
    // Extract file path from URL (stored path format: user_id/timestamp.ext)
    const urlMatch = verification.card_photo_url.match(/sassa-cards\/(.+?)(?:\?|$)/);
    if (!urlMatch) return null;

    return {
      bucketName: 'sassa-cards',
      filePath: urlMatch[1],
      expirySeconds: 3600, // 1 hour
    };
  }, [verification?.card_photo_url]);

  // Automatically refresh signed URLs before expiry
  const { signedUrl: refreshedCardUrl } = useSignedUrlRefresh(signedUrlConfig);

  useEffect(() => {
    fetchVerification();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          findNearbyOffices(coords);
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to Cape Town coordinates if location denied
          const defaultCoords = { lat: -33.9249, lng: 18.4241 };
          setUserLocation(defaultCoords);
          findNearbyOffices(defaultCoords);
        }
      );
    }
  };

  const findNearbyOffices = (userCoords: {lat: number; lng: number}) => {
    // Sample SASSA offices - in production, this would come from an API
    const offices: SassaOffice[] = [
      {
        name: "Cape Town SASSA Office",
        address: "Burg Street, Cape Town City Centre",
        coordinates: { lat: -33.9208, lng: 18.4230 },
        phone: "021 469 4500",
        hours: "Mon-Fri: 7:30-16:00"
      },
      {
        name: "Mitchells Plain SASSA Office", 
        address: "Town Centre, Mitchells Plain",
        coordinates: { lat: -34.0369, lng: 18.6137 },
        phone: "021 392 2300",
        hours: "Mon-Fri: 7:30-16:00"
      },
      {
        name: "Gugulethu SASSA Office",
        address: "NY1, Gugulethu",
        coordinates: { lat: -33.9729, lng: 18.5827 },
        phone: "021 637 8900",
        hours: "Mon-Fri: 7:30-16:00"
      },
      {
        name: "Johannesburg SASSA Office",
        address: "Pritchard Street, Johannesburg",
        coordinates: { lat: -26.2041, lng: 28.0473 },
        phone: "011 853 0017",
        hours: "Mon-Fri: 7:30-16:00"
      }
    ];

    // Calculate distances and sort by proximity
    const officesWithDistance = offices.map(office => ({
      ...office,
      distance: calculateDistance(userCoords, office.coordinates)
    })).sort((a, b) => a.distance! - b.distance!);

    setNearbyOffices(officesWithDistance);
  };

  const calculateDistance = (point1: {lat: number; lng: number}, point2: {lat: number; lng: number}) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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

      // Get initial signed URL with 1 hour expiration for security
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("sassa-cards")
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (signedUrlError) throw signedUrlError;

      // Save verification record with signed URL
      // The file path is embedded in the URL and will be parsed for auto-refresh
      const { error: dbError } = await supabase
        .from("sassa_verifications")
        .upsert({
          user_id: user.id,
          grant_type: selectedGrantType,
          card_photo_url: signedUrlData.signedUrl,
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

  const validateSmsLink = () => {
    if (smsLink.includes('sassa.gov.za') && smsLink.includes('verify')) {
      toast({
        title: "Valid SASSA Link",
        description: "This appears to be an official SASSA verification link",
      });
      // Open the link
      window.open(smsLink, '_blank');
    } else {
      toast({
        title: "Invalid Link",
        description: "This doesn't appear to be an official SASSA verification link. Please check the URL.",
        variant: "destructive",
      });
    }
  };

  const checkBiometricStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Simulate API call to check biometric status
    toast({
      title: "Checking Status",
      description: "Checking your biometric verification status...",
    });

    // In production, this would call the SASSA API
    setTimeout(() => {
      toast({
        title: "Status Updated",
        description: "Your verification status has been checked. Refresh to see updates.",
      });
    }, 2000);
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
          {verification.biometric_required && (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertTitle>Biometric Verification Required</AlertTitle>
              <AlertDescription>
                SASSA requires additional biometric verification for your grant. Check the tabs below for guidance.
              </AlertDescription>
            </Alert>
          )}

          {verification.status === "approved" && !verification.biometric_required && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">🎉 You're eligible for discounts on SASSA payment days!</p>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verification">Status</TabsTrigger>
              <TabsTrigger value="biometric">Biometric Guide</TabsTrigger>
              <TabsTrigger value="offices">Find Offices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="verification" className="space-y-4">
              <Button onClick={checkBiometricStatus} className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Check Biometric Status
              </Button>
            </TabsContent>

            <TabsContent value="biometric" className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Biometric Verification Process</AlertTitle>
                <AlertDescription>
                  SASSA may require facial recognition or fingerprint verification for certain grants.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">If you received an SMS from SASSA:</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Paste the verification link from SMS"
                      value={smsLink}
                      onChange={(e) => setSmsLink(e.target.value)}
                    />
                    <Button onClick={validateSmsLink} disabled={!smsLink} className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Validate & Open Link
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">📱 Smartphone Verification:</h5>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Follow the link in your SMS</li>
                    <li>• Allow camera access when prompted</li>
                    <li>• Take a clear selfie</li>
                    <li>• Place finger on camera for fingerprint scan</li>
                    <li>• Ensure good lighting and stable hands</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-900 mb-2">🏢 No Smartphone? Visit an Office:</h5>
                  <p className="text-orange-800 text-sm">
                    SASSA staff will assist you with biometric verification at any office or mobile service point.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="offices" className="space-y-4">
              <div className="space-y-3">
                {nearbyOffices.slice(0, 3).map((office, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{office.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {office.address}
                        </p>
                        {office.distance && (
                          <p className="text-sm text-blue-600 mt-1">
                            {office.distance.toFixed(1)} km away
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{office.hours}</p>
                      </div>
                      {office.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${office.phone}`}>Call</a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bring your South African ID, SASSA card, and proof of address. Arrive early as offices can be busy.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SASSA Grant Verification</CardTitle>
        <CardDescription>
          Get discounts on rides on SASSA payment days. Quick verification required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification">Card Upload</TabsTrigger>
            <TabsTrigger value="biometric">Biometric Guide</TabsTrigger>
            <TabsTrigger value="offices">Find Offices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>New in 2025: Biometric Verification</AlertTitle>
              <AlertDescription>
                SASSA now requires additional biometric verification for some users. Check the "Biometric Guide" tab for details.
              </AlertDescription>
            </Alert>

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
          </TabsContent>

          <TabsContent value="biometric" className="space-y-4 mt-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>SASSA Biometric Verification (2025)</AlertTitle>
              <AlertDescription>
                Some beneficiaries now need facial recognition or fingerprint verification. You'll receive an SMS if required.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">If you received an SMS from SASSA:</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Paste the verification link from SMS"
                    value={smsLink}
                    onChange={(e) => setSmsLink(e.target.value)}
                  />
                  <Button onClick={validateSmsLink} disabled={!smsLink} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Validate & Open Link
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-2">✅ Who needs biometric verification:</h5>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• People applying without a 13-digit SA ID</li>
                  <li>• Users updating banking or contact details</li>
                  <li>• SRD grant recipients flagged for identity issues</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">📱 Smartphone Process:</h5>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Click the SMS link on your phone</li>
                  <li>• Allow camera access when prompted</li>
                  <li>• Take a clear selfie (good lighting)</li>
                  <li>• Place finger on camera for fingerprint</li>
                  <li>• Keep steady - avoid shaking</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-medium text-orange-900 mb-2">🏢 No Smartphone? No Problem:</h5>
                <p className="text-orange-800 text-sm mb-2">
                  Visit any SASSA office or mobile service point. Staff will help you complete the biometric verification.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("offices")}>
                  Find Nearest Office
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offices" className="space-y-4 mt-4">
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertTitle>SASSA Offices Near You</AlertTitle>
              <AlertDescription>
                Visit for biometric verification, card collection, or general assistance.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {nearbyOffices.slice(0, 4).map((office, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{office.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {office.address}
                      </p>
                      {office.distance && (
                        <p className="text-sm text-blue-600 mt-1">
                          {office.distance.toFixed(1)} km away
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{office.hours}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {office.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${office.phone}`}>Call</a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://maps.google.com/?q=${office.coordinates.lat},${office.coordinates.lng}`} target="_blank">
                          Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>What to bring:</strong> South African ID, SASSA card, proof of address. Arrive early as offices can be busy, especially on payment days.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};