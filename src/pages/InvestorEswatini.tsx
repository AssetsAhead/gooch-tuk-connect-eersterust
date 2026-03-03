import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Globe, MapPin, Users, Clock, Car, DollarSign,
  CheckCircle2, AlertTriangle, TrendingUp, Zap, Shield, Smartphone,
  Sun, Moon, Mountain
} from "lucide-react";
import { Link } from "react-router-dom";

const corridorStops = [
  "Matsapha Industrial",
  "Manzini CBD",
  "Mahlanya Junction",
  "Luyengo / UNISWA",
  "Lobamba (Parliament / National Museum)",
  "Ezulwini (Sun Hotels, Gables, House on Fire)",
  "Mbabane CBD",
];

const revenueStreams = [
  {
    name: "Valley Hopper (Daytime Shuttle)",
    description: "Fixed-route corridor service between Manzini and Mbabane via Ezulwini Valley",
    revenue: "E15–E35 per ride",
    frequency: "Every 30–45 min, 06:00–18:00",
    target: "Business commuters, expats, semi-tourists",
  },
  {
    name: "Evening Service (On-Demand)",
    description: "Safe, reliable evening transport for restaurants, events, and nightlife",
    revenue: "E30–E80 per trip",
    frequency: "On-demand, 18:00–23:00",
    target: "Tourists, event-goers, restaurant patrons",
  },
  {
    name: "Airport Transfers",
    description: "King Mswati III International Airport (KMIA) to Ezulwini corridor",
    revenue: "E80–E150 per transfer",
    frequency: "Aligned with flight schedules",
    target: "Arriving tourists, business travelers",
  },
  {
    name: "Hotel Partnerships",
    description: "Contracted shuttle service for hotels and lodges in the valley",
    revenue: "Monthly retainer + per-trip fees",
    frequency: "Scheduled + on-demand",
    target: "Royal Swazi Sun, Mantenga Lodge, etc.",
  },
];

const whyEswatini = [
  {
    icon: MapPin,
    title: "Geographic Advantage",
    detail: "The entire Ezulwini–Manzini corridor is 40km — a single, dense, high-demand route. No sprawl problem.",
  },
  {
    icon: Users,
    title: "Underserved 'Missing Middle'",
    detail: "Too upscale for kombis, too budget for taxis. Business travelers, expats, and semi-tourists have zero reliable mid-tier options.",
  },
  {
    icon: Globe,
    title: "Tourism Gateway",
    detail: "1.1M+ tourist arrivals annually. Ezulwini Valley is the hospitality spine — Sun Hotels, Mantenga, House on Fire, Royal Residences.",
  },
  {
    icon: Shield,
    title: "Regulatory Simplicity",
    detail: "eSwatini's transport regulation is less complex than SA's. Smaller bureaucracy = faster licensing. Royal Eswatini Police clearance is the primary requirement.",
  },
  {
    icon: Smartphone,
    title: "Growing Digital Adoption",
    detail: "MTN eSwatini MoMo penetration is high. Digital payments via mobile money are already normalized — no cash-first friction.",
  },
  {
    icon: TrendingUp,
    title: "First-Mover Opportunity",
    detail: "No app-based shuttle or on-demand service exists in eSwatini. Zero competition in the mid-tier segment.",
  },
];

const unitEconomics = {
  vehicleCost: "E180,000–E250,000",
  dailyTrips: "12–18 trips/vehicle",
  avgFare: "E25–E50",
  dailyRevenue: "E300–E900/vehicle",
  monthlyRevenue: "E7,500–E22,500/vehicle",
  fuelCost: "~E3,000/month",
  driverCost: "~E4,500/month",
  netPerVehicle: "E0–E15,000/month",
  breakeven: "12–18 months per vehicle",
};

const InvestorEswatini = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-background to-amber-500/10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/investor">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Investor Hub
            </Link>
          </Button>

          <div className="text-center">
            <Badge className="mb-4 bg-blue-600">
              <Globe className="h-3 w-3 mr-1" />
              International Expansion
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Moving{" "}
              <span className="text-blue-600">eSwatini</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Mid-tier shuttle & on-demand transport for the Ezulwini Valley corridor — 
              TukConnect's first cross-border market.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <MapPin className="h-3.5 w-3.5 mr-1" /> Ezulwini–Manzini Corridor
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Users className="h-3.5 w-3.5 mr-1" /> The "Missing Middle"
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Car className="h-3.5 w-3.5 mr-1" /> Valley Hopper Service
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-12 px-4 bg-muted/30 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Why eSwatini?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A compact, high-demand corridor with zero mid-tier competition — the ideal proving ground for cross-border expansion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {whyEswatini.map((item, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Concept */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">
              <Car className="h-3 w-3 mr-1" /> Service Concept
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Two Services, One Platform</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Day Service */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <Sun className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Valley Hopper</CardTitle>
                    <CardDescription>Daytime Fixed-Route Shuttle</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Hours:</strong> 06:00 – 18:00</p>
                <p><strong>Frequency:</strong> Every 30–45 minutes</p>
                <p><strong>Route:</strong> Matsapha → Manzini → Ezulwini → Mbabane</p>
                <p><strong>Fare:</strong> E15–E35 (distance-based)</p>
                <p><strong>Vehicle:</strong> Branded 7–12 seater minivans</p>
                <p className="text-muted-foreground">
                  Positioned between kombis (cheap, unreliable) and private taxis (expensive). 
                  Clean, scheduled, app-trackable, air-conditioned.
                </p>
              </CardContent>
            </Card>

            {/* Evening Service */}
            <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                    <Moon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Evening On-Demand</CardTitle>
                    <CardDescription>Safe Nighttime Transport</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Hours:</strong> 18:00 – 23:00</p>
                <p><strong>Mode:</strong> On-demand (app-hailed)</p>
                <p><strong>Coverage:</strong> Ezulwini Valley + surrounds</p>
                <p><strong>Fare:</strong> E30–E80 (distance + time)</p>
                <p><strong>Vehicle:</strong> Same fleet, on-demand dispatch</p>
                <p className="text-muted-foreground">
                  After-hours transport for restaurants, events, House on Fire shows, 
                  hotel guests. Safety-first positioning — GPS tracked, rated drivers.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Corridor Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mountain className="h-5 w-5 text-primary" />
                Valley Hopper Corridor Stops
              </CardTitle>
              <CardDescription>
                Matsapha Industrial to Mbabane CBD — the economic spine of eSwatini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {corridorStops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant="secondary" className="whitespace-nowrap">{stop}</Badge>
                    {i < corridorStops.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Revenue Streams</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {revenueStreams.map((stream, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{stream.name}</CardTitle>
                  <CardDescription>{stream.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="flex justify-between"><span className="text-muted-foreground">Fare Range:</span> <strong>{stream.revenue}</strong></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Frequency:</span> <span>{stream.frequency}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Target:</span> <span>{stream.target}</span></p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Unit Economics */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Unit Economics (Per Vehicle)
              </CardTitle>
              <CardDescription>Conservative estimates in eSwatini Lilangeni (E) — pegged 1:1 to ZAR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  ["Vehicle Cost", unitEconomics.vehicleCost],
                  ["Daily Trips", unitEconomics.dailyTrips],
                  ["Avg Fare", unitEconomics.avgFare],
                  ["Daily Revenue", unitEconomics.dailyRevenue],
                  ["Monthly Revenue", unitEconomics.monthlyRevenue],
                  ["Fuel Cost", unitEconomics.fuelCost],
                  ["Driver Cost", unitEconomics.driverCost],
                  ["Net Per Vehicle", unitEconomics.netPerVehicle],
                  ["Breakeven", unitEconomics.breakeven],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between p-3 bg-background/60 rounded-lg">
                    <span className="text-muted-foreground">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Integration */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">
              <Smartphone className="h-3 w-3 mr-1" /> Platform Strategy
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Same Platform, New Market</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              eSwatini runs on the same TukConnect technology stack — localized for SZL currency, Siswati language, and eSwatini routes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What We Reuse (Zero Additional Dev Cost)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  "Real-time GPS tracking & live map",
                  "Driver biometric clocking & verification",
                  "Passenger app with hailing & scheduling",
                  "Digital payment processing (adapted for MoMo)",
                  "Safety features — panic button, trip sharing",
                  "Analytics dashboard & fleet management",
                  "DOT/regulatory compliance framework (adapted)",
                ].map((item, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What We Localize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  "Currency: SZL (Lilangeni), pegged 1:1 to ZAR",
                  "Language: Siswati + English interface",
                  "Payment: MTN MoMo integration (primary)",
                  "Routes: Ezulwini Valley corridor mapping",
                  "Regulatory: eSwatini transport licensing",
                  "Branding: 'Moving eSwatini' sub-brand",
                  "Partnerships: Local hotels, tourism board",
                ].map((item, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risks & Considerations */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Risks & Considerations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Cross-Border Operations",
                detail: "Operating a SA-registered company in eSwatini requires local registration or partnership. Dual regulatory compliance adds overhead.",
                level: "Medium",
              },
              {
                title: "Demand Validation",
                detail: "The 'missing middle' segment is assumed but untested. Pilot data needed before scaling. Tourism seasonality affects evening demand.",
                level: "Medium",
              },
              {
                title: "Currency & Repatriation",
                detail: "SZL is pegged to ZAR (no forex risk), but capital repatriation through SACU banking channels must be structured properly.",
                level: "Low",
              },
              {
                title: "Vehicle Import & Logistics",
                detail: "Importing vehicles into eSwatini has duty implications. Local procurement may be limited. Maintenance infrastructure is thinner than SA.",
                level: "Medium",
              },
            ].map((risk, i) => (
              <Card key={i} className="border-amber-200/50 dark:border-amber-800/50">
                <CardContent className="pt-6 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{risk.title}</p>
                      <Badge variant="outline" className="text-xs">{risk.level} Risk</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Investment Position</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            eSwatini is positioned as TukConnect's <strong>first international expansion</strong> — proof that the platform scales beyond South Africa's borders.
          </p>

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 text-left">
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-background/60 rounded-lg">
                  <p className="text-muted-foreground mb-1">Pilot Fleet</p>
                  <p className="text-2xl font-bold">3–5 Vehicles</p>
                  <p className="text-xs text-muted-foreground">Start small, prove demand</p>
                </div>
                <div className="p-4 bg-background/60 rounded-lg">
                  <p className="text-muted-foreground mb-1">Estimated Pilot Cost</p>
                  <p className="text-2xl font-bold">E750K–E1.25M</p>
                  <p className="text-xs text-muted-foreground">Vehicles + 6-month operations</p>
                </div>
                <div className="p-4 bg-background/60 rounded-lg">
                  <p className="text-muted-foreground mb-1">Timeline to Revenue</p>
                  <p className="text-2xl font-bold">3–4 Months</p>
                  <p className="text-xs text-muted-foreground">Faster than SA (simpler regulation)</p>
                </div>
                <div className="p-4 bg-background/60 rounded-lg">
                  <p className="text-muted-foreground mb-1">Strategic Value</p>
                  <p className="text-2xl font-bold">Cross-Border Proof</p>
                  <p className="text-xs text-muted-foreground">Validates SADC expansion thesis</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Investor Narrative
                </p>
                <p className="text-muted-foreground">
                  eSwatini de-risks the "South Africa only" concern. It proves TukConnect's platform is exportable across SADC markets — 
                  Lesotho, Mozambique, Botswana, Namibia all share similar transport gaps. A successful eSwatini pilot turns a local startup into a regional platform play.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/investor">
                <ArrowLeft className="mr-2 h-4 w-4" /> All Investment Tiers
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/docs/Moving_eSwatini.pdf" target="_blank" rel="noopener noreferrer">
                Download Full Concept PDF <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2025 MOBILITY ONE. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/investor" className="hover:text-primary">Investor Hub</Link>
            <Link to="/dot-presentation" className="hover:text-primary">DOT Presentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InvestorEswatini;
