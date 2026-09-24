"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import { cn } from "@/lib/utils";

export interface KenBurnsCanvasProps {
  items: MediaGalleryItem[];
  autoplayTimer?: number;
  aspectRatio?: string;
  frameStyle?: string;
  kenBurnsOverlayTheme?: "dark-velvet" | "parchment-gold" | "minimal-subtle";
  overlayTitleColor?: string;
  overlayTextColor?: string;
  className?: string;
  canvasBgColor?: string;
  borderFilletColor?: string;
  borderWidth?: number;
  framePadding?: number;
  showCaptionRibbon?: boolean;
}

interface GoldParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedY: number;
  speedX: number;
  oscillation: number;
}

export function KenBurnsCanvas({
  items,
  autoplayTimer = 6,
  aspectRatio = "landscape",
  frameStyle = "heritage",
  kenBurnsOverlayTheme: _kenBurnsOverlayTheme = "dark-velvet",
  overlayTitleColor,
  overlayTextColor,
  className = "",
  canvasBgColor,
  borderFilletColor = "#D4AF37",
  borderWidth = 0,
  framePadding = 0,
  showCaptionRibbon = false,
}: KenBurnsCanvasProps) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const particleCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const totalItems = items.length;
  const activeItem = items[activeIndex] || items[0];

  // Gold dust particulate simulation
  React.useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: GoldParticle[] = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.5 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        oscillation: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.oscillation += 0.02;
        p.x += Math.sin(p.oscillation) * 0.3 + p.speedX;

        // Wrap around
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 208, 99, ${p.alpha})`;
        ctx.shadowColor = "#D4AF37";
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Autoplay
  React.useEffect(() => {
    if (autoplayTimer <= 0 || totalItems <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalItems);
    }, autoplayTimer * 1000);
    return () => clearInterval(interval);
  }, [autoplayTimer, totalItems]);

  const heightStyle =
    aspectRatio === "portrait"
      ? "560px"
      : aspectRatio === "square"
      ? "480px"
      : aspectRatio === "natural"
      ? "420px"
      : "450px";

  return (
    <div className={cn("w-full select-none", className)}>
      {/* Outer Matting & Border Frame Container */}
      <div
        className={cn(
          "relative w-full rounded-2xl overflow-hidden transition-all duration-300 group shadow-2xl",
          frameStyle === "heritage" && "ring-1 ring-amber-500/30 shadow-[0_8px_32px_rgba(212,175,55,0.15)]",
          frameStyle === "floating" && "shadow-2xl ring-1 ring-black/10 dark:ring-white/10",
          frameStyle === "minimal" && "border border-border/80"
        )}
        style={{
          backgroundColor: canvasBgColor || "transparent",
          padding: framePadding ? `${framePadding}px` : undefined,
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderFilletColor}` : undefined,
        }}
      >
        {/* Inner Canvas Viewport with Ken Burns Animation */}
        <div
          className="relative w-full overflow-hidden rounded-xl bg-stone-950"
          style={{ height: heightStyle }}
        >
          {/* Ken Burns Animated Image */}
          <AnimatePresence mode="wait">
            {activeItem && (
              <motion.div
                key={activeItem.id || activeIndex}
                initial={{ scale: 1.02, x: 0, y: 0, opacity: 0 }}
                animate={{
                  scale: 1.12,
                  x: activeIndex % 2 === 0 ? 12 : -12,
                  y: activeIndex % 2 === 0 ? -8 : 8,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  scale: { duration: autoplayTimer + 1.2, ease: "linear" },
                  x: { duration: autoplayTimer + 1.2, ease: "linear" },
                  y: { duration: autoplayTimer + 1.2, ease: "linear" },
                  opacity: { duration: 0.8 },
                }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={activeItem.url}
                  alt={activeItem.title || "Cinema Exhibition"}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 22k Gold Particulate Canvas Layer */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-15"
          />

          {/* Navigation Controls */}
          {totalItems > 1 && (
            <>
              <div className="absolute inset-y-0 left-4 flex items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)}
                  className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute inset-y-0 right-4 flex items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % totalItems)}
                  className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer backdrop-blur-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Discreet Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-stone-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to item ${idx + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      activeIndex === idx ? "w-5 bg-amber-400" : "w-1.5 bg-stone-400/60 hover:bg-stone-200"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Optional Unobtrusive Caption Ribbon (Outside Image Boundary) */}
      {showCaptionRibbon && activeItem && (activeItem.title || activeItem.caption) && (
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-card/90 border border-border/80 flex items-center justify-between gap-4 shadow-sm backdrop-blur-xs">
          <div className="min-w-0 space-y-0.5">
            <h4
              className="text-xs sm:text-sm font-serif font-bold text-foreground truncate"
              style={{ color: overlayTitleColor || undefined }}
            >
              {activeItem.title || "Fine Art Masterwork"}
            </h4>
            {activeItem.caption && (
              <p
                className="text-[11px] text-muted-foreground truncate"
                style={{ color: overlayTextColor || undefined }}
              >
                {activeItem.caption}
              </p>
            )}
          </div>

          {activeItem.linkTarget && (
            <a
              href={
                activeItem.linkTarget.startsWith("/")
                  ? activeItem.linkTarget
                  : `/artwork/${activeItem.linkTarget}`
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-serif font-semibold shrink-0 transition-colors"
            >
              <span>Explore Piece</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
