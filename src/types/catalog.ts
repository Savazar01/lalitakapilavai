/**
 * e-Catalog Plate Layout, Framing, and Monograph Types
 */

export type PlateLayoutType = 
  | "SIDE_BY_SIDE"         // Two columns with configurable split
  | "STACKED"              // Centered image above, text below
  | "STACKED_CENTERED"     // Backward compatibility alias
  | "TOP_LEFT_FLOW";       // Image floated top-left, text wraps right & flows beneath

export type PlateRatio = "40:60" | "45:55" | "50:50" | "55:45" | "60:40";

export interface ArtworkPlateSettings {
  layoutType: PlateLayoutType;
  splitRatio: PlateRatio;  // Applicable to SIDE_BY_SIDE
  imageMaxHeight?: string; // e.g. "60vh", "450px"
}

export interface CoverFramingConfig {
  coverMattingColor?: string; // e.g. "transparent" or hex code
  innerBorderColor?: string;  // e.g. "#D4AF37"
  mattingPadding?: number;    // e.g. 0, 4, 8, 16, 24
  coverBgColor?: string;      // Dedicated Cover Canvas Background Color (Default: "#FAF7F2" or inherits base canvas)
  coverTextColor?: string;
}

export interface ECatalogThemeTokens {
  light: {
    canvasBg: string;      // default: "#FAF7F2"
    cardBg: string;        // default: "#FFFFFF"
    headingColor: string;  // default: "#0F172A"
    textColor: string;     // default: "#334155"
    accentGold: string;    // default: "#B45309"
    borderColor: string;   // default: "#E2E8F0"
  };
  dark: {
    canvasBg: string;      // default: "#0B0F17"
    cardBg: string;        // default: "#151B26"
    headingColor: string;  // default: "#F8FAFC"
    textColor: string;     // default: "#CBD5E1"
    accentGold: string;    // default: "#F59E0B"
    borderColor: string;   // default: "#334155"
  };
}

export const DEFAULT_CATALOG_THEME_TOKENS: ECatalogThemeTokens = {
  light: {
    canvasBg: "#FAF7F2",
    cardBg: "#FFFFFF",
    headingColor: "#0F172A",
    textColor: "#334155",
    accentGold: "#B45309",
    borderColor: "#E2E8F0",
  },
  dark: {
    canvasBg: "#0B0F17",
    cardBg: "#151B26",
    headingColor: "#F8FAFC",
    textColor: "#CBD5E1",
    accentGold: "#F59E0B",
    borderColor: "#334155",
  },
};
