import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, MapPin, Bell, Users, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  location_sharing: boolean;
  data_analytics: boolean;
  marketing_communications: boolean;
  third_party_sharing: boolean;
  biometric_data: boolean;
  emergency_contacts: boolean;
}

export const PrivacyControls: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    location_sharing: true,
    data_analytics: false,
    marketing_communications: false,
    third_party_sharing: false,
    biometric_data: false,
    emergency_contacts: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    // Load from localStorage for now
    const savedSettings = localStorage.getItem(`privacy_settings_${user?.id}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save to localStorage for now
      localStorage.setItem(`privacy_settings_${user.id}`, JSON.stringify(newSettings));

      toast({
        title: "Privacy Setting Updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const privacyControls = [
    {
      key: 'location_sharing' as keyof PrivacySettings,
      title: 'Location Sharing',
      description: 'Allow real-time location sharing for safety and ride matching',
      icon: MapPin,
      critical: true,
    },
    {
      key: 'emergency_contacts' as keyof PrivacySettings,
      title: 'Emergency Contacts',
      description: 'Share location with emergency contacts during panic situations',
      icon: Users,
      critical: true,
    },
    {
      key: 'data_analytics' as keyof PrivacySettings,
      title: 'Usage Analytics',
      description: 'Help improve the app by sharing anonymous usage data',
      icon: Database,
      critical: false,
    },
    {
      key: 'marketing_communications' as keyof PrivacySettings,
      title: 'Marketing Communications',
      description: 'Receive updates about new features and community events',
      icon: Bell,
      critical: false,
    },
    {
      key: 'third_party_sharing' as keyof PrivacySettings,
      title: 'Third-Party Data Sharing',
      description: 'Share anonymized data with research institutions',
      icon: Eye,
      critical: false,
    },
    {
      key: 'biometric_data' as keyof PrivacySettings,
      title: 'Biometric Data',
      description: 'Use fingerprint/face recognition for enhanced security',
      icon: Shield,
      critical: false,
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Controls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage how your data is collected, used, and shared. Some settings are required for core functionality.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {privacyControls.map((control, index) => (
          <div key={control.key}>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-start space-x-3 flex-1">
                <control.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={control.key} className="font-medium">
                      {control.title}
                    </Label>
                    {control.critical && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {control.description}
                  </p>
                </div>
              </div>
              <Switch
                id={control.key}
                checked={settings[control.key]}
                onCheckedChange={(checked) => updatePrivacySetting(control.key, checked)}
                disabled={loading || control.critical}
              />
            </div>
            {index < privacyControls.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Data Retention:</strong> Your data is retained as long as your account is active. 
              You can request data deletion by contacting support.
            </p>
            <p>
              <strong>Data Portability:</strong> You can export your data at any time through your account settings.
            </p>
            <p>
              <strong>Updates:</strong> We'll notify you of any privacy policy changes that affect your data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};