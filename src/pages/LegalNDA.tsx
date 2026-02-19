import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface NDADetails {
  partyAName: string;
  partyARegistration: string;
  partyAAddress: string;
  partyARepresentative: string;
  partyBName: string;
  partyBRegistration: string;
  partyBAddress: string;
  partyBRepresentative: string;
  effectiveDate: string;
  duration: string;
  purpose: string;
}

const LegalNDA = () => {
  const [details, setDetails] = useState<NDADetails>({
    partyAName: "MobilityOne (Pty) Ltd t/a PoortLink",
    partyARegistration: "",
    partyAAddress: "",
    partyARepresentative: "",
    partyBName: "",
    partyBRegistration: "",
    partyBAddress: "",
    partyBRepresentative: "",
    effectiveDate: format(new Date(), "yyyy-MM-dd"),
    duration: "24",
    purpose: "investment",
  });

  const purposeLabels: Record<string, string> = {
    investment: "evaluating a potential investment opportunity",
    partnership: "exploring a potential business partnership or association agreement",
    technology: "evaluating technology integration and data-sharing arrangements",
    employment: "evaluating potential employment or contractor engagement",
  };

  const generateNDA = () => {
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
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pw, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MUTUAL NON-DISCLOSURE AGREEMENT", pw / 2, 15, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Confidential — Republic of South Africa", pw / 2, 23, { align: "center" });
    doc.text("Governed by the Protection of Personal Information Act (POPIA)", pw / 2, 30, { align: "center" });
    doc.setTextColor(0, 0, 0);
    y = 45;

    // Preamble
    addText(`This Mutual Non-Disclosure Agreement ("Agreement") is entered into on ${details.effectiveDate ? format(new Date(details.effectiveDate), "dd MMMM yyyy") : "[Date]"} ("Effective Date") by and between:`);
    y += 3;
    addText(`PARTY A: ${details.partyAName || "[Party A]"}`, 10, true);
    if (details.partyARegistration) addText(`Registration: ${details.partyARegistration}`);
    if (details.partyAAddress) addText(`Address: ${details.partyAAddress}`);
    addText(`Represented by: ${details.partyARepresentative || "[Representative]"}`);
    y += 3;
    addText(`PARTY B: ${details.partyBName || "[Party B]"}`, 10, true);
    if (details.partyBRegistration) addText(`Registration: ${details.partyBRegistration}`);
    if (details.partyBAddress) addText(`Address: ${details.partyBAddress}`);
    addText(`Represented by: ${details.partyBRepresentative || "[Representative]"}`);
    y += 3;
    addText(`(each a "Party" and collectively the "Parties")`);

    heading("RECITALS");
    addText(`WHEREAS the Parties wish to explore and evaluate ${purposeLabels[details.purpose] || details.purpose} (the "Purpose"), and in connection therewith, each Party may disclose Confidential Information to the other.`);
    addText(`NOW THEREFORE, in consideration of the mutual covenants herein, the Parties agree as follows:`);

    heading("1. DEFINITIONS");
    addText(`1.1 "Confidential Information" means all information disclosed by either Party (the "Disclosing Party") to the other (the "Receiving Party"), whether orally, in writing, electronically, or by any other means, including but not limited to: business plans, financial data, revenue models, customer data, technology specifications, source code, algorithms, trade secrets, investor terms, partnership agreements, operational data, route data, driver information, and any other proprietary information.`);
    addText(`1.2 "Representatives" means the officers, directors, employees, agents, advisors, and consultants of a Party.`);

    heading("2. OBLIGATIONS OF CONFIDENTIALITY");
    addText(`2.1 The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party; (c) use Confidential Information solely for the Purpose; (d) protect Confidential Information with the same degree of care it uses for its own confidential information, but in no event less than reasonable care.`);
    addText(`2.2 The Receiving Party may disclose Confidential Information to its Representatives who have a need to know, provided such Representatives are bound by confidentiality obligations no less restrictive than those herein.`);

    heading("3. EXCLUSIONS");
    addText(`3.1 Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed without use of Confidential Information; (d) is rightfully received from a third party without restriction.`);
    addText(`3.2 A Receiving Party may disclose Confidential Information if required by law, regulation, or court order, provided it gives the Disclosing Party prompt written notice and cooperates in seeking a protective order.`);

    heading("4. POPIA COMPLIANCE");
    addText(`4.1 To the extent Confidential Information includes personal information as defined in the Protection of Personal Information Act 4 of 2013 ("POPIA"), the Receiving Party shall process such information in accordance with POPIA.`);
    addText(`4.2 The Receiving Party shall implement appropriate technical and organisational measures to protect personal information against loss, damage, unauthorised access, or unlawful processing.`);
    addText(`4.3 In the event of a data breach involving personal information, the Receiving Party shall notify the Disclosing Party within 72 hours and cooperate in notifying the Information Regulator and affected data subjects as required.`);

    heading("5. INTELLECTUAL PROPERTY");
    addText(`5.1 No licence, right, or interest in any intellectual property, trademark, patent, copyright, or trade secret is granted by either Party under this Agreement.`);
    addText(`5.2 All Confidential Information remains the sole property of the Disclosing Party.`);

    heading("6. TERM AND TERMINATION");
    addText(`6.1 This Agreement shall remain in effect for ${details.duration} months from the Effective Date, unless terminated earlier by either Party with 30 days' written notice.`);
    addText(`6.2 The obligations of confidentiality shall survive termination of this Agreement for a period of 3 (three) years.`);
    addText(`6.3 Upon termination, the Receiving Party shall, at the Disclosing Party's election, return or destroy all Confidential Information and certify such destruction in writing.`);

    heading("7. REMEDIES");
    addText(`7.1 The Parties acknowledge that a breach of this Agreement may cause irreparable harm for which monetary damages would be inadequate. The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.`);
    addText(`7.2 The Receiving Party shall be liable for any breach of this Agreement by its Representatives.`);

    heading("8. GENERAL PROVISIONS");
    addText(`8.1 GOVERNING LAW: This Agreement shall be governed by the laws of the Republic of South Africa.`);
    addText(`8.2 DISPUTES: Any dispute shall be resolved by mediation, failing which by arbitration in accordance with the Arbitration Act 42 of 1965, in Pretoria.`);
    addText(`8.3 ENTIRE AGREEMENT: This Agreement constitutes the entire agreement between the Parties regarding confidentiality and supersedes all prior agreements.`);
    addText(`8.4 AMENDMENTS: Amendments must be in writing and signed by both Parties.`);
    addText(`8.5 SEVERABILITY: If any provision is found invalid, the remaining provisions shall remain in full force and effect.`);
    addText(`8.6 NO WAIVER: Failure to enforce any provision shall not constitute a waiver of that provision.`);
    addText(`8.7 COUNTERPARTS: This Agreement may be executed in counterparts, each of which shall constitute an original.`);

    // Signatures
    y += 10;
    heading("SIGNATURES");
    addText("IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.");
    y += 8;
    doc.line(m, y, m + 70, y);
    doc.line(pw - m - 70, y, pw - m, y);
    y += 5;
    addText(`FOR PARTY A                                                                    FOR PARTY B`);
    addText(`Name: _______________________                              Name: _______________________`);
    addText(`Title: _______________________                                  Title: _______________________`);
    addText(`Date: _______________________                                  Date: _______________________`);
    y += 8;
    doc.line(m, y, m + 70, y);
    y += 5;
    addText("WITNESS");
    addText("Name: _______________________");
    addText("Date: _______________________");

    // Footer on all pages
    const pages = doc.internal.pages.length - 1;
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pages} | CONFIDENTIAL — Mutual NDA | Generated: ${format(new Date(), "dd MMM yyyy")}`, pw / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    const fileName = details.partyBName
      ? `NDA_${details.partyBName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`
      : `NDA_Template_${format(new Date(), "yyyyMMdd")}.pdf`;
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mutual Non-Disclosure Agreement</h1>
              <p className="text-muted-foreground">POPIA-compliant NDA for investor, partnership, and integration conversations</p>
            </div>
          </div>
          <Badge variant="secondary">Legal Document Generator</Badge>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Purpose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agreement Purpose</CardTitle>
              <CardDescription>What is this NDA for?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={details.purpose} onValueChange={(v) => setDetails({ ...details, purpose: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">Investment Discussions</SelectItem>
                  <SelectItem value="partnership">Association / Partnership</SelectItem>
                  <SelectItem value="technology">Technology / API Integration</SelectItem>
                  <SelectItem value="employment">Employment / Contractor</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Party A */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Party A (Your Company)</CardTitle>
            </CardHeader>
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
                <Input value={details.partyARepresentative} onChange={(e) => setDetails({ ...details, partyARepresentative: e.target.value })} placeholder="Full name" />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Party B */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Party B (Other Party)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company / Individual Name</Label>
                <Input value={details.partyBName} onChange={(e) => setDetails({ ...details, partyBName: e.target.value })} placeholder="Investor or partner name" />
              </div>
              <div className="space-y-2">
                <Label>Registration Number (if company)</Label>
                <Input value={details.partyBRegistration} onChange={(e) => setDetails({ ...details, partyBRegistration: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={details.partyBAddress} onChange={(e) => setDetails({ ...details, partyBAddress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Authorised Representative</Label>
                <Input value={details.partyBRepresentative} onChange={(e) => setDetails({ ...details, partyBRepresentative: e.target.value })} placeholder="Full name" />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agreement Terms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={details.effectiveDate} onChange={(e) => setDetails({ ...details, effectiveDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Select value={details.duration} onValueChange={(v) => setDetails({ ...details, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Generate */}
          <div className="flex gap-4">
            <Button onClick={generateNDA} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Generate & Download NDA
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalNDA;
