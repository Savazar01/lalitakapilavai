"use client";

import * as React from "react";
import QRCode from "qrcode";
import {
  Printer,
  Edit3,
  Eye,
  Sparkles,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  FileText,
  DollarSign,
  Save,
  Loader2,
  Maximize2,
  Bold,
  Italic,
  Underline,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_CURRENCIES } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getClientBaseUrl } from "@/lib/get-base-url-client";
import { cn } from "@/lib/utils";
import {
  printIsolatedElement,
  type PlacardStylingConfig,
  type PlacardPrintFormat,
  type PlacardFieldStyle,
} from "@/lib/print-isolated-html";
import {
  PlacardCard,
  type PlacardCardData,
} from "@/components/admin/placard-card";
import { PlacardLivePreviewModal } from "@/components/admin/placard-live-preview-modal";

export interface PlacardArtwork {
  id: string;
  title: string;
  slug: string;
  medium?: string;
  dimensions?: string;
  traditionalSchool?: string;
  yearCreated?: number | string;
  price?: number | string | null;
  currency?: string;
  description?: string;
  additionalNotes?: string;
  category?: { name: string };
  primaryImageUrl?: string;
  watermarkedWebpUrl?: string;
}

export interface ArtworkPlacardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworks: PlacardArtwork[];
  defaultArtistName?: string;
}

export type EditablePlacardItem = PlacardCardData;

export const DEFAULT_PLACARD_STYLING: PlacardStylingConfig = {
  fontFamily: "cormorant",
  textAlign: "left",
  cardBgColor: "#ffffff",
  titleColor: "#111827",
  textColor: "#374151",
  headerColor: "#854d0e",
  borderStyle: "double-fillet",
  titleScale: "standard",
  bodyScale: "standard",
  showThumbnail: true,
  showQr: true,
  showCategory: true,
  showArtist: true,
  showCropMarks: true,
  showTitle: true,
  showMedium: true,
  showDimensions: true,
  showYear: true,
  showPrice: true,
  showNotes: true,
  fieldOrder: [
    "header",
    "title",
    "medium",
    "dimensions_year",
    "visual_cluster",
    "price",
    "notes",
  ],
  mediaPlacement: "top-right",
  mediaLayout: "side-by-side",
  thumbnailSize: "standard",
  thumbnailShape: "rounded",
  thumbnailBorder: true,
  qrSize: "standard",
  clampMargin: "minimal",
  priceStyle: "clean",
  fieldStyles: {
    title: { fontFamily: "inherit", fontWeight: "bold", fontStyle: "italic", textDecoration: "none", color: "", fontSize: "inherit" },
    medium: { fontFamily: "inherit", fontWeight: "normal", fontStyle: "italic", textDecoration: "none", color: "", fontSize: "inherit" },
    dimensions: { fontFamily: "inherit", fontWeight: "normal", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit" },
    year: { fontFamily: "inherit", fontWeight: "normal", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit" },
    price: { fontFamily: "inherit", fontWeight: "semibold", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit" },
    category: { fontFamily: "inherit", fontWeight: "bold", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit", textTransform: "uppercase" },
    artist: { fontFamily: "inherit", fontWeight: "semibold", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit" },
    notes: { fontFamily: "inherit", fontWeight: "normal", fontStyle: "italic", textDecoration: "none", color: "", fontSize: "inherit" },
    qrLabel: { fontFamily: "inherit", fontWeight: "normal", fontStyle: "normal", textDecoration: "none", color: "", fontSize: "inherit" },
  },
};

// Preset Swatches for Quick Customization
const CARD_BG_SWATCHES = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Antique Ivory", value: "#fffff8" },
  { label: "Parchment Cream", value: "#faf7f2" },
  { label: "Soft Linen", value: "#f4f0e8" },
];

const TITLE_COLOR_SWATCHES = [
  { label: "Obsidian Black", value: "#111827" },
  { label: "Antique Gold", value: "#854d0e" },
  { label: "Royal Indigo", value: "#1e1b4b" },
  { label: "Dark Teak", value: "#3e2723" },
];

const TEXT_COLOR_SWATCHES = [
  { label: "Deep Charcoal", value: "#374151" },
  { label: "Slate Grey", value: "#4b5563" },
  { label: "Warm Earth", value: "#5d4037" },
  { label: "Solid Black", value: "#111827" },
];

const HEADER_COLOR_SWATCHES = [
  { label: "Temple Gold", value: "#854d0e" },
  { label: "Terracotta", value: "#9a3412" },
  { label: "Charcoal", value: "#111827" },
  { label: "Deep Olive", value: "#3f6212" },
];

type ConfigurableFieldKey =
  | "title"
  | "medium"
  | "dimensions"
  | "year"
  | "price"
  | "category"
  | "artist"
  | "notes"
  | "qrLabel";

const FIELD_METADATA: Array<{ key: ConfigurableFieldKey; label: string; icon: string }> = [
  { key: "title", label: "Artwork Title", icon: "Type" },
  { key: "medium", label: "Medium & Materials", icon: "FileText" },
  { key: "dimensions", label: "Dimensions", icon: "Sliders" },
  { key: "year", label: "Year Created", icon: "Clock" },
  { key: "price", label: "Valuation / Price", icon: "DollarSign" },
  { key: "category", label: "Category / School", icon: "Layers" },
  { key: "artist", label: "Artist Credit", icon: "Sparkles" },
  { key: "notes", label: "Curatorial Notes", icon: "FileText" },
  { key: "qrLabel", label: "QR Provenance Label", icon: "QrCode" },
];

const FONT_SIZE_PRESETS = [
  { label: "Inherit Scale", value: "inherit" },
  { label: "7pt (Micro)", value: "7pt" },
  { label: "8pt (Fine)", value: "8pt" },
  { label: "9pt (Compact)", value: "9pt" },
  { label: "10pt (Standard Small)", value: "10pt" },
  { label: "11pt (Standard)", value: "11pt" },
  { label: "12pt (Medium)", value: "12pt" },
  { label: "13pt (Subhead)", value: "13pt" },
  { label: "14pt (Prominent)", value: "14pt" },
  { label: "16pt (Headline)", value: "16pt" },
  { label: "18pt (Large)", value: "18pt" },
  { label: "20pt (Title)", value: "20pt" },
  { label: "24pt (Display)", value: "24pt" },
  { label: "28pt (Jumbo)", value: "28pt" },
  { label: "32pt (Monumental)", value: "32pt" },
];

export function ArtworkPlacardSheet({
  open,
  onOpenChange,
  artworks = [],
  defaultArtistName = "Master Artist",
}: ArtworkPlacardSheetProps) {
  // Format & Orientation
  const [cardFormat, setCardFormat] = React.useState<PlacardPrintFormat>("visiting-card");
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">("portrait");

  // Customizer Studio Styling State with LocalStorage Persistence
  const [styling, setStyling] = React.useState<PlacardStylingConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("savazai_placard_layout_prefs");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PLACARD_STYLING,
            ...parsed,
            fieldStyles: {
              ...DEFAULT_PLACARD_STYLING.fieldStyles,
              ...(parsed.fieldStyles || {}),
            },
          };
        }
      } catch {}
    }
    return DEFAULT_PLACARD_STYLING;
  });

  // Active View Tab: "preview" vs "edit"
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit">("preview");

  // Granular Field Styling Tab
  const [activeFieldTab, setActiveFieldTab] = React.useState<ConfigurableFieldKey>("title");

  // Live Preview Modal State
  const [livePreviewModalOpen, setLivePreviewModalOpen] = React.useState(false);

  // In-Studio Live Card Selector (index)
  const [inStudioCardIndex, setInStudioCardIndex] = React.useState(0);

  // Editable In-Modal Card Data Overrides with LocalStorage Persistence
  const [userOverrides, setUserOverrides] = React.useState<Record<string, Partial<EditablePlacardItem>>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("savazai_placard_card_overrides");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const [globalArtistName, setGlobalArtistName] = React.useState(defaultArtistName);

  // Live Artwork Synchronization State
  const [liveArtworkData, setLiveArtworkData] = React.useState<Record<string, { price?: number | null; currency?: string | null }>>({});
  const [syncingPrices, setSyncingPrices] = React.useState(false);
  const [savingOverrides, setSavingOverrides] = React.useState(false);

  // Auto-sync live prices and currencies from artworks API on open
  React.useEffect(() => {
    if (!open) return;
    let active = true;
    const syncLiveArtworks = async () => {
      try {
        setSyncingPrices(true);
        const res = await fetch("/api/admin/artworks?limit=200");
        if (res.ok) {
          const data = await res.json();
          const arts: Array<{ id: string; price?: number | null; currency?: string | null }> = data.artworks || data || [];
          if (active && Array.isArray(arts)) {
            const map: Record<string, { price?: number | null; currency?: string | null }> = {};
            arts.forEach((a) => {
              if (a.id) {
                map[a.id] = { price: a.price, currency: a.currency };
              }
            });
            setLiveArtworkData(map);
          }
        }
      } catch (e) {
        console.warn("Could not sync live prices for placards:", e);
      } finally {
        if (active) setSyncingPrices(false);
      }
    };
    syncLiveArtworks();
    return () => {
      active = false;
    };
  }, [open]);

  // QR Code batch mapping
  const [qrCodeDataUrls, setQrCodeDataUrls] = React.useState<Record<string, string>>({});

  const updateStyling = <K extends keyof PlacardStylingConfig>(key: K, value: PlacardStylingConfig[K]) => {
    setStyling((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("savazai_placard_layout_prefs", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const updateFieldStyle = (
    fieldKey: ConfigurableFieldKey,
    updates: Partial<PlacardFieldStyle>
  ) => {
    setStyling((prev) => {
      const current = prev.fieldStyles?.[fieldKey] || {};
      const nextFieldStyles = {
        ...prev.fieldStyles,
        [fieldKey]: { ...current, ...updates },
      };
      const next = { ...prev, fieldStyles: nextFieldStyles };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("savazai_placard_layout_prefs", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const resetFieldStyle = (fieldKey: ConfigurableFieldKey) => {
    setStyling((prev) => {
      const nextFieldStyles = { ...prev.fieldStyles };
      delete nextFieldStyles[fieldKey];
      const next = { ...prev, fieldStyles: nextFieldStyles };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("savazai_placard_layout_prefs", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    toast.success(`Reset ${fieldKey} to global defaults`);
  };

  const getItemData = React.useCallback(
    (art: PlacardArtwork): EditablePlacardItem => {
      const over = userOverrides[art.id] || {};
      const live = liveArtworkData[art.id];
      const effectivePrice =
        over.price !== undefined
          ? over.price
          : live?.price !== undefined && live.price !== null
          ? String(live.price)
          : art.price !== undefined && art.price !== null
          ? String(art.price)
          : "";
      const effectiveCurrency = over.currency || live?.currency || art.currency || "INR";

      return {
        id: art.id,
        title: over.title ?? art.title ?? "",
        artistName: over.artistName ?? globalArtistName,
        category: over.category ?? art.traditionalSchool ?? art.category?.name ?? "Traditional Indian Art",
        medium: over.medium ?? art.medium ?? "22k Gold Foil, Gesso, Teak Wood",
        dimensions: over.dimensions ?? art.dimensions ?? "",
        year: over.year ?? (art.yearCreated ? String(art.yearCreated) : ""),
        price: effectivePrice,
        currency: effectiveCurrency,
        additionalNotes: over.additionalNotes ?? art.additionalNotes ?? art.description ?? "",
        thumbnail: over.thumbnail ?? art.watermarkedWebpUrl ?? art.primaryImageUrl,
        slug: over.slug ?? art.slug ?? "",
      };
    },
    [userOverrides, liveArtworkData, globalArtistName]
  );

  // Generate QR codes for all artworks in batch
  React.useEffect(() => {
    if (!open || artworks.length === 0) return;

    let active = true;
    const generateAllQrs = async () => {
      const origin = getClientBaseUrl();
      const qrMap: Record<string, string> = {};

      for (const art of artworks) {
        if (!active) break;
        const targetUrl = `${origin}/artwork/${art.slug}?qr=true`;
        try {
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 320,
            margin: 1,
            errorCorrectionLevel: "M",
            color: {
              dark: "#0F172A",
              light: "#FFFFFF",
            },
          });
          qrMap[art.id] = dataUrl;
        } catch (e) {
          console.error("Failed to generate QR for", art.title, e);
        }
      }

      if (active) {
        setQrCodeDataUrls(qrMap);
      }
    };

    generateAllQrs();
    return () => {
      active = false;
    };
  }, [open, artworks]);

  const updateCardItem = (id: string, field: keyof EditablePlacardItem, value: string) => {
    setUserOverrides((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("savazai_placard_card_overrides", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const applyGlobalArtistToAll = () => {
    setUserOverrides((prev) => {
      const next = { ...prev };
      for (const art of artworks) {
        next[art.id] = { ...next[art.id], artistName: globalArtistName };
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("savazai_placard_card_overrides", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    toast.success("Applied artist credit to all display cards");
  };

  const handleSaveCustomizationsToDb = async () => {
    const modifiedIds = Object.keys(userOverrides);
    if (modifiedIds.length === 0) {
      toast.info("No card customizations to save yet.");
      return;
    }
    setSavingOverrides(true);
    try {
      let savedCount = 0;
      for (const id of modifiedIds) {
        const over = userOverrides[id];
        if (!over) continue;
        const payload: Record<string, unknown> = {};
        if (over.title) payload.title = over.title;
        if (over.medium) payload.medium = over.medium;
        if (over.dimensions) payload.dimensions = over.dimensions;
        if (over.year) payload.yearCreated = over.year;
        if (over.price !== undefined) {
          const cleanNum = over.price ? parseFloat(String(over.price).replace(/[^0-9.]/g, "")) : null;
          payload.price = isNaN(cleanNum as number) ? null : cleanNum;
        }
        if (over.currency) payload.currency = over.currency;
        if (over.additionalNotes) payload.description = over.additionalNotes;

        if (Object.keys(payload).length > 0) {
          const res = await fetch(`/api/admin/artworks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) savedCount++;
        }
      }
      toast.success(`Successfully synchronized ${savedCount} card override(s) to artwork database.`);
    } catch (e) {
      console.error("Failed to save placard overrides to DB", e);
      toast.error("Failed to sync some changes to database.");
    } finally {
      setSavingOverrides(false);
    }
  };

  const handlePrint = () => {
    const printContainer = document.getElementById("placard-render-cards");
    if (!printContainer) return;
    printIsolatedElement(
      printContainer.innerHTML,
      "Exhibition Display Cards",
      {
        format: cardFormat,
        orientation,
        borderStyle: styling.borderStyle,
        showCropMarks: styling.showCropMarks,
        styling,
      }
    );
  };

  const allCardData = React.useMemo(() => {
    return artworks.map(getItemData);
  }, [artworks, getItemData]);

  const previewCardData = allCardData[inStudioCardIndex] || allCardData[0];

  const activeFieldStyle = styling.fieldStyles?.[activeFieldTab] || {};

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[94vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="no-print p-4 sm:p-5 border-b border-border/80 bg-muted/20 shrink-0">
            <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <DialogTitle className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                  <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Printable Artwork Display Placards &amp; Cards
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Museum-grade physical display cards with granular field styling, unstyled prices, flexible layout, and large museum formats.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab Selector */}
                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                      activeTab === "preview"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Print Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                      activeTab === "edit"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Design Studio &amp; Details</span>
                  </button>
                </div>

                {/* Dedicated Interactive Live Preview Launcher */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLivePreviewModalOpen(true)}
                  className="text-xs h-8 gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 cursor-pointer"
                  title="Open Dedicated Live Interactive Preview Studio"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Live Preview</span>
                </Button>

                <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  {syncingPrices && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                  <span>{artworks.length} Selected</span>
                </Badge>
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </Button>
              </div>
            </div>

            {/* Primary Quick Controls Toolbar */}
            <div className="no-print grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-3 mt-1 border-t border-border/60">
              {/* Format: visiting-card, museum-placard, museum-large, museum-xlarge */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Format</span>
                <Select
                  value={cardFormat}
                  onValueChange={(val: PlacardPrintFormat) => setCardFormat(val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visiting-card">Visiting Card (3.5 × 2 in)</SelectItem>
                    <SelectItem value="museum-placard">Museum Placard (4 × 2.5 in)</SelectItem>
                    <SelectItem value="museum-large">Museum Large (5 × 3 in)</SelectItem>
                    <SelectItem value="museum-xlarge">Museum Extra Large (6 × 3.5 in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orientation */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Orientation</span>
                <Select
                  value={orientation}
                  onValueChange={(val: "landscape" | "portrait") => setOrientation(val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border Options */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Border Style</span>
                <Select
                  value={styling.borderStyle}
                  onValueChange={(val: "double-fillet" | "single-rule" | "none") => updateStyling("borderStyle", val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="double-fillet">Double Gold Fillet</SelectItem>
                    <SelectItem value="single-rule">Vintage Single Hairline</SelectItem>
                    <SelectItem value="none">Borderless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Media Placement (Configurable Thumbnail & QR Positioning) */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Media Position</span>
                <Select
                  value={styling.mediaPlacement || "top-right"}
                  onValueChange={(val: "top-right" | "bottom-right" | "inline" | "stacked") => updateStyling("mediaPlacement", val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-right">Top-Right Flank</SelectItem>
                    <SelectItem value="bottom-right">Bottom-Right Corner</SelectItem>
                    <SelectItem value="stacked">Stacked Right</SelectItem>
                    <SelectItem value="inline">Inline Below Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Base Clamp Margin (Dead Space Elimination) */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Clamp Margin</span>
                <Select
                  value={styling.clampMargin || "minimal"}
                  onValueChange={(val: "none" | "minimal" | "standard" | "acrylic-clamp") => updateStyling("clampMargin", val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (0mm) Full Canvas</SelectItem>
                    <SelectItem value="minimal">Minimal (3mm)</SelectItem>
                    <SelectItem value="standard">Standard (7mm)</SelectItem>
                    <SelectItem value="acrylic-clamp">Acrylic Clamp (16mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Style (Unstyled vs Badge) */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Price Style</span>
                <Select
                  value={styling.priceStyle || "clean"}
                  onValueChange={(val: "clean" | "badge") => updateStyling("priceStyle", val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Unstyled Clean Text</SelectItem>
                    <SelectItem value="badge">Curatorial Earmark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle: Thumbnail */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thumbnail</span>
                <button
                  type="button"
                  onClick={() => updateStyling("showThumbnail", !styling.showThumbnail)}
                  className={cn(
                    "w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer",
                    styling.showThumbnail
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  <span>Image</span>
                  {styling.showThumbnail ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>

              {/* Toggle: QR Code */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">QR Code</span>
                <button
                  type="button"
                  onClick={() => updateStyling("showQr", !styling.showQr)}
                  className={cn(
                    "w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer",
                    styling.showQr
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  <span>QR Code</span>
                  {styling.showQr ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* TAB 1: Print Sheet View */}
          {activeTab === "preview" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-900/60 print:p-0 print:m-0 print:overflow-visible print:bg-white print:h-auto print:block">
              <div
                id="placard-render-cards"
                className={cn(
                  "mx-auto shadow-xl print:shadow-none p-6 print:p-0 transition-all",
                  "flex flex-wrap gap-5 items-start justify-center",
                  cardFormat === "museum-xlarge"
                    ? "max-w-[1100px]"
                    : cardFormat === "museum-large"
                    ? "max-w-[980px]"
                    : cardFormat === "museum-placard"
                    ? "max-w-[860px]"
                    : "max-w-[780px]"
                )}
                style={{ backgroundColor: styling.cardBgColor }}
              >
                {allCardData.map((itemData, idx) => (
                  <PlacardCard
                    key={itemData.id || idx}
                    itemData={itemData}
                    qrDataUrl={qrCodeDataUrls[itemData.id]}
                    styling={styling}
                    cardFormat={cardFormat}
                    orientation={orientation}
                    showAcrylicGuide={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Design Studio & Details Editor */}
          {activeTab === "edit" && (
            <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6 bg-background space-y-6">
              {/* STICKY LIVE REAL-TIME CARD PREVIEW PANE */}
              <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <h3 className="text-xs font-serif font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-amber-600" />
                      Live Real-Time Card Preview
                    </h3>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px]">
                      Instant WYSIWYG
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Preview Card:</span>
                    <Select
                      value={String(inStudioCardIndex)}
                      onValueChange={(val) => setInStudioCardIndex(Number(val))}
                    >
                      <SelectTrigger className="h-7 text-xs w-[220px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCardData.map((c, i) => (
                          <SelectItem key={c.id || i} value={String(i)}>
                            #{i + 1}: {c.title || "Untitled"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLivePreviewModalOpen(true)}
                      className="h-7 text-xs gap-1 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
                    </Button>
                  </div>
                </div>

                {/* Centered Live Preview Card */}
                <div className="p-4 sm:p-6 bg-stone-200/50 dark:bg-stone-900/80 rounded-lg flex items-center justify-center overflow-x-auto">
                  <div className="shadow-lg rounded-[2px] overflow-hidden">
                    {previewCardData && (
                      <PlacardCard
                        itemData={previewCardData}
                        qrDataUrl={qrCodeDataUrls[previewCardData.id]}
                        styling={styling}
                        cardFormat={cardFormat}
                        orientation={orientation}
                        showAcrylicGuide={true}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION A: GRANULAR FIELD TYPOGRAPHY & STYLING STUDIO */}
              <div className="p-4 rounded-xl border border-amber-500/40 bg-card shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Granular Field Typography &amp; Text Styling Engine
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Configure independent font family, font size, bold, italic, underline, uppercase, and color for every active placard field.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px]">
                    Per-Field Precision
                  </Badge>
                </div>

                {/* Field Selection Pills */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/60">
                  {FIELD_METADATA.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFieldTab(f.key)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5",
                        activeFieldTab === f.key
                          ? "bg-amber-600 text-white font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{f.label}</span>
                      {styling.fieldStyles?.[f.key] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Field Customizer Controls */}
                <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Styling for: &quot;{FIELD_METADATA.find((m) => m.key === activeFieldTab)?.label}&quot;
                      </span>
                      {styling.fieldStyles?.[activeFieldTab] && (
                        <Badge variant="secondary" className="text-[10px]">
                          Customized
                        </Badge>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => resetFieldStyle(activeFieldTab)}
                      className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to Global
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* 1. Font Family */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Font Family
                      </Label>
                      <Select
                        value={activeFieldStyle.fontFamily || "inherit"}
                        onValueChange={(val: "inherit" | "cinzel" | "cormorant" | "inter" | "georgia" | "playfair") =>
                          updateFieldStyle(activeFieldTab, { fontFamily: val })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inherit">Inherit from Global</SelectItem>
                          <SelectItem value="cormorant" className="font-serif">Cormorant Garamond (Classical)</SelectItem>
                          <SelectItem value="cinzel" className="font-serif font-semibold">Cinzel (Roman Gilded)</SelectItem>
                          <SelectItem value="playfair" className="font-serif">Playfair Display (Luxury Serif)</SelectItem>
                          <SelectItem value="georgia" className="font-serif">Georgia (Heritage Editorial)</SelectItem>
                          <SelectItem value="inter" className="font-sans">Inter (Modern Clean Sans)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Font Size */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Font Size
                      </Label>
                      <Select
                        value={activeFieldStyle.fontSize || "inherit"}
                        onValueChange={(val) =>
                          updateFieldStyle(activeFieldTab, { fontSize: val })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_SIZE_PRESETS.map((p) => (
                            <SelectItem key={p.value} value={p.value} className="font-mono text-xs">
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Text Styling Buttons: Bold, Italic, Underline, Uppercase */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Text Styling
                      </Label>
                      <div className="flex items-center gap-1 bg-background p-0.5 rounded border border-border h-8">
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() =>
                            updateFieldStyle(activeFieldTab, {
                              fontWeight: activeFieldStyle.fontWeight === "bold" ? "normal" : "bold",
                            })
                          }
                          className={cn(
                            "flex-1 h-full rounded text-xs flex items-center justify-center cursor-pointer transition-colors",
                            activeFieldStyle.fontWeight === "bold"
                              ? "bg-amber-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() =>
                            updateFieldStyle(activeFieldTab, {
                              fontStyle: activeFieldStyle.fontStyle === "italic" ? "normal" : "italic",
                            })
                          }
                          className={cn(
                            "flex-1 h-full rounded text-xs flex items-center justify-center cursor-pointer transition-colors",
                            activeFieldStyle.fontStyle === "italic"
                              ? "bg-amber-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Italics"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() =>
                            updateFieldStyle(activeFieldTab, {
                              textDecoration: activeFieldStyle.textDecoration === "underline" ? "none" : "underline",
                            })
                          }
                          className={cn(
                            "flex-1 h-full rounded text-xs flex items-center justify-center cursor-pointer transition-colors",
                            activeFieldStyle.textDecoration === "underline"
                              ? "bg-amber-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Underline"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>

                        {/* Uppercase */}
                        <button
                          type="button"
                          onClick={() =>
                            updateFieldStyle(activeFieldTab, {
                              textTransform: activeFieldStyle.textTransform === "uppercase" ? "none" : "uppercase",
                            })
                          }
                          className={cn(
                            "flex-1 h-full rounded text-[11px] font-mono font-bold flex items-center justify-center cursor-pointer transition-colors",
                            activeFieldStyle.textTransform === "uppercase"
                              ? "bg-amber-600 text-white"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Uppercase"
                        >
                          AA
                        </button>
                      </div>
                    </div>

                    {/* 4. Text Color */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Text Color</span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {activeFieldStyle.color || "Inherit"}
                        </span>
                      </Label>
                      <div className="flex items-center gap-1.5 h-8">
                        <input
                          type="color"
                          value={activeFieldStyle.color || "#111827"}
                          onChange={(e) => updateFieldStyle(activeFieldTab, { color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border border-border p-0 bg-transparent shrink-0"
                          title="Choose Color"
                        />
                        <Input
                          type="text"
                          value={activeFieldStyle.color || ""}
                          placeholder="Inherit"
                          onChange={(e) => updateFieldStyle(activeFieldTab, { color: e.target.value })}
                          className="h-8 text-xs font-mono flex-1 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: GLOBAL PLACARD DESIGN & COLOR PALETTES */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      Global Design Presets &amp; Color Palettes
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Base defaults used across cards when individual fields are set to &quot;Inherit&quot;.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Global Base
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Global Font Family */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Default Font Family
                    </Label>
                    <Select
                      value={styling.fontFamily}
                      onValueChange={(val: "cinzel" | "cormorant" | "inter" | "georgia" | "playfair") => updateStyling("fontFamily", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cormorant" className="font-serif">Cormorant Garamond (Classical)</SelectItem>
                        <SelectItem value="cinzel" className="font-serif font-semibold">Cinzel (Roman Gilded)</SelectItem>
                        <SelectItem value="playfair" className="font-serif">Playfair Display (Luxury Serif)</SelectItem>
                        <SelectItem value="georgia" className="font-serif">Georgia (Heritage Editorial)</SelectItem>
                        <SelectItem value="inter" className="font-sans">Inter (Modern Clean Sans)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Text Alignment
                    </Label>
                    <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
                      <button
                        type="button"
                        onClick={() => updateStyling("textAlign", "left")}
                        className={cn(
                          "flex-1 h-7 text-xs rounded flex items-center justify-center gap-1 cursor-pointer transition-all",
                          styling.textAlign === "left"
                            ? "bg-background text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <AlignLeft className="w-3.5 h-3.5" /> Left
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStyling("textAlign", "center")}
                        className={cn(
                          "flex-1 h-7 text-xs rounded flex items-center justify-center gap-1 cursor-pointer transition-all",
                          styling.textAlign === "center"
                            ? "bg-background text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <AlignCenter className="w-3.5 h-3.5" /> Center
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStyling("textAlign", "right")}
                        className={cn(
                          "flex-1 h-7 text-xs rounded flex items-center justify-center gap-1 cursor-pointer transition-all",
                          styling.textAlign === "right"
                            ? "bg-background text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <AlignRight className="w-3.5 h-3.5" /> Right
                      </button>
                    </div>
                  </div>

                  {/* Title Scale */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Default Title Scale
                    </Label>
                    <Select
                      value={styling.titleScale}
                      onValueChange={(val: "compact" | "standard" | "large" | "xlarge" | "jumbo") => updateStyling("titleScale", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (12px)</SelectItem>
                        <SelectItem value="standard">Standard (16px)</SelectItem>
                        <SelectItem value="large">Large (20px)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (24px)</SelectItem>
                        <SelectItem value="jumbo">Jumbo (28px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Scale */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Default Body / Medium Scale
                    </Label>
                    <Select
                      value={styling.bodyScale}
                      onValueChange={(val: "compact" | "standard" | "large" | "xlarge" | "jumbo") => updateStyling("bodyScale", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (9px)</SelectItem>
                        <SelectItem value="standard">Standard (10.5px)</SelectItem>
                        <SelectItem value="large">Large (12px)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (14px)</SelectItem>
                        <SelectItem value="jumbo">Jumbo (16px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border/60">
                  {/* Background Color */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Card Background</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{styling.cardBgColor}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {CARD_BG_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => updateStyling("cardBgColor", swatch.value)}
                          title={swatch.label}
                          className={cn(
                            "w-6 h-6 rounded-full border shadow-xs transition-transform hover:scale-110 cursor-pointer",
                            styling.cardBgColor.toLowerCase() === swatch.value.toLowerCase()
                              ? "ring-2 ring-amber-500 ring-offset-1 border-amber-600"
                              : "border-stone-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                      <input
                        type="color"
                        value={styling.cardBgColor}
                        onChange={(e) => updateStyling("cardBgColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-border p-0 bg-transparent shrink-0"
                        title="Custom Card Background"
                      />
                    </div>
                  </div>

                  {/* Title Color */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Default Title Color</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{styling.titleColor}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {TITLE_COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => updateStyling("titleColor", swatch.value)}
                          title={swatch.label}
                          className={cn(
                            "w-6 h-6 rounded-full border shadow-xs transition-transform hover:scale-110 cursor-pointer",
                            styling.titleColor.toLowerCase() === swatch.value.toLowerCase()
                              ? "ring-2 ring-amber-500 ring-offset-1 border-amber-600"
                              : "border-stone-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                      <input
                        type="color"
                        value={styling.titleColor}
                        onChange={(e) => updateStyling("titleColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-border p-0 bg-transparent shrink-0"
                        title="Custom Title Color"
                      />
                    </div>
                  </div>

                  {/* Medium / Body Text Color */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Default Body Text Color</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{styling.textColor}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {TEXT_COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => updateStyling("textColor", swatch.value)}
                          title={swatch.label}
                          className={cn(
                            "w-6 h-6 rounded-full border shadow-xs transition-transform hover:scale-110 cursor-pointer",
                            styling.textColor.toLowerCase() === swatch.value.toLowerCase()
                              ? "ring-2 ring-amber-500 ring-offset-1 border-amber-600"
                              : "border-stone-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                      <input
                        type="color"
                        value={styling.textColor}
                        onChange={(e) => updateStyling("textColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-border p-0 bg-transparent shrink-0"
                        title="Custom Text Color"
                      />
                    </div>
                  </div>

                  {/* Header Fillet Color */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Fillet / Header Color</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{styling.headerColor}</span>
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {HEADER_COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => updateStyling("headerColor", swatch.value)}
                          title={swatch.label}
                          className={cn(
                            "w-6 h-6 rounded-full border shadow-xs transition-transform hover:scale-110 cursor-pointer",
                            styling.headerColor.toLowerCase() === swatch.value.toLowerCase()
                              ? "ring-2 ring-amber-500 ring-offset-1 border-amber-600"
                              : "border-stone-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                      <input
                        type="color"
                        value={styling.headerColor}
                        onChange={(e) => updateStyling("headerColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-border p-0 bg-transparent shrink-0"
                        title="Custom Header Fillet Color"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: MEDIA FORMATTING & POSITIONING ENGINE */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <LayoutGrid className="w-4 h-4 text-amber-600" />
                      Visual Media Layout &amp; Thumbnail Dimensions
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Fine-tune thumbnail size, geometry, borders, and QR code provenance sizing.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Media Styling
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Thumbnail Size */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Thumbnail Size
                    </Label>
                    <Select
                      value={styling.thumbnailSize || "standard"}
                      onValueChange={(val: "compact" | "standard" | "large" | "xlarge") => updateStyling("thumbnailSize", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (36px)</SelectItem>
                        <SelectItem value="standard">Standard (44px)</SelectItem>
                        <SelectItem value="large">Large (60px)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (76px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Thumbnail Shape */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Thumbnail Geometry
                    </Label>
                    <Select
                      value={styling.thumbnailShape || "rounded"}
                      onValueChange={(val: "rounded" | "square" | "circle") => updateStyling("thumbnailShape", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Soft Rounded (Gallery Standard)</SelectItem>
                        <SelectItem value="square">Architectural Square</SelectItem>
                        <SelectItem value="circle">Circular Cameo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* QR Size */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      QR Code Provenance Size
                    </Label>
                    <Select
                      value={styling.qrSize || "standard"}
                      onValueChange={(val: "compact" | "standard" | "large") => updateStyling("qrSize", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (36px)</SelectItem>
                        <SelectItem value="standard">Standard (44px)</SelectItem>
                        <SelectItem value="large">Large (56px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Media Cluster Arrangement */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Media Pairing
                    </Label>
                    <Select
                      value={styling.mediaLayout || "side-by-side"}
                      onValueChange={(val: "side-by-side" | "stacked") => updateStyling("mediaLayout", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="side-by-side">Side-by-Side Horizontal</SelectItem>
                        <SelectItem value="stacked">Vertical Stacked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SECTION D: FIELD VISIBILITY & SEQUENCE PRIORITY */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-primary" />
                      Placard Field Visibility &amp; Ordering Engine
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Toggle active field displays and adjust layout hierarchy.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Field Controls
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showTitle !== false}
                      onChange={(e) => updateStyling("showTitle", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Artwork Title</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showMedium !== false}
                      onChange={(e) => updateStyling("showMedium", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Medium &amp; Materials</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showDimensions !== false}
                      onChange={(e) => updateStyling("showDimensions", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Dimensions</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showYear !== false}
                      onChange={(e) => updateStyling("showYear", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Year Created</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showPrice !== false}
                      onChange={(e) => updateStyling("showPrice", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Valuation / Price</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showThumbnail !== false}
                      onChange={(e) => updateStyling("showThumbnail", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Artwork Thumbnail</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showQr !== false}
                      onChange={(e) => updateStyling("showQr", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>QR Provenance Code</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showNotes !== false}
                      onChange={(e) => updateStyling("showNotes", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Curatorial Commentary</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showCategory !== false}
                      onChange={(e) => updateStyling("showCategory", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Category / School</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showArtist !== false}
                      onChange={(e) => updateStyling("showArtist", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Artist Credit</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={styling.showCropMarks !== false}
                      onChange={(e) => updateStyling("showCropMarks", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Crop Guides</span>
                  </label>
                </div>
              </div>

              {/* SECTION E: GLOBAL ACTIONS & SYNC BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Apply Artist Name */}
                <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Apply Artist Name to All Cards
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Update the artist credit across all selected display cards simultaneously.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={globalArtistName}
                      onChange={(e) => setGlobalArtistName(e.target.value)}
                      className="h-8 text-xs flex-1 bg-background"
                      placeholder="e.g. Master Artist"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyGlobalArtistToAll}
                      className="h-8 text-xs shrink-0 cursor-pointer border-amber-500/40 text-amber-800 dark:text-amber-200"
                    >
                      Apply All
                    </Button>
                  </div>
                </div>

                {/* Save & Sync Overrides to Database */}
                <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Save className="w-3.5 h-3.5 text-amber-600" /> Save Placard Customizations
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Persist edited card prices, titles, dimensions, and medium directly to the database.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono border-amber-500/40">
                      {Object.keys(userOverrides).length} customized
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingOverrides || Object.keys(userOverrides).length === 0}
                      onClick={handleSaveCustomizationsToDb}
                      className="h-8 text-xs ml-auto gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer font-semibold shadow-xs"
                    >
                      {savingOverrides ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Sync &amp; Save DB
                    </Button>
                  </div>
                </div>
              </div>

              {/* SECTION F: INDIVIDUAL CARD EDITORS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Individual Card Metadata Customizer
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Customize prices, currencies, titles, and curatorial notes per card
                  </span>
                </div>

                {artworks.map((art, idx) => {
                  const itemData = getItemData(art);

                  return (
                    <div
                      key={art.id || idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div className="flex items-center gap-2.5">
                          {itemData.thumbnail ? (
                            <img
                              src={itemData.thumbnail}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-border/80 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-serif font-bold text-xs text-foreground truncate max-w-[280px]">
                              {itemData.title || "Untitled Masterwork"}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {art.slug}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          Card #{idx + 1}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {/* Title */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Artwork Title
                          </Label>
                          <Input
                            type="text"
                            value={itemData.title}
                            onChange={(e) => updateCardItem(art.id, "title", e.target.value)}
                            className="h-8 text-xs font-serif"
                          />
                        </div>

                        {/* Artist Name */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Artist Name
                          </Label>
                          <Input
                            type="text"
                            value={itemData.artistName}
                            onChange={(e) => updateCardItem(art.id, "artistName", e.target.value)}
                            className="h-8 text-xs font-serif"
                          />
                        </div>

                        {/* Category / School */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Category / School
                          </Label>
                          <Input
                            type="text"
                            value={itemData.category}
                            onChange={(e) => updateCardItem(art.id, "category", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Medium & Materials */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Medium &amp; Materials
                          </Label>
                          <Input
                            type="text"
                            value={itemData.medium}
                            onChange={(e) => updateCardItem(art.id, "medium", e.target.value)}
                            className="h-8 text-xs font-serif italic"
                          />
                        </div>

                        {/* Dimensions */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Dimensions
                          </Label>
                          <Input
                            type="text"
                            value={itemData.dimensions}
                            onChange={(e) => updateCardItem(art.id, "dimensions", e.target.value)}
                            className="h-8 text-xs font-mono"
                            placeholder="e.g. 24 x 36 inches"
                          />
                        </div>

                        {/* Year Created */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Year Created
                          </Label>
                          <Input
                            type="text"
                            value={itemData.year}
                            onChange={(e) => updateCardItem(art.id, "year", e.target.value)}
                            className="h-8 text-xs font-mono"
                            placeholder="e.g. 2026"
                          />
                        </div>

                        {/* Valuation / Price & Currency (Neatly paired with currency symbol) */}
                        <div className="space-y-1 sm:col-span-2 md:col-span-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-amber-600" />
                            Valuation &amp; Currency
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="text"
                              value={itemData.price || ""}
                              onChange={(e) => updateCardItem(art.id, "price", e.target.value)}
                              className="h-8 text-xs font-mono flex-1"
                              placeholder="e.g. 150000"
                            />
                            <Select
                              value={itemData.currency || "INR"}
                              onValueChange={(val) => updateCardItem(art.id, "currency", val)}
                            >
                              <SelectTrigger className="h-8 text-xs w-28 shrink-0 bg-background font-mono">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SUPPORTED_CURRENCIES.map((c) => (
                                  <SelectItem key={c.code} value={c.code} className="font-mono text-xs">
                                    {c.code} ({c.symbol})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Additional Curatorial Notes */}
                      <div className="space-y-1 pt-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-amber-600" />
                          Additional Curatorial Information / Notes
                        </Label>
                        <Textarea
                          value={itemData.additionalNotes || ""}
                          onChange={(e) => updateCardItem(art.id, "additionalNotes", e.target.value)}
                          placeholder="Provenance, donor attribution, historical note, or gallery wall placement details..."
                          className="text-xs min-h-[52px] resize-y"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="no-print p-3 border-t border-border/80 bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Tip: In print dialog, select &quot;Margins: None&quot; and check &quot;Background graphics&quot; for accurate double-fillet borders.
            </p>
            <div className="flex items-center gap-2">
              {Object.keys(userOverrides).length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingOverrides}
                  onClick={handleSaveCustomizationsToDb}
                  className="text-xs gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 cursor-pointer"
                >
                  {savingOverrides ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  Save DB Overrides ({Object.keys(userOverrides).length})
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                size="sm"
                className="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Cards ({artworks.length})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DEDICATED LIVE INTERACTIVE PREVIEW MODAL */}
      <PlacardLivePreviewModal
        open={livePreviewModalOpen}
        onOpenChange={setLivePreviewModalOpen}
        cards={allCardData}
        qrCodeDataUrls={qrCodeDataUrls}
        styling={styling}
        cardFormat={cardFormat}
        orientation={orientation}
        onPrint={handlePrint}
      />
    </>
  );
}
