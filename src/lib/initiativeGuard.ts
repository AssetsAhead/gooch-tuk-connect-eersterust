/**
 * Initiative Separation Guard
 *
 * Enforces the project-wide constraint:
 *   The Taxi app (MojaRide / PoortLink / TukConnect / MobilityOne) MUST NOT
 *   appear in the same document, demo, screen, or export as the MTN initiative.
 *
 * Generic mentions of "MTN" as a cellular carrier (alongside Vodacom, Cell C,
 * Telkom, Rain) are allowed — only initiative-level phrases trigger.
 *
 * See: mem://constraints/mtn-initiative-separation
 */

export const TAXI_BRANDS = [
  "MojaRide",
  "Moja Ride",
  "PoortLink",
  "Poort Link",
  "TukConnect",
  "Tuk Connect",
  "MobilityOne",
  "Mobility One",
] as const;

// Phrases that mean "the MTN business stream", NOT "MTN the carrier".
export const MTN_INITIATIVE_PHRASES = [
  "MTN initiative",
  "MTN partnership",
  "MTN deal",
  "MTN due diligence",
  "MTN evaluation",
  "MTN pilot",
  "MTN engagement",
  "MTN proposal",
  "MTN sponsorship",
  "MTN consolidation",
  "MTN funding",
  "MTN investment",
  "MTN program",
  "MTN programme",
  "MTN project",
] as const;

export interface SeparationViolation {
  context: string;
  taxiMatches: string[];
  mtnMatches: string[];
  excerpt: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function findMatches(text: string, needles: readonly string[]): string[] {
  const hits: string[] = [];
  for (const n of needles) {
    const re = new RegExp(`\\b${escape(n)}\\b`, "i");
    if (re.test(text)) hits.push(n);
  }
  return hits;
}

/**
 * Returns a violation object if the text mixes taxi-app branding with
 * MTN-initiative phrasing, otherwise null.
 */
export function detectMixedInitiatives(
  text: string,
  context = "unknown"
): SeparationViolation | null {
  if (!text) return null;
  const taxiMatches = findMatches(text, TAXI_BRANDS);
  const mtnMatches = findMatches(text, MTN_INITIATIVE_PHRASES);
  if (taxiMatches.length === 0 || mtnMatches.length === 0) return null;

  const first = mtnMatches[0];
  const idx = text.toLowerCase().indexOf(first.toLowerCase());
  const excerpt = text.slice(Math.max(0, idx - 80), idx + first.length + 80);

  return { context, taxiMatches, mtnMatches, excerpt };
}

/**
 * Throws if a violation is detected. Use before exporting investor PDFs,
 * generating decks, or sending outbound documents.
 */
export function assertInitiativeSeparation(text: string, context = "export"): void {
  const v = detectMixedInitiatives(text, context);
  if (!v) return;
  const msg =
    `Initiative-separation violation in "${context}": ` +
    `taxi brands [${v.taxiMatches.join(", ")}] cannot appear with ` +
    `MTN-initiative phrases [${v.mtnMatches.join(", ")}]. ` +
    `Excerpt: "…${v.excerpt}…"`;
  // eslint-disable-next-line no-console
  console.error("[InitiativeGuard]", msg);
  throw new Error(msg);
}
