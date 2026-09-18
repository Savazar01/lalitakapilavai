"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedImage } from "@/components/public/protected-image";

export interface MediaGalleryItem {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  caption?: string;
  linkType?: "none" | "artwork" | "category" | "custom";
  linkTarget?: string; // slug for artwork/category, or full url
}

export interface MediaGalleryBlockProps {
  items?: MediaGalleryItem[];
  displayMode?: "carousel" | "scroll" | "collage";
  autoplayTimer?: number; // in seconds (2 to 10)
  aspectRatio?: "landscape" | "portrait" | "square" | "natural";
  frameStyle?: "heritage" | "minimal" | "floating" | "none";
  className?: string;
}

// Helper to resolve item link
function getItemHref(item: MediaGalleryItem): string | null {
  if (!item.linkType || item.linkType === "none" || !item.linkTarget) return null;
  if (item.linkType === "artwork") {
    return item.linkTarget.startsWith("/") ? item.linkTarget : `/artwork/${item.linkTarget}`;
  }
  if (item.linkType === "category") {
    return item.linkTarget.startsWith("/") ? item.linkTarget : `/gallery/${item.linkTarget}`;
  }
  return item.linkTarget;
}

// Wrapper component to conditionally render Link or div
function ItemLinkWrapper({
  item,
  children,
  className = "",
}: {
  item: MediaGalleryItem;
  children: React.ReactNode;
  className?: string;
}) {
  const href = getItemHref(item);
  if (!href) return <div className={className}>{children}</div>;

  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn("group block relative cursor-pointer", className)}
    >
      {children}
    </Link>
  );
}

/**
 * Computes responsive grid spans and heights for Curated Bento Collage
 * dynamically supporting 1 to 12 items without awkward whitespace or truncation.
 */
export function getBentoItemClass(index: number, total: number): string {
  if (total <= 1) {
    return "col-span-12 h-[380px] sm:h-[480px]";
  }
  if (total === 2) {
    return "col-span-12 sm:col-span-6 h-[300px] sm:h-[400px]";
  }
  if (total === 3) {
    return index === 0
      ? "col-span-12 md:col-span-8 md:row-span-2 h-[340px] sm:h-[440px]"
      : "col-span-12 sm:col-span-6 md:col-span-4 h-[165px] sm:h-[212px]";
  }
  if (total === 4) {
    return index === 0 || index === 3
      ? "col-span-12 md:col-span-7 h-[260px] sm:h-[320px]"
      : "col-span-12 md:col-span-5 h-[260px] sm:h-[320px]";
  }
  if (total === 5) {
    if (index === 0) return "col-span-12 md:col-span-7 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-5 h-[180px] sm:h-[222px]";
    return "col-span-12 sm:col-span-6 md:col-span-6 h-[220px] sm:h-[280px]";
  }
  if (total === 6) {
    if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
    return "col-span-12 sm:col-span-4 md:col-span-4 h-[200px] sm:h-[240px]";
  }
  if (total === 7) {
    if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
    return "col-span-12 sm:col-span-6 md:col-span-6 h-[220px] sm:h-[260px]";
  }
  if (total === 8) {
    if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
    if (index >= 3 && index <= 5) return "col-span-12 sm:col-span-4 md:col-span-4 h-[190px] sm:h-[230px]";
    return "col-span-12 sm:col-span-6 md:col-span-6 h-[210px] sm:h-[250px]";
  }
  if (total === 9) {
    if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
    return "col-span-12 sm:col-span-4 md:col-span-4 h-[190px] sm:h-[230px]";
  }
  if (total === 10) {
    if (index === 0 || index === 1) return "col-span-12 sm:col-span-6 md:col-span-6 h-[260px] sm:h-[340px]";
    return "col-span-12 sm:col-span-6 md:col-span-3 h-[180px] sm:h-[220px]";
  }
  if (total === 11) {
    if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
    if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
    return "col-span-12 sm:col-span-6 md:col-span-3 h-[180px] sm:h-[220px]";
  }
  // 12 or more items
  if (index === 0) return "col-span-12 md:col-span-8 md:row-span-2 h-[380px] sm:h-[460px]";
  if (index === 1 || index === 2) return "col-span-12 sm:col-span-6 md:col-span-4 h-[180px] sm:h-[222px]";
  if (index === 3 || index === 4 || index === 5) return "col-span-12 sm:col-span-4 md:col-span-4 h-[200px] sm:h-[240px]";
  if (index === 6 || index === 7) return "col-span-12 sm:col-span-6 md:col-span-6 h-[220px] sm:h-[270px]";
  return "col-span-12 sm:col-span-6 md:col-span-3 h-[180px] sm:h-[220px]";
}

export function MediaGalleryBlock({
  items = [],
  displayMode = "carousel",
  autoplayTimer = 5,
  aspectRatio = "landscape",
  frameStyle = "heritage",
  className = "",
}: MediaGalleryBlockProps) {
  // Filter out empty items
  const validItems = React.useMemo(() => {
    return (items || []).filter((item) => item && typeof item.url === "string" && item.url.trim() !== "");
  }, [items]);

  // Carousel state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Scroll container ref for Horizontal Scroll mode
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-advance Carousel
  React.useEffect(() => {
    if (displayMode !== "carousel" || validItems.length <= 1 || isPaused) return;

    const intervalMs = Math.max(2, Math.min(10, autoplayTimer || 5)) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validItems.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [displayMode, validItems.length, autoplayTimer, isPaused]);

  // Handle manual carousel navigation
  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validItems.length) % validItems.length);
  }, [validItems.length]);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validItems.length);
  }, [validItems.length]);

  // Scroll buttons for Horizontal Scroll
  const scrollTrack = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -400 : 400;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Frame styling
  const frameClasses = React.useMemo(() => {
    switch (frameStyle) {
      case "heritage":
        return "border-2 border-[#D4AF37]/50 shadow-[0_4px_24px_rgba(212,175,55,0.18)] rounded-xl overflow-hidden";
      case "minimal":
        return "border border-border/70 shadow-md rounded-xl overflow-hidden";
      case "floating":
        return "shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10";
      case "none":
      default:
        return "rounded-lg overflow-hidden";
    }
  }, [frameStyle]);

  // Aspect ratio styling
  const aspectClass = React.useMemo(() => {
    switch (aspectRatio) {
      case "landscape":
        return "aspect-[16/10]";
      case "portrait":
        return "aspect-[3/4]";
      case "square":
        return "aspect-square";
      case "natural":
      default:
        return "h-[420px]";
    }
  }, [aspectRatio]);

  // Render fallback if no items
  if (validItems.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-2">
        <ImageIcon className="w-8 h-8 text-muted-foreground/60 mx-auto" />
        <p className="font-serif text-sm font-semibold text-foreground">
          Media Gallery Empty
        </p>
        <p className="text-xs text-muted-foreground">
          Configure images, captions, and links in the builder inspector.
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * MODE A: AUTO-PLAYING CAROUSEL
   * ----------------------------------------------------------- */
  if (displayMode === "carousel") {
    const activeItem = validItems[currentIndex] || validItems[0];
    const isLinked = !!getItemHref(activeItem);

    return (
      <div
        className={cn("relative w-full select-none group/carousel", className)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={cn("relative w-full overflow-hidden bg-stone-950/40", aspectClass, frameClasses)}>
          <ItemLinkWrapper item={activeItem} className="w-full h-full relative">
            <ProtectedImage
              src={activeItem.url}
              alt={activeItem.alt || activeItem.title || "Gallery image"}
              useImg={true}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              wrapperClassName="w-full h-full"
            />

            {/* Gradient Scrim for Captions */}
            {(activeItem.title || activeItem.caption || isLinked) && (
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent pointer-events-none" />
            )}

            {/* Caption Overlay */}
            {(activeItem.title || activeItem.caption || isLinked) && (
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-left z-10 pointer-events-none">
                {activeItem.title && (
                  <h4 className="font-serif font-bold text-base sm:text-xl text-white drop-shadow-md flex items-center gap-2">
                    {activeItem.title}
                    {isLinked && (
                      <span className="text-xs text-amber-300 font-sans font-normal opacity-90 inline-flex items-center gap-0.5">
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </h4>
                )}
                {activeItem.caption && (
                  <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed mt-1 max-w-2xl drop-shadow-sm font-sans">
                    {activeItem.caption}
                  </p>
                )}
              </div>
            )}
          </ItemLinkWrapper>

          {/* Previous / Next Controls */}
          {validItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous Slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-amber-500/40 text-amber-300 flex items-center justify-center transition-all opacity-80 group-hover/carousel:opacity-100 shadow-md cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next Slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-amber-500/40 text-amber-300 flex items-center justify-center transition-all opacity-80 group-hover/carousel:opacity-100 shadow-md cursor-pointer hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator Bar */}
          {validItems.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-stone-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {validItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    currentIndex === idx
                      ? "w-5 bg-amber-400"
                      : "w-1.5 bg-stone-400/60 hover:bg-stone-200"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * MODE B: SMOOTH HORIZONTAL SCROLL
   * ----------------------------------------------------------- */
  if (displayMode === "scroll") {
    return (
      <div className={cn("relative w-full space-y-3 group/scroll", className)}>
        {/* Navigation Arrows for Track */}
        <div className="flex items-center justify-between px-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            Atelier Gallery Stream ({validItems.length})
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollTrack("left")}
              aria-label="Scroll left"
              className="w-7 h-7 rounded-full bg-card hover:bg-accent border border-border text-foreground flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack("right")}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full bg-card hover:bg-accent border border-border text-foreground flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {validItems.map((item, idx) => {
            const isLinked = !!getItemHref(item);
            return (
              <div
                key={item.id || idx}
                className={cn(
                  "snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px] flex flex-col justify-between group",
                  frameClasses
                )}
              >
                <ItemLinkWrapper item={item} className="h-full flex flex-col">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950/40">
                    <ProtectedImage
                      src={item.url}
                      alt={item.alt || item.title || `Gallery Item ${idx + 1}`}
                      useImg={true}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      wrapperClassName="w-full h-full"
                    />
                    {isLinked && (
                      <div className="absolute top-2.5 right-2.5 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-full text-amber-300 opacity-90 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  {(item.title || item.caption) && (
                    <div className="p-3.5 bg-card border-t border-border/60 flex-1 flex flex-col justify-center">
                      {item.title && (
                        <h4 className="font-serif font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                      )}
                      {item.caption && (
                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  )}
                </ItemLinkWrapper>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * MODE C: CURATED BENTO COLLAGE (Up to 12 Photos)
   * ----------------------------------------------------------- */
  const collageItems = validItems.slice(0, 12);
  const totalCollage = collageItems.length;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 w-full", className)}>
      {collageItems.map((item, idx) => {
        const itemClass = getBentoItemClass(idx, totalCollage);
        const isFeatured = idx === 0 && totalCollage >= 3;
        const isLinked = !!getItemHref(item);

        return (
          <div key={item.id || idx} className={itemClass}>
            <ItemLinkWrapper
              item={item}
              className={cn(
                "relative w-full h-full group overflow-hidden block",
                frameClasses
              )}
            >
              <ProtectedImage
                src={item.url}
                alt={item.alt || item.title || `Atelier Masterwork ${idx + 1}`}
                useImg={true}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                wrapperClassName="w-full h-full"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent pointer-events-none" />

              {/* External Link Pill (if applicable) */}
              {isLinked && (
                <div className="absolute top-2.5 right-2.5 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-full text-amber-300 opacity-90 group-hover:opacity-100 transition-opacity z-10">
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}

              {/* Overlay Metadata */}
              <div
                className={cn(
                  "absolute left-3 right-3 text-left z-10 pointer-events-none",
                  isFeatured
                    ? "bottom-4 sm:bottom-6 sm:left-6 sm:right-6"
                    : "bottom-2.5 sm:bottom-3"
                )}
              >
                {isFeatured && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1 bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> Featured Plate
                  </div>
                )}
                {item.title && (
                  <h4
                    className={cn(
                      "font-serif font-bold text-white drop-shadow-sm line-clamp-1",
                      isFeatured ? "text-base sm:text-xl" : "text-xs sm:text-sm"
                    )}
                  >
                    {item.title}
                  </h4>
                )}
                {item.caption && (
                  <p
                    className={cn(
                      "text-stone-300 drop-shadow-xs line-clamp-1 mt-0.5",
                      isFeatured
                        ? "text-xs sm:text-sm text-stone-200/90 line-clamp-2 mt-1"
                        : "text-[11px]"
                    )}
                  >
                    {item.caption}
                  </p>
                )}
              </div>
            </ItemLinkWrapper>
          </div>
        );
      })}
    </div>
  );
}
