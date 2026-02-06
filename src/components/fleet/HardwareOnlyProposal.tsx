import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileDown, Wrench, Shield, Camera, MapPin, Fingerprint, Radio,
  TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Users, Zap, Target
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HARDWARE_DATA = {
  totalAsk: 450000,
  equityOffer: 15,
  vehicleCount: 10,
  launchLocation: "Eersterust, Pretoria East",

  // Hardware per vehicle
  hardwareCosts: {
    dashCameras: { qty: 10, unitCost: 3500, total: 35000, description: "Dual-lens AI dashcams (front + cabin)" },
    gpsTrackers: { qty: 10, unitCost: 2500, total: 25000, description: "Real-time GPS + cellular trackers" },
    fingerprintSensors: { qty: 10, unitCost: 4000, total: 40000, description: "Biometric driver authentication" },
    phoneHolders: { qty: 10, unitCost: 800, total: 8000, description: "Weatherproof phone mounts" },
    panicButtons: { qty: 10, unitCost: 1500, total: 15000, description: "Physical panic button with SOS beacon" },
    wiring: { qty: 10, unitCost: 2000, total: 20000, description: "Installation wiring, brackets, power supply" },
    hardwareSubtotal: 143000,
  },

  // Platform & Operations
  platformCosts: {
    apiIntegrations: { amount: 100000, description: "Payment gateway, SMS, maps, AI services" },
    cloudInfra: { amount: 40000, description: "12 months Supabase, hosting, CDN" },
    legalCompliance: { amount: 50000, description: "CIPC patents, DOT licensing, POPIA audit" },
    platformSubtotal: 190000,
  },

  // Installation & Training
  operationsCosts: {
    installationLabour: { amount: 30000, description: "Professional installation × 10 vehicles (R3k each)" },
    driverTraining: { amount: 25000, description: "10 drivers × R2.5k training program" },
    ownerEngagement: { amount: 15000, description: "Owner meetings, demos, relationship building" },
    insurance: { amount: 12000, description: "Equipment insurance 12 months" },
    workingCapital: { amount: 35000, description: "Data SIMs, contingency, support" },
    opsSubtotal: 117000,
  },

  // Revenue model - platform fee on existing operations
  revenue: {
    monthlyPlatformFee: 500, // Per vehicle SaaS fee to owner
    monthlyDataRevenue: 300, // Route analytics, municipal data
    monthlyAdRevenue: 1500, // Vehicle wrap advertising per vehicle
    monthlyInsuranceRef: 200, // Insurance referral commission per vehicle
    monthlySafetyPremium: 800, // Panic button / security premium per vehicle
    totalPerVehicle: 3300,
    fleetMonthly: 33000,
    fleetAnnual: 396000,
  },

  risks: [
    { risk: "Owner Resistance", mitigation: "Free installation, no upfront cost to owner, proven safety benefits", severity: "high" },
    { risk: "Equipment Tampering", mitigation: "Tamper-proof mounts, alert on disconnect, warranty voiding", severity: "medium" },
    { risk: "Owner Turnover", mitigation: "12-month agreement with early termination clause, equipment recovery", severity: "medium" },
    { risk: "Low Engagement", mitigation: "Start with 3 willing owners, expand via social proof", severity: "low" },
  ],

  ownerBenefits: [
    "Real-time vehicle tracking — know where your vehicle is 24/7",
    "Driver behaviour monitoring — reduce fuel waste, speeding, unauthorized use",
    "Panic button for driver and passenger safety — reduces liability",
    "Insurance premium reduction — tracked vehicles qualify for lower premiums",
    "Dashcam evidence — protects against false claims and accidents",
    "Professional image — branded, tech-enabled fleet stands out",
  ],
};

export const HardwareOnlyProposal = () => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    const centerText = (text: string, y: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    const sectionHeader = (text: string, y: number) => {
      doc.setFillColor(234, 88, 12);
      doc.rect(margin, y - 6, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin + 5, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      return y + 15;
    };

    // PAGE 1: COVER
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    centerText("MOBILITY ONE", 30, 32);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    centerText("Hardware-Only Investment — Retrofit Existing Fleet", 50, 16);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    centerText("R450,000 Seed Round", 75, 22);

    doc.setTextColor(0, 0, 0);
    yPos = 110;

    doc.setFillColor(255, 247, 237);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 75, 5, 5, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("The Proposition", margin + 10, yPos + 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summary = [
      "Don't buy vehicles. Equip them.",
      "",
      "R450K to install tracking, dashcams, biometrics, and panic buttons on 10",
      "existing tuk-tuks in Eersterust — plus 12 months of platform operations.",
      "",
      "Revenue comes from SaaS fees, advertising wraps, insurance referrals, and",
      "data analytics. No vehicle ownership risk. No depreciation. Pure tech play.",
      "",
      `Key: R${HARDWARE_DATA.revenue.totalPerVehicle}/vehicle/month = R${(HARDWARE_DATA.revenue.fleetAnnual / 1000).toFixed(0)}k annual revenue`,
    ];
    summary.forEach((line, i) => {
      doc.text(line, margin + 10, yPos + 25 + i * 6);
    });

    // PAGE 2: USE OF FUNDS
    doc.addPage();
    yPos = 20;
    yPos = sectionHeader("USE OF FUNDS: R450,000", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Hardware (Per Vehicle)", "Qty", "Unit Cost", "Total"]],
      body: [
        ["AI Dashcams (dual-lens)", "10", "R3,500", "R35,000"],
        ["GPS Trackers", "10", "R2,500", "R25,000"],
        ["Fingerprint Sensors", "10", "R4,000", "R40,000"],
        ["Phone Mounts", "10", "R800", "R8,000"],
        ["Panic Buttons (SOS)", "10", "R1,500", "R15,000"],
        ["Installation Wiring/Brackets", "10", "R2,000", "R20,000"],
        ["HARDWARE SUBTOTAL", "", "", "R143,000"],
      ],
      theme: "striped",
      headStyles: { fillColor: [234, 88, 12] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [255, 237, 213];
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Platform & Integration", "Amount"]],
      body: [
        ["API Integrations (payments, SMS, maps, AI)", "R100,000"],
        ["Cloud Infrastructure (12 months)", "R40,000"],
        ["Legal & Compliance (CIPC, DOT, POPIA)", "R50,000"],
        ["PLATFORM SUBTOTAL", "R190,000"],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 3) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [219, 234, 254];
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Operations (12 months)", "Amount"]],
      body: [
        ["Installation Labour (R3k × 10)", "R30,000"],
        ["Driver Training (R2.5k × 10)", "R25,000"],
        ["Owner Engagement & Demos", "R15,000"],
        ["Equipment Insurance", "R12,000"],
        ["Data SIMs & Contingency", "R35,000"],
        ["OPERATIONS SUBTOTAL", "R117,000"],
      ],
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 5) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [243, 232, 255];
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFillColor(234, 88, 12);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL: R450,000", margin + 10, yPos + 13);
    doc.text("15% Equity", pageWidth - margin - 40, yPos + 13);

    // PAGE 3: REVENUE & RISKS
    doc.addPage();
    yPos = 20;
    doc.setTextColor(0, 0, 0);
    yPos = sectionHeader("REVENUE MODEL (PER VEHICLE)", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Revenue Stream", "Monthly/Vehicle", "Annual (10 Vehicles)"]],
      body: [
        ["SaaS Platform Fee", "R500", "R60,000"],
        ["Route Data & Analytics", "R300", "R36,000"],
        ["Vehicle Wrap Advertising", "R1,500", "R180,000"],
        ["Insurance Referral Commission", "R200", "R24,000"],
        ["Safety Premium (Panic/Security)", "R800", "R96,000"],
        ["TOTAL", "R3,300", "R396,000"],
      ],
      theme: "striped",
      headStyles: { fillColor: [234, 88, 12] },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.row.index === 5) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [255, 237, 213];
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(255, 247, 237);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 25, 3, 3, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ROI: R396k annual revenue on R450k investment = 88% Year 1 ROI", margin + 10, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.text("Payback: ~14 months | Break-even: Month 12-14", margin + 10, yPos + 20);

    yPos += 35;
    yPos = sectionHeader("RISK MATRIX (The Western Bar Scene)", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Risk", "Severity", "Mitigation"]],
      body: HARDWARE_DATA.risks.map(r => [r.risk, r.severity.toUpperCase(), r.mitigation]),
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 5, 5, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Strategy: Solve Problems, Not Buy Arguments", margin + 10, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Start with 3 friendly owners. Let results speak. Other owners will come to you.", margin + 10, yPos + 20);
    doc.text("Free installation = zero risk for them. Data = proof for us. Scale follows trust.", margin + 10, yPos + 28);

    // Footer
    yPos += 50;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    centerText("MOBILITY ONE (Pty) Ltd | SARS: 9065004328 | CIPC Registered", yPos, 10);

    doc.save(`MobilityOne_HardwareOnly_Proposal_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-orange-600">Hardware-Only</Badge>
            <Badge variant="outline">R450,000</Badge>
            <Badge variant="outline">15% Equity</Badge>
          </div>
          <h2 className="text-2xl font-bold">Don't Buy Vehicles — Equip Them</h2>
          <p className="text-muted-foreground mt-1">
            Install tracking, cameras, biometrics on 10 existing tuk-tuks. Pure tech, zero vehicle risk.
          </p>
        </div>
        <Button onClick={generatePDF} className="bg-orange-600 hover:bg-orange-700">
          <FileDown className="mr-2 h-4 w-4" /> Download PDF Proposal
        </Button>
      </div>

      {/* The Pitch */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">The "Western Bar Scene" Problem</h3>
              <p className="text-muted-foreground">
                Approaching tuk-tuk owners about "your app" can feel like walking into a bar just before 
                the gunfight. They're territorial, suspicious, and they've heard every pitch. <strong>This proposal 
                doesn't ask them to change anything.</strong> It installs equipment that protects their vehicle, their 
                driver, and their passengers — for free. The sell is safety, not disruption.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use of Funds */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
              Hardware — R143k
            </CardTitle>
            <CardDescription>Per vehicle: R14,300</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.values(HARDWARE_DATA.hardwareCosts).filter(v => typeof v === 'object' && 'description' in v).map((item: any, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.description.split('(')[0].trim()}</span>
                <span className="font-medium">R{item.total.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-5 w-5 text-blue-600" />
              Platform — R190k
            </CardTitle>
            <CardDescription>Tech infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.values(HARDWARE_DATA.platformCosts).filter(v => typeof v === 'object' && 'description' in v).map((item: any, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.description.split('(')[0].trim()}</span>
                <span className="font-medium">R{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-600" />
              Operations — R117k
            </CardTitle>
            <CardDescription>12-month runway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.values(HARDWARE_DATA.operationsCosts).filter(v => typeof v === 'object' && 'description' in v).map((item: any, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.description.split('(')[0].trim()}</span>
                <span className="font-medium">R{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Revenue Model — R3,300/vehicle/month
          </CardTitle>
          <CardDescription>
            Annual fleet revenue: R{(HARDWARE_DATA.revenue.fleetAnnual / 1000).toFixed(0)}k on R450k investment = ~88% Year 1 ROI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="font-bold">R500</p>
              <p className="text-xs text-muted-foreground">SaaS Fee</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-bold">R300</p>
              <p className="text-xs text-muted-foreground">Data Analytics</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="font-bold">R1,500</p>
              <p className="text-xs text-muted-foreground">Ad Wraps</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="font-bold">R200</p>
              <p className="text-xs text-muted-foreground">Insurance Ref</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="font-bold">R800</p>
              <p className="text-xs text-muted-foreground">Safety Premium</p>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">~14 months</p>
              <p className="text-sm text-muted-foreground">Payback Period</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">88%</p>
              <p className="text-sm text-muted-foreground">Year 1 ROI</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">R396k</p>
              <p className="text-sm text-muted-foreground">Annual Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Benefits */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            What Owners Get (Free)
          </CardTitle>
          <CardDescription>
            The pitch to owners is simple: "We install safety equipment on your vehicle for free. 
            You get tracking, cameras, and a panic button. Your driver gets protection. Your passengers feel safe."
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {HARDWARE_DATA.ownerBenefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card className="border-red-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Risk Matrix — Honest Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {HARDWARE_DATA.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                <Badge variant={r.severity === "high" ? "destructive" : r.severity === "medium" ? "secondary" : "outline"}>
                  {r.severity.toUpperCase()}
                </Badge>
                <div>
                  <p className="font-medium">{r.risk}</p>
                  <p className="text-sm text-muted-foreground">{r.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
