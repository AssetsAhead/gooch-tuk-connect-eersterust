import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Save, 
  Download, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";

interface Form9AData {
  // Company Information
  companyName: string;
  tradingName: string;
  cipcNumber: string;
  taxPin: string;
  vatNumber: string;
  
  // Registered Address
  registeredAddress: string;
  registeredCity: string;
  registeredProvince: string;
  registeredPostalCode: string;
  
  // Contact Person
  contactName: string;
  contactPosition: string;
  contactPhone: string;
  contactEmail: string;
  contactIdNumber: string;
  
  // Operating Details
  operatingArea: string;
  numberOfVehicles: string;
  vehicleTypes: string;
  
  // ICASA Details
  icasaCertificateNumber: string;
  icasaExpiryDate: string;
  
  // Banking Details (for payment verification)
  bankName: string;
  accountNumber: string;
  branchCode: string;
  
  // Declaration
  declarationDate: string;
  declarantName: string;
}

const STORAGE_KEY = 'poortlink_form9a_data';

const initialFormData: Form9AData = {
  companyName: 'MobilityOne Pty Ltd',
  tradingName: 'PoortLink',
  cipcNumber: '2025/958631/07',
  taxPin: '9065004328',
  vatNumber: '',
  registeredAddress: '',
  registeredCity: 'Pretoria',
  registeredProvince: 'Gauteng',
  registeredPostalCode: '',
  contactName: '',
  contactPosition: 'Director',
  contactPhone: '',
  contactEmail: '',
  contactIdNumber: '',
  operatingArea: 'Eersterust to Mamelodi Taxi Rank zone, City of Tshwane',
  numberOfVehicles: '',
  vehicleTypes: 'Tuk Tuk (Three-wheeler), Electric Bikes',
  icasaCertificateNumber: '',
  icasaExpiryDate: '',
  bankName: '',
  accountNumber: '',
  branchCode: '',
  declarationDate: new Date().toISOString().split('T')[0],
  declarantName: ''
};

export function DOTForm9A() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Form9AData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...initialFormData, ...parsed });
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
  }, []);

  // Auto-save on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData]);

  const handleChange = (field: keyof Form9AData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveForm = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Form Saved", description: "Your Form 9A data has been saved locally." });
    }, 500);
  };

  const getCompletionStatus = () => {
    const required = [
      'companyName', 'cipcNumber', 'taxPin', 'registeredAddress', 
      'contactName', 'contactPhone', 'contactEmail', 'operatingArea'
    ];
    const filled = required.filter(field => formData[field as keyof Form9AData]?.trim());
    return { filled: filled.length, total: required.length };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FORM 9A', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.text('APPLICATION FOR E-HAILING SERVICE REGISTRATION', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('National Land Transport Amendment Act 23 of 2023', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Section helper
    const addSection = (title: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title, 15, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };

    const addField = (label: string, value: string) => {
      doc.text(`${label}:`, 15, y);
      doc.text(value || '_______________', 70, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // Company Information
    addSection('A. COMPANY INFORMATION');
    addField('Company Name', formData.companyName);
    addField('Trading Name', formData.tradingName);
    addField('CIPC Reg. Number', formData.cipcNumber);
    addField('SARS Tax PIN', formData.taxPin);
    addField('VAT Number', formData.vatNumber || 'N/A');
    y += 5;

    // Registered Address
    addSection('B. REGISTERED ADDRESS');
    addField('Street Address', formData.registeredAddress);
    addField('City', formData.registeredCity);
    addField('Province', formData.registeredProvince);
    addField('Postal Code', formData.registeredPostalCode);
    y += 5;

    // Contact Person
    addSection('C. PRIMARY CONTACT PERSON');
    addField('Full Name', formData.contactName);
    addField('Position', formData.contactPosition);
    addField('ID Number', formData.contactIdNumber);
    addField('Phone Number', formData.contactPhone);
    addField('Email Address', formData.contactEmail);
    y += 5;

    // Operating Details
    addSection('D. OPERATING DETAILS');
    addField('Operating Area', formData.operatingArea);
    addField('Number of Vehicles', formData.numberOfVehicles);
    addField('Vehicle Types', formData.vehicleTypes);
    y += 5;

    // ICASA Details
    addSection('E. ICASA EQUIPMENT CERTIFICATE');
    addField('Certificate Number', formData.icasaCertificateNumber || 'Pending');
    addField('Expiry Date', formData.icasaExpiryDate || 'N/A');
    y += 10;

    // Payment Information
    doc.addPage();
    y = 20;
    addSection('F. PAYMENT INFORMATION');
    doc.setFontSize(9);
    doc.text('Application fee must be paid to:', 15, y);
    y += 6;
    doc.text('Bank: ABSA', 20, y);
    y += 5;
    doc.text('Account Number: 4053620095', 20, y);
    y += 5;
    doc.text('Reference: [Company Name] - Form 9A', 20, y);
    y += 15;

    // Declaration
    addSection('G. DECLARATION');
    doc.setFontSize(9);
    const declaration = `I, the undersigned, hereby declare that:\n
1. The information provided in this application is true and correct.\n
2. I am authorized to submit this application on behalf of ${formData.companyName}.\n
3. The company complies with all requirements of the National Land Transport Amendment Act 23 of 2023.\n
4. All vehicles operating under this platform will be registered and comply with relevant regulations.\n
5. The platform meets all technical specifications required for e-hailing services.`;
    
    const splitDeclaration = doc.splitTextToSize(declaration, pageWidth - 30);
    doc.text(splitDeclaration, 15, y);
    y += splitDeclaration.length * 5 + 15;

    // Signature block
    doc.text(`Name: ${formData.declarantName || '________________________'}`, 15, y);
    y += 10;
    doc.text('Signature: ________________________', 15, y);
    y += 10;
    doc.text(`Date: ${formData.declarationDate}`, 15, y);
    y += 20;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Generated by PoortLink - MobilityOne Pty Ltd', pageWidth / 2, 285, { align: 'center' });

    doc.save('Form_9A_E-Hailing_Application.pdf');
    toast({ title: "PDF Generated", description: "Form 9A has been downloaded." });
  };

  const status = getCompletionStatus();
  const completionPercent = Math.round((status.filled / status.total) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Form 9A - E-Hailing Platform Registration</CardTitle>
                <CardDescription>Application under National Land Transport Amendment Act 23 of 2023</CardDescription>
              </div>
            </div>
            <Badge variant={completionPercent === 100 ? "default" : "secondary"} className="text-sm">
              {completionPercent === 100 ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" />Complete</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" />{status.filled}/{status.total} Required</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all" 
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            A. Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Legal Company Name *</Label>
            <Input 
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="MobilityOne Pty Ltd"
            />
          </div>
          <div>
            <Label>Trading Name</Label>
            <Input 
              value={formData.tradingName}
              onChange={(e) => handleChange('tradingName', e.target.value)}
              placeholder="PoortLink"
            />
          </div>
          <div>
            <Label>CIPC Registration Number *</Label>
            <Input 
              value={formData.cipcNumber}
              onChange={(e) => handleChange('cipcNumber', e.target.value)}
              placeholder="2025/958631/07"
            />
            <p className="text-xs text-muted-foreground mt-1">Your Companies registration number</p>
          </div>
          <div>
            <Label>SARS Tax PIN *</Label>
            <Input 
              value={formData.taxPin}
              onChange={(e) => handleChange('taxPin', e.target.value)}
              placeholder="9065004328"
            />
          </div>
          <div>
            <Label>VAT Number (if registered)</Label>
            <Input 
              value={formData.vatNumber}
              onChange={(e) => handleChange('vatNumber', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      {/* Registered Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            B. Registered Address
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Street Address *</Label>
            <Input 
              value={formData.registeredAddress}
              onChange={(e) => handleChange('registeredAddress', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <Label>City</Label>
            <Input 
              value={formData.registeredCity}
              onChange={(e) => handleChange('registeredCity', e.target.value)}
              placeholder="Pretoria"
            />
          </div>
          <div>
            <Label>Province</Label>
            <Input 
              value={formData.registeredProvince}
              onChange={(e) => handleChange('registeredProvince', e.target.value)}
              placeholder="Gauteng"
            />
          </div>
          <div>
            <Label>Postal Code</Label>
            <Input 
              value={formData.registeredPostalCode}
              onChange={(e) => handleChange('registeredPostalCode', e.target.value)}
              placeholder="0001"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            C. Primary Contact Person
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Full Name *</Label>
            <Input 
              value={formData.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label>Position</Label>
            <Input 
              value={formData.contactPosition}
              onChange={(e) => handleChange('contactPosition', e.target.value)}
              placeholder="Director"
            />
          </div>
          <div>
            <Label>ID Number</Label>
            <Input 
              value={formData.contactIdNumber}
              onChange={(e) => handleChange('contactIdNumber', e.target.value)}
              placeholder="SA ID Number"
            />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input 
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+27 82 123 4567"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Email Address *</Label>
            <Input 
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contact@poortlink.co.za"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            D. Operating Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Operating Area *</Label>
            <Textarea 
              value={formData.operatingArea}
              onChange={(e) => handleChange('operatingArea', e.target.value)}
              placeholder="Geographic area where e-hailing service will operate"
              rows={2}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Number of Vehicles</Label>
              <Input 
                type="number"
                value={formData.numberOfVehicles}
                onChange={(e) => handleChange('numberOfVehicles', e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <Label>Vehicle Types</Label>
              <Input 
                value={formData.vehicleTypes}
                onChange={(e) => handleChange('vehicleTypes', e.target.value)}
                placeholder="Tuk Tuk, Electric Bikes"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICASA Certificate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            E. ICASA Equipment Certificate
          </CardTitle>
          <CardDescription>Independent Communications Authority of South Africa certification</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Certificate Number</Label>
            <Input 
              value={formData.icasaCertificateNumber}
              onChange={(e) => handleChange('icasaCertificateNumber', e.target.value)}
              placeholder="ICASA-XXXX-XXXX"
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input 
              type="date"
              value={formData.icasaExpiryDate}
              onChange={(e) => handleChange('icasaExpiryDate', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
            F. Payment Information
          </CardTitle>
          <CardDescription>Application fee must be paid to the DOT account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background p-4 rounded-lg border">
            <p className="font-semibold mb-2">Payment Details:</p>
            <ul className="space-y-1 text-sm">
              <li><span className="text-muted-foreground">Bank:</span> ABSA</li>
              <li><span className="text-muted-foreground">Account Number:</span> <span className="font-mono">4053620095</span></li>
              <li><span className="text-muted-foreground">Reference:</span> MobilityOne - Form 9A</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Declaration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5" />
            G. Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="mb-2">I, the undersigned, hereby declare that:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>The information provided in this application is true and correct.</li>
              <li>I am authorized to submit this application on behalf of {formData.companyName || 'the company'}.</li>
              <li>The company complies with all requirements of the National Land Transport Amendment Act 23 of 2023.</li>
              <li>All vehicles operating under this platform will be registered and comply with relevant regulations.</li>
              <li>The platform meets all technical specifications required for e-hailing services.</li>
            </ol>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Declarant Name</Label>
              <Input 
                value={formData.declarantName}
                onChange={(e) => handleChange('declarantName', e.target.value)}
                placeholder="Full legal name"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={formData.declarationDate}
                onChange={(e) => handleChange('declarationDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={saveForm} disabled={isSaving} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={generatePDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
