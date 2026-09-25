"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ImagePlus,
  Sparkles,
  Link as LinkIcon,
  UploadCloud,
  Clock,
  Layers,
  Square,
  Film,
  Palette,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UniversalMediaDialog } from "@/components/admin/universal-media-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaGalleryItem, MediaGalleryDisplayMode } from "@/components/public/blocks/media-gallery-block";
import { WALL_ENVIRONMENTS } from "@/components/public/blocks/gallery-exhibition-wall/exhibition-environments";
import { cn } from "@/lib/utils";

export interface MediaGalleryBlockData {
  displayMode?: MediaGalleryDisplayMode;
  autoplayTimer?: number;
  aspectRatio?: "landscape" | "portrait" | "square" | "natural";
  frameStyle?: "heritage" | "minimal" | "floating" | "none";
  kenBurnsOverlayTheme?: "dark-velvet" | "parchment-gold" | "minimal-subtle";
  overlayTitleColor?: string;
  overlayTextColor?: string;
  canvasBgColor?: string;
  borderFilletColor?: string;
  borderWidth?: number;
  framePadding?: number;
  showCaptionRibbon?: boolean;
  environmentId?: string;
  culturalEnvironment?: string;
  customWallUrl?: string;
  customWallBackdropUrl?: string;
  cameraTourStyle?: "overview" | "drone" | "walkthrough" | "inspection";
  wallLayout?: "salon" | "linear" | "grid";
  autoplayTour?: boolean;
  overviewDwellSeconds?: number;
  showExhibitionBadge?: boolean;
  maxArtworksPerWall?: number;
  showFrameHeader?: boolean;
  frameHeaderBg?: string;
  frameHeaderTextColor?: string;
  items?: MediaGalleryItem[];
}

export interface MediaGalleryInspectorProps {
  data: MediaGalleryBlockData;
  onChange: (updated: MediaGalleryBlockData) => void;
}

export function MediaGalleryInspector({ data, onChange }: MediaGalleryInspectorProps) {
  const displayMode = data.displayMode ?? "carousel";
  const autoplayTimer = data.autoplayTimer ?? 5;
  const aspectRatio = data.aspectRatio ?? "landscape";
  const frameStyle = data.frameStyle ?? "heritage";
  const kenBurnsOverlayTheme = data.kenBurnsOverlayTheme ?? "dark-velvet";
  const overlayTitleColor = data.overlayTitleColor ?? "";
  const overlayTextColor = data.overlayTextColor ?? "";
  const canvasBgColor = data.canvasBgColor ?? "";
  const borderFilletColor = data.borderFilletColor ?? "#D4AF37";
  const borderWidth = data.borderWidth ?? 0;
  const framePadding = data.framePadding ?? 0;
  const showCaptionRibbon = data.showCaptionRibbon ?? false;
  const environmentId = data.culturalEnvironment ?? data.environmentId ?? "london-school-arts";
  const customWallUrl = data.customWallBackdropUrl ?? data.customWallUrl ?? "";
  const cameraTourStyle = data.cameraTourStyle ?? "drone";
  const wallLayout = data.wallLayout ?? "salon";
  const autoplayTour = data.autoplayTour ?? true;
  const overviewDwellSeconds = data.overviewDwellSeconds ?? 4;
  const maxArtworksPerWall = data.maxArtworksPerWall ?? 4;
  const showFrameHeader = data.showFrameHeader ?? false;
  const frameHeaderBg = data.frameHeaderBg ?? "#0F0E0D";
  const frameHeaderTextColor = data.frameHeaderTextColor ?? "#F5EBE1";
  const items = data.items ?? [];

  const [activeItemIndex, setActiveItemIndex] = React.useState<number>(0);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Universal Media Dialog state
  const [isMediaDialogOpen, setIsMediaDialogOpen] = React.useState(false);
  const [mediaDialogTargetIndex, setMediaDialogTargetIndex] = React.useState<number | null>(null);
  const [mediaDialogMode, setMediaDialogMode] = React.useState<"items" | "customWall">("items");

  // Cached artworks and categories for item linking
  const [artworksList, setArtworksList] = React.useState<{
    id: string;
    title: string;
    slug: string;
    medium?: string;
    dimensions?: string;
    yearCreated?: number | string;
    description?: string;
    category?: { name: string };
    watermarkedWebpUrl?: string;
    primaryImageUrl?: string;
  }[]>([]);
  const [categoriesList, setCategoriesList] = React.useState<{ id: string; name: string; slug: string }[]>([]);

  React.useEffect(() => {
    // Fetch artworks with full curatorial metadata
    fetch("/api/admin/artworks")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setArtworksList(
            data.map(
              (a: {
                id: string;
                title: string;
                slug: string;
                medium?: string;
                dimensions?: string;
                yearCreated?: number | string;
                description?: string;
                category?: { name: string };
                watermarkedWebpUrl?: string;
                primaryImageUrl?: string;
              }) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                medium: a.medium,
                dimensions: a.dimensions,
                yearCreated: a.yearCreated,
                description: a.description,
                category: a.category ? { name: a.category.name } : undefined,
                watermarkedWebpUrl: a.watermarkedWebpUrl,
                primaryImageUrl: a.primaryImageUrl,
              })
            )
          );
        }
      })
      .catch(() => {});

    // Fetch categories
    fetch("/api/admin/art-categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoriesList(data.map((c: { id: string; name: string; slug: string }) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
      })
      .catch(() => {});
  }, []);

  const handleModeChange = (mode: MediaGalleryDisplayMode) => {
    onChange({
      ...data,
      displayMode: mode,
    });
  };

  const handleTimerChange = (val: number) => {
    onChange({
      ...data,
      autoplayTimer: val,
    });
  };

  const handleAspectChange = (ratio: "landscape" | "portrait" | "square" | "natural") => {
    onChange({
      ...data,
      aspectRatio: ratio,
    });
  };

  const handleFrameChange = (style: "heritage" | "minimal" | "floating" | "none") => {
    onChange({
      ...data,
      frameStyle: style,
    });
  };

  const handleOverlayThemeChange = (theme: "dark-velvet" | "parchment-gold" | "minimal-subtle") => {
    onChange({
      ...data,
      kenBurnsOverlayTheme: theme,
    });
  };

  const handleTitleColorChange = (color: string) => {
    onChange({
      ...data,
      overlayTitleColor: color,
    });
  };

  const handleTextColorChange = (color: string) => {
    onChange({
      ...data,
      overlayTextColor: color,
    });
  };

  const handleCanvasBgColorChange = (color: string) => {
    onChange({
      ...data,
      canvasBgColor: color,
    });
  };

  const handleBorderFilletColorChange = (color: string) => {
    onChange({
      ...data,
      borderFilletColor: color,
    });
  };

  const handleBorderWidthChange = (w: number) => {
    onChange({
      ...data,
      borderWidth: w,
    });
  };

  const handleFramePaddingChange = (p: number) => {
    onChange({
      ...data,
      framePadding: p,
    });
  };

  const handleShowCaptionRibbonChange = (show: boolean) => {
    onChange({
      ...data,
      showCaptionRibbon: show,
    });
  };

  const handleEnvironmentChange = (env: string) => {
    onChange({
      ...data,
      environmentId: env,
      culturalEnvironment: env,
    });
  };

  const handleCustomWallUrlChange = (url: string) => {
    onChange({
      ...data,
      customWallUrl: url,
      customWallBackdropUrl: url,
    });
  };

  const handleCameraTourStyleChange = (style: "overview" | "drone" | "walkthrough" | "inspection") => {
    onChange({
      ...data,
      cameraTourStyle: style,
    });
  };

  const handleWallLayoutChange = (layout: "salon" | "linear" | "grid") => {
    onChange({
      ...data,
      wallLayout: layout,
    });
  };

  const handleAutoplayTourChange = (auto: boolean) => {
    onChange({
      ...data,
      autoplayTour: auto,
    });
  };

  const handleOverviewDwellSecondsChange = (val: number) => {
    onChange({
      ...data,
      overviewDwellSeconds: val,
    });
  };

  const handleMaxArtworksPerWallChange = (val: number) => {
    onChange({
      ...data,
      maxArtworksPerWall: val,
    });
  };

  const enrichItemWithArtwork = React.useCallback(
    (input: Partial<MediaGalleryItem> & { url: string; title?: string; alt?: string; originalFileName?: string; artworkId?: string; slug?: string }): MediaGalleryItem => {
      // Find matching artwork in catalog
      const matchingArt = artworksList.find(
        (a) =>
          (input.artworkId && a.id === input.artworkId) ||
          (input.slug && a.slug === input.slug) ||
          (input.linkTarget && a.slug === input.linkTarget) ||
          (a.watermarkedWebpUrl && a.watermarkedWebpUrl === input.url) ||
          (a.primaryImageUrl && a.primaryImageUrl === input.url) ||
          (input.title && a.title.toLowerCase().trim() === input.title.toLowerCase().trim())
      );

      const resolvedTitle = input.title && input.title !== "Classical Masterwork Detail" ? input.title : (matchingArt?.title || input.title || "Classical Masterwork Detail");
      const resolvedSchool = input.traditionalSchool || matchingArt?.category?.name || (matchingArt ? "Thanjavur (Tanjore) Classical" : "");
      const resolvedMedium = input.medium || matchingArt?.medium || (matchingArt ? "22k Gold Foil, Gesso, Teak Wood" : "");
      const resolvedDimensions = input.dimensions || matchingArt?.dimensions || "";
      const resolvedYear = input.year || (matchingArt?.yearCreated ? String(matchingArt.yearCreated) : "");
      const resolvedDesc = input.description || matchingArt?.description || "";
      const resolvedLinkType = input.linkType && input.linkType !== "none" ? input.linkType : matchingArt ? "artwork" : "none";
      const resolvedLinkTarget = input.linkTarget || matchingArt?.slug || "";

      return {
        id: input.id || `mg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: input.url,
        title: resolvedTitle,
        caption: input.caption || (matchingArt ? `Authentic ${resolvedSchool} sacred panel with 22k gold relief.` : "Sacred iconographic panel rendered in authentic 22k gold foil."),
        alt: input.alt || input.originalFileName || resolvedTitle,
        medium: resolvedMedium,
        dimensions: resolvedDimensions,
        traditionalSchool: resolvedSchool,
        year: resolvedYear,
        description: resolvedDesc,
        artworkId: matchingArt?.id || input.artworkId,
        linkType: resolvedLinkType,
        linkTarget: resolvedLinkTarget,
      };
    },
    [artworksList]
  );

  const handleAddItem = (newUrl = "", newTitle = "", newAlt = "", extra?: Partial<MediaGalleryItem>) => {
    const url = newUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200";
    const enriched = enrichItemWithArtwork({
      url,
      title: newTitle,
      alt: newAlt,
      ...extra,
    });
    const updated = [...items, enriched].slice(0, 12);
    onChange({
      ...data,
      items: updated,
    });
    setActiveItemIndex(updated.length - 1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange({
      ...data,
      items: updated,
    });
    if (activeItemIndex >= updated.length) {
      setActiveItemIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange({
      ...data,
      items: copy,
    });
    setActiveItemIndex(targetIndex);
  };

  const handleUpdateItem = (index: number, updates: Partial<MediaGalleryItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...updates };
    onChange({
      ...data,
      items: copy,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "general");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.publicUrl || json.watermarkedUrl || json.primaryImageUrl;
        if (uploadedUrl) {
          handleAddItem(uploadedUrl);
          toast.success("Image uploaded to gallery!");
        } else {
          toast.error("Upload succeeded but URL was missing.");
        }
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Network error during image upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeItem = items[activeItemIndex];

  return (
    <div className="space-y-6">
      {/* 1. Gallery Presentation Mode Switcher */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
        <Label className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Gallery Presentation Engine
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleModeChange("carousel")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "carousel"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Carousel</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Auto-playing slide reel with pause-on-hover & chevrons.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("scroll")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "scroll"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Snap Scroll</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Swipeable horizontal snap-point reel for series.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("collage")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "collage"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Square className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Curated Bento</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Asymmetric fine-art masonry masonry collage.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("ken-burns")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "ken-burns"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Film className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Ken Burns</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Cinematic slow drift with ethereal gold particles.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("soft-crossfade")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "soft-crossfade"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Soft Crossfade</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              1.2s fine-art dissolve with gentle zoom &amp; placard.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("filmstrip")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "filmstrip"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Filmstrip Reel</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Continuous panoramic filmstrip with vintage mounts.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("exhibition-wall")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "exhibition-wall"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Exhibition Wall</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              London School salon wall with 3D camera directed tour.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Exhibition Salon Wall Architecture Studio */}
      {displayMode === "exhibition-wall" && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5 text-amber-600" /> Exhibition Salon Wall Architecture Studio
            </Label>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-800 dark:text-amber-300">
              3D WebGL Multi-Artwork Salon
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cultural Environment Preset */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Cultural Environment</Label>
              <Select value={environmentId} onValueChange={(val) => handleEnvironmentChange(val)}>
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Select Environment" />
                </SelectTrigger>
                <SelectContent>
                  {WALL_ENVIRONMENTS.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Authentic lighting, architectural moulding &amp; floorboards.
              </p>
            </div>

            {/* Camera Walkthrough Style */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Camera Directed Flow</Label>
              <Select
                value={cameraTourStyle}
                onValueChange={(val: "overview" | "drone" | "walkthrough" | "inspection") =>
                  handleCameraTourStyleChange(val)
                }
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Select Camera Tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drone">Smooth Drone Pan &amp; Zoom</SelectItem>
                  <SelectItem value="walkthrough">Curatorial Eye-Level Visitor</SelectItem>
                  <SelectItem value="inspection">Archival Macro (22k Gold Relief)</SelectItem>
                  <SelectItem value="overview">Salon Wall Wide Overview</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Cinematic perspective interpolation.
              </p>
            </div>

            {/* Wall Layout Matrix */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Wall Hanging Layout</Label>
              <Select
                value={wallLayout}
                onValueChange={(val: "salon" | "linear" | "grid") => handleWallLayoutChange(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Select Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Asymmetrical Salon (London School)</SelectItem>
                  <SelectItem value="linear">Linear Eye-Level Promenade</SelectItem>
                  <SelectItem value="grid">Balanced Curatorial Grid</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Proportional fine-art salon spacing.
              </p>
            </div>
          </div>

          {/* Custom Wall Backdrop URL (when custom environment is selected) */}
          {environmentId === "custom" && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground">Custom Wall Backdrop URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="https://... or /uploads/..."
                  value={customWallUrl}
                  onChange={(e) => handleCustomWallUrlChange(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaDialogMode("customWall");
                    setIsMediaDialogOpen(true);
                  }}
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1" /> Media Vault
                </Button>
              </div>
            </div>
          )}

          {/* Autoplay Tour & Dwell Speeds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-amber-500/20">
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-center gap-1.5">
              <div>
                <Label className="text-xs font-semibold text-foreground">Autoplay Tour</Label>
                <p className="text-[10px] text-muted-foreground">
                  Cycles camera between walls and pieces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAutoplayTourChange(!autoplayTour)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                  autoplayTour ? "bg-amber-600" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "block w-4 h-4 rounded-full bg-white transition-transform transform",
                    autoplayTour ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Max Artworks Per Wall</span>
                <span className="text-primary font-mono text-xs">{maxArtworksPerWall}</span>
              </Label>
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={maxArtworksPerWall}
                onChange={(e) => handleMaxArtworksPerWallChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">Partitions corridor (2 to 8)</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Overview Wall Dwell</span>
                <span className="text-primary font-mono text-xs">{overviewDwellSeconds}s</span>
              </Label>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={overviewDwellSeconds}
                onChange={(e) => handleOverviewDwellSecondsChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">Panoramic wall hold (2s - 10s)</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Artwork Focus Dwell</span>
                <span className="text-primary font-mono text-xs">{autoplayTimer}s</span>
              </Label>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={autoplayTimer}
                onChange={(e) => handleTimerChange(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">Focus dwell (3s - 15s)</span>
            </div>
          </div>
        </div>
      )}

      {/* 2B. Filmstrip Reel Styling Controls */}
      {displayMode === "filmstrip" && (
        <div className="p-4 rounded-xl border border-border/80 bg-card/50 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Film className="w-3.5 h-3.5 text-primary" /> Filmstrip Reel Styling
            </Label>
            <Badge variant="outline" className="text-[10px]">
              Full-Bleed Visual Frame
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground">Show Top Frame Header Strip</Label>
              <p className="text-[10px] text-muted-foreground">
                When disabled (default), artwork expands to the top border with zero black masking bands.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...data, showFrameHeader: !showFrameHeader })}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                showFrameHeader ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "block w-4 h-4 rounded-full bg-white transition-transform transform",
                  showFrameHeader ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {showFrameHeader && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Header Strip Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={frameHeaderBg || "#0F0E0D"}
                    onChange={(e) => onChange({ ...data, frameHeaderBg: e.target.value })}
                    className="w-7 h-7 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
                  />
                  <Input
                    type="text"
                    value={frameHeaderBg}
                    onChange={(e) => onChange({ ...data, frameHeaderBg: e.target.value })}
                    placeholder="#0F0E0D"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Header Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={frameHeaderTextColor || "#F5EBE1"}
                    onChange={(e) => onChange({ ...data, frameHeaderTextColor: e.target.value })}
                    className="w-7 h-7 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
                  />
                  <Input
                    type="text"
                    value={frameHeaderTextColor}
                    onChange={(e) => onChange({ ...data, frameHeaderTextColor: e.target.value })}
                    placeholder="#F5EBE1"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2C. Dedicated Canvas & Frame Styling Panel */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/50 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5 text-primary" /> Canvas &amp; Frame Styling
          </Label>
          <Badge variant="outline" className="text-[10px]">
            Unobstructed Art Focus
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Background Color Picker & Swatches */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Canvas Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={canvasBgColor && canvasBgColor !== "transparent" ? canvasBgColor : "#0B0F17"}
                onChange={(e) => handleCanvasBgColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
              />
              <Input
                type="text"
                placeholder="#0B0F17 or transparent"
                value={canvasBgColor}
                onChange={(e) => handleCanvasBgColorChange(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            {/* Cultural Swatches */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { name: "Obsidian", color: "#0B0F17" },
                { name: "Teak", color: "#1C130D" },
                { name: "Parchment", color: "#FAF7F2" },
                { name: "Ivory", color: "#FFFFF8" },
                { name: "Clear", color: "transparent" },
              ].map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => handleCanvasBgColorChange(swatch.color)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-border bg-muted/60 hover:bg-muted text-foreground cursor-pointer"
                  title={swatch.name}
                >
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Border Fillet Color */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Border Fillet Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderFilletColor || "#D4AF37"}
                onChange={(e) => handleBorderFilletColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
              />
              <Input
                type="text"
                placeholder="#D4AF37"
                value={borderFilletColor}
                onChange={(e) => handleBorderFilletColorChange(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Border Width */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Border Width</Label>
            <Select
              value={String(borderWidth)}
              onValueChange={(val) => handleBorderWidthChange(Number(val))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Border Width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0px (No Fillet)</SelectItem>
                <SelectItem value="1">1px (Hairline Gold)</SelectItem>
                <SelectItem value="2">2px (Traditional Fillet)</SelectItem>
                <SelectItem value="4">4px (Ornate Beading)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frame Padding / Matting */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Frame Padding / Matting</Label>
            <Select
              value={String(framePadding)}
              onValueChange={(val) => handleFramePaddingChange(Number(val))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Padding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Compact (0px)</SelectItem>
                <SelectItem value="16">Standard Matting (16px)</SelectItem>
                <SelectItem value="32">Exhibition Matting (32px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggle: Show Title & Caption Ribbon */}
        <div className="pt-2 flex items-center justify-between border-t border-border/50">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground">Show Title &amp; Caption Ribbon</Label>
            <p className="text-[10px] text-muted-foreground">
              Renders an unobtrusive caption outside the image frame (Default: False for clean visual focus).
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleShowCaptionRibbonChange(!showCaptionRibbon)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
              showCaptionRibbon ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "block w-4 h-4 rounded-full bg-white transition-transform transform",
                showCaptionRibbon ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2C. Legacy Mode Settings (Timer, Aspect Ratio, Frame) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/70 bg-card/40">
        {(displayMode === "carousel" || displayMode === "ken-burns" || displayMode === "soft-crossfade") && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Autoplay Duration</span>
              <span className="text-primary font-mono text-xs">{autoplayTimer}s</span>
            </Label>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={autoplayTimer}
              onChange={(e) => handleTimerChange(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground">Slides advance automatically (2s - 10s)</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Aspect Ratio</Label>
          <Select value={aspectRatio} onValueChange={(val: "landscape" | "portrait" | "square" | "natural") => handleAspectChange(val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landscape">Landscape (16:10)</SelectItem>
              <SelectItem value="portrait">Portrait (3:4)</SelectItem>
              <SelectItem value="square">Square (1:1)</SelectItem>
              <SelectItem value="natural">Fixed Height (420px)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Frame & Border Style</Label>
          <Select value={frameStyle} onValueChange={(val: "heritage" | "minimal" | "floating" | "none") => handleFrameChange(val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heritage">Heritage 22k Gold Glow</SelectItem>
              <SelectItem value="minimal">Minimalist Border</SelectItem>
              <SelectItem value="floating">Floating Deep Shadow</SelectItem>
              <SelectItem value="none">No Border / Flush</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2B. Placard Contrast & Typography Studio (Ken Burns & Soft Crossfade) */}
      {(displayMode === "ken-burns" || displayMode === "soft-crossfade") && (
        <div className="p-4 rounded-xl border border-amber-600/40 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-amber-600" /> Placard Contrast &amp; Typography Studio
            </Label>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-800 dark:text-amber-300">
              WCAG AAA Contrast
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Placard Theme Preset */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Placard Theme Preset</Label>
              <Select
                value={kenBurnsOverlayTheme}
                onValueChange={(val: "dark-velvet" | "parchment-gold" | "minimal-subtle") =>
                  handleOverlayThemeChange(val)
                }
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark-velvet">Dark Velvet (Obsidian &amp; Ivory)</SelectItem>
                  <SelectItem value="parchment-gold">Parchment Gold (Warm Ivory &amp; Deep Slate)</SelectItem>
                  <SelectItem value="minimal-subtle">Minimal Subtle (Translucent Glass)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title Color Override */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Title Color</span>
                <span className="font-mono text-[10px] text-muted-foreground">{overlayTitleColor || "Theme Default"}</span>
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={overlayTitleColor || (kenBurnsOverlayTheme === "parchment-gold" ? "#0F172A" : "#F8FAFC")}
                  onChange={(e) => handleTitleColorChange(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
                />
                <Input
                  type="text"
                  placeholder={kenBurnsOverlayTheme === "parchment-gold" ? "#0F172A" : "#F8FAFC"}
                  value={overlayTitleColor}
                  onChange={(e) => handleTitleColorChange(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Caption / Text Color Override */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Caption Color</span>
                <span className="font-mono text-[10px] text-muted-foreground">{overlayTextColor || "Theme Default"}</span>
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={overlayTextColor || (kenBurnsOverlayTheme === "parchment-gold" ? "#334155" : "#E2E8F0")}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-card shrink-0"
                />
                <Input
                  type="text"
                  placeholder={kenBurnsOverlayTheme === "parchment-gold" ? "#334155" : "#E2E8F0"}
                  value={overlayTextColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground">Quick Palette:</span>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  kenBurnsOverlayTheme: "dark-velvet",
                  overlayTitleColor: "#F8FAFC",
                  overlayTextColor: "#E2E8F0",
                });
              }}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900 text-stone-100 border border-stone-700 hover:bg-black cursor-pointer"
            >
              🌙 Dark Velvet Standard
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  kenBurnsOverlayTheme: "parchment-gold",
                  overlayTitleColor: "#0F172A",
                  overlayTextColor: "#334155",
                });
              }}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 cursor-pointer"
            >
              ☀️ Parchment Gold Standard
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  kenBurnsOverlayTheme: "minimal-subtle",
                  overlayTitleColor: "#FFFFFF",
                  overlayTextColor: "#CBD5E1",
                });
              }}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-200 border border-stone-600 hover:bg-stone-700 cursor-pointer"
            >
              💎 Minimal Subtle
            </button>
          </div>
        </div>
      )}

      {/* 3. Media Items Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-serif font-bold text-sm text-foreground">
              Gallery Media Items ({items.length})
            </h4>
            {displayMode === "collage" && items.length > 12 && (
              <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Notice: Bento mode displays up to 12 items
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.heic,.heics"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMediaDialogTargetIndex(null);
                setIsMediaDialogOpen(true);
              }}
              className="text-xs h-7 gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer font-medium"
            >
              <ImagePlus className="w-3.5 h-3.5 text-amber-500" />
              <span>Add Media / Vault</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7 gap-1 border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <UploadCloud className="w-3 h-3" />
              {uploading ? "Uploading..." : "Upload Local"}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleAddItem()}
              className="text-xs h-7 gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/80 rounded-xl space-y-2">
            <ImageIcon className="w-7 h-7 text-muted-foreground/60 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No photos added yet</p>
            <p className="text-[11px] text-muted-foreground">Click &quot;Upload Photo&quot; or &quot;Add Item&quot; to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Item Selector List */}
            <div className="md:col-span-4 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer text-left ${
                    activeItemIndex === idx
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/70 bg-card hover:bg-muted/40"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title || "thumbnail"}
                    className="w-10 h-10 object-cover rounded shrink-0 border border-border/80"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">
                      {idx + 1}. {item.title || "Untitled Plate"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.linkType && item.linkType !== "none" ? `Linked: ${item.linkType}` : "No link"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, "up")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveItem(idx, "down")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Active Item Detail Editor */}
            {activeItem && (
              <div className="md:col-span-8 p-4 rounded-xl border border-border/80 bg-card space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold text-foreground">
                    Editing Photo #{activeItemIndex + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ID: {activeItem.id.slice(0, 10)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={activeItem.url}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { url: e.target.value })}
                      placeholder="https://... or /media/public/..."
                      className="h-8 text-xs font-mono flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setMediaDialogTargetIndex(activeItemIndex);
                        setIsMediaDialogOpen(true);
                      }}
                      className="text-xs h-8 px-3 shrink-0 cursor-pointer font-medium"
                    >
                      Browse Vault
                    </Button>
                  </div>
                </div>

                {/* 1-Click Masterwork Ingestion Helper */}
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Auto-Fill from Masterwork Catalog
                    </Label>
                    <Badge variant="outline" className="text-[9px] bg-background/80 border-amber-500/40 text-amber-900 dark:text-amber-300 font-semibold">
                      Instant Ingestion
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-950/80 dark:text-amber-200/80 leading-tight">
                    Select a catalog artwork to automatically map title, medium, dimensions, school, year, and destination link:
                  </p>
                  <Select
                    value={activeItem.artworkId || (artworksList.find((a) => a.slug === activeItem.linkTarget)?.id ?? "")}
                    onValueChange={(artId) => {
                      const art = artworksList.find((a) => a.id === artId);
                      if (art) {
                        const materials = art.medium || "22k Gold Foil, Gesso, Teak Wood";
                        handleUpdateItem(activeItemIndex, {
                          artworkId: art.id,
                          title: art.title,
                          medium: materials,
                          dimensions: art.dimensions || "",
                          traditionalSchool: art.category?.name || "Thanjavur (Tanjore) Classical",
                          year: art.yearCreated ? String(art.yearCreated) : "",
                          description: art.description || "",
                          linkType: "artwork",
                          linkTarget: art.slug,
                          alt: art.title,
                          url: art.watermarkedWebpUrl || art.primaryImageUrl || activeItem.url,
                        });
                        toast.success(`Auto-mapped all curatorial metadata for "${art.title}"!`);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="-- Select catalog masterwork to auto-fill --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {artworksList.map((art) => (
                        <SelectItem key={art.id} value={art.id}>
                          {art.title} {art.dimensions ? `(${art.dimensions})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Title / Heading</Label>
                    <Input
                      type="text"
                      value={activeItem.title || ""}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { title: e.target.value })}
                      placeholder="e.g. Ashta Lakshmi Tanjore Gold Foil"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Alt Text (Accessibility)</Label>
                    <Input
                      type="text"
                      value={activeItem.alt || ""}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { alt: e.target.value })}
                      placeholder="e.g. Tanjore panel showing 22k gold embossing"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Caption / Brief Commentary</Label>
                  <Textarea
                    rows={2}
                    value={activeItem.caption || ""}
                    onChange={(e) => handleUpdateItem(activeItemIndex, { caption: e.target.value })}
                    placeholder="Brief curatorial commentary or historical details shown on hover/overlay..."
                    className="text-xs"
                  />
                </div>

                {/* Rich Curatorial Metadata Inputs (Displayed on Museum Placards) */}
                <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Museum Placard Metadata
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {artworksList.some(
                        (a) =>
                          (a.watermarkedWebpUrl && a.watermarkedWebpUrl === activeItem.url) ||
                          (a.primaryImageUrl && a.primaryImageUrl === activeItem.url) ||
                          (activeItem.title && a.title.toLowerCase().trim() === activeItem.title.toLowerCase().trim())
                      ) && (
                        <button
                          type="button"
                          onClick={() => {
                            const matched = artworksList.find(
                              (a) =>
                                (a.watermarkedWebpUrl && a.watermarkedWebpUrl === activeItem.url) ||
                                (a.primaryImageUrl && a.primaryImageUrl === activeItem.url) ||
                                (activeItem.title && a.title.toLowerCase().trim() === activeItem.title.toLowerCase().trim())
                            );
                            if (matched) {
                              handleUpdateItem(activeItemIndex, {
                                artworkId: matched.id,
                                title: matched.title,
                                medium: matched.medium || activeItem.medium || "22k Gold Foil, Gesso, Teak Wood",
                                dimensions: matched.dimensions || activeItem.dimensions || "",
                                traditionalSchool: matched.category?.name || activeItem.traditionalSchool || "Thanjavur (Tanjore) Classical",
                                year: matched.yearCreated ? String(matched.yearCreated) : activeItem.year,
                                description: matched.description || activeItem.description || "",
                                linkType: "artwork",
                                linkTarget: matched.slug,
                              });
                              toast.success(`Synchronized metadata from "${matched.title}"!`);
                            }
                          }}
                          className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          ⚡ Auto-Fill Matching
                        </button>
                      )}
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Placard Lines 1-3
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Materials &amp; Medium</Label>
                      <Input
                        type="text"
                        value={activeItem.medium || ""}
                        onChange={(e) => handleUpdateItem(activeItemIndex, { medium: e.target.value })}
                        placeholder="e.g. 22k Gold Foil, Gesso, Teak Wood"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Dimensions</Label>
                      <Input
                        type="text"
                        value={activeItem.dimensions || ""}
                        onChange={(e) => handleUpdateItem(activeItemIndex, { dimensions: e.target.value })}
                        placeholder="e.g. 36 x 24 in (91.4 x 61 cm)"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Traditional School / Style</Label>
                      <Input
                        type="text"
                        value={activeItem.traditionalSchool || ""}
                        onChange={(e) => handleUpdateItem(activeItemIndex, { traditionalSchool: e.target.value })}
                        placeholder="e.g. Thanjavur (Tanjore) Classical"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Creation Year / Era</Label>
                      <Input
                        type="text"
                        value={activeItem.year || ""}
                        onChange={(e) => handleUpdateItem(activeItemIndex, { year: e.target.value })}
                        placeholder="e.g. 2024"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Placard Narrative / Provenance</Label>
                    <Textarea
                      rows={2}
                      value={activeItem.description || ""}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { description: e.target.value })}
                      placeholder="Detailed curatorial narrative shown on the museum placard below the artwork..."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Linking Configuration */}
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-primary" /> Destination Link on Click
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Link Type</span>
                      <Select
                        value={activeItem.linkType || "none"}
                        onValueChange={(val: "none" | "artwork" | "category" | "custom") => {
                          let defaultTarget = "";
                          if (val === "artwork" && artworksList.length > 0) defaultTarget = artworksList[0].slug;
                          if (val === "category" && categoriesList.length > 0) defaultTarget = categoriesList[0].slug;
                          handleUpdateItem(activeItemIndex, {
                            linkType: val,
                            linkTarget: defaultTarget,
                          });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (View Only)</SelectItem>
                          <SelectItem value="artwork">Specific Artwork</SelectItem>
                          <SelectItem value="category">Art Category / School</SelectItem>
                          <SelectItem value="custom">Custom URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {activeItem.linkType === "artwork" && (
                      <div className="sm:col-span-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Select Masterwork</span>
                          {artworksList.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = activeItem.linkTarget || artworksList[0]?.slug;
                                const art = artworksList.find((a) => a.slug === target);
                                if (art) {
                                  handleUpdateItem(activeItemIndex, {
                                    artworkId: art.id,
                                    title: art.title,
                                    medium: art.medium || activeItem.medium,
                                    dimensions: art.dimensions || activeItem.dimensions,
                                    year: art.yearCreated ? String(art.yearCreated) : activeItem.year,
                                    traditionalSchool: art.category?.name || activeItem.traditionalSchool,
                                    description: art.description || activeItem.description,
                                    url: art.watermarkedWebpUrl || art.primaryImageUrl || activeItem.url,
                                  });
                                  toast.success(`Ingested metadata from "${art.title}"`);
                                }
                              }}
                              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              ⚡ Re-Ingest Metadata
                            </button>
                          )}
                        </div>
                        <Select
                          value={activeItem.linkTarget || (artworksList[0]?.slug ?? "")}
                          onValueChange={(val) => {
                            const art = artworksList.find((a) => a.slug === val);
                            handleUpdateItem(activeItemIndex, {
                              linkTarget: val,
                              ...(art
                                ? {
                                    artworkId: art.id,
                                    title: art.title,
                                    medium: art.medium || activeItem.medium,
                                    dimensions: art.dimensions || activeItem.dimensions,
                                    year: art.yearCreated ? String(art.yearCreated) : activeItem.year,
                                    traditionalSchool: art.category?.name || activeItem.traditionalSchool,
                                    description: art.description || activeItem.description,
                                    url: art.watermarkedWebpUrl || art.primaryImageUrl || activeItem.url,
                                  }
                                : {}),
                            });
                            if (art) {
                              toast.success(`Ingested curatorial metadata for "${art.title}"`);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose an artwork" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {artworksList.map((art) => (
                              <SelectItem key={art.id} value={art.slug}>
                                {art.title} (/artwork/{art.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {activeItem.linkType === "category" && (
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Select Art Category</span>
                        <Select
                          value={activeItem.linkTarget || (categoriesList[0]?.slug ?? "")}
                          onValueChange={(val) => handleUpdateItem(activeItemIndex, { linkTarget: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {categoriesList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.slug}>
                                {cat.name} (/gallery/{cat.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {activeItem.linkType === "custom" && (
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Target URL (Internal or External)</span>
                        <Input
                          type="text"
                          value={activeItem.linkTarget || ""}
                          onChange={(e) => handleUpdateItem(activeItemIndex, { linkTarget: e.target.value })}
                          placeholder="e.g. /concerts or https://..."
                          className="h-8 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Universal Media Dialog for Batch Insertion or Single Item Swapping */}
      <UniversalMediaDialog
        open={isMediaDialogOpen}
        onOpenChange={(open) => {
          setIsMediaDialogOpen(open);
          if (!open) setMediaDialogMode("items");
        }}
        acceptedTypes="image"
        allowMultiple={mediaDialogMode === "items" && mediaDialogTargetIndex === null}
        title={
          mediaDialogMode === "customWall"
            ? "Select Custom Wall Backdrop Image"
            : mediaDialogTargetIndex !== null
            ? `Select Image for Photo #${mediaDialogTargetIndex + 1}`
            : "Select Media for Gallery"
        }
        onSelect={(media) => {
          if (mediaDialogMode === "customWall") {
            handleCustomWallUrlChange(media.url);
            toast.success("Custom wall backdrop updated!");
            return;
          }

          const enriched = enrichItemWithArtwork({
            url: media.url,
            title: media.title,
            alt: media.originalFileName,
            artworkId: media.artworkId,
            slug: media.slug,
            medium: media.medium,
            dimensions: media.dimensions,
            year: media.year ? String(media.year) : undefined,
            traditionalSchool: media.traditionalSchool,
            description: media.description,
          });

          if (mediaDialogTargetIndex !== null) {
            handleUpdateItem(mediaDialogTargetIndex, enriched);
            toast.success(`Updated metadata for "${enriched.title}"!`);
          } else {
            const updated = [...items, enriched].slice(0, 12);
            onChange({
              ...data,
              items: updated,
            });
            setActiveItemIndex(updated.length - 1);
            toast.success(`Added "${enriched.title}" with curatorial metadata!`);
          }
        }}
        onSelectMultiple={(mediaList) => {
          const newItems: MediaGalleryItem[] = mediaList.map((m) =>
            enrichItemWithArtwork({
              url: m.url,
              title: m.title,
              alt: m.originalFileName,
              artworkId: m.artworkId,
              slug: m.slug,
              medium: m.medium,
              dimensions: m.dimensions,
              year: m.year ? String(m.year) : undefined,
              traditionalSchool: m.traditionalSchool,
              description: m.description,
            })
          );
          const updated = [...items, ...newItems].slice(0, 12);
          onChange({
            ...data,
            items: updated,
          });
          setActiveItemIndex(updated.length - 1);
          toast.success(`Added ${newItems.length} photos with curatorial metadata!`);
        }}
      />
    </div>
  );
}
