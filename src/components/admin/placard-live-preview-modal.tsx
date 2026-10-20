"use client";

import * as React from "react";
import {
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PlacardCard,
  type PlacardCardData,
} from "@/components/admin/placard-card";
import {
  getPhysicalDimensions,
  type PlacardStylingConfig,
  type PlacardPrintFormat,
} from "@/lib/print-isolated-html";
import { cn } from "@/lib/utils";

export interface PlacardLivePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: PlacardCardData[];
  qrCodeDataUrls: Record<string, string>;
  styling: PlacardStylingConfig;
  cardFormat: PlacardPrintFormat;
  orientation: "landscape" | "portrait";
  onPrint: () => void;
}

export function PlacardLivePreviewModal({
  open,
  onOpenChange,
  cards,
  qrCodeDataUrls,
  styling,
  cardFormat,
  orientation,
  onPrint,
}: PlacardLivePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [viewMode, setViewMode] = React.useState<"sheet" | "single">("sheet");
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<number>(0);
  const [showCropGuides, setShowCropGuides] = React.useState<boolean>(styling.showCropMarks);
  const [showBaseClampGuide, setShowBaseClampGuide] = React.useState<boolean>(true);

  const dim = getPhysicalDimensions(cardFormat, orientation);

  const formatLabels: Record<PlacardPrintFormat, string> = {
    "visiting-card": "Visiting Card (3.5 x 2 in)",
    "museum-placard": "Museum Placard (4 x 2.5 in)",
    "museum-large": "Museum Large (5 x 3 in)",
    "museum-xlarge": "Museum Extra Large (6 x 3.5 in)",
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(250, z + 25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 25));
  const handleResetZoom = () => setZoomLevel(100);

  const currentCard = cards[selectedCardIndex] || cards[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] w-[1400px] h-[92vh] flex flex-col p-0 overflow-hidden bg-stone-950 border-stone-800 text-stone-100">
        {/* Modal Toolbar Header */}
        <DialogHeader className="p-3.5 sm:p-4 border-b border-stone-800 bg-stone-900/90 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-serif text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                Live Interactive Placard Preview Studio
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px] font-mono">
                  {formatLabels[cardFormat]}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400 mt-0.5">
                Exact physical scale ({dim.widthMm}mm × {dim.heightMm}mm / {dim.widthIn} × {dim.heightIn}) • {orientation.toUpperCase()}
              </DialogDescription>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-800/80 p-0.5 rounded-lg border border-stone-700/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("sheet")}
                className={cn(
                  "px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "sheet"
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "text-stone-300 hover:text-white"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Full Sheet ({cards.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={cn(
                  "px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "single"
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "text-stone-300 hover:text-white"
                )}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Single Card</span>
              </button>
            </div>

            {/* Single Card Stepper (if in single mode) */}
            {viewMode === "single" && (
              <div className="flex items-center gap-1 bg-stone-800/60 p-1 rounded-lg border border-stone-700">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-stone-300 hover:text-white"
                  disabled={selectedCardIndex === 0}
                  onClick={() => setSelectedCardIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-mono text-stone-300 px-1">
                  {selectedCardIndex + 1} / {cards.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-stone-300 hover:text-white"
                  disabled={selectedCardIndex === cards.length - 1}
                  onClick={() => setSelectedCardIndex((i) => Math.min(cards.length - 1, i + 1))}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center bg-stone-800/80 p-0.5 rounded-lg border border-stone-700/80 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-1 text-stone-300 hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-amber-300 font-semibold min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 250}
                className="p-1 text-stone-300 hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 text-stone-400 hover:text-white cursor-pointer ml-0.5"
                title="Reset to 100% True Scale"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Print Trigger */}
            <Button
              type="button"
              onClick={onPrint}
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Cards</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Live Canvas Area with Interactive Zoom Container */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 bg-stone-950 flex items-center justify-center relative">
          <div
            className="transition-transform duration-150 ease-out origin-center"
            style={{
              transform: `scale(${zoomLevel / 100})`,
            }}
          >
            {viewMode === "sheet" ? (
              /* GANG-RUN SHEET VIEW */
              <div
                className="p-8 rounded-xl bg-stone-900 border border-stone-800/80 shadow-2xl flex flex-wrap gap-6 items-start justify-center max-w-[1200px]"
              >
                {cards.map((card, idx) => (
                  <div key={card.id || idx} className="shadow-xl rounded-[2px] overflow-hidden">
                    <PlacardCard
                      itemData={card}
                      qrDataUrl={qrCodeDataUrls[card.id]}
                      styling={{
                        ...styling,
                        showCropMarks: showCropGuides,
                      }}
                      cardFormat={cardFormat}
                      orientation={orientation}
                      showAcrylicGuide={showBaseClampGuide}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* SINGLE CARD INSPECTION VIEW */
              currentCard && (
                <div className="shadow-2xl rounded-[2px] overflow-hidden">
                  <PlacardCard
                    itemData={currentCard}
                    qrDataUrl={qrCodeDataUrls[currentCard.id]}
                    styling={{
                      ...styling,
                      showCropMarks: showCropGuides,
                    }}
                    cardFormat={cardFormat}
                    orientation={orientation}
                    showAcrylicGuide={showBaseClampGuide}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Modal Status Bar */}
        <div className="p-2.5 px-4 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live WYSIWYG Rendering Active
            </span>
            <span className="hidden sm:inline-block text-[11px] text-stone-500">|</span>
            <span className="hidden sm:inline-block text-[11px]">
              Layout: {styling.mediaPlacement || "top-right"} placement • Price: {styling.priceStyle || "clean"} unstyled
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showCropGuides}
                onChange={(e) => setShowCropGuides(e.target.checked)}
                className="rounded border-stone-700 bg-stone-800 text-amber-500 h-3.5 w-3.5"
              />
              <span>Crop Marks</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showBaseClampGuide}
                onChange={(e) => setShowBaseClampGuide(e.target.checked)}
                className="rounded border-stone-700 bg-stone-800 text-amber-500 h-3.5 w-3.5"
              />
              <span>Base Clamp Line</span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
