import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Award,
  FileCheck,
  Globe,
  Upload,
  HelpCircle,
  PenTool
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PatentFormWizard } from "./PatentFormWizard";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  formRef?: string;
  link?: string;
}

interface FilingForm {
  id: string;
  name: string;
  description: string;
  required: boolean;
  downloadUrl: string;
  type: 'patent' | 'trademark' | 'both';
}

export const CIPCFilingChecklist = () => {
  const { toast } = useToast();
  
  const [patentChecklist, setPatentChecklist] = useState<ChecklistItem[]>([
    {
      id: "p1",
      title: "Complete Form P1 (Patent Application)",
      description: "Main application form with applicant details, invention title, and declaration",
      completed: false,
      required: true,
      formRef: "P1"
    },
    {
      id: "p2",
      title: "Prepare Form P6 (Provisional Specification)",
      description: "Technical description of your invention - use your generated CIPC report content",
      completed: false,
      required: true,
      formRef: "P6"
    },
    {
      id: "p3",
      title: "Complete Form P3 (Declaration by Applicant)",
      description: "Sworn declaration of inventorship and rights",
      completed: false,
      required: true,
      formRef: "P3"
    },
    {
      id: "p4",
      title: "Complete Form P26 (Indigenous Resources Statement)",
      description: "Declaration regarding use of indigenous biological resources or traditional knowledge",
      completed: false,
      required: true,
      formRef: "P26"
    },
    {
      id: "p5",
      title: "Prepare technical drawings (if applicable)",
      description: "Clear technical illustrations of your invention - can be hand-drawn initially",
      completed: false,
      required: false
    },
    {
      id: "p6",
      title: "Conduct prior art search",
      description: "Search existing patents to ensure novelty - use Google Patents or CIPC database",
      completed: false,
      required: false,
      link: "https://patents.google.com/"
    },
    {
      id: "p7",
      title: "Calculate and prepare filing fee (R590)",
      description: "Provisional patent application fee - payable online or at CIPC office",
      completed: false,
      required: true
    },
    {
      id: "p8",
      title: "Submit via CIPC e-Services Portal",
      description: "Upload all documents and pay fees online",
      completed: false,
      required: true,
      link: "https://iponline.cipc.co.za/"
    }
  ]);

  const [trademarkChecklist, setTrademarkChecklist] = useState<ChecklistItem[]>([
    {
      id: "tm1",
      title: "Complete Form TM1 (Trademark Application)",
      description: "Main trademark registration form with applicant details and mark representation",
      completed: false,
      required: true,
      formRef: "TM1"
    },
    {
      id: "tm2",
      title: "Prepare logo/wordmark image",
      description: "High-quality image of your trademark (300dpi, clear background preferred)",
      completed: false,
      required: true
    },
    {
      id: "tm3",
      title: "Identify Nice Classification classes",
      description: "Select relevant trademark classes (Class 39 for transport, Class 9 for software)",
      completed: false,
      required: true,
      link: "https://www.wipo.int/classifications/nice/en/"
    },
    {
      id: "tm4",
      title: "Conduct trademark search",
      description: "Check for existing similar marks on CIPC database",
      completed: false,
      required: false,
      link: "https://iponline.cipc.co.za/trademarks"
    },
    {
      id: "tm5",
      title: "Calculate filing fee (R590 per class)",
      description: "Trademark registration fee per class - payable online",
      completed: false,
      required: true
    },
    {
      id: "tm6",
      title: "Submit via CIPC e-Services Portal",
      description: "Upload application and pay fees online",
      completed: false,
      required: true,
      link: "https://iponline.cipc.co.za/"
    }
  ]);

  const filingForms: FilingForm[] = [
    {
      id: "p1",
      name: "Form P1 - Patent Application",
      description: "Main patent application form",
      required: true,
      downloadUrl: "https://www.cipc.co.za/files/3715/1042/8316/P1_-_Application_for_a_Patent.pdf",
      type: "patent"
    },
    {
      id: "p6",
      name: "Form P6 - Provisional Specification",
      description: "Technical specification of invention",
      required: true,
      downloadUrl: "https://www.cipc.co.za/files/2915/1042/8308/P6_-_Provisional_Specification.pdf",
      type: "patent"
    },
    {
      id: "p3",
      name: "Form P3 - Declaration by Applicant",
      description: "Declaration of inventorship",
      required: true,
      downloadUrl: "https://www.cipc.co.za/files/7815/1042/8300/P3_-_Declaration_by_Applicant.pdf",
      type: "patent"
    },
    {
      id: "p26",
      name: "Form P26 - Indigenous Resources Statement",
      description: "Statement on indigenous biological resources",
      required: true,
      downloadUrl: "https://www.cipc.co.za/files/4015/1042/8323/P26_-_Statement_regarding_Indigenous_Biological_Resources.pdf",
      type: "patent"
    },
    {
      id: "tm1",
      name: "Form TM1 - Trademark Application",
      description: "Main trademark registration form",
      required: true,
      downloadUrl: "https://www.cipc.co.za/files/4014/4458/3291/TM1_Application_to_register_a_trade_mark.pdf",
      type: "trademark"
    }
  ];

  const togglePatentItem = (id: string) => {
    setPatentChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const toggleTrademarkItem = (id: string) => {
    setTrademarkChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const patentProgress = Math.round((patentChecklist.filter(i => i.completed).length / patentChecklist.length) * 100);
  const trademarkProgress = Math.round((trademarkChecklist.filter(i => i.completed).length / trademarkChecklist.length) * 100);

  const handleFormDownload = (form: FilingForm) => {
    window.open(form.downloadUrl, '_blank');
    toast({
      title: "Downloading Form",
      description: `Opening ${form.name} in new tab`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>File with CIPC - Self-Service Guide</CardTitle>
                <CardDescription>
                  Complete step-by-step checklist for patent and trademark registration without a lawyer
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-success border-success">
              No Lawyer Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Provisional Patent</div>
                <div className="text-xs text-muted-foreground">12 months protection</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Est. Cost: R590</div>
                <div className="text-xs text-muted-foreground">Per patent application</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Trademark: R590/class</div>
                <div className="text-xs text-muted-foreground">Per Nice Classification</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Essential CIPC Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://iponline.cipc.co.za/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                <div className="text-left">
                  <div className="font-medium">e-Services Portal</div>
                  <div className="text-xs text-muted-foreground">File online</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://www.cipc.co.za/?page_id=4080" target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Patent Forms</div>
                  <div className="text-xs text-muted-foreground">Download all forms</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="mailto:Patents@cipc.co.za">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Patents Email</div>
                  <div className="text-xs text-muted-foreground">Patents@cipc.co.za</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="tel:0861002472">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Call Centre</div>
                  <div className="text-xs text-muted-foreground">086 100 2472</div>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Required Forms Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Required Forms
          </CardTitle>
          <CardDescription>
            Official CIPC forms needed for patent and trademark registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                Patent Forms
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filingForms.filter(f => f.type === 'patent').map(form => (
                  <Button 
                    key={form.id}
                    variant="outline" 
                    size="sm"
                    className="justify-between h-auto py-2"
                    onClick={() => handleFormDownload(form)}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">{form.name}</div>
                        <div className="text-xs text-muted-foreground">{form.description}</div>
                      </div>
                    </div>
                    <Download className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-tuk-orange" />
                Trademark Forms
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filingForms.filter(f => f.type === 'trademark').map(form => (
                  <Button 
                    key={form.id}
                    variant="outline" 
                    size="sm"
                    className="justify-between h-auto py-2"
                    onClick={() => handleFormDownload(form)}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">{form.name}</div>
                        <div className="text-xs text-muted-foreground">{form.description}</div>
                      </div>
                    </div>
                    <Download className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Form-Filling Assistant */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="wizard" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <PenTool className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Interactive Form-Filling Assistant</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Fill out your forms digitally, then print for CIPC submission
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <PatentFormWizard preloadCompletedApplication={true} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Checklists */}
      <Accordion type="multiple" defaultValue={["patent", "trademark"]} className="space-y-4">
        {/* Patent Checklist */}
        <AccordionItem value="patent" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Provisional Patent Application</div>
                  <div className="text-xs text-muted-foreground">
                    {patentChecklist.filter(i => i.completed).length} of {patentChecklist.length} steps complete
                  </div>
                </div>
              </div>
              <Badge variant={patentProgress === 100 ? "default" : "outline"} className="ml-4">
                {patentProgress}%
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Progress value={patentProgress} className="mb-4" />
            <div className="space-y-3">
              {patentChecklist.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.completed ? 'bg-success/5 border-success/30' : 'bg-muted/30'
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => togglePatentItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={item.id}
                      className={`text-sm font-medium cursor-pointer ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {index + 1}. {item.title}
                      {item.required && <span className="text-destructive ml-1">*</span>}
                      {item.formRef && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.formRef}
                        </Badge>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    {item.link && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 mt-1 text-xs"
                        asChild
                      >
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open resource
                        </a>
                      </Button>
                    )}
                  </div>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Trademark Checklist */}
        <AccordionItem value="trademark" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-tuk-orange" />
                <div className="text-left">
                  <div className="font-medium">Trademark Registration</div>
                  <div className="text-xs text-muted-foreground">
                    {trademarkChecklist.filter(i => i.completed).length} of {trademarkChecklist.length} steps complete
                  </div>
                </div>
              </div>
              <Badge variant={trademarkProgress === 100 ? "default" : "outline"} className="ml-4">
                {trademarkProgress}%
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Progress value={trademarkProgress} className="mb-4" />
            <div className="space-y-3">
              {trademarkChecklist.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.completed ? 'bg-success/5 border-success/30' : 'bg-muted/30'
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleTrademarkItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={item.id}
                      className={`text-sm font-medium cursor-pointer ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {index + 1}. {item.title}
                      {item.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    {item.link && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 mt-1 text-xs"
                        asChild
                      >
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open resource
                        </a>
                      </Button>
                    )}
                  </div>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Form P6 Mapping Guide */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-warning" />
            How to Complete Form P6 (Provisional Specification)
          </CardTitle>
          <CardDescription>
            Use your generated CIPC report to populate the provisional specification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="font-medium">From Your Report → To Form P6:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 1</Badge>
                    <div>
                      <div className="font-medium">Title of Invention</div>
                      <div className="text-xs text-muted-foreground">
                        Copy from "Innovation Title" in your report
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 2</Badge>
                    <div>
                      <div className="font-medium">Field of Invention</div>
                      <div className="text-xs text-muted-foreground">
                        Use "Category" from your report (e.g., "Safety Technology")
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 3</Badge>
                    <div>
                      <div className="font-medium">Background/Problem</div>
                      <div className="text-xs text-muted-foreground">
                        Describe current industry problems your invention solves
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="font-medium">&nbsp;</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 4</Badge>
                    <div>
                      <div className="font-medium">Technical Description</div>
                      <div className="text-xs text-muted-foreground">
                        Copy "Technical Details" from your report
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 5</Badge>
                    <div>
                      <div className="font-medium">Claims</div>
                      <div className="text-xs text-muted-foreground">
                        List unique features as numbered claims
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="shrink-0">Section 6</Badge>
                    <div>
                      <div className="font-medium">Advantages</div>
                      <div className="text-xs text-muted-foreground">
                        Use "Competitive Advantage" from your report
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-primary">Pro Tip: Keep It Simple</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    A provisional specification doesn't need to be perfect. It establishes your priority date. 
                    You have 12 months to file a complete specification with more detail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section for User's Downloaded Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Completed Forms
          </CardTitle>
          <CardDescription>
            Upload your completed CIPC forms here for review assistance (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Upload your completed CIPC forms in the chat to get help reviewing them
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: PDF, JPG, PNG (max 20MB)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
