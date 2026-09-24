"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Sun,
  Moon,
  User,
  Layers,
  Image as ImageIcon,
  Info,
  QrCode,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UniversalMediaDialog } from "@/components/admin/universal-media-dialog";
import { cn } from "@/lib/utils";

// --- Environment Types & Presets ---
export type WallEnvironmentId =
  | "tanjore-court"
  | "mysore-darbar"
  | "pahari-veranda"
  | "temple-mandapa"
  | "white-cube"
  | "university-hall"
  | "heritage-nave";

export interface WallEnvironment {
  id: WallEnvironmentId;
  name: string;
  category: "Traditional Indian Heritage" | "Contemporary & Institutional";
  description: string;
  wallBgClass: string;
  wallStyle: React.CSSProperties;
  floorStyle: React.CSSProperties;
  ambientLight: string;
  spotlightGlow: string;
  architecturalDetails?: React.ReactNode;
}

export const WALL_ENVIRONMENTS: WallEnvironment[] = [
  {
    id: "tanjore-court",
    name: "Tanjore Court & Temple Sanctum",
    category: "Traditional Indian Heritage",
    description: "Deep teakwood paneling, brass sconces, rich crimson raw-silk wall, and directional spotlighting for 22k gold foil.",
    wallBgClass: "bg-[#2A0808]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #4A0E17 0%, #2A0808 65%, #150404 100%)",
      borderBottom: "12px solid #1C120C",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #1C120C 0%, #2C1D13 40%, #0F0906 100%)",
    },
    ambientLight: "rgba(212, 175, 55, 0.15)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "mysore-darbar",
    name: "Mysore Palace Darbar Hall",
    category: "Traditional Indian Heritage",
    description: "Rosewood architraves, ivory-inlay borders, regal sage-teal surfaces, and soft regal illumination.",
    wallBgClass: "bg-[#162B28]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #254641 0%, #162B28 65%, #0B1715 100%)",
      borderBottom: "12px solid #24140E",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #24140E 0%, #3D2218 40%, #140B08 100%)",
    },
    ambientLight: "rgba(230, 198, 90, 0.18)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "pahari-veranda",
    name: "Pahari / Kangra Hill-State Veranda",
    category: "Traditional Indian Heritage",
    description: "Deodar wood pillars, lime-plastered warm ivory niches, and soft Himalayan daylight for miniature folios.",
    wallBgClass: "bg-[#EFE9DF]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #FBF8F1 0%, #E8DFC8 70%, #D4C7AA 100%)",
      borderBottom: "12px solid #4A3525",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #4A3525 0%, #634732 40%, #2E2117 100%)",
    },
    ambientLight: "rgba(255, 245, 220, 0.35)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "temple-mandapa",
    name: "Classical Temple Mandapa",
    category: "Traditional Indian Heritage",
    description: "Carved granite stone wall blocks, dramatic oil-lamp and golden chiaroscuro casting divine shadows.",
    wallBgClass: "bg-[#1E1E22]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #35353C 0%, #1E1E22 65%, #101012 100%)",
      borderBottom: "12px solid #141416",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #141416 0%, #222226 40%, #0A0A0C 100%)",
    },
    ambientLight: "rgba(255, 160, 40, 0.2)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "white-cube",
    name: "White Cube Contemporary Museum",
    category: "Contemporary & Institutional",
    description: "Pristine minimalist gallery wall with ceiling track lights and polished concrete floor.",
    wallBgClass: "bg-[#EAEAEA]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #F8F8F8 0%, #E8E8E8 70%, #D8D8D8 100%)",
      borderBottom: "12px solid #5A5A5A",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #5A5A5A 0%, #757575 40%, #3D3D3D 100%)",
    },
    ambientLight: "rgba(255, 255, 255, 0.5)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "university-hall",
    name: "University Great Hall & Archive",
    category: "Contemporary & Institutional",
    description: "Deep wainscoted oak paneling, bronze institutional plaque, and dignified academic ambiance.",
    wallBgClass: "bg-[#201A15]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #3B3026 0%, #201A15 65%, #120E0B 100%)",
      borderBottom: "14px solid #140E0A",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #140E0A 0%, #2B1D15 40%, #0D0907 100%)",
    },
    ambientLight: "rgba(220, 180, 120, 0.2)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
  {
    id: "heritage-nave",
    name: "Heritage Sacred Nave",
    category: "Contemporary & Institutional",
    description: "Sandstone ashlar masonry, arched vaulted relief, and contemplative warm chiaroscuro.",
    wallBgClass: "bg-[#2E241E]",
    wallStyle: {
      background: "radial-gradient(circle at 50% 35%, #4C3C32 0%, #2E241E 65%, #1A1410 100%)",
      borderBottom: "12px solid #1A130E",
    },
    floorStyle: {
      background: "linear-gradient(to bottom, #1A130E 0%, #33261C 40%, #100C09 100%)",
    },
    ambientLight: "rgba(255, 200, 120, 0.2)",
    spotlightGlow: "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)",
  },
];

// --- Frame Types ---
export type WallFrameStyle = "tanjore-teak-gold" | "mysore-rosewood" | "floating-glass" | "frameless-canvas";

export interface WallFrameOption {
  id: WallFrameStyle;
  name: string;
  description: string;
  wrapperClass: string;
  innerMatClass: string;
  goldBeadClass: string;
}

export const WALL_FRAMES: WallFrameOption[] = [
  {
    id: "tanjore-teak-gold",
    name: "Ornate Tanjore Teak with 22k Gold Beading",
    description: "Seasoned dark teakwood moulding with hand-burnished 22k gold bead relief.",
    wrapperClass: "p-4 sm:p-5 rounded-lg bg-[#1B140E] border-4 border-[#3D2817] shadow-2xl ring-2 ring-[#D4AF37]/70",
    innerMatClass: "p-3 sm:p-4 bg-[#FBF8F1] border-2 border-[#1C1814]/40 shadow-inner",
    goldBeadClass: "border-2 border-[#D4AF37] shadow-[inset_0_0_0_1px_#8A6B1A,0_0_8px_rgba(212,175,55,0.4)]",
  },
  {
    id: "mysore-rosewood",
    name: "Mysore Rosewood with Ivory Inlay Fillet",
    description: "Polished South Indian rosewood frame with intricate ivory-fillet lining.",
    wrapperClass: "p-4 sm:p-5 rounded-lg bg-[#2A1512] border-4 border-[#4E241F] shadow-2xl ring-2 ring-[#E6C65A]/50",
    innerMatClass: "p-3 sm:p-4 bg-[#FAF7F0] border-2 border-[#E8DFC8]",
    goldBeadClass: "border-2 border-[#E6C65A] shadow-[0_0_6px_rgba(230,198,90,0.3)]",
  },
  {
    id: "floating-glass",
    name: "Museum Floating Glass Box",
    description: "Contemporary deep shadowbox with transparent acrylic float and museum glare-free glass.",
    wrapperClass: "p-5 sm:p-6 rounded-md bg-white/10 backdrop-blur-xs border-2 border-white/40 shadow-2xl ring-1 ring-black/20",
    innerMatClass: "p-2 bg-transparent",
    goldBeadClass: "border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
  },
  {
    id: "frameless-canvas",
    name: "Frameless Gallery-Wrapped Canvas",
    description: "Modern edge-to-edge wrapped board with natural side shadow relief.",
    wrapperClass: "p-0 rounded-sm shadow-[0_20px_45px_rgba(0,0,0,0.65)] ring-1 ring-black/40",
    innerMatClass: "p-0 bg-transparent",
    goldBeadClass: "border-none",
  },
];

// --- Preset Artworks for Quick Mounting ---
export interface MountedArtwork {
  title: string;
  subtitle?: string;
  medium: string;
  period: string;
  dimensions: string; // e.g. "24 × 30 in (61 × 76 cm)"
  imageUrl: string;
  ragaLink?: string;
  slug?: string;
}

export const PRESET_ARTWORKS: MountedArtwork[] = [
  {
    title: "Swarna Ganesha in Royal Court Mandapa",
    subtitle: "Sacred Iconography with 22k Gold Foil",
    medium: "22-Karat Gold Leaf, Natural Mineral Pigments, Sukka Chunam Gesso on Teak",
    period: "Thanjavur Nayaka School Revival",
    dimensions: "30 × 36 in (76 × 91 cm)",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200",
    ragaLink: "Raga Hamsadhwani",
    slug: "swarna-ganesha",
  },
  {
    title: "Navaneetha Krishna with Kamadhenu",
    subtitle: "Classical Mysore Devotional Panel",
    medium: "22k Gold Embossing, Ruby & Emerald Beads, Traditional French Chalk Gesso",
    period: "Mysore Traditional School",
    dimensions: "24 × 30 in (61 × 76 cm)",
    imageUrl: "https://images.unsplash.com/photo-1582561121160-b610c3b8794c?auto=format&fit=crop&q=80&w=1200",
    ragaLink: "Raga Mohanam",
    slug: "navaneetha-krishna",
  },
  {
    title: "Rajarajeswari Devi Enthroned in Sri Chakra",
    subtitle: "Divine Tantric & Melodic Iconography",
    medium: "22k Gold Foil Relief, Agate-Burnished Gesso, Seasoned Jackwood",
    period: "Sacred Thanjavur Classical Opus",
    dimensions: "36 × 48 in (91 × 122 cm)",
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1200",
    ragaLink: "Raga Kalyani",
    slug: "rajarajeswari-devi",
  },
];

export interface ExhibitionWallViewerProps {
  initialArtwork?: Partial<MountedArtwork>;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ExhibitionWallViewer({
  initialArtwork,
  onClose,
  showCloseButton = false,
}: ExhibitionWallViewerProps) {
  // Simulator configuration states
  const [activeEnvId, setActiveEnvId] = React.useState<WallEnvironmentId>("tanjore-court");
  const [activeFrameId, setActiveFrameId] = React.useState<WallFrameStyle>("tanjore-teak-gold");
  const [lightMode, setLightMode] = React.useState<"warm" | "crisp">("warm");
  const [showScaleReference, setShowScaleReference] = React.useState<boolean>(true);
  const [showPlacard, setShowPlacard] = React.useState<boolean>(true);
  const [artworkScale, setArtworkScale] = React.useState<number>(100); // 70% to 140%
  const [zoomLevel, setZoomLevel] = React.useState<number>(100); // 80% to 150%

  // Active Mounted Artwork State
  const [artwork, setArtwork] = React.useState<MountedArtwork>({
    title: initialArtwork?.title || PRESET_ARTWORKS[0].title,
    subtitle: initialArtwork?.subtitle || PRESET_ARTWORKS[0].subtitle,
    medium: initialArtwork?.medium || PRESET_ARTWORKS[0].medium,
    period: initialArtwork?.period || PRESET_ARTWORKS[0].period,
    dimensions: initialArtwork?.dimensions || PRESET_ARTWORKS[0].dimensions,
    imageUrl: initialArtwork?.imageUrl || PRESET_ARTWORKS[0].imageUrl,
    ragaLink: initialArtwork?.ragaLink || PRESET_ARTWORKS[0].ragaLink,
    slug: initialArtwork?.slug || PRESET_ARTWORKS[0].slug,
  });

  // Media vault dialog state
  const [isMediaVaultOpen, setIsMediaVaultOpen] = React.useState(false);

  // Resolved Environment & Frame
  const activeEnv = WALL_ENVIRONMENTS.find((e) => e.id === activeEnvId) || WALL_ENVIRONMENTS[0];
  const activeFrame = WALL_FRAMES.find((f) => f.id === activeFrameId) || WALL_FRAMES[0];

  const lightOverlay =
    lightMode === "warm"
      ? "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255, 248, 230, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 85%)"
      : "radial-gradient(ellipse 65% 50% at 50% 20%, rgba(240, 245, 255, 0.14) 0%, rgba(200, 220, 255, 0.05) 50%, transparent 85%)";

  return (
    <div className="relative w-full h-full min-h-[90vh] flex flex-col bg-stone-950 text-stone-100 select-none overflow-hidden font-sans">
      {/* 1. Top Simulator Control Bar */}
      <header className="relative z-30 h-16 px-4 sm:px-6 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-stone-100 tracking-wide flex items-center gap-2">
              Architectural Exhibition Wall Simulator
              <Badge className="bg-amber-600 text-stone-950 font-bold text-[9px] uppercase tracking-wider hidden sm:inline-flex">
                3D Spatial Preview
              </Badge>
            </h1>
            <p className="text-[10px] text-stone-400 font-mono hidden md:block">
              Photorealistic traditional temple, court & museum gallery environments
            </p>
          </div>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Lighting Mode Switcher */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLightMode(lightMode === "warm" ? "crisp" : "warm")}
            className="h-8 text-xs border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 gap-1.5"
            title="Toggle Light Spectrum"
          >
            {lightMode === "warm" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">2700K Warm Temple</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">4500K Crisp Museum</span>
              </>
            )}
          </Button>

          {/* Scale Reference Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowScaleReference(!showScaleReference)}
            className={cn(
              "h-8 text-xs border-stone-700 gap-1.5 transition-colors",
              showScaleReference
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-stone-800/80 hover:bg-stone-700 text-stone-300"
            )}
            title="Toggle Human & Bench Scale Reference"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scale Model</span>
          </Button>

          {/* Placard Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPlacard(!showPlacard)}
            className={cn(
              "h-8 text-xs border-stone-700 gap-1.5 transition-colors",
              showPlacard
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-stone-800/80 hover:bg-stone-700 text-stone-300"
            )}
            title="Toggle Museum Exhibition Placard"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Museum Placard</span>
          </Button>

          {showCloseButton && onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs text-stone-400 hover:text-stone-100"
            >
              ✕ Close
            </Button>
          )}
        </div>
      </header>

      {/* 2. Main Simulator Body: Left Studio Sidebar + Center Spatial Stage */}
      <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Spatial Stage / 3D Exhibition Viewport */}
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
          {/* Top Lighting Sconce & Track Fixture */}
          <div className="absolute top-0 inset-x-0 h-10 z-20 flex justify-center items-start pointer-events-none">
            <div className="w-48 sm:w-72 h-3 bg-stone-900 border-b border-stone-700 shadow-lg flex items-center justify-around px-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            </div>
          </div>

          {/* Wall Plane (72% height) */}
          <div
            className="relative w-full flex-1 flex items-center justify-center transition-all duration-700 overflow-hidden"
            style={activeEnv.wallStyle}
          >
            {/* Dynamic Spotlight Glow Layer - placed strictly behind the artwork frame */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-700 z-[1]"
              style={{ background: lightOverlay }}
            />

            {/* Ceiling shadow falloff */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[2]" />

            {/* Mounted Masterwork Stage Frame */}
            <div
              className="relative z-10 transition-all duration-500 ease-out flex flex-col items-center"
              style={{
                transform: `scale(${(artworkScale / 100) * (zoomLevel / 100)})`,
                transformOrigin: "center center",
              }}
            >
              {/* Frame Container */}
              <div className={cn("relative transition-all duration-500", activeFrame.wrapperClass)}>
                {/* Inner Matting Canvas */}
                <div className={cn("transition-all duration-500", activeFrame.innerMatClass)}>
                  {/* Gold Beading / Fillet Border */}
                  <div className={cn("relative overflow-hidden", activeFrame.goldBeadClass)}>
                    {/* Artwork Image with 100% Opacity and Natural Color Rendering */}
                    <div className="relative w-64 sm:w-80 md:w-96 aspect-[3/4] max-h-[58vh]">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Museum Exhibition Placard - hidden on mobile viewports (< 768px) */}
              {showPlacard && (
                <div
                  className="hidden md:block absolute -bottom-16 sm:-bottom-20 right-0 sm:-right-24 md:-right-36 p-3 sm:p-3.5 rounded shadow-2xl border border-stone-300 w-52 sm:w-60 z-20 text-left transition-all isolate [color-scheme:light]"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#111827",
                    transform: `scale(${100 / artworkScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className="text-[9px] font-mono uppercase tracking-widest font-bold"
                      style={{ color: "#854D0E" }}
                    >
                      Atelier Lalita Kapilavai
                    </span>
                    <QrCode className="w-4 h-4 text-stone-500 shrink-0" />
                  </div>
                  <h4
                    className="text-xs font-serif font-bold leading-tight"
                    style={{ color: "#111827" }}
                  >
                    {artwork.title}
                  </h4>
                  {artwork.subtitle && (
                    <p
                      className="text-[10px] font-serif italic mb-1"
                      style={{ color: "#374151" }}
                    >
                      {artwork.subtitle}
                    </p>
                  )}
                  <p
                    className="text-[9px] leading-tight mb-1"
                    style={{ color: "#374151" }}
                  >
                    {artwork.medium}
                  </p>
                  <div
                    className="flex items-center justify-between text-[9px] font-mono border-t border-stone-200 pt-1 mt-1"
                    style={{ color: "#4B5563" }}
                  >
                    <span>{artwork.dimensions}</span>
                    <span>{artwork.period}</span>
                  </div>
                  {artwork.ragaLink && (
                    <div
                      className="text-[9px] font-mono font-semibold mt-1"
                      style={{ color: "#854D0E" }}
                    >
                      Synesthesia: {artwork.ragaLink}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* True Scale References: Silhouette & Gallery Bench */}
            {showScaleReference && (
              <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none z-15 flex items-end justify-between px-8 sm:px-16 overflow-hidden">
                {/* Left: Standing Visitor Silhouette (~1.75m visual comparison) */}
                <div className="flex flex-col items-center opacity-75">
                  <div className="w-8 h-8 rounded-full bg-stone-900/90 border border-stone-700/60 shadow-lg" />
                  <div className="w-14 h-32 bg-gradient-to-b from-stone-900 to-stone-950 rounded-t-xl border-x border-stone-800 shadow-2xl" />
                  <span className="text-[9px] font-mono text-stone-400 mt-1 bg-stone-950/80 px-1.5 py-0.5 rounded">
                    Human Scale (1.75m)
                  </span>
                </div>

                {/* Right: Museum Teakwood Gallery Bench */}
                <div className="hidden sm:flex flex-col items-center opacity-85">
                  <div className="w-40 sm:w-56 h-6 rounded bg-[#2D1B13] border-t-2 border-[#543425] shadow-2xl relative">
                    <div className="absolute -bottom-10 left-4 w-3 h-10 bg-[#1F120C]" />
                    <div className="absolute -bottom-10 right-4 w-3 h-10 bg-[#1F120C]" />
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 mt-12 bg-stone-950/80 px-1.5 py-0.5 rounded">
                    Museum Gallery Bench
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hardwood / Granite Floor Plane (28% height with true perspective depth) */}
          <div
            className="relative w-full h-24 sm:h-32 transition-all duration-700 shadow-[inset_0_12px_24px_rgba(0,0,0,0.8)] z-10"
            style={activeEnv.floorStyle}
          >
            {/* Cast shadow of the artwork and human on the polished floor */}
            <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="absolute bottom-2 left-6 text-[10px] font-mono text-stone-500/70">
              Architectural Wall Simulator • 1:1 True Proportional Calibration
            </div>
          </div>
        </div>

        {/* 3. Studio Inspector & Mounting Engine (Right / Bottom Drawer on Mobile) */}
        <aside className="w-full md:w-80 lg:w-96 bg-stone-900 border-t md:border-t-0 md:border-l border-stone-800 p-4 sm:p-5 overflow-y-auto z-20 space-y-5 shrink-0 max-h-[40vh] md:max-h-none">
          {/* Environment Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Exhibition Environment
            </Label>
            <Select
              value={activeEnvId}
              onValueChange={(val: WallEnvironmentId) => setActiveEnvId(val)}
            >
              <SelectTrigger className="h-9 text-xs bg-stone-800 border-stone-700 text-stone-100">
                <SelectValue placeholder="Select Environment" />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700 text-stone-100">
                <div className="px-2 py-1 text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Traditional Indian Heritage
                </div>
                {WALL_ENVIRONMENTS.filter((e) => e.category === "Traditional Indian Heritage").map(
                  (env) => (
                    <SelectItem key={env.id} value={env.id} className="text-xs py-1.5">
                      {env.name}
                    </SelectItem>
                  )
                )}
                <div className="px-2 py-1 text-[10px] font-mono text-amber-400 uppercase font-bold border-t border-stone-800 mt-1">
                  Contemporary & Institutional
                </div>
                {WALL_ENVIRONMENTS.filter((e) => e.category === "Contemporary & Institutional").map(
                  (env) => (
                    <SelectItem key={env.id} value={env.id} className="text-xs py-1.5">
                      {env.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-stone-400 font-serif leading-tight">
              {activeEnv.description}
            </p>
          </div>

          {/* Framing Selector */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <Label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Architectural Framing
            </Label>
            <Select
              value={activeFrameId}
              onValueChange={(val: WallFrameStyle) => setActiveFrameId(val)}
            >
              <SelectTrigger className="h-9 text-xs bg-stone-800 border-stone-700 text-stone-100">
                <SelectValue placeholder="Select Frame Style" />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700 text-stone-100">
                {WALL_FRAMES.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs py-1.5">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-stone-400 font-serif leading-tight">
              {activeFrame.description}
            </p>
          </div>

          {/* Mounting Engine: Preset Artworks or Custom Vault Asset */}
          <div className="space-y-2.5 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Mount Artwork
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaVaultOpen(true)}
                className="h-6 text-[10px] border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-2"
              >
                Media Vault
              </Button>
            </div>

            {/* Quick Preset Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_ARTWORKS.map((art, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setArtwork(art)}
                  className={cn(
                    "p-1.5 rounded border text-left transition-all cursor-pointer",
                    artwork.title === art.title
                      ? "border-amber-400 bg-amber-500/20 text-amber-200"
                      : "border-stone-800 bg-stone-800/60 hover:bg-stone-800 text-stone-300"
                  )}
                >
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-12 object-cover rounded mb-1"
                  />
                  <span className="text-[10px] font-serif font-bold block truncate">
                    {art.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale & Zoom Sliders */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Artwork Physical Scale</span>
                <span className="font-mono text-amber-400">{artworkScale}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={140}
                value={artworkScale}
                onChange={(e) => setArtworkScale(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Audience Viewport Zoom</span>
                <span className="font-mono text-amber-400">{zoomLevel}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={140}
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded"
              />
            </div>
          </div>

          {/* Artwork Info & Acquisition CTA */}
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2 pt-2">
            <div className="text-xs font-serif font-bold text-amber-200">{artwork.title}</div>
            <div className="text-[11px] text-stone-300 font-mono">
              Dimension: {artwork.dimensions}
            </div>
            {artwork.ragaLink && (
              <div className="text-[11px] text-amber-400 font-mono">
                Raga Concordance: {artwork.ragaLink}
              </div>
            )}
            <div className="pt-2 flex gap-2">
              <Button
                asChild
                size="sm"
                className="w-full h-8 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded"
              >
                <Link href={artwork.slug ? `/artwork/${artwork.slug}` : "/gallery"}>
                  Acquisition / Details
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Universal Media Vault Dialog */}
      <UniversalMediaDialog
        open={isMediaVaultOpen}
        onOpenChange={setIsMediaVaultOpen}
        onSelect={(item) => {
          setArtwork({
            ...artwork,
            imageUrl: item.url,
            title: item.title || "Custom Archival Plate",
          });
          setIsMediaVaultOpen(false);
        }}
      />
    </div>
  );
}
