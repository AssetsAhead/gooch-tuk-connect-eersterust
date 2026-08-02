const KEY = 'poortlink.last_phone';

/** Remember the last verified phone number on this device so returning users
 *  (often elderly passengers or drivers) never have to retype it. */
export function rememberPhone(phone: string) {
  try {
    if (phone) localStorage.setItem(KEY, phone);
  } catch {
    /* storage unavailable (private mode) — silently skip */
  }
}

export function getRememberedPhone(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetPhone() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** "+27826370673" -> "•••• 0673" */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `•••• ${digits.slice(-4)}`;
}
