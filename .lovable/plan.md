# Leverage NTA Statement (5 June 2026) — Option C

Use the NTA media statement (passenger freedom of choice, no forced patronage, discipline against intimidation) in two places: a new public trust page, and as a citation block reused in partnership-facing materials.

## 1. New public page: `/passenger-rights`

Route added to `src/App.tsx` (public, no auth required — matches visibility policy for trust assets).

Page content (`src/pages/PassengerRights.tsx`):
- H1: "Passenger Freedom of Choice"
- Lead paragraph framing PoortLink/MojaRide alignment with NTA's stated position.
- Pull-quote card with the key NTA lines (freedom of choice, no forced patronage, intimidation = disciplinary action).
- "What this means on our platform" — short bullet list:
  - Passengers choose any operator; the app never coerces.
  - Drivers/marshals who intimidate are flagged via the reputation system and reported.
  - Cash and card trips are logged the same as digital — no penalty for choice of payment.
- Source attribution: "National Taxi Alliance media statement, 5 June 2026."
- SEO: title ≤60 chars, meta description ≤160 chars, single H1, canonical tag.

## 2. Reusable citation component

`src/components/trust/NTAStatementCitation.tsx` — compact card with quote + source line. Drop-in for any page.

Embed in existing partnership/owner-facing pages:
- `src/pages/OwnerPitch.tsx` — under the trust/compliance section.
- `src/pages/WhyJoin.tsx` — near the "what associations get" section.

Both embeds use the same component so future edits propagate once.

## 3. Navigation / discoverability

- Add a link to `/passenger-rights` from `src/components/GlobalHeader.tsx` footer area or compliance menu (whichever pattern the header currently uses — will check on implementation).
- Add the route to `src/components/search/searchRoutes.ts` so it surfaces in search.

## Out of scope

- No changes to MTN-stream materials (per separation rule).
- No DB changes; this is pure content/presentation.
- No edits to the actual partnership agreement PDFs/legal docs — citation lives in the web-facing pitch pages only. Legal doc updates can be a separate pass if you want.

## Technical notes

- Files created: `src/pages/PassengerRights.tsx`, `src/components/trust/NTAStatementCitation.tsx`.
- Files edited: `src/App.tsx` (route), `src/pages/OwnerPitch.tsx`, `src/pages/WhyJoin.tsx`, `src/components/search/searchRoutes.ts`, possibly `src/components/GlobalHeader.tsx` for a nav entry.
- Initiative-separation guard already in place will catch any accidental MTN references in the new files.
