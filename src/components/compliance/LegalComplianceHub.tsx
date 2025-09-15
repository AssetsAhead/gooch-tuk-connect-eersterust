import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplianceStatus {
  popia_consent: boolean;
  terms_accepted: boolean;
  age_verification: boolean;
  emergency_contact_consent: boolean;
  data_processing_consent: boolean;
}

export const LegalComplianceHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    popia_consent: false,
    terms_accepted: false,
    age_verification: false,
    emergency_contact_consent: false,
    data_processing_consent: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchComplianceStatus();
    }
  }, [user]);

  const fetchComplianceStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_compliance')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching compliance status:', error);
        return;
      }

      if (data) {
        setComplianceStatus(data.compliance_data);
      }
    } catch (error) {
      console.error('Error fetching compliance status:', error);
    }
  };

  const updateCompliance = async (key: keyof ComplianceStatus, accepted: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const newStatus = { ...complianceStatus, [key]: accepted };
      setComplianceStatus(newStatus);

      const { error } = await supabase
        .from('user_compliance')
        .upsert({
          user_id: user.id,
          compliance_data: newStatus,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Compliance Updated",
        description: `${key.replace('_', ' ')} has been ${accepted ? 'accepted' : 'declined'}.`,
      });
    } catch (error) {
      console.error('Error updating compliance:', error);
      toast({
        title: "Error",
        description: "Failed to update compliance status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const complianceItems = [
    {
      key: 'terms_accepted' as keyof ComplianceStatus,
      title: 'Terms of Service',
      description: 'Accept the terms and conditions for using PoortLink',
      required: true,
    },
    {
      key: 'popia_consent' as keyof ComplianceStatus,
      title: 'POPIA Consent',
      description: 'Consent to data processing under South African Privacy Law',
      required: true,
    },
    {
      key: 'age_verification' as keyof ComplianceStatus,
      title: 'Age Verification',
      description: 'Confirm you are 18 years or older',
      required: true,
    },
    {
      key: 'emergency_contact_consent' as keyof ComplianceStatus,
      title: 'Emergency Contact Sharing',
      description: 'Allow sharing location with emergency contacts',
      required: false,
    },
    {
      key: 'data_processing_consent' as keyof ComplianceStatus,
      title: 'Analytics & Improvement',
      description: 'Consent to data processing for service improvement',
      required: false,
    },
  ];

  const overallCompliance = complianceItems
    .filter(item => item.required)
    .every(item => complianceStatus[item.key]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Compliance Status
          </CardTitle>
          <div className="flex items-center gap-2">
            {overallCompliance ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Compliant
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">
                  Action Required
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!overallCompliance && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must accept all required legal terms to use PoortLink's full functionality.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="compliance" className="w-full">
            <TabsList>
              <TabsTrigger value="compliance">Compliance Items</TabsTrigger>
              <TabsTrigger value="documents">Legal Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compliance" className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {complianceStatus[item.key] ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button
                    variant={complianceStatus[item.key] ? "outline" : "default"}
                    size="sm"
                    onClick={() => updateCompliance(item.key, !complianceStatus[item.key])}
                    disabled={loading}
                  >
                    {complianceStatus[item.key] ? 'Revoke' : 'Accept'}
                  </Button>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Terms of Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <Button variant="outline" size="sm">
                      View Full Document
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Privacy Policy (POPIA Compliant)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Compliant with South African Protection of Personal Information Act
                    </p>
                    <Button variant="outline" size="sm">
                      View Privacy Policy
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Data Processing Agreement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Details on how your data is collected, processed, and stored
                    </p>
                    <Button variant="outline" size="sm">
                      View Agreement
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};