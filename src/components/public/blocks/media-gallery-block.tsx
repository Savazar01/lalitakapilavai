"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <img
              src={activeItem.url}
              alt={activeItem.alt || activeItem.title || "Gallery image"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <img
                      src={item.url}
                      alt={item.alt || item.title || `Gallery Item ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
   * MODE C: CURATED BENTO COLLAGE (Up to 5 Photos)
   * ----------------------------------------------------------- */
  const collageItems = validItems.slice(0, 5);

  // If 1 item: full display
  if (collageItems.length === 1) {
    const single = collageItems[0];
    return (
      <div className={cn("w-full", className)}>
        <ItemLinkWrapper item={single} className={cn("relative w-full aspect-[16/9]", frameClasses)}>
          <img
            src={single.url}
            alt={single.alt || single.title || "Masterwork collage"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {(single.title || single.caption) && (
            <div className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md p-4 rounded-xl border border-amber-500/30">
              {single.title && (
                <h4 className="font-serif font-bold text-base text-white">{single.title}</h4>
              )}
              {single.caption && (
                <p className="text-xs text-stone-200 mt-1">{single.caption}</p>
              )}
            </div>
          )}
        </ItemLinkWrapper>
      </div>
    );
  }

  // If 2 items: 2-column split
  if (collageItems.length === 2) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 w-full", className)}>
        {collageItems.map((item, idx) => (
          <ItemLinkWrapper
            key={item.id || idx}
            item={item}
            className={cn("relative aspect-[4/3] w-full group", frameClasses)}
          >
            <img
              src={item.url}
              alt={item.alt || item.title || `Collage Item ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {(item.title || item.caption) && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent">
                {item.title && (
                  <h4 className="font-serif font-bold text-sm text-white">{item.title}</h4>
                )}
                {item.caption && (
                  <p className="text-xs text-stone-200 mt-0.5 line-clamp-1">{item.caption}</p>
                )}
              </div>
            )}
          </ItemLinkWrapper>
        ))}
      </div>
    );
  }

  // If 3 items: 1 large left, 2 stacked right
  if (collageItems.length === 3) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-4 w-full", className)}>
        {/* Large Feature Item */}
        <div className="md:col-span-7">
          <ItemLinkWrapper
            item={collageItems[0]}
            className={cn("relative w-full h-[320px] sm:h-[420px] group", frameClasses)}
          >
            <img
              src={collageItems[0].url}
              alt={collageItems[0].alt || collageItems[0].title || "Collage Feature"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {(collageItems[0].title || collageItems[0].caption) && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-stone-950/90 to-transparent">
                {collageItems[0].title && (
                  <h4 className="font-serif font-bold text-base text-white">{collageItems[0].title}</h4>
                )}
                {collageItems[0].caption && (
                  <p className="text-xs text-stone-200 mt-0.5">{collageItems[0].caption}</p>
                )}
              </div>
            )}
          </ItemLinkWrapper>
        </div>

        {/* Right Stacked 2 Items */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {collageItems.slice(1, 3).map((item, idx) => (
            <ItemLinkWrapper
              key={item.id || idx}
              item={item}
              className={cn("relative w-full h-[152px] sm:h-[202px] group", frameClasses)}
            >
              <img
                src={item.url}
                alt={item.alt || item.title || `Collage Sub-item ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {(item.title || item.caption) && (
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-stone-950/90 to-transparent">
                  {item.title && (
                    <h4 className="font-serif font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                  )}
                </div>
              )}
            </ItemLinkWrapper>
          ))}
        </div>
      </div>
    );
  }

  // 4 or 5 items: Luxury Curated Bento Grid (Feature plate + remaining 3 or 4)
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 w-full", className)}>
      {/* Primary Feature Plate (Left / Main) */}
      <div className="md:col-span-7">
        <ItemLinkWrapper
          item={collageItems[0]}
          className={cn("relative w-full h-[360px] sm:h-[460px] group", frameClasses)}
        >
          <img
            src={collageItems[0].url}
            alt={collageItems[0].alt || collageItems[0].title || "Principal Masterwork"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-left z-10">
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1 bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" /> Featured Plate
            </div>
            {collageItems[0].title && (
              <h3 className="font-serif font-bold text-base sm:text-xl text-white drop-shadow-sm">
                {collageItems[0].title}
              </h3>
            )}
            {collageItems[0].caption && (
              <p className="text-xs text-stone-200/90 leading-relaxed mt-1 line-clamp-2">
                {collageItems[0].caption}
              </p>
            )}
          </div>
        </ItemLinkWrapper>
      </div>

      {/* Grid for Remaining 3 to 4 Items (Right Column) */}
      <div className="md:col-span-5 grid grid-cols-2 gap-3.5 sm:gap-4">
        {collageItems.slice(1, 5).map((item, idx) => (
          <ItemLinkWrapper
            key={item.id || idx}
            item={item}
            className={cn(
              "relative w-full h-[172px] sm:h-[222px] group overflow-hidden",
              frameClasses
            )}
          >
            <img
              src={item.url}
              alt={item.alt || item.title || `Atelier Detail ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-left z-10">
              {item.title && (
                <h4 className="font-serif font-bold text-xs sm:text-sm text-white line-clamp-1 drop-shadow-sm">
                  {item.title}
                </h4>
              )}
              {item.caption && (
                <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                  {item.caption}
                </p>
              )}
            </div>
          </ItemLinkWrapper>
        ))}
      </div>
    </div>
  );
}
