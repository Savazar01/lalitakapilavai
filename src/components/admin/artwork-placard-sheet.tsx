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
  Palette,
  Sliders,
  FileText,
} from "lucide-react";
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
  getPhysicalDimensions,
  getFontFamilyCss,
  type PlacardStylingConfig,
} from "@/lib/print-isolated-html";

export interface PlacardArtwork {
  id: string;
  title: string;
  slug: string;
  medium?: string;
  dimensions?: string;
  traditionalSchool?: string;
  yearCreated?: number | string;
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

export interface EditablePlacardItem {
  id: string;
  title: string;
  artistName: string;
  category: string;
  medium: string;
  dimensions: string;
  year: string;
  additionalNotes?: string;
  thumbnail?: string;
  slug: string;
}

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

export function ArtworkPlacardSheet({
  open,
  onOpenChange,
  artworks = [],
  defaultArtistName = "Master Artist",
}: ArtworkPlacardSheetProps) {
  // Format & Orientation
  const [cardFormat, setCardFormat] = React.useState<"visiting-card" | "museum-placard">("visiting-card");
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">("portrait");

  // Customizer Studio Styling State
  const [styling, setStyling] = React.useState<PlacardStylingConfig>(DEFAULT_PLACARD_STYLING);

  // Active View Tab: "preview" vs "edit"
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit">("preview");

  // Editable In-Modal Card Data Overrides
  const [userOverrides, setUserOverrides] = React.useState<Record<string, Partial<EditablePlacardItem>>>({});
  const [globalArtistName, setGlobalArtistName] = React.useState(defaultArtistName);

  // QR Code batch mapping
  const [qrCodeDataUrls, setQrCodeDataUrls] = React.useState<Record<string, string>>({});

  const updateStyling = <K extends keyof PlacardStylingConfig>(key: K, value: PlacardStylingConfig[K]) => {
    setStyling((prev) => ({ ...prev, [key]: value }));
  };

  const getItemData = React.useCallback(
    (art: PlacardArtwork): EditablePlacardItem => {
      const over = userOverrides[art.id] || {};
      return {
        id: art.id,
        title: over.title ?? art.title ?? "",
        artistName: over.artistName ?? globalArtistName,
        category: over.category ?? art.traditionalSchool ?? art.category?.name ?? "Traditional Indian Art",
        medium: over.medium ?? art.medium ?? "22k Gold Foil, Gesso, Teak Wood",
        dimensions: over.dimensions ?? art.dimensions ?? "",
        year: over.year ?? (art.yearCreated ? String(art.yearCreated) : ""),
        additionalNotes: over.additionalNotes ?? art.additionalNotes ?? art.description ?? "",
        thumbnail: over.thumbnail ?? art.watermarkedWebpUrl ?? art.primaryImageUrl,
        slug: over.slug ?? art.slug ?? "",
      };
    },
    [userOverrides, globalArtistName]
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
    setUserOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const applyGlobalArtistToAll = () => {
    setUserOverrides((prev) => {
      const next = { ...prev };
      for (const art of artworks) {
        next[art.id] = { ...next[art.id], artistName: globalArtistName };
      }
      return next;
    });
  };

  const handlePrint = () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");
      setTimeout(() => {
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
      }, 150);
      return;
    }

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

  const dim = getPhysicalDimensions(cardFormat, orientation);
  const activeFontFamilyCss = getFontFamilyCss(styling.fontFamily);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="no-print p-4 sm:p-5 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Printable Artwork Display Placards &amp; Cards
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Balanced editorial fine-art exhibition cards with live typography &amp; styling customizer.
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
                  <span>Preview</span>
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
                  <span>Edit Details</span>
                </button>
              </div>

              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-800 dark:text-amber-300">
                {artworks.length} Selected
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
            {/* Format */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Format</span>
              <Select
                value={cardFormat}
                onValueChange={(val: "visiting-card" | "museum-placard") => setCardFormat(val)}
              >
                <SelectTrigger className="h-7 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visiting-card">Visiting Card (3.5 x 2 in)</SelectItem>
                  <SelectItem value="museum-placard">Museum Placard (4 x 2.5 in)</SelectItem>
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

            {/* Toggle: Category Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
              <button
                type="button"
                onClick={() => updateStyling("showCategory", !styling.showCategory)}
                className={cn(
                  "w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer",
                  styling.showCategory
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <span>School</span>
                {styling.showCategory ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: Artist Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Artist</span>
              <button
                type="button"
                onClick={() => updateStyling("showArtist", !styling.showArtist)}
                className={cn(
                  "w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer",
                  styling.showArtist
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <span>Artist</span>
                {styling.showArtist ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: Crop Marks */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Crop Marks</span>
              <button
                type="button"
                onClick={() => updateStyling("showCropMarks", !styling.showCropMarks)}
                className={cn(
                  "w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer",
                  styling.showCropMarks
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <span>Guides</span>
                {styling.showCropMarks ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Tab 1: Live Interactive Print Preview */}
        {activeTab === "preview" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-900/60 print:p-0 print:m-0 print:overflow-visible print:bg-white print:h-auto print:block">
            <div
              id="placard-render-cards"
              className={cn(
                "mx-auto shadow-xl print:shadow-none p-6 print:p-0 transition-all",
                "flex flex-wrap gap-5 items-start justify-center",
                cardFormat === "visiting-card"
                  ? "max-w-[780px]"
                  : "max-w-[860px]"
              )}
              style={{ backgroundColor: styling.cardBgColor }}
            >
              {artworks.map((art, idx) => {
                const itemData = getItemData(art);
                const qrDataUrl = qrCodeDataUrls[art.id];

                return (
                  <div
                    key={art.id || idx}
                    style={{
                      width: `${dim.widthMm}mm`,
                      height: `${dim.heightMm}mm`,
                      minWidth: `${dim.widthMm}mm`,
                      minHeight: `${dim.heightMm}mm`,
                      maxWidth: `${dim.widthMm}mm`,
                      maxHeight: `${dim.heightMm}mm`,
                      backgroundColor: styling.cardBgColor,
                      fontFamily: activeFontFamilyCss,
                      textAlign: styling.textAlign,
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                    className={cn(
                      "placard-card-item relative border border-stone-200/80 p-3 sm:p-3.5 print:p-2.5 transition-all flex flex-col justify-between overflow-hidden shrink-0 select-none",
                      styling.showCropMarks && "outline outline-1 outline-dashed outline-stone-300 print:outline-stone-400 -outline-offset-1"
                    )}
                  >
                    {/* Border Options */}
                    {styling.borderStyle === "double-fillet" && (
                      <div
                        className="absolute inset-1.5 border pointer-events-none rounded-[1px]"
                        style={{ borderColor: styling.headerColor + "55" }}
                      >
                        <div
                          className="absolute inset-0.5 border pointer-events-none"
                          style={{ borderColor: styling.headerColor + "25" }}
                        />
                      </div>
                    )}
                    {styling.borderStyle === "single-rule" && (
                      <div className="absolute inset-1.5 border border-stone-300 print:border-black pointer-events-none rounded-[1px]" />
                    )}

                    {/* Corner Crop Marks for Professional Trimmer Guides */}
                    {styling.showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
                      </>
                    )}

                    {/* Header: Category / Traditional School on Left; Artist Name on Right */}
                    {(styling.showCategory || styling.showArtist) && (
                      <div
                        className="relative z-10 flex items-center justify-between border-b pb-0.5 mb-1 shrink-0"
                        style={{
                          borderColor: styling.headerColor + "40",
                          color: styling.headerColor,
                        }}
                      >
                        <span className="tracking-widest text-[8px] sm:text-[8.5px] uppercase font-bold truncate max-w-[55%]">
                          {styling.showCategory ? itemData.category : ""}
                        </span>
                        <span className="tracking-wide text-[8px] sm:text-[8.5px] font-semibold shrink-0">
                          {styling.showArtist ? itemData.artistName : ""}
                        </span>
                      </div>
                    )}

                    {/* ORIENTATION-AWARE EDITORIAL FLOW (Zero Dead Space) */}
                    {orientation === "portrait" ? (
                      /* PORTRAIT ORIENTATION: Continuous Vertical Flow */
                      <div className="relative z-10 flex-1 flex flex-col justify-between overflow-hidden">
                        {/* Block 1, 2, 3: Title, Medium, Dimensions */}
                        <div className="space-y-0.5">
                          <h4
                            className={cn(
                              "card-title font-bold leading-tight italic",
                              styling.titleScale === "compact" && "text-[12px] sm:text-[13px]",
                              styling.titleScale === "standard" && "text-[13.5px] sm:text-[14.5px]",
                              styling.titleScale === "large" && "text-[15.5px] sm:text-[16.5px]"
                            )}
                            style={{ color: styling.titleColor }}
                          >
                            {itemData.title || "Untitled Masterwork"}
                          </h4>

                          {itemData.medium && (
                            <p
                              className={cn(
                                "card-medium italic leading-snug",
                                styling.bodyScale === "compact" && "text-[8px] sm:text-[8.5px]",
                                styling.bodyScale === "standard" && "text-[9px] sm:text-[9.5px]",
                                styling.bodyScale === "large" && "text-[10px] sm:text-[10.5px]"
                              )}
                              style={{ color: styling.textColor }}
                            >
                              {itemData.medium}
                            </p>
                          )}

                          {itemData.dimensions && (
                            <p
                              className="card-dimensions font-mono text-[8px] leading-tight"
                              style={{ color: styling.textColor + "cc" }}
                            >
                              {itemData.dimensions}
                            </p>
                          )}
                        </div>

                        {/* Visual Media Cluster: Artwork Thumbnail & Vector QR Code paired side-by-side */}
                        {(styling.showThumbnail || styling.showQr) && (
                          <div
                            className={cn(
                              "card-media-cluster flex items-center gap-2.5 my-1 shrink-0",
                              styling.textAlign === "center"
                                ? "justify-center"
                                : styling.textAlign === "right"
                                ? "justify-end"
                                : "justify-start"
                            )}
                          >
                            {styling.showThumbnail && itemData.thumbnail && (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden border border-stone-300 shadow-xs shrink-0">
                                <img
                                  src={itemData.thumbnail}
                                  alt={itemData.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {styling.showQr && qrDataUrl && (
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-11 h-11 bg-white p-0.5 rounded border border-stone-300 shadow-xs print:shadow-none">
                                  <img
                                    src={qrDataUrl}
                                    alt={`QR for ${itemData.title}`}
                                    className="w-full h-full object-contain block"
                                  />
                                </div>
                                <span className="text-[6.5px] font-sans text-stone-500 tracking-tight mt-0.5 whitespace-nowrap">
                                  Scan Provenance
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Block 4 & 5: Year Created & Additional Curatorial Notes */}
                        <div className="space-y-0.5">
                          {itemData.year && (
                            <p
                              className="card-year font-mono text-[8px] leading-tight"
                              style={{ color: styling.textColor + "cc" }}
                            >
                              Year: {itemData.year}
                            </p>
                          )}

                          {itemData.additionalNotes && (
                            <p
                              className="card-additional-notes text-[8px] italic leading-tight line-clamp-3"
                              style={{ color: styling.textColor }}
                            >
                              {itemData.additionalNotes}
                            </p>
                          )}
                        </div>

                        {/* Base Holder Safe Clearance Margin */}
                        <div className="h-2 shrink-0" />
                      </div>
                    ) : (
                      /* LANDSCAPE ORIENTATION: Balanced Two-Column Proportional Flow */
                      <div className="relative z-10 flex-1 flex items-stretch justify-between gap-3 overflow-hidden">
                        {/* Left Column (60%): Title, Medium, Dimensions, Notes */}
                        <div className="w-[60%] flex flex-col justify-between h-full pr-1 overflow-hidden">
                          <div className="space-y-0.5">
                            <h4
                              className={cn(
                                "card-title font-bold leading-tight italic",
                                styling.titleScale === "compact" && "text-[11.5px] sm:text-[12.5px]",
                                styling.titleScale === "standard" && "text-[13px] sm:text-[14px]",
                                styling.titleScale === "large" && "text-[14.5px] sm:text-[15.5px]"
                              )}
                              style={{ color: styling.titleColor }}
                            >
                              {itemData.title || "Untitled Masterwork"}
                            </h4>

                            {itemData.medium && (
                              <p
                                className={cn(
                                  "card-medium italic leading-snug",
                                  styling.bodyScale === "compact" && "text-[8px]",
                                  styling.bodyScale === "standard" && "text-[9px]",
                                  styling.bodyScale === "large" && "text-[10px]"
                                )}
                                style={{ color: styling.textColor }}
                              >
                                {itemData.medium}
                              </p>
                            )}
                          </div>

                          <div className="space-y-0.5 mt-auto">
                            <p
                              className="card-dimensions font-mono text-[8px] leading-tight"
                              style={{ color: styling.textColor + "cc" }}
                            >
                              {[itemData.dimensions, itemData.year ? `Year: ${itemData.year}` : ""].filter(Boolean).join(" • ")}
                            </p>

                            {itemData.additionalNotes && (
                              <p
                                className="card-additional-notes text-[7.5px] italic leading-tight line-clamp-2"
                                style={{ color: styling.textColor }}
                              >
                                {itemData.additionalNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Column (40%): Paired Thumbnail & QR with Provenance */}
                        <div className="w-[40%] flex flex-col items-center justify-center h-full pl-1 shrink-0">
                          {(styling.showThumbnail || styling.showQr) && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {styling.showThumbnail && itemData.thumbnail && (
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden border border-stone-300 shadow-xs shrink-0">
                                  <img
                                    src={itemData.thumbnail}
                                    alt={itemData.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {styling.showQr && qrDataUrl && (
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="w-11 h-11 bg-white p-0.5 rounded border border-stone-300 shadow-xs print:shadow-none">
                                    <img
                                      src={qrDataUrl}
                                      alt={`QR for ${itemData.title}`}
                                      className="w-full h-full object-contain block"
                                    />
                                  </div>
                                  <span className="text-[6px] font-sans text-stone-500 tracking-tight mt-0.5 whitespace-nowrap">
                                    Scan Provenance
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acrylic Base Margin Indicator (Subtle UI guide, hidden on print) */}
                    <div
                      data-acrylic-guide="true"
                      className="absolute bottom-0 inset-x-0 h-2 border-t border-dashed border-stone-300/60 bg-stone-50/50 print:hidden flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-[6px] uppercase tracking-wider text-stone-400 font-mono">
                        Base Margin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Placard Design Customizer Studio & Details Editor */}
        {activeTab === "edit" && (
          <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6 bg-background space-y-6">
            {/* DESIGN & TYPOGRAPHY CUSTOMIZER STUDIO */}
            <div className="p-4 rounded-xl border border-amber-500/40 bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Placard Design &amp; Typography Studio
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Customize typography, color swatches, alignment, and background palettes in real-time.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-800 dark:text-amber-300 text-[10px]">
                  Global Design Config
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Font Family */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3 h-3 text-amber-600" /> Font Family
                  </Label>
                  <Select
                    value={styling.fontFamily}
                    onValueChange={(val: "cinzel" | "cormorant" | "inter" | "georgia") => updateStyling("fontFamily", val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cormorant" className="font-serif">Cormorant Garamond (Classical Serif)</SelectItem>
                      <SelectItem value="cinzel" className="font-serif font-semibold">Cinzel (Roman Gilded)</SelectItem>
                      <SelectItem value="georgia" className="font-serif">Georgia (Heritage Editorial)</SelectItem>
                      <SelectItem value="inter" className="font-sans">Inter (Modern Clean Sans)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Text Alignment */}
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

                {/* 3. Title Size Scale */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Title Size Scale
                  </Label>
                  <Select
                    value={styling.titleScale}
                    onValueChange={(val: "compact" | "standard" | "large") => updateStyling("titleScale", val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact (12px)</SelectItem>
                      <SelectItem value="standard">Standard (14px)</SelectItem>
                      <SelectItem value="large">Large (16px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Body Size Scale */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Body / Medium Size
                  </Label>
                  <Select
                    value={styling.bodyScale}
                    onValueChange={(val: "compact" | "standard" | "large") => updateStyling("bodyScale", val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact (8.5px)</SelectItem>
                      <SelectItem value="standard">Standard (9.5px)</SelectItem>
                      <SelectItem value="large">Large (10.5px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color Palettes & Custom Hex Pickers */}
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
                    <span>Title Color</span>
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
                    <span>Body Text Color</span>
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

            {/* Global Artist Name Action Bar */}
            <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
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
                  className="h-8 text-xs w-48 bg-background"
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

            {/* Individual Card Editors */}
            <div className="space-y-3">
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
                    </div>

                    {/* Block 5: Additional Curatorial Notes */}
                    <div className="space-y-1 pt-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-600" />
                        Additional Curatorial Information / Notes
                      </Label>
                      <Textarea
                        value={itemData.additionalNotes || ""}
                        onChange={(e) => updateCardItem(art.id, "additionalNotes", e.target.value)}
                        placeholder="Provenance, donor attribution, historical note, or gallery wall placement details..."
                        className="text-xs min-h-[58px] resize-y"
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
  );
}
