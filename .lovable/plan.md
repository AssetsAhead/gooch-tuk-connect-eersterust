# Fix header overlap + add "In-Vehicle Theory Test" concept

## 1. Rendering overlap fix (Business Heroes Portal)

The screenshot shows the "← Back to Dashboard" button sitting on top of the global app header (brand name, search bar), hiding them.

Cause (verified in code): `src/pages/BusinessPortal.tsx` renders its own back button as `fixed top-4 left-4 z-50`, while `src/components/GlobalHeader.tsx` is `fixed top-0 ... h-12 z-40`. The page button floats over the header.

Fix:
- Remove the floating fixed back button from `BusinessPortal.tsx` and place it inline at the top of the page container (normal document flow, above the hero), so it can never cover the header.
- Keep the existing top padding so content still clears the fixed header.
- Leave the bottom-right "Dashboard" button as is (it does not collide).
- Sweep other pages for the same `fixed top-4 ... z-50` back-button pattern and apply the same inline treatment where found, so the category of bug is fixed rather than just this instance.

## 2. Re-thinking the written (theory) exam — new page section

Add a new section to `src/pages/DOTRoadCompetencyPilot.tsx` titled **"Rethinking the Written Test: In-Vehicle Theory Assessment"**, presented as a concept for DOT consideration (not a claim of approval).

Concept content:
- **Problem:** the K53 written test forces booking, queueing and trips to a testing station; slots are scarce and re-bookings multiply cost for both the candidate and the state.
- **Proposal — a "double physical" test:** the theory component is delivered through the platform in the real driving environment rather than in a classroom, so one supervised session evidences both knowledge and control.
- **Two safe delivery modes** (explicitly never while the candidate is driving):
  1. *Stationary micro-assessments* — short question sets triggered when the vehicle is confirmed stationary (GPS speed zero, handbrake/parked state), e.g. at a loading zone between trips.
  2. *Live situational recognition* — voice-prompted questions answered verbally, tied to what the road actually presents (sign recognition, right-of-way, following distance), captured by the dashcam and scored afterwards from the recorded clip, with the mentor/examiner present.
- **Integrity controls:** biometric login binds every answer to the candidate; question sets are randomised per session; GPS, dashcam and timestamps form the audit trail; a registered mentor/examiner co-signs each session.
- **What it replaces vs what it does not:** replaces the booked classroom sitting; does not replace DOT's authority to set, mark or certify the standard — the platform submits an evidence pack, DOT issues the outcome.
- **Savings and access:** fewer station visits, fewer no-shows and re-bookings, less testing-station congestion, and reach into areas far from a testing centre.
- **Open questions for DOT** (stated honestly): legal status of a distributed theory assessment, examiner accreditation, distraction/safety rules, and question-bank custody.

Also extend the page's existing PDF generator with a matching section so the printed proposal stays in sync, and keep the existing non-infringement / unsolicited-concept disclaimers applying to this section too.

## Technical notes
- Files touched: `src/pages/BusinessPortal.tsx` (layout only), `src/pages/DOTRoadCompetencyPilot.tsx` (new content section + PDF section), plus any other page found with the same overlapping fixed back button.
- Semantic design tokens and existing shadcn Card/Alert/Badge patterns only; no new colours.
- No database, backend or route changes; content and presentation only.

## Out of scope
- Building an actual question bank, scoring engine or exam runtime.
- Any integration with DOT/RTMC systems.
