# DOT Road Competency Pilot Page

## Goal
Create a new, standalone DOT-facing page that sells the concept of a **sanctioned, supervised road-competency pilot** for South African drivers who currently operate without a valid licence. The page should present the idea as a Department of Transport partnership, leveraging the existing GPS, dashcam, and biometric tech stack already in the app. No insurer angle; pure safety, compliance, and enforcement-visibility case.

## Requirements (from clarifying questions)
- **Deliverable format:** New standalone page
- **Legal framing:** Sanctioned DOT pilot with amnesty
- **Insurer angle:** No — DOT/safety only

## What we will build

### 1. New page: `src/pages/DOTRoadCompetencyPilot.tsx`
A public-facing, DOT-presentation page with the following sections:

- **Hero:** DOT-style header, headline, and one-sentence value proposition.
- **The Problem:** The gap between K53 classroom testing and real-world competence; the number of unlicensed drivers already on the road; the enforcement burden.
- **The Proposed Pilot:** A limited, sanctioned amnesty programme where enrolled drivers drive under supervision while the platform continuously records GPS, telematics events, dashcam evidence, and biometric identity. Driving hours and behaviour become an auditable competency record.
- **How the Technology Works:** Reuse the existing live stack (real-time GPS, AI incident detection, driver biometric authentication, panic button, dashcam evidence chain) to prove the concept is operationally ready today, not a roadmap.
- **Pilot Phases:** Enrolment → Supervised hours accrual → Mentor sign-off → DOT/RTMC review → Graduated licence referral / scale.
- **Interactive Dashboard Mockup:** A simulated "Competency Pilot Dashboard" showing a sample driver profile, hours accrued, safety events, route trace, mentor sign-off status, and a pending DOT review status. Use static mock data only.
- **National Scale Vision:** A forward-looking section explaining how biometric login could eventually turn the pilot into a national driver-competency layer for all South African drivers — not just the unlicensed cohort. This is framed as Phase 2, after the pilot proves safety and compliance outcomes.
- **Benefits to DOT:** Safer roads, real-time enforcement insight, reduced illegal driving, formalised path to legitimacy, employment enablement, and a future national digital driver record anchored by biometric identity.
- **Cost-Saving Angle:** Highlight quantified or directional cost reductions — fewer traffic-stop enforcement hours, lower accident-related emergency response, reduced court/admin burden from unlicensed-driver prosecutions, less K53 rebooking, and cheaper compliance monitoring than roadside stop-and-check operations.
- **Stakeholder Map:** A two-column view of (a) who benefits and (b) who may be displaced or reshaped. For the displaced group, note their possible new function if one exists, or mark them as "no future role" for reference.
- **Risks & Mitigation:** Legal risk (requires DOT/RTMC framework), supervision liability, data privacy (POPIA), public perception — with mitigation notes for each.
- **Call to Action:** Download a DOT PDF proposal and a link back to the main DOT presentation.

### 2. PDF export
Use `jsPDF` + `jspdf-autotable` (already used in `DOTPresentation.tsx`) to generate a 3–4 page PDF from the same content, titled appropriately for DOT circulation.

### 3. Route and navigation
- Register `/dot-road-competency-pilot` in `src/App.tsx`.
- Add a prominent link from `/dot-presentation` to the new page, so the DOT presentation can point to this deeper pilot concept.
- Use the existing `GlobalHeader` for back/home navigation; no new navigation shell needed.

### 4. Design and code constraints
- Use the project’s semantic design tokens and shadcn components (no hardcoded colours).
- Keep the page responsive and accessible.
- Set a real, app-specific `<title>` and `<meta name="description">` via the existing page-level metadata approach.
- No Supabase schema changes or backend work; this is a presentation/mockup only.
- Respect the MTN initiative separation constraint: no MTN references anywhere in the new page or PDF.

## Out of scope
- Real driver competency tracking database or API.
- Integration with RTMC/DoT systems.
- Insurance underwriting logic.
- Legal/legislative drafting beyond the proposal text.

## Verification
- Run the dev build to confirm the route renders and no TypeScript errors.
- Open the page in the preview, take a screenshot, and confirm the PDF download button works.
- Check that the link from `/dot-presentation` is visible and navigates correctly.
