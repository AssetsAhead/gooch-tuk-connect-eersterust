import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft } from "lucide-react";

const rows: { lever: string; moove: string; mojaride: string; advantage: "us" | "moove" | "tie" }[] = [
  {
    lever: "Eligibility",
    moove: "Application + ID check",
    mojaride: "Earned via reputation, compliance, clocking streak, digital-payment ratio",
    advantage: "us",
  },
  {
    lever: "Pricing",
    moove: "Fixed weekly deduction",
    mojaride: "Dynamic — discounts for AARTO-clean, biometric clock-in, low-noise driving",
    advantage: "us",
  },
  {
    lever: "Risk holder",
    moove: "Moove carries it alone",
    mojaride: "Association co-signs; revenue share funds the buffer",
    advantage: "us",
  },
  {
    lever: "Capital scale",
    moove: "Backed by Uber, $400M+ raised — operates across multiple countries",
    mojaride: "Bootstrap + targeted investor tiers, starting in Eersterust",
    advantage: "moove",
  },
  {
    lever: "Upside on graduation",
    moove: "Driver owns the car",
    mojaride: "Driver owns car + earns equity in route slot + reputation credential",
    advantage: "us",
  },
  {
    lever: "Default handling",
    moove: "Repossession-led",
    mojaride: "Graduated: warning → mentor pairing → reassignment, repossession last",
    advantage: "us",
  },
  {
    lever: "Telematics & evidence",
    moove: "GPS + payment telemetry",
    mojaride: "GPS + dashcam AI + AARTO mapping + driver clocking + WhatsApp intel",
    advantage: "us",
  },
];

export default function DriveToOwnVsMoove() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/drive-to-own">
        <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Drive-to-Own</Button>
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">MojaRide Drive-to-Own vs Moove</h1>
        <p className="text-muted-foreground max-w-3xl">
          Moove pioneered the revenue-based vehicle financing model. We respect the playbook — and we
          tune it to the South African minibus-taxi context, where compliance, association partnerships
          and AARTO records are the real underwriting signals.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Side-by-side</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">Lever</th>
                  <th className="p-3 font-medium">Moove</th>
                  <th className="p-3 font-medium">MojaRide</th>
                  <th className="p-3 font-medium text-right">Edge</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.lever} className="border-t align-top">
                    <td className="p-3 font-medium">{r.lever}</td>
                    <td className="p-3 text-muted-foreground">{r.moove}</td>
                    <td className="p-3">{r.mojaride}</td>
                    <td className="p-3 text-right">
                      {r.advantage === "us" && <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline"><Check className="h-3 w-3 mr-1" />MojaRide</Badge>}
                      {r.advantage === "moove" && <Badge variant="outline"><X className="h-3 w-3 mr-1" />Moove</Badge>}
                      {r.advantage === "tie" && <Badge variant="outline">Even</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Why we win on incentives</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Moove's deduction is identical whether the driver is a saint or a problem. Ours rewards
            measurable behaviour — every AARTO-clean week, biometric clock-in and digital fare moves
            the driver to a better tier with a lower weekly cut and faster ownership date.
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Where Moove still leads</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Capital, brand, and OEM relationships. We close that gap by anchoring on associations and
            owners who already hold permits and vehicles — we don't need to buy fleets, we activate
            existing ones.
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Reference: <a href="https://za.moove.io/" target="_blank" rel="noopener" className="underline">za.moove.io</a>. Comparison is editorial and based on publicly available information.
      </p>
    </main>
  );
}
