"use client";

import * as React from "react";
import QRCode from "qrcode";
import {
  Printer,
  Sparkles,
  Sliders,
  Check,
  QrCode,
  X,
  Layers,
  FileText,
  Copy,
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

export function ArtworkPlacardSheet({
  open,
  onOpenChange,
  artworks = [],
}: ArtworkPlacardSheetProps) {
  const [cardFormat, setCardFormat] = React.useState<"visiting-card" | "museum-placard">("visiting-card");
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">("landscape");
  const [showCropMarks, setShowCropMarks] = React.useState(true);
  const [showGoldBorder, setShowGoldBorder] = React.useState(true);
  const [includeArtistName, setIncludeArtistName] = React.useState(true);
  const [includeThumbnail, setIncludeThumbnail] = React.useState(false);
  const [qrCodeDataUrls, setQrCodeDataUrls] = React.useState<Record<string, string>>({});
  const [generatingQr, setGeneratingQr] = React.useState(false);

  // Generate QR codes for all artworks in batch
  React.useEffect(() => {
    if (!open || artworks.length === 0) return;

    let active = true;
    const generateAllQrs = async () => {
      setGeneratingQr(true);
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
        setGeneratingQr(false);
      }
    };

    generateAllQrs();
    return () => {
      active = false;
    };
  }, [open, artworks]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Printable Artwork Display Placards &amp; Cards
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Formatted for 8-up and 10-up batch printing on standard A4 or Letter sheets with alignment crop marks.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-800 dark:text-amber-300">
                {artworks.length} Masterwork{artworks.length === 1 ? "" : "s"} Selected
              </Badge>
              <Button
                type="button"
                onClick={handlePrint}
                className="text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </Button>
            </div>
          </div>

          {/* Configuration Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-3 mt-1 border-t border-border/60">
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

            {/* Crop Marks */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Crop Marks</span>
              <button
                type="button"
                onClick={() => setShowCropMarks(!showCropMarks)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showCropMarks ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Guides</span>
                {showCropMarks && <Check className="w-3 h-3 text-amber-600" />}
              </button>
            </div>

            {/* Gold Hairline Fillet */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fillet Border</span>
              <button
                type="button"
                onClick={() => setShowGoldBorder(!showGoldBorder)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  showGoldBorder ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Gold Fillet</span>
                {showGoldBorder && <Check className="w-3 h-3 text-amber-600" />}
              </button>
            </div>

            {/* Artist Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Artist Header</span>
              <button
                type="button"
                onClick={() => setIncludeArtistName(!includeArtistName)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  includeArtistName ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Lalita K.</span>
                {includeArtistName && <Check className="w-3 h-3 text-amber-600" />}
              </button>
            </div>

            {/* Thumbnail */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thumbnail</span>
              <button
                type="button"
                onClick={() => setIncludeThumbnail(!includeThumbnail)}
                className={`w-full h-7 px-2 text-xs rounded border text-left flex items-center justify-between cursor-pointer ${
                  includeThumbnail ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>Mini Image</span>
                {includeThumbnail && <Check className="w-3 h-3 text-amber-600" />}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Print Preview Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-900/60">
          <div
            id="artwork-printable-sheet"
            className={cn(
              "mx-auto bg-white text-stone-900 shadow-xl print:shadow-none p-6 print:p-0 transition-all",
              "print:w-full print:bg-white print:text-black",
              // Print Grid Setup
              cardFormat === "visiting-card"
                ? orientation === "landscape"
                  ? "max-w-[760px] grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3"
                  : "max-w-[760px] grid grid-cols-2 sm:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2.5"
                : orientation === "landscape"
                ? "max-w-[800px] grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-5 print:gap-4"
                : "max-w-[800px] grid grid-cols-2 sm:grid-cols-3 print:grid-cols-3 gap-4 print:gap-3"
            )}
          >
            {artworks.map((art, idx) => {
              const qrDataUrl = qrCodeDataUrls[art.id];
              const school = art.traditionalSchool || art.category?.name || "Thanjavur Traditional";
              const medium = art.medium || "22k Gold Foil, Gesso, Teak Wood";
              const dimensions = art.dimensions || "";
              const year = art.yearCreated ? String(art.yearCreated) : "";
              const thumbnail = art.watermarkedWebpUrl || art.primaryImageUrl;

              return (
                <div
                  key={art.id || idx}
                  className={cn(
                    "relative bg-white text-stone-900 border border-stone-200 p-3.5 print:p-3 transition-all flex flex-col justify-between overflow-hidden",
                    showCropMarks && "outline outline-1 outline-dashed outline-stone-300 print:outline-stone-400 -outline-offset-1",
                    cardFormat === "visiting-card"
                      ? orientation === "landscape"
                        ? "min-h-[145px] h-[155px]"
                        : "min-h-[195px] h-[215px]"
                      : orientation === "landscape"
                      ? "min-h-[185px] h-[200px]"
                      : "min-h-[235px] h-[255px]"
                  )}
                  style={{
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                  }}
                >
                  {/* Outer Gold Decorative Fillet Border */}
                  {showGoldBorder && (
                    <div className="absolute inset-1.5 border border-amber-600/35 pointer-events-none rounded-[1px]">
                      <div className="absolute inset-0.5 border border-amber-600/15 pointer-events-none" />
                    </div>
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

                  {/* Placard Header: Artist Name & Traditional School */}
                  <div className="relative z-10 space-y-0.5">
                    {includeArtistName && (
                      <div className="flex items-center justify-between border-b border-amber-600/20 pb-0.5 mb-1">
                        <span className="font-serif tracking-widest text-[9px] uppercase font-bold text-amber-900 print:text-black">
                          Lalita Kapilavai
                        </span>
                        <span className="font-sans text-[8px] text-stone-500 print:text-stone-700 tracking-wide">
                          Atelier Masterwork
                        </span>
                      </div>
                    )}

                    {/* Masterwork Title */}
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-950 print:text-black leading-tight italic">
                      {art.title}
                    </h3>
                  </div>

                  {/* Placard Body: Curatorial Metadata & QR Code */}
                  <div className="relative z-10 flex items-end justify-between gap-2 mt-auto pt-1">
                    <div className="flex-1 space-y-0.5 pr-1">
                      {/* Line 2: Materials & Medium */}
                      {medium && (
                        <p className="text-[9.5px] leading-tight text-stone-700 print:text-black font-medium">
                          {medium}
                        </p>
                      )}

                      {/* Line 3: Dimensions & School */}
                      <p className="text-[8.5px] leading-tight text-stone-600 print:text-stone-800">
                        {[dimensions, school, year].filter(Boolean).join(" • ")}
                      </p>
                    </div>

                    {/* Optional Thumbnail Image */}
                    {includeThumbnail && thumbnail && (
                      <div className="w-10 h-10 shrink-0 rounded overflow-hidden border border-stone-300">
                        <img
                          src={thumbnail}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Dynamic High-Resolution QR Code */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-12 h-12 bg-white p-0.5 rounded border border-stone-300 shadow-xs print:shadow-none">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR for ${art.title}`}
                            className="w-full h-full object-contain block"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] text-stone-400">
                            QR
                          </div>
                        )}
                      </div>
                      <span className="text-[6.5px] text-stone-500 print:text-black tracking-tight mt-0.5">
                        Scan for Archive
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="p-3 border-t border-border/80 bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Tip: In print settings, set &quot;Margins&quot; to &quot;None&quot; and check &quot;Background graphics&quot; for accurate double-fillet borders.
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
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Cards ({artworks.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Scoped Print Media Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide non-print dialog wrappers */
          nav, header, footer, aside, .no-print, [role="dialog"] > div:not(:has(#artwork-printable-sheet)) {
            display: none !important;
          }
          /* Ensure printable sheet is top-level */
          #artwork-printable-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </Dialog>
  );
}
