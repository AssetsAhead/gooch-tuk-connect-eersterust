import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Building2, Calculator, FileText, Download, Shield, Info } from "lucide-react";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { ReportShareDialog } from "@/components/reports/ReportShareDialog";

/* ---------------- Franchise tiers ---------------- */

const tiers = [
  {
    id: "association",
    name: "Tier 1 — Association Licence",
    who: "A single taxi association or rank",
    scope: "One association, up to ~250 vehicles",
    fee: "R89 per vehicle / month",
    setup: "R0 upfront",
    share: "5% of digital fare value",
    includes: [
      "Vehicle & driver register (NLTA-aligned)",
      "GPS loading-zone queue management",
      "Marshal clock-in and trip logging",
      "Monthly NDOT compliance report",
    ],
    notes: "Association keeps its own brand. 30-day exit, no lock-in.",
  },
  {
    id: "provincial",
    name: "Tier 2 — Provincial Franchise",
    who: "Provincial operator or PRE-appointed partner",
    scope: "Province-wide, multi-association",
    fee: "R69 per vehicle / month (volume)",
    setup: "R150,000 franchise onboarding",
    share: "8% platform revenue share to PoortLink",
    includes: [
      "Everything in Tier 1",
      "Provincial oversight console + multi-association roll-up",
      "Incident, infringement and dashcam evidence workflow",
      "PRE / provincial reporting pack",
      "Local support team accreditation & training",
    ],
    notes: "Franchisee holds territory, PoortLink holds the platform and IP.",
  },
  {
    id: "national",
    name: "Tier 3 — National Platform Contract",
    who: "NDOT as primary client",
    scope: "National umbrella across provinces",
    fee: "R49 per vehicle / month (state-negotiated)",
    setup: "Contracted implementation programme",
    share: "Fixed platform licence + per-vehicle fee",
    includes: [
      "Everything in Tier 2",
      "National data layer: vehicles, licences, permits, infringements",
      "Policy dashboards and standardised monthly national reporting",
      "Open reporting API into departmental systems",
      "Audit trail and POPIA-compliant data governance",
    ],
    notes: "One replicable model, not one pilot. Department sets the standard, platform enforces it.",
  },
];

/* ---------------- Calculator ---------------- */

const PER_VEHICLE = { association: 89, provincial: 69, national: 49 } as const;
const SETUP = { association: 0, provincial: 150000, national: 0 } as const;
const SHARE = { association: 0.05, provincial: 0.08, national: 0.0 } as const;

const HARDWARE_LEASE = 349; // per vehicle / month — 4G dashcam + GPS, 36-month lease
const SUPPORT_PER_100 = 1800; // local support & training per 100 vehicles / month

type TierId = keyof typeof PER_VEHICLE;

const rand = () => Math.random();

const FranchiseOptions = () => {
  const [tier, setTier] = useState<TierId>("association");
  const [vehicles, setVehicles] = useState(120);
  const [tripsPerDay, setTripsPerDay] = useState(40);
  const [fare, setFare] = useState(15);
  const [digitalShare, setDigitalShare] = useState(35); // % of fares paid digitally
  const [hardware, setHardware] = useState(true);
  const [support, setSupport] = useState(true);

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
    pdfDataUrl,
  } = useReportGeneration();

  const [filename, setFilename] = useState("PoortLink_Franchise_Options_Menu.pdf");

  const calc = useMemo(() => {
    const licence = vehicles * PER_VEHICLE[tier];
    const lease = hardware ? vehicles * HARDWARE_LEASE : 0;
    const supportCost = support ? Math.ceil(vehicles / 100) * SUPPORT_PER_100 : 0;
    const grossFares = vehicles * tripsPerDay * fare * 26; // 26 operating days
    const digitalFares = grossFares * (digitalShare / 100);
    const revShare = digitalFares * SHARE[tier];
    const monthly = licence + lease + supportCost + revShare;
    return {
      licence,
      lease,
      supportCost,
      grossFares,
      digitalFares,
      revShare,
      monthly,
      perVehicle: vehicles > 0 ? monthly / vehicles : 0,
      setup: SETUP[tier],
      annual: monthly * 12 + SETUP[tier],
    };
  }, [tier, vehicles, tripsPerDay, fare, digitalShare, hardware, support]);

  const money = (n: number) => `R ${Math.round(n).toLocaleString("en-ZA")}`;

  /* ---------------- Sample NDOT monthly report data ---------------- */

  const sample = useMemo(() => {
    const trips = vehicles * tripsPerDay * 26;
    const digitalTrips = Math.round(trips * (digitalShare / 100));
    const infringements = Math.round(vehicles * 0.42);
    return {
      trips,
      digitalTrips,
      cashTrips: trips - digitalTrips,
      activeDrivers: Math.round(vehicles * 1.6),
      clockings: Math.round(vehicles * 1.6 * 24),
      zoneDispatches: Math.round(trips * 0.72),
      infringements,
      severity: {
        minor: Math.round(infringements * 0.55),
        moderate: Math.round(infringements * 0.25),
        serious: Math.round(infringements * 0.15),
        major: Math.max(0, infringements - Math.round(infringements * 0.95)),
      },
      panics: Math.max(1, Math.round(vehicles * 0.03)),
      avgResponse: 6.4,
      complianceScore: 91.3,
    };
  }, [vehicles, tripsPerDay, digitalShare]);

  /* ---------------- PDF generators ---------------- */

  const generateMenu = () => {
    setFilename("PoortLink_Franchise_Options_Menu.pdf");
    generatePdfReport({
      title: "Franchise Options Menu",
      subtitle: "Licensing structures for a national vehicle-management umbrella",
      companyName: "PoortLink (Pty) Ltd — operating MojaRide / TukConnect",
      companyRef: "Appendix to NDOT / DOT presentation",
      headerColor: [22, 78, 99],
      footer: "CONFIDENTIAL — PoortLink (Pty) Ltd",
      sections: [
        {
          title: "Purpose",
          content:
            "This menu sets out three replicable licensing structures through which the platform can be deployed: a single association licence, a provincial franchise, and a national platform contract. Each structure delivers the same compliance layer — vehicle and driver register, GPS queue management, incident evidence, and standardised monthly reporting — at a different scale of governance.",
        },
        {
          title: "Option Comparison",
          table: {
            headers: ["Structure", "Client", "Scope", "Per vehicle / month", "Onboarding", "Revenue share"],
            rows: tiers.map((t) => [t.name, t.who, t.scope, t.fee, t.setup, t.share]),
          },
        },
        ...tiers.map((t) => ({
          title: t.name,
          content: `${t.who}. ${t.scope}. ${t.notes}`,
          list: t.includes,
        })),
        {
          title: "Worked Example (from the calculator)",
          table: {
            headers: ["Line", "Value"],
            rows: [
              ["Selected structure", tiers.find((t) => t.id === tier)?.name ?? ""],
              ["Vehicles under management", String(vehicles)],
              ["Platform licence fees", money(calc.licence) + " / month"],
              ["Hardware lease (4G dashcam + GPS)", hardware ? money(calc.lease) + " / month" : "Not included"],
              ["Local support & training", support ? money(calc.supportCost) + " / month" : "Not included"],
              ["Digital fare revenue share", money(calc.revShare) + " / month"],
              ["Total monthly", money(calc.monthly)],
              ["Effective cost per vehicle", money(calc.perVehicle) + " / month"],
              ["Once-off onboarding", money(calc.setup)],
              ["Year 1 total", money(calc.annual)],
            ],
          },
        },
        {
          title: "What the Department Receives",
          list: [
            "A single standard applied identically across every licensed association",
            "Monthly compliance reporting in one format, machine-readable and auditable",
            "Verifiable evidence trail for infringements and incidents (GPS, dashcam, timestamps)",
            "POPIA-compliant data governance with role-scoped access",
            "A replicable model that can be extended province by province without rebuilding",
          ],
        },
        {
          title: "Basis of Figures",
          content:
            "Fee levels are indicative and subject to contract. Fare assumptions used in worked examples are deliberately conservative (40 trips per vehicle per day, R15 average fare, 26 operating days). Hardware lease is based on a 36-month 4G dashcam and GPS unit lease at R349 per vehicle per month.",
        },
      ],
    });
  };

  const generateTemplate = () => {
    setFilename("NDOT_Compliance_Reporting_Template.pdf");
    generatePdfReport({
      title: "NDOT Monthly Compliance Reporting Template",
      subtitle: "Blank reporting structure for licensed operators and associations",
      companyName: "PoortLink (Pty) Ltd",
      companyRef: "Reporting Template v1",
      headerColor: [22, 78, 99],
      footer: "Reporting Template — PoortLink (Pty) Ltd",
      sections: [
        {
          title: "1. Operator Particulars",
          table: {
            headers: ["Field", "Entry"],
            rows: [
              ["Association / operator name", ""],
              ["Operating licence number", ""],
              ["Reporting period (from / to)", ""],
              ["Loading zones covered", ""],
              ["Responsible person & contact", ""],
            ],
          },
        },
        {
          title: "2. Fleet & Driver Register",
          table: {
            headers: ["Metric", "Count", "Source"],
            rows: [
              ["Vehicles registered", "", "vehicles"],
              ["Vehicles active in period", "", "vehicles"],
              ["Drivers registered", "", "drivers"],
              ["Driver clock-ins recorded", "", "driver_clockings"],
              ["Vehicles with valid roadworthy", "", "vehicle documents"],
            ],
          },
        },
        {
          title: "3. Trip & Queue Activity",
          table: {
            headers: ["Metric", "Count", "Source"],
            rows: [
              ["Total trips logged", "", "trips"],
              ["Digital-payment trips", "", "payments"],
              ["Cash trips (marshal-logged)", "", "marshal trip log"],
              ["Zone dispatches", "", "zone_queue"],
              ["Average queue wait (minutes)", "", "zone_queue"],
            ],
          },
        },
        {
          title: "4. Safety, Incidents & Infringements",
          table: {
            headers: ["Metric", "Count", "Evidence held"],
            rows: [
              ["Infringements recorded", "", "GPS + dashcam clip"],
              ["— minor / moderate / serious / major", "", ""],
              ["Panic activations", "", "GPS + audio"],
              ["Average response time (minutes)", "", "incident log"],
              ["Repeat offenders (3+ in period)", "", "infringement history"],
            ],
          },
        },
        {
          title: "5. Declaration",
          content:
            "I certify that the information in this return is drawn from the platform's recorded operational data for the stated period and is accurate to the best of my knowledge. Signed: ____________________  Date: ____________  Capacity: ____________",
        },
        {
          title: "Submission Notes",
          list: [
            "Submit within 10 working days of month-end",
            "Attach the platform-generated data export for the same period",
            "Retain underlying evidence (GPS logs, dashcam clips) for the statutory retention period",
            "Report exceptions and nil-returns explicitly rather than omitting sections",
          ],
        },
      ],
    });
  };

  const generateSample = () => {
    setFilename("NDOT_Sample_Monthly_Report.pdf");
    const period = new Date();
    const label = period.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    generatePdfReport({
      title: "Sample NDOT Monthly Compliance Report",
      subtitle: `Illustrative return for ${label} — Eersterust loading zones`,
      companyName: "PoortLink (Pty) Ltd — MojaRide platform",
      companyRef: "SAMPLE — populated from platform data structures",
      headerColor: [22, 78, 99],
      footer: "SAMPLE REPORT — PoortLink (Pty) Ltd",
      sections: [
        {
          title: "Executive Summary",
          content: `During ${label} the platform monitored ${vehicles} vehicles and ${sample.activeDrivers} drivers across the reporting area. ${sample.trips.toLocaleString("en-ZA")} trips were logged, of which ${sample.digitalTrips.toLocaleString("en-ZA")} were digitally paid and ${sample.cashTrips.toLocaleString("en-ZA")} were marshal-logged cash trips. ${sample.infringements} infringements were recorded with supporting evidence. Fleet compliance score: ${sample.complianceScore}%.`,
        },
        {
          title: "1. Fleet & Driver Register",
          table: {
            headers: ["Metric", "Value"],
            rows: [
              ["Vehicles under management", String(vehicles)],
              ["Drivers registered", String(sample.activeDrivers)],
              ["Biometric clock-ins recorded", sample.clockings.toLocaleString("en-ZA")],
              ["Vehicles with active tracking unit", String(vehicles)],
            ],
          },
        },
        {
          title: "2. Trip & Queue Activity",
          table: {
            headers: ["Metric", "Value"],
            rows: [
              ["Total trips logged", sample.trips.toLocaleString("en-ZA")],
              ["Digital-payment trips", sample.digitalTrips.toLocaleString("en-ZA")],
              ["Cash trips (marshal-logged)", sample.cashTrips.toLocaleString("en-ZA")],
              ["Zone dispatches", sample.zoneDispatches.toLocaleString("en-ZA")],
              ["Average queue wait", "11.2 minutes"],
            ],
          },
        },
        {
          title: "3. Safety, Incidents & Infringements",
          table: {
            headers: ["Category", "Count"],
            rows: [
              ["Minor", String(sample.severity.minor)],
              ["Moderate", String(sample.severity.moderate)],
              ["Serious", String(sample.severity.serious)],
              ["Major", String(sample.severity.major)],
              ["Panic activations", String(sample.panics)],
              ["Average response time", `${sample.avgResponse} minutes`],
            ],
          },
        },
        {
          title: "4. Evidence & Audit Trail",
          list: [
            "Every infringement is linked to GPS coordinates, timestamp and a dashcam clip reference",
            "Every clock-in is bound to a verified driver identity",
            "Every cash trip carries the logging marshal's identity and zone",
            "All records are immutable once submitted and retained per POPIA policy",
          ],
        },
        {
          title: "5. Recommendations",
          list: [
            "Serious-category offenders to be scheduled for mandatory refresher training",
            "Continue marshal-gated queue discipline at peak periods",
            "Extend tracking coverage to remaining non-compliant vehicles before next return",
          ],
        },
        {
          title: "Disclaimer",
          content:
            "This is a sample report illustrating the reporting format and the data the platform collects. Figures are modelled on the platform's data structures and conservative operating assumptions, not on a completed reporting period.",
        },
      ],
    });
  };

  const downloadCsvTemplate = () => {
    const rows = [
      ["Section", "Metric", "Value", "Source table", "Evidence reference"],
      ["Operator", "Association / operator name", "", "-", ""],
      ["Operator", "Operating licence number", "", "-", ""],
      ["Operator", "Reporting period start", "", "-", ""],
      ["Operator", "Reporting period end", "", "-", ""],
      ["Fleet", "Vehicles registered", "", "vehicles", ""],
      ["Fleet", "Vehicles active in period", "", "vehicles", ""],
      ["Fleet", "Drivers registered", "", "drivers", ""],
      ["Fleet", "Driver clock-ins", "", "driver_clockings", ""],
      ["Trips", "Total trips logged", "", "trips", ""],
      ["Trips", "Digital-payment trips", "", "payments", ""],
      ["Trips", "Cash trips (marshal-logged)", "", "marshal trip log", ""],
      ["Queue", "Zone dispatches", "", "zone_queue", ""],
      ["Queue", "Average queue wait (minutes)", "", "zone_queue", ""],
      ["Safety", "Infringements - minor", "", "road_infringements", ""],
      ["Safety", "Infringements - moderate", "", "road_infringements", ""],
      ["Safety", "Infringements - serious", "", "road_infringements", ""],
      ["Safety", "Infringements - major", "", "road_infringements", ""],
      ["Safety", "Panic activations", "", "ai_incidents", ""],
      ["Safety", "Average response time (minutes)", "", "ai_incidents", ""],
      ["Declaration", "Signed by", "", "-", ""],
      ["Declaration", "Capacity", "", "-", ""],
      ["Declaration", "Date", "", "-", ""],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "NDOT_Monthly_Return_Template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTier = tiers.find((t) => t.id === tier)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-16 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/dot-presentation"><ArrowLeft className="mr-2 h-4 w-4" /> Back to DOT Presentation</Link>
          </Button>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Franchise Options Menu</h1>
              <p className="text-muted-foreground">
                Three licensing structures for a national vehicle-management umbrella — association, province, nation
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Appendix to NDOT presentation</Badge>
            <Badge variant="secondary">Indicative pricing — subject to contract</Badge>
            <Badge variant="secondary">One standard, replicable nationally</Badge>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* One-page menu */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">The one-page menu</CardTitle>
              <CardDescription>What can be licensed, to whom, and on what terms</CardDescription>
            </div>
            <Button onClick={generateMenu} className="shrink-0">
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((t) => (
                <div key={t.id} className="rounded-lg border p-4 bg-muted/20 flex flex-col gap-2">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.who}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Scope: </span>{t.scope}</p>
                  <p className="text-sm font-medium text-primary">{t.fee}</p>
                  <p className="text-xs text-muted-foreground">Onboarding: {t.setup}</p>
                  <p className="text-xs text-muted-foreground">Revenue share: {t.share}</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    {t.includes.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                  <p className="mt-auto pt-2 text-xs italic text-muted-foreground">{t.notes}</p>
                </div>
              ))}
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Every structure delivers the same compliance layer. What changes is who holds the territory and who
                receives the reporting — the standard itself stays identical, which is what makes it replicable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Licensing &amp; pricing calculator
            </CardTitle>
            <CardDescription>Per-vehicle fees, hardware lease and association tier, modelled live</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={tier} onValueChange={(v) => setTier(v as TierId)}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="association">Association</TabsTrigger>
                <TabsTrigger value="provincial">Provincial</TabsTrigger>
                <TabsTrigger value="national">National</TabsTrigger>
              </TabsList>
              <TabsContent value={tier} className="mt-4">
                <p className="text-sm text-muted-foreground">{activeTier.name} — {activeTier.scope}</p>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <Label className="flex justify-between text-sm">
                    <span>Vehicles under management</span><span className="font-semibold">{vehicles}</span>
                  </Label>
                  <Slider className="mt-2" min={10} max={2000} step={10} value={[vehicles]} onValueChange={([v]) => setVehicles(v)} />
                </div>
                <div>
                  <Label className="flex justify-between text-sm">
                    <span>Trips per vehicle per day</span><span className="font-semibold">{tripsPerDay}</span>
                  </Label>
                  <Slider className="mt-2" min={10} max={80} step={5} value={[tripsPerDay]} onValueChange={([v]) => setTripsPerDay(v)} />
                </div>
                <div>
                  <Label className="flex justify-between text-sm">
                    <span>Average fare</span><span className="font-semibold">R{fare}</span>
                  </Label>
                  <Slider className="mt-2" min={8} max={40} step={1} value={[fare]} onValueChange={([v]) => setFare(v)} />
                </div>
                <div>
                  <Label className="flex justify-between text-sm">
                    <span>Fares paid digitally</span><span className="font-semibold">{digitalShare}%</span>
                  </Label>
                  <Slider className="mt-2" min={0} max={100} step={5} value={[digitalShare]} onValueChange={([v]) => setDigitalShare(v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Hardware lease included</Label>
                    <p className="text-xs text-muted-foreground">4G dashcam + GPS unit, R{HARDWARE_LEASE}/vehicle/month</p>
                  </div>
                  <Switch checked={hardware} onCheckedChange={setHardware} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Local support &amp; training</Label>
                    <p className="text-xs text-muted-foreground">R{SUPPORT_PER_100.toLocaleString("en-ZA")} per 100 vehicles/month</p>
                  </div>
                  <Switch checked={support} onCheckedChange={setSupport} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Total monthly</p>
                  <p className="text-3xl font-bold text-foreground">{money(calc.monthly)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {money(calc.perVehicle)} effective per vehicle / month
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Line</TableHead>
                        <TableHead className="text-right">Monthly</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Platform licence ({vehicles} × R{PER_VEHICLE[tier]})</TableCell>
                        <TableCell className="text-right">{money(calc.licence)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hardware lease</TableCell>
                        <TableCell className="text-right">{hardware ? money(calc.lease) : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Support &amp; training</TableCell>
                        <TableCell className="text-right">{support ? money(calc.supportCost) : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Digital fare share ({(SHARE[tier] * 100).toFixed(0)}%)</TableCell>
                        <TableCell className="text-right">{money(calc.revShare)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Once-off onboarding</TableCell>
                        <TableCell className="text-right font-semibold">{money(calc.setup)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Year 1 total</TableCell>
                        <TableCell className="text-right font-semibold">{money(calc.annual)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Modelled gross fare value at this setting: {money(calc.grossFares)} per month, of which{" "}
                  {money(calc.digitalFares)} digital.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Compliance reporting pack
            </CardTitle>
            <CardDescription>
              A blank monthly return template and a worked sample built from the data the platform already collects
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold text-foreground">Monthly return template</p>
              <p className="text-sm text-muted-foreground">Blank PDF structure covering operator, fleet, trips, queue, safety and declaration.</p>
              <Button variant="outline" className="w-full" onClick={generateTemplate}>
                <FileText className="mr-2 h-4 w-4" /> Template PDF
              </Button>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold text-foreground">Data capture sheet</p>
              <p className="text-sm text-muted-foreground">CSV version of the same return, with the source of each field named.</p>
              <Button variant="outline" className="w-full" onClick={downloadCsvTemplate}>
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold text-foreground">Sample monthly report</p>
              <p className="text-sm text-muted-foreground">Illustrative return at your current calculator settings — clearly marked as a sample.</p>
              <Button className="w-full" onClick={generateSample}>
                <FileText className="mr-2 h-4 w-4" /> Sample PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Fee levels, revenue shares and lease rates on this page are indicative and subject to contract. Sample
            report figures are modelled on conservative operating assumptions, not on a completed reporting period.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" asChild>
            <Link to="/dot-presentation">DOT Presentation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dot-road-competency-pilot">Road Competency Pilot</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cost-breakdown">Cost Breakdown</Link>
          </Button>
        </div>
      </div>

      <ReportShareDialog
        open={showShareDialog}
        onOpenChange={(open) => { if (!open) closeShareDialog(); }}
        title={currentReportTitle}
        pdfDataUrl={pdfDataUrl}
        onDownload={() => downloadPdf(filename)}
        onPrint={printReport}
        onShareWhatsApp={(summary) => shareViaWhatsApp(summary)}
        onShareEmail={(subject, body) => shareViaEmail(subject, body)}
        onShareSms={(summary) => shareViaSms(summary)}
        reportSummary="PoortLink Franchise Options Menu — association licence, provincial franchise, or national platform contract, with per-vehicle fees and monthly NDOT compliance reporting."
        emailSubject="PoortLink — Franchise Options Menu (NDOT appendix)"
        emailBody="Attached: the Franchise Options Menu setting out association, provincial and national licensing structures, with indicative per-vehicle fees and the monthly compliance reporting format."
        filename={filename}
      />
    </div>
  );
};

export default FranchiseOptions;
