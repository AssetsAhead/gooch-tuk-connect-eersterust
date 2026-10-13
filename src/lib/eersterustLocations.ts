/**
 * Verified Eersterust location registry.
 *
 * SAFETY RULE: only names and aliases confirmed by the operator live here.
 * Never add guessed aliases, etymological links or "probable" streets.
 * Anything not matched exactly must be confirmed by the user (map pin / typed street).
 * Coordinates are intentionally omitted until surveyed on site — the live GPS pin is the source of truth.
 */

export type LocationKind = "hub" | "sector";

export interface VerifiedLocation {
  id: string;
  name: string;
  kind: LocationKind;
  /** Verified street / intersection description. Sectors have none (many streets). */
  streetLabel?: string;
  /** Exact spoken/typed forms confirmed by the operator. Lower-case. */
  aliases: string[];
  icon: string;
}

export const VERIFIED_HUBS: VerifiedLocation[] = [
  { id: "pick-n-pay", name: "Pick n Pay", kind: "hub", icon: "🛒",
    streetLabel: "Hans Coverdale Rd West & Soutrivier Rd", aliases: ["pick n pay", "pick and pay"] },
  { id: "sampfam", name: "SAMPFAM", kind: "hub", icon: "🏪",
    streetLabel: "Hans Coverdale Rd East", aliases: ["sampfam"] },
  { id: "clinic", name: "Clinic", kind: "hub", icon: "🏥",
    streetLabel: "Hans Coverdale Rd East & PS Fourie St", aliases: ["clinic"] },
  { id: "prosperitas", name: "Blue School (Prosperitas High)", kind: "hub", icon: "🏫",
    streetLabel: "Hans Coverdale Rd South", aliases: ["blue school", "blouskool", "prosperitas"] },
  { id: "westminister", name: "Westminister", kind: "hub", icon: "🚏",
    streetLabel: "Westminister St & Volga St", aliases: ["westminister"] },
  { id: "denlyn", name: "Denlyn", kind: "hub", icon: "🛍️",
    streetLabel: "Denlyn shopping centre", aliases: ["denlyn"] },
];

/** Residential sectors: many interconnecting streets — never collapse to one street. */
export const VERIFIED_SECTORS: VerifiedLocation[] = [
  { id: "highlands-park", name: "Highlands Park", kind: "sector", icon: "🏘️", aliases: ["highlands park", "highlands"] },
  { id: "nantes", name: "Nantes", kind: "sector", icon: "🏘️", aliases: ["nantes"] },
  { id: "boonste-kersies", name: "Boonste Kersies", kind: "sector", icon: "🏘️", aliases: ["boonste kersies"] },
];

export const ALL_VERIFIED = [...VERIFIED_HUBS, ...VERIFIED_SECTORS];

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export interface ResolveResult {
  /** Locations whose verified alias appears as whole words in the input. */
  matches: VerifiedLocation[];
  heard: string;
}

/**
 * Strict resolver: whole-word match against verified aliases only.
 * No fuzzy matching, no partial words, no guessing. The UI must still ask the user to confirm.
 */
export function resolveVerifiedLocation(input: string): ResolveResult {
  const heard = normalise(input);
  const padded = ` ${heard} `;
  const matches = ALL_VERIFIED.filter((loc) =>
    loc.aliases.some((a) => padded.includes(` ${normalise(a)} `)),
  );
  return { matches, heard: input.trim() };
}
