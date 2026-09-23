/**
 * Authentic Classical & Sacred Art Ribbon Images / Border Patterns
 * For e-Catalog Header, Footer, and Vertical Spine Embellishments.
 * Designed with 22k Temple Gold accents (#D4AF37, #E6C65A, #B45309).
 */

export interface RibbonPattern {
  id: string;
  name: string;
  category: "Zari & Borders" | "Floral & Vines" | "Temple Motifs";
  description: string;
  svgDataUri: string;
  previewSvg: string;
  defaultMode: "repeat-pattern" | "contain-center";
}

// 1. Temple Gopuram Zari: Repeating stepped temple spire triangles with gold zari rules
const templeGopuramSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='32' viewBox='0 0 48 32'>
  <line x1='0' y1='2' x2='48' y2='2' stroke='%23D4AF37' stroke-width='1.5' opacity='0.85'/>
  <line x1='0' y1='5' x2='48' y2='5' stroke='%23D4AF37' stroke-width='0.5' opacity='0.5'/>
  <path d='M0 30 L12 10 L24 30 L36 10 L48 30' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.75'/>
  <path d='M6 30 L12 18 L18 30 M30 30 L36 18 L42 30' fill='none' stroke='%23E6C65A' stroke-width='0.8' opacity='0.5'/>
  <circle cx='12' cy='10' r='1.5' fill='%23D4AF37'/>
  <circle cx='36' cy='10' r='1.5' fill='%23D4AF37'/>
  <line x1='0' y1='30' x2='48' y2='30' stroke='%23D4AF37' stroke-width='1.5' opacity='0.85'/>
</svg>`;

// 2. Kamal (Lotus) Garland: Sacred blooming lotus petals with curling gold stems
const kamalLotusSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='32' viewBox='0 0 60 32'>
  <line x1='0' y1='2' x2='60' y2='2' stroke='%23D4AF37' stroke-width='1' opacity='0.6'/>
  <path d='M30 6 C24 14 26 22 30 26 C34 22 36 14 30 6 Z' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.85'/>
  <path d='M30 16 C20 18 16 22 20 26 C24 26 28 22 30 16 Z' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.7'/>
  <path d='M30 16 C40 18 44 22 40 26 C36 26 32 22 30 16 Z' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.7'/>
  <circle cx='30' cy='16' r='2' fill='%23E6C65A' opacity='0.8'/>
  <path d='M0 26 Q15 28 30 26 Q45 28 60 26' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.5'/>
  <line x1='0' y1='30' x2='60' y2='30' stroke='%23D4AF37' stroke-width='1' opacity='0.6'/>
</svg>`;

// 3. Swarna Lata (Gold Leaf Floral Vine): Undulating Tanjore scrollwork vine
const swarnaLataSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='32' viewBox='0 0 64 32'>
  <line x1='0' y1='1' x2='64' y2='1' stroke='%23D4AF37' stroke-width='0.75' opacity='0.5'/>
  <path d='M0 16 Q16 4 32 16 T64 16' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.8'/>
  <path d='M16 10 C14 6 20 4 22 8 C20 12 18 11 16 10 Z' fill='%23D4AF37' opacity='0.65'/>
  <path d='M48 22 C46 26 52 28 54 24 C52 20 50 21 48 22 Z' fill='%23D4AF37' opacity='0.65'/>
  <circle cx='32' cy='16' r='2' fill='%23E6C65A' opacity='0.75'/>
  <circle cx='0' cy='16' r='1.5' fill='%23E6C65A' opacity='0.5'/>
  <line x1='0' y1='31' x2='64' y2='31' stroke='%23D4AF37' stroke-width='0.75' opacity='0.5'/>
</svg>`;

// 4. Ghanta Mala (Temple Bells & Pearl Festoon): Cascading bells with golden beads
const ghantaMalaSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='32' viewBox='0 0 40 32'>
  <line x1='0' y1='2' x2='40' y2='2' stroke='%23D4AF37' stroke-width='1' opacity='0.7'/>
  <path d='M0 4 Q20 12 40 4' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.6'/>
  <circle cx='20' cy='12' r='1.5' fill='%23E6C65A' opacity='0.8'/>
  <line x1='20' y1='13' x2='20' y2='20' stroke='%23D4AF37' stroke-width='1'/>
  <path d='M16 26 C16 21 24 21 24 26 Z' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.85'/>
  <circle cx='20' cy='28' r='1.2' fill='%23E6C65A'/>
  <circle cx='0' cy='4' r='1.2' fill='%23D4AF37' opacity='0.6'/>
  <circle cx='40' cy='4' r='1.2' fill='%23D4AF37' opacity='0.6'/>
  <line x1='0' y1='31' x2='40' y2='31' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/>
</svg>`;

// 5. Veldhari (Zigzag Diamond Zari): Sacred chevron and lozenge silk border
const veldhariSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='32' viewBox='0 0 36 32'>
  <line x1='0' y1='2' x2='36' y2='2' stroke='%23D4AF37' stroke-width='1.2' opacity='0.8'/>
  <path d='M0 16 L9 6 L18 16 L27 6 L36 16 L27 26 L18 16 L9 26 Z' fill='none' stroke='%23D4AF37' stroke-width='1' opacity='0.75'/>
  <polygon points='18,12 21,16 18,20 15,16' fill='%23E6C65A' opacity='0.65'/>
  <polygon points='0,12 3,16 0,20 -3,16' fill='%23E6C65A' opacity='0.65'/>
  <polygon points='36,12 39,16 36,20 33,16' fill='%23E6C65A' opacity='0.65'/>
  <line x1='0' y1='30' x2='36' y2='30' stroke='%23D4AF37' stroke-width='1.2' opacity='0.8'/>
</svg>`;

// 6. Mayura (Peacock Plumage Frieze): Stylized royal peacock eyelets and curves
const mayuraSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='50' height='32' viewBox='0 0 50 32'>
  <line x1='0' y1='2' x2='50' y2='2' stroke='%23D4AF37' stroke-width='0.8' opacity='0.6'/>
  <path d='M25 8 C18 14 18 22 25 28 C32 22 32 14 25 8 Z' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.8'/>
  <circle cx='25' cy='18' r='4' fill='none' stroke='%23E6C65A' stroke-width='1' opacity='0.7'/>
  <circle cx='25' cy='18' r='1.5' fill='%23D4AF37' opacity='0.9'/>
  <path d='M0 18 Q12 26 25 18 Q38 26 50 18' fill='none' stroke='%23D4AF37' stroke-width='0.6' opacity='0.5'/>
  <line x1='0' y1='30' x2='50' y2='30' stroke='%23D4AF37' stroke-width='0.8' opacity='0.6'/>
</svg>`;

// 7. Thoranam Arch (Sacred Temple Festoon): Mango leaf festoons with rosette knots
const thoranamSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='32' viewBox='0 0 44 32'>
  <line x1='0' y1='2' x2='44' y2='2' stroke='%23D4AF37' stroke-width='1.5' opacity='0.8'/>
  <path d='M0 2 C6 18 16 26 22 26 C28 26 38 18 44 2' fill='none' stroke='%23D4AF37' stroke-width='1.2' opacity='0.75'/>
  <path d='M22 6 L22 22' stroke='%23E6C65A' stroke-width='0.8' opacity='0.6'/>
  <circle cx='22' cy='24' r='2' fill='%23D4AF37' opacity='0.85'/>
  <circle cx='0' cy='2' r='2.5' fill='%23E6C65A' opacity='0.7'/>
  <circle cx='44' cy='2' r='2.5' fill='%23E6C65A' opacity='0.7'/>
  <line x1='0' y1='30' x2='44' y2='30' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/>
</svg>`;

// 8. Gold Filigree Lace: Intricate 22k gold wire lace meander
const filigreeLaceSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
  <line x1='0' y1='2' x2='32' y2='2' stroke='%23D4AF37' stroke-width='1' opacity='0.7'/>
  <circle cx='16' cy='16' r='10' fill='none' stroke='%23D4AF37' stroke-width='0.75' opacity='0.6'/>
  <circle cx='16' cy='16' r='5' fill='none' stroke='%23E6C65A' stroke-width='0.75' opacity='0.7'/>
  <circle cx='0' cy='16' r='6' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/>
  <circle cx='32' cy='16' r='6' fill='none' stroke='%23D4AF37' stroke-width='0.5' opacity='0.4'/>
  <circle cx='16' cy='16' r='1.5' fill='%23D4AF37'/>
  <line x1='0' y1='30' x2='32' y2='30' stroke='%23D4AF37' stroke-width='1' opacity='0.7'/>
</svg>`;

export const STANDARD_RIBBON_PATTERNS: RibbonPattern[] = [
  {
    id: "temple-gopuram-zari",
    name: "Temple Gopuram Zari",
    category: "Zari & Borders",
    description: "Classic stepped temple gopuram triangular gold borders with fine zari hairlines",
    svgDataUri: `data:image/svg+xml;utf8,${templeGopuramSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: templeGopuramSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "kamal-lotus-garland",
    name: "Kamal Lotus Garland",
    category: "Floral & Vines",
    description: "Sacred blooming lotus petals linked with undulating gold stems and stamen crests",
    svgDataUri: `data:image/svg+xml;utf8,${kamalLotusSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: kamalLotusSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "swarna-lata-vine",
    name: "Swarna Lata Floral Vine",
    category: "Floral & Vines",
    description: "Continuous Thanjavur frame gold leaf floral meander vine with curling leaves",
    svgDataUri: `data:image/svg+xml;utf8,${swarnaLataSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: swarnaLataSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "ghanta-mala-bells",
    name: "Ghanta Mala Temple Bells",
    category: "Temple Motifs",
    description: "Traditional hanging temple bells with cascading golden beads and festoons",
    svgDataUri: `data:image/svg+xml;utf8,${ghantaMalaSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: ghantaMalaSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "veldhari-zari",
    name: "Veldhari Zigzag Zari",
    category: "Zari & Borders",
    description: "South Indian traditional chevron weave interleaved with gold diamond lozenges",
    svgDataUri: `data:image/svg+xml;utf8,${veldhariSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: veldhariSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "mayura-peacock-frieze",
    name: "Mayura Peacock Frieze",
    category: "Temple Motifs",
    description: "Stylized royal peacock plumage, eyelets, and ornate arch scrollwork",
    svgDataUri: `data:image/svg+xml;utf8,${mayuraSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: mayuraSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "thoranam-arch",
    name: "Thoranam Temple Festoon",
    category: "Temple Motifs",
    description: "Sacred mango leaf and festoon arch band with ornamental rosette knots",
    svgDataUri: `data:image/svg+xml;utf8,${thoranamSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: thoranamSvg,
    defaultMode: "repeat-pattern",
  },
  {
    id: "gold-filigree-lace",
    name: "Gold Filigree Wire Lace",
    category: "Zari & Borders",
    description: "Intricate 22k gold wire lace medallion meander with floral interlocks",
    svgDataUri: `data:image/svg+xml;utf8,${filigreeLaceSvg.replace(/\n\s*/g, " ")}`,
    previewSvg: filigreeLaceSvg,
    defaultMode: "repeat-pattern",
  },
];

export function getRibbonPatternById(id?: string | null): RibbonPattern | undefined {
  if (!id) return undefined;
  return STANDARD_RIBBON_PATTERNS.find((p) => p.id === id);
}

export function isPresetRibbonPattern(url?: string | null): RibbonPattern | undefined {
  if (!url) return undefined;
  return STANDARD_RIBBON_PATTERNS.find((p) => p.svgDataUri === url || p.id === url);
}
