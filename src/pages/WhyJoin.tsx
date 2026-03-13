import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Shield, Landmark, ArrowRight, CheckCircle2, 
  AlertTriangle, TrendingUp, Users, Car, Smartphone 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RevenueLeakageCalculator } from "@/components/fleet/RevenueLeakageCalculator";

const WhyJoin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-secondary/20 text-secondary-foreground border-secondary/30 text-sm px-4 py-1">
            For Tuk-Tuk & Taxi Owners
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
            Your Driver Did 47 Trips Today.
            <br />
            <span className="text-secondary">He Reported 31.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            That's R640 you lost — <strong>today alone</strong>. MojaRide shows you every trip, every rand, every route. 
            No more guessing. No more skimming.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8"
              onClick={() => navigate('/auth/owner')}
            >
              Join Free — See Your Real Revenue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Calculate What You're Losing
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            3 Reasons Smart Owners Are Joining
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            You don't pay us. We take a small cut of the money you're currently losing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <Card className="border-secondary/20 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto group-hover:bg-secondary/20 transition-colors">
                  <Eye className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">See Where Your Money Goes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  GPS tracks every trip. Digital logs show every fare collected. 
                  No more trusting verbal reports — <strong>you see the data yourself</strong>.
                </p>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Real-time trip tracking per vehicle</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Automated 60/40 revenue split</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Daily earnings reports on your phone</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pillar 2 */}
            <Card className="border-destructive/20 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto group-hover:bg-destructive/20 transition-colors">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">Stay Out of Trouble</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Underage drivers, expired licenses, no insurance — <strong>YOU are liable</strong>. 
                  Our system verifies every driver before they turn the key.
                </p>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>Driver ID + license verification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>Facial recognition clock-in system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>Insurance & compliance dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pillar 3 */}
            <Card className="border-primary/20 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <Landmark className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Government Contracts Coming</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Municipalities are digitizing transport permits. 
                  <strong> Only platform-registered vehicles will qualify</strong>. Get on the list now.
                </p>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Operate under our e-hailing license</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>DOT-ready compliance reporting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Priority for municipal tenders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revenue Leakage Calculator */}
      <section id="calculator" className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            How Much Are You Really Losing?
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Adjust the sliders to match your fleet — see the truth
          </p>
          <RevenueLeakageCalculator />
        </div>
      </section>

      {/* Permit Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Operating Permit: 3 Paths Compared
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every vehicle needs an e-hailing operating permit. Here's what each path costs you in money, time, and risk.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo */}
            <Card className="border-destructive/30 relative">
              <div className="absolute -top-3 left-4">
                <Badge variant="destructive" className="text-xs">Most Expensive</Badge>
              </div>
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="text-center">
                  <Car className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <h3 className="text-lg font-bold">Go Solo</h3>
                  <p className="text-xs text-muted-foreground">Apply on your own, per vehicle</p>
                </div>
                <div className="text-center py-3 rounded-lg bg-destructive/5">
                  <p className="text-2xl font-bold text-destructive">R15,000–R37,000</p>
                  <p className="text-xs text-muted-foreground">per vehicle</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>6–18 months processing time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>Complex DOT Form 9A paperwork yourself</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>ICASA equipment certificate required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>Must demo a live, working app to DOT</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>High rejection rate without guidance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>No compliance system included</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Association */}
            <Card className="border-warning/30 relative">
              <div className="absolute -top-3 left-4">
                <Badge className="text-xs bg-warning text-warning-foreground">R180K–R550K+</Badge>
              </div>
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="text-center">
                  <Users className="h-8 w-8 text-warning mx-auto mb-2" />
                  <h3 className="text-lg font-bold">Association DIY</h3>
                  <p className="text-xs text-muted-foreground">Build your own platform & apply</p>
                </div>
                <div className="text-center py-3 rounded-lg bg-warning/5">
                  <p className="text-2xl font-bold text-warning">R180K–R550K+</p>
                  <p className="text-xs text-muted-foreground">before a single vehicle is permitted</p>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What you'd need to build:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span><strong>App development:</strong> R150K–R500K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span><strong>ICASA cert:</strong> R3K–R8K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span><strong>Legal & DOT filing:</strong> R8K–R27K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span><strong>Gazette publication:</strong> R2K–R5K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span><strong>Ongoing hosting:</strong> R5K–R15K/month</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Plus DOT requires:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>Live app demo at assessment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>SARS tax compliance as platform operator</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>POPIA registration as data processor</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <span>6–18 month timeline at best</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MojaRide */}
            <Card className="border-secondary/50 ring-2 ring-secondary/30 relative shadow-lg">
              <div className="absolute -top-3 left-4">
                <Badge className="text-xs bg-secondary text-secondary-foreground">Recommended</Badge>
              </div>
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <h3 className="text-lg font-bold">Join MojaRide</h3>
                  <p className="text-xs text-muted-foreground">Register under our e-hailing license</p>
                </div>
                <div className="text-center py-3 rounded-lg bg-secondary/10">
                  <p className="text-2xl font-bold text-secondary">R0 Upfront</p>
                  <p className="text-xs text-muted-foreground">5–8% of app-facilitated rides only</p>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">All included — already built:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span><strong>Working app:</strong> ✅ Already live</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span><strong>ICASA cert:</strong> ✅ Platform handles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span><strong>DOT application:</strong> ✅ Covered</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span><strong>POPIA & SARS:</strong> ✅ Compliant</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span><strong>Hosting & tech:</strong> ✅ Maintained</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Association benefits preserved:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Keep your identity & governance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Route authority stays with you</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Cash rides stay 100% yours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Co-branded compliance dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 max-w-3xl mx-auto">
            Under the National Land Transport Amendment Act 23 of 2023, e-hailing vehicles must operate under a licensed platform. 
            MojaRide holds the centralised e-hailing service license so your vehicles don't need individual permits. 
            The association gains digital clout and DOT-ready reporting without spending R180K+ building their own system.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works — 3 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">1</div>
              <h3 className="font-semibold">Register Your Vehicles</h3>
              <p className="text-sm text-muted-foreground">Add your fleet in 5 minutes. Free. No contracts.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto text-xl font-bold">2</div>
              <h3 className="font-semibold">Drivers Clock In</h3>
              <p className="text-sm text-muted-foreground">Facial recognition or PIN. Every trip is GPS-logged automatically.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-success text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">3</div>
              <h3 className="font-semibold">You See Everything</h3>
              <p className="text-sm text-muted-foreground">Real-time dashboard. Automated revenue splits. Daily reports on WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Objection handling */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">"But What About..."</h2>
          <div className="space-y-4">
            {[
              {
                q: "I don't have money to pay for software",
                a: "It's FREE to join. We only take 5-8% of the revenue you're currently losing to unreported trips. You still come out ahead."
              },
              {
                q: "My drivers will refuse",
                a: "Drivers who are honest have nothing to fear. The system also protects them — verified trips mean fair pay and no false accusations."
              },
              {
                q: "I don't trust technology / POPIA concerns",
                a: "Cash payments still work. Biometrics are optional. Your data is encrypted and you control it. We're POPIA compliant."
              },
              {
                q: "I only have 1-2 vehicles, is it worth it?",
                a: "Even with 2 vehicles losing 20% of fares, that's R5,000-R8,000/month back in your pocket. Every vehicle counts."
              },
              {
                q: "What if there's no signal / data?",
                a: "The app works offline. Trip data syncs automatically when signal returns. No trip is ever lost."
              }
            ].map((item, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="py-4 px-5">
                  <p className="font-semibold text-sm mb-1">❓ "{item.q}"</p>
                  <p className="text-sm text-muted-foreground">✅ {item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <Smartphone className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Stop Losing Money Today
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Join 50+ owners who already see their real revenue. Free to start. No contracts. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8"
              onClick={() => navigate('/auth/owner')}
            >
              Register My Fleet — Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/')}
            >
              Learn More About MojaRide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyJoin;
