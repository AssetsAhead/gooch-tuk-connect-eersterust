import { NLTAAComplianceDashboard } from "@/components/compliance/NLTAAComplianceDashboard";
import { PolicyUpdatesSection } from "@/components/compliance/PolicyUpdatesSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        
        <div className="space-y-8">
          <PolicyUpdatesSection />
          <NLTAAComplianceDashboard />
        </div>
      </div>
    </div>
  );
};
