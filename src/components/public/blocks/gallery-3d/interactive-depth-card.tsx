"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Layers, ExternalLink } from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import { ProtectedImage } from "@/components/public/protected-image";
import { cn } from "@/lib/utils";

interface InteractiveDepthCardProps {
  items: MediaGalleryItem[];
  aspectRatio?: string;
  frameStyle?: string;
  className?: string;
}

export function InteractiveDepthCard({
  items,
  aspectRatio = "landscape",
  className = "",
}: InteractiveDepthCardProps) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = React.useState<number>(0);
  const [rotY, setRotY] = React.useState<number>(0);
  const [sheenPos, setSheenPos] = React.useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  const totalItems = items.length;
  const activeItem = items[activeIndex] || items[0];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Max 14 deg tilt
    setRotX(-normY * 12);
    setRotY(normX * 12);

    // Sheen reflection position
    setSheenPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className={cn("relative w-full py-8 flex flex-col items-center justify-center [perspective:1400px]", className)}>
      {/* 3D Tilted Card Container */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-stone-950 to-black border-2 border-amber-500/30 shadow-2xl cursor-pointer will-change-transform"
      >
        {/* Dynamic 22k Gold Specular Highlight Layer */}
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle 350px at ${sheenPos.x}% ${sheenPos.y}%, rgba(245, 208, 99, 0.35) 0%, rgba(212, 175, 55, 0.12) 40%, transparent 80%)`,
            opacity: isHovered ? 1 : 0.4,
            transition: "opacity 0.3s ease",
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none z-30"
        />

        {/* Ornate Gold Corner Fillets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

        {/* Layer 1: Artwork Frame (Depth: translateZ 24px) */}
        <div
          style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}
          className="relative w-full overflow-hidden rounded-2xl border border-amber-500/40 bg-stone-950 shadow-inner"
        >
          {activeItem && (
            <div
              className={cn(
                "relative w-full overflow-hidden flex items-center justify-center bg-black/60",
                aspectRatio === "portrait" ? "h-[480px]" : aspectRatio === "square" ? "h-[420px]" : "h-[360px]"
              )}
            >
              <ProtectedImage
                src={activeItem.url}
                alt={activeItem.title || "Classical Masterwork"}
                useImg={true}
                className="w-full h-full object-contain"
                wrapperClassName="w-full h-full flex items-center justify-center"
              />
            </div>
          )}
        </div>

        {/* Layer 2: Curatorial Placard (Depth: translateZ 44px) */}
        {activeItem && (
          <div
            style={{ transform: "translateZ(44px)" }}
            className="mt-5 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-amber-500/30 flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                3D Depth Card • Plate {activeIndex + 1} of {totalItems}
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white">
                {activeItem.title || activeItem.alt || "Sacred Masterwork"}
              </h4>
              {activeItem.caption && (
                <p className="text-xs text-stone-300 line-clamp-1 max-w-lg">{activeItem.caption}</p>
              )}
            </div>

            {activeItem.linkTarget && (
              <a
                href={activeItem.linkTarget.startsWith("/") ? activeItem.linkTarget : `/artwork/${activeItem.linkTarget}`}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Navigation Pills */}
      {totalItems > 1 && (
        <div className="flex items-center gap-3 mt-6 z-10">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)}
            className="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-105 shadow cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-muted-foreground">
            {activeIndex + 1} / {totalItems}
          </span>

          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % totalItems)}
            className="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-105 shadow cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
