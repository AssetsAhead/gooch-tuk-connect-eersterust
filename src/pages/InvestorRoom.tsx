import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Banknote,
  Building2,
  FileSignature,
  Gauge,
  Globe2,
  Landmark,
  Lock,
  Play,
  Radio,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import { InvestorNdaGate, clearInvestorSession } from "@/components/investor/InvestorNdaGate";
import investorPitchVideo from "@/assets/TukConnect_Investor_Pitch.mp4.asset.json";
import investorPitchPoster from "@/assets/TukConnect_Investor_Pitch_poster.jpg.asset.json";

interface RoomLink {
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

interface RoomSection {
  step: string;
  title: string;
  blurb: string;
  links: RoomLink[];
}

const sections: RoomSection[] = [
  {
    step: "1",
    title: "The investment case",
    blurb: "Start here: what the business is, what it earns, and every way to come in.",
    links: [
      {
        title: "Investment Opportunities",
        description: "All funding pathways, the pitch video and the executive summary in one page.",
        to: "/investor",
        icon: TrendingUp,
        tag: "Start here",
      },
      {
        title: "R2M Fleet Proof of Concept",
        description: "Ten-vehicle fleet, 25% equity, the flagship raise.",
        to: "/investor/r2m-fleet",
        icon: Truck,
      },
      {
        title: "R1M Scale Funding",
        description: "20% equity to expand beyond the pilot rank.",
        to: "/investor/scale-funding",
        icon: TrendingUp,
      },
      {
        title: "R2M Hybrid Funding",
        description: "5–10% equity plus revenue share up to R4M.",
        to: "/investor/hybrid-funding",
        icon: Banknote,
      },
      {
        title: "R450K Hardware Only",
        description: "15% equity funding cameras, trackers and devices only.",
        to: "/investor/hardware-only",
        icon: Radio,
      },
      {
        title: "R2,000 Bridge Runway",
        description: "The immediate month-to-month need, at 0% equity.",
        to: "/investor/bare-minimum",
        icon: Banknote,
      },
      {
        title: "Cost Breakdown",
        description: "Year one running costs for the ten-vehicle pilot, line by line.",
        to: "/cost-breakdown",
        icon: ScrollText,
      },
    ],
  },
  {
    step: "2",
    title: "Proof it works",
    blurb: "The live system running in Eersterust, not a mock-up.",
    links: [
      {
        title: "Eersterust Pilot",
        description: "The five live stations: rank queue, dashcam, panic, incidents, marshal radio.",
        to: "/pilot",
        icon: Gauge,
        tag: "Live",
      },
      {
        title: "Traffic Brain",
        description: "Queues, incidents and fleet status fused into one real-time timeline.",
        to: "/traffic-brain",
        icon: Gauge,
      },
      {
        title: "Live Dashcam & GPS",
        description: "Vehicle feeds and route trails as the control room sees them.",
        to: "/dashcam",
        icon: Radio,
      },
      {
        title: "Drive-to-Own Pathway",
        description: "How drivers earn vehicle ownership, and why retention follows.",
        to: "/drive-to-own",
        icon: Truck,
      },
    ],
  },
  {
    step: "3",
    title: "How it scales",
    blurb: "From one rank to a national umbrella, with the pricing behind it.",
    links: [
      {
        title: "Franchise & Licensing Options",
        description: "Three licence tiers plus a live per-vehicle pricing calculator.",
        to: "/franchise-options",
        icon: Building2,
        tag: "Pricing",
      },
      {
        title: "Cross-Border: eSwatini",
        description: "The first expansion market and what it would take.",
        to: "/investor/eswatini",
        icon: Globe2,
      },
      {
        title: "Owner Value Case",
        description: "The pitch that converts vehicle owners, which drives fleet growth.",
        to: "/owner-pitch",
        icon: Banknote,
      },
    ],
  },
  {
    step: "4",
    title: "Government, compliance and IP",
    blurb: "The regulated moat: licensing, reporting and protected intellectual property.",
    links: [
      {
        title: "Department of Transport Presentation",
        description: "Partnership, not permission — the case put to national government.",
        to: "/dot-presentation",
        icon: Landmark,
        tag: "Regulatory",
      },
      {
        title: "Road Competency Pilot",
        description: "Sanctioned licensing pilot: qualifying drivers through real driving data.",
        to: "/dot-road-competency-pilot",
        icon: ShieldCheck,
      },
      {
        title: "Compliance Position",
        description: "Operating licences, POPIA and the bodies involved.",
        to: "/compliance",
        icon: ShieldCheck,
      },
      {
        title: "CIPC & IP Status",
        description: "Trademarks and patents filed, company incorporation in progress.",
        to: "/cipc-tracker",
        icon: ScrollText,
      },
      {
        title: "Patent Disclosure",
        description: "The technical core of the incident-escalation invention.",
        to: "/patent-state-machine",
        icon: Lock,
      },
    ],
  },
  {
    step: "5",
    title: "Paperwork",
    blurb: "Documents ready to sign when you are.",
    links: [
      {
        title: "Mutual NDA",
        description: "Generate and sign the full non-disclosure agreement as a PDF.",
        to: "/legal/nda",
        icon: FileSignature,
      },
      {
        title: "Revenue Share Agreement",
        description: "The standard revenue-share terms used with partners.",
        to: "/legal/revenue-share",
        icon: FileSignature,
      },
      {
        title: "Insurance Position",
        description: "The five-layer cover structure and the vehicle schedule tool.",
        to: "/insurance-shortlist",
        icon: ShieldCheck,
      },
    ],
  },
];

const InvestorRoom = () => {
  return (
    <InvestorNdaGate>
      {(session) => (
        <div className="min-h-screen bg-background">
          {/* Confidential bar */}
          <div className="bg-primary/10 border-b border-primary/20 py-2 px-4">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Confidential — access granted to {session.fullName}
                {session.company ? ` (${session.company})` : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearInvestorSession();
                  window.location.reload();
                }}
              >
                End session
              </Button>
            </div>
          </div>

          {/* Hero */}
          <section className="py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="max-w-5xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                <ShieldCheck className="h-3 w-3 mr-1" /> Investor Room
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Everything in one place
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                A guided route through the business: the numbers, the system already running in
                Eersterust, how it scales nationally, the government position, and the documents.
                Roughly forty minutes end to end.
              </p>

              <div className="rounded-xl overflow-hidden border bg-card shadow-lg text-left">
                <video
                  className="w-full aspect-video bg-black"
                  controls
                  preload="metadata"
                  poster={investorPitchPoster.url}
                  playsInline
                >
                  <source src={investorPitchVideo.url} type="video/mp4" />
                </video>
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" /> Investor pitch — 2 min 42 sec
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The fastest way to understand the opportunity. Best watched with sound.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={investorPitchVideo.url} download="TukConnect_Investor_Pitch.mp4">
                      Download video
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Sections */}
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              {sections.map((section) => (
                <div key={section.step}>
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {section.step}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{section.title}</h2>
                      <p className="text-muted-foreground">{section.blurb}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Card
                          key={link.to + link.title}
                          className="group hover:border-primary/40 hover:shadow-md transition-all"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              {link.tag && (
                                <Badge variant="secondary" className="text-xs">
                                  {link.tag}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg mt-3">{link.title}</CardTitle>
                            <CardDescription>{link.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="ghost" size="sm" className="px-0" asChild>
                              <Link to={link.to}>
                                Open
                                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <Separator className="mt-10" />
                </div>
              ))}
            </div>
          </section>

          <footer className="py-8 px-4 border-t bg-muted/30">
            <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">
                MobilityOne (Pty) Ltd t/a PoortLink — confidential
              </p>
              <p>
                Shared under a confidentiality undertaking accepted on{" "}
                {new Date(session.acceptedAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . Figures are estimates, not guarantees, and are subject to contract.
              </p>
            </div>
          </footer>
        </div>
      )}
    </InvestorNdaGate>
  );
};

export default InvestorRoom;
