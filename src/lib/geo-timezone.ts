import ct from "countries-and-timezones";

export interface CountryInfo {
  code: string; // ISO Alpha-2 (e.g. "IN", "US")
  name: string;
  defaultCurrency: string;
  defaultTimezone: string;
  dialCode: string;
  postalLabel: string;
  stateLabel: string;
  timezones: string[];
}

export interface TimezoneOption {
  value: string;
  label: string;
  offsetStr: string;
  abbr: string;
}

// Well-known phone dial codes for major nations (with fallback to +1)
const DIAL_CODES: Record<string, string> = {
  IN: "+91",
  US: "+1",
  GB: "+44",
  AE: "+971",
  SG: "+65",
  CA: "+1",
  AU: "+61",
  DE: "+49",
  FR: "+33",
  IT: "+39",
  ES: "+34",
  NL: "+31",
  CH: "+41",
  JP: "+81",
  MY: "+60",
  NZ: "+64",
  ZA: "+27",
  BR: "+55",
  MX: "+52",
  SA: "+966",
  QA: "+974",
  OM: "+968",
  KW: "+965",
  BH: "+973",
  LK: "+94",
  NP: "+977",
  BD: "+880",
  ID: "+62",
  TH: "+66",
  VN: "+84",
  PH: "+63",
  KR: "+82",
  CN: "+86",
  HK: "+852",
  TW: "+886",
  IE: "+353",
  SE: "+46",
  NO: "+47",
  DK: "+45",
  FI: "+358",
  AT: "+43",
  BE: "+32",
  PT: "+351",
  PL: "+48",
};

// Well-known default currencies
const COUNTRY_CURRENCIES: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SG: "SGD",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  CH: "CHF",
  JP: "JPY",
  MY: "MYR",
  NZ: "NZD",
  ZA: "ZAR",
  BR: "BRL",
  MX: "MXN",
  SA: "SAR",
  QA: "QAR",
  OM: "OMR",
  KW: "KWD",
  BH: "BHD",
  LK: "LKR",
  NP: "NPR",
  BD: "BDT",
  ID: "IDR",
  TH: "THB",
  VN: "VND",
  PH: "PHP",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  TW: "TWD",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
};

// Region-adaptive address labels
function getAddressLabels(countryCode: string): { postalLabel: string; stateLabel: string } {
  const code = countryCode.toUpperCase();
  if (code === "IN") return { postalLabel: "PIN Code", stateLabel: "State" };
  if (code === "US") return { postalLabel: "Zip Code", stateLabel: "State" };
  if (code === "CA") return { postalLabel: "Postal Code", stateLabel: "Province" };
  if (code === "AU") return { postalLabel: "Postcode", stateLabel: "State / Territory" };
  if (code === "GB") return { postalLabel: "Postal Code", stateLabel: "County / Region" };
  if (code === "AE") return { postalLabel: "Postal / PO Box Code", stateLabel: "Emirate" };
  if (code === "DE" || code === "FR" || code === "IT" || code === "ES") {
    return { postalLabel: "Postal Code", stateLabel: "Region / Province" };
  }
  return { postalLabel: "Postal / Zip Code", stateLabel: "State / Province / Region" };
}

/**
 * Returns list of all global countries (sorted alphabetically, with India & US at the top for convenience)
 */
export function getAllCountries(): CountryInfo[] {
  const raw = ct.getAllCountries();
  const list: CountryInfo[] = [];

  for (const [code, c] of Object.entries(raw)) {
    const timezones = c.timezones || [];
    const defaultTimezone = timezones[0] || "UTC";
    const defaultCurrency = COUNTRY_CURRENCIES[code] || "USD";
    const dialCode = DIAL_CODES[code] || "+1";
    const { postalLabel, stateLabel } = getAddressLabels(code);

    list.push({
      code,
      name: c.name,
      defaultCurrency,
      defaultTimezone,
      dialCode,
      postalLabel,
      stateLabel,
      timezones,
    });
  }

  // Sort alphabetically by name
  list.sort((a, b) => a.name.localeCompare(b.name));

  // Promote major focal nations to the top of the list for instant access
  const priorityCodes = ["IN", "US", "GB", "AE", "SG", "AU", "CA"];
  const priorityList: CountryInfo[] = [];
  const remainingList: CountryInfo[] = [];

  for (const item of list) {
    if (priorityCodes.includes(item.code)) {
      priorityList.push(item);
    } else {
      remainingList.push(item);
    }
  }

  // Sort priority items by priorityCodes array order
  priorityList.sort((a, b) => priorityCodes.indexOf(a.code) - priorityCodes.indexOf(b.code));

  return [...priorityList, ...remainingList];
}

/**
 * Find country info by name or ISO-2 code
 */
export function findCountry(identifier: string): CountryInfo | null {
  if (!identifier) return null;
  const upper = identifier.trim().toUpperCase();
  const all = getAllCountries();

  // Try matching code first
  const byCode = all.find((c) => c.code === upper);
  if (byCode) return byCode;

  // Try matching exact name
  const byName = all.find((c) => c.name.toLowerCase() === identifier.trim().toLowerCase());
  if (byName) return byName;

  // Partial match
  return all.find((c) => c.name.toLowerCase().includes(identifier.trim().toLowerCase())) || null;
}

/**
 * Returns formatted timezones for a given country code
 */
export function getTimezonesForCountry(countryCode?: string): TimezoneOption[] {
  let tzNames: string[] = [];

  if (countryCode) {
    const country = ct.getCountry(countryCode.toUpperCase());
    if (country && country.timezones && country.timezones.length > 0) {
      tzNames = [...country.timezones];
    }
  }

  // If no country or country has no timezones, fallback to standard global timezones
  if (tzNames.length === 0) {
    tzNames = [
      "Asia/Kolkata",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Dubai",
      "Asia/Singapore",
      "Australia/Sydney",
      "UTC",
    ];
  }

  const now = new Date();
  const options: TimezoneOption[] = [];

  for (const tz of tzNames) {
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
        hour: "numeric",
        hour12: false,
      });
      const parts = dtf.formatToParts(now);
      const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "GMT";

      // Also get short abbreviation (e.g. EDT, IST, BST)
      const abbrDtf = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
        hour: "numeric",
        hour12: false,
      });
      const abbrParts = abbrDtf.formatToParts(now);
      const abbr = abbrParts.find((p) => p.type === "timeZoneName")?.value || "";

      // Clean label: e.g. "America/New_York (UTC-04:00 / EDT)"
      const label = abbr && abbr !== offsetPart ? `${tz} (${offsetPart} / ${abbr})` : `${tz} (${offsetPart})`;

      options.push({
        value: tz,
        label,
        offsetStr: offsetPart,
        abbr,
      });
    } catch {
      options.push({
        value: tz,
        label: tz,
        offsetStr: "",
        abbr: "",
      });
    }
  }

  return options;
}

/**
 * Pure wall-clock UTC calculation:
 * Converts Year, Month (1-12), Day, Hour (0-23), Minute in target IANA timeZone
 * into an accurate UTC Date object.
 * Completely immune to the executing browser's local timezone offset!
 */
export function zonedTimeToUtc(
  year: number,
  month: number, // 1-indexed (1 = Jan, 10 = Oct)
  day: number,
  hour: number, // 0-23
  minute: number,
  timeZone: string
): Date {
  const desiredWall = Date.UTC(year, month - 1, day, hour, minute, 0);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  function getWall(timestamp: number) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const m: Record<string, string> = {};
    for (const p of parts) m[p.type] = p.value;
    let h = parseInt(m.hour, 10);
    if (h === 24) h = 0;
    return Date.UTC(
      parseInt(m.year, 10),
      parseInt(m.month, 10) - 1,
      parseInt(m.day, 10),
      h,
      parseInt(m.minute, 10),
      parseInt(m.second || "0", 10)
    );
  }

  let utc = desiredWall;
  let offset = getWall(utc) - utc;
  utc = desiredWall - offset;

  // Second pass for DST boundary accuracy
  offset = getWall(utc) - utc;
  utc = desiredWall - offset;

  return new Date(utc);
}

/**
 * Extracts wall-clock date & time components in the target IANA timezone
 * from any UTC Date or ISO string.
 */
export function utcToZonedParts(
  utcDate: Date | string | null | undefined,
  timeZone: string = "Asia/Kolkata"
): {
  year: number;
  month: number; // 1-12
  day: number;
  hour12: number; // 1-12
  hour24: number; // 0-23
  minute: number;
  ampm: "AM" | "PM";
  timeZoneAbbr: string;
  isoDateStr: string; // YYYY-MM-DD
} {
  if (!utcDate) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour12: 9,
      hour24: 9,
      minute: 0,
      ampm: "AM",
      timeZoneAbbr: "",
      isoDateStr: now.toISOString().slice(0, 10),
    };
  }

  const d = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  const tz = timeZone || "Asia/Kolkata";

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = dtf.formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;

  const year = parseInt(m.year, 10);
  const month = parseInt(m.month, 10);
  const day = parseInt(m.day, 10);
  let hour24 = parseInt(m.hour, 10);
  if (hour24 === 24) hour24 = 0;
  const minute = parseInt(m.minute, 10);

  const ampm = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  // Extract timezone abbreviation
  const abbrDtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  });
  const abbrParts = abbrDtf.formatToParts(d);
  const timeZoneAbbr = abbrParts.find((p) => p.type === "timeZoneName")?.value || "";

  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  const isoDateStr = `${year}-${mm}-${dd}`;

  return {
    year,
    month,
    day,
    hour12,
    hour24,
    minute,
    ampm,
    timeZoneAbbr,
    isoDateStr,
  };
}

/**
 * Intelligent Single-Day and Multi-Day Event Schedule Formatter:
 * - Same-day: "October 2, 2026 • 8:30 AM – 3:00 PM (EDT)"
 * - Multi-day: "October 2, 2026, 8:30 AM – October 3, 2026, 3:00 PM (EDT)"
 * - No end date: "October 2, 2026, 8:30 AM (EDT)"
 */
export function formatEventSchedule(
  startDate: Date | string,
  endDate?: Date | string | null,
  timeZone: string = "Asia/Kolkata"
): string {
  if (!startDate) return "";

  const startD = typeof startDate === "string" ? new Date(startDate) : startDate;
  if (isNaN(startD.getTime())) return "";

  const tz = timeZone || "Asia/Kolkata";
  const startParts = utcToZonedParts(startD, tz);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const startMonth = monthNames[startParts.month - 1];
  const startMinStr = startParts.minute < 10 ? `0${startParts.minute}` : `${startParts.minute}`;
  const startTimeStr = `${startParts.hour12}:${startMinStr} ${startParts.ampm}`;
  const tzStr = startParts.timeZoneAbbr ? `(${startParts.timeZoneAbbr})` : "";

  // If no valid end date
  if (!endDate) {
    return `${startMonth} ${startParts.day}, ${startParts.year}, ${startTimeStr} ${tzStr}`.trim();
  }

  const endD = typeof endDate === "string" ? new Date(endDate) : endDate;
  if (isNaN(endD.getTime())) {
    return `${startMonth} ${startParts.day}, ${startParts.year}, ${startTimeStr} ${tzStr}`.trim();
  }

  const endParts = utcToZonedParts(endD, tz);
  const endMonth = monthNames[endParts.month - 1];
  const endMinStr = endParts.minute < 10 ? `0${endParts.minute}` : `${endParts.minute}`;
  const endTimeStr = `${endParts.hour12}:${endMinStr} ${endParts.ampm}`;

  // Check if same day
  const isSameDay =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day;

  if (isSameDay) {
    return `${startMonth} ${startParts.day}, ${startParts.year} • ${startTimeStr} – ${endTimeStr} ${tzStr}`.trim();
  }

  // Multi-day
  return `${startMonth} ${startParts.day}, ${startParts.year}, ${startTimeStr} – ${endMonth} ${endParts.day}, ${endParts.year}, ${endTimeStr} ${tzStr}`.trim();
}
