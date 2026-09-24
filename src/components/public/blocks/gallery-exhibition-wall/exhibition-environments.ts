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
      "High-ceiling gallery partition with architectural crown moulding, oak floorboards, and precision ceiling track spots (as exhibited at the King Charles London School of Arts).",
    wallBgColor: "#F4F3EF",
    wallGradient: "linear-gradient(180deg, #FBFBFA 0%, #F0EFEA 60%, #E8E7E0 100%)",
    floorBgColor: "#B59A78",
    floorGradient: "linear-gradient(180deg, #D4BA99 0%, #A88D6A 40%, #7A6245 100%)",
    lightingColor: "#FFF8EB",
    spotlightIntensity: 1.4,
    frameStyleDefault: "white-cube",
    mouldingColor: "#E2E0D8",
    skirtingColor: "#D6D4CA",
  },
  {
    id: "tanjore-court",
    name: "Tanjore & Chettinad Court",
    category: "traditional-indian",
    description:
      "Deep teakwood pilasters, maroon raw-silk tapestries, brass accents, and warm 2700K oil-lamp glow honoring Thanjavur 22k gold leaf relief.",
    wallBgColor: "#2A0808",
    wallGradient: "radial-gradient(ellipse at 50% 35%, #4C111A 0%, #2A0808 65%, #140404 100%)",
    floorBgColor: "#1A100B",
    floorGradient: "linear-gradient(180deg, #2D1A10 0%, #1A0E08 50%, #0A0503 100%)",
    lightingColor: "#FFDE82",
    spotlightIntensity: 1.6,
    frameStyleDefault: "tanjore-gold-teak",
    mouldingColor: "#3D2416",
    skirtingColor: "#1F120A",
  },
  {
    id: "mysore-palace",
    name: "Mysore Durbar Gallery",
    category: "traditional-indian",
    description:
      "Rosewood architraves, ivory-inlay borders, regal sage green and teal plaster, and dignified royal court illumination.",
    wallBgColor: "#162B28",
    wallGradient: "radial-gradient(ellipse at 50% 35%, #254641 0%, #162B28 65%, #0B1715 100%)",
    floorBgColor: "#22130D",
    floorGradient: "linear-gradient(180deg, #3A2016 0%, #22130D 50%, #100906 100%)",
    lightingColor: "#FFEBAA",
    spotlightIntensity: 1.5,
    frameStyleDefault: "mysore-rosewood",
    mouldingColor: "#382216",
    skirtingColor: "#26150C",
  },
  {
    id: "pahari-pavilion",
    name: "Pahari & Kangra Pavilion",
    category: "traditional-indian",
    description:
      "Hand-finished lime-washed white plaster, Himalayan deodar cedar wood brackets, and soft diffused mountain ambient light for miniature folios.",
    wallBgColor: "#EFE9DF",
    wallGradient: "linear-gradient(180deg, #FAF7F2 0%, #ECE3D2 65%, #DDD1BC 100%)",
    floorBgColor: "#523B2A",
    floorGradient: "linear-gradient(180deg, #6C4F39 0%, #4D3726 50%, #2F1F14 100%)",
    lightingColor: "#FFFDF6",
    spotlightIntensity: 1.3,
    frameStyleDefault: "pahari-cedar",
    mouldingColor: "#5C3E29",
    skirtingColor: "#3F2818",
  },
  {
    id: "basohli-veranda",
    name: "Basohli Court Veranda",
    category: "traditional-indian",
    description:
      "Terracotta brick accents, deep warm ochre wash, traditional court architecture, and dramatic chiaroscuro side lighting.",
    wallBgColor: "#8D4122",
    wallGradient: "radial-gradient(ellipse at 50% 35%, #B85830 0%, #8D4122 65%, #59230F 100%)",
    floorBgColor: "#4A1B0E",
    floorGradient: "linear-gradient(180deg, #632615 0%, #44170A 50%, #280C05 100%)",
    lightingColor: "#FFC880",
    spotlightIntensity: 1.7,
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
    wallGradient: "radial-gradient(ellipse at 50% 35%, #2A2420 0%, #151210 100%)",
    floorBgColor: "#110E0C",
    floorGradient: "linear-gradient(180deg, #1C1814 0%, #0A0807 100%)",
    lightingColor: "#FFE7B8",
    spotlightIntensity: 1.5,
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
