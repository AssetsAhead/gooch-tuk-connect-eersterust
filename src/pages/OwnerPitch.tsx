import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  Landmark,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Car,
  Smartphone,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  Lock,
  Wifi,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  "hero",
  "problem",
  "money-lost",
  "solution",
  "how-it-works",
  "driver-control",
  "government",
  "pricing",
  "association",
  "objections",
  "cta",
] as const;

const OwnerPitch = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const goNext = () => setCurrentSlide((p) => Math.min(p + 1, slides.length - 1));
  const goPrev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  const slideVariants = {
    enter: { opacity: 0, y: 40 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted">
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: "var(--gradient-brand)" }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Slide counter */}
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="secondary" className="text-xs font-mono px-3 py-1">
          {currentSlide + 1} / {slides.length}
        </Badge>
      </div>

      {/* Logo */}
      <div className="fixed top-4 left-4 z-50">
        <img src="/logo.png" alt="MojaRide" className="h-8 opacity-80" />
      </div>

      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto"
          >
            {/* SLIDE 0: HERO */}
            {currentSlide === 0 && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block"
                >
                  <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-base px-6 py-2 mb-6">
                    For Tuk-Tuk Owners & Associations
                  </Badge>
                </motion.div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="text-primary">Know Every Trip.</span>
                  <br />
                  <span className="text-secondary">Keep Every Rand.</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  MojaRide gives you <strong className="text-foreground">full visibility</strong> of your fleet — 
                  trips, revenue, drivers, compliance — all from your phone.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <Button
                    size="lg"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-10 h-14 rounded-xl shadow-lg"
                    onClick={goNext}
                  >
                    See How It Works
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            )}

            {/* SLIDE 1: THE PROBLEM */}
            {currentSlide === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Badge variant="destructive" className="mb-4 text-sm px-4 py-1">The Problem</Badge>
                  <h2 className="text-3xl md:text-5xl font-black">
                    You Own the Vehicle.
                    <br />
                    <span className="text-destructive">But Do You Own the Revenue?</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto">
                  {[
                    { icon: Eye, title: "No Trip Visibility", desc: "You have no idea how many trips your driver actually did today." },
                    { icon: DollarSign, title: "Cash Skimming", desc: "Drivers report 30 trips. GPS says 47. That's R640 gone — every day." },
                    { icon: AlertTriangle, title: "Liability Risk", desc: "Underage or unlicensed driver? YOU go to jail. YOUR vehicle gets impounded." },
                    { icon: Clock, title: "No Records", desc: "Government wants digital records for permits. You have nothing to show." },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 * i }}
                    >
                      <Card className="border-destructive/20 h-full">
                        <CardContent className="p-6 flex gap-4 items-start">
                          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-6 w-6 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 2: MONEY LOST VISUALIZER */}
            {currentSlide === 2 && (
              <div className="text-center space-y-8">
                <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-sm px-4 py-1">
                  Let's Do The Math
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black">
                  With Just <span className="text-secondary">2 Vehicles</span>,
                  <br />You Could Be Losing:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                  {[
                    { label: "Per Day", amount: "R1,280", sub: "16 unreported trips × R40 × 2 vehicles" },
                    { label: "Per Month", amount: "R33,280", sub: "26 operating days" },
                    { label: "Per Year", amount: "R399,360", sub: "Money your driver kept" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 * i, type: "spring" }}
                    >
                      <Card className={`border-2 ${i === 2 ? "border-destructive bg-destructive/5" : "border-border"}`}>
                        <CardContent className="p-8 text-center">
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{item.label}</p>
                          <p className={`text-4xl md:text-5xl font-black ${i === 2 ? "text-destructive" : "text-foreground"}`}>
                            {item.amount}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{item.sub}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  And that's a <strong className="text-foreground">conservative</strong> estimate. Some owners lose double.
                </p>
              </div>
            )}

            {/* SLIDE 3: THE SOLUTION */}
            {currentSlide === 3 && (
              <div className="text-center space-y-8">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-sm px-4 py-1">The Solution</Badge>
                <h2 className="text-3xl md:text-5xl font-black">
                  <span className="text-primary">MojaRide</span> Puts You
                  <br />Back In Control
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-10">
                  {[
                    {
                      icon: Eye,
                      title: "See Every Trip",
                      desc: "GPS tracks every route. Digital logs every fare. You see it all — live.",
                      color: "text-secondary",
                      bg: "bg-secondary/10",
                    },
                    {
                      icon: Shield,
                      title: "Protect Yourself",
                      desc: "Driver verification. Facial clock-in. No underage or unlicensed drivers.",
                      color: "text-primary",
                      bg: "bg-primary/10",
                    },
                    {
                      icon: Landmark,
                      title: "Get Government Ready",
                      desc: "Operate under our e-hailing license. DOT compliance reports auto-generated.",
                      color: "text-success",
                      bg: "bg-[hsl(var(--success))]/10",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * i }}
                      className="text-center space-y-4"
                    >
                      <div className={`h-20 w-20 rounded-2xl ${item.bg} flex items-center justify-center mx-auto`}>
                        <item.icon className={`h-10 w-10 ${item.color}`} />
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 4: HOW IT WORKS */}
            {currentSlide === 4 && (
              <div className="space-y-10">
                <div className="text-center">
                  <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-sm px-4 py-1 mb-4">
                    Simple Setup
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-black">
                    Up & Running in <span className="text-secondary">5 Minutes</span>
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-6 mt-8">
                  {[
                    { step: "1", icon: Smartphone, title: "Register Your Vehicles", desc: "Add your fleet details — registration, driver info, route. Takes 5 minutes. Free.", color: "bg-primary text-primary-foreground" },
                    { step: "2", icon: Users, title: "Driver Clocks In", desc: "Facial recognition or PIN code. The system confirms who's driving before they start.", color: "bg-secondary text-secondary-foreground" },
                    { step: "3", icon: MapPin, title: "Every Trip Is Tracked", desc: "GPS logs every route, every stop, every fare. Automatic. No driver input needed.", color: "bg-[hsl(var(--success))] text-primary-foreground" },
                    { step: "4", icon: BarChart3, title: "You See Everything", desc: "Dashboard on your phone. Daily WhatsApp reports. Automated 60/40 revenue split.", color: "bg-primary text-primary-foreground" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 * i }}
                      className="flex items-start gap-5"
                    >
                      <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0 text-xl font-black`}>
                        {item.step}
                      </div>
                      <div className="pt-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 5: DRIVER CONTROL */}
            {currentSlide === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-sm px-4 py-1 mb-4">
                    Driver Accountability
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-black">
                    Your Driver Can't Hide <span className="text-secondary">Anymore</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                  <Card className="border-primary/20">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" /> Before They Drive
                      </h3>
                      <ul className="space-y-3 text-sm">
                        {[
                          "Face scan confirms identity — no proxy driving",
                          "License status checked automatically",
                          "Age verification — blocks underage drivers",
                          "Clock-in time recorded with GPS location",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-secondary/20">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-secondary" /> While They Drive
                      </h3>
                      <ul className="space-y-3 text-sm">
                        {[
                          "Live GPS tracking — see where your vehicle is NOW",
                          "Every trip logged with distance & fare amount",
                          "Route deviation alerts sent to your phone",
                          "Daily summary on WhatsApp — trips, fares, hours",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SLIDE 6: GOVERNMENT READY */}
            {currentSlide === 6 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 text-sm px-4 py-1 mb-4">
                    Future-Proof
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-black">
                    Government Is Going Digital.
                    <br />
                    <span className="text-primary">Are You Ready?</span>
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-4 mt-8">
                  {[
                    { title: "E-Hailing License", desc: "Your vehicles operate under our platform license — no need for individual permits. Like Uber & Bolt.", icon: Car },
                    { title: "DOT Compliance Reports", desc: "Auto-generated monthly reports. Shows government you're compliant without you doing paperwork.", icon: Landmark },
                    { title: "Municipal Tender Ready", desc: "When municipalities award transport contracts, only digitized fleets will qualify. Be first in line.", icon: TrendingUp },
                    { title: "POPIA Compliant", desc: "All data encrypted. Driver consent managed. You're protected from information regulator fines.", icon: Lock },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 * i }}
                    >
                      <Card>
                        <CardContent className="p-5 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 7: PRICING */}
            {currentSlide === 7 && (
              <div className="text-center space-y-8">
                <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-sm px-4 py-1">Pricing</Badge>
                <h2 className="text-3xl md:text-5xl font-black">
                  It Costs You <span className="text-secondary">R0</span> To Start
                </h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                  We don't charge you. We take a small percentage of the money
                  <strong className="text-foreground"> you're already losing</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                  <Card className="border-border">
                    <CardContent className="p-8 text-center space-y-3">
                      <Zap className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-3xl font-black">R0</p>
                      <p className="font-semibold">To Join</p>
                      <p className="text-sm text-muted-foreground">No setup fees. No hardware costs. No contracts.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-secondary border-2 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-secondary text-secondary-foreground text-xs">How We Earn</Badge>
                    </div>
                    <CardContent className="p-8 text-center space-y-3">
                      <TrendingUp className="h-8 w-8 text-secondary mx-auto" />
                      <p className="text-3xl font-black text-secondary">5-8%</p>
                      <p className="font-semibold">Of Recovered Revenue</p>
                      <p className="text-sm text-muted-foreground">Only on trips that were previously unreported. Cash rides = 100% yours.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-8 text-center space-y-3">
                      <DollarSign className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-3xl font-black">92-95%</p>
                      <p className="font-semibold">You Keep</p>
                      <p className="text-sm text-muted-foreground">Of money you weren't getting before. Net gain every single month.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SLIDE 8: ASSOCIATION BENEFITS */}
            {currentSlide === 8 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-sm px-4 py-1 mb-4">
                    For Associations
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-black">
                    Why Your <span className="text-secondary">Association</span> Should Partner
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                  {[
                    { icon: BarChart3, title: "Co-Branded Dashboard", desc: "Your association's name on the platform. Real-time fleet data for all your members." },
                    { icon: Landmark, title: "DOT Compliance for All", desc: "Auto-generated compliance reports for the entire association. Impress regulators." },
                    { icon: DollarSign, title: "0% Upfront Cost", desc: "5-8% revenue share on app-facilitated rides only. Cash rides remain 100% with association members." },
                    { icon: Shield, title: "30-Day Exit Clause", desc: "Not happy? Walk away in 30 days. No penalties. No lock-in. Zero risk." },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 * i }}
                    >
                      <Card className="h-full">
                        <CardContent className="p-6 flex gap-4 items-start">
                          <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <p className="text-center text-muted-foreground text-sm max-w-lg mx-auto mt-4">
                  Start with <strong className="text-foreground">one pilot route</strong>. See results. Then expand.
                </p>
              </div>
            )}

            {/* SLIDE 9: OBJECTIONS */}
            {currentSlide === 9 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl md:text-5xl font-black">
                    "But What About<span className="text-secondary">...</span>"
                  </h2>
                  <p className="text-muted-foreground mt-2">Common questions — honest answers</p>
                </div>
                <div className="max-w-3xl mx-auto space-y-4 mt-8">
                  {[
                    { q: "I can't afford software", a: "It's FREE. We only take 5-8% of revenue you're currently not getting. You always come out ahead." },
                    { q: "My drivers will refuse", a: "Honest drivers welcome transparency — it protects them from false accusations. Dishonest drivers are costing you money." },
                    { q: "I don't trust technology", a: "Cash payments still work. The app runs in the background. You just check reports on WhatsApp." },
                    { q: "What about data / no signal?", a: "Works offline. Syncs when signal returns. No trip is ever lost." },
                    { q: "Only 1-2 vehicles — worth it?", a: "Even with 2 vehicles losing 20%, that's R5,000-R8,000/month back. Every vehicle counts." },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Card className="border-border/50">
                        <CardContent className="py-4 px-6">
                          <p className="font-bold text-sm mb-1">❓ "{item.q}"</p>
                          <p className="text-sm text-muted-foreground">✅ {item.a}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 10: CTA */}
            {currentSlide === 10 && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="h-24 w-24 rounded-3xl bg-secondary/15 flex items-center justify-center mx-auto"
                >
                  <Smartphone className="h-12 w-12 text-secondary" />
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-black">
                  Ready to See Your
                  <br />
                  <span className="text-secondary">Real Revenue?</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                  Free to join. No contracts. No hardware. Cancel anytime.
                  <br />
                  <strong className="text-foreground">Start seeing the truth today.</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-10 h-14 rounded-xl shadow-lg"
                    onClick={() => navigate("/auth/owner")}
                  >
                    Register My Fleet — Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 h-14 rounded-xl"
                    onClick={() => navigate("/why-join")}
                  >
                    More Details
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 justify-center pt-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> Free to start</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> No contracts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> Cancel anytime</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> POPIA compliant</span>
                </div>
                <p className="text-xs text-muted-foreground pt-4">
                  📞 Call us: <a href="tel:+27123456789" className="text-primary underline">+27 12 345 6789</a> &nbsp;|&nbsp; 
                  💬 WhatsApp: <a href="https://wa.me/27123456789" className="text-primary underline">Chat Now</a>
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-md"
          onClick={goPrev}
          disabled={currentSlide === 0}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>

        {/* Dot indicators */}
        <div className="flex gap-1.5 px-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-6 bg-secondary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-md"
          onClick={goNext}
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-6 right-4 z-50 hidden md:block">
        <p className="text-xs text-muted-foreground/50">Use ↑↓ arrow keys</p>
      </div>

      {/* Keyboard navigation */}
      <KeyboardNav onNext={goNext} onPrev={goPrev} />
    </div>
  );
};

function KeyboardNav({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      onNext();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    }
  };

  // Using useEffect via inline
  import("react").then(({ useEffect }) => {});
  
  // Actually use the hook properly
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useEffect } = require("react");
    useEffect(() => {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    });
  }

  return null;
}

export default OwnerPitch;
