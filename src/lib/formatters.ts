/**
 * Lalita Kapilavai Cultural Archive — Internationalization (i18n) & Localization (l10n)
 * Multi-Currency & Ordinal Timezone-Aware Date Formatters
 */

export const SUPPORTED_CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR ₹)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD $)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR €)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP £)" },
  { code: "AED", symbol: "AED", label: "UAE Dirham (AED)" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar (SGD S$)" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar (CAD CA$)" },
  { code: "AUD", symbol: "AU$", label: "Australian Dollar (AUD AU$)" },
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]["code"];

/**
 * Format numeric or Decimal prices with localized currency symbols and grouping
 */
export function formatCurrency(
  amount: number | string | { toString(): string } | null | undefined,
  currency: string = "INR",
  locale?: string
): string {
  if (amount === null || amount === undefined || amount === "") {
    return "Price on Request";
  }

  const numericValue =
    typeof amount === "number"
      ? amount
      : parseFloat(amount.toString().replace(/[^0-9.-]+/g, ""));

  if (isNaN(numericValue)) {
    return "Price on Request";
  }

  if (numericValue === 0) {
    return "Complimentary / Free RSVP";
  }

  const upperCurrency = (currency || "INR").toUpperCase();

  // Pick suitable default locale for currency if not specified
  const effectiveLocale =
    locale ||
    (upperCurrency === "INR"
      ? "en-IN"
      : upperCurrency === "USD"
      ? "en-US"
      : upperCurrency === "GBP"
      ? "en-GB"
      : upperCurrency === "EUR"
      ? "de-DE"
      : upperCurrency === "AED"
      ? "en-AE"
      : upperCurrency === "SGD"
      ? "en-SG"
      : "en-US");

  try {
    return new Intl.NumberFormat(effectiveLocale, {
      style: "currency",
      currency: upperCurrency,
      maximumFractionDigits: numericValue % 1 === 0 ? 0 : 2,
    }).format(numericValue);
  } catch {
    // Fallback if unrecognized currency code
    return `${upperCurrency} ${numericValue.toLocaleString()}`;
  }
}

/**
 * Helper to get ordinal suffix: 1st, 2nd, 3rd, 4th, 21st, 22nd...
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Formats dates with ordinal day and timezone notation:
 * Example: "12th September 2026, 6:30 PM (IST)"
 */
export function formatLocalizedDateTime(
  date: Date | string,
  timezone: string = "Asia/Kolkata",
  locale: string = "en-US"
): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  try {
    // Extract day in target timezone
    const dayFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      day: "numeric",
    });
    const day = parseInt(dayFormatter.format(d), 10);
    const suffix = getOrdinalSuffix(day);

    // Extract Month and Year
    const monthYearFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      month: "long",
      year: "numeric",
    });
    const monthYearParts = monthYearFormatter.formatToParts(d);
    const month = monthYearParts.find((p) => p.type === "month")?.value || "";
    const year = monthYearParts.find((p) => p.type === "year")?.value || "";

    // Extract Time (Hour, Minute, DayPeriod)
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
    const timeParts = timeFormatter.formatToParts(d);
    const hour = timeParts.find((p) => p.type === "hour")?.value || "";
    const minute = timeParts.find((p) => p.type === "minute")?.value || "";
    const dayPeriod =
      timeParts.find((p) => p.type === "dayPeriod")?.value || "";
    const tzName =
      timeParts.find((p) => p.type === "timeZoneName")?.value || timezone;

    return `${day}${suffix} ${month} ${year}, ${hour}:${minute} ${dayPeriod} (${tzName})`;
  } catch {
    // Fallback if timezone is invalid
    return d.toLocaleString(locale);
  }
}
