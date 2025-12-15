import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { OperatingLicenseForm } from "@/components/compliance/OperatingLicenseForm";

const OperatingLicenseApplication = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/regulatory-registration")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Regulatory Registration
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Operating License Application</h1>
          <p className="text-muted-foreground">
            Complete and generate your Form 1B application for e-hailing operating license
          </p>
        </div>

        <OperatingLicenseForm />
      </div>
    </div>
  );
};

export default OperatingLicenseApplication;
