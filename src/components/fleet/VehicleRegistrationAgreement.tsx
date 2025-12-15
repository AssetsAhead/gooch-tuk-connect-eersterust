import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Car, Shield } from "lucide-react";
import { jsPDF } from "jspdf";

interface VehicleDetails {
  // Platform details
  platformName: string;
  platformLicenseNumber: string;
  platformAddress: string;
  platformContactPerson: string;
  platformPhone: string;
  platformEmail: string;
  
  // Owner details
  ownerFullName: string;
  ownerIdNumber: string;
  ownerAddress: string;
  ownerPhone: string;
  ownerEmail: string;
  
  // Vehicle details
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleVIN: string;
  operatingLicenseNumber: string;
  
  // Insurance details
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  
  // Agreement terms
  commissionRate: string;
  effectiveDate: string;
  operatingArea: string;
}

export const VehicleRegistrationAgreement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<VehicleDetails>({
    platformName: "MobilityOne (Pty) Ltd t/a PoortLink",
    platformLicenseNumber: "",
    platformAddress: "",
    platformContactPerson: "",
    platformPhone: "",
    platformEmail: "",
    ownerFullName: "",
    ownerIdNumber: "",
    ownerAddress: "",
    ownerPhone: "",
    ownerEmail: "",
    vehicleRegistration: "",
    vehicleMake: "Bajaj",
    vehicleModel: "RE Compact",
    vehicleYear: "",
    vehicleColor: "",
    vehicleVIN: "",
    operatingLicenseNumber: "",
    insuranceCompany: "",
    insurancePolicyNumber: "",
    insuranceExpiryDate: "",
    commissionRate: "10",
    effectiveDate: new Date().toISOString().split('T')[0],
    operatingArea: "Eersterust, Jan Niemand Park, Eastlynne, Silverton, Meyers Park to Mamelodi Taxi Rank"
  });

  const generateAgreement = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    const addText = (text: string, size: number = 10, style: string = 'normal', centered: boolean = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      
      if (centered) {
        doc.text(text, pageWidth / 2, y, { align: 'center' });
      } else {
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length - 1) * lineHeight;
      }
      y += lineHeight;
    };

    const checkNewPage = (neededSpace: number = 40) => {
      if (y > 270 - neededSpace) {
        doc.addPage();
        y = 20;
      }
    };

    // Header
    addText("VEHICLE REGISTRATION AGREEMENT", 16, 'bold', true);
    addText("Under E-Hailing Platform License", 12, 'normal', true);
    y += 5;
    addText("(In terms of the National Land Transport Amendment Act 23 of 2023)", 10, 'italic', true);
    y += 10;

    // Parties
    addText("1. PARTIES", 12, 'bold');
    addText(`1.1 E-HAILING PLATFORM OPERATOR ("the Operator"):`);
    addText(`    Name: ${details.platformName}`);
    addText(`    E-Hailing License No: ${details.platformLicenseNumber || "[To be issued]"}`);
    addText(`    Address: ${details.platformAddress}`);
    addText(`    Contact: ${details.platformContactPerson} | ${details.platformPhone}`);
    y += 3;
    
    addText(`1.2 VEHICLE OWNER ("the Owner"):`);
    addText(`    Full Name: ${details.ownerFullName}`);
    addText(`    ID Number: ${details.ownerIdNumber}`);
    addText(`    Address: ${details.ownerAddress}`);
    addText(`    Contact: ${details.ownerPhone} | ${details.ownerEmail}`);
    y += 5;

    checkNewPage();
    
    // Vehicle Details
    addText("2. VEHICLE DETAILS", 12, 'bold');
    addText(`    Registration: ${details.vehicleRegistration}`);
    addText(`    Make/Model: ${details.vehicleMake} ${details.vehicleModel} (${details.vehicleYear})`);
    addText(`    Color: ${details.vehicleColor}`);
    addText(`    VIN: ${details.vehicleVIN}`);
    addText(`    Operating License: ${details.operatingLicenseNumber || "Covered under Platform License"}`);
    y += 5;

    checkNewPage();

    // Legal Basis
    addText("3. LEGAL BASIS AND LICENSE COVERAGE", 12, 'bold');
    addText("3.1 The Operator holds an e-hailing service license issued under the National Land Transport Amendment Act 23 of 2023, which authorizes the operation of an app-based transport service.");
    y += 3;
    addText("3.2 This Agreement registers the above Vehicle under the Operator's e-hailing license, enabling it to operate legally within the platform's authorized service area without requiring a separate individual operating permit.");
    y += 3;
    addText("3.3 The Vehicle may ONLY operate through the Operator's platform application while this Agreement is in force. Operating outside the platform constitutes a breach and may result in regulatory penalties.");
    y += 5;

    checkNewPage();

    // Operating Area
    addText("4. AUTHORIZED OPERATING AREA", 12, 'bold');
    addText(`4.1 The Vehicle is authorized to operate within: ${details.operatingArea}`);
    y += 3;
    addText("4.2 The Vehicle must respond to trip requests dispatched through the PoortLink application within this designated area.");
    y += 5;

    checkNewPage();

    // Insurance
    addText("5. INSURANCE REQUIREMENTS", 12, 'bold');
    addText(`5.1 Insurance Provider: ${details.insuranceCompany}`);
    addText(`    Policy Number: ${details.insurancePolicyNumber}`);
    addText(`    Expiry Date: ${details.insuranceExpiryDate}`);
    y += 3;
    addText("5.2 The Owner must maintain valid third-party liability insurance and public liability insurance covering passengers at all times.");
    addText("5.3 The Owner must provide updated insurance certificates at least 14 days before expiry.");
    y += 5;

    checkNewPage();

    // Owner Obligations
    addText("6. OWNER OBLIGATIONS", 12, 'bold');
    addText("The Owner undertakes to:");
    addText("6.1 Ensure the Vehicle has a valid Certificate of Roadworthiness at all times");
    addText("6.2 Maintain the Vehicle in safe, clean, and mechanically sound condition");
    addText("6.3 Only assign drivers who hold valid Professional Driving Permits (PDPs)");
    addText("6.4 Ensure all assigned drivers are registered on the platform");
    addText("6.5 Comply with all platform policies, safety standards, and rating requirements");
    addText("6.6 Display the PoortLink branding as required by the Operator");
    addText("6.7 Not operate the Vehicle through any competing e-hailing platform");
    addText("6.8 Report any accidents, incidents, or regulatory matters within 24 hours");
    y += 5;

    checkNewPage();

    // Operator Obligations
    addText("7. OPERATOR OBLIGATIONS", 12, 'bold');
    addText("The Operator undertakes to:");
    addText("7.1 Maintain a valid e-hailing platform license with the NPTR");
    addText("7.2 Include the Vehicle in the platform's vehicle registry submitted to regulators");
    addText("7.3 Provide the platform technology for receiving and fulfilling trip requests");
    addText("7.4 Handle all regulatory correspondence related to the platform license");
    addText("7.5 Provide proof of platform registration on request for roadside inspections");
    addText("7.6 Process and remit payments to the Owner as per the agreed payment terms");
    y += 5;

    doc.addPage();
    y = 20;

    // Commercial Terms
    addText("8. COMMERCIAL TERMS", 12, 'bold');
    addText(`8.1 Platform Commission: ${details.commissionRate}% of gross trip fare`);
    addText("8.2 Payment Cycle: Weekly settlement every Monday for the preceding week");
    addText("8.3 Payment Method: Electronic transfer to Owner's nominated bank account");
    addText("8.4 The Owner is responsible for all vehicle operating costs (fuel, maintenance, insurance)");
    y += 5;

    // Term and Termination
    addText("9. TERM AND TERMINATION", 12, 'bold');
    addText(`9.1 Effective Date: ${details.effectiveDate}`);
    addText("9.2 This Agreement continues until terminated by either party.");
    addText("9.3 Either party may terminate with 30 days written notice.");
    addText("9.4 The Operator may terminate immediately for:");
    addText("    (a) Safety violations or regulatory non-compliance");
    addText("    (b) Fraudulent activity or platform abuse");
    addText("    (c) Operation on competing platforms");
    addText("    (d) Failure to maintain required documentation");
    addText("9.5 Upon termination, the Vehicle is automatically de-registered from the platform license and may not continue operating as an e-hailing vehicle until registered with another licensed platform.");
    y += 5;

    checkNewPage();

    // Dispute Resolution
    addText("10. DISPUTE RESOLUTION", 12, 'bold');
    addText("10.1 Disputes shall first be addressed through the platform's internal dispute resolution process.");
    addText("10.2 Unresolved disputes may be referred to the relevant Provincial Regulatory Entity.");
    addText("10.3 This Agreement is governed by the laws of the Republic of South Africa.");
    y += 5;

    // Data Protection
    addText("11. DATA PROTECTION (POPIA)", 12, 'bold');
    addText("11.1 The Owner consents to the collection, processing, and storage of personal and vehicle data as required for platform operations and regulatory compliance.");
    addText("11.2 Data will be processed in accordance with the Protection of Personal Information Act (POPIA).");
    addText("11.3 The Operator's privacy policy (available at app.poortlink.co.za/privacy) applies.");
    y += 10;

    checkNewPage(60);

    // Signatures
    addText("12. SIGNATURES", 12, 'bold');
    y += 5;
    
    addText("For the OPERATOR:");
    y += 15;
    doc.line(margin, y, margin + 60, y);
    y += 5;
    addText("Signature");
    addText(`Name: ${details.platformContactPerson}`);
    addText(`Date: ____________________`);
    y += 10;

    addText("For the OWNER:");
    y += 15;
    doc.line(margin, y, margin + 60, y);
    y += 5;
    addText("Signature");
    addText(`Name: ${details.ownerFullName}`);
    addText(`ID: ${details.ownerIdNumber}`);
    addText(`Date: ____________________`);

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("This Agreement constitutes the entire understanding between the parties regarding the registration of the Vehicle under the Platform's e-hailing license.", margin, y, { maxWidth: contentWidth });

    doc.save(`Vehicle_Registration_Agreement_${details.vehicleRegistration || 'Draft'}.pdf`);
  };

  const updateDetails = (field: keyof VehicleDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          Vehicle Registration Agreement
        </CardTitle>
        <CardDescription>
          Register vehicles under your e-hailing platform license - vehicles operate legally without individual permits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          <p className="text-sm text-green-400">
            <strong>Competitive Advantage:</strong> Vehicle owners can operate legally under your platform license
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Vehicle Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vehicle Registration Agreement</DialogTitle>
              <DialogDescription>
                Register a vehicle under your e-hailing platform license
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Platform Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Platform Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Name</Label>
                    <Input
                      value={details.platformName}
                      onChange={(e) => updateDetails('platformName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>E-Hailing License Number</Label>
                    <Input
                      value={details.platformLicenseNumber}
                      onChange={(e) => updateDetails('platformLicenseNumber', e.target.value)}
                      placeholder="To be issued by NPTR"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Platform Address</Label>
                    <Input
                      value={details.platformAddress}
                      onChange={(e) => updateDetails('platformAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input
                      value={details.platformContactPerson}
                      onChange={(e) => updateDetails('platformContactPerson', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={details.platformPhone}
                      onChange={(e) => updateDetails('platformPhone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Vehicle Owner Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={details.ownerFullName}
                      onChange={(e) => updateDetails('ownerFullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>SA ID Number</Label>
                    <Input
                      value={details.ownerIdNumber}
                      onChange={(e) => updateDetails('ownerIdNumber', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={details.ownerAddress}
                      onChange={(e) => updateDetails('ownerAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={details.ownerPhone}
                      onChange={(e) => updateDetails('ownerPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={details.ownerEmail}
                      onChange={(e) => updateDetails('ownerEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration Number</Label>
                    <Input
                      value={details.vehicleRegistration}
                      onChange={(e) => updateDetails('vehicleRegistration', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Make</Label>
                    <Input
                      value={details.vehicleMake}
                      onChange={(e) => updateDetails('vehicleMake', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={details.vehicleModel}
                      onChange={(e) => updateDetails('vehicleModel', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      value={details.vehicleYear}
                      onChange={(e) => updateDetails('vehicleYear', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      value={details.vehicleColor}
                      onChange={(e) => updateDetails('vehicleColor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>VIN</Label>
                    <Input
                      value={details.vehicleVIN}
                      onChange={(e) => updateDetails('vehicleVIN', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Insurance Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Insurance Company</Label>
                    <Input
                      value={details.insuranceCompany}
                      onChange={(e) => updateDetails('insuranceCompany', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Policy Number</Label>
                    <Input
                      value={details.insurancePolicyNumber}
                      onChange={(e) => updateDetails('insurancePolicyNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={details.insuranceExpiryDate}
                      onChange={(e) => updateDetails('insuranceExpiryDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Commercial Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Commission (%)</Label>
                    <Input
                      value={details.commissionRate}
                      onChange={(e) => updateDetails('commissionRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={details.effectiveDate}
                      onChange={(e) => updateDetails('effectiveDate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Operating Area</Label>
                    <Textarea
                      value={details.operatingArea}
                      onChange={(e) => updateDetails('operatingArea', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-2">Agreement Summary</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vehicle operates under platform's e-hailing license</li>
                  <li>• No individual operating permit required</li>
                  <li>• {details.commissionRate}% platform commission on trip fares</li>
                  <li>• Weekly payment settlement</li>
                  <li>• NLTAA 2023 compliant</li>
                </ul>
              </div>

              <Button onClick={generateAgreement} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Agreement (PDF)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
