import { Button } from "@/components/ui/button";
import { FileDown, Presentation } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvestorPitchData {
  vehicleCost: number;
  fleetSize: number;
  dailyRevenue: number;
  fuelSavingsPerDay: number;
  maintenanceCostMonthly: number;
  operatingDaysPerMonth: number;
  monthlyGrossRevenue: number;
  ownerGrossShare: number;
  driverGrossShare: number;
  employmentCostsMonthly: number;
  monthlyFuelSavings: number;
  netOwnerIncomePerVehicle: number;
  totalInvestment: number;
  totalMonthlyNetIncome: number;
  paybackMonths: number;
  annualROI: number;
}

interface Props {
  data: InvestorPitchData;
}

export const InvestorPitchExport = ({ data }: Props) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Helper function for centered text
    const centerText = (text: string, y: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // Helper for section headers
    const sectionHeader = (text: string, y: number) => {
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(margin, y - 6, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin + 5, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      return y + 15;
    };

    // ============ PAGE 1: COVER ============
    doc.setFillColor(16, 185, 129); // Primary green
    doc.rect(0, 0, pageWidth, 80, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    centerText("POORTLINK", 35, 32);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    centerText("A MobilityOne Platform | Electric Fleet Investment", 50, 16);
    
    doc.setFontSize(12);
    centerText("Investor Pitch Deck", 65, 12);
    
    doc.setTextColor(0, 0, 0);
    yPos = 100;
    
    // Key highlights box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 70, 5, 5, "F");
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Investment Highlights", margin + 10, yPos + 15);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const highlights = [
      `✓ ${data.annualROI.toFixed(1)}% Annual ROI`,
      `✓ ${data.paybackMonths.toFixed(1)} Month Payback Period`,
      `✓ R${data.totalInvestment.toLocaleString()} Total Investment`,
      `✓ R${(data.totalMonthlyNetIncome * 12).toLocaleString()} Annual Net Income`,
      `✓ SA Labour Law Compliant (60/40 Employment Model)`,
    ];
    
    highlights.forEach((h, i) => {
      doc.text(h, margin + 10, yPos + 30 + i * 10);
    });
    
    yPos = 190;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    centerText(`Generated: ${new Date().toLocaleDateString("en-ZA")}`, yPos, 10);
    centerText("Confidential - For Investor Review Only", yPos + 10, 10);
    
    // ============ PAGE 2: EXECUTIVE SUMMARY ============
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(0, 0, 0);
    yPos = sectionHeader("EXECUTIVE SUMMARY", yPos);
    
    doc.setFontSize(11);
    const execSummary = [
      "PoortLink (by MobilityOne) is pioneering compliant e-hailing services in",
      "South Africa's township economy using electric vehicles. This is the initial",
      "local rollout. This investment focuses on 10 electric bikes with employed drivers.",
      "",
      "Key Differentiators:",
      "• Full regulatory compliance (NDoT, SANTACO, Labour Law)",
      "• Electric vehicles: R100/day fuel savings per bike",
      "• Employed drivers: Reduced legal risk vs contractor model",
      "• Tech-enabled: AI matching, real-time tracking, digital payments",
    ];
    
    execSummary.forEach((line, i) => {
      doc.text(line, margin, yPos + i * 7);
    });
    
    yPos += 80;
    yPos = sectionHeader("INVESTMENT STRUCTURE", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Parameter", "Value"]],
      body: [
        ["Fleet Size", `${data.fleetSize} Electric Bikes`],
        ["Vehicle Cost (Landed)", `R${data.vehicleCost.toLocaleString()}`],
        ["Total Capital Required", `R${data.totalInvestment.toLocaleString()}`],
        ["Revenue Split", "60% Owner / 40% Driver"],
        ["Employment Model", "Formal Employment (BCEA Compliant)"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    // ============ PAGE 3: FINANCIAL MODEL ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("FINANCIAL MODEL - PER VEHICLE", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Revenue Item", "Daily", "Monthly"]],
      body: [
        ["Gross Revenue", `R${data.dailyRevenue}`, `R${data.monthlyGrossRevenue.toLocaleString()}`],
        ["Owner Share (60%)", `R${(data.dailyRevenue * 0.6).toFixed(0)}`, `R${data.ownerGrossShare.toLocaleString()}`],
        ["Driver Wage (40%)", `R${(data.dailyRevenue * 0.4).toFixed(0)}`, `R${data.driverGrossShare.toLocaleString()}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("EMPLOYMENT COSTS (SA COMPLIANT)", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Cost Item", "Rate", "Monthly Amount"]],
      body: [
        ["UIF (Employer)", "1%", `R${(data.driverGrossShare * 0.01).toFixed(0)}`],
        ["Skills Development Levy", "1%", `R${(data.driverGrossShare * 0.01).toFixed(0)}`],
        ["Leave Provision", "4.17%", `R${(data.driverGrossShare * 0.0417).toFixed(0)}`],
        ["Workman's Compensation", "1%", `R${(data.driverGrossShare * 0.01).toFixed(0)}`],
        ["Total Employment Overhead", "7.17%", `R${data.employmentCostsMonthly.toFixed(0)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("NET OWNER INCOME", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Item", "Monthly (per bike)"]],
      body: [
        ["Owner Gross Share", `R${data.ownerGrossShare.toLocaleString()}`],
        ["Less: Employment Costs", `-R${data.employmentCostsMonthly.toFixed(0)}`],
        ["Less: Maintenance", `-R${data.maintenanceCostMonthly.toLocaleString()}`],
        ["Add: Fuel Savings (Electric)", `+R${data.monthlyFuelSavings.toLocaleString()}`],
        ["NET OWNER INCOME", `R${data.netOwnerIncomePerVehicle.toLocaleString()}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      bodyStyles: { fontSize: 11 },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });
    
    // ============ PAGE 4: ROI ANALYSIS ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("RETURN ON INVESTMENT ANALYSIS", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: [
        ["Total Investment", `R${data.totalInvestment.toLocaleString()}`],
        ["Monthly Fleet Net Income", `R${data.totalMonthlyNetIncome.toLocaleString()}`],
        ["Annual Fleet Net Income", `R${(data.totalMonthlyNetIncome * 12).toLocaleString()}`],
        ["Payback Period", `${data.paybackMonths.toFixed(1)} months`],
        ["Annual ROI", `${data.annualROI.toFixed(1)}%`],
        ["Year 2 Cumulative Profit", `R${((data.totalMonthlyNetIncome * 24) - data.totalInvestment).toLocaleString()}`],
        ["Year 3 Cumulative Profit", `R${((data.totalMonthlyNetIncome * 36) - data.totalInvestment).toLocaleString()}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("5-YEAR PROJECTION", yPos);
    
    const yearlyData = [];
    for (let year = 1; year <= 5; year++) {
      const annualIncome = data.totalMonthlyNetIncome * 12;
      const cumulativeProfit = (annualIncome * year) - data.totalInvestment;
      yearlyData.push([
        `Year ${year}`,
        `R${annualIncome.toLocaleString()}`,
        `R${cumulativeProfit.toLocaleString()}`,
        `${((cumulativeProfit / data.totalInvestment) * 100).toFixed(0)}%`,
      ]);
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [["Period", "Annual Income", "Cumulative Profit", "Total Return"]],
      body: yearlyData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    
    // ============ PAGE 5: RISK & COMPLIANCE ============
    doc.addPage();
    yPos = 20;
    
    yPos = sectionHeader("COMPLIANCE ADVANTAGE", yPos);
    
    doc.setFontSize(11);
    const compliancePoints = [
      "✓ NDoT Registration: E-hailing operating license under NLTA Amendment Act",
      "✓ CIPC Registration: Legal entity status",
      "✓ SANTACO Membership: Industry body alignment",
      "✓ POPIA Compliance: Data protection for passenger/driver information",
      "✓ BCEA Compliance: Employed drivers with full benefits",
      "✓ UIF Registration: Unemployment insurance for drivers",
      "✓ COIDA Registration: Workman's compensation coverage",
    ];
    
    compliancePoints.forEach((point, i) => {
      doc.text(point, margin, yPos + i * 8);
    });
    
    yPos += 70;
    yPos = sectionHeader("RISK MITIGATION", yPos);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Risk", "Mitigation Strategy"]],
      body: [
        ["Labour Law Risk", "Formal employment model eliminates misclassification risk"],
        ["Battery Degradation", "Extra batteries ordered, warranty coverage"],
        ["Competition", "First-mover compliance advantage, tech differentiation"],
        ["Regulatory Changes", "Active monitoring via PolicyUpdatesSection"],
        ["Driver Retention", "Competitive 40% share + employment benefits"],
      ],
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 50 } },
    });
    
    // ============ PAGE 6: CONTACT ============
    doc.addPage();
    yPos = 60;
    
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 120, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    centerText("Investment Opportunity", 40, 24);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    centerText(`R${data.totalInvestment.toLocaleString()} for ${data.fleetSize} Electric Bikes`, 60, 14);
    centerText(`${data.annualROI.toFixed(1)}% Annual ROI | ${data.paybackMonths.toFixed(1)} Month Payback`, 80, 14);
    
    doc.setTextColor(0, 0, 0);
    yPos = 140;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    centerText("Next Steps", yPos, 16);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 20;
    
    const nextSteps = [
      "1. Review detailed financial model",
      "2. Site visit to operational area",
      "3. Meet with regulatory partners",
      "4. Investment term sheet discussion",
      "5. Legal due diligence",
    ];
    
    nextSteps.forEach((step, i) => {
      centerText(step, yPos + i * 12, 12);
    });
    
    yPos += 80;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    centerText("PoortLink by MobilityOne - Compliance-First E-Hailing", yPos, 10);
    centerText("Building the future of township mobility", yPos + 12, 10);
    
    // Save the PDF
    doc.save(`PoortLink_Investor_Pitch_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={generatePDF} className="gap-2">
        <FileDown className="h-4 w-4" />
        Export Investor Pitch (PDF)
      </Button>
    </div>
  );
};
