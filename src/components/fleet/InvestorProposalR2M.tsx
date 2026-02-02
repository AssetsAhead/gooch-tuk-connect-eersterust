import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FileDown, Presentation, TrendingUp, Users, Shield, Zap, Target, Building2, Globe, Smartphone, Car, MapPin, DollarSign, Clock, AlertTriangle, CheckCircle2, Megaphone, Lock, Heart, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// R2M Investment Proposal Data
const INVESTMENT_DATA = {
  totalAsk: 2000000,
  equityOffer: 25, // 25% equity for R2M
  
  // Fleet Hardware (10 bikes fully equipped)
  fleetCosts: {
    electricBikes: { qty: 10, unitCost: 90000, total: 900000, description: "Electric Tuk Tuks (landed, import duty included)" },
    extraBatteries: { qty: 20, unitCost: 15000, total: 300000, description: "2 extra batteries per bike (hot-swap capability)" },
    dashCameras: { qty: 10, unitCost: 3500, total: 35000, description: "Dual-lens AI dashcams (front + cabin)" },
    gpsTrackers: { qty: 10, unitCost: 2500, total: 25000, description: "Real-time GPS + cellular trackers" },
    fingerprintSensors: { qty: 10, unitCost: 4000, total: 40000, description: "Biometric driver authentication" },
    phoneHolders: { qty: 10, unitCost: 800, total: 8000, description: "Weatherproof phone mounts" },
    safety: { qty: 10, unitCost: 2500, total: 25000, description: "Safety kit (fire extinguisher, first aid, reflectors)" },
    fleetSubtotal: 1333000
  },

  // Platform & Integration Costs
  platformCosts: {
    apiIntegrations: { amount: 150000, description: "Payment gateway, SMS, maps, AI services" },
    cloudInfra: { amount: 60000, description: "12 months Supabase, hosting, CDN" },
    appPolish: { amount: 80000, description: "iOS/Android app store optimization" },
    legalCompliance: { amount: 75000, description: "CIPC patents, DOT licensing, POPIA audit" },
    platformSubtotal: 365000
  },

  // Operations (12-month runway)
  operationsCosts: {
    driverTraining: { amount: 50000, description: "10 drivers × R5k training program" },
    insurance: { amount: 120000, description: "Fleet insurance (12 months)" },
    marketing: { amount: 80000, description: "Launch campaign, branded uniforms" },
    workingCapital: { amount: 52000, description: "Payroll float, contingency" },
    opsSubtotal: 302000
  },

  // Revenue Projections
  revenue: {
    dailyRevenuePerBike: 700,
    operatingDays: 26,
    monthlyGrossPerBike: 18200,
    ownerShare: 0.60,
    platformFee: 0.05,
    monthlyNetPerBike: 10920, // After 60% split
    monthlyPlatformFee: 910, // 5% of gross
    fleetMonthlyGross: 182000,
    fleetMonthlyNet: 109200,
    annualFleetNet: 1310400,
  },

  // Timeline (realistic with human factors)
  timeline: [
    { phase: "Month 1-2", title: "Setup & Sourcing", activities: "Company registration, import orders, API agreements" },
    { phase: "Month 3-4", title: "Integration Hell", activities: "Payment gateway, SMS provider, maps API negotiations" },
    { phase: "Month 5", title: "Fleet Arrival", activities: "Bikes arrive, equipment installation, testing" },
    { phase: "Month 6", title: "Soft Launch", activities: "5 bikes operational, driver training, beta users" },
    { phase: "Month 7-8", title: "Full Fleet", activities: "10 bikes live, marketing push, optimize operations" },
    { phase: "Month 9-12", title: "Scale Prep", activities: "Prove unit economics, prepare Phase 2 expansion" },
  ],

  // Growth Potential
  growthFactors: [
    { title: "Market Size", description: "250,000 minibus taxis in SA, <5% digitized", potential: "R90B annual industry" },
    { title: "Geographic Expansion", description: "Pretoria → Johannesburg → Cape Town → Durban", potential: "4 major metros" },
    { title: "Vehicle Types", description: "Tuk Tuks → Minibus Taxis → Delivery Vehicles", potential: "3x market segments" },
    { title: "Network Effects", description: "More drivers = more passengers = more drivers", potential: "Exponential growth" },
  ],

  // Additional Revenue Streams
  additionalRevenue: [
    { stream: "Advertising", description: "Wrapped vehicles, in-app ads, screen displays", potential: "R2,000/bike/month" },
    { stream: "Insurance Referrals", description: "Commission on driver/passenger insurance", potential: "R500/policy" },
    { stream: "Security Partnerships", description: "Armed response integration, panic button fees", potential: "R50/trip premium" },
    { stream: "Data Licensing", description: "Route analytics for municipalities, retailers", potential: "R100k+/year" },
    { stream: "SASSA Integration", description: "Grant verification discount platform", potential: "R5/verification" },
    { stream: "Airtime & VAS", description: "Top-ups, electricity, betting via app", potential: "5% commission" },
  ],

  // Risk Factors (honest)
  risks: [
    { risk: "API Integration Delays", mitigation: "6-month buffer, multiple vendor options", severity: "medium" },
    { risk: "Regulatory Changes", mitigation: "Proactive DOT engagement, compliance-first approach", severity: "medium" },
    { risk: "Driver Retention", mitigation: "Employment model (not gig), competitive 40% share", severity: "low" },
    { risk: "Competition", mitigation: "First-mover in tuk-tuk segment, patent protection", severity: "medium" },
    { risk: "Battery Degradation", mitigation: "2 extra batteries per bike, warranty coverage", severity: "low" },
  ],
};

export const InvestorProposalR2M = () => {
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
      doc.setFillColor(16, 185, 129);
      doc.rect(margin, y - 6, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin + 5, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      return y + 15;
    };

    // ============ PAGE 1: COVER ============
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 90, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    centerText("MOBILITY ONE", 35, 36);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    centerText("PoortLink | Electric Fleet Investment Proposal", 55, 18);
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    centerText("R2,000,000 Seed Round", 75, 24);
    
    doc.setTextColor(0, 0, 0);
    yPos = 110;
    
    // Executive Summary Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 85, 5, 5, "F");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin + 10, yPos + 12);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summary = [
      "We're seeking R2M to launch a 10-vehicle electric tuk-tuk fleet in Pretoria East,",
      "proving the unit economics before national scale. This is a compliance-first,",
      "tech-enabled approach to dominating the informal transit market.",
      "",
      "Key Numbers:",
      `• Total Investment: R${(INVESTMENT_DATA.totalAsk / 1000000).toFixed(0)}M for 25% equity`,
      `• Fleet Revenue: R${(INVESTMENT_DATA.revenue.annualFleetNet / 1000).toFixed(0)}k annual net income (10 bikes)`,
      `• Payback: ~18 months to full capital recovery`,
      `• Market: R90B taxi industry, <5% digitized`,
      "",
      "This can start from a backyard operation with minimal overhead.",
    ];
    
    summary.forEach((line, i) => {
      doc.text(line, margin + 10, yPos + 25 + i * 6);
    });
    
    yPos = 210;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    centerText("CONFIDENTIAL - For MTN eSwatini CEO Review", yPos, 10);
    centerText(`Prepared: ${new Date().toLocaleDateString("en-ZA")}`, yPos + 10, 10);
    
    // ============ PAGE 2: USE OF FUNDS ============
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(0, 0, 0);
    yPos = sectionHeader("USE OF FUNDS: R2,000,000", yPos);
    
    // Fleet Hardware
    autoTable(doc, {
      startY: yPos,
      head: [["Fleet Hardware (10 Bikes)", "Qty", "Unit Cost", "Total"]],
      body: [
        ["Electric Tuk Tuks (landed)", "10", "R90,000", "R900,000"],
        ["Extra Batteries (2 per bike)", "20", "R15,000", "R300,000"],
        ["AI Dashcams (dual-lens)", "10", "R3,500", "R35,000"],
        ["GPS Trackers", "10", "R2,500", "R25,000"],
        ["Fingerprint Sensors", "10", "R4,000", "R40,000"],
        ["Phone Mounts + Safety Kits", "10", "R3,300", "R33,000"],
        ["FLEET HARDWARE SUBTOTAL", "", "", "R1,333,000"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Platform & Integration
    autoTable(doc, {
      startY: yPos,
      head: [["Platform & Integration", "Amount", "Notes"]],
      body: [
        ["API Integrations", "R150,000", "Payments, SMS, Maps, AI (expect delays)"],
        ["Cloud Infrastructure (12mo)", "R60,000", "Supabase, hosting, CDN"],
        ["App Store Optimization", "R80,000", "iOS/Android polish"],
        ["Legal & Compliance", "R75,000", "Patents, DOT license, POPIA"],
        ["PLATFORM SUBTOTAL", "R365,000", ""],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [219, 234, 254];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Operations
    autoTable(doc, {
      startY: yPos,
      head: [["Operations (12-Month Runway)", "Amount", "Notes"]],
      body: [
        ["Driver Training Program", "R50,000", "10 drivers × R5k each"],
        ["Fleet Insurance", "R120,000", "Comprehensive cover"],
        ["Marketing Launch", "R80,000", "Branding, uniforms, campaign"],
        ["Working Capital", "R52,000", "Payroll float, contingency"],
        ["OPERATIONS SUBTOTAL", "R302,000", ""],
      ],
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [243, 232, 255];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Total
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL INVESTMENT: R2,000,000", margin + 10, yPos + 13);
    doc.text("25% Equity", pageWidth - margin - 40, yPos + 13);
    
    // ============ PAGE 3: REVENUE MODEL ============
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(0, 0, 0);
    yPos = sectionHeader("REVENUE MODEL: CONSERVATIVE PROJECTIONS", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Per Bike Economics", "Daily", "Monthly (26 days)"]],
      body: [
        ["Gross Revenue (R15 × 47 trips)", "R700", "R18,200"],
        ["Owner Share (60%)", "R420", "R10,920"],
        ["Driver Share (40%)", "R280", "R7,280"],
        ["Platform Fee (5%)", "R35", "R910"],
        ["Fuel Savings (Electric)", "+R100", "+R2,600"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("FLEET PROJECTIONS (10 BIKES)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Monthly", "Annual"]],
      body: [
        ["Gross Fleet Revenue", "R182,000", "R2,184,000"],
        ["Net Owner Income", "R109,200", "R1,310,400"],
        ["Platform Fees (5%)", "R9,100", "R109,200"],
        ["Operating Costs", "-R25,000", "-R300,000"],
        ["NET CASH FLOW", "R84,200", "R1,010,400"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // ROI Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 5, 5, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Investment Returns", margin + 10, yPos + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("• Payback Period: ~20 months (conservative)", margin + 10, yPos + 22);
    doc.text("• Year 1 ROI: 50% (after ramp-up)", margin + 10, yPos + 30);
    doc.text("• Break-even on fleet: Month 18-20", pageWidth / 2, yPos + 22);
    doc.text("• Year 3 Cumulative: R3M+ net profit", pageWidth / 2, yPos + 30);
    
    // ============ PAGE 4: ADDITIONAL REVENUE ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("ADDITIONAL REVENUE STREAMS", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Revenue Stream", "Description", "Potential"]],
      body: [
        ["Vehicle Advertising", "Wrapped bikes, in-app ads, screen displays", "R2,000/bike/month"],
        ["Insurance Referrals", "Commission on driver/passenger policies", "R500/policy sold"],
        ["Security Partnerships", "Armed response integration, panic premium", "R50/trip premium tier"],
        ["Data Licensing", "Route analytics for municipalities, retailers", "R100k+/year"],
        ["SASSA Verification", "Grant card discount platform (patented)", "R5/verification"],
        ["Airtime & VAS", "Top-ups, electricity, betting via app", "5% commission"],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("GROWTH POTENTIAL", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Growth Factor", "Current → Target", "Market Size"]],
      body: [
        ["Geographic", "Pretoria East → 4 Metros", "Johannesburg, Cape Town, Durban"],
        ["Vehicle Types", "10 Tuk Tuks → Mixed Fleet", "Tuk Tuks + Minibus Taxis + Delivery"],
        ["Market Share", "Proof of Concept → 1%", "R90B industry = R900M at 1%"],
        ["Network Effects", "Local → National", "More drivers = more passengers = more drivers"],
      ],
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 25, 5, 5, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Domination Strategy:", margin + 10, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Prove unit economics with 10 bikes → Raise Series A (R20M) → Scale to 500 bikes → National expansion", margin + 10, yPos + 19);
    
    // ============ PAGE 5: TIMELINE (REALISTIC) ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("REALISTIC TIMELINE (Human Factors Included)", yPos);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Note: API integrations require negotiations with 'lazy and incompetent humans' - timeline includes buffer.", margin, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Phase", "Timeline", "Activities", "Risks"]],
      body: [
        ["Setup", "Month 1-2", "Company registration, import orders, bank accounts", "Customs delays"],
        ["Integration", "Month 3-4", "Payment gateway, SMS, Maps API negotiations", "Vendor delays (2-4 weeks each)"],
        ["Fleet Arrival", "Month 5", "Bikes land, equipment install, testing", "Shipping delays possible"],
        ["Soft Launch", "Month 6", "5 bikes live, driver training, beta users", "Learning curve"],
        ["Full Fleet", "Month 7-8", "10 bikes operational, marketing push", "Demand validation"],
        ["Optimize", "Month 9-12", "Prove unit economics, prepare Series A", "Operational refinement"],
      ],
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("RISK MATRIX (Honest Assessment)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Risk", "Severity", "Mitigation"]],
      body: [
        ["API Integration Delays", "MEDIUM", "6-month buffer, multiple vendor options, fallbacks"],
        ["Regulatory Changes", "MEDIUM", "Proactive DOT engagement, compliance-first approach"],
        ["Driver Retention", "LOW", "Employment model (not gig), competitive 40% share"],
        ["Competition Entry", "MEDIUM", "First-mover advantage, patent protection (3 patents filed)"],
        ["Battery Degradation", "LOW", "2 extra batteries per bike, warranty coverage"],
        ["Demand Risk", "LOW", "Existing tuk-tuk market, underserved area"],
      ],
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });
    
    // ============ PAGE 6: INVESTOR TERMS ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("INVESTMENT TERMS", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Term", "Details"]],
      body: [
        ["Investment Amount", "R2,000,000"],
        ["Equity Offered", "25% (negotiable based on involvement level)"],
        ["Valuation (Pre-money)", "R6,000,000"],
        ["Valuation (Post-money)", "R8,000,000"],
        ["Investor Type", "Declared Side Hustle / Strategic Angel"],
        ["Board Seat", "Optional observer seat"],
        ["Reporting", "Monthly financials, quarterly board updates"],
        ["Exit Options", "Series A dilution, buyback after 3 years, strategic sale"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Why MTN Strategic Fit
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 5, 5, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Strategic Fit: MTN Synergies", margin + 10, yPos + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const synergies = [
      "• MoMo Integration: Seamless mobile money payments for unbanked passengers",
      "• Airtime/Data Sales: In-app VAS with MTN commission structure",
      "• IoT Connectivity: Fleet SIM cards for trackers and dashcams",
      "• Brand Alignment: MTN + mobility = digital transformation story",
      "• Regional Expansion: eSwatini pilot potential after SA proof of concept",
    ];
    synergies.forEach((s, i) => {
      doc.text(s, margin + 10, yPos + 22 + i * 6);
    });
    
    yPos += 60;
    
    // Call to Action
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    centerText("Ready to Dominate the Tuk Tuk Market?", yPos + 15, 16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    centerText("This initiative can start from a backyard with minimal overhead.", yPos + 28, 12);
    centerText("Let's build the operating system for informal transit.", yPos + 36, 12);
    
    // Footer
    yPos += 55;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    centerText("MOBILITY ONE (Pty) Ltd | SARS: 9065004328 | CIPC Registered", yPos, 10);
    centerText("Contact: [Your Details Here]", yPos + 10, 10);
    
    // Save
    doc.save(`MobilityOne_R2M_Proposal_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Presentation className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">R2M Investor Proposal</CardTitle>
                <CardDescription>
                  MTN eSwatini CEO Pitch • 10 Electric Bikes • 25% Equity
                </CardDescription>
              </div>
            </div>
            <Button onClick={generatePDF} size="lg" className="gap-2">
              <FileDown className="h-5 w-5" />
              Download Full Proposal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Investment Ask</span>
            </div>
            <p className="text-2xl font-bold text-green-700">R2,000,000</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Equity Offer</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">25%</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Annual Net (10 bikes)</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">R1.01M</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Payback</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">~20 Months</p>
          </CardContent>
        </Card>
      </div>

      {/* Use of Funds Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Fleet Hardware
            </CardTitle>
            <CardDescription>R1,333,000 (67%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>10× Electric Tuk Tuks</span>
              <span className="font-mono">R900,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>20× Extra Batteries</span>
              <span className="font-mono">R300,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cameras + Trackers</span>
              <span className="font-mono">R60,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fingerprint + Safety</span>
              <span className="font-mono">R73,000</span>
            </div>
            <Separator />
            <Progress value={67} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Platform & Integration
            </CardTitle>
            <CardDescription>R365,000 (18%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>API Integrations*</span>
              <span className="font-mono">R150,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cloud (12 months)</span>
              <span className="font-mono">R60,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>App Store Polish</span>
              <span className="font-mono">R80,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Legal & Patents</span>
              <span className="font-mono">R75,000</span>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground italic">*Includes buffer for vendor delays</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Operations (12mo)
            </CardTitle>
            <CardDescription>R302,000 (15%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Driver Training</span>
              <span className="font-mono">R50,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fleet Insurance</span>
              <span className="font-mono">R120,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Marketing Launch</span>
              <span className="font-mono">R80,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Working Capital</span>
              <span className="font-mono">R52,000</span>
            </div>
            <Separator />
            <Progress value={15} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Additional Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Additional Revenue Streams
          </CardTitle>
          <CardDescription>Beyond ride fees - multiple monetization paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {INVESTMENT_DATA.additionalRevenue.map((item, idx) => (
              <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {idx === 0 && <Megaphone className="h-5 w-5 text-primary" />}
                  {idx === 1 && <Shield className="h-5 w-5 text-primary" />}
                  {idx === 2 && <Lock className="h-5 w-5 text-primary" />}
                  {idx === 3 && <MapPin className="h-5 w-5 text-primary" />}
                  {idx === 4 && <Heart className="h-5 w-5 text-primary" />}
                  {idx === 5 && <Smartphone className="h-5 w-5 text-primary" />}
                  <span className="font-medium">{item.stream}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <Badge variant="secondary">{item.potential}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Acknowledgment */}
      <Card className="border-amber-500/30 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Honest Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {INVESTMENT_DATA.risks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                <Badge variant={risk.severity === 'low' ? 'default' : 'secondary'} className="mt-1">
                  {risk.severity.toUpperCase()}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{risk.risk}</p>
                  <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Fit */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-yellow-700" />
            MTN Strategic Synergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">MoMo Payments</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Airtime Sales</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">IoT Connectivity</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Brand Alignment</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">eSwatini Pilot</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
