import { locale } from "@/i18n";

export function countryCode(code?: string) {
  return code && /^[a-z]{2}$/i.test(code) ? code.toLowerCase() : undefined;
}

/** Localized country name for an ISO 3166-1 alpha-2 code. */
export function countryName(code?: string) {
  const country = countryCode(code);
  if (!country) return undefined;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(
      country.toUpperCase(),
    );
  } catch {
    return country.toUpperCase();
  }
}
