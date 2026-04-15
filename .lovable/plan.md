

## Plan: Enhanced Hailing Buttons + Cross-Portal Availability

### 1. QuickHailButton — Shocking Green + Pointer Animation
**File:** `src/components/hailing/QuickHailButton.tsx`
- Replace gradient from `from-primary` to shocking green (`from-green-500 via-green-400 to-emerald-500`)
- Replace `Zap` icon with `Pointer` from lucide-react (index finger pressing)
- Add animated "tap" motion using a CSS class that bobs the pointer up and down
- Update pulse rings to green

### 2. VoiceHailButton — Canary Yellow + Speak Icon
**File:** `src/components/hailing/VoiceHailButton.tsx`
- Change default button from `variant="outline"` to custom canary yellow background (`bg-yellow-400 text-black hover:bg-yellow-300`)
- Add `Volume2` icon next to `Mic` icon so non-readers understand "speak here"
- Increase size slightly for prominence

### 3. CSS Animation
**File:** `src/index.css`
- Add `@keyframes tap-bounce` — a subtle up-down bob animation for the Pointer icon
- Add `animate-tap-bounce` utility

### 4. Add Hailing to All Dashboards
Currently SmartHailCard only appears in `PassengerDashboard`. Add a compact "Quick Hail" strip (QuickHailButton + VoiceHailButton side by side) to:
- `src/components/dashboards/DriverDashboard.tsx` — helps drivers test / demo the system
- `src/components/dashboards/MarshallDashboard.tsx` — marshalls hail on behalf of phoneless passengers
- `src/components/dashboards/OwnerDashboard.tsx` — owners can assist users
- `src/components/dashboards/AdminDashboard.tsx` — admin testing access

Each will get a small "Hail a Ride" card with both buttons, using the same props pattern as PassengerDashboard.

### Files Changed
| File | Change |
|------|--------|
| `src/components/hailing/QuickHailButton.tsx` | Green gradient, Pointer icon, tap animation |
| `src/components/hailing/VoiceHailButton.tsx` | Canary yellow, Volume2+Mic icons |
| `src/index.css` | `tap-bounce` keyframe |
| `src/components/dashboards/MarshallDashboard.tsx` | Add hail buttons |
| `src/components/dashboards/DriverDashboard.tsx` | Add hail buttons |
| `src/components/dashboards/OwnerDashboard.tsx` | Add hail buttons |
| `src/components/dashboards/AdminDashboard.tsx` | Add hail buttons |

