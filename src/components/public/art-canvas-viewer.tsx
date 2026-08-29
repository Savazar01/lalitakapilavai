"use client";

import * as React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ArtCanvasViewerProps {
  title: string;
  watermarkedUrl: string;
  medium?: string;
  dimensions?: string;
  hasGoldFoil?: boolean;
  goldPurity?: string;
  yearCreated?: number;
  className?: string;
}

export function ArtCanvasViewer({
  title,
  watermarkedUrl,
  medium,
  dimensions,
  hasGoldFoil,
  goldPurity,
  yearCreated,
  className = "",
}: ArtCanvasViewerProps) {
  const [zoomLevel, setZoomLevel] = React.useState<1 | 1.5 | 2>(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Prevent drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <>
      {/* Dynamic @media print CSS hiding the artwork during browser print captures */}
      <style jsx global>{`
        @media print {
          .protected-artwork-frame {
            display: none !important;
          }
          .print-copyright-notice {
            display: block !important;
            padding: 2rem;
            text-align: center;
            font-family: serif;
            color: #1a1a1a;
          }
        }
        @media screen {
          .print-copyright-notice {
            display: none !important;
          }
        }
      `}</style>

      {/* Notice displayed solely during print attempts */}
      <div className="print-copyright-notice">
        <h2 className="text-xl font-bold font-serif mb-2">
          {title} — Lalita Kapilavai
        </h2>
        <p className="text-sm">
          © Lalita Kapilavai. Sacred Art & Carnatic Music Archive.
          Digital reproduction, automated screen captures, and unauthorized printings
          are strictly prohibited.
        </p>
      </div>

      {/* Main Interactive Protected Canvas Frame */}
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        className={`protected-artwork-frame select-none group relative rounded-xl border-2 border-primary/40 bg-card shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? "h-screen w-screen flex flex-col justify-center bg-black/95 rounded-none border-none" : ""
        } ${className}`}
      >
        {/* Ornate Gold Border Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {/* Floating Top Control Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {hasGoldFoil && (
              <Badge
                variant="gold"
                className="shadow-md backdrop-blur-md bg-amber-500/20 border border-amber-400 text-amber-900 dark:text-amber-300 font-bold text-[11px] gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {goldPurity || "22k Gold Foil Relief"}
              </Badge>
            )}
            {yearCreated && (
              <Badge variant="outline" className="bg-card/80 backdrop-blur-md text-[11px]">
                {yearCreated}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleZoom}
              className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-md hover:bg-accent"
              title={`Toggle Zoom (Current: ${zoomLevel}x)`}
              aria-label="Toggle Zoom"
            >
              {zoomLevel > 1 ? (
                <ZoomOut className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ZoomIn className="h-3.5 w-3.5 text-primary" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-md hover:bg-accent"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
              )}
            </Button>
          </div>
        </div>

        {/* Viewport & Canvas Area */}
        <div
          className={`relative w-full overflow-hidden flex items-center justify-center ${
            isFullscreen ? "h-full" : "min-h-[380px] sm:min-h-[500px]"
          }`}
        >
          {/* Zoomable Image Wrapper */}
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            {/* The Artwork Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={watermarkedUrl}
              alt={title}
              onDragStart={handleDragStart}
              onContextMenu={handleContextMenu}
              className="pointer-events-none select-none max-h-[75vh] w-auto object-contain transition-all duration-200"
              draggable={false}
            />

            {/* Anti-Save Transparent Pointer Shield Overlay */}
            {/* Sits immediately over the image capturing all direct mouse events */}
            <div
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              className="absolute inset-0 z-20 bg-transparent cursor-default pointer-events-auto"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Bottom Metadata & Protection Notice Bar */}
        <div className="p-3 sm:p-4 border-t border-border/60 bg-card/90 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-30">
          <div className="flex flex-col">
            <h3 className="font-serif font-bold text-sm sm:text-base text-foreground leading-tight">
              {title}
            </h3>
            {(medium || dimensions) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {[medium, dimensions].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span>Watermarked & Protected Master</span>
          </div>
        </div>
      </div>
    </>
  );
}
