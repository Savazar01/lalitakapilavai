export type EnvironmentCategory = "contemporary" | "heritage" | "palatial" | "traditional-indian" | "custom";

export interface WallEnvironment {
  id: string;
  name: string;
  category: EnvironmentCategory;
  description: string;
  wallTextureUrl?: string;
  wallBgColor: string;
  wallGradient: string;
  floorTextureUrl?: string;
  floorBgColor: string;
  floorGradient: string;
  lightingColor: string;
  spotlightIntensity: number;
  frameStyleDefault: "tanjore-gold-teak" | "mysore-rosewood" | "pahari-cedar" | "white-cube";
  mouldingColor: string;
  skirtingColor: string;
  decorType: "minimalist-bench" | "palace-pedestal" | "atelier-brass" | "salon-bench" | "villa-urn" | "corporate-bench" | "none";
}

export const WALL_ENVIRONMENTS: WallEnvironment[] = [
  // 1. Modern Minimalist (White Cube, concrete floor, track spotlights, chrome trim)
  {
    id: "modern-minimalist",
    name: "Modern Minimalist (White Cube Gallery)",
    category: "contemporary",
    description:
      "Museum pure white eggshell wall with crisp linear moulding, polished pale concrete/oak floorboards, and precision neutral track spotlights.",
    wallBgColor: "#F5F5F3",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 255, 255, 0.18) 0%, rgba(220, 220, 220, 0.05) 50%, transparent 85%)",
    floorBgColor: "#C2BFB9",
    floorGradient: "linear-gradient(180deg, #D6D3CC 0%, #B8B4AC 40%, #9C978E 100%)",
    lightingColor: "#FDFDFD",
    spotlightIntensity: 1.0,
    frameStyleDefault: "white-cube",
    mouldingColor: "#EAEAE8",
    skirtingColor: "#D8D8D6",
    decorType: "minimalist-bench",
  },
  // 2. Imperial Palace (Burgundy silk damask wall, polished mahogany parquet, chandelier ambient, gold leaf moulding)
  {
    id: "imperial-palace",
    name: "Imperial Palace (Royal Durbar Hall)",
    category: "palatial",
    description:
      "Regal burgundy damask wall with 24k gold leaf crown moulding, polished royal mahogany parquet floor, and warm chandelier illumination.",
    wallBgColor: "#3B1017",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 230, 180, 0.20) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 85%)",
    floorBgColor: "#220D08",
    floorGradient: "linear-gradient(180deg, #3A180E 0%, #220D08 50%, #100604 100%)",
    lightingColor: "#FFE6AA",
    spotlightIntensity: 1.15,
    frameStyleDefault: "mysore-rosewood",
    mouldingColor: "#D4AF37",
    skirtingColor: "#2A1009",
    decorType: "palace-pedestal",
  },
  // 3. Indian Atelier (Terracotta / Madder wall, dark teak floor, warm brass sconce lighting, carved teak moulding)
  {
    id: "indian-atelier",
    name: "Indian Atelier (Tanjore & Chettinad Court)",
    category: "traditional-indian",
    description:
      "Deep rich heritage madder wall with polished teakwood baseboards, brass sconces, and warm track lighting honoring Thanjavur 22k gold foil.",
    wallBgColor: "#421B17",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.16) 0%, rgba(212, 175, 55, 0.06) 50%, transparent 85%)",
    floorBgColor: "#1A100B",
    floorGradient: "linear-gradient(180deg, #2D1A10 0%, #1A0E08 50%, #0A0503 100%)",
    lightingColor: "#FFDE82",
    spotlightIntensity: 1.05,
    frameStyleDefault: "tanjore-gold-teak",
    mouldingColor: "#2A120E",
    skirtingColor: "#2A120E",
    decorType: "atelier-brass",
  },
  // 4. Residential Salon (Warm linen plaster wall, oak chevron parquet, warm incandescent lamps, fluted ivory moulding)
  {
    id: "residential-salon",
    name: "Residential Salon (Private Collector Salon)",
    category: "heritage",
    description:
      "Warm natural linen plaster wall with classic fluted ivory moulding, warm chevron oak parquet, and cozy domestic exhibition lighting.",
    wallBgColor: "#EAE5DC",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 245, 225, 0.15) 0%, rgba(200, 175, 140, 0.05) 50%, transparent 85%)",
    floorBgColor: "#A68A68",
    floorGradient: "linear-gradient(180deg, #C2A582 0%, #9C7E5A 50%, #6E5336 100%)",
    lightingColor: "#FFF4DD",
    spotlightIntensity: 0.95,
    frameStyleDefault: "pahari-cedar",
    mouldingColor: "#FAF7F2",
    skirtingColor: "#DED6C7",
    decorType: "salon-bench",
  },
  // 5. Heritage Villa (Arched stone / limestone wall, terracotta tile floor, diffuse sunlit courtyard wash)
  {
    id: "heritage-villa",
    name: "Heritage Villa (Mediterranean Courtyard)",
    category: "heritage",
    description:
      "Arched warm limestone plaster with terracotta tile flooring, carved timber crown brackets, and open courtyard ambient wash.",
    wallBgColor: "#D8C7B0",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 245, 215, 0.18) 0%, rgba(180, 140, 95, 0.06) 50%, transparent 85%)",
    floorBgColor: "#7A3E26",
    floorGradient: "linear-gradient(180deg, #9C5134 0%, #753A22 50%, #4D2312 100%)",
    lightingColor: "#FFF8EA",
    spotlightIntensity: 0.92,
    frameStyleDefault: "pahari-cedar",
    mouldingColor: "#BCA688",
    skirtingColor: "#593120",
    decorType: "villa-urn",
  },
  // 6. Corporate Gallery (Slate anthracite wall, terrazzo floor, cool neutral LED flood, brushed aluminum moulding)
  {
    id: "corporate-gallery",
    name: "Corporate Gallery (Metropolitan Pavilion)",
    category: "contemporary",
    description:
      "Sophisticated slate anthracite architectural wall, honed graphite terrazzo floor, cool LED flood wash, and brushed aluminum accents.",
    wallBgColor: "#22262C",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(200, 220, 255, 0.12) 0%, rgba(100, 120, 150, 0.04) 50%, transparent 85%)",
    floorBgColor: "#14171A",
    floorGradient: "linear-gradient(180deg, #242930 0%, #15181C 50%, #0A0C0E 100%)",
    lightingColor: "#EEF3FA",
    spotlightIntensity: 1.05,
    frameStyleDefault: "white-cube",
    mouldingColor: "#47515D",
    skirtingColor: "#1B2026",
    decorType: "corporate-bench",
  },
  // 7. Custom Curatorial Backdrop (User-defined wall backdrop with custom lighting)
  {
    id: "custom",
    name: "Custom Curatorial Backdrop",
    category: "custom",
    description:
      "Upload or link a custom high-resolution architectural backdrop from the Media Vault or local file system.",
    wallBgColor: "#1C1814",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#110E0C",
    floorGradient: "linear-gradient(180deg, #1C1814 0%, #0A0807 100%)",
    lightingColor: "#FFE7B8",
    spotlightIntensity: 1.0,
    frameStyleDefault: "white-cube",
    mouldingColor: "#2A2420",
    skirtingColor: "#14110E",
    decorType: "none",
  },
  // Backward compatibility alias definitions
  {
    id: "london-school-arts",
    name: "London School of Arts (King Charles Salon Wall)",
    category: "contemporary",
    description:
      "Museum eggshell wall with crisp painted white wood moulding, fine oak floorboards, and gentle diffuse museum track-light wash.",
    wallBgColor: "#E8E5DF",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#B59A78",
    floorGradient: "linear-gradient(180deg, #D4BA99 0%, #A88D6A 40%, #7A6245 100%)",
    lightingColor: "#FFF8EB",
    spotlightIntensity: 0.95,
    frameStyleDefault: "white-cube",
    mouldingColor: "#FFFFFF",
    skirtingColor: "#F5F5F3",
    decorType: "minimalist-bench",
  },
  {
    id: "tanjore-court",
    name: "Tanjore & Chettinad Court",
    category: "traditional-indian",
    description:
      "Deep rich heritage madder wall with polished teakwood baseboards, brass accents, and warm track lighting honoring Thanjavur 22k gold leaf relief.",
    wallBgColor: "#421B17",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#1A100B",
    floorGradient: "linear-gradient(180deg, #2D1A10 0%, #1A0E08 50%, #0A0503 100%)",
    lightingColor: "#FFDE82",
    spotlightIntensity: 1.05,
    frameStyleDefault: "tanjore-gold-teak",
    mouldingColor: "#2A120E",
    skirtingColor: "#2A120E",
    decorType: "atelier-brass",
  },
  {
    id: "mysore-palace",
    name: "Mysore Durbar Gallery",
    category: "traditional-indian",
    description:
      "Regal imperial sage plaster wall with polished rosewood baseboards and dignified royal gallery illumination.",
    wallBgColor: "#3A4B37",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#2A1C14",
    floorGradient: "linear-gradient(180deg, #3A2016 0%, #22130D 50%, #100906 100%)",
    lightingColor: "#FFEBAA",
    spotlightIntensity: 1.0,
    frameStyleDefault: "mysore-rosewood",
    mouldingColor: "#22130D",
    skirtingColor: "#22130D",
    decorType: "palace-pedestal",
  },
  {
    id: "pahari-pavilion",
    name: "Pahari & Kangra Pavilion",
    category: "traditional-indian",
    description:
      "Warm lime plaster wall with Himalayan deodar cedar wood brackets, polished baseboard, and soft diffused mountain ambient light.",
    wallBgColor: "#F4F0E8",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#523B2A",
    floorGradient: "linear-gradient(180deg, #6C4F39 0%, #4D3726 50%, #2F1F14 100%)",
    lightingColor: "#FFFDF6",
    spotlightIntensity: 0.9,
    frameStyleDefault: "pahari-cedar",
    mouldingColor: "#E2DAC8",
    skirtingColor: "#523B2A",
    decorType: "villa-urn",
  },
  {
    id: "basohli-veranda",
    name: "Basohli Court Veranda",
    category: "traditional-indian",
    description:
      "Warm terracotta plaster wall with dark timber baseboards, traditional court architecture, and dramatic chiaroscuro side lighting.",
    wallBgColor: "#8D4122",
    wallGradient: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
    floorBgColor: "#4A1B0E",
    floorGradient: "linear-gradient(180deg, #632615 0%, #44170A 50%, #280C05 100%)",
    lightingColor: "#FFC880",
    spotlightIntensity: 1.1,
    frameStyleDefault: "tanjore-gold-teak",
    mouldingColor: "#4E2114",
    skirtingColor: "#34130A",
    decorType: "atelier-brass",
  },
];

export function getWallEnvironment(id?: string): WallEnvironment {
  if (!id) return WALL_ENVIRONMENTS[0];
  const found = WALL_ENVIRONMENTS.find((e) => e.id === id);
  return found || WALL_ENVIRONMENTS[0];
}
