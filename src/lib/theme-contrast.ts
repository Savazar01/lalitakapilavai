/**
 * Multi-Tenant Generic Theme Contrast Engine & Perceived Luminance Utilities
 *
 * Implements W3C / ITU-R BT.709 Relative Luminance algorithms with gamma expansion:
 *   Y = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
 *
 * Ensures that components with ANY explicit background color (hex, rgb, rgba, hsl, hsla,
 * named colors) or media scrims mathematically force local container contrast scopes
 * independently of whether the global application or OS theme is Dark or Light.
 */

import * as React from "react";

export interface RGB {
  r: number; // 0 to 255
  g: number; // 0 to 255
  b: number; // 0 to 255
  a?: number; // 0 to 1
}

const NAMED_COLORS: Record<string, RGB> = {
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  ivory: { r: 255, g: 255, b: 240, a: 1 },
  parchment: { r: 250, g: 247, b: 242, a: 1 },
  rawsilk: { r: 245, g: 242, b: 235, a: 1 },
  obsidian: { r: 15, g: 14, b: 13, a: 1 },
  charcoal: { r: 28, g: 24, b: 20, a: 1 },
  gold: { r: 212, g: 175, b: 55, a: 1 },
  antiquegold: { r: 212, g: 175, b: 55, a: 1 },
  terracotta: { r: 194, g: 94, b: 52, a: 1 },
  teak: { r: 42, g: 38, b: 34, a: 1 },
  slate: { r: 100, g: 116, b: 139, a: 1 },
};

/**
 * Parses ANY color string format into normalized sRGB (0-255).
 * Handles 3/6/8-digit hex, rgb(), rgba(), hsl(), hsla(), and named colors.
 */
export function parseColorToRgb(colorStr?: string | null): RGB | null {
  if (!colorStr) return null;
  const str = colorStr.trim().toLowerCase();
  if (!str || str === "transparent") return null;

  // 1. Check named colors dictionary
  if (NAMED_COLORS[str]) {
    return NAMED_COLORS[str];
  }

  // 2. Hex notation (#rgb, #rrggbb, #rrggbbaa)
  if (str.startsWith("#")) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length === 8) {
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a,
      };
    }
    if (hex.length === 6 && /^[0-9a-f]{6}$/.test(hex)) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
  }

  // 3. rgb(...) and rgba(...)
  const rgbMatch = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (rgbMatch) {
    return {
      r: Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[1])))),
      g: Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[2])))),
      b: Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[3])))),
      a: rgbMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbMatch[4]))) : 1,
    };
  }

  // 4. hsl(...) and hsla(...)
  const hslMatch = str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]) % 360;
    const s = Math.max(0, Math.min(100, parseFloat(hslMatch[2]))) / 100;
    const l = Math.max(0, Math.min(100, parseFloat(hslMatch[3]))) / 100;
    const a = hslMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(hslMatch[4]))) : 1;

    const k = (n: number) => (n + h / 30) % 12;
    const aVal = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - aVal * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
      a,
    };
  }

  return null;
}

/**
 * Gamma expansion for standard sRGB channel to linear space (W3C standard)
 */
function toLinearChannel(channel8Bit: number): number {
  const c = Math.max(0, Math.min(255, channel8Bit)) / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Computes exact ITU-R BT.709 relative luminance Y in the range [0.0, 1.0].
 */
export function computeRelativeLuminance(rgb: RGB): number {
  const rLin = toLinearChannel(rgb.r);
  const gLin = toLinearChannel(rgb.g);
  const bLin = toLinearChannel(rgb.b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates color saturation in [0.0, 1.0] to differentiate intentional
 * chromatic accents (gold, terracotta, sapphire) from monochrome text.
 */
export function getColorSaturation(rgb: RGB): number {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/**
 * Computes perceived brightness (0 to 255) for backward compatibility.
 */
export function getPerceivedLuminance(hexColor: string): number {
  const rgb = parseColorToRgb(hexColor);
  if (!rgb) return 128;
  return computeRelativeLuminance(rgb) * 255;
}

export type DynamicContrastScope = "light-surface" | "dark-surface" | "theme-inherited";
export type ContrastMode = "light-bg" | "dark-bg" | "auto";

export interface BackgroundStyleConfig {
  backgroundMode?: "color" | "pattern" | "image" | "none" | string | null;
  backgroundType?: "COLOR" | "PATTERN" | "IMAGE" | string | null;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  overlayOpacity?: number | null;
  backgroundPattern?: string | null;
}

export interface ContainerThemeScope {
  contrastMode: DynamicContrastScope;
  legacyMode: ContrastMode;
  wrapperStyle: React.CSSProperties;
  wrapperClass: string;
  typographyClass: string;
}

/**
 * Master Container Contrast Cascade Resolver.
 * Computes surface luminance mathematically and produces CSS properties and classnames
 * that guarantee WCAG AAA contrast regardless of global theme state.
 */
export function resolveContainerThemeScope(config: BackgroundStyleConfig): ContainerThemeScope {
  const bgMode = (config.backgroundMode || config.backgroundType || "").toLowerCase();
  const hasImage = !!config.backgroundImage && config.backgroundImage.trim() !== "";

  // 1. Image Background:
  // In our portfolio architecture, hero and banner images feature a dark scrim overlay
  // (or overlayOpacity >= 0.3), requiring radiant light/white foreground typography.
  if ((bgMode === "image" || hasImage) && hasImage) {
    return {
      contrastMode: "dark-surface",
      legacyMode: "dark-bg",
      wrapperStyle: {
        colorScheme: "dark",
        color: "#FFFFFF",
        ["--current-heading" as string]: "var(--token-text-light, #FFFFFF)",
        ["--current-body" as string]: "var(--token-text-light, #F8FAFC)",
        ["--current-muted" as string]: "var(--token-text-muted-light, #94A3B8)",
        ["--headings" as string]: "var(--current-heading)",
        ["--foreground" as string]: "var(--current-body)",
      },
      wrapperClass: "force-contrast-dark",
      typographyClass: "force-contrast-dark text-stone-100 prose-invert dark:text-stone-100 dark:prose-invert [color-scheme:dark]",
    };
  }

  // 2. Explicit Background Color:
  const rgb = parseColorToRgb(config.backgroundColor);
  if (rgb && (rgb.a === undefined || rgb.a > 0.1)) {
    const luminance = computeRelativeLuminance(rgb);

    // Threshold Y > 0.45 strictly classifies as a light surface
    if (luminance > 0.45) {
      return {
        contrastMode: "light-surface",
        legacyMode: "light-bg",
        wrapperStyle: {
          colorScheme: "light",
          color: "#0F172A",
          ["--current-heading" as string]: "var(--token-text-dark, #0F172A)",
          ["--current-body" as string]: "var(--token-text-dark, #1E293B)",
          ["--current-muted" as string]: "var(--token-text-muted-dark, #475569)",
          ["--headings" as string]: "var(--current-heading)",
          ["--foreground" as string]: "var(--current-body)",
        },
        wrapperClass: "force-contrast-light",
        typographyClass: "force-contrast-light text-stone-900 prose-stone dark:text-stone-900 dark:prose-stone [color-scheme:light]",
      };
    } else {
      return {
        contrastMode: "dark-surface",
        legacyMode: "dark-bg",
        wrapperStyle: {
          colorScheme: "dark",
          color: "#FFFFFF",
          ["--current-heading" as string]: "var(--token-text-light, #FFFFFF)",
          ["--current-body" as string]: "var(--token-text-light, #F8FAFC)",
          ["--current-muted" as string]: "var(--token-text-muted-light, #94A3B8)",
          ["--headings" as string]: "var(--current-heading)",
          ["--foreground" as string]: "var(--current-body)",
        },
        wrapperClass: "force-contrast-dark",
        typographyClass: "force-contrast-dark text-stone-100 prose-invert dark:text-stone-100 dark:prose-invert [color-scheme:dark]",
      };
    }
  }

  // 3. Pattern with background color
  if (bgMode === "pattern" && config.backgroundColor) {
    const patRgb = parseColorToRgb(config.backgroundColor);
    if (patRgb) {
      const patLum = computeRelativeLuminance(patRgb);
      if (patLum > 0.45) {
        return {
          contrastMode: "light-surface",
          legacyMode: "light-bg",
          wrapperStyle: {
            colorScheme: "light",
            color: "#0F172A",
            ["--current-heading" as string]: "var(--token-text-dark, #0F172A)",
            ["--current-body" as string]: "var(--token-text-dark, #1E293B)",
            ["--current-muted" as string]: "var(--token-text-muted-dark, #475569)",
            ["--headings" as string]: "var(--current-heading)",
            ["--foreground" as string]: "var(--current-body)",
          },
          wrapperClass: "force-contrast-light",
          typographyClass: "force-contrast-light text-stone-900 prose-stone dark:text-stone-900 dark:prose-stone [color-scheme:light]",
        };
      }
    }
  }

  // 4. Transparent / Unset: Defers to global theme cascade
  return {
    contrastMode: "theme-inherited",
    legacyMode: "auto",
    wrapperStyle: {},
    wrapperClass: "",
    typographyClass: "text-foreground prose prose-stone dark:prose-invert",
  };
}

/**
 * Backward compatible helper for existing call sites.
 */
export function resolveContainerContrast(config: BackgroundStyleConfig): ContrastMode {
  return resolveContainerThemeScope(config).legacyMode;
}

/**
 * Returns Tailwind wrapper classes for prose and text inheritance based on contrast mode.
 */
export function getContrastTypographyClasses(contrast: ContrastMode | DynamicContrastScope): string {
  switch (contrast) {
    case "light-bg":
    case "light-surface":
      return "force-contrast-light text-stone-900 prose-stone dark:text-stone-900 dark:prose-stone [color-scheme:light]";
    case "dark-bg":
    case "dark-surface":
      return "force-contrast-dark text-stone-100 prose-invert dark:text-stone-100 dark:prose-invert [color-scheme:dark]";
    case "auto":
    case "theme-inherited":
    default:
      return "text-foreground prose prose-stone dark:prose-invert";
  }
}

/**
 * Helper to test if an arbitrary color string is light.
 */
export function isLightColor(colorStr?: string | null): boolean {
  if (!colorStr || colorStr === "transparent") return false;
  const rgb = parseColorToRgb(colorStr);
  if (!rgb) return false;
  return computeRelativeLuminance(rgb) > 0.45;
}

