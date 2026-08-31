/**
 * Authentic Sacred Art & Heritage Patterns for Lalita Kapilavai Portfolio
 * High-elegance SVG patterns with subtle gold accents and modular CSS data URIs.
 */

export interface BackgroundPattern {
  id: string;
  name: string;
  category: "Sacred" | "Architectural" | "Texture";
  description: string;
  svgDataUri: string;
  previewSvg: string;
}

// 1. Mandala Filigree: Sacred South Indian 22k gold floral mandala
const mandalaSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><path d='M40 0 C45 20 60 35 80 40 C60 45 45 60 40 80 C35 60 20 45 0 40 C20 35 35 20 40 0 Z' fill='none' stroke='%23D4AF37' stroke-width='0.75' opacity='0.7'/><circle cx='40' cy='40' r='12' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.5'/><circle cx='40' cy='40' r='4' fill='%23D4AF37' opacity='0.3'/><circle cx='0' cy='0' r='8' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/><circle cx='80' cy='0' r='8' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/><circle cx='0' cy='80' r='8' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/><circle cx='80' cy='80' r='8' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/></svg>`;

// 2. Traditional Jali: South Indian temple stone lattice work
const jaliSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><path d='M24 0 L48 24 L24 48 L0 24 Z' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.6'/><path d='M24 8 L40 24 L24 40 L8 24 Z' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/><circle cx='24' cy='24' r='3' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.5'/><rect x='22' y='22' width='4' height='4' fill='%23D4AF37' opacity='0.25'/></svg>`;

// 3. Subtle Dots / Gold Dust: Stippled micro-points reminiscent of gold leaf sprinkles
const dotsSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='1.2' fill='%23D4AF37' opacity='0.6'/><circle cx='0' cy='0' r='0.8' fill='%23D4AF37' opacity='0.4'/><circle cx='24' cy='0' r='0.8' fill='%23D4AF37' opacity='0.4'/><circle cx='0' cy='24' r='0.8' fill='%23D4AF37' opacity='0.4'/><circle cx='24' cy='24' r='0.8' fill='%23D4AF37' opacity='0.4'/></svg>`;

// 4. Heritage Grid: Architectural temple proportion grid (Iconometric Talamana)
const gridSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M40 0 L0 0 0 40' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.35'/><path d='M0 20 L40 20 M20 0 L20 40' fill='none' stroke='%23D4AF37' stroke-width='0.25' stroke-dasharray='2,2' opacity='0.3'/><circle cx='20' cy='20' r='1.5' fill='%23D4AF37' opacity='0.4'/></svg>`;

// 5. Sacred Geometry: Interlocking triangular resonance (Sri Yantra motif)
const geometrySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><polygon points='30,6 54,48 6,48' fill='none' stroke='%23D4AF37' stroke-width='0.65' opacity='0.5'/><polygon points='30,54 54,12 6,12' fill='none' stroke='%23D4AF37' stroke-width='0.65' opacity='0.5'/><circle cx='30' cy='30' r='10' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.35'/><circle cx='30' cy='30' r='2' fill='%23D4AF37' opacity='0.6'/></svg>`;

// 6. Heritage Linen / Raw Silk: Texturized canvas crosshatch
const linenSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path d='M0 8 L16 8 M8 0 L8 16' stroke='%23D4AF37' stroke-width='0.4' opacity='0.25'/><path d='M0 0 L16 16 M16 0 L0 16' stroke='%23D4AF37' stroke-width='0.2' opacity='0.15'/></svg>`;

export const BACKGROUND_PATTERNS: BackgroundPattern[] = [
  {
    id: "mandala-filigree",
    name: "Sacred Mandala",
    category: "Sacred",
    description: "Intricate 22k gold floral filigree and temple rosette motifs",
    svgDataUri: `data:image/svg+xml;utf8,${mandalaSvg}`,
    previewSvg: mandalaSvg,
  },
  {
    id: "traditional-jali",
    name: "Traditional Jali",
    category: "Architectural",
    description: "South Indian Dravidian stone lattice screen architecture",
    svgDataUri: `data:image/svg+xml;utf8,${jaliSvg}`,
    previewSvg: jaliSvg,
  },
  {
    id: "subtle-dots",
    name: "Gold Dust & Dots",
    category: "Texture",
    description: "Delicate stippling simulating Jaipur 22k gold leaf flecks",
    svgDataUri: `data:image/svg+xml;utf8,${dotsSvg}`,
    previewSvg: dotsSvg,
  },
  {
    id: "heritage-grid",
    name: "Talamana Grid",
    category: "Architectural",
    description: "Classical Agamic iconometric layout and alignment grid",
    svgDataUri: `data:image/svg+xml;utf8,${gridSvg}`,
    previewSvg: gridSvg,
  },
  {
    id: "sacred-geometry",
    name: "Sacred Geometry",
    category: "Sacred",
    description: "Interlocking cosmic triangles evoking divine Sri Yantra resonance",
    svgDataUri: `data:image/svg+xml;utf8,${geometrySvg}`,
    previewSvg: geometrySvg,
  },
  {
    id: "heritage-linen",
    name: "Raw Silk Canvas",
    category: "Texture",
    description: "Traditional woven cloth backing for Tanjore tamarind seed gesso",
    svgDataUri: `data:image/svg+xml;utf8,${linenSvg}`,
    previewSvg: linenSvg,
  },
];

export function getPatternById(id?: string | null): BackgroundPattern | undefined {
  if (!id) return undefined;
  return BACKGROUND_PATTERNS.find((p) => p.id === id);
}

export function getPatternStyle(
  patternId?: string | null,
  opacity = 0.15
): React.CSSProperties | undefined {
  const pattern = getPatternById(patternId);
  if (!pattern) return undefined;

  return {
    backgroundImage: `url("${pattern.svgDataUri}")`,
    backgroundRepeat: "repeat",
    opacity,
  };
}
