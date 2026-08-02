## Goal

Keep verification (so nobody can impersonate a driver by typing their number) while making sure an elderly passenger never touches an OTP screen, and a driver/marshal sees a code roughly once a quarter at most.

Two parts: **passengers stop needing accounts**, and **staff-role OTP becomes near-invisible with 90-day sessions**.

---

## Part 1 — Passengers skip accounts entirely

- Turn the passenger entry point into a no-login browsing experience: fare estimator, zone availability, driver map and passenger rights are all viewable without signing in.
- A hail/booking that needs an identity prompts sign-in only at that moment ("continue as guest" stays available for cash/card riders).
- Add a **marshal-side trip logging panel** on the Marshall dashboard: marshal picks the zone, vehicle/driver from the queue, passenger count and payment method (cash / card / app), and logs the trip. This is what captures the fare data for riders with no phone or no account — reusing the existing queue and revenue tables rather than new ones.
- Passenger-facing copy changes from "Login" to "Browse rides" so the aged aren't confronted with an auth wall.

## Part 2 — Near-invisible OTP for driver / owner / marshal / admin

- **Auto-fill the code.** Add `autocomplete="one-time-code"` and the browser WebOTP API (`navigator.credentials.get({ otp: ... })`) on the code screen. On Android/Chrome the code drops into the field by itself the moment the SMS lands — no switching apps, no typing. Silent no-op on browsers that don't support it.
- **Auto-submit** once six digits are present, so there is no "now press Verify" step.
- **Format the SMS** so the code is at the front and the message carries the WebOTP binding line, which is what makes auto-fill work.
- **One number field.** Consolidate the sign-in screen to a single large phone input with the `+27` prefix already shown, big touch targets, and no competing email / Google / "forgot password" options crowding it. Email and Google move behind a small "other ways to sign in" link.
- **Stay signed in.** Persist the session in `localStorage` (already the case) and stop treating a returning user as unauthenticated — the app should route them straight to their dashboard rather than back to the phone screen.
- **Trusted-device memory**: remember the last used number on the device so a returning user just taps "Send code to •••• 0673" rather than re-typing it.

## Part 3 — 90-day sessions (one manual step)

Session lifetime is enforced by Supabase, not app code. In your Supabase dashboard under Authentication → Sessions, set the **inactivity timeout / refresh-token expiry to 90 days** and leave refresh-token rotation on. The app already auto-refreshes tokens, so once that's set a signed-in driver stops seeing OTP screens for 90 days of regular use. I'll flag exactly where to click; I can't change external-Supabase auth settings from here.

---

## Technical notes

- Edit `src/components/auth/SmsOtpAuth.tsx` (WebOTP, auto-submit, single-field layout) and `src/pages/Auth.tsx` (de-emphasise email/Google, remove the redundant second phone form and the password-reset entry for phone-first users).
- `src/hooks/useSmsOtp.ts` gains a "remember last number" helper; the existing invoke + direct-fetch fallback stays as-is.
- SMS body change in `supabase/functions/sms-otp/index.ts` to add the WebOTP `@domain #code` binding line.
- New `src/components/marshal/MarshalTripLogger.tsx` mounted on `MarshallDashboard.tsx`, writing through existing queue/revenue tables.
- Passenger route guard relaxed so the passenger view renders for anonymous visitors; only booking actions require a session.

## Not doing

- Number-only login with no verification — it would let anyone sign in as any driver and read earnings, panic alerts and AARTO records.
- Biometrics or PINs as a replacement for OTP.
- Any change to admin whitelist behaviour.
