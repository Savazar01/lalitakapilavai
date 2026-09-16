export interface ThemeCommonConfig {
  fontHeading: string;
  fontBody: string;
  baseFontSize: string;
  borderWidth: string;
  borderRadius: string;
  lineHeight: string;
}

export interface FormThemeTokens {
  formCardBg: string;           // Light: "#FFFFFF", Dark: "#151B26"
  formLabelColor: string;       // Light: "#0F172A", Dark: "#F8FAFC"
  formInputBg: string;          // Light: "#FFFFFF", Dark: "#0B0F17"
  formInputText: string;        // Light: "#0F172A", Dark: "#F8FAFC"
  formPlaceholderColor: string; // Light: "#64748B", Dark: "#94A3B8"
  formInputBorderColor: string; // Light: "#CBD5E1", Dark: "#334155"
  formFocusRingColor: string;   // Light: "#D97706", Dark: "#F59E0B"
  formSubmitBtnBg: string;      // Light: "#D97706", Dark: "#F59E0B"
  formSubmitBtnText: string;    // Light: "#FFFFFF", Dark: "#0F172A"
  formSubmitBtnHover?: string;  // Light: "#B45309", Dark: "#D97706"
}

export interface ThemeModeTokens extends FormThemeTokens {
  canvasBg: string;
  cardBg: string;
  borderColor: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnPrimaryHover?: string;
  btnSecondaryBg: string;
  btnSecondaryText: string;
  btnSecondaryHover?: string;
  activePillBg: string;
  activePillText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface DetailedThemeConfig {
  common: ThemeCommonConfig;
  light: ThemeModeTokens;
  dark: ThemeModeTokens;
}

export const DEFAULT_DETAILED_THEME_CONFIG: DetailedThemeConfig = {
  common: {
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    baseFontSize: "16px",
    borderWidth: "1.5px",
    borderRadius: "0.5rem",
    lineHeight: "1.6",
  },
  light: {
    canvasBg: "#F4F5F7",
    cardBg: "#FFFFFF",
    borderColor: "#CBD5E1",
    headingColor: "#0F172A",
    bodyColor: "#1E293B",
    mutedColor: "#475569",
    btnPrimaryBg: "#0F172A",
    btnPrimaryText: "#FFFFFF",
    btnPrimaryHover: "#1E293B",
    btnSecondaryBg: "#E2E8F0",
    btnSecondaryText: "#0F172A",
    btnSecondaryHover: "#CBD5E1",
    activePillBg: "#0F172A",
    activePillText: "#FFFFFF",
    badgeBg: "#FEF3C7",
    badgeText: "#78350F",
    badgeBorder: "#FCD34D",
    formCardBg: "#FFFFFF",
    formLabelColor: "#0F172A",
    formInputBg: "#FFFFFF",
    formInputText: "#0F172A",
    formPlaceholderColor: "#64748B",
    formInputBorderColor: "#CBD5E1",
    formFocusRingColor: "#D97706",
    formSubmitBtnBg: "#D97706",
    formSubmitBtnText: "#FFFFFF",
    formSubmitBtnHover: "#B45309",
  },
  dark: {
    canvasBg: "#0B0F17",
    cardBg: "#151B26",
    borderColor: "#1E293B",
    headingColor: "#F8FAFC",
    bodyColor: "#F8FAFC",
    mutedColor: "#94A3B8",
    btnPrimaryBg: "#D4AF37",
    btnPrimaryText: "#0B0F17",
    btnPrimaryHover: "#E6C65A",
    btnSecondaryBg: "#1E293B",
    btnSecondaryText: "#F8FAFC",
    btnSecondaryHover: "#2A374A",
    activePillBg: "#D4AF37",
    activePillText: "#0B0F17",
    badgeBg: "#451A03",
    badgeText: "#FDE68A",
    badgeBorder: "#92400E",
    formCardBg: "#151B26",
    formLabelColor: "#F8FAFC",
    formInputBg: "#0B0F17",
    formInputText: "#F8FAFC",
    formPlaceholderColor: "#94A3B8",
    formInputBorderColor: "#334155",
    formFocusRingColor: "#F59E0B",
    formSubmitBtnBg: "#F59E0B",
    formSubmitBtnText: "#0F172A",
    formSubmitBtnHover: "#D97706",
  },
};

export const HEADING_FONT_OPTIONS = [
  { label: "Playfair Display (Classical Serif)", value: "Playfair Display" },
  { label: "Cinzel (Royal Epigraphic)", value: "Cinzel" },
  { label: "Cormorant Garamond (Graceful Serif)", value: "Cormorant Garamond" },
  { label: "Inter (Modern Geometric Sans)", value: "Inter" },
  { label: "Outfit (Clean Architectural Sans)", value: "Outfit" },
];

export const BODY_FONT_OPTIONS = [
  { label: "Inter (Neutral High-Legibility Sans)", value: "Inter" },
  { label: "Cormorant Garamond (Literary Serif)", value: "Cormorant Garamond" },
  { label: "Outfit (Warm Display Sans)", value: "Outfit" },
  { label: "Playfair Display (Editorial Serif)", value: "Playfair Display" },
];

export const BORDER_WIDTH_OPTIONS = [
  { label: "Thin (1px)", value: "1px" },
  { label: "Standard (1.5px)", value: "1.5px" },
  { label: "Pronounced (2px)", value: "2px" },
  { label: "Bold (2.5px)", value: "2.5px" },
  { label: "Heavy (3px)", value: "3px" },
  { label: "Super Heavy (4px)", value: "4px" },
  { label: "Display Archival (5px)", value: "5px" },
];

export const BORDER_RADIUS_OPTIONS = [
  { label: "Sharp / Square (0px)", value: "0px" },
  { label: "Subtle (0.25rem / 4px)", value: "0.25rem" },
  { label: "Standard (0.5rem / 8px)", value: "0.5rem" },
  { label: "Soft (0.75rem / 12px)", value: "0.75rem" },
  { label: "Pill / Rounded (1rem / 16px)", value: "1rem" },
];

export const FONT_SIZE_OPTIONS = [
  { label: "Compact (13px)", value: "13px" },
  { label: "Small (14px)", value: "14px" },
  { label: "Medium (15px)", value: "15px" },
  { label: "Standard (16px)", value: "16px" },
  { label: "Comfortable (18px)", value: "18px" },
  { label: "Large (20px)", value: "20px" },
  { label: "Extra Large (22px)", value: "22px" },
  { label: "Archival Display (24px)", value: "24px" },
];

export const LINE_HEIGHT_OPTIONS = [
  { label: "Tight (1.4)", value: "1.4" },
  { label: "Standard (1.5)", value: "1.5" },
  { label: "Relaxed (1.6)", value: "1.6" },
  { label: "Expansive (1.75)", value: "1.75" },
];

// Helper to sanitize an unknown JSON payload into a valid DetailedThemeConfig
export function sanitizeDetailedThemeConfig(raw: unknown): DetailedThemeConfig {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_DETAILED_THEME_CONFIG };
  }

  const input = raw as Partial<DetailedThemeConfig>;
  const cleanColor = (val: unknown, fallback: string) =>
    typeof val === "string" && val.trim().length > 0 && val.trim().length <= 50
      ? val.trim()
      : fallback;

  const cleanString = (val: unknown, fallback: string) =>
    typeof val === "string" && val.trim().length > 0 && val.trim().length <= 100
      ? val.trim()
      : fallback;

  const common: ThemeCommonConfig = {
    fontHeading: cleanString(input.common?.fontHeading, DEFAULT_DETAILED_THEME_CONFIG.common.fontHeading),
    fontBody: cleanString(input.common?.fontBody, DEFAULT_DETAILED_THEME_CONFIG.common.fontBody),
    baseFontSize: cleanString(input.common?.baseFontSize, DEFAULT_DETAILED_THEME_CONFIG.common.baseFontSize),
    borderWidth: cleanString(input.common?.borderWidth, DEFAULT_DETAILED_THEME_CONFIG.common.borderWidth),
    borderRadius: cleanString(input.common?.borderRadius, DEFAULT_DETAILED_THEME_CONFIG.common.borderRadius),
    lineHeight: cleanString(input.common?.lineHeight, DEFAULT_DETAILED_THEME_CONFIG.common.lineHeight),
  };

  const sanitizeMode = (mode: Partial<ThemeModeTokens> | undefined, defaults: ThemeModeTokens): ThemeModeTokens => ({
    canvasBg: cleanColor(mode?.canvasBg, defaults.canvasBg),
    cardBg: cleanColor(mode?.cardBg, defaults.cardBg),
    borderColor: cleanColor(mode?.borderColor, defaults.borderColor),
    headingColor: cleanColor(mode?.headingColor, defaults.headingColor),
    bodyColor: cleanColor(mode?.bodyColor, defaults.bodyColor),
    mutedColor: cleanColor(mode?.mutedColor, defaults.mutedColor),
    btnPrimaryBg: cleanColor(mode?.btnPrimaryBg, defaults.btnPrimaryBg),
    btnPrimaryText: cleanColor(mode?.btnPrimaryText, defaults.btnPrimaryText),
    btnPrimaryHover: cleanColor(mode?.btnPrimaryHover, defaults.btnPrimaryHover || defaults.btnPrimaryBg),
    btnSecondaryBg: cleanColor(mode?.btnSecondaryBg, defaults.btnSecondaryBg),
    btnSecondaryText: cleanColor(mode?.btnSecondaryText, defaults.btnSecondaryText),
    btnSecondaryHover: cleanColor(mode?.btnSecondaryHover, defaults.btnSecondaryHover || defaults.btnSecondaryBg),
    activePillBg: cleanColor(mode?.activePillBg, defaults.activePillBg),
    activePillText: cleanColor(mode?.activePillText, defaults.activePillText),
    badgeBg: cleanColor(mode?.badgeBg, defaults.badgeBg),
    badgeText: cleanColor(mode?.badgeText, defaults.badgeText),
    badgeBorder: cleanColor(mode?.badgeBorder, defaults.badgeBorder),
    formCardBg: cleanColor(mode?.formCardBg, defaults.formCardBg),
    formLabelColor: cleanColor(mode?.formLabelColor, defaults.formLabelColor),
    formInputBg: cleanColor(mode?.formInputBg, defaults.formInputBg),
    formInputText: cleanColor(mode?.formInputText, defaults.formInputText),
    formPlaceholderColor: cleanColor(mode?.formPlaceholderColor, defaults.formPlaceholderColor),
    formInputBorderColor: cleanColor(mode?.formInputBorderColor, defaults.formInputBorderColor),
    formFocusRingColor: cleanColor(mode?.formFocusRingColor, defaults.formFocusRingColor),
    formSubmitBtnBg: cleanColor(mode?.formSubmitBtnBg, defaults.formSubmitBtnBg),
    formSubmitBtnText: cleanColor(mode?.formSubmitBtnText, defaults.formSubmitBtnText),
    formSubmitBtnHover: cleanColor(mode?.formSubmitBtnHover, defaults.formSubmitBtnHover || defaults.formSubmitBtnBg),
  });

  return {
    common,
    light: sanitizeMode(input.light, DEFAULT_DETAILED_THEME_CONFIG.light),
    dark: sanitizeMode(input.dark, DEFAULT_DETAILED_THEME_CONFIG.dark),
  };
}

// Generate the global runtime CSS string targeting both public :root and .admin-scope
export function generateUnifiedThemeCSS(theme: DetailedThemeConfig): string {
  const fontHeadingFamily = `'${theme.common.fontHeading}', Georgia, serif`;
  const fontBodyFamily = `'${theme.common.fontBody}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  return `
    :root, .admin-scope {
      --token-text-dark: #0F172A;
      --token-text-light: #FFFFFF;
      --background: ${theme.light.canvasBg};
      --card: ${theme.light.cardBg};
      --border: ${theme.light.borderColor};
      --foreground: ${theme.light.bodyColor};
      --muted-foreground: ${theme.light.mutedColor};
      --primary: ${theme.light.btnPrimaryBg};
      --primary-foreground: ${theme.light.btnPrimaryText};
      --primary-hover: ${theme.light.btnPrimaryHover || theme.light.btnPrimaryBg};
      --secondary: ${theme.light.btnSecondaryBg};
      --secondary-foreground: ${theme.light.btnSecondaryText};
      --secondary-hover: ${theme.light.btnSecondaryHover || theme.light.btnSecondaryBg};
      --headings: ${theme.light.headingColor};
      --active-pill-bg: ${theme.light.activePillBg};
      --active-pill-text: ${theme.light.activePillText};
      --badge-bg: ${theme.light.badgeBg};
      --badge-text: ${theme.light.badgeText};
      --badge-border: ${theme.light.badgeBorder};
      --border-width: ${theme.common.borderWidth};
      --radius: ${theme.common.borderRadius};
      --font-heading: ${fontHeadingFamily};
      --font-body: ${fontBodyFamily};
      --base-font-size: ${theme.common.baseFontSize};
      --line-height: ${theme.common.lineHeight};

      /* Form Design Tokens */
      --form-card-bg: ${theme.light.formCardBg};
      --form-label-color: ${theme.light.formLabelColor};
      --form-input-bg: ${theme.light.formInputBg};
      --form-input-text: ${theme.light.formInputText};
      --form-placeholder-color: ${theme.light.formPlaceholderColor};
      --form-input-border: ${theme.light.formInputBorderColor};
      --form-input-border-width: ${theme.common.borderWidth || "1.5px"};
      --form-focus-ring-color: ${theme.light.formFocusRingColor};
      --form-btn-bg: ${theme.light.formSubmitBtnBg};
      --form-btn-text: ${theme.light.formSubmitBtnText};
      --form-btn-hover: ${theme.light.formSubmitBtnHover || theme.light.formSubmitBtnBg};
    }

    .dark, .dark .admin-scope {
      --background: ${theme.dark.canvasBg};
      --card: ${theme.dark.cardBg};
      --border: ${theme.dark.borderColor};
      --foreground: ${theme.dark.bodyColor};
      --muted-foreground: ${theme.dark.mutedColor};
      --primary: ${theme.dark.btnPrimaryBg};
      --primary-foreground: ${theme.dark.btnPrimaryText};
      --primary-hover: ${theme.dark.btnPrimaryHover || theme.dark.btnPrimaryBg};
      --secondary: ${theme.dark.btnSecondaryBg};
      --secondary-foreground: ${theme.dark.btnSecondaryText};
      --secondary-hover: ${theme.dark.btnSecondaryHover || theme.dark.btnSecondaryBg};
      --headings: ${theme.dark.headingColor};
      --active-pill-bg: ${theme.dark.activePillBg};
      --active-pill-text: ${theme.dark.activePillText};
      --badge-bg: ${theme.dark.badgeBg};
      --badge-text: ${theme.dark.badgeText};
      --badge-border: ${theme.dark.badgeBorder};

      /* Form Design Tokens */
      --form-card-bg: ${theme.dark.formCardBg};
      --form-label-color: ${theme.dark.formLabelColor};
      --form-input-bg: ${theme.dark.formInputBg};
      --form-input-text: ${theme.dark.formInputText};
      --form-placeholder-color: ${theme.dark.formPlaceholderColor};
      --form-input-border: ${theme.dark.formInputBorderColor};
      --form-input-border-width: ${theme.common.borderWidth || "1.5px"};
      --form-focus-ring-color: ${theme.dark.formFocusRingColor};
      --form-btn-bg: ${theme.dark.formSubmitBtnBg};
      --form-btn-text: ${theme.dark.formSubmitBtnText};
      --form-btn-hover: ${theme.dark.formSubmitBtnHover || theme.dark.formSubmitBtnBg};
    }

    /* Universal Typography & Border Application */
    h1, h2, h3, h4, h5, h6, .font-serif {
      font-family: var(--font-heading, ${fontHeadingFamily});
      color: var(--headings, inherit);
    }

    body {
      font-family: var(--font-body, ${fontBodyFamily});
      font-size: var(--base-font-size, 16px);
      line-height: var(--line-height, 1.6);
    }

    /* Apply custom border thickness to all bordered containers and primitives */
    .border,
    [class*="border-[1.5px]"],
    .card,
    [data-slot="card"],
    input:not([type="checkbox"]):not([type="radio"]),
    textarea,
    select,
    table th,
    table td {
      border-width: var(--border-width, 1.5px);
    }
  `;
}
