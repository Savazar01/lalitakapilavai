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
}
