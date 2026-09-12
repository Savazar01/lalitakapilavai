/**
 * Theme Contrast Engine & Perceived Luminance Utilities
 *
 * Ensures that components with explicit background colors or image scrims
 * lock their typography contrast scope independently of global .dark / .light mode.
 */

/**
 * Computes perceived brightness of a hex color (0 to 255) using
 * the ITU-R BT.709 relative luminance formula.
 */
export function getPerceivedLuminance(hexColor: string): number {
  if (!hexColor) return 128; // neutral fallback
  let hex = hexColor.replace("#", "").trim();

  // Expand shorthand 3-digit hex (e.g. #fff -> #ffffff)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Handle 8-digit hex (with alpha) by trimming to 6
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }

  if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) {
    // Check known named colors or neutral fallback
    const lower = hexColor.toLowerCase().trim();
    if (lower === "white" || lower === "#fff" || lower === "#ffffff") return 255;
    if (lower === "black" || lower === "#000" || lower === "#000000") return 0;
    return 128;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // ITU-R BT.709 relative luminance formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export type ContrastMode = "light-bg" | "dark-bg" | "auto";

export interface BackgroundStyleConfig {
  backgroundMode?: "color" | "pattern" | "image" | "none" | string;
  backgroundType?: "COLOR" | "PATTERN" | "IMAGE" | string;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  overlayOpacity?: number | null;
  backgroundPattern?: string | null;
}

/**
 * Determines whether a container requires light text or dark text based on background.
 */
export function resolveContainerContrast(config: BackgroundStyleConfig): ContrastMode {
  const bgMode = (config.backgroundMode || config.backgroundType || "").toLowerCase();

  // 1. Background image with overlay or dark scrim
  if ((bgMode === "image" || config.backgroundImage) && config.backgroundImage) {
    // Hero images with scrim overlays always require high-contrast white text
    return "dark-bg";
  }

  // 2. Explicit background color
  if (config.backgroundColor && config.backgroundColor !== "transparent") {
    const lum = getPerceivedLuminance(config.backgroundColor);
    // Luminance > 140 is considered light (requires dark text)
    return lum > 140 ? "light-bg" : "dark-bg";
  }

  // 3. No explicit background override: defer to active site theme
  return "auto";
}

/**
 * Returns Tailwind wrapper classes for prose and text inheritance based on contrast mode.
 */
export function getContrastTypographyClasses(contrast: ContrastMode): string {
  switch (contrast) {
    case "light-bg":
      // Hard-locks dark text regardless of whether global theme is .dark or .light
      return "text-stone-900 prose-stone dark:text-stone-900 dark:prose-stone [color-scheme:light]";
    case "dark-bg":
      // Hard-locks white text regardless of whether global theme is .dark or .light
      return "text-stone-100 prose-invert dark:text-stone-100 dark:prose-invert [color-scheme:dark]";
    case "auto":
    default:
      // Follows global theme variables
      return "text-foreground prose prose-stone dark:prose-invert";
  }
}

/**
 * Backwards-compatible helper to test if a color is light.
 */
export function isLightColor(colorStr?: string | null): boolean {
  if (!colorStr || colorStr === "transparent") return false;
  return getPerceivedLuminance(colorStr) > 140;
}
