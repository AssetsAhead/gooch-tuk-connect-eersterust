import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ExternalLink, 
  Download, 
  Mail, 
  Globe, 
  CheckCircle2, 
  FileText,
  User,
  Building2,
  ClipboardList,
  Send
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export const InfoRegulatorGuide = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "appoint-io",
      label: "Appoint an Information Officer",
      description: "Typically a director, CEO, or senior manager responsible for POPIA compliance",
      completed: false
    },
    {
      id: "appoint-dio",
      label: "Appoint Deputy Information Officer(s) (Optional)",
      description: "Delegate responsibilities to deputies if needed for your organization",
      completed: false
    },
    {
      id: "gather-details",
      label: "Gather Organization Details",
      description: "Registered name, trading name, CIPC registration number, physical address",
      completed: false
    },
    {
      id: "download-form",
      label: "Download Form 1",
      description: "Get the official Information Officer Registration Form from the Regulator",
      completed: false
    },
    {
      id: "complete-form",
      label: "Complete Form 1",
      description: "Fill in all required sections: Parts A, B, C, and E",
      completed: false
    },
    {
      id: "submit-form",
      label: "Submit Registration",
      description: "Submit via the online portal or email to the Regulator",
      completed: false
    }
  ]);

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const formSections = [
    {
      part: "Part A",
      title: "Information Officer Details",
      icon: User,
      fields: ["Full Name", "Designation/Title", "Physical Address", "Postal Address", "Email", "Phone Number"]
    },
    {
      part: "Part B",
      title: "Deputy Information Officer(s)",
      icon: User,
      fields: ["Deputy Name(s)", "Designation", "Contact Details", "Delegated Functions"]
    },
    {
      part: "Part C",
      title: "Responsible Party (Organization)",
      icon: Building2,
      fields: ["Registered Name", "Trading Name", "Registration Number (CIPC)", "Physical Address", "Postal Address"]
    },
    {
      part: "Part E",
      title: "Statistical Information",
      icon: ClipboardList,
      fields: ["Private Body", "Sector: Transportation, Storage and Logistics"]
    }
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Information Regulator Registration
                <Badge variant="outline" className="ml-2">POPIA</Badge>
              </CardTitle>
              <CardDescription>
                Step-by-step guide to register with the Information Regulator of South Africa
              </CardDescription>
            </div>
          </div>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedCount}/{checklist.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Registration Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            asChild
          >
            <a 
              href="https://inforegulator.org.za/wp-content/uploads/2020/07/InfoRegSA-eForm-InformationOfficersRegistration-2021-2.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">Download Form 1</div>
                <div className="text-xs text-muted-foreground">PDF Registration Form</div>
              </div>
            </a>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            asChild
          >
            <a 
              href="https://services.inforegulator.org.za" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Globe className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">Online Portal</div>
                <div className="text-xs text-muted-foreground">eServices Registration</div>
              </div>
            </a>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-3"
            asChild
          >
            <a href="mailto:Registration.IO@inforegulator.org.za">
              <Mail className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">Email Submission</div>
                <div className="text-xs text-muted-foreground">Registration.IO@inforegulator.org.za</div>
              </div>
            </a>
          </Button>
        </div>

        {/* Form Sections Guide */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Form 1 Sections
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {formSections.map((section) => (
              <div 
                key={section.part} 
                className="p-3 rounded-lg border bg-muted/30 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{section.part}: {section.title}</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-6">
                  {section.fields.map((field, idx) => (
                    <li key={idx} className="list-disc">{field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Registration Checklist
          </h4>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div 
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  item.completed ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                }`}
              >
                <Checkbox 
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={item.id} 
                    className={`font-medium text-sm cursor-pointer ${
                      item.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.completed && (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submission Info */}
        <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submission Options
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-medium">Option 1: Online Portal</p>
              <p className="text-muted-foreground text-xs">
                Register at services.inforegulator.org.za for fastest processing
              </p>
            </div>
            <div>
              <p className="font-medium">Option 2: Email</p>
              <p className="text-muted-foreground text-xs">
                Email completed Form 1 to Registration.IO@inforegulator.org.za
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Registration is free of charge. Keep a copy of your submission for records.
          </p>
        </div>

        {/* Official Link */}
        <div className="flex justify-end">
          <Button variant="link" className="gap-2" asChild>
            <a 
              href="https://inforegulator.org.za/information-officers/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Official Information Regulator Guidance
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
