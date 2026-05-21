import { useEffect, useState } from "react";
import { detectMixedInitiatives, type SeparationViolation } from "@/lib/initiativeGuard";
import { AlertTriangle } from "lucide-react";

/**
 * Dev/runtime guard. Scans the rendered DOM text every few seconds and
 * surfaces a blocking warning banner if taxi-app branding is mixed with
 * MTN-initiative phrasing on the same screen.
 *
 * Active in development AND production preview so investor-facing
 * accidents are caught before a demo.
 */
export const InitiativeSeparationGuard = () => {
  const [violation, setViolation] = useState<SeparationViolation | null>(null);

  useEffect(() => {
    const check = () => {
      const text = document.body?.innerText ?? "";
      const v = detectMixedInitiatives(text, `route:${window.location.pathname}`);
      setViolation(v);
      if (v) {
        // eslint-disable-next-line no-console
        console.error(
          "[InitiativeGuard] Mixed branding detected on screen:",
          v
        );
      }
    };
    check();
    const id = window.setInterval(check, 4000);
    return () => window.clearInterval(id);
  }, []);

  if (!violation) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] max-w-xl w-[90vw] rounded-lg border-2 border-destructive bg-destructive/10 backdrop-blur p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-destructive">
            Initiative separation violation
          </p>
          <p className="text-foreground/80 mt-1">
            This screen mixes the Taxi app (
            <span className="font-mono">{violation.taxiMatches.join(", ")}</span>
            ) with MTN-initiative phrasing (
            <span className="font-mono">{violation.mtnMatches.join(", ")}</span>
            ). Keep these streams in separate documents, demos, and routes.
          </p>
        </div>
      </div>
    </div>
  );
};
