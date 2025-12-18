import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DOTForm9A } from "@/components/compliance/DOTForm9A";
import { DOTApplicationChecklist } from "@/components/compliance/DOTApplicationChecklist";

const Form9A = () => {
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
          <h1 className="text-2xl font-bold">DOT E-Hailing Application</h1>
          <p className="text-muted-foreground">
            Complete Form 9A and track your application progress
          </p>
        </div>

        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Application Checklist
            </TabsTrigger>
            <TabsTrigger value="form9a" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Form 9A
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <DOTApplicationChecklist />
          </TabsContent>

          <TabsContent value="form9a">
            <DOTForm9A />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Form9A;
