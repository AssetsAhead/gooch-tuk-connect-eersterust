import { useEffect } from "react";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { ReportShareDialog } from "@/components/reports/ReportShareDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CostBreakdown = () => {
  const navigate = useNavigate();
  const {
    generatePdfReport,
    downloadPdf,
    printReport,
    shareViaWhatsApp,
    shareViaEmail,
    shareViaSms,
    showShareDialog,
    closeShareDialog,
    currentReportTitle,
    pdfBlob,
    pdfDataUrl,
    isGenerating,
  } = useReportGeneration();

  useEffect(() => {
    generatePdfReport({
      title: "MojaRide / Poortlink — Anticipated Cost Breakdown",
      subtitle: "DOT Registration → API Integration → Local Sign-Up Campaign",
      companyName: "Poortlink (Pty) Ltd — CIPC 2025/958631/07",
      companyRef: "Confidential — For Internal & Security Partner Review",
      headerColor: [22, 78, 99],
      footer: "CONFIDENTIAL — Poortlink (Pty) Ltd",
      sections: [
        {
          title: "1. DOT E-Hailing Registration & Compliance",
          content:
            "Mandatory costs to obtain and maintain an e-hailing service license under the National Land Transport Amendment Act 23 of 2023.",
          table: {
            headers: ["Item", "Est. Cost (ZAR)", "Frequency", "Notes"],
            rows: [
              ["DOT Application Fee (Form 9A)", "R 2,500", "Once-off", "Payable to DOT via ABSA 4053620095"],
              ["NPTR Gazette Publication", "R 1,800", "Once-off", "Government gazette notice period"],
              ["ICASA Equipment Certificate", "R 3,500", "Annual", "Required for all platform radio/comms equipment"],
              ["Legal Review & Submission Prep", "R 8,000", "Once-off", "Attorney review of application pack"],
              ["CIPC Annual Return", "R 450", "Annual", "Company registration maintenance"],
              ["SARS Tax Clearance (renewal)", "R 0", "Annual", "Free but admin effort — PIN 9065004328"],
              ["Provincial Regulatory Entity Fee", "R 1,500", "Annual", "Gauteng PRE registration"],
              ["SANTACO Association Fee", "R 2,400", "Annual", "Industry association membership"],
              ["POPIA Compliance Audit", "R 5,000", "Annual", "Information Regulator compliance"],
              ["Insurance — Public Liability (platform)", "R 12,000", "Annual", "Min R5M cover for e-hailing platform"],
            ],
          },
        },
        {
          title: "2. Technology & API Integration",
          content:
            "Development and integration costs for core platform functionality — maps, payments, messaging, and real-time tracking.",
          table: {
            headers: ["Item", "Est. Cost (ZAR)", "Frequency", "Notes"],
            rows: [
              ["Google Maps Platform API", "R 3,500/mo", "Monthly", "Geocoding, directions, distance matrix"],
              ["Supabase Pro (Backend/DB)", "R 500/mo", "Monthly", "Auth, Realtime, Storage, Edge Functions"],
              ["Twilio SMS/WhatsApp API", "R 1,500/mo", "Monthly", "OTP, ride notifications, alerts"],
              ["Yoco Payment Gateway", "2.6% + R0.30/txn", "Per transaction", "No monthly fee — commission-based"],
              ["Domain & SSL (tukconnect.lovable.app)", "R 600", "Annual", "Custom domain + certificate"],
              ["Lovable Platform (Pro)", "R 400/mo", "Monthly", "Development & hosting"],
              ["Push Notification Service", "R 0–R800/mo", "Monthly", "Firebase FCM (free tier) or OneSignal"],
              ["AI Incident Detection (OpenAI)", "R 800/mo", "Monthly", "Dashcam frame analysis"],
              ["ALPR Integration", "R 1,200/mo", "Monthly", "License plate recognition API"],
              ["Dev/Maintenance Retainer", "R 5,000/mo", "Monthly", "Bug fixes, feature updates, support"],
            ],
          },
        },
        {
          title: "3. Vehicle Kitting — Hardware Per Vehicle",
          content:
            "Cost to retrofit existing tuk-tuks/vehicles with tracking, safety, and compliance hardware. Prices are estimates for bulk procurement (10+ units).",
          table: {
            headers: ["Item", "Est. Cost (ZAR)", "Per", "Notes"],
            rows: [
              ["GPS Tracker (4G LTE)", "R 1,800", "Per vehicle", "Real-time location, geofencing"],
              ["Dual Dashcam (front + cabin)", "R 3,500", "Per vehicle", "1080p, night vision, SD storage"],
              ["Biometric Scanner (fingerprint)", "R 2,200", "Per vehicle", "Driver identity verification"],
              ["Panic Button (hardwired)", "R 450", "Per vehicle", "Direct alert to control room"],
              ["SIM Card + Data Plan", "R 150/mo", "Per vehicle/mo", "Telkom/Vodacom IoT plan"],
              ["Installation Labour", "R 1,500", "Per vehicle", "Qualified auto-electrician"],
              ["Wiring Harness & Mounts", "R 600", "Per vehicle", "Brackets, cables, fuses"],
              ["QR Code Plate (passenger info)", "R 80", "Per vehicle", "Links to driver profile & rating"],
              ["Reflective Safety Decals", "R 350", "Per vehicle", "DOT-compliant branding"],
            ],
          },
        },
        {
          title: "4. Vehicle Kitting — Fleet Summary",
          content:
            "Total hardware cost projections at different fleet sizes.",
          table: {
            headers: ["Fleet Size", "Hardware/Vehicle", "Total Hardware", "Monthly Data", "Total Year 1"],
            rows: [
              ["5 vehicles", "R 10,480", "R 52,400", "R 750/mo", "R 61,400"],
              ["10 vehicles", "R 10,480", "R 104,800", "R 1,500/mo", "R 122,800"],
              ["15 vehicles", "R 10,480", "R 157,200", "R 2,250/mo", "R 184,200"],
              ["25 vehicles", "R 10,480", "R 262,000", "R 3,750/mo", "R 307,000"],
            ],
          },
        },
        {
          title: "5. Security Agency Partnership Costs",
          content:
            "Estimated costs if partnering with a private security company (e.g., ADT, Fidelity, or local provider) for driver/passenger safety response.",
          table: {
            headers: ["Item", "Est. Cost (ZAR)", "Frequency", "Notes"],
            rows: [
              ["Armed Response Subscription", "R 350–R650/vehicle", "Monthly", "Per-vehicle panic response"],
              ["Control Room Integration (API)", "R 8,000–R15,000", "Once-off", "Connect panic button to their system"],
              ["Monthly Monitoring Fee", "R 200/vehicle", "Monthly", "24/7 GPS monitoring & alerts"],
              ["Branded Security Decals", "R 250/vehicle", "Once-off", "Visible deterrent on vehicles"],
              ["Guard Deployment (events/launches)", "R 1,200/guard/day", "Ad hoc", "For launch events, rank presence"],
              ["Incident Report Integration", "R 3,000", "Once-off", "API feed from security provider"],
              ["Background Checks (drivers)", "R 350/driver", "Once-off", "Criminal record & reference check"],
            ],
          },
        },
        {
          title: "6. Security — Fleet Cost Summary",
          content: "Annual security costs at different fleet sizes (mid-range estimates).",
          table: {
            headers: ["Fleet Size", "Armed Response/yr", "Monitoring/yr", "Setup (once-off)", "Year 1 Total"],
            rows: [
              ["5 vehicles", "R 30,000", "R 12,000", "R 12,250", "R 54,250"],
              ["10 vehicles", "R 60,000", "R 24,000", "R 14,500", "R 98,500"],
              ["15 vehicles", "R 90,000", "R 36,000", "R 16,750", "R 142,750"],
              ["25 vehicles", "R 150,000", "R 60,000", "R 21,250", "R 231,250"],
            ],
          },
        },
        {
          title: "7. Local Sign-Up Campaign & Marketing",
          content:
            "Budget for recruiting vehicle owners, drivers, and passengers in the Eersterust–Mamelodi corridor.",
          table: {
            headers: ["Item", "Est. Cost (ZAR)", "Frequency", "Notes"],
            rows: [
              ["Printed Flyers (1,000 units)", "R 1,200", "Per batch", "A5 double-sided, full colour"],
              ["Rank Banners (pull-up)", "R 800", "Per banner", "2–3 at key taxi ranks"],
              ["WhatsApp Broadcast Campaign", "R 500/mo", "Monthly", "Twilio bulk messaging"],
              ["Community Meeting Venue Hire", "R 1,500", "Per event", "Church hall / community centre"],
              ["Refreshments (sign-up events)", "R 800", "Per event", "Tea, snacks for 30–50 people"],
              ["Branded T-shirts (50 units)", "R 3,500", "Once-off", "Ambassadors & launch team"],
              ["Facebook/Meta Ads (local geo)", "R 2,000/mo", "Monthly", "Targeted Eersterust/Mamelodi"],
              ["Street Team (3 people, 5 days)", "R 4,500", "Per campaign", "R300/person/day stipend"],
              ["Vehicle Branding (wraps)", "R 2,500/vehicle", "Once-off", "Partial wrap, logo + QR code"],
            ],
          },
        },
        {
          title: "8. Grand Total — Year 1 Estimates",
          content:
            "Combined cost projections for a 10-vehicle pilot fleet in Year 1.",
          table: {
            headers: ["Category", "Once-off", "Monthly Recurring", "Year 1 Total"],
            rows: [
              ["DOT & Compliance", "R 12,300", "R 0", "R 33,150"],
              ["Technology & APIs", "R 600", "R 13,700", "R 165,000"],
              ["Vehicle Kitting (10 vehicles)", "R 104,800", "R 1,500", "R 122,800"],
              ["Security Agency (10 vehicles)", "R 14,500", "R 7,000", "R 98,500"],
              ["Marketing & Sign-Up Campaign", "R 10,100", "R 2,500", "R 40,100"],
              ["", "", "", ""],
              ["GRAND TOTAL (10 vehicles)", "R 142,300", "R 24,700", "R 459,550"],
            ],
          },
        },
        {
          title: "9. Key Assumptions & Notes",
          list: [
            "All prices in South African Rand (ZAR), excl. VAT unless stated.",
            "Hardware prices based on bulk procurement quotes (10+ units) — individual units ~15% higher.",
            "Security costs assume mid-range provider; premium providers (ADT, Fidelity) may be 20–40% higher.",
            "Technology costs assume moderate usage; high-volume months may increase API costs.",
            "Marketing budget is for initial 3-month launch phase — ongoing costs may reduce.",
            "Yoco transaction fees are revenue-dependent and excluded from fixed cost totals.",
            "Driver background checks (R350 each) should be recovered via driver onboarding fee.",
            "Monthly data SIM costs may reduce with Telkom IoT bulk agreements.",
            "Year 1 total includes 12 months of recurring costs + all once-off items.",
            "DOT application timeline: 3–6 months from submission to certificate issuance.",
          ],
        },
      ],
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Cost Breakdown — DOT Route</h1>
        <p className="text-muted-foreground mt-1">
          Your PDF has been generated. Use the dialog to download, print, or share.
        </p>
        {!showShareDialog && pdfBlob && (
          <Button className="mt-4" onClick={() => downloadPdf("MojaRide_Cost_Breakdown_2025.pdf")}>
            Download PDF
          </Button>
        )}
      </div>

      <ReportShareDialog
        open={showShareDialog}
        onOpenChange={(open) => { if (!open) closeShareDialog(); }}
        title={currentReportTitle}
        pdfDataUrl={pdfDataUrl}
        onDownload={() => downloadPdf("MojaRide_Cost_Breakdown_2025.pdf")}
        onPrint={printReport}
        onShareWhatsApp={(summary) => shareViaWhatsApp(summary)}
        onShareEmail={(subject, body) => shareViaEmail(subject, body)}
        onShareSms={(summary) => shareViaSms(summary)}
        reportSummary="MojaRide Cost Breakdown: Year 1 estimate for 10-vehicle pilot = ~R459,550. Includes DOT registration, tech, vehicle kitting, security agency, and marketing."
        emailSubject="MojaRide — Anticipated Cost Breakdown (DOT Route)"
        emailBody="Please find attached the anticipated cost breakdown for the MojaRide DOT registration route.\n\nYear 1 Total (10 vehicles): ~R459,550\n\nCategories: DOT Compliance, Technology/APIs, Vehicle Kitting, Security Agency, Marketing."
        filename="MojaRide_Cost_Breakdown_2025.pdf"
      />
    </div>
  );
};

export default CostBreakdown;
