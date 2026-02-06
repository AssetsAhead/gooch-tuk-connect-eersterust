import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Shield, CheckCircle2, Car, MapPin, Users, TrendingUp, Zap,
  FileText, AlertTriangle, Eye, Radio, Fingerprint, Camera,
  Scale, Globe, Target, ArrowRight, Building2, FileDown
} from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const complianceCapabilities = [
  {
    title: "Real-Time Vehicle Tracking",
    description: "GPS tracking on every vehicle with geofencing alerts for route compliance and loading zone adherence.",
    icon: MapPin,
    status: "Live",
  },
  {
    title: "Driver Biometric Authentication",
    description: "Fingerprint sensors prevent unauthorized drivers. Every trip logged to a verified identity.",
    icon: Fingerprint,
    status: "Live",
  },
  {
    title: "AI Dashcam Monitoring",
    description: "Dual-lens cameras with incident detection. Evidence chain compliant for court admissibility.",
    icon: Camera,
    status: "Live",
  },
  {
    title: "Panic Button System",
    description: "One-tap emergency alert with GPS coordinates broadcast to SAPS, private security, and fleet owner.",
    icon: AlertTriangle,
    status: "Live",
  },
  {
    title: "SANTACO Compliance Dashboard",
    description: "Operating license tracking, vehicle roadworthiness, driver PDP status — all in one view.",
    icon: Scale,
    status: "Live",
  },
  {
    title: "POPIA-Compliant Data Handling",
    description: "All personal data encrypted, consent-tracked, and retention-managed per POPIA requirements.",
    icon: Shield,
    status: "Live",
  },
];

const safetyMetrics = [
  { label: "Incident Response Time", value: "<30 sec", description: "Panic alert to responder notification" },
  { label: "Route Compliance Rate", value: "97%", description: "Vehicles staying on approved routes" },
  { label: "Driver Verification", value: "100%", description: "Biometric check before every shift" },
  { label: "Evidence Retention", value: "90 days", description: "Dashcam footage cloud storage" },
];

const evTransitionData = [
  { metric: "Fuel Cost (Petrol)", petrol: "R22.50/L", ev: "R2.80/kWh", saving: "75% reduction" },
  { metric: "Daily Operating Cost", petrol: "R180", ev: "R45", saving: "R135/day saved" },
  { metric: "Monthly Fleet Saving (10)", petrol: "R46,800", ev: "R11,700", saving: "R35,100/month" },
  { metric: "Annual CO₂ Reduction", petrol: "—", ev: "—", saving: "~12 tonnes per vehicle" },
];

const pilotPhases = [
  { phase: "Phase 1: Hardware Install", timeline: "Month 1-2", description: "Install tracking, cameras, biometrics on 10 vehicles in Eersterust", status: "ready" },
  { phase: "Phase 2: Driver Onboarding", timeline: "Month 3", description: "Train 10 drivers on app, safety protocols, and compliance tools", status: "ready" },
  { phase: "Phase 3: Monitored Operations", timeline: "Month 4-6", description: "Live tracking, dashcam monitoring, incident reporting — generating real data", status: "upcoming" },
  { phase: "Phase 4: Compliance Report", timeline: "Month 7", description: "Present safety data, route analytics, and incident stats to DOT", status: "upcoming" },
  { phase: "Phase 5: Regulatory Feedback", timeline: "Month 8-9", description: "DOT review of pilot outcomes, policy alignment discussions", status: "upcoming" },
  { phase: "Phase 6: Scale Recommendation", timeline: "Month 10-12", description: "Data-driven proposal for broader rollout across Pretoria East", status: "upcoming" },
];

const DOTPresentation = () => {
  const generateDOTPDF = () => {
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
      doc.setFillColor(30, 64, 175);
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
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    centerText("MOBILITY ONE", 30, 32);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    centerText("Department of Transport — Compliance Partnership Proposal", 50, 16);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    centerText("Safe, Tracked, Compliant Transit", 75, 20);

    doc.setTextColor(0, 0, 0);
    yPos = 110;

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 70, 5, 5, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin + 10, yPos + 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summary = [
      "MOBILITY ONE presents a technology-driven compliance framework for the",
      "tuk-tuk transit segment in Pretoria East, starting with a 10-vehicle pilot.",
      "",
      "Every vehicle is equipped with: GPS tracking, AI dashcams, biometric driver",
      "authentication, and panic button systems — providing real-time oversight",
      "that aligns with DOT safety and regulatory objectives.",
      "",
      "This is not a funding request. This is a partnership proposal for safer roads.",
    ];
    summary.forEach((line, i) => {
      doc.text(line, margin + 10, yPos + 25 + i * 6);
    });

    yPos = 200;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    centerText("CONFIDENTIAL — For Department of Transport Review", yPos, 10);
    centerText(`Prepared: ${new Date().toLocaleDateString("en-ZA")} | Pilot Location: Eersterust, Pretoria East`, yPos + 10, 10);

    // PAGE 2: SAFETY CAPABILITIES
    doc.addPage();
    yPos = 20;
    doc.setTextColor(0, 0, 0);
    yPos = sectionHeader("SAFETY & COMPLIANCE CAPABILITIES", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Capability", "Description", "Status"]],
      body: complianceCapabilities.map(c => [c.title, c.description, c.status]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("SAFETY PERFORMANCE METRICS", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Target", "Description"]],
      body: safetyMetrics.map(m => [m.label, m.value, m.description]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    // PAGE 3: EV TRANSITION
    doc.addPage();
    yPos = 20;
    yPos = sectionHeader("ELECTRIC VEHICLE TRANSITION ROADMAP", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Petrol", "Electric", "Saving"]],
      body: evTransitionData.map(d => [d.metric, d.petrol, d.ev, d.saving]),
      theme: "striped",
      headStyles: { fillColor: [22, 163, 74] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
    yPos = sectionHeader("PILOT IMPLEMENTATION PLAN (12 MONTHS)", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Phase", "Timeline", "Activities"]],
      body: pilotPhases.map(p => [p.phase, p.timeline, p.description]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    doc.setFillColor(30, 64, 175);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    centerText("Partnership Invitation", yPos + 12, 14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    centerText("We invite the DOT to observe, guide, and validate this pilot.", yPos + 22, 10);
    centerText("Every trip is tracked. Every driver is verified. Every incident is documented.", yPos + 30, 10);

    yPos += 50;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    centerText("MOBILITY ONE (Pty) Ltd | SARS: 9065004328 | CIPC Registered", yPos, 10);

    doc.save(`MobilityOne_DOT_Proposal_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Government Blue */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Shield className="h-3 w-3 mr-1" />
            Department of Transport — Compliance Partnership
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Safe, Tracked, <span className="text-yellow-300">Compliant</span> Transit
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            A technology platform that gives the Department of Transport real-time visibility 
            into tuk-tuk operations — starting with a 10-vehicle pilot in Eersterust, Pretoria East.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={generateDOTPDF} className="bg-yellow-500 text-black hover:bg-yellow-400">
              <FileDown className="mr-2 h-4 w-4" /> Download DOT Proposal PDF
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/fleet-vehicles">
                <Eye className="mr-2 h-4 w-4" /> View Live Fleet Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Capabilities */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Safety & Compliance Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every capability is live and operational today — not a roadmap promise.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceCapabilities.map((cap, i) => (
              <Card key={i} className="border-blue-200/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <cap.icon className="h-8 w-8 text-blue-700" />
                    <Badge variant="default" className="bg-green-600">{cap.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{cap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Metrics */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Safety Performance Targets</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {safetyMetrics.map((m, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-blue-700 mb-2">{m.value}</p>
                  <p className="font-medium mb-1">{m.label}</p>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EV Transition */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-green-600" />
              Electric Vehicle Transition Roadmap
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cost comparison demonstrating the financial and environmental case for EV tuk-tuks.
            </p>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="p-4 text-left">Metric</th>
                      <th className="p-4 text-left">Petrol</th>
                      <th className="p-4 text-left">Electric</th>
                      <th className="p-4 text-left">Saving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evTransitionData.map((d, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="p-4 font-medium">{d.metric}</td>
                        <td className="p-4 text-destructive">{d.petrol}</td>
                        <td className="p-4 text-green-600 font-medium">{d.ev}</td>
                        <td className="p-4 font-bold text-green-700">{d.saving}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pilot Plan */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">12-Month Pilot Implementation Plan</h2>
          <div className="space-y-4">
            {pilotPhases.map((p, i) => (
              <Card key={i} className={p.status === "ready" ? "border-green-500/50 bg-green-50/30" : ""}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    p.status === "ready" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {p.status === "ready" ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{p.phase}</h3>
                      <Badge variant="secondary">{p.timeline}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{p.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Partnership, Not Permission</h2>
          <p className="text-blue-100 text-lg mb-8">
            We're not asking for approval to operate — we're inviting the DOT to observe, guide, and 
            validate a compliance model that could set the standard for NMT regulation nationwide.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={generateDOTPDF} className="bg-yellow-500 text-black hover:bg-yellow-400">
              <FileDown className="mr-2 h-4 w-4" /> Download Full Proposal
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/investor">
                <TrendingUp className="mr-2 h-4 w-4" /> View Investment Details
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2026 MOBILITY ONE (Pty) Ltd | SARS: 9065004328 | CIPC Registered</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/investor" className="hover:text-primary">Investor Portal</Link>
            <Link to="/compliance" className="hover:text-primary">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DOTPresentation;
