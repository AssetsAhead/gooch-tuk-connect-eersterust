import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Printer, ShieldCheck, Car, Users, Building2, HardHat, Cpu, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Layer {
  icon: typeof Car;
  title: string;
  product: string;
  whoSells: string;
  priority: "Essential" | "Required by law" | "Phase 2";
  insured: string[];
  notInsured: string[];
  docs: string[];
}

const LAYERS: Layer[] = [
  {
    icon: Car,
    title: "1. The vehicles",
    product: "Commercial vehicle / public passenger transport comprehensive",
    whoSells: "Any short-term commercial insurer or taxi-specific underwriter",
    priority: "Essential",
    insured: [
      "Own damage, theft, hijacking, fire",
      "Third-party property damage",
      "Towing, recovery and storage",
    ],
    notInsured: ["Anything to do with software or data"],
    docs: [
      "Vehicle schedule: make, model, year, VIN, registration, value",
      "Roadworthy certificates",
      "Where the vehicles sleep overnight (address and security)",
      "Tracking / dashcam device confirmation (this lowers the premium)",
    ],
  },
  {
    icon: Users,
    title: "2. The passengers",
    product: "Passenger liability (per seat) + passenger accident benefits",
    whoSells: "Same commercial insurer, added as an extension",
    priority: "Essential",
    insured: [
      "Injury or death of a fare-paying passenger",
      "Legal defence costs arising from a passenger claim",
      "Fixed benefits per seat (medical, disability, funeral)",
    ],
    notInsured: ["Claims where the driver had no valid licence or PrDP"],
    docs: [
      "Seats per vehicle and expected trips per day",
      "Operating area and routes",
      "Operating licence or the pilot/permit status",
    ],
  },
  {
    icon: Building2,
    title: "3. The operation",
    product: "Public / general liability",
    whoSells: "Commercial insurer or broker facility",
    priority: "Essential",
    insured: [
      "Injury or damage to the public at ranks and loading zones",
      "Claims from a municipality, landlord or host site",
      "Legal costs",
    ],
    notInsured: ["Deliberate acts, unlicensed operation"],
    docs: ["Loading zone addresses and any host agreements", "Marshal duties and numbers"],
  },
  {
    icon: HardHat,
    title: "4. The drivers as employees",
    product: "COIDA registration + employer's liability top-up",
    whoSells: "Department of Employment and Labour (COIDA), then insurer for the top-up",
    priority: "Required by law",
    insured: [
      "Driver injured or killed on duty",
      "Loss of earnings and medical costs",
      "Gap between the COIDA payout and the real claim",
    ],
    notInsured: ["Independent contractors, if that is how you engage them"],
    docs: ["Payroll or driver earnings schedule", "Employment or revenue-share contracts", "COIDA registration number"],
  },
  {
    icon: Cpu,
    title: "5. The platform (buy last, small)",
    product: "Cyber liability + professional indemnity, low limit",
    whoSells: "Specialist cyber underwriter through a broker",
    priority: "Phase 2",
    insured: [
      "A data breach of passenger or driver records",
      "Claims that the platform gave wrong information",
      "Notification and forensic costs",
    ],
    notInsured: ["Road accidents — those sit in layers 1 to 3"],
    docs: ["Privacy policy", "Who can see what data (access rules)", "Where data is hosted"],
  },
];

const SCRIPT_SAY = [
  "We are a passenger transport operator with a small fleet of vehicles in Eersterust, Pretoria.",
  "We need commercial vehicle cover, passenger liability per seat, and public liability.",
  "Every vehicle is fitted with GPS tracking and a camera, and every trip is logged.",
  "Drivers are verified, licensed and clock in and out by shift.",
  "We would like to be quoted layer by layer, starting with the vehicles.",
];

const SCRIPT_DONT = [
  "Do not open with \"I built an app\" — it sounds like a technology start-up, which most underwriters cannot rate.",
  "Do not ask for one policy covering everything — that request has no product behind it.",
  "Do not describe the platform as the thing being insured. It is the risk-control tool, like a tracker.",
  "Do not approach insurers directly. Use a commercial broker; they place the risk and carry the mandate.",
];

export const InsuranceBrokerBrief = () => {
  return (
    <div className="space-y-4 print:space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>How to break the cover down</CardTitle>
                <CardDescription>
                  Five separate, ordinary insurance products — not one unusual one. Quote them layer by layer.
                </CardDescription>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="print:hidden">
              <Printer className="h-4 w-4 mr-1" /> Print / save brief
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Why they walk away: "app" makes an underwriter think of a technology risk they have no rating table
              for. You are a transport operator that happens to use software. Lead with the vehicles and the
              passengers, and the whole thing becomes a standard commercial book.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Say this
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                {SCRIPT_SAY.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" /> Avoid this
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                {SCRIPT_DONT.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The five layers</CardTitle>
          <CardDescription>Each one is a product an insurer already sells every day.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {LAYERS.map((l) => (
              <AccordionItem key={l.title} value={l.title}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3 text-left">
                    <l.icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.product}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={l.priority === "Phase 2" ? "secondary" : "default"}>{l.priority}</Badge>
                      <Badge variant="outline">{l.whoSells}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Covered</p>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {l.insured.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Not covered here</p>
                        <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                          {l.notInsured.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">What they will ask you for</p>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {l.docs.map((x) => <li key={x}>{x}</li>)}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order of play</CardTitle>
          <CardDescription>Bind the cheap, easy layers first. Do not wait for a single perfect policy.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-2 list-decimal pl-5">
            <li>Appoint one commercial short-term broker who has placed taxi or fleet risk before.</li>
            <li>Bind layer 1 and 2 on the vehicles you actually operate today.</li>
            <li>Add layer 3 once loading zones are confirmed.</li>
            <li>Register for COIDA in parallel — it is a legal duty, not a quote.</li>
            <li>Only then ask for a small cyber and indemnity limit for the platform.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
