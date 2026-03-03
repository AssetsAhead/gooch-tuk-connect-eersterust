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
