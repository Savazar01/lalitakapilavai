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
import { getClientBaseUrl } from "@/lib/get-base-url-client";
import { cn } from "@/lib/utils";
import { printIsolatedElement, getPhysicalDimensions } from "@/lib/print-isolated-html";

export interface PlacardArtwork {
  id: string;
  title: string;
  slug: string;
  medium?: string;
  dimensions?: string;
  traditionalSchool?: string;
  yearCreated?: number | string;
  description?: string;
  category?: { name: string };
  primaryImageUrl?: string;
  watermarkedWebpUrl?: string;
}

export interface ArtworkPlacardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworks: PlacardArtwork[];
}

export interface EditablePlacardItem {
  id: string;
  title: string;
  artistName: string;
  category: string;
  medium: string;
  dimensions: string;
  year: string;
  thumbnail?: string;
  slug: string;
}

export function ArtworkPlacardSheet({
  open,
  onOpenChange,
  artworks = [],
}: ArtworkPlacardSheetProps) {
  // Configurator Toggles
  const [cardFormat, setCardFormat] = React.useState<"visiting-card" | "museum-placard">("visiting-card");
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">("landscape");
  const [borderStyle, setBorderStyle] = React.useState<"double-fillet" | "single-rule" | "none">("double-fillet");
  const [showCropMarks, setShowCropMarks] = React.useState(true);
  const [showThumbnail, setShowThumbnail] = React.useState(true);
  const [showQrCode, setShowQrCode] = React.useState(true);
  const [showCategoryHeader, setShowCategoryHeader] = React.useState(true);
  const [showArtistHeader, setShowArtistHeader] = React.useState(true);

  // Active View Tab: "preview" vs "edit"
  const [activeTab, setActiveTab] = React.useState<"preview" | "edit">("preview");

  // Editable In-Modal Card Data Overrides
  const [userOverrides, setUserOverrides] = React.useState<Record<string, Partial<EditablePlacardItem>>>({});
  const [globalArtistName, setGlobalArtistName] = React.useState("Lalita Kapilavai");

  // QR Code batch mapping
  const [qrCodeDataUrls, setQrCodeDataUrls] = React.useState<Record<string, string>>({});

  const getItemData = React.useCallback(
    (art: PlacardArtwork): EditablePlacardItem => {
      const over = userOverrides[art.id] || {};
      return {
        id: art.id,
        title: over.title ?? art.title ?? "",
        artistName: over.artistName ?? "Lalita Kapilavai",
        category: over.category ?? art.traditionalSchool ?? art.category?.name ?? "Thanjavur Traditional",
        medium: over.medium ?? art.medium ?? "22k Gold Foil, Gesso, Teak Wood",
        dimensions: over.dimensions ?? art.dimensions ?? "",
        year: over.year ?? (art.yearCreated ? String(art.yearCreated) : ""),
        thumbnail: over.thumbnail ?? art.watermarkedWebpUrl ?? art.primaryImageUrl,
        slug: over.slug ?? art.slug ?? "",
      };
    },
    [userOverrides]
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
            borderStyle,
            showCropMarks,
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
        borderStyle,
        showCropMarks,
      }
    );
  };

  const dim = getPhysicalDimensions(cardFormat, orientation);

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
                Two-column fine-art exhibition cards with 18mm acrylic stand base margin and live metadata customizer.
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

          {/* Configuration Toolbar */}
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
                  <SelectItem value="museum-placard">Museum Placard (4 x 3 in)</SelectItem>
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
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Border Options */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Border Style</span>
              <Select
                value={borderStyle}
                onValueChange={(val: "double-fillet" | "single-rule" | "none") => setBorderStyle(val)}
              >
                <SelectTrigger className="h-7 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="double-fillet">Double Gold Fillet</SelectItem>
                  <SelectItem value="single-rule">Minimal Single Rule</SelectItem>
                  <SelectItem value="none">Borderless</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle: Thumbnail */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thumbnail</span>
              <button
                type="button"
                onClick={() => setShowThumbnail(!showThumbnail)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showThumbnail
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Image</span>
                {showThumbnail ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: QR Code */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">QR Code</span>
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showQrCode
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>QR Code</span>
                {showQrCode ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: Category Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
              <button
                type="button"
                onClick={() => setShowCategoryHeader(!showCategoryHeader)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showCategoryHeader
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>School</span>
                {showCategoryHeader ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: Artist Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Artist</span>
              <button
                type="button"
                onClick={() => setShowArtistHeader(!showArtistHeader)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showArtistHeader
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Artist</span>
                {showArtistHeader ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>

            {/* Toggle: Crop Marks */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Crop Marks</span>
              <button
                type="button"
                onClick={() => setShowCropMarks(!showCropMarks)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showCropMarks
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Guides</span>
                {showCropMarks ? <CheckSquare className="w-3 h-3 text-amber-600" /> : <Square className="w-3 h-3 text-muted-foreground" />}
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
                "mx-auto bg-white text-stone-900 shadow-xl print:shadow-none p-6 print:p-0 transition-all",
                "flex flex-wrap gap-5 items-start justify-center",
                cardFormat === "visiting-card"
                  ? "max-w-[780px]"
                  : "max-w-[860px]"
              )}
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
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                    className={cn(
                      "placard-card-item relative bg-white text-stone-900 border border-stone-200 p-3.5 print:p-3 transition-all flex flex-col justify-between overflow-hidden shrink-0",
                      // 18mm bottom safety margin so acrylic stands/clips never occlude card typography
                      "pb-[18mm] print:pb-[18mm]",
                      showCropMarks && "outline outline-1 outline-dashed outline-stone-300 print:outline-stone-400 -outline-offset-1"
                    )}
                  >
                    {/* Border Options */}
                    {borderStyle === "double-fillet" && (
                      <div className="absolute inset-1.5 border border-amber-600/35 pointer-events-none rounded-[1px]">
                        <div className="absolute inset-0.5 border border-amber-600/15 pointer-events-none" />
                      </div>
                    )}
                    {borderStyle === "single-rule" && (
                      <div className="absolute inset-1.5 border border-stone-300 print:border-black pointer-events-none rounded-[1px]" />
                    )}

                    {/* Corner Crop Marks for Professional Trimmer Guides */}
                    {showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
                      </>
                    )}

                    {/* Header: Category / Traditional School on Left; Artist Name on Right */}
                    {(showCategoryHeader || showArtistHeader) && (
                      <div className="relative z-10 flex items-center justify-between border-b border-amber-600/30 print:border-stone-300 pb-1 mb-1.5">
                        <span className="font-serif tracking-widest text-[8.5px] sm:text-[9px] uppercase font-bold text-amber-900 print:text-black truncate max-w-[55%]">
                          {showCategoryHeader ? itemData.category : ""}
                        </span>
                        <span className="font-serif tracking-wide text-[8.5px] sm:text-[9px] font-semibold text-stone-800 print:text-black shrink-0">
                          {showArtistHeader ? itemData.artistName : ""}
                        </span>
                      </div>
                    )}

                    {/* Two-Column Body */}
                    <div className="relative z-10 flex-1 flex items-stretch justify-between gap-2.5">
                      {/* Left Column (65%): Artwork Title, Medium & Materials, Dimensions & Year */}
                      <div className="w-[65%] flex flex-col justify-between pr-1">
                        <div>
                          <h3 className="font-serif font-bold text-[13px] sm:text-[14.5px] leading-tight text-stone-950 print:text-black italic">
                            {itemData.title}
                          </h3>
                          {itemData.medium && (
                            <p className="font-serif italic text-[9.5px] leading-snug text-stone-700 print:text-black mt-1">
                              {itemData.medium}
                            </p>
                          )}
                        </div>
                        <p className="font-mono text-[8.5px] text-stone-600 print:text-stone-800 leading-tight mt-1">
                          {[itemData.dimensions, itemData.year].filter(Boolean).join(" • ")}
                        </p>
                      </div>

                      {/* Right Column (35%): Stacked Artwork Thumbnail (top) and Vector QR Code (bottom) */}
                      <div className="w-[35%] flex flex-col items-center justify-between pl-1 shrink-0">
                        {showThumbnail && itemData.thumbnail ? (
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden border border-stone-300 shadow-xs shrink-0">
                            <img
                              src={itemData.thumbnail}
                              alt={itemData.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-0" />
                        )}

                        {showQrCode && (
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-11 h-11 bg-white p-0.5 rounded border border-stone-300 shadow-xs print:shadow-none">
                              {qrDataUrl ? (
                                <img
                                  src={qrDataUrl}
                                  alt={`QR for ${itemData.title}`}
                                  className="w-full h-full object-contain block"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[7px] text-stone-400">
                                  QR
                                </div>
                              )}
                            </div>
                            <span className="text-[6.5px] font-sans text-stone-500 print:text-black tracking-tight mt-0.5 whitespace-nowrap">
                              Scan for Provenance
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acrylic Base Margin Indicator (Subtle UI guide, hidden on print) */}
                    <div
                      data-acrylic-guide="true"
                      className="absolute bottom-0 inset-x-0 h-[18mm] border-t border-dashed border-stone-200 bg-stone-50/50 print:hidden flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-[7.5px] uppercase tracking-wider text-stone-400 font-mono">
                        18mm Stand Base Margin (Kept Clear)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Live In-Modal Card Metadata Customizer */}
        {activeTab === "edit" && (
          <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6 bg-background space-y-4">
            {/* Global Quick Action Bar */}
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="h-8 text-xs w-48 bg-card"
                  placeholder="e.g. Lalita Kapilavai"
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
