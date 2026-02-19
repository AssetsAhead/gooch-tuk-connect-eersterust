import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Handshake, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface AgreementDetails {
  partyAName: string;
  partyARegistration: string;
  partyAAddress: string;
  partyARepresentative: string;
  investorName: string;
  investorRegistration: string;
  investorAddress: string;
  investorRepresentative: string;
  effectiveDate: string;
  tier: string;
  investmentAmount: string;
  revenueSharePercent: string;
  returnCap: string;
  commitmentMonths: string;
  disbursementFrequency: string;
  revenueThreshold: string;
  sunsetYears: string;
}

const tierDefaults: Record<string, Partial<AgreementDetails>> = {
  founders_seed: {
    investmentAmount: "5000",
    revenueSharePercent: "5",
    returnCap: "7500",
    commitmentMonths: "6",
    disbursementFrequency: "quarterly",
    revenueThreshold: "5000",
    sunsetYears: "5",
  },
  implementation_partner: {
    investmentAmount: "180000",
    revenueSharePercent: "10",
    returnCap: "450000",
    commitmentMonths: "18",
    disbursementFrequency: "quarterly",
    revenueThreshold: "10000",
    sunsetYears: "5",
  },
  hybrid: {
    investmentAmount: "2000000",
    revenueSharePercent: "10",
    returnCap: "4000000",
    commitmentMonths: "30",
    disbursementFrequency: "monthly",
    revenueThreshold: "50000",
    sunsetYears: "7",
  },
  association: {
    investmentAmount: "0",
    revenueSharePercent: "7",
    returnCap: "0",
    commitmentMonths: "12",
    disbursementFrequency: "monthly",
    revenueThreshold: "0",
    sunsetYears: "3",
  },
};

const tierLabels: Record<string, string> = {
  founders_seed: "Founders' Seed (R5,000 — 5% pooled, 1.5× cap)",
  implementation_partner: "Implementation Partner (R180K — 10%, 2.5× cap)",
  hybrid: "Hybrid Revenue-Share (R2M — 10%, 2× cap + equity)",
  association: "Taxi Association Partnership (revenue-share only)",
};

const LegalRevenueShareAgreement = () => {
  const [details, setDetails] = useState<AgreementDetails>({
    partyAName: "MobilityOne (Pty) Ltd t/a PoortLink",
    partyARegistration: "",
    partyAAddress: "",
    partyARepresentative: "",
    investorName: "",
    investorRegistration: "",
    investorAddress: "",
    investorRepresentative: "",
    effectiveDate: format(new Date(), "yyyy-MM-dd"),
    tier: "implementation_partner",
    ...tierDefaults["implementation_partner"],
  } as AgreementDetails);

  const handleTierChange = (tier: string) => {
    setDetails((prev) => ({ ...prev, tier, ...tierDefaults[tier] }));
  };

  const isAssociation = details.tier === "association";

  const generateAgreement = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const m = 20;
    let y = 20;

    const addText = (text: string, size = 10, bold = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pw - m * 2);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, m, y);
        y += size * 0.5;
      });
      y += 3;
    };

    const heading = (text: string) => { y += 5; addText(text, 12, true); y += 2; };

    // Header
    const headerColor: [number, number, number] = isAssociation ? [22, 163, 74] : [30, 58, 138];
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, pw, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(isAssociation ? "PARTNERSHIP REVENUE-SHARE AGREEMENT" : "REVENUE-SHARE INVESTMENT AGREEMENT", pw / 2, 15, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Republic of South Africa", pw / 2, 23, { align: "center" });
    doc.text(`Tier: ${tierLabels[details.tier]?.split("(")[0]?.trim() || details.tier}`, pw / 2, 30, { align: "center" });
    doc.setTextColor(0, 0, 0);
    y = 45;

    // Parties
    addText(`This ${isAssociation ? "Partnership Revenue-Share" : "Revenue-Share Investment"} Agreement ("Agreement") is entered into on ${details.effectiveDate ? format(new Date(details.effectiveDate), "dd MMMM yyyy") : "[Date]"} between:`);
    y += 3;
    addText(`THE COMPANY: ${details.partyAName}`, 10, true);
    if (details.partyARegistration) addText(`Registration: ${details.partyARegistration}`);
    if (details.partyAAddress) addText(`Address: ${details.partyAAddress}`);
    addText(`Represented by: ${details.partyARepresentative || "[Representative]"}`);
    y += 3;
    addText(`THE ${isAssociation ? "PARTNER" : "INVESTOR"}: ${details.investorName || `[${isAssociation ? "Association" : "Investor"} Name]`}`, 10, true);
    if (details.investorRegistration) addText(`Registration: ${details.investorRegistration}`);
    if (details.investorAddress) addText(`Address: ${details.investorAddress}`);
    addText(`Represented by: ${details.investorRepresentative || "[Representative]"}`);

    heading("1. DEFINITIONS AND INTERPRETATION");
    addText(`1.1 "Gross Revenue" means all revenue generated by the Company through its platform operations, including but not limited to ride commissions, subscription fees, advertising income, SaaS fees, and transaction fees, before deduction of operating expenses.`);
    if (isAssociation) {
      addText(`1.2 "Facilitated Revenue" means gross revenue generated specifically from rides booked or paid through the platform on routes and at ranks operated by or associated with the Partner. Cash rides not facilitated by the platform are excluded.`);
    }
    addText(`${isAssociation ? "1.3" : "1.2"} "Revenue Share" means ${details.revenueSharePercent}% (${Number(details.revenueSharePercent) === 10 ? "ten" : Number(details.revenueSharePercent) === 5 ? "five" : Number(details.revenueSharePercent) === 7 ? "seven" : details.revenueSharePercent} percent) of ${isAssociation ? "Facilitated Revenue" : "all monthly Gross Revenue"}.`);
    if (!isAssociation && details.returnCap !== "0") {
      addText(`${isAssociation ? "1.4" : "1.3"} "Return Cap" means the maximum aggregate amount payable to the ${isAssociation ? "Partner" : "Investor"} under this Agreement, being R${Number(details.returnCap).toLocaleString()}.`);
    }

    if (!isAssociation) {
      heading("2. INVESTMENT");
      addText(`2.1 The Investor shall contribute a total investment of R${Number(details.investmentAmount).toLocaleString()} ("Investment Amount").`);
      if (details.tier === "founders_seed") {
        addText(`2.2 Payment may be made as a once-off payment of R5,000 or in 6 monthly instalments of R1,000.`);
      } else if (details.tier === "implementation_partner") {
        addText(`2.2 Payment shall be made in monthly instalments of R10,000 over 18 months, totalling R180,000.`);
      } else {
        addText(`2.2 Payment terms shall be as agreed in the Investment Schedule attached hereto.`);
      }
      addText(`2.3 This is a revenue-share arrangement. The Investor receives 0% (zero percent) equity in the Company under this Agreement.`);
    }

    heading(isAssociation ? "2. REVENUE SHARE" : "3. REVENUE SHARE & DISBURSEMENTS");
    addText(`${isAssociation ? "2" : "3"}.1 The Company shall pay the ${isAssociation ? "Partner" : "Investor"} ${details.revenueSharePercent}% of ${isAssociation ? "Facilitated Revenue" : "all monthly Gross Revenue"}.`);
    if (!isAssociation && Number(details.revenueThreshold) > 0) {
      addText(`${isAssociation ? "2" : "3"}.2 Revenue share payments are triggered only when monthly Gross Revenue exceeds R${Number(details.revenueThreshold).toLocaleString()}.`);
      addText(`${isAssociation ? "2" : "3"}.3 The revenue share applies to ALL revenue in that month, not only the amount above the threshold.`);
    }
    const disbFreq = details.disbursementFrequency === "quarterly" ? "quarterly (every 3 months)" : "monthly";
    addText(`${isAssociation ? "2" : "3"}.${!isAssociation && Number(details.revenueThreshold) > 0 ? "4" : "2"} Disbursements shall be made ${disbFreq}, payable within 15 business days of the end of each ${details.disbursementFrequency === "quarterly" ? "quarter" : "month"}.`);
    addText(`The Company shall provide an itemised statement showing: total revenue, calculation of the revenue share, and cumulative payments to date.`);
    if (!isAssociation && details.returnCap !== "0") {
      addText(`Revenue share payments shall cease automatically once the aggregate payments to the Investor equal the Return Cap of R${Number(details.returnCap).toLocaleString()}.`);
    }

    heading(isAssociation ? "3. PARTNER OBLIGATIONS" : "4. COMPANY OBLIGATIONS");
    if (isAssociation) {
      addText(`3.1 The Partner shall: (a) grant the Company access to operate at its ranks and on its routes; (b) promote the platform to its drivers and passengers; (c) share route schedules and operational data necessary for platform integration; (d) maintain its regulatory standing with SANTACO and relevant Provincial Regulatory Entities.`);
      addText(`3.2 The Partner retains full authority over its operational decisions, driver management, and route allocation.`);
      addText(`3.3 Cash rides not facilitated by the platform are entirely excluded from this Agreement. The Partner retains 100% of all cash revenue.`);
    } else {
      addText(`4.1 The Company shall maintain accurate financial records and make them available for inspection upon reasonable notice.`);
      addText(`4.2 The Company shall provide quarterly financial reports including revenue, expenses, and revenue share calculations.`);
      addText(`4.3 The Investor shall have the right to appoint an independent auditor at the Investor's expense to verify revenue figures once per calendar year.`);
    }

    heading(isAssociation ? "4. COMPANY OBLIGATIONS" : "5. INVESTOR OBLIGATIONS");
    if (isAssociation) {
      addText(`4.1 The Company shall: (a) provide and maintain the technology platform; (b) provide a branded analytics dashboard for the Partner; (c) share safety data and compliance reports; (d) handle all POPIA-compliant data processing; (e) provide training and onboarding support for drivers.`);
    } else {
      addText(`5.1 The Investor acknowledges the high-risk nature of early-stage ventures and accepts the possibility of partial or total loss of investment.`);
      addText(`5.2 The Investor shall not interfere with the day-to-day operations of the Company.`);
    }

    heading(isAssociation ? "5. TERM AND TERMINATION" : "6. EARLY EXIT & TERMINATION");
    addText(`${isAssociation ? "5" : "6"}.1 This Agreement shall remain in effect for an initial period of ${details.commitmentMonths} months from the Effective Date.`);
    if (!isAssociation) {
      addText(`6.2 EARLY EXIT: If the Investor exits before the end of the commitment period, the Return Cap shall be adjusted pro-rata based on the proportion of the commitment period completed. Example: If the Investor exits after 12 of ${details.commitmentMonths} months, the adjusted cap = R${Number(details.returnCap).toLocaleString()} × (12/${details.commitmentMonths}).`);
      addText(`6.3 SUNSET CLAUSE: If the Return Cap has not been reached within ${details.sunsetYears} years of the Effective Date, the Company's obligation to pay revenue share shall terminate, and any unpaid balance shall be forfeited.`);
    }
    addText(`${isAssociation ? "5" : "6"}.${isAssociation ? "2" : "4"} Either Party may terminate this Agreement with 30 days' written notice.`);
    addText(`${isAssociation ? "5" : "6"}.${isAssociation ? "3" : "5"} Termination does not affect any accrued rights or obligations, including revenue share payments earned prior to termination.`);

    heading(isAssociation ? "6. DATA SHARING & POPIA" : "7. CONFIDENTIALITY & POPIA");
    addText(`${isAssociation ? "6" : "7"}.1 All information exchanged under this Agreement shall be treated as confidential.`);
    addText(`${isAssociation ? "6" : "7"}.2 Both Parties shall comply with POPIA in respect of any personal information processed.`);
    if (isAssociation) {
      addText(`6.3 Data shared by the Partner (route data, driver information) shall only be used for platform operations and analytics. It shall not be shared with competing associations or third parties without consent.`);
      addText(`6.4 The Company shall provide the Partner with aggregated, anonymised analytics. Individual passenger data shall not be disclosed.`);
    }

    heading(isAssociation ? "7. GENERAL" : "8. GENERAL PROVISIONS");
    const gn = isAssociation ? "7" : "8";
    addText(`${gn}.1 GOVERNING LAW: This Agreement is governed by the laws of the Republic of South Africa.`);
    addText(`${gn}.2 DISPUTES: Disputes shall be resolved by mediation, failing which by arbitration in Pretoria.`);
    addText(`${gn}.3 ENTIRE AGREEMENT: This constitutes the entire agreement between the Parties.`);
    addText(`${gn}.4 AMENDMENTS: Must be in writing and signed by both Parties.`);
    addText(`${gn}.5 SEVERABILITY: Invalid provisions do not affect remaining provisions.`);
    addText(`${gn}.6 NO PARTNERSHIP/EMPLOYMENT: Nothing in this Agreement creates a partnership, joint venture, or employer-employee relationship between the Parties.`);

    // Signatures
    y += 10;
    heading("SIGNATURES");
    addText("The Parties confirm they have read, understood, and agree to be bound by these terms.");
    y += 8;
    doc.line(m, y, m + 70, y);
    doc.line(pw - m - 70, y, pw - m, y);
    y += 5;
    addText(`FOR THE COMPANY                                                        FOR THE ${isAssociation ? "PARTNER" : "INVESTOR"}`);
    addText(`Name: _______________________                              Name: _______________________`);
    addText(`Title: _______________________                                  Title: _______________________`);
    addText(`Date: _______________________                                  Date: _______________________`);
    y += 8;
    doc.line(m, y, m + 70, y);
    y += 5;
    addText("WITNESS");
    addText("Name: _______________________");
    addText("Date: _______________________");

    // Footer
    const pages = doc.internal.pages.length - 1;
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pages} | CONFIDENTIAL — Revenue Share Agreement | Generated: ${format(new Date(), "dd MMM yyyy")}`, pw / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    const partyLabel = details.investorName || (isAssociation ? "Association" : "Investor");
    const fileName = `Revenue_Share_${partyLabel.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/investor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Investor Portal</Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Revenue-Share Agreement</h1>
              <p className="text-muted-foreground">Covers investment tiers & taxi association partnerships</p>
            </div>
          </div>
          <Badge variant="secondary">Legal Document Generator</Badge>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agreement Type</CardTitle>
              <CardDescription>Select the investment tier or partnership model</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={details.tier} onValueChange={handleTierChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="founders_seed">{tierLabels.founders_seed}</SelectItem>
                  <SelectItem value="implementation_partner">{tierLabels.implementation_partner}</SelectItem>
                  <SelectItem value="hybrid">{tierLabels.hybrid}</SelectItem>
                  <SelectItem value="association">{tierLabels.association}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Company */}
          <Card>
            <CardHeader><CardTitle className="text-lg">The Company (PoortLink)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={details.partyAName} onChange={(e) => setDetails({ ...details, partyAName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CIPC Registration</Label>
                <Input value={details.partyARegistration} onChange={(e) => setDetails({ ...details, partyARegistration: e.target.value })} placeholder="2024/123456/07" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Registered Address</Label>
                <Input value={details.partyAAddress} onChange={(e) => setDetails({ ...details, partyAAddress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Authorised Representative</Label>
                <Input value={details.partyARepresentative} onChange={(e) => setDetails({ ...details, partyARepresentative: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Investor / Partner */}
          <Card>
            <CardHeader><CardTitle className="text-lg">{isAssociation ? "The Partner (Association)" : "The Investor"}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAssociation ? "Association Name" : "Investor Name"}</Label>
                <Input value={details.investorName} onChange={(e) => setDetails({ ...details, investorName: e.target.value })} placeholder={isAssociation ? "e.g. Eersterust Taxi Association" : "Full legal name"} />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={details.investorRegistration} onChange={(e) => setDetails({ ...details, investorRegistration: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={details.investorAddress} onChange={(e) => setDetails({ ...details, investorAddress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Authorised Representative</Label>
                <Input value={details.investorRepresentative} onChange={(e) => setDetails({ ...details, investorRepresentative: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Terms</CardTitle>
              <CardDescription>Pre-filled from tier selection — adjust if needed</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={details.effectiveDate} onChange={(e) => setDetails({ ...details, effectiveDate: e.target.value })} />
              </div>
              {!isAssociation && (
                <div className="space-y-2">
                  <Label>Investment Amount (R)</Label>
                  <Input value={details.investmentAmount} onChange={(e) => setDetails({ ...details, investmentAmount: e.target.value })} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Revenue Share (%)</Label>
                <Input value={details.revenueSharePercent} onChange={(e) => setDetails({ ...details, revenueSharePercent: e.target.value })} />
              </div>
              {!isAssociation && (
                <div className="space-y-2">
                  <Label>Return Cap (R)</Label>
                  <Input value={details.returnCap} onChange={(e) => setDetails({ ...details, returnCap: e.target.value })} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Commitment Period (months)</Label>
                <Input value={details.commitmentMonths} onChange={(e) => setDetails({ ...details, commitmentMonths: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Disbursement Frequency</Label>
                <Select value={details.disbursementFrequency} onValueChange={(v) => setDetails({ ...details, disbursementFrequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!isAssociation && (
                <>
                  <div className="space-y-2">
                    <Label>Revenue Threshold (R/month)</Label>
                    <Input value={details.revenueThreshold} onChange={(e) => setDetails({ ...details, revenueThreshold: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sunset Period (years)</Label>
                    <Input value={details.sunsetYears} onChange={(e) => setDetails({ ...details, sunsetYears: e.target.value })} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Generate */}
          <div className="flex gap-4">
            <Button onClick={generateAgreement} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Generate & Download Agreement
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalRevenueShareAgreement;
