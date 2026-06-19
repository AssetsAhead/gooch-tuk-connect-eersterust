## Concept: "Drive-to-Own" Pathway

Moove's model (za.moove.io) gives drivers a vehicle with no credit check, then converts weekly earnings into instalments until they own the car. It works because Moove monitors telematics, enforces revenue share, and bundles maintenance.

We already have the ingredients Moove charges for: live GPS (`live_vehicle_locations`), driver reputation (`driver_reputation`), trip revenue (`trip_revenue`), maintenance (`maintenance_expenses`), infringements (`road_infringements`), clocking (`driver_clockings`), and fleet ownership (`fleet_vehicles`). What's missing is the **ownership pathway** that rewards exceptional drivers.

### How our model improves on Moove

| Lever | Moove | MojaRide Drive-to-Own |
|---|---|---|
| Eligibility | Application + ID | Earned via reputation score, compliance, clocking streak, digital-payment ratio |
| Pricing | Fixed weekly deduction | Dynamic — discounts for AARTO-clean, biometric clock-in, low-noise driving |
| Risk | Moove carries it alone | Association co-signs; revenue share funds the buffer |
| Upside | Driver eventually owns car | Driver also earns equity in route slot + reputation NFT-style credential |
| Exit | Default = repossession | Graduated: warning → mentor pairing → reassignment, repossession last |

### Build scope (Phase 1 — UI + data model only, no payments yet)

**1. Database (one migration)**
- `drive_to_own_programs` — tier definitions (Bronze/Silver/Gold/Platinum), weekly contribution %, months to ownership, eligibility thresholds.
- `drive_to_own_enrollments` — driver_id, vehicle_id, program_tier, start_date, target_ownership_date, total_contributed, balance_remaining, status (eligible/active/paused/completed/exited).
- `drive_to_own_milestones` — enrollment_id, milestone_type (10%, 25%, 50%, 75%, 100%), reached_at, bonus_awarded.
- All with GRANTs + RLS (driver sees own; admin/owner sees all).

**2. Eligibility engine (DB function)**
`calculate_drive_to_own_eligibility(driver_id)` returns tier + score using:
- reputation score ≥ 80 (Bronze) / 90 (Gold) / 95 (Platinum)
- 0 confirmed infringements in last 90 days
- biometric clock-in ratio ≥ 70%
- digital payment ratio ≥ 60%
- minimum 6 months active

**3. Pages**
- `/drive-to-own` (driver-facing) — current eligibility, tier progress bars, projected ownership date, "what to improve" coaching list, leaderboard of enrolled drivers.
- Owner/Admin tab in existing `OwnerDashboard` — manage program tiers, view enrolled drivers' contribution flow, approve graduations.

**4. Comparison page** — `/drive-to-own/vs-moove` static investor/driver comparison (Moove vs MojaRide) with the table above, for recruitment.

**5. Reputation hook** — extend `driver_reputation` reads in `EnhancedDriverIncentives` to show Drive-to-Own progress alongside existing achievements.

### Out of scope for this phase (flag for later)
- Actual payment collection / Yoco recurring debit
- Legal agreement generation (covered by existing agreements roadmap)
- Insurance bundling
- Vehicle title transfer workflow

### Files to add/edit
- `supabase/migrations/...` (new) — tables, function, RLS, GRANTs
- `src/pages/DriveToOwn.tsx` (new)
- `src/pages/DriveToOwnVsMoove.tsx` (new)
- `src/components/driver/DriveToOwnProgress.tsx` (new)
- `src/components/dashboards/OwnerDashboard.tsx` (edit — add tab)
- `src/App.tsx` (edit — routes)

Estimated effort: ~1 build pass. No new secrets, no edge functions, no costs.