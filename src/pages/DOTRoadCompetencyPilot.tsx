import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ShieldCheck, MapPin, Fingerprint, Camera, AlertTriangle, FileDown,
  Users, TrendingDown, Landmark, GraduationCap, ArrowLeft, CheckCircle2,
  Info, Globe, Scale,
} from "lucide-react";

const priorArt = [
  {
    ref: "US 11113775 (2021)",
    owner: "Allstate",
    scope: "Telematics-based assessment of a new driver against a state licensing standard, with communication to the licensing authority.",
    posture: "Closest reference. US-only; no South African equivalent identified. Relevant only if a US filing is ever pursued.",
  },
  {
    ref: "Graduated licensing telematics patents",
    owner: "Various insurers / OEMs",
    scope: "Monitoring of learner and probationary drivers, coaching feedback, and parental or supervisor reporting.",
    posture: "Broadly disclosed. The platform uses conventional, widely published telematics techniques in this area.",
  },
  {
    ref: "Driver behaviour scoring and event detection",
    owner: "Fleet telematics sector",
    scope: "Harsh braking, speeding, cornering and camera-based event capture with scoring.",
    posture: "Commodity technology. No exclusivity claimed or required for the pilot.",
  },
];

const theoryModes = [
  {
    title: "Stationary micro-assessments",
    body: "Short randomised question sets are unlocked only when the vehicle is confirmed stationary — GPS speed at zero and the vehicle in a parked state — for example at a loading zone between trips. A session is a few questions at a time, accumulated over days.",
  },
  {
    title: "Live situational recognition",
    body: "Voice-prompted questions tied to what the road actually presents — sign recognition, right of way, following distance — answered verbally with the accredited mentor or examiner present. The dashcam records both the road scene and the answer, and scoring is done afterwards from the clip, never live.",
  },
];

const theoryControls = [
  "Biometric login binds every answer to the candidate, not to a device or a phone number.",
  "Question sets are randomised per session and drawn from a bank held by the authority, not by the operator.",
  "GPS, dashcam footage and server timestamps form a tamper-resistant audit trail for each answered item.",
  "A registered mentor or examiner co-signs each session before it is submitted.",
  "No question is ever presented to a driver in motion; motion cancels an open session.",
];

const theoryOpenQuestions = [
  "The legal status of a distributed theory assessment under the current regulations.",
  "Accreditation route for mentors and examiners supervising in-vehicle sessions.",
  "Distraction and safety rules governing any in-cab interaction, including the voice mode.",
  "Custody, versioning and confidentiality of the question bank.",
];


const mentorPrecedents = [
  {
    place: "Australia (NSW, Queensland)",
    body: "120 supervised hours logged by an accredited supervising driver, increasingly captured in a digital logbook app rather than on paper.",
  },
  {
    place: "United Kingdom",
    body: "Private practice with any qualified supervising driver is legal and expected, alongside paid instruction from an ADI-registered instructor.",
  },
  {
    place: "United States (most states)",
    body: "Graduated licensing with a parent- or guardian-certified hour log; several states now accept app-based logs.",
  },
];

const mentorAccreditation = [
  "Valid licence held for a defined minimum period, with a demerit-free record over that window.",
  "Vetting against AARTO and criminal record checks before accreditation is issued.",
  "Vehicle roadworthy, insured for supervised training use, and fitted with the pilot's GPS and dashcam hardware.",
  "Mentor identity biometrically bound to every session — the mentor clocks in the same way the candidate does.",
  "Capped session tariff published up front, so access to a vehicle cannot become rent-seeking on the poor.",
  "Accreditation suspended automatically on any falsification finding or serious infringement.",
];

const mentorEconomics = [
  { k: "Who supplies", v: "Accredited owner-mentors: fleet owners, driving schools extending into mentoring, and individual licensed drivers with a compliant vehicle." },
  { k: "What is sold", v: "Supervised in-vehicle hours — mentor time plus vehicle access — booked by the session through the platform." },
  { k: "Price control", v: "A regulator-agreed tariff band per hour, displayed before booking, with no surge or off-platform cash side-deals recognised as valid hours." },
  { k: "Evidence produced", v: "Each session yields a signed, timestamped record: candidate biometric, mentor biometric, GPS track, dashcam clip and event scoring." },
  { k: "Platform role", v: "Matching, accreditation records, evidence custody and tariff enforcement. The Department certifies the outcome." },
];
const PAGE_TITLE = "Road Competency Pilot — DOT Concept Proposal";
const PAGE_DESC =
  "A supervised, telematics-verified road competency pathway proposed to the South African Department of Transport, using GPS, dashcam and biometric driver identity.";

const problemPoints = [
  {
    title: "Testing is a snapshot, not a record",
    body: "A K53 test measures 30 minutes of behaviour. It cannot show how a driver performs over hundreds of real kilometres, at night, in traffic, or under pressure.",
  },
  {
    title: "Unlicensed driving happens anyway",
    body: "Many drivers begin operating before obtaining a learner's or driver's licence because of testing-centre backlogs, cost, and access. The behaviour is invisible to the regulator.",
  },
  {
    title: "Enforcement is reactive and expensive",
    body: "Roadside stop-and-check operations consume officer hours and only sample a fraction of vehicles at a single point in time.",
  },
  {
    title: "No evidence trail after the fact",
    body: "When an incident occurs involving an unlicensed driver, there is usually no prior behavioural record to inform sanction, retraining, or prosecution.",
  },
];

const techStack = [
  { icon: MapPin, title: "Continuous GPS Telemetry", body: "Every kilometre, route, speed profile and time-of-day is logged against the trip." },
  { icon: Fingerprint, title: "Biometric Driver Identity", body: "The driver authenticates before the vehicle moves, binding the record to a verified person — not a device." },
  { icon: Camera, title: "Dashcam Evidence Chain", body: "Front and cabin footage is captured with a tamper-evident chain suitable for review." },
  { icon: AlertTriangle, title: "Event & Incident Detection", body: "Harsh braking, speeding, and detected incidents are flagged and time-stamped automatically." },
  { icon: ShieldCheck, title: "Panic & Safety Layer", body: "One-tap emergency alerting with location broadcast during the supervised period." },
  { icon: Landmark, title: "Regulator Read Access", body: "A supervised-cohort view can be exposed to the DOT/RTMC for oversight of the pilot." },
];

const phases = [
  { n: 1, title: "Enrolment & Amnesty Registration", body: "Drivers voluntarily register, verify identity biometrically, and are issued a supervised-pilot status for the trial period." },
  { n: 2, title: "Supervised Hours Accrual", body: "The driver operates under the pilot conditions while GPS, event and video data accrue into a competency record." },
  { n: 3, title: "Mentor / Marshal Sign-Off", body: "An accredited mentor reviews the record at defined checkpoints and signs off on readiness." },
  { n: 4, title: "DOT / RTMC Review", body: "The regulator reviews cohort outcomes: incident rates, hours, behaviour trend, and sign-off integrity." },
  { n: 5, title: "Referral to Formal Testing", body: "Drivers meeting the threshold are referred into the official testing and licensing process with an evidence pack attached." },
  { n: 6, title: "Evaluate & Scale", body: "Outcomes are compared against a control group before any recommendation to widen the programme." },
];

const mockDriver = {
  name: "Driver #EP-014 (illustrative)",
  hours: 78,
  target: 120,
  km: 1_842,
  events: 3,
  lastEvent: "Harsh braking — Volga St, 12 Aug",
  mentor: "Checkpoint 2 signed off",
  status: "Awaiting Checkpoint 3",
};

const costSavings = [
  ["Roadside enforcement hours", "Officer time spent on stop-and-check sampling", "Continuous passive monitoring replaces a share of manual stops"],
  ["Unlicensed-driver prosecutions", "Court roll and administrative burden", "Voluntary enrolment diverts cases out of the prosecution pipeline"],
  ["Repeat test bookings", "Testing-centre capacity consumed by re-tests", "Evidence-backed readiness reduces premature and failed attempts"],
  ["Crash response and trauma cost", "Emergency services and public health load", "Earlier detection of high-risk behaviour before escalation"],
  ["Compliance auditing", "Manual inspection and paperwork verification", "Machine-generated, timestamped records reduce audit effort"],
  ["Licence fraud investigation", "Cost of detecting fraudulent credentials", "Biometric binding makes identity substitution far harder"],
];

const beneficiaries = [
  { who: "Department of Transport / RTMC", how: "Population-level behavioural data and a measurable reduction in unlicensed driving." },
  { who: "Traffic law enforcement", how: "Targeted deployment based on evidence instead of random sampling." },
  { who: "Unlicensed and learner drivers", how: "A structured, affordable pathway to legitimacy instead of indefinite illegality." },
  { who: "Passengers and road users", how: "Drivers whose competence is continuously observed rather than assumed." },
  { who: "Accredited driving instructors", how: "A new mentorship and sign-off role backed by objective data." },
  { who: "Testing centres", how: "Better-prepared candidates and reduced re-test congestion." },
  { who: "Municipalities", how: "Lower crash-related infrastructure and emergency response costs." },
  { who: "Fleet and vehicle owners", how: "Verifiable proof that only competent, identified drivers operate their vehicles." },
];

const displaced = [
  {
    who: "Manual roadside licence-check patrols",
    role: "Redeploy to high-risk interventions — impaired driving, roadworthiness, and overload enforcement, which telematics cannot assess.",
  },
  {
    who: "Paper-based licence administration clerks",
    role: "Transition to digital record custodianship, exception handling, and dispute resolution for contested competency records.",
  },
  {
    who: "Informal, unregistered driving 'teachers'",
    role: "Formalise as accredited mentors within the pilot's sign-off structure, bringing existing community reach into a regulated role.",
  },
  {
    who: "Duplicate physical verification checkpoints",
    role: "No clear future function once identity is biometrically bound. Noted for reference only; no redeployment path proposed.",
  },
];

const risks = [
  { r: "Legal authority", m: "The pilot cannot proceed without an explicit DOT/RTMC framework and a defined amnesty instrument. Nothing here presumes that authority exists." },
  { r: "Supervision liability", m: "Clear allocation of responsibility between driver, mentor, vehicle owner and the platform, agreed before enrolment." },
  { r: "Data privacy (POPIA)", m: "Explicit consent, purpose limitation, defined retention, and encrypted storage. Drivers may withdraw and exit the pilot." },
  { r: "Gaming the record", m: "Biometric binding, tamper-evident video, and cross-checks between GPS, event and mentor data." },
  { r: "Public perception", m: "Positioned publicly as a safety and formalisation programme, not surveillance. Participation is voluntary." },
  { r: "Equity of access", m: "Enrolment must not require an expensive device; vehicle-mounted hardware carries the burden, not the driver." },
];

const DOTRoadCompetencyPilot = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESC);
    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) meta?.setAttribute("content", prevDesc);
    };
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    const center = (text: string, y: number, size = 12) => {
      doc.setFontSize(size);
      doc.text(text, (pageWidth - doc.getTextWidth(text)) / 2, y);
    };
    const header = (text: string, y: number) => {
      doc.setFillColor(30, 64, 175);
      doc.rect(margin, y - 6, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin + 5, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      return y + 14;
    };

    // Cover
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    center("ROAD COMPETENCY PILOT", 32, 24);
    doc.setFont("helvetica", "normal");
    center("A Concept Proposal for the Department of Transport", 46, 13);
    center("Telematics-Verified, Supervised Driver Competency", 62, 13);

    doc.setTextColor(0, 0, 0);
    let y = 100;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 62, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Concept Summary", margin + 8, y + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    [
      "This document proposes a limited, DOT-sanctioned pilot in which drivers who",
      "currently operate without a valid licence may voluntarily enrol under a supervised",
      "status. GPS telemetry, biometric driver identity and dashcam evidence accrue into",
      "an auditable competency record, reviewed by accredited mentors and the regulator.",
      "",
      "This is a concept for discussion. It is not a licensing product, and it does not",
      "propose that any private party issue, replace or substitute a driving licence.",
    ].forEach((l, i) => doc.text(l, margin + 8, y + 24 + i * 6));

    y = 180;
    doc.setTextColor(120, 120, 120);
    center("Prepared for Department of Transport review", y, 9);
    center(`Date: ${new Date().toLocaleDateString("en-ZA")}  |  Proposed pilot area: Eersterust, Pretoria East`, y + 7, 9);
    doc.setTextColor(0, 0, 0);

    // Page 2
    doc.addPage();
    y = 20;
    y = header("1. THE PROBLEM", y);
    autoTable(doc, {
      startY: y,
      head: [["Issue", "Detail"]],
      body: problemPoints.map((p) => [p.title, p.body]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 55 } },
    });

    y = (doc as any).lastAutoTable.finalY + 14;
    y = header("2. TECHNOLOGY ALREADY OPERATIONAL", y);
    autoTable(doc, {
      startY: y,
      head: [["Capability", "Function in the pilot"]],
      body: techStack.map((t) => [t.title, t.body]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 55 } },
    });

    // Page 3
    doc.addPage();
    y = 20;
    y = header("3. PILOT PHASES", y);
    autoTable(doc, {
      startY: y,
      head: [["#", "Phase", "Description"]],
      body: phases.map((p) => [String(p.n), p.title, p.body]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 48 } },
    });

    y = (doc as any).lastAutoTable.finalY + 14;
    y = header("4. COST-SAVING AREAS", y);
    autoTable(doc, {
      startY: y,
      head: [["Area", "Current cost driver", "Effect of the pilot"]],
      body: costSavings,
      theme: "striped",
      headStyles: { fillColor: [22, 163, 74] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Page 4
    doc.addPage();
    y = 20;
    y = header("5. WHO BENEFITS", y);
    autoTable(doc, {
      startY: y,
      head: [["Stakeholder", "Benefit"]],
      body: beneficiaries.map((b) => [b.who, b.how]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 58 } },
    });

    y = (doc as any).lastAutoTable.finalY + 14;
    y = header("6. ROLES THAT CHANGE OR BECOME REDUNDANT", y);
    autoTable(doc, {
      startY: y,
      head: [["Role affected", "Proposed future function"]],
      body: displaced.map((d) => [d.who, d.role]),
      theme: "striped",
      headStyles: { fillColor: [180, 83, 9] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 58 } },
    });

    // Page 5
    doc.addPage();
    y = 20;
    y = header("7. NATIONAL SCALE VISION (PHASE 2)", y);
    doc.setFontSize(10);
    [
      "Because every record is anchored to a biometric login rather than a phone number or",
      "a plastic card, the same mechanism could later be offered to the entire South African",
      "driving population — not only the unlicensed cohort.",
      "",
      "In that second phase, any driver could opt in to maintain a verified competency and",
      "behaviour record. This would give the regulator a live national picture of road",
      "behaviour, and give drivers a portable, tamper-resistant record of their own conduct.",
      "",
      "This is stated as a direction of travel only. It depends entirely on the pilot",
      "producing measurable safety outcomes first, and on a legislative framework that does",
      "not yet exist.",
    ].forEach((l, i) => doc.text(l, margin, y + i * 6));

    y += 80;
    y = header("8. PRIOR ART AND IP POSITION", y);
    autoTable(doc, {
      startY: y,
      head: [["Reference", "Owner", "Scope", "Position"]],
      body: priorArt.map((p) => [p.ref, p.owner, p.scope, p.posture]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 26 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(
      doc.splitTextToSize(
        "No exclusivity is claimed over telematics-based driver training or competency assessment. " +
          "The techniques used in this pilot are widely published and freely practised. The pilot depends on a " +
          "regulatory framework and operational delivery, not on patent protection, and nothing in this proposal " +
          "creates a proprietary lock-in for the Department of Transport.",
        pageWidth - margin * 2,
      ),
      margin,
      y,
    );

    // Page 6 — in-vehicle theory assessment concept
    doc.addPage();
    y = 20;
    y = header("9. RETHINKING THE WRITTEN TEST: IN-VEHICLE THEORY ASSESSMENT", y);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const intro = doc.splitTextToSize(
      "Concept for the Department's consideration only; not an approved assessment method. The written test " +
        "currently requires a booking, a queue and a trip to a testing station. Slots are scarce and every " +
        "re-booking multiplies cost for the candidate and the state. This section proposes delivering the theory " +
        "component in the real driving environment, so that one supervised programme evidences both knowledge " +
        "and control. No question is ever presented to a driver in motion.",
      pageWidth - margin * 2,
    );
    doc.text(intro, margin, y);
    y += intro.length * 5 + 6;

    autoTable(doc, {
      startY: y,
      head: [["Delivery mode", "How it works"]],
      body: theoryModes.map((m) => [m.title, m.body]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    y = header("Integrity controls", y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    theoryControls.forEach((c) => {
      const lines = doc.splitTextToSize(`• ${c}`, pageWidth - margin * 2 - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    });
    y += 6;

    y = header("Scope, savings and open questions", y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const closing = doc.splitTextToSize(
      "It would replace the booked classroom sitting of the theory component. It does not replace the " +
        "Department's authority to set, mark or certify the standard — the platform submits an evidence pack and " +
        "the Department issues the outcome. Expected effects: fewer station visits, fewer no-shows and " +
        "re-bookings, less testing-centre congestion, and reach into areas far from a testing centre. " +
        "Open questions: " +
        theoryOpenQuestions.join(" "),
      pageWidth - margin * 2,
    );
    doc.text(closing, margin, y);

    doc.addPage();
    y = 20;
    y = header("10. MENTOR AND VEHICLE ACCESS", y);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const mIntro = doc.splitTextToSize(
      "Supervised-hour models assume the candidate has access to a car and a licensed supervisor. Most " +
        "candidates in the target areas have neither. The pilot therefore accredits owner-mentors who rent out " +
        "supervised hours — mentor time together with a compliant vehicle — at a regulator-agreed tariff. This " +
        "creates a small-enterprise opportunity while keeping the evidence chain intact.",
      pageWidth - margin * 2,
    );
    doc.text(mIntro, margin, y);
    y += mIntro.length * 5 + 6;

    autoTable(doc, {
      startY: y,
      head: [["International precedent", "Practice"]],
      body: mentorPrecedents.map((p) => [p.place, p.body]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: y,
      head: [["Marketplace design", "Detail"]],
      body: mentorEconomics.map((m) => [m.k, m.v]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    y = header("Mentor accreditation criteria", y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    mentorAccreditation.forEach((c) => {
      const lines = doc.splitTextToSize(`• ${c}`, pageWidth - margin * 2 - 4);
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    });

    doc.addPage();
    y = 20;
    y = header("11. RISKS AND MITIGATION", y);


    autoTable(doc, {
      startY: y,
      head: [["Risk", "Mitigation"]],
      body: risks.map((x) => [x.r, x.m]),
      theme: "striped",
      headStyles: { fillColor: [185, 28, 28] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 45 } },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const disclaimer = doc.splitTextToSize(
      "DISCLAIMER: This document is an unsolicited concept proposal prepared for discussion with the Department of Transport. " +
        "It does not represent an existing programme, an approved pilot, or any endorsement by the Department of Transport, the RTMC, or any other authority. " +
        "No driving licence, learner's licence, permit or exemption is issued, implied or replaced by the platform described. " +
        "All driver data shown in the accompanying materials is illustrative. Any implementation would require prior legislative and regulatory authorisation.",
      pageWidth - margin * 2,
    );
    doc.text(disclaimer, margin, y);

    doc.save(`Road_Competency_Pilot_DOT_Concept_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-6 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/dot-presentation">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to DOT Presentation
            </Link>
          </Button>
          <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
            <GraduationCap className="h-3 w-3 mr-1" /> Concept Proposal — Not an Approved Programme
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight max-w-4xl">
            Turning Kilometres Already Driven Into Verified Competency
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-3xl mb-8">
            A proposal to the Department of Transport: let drivers who currently operate without a licence
            enrol in a supervised, monitored pilot where GPS, biometrics and dashcam evidence build an
            auditable competency record — and route them back into the formal licensing process.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" onClick={generatePDF}>
              <FileDown className="mr-2 h-4 w-4" /> Download Concept Proposal (PDF)
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/dot-presentation">View Full DOT Presentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Legal posture */}
      <section className="px-4 pt-10">
        <div className="max-w-6xl mx-auto">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Status of this document</AlertTitle>
            <AlertDescription>
              This is an unsolicited concept for discussion. It is <strong>not</strong> an approved pilot and carries no
              endorsement from the Department of Transport, the RTMC, or any other authority. No licence, permit or
              exemption is issued or replaced by this platform. Any implementation would require prior legislative and
              regulatory authorisation. Driver data shown below is illustrative only.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Problem */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">The Problem</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Obtaining a licence in South Africa is slow, costly and access-constrained. Many drivers begin
            operating before they are licensed — and that behaviour is entirely invisible to the regulator.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {problemPoints.map((p) => (
              <Card key={p.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Proposal */}
      <section className="py-14 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">The Proposed Pilot</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            A limited, DOT-sanctioned amnesty cohort. Drivers enrol voluntarily, authenticate biometrically,
            and operate under supervised-pilot conditions while their real driving builds a competency record
            the regulator can audit.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {phases.map((p) => (
              <Card key={p.n}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {p.n}
                    </div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">How the Technology Works</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Nothing here needs to be invented. These capabilities are already operating in the platform today.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {techStack.map((t) => (
              <Card key={t.title}>
                <CardHeader className="pb-2">
                  <t.icon className="h-7 w-7 text-primary mb-2" />
                  <CardTitle className="text-base">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mock dashboard */}
      <section className="py-14 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">What the Regulator Would See</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            An illustrative competency record for a single enrolled driver. All values below are mock data
            used to demonstrate the concept.
          </p>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{mockDriver.name}</CardTitle>
                  <CardDescription>Supervised pilot cohort — Eersterust</CardDescription>
                </div>
                <Badge variant="secondary">{mockDriver.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Supervised hours accrued</span>
                  <span className="text-muted-foreground">{mockDriver.hours} / {mockDriver.target} hrs</span>
                </div>
                <Progress value={(mockDriver.hours / mockDriver.target) * 100} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Distance logged</p>
                  <p className="text-2xl font-bold">{mockDriver.km.toLocaleString("en-ZA")} km</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Flagged events</p>
                  <p className="text-2xl font-bold">{mockDriver.events}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Identity binding</p>
                  <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                    <Fingerprint className="h-4 w-4 text-primary" /> Biometric verified
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Mentor sign-off</p>
                  <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {mockDriver.mentor}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Most recent flagged event: {mockDriver.lastEvent}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cost saving */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
            <TrendingDown className="h-7 w-7 text-primary" /> Where the Cost Saving Comes From
          </h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Directional, not audited. Each line identifies an existing public cost driver and how continuous,
            machine-generated evidence would reduce it. Actual figures would be measured during the pilot.
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-4 text-left font-semibold">Area</th>
                      <th className="p-4 text-left font-semibold">Current cost driver</th>
                      <th className="p-4 text-left font-semibold">Effect of the pilot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costSavings.map(([a, b, c], i) => (
                      <tr key={a} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="p-4 font-medium">{a}</td>
                        <td className="p-4 text-muted-foreground">{b}</td>
                        <td className="p-4">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-14 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Stakeholder Map
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Who Benefits</CardTitle>
                <CardDescription>Groups with a direct gain from the pilot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {beneficiaries.map((b) => (
                  <div key={b.who} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{b.who}</p>
                      <p className="text-sm text-muted-foreground">{b.how}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg">Roles That Change or Become Redundant</CardTitle>
                <CardDescription>
                  Named honestly, with a proposed future function where one genuinely exists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displaced.map((d) => (
                  <div key={d.who} className="rounded-lg border p-4">
                    <p className="font-medium text-sm mb-1">{d.who}</p>
                    <p className="text-sm text-muted-foreground">{d.role}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* National vision */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <Globe className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Phase 2 — A National Competency Layer</CardTitle>
              <CardDescription>Direction of travel, contingent on pilot outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Because every record is anchored to a <strong>biometric login</strong> rather than a phone
                number or a plastic card, the same mechanism could later be extended to the entire South
                African driving population — not only the unlicensed cohort.
              </p>
              <p>
                Any driver could opt in to maintain a verified competency and behaviour record. That would
                give the regulator a live national picture of road behaviour, and give drivers a portable,
                tamper-resistant record of their own conduct that no third party can forge on their behalf.
              </p>
              <p className="text-muted-foreground">
                This depends entirely on the pilot first producing measurable safety outcomes, and on a
                legislative framework that does not yet exist. It is stated here as ambition, not as a plan
                awaiting approval.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rethinking the Written Test */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <Badge variant="secondary" className="mb-3">Concept for DOT consideration</Badge>
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-primary" /> Rethinking the Written Test: In-Vehicle Theory Assessment
          </h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            The learner's written test currently forces a booking, a queue and a trip to a testing station.
            Slots are scarce, and every re-booking multiplies cost for the candidate and for the state. We put
            forward — for the Department's consideration, not as an approved method — a way to deliver the
            theory component in the real driving environment, so that one supervised programme evidences both
            knowledge and control: a "double physical" assessment.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {theoryModes.map((m) => (
              <Card key={m.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{m.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Integrity controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {theoryControls.map((c) => (
                    <li key={c} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" /> Savings and access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Fewer station visits per candidate, fewer no-shows, and fewer re-bookings — which in turn
                  eases congestion at testing centres for the applicants who must still attend in person.
                </p>
                <p>
                  It also reaches candidates who live far from a testing centre, where the trip itself, not the
                  test, is the real barrier.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">What this replaces — and what it does not</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                It would replace the booked classroom sitting of the theory component with a distributed,
                supervised equivalent.
              </p>
              <p>
                It does not replace the Department's authority to set, mark or certify the standard. The
                platform submits an evidence pack; the Department issues the outcome.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Open questions we cannot answer alone</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                {theoryOpenQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Prior Art & IP Position */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <Scale className="h-7 w-7 text-primary" /> Prior Art and IP Position
          </h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Telematics-based driver assessment is well documented in patent literature. We have reviewed the
            closest references and state our position openly: this pilot claims no exclusivity over the
            underlying techniques.
          </p>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {priorArt.map((p) => (
              <Card key={p.ref}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.ref}</CardTitle>
                  <CardDescription>{p.owner}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{p.scope}</p>
                  <p className="text-sm">{p.posture}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No proprietary lock-in</AlertTitle>
            <AlertDescription>
              No exclusivity is claimed over telematics-based driver training or competency assessment. The
              techniques used here are widely published and freely practised. The value of this pilot lies in
              the regulatory framework and operational delivery, not in patent protection — the Department of
              Transport would not be locked into a single supplier.
            </AlertDescription>
          </Alert>
        </div>
      </section>



      {/* Risks */}
      <section className="py-14 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Risks and Mitigation</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {risks.map((x) => (
              <Card key={x.r}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> {x.r}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{x.m}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">A Pilot, Not a Proposal to Deregulate</h2>
          <p className="text-muted-foreground mb-8">
            We are not asking to issue licences. We are asking the Department of Transport to define the
            conditions under which real driving data could count as evidence of competence — and to observe
            a small, measurable cohort while it does.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" onClick={generatePDF}>
              <FileDown className="mr-2 h-4 w-4" /> Download Concept Proposal
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dot-presentation">Back to DOT Presentation</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/compliance">Compliance Hub</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground space-y-3">
          <p className="max-w-3xl mx-auto">
            Concept proposal only. Not affiliated with, endorsed by, or approved by the Department of
            Transport, the RTMC, or any licensing authority. No licence, learner's licence, permit or
            exemption is issued or replaced. All driver data shown is illustrative.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/dot-presentation" className="hover:text-primary">DOT Presentation</Link>
            <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DOTRoadCompetencyPilot;
