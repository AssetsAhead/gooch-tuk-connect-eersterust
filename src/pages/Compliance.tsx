import { NLTAAComplianceDashboard } from "@/components/compliance/NLTAAComplianceDashboard";
import { PolicyUpdatesSection } from "@/components/compliance/PolicyUpdatesSection";
import { InfoRegulatorGuide } from "@/components/compliance/InfoRegulatorGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, FileCheck, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const Compliance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        {/* Regulatory Registration Quick Access */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Regulatory Registration Tracker</CardTitle>
                  <CardDescription>
                    Track PoortLink's registration with NDoT, CIPC, PRE, SANTACO & Information Regulator
                  </CardDescription>
                </div>
              </div>
              <Button asChild>
                <Link to="/regulatory-registration">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Open Tracker
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete registration checklist for all required government bodies and industry organizations, 
              including document uploads and status tracking for each registration.
            </p>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <InfoRegulatorGuide />
          <PolicyUpdatesSection />
          <NLTAAComplianceDashboard />
        </div>
      </div>
    </div>
  );
};