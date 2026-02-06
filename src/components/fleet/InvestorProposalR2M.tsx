import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FileDown, Presentation, TrendingUp, Users, Shield, Zap, Target, Building2, Globe, Smartphone, Car, MapPin, DollarSign, Clock, AlertTriangle, CheckCircle2, Megaphone, Lock, Heart, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// R2M Investment Proposal Data - GROUNDED IN 10-BIKE POC REALITY
const INVESTMENT_DATA = {
  totalAsk: 2000000,
  equityOffer: 25, // 25% equity for R2M
  launchLocation: "Eersterust, Pretoria East",
  
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

  // Operations (12-month runway) - REALISTIC COSTS
  operationsCosts: {
    driverTraining: { amount: 50000, description: "10 drivers × R5k training program" },
    insurance: { amount: 180000, description: "Fleet insurance @ R1,500/bike/month (12 months)" },
    maintenance: { amount: 60000, description: "Maintenance reserve @ R500/bike/month" },
    marketing: { amount: 60000, description: "Launch campaign, branded uniforms" },
    workingCapital: { amount: 52000, description: "Payroll float, contingency" },
    opsSubtotal: 402000
  },

  // Monthly Operating Costs (per bike - for projections)
  monthlyOpsCosts: {
    insurance: 1500,
    maintenance: 500,
    cellular: 150, // Tracker & data
    employmentOverhead: 0, // Calculated as % of driver share
    totalPerBike: 2150,
  },

  // Revenue Projections - CONSERVATIVE, HONEST NUMBERS
  revenue: {
    dailyRevenuePerBike: 700, // R15 × ~47 trips
    operatingDays: 26,
    monthlyGrossPerBike: 18200,
    ownerShare: 0.60, // 60% to owner/investor
    driverShare: 0.40, // 40% to employed driver
    platformFee: 0.05, // 5% of gross
    monthlyOwnerGross: 10920, // 60% of R18,200
    monthlyDriverWage: 7280, // 40% of R18,200
    employmentCosts: 522, // ~7.17% on driver wage (UIF, SDL, leave, COIDA)
    monthlyInsurance: 1500,
    monthlyMaintenance: 500,
    monthlyNetPerBike: 8398, // R10,920 - R522 - R1,500 - R500
    fuelSavingsPerBike: 2600, // R100/day × 26 days (vs petrol)
    netWithFuelSavings: 10998, // Monthly net including EV savings
    fleetMonthlyGross: 182000,
    fleetMonthlyNetOwner: 83980, // 10 bikes × net per bike (before fuel savings)
    fleetMonthlyNetWithSavings: 109980, // Including fuel savings
    annualFleetNet: 1007760, // Conservative (without fuel savings counted)
    annualFleetNetWithSavings: 1319760, // Including fuel savings
  },

  // Timeline (realistic with human factors)
  timeline: [
    { phase: "Month 1-2", title: "Setup & Sourcing", activities: "Company registration, import orders, API agreements" },
    { phase: "Month 3-4", title: "Integration Hell", activities: "Payment gateway, SMS provider, maps API negotiations" },
    { phase: "Month 5", title: "Fleet Arrival", activities: "Bikes arrive, equipment installation, testing" },
    { phase: "Month 6", title: "Soft Launch", activities: "5 bikes in Eersterust, driver training, beta users" },
    { phase: "Month 7-8", title: "Full Fleet", activities: "10 bikes live, marketing push, optimize operations" },
    { phase: "Month 9-12", title: "Prove Model", activities: "Document unit economics, build investor case for Phase 2" },
  ],

  // Growth Potential - GROUNDED, NOT UTOPIC
  growthFactors: [
    { title: "POC → Validation", description: "10 bikes in Eersterust proves unit economics", potential: "12-month data set" },
    { title: "Phase 2 (Year 2)", description: "Expand to 25-30 bikes in Pretoria East", potential: "3x fleet if POC succeeds" },
    { title: "Phase 3 (Year 3)", description: "Second location (Mamelodi, Soshanguve)", potential: "Geographic expansion" },
    { title: "Long-term Vision", description: "Fleet recap program for existing operators", potential: "Franchise model" },
  ],

  // Fintech Partners (SA)
  fintechPartners: [
    { name: "Letshego SA", type: "Micro-lender", service: "Driver emergency loans, vehicle financing", website: "letshego.com/south-africa" },
    { name: "Select Africa", type: "Micro-lender", service: "Flexi Facility Loans (2-year revolving)", website: "selectafrica.net" },
    { name: "Jumo", type: "Digital lending", service: "Instant micro-loans via USSD/app", website: "jumo.world" },
    { name: "Heleza", type: "Women's finance", service: "Female driver/passenger financial products", website: "Grameen Foundation backed" },
  ],

  // Additional Revenue Streams (Expanded)
  additionalRevenue: [
    // Tier 1: Core transport revenue
    { stream: "Ride Commission", description: "5% platform fee on every trip", potential: "R9,100/month (10 bikes)", tier: 1 },
    { stream: "Surge Pricing", description: "Peak hours, events, rain premium (1.5-2x)", potential: "R15,000/month", tier: 1 },
    
    // Tier 2: Fleet advertising
    { stream: "Vehicle Wraps", description: "Full vehicle branding for cellular providers, Shoprite, etc.", potential: "R3,000/bike/month", tier: 2 },
    { stream: "In-App Ads", description: "Sponsored banners, promotional notifications", potential: "R1,500/month", tier: 2 },
    { stream: "Driver Tablet Ads", description: "Video ads on passenger-facing screens", potential: "R2,000/bike/month", tier: 2 },
    
    // Tier 3: Financial services (via Fintech partners)
    { stream: "Micro-Loans Referral", description: "Commission from Letshego/Select Africa referrals", potential: "R200/loan", tier: 3 },
    { stream: "Airtime & Data", description: "In-app top-ups (all networks via MojaRide)", potential: "5% margin", tier: 3 },
    { stream: "Electricity Vouchers", description: "Prepaid electricity via app", potential: "3% commission", tier: 3 },
    { stream: "Grocery Vouchers", description: "Pick n Pay, Shoprite digital vouchers", potential: "2% commission", tier: 3 },
    { stream: "Driver Savings Club", description: "Group stokvel for vehicle ownership", potential: "R50/driver/month admin", tier: 3 },
    
    // Tier 4: Insurance & Security
    { stream: "Insurance Referrals", description: "Commission on driver/passenger policies", potential: "R500/policy", tier: 4 },
    { stream: "Security Premium", description: "Armed response, panic button add-on", potential: "R50/trip (premium tier)", tier: 4 },
    { stream: "Dashcam Evidence", description: "Footage licensing for insurance claims", potential: "R500/incident", tier: 4 },
    
    // Tier 5: Data & B2B
    { stream: "Route Analytics", description: "Movement data for municipalities, retailers", potential: "R100k+/year", tier: 5 },
    { stream: "Corporate Accounts", description: "Business shuttle contracts", potential: "R20k+/contract/month", tier: 5 },
    { stream: "Delivery Add-On", description: "Package delivery between passenger trips", potential: "R30/delivery", tier: 5 },
    
    // Tier 6: Government/Grant integration
    { stream: "SASSA Verification", description: "Grant card discount platform (patented)", potential: "R5/verification", tier: 6 },
    { stream: "Municipality Contracts", description: "Ward transport for elderly, disabled", potential: "R50k+/contract", tier: 6 },
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
      "We're seeking R2M to launch a 10-vehicle electric tuk-tuk fleet in Eersterust,",
      "Pretoria East - a focused proof of concept before any expansion. This is a",
      "compliance-first, tech-enabled approach to the informal transit market.",
      "",
      "Key Numbers (Conservative, After All Costs):",
      `• Total Investment: R${(INVESTMENT_DATA.totalAsk / 1000000).toFixed(0)}M for 25% equity`,
      `• Monthly Net per Bike: R${INVESTMENT_DATA.revenue.monthlyNetPerBike.toLocaleString()} (after insurance, maintenance, employment costs)`,
      `• Fleet Annual Net: R${(INVESTMENT_DATA.revenue.annualFleetNet / 1000).toFixed(0)}k (10 bikes, conservative)`,
      `• Payback: ~24 months to capital recovery`,
      "",
      "This starts from a backyard operation. No utopic projections - just proven maths.",
    ];
    
    summary.forEach((line, i) => {
      doc.text(line, margin + 10, yPos + 25 + i * 6);
    });
    
    yPos = 210;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    centerText("CONFIDENTIAL - For Investor Review", yPos, 10);
    centerText(`Prepared: ${new Date().toLocaleDateString("en-ZA")} | Launch: Eersterust POC`, yPos + 10, 10);
    
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
    
    // Operations - Updated with maintenance
    autoTable(doc, {
      startY: yPos,
      head: [["Operations (12-Month Runway)", "Amount", "Notes"]],
      body: [
        ["Driver Training Program", "R50,000", "10 drivers × R5k each"],
        ["Fleet Insurance", "R180,000", "R1,500/bike/month × 12 months"],
        ["Maintenance Reserve", "R60,000", "R500/bike/month × 12 months"],
        ["Marketing Launch", "R60,000", "Branding, uniforms, campaign"],
        ["Working Capital", "R52,000", "Payroll float, contingency"],
        ["OPERATIONS SUBTOTAL", "R402,000", ""],
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
    yPos = sectionHeader("REVENUE MODEL: HONEST NUMBERS", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Per Bike Economics", "Daily", "Monthly (26 days)"]],
      body: [
        ["Gross Revenue (R15 × 47 trips)", "R700", "R18,200"],
        ["OWNER Share (60%)", "R420", "R10,920"],
        ["Driver Share (40%)", "R280", "R7,280"],
        ["Less: Employment Costs (7.17%)", "-R20", "-R522"],
        ["Less: Insurance", "-R58", "-R1,500"],
        ["Less: Maintenance Reserve", "-R19", "-R500"],
        ["NET OWNER INCOME", "R323", "R8,398"],
        ["Add: EV Fuel Savings", "+R100", "+R2,600"],
        ["EFFECTIVE NET (with savings)", "R423", "R10,998"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.row.index === 6 || data.row.index === 8) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("FLEET PROJECTIONS (10 BIKES - EERSTERUST POC)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Monthly", "Annual"]],
      body: [
        ["Gross Fleet Revenue", "R182,000", "R2,184,000"],
        ["Owner Gross (60%)", "R109,200", "R1,310,400"],
        ["Less: All Operating Costs", "-R25,220", "-R302,640"],
        ["NET OWNER CASH FLOW", "R83,980", "R1,007,760"],
        ["Add: Fleet Fuel Savings", "+R26,000", "+R312,000"],
        ["EFFECTIVE NET (with savings)", "R109,980", "R1,319,760"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.row.index === 3 || data.row.index === 5) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // ROI Box - More conservative
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 5, 5, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Investment Returns (Conservative)", margin + 10, yPos + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("• Payback Period: 24 months (without fuel savings)", margin + 10, yPos + 24);
    doc.text("• Payback with EV savings: ~18 months", margin + 10, yPos + 33);
    doc.text("• Year 1 ROI: 50% (conservative)", pageWidth / 2, yPos + 24);
    doc.text("• Break-even: Month 20-24", pageWidth / 2, yPos + 33);
    
    // ============ PAGE 4: FINTECH PARTNERS & REVENUE ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("FINTECH PARTNERS (Micro-Loans Outsourced)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Partner", "Type", "Service", "Revenue Model"]],
      body: [
        ["Letshego SA", "Micro-lender", "Driver emergency loans, vehicle financing", "R200/referral"],
        ["Select Africa", "Micro-lender", "Flexi Facility Loans (2-year revolving)", "R200/referral"],
        ["Jumo", "Digital lending", "Instant micro-loans via USSD/app", "Commission TBD"],
        ["Heleza", "Women's finance", "Female driver/passenger products", "Partnership revenue"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("💡 Strategy: We refer customers, partners handle lending risk. Zero capital required.", margin + 10, yPos + 13);
    
    yPos += 30;
    yPos = sectionHeader("REVENUE STREAMS (6 TIERS)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Tier", "Stream", "Description", "Potential"]],
      body: [
        ["T1: Core", "Ride Commission", "5% platform fee on every trip", "R9,100/month"],
        ["T1: Core", "Surge Pricing", "Peak hours, events, rain (1.5-2x)", "R15,000/month"],
        ["T2: Ads", "Vehicle Wraps", "Full branding for cellular providers, Shoprite, etc.", "R3,000/bike/mo"],
        ["T2: Ads", "In-App & Tablet Ads", "Sponsored banners, video ads", "R3,500/month"],
        ["T3: Fintech", "Micro-Loan Referrals", "Commission from Letshego/Select Africa", "R200/loan"],
        ["T3: Fintech", "Airtime/Data/Electricity", "In-app top-ups (all networks)", "3-5% margin"],
        ["T4: Security", "Insurance Referrals", "Commission on policies sold", "R500/policy"],
        ["T4: Security", "Premium Panic Button", "Armed response add-on", "R50/trip"],
        ["T5: B2B", "Route Analytics", "Data for municipalities, retailers", "R100k+/year"],
        ["T5: B2B", "Corporate Accounts", "Business shuttle contracts", "R20k+/contract"],
        ["T6: Govt", "SASSA Verification", "Grant discount platform (patented)", "R5/verification"],
        ["T6: Govt", "Municipality Contracts", "Ward transport for elderly, disabled", "R50k+/contract"],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("GROWTH PATH (GROUNDED)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Phase", "Timeline", "Target", "Success Criteria"]],
      body: [
        ["POC", "Year 1", "10 bikes in Eersterust", "Prove unit economics, >80% utilization"],
        ["Validate", "Year 2", "Expand to 25-30 bikes", "Only if POC profitable for 6+ months"],
        ["Expand", "Year 3", "Second township location", "Mamelodi or Soshanguve based on data"],
        ["Mature", "Year 4+", "Franchise model for operators", "Long-term vision, not this investment"],
      ],
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 5, 5, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Strategy: Prove Before Scale", margin + 10, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("10 bikes → 12 months hard data → Only then discuss expansion. No smoke and mirrors.", margin + 10, yPos + 20);
    doc.text("Future: Taxi recap program for existing operators (like minibus taxi recap, but for tuk tuks).", margin + 10, yPos + 28);
    
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
        ["Soft Launch", "Month 6", "5 bikes live in Eersterust, driver training", "Learning curve"],
        ["Full Fleet", "Month 7-8", "10 bikes operational, marketing push", "Demand validation"],
        ["Prove", "Month 9-12", "Document unit economics, build hard data", "Operational refinement"],
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
    
    // Strategic Partnerships
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 5, 5, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Strategic Fit: Cellular & Fintech Partnerships", margin + 10, yPos + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const synergies = [
      "• Mobile Money: Seamless mobile payments for unbanked passengers (all networks)",
      "• Airtime/Data Sales: In-app VAS with multi-provider commission structure",
      "• IoT Connectivity: Fleet SIM cards for trackers and dashcams (best-rate provider)",
      "• Brand Partnerships: Vehicle wrap advertising for cellular & FMCG brands",
      "• Charging Infrastructure: Solar-powered depot as community charging hub",
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
                  Investor Pitch • 10 Electric Bikes • Eersterust POC • 25% Equity
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

      {/* Location Badge */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <MapPin className="h-5 w-5 text-primary" />
        <span className="font-medium">Launch Location:</span>
        <Badge variant="secondary">Eersterust, Pretoria East</Badge>
        <span className="text-sm text-muted-foreground">• 10 bikes • 10 employed drivers • Proof of Concept</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/10 border-success/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-success mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Investment Ask</span>
            </div>
            <p className="text-2xl font-bold text-success">R2,000,000</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Equity Offer</span>
            </div>
            <p className="text-2xl font-bold text-primary">25%</p>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-accent-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Annual Net (after costs)</span>
            </div>
            <p className="text-2xl font-bold text-accent-foreground">R1.01M</p>
            <p className="text-xs text-muted-foreground">Conservative, 10 bikes</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-warning mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Payback</span>
            </div>
            <p className="text-2xl font-bold text-warning">~24 Months</p>
            <p className="text-xs text-muted-foreground">18mo with EV savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Use of Funds Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-success" />
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
              <Globe className="h-5 w-5 text-primary" />
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
              <Users className="h-5 w-5 text-accent-foreground" />
              Operations (12mo)
            </CardTitle>
            <CardDescription>R402,000 (20%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Driver Training</span>
              <span className="font-mono">R50,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fleet Insurance (12mo)</span>
              <span className="font-mono">R180,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Maintenance Reserve</span>
              <span className="font-mono">R60,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Marketing Launch</span>
              <span className="font-mono">R60,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Working Capital</span>
              <span className="font-mono">R52,000</span>
            </div>
            <Separator />
            <Progress value={20} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Fintech Partners */}
      <Card className="border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-success" />
            Fintech Partners (Micro-Loans Outsourced)
          </CardTitle>
          <CardDescription>Strategic partnerships for financial services - we refer, they lend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {INVESTMENT_DATA.fintechPartners.map((partner, idx) => (
              <div key={idx} className="p-4 bg-background rounded-lg border flex items-start gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{partner.name}</span>
                    <Badge variant="outline" className="text-xs">{partner.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{partner.service}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{partner.website}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-center">
              <span className="font-medium">💡 Revenue Model:</span> Commission per loan referral (R200+), no lending risk, no capital required
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Revenue Streams - Tiered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Revenue Streams (6 Tiers)
          </CardTitle>
          <CardDescription>Beyond ride fees - diversified monetization paths for maximum ROI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tier 1: Core */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary">Tier 1</Badge>
              <span className="font-medium">Core Transport</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 1).map((item, idx) => (
                <div key={idx} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.stream}</span>
                    <Badge variant="secondary" className="text-xs">{item.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2: Advertising */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-accent">Tier 2</Badge>
              <span className="font-medium">Advertising</span>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 2).map((item, idx) => (
                <div key={idx} className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.stream}</span>
                    <Badge variant="secondary" className="text-xs">{item.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3: Financial Services */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-success text-success-foreground">Tier 3</Badge>
              <span className="font-medium">Financial Services (via Fintech Partners)</span>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 3).map((item, idx) => (
                <div key={idx} className="p-3 bg-success/5 rounded-lg border border-success/20">
                  <span className="font-medium text-sm block">{item.stream}</span>
                  <p className="text-xs text-muted-foreground my-1">{item.description}</p>
                  <Badge variant="outline" className="text-xs">{item.potential}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 4: Insurance & Security */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-warning text-warning-foreground">Tier 4</Badge>
              <span className="font-medium">Insurance & Security</span>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 4).map((item, idx) => (
                <div key={idx} className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.stream}</span>
                    <Badge variant="secondary" className="text-xs">{item.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 5: Data & B2B */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-secondary text-secondary-foreground">Tier 5</Badge>
              <span className="font-medium">Data & B2B Services</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 5).map((item, idx) => (
                <div key={idx} className="p-3 bg-secondary/10 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.stream}</span>
                    <Badge variant="secondary" className="text-xs">{item.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 6: Government */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">Tier 6</Badge>
              <span className="font-medium">Government & Grant Integration</span>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {INVESTMENT_DATA.additionalRevenue.filter(r => r.tier === 6).map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.stream}</span>
                    <Badge variant="secondary" className="text-xs">{item.potential}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-primary">Combined Revenue Potential</p>
              <p className="text-sm text-muted-foreground">Core transport + 5 additional tiers = <span className="font-medium">40-60% higher ROI</span> vs ride-only model</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Acknowledgment */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Honest Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {INVESTMENT_DATA.risks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
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

      {/* Strategic Partnerships */}
      <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-warning" />
            Strategic Partnerships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">Mobile Payments</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">Airtime Sales</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">IoT Connectivity</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">Brand Advertising</p>
            </div>
            <div className="text-center p-3">
              <CheckCircle2 className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">Charging Hub</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
