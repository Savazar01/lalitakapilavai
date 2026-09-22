/**
 * Comprehensive Word/PowerPoint-Grade Vector Shape Studio Definitions
 * Categorized suite of 20+ architectural, geometric, polygon, and banner shapes
 * for fine-art monographs, magazines, and exhibition editorial layouts.
 */

export type ShapeCategory = "basic" | "cultural" | "polygons" | "banners";

export interface ShapeDefinition {
  id: string;
  label: string;
  category: ShapeCategory;
  description: string;
  clipPath?: string; // CSS clip-path formula
  polygonPoints?: string; // normalized "x,y x,y" for SVG border stroke overlay (0 to 100)
  borderRadius?: string; // for standard border-radius shapes
  borderStyle?: "solid" | "double" | "dashed";
  defaultAspect?: string;
  contentPadding?: string;
}

export const SHAPE_CATEGORIES: { id: ShapeCategory; label: string; count: number }[] = [
  { id: "basic", label: "Basic Geometries", count: 8 },
  { id: "cultural", label: "Cultural & Architectural", count: 5 },
  { id: "polygons", label: "Polygons & Stars", count: 8 },
  { id: "banners", label: "Banners & Callouts", count: 4 },
];

export const SHAPE_REGISTRY: ShapeDefinition[] = [
  // ---------------------------------------------------------------------------
  // 1. BASIC GEOMETRIES
  // ---------------------------------------------------------------------------
  {
    id: "rectangle",
    label: "Square / Rectangle",
    category: "basic",
    description: "Sharp rectangular boundary with clean editorial framing",
    borderRadius: "0px",
    contentPadding: "p-6",
  },
  {
    id: "rounded-rect",
    label: "Rounded Rectangle",
    category: "basic",
    description: "Soft curved container with modern museum card elegance",
    borderRadius: "1.25rem",
    contentPadding: "p-6",
  },
  {
    id: "snip-corner-rect",
    label: "Snip Corner Rectangle",
    category: "basic",
    description: "Diagonal cut top-right corner for architectural catalog tags",
    clipPath: "polygon(0% 0%, 88% 0%, 100% 12%, 100% 100%, 0% 100%)",
    polygonPoints: "0,0 88,0 100,12 100,100 0,100",
    contentPadding: "pt-6 pb-6 pl-6 pr-8",
  },
  {
    id: "double-snip-corner-rect",
    label: "Double Snip Corner",
    category: "basic",
    description: "Diagonal cuts on opposite corners for traditional certificate styling",
    clipPath: "polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)",
    polygonPoints: "12,0 100,0 100,88 88,100 0,100 0,12",
    contentPadding: "p-7",
  },
  {
    id: "circle",
    label: "Circle Frame",
    category: "basic",
    description: "Circular motif frame for sacred mandalas and deities",
    borderRadius: "9999px",
    defaultAspect: "1/1",
    contentPadding: "p-8",
  },
  {
    id: "oval",
    label: "Classical Oval",
    category: "basic",
    description: "Graceful elliptical format for vintage portrait miniatures",
    borderRadius: "50% / 35%",
    defaultAspect: "16/10",
    contentPadding: "px-10 py-8",
  },
  {
    id: "triangle",
    label: "Equilateral Triangle",
    category: "basic",
    description: "Sacred upward trine motif embodying ascension and fire",
    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    polygonPoints: "50,0 0,100 100,100",
    contentPadding: "pt-14 pb-4 px-6",
  },
  {
    id: "right-triangle",
    label: "Right Triangle",
    category: "basic",
    description: "Angular diagonal partition for dynamic asymmetric layouts",
    clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)",
    polygonPoints: "0,0 0,100 100,100",
    contentPadding: "pt-12 pb-6 pl-6 pr-10",
  },

  // ---------------------------------------------------------------------------
  // 2. CULTURAL & ARCHITECTURAL
  // ---------------------------------------------------------------------------
  {
    id: "temple-arch",
    label: "Temple Arch (Gopuram)",
    category: "cultural",
    description: "South Indian vaulted gopuram pointed arch for deity plates",
    clipPath: "polygon(50% 0%, 82% 14%, 96% 32%, 100% 50%, 100% 100%, 0% 100%, 0% 50%, 4% 32%, 18% 14%)",
    polygonPoints: "50,0 82,14 96,32 100,50 100,100 0,100 0,50 4,32 18,14",
    contentPadding: "pt-14 pb-6 px-6",
  },
  {
    id: "cartouche",
    label: "Classical Cartouche",
    category: "cultural",
    description: "Royal engraved cartouche with double fillet border",
    borderRadius: "32px",
    borderStyle: "double",
    contentPadding: "px-8 py-6",
  },
  {
    id: "medallion",
    label: "Sacred Medallion",
    category: "cultural",
    description: "Multifaceted 16-point cultural medallion for royal seals",
    clipPath: "polygon(50% 0%, 65% 5%, 80% 15%, 95% 35%, 100% 50%, 95% 65%, 80% 85%, 65% 95%, 50% 100%, 35% 95%, 20% 85%, 5% 65%, 0% 50%, 5% 35%, 20% 15%, 35% 5%)",
    polygonPoints: "50,0 65,5 80,15 95,35 100,50 95,65 80,85 65,95 50,100 35,95 20,85 5,65 0,50 5,35 20,15 35,5",
    contentPadding: "p-8",
  },
  {
    id: "scalloped-arch",
    label: "Scalloped Lotus Arch",
    category: "cultural",
    description: "Mughal & Tanjore multi-foil scalloped petal archway",
    clipPath: "polygon(50% 0%, 70% 10%, 85% 20%, 95% 40%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, 5% 40%, 15% 20%, 30% 10%)",
    polygonPoints: "50,0 70,10 85,20 95,40 100,60 100,100 0,100 0,60 5,40 15,20 30,10",
    contentPadding: "pt-12 pb-6 px-6",
  },
  {
    id: "trefoil",
    label: "Sacred Trefoil",
    category: "cultural",
    description: "Triple-lobed sacred clover symbol of creation, preservation, and harmony",
    clipPath: "polygon(50% 0%, 62% 15%, 78% 18%, 82% 35%, 75% 50%, 95% 65%, 90% 85%, 70% 90%, 50% 80%, 30% 90%, 10% 85%, 5% 65%, 25% 50%, 18% 35%, 22% 18%, 38% 15%)",
    polygonPoints: "50,0 62,15 78,18 82,35 75,50 95,65 90,85 70,90 50,80 30,90 10,85 5,65 25,50 18,35 22,18 38,15",
    contentPadding: "p-8",
  },

  // ---------------------------------------------------------------------------
  // 3. POLYGONS & STARS
  // ---------------------------------------------------------------------------
  {
    id: "diamond",
    label: "Diamond / Rhombus",
    category: "polygons",
    description: "Geometric diamond motif for chapter dividers and raga emblems",
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    polygonPoints: "50,0 100,50 50,100 0,50",
    defaultAspect: "1/1",
    contentPadding: "p-10",
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    category: "polygons",
    description: "Slanted geometric banner giving dynamic editorial motion",
    clipPath: "polygon(18% 0%, 100% 0%, 82% 100%, 0% 100%)",
    polygonPoints: "18,0 100,0 82,100 0,100",
    contentPadding: "py-6 px-10",
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    category: "polygons",
    description: "Solid pedestal base format for monument descriptions",
    clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
    polygonPoints: "20,0 80,0 100,100 0,100",
    contentPadding: "py-6 px-8",
  },
  {
    id: "pentagon",
    label: "Pentagon",
    category: "polygons",
    description: "Five-pointed talismanic polygon representing the 5 elements",
    clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
    polygonPoints: "50,0 100,38 82,100 18,100 0,38",
    contentPadding: "pt-10 pb-6 px-6",
  },
  {
    id: "hexagon",
    label: "Hexagon",
    category: "polygons",
    description: "Natural honeycomb lattice polygon for modular art groupings",
    clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    polygonPoints: "25,0 75,0 100,50 75,100 25,100 0,50",
    contentPadding: "py-6 px-8",
  },
  {
    id: "octagon",
    label: "Octagon",
    category: "polygons",
    description: "Eight-sided sacred geometry representing the Ashta-Lakshmi",
    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    polygonPoints: "30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30",
    contentPadding: "p-8",
  },
  {
    id: "star-4",
    label: "4-Point Diamond Flare",
    category: "polygons",
    description: "Brilliant celestial diamond flare for highlights and quotes",
    clipPath: "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",
    polygonPoints: "50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38",
    defaultAspect: "1/1",
    contentPadding: "p-12",
  },
  {
    id: "star-8",
    label: "8-Point Star (Octagram)",
    category: "polygons",
    description: "Sacred Star of Lakshmi symbolizing eight forms of auspicious wealth",
    clipPath: "polygon(50% 0%, 64% 20%, 85% 15%, 80% 36%, 100% 50%, 80% 64%, 85% 85%, 64% 80%, 50% 100%, 36% 80%, 15% 85%, 20% 64%, 0% 50%, 20% 36%, 15% 15%, 36% 20%)",
    polygonPoints: "50,0 64,20 85,15 80,36 100,50 80,64 85,85 64,80 50,100 36,80 15,85 20,64 0,50 20,36 15,15 36,20",
    defaultAspect: "1/1",
    contentPadding: "p-12",
  },

  // ---------------------------------------------------------------------------
  // 4. BANNERS & CALLOUTS
  // ---------------------------------------------------------------------------
  {
    id: "ribbon-banner",
    label: "Ribbon Banner",
    category: "banners",
    description: "Classic horizontal editorial ribbon with inverted swallowtail ends",
    clipPath: "polygon(0% 0%, 100% 0%, 93% 50%, 100% 100%, 0% 100%, 7% 50%)",
    polygonPoints: "0,0 100,0 93,50 100,100 0,100 7,50",
    contentPadding: "py-4 px-10",
  },
  {
    id: "scroll",
    label: "Parchment Scroll",
    category: "banners",
    description: "Ancient scroll banner contour for sacred hymns and shlokas",
    clipPath: "polygon(4% 0%, 96% 0%, 100% 12%, 96% 24%, 100% 88%, 96% 100%, 4% 100%, 0% 88%, 4% 76%, 0% 12%)",
    polygonPoints: "4,0 96,0 100,12 96,24 100,88 96,100 4,100 0,88 4,76 0,12",
    contentPadding: "py-6 px-8",
  },
  {
    id: "speech-callout",
    label: "Speech Callout",
    category: "banners",
    description: "Curatorial quote balloon with pointing tail",
    clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 58% 75%, 50% 100%, 42% 75%, 0% 75%)",
    polygonPoints: "0,0 100,0 100,75 58,75 50,100 42,75 0,75",
    contentPadding: "pt-6 pb-12 px-6",
  },
  {
    id: "thought-bubble",
    label: "Thought Bubble / Cloud",
    category: "banners",
    description: "Soft reflective cloud contour for poetic contemplations",
    clipPath: "polygon(15% 10%, 40% 5%, 65% 5%, 85% 10%, 95% 30%, 95% 60%, 85% 80%, 65% 85%, 45% 85%, 30% 95%, 25% 85%, 15% 80%, 5% 60%, 5% 30%)",
    polygonPoints: "15,10 40,5 65,5 85,10 95,30 95,60 85,80 65,85 45,85 30,95 25,85 15,80 5,60 5,30",
    contentPadding: "p-8",
  },
];

/**
 * Helper to retrieve a shape definition by ID (with fallback to temple-arch or cartouche)
 */
export function getShapeDefinition(id?: string): ShapeDefinition {
  if (!id) return SHAPE_REGISTRY[0];
  const normalized = id.toLowerCase().replace(/_/g, "-");
  const found = SHAPE_REGISTRY.find(
    (s) => s.id === normalized || s.id === id || s.id.replace(/-/g, "") === normalized.replace(/-/g, "")
  );
  return found || SHAPE_REGISTRY[0];
}
