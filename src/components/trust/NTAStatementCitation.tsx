import { Card, CardContent } from "@/components/ui/card";
import { Quote, ShieldCheck } from "lucide-react";

interface NTAStatementCitationProps {
  variant?: "full" | "compact";
  className?: string;
}

/**
 * Citation block for the National Taxi Alliance media statement (5 June 2026).
 * Used to demonstrate that PoortLink / MojaRide aligns with industry-stated
 * passenger rights: freedom of choice, no forced patronage, discipline against
 * intimidation.
 */
export const NTAStatementCitation = ({
  variant = "full",
  className = "",
}: NTAStatementCitationProps) => {
  return (
    <Card className={`border-primary/30 bg-primary/5 ${className}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Aligned with NTA Policy
          </span>
        </div>
        <blockquote className="relative pl-6 border-l-2 border-primary/40 text-sm leading-relaxed text-foreground/90">
          <Quote className="absolute -left-1 top-0 h-4 w-4 text-primary/40" />
          Passengers retain freedom of choice. No commuter may be forced to
          patronise any particular operator, and any act of intimidation will
          be met with disciplinary action.
        </blockquote>
        <p className="text-xs text-muted-foreground">
          Paraphrased from the National Taxi Alliance media statement,
          5 June 2026.
        </p>
        {variant === "full" && (
          <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
            <li>Our app never coerces a passenger toward any operator.</li>
            <li>
              Intimidation by drivers or marshals is flagged in the reputation
              system and escalated.
            </li>
            <li>
              Cash and card trips are logged the same as digital — no penalty
              for the passenger's choice of payment.
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
