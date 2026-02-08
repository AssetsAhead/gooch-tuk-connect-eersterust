import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, TrendingUp, Shield, CheckCircle2, DollarSign, Target,
  Zap, Mail, Phone, Building2, ArrowRight, BarChart3, Wallet, Clock,
  Scale, Receipt, RefreshCw, Repeat, HandCoins, Banknote, Lock, Unlock
} from "lucide-react";
import { Link } from "react-router-dom";

const dealTerms = [
  { label: "Investment Amount", value: "R2,000,000" },
  { label: "Equity Stake", value: "5–10%", note: "Negotiable" },
  { label: "Revenue-Share Rate", value: "10% of gross platform revenue" },
  { label: "Target Return", value: "2× (R4,000,000)" },
  { label: "Payback Timeline", value: "24 months" },
  { label: "Revenue-Share Ends", value: "Immediately at 2× target" },
  { label: "Post-Payback", value: "Investor retains equity only" },
];

const paybackPhases = [
  {
    phase: "Phase 1 — Deployment",
    timeline: "Months 1–3",
    icon: Zap,
    description: "Capital deployed into fleet hardware, driver onboarding, and tech platform. Revenue-share begins as first trips are completed.",
    status: "upcoming" as const,
  },
  {
    phase: "Phase 2 — Ramp-Up",
    timeline: "Months 4–12",
    icon: TrendingUp,
    description: "Fleet reaches 20+ active vehicles. Revenue-share payments accelerate as gross platform revenue grows. Projected: R80K–R120K/month returned.",
    status: "upcoming" as const,
  },
  {
    phase: "Phase 3 — Full Payback",
    timeline: "Months 13–24",
    icon: Target,
    description: "Cumulative payback reaches R4M (2× target). Revenue-share stops immediately. Investor retains 5–10% equity stake in the company.",
    status: "upcoming" as const,
  },
  {
    phase: "Phase 4 — Equity Upside",
    timeline: "Month 25+",
    icon: Unlock,
    description: "No further cash obligations. Investor holds equity that grows with company valuation. Potential exit via secondary sale, buyback, or future funding round.",
    status: "upcoming" as const,
  },
];

const riskMitigations = [
  {
    icon: HandCoins,
    title: "Cash-First Returns",
    description: "Unlike pure equity deals, you receive cash returns from month 1. No need to wait for an exit event to see returns.",
  },
  {
    icon: Lock,
    title: "Equity Floor",
    description: "Even after full payback, you retain a 5–10% equity stake — pure upside with zero additional risk.",
  },
  {
    icon: RefreshCw,
    title: "Revenue-Linked, Not Fixed",
    description: "Payback scales with actual revenue. If we grow faster, you get paid faster. Aligned incentives.",
  },
  {
    icon: Shield,
    title: "Regulatory Compliance Built-In",
    description: "SARS, CIPC, POPIA registered. BCEA-compliant employment. Your investment sits inside a fully compliant structure.",
  },
];

const comparisonRows = [
  ["Investment", "R2,000,000", "R2,000,000", "R2,000,000"],
  ["Equity Given", "5–10%", "25%", "0%"],
  ["Cash Payback", "Yes (2×)", "No", "Yes (fixed schedule)"],
  ["Payback Source", "10% gross revenue", "N/A", "Fixed monthly"],
  ["Upside After Payback", "Equity growth", "Equity growth", "None"],
  ["Risk Profile", "Medium-Low", "Medium-High", "Low"],
  ["Investor Alignment", "High (shared upside)", "High", "Low (debt only)"],
];

const complianceItems = [
  { name: "SARS Income Tax", number: "9065004328", status: "approved", icon: Receipt },
  { name: "CIPC Registration", status: "approved", icon: Building2 },
  { name: "POPIA Compliance", status: "approved", icon: Shield },
  { name: "BCEA Employment", status: "approved", icon: Scale },
];

const projectedPayback = [
  { month: "Month 3", cumulative: "R180K", progress: 5 },
  { month: "Month 6", cumulative: "R540K", progress: 14 },
  { month: "Month 9", cumulative: "R1.08M", progress: 27 },
  { month: "Month 12", cumulative: "R1.8M", progress: 45 },
  { month: "Month 15", cumulative: "R2.5M", progress: 63 },
  { month: "Month 18", cumulative: "R3.2M", progress: 80 },
  { month: "Month 21", cumulative: "R3.7M", progress: 93 },
  { month: "Month 24", cumulative: "R4.0M", progress: 100 },
];

const InvestorHybridFunding = () => {
  const { toast } = useToast();
  const [investorForm, setInvestorForm] = useState({
    name: "", email: "", phone: "", company: "", message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: "Interest Registered!", description: "Our team will contact you within 24 hours." });
    setInvestorForm({ name: "", email: "", phone: "", company: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="bg-muted/30 border-b py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/investor">
              <ArrowLeft className="mr-2 h-4 w-4" /> All Investment Options
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-violet-500/10 via-background to-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-violet-600">Hybrid Funding</Badge>
            <Badge variant="outline">R2,000,000</Badge>
            <Badge variant="outline">5–10% Equity</Badge>
            <Badge variant="outline">2× Revenue-Share Payback</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">Get Paid Back — Then Keep Growing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            A <strong>hybrid investment model</strong> that combines the security of revenue-share payback 
            with the long-term upside of equity ownership. You receive 10% of gross platform revenue until 
            your R2M investment returns R4M (2×), then retain a permanent equity stake in the company.
          </p>
        </div>
      </section>

      {/* Deal Terms */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Banknote className="h-8 w-8 text-primary" /> Deal Structure
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Term Sheet Summary</CardTitle>
                <CardDescription>Key terms at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dealTerms.map((term, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">{term.label}</span>
                      <div className="text-right">
                        <span className="font-bold">{term.value}</span>
                        {term.note && (
                          <span className="text-xs text-muted-foreground block">{term.note}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Projected Payback Timeline
                </CardTitle>
                <CardDescription>Cumulative returns based on fleet growth projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectedPayback.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.month}</span>
                        <span className="text-sm font-bold">{item.cumulative}</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Target 2× Payback</p>
                  <p className="text-2xl font-bold text-primary">R4,000,000</p>
                  <p className="text-xs text-muted-foreground">Revenue-share stops immediately at this point</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Repeat className="h-8 w-8 text-primary" /> How the Hybrid Model Works
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {paybackPhases.map((phase, i) => (
              <Card key={i} className={i === 2 ? "border-primary bg-primary/5" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      i === 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <phase.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{phase.phase}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{phase.timeline}</p>
                      <p className="text-sm">{phase.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Mitigations */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Why This Model Works for Investors</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {riskMitigations.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex items-start gap-4">
                  <item.icon className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> How It Compares
              </CardTitle>
              <CardDescription>Hybrid model vs traditional investment structures</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4 text-violet-600 font-bold">Hybrid (This Deal)</th>
                    <th className="text-center py-3 px-4 text-muted-foreground">Pure Equity</th>
                    <th className="text-center py-3 px-4 text-muted-foreground">Pure Loan</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, ...values], i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{label}</td>
                      {values.map((v, j) => (
                        <td key={j} className={`py-3 px-4 text-center ${j === 0 ? "font-semibold" : ""}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" /> Regulatory Compliance
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {"number" in item && item.number && (
                      <p className="text-sm text-muted-foreground">Ref: {item.number}</p>
                    )}
                  </div>
                </div>
                <Badge>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Express Interest
              </CardTitle>
              <CardDescription>
                Submit your details and our team will reach out within 24 hours with the full term sheet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={investorForm.name}
                      onChange={e => setInvestorForm(f => ({ ...f, name: e.target.value }))}
                      required maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={investorForm.email}
                      onChange={e => setInvestorForm(f => ({ ...f, email: e.target.value }))}
                      required maxLength={255} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={investorForm.phone}
                      onChange={e => setInvestorForm(f => ({ ...f, phone: e.target.value }))}
                      maxLength={20} />
                  </div>
                  <div>
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input id="company" value={investorForm.company}
                      onChange={e => setInvestorForm(f => ({ ...f, company: e.target.value }))}
                      maxLength={100} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea id="message" value={investorForm.message}
                    onChange={e => setInvestorForm(f => ({ ...f, message: e.target.value }))}
                    rows={3} maxLength={1000} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Register Interest"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2025 MOBILITY ONE. All rights reserved.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/investor" className="hover:text-primary">Investor Portal</Link>
            <Link to="/dot-presentation" className="hover:text-primary">DOT Presentation</Link>
            <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorHybridFunding;
