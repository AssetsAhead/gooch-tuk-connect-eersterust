import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * One-tap dialler for 112 — South Africa's free, all-network emergency number.
 * Works with no airtime and no data; routes to nearest police/ambulance/fire.
 */
export const Call112Button = ({
  variant = "destructive",
  size = "default",
  className = "",
  label = "Call 112 — Free Emergency Line",
}: {
  variant?: "destructive" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
}) => (
  <Button
    asChild
    variant={variant}
    size={size}
    className={className}
    aria-label="Call 112 emergency number (free, all networks)"
  >
    <a href="tel:112" className="inline-flex items-center gap-2">
      <PhoneCall className="h-4 w-4" />
      {label}
    </a>
  </Button>
);
