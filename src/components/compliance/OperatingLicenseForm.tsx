import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Save, Download, CheckCircle2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";

interface FormData {
  // Section A: Applicant Details
  applicantType: string;
  companyName: string;
  registrationNumber: string;
  tradingName: string;
  vatNumber: string;
  
  // Contact Details
  physicalAddress: string;
  postalAddress: string;
  telephone: string;
  cellphone: string;
  fax: string;
  email: string;
  
  // Responsible Person
  responsiblePersonName: string;
  responsiblePersonIdNumber: string;
  responsiblePersonPosition: string;
  
  // Section B: Service Details
  serviceType: string;
  serviceDescription: string;
  operatingArea: string;
  routeDescription: string;
  pickupPoints: string;
  dropoffPoints: string;
  
  // Section C: Vehicle Details
  vehicleCount: string;
  vehicleType: string;
  passengerCapacity: string;
  vehicleRegistrations: string;
  
  // Section D: Operating Times
  operatingDays: string[];
  operatingHoursStart: string;
  operatingHoursEnd: string;
  
  // Section E: Financial
  tariffStructure: string;
  paymentMethods: string[];
  
  // Section F: Safety & Compliance
  hasInsurance: boolean;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  hasTrackingSystem: boolean;
  trackingProvider: string;
  
  // Section G: Declarations
  declarationAccepted: boolean;
  declarationDate: string;
  declarationPlace: string;
}

const initialFormData: FormData = {
  applicantType: "",
  companyName: "",
  registrationNumber: "",
  tradingName: "",
  vatNumber: "",
  physicalAddress: "",
  postalAddress: "",
  telephone: "",
  cellphone: "",
  fax: "",
  email: "",
  responsiblePersonName: "",
  responsiblePersonIdNumber: "",
  responsiblePersonPosition: "",
  serviceType: "e-hailing",
  serviceDescription: "",
  operatingArea: "",
  routeDescription: "",
  pickupPoints: "",
  dropoffPoints: "",
  vehicleCount: "",
  vehicleType: "tuk-tuk",
  passengerCapacity: "",
  vehicleRegistrations: "",
  operatingDays: [],
  operatingHoursStart: "06:00",
  operatingHoursEnd: "22:00",
  tariffStructure: "",
  paymentMethods: [],
  hasInsurance: false,
  insuranceProvider: "",
  insurancePolicyNumber: "",
  hasTrackingSystem: false,
  trackingProvider: "",
  declarationAccepted: false,
  declarationDate: "",
  declarationPlace: "",
};

const STORAGE_KEY = "operating_license_form_draft";

export function OperatingLicenseForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("applicant");
  const [isSaving, setIsSaving] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        toast.info("Draft loaded", { description: "Your previous progress has been restored." });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const saveDraft = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Draft saved", { description: "Your progress has been saved locally." });
    }, 500);
  };

  const calculateProgress = () => {
    const requiredFields = [
      "applicantType", "companyName", "registrationNumber", "physicalAddress",
      "cellphone", "email", "responsiblePersonName", "responsiblePersonIdNumber",
      "serviceType", "operatingArea", "vehicleCount", "vehicleType",
      "hasInsurance", "declarationAccepted"
    ];
    const filled = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      if (typeof value === "boolean") return value;
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim() !== "";
    });
    return Math.round((filled.length / requiredFields.length) * 100);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addHeader = () => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FORM 1B", pageWidth / 2, y, { align: "center" });
      y += 6;
      doc.setFontSize(14);
      doc.text("APPLICATION FOR OPERATING LICENCE", pageWidth / 2, y, { align: "center" });
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("(National Land Transport Act, 2009 - Regulation 4)", pageWidth / 2, y, { align: "center" });
      y += 12;
    };

    const addSection = (title: string) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    };

    const addField = (label: string, value: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${label}:`, 14, y);
      doc.text(value || "_______________", 80, y);
      y += 6;
    };

    const addLongField = (label: string, value: string) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${label}:`, 14, y);
      y += 5;
      const lines = doc.splitTextToSize(value || "N/A", pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    };

    // Header
    addHeader();

    // Section A: Applicant Details
    addSection("SECTION A: APPLICANT DETAILS");
    addField("Type of Applicant", formData.applicantType === "company" ? "Company/CC" : "Individual");
    addField("Company/Trading Name", formData.companyName);
    addField("Registration Number", formData.registrationNumber);
    addField("Trading As", formData.tradingName);
    addField("VAT Number", formData.vatNumber);
    y += 4;

    addSection("Contact Details");
    addLongField("Physical Address", formData.physicalAddress);
    addLongField("Postal Address", formData.postalAddress);
    addField("Telephone", formData.telephone);
    addField("Cellphone", formData.cellphone);
    addField("Email", formData.email);
    y += 4;

    addSection("Responsible Person");
    addField("Full Name", formData.responsiblePersonName);
    addField("ID Number", formData.responsiblePersonIdNumber);
    addField("Position", formData.responsiblePersonPosition);
    y += 4;

    // Section B: Service Details
    addSection("SECTION B: SERVICE DETAILS");
    addField("Type of Service", formData.serviceType === "e-hailing" ? "E-Hailing Service" : formData.serviceType);
    addLongField("Service Description", formData.serviceDescription);
    addLongField("Operating Area", formData.operatingArea);
    addLongField("Route Description", formData.routeDescription);
    addLongField("Pickup Points", formData.pickupPoints);
    addLongField("Drop-off Points", formData.dropoffPoints);
    y += 4;

    // Section C: Vehicle Details
    addSection("SECTION C: VEHICLE DETAILS");
    addField("Number of Vehicles", formData.vehicleCount);
    addField("Vehicle Type", formData.vehicleType === "tuk-tuk" ? "Tuk-Tuk / Three-Wheeler" : formData.vehicleType);
    addField("Passenger Capacity", formData.passengerCapacity);
    addLongField("Vehicle Registrations", formData.vehicleRegistrations);
    y += 4;

    // Section D: Operating Times
    addSection("SECTION D: OPERATING TIMES");
    addField("Operating Days", formData.operatingDays.join(", ") || "Not specified");
    addField("Operating Hours", `${formData.operatingHoursStart} - ${formData.operatingHoursEnd}`);
    y += 4;

    // Section E: Tariff
    addSection("SECTION E: TARIFF STRUCTURE");
    addLongField("Tariff Details", formData.tariffStructure);
    addField("Payment Methods", formData.paymentMethods.join(", ") || "Not specified");
    y += 4;

    // Section F: Safety & Compliance
    addSection("SECTION F: SAFETY & COMPLIANCE");
    addField("Public Liability Insurance", formData.hasInsurance ? "Yes" : "No");
    if (formData.hasInsurance) {
      addField("Insurance Provider", formData.insuranceProvider);
      addField("Policy Number", formData.insurancePolicyNumber);
    }
    addField("Vehicle Tracking System", formData.hasTrackingSystem ? "Yes" : "No");
    if (formData.hasTrackingSystem) {
      addField("Tracking Provider", formData.trackingProvider);
    }
    y += 4;

    // Section G: Declaration
    doc.addPage();
    y = 20;
    addSection("SECTION G: DECLARATION");
    y += 4;
    doc.setFontSize(9);
    const declaration = `I, the undersigned, hereby declare that:
1. The information provided in this application is true and correct.
2. I understand that providing false information may result in rejection of this application.
3. I undertake to comply with all applicable laws and regulations.
4. I consent to inspections of vehicles and premises by authorized officials.
5. I understand that an operating licence is subject to conditions.`;
    const declLines = doc.splitTextToSize(declaration, pageWidth - 28);
    doc.text(declLines, 14, y);
    y += declLines.length * 4 + 10;

    doc.setFontSize(10);
    addField("Declaration Accepted", formData.declarationAccepted ? "Yes" : "No");
    addField("Date", formData.declarationDate);
    addField("Place", formData.declarationPlace);
    
    y += 20;
    doc.text("_______________________________", 14, y);
    doc.text("_______________________________", pageWidth - 80, y);
    y += 5;
    doc.setFontSize(8);
    doc.text("Signature of Applicant", 14, y);
    doc.text("Date", pageWidth - 80, y);

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Generated by PoortLink - Operating License Application System", pageWidth / 2, y, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-ZA")}`, pageWidth / 2, y + 4, { align: "center" });

    doc.save("Operating_License_Application_Form1B.pdf");
    toast.success("PDF Generated", { description: "Your application form has been downloaded." });
  };

  const progress = calculateProgress();

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Operating License Application (Form 1B)</CardTitle>
              <CardDescription>
                National Land Transport Act, 2009 - E-Hailing Service License
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{progress}% Complete</p>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button size="sm" onClick={generatePDF} disabled={progress < 50}>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
            <TabsTrigger value="applicant" className="text-xs">A. Applicant</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
            <TabsTrigger value="service" className="text-xs">B. Service</TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs">C. Vehicles</TabsTrigger>
            <TabsTrigger value="operations" className="text-xs">D. Operations</TabsTrigger>
            <TabsTrigger value="safety" className="text-xs">E. Safety</TabsTrigger>
            <TabsTrigger value="declaration" className="text-xs">F. Declaration</TabsTrigger>
          </TabsList>

          {/* Section A: Applicant Details */}
          <TabsContent value="applicant" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type of Applicant *</Label>
                <Select value={formData.applicantType} onValueChange={(v) => updateField("applicantType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company / Close Corporation</SelectItem>
                    <SelectItem value="individual">Individual / Sole Proprietor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company/Business Name *</Label>
                <Input 
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="MobilityOne Pty Ltd"
                />
              </div>

              <div className="space-y-2">
                <Label>CIPC Registration Number *</Label>
                <Input 
                  value={formData.registrationNumber}
                  onChange={(e) => updateField("registrationNumber", e.target.value)}
                  placeholder="2025/958631/07"
                />
              </div>

              <div className="space-y-2">
                <Label>Trading Name</Label>
                <Input 
                  value={formData.tradingName}
                  onChange={(e) => updateField("tradingName", e.target.value)}
                  placeholder="PoortLink"
                />
              </div>

              <div className="space-y-2">
                <Label>VAT Number (if applicable)</Label>
                <Input 
                  value={formData.vatNumber}
                  onChange={(e) => updateField("vatNumber", e.target.value)}
                  placeholder="VAT number"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Responsible Person</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input 
                    value={formData.responsiblePersonName}
                    onChange={(e) => updateField("responsiblePersonName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Number *</Label>
                  <Input 
                    value={formData.responsiblePersonIdNumber}
                    onChange={(e) => updateField("responsiblePersonIdNumber", e.target.value)}
                    placeholder="SA ID number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input 
                    value={formData.responsiblePersonPosition}
                    onChange={(e) => updateField("responsiblePersonPosition", e.target.value)}
                    placeholder="e.g., Director"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("contact")}>Next: Contact Details →</Button>
            </div>
          </TabsContent>

          {/* Contact Details */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Physical Address *</Label>
                <Textarea 
                  value={formData.physicalAddress}
                  onChange={(e) => updateField("physicalAddress", e.target.value)}
                  placeholder="Full physical address including street, suburb, city, postal code"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Postal Address</Label>
                <Textarea 
                  value={formData.postalAddress}
                  onChange={(e) => updateField("postalAddress", e.target.value)}
                  placeholder="Postal address (if different from physical)"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Telephone</Label>
                  <Input 
                    value={formData.telephone}
                    onChange={(e) => updateField("telephone", e.target.value)}
                    placeholder="Landline number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cellphone *</Label>
                  <Input 
                    value={formData.cellphone}
                    onChange={(e) => updateField("cellphone", e.target.value)}
                    placeholder="Cell number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fax</Label>
                  <Input 
                    value={formData.fax}
                    onChange={(e) => updateField("fax", e.target.value)}
                    placeholder="Fax number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("applicant")}>← Previous</Button>
              <Button onClick={() => setActiveTab("service")}>Next: Service Details →</Button>
            </div>
          </TabsContent>

          {/* Section B: Service Details */}
          <TabsContent value="service" className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Type of Service *</Label>
                <Select value={formData.serviceType} onValueChange={(v) => updateField("serviceType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e-hailing">E-Hailing Service</SelectItem>
                    <SelectItem value="metered-taxi">Metered Taxi Service</SelectItem>
                    <SelectItem value="charter">Charter Service</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  E-Hailing is the correct classification for app-based ride services under the National Land Transport Amendment Act 23 of 2023
                </p>
              </div>

              <div className="space-y-2">
                <Label>Service Description</Label>
                <Textarea 
                  value={formData.serviceDescription}
                  onChange={(e) => updateField("serviceDescription", e.target.value)}
                  placeholder="Describe the nature of your transport service..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Operating Area / Zone *</Label>
                <Textarea 
                  value={formData.operatingArea}
                  onChange={(e) => updateField("operatingArea", e.target.value)}
                  placeholder="e.g., Eersterust to Mamelodi Taxi Rank and surrounding areas within City of Tshwane Metropolitan Municipality"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Route Description</Label>
                <Textarea 
                  value={formData.routeDescription}
                  onChange={(e) => updateField("routeDescription", e.target.value)}
                  placeholder="For e-hailing: 'App-based on-demand service within defined operating zone'"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Pickup Points</Label>
                  <Textarea 
                    value={formData.pickupPoints}
                    onChange={(e) => updateField("pickupPoints", e.target.value)}
                    placeholder="List main pickup locations..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Drop-off Points</Label>
                  <Textarea 
                    value={formData.dropoffPoints}
                    onChange={(e) => updateField("dropoffPoints", e.target.value)}
                    placeholder="List main drop-off locations..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("contact")}>← Previous</Button>
              <Button onClick={() => setActiveTab("vehicles")}>Next: Vehicle Details →</Button>
            </div>
          </TabsContent>

          {/* Section C: Vehicle Details */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Vehicles *</Label>
                <Input 
                  type="number"
                  value={formData.vehicleCount}
                  onChange={(e) => updateField("vehicleCount", e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Type *</Label>
                <Select value={formData.vehicleType} onValueChange={(v) => updateField("vehicleType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuk-tuk">Tuk-Tuk / Three-Wheeler</SelectItem>
                    <SelectItem value="ev-bike">Electric Bike</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Passenger Capacity (per vehicle)</Label>
                <Input 
                  type="number"
                  value={formData.passengerCapacity}
                  onChange={(e) => updateField("passengerCapacity", e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Registration Numbers</Label>
              <Textarea 
                value={formData.vehicleRegistrations}
                onChange={(e) => updateField("vehicleRegistrations", e.target.value)}
                placeholder="List all vehicle registration numbers, one per line or comma-separated..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Under the e-hailing framework, vehicles are registered under the platform operator's license
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("service")}>← Previous</Button>
              <Button onClick={() => setActiveTab("operations")}>Next: Operations →</Button>
            </div>
          </TabsContent>

          {/* Section D: Operations */}
          <TabsContent value="operations" className="space-y-6">
            <div className="space-y-4">
              <Label>Operating Days</Label>
              <div className="flex flex-wrap gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <Checkbox 
                      id={day}
                      checked={formData.operatingDays.includes(day)}
                      onCheckedChange={() => toggleArrayField("operatingDays", day)}
                    />
                    <Label htmlFor={day} className="text-sm font-normal">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Operating Hours Start</Label>
                <Input 
                  type="time"
                  value={formData.operatingHoursStart}
                  onChange={(e) => updateField("operatingHoursStart", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours End</Label>
                <Input 
                  type="time"
                  value={formData.operatingHoursEnd}
                  onChange={(e) => updateField("operatingHoursEnd", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tariff Structure</Label>
              <Textarea 
                value={formData.tariffStructure}
                onChange={(e) => updateField("tariffStructure", e.target.value)}
                placeholder="e.g., Base fare R15, plus R5 per kilometer. Dynamic pricing based on demand."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Payment Methods</Label>
              <div className="flex flex-wrap gap-3">
                {["Cash", "Card", "SnapScan", "Zapper", "EFT", "Mobile Money"].map(method => (
                  <div key={method} className="flex items-center gap-2">
                    <Checkbox 
                      id={method}
                      checked={formData.paymentMethods.includes(method)}
                      onCheckedChange={() => toggleArrayField("paymentMethods", method)}
                    />
                    <Label htmlFor={method} className="text-sm font-normal">{method}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("vehicles")}>← Previous</Button>
              <Button onClick={() => setActiveTab("safety")}>Next: Safety & Compliance →</Button>
            </div>
          </TabsContent>

          {/* Section E: Safety & Compliance */}
          <TabsContent value="safety" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Checkbox 
                  id="insurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => updateField("hasInsurance", checked)}
                />
                <div>
                  <Label htmlFor="insurance">Public Liability Insurance</Label>
                  <p className="text-sm text-muted-foreground">Do you have valid public liability insurance?</p>
                </div>
              </div>

              {formData.hasInsurance && (
                <div className="grid gap-4 md:grid-cols-2 pl-8">
                  <div className="space-y-2">
                    <Label>Insurance Provider</Label>
                    <Input 
                      value={formData.insuranceProvider}
                      onChange={(e) => updateField("insuranceProvider", e.target.value)}
                      placeholder="Insurance company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number</Label>
                    <Input 
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
                      placeholder="Policy number"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Checkbox 
                  id="tracking"
                  checked={formData.hasTrackingSystem}
                  onCheckedChange={(checked) => updateField("hasTrackingSystem", checked)}
                />
                <div>
                  <Label htmlFor="tracking">Vehicle Tracking System</Label>
                  <p className="text-sm text-muted-foreground">Do you have GPS tracking installed on vehicles?</p>
                </div>
              </div>

              {formData.hasTrackingSystem && (
                <div className="pl-8">
                  <div className="space-y-2">
                    <Label>Tracking Provider</Label>
                    <Input 
                      value={formData.trackingProvider}
                      onChange={(e) => updateField("trackingProvider", e.target.value)}
                      placeholder="e.g., PoortLink App-based GPS"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("operations")}>← Previous</Button>
              <Button onClick={() => setActiveTab("declaration")}>Next: Declaration →</Button>
            </div>
          </TabsContent>

          {/* Section F: Declaration */}
          <TabsContent value="declaration" className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Declaration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                I, the undersigned, hereby declare that:
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                <li>The information provided in this application is true and correct.</li>
                <li>I understand that providing false information may result in rejection of this application.</li>
                <li>I undertake to comply with all applicable laws and regulations.</li>
                <li>I consent to inspections of vehicles and premises by authorized officials.</li>
                <li>I understand that an operating licence is subject to conditions.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 p-4 border-2 rounded-lg border-primary/50">
              <Checkbox 
                id="declaration"
                checked={formData.declarationAccepted}
                onCheckedChange={(checked) => updateField("declarationAccepted", checked)}
              />
              <Label htmlFor="declaration" className="font-medium">
                I accept this declaration and confirm all information is accurate *
              </Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date"
                  value={formData.declarationDate}
                  onChange={(e) => updateField("declarationDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Place *</Label>
                <Input 
                  value={formData.declarationPlace}
                  onChange={(e) => updateField("declarationPlace", e.target.value)}
                  placeholder="e.g., Pretoria"
                />
              </div>
            </div>

            {progress >= 50 && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Ready to Generate</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your application is {progress}% complete. Click "Generate PDF" to download your Form 1B for submission.
                  </p>
                </div>
              </div>
            )}

            {progress < 50 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Incomplete Application</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Please complete at least 50% of required fields before generating the PDF.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("safety")}>← Previous</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={generatePDF} disabled={progress < 50}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
