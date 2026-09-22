/**
 * Multi-Format Catalog Print Geometry Engine
 * Comprehensive dimension registry for physical print stylesheets (@page)
 * and responsive web preview aspect-ratio containers.
 */

export type CatalogPageSize = "A4" | "A3" | "A5" | "LETTER" | "TABLOID" | "SQUARE";
export type CatalogOrientation = "portrait" | "landscape";

export interface PageDimension {
  id: CatalogPageSize;
  name: string;
  shortLabel: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height in portrait
  cssPageSize: string; // CSS @page size token
  description: string;
}

export const CATALOG_PAGE_DIMENSIONS: Record<CatalogPageSize, PageDimension> = {
  A4: {
    id: "A4",
    name: "A4 (Standard)",
    shortLabel: "A4 (210×297mm)",
    widthMm: 210,
    heightMm: 297,
    aspectRatio: 210 / 297, // ~0.707
    cssPageSize: "A4",
    description: "Standard International Exhibition Monograph",
  },
  A3: {
    id: "A3",
    name: "A3 (Exhibition Folio)",
    shortLabel: "A3 (297×420mm)",
    widthMm: 297,
    heightMm: 420,
    aspectRatio: 297 / 420, // ~0.707
    cssPageSize: "A3",
    description: "Expansive Large-Format Museum Folio",
  },
  A5: {
    id: "A5",
    name: "A5 (Pocket Monograph)",
    shortLabel: "A5 (148×210mm)",
    widthMm: 148,
    heightMm: 210,
    aspectRatio: 148 / 210, // ~0.705
    cssPageSize: "A5",
    description: "Compact Handheld Archival Booklet",
  },
  LETTER: {
    id: "LETTER",
    name: "US Letter",
    shortLabel: "US Letter (8.5×11in)",
    widthMm: 215.9,
    heightMm: 279.4,
    aspectRatio: 215.9 / 279.4, // ~0.773
    cssPageSize: "letter",
    description: "North American Standard Format",
  },
  TABLOID: {
    id: "TABLOID",
    name: "US Tabloid / Ledger",
    shortLabel: "US Tabloid (11×17in)",
    widthMm: 279.4,
    heightMm: 431.8,
    aspectRatio: 279.4 / 431.8, // ~0.647
    cssPageSize: "11in 17in",
    description: "Double-Letter Exhibition Broadside",
  },
  SQUARE: {
    id: "SQUARE",
    name: "Square Coffee Table Folio",
    shortLabel: "Square (250×250mm)",
    widthMm: 250,
    heightMm: 250,
    aspectRatio: 1.0,
    cssPageSize: "250mm 250mm",
    description: "Luxury Symmetrical Coffee Table Edition",
  },
};

export const PAGE_SIZE_OPTIONS: { id: CatalogPageSize; label: string; desc: string }[] = [
  { id: "A4", label: "A4 (Standard 210×297mm)", desc: "Standard International Monograph" },
  { id: "A3", label: "A3 (Exhibition Folio 297×420mm)", desc: "Expansive Museum Folio" },
  { id: "A5", label: "A5 (Pocket Monograph 148×210mm)", desc: "Compact Handheld Booklet" },
  { id: "LETTER", label: "US Letter (8.5×11in)", desc: "North American Standard Format" },
  { id: "TABLOID", label: "US Tabloid / Ledger (11×17in)", desc: "Double-Letter Broadside" },
  { id: "SQUARE", label: "Square Coffee Table Folio (250×250mm)", desc: "Luxury Symmetrical Edition" },
];

export interface CatalogGeometry {
  size: CatalogPageSize;
  orientation: CatalogOrientation;
  widthMm: number;
  heightMm: number;
  ratio: number; // width / height as decimal number
  ratioString: string; // CSS-friendly aspect ratio e.g. "1.414 / 1" or "1 / 1"
  cssSize: string; // Suitable for `@page { size: ...; }`
  isLandscape: boolean;
  isSquare: boolean;
  maxWidthPx: number; // Suggested container max width in web preview
}

export function getCatalogDimensions(
  size: string | null | undefined = "A4",
  orientation: string | null | undefined = "portrait"
): CatalogGeometry {
  const normSize: CatalogPageSize =
    size && size in CATALOG_PAGE_DIMENSIONS ? (size as CatalogPageSize) : "A4";
  const dim = CATALOG_PAGE_DIMENSIONS[normSize];

  const isSquare = normSize === "SQUARE";
  const isLandscape = !isSquare && orientation === "landscape";
  const finalOrientation: CatalogOrientation = isLandscape ? "landscape" : "portrait";

  const widthMm = isLandscape ? dim.heightMm : dim.widthMm;
  const heightMm = isLandscape ? dim.widthMm : dim.heightMm;
  const ratio = isLandscape ? 1 / dim.aspectRatio : dim.aspectRatio;

  const ratioString = isSquare
    ? "1 / 1"
    : isLandscape
    ? `${(1 / dim.aspectRatio).toFixed(4)} / 1`
    : `1 / ${(1 / dim.aspectRatio).toFixed(4)}`;

  const cssSize = isSquare
    ? dim.cssPageSize
    : `${dim.cssPageSize} ${finalOrientation}`;

  // Preview container max-width
  const maxWidthPx = isSquare ? 900 : isLandscape ? 1160 : 840;

  return {
    size: normSize,
    orientation: finalOrientation,
    widthMm,
    heightMm,
    ratio,
    ratioString,
    cssSize,
    isLandscape,
    isSquare,
    maxWidthPx,
  };
}
