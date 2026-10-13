import { useState } from "react";
import { ArrowLeft, Power, Volume2, VolumeX, ChevronUp, ChevronDown, MapPin, Info } from "lucide-react";
import { VERIFIED_HUBS, VERIFIED_SECTORS, ALL_VERIFIED, type VerifiedLocation } from "@/lib/eersterustLocations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TV Remote concept demo — visual prototype only. No live booking.
 * SAFETY: uses ONLY operator-verified locations from eersterustLocations.ts.
 * Sectors (Highlands Park, Nantes, Boonste Kersies) are never collapsed to one street.
 */

const CHANNEL_BANKS: VerifiedLocation[][] = [
  [VERIFIED_HUBS[0], VERIFIED_HUBS[1], VERIFIED_HUBS[2], VERIFIED_HUBS[3]], // Pick n Pay, SAMPFAM, Clinic, Blue School
  [VERIFIED_HUBS[5], VERIFIED_HUBS[4], VERIFIED_SECTORS[0], VERIFIED_SECTORS[1]], // Denlyn, Westminister, Highlands Park, Nantes
  [VERIFIED_SECTORS[2]], // Boonste Kersies
];

const BANK_NAMES = ["Daily hubs", "Shopping & sectors", "Sectors"];

// Simulated board data for the demo screen only
const SIMULATED = {
  "pick-n-pay": { waiting: "3 tuk-tuks", wait: "±6 min" },
  sampfam: { waiting: "5 tuk-tuks", wait: "±9 min" },
  clinic: { waiting: "2 tuk-tuks", wait: "±4 min" },
  prosperitas: { waiting: "1 tuk-tuk", wait: "±3 min" },
  westminister: { waiting: "4 tuk-tuks", wait: "±7 min" },
  denlyn: { waiting: "6 tuk-tuks", wait: "±12 min" },
} as Record<string, { waiting: string; wait: string }>;

type LayoutOption = "a" | "b";

function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}

export default function RemoteConcept() {
  const [layout, setLayout] = useState<LayoutOption>("a");
  const [bank, setBank] = useState(0);
  const [selected, setSelected] = useState<VerifiedLocation | null>(null);
  const [muted, setMuted] = useState(false);
  const [powered, setPowered] = useState(true);

  const currentBank = CHANNEL_BANKS[bank];
  const sim = selected ? SIMULATED[selected.id] : undefined;

  const press = (loc: VerifiedLocation) => {
    buzz(15);
    setSelected(loc);
  };
  const nextBank = () => { buzz(10); setBank((b) => (b + 1) % CHANNEL_BANKS.length); };
  const prevBank = () => { buzz(10); setBank((b) => (b - 1 + CHANNEL_BANKS.length) % CHANNEL_BANKS.length); };

  const TVScreen = () => (
    <div className="relative w-full aspect-video rounded-xl border-2 border-border bg-card overflow-hidden shadow-lg">
      {/* Map suggestion — placeholder grid, real GPS pin is the source of truth */}
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 225" aria-hidden>
        <defs>
          <pattern id="tv-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tv-grid)" />
        <path d="M 0 170 Q 110 120 200 90 T 400 40" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <path d="M 70 225 L 70 80 Q 70 55 105 45 L 400 45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
      </svg>

      {/* Top status bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur border-b border-border">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Channel {bank + 1} · {BANK_NAMES[bank]}</span>
        <span className="text-[10px] text-muted-foreground">📍 Your GPS pin is the pickup</span>
      </div>

      {/* Center: current selection */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pt-8">
        {powered ? (
          selected ? (
            <>
              <span className="text-4xl mb-1" aria-hidden>{selected.icon}</span>
              <div className="text-2xl font-bold text-foreground">{selected.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {selected.streetLabel ?? "Residential area — many streets. Driver follows your live pin."}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">
                  {sim ? `${sim.waiting} · ${sim.wait}` : "Area pickup — no queue line"}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Full load R45–R60</span>
              </div>
            </>
          ) : (
            <>
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-lg font-semibold text-foreground">Pick a destination on the remote</div>
              <div className="text-xs text-muted-foreground mt-1">Press 1–4, or flip channels with CH ▲ / ▼</div>
            </>
          )
        ) : (
          <div className="text-muted-foreground text-sm">TV is off — press ⏻ on the remote</div>
        )}
      </div>

      {/* Bottom hail bar */}
      {selected && powered && (
        <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground py-2.5 text-center text-sm font-semibold tracking-wide">
          OK to hail → {selected.name}
        </div>
      )}
    </div>
  );

  const RemoteHandset = ({ compact = false }: { compact?: boolean }) => {
    const key = "h-14 text-sm";
    return (
      <div className={cn("rounded-3xl border border-border bg-card p-4 shadow-xl", compact ? "w-full max-w-xs" : "w-64")}>
        {/* Channel rocker */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1 h-11" onClick={prevBank} aria-label="Previous channel bank">
            <ChevronDown className="h-4 w-4" /> CH
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-11" onClick={nextBank} aria-label="Next channel bank">
            CH <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-[10px] text-center text-muted-foreground mb-3 uppercase tracking-widest">
          Bank {bank + 1}/3 — {BANK_NAMES[bank]}
        </div>

        {/* Number pad: 3 columns, current bank on 1–4 */}
        <div className="grid grid-cols-3 gap-2">
          {currentBank.map((loc, i) => (
            <button
              key={loc.id}
              onClick={() => press(loc)}
              className={cn(
                key,
                "rounded-xl border border-border bg-background/60 hover:bg-primary/10 active:scale-95 transition flex flex-col items-center justify-center gap-0.5 px-1",
                selected?.id === loc.id && "border-primary bg-primary/15",
              )}
            >
              <span className="text-[9px] text-muted-foreground">{i + 1}</span>
              <span aria-hidden>{loc.icon}</span>
              <span className="text-[9px] leading-tight text-center font-medium">{loc.name}</span>
            </button>
          ))}
          {/* Fill remaining keys of the 3x4 pad */}
          {Array.from({ length: 8 - currentBank.length }).map((_, i) => (
            <div key={`pad-${i}`} className={cn(key, "rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center text-muted-foreground/40 text-xs")}>
              {currentBank.length + 1 + i}
            </div>
          ))}
          <button
            onClick={() => { buzz(10); setMuted((m) => !m); }}
            className={cn(key, "rounded-xl border border-border bg-background/60 hover:bg-primary/10 active:scale-95 transition flex items-center justify-center")}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Big OK hail ring */}
        <button
          onClick={() => { buzz([30, 40, 30]); }}
          disabled={!selected || !powered}
          className={cn(
            "mt-4 w-28 h-28 mx-auto block rounded-full border-4 transition active:scale-95",
            selected && powered
              ? "border-primary text-primary bg-primary/10 hover:bg-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
              : "border-border text-muted-foreground/50 bg-muted/30",
          )}
          aria-label="Hail a tuk-tuk"
        >
          <span className="block text-lg font-extrabold tracking-widest">OK</span>
          <span className="block text-[10px] uppercase tracking-widest">Hail</span>
        </button>

        {/* Power / back */}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { buzz(10); setSelected(null); }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { buzz(10); setPowered((p) => !p); }} aria-label="Power">
            <Power className={cn("h-4 w-4", !powered && "text-muted-foreground")} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">TV Remote concept</h1>
          <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
            Demo only
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Visual prototype — no live bookings. Verified Eersterust locations only; sector areas are never collapsed to a single street.
        </p>

        {/* Layout toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <Button variant={layout === "a" ? "default" : "outline"} size="sm" onClick={() => { buzz(10); setLayout("a"); }}>
            A · TV + handset
          </Button>
          <Button variant={layout === "b" ? "default" : "outline"} size="sm" onClick={() => { buzz(10); setLayout("b"); }}>
            B · Full handset
          </Button>
        </div>

        {layout === "a" ? (
          <div className="space-y-6">
            <TVScreen />
            <div className="flex justify-center">
              <RemoteHandset />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <RemoteHandset compact />
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              The whole screen is the handset: channel rocker flips between banks, 1–4 selects, big OK ring hails.
              The selected destination confirms on a slim status strip (your GPS pin stays the pickup).
            </p>
            {selected && powered && (
              <div className="w-full max-w-xs rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm">
                <span className="font-semibold">{selected.icon} {selected.name}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selected.streetLabel ?? "Area pickup — driver follows your live pin"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verified registry footer */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Verified locations on this remote ({ALL_VERIFIED.length})
          </div>
          <ul className="space-y-1 text-xs">
            {ALL_VERIFIED.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span>{l.icon} {l.name}</span>
                <span className="text-muted-foreground text-right">{l.streetLabel ?? "Residential area (multiple streets)"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
