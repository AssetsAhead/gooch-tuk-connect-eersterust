import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, FileText, Wrench, TrendingUp, Target,
  CheckCircle2, Car, Users, DollarSign, Smartphone, Globe, Shield, Repeat
} from "lucide-react";
import { Link } from "react-router-dom";

const proposals = [
  {
    title: "R2M Fleet POC",
    subtitle: "Electric Vehicle Fleet — Proof of Concept",
    ask: "R2,000,000",
    equity: "25%",
    roi: "~R1M net/yr",
    payback: "~24 months",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/50 border-emerald-200",
    badgeColor: "bg-emerald-600",
    icon: Car,
    href: "/investor/r2m-fleet",
    highlights: [
      "Purchase 10 electric tuk-tuks",
      "Employ 10 drivers (BCEA compliant)",
      "Full ownership & operational control",
      "Highest revenue potential",
    ],
    description:
      "Full fleet ownership model — buy 10 EV bikes, employ drivers, and operate a compliant, tech-enabled fleet in Eersterust.",
  },
  {
    title: "R450K Hardware-Only",
    subtitle: "Retrofit Existing Fleet — Pure Tech Play",
    ask: "R450,000",
    equity: "15%",
    roi: "~R396K/yr",
    payback: "~14 months",
    color: "text-orange-600",
    bgColor: "bg-orange-50/50 border-orange-200",
    badgeColor: "bg-orange-600",
    icon: Wrench,
    href: "/investor/hardware-only",
    highlights: [
      "Install tech on 10 existing tuk-tuks",
      "No vehicle ownership risk",
      "Faster payback, lower risk",
      "SaaS + advertising revenue",
    ],
    description:
      "Don't buy vehicles — equip them. Install tracking, cameras, and biometrics on existing fleets. Zero vehicle depreciation risk.",
  },
  {
    title: "R1M Scale Funding",
    subtitle: "Seed Round — Platform Expansion",
    ask: "R1,000,000",
    equity: "20%",
    roi: "R520K/mo target",
    payback: "~18 months",
    color: "text-blue-600",
    bgColor: "bg-blue-50/50 border-blue-200",
    badgeColor: "bg-blue-600",
    icon: TrendingUp,
    href: "/investor/scale-funding",
    highlights: [
      "Scale from pilot to 50+ vehicles",
      "Technology & marketing expansion",
      "Multi-city rollout capability",
      "Platform revenue at scale",
    ],
    description:
      "Seed funding to scale from pilot to 50+ active vehicles across multiple areas, achieving positive unit economics and market dominance.",
  },
  {
    title: "R2M Hybrid Funding",
    subtitle: "Revenue-Share + Equity — Best of Both",
    ask: "R2,000,000",
    equity: "5–10%",
    roi: "2× cash return",
    payback: "~24 months",
    color: "text-violet-600",
    bgColor: "bg-violet-50/50 border-violet-200",
    badgeColor: "bg-violet-600",
    icon: Repeat,
    href: "/investor/hybrid-funding",
    highlights: [
      "10% gross revenue-share until 2× return",
      "Retain 5–10% equity after payback",
      "Cash returns from month 1",
      "Revenue-share stops at R4M",
    ],
    description:
      "Get your money back first, then keep growing. 10% of gross platform revenue until R4M is returned, plus a permanent equity stake.",
  },
];

const marketStats = [
  { label: "Minibus Taxis in SA", value: "250,000+", icon: Car },
  { label: "Daily Passengers", value: "15 Million", icon: Users },
  { label: "Annual Industry Value", value: "R90 Billion", icon: DollarSign },
  { label: "Market Digitization", value: "<5%", icon: Smartphone },
];

const InvestorPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Investment Opportunities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Digitizing South Africa's{" "}
            <span className="text-primary">R90 Billion</span> Taxi Industry
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            MOBILITY ONE is building the operating system for minibus taxis.
            Three investment pathways — choose the one that matches your risk
            appetite and vision.
          </p>
        </div>
      </section>

      {/* Market Stats */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketStats.map((stat, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Proposal Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Investment Proposals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each proposal has a dedicated page with full financial breakdowns,
              risk analysis, and downloadable PDF documents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {proposals.map((proposal, i) => (
              <Card
                key={i}
                className={`${proposal.bgColor} hover:shadow-lg transition-all duration-300 flex flex-col`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={proposal.badgeColor}>
                      {proposal.title.split(" ")[0]}
                    </Badge>
                    <Badge variant="outline">{proposal.equity} Equity</Badge>
                  </div>
                  <CardTitle className="text-xl">{proposal.title}</CardTitle>
                  <CardDescription>{proposal.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className={`text-3xl font-bold ${proposal.color} mb-4`}>
                    {proposal.ask}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {proposal.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {proposal.highlights.map((h, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                    <div className="p-3 bg-background/60 rounded-lg text-center">
                      <p className="text-sm font-bold">{proposal.roi}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="p-3 bg-background/60 rounded-lg text-center">
                      <p className="text-sm font-bold">{proposal.payback}</p>
                      <p className="text-xs text-muted-foreground">Payback</p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={proposal.href}>
                      View Full Proposal <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick comparison */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4 text-emerald-600">R2M Fleet</th>
                    <th className="text-center py-3 px-4 text-orange-600">R450K Hardware</th>
                    <th className="text-center py-3 px-4 text-blue-600">R1M Scale</th>
                    <th className="text-center py-3 px-4 text-violet-600">R2M Hybrid</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Investment Ask", "R2,000,000", "R450,000", "R1,000,000", "R2,000,000"],
                    ["Equity Offered", "25%", "15%", "20%", "5–10%"],
                    ["Vehicle Ownership", "Yes (10 EVs)", "No", "Partial (E-bikes)", "Flexible"],
                    ["Revenue Model", "60/40 commission", "SaaS + ads", "Platform fees", "10% rev-share + equity"],
                    ["Risk Level", "Medium-High", "Low-Medium", "Medium", "Medium-Low"],
                    ["Payback Period", "~24 months", "~14 months", "~18 months", "~24 months"],
                    ["Vehicles Covered", "10 (new)", "10 (existing)", "50+ (mixed)", "Flexible"],
                  ].map(([label, ...values], i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{label}</td>
                      {values.map((v, j) => (
                        <td key={j} className="py-3 px-4 text-center">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-medium">SARS Registered</p>
              <p className="text-sm text-muted-foreground">Tax Ref: 9065004328</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-medium">CIPC Registered</p>
              <p className="text-sm text-muted-foreground">MOBILITY ONE (Pty) Ltd</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-medium">POPIA Compliant</p>
              <p className="text-sm text-muted-foreground">Data protection audit passed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2025 MOBILITY ONE. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/dot-presentation" className="hover:text-primary">DOT Presentation</Link>
            <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InvestorPortal;
