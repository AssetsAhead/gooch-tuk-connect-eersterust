import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  MapPin, 
  Lightbulb, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Copy,
  ArrowRight,
  ArrowLeft,
  Printer,
  Upload,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { ReportShareDialog } from '@/components/reports/ReportShareDialog';
import { getPreFilledFormData, completedPatentApplication } from '@/data/completedPatentApplication';

interface FormData {
  // P1 - Application Form
  applicantFullName: string;
  applicantAddress: string;
  applicantPhone: string;
  applicantEmail: string;
  inventionTitle: string;
  priorityClaim: string;
  
  // P3 - Declaration
  inventorName: string;
  inventorAddress: string;
  isApplicantInventor: boolean;
  declarationDate: string;
  
  // P6 - Specification
  technicalField: string;
  backgroundArt: string;
  problemSolved: string;
  technicalSolution: string;
  advantagesOverPrior: string;
  bestMode: string;
  claims: string;
  abstract: string;
  
  // P26 - Indigenous Resources
  usesIndigenousResources: boolean;
  indigenousResourceDescription: string;
  communityConsent: string;
  benefitSharing: string;
}

const initialFormData: FormData = {
  applicantFullName: '',
  applicantAddress: '',
  applicantPhone: '',
  applicantEmail: '',
  inventionTitle: '',
  priorityClaim: '',
  inventorName: '',
  inventorAddress: '',
  isApplicantInventor: true,
  declarationDate: new Date().toISOString().split('T')[0],
  technicalField: '',
  backgroundArt: '',
  problemSolved: '',
  technicalSolution: '',
  advantagesOverPrior: '',
  bestMode: '',
  claims: '',
  abstract: '',
  usesIndigenousResources: false,
  indigenousResourceDescription: '',
  communityConsent: '',
  benefitSharing: ''
};

interface PatentFormWizardProps {
  ipReportData?: {
    title?: string;
    description?: string;
    technicalField?: string;
    claims?: string[];
    abstract?: string;
  };
  preloadCompletedApplication?: boolean;
}

export const PatentFormWizard: React.FC<PatentFormWizardProps> = ({ 
  ipReportData,
  preloadCompletedApplication = false 
}) => {
  const [formData, setFormData] = useState<FormData>(() => {
    if (preloadCompletedApplication) {
      return getPreFilledFormData();
    }
    return {
      ...initialFormData,
      inventionTitle: ipReportData?.title || '',
      technicalField: ipReportData?.technicalField || '',
      abstract: ipReportData?.abstract || '',
      claims: ipReportData?.claims?.join('\n\n') || ''
    };
  });
  const [activeForm, setActiveForm] = useState('p1');
  const [completedForms, setCompletedForms] = useState<string[]>(preloadCompletedApplication ? ['p1', 'p3', 'p6', 'p26'] : []);
  const [isApplicationLoaded, setIsApplicationLoaded] = useState(preloadCompletedApplication);
  const { toast } = useToast();
  const reportGeneration = useReportGeneration();

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadCompletedApplication = () => {
    const preFilledData = getPreFilledFormData();
    setFormData(preFilledData);
    setCompletedForms(['p1', 'p3', 'p6', 'p26']);
    setIsApplicationLoaded(true);
    toast({
      title: "Application Loaded",
      description: "Malcolm Johnston's completed patent application has been loaded.",
    });
  };

  const markFormComplete = (formId: string) => {
    if (!completedForms.includes(formId)) {
      setCompletedForms(prev => [...prev, formId]);
      toast({
        title: "Form Completed",
        description: `${formId.toUpperCase()} has been marked as complete.`
      });
    }
  };

  const getFormProgress = () => {
    return Math.round((completedForms.length / 4) * 100);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${fieldName} copied to clipboard. Paste into official PDF form.`
    });
  };

  const generateAllFormsPdf = () => {
    const applicant = completedPatentApplication.applicant;
    
    reportGeneration.generatePdfReport({
      title: "CIPC Provisional Patent Application",
      subtitle: "Complete Form Package: P1, P3, P6, P26",
      companyName: `Applicant: ${formData.applicantFullName}`,
      companyRef: `ID: ${applicant.idNumber}`,
      headerColor: [41, 128, 185],
      sections: [
        // P1 Section
        {
          title: "FORM P1 - APPLICATION FOR A PATENT",
          content: `Full Name of Applicant: ${formData.applicantFullName}
Address: ${formData.applicantAddress}
Phone: ${formData.applicantPhone}
Email: ${formData.applicantEmail}

Title of Invention: ${formData.inventionTitle}

Priority Claim: ${formData.priorityClaim || 'N/A (First filing)'}

Date: ${new Date().toLocaleDateString('en-ZA')}`
        },
        // P3 Section
        {
          title: "FORM P3 - DECLARATION BY APPLICANT",
          content: `I, ${formData.inventorName},
of ${formData.inventorAddress},

hereby declare that:
${formData.isApplicantInventor 
  ? '☑ I am the true inventor of the invention described in the accompanying specification.'
  : '☐ The true inventor has assigned their rights to the applicant.'}

Title of Invention: ${formData.inventionTitle}

Declaration Date: ${formData.declarationDate}

Signature: ________________________`
        },
        // P6 Section
        {
          title: "FORM P6 - PROVISIONAL SPECIFICATION",
          content: `TITLE: ${formData.inventionTitle}`
        },
        {
          title: "1. TECHNICAL FIELD",
          content: formData.technicalField
        },
        {
          title: "2. BACKGROUND ART",
          content: formData.backgroundArt
        },
        {
          title: "3. PROBLEM TO BE SOLVED",
          content: formData.problemSolved
        },
        {
          title: "4. TECHNICAL SOLUTION",
          content: formData.technicalSolution
        },
        {
          title: "5. ADVANTAGES OVER PRIOR ART",
          content: formData.advantagesOverPrior
        },
        {
          title: "6. BEST MODE OF IMPLEMENTATION",
          content: formData.bestMode
        },
        {
          title: "7. CLAIMS",
          content: formData.claims
        },
        {
          title: "8. ABSTRACT",
          content: formData.abstract
        },
        // P26 Section
        {
          title: "FORM P26 - INDIGENOUS RESOURCES STATEMENT",
          content: formData.usesIndigenousResources 
            ? `Uses Indigenous Biological Resources: YES

Description of Resources Used:
${formData.indigenousResourceDescription}

Community Consent:
${formData.communityConsent}

Benefit Sharing Arrangements:
${formData.benefitSharing}`
            : `Uses Indigenous Biological Resources: NO

This invention does not utilize any indigenous biological resources, genetic resources, or traditional knowledge.`
        },
        {
          title: "FILING INSTRUCTIONS",
          list: [
            "Print this document and sign where indicated",
            "Prepare R590 filing fee (provisional patent)",
            "Submit via CIPC e-Services portal: eservices.cipc.co.za",
            "Or mail to: CIPC, PO Box 429, Pretoria, 0001",
            "Retain copy for your records",
            "You have 12 months to file complete patent application"
          ]
        }
      ],
      footer: `CONFIDENTIAL - Patent Application for ${formData.applicantFullName} | Generated ${new Date().toLocaleDateString('en-ZA')}`
    });
  };

  const getReportSummary = () => {
    return `*CIPC Patent Application*%0A%0A` +
      `Applicant: ${formData.applicantFullName}%0A` +
      `Title: ${formData.inventionTitle}%0A` +
      `Date: ${new Date().toLocaleDateString('en-ZA')}%0A%0A` +
      `Forms Completed: P1, P3, P6, P26%0A%0A` +
      `*Abstract:*%0A${formData.abstract.substring(0, 300)}...%0A%0A` +
      `_Full PDF available for download._`;
  };

  const generatePrintableContent = (formId: string) => {
    let content = '';
    
    switch (formId) {
      case 'p1':
        content = `
FORM P1 - APPLICATION FOR A PATENT
===================================

1. Full Name of Applicant(s): ${formData.applicantFullName}

2. Address of Applicant(s): ${formData.applicantAddress}

3. Title of Invention: ${formData.inventionTitle}

4. Priority Claim (if any): ${formData.priorityClaim || 'N/A'}

5. Contact Information:
   Phone: ${formData.applicantPhone}
   Email: ${formData.applicantEmail}

Address for Service: ${formData.applicantAddress}

Date: ${new Date().toLocaleDateString('en-ZA')}
        `;
        break;
      case 'p3':
        content = `
FORM P3 - DECLARATION BY APPLICANT
===================================

I, ${formData.inventorName},

of ${formData.inventorAddress},

hereby declare that:

${formData.isApplicantInventor 
  ? '☑ I am the true inventor of the invention described in the accompanying specification.'
  : '☐ The true inventor has assigned their rights to the applicant.'}

Title of Invention: ${formData.inventionTitle}

Date: ${formData.declarationDate}

Signature: ________________________
        `;
        break;
      case 'p6':
        content = `
FORM P6 - PROVISIONAL SPECIFICATION
====================================

TITLE: ${formData.inventionTitle}

1. TECHNICAL FIELD
${formData.technicalField}

2. BACKGROUND ART
${formData.backgroundArt}

3. PROBLEM TO BE SOLVED
${formData.problemSolved}

4. TECHNICAL SOLUTION
${formData.technicalSolution}

5. ADVANTAGES OVER PRIOR ART
${formData.advantagesOverPrior}

6. BEST MODE OF IMPLEMENTATION
${formData.bestMode}

7. CLAIMS
${formData.claims}

8. ABSTRACT
${formData.abstract}
        `;
        break;
      case 'p26':
        content = `
FORM P26 - INDIGENOUS RESOURCES STATEMENT
==========================================

Uses Indigenous Biological Resources: ${formData.usesIndigenousResources ? 'YES' : 'NO'}

${formData.usesIndigenousResources ? `
Description of Resources Used:
${formData.indigenousResourceDescription}

Community Consent:
${formData.communityConsent}

Benefit Sharing Arrangements:
${formData.benefitSharing}
` : 'This invention does not utilize any indigenous biological resources, genetic resources, or traditional knowledge.'}

Date: ${new Date().toLocaleDateString('en-ZA')}
        `;
        break;
    }
    
    return content;
  };

  const handlePrint = (formId: string) => {
    const content = generatePrintableContent(formId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>CIPC ${formId.toUpperCase()} - Print Version</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formTabs = [
    { id: 'p1', name: 'P1 - Application', icon: FileText },
    { id: 'p3', name: 'P3 - Declaration', icon: User },
    { id: 'p6', name: 'P6 - Specification', icon: Lightbulb },
    { id: 'p26', name: 'P26 - Indigenous', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Load Application Banner */}
      {!isApplicationLoaded && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Upload className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary">Completed Application Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Malcolm Johnston's AI Incident Detection System patent application is ready to load.
                  </p>
                </div>
              </div>
              <Button onClick={loadCompletedApplication} className="shrink-0">
                <Upload className="mr-2 h-4 w-4" />
                Load Completed Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Loaded Success */}
      {isApplicationLoaded && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-success">Application Loaded Successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    All 4 forms are complete. Download PDF or print individual forms below.
                  </p>
                </div>
              </div>
              <Button onClick={generateAllFormsPdf} variant="default" className="shrink-0">
                <FileDown className="mr-2 h-4 w-4" />
                Download Complete PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Patent Form-Filling Assistant
              </CardTitle>
              <CardDescription>
                Complete each form section, then copy/print for your official CIPC submission
              </CardDescription>
            </div>
            <Badge variant={getFormProgress() === 100 ? "default" : "secondary"}>
              {completedForms.length}/4 Forms Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{getFormProgress()}%</span>
            </div>
            <Progress value={getFormProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <ReportShareDialog
        open={reportGeneration.showShareDialog}
        onOpenChange={(open) => !open && reportGeneration.closeShareDialog()}
        title="CIPC Patent Application"
        pdfDataUrl={reportGeneration.pdfDataUrl}
        onDownload={reportGeneration.downloadPdf}
        onPrint={reportGeneration.printReport}
        onShareWhatsApp={reportGeneration.shareViaWhatsApp}
        onShareEmail={reportGeneration.shareViaEmail}
        onShareSms={reportGeneration.shareViaSms}
        reportSummary={`CIPC Patent Application for ${formData.inventionTitle} by ${formData.applicantFullName}. Forms: P1, P3, P6, P26 complete.`}
        emailSubject={`CIPC Patent Application - ${formData.inventionTitle}`}
        emailBody={`Please find attached the complete provisional patent application for:\n\nTitle: ${formData.inventionTitle}\nApplicant: ${formData.applicantFullName}\n\nForms included: P1, P3, P6, P26`}
        filename={`CIPC_Patent_${formData.applicantFullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
      />

      {/* Form Tabs */}
      <Tabs value={activeForm} onValueChange={setActiveForm}>
        <TabsList className="grid grid-cols-4 w-full">
          {formTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs sm:text-sm">
              {completedForms.includes(tab.id) ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <tab.icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{tab.name}</span>
              <span className="sm:hidden">{tab.id.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* P1 - Application Form */}
        <TabsContent value="p1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form P1 - Application for a Patent
              </CardTitle>
              <CardDescription>
                Main application form submitted to the Registrar of Patents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="applicantFullName">Full Name of Applicant(s) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="applicantFullName"
                      value={formData.applicantFullName}
                      onChange={(e) => updateField('applicantFullName', e.target.value)}
                      placeholder="Your full legal name"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(formData.applicantFullName, 'Applicant Name')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventionTitle">Title of Invention *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="inventionTitle"
                      value={formData.inventionTitle}
                      onChange={(e) => updateField('inventionTitle', e.target.value)}
                      placeholder="Descriptive title of your invention"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(formData.inventionTitle, 'Invention Title')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicantAddress">Address of Applicant(s) *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="applicantAddress"
                    value={formData.applicantAddress}
                    onChange={(e) => updateField('applicantAddress', e.target.value)}
                    placeholder="Full postal address for service"
                    rows={2}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.applicantAddress, 'Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="applicantPhone">Phone Number</Label>
                  <Input
                    id="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={(e) => updateField('applicantPhone', e.target.value)}
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Email Address</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => updateField('applicantEmail', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priorityClaim">Priority Claim (Optional)</Label>
                <Input
                  id="priorityClaim"
                  value={formData.priorityClaim}
                  onChange={(e) => updateField('priorityClaim', e.target.value)}
                  placeholder="If claiming priority from earlier application"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if this is your first filing. Used for PCT applications.
                </p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => handlePrint('p1')}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print/Preview
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => markFormComplete('p1')}>
                    Mark Complete
                  </Button>
                  <Button onClick={() => setActiveForm('p3')}>
                    Next: P3 Declaration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P3 - Declaration Form */}
        <TabsContent value="p3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Form P3 - Declaration by Applicant
              </CardTitle>
              <CardDescription>
                Declaration confirming inventorship and right to apply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inventorName">Name of Inventor *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="inventorName"
                      value={formData.inventorName}
                      onChange={(e) => updateField('inventorName', e.target.value)}
                      placeholder="Full name of the true inventor"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(formData.inventorName, 'Inventor Name')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="declarationDate">Declaration Date *</Label>
                  <Input
                    id="declarationDate"
                    type="date"
                    value={formData.declarationDate}
                    onChange={(e) => updateField('declarationDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventorAddress">Address of Inventor *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="inventorAddress"
                    value={formData.inventorAddress}
                    onChange={(e) => updateField('inventorAddress', e.target.value)}
                    placeholder="Full address of the inventor"
                    rows={2}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.inventorAddress, 'Inventor Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="isApplicantInventor"
                  checked={formData.isApplicantInventor}
                  onChange={(e) => updateField('isApplicantInventor', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isApplicantInventor" className="cursor-pointer">
                  I am the true inventor of this invention (Applicant = Inventor)
                </Label>
              </div>

              {!formData.isApplicantInventor && (
                <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">Assignment Required</p>
                      <p>If you are not the inventor, you'll need a written assignment from the inventor transferring patent rights to you.</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveForm('p1')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint('p3')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print/Preview
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => markFormComplete('p3')}>
                    Mark Complete
                  </Button>
                  <Button onClick={() => setActiveForm('p6')}>
                    Next: P6 Specification
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P6 - Provisional Specification */}
        <TabsContent value="p6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Form P6 - Provisional Specification
              </CardTitle>
              <CardDescription>
                Technical description of your invention - the heart of your patent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="technicalField">1. Technical Field *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="technicalField"
                    value={formData.technicalField}
                    onChange={(e) => updateField('technicalField', e.target.value)}
                    placeholder="The present invention relates to the field of..."
                    rows={3}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.technicalField, 'Technical Field')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Describe the general technical area of your invention
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundArt">2. Background Art / Prior Art</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="backgroundArt"
                    value={formData.backgroundArt}
                    onChange={(e) => updateField('backgroundArt', e.target.value)}
                    placeholder="Existing solutions include... However, these have limitations such as..."
                    rows={4}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.backgroundArt, 'Background Art')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemSolved">3. Problem to be Solved *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="problemSolved"
                    value={formData.problemSolved}
                    onChange={(e) => updateField('problemSolved', e.target.value)}
                    placeholder="The problem solved by the present invention is..."
                    rows={3}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.problemSolved, 'Problem Solved')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalSolution">4. Technical Solution *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="technicalSolution"
                    value={formData.technicalSolution}
                    onChange={(e) => updateField('technicalSolution', e.target.value)}
                    placeholder="The invention provides a solution by... The system comprises..."
                    rows={6}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.technicalSolution, 'Technical Solution')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the core of your patent - describe HOW your invention works
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advantagesOverPrior">5. Advantages Over Prior Art</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="advantagesOverPrior"
                    value={formData.advantagesOverPrior}
                    onChange={(e) => updateField('advantagesOverPrior', e.target.value)}
                    placeholder="The advantages of the present invention include..."
                    rows={3}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.advantagesOverPrior, 'Advantages')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bestMode">6. Best Mode of Implementation</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="bestMode"
                    value={formData.bestMode}
                    onChange={(e) => updateField('bestMode', e.target.value)}
                    placeholder="The preferred embodiment of the invention includes..."
                    rows={4}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.bestMode, 'Best Mode')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claims">7. Claims *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="claims"
                    value={formData.claims}
                    onChange={(e) => updateField('claims', e.target.value)}
                    placeholder="1. A system for... comprising:&#10;   a) first component...&#10;   b) second component...&#10;&#10;2. The system of claim 1, wherein..."
                    rows={8}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.claims, 'Claims')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Claims define the legal scope of your patent protection. Start broad, then add dependent claims.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">8. Abstract *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => updateField('abstract', e.target.value)}
                    placeholder="A brief summary of the invention (max 150 words)..."
                    rows={4}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(formData.abstract, 'Abstract')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.abstract.split(/\s+/).filter(Boolean).length}/150 words
                </p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveForm('p3')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint('p6')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print/Preview
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => markFormComplete('p6')}>
                    Mark Complete
                  </Button>
                  <Button onClick={() => setActiveForm('p26')}>
                    Next: P26 Indigenous
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P26 - Indigenous Resources Statement */}
        <TabsContent value="p26">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Form P26 - Indigenous Resources Statement
              </CardTitle>
              <CardDescription>
                Declaration regarding use of indigenous biological resources or traditional knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Important:</strong> South African law requires disclosure if your invention uses any indigenous biological resources, genetic resources, or traditional knowledge. Most technology inventions will select "No" below.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="usesIndigenousResources"
                  checked={formData.usesIndigenousResources}
                  onChange={(e) => updateField('usesIndigenousResources', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="usesIndigenousResources" className="cursor-pointer">
                  This invention uses indigenous biological resources, genetic resources, or traditional knowledge
                </Label>
              </div>

              {formData.usesIndigenousResources ? (
                <div className="space-y-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="indigenousResourceDescription">Description of Resources Used *</Label>
                    <Textarea
                      id="indigenousResourceDescription"
                      value={formData.indigenousResourceDescription}
                      onChange={(e) => updateField('indigenousResourceDescription', e.target.value)}
                      placeholder="Describe the specific indigenous resources, traditional knowledge, or genetic resources used..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communityConsent">Community Consent Documentation *</Label>
                    <Textarea
                      id="communityConsent"
                      value={formData.communityConsent}
                      onChange={(e) => updateField('communityConsent', e.target.value)}
                      placeholder="Describe how prior informed consent was obtained from the relevant community or custodians..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefitSharing">Benefit Sharing Arrangements *</Label>
                    <Textarea
                      id="benefitSharing"
                      value={formData.benefitSharing}
                      onChange={(e) => updateField('benefitSharing', e.target.value)}
                      placeholder="Describe the benefit-sharing agreement with the community or custodians..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-emerald-500/30 bg-emerald-500/10 rounded-lg text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-emerald-700 font-medium">No Indigenous Resources Declaration Required</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Your P26 form will state that no indigenous resources are used
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveForm('p6')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint('p26')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print/Preview
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => markFormComplete('p26')}>
                    Mark Complete
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => {
                      markFormComplete('p26');
                      toast({
                        title: "🎉 All Forms Ready!",
                        description: "Print each form, sign, and submit to CIPC with R590 fee."
                      });
                    }}
                    disabled={completedForms.length < 3}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Wizard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Summary */}
      {completedForms.length === 4 && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-emerald-700">All Forms Complete!</h3>
                <p className="text-sm text-emerald-600">
                  Your patent application is ready for submission. Next steps:
                </p>
                <ol className="text-sm text-emerald-600 list-decimal ml-4 space-y-1">
                  <li>Print all 4 forms using the Print/Preview buttons</li>
                  <li>Sign each form where indicated</li>
                  <li>Prepare payment of R590 (postal order or revenue stamps)</li>
                  <li>Submit to CIPC via e-Services or post</li>
                </ol>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="https://eservices.cipc.co.za/" target="_blank" rel="noopener noreferrer">
                    Open CIPC e-Services Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
