"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, ExternalLink } from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import { cn } from "@/lib/utils";

interface KenBurnsCanvasProps {
  items: MediaGalleryItem[];
  autoplayTimer?: number;
  aspectRatio?: string;
  frameStyle?: string;
  kenBurnsOverlayTheme?: "dark-velvet" | "parchment-gold" | "minimal-subtle";
  overlayTitleColor?: string;
  overlayTextColor?: string;
  className?: string;
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
  kenBurnsOverlayTheme = "dark-velvet",
  overlayTitleColor,
  overlayTextColor,
  className = "",
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
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.6 + 0.2),
        speedX: (Math.random() - 0.5) * 0.4,
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

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-amber-500/30 bg-stone-950 select-none shadow-2xl group",
        className
      )}
      style={{ height: aspectRatio === "portrait" ? "560px" : aspectRatio === "square" ? "480px" : "440px" }}
    >
      {/* Ken Burns Animated Image */}
      <AnimatePresence mode="wait">
        {activeItem && (
          <motion.div
            key={activeItem.id || activeIndex}
            initial={{ scale: 1.02, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: 1.14,
              x: activeIndex % 2 === 0 ? 15 : -15,
              y: activeIndex % 2 === 0 ? -10 : 10,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { duration: autoplayTimer + 1, ease: "linear" },
              x: { duration: autoplayTimer + 1, ease: "linear" },
              y: { duration: autoplayTimer + 1, ease: "linear" },
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

      {/* Atmospheric Scrim & Light Leak */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-stone-950/40 pointer-events-none z-10" />

      {/* 22k Gold Particulate Canvas Layer */}
      <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-15" />

      {/* Top Badge: Cinema Ken Burns */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          Cinema Ken Burns &amp; Ethereal Gold Particles
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Caption Placard */}
      {activeItem && (
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-12 z-20 pointer-events-none">
          {kenBurnsOverlayTheme === "minimal-subtle" ? (
            <div className="p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3 shadow-lg">
              <div className="space-y-0.5">
                <h4
                  className="text-sm font-serif font-bold leading-tight"
                  style={{ color: overlayTitleColor || "#FFFFFF" }}
                >
                  {activeItem.title || activeItem.alt || "Fine Art Composition"}
                </h4>
                {activeItem.caption && (
                  <p
                    className="text-[11px] line-clamp-1 max-w-xl"
                    style={{ color: overlayTextColor || "#D1D5DB" }}
                  >
                    {activeItem.caption}
                  </p>
                )}
              </div>
              {activeItem.linkTarget && (
                <a
                  href={activeItem.linkTarget.startsWith("/") ? activeItem.linkTarget : `/artwork/${activeItem.linkTarget}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold pointer-events-auto transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            (() => {
              const isParchment = kenBurnsOverlayTheme === "parchment-gold";
              const titleColor = overlayTitleColor || (isParchment ? "#0F172A" : "#F8FAFC");
              const captionColor = overlayTextColor || (isParchment ? "#334155" : "#E2E8F0");
              return (
                <div
                  className={cn(
                    "p-4 sm:p-5 rounded-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl transition-all duration-300",
                    isParchment
                      ? "bg-[#FAF7F2]/95 border-2 border-amber-600/50 shadow-amber-950/15"
                      : "bg-[#0B0F17]/90 border border-amber-500/40 shadow-black/60"
                  )}
                >
                  <div className="space-y-1">
                    <span
                      className="text-[10px] font-mono uppercase tracking-widest font-bold"
                      style={{ color: isParchment ? "#B45309" : "#FBBF24" }}
                    >
                      Cinematic Feature • Plate {activeIndex + 1} of {totalItems}
                    </span>
                    <h4
                      className="text-base sm:text-lg font-serif font-bold leading-tight"
                      style={{ color: titleColor }}
                    >
                      {activeItem.title || activeItem.alt || "Fine Art Composition"}
                    </h4>
                    {activeItem.caption && (
                      <p
                        className="text-xs line-clamp-1 max-w-xl"
                        style={{ color: captionColor }}
                      >
                        {activeItem.caption}
                      </p>
                    )}
                  </div>

                  {activeItem.linkTarget && (
                    <a
                      href={activeItem.linkTarget.startsWith("/") ? activeItem.linkTarget : `/artwork/${activeItem.linkTarget}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold pointer-events-auto transition-colors self-start sm:self-auto shadow-xs",
                        isParchment
                          ? "bg-amber-600 text-white hover:bg-amber-700 border border-amber-700/40"
                          : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                      )}
                    >
                      <span>View Masterwork</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
