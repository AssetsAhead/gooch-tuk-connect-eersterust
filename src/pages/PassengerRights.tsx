import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NTAStatementCitation } from "@/components/trust/NTAStatementCitation";

const PAGE_TITLE = "Passenger Freedom of Choice | MojaRide";
const PAGE_DESC =
  "MojaRide and PoortLink uphold passenger freedom of choice, aligned with the National Taxi Alliance's stated policy against forced patronage.";

const PassengerRights = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = PAGE_TITLE;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", PAGE_DESC);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/passenger-rights`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <article className="space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Passenger Freedom of Choice
            </h1>
            <p className="text-lg text-muted-foreground">
              MojaRide and PoortLink are built on the same principle the
              National Taxi Alliance has publicly affirmed: every commuter
              chooses freely, and no operator may force patronage.
            </p>
          </header>

          <NTAStatementCitation />

          <Card>
            <CardHeader>
              <CardTitle>What this means on our platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>
                The app surfaces nearby operators and lets the passenger pick.
                It does not steer, weight, or lock a passenger to any single
                association, rank, or driver.
              </p>
              <p>
                Drivers and marshals who intimidate passengers — verbally,
                physically, or by blocking other operators — are flagged in
                the reputation system, escalated to the relevant association,
                and where appropriate reported to the TMPD War Room
                (012 358 2124).
              </p>
              <p>
                Cash, card and digital trips are all logged equally. A
                passenger never loses access, priority, or fare benefit for
                paying in cash. The trip data still feeds the fleet picture
                that owners and regulators rely on.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For associations and owners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>
                Partnering with PoortLink does not bind your members to
                exclusive routes or force commuters to your vehicles. It gives
                your association the operational visibility, payment rails and
                compliance trail needed to defend its members — while keeping
                the passenger relationship voluntary, as the NTA requires.
              </p>
              <p>
                Partnership terms remain zero upfront, 5–8% revenue share, and
                a 30-day exit. No lock-in for the association, no lock-in for
                the passenger.
              </p>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Source: National Taxi Alliance media statement, 5 June 2026.
            Quotations are paraphrased for clarity; the underlying position —
            freedom of choice, no forced patronage, disciplinary action
            against intimidation — is the NTA's own.
          </p>
        </article>
      </div>
    </div>
  );
};

export default PassengerRights;
