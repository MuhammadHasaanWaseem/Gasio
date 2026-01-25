
export type Country = {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
};

export function normalizeDialCode(dialCode: string): string {
  const digits = String(dialCode || '').replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
}

export function findCountryByStoredCode(
  countries: Country[],
  stored: unknown
): Country | null {
  if (!stored) return null;

  const raw = String(stored).trim();
  if (!raw) return null;

  const byIso = countries.find((c) => c.code.toUpperCase() === raw.toUpperCase());
  if (byIso) return byIso;

  const storedDial = normalizeDialCode(raw);
  if (!storedDial) return null;

  return (
    countries.find((c) => normalizeDialCode(c.dial_code) === storedDial) ?? null
  );
}

export function toE164Phone(localDigits: string, country: Country): string {
  const dial = normalizeDialCode(country.dial_code);
  const local = String(localDigits || '').replace(/[^\d]/g, '');
  return `${dial}${local}`;
}

export function splitE164ToLocal(
  fullPhone: unknown,
  country: Country | null
): string {
  const raw = String(fullPhone || '').trim();
  if (!raw) return '';

  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!country) return digitsOnly;

  const dialDigits = normalizeDialCode(country.dial_code).replace(/[^\d]/g, '');
  if (!dialDigits) return digitsOnly;

  const looksLikeE164 =
    raw.startsWith('+') ||
    raw.startsWith(normalizeDialCode(country.dial_code)) ||
    (digitsOnly.startsWith(dialDigits) && digitsOnly.length > dialDigits.length + 6);

  if (!looksLikeE164) return digitsOnly;

  return digitsOnly.startsWith(dialDigits)
    ? digitsOnly.slice(dialDigits.length)
    : digitsOnly;
}

