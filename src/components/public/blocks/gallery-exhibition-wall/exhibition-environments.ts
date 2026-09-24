export type EnvironmentCategory = "traditional-indian" | "contemporary" | "custom";

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
}

export const WALL_ENVIRONMENTS: WallEnvironment[] = [
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
  },
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
  },
];

export function getWallEnvironment(id?: string): WallEnvironment {
  if (!id) return WALL_ENVIRONMENTS[0];
  const found = WALL_ENVIRONMENTS.find((e) => e.id === id);
  return found || WALL_ENVIRONMENTS[0];
}
