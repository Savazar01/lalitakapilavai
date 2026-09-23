"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Info,
  Music,
  Compass,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedImage } from "@/components/public/protected-image";
import { cn } from "@/lib/utils";

export type HeroArchetype = "split-showcase" | "monograph-bleed" | "heritage-hotspots";

export interface HotspotPin {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  title: string;
  description: string;
  ragaName?: string;
  technique?: string;
  goldFoilDetail?: string;
}

export interface HeroShowcaseBlockProps {
  archetype?: HeroArchetype;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  curatorialQuote?: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  badges?: string[];
  hotspots?: HotspotPin[];
  contrast?: string;
}

export function HeroShowcaseBlock({
  archetype = "split-showcase",
  title = "Sacred Tanjore & Carnatic Archival Opus",
  subtitle = "Masterworks in 22k gold relief and divine musicological synesthesia by Lalita Kapilavai.",
  eyebrow = "Curatorial Monograph & Living Archive",
  curatorialQuote = "“Every brushstroke is a silent prayer; every 22k gold embellishment vibrates in unison with the ancient microtones of Carnatic ragas.”",
  imageUrl = "/images/artworks/sample-tanjore.jpg",
  secondaryImageUrl: _secondaryImageUrl,
  primaryCtaText = "Explore Collection",
  primaryCtaUrl = "/gallery",
  secondaryCtaText = "Exhibition Wall Simulator",
  secondaryCtaUrl = "/exhibition-simulator",
  badges = ["22k Gold Foil Relief", "Mysore & Thanjavur School", "Raga Kalyani Synesthesia"],
  hotspots = [
    {
      id: "pin-1",
      x: 35,
      y: 40,
      title: "Sukka Chunam & French Chalk Gesso",
      description: "Traditional relief substrate ground with gum arabic and natural adhesives, cured over weeks to support heavy gold leaf.",
      technique: "Classical Gesso Relief Work",
    },
    {
      id: "pin-2",
      x: 65,
      y: 30,
      title: "22-Karat Pure Gold Foil Embellishment",
      description: "Hand-embossed gold leaf imported from traditional south Indian goldsmiths, burnished with agate stone.",
      goldFoilDetail: "22k Pure Gold Foil",
    },
    {
      id: "pin-3",
      x: 50,
      y: 70,
      title: "Carnatic Raga Association: Kalyani",
      description: "The serene majesty of Raga Kalyani (65th Melakarta) mirrored through symmetric temple arch iconography.",
      ragaName: "Raga Kalyani (Tisra Gati)",
    },
  ],
}: HeroShowcaseBlockProps) {
  const [selectedPin, setSelectedPin] = React.useState<HotspotPin | null>(null);

  // 1. Archetype: Full-Bleed Monograph Hero
  if (archetype === "monograph-bleed") {
    return (
      <div className="relative w-full min-h-[85vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden bg-stone-950 text-stone-100 select-none">
        {/* Full-bleed background media with cinematic scale */}
        <div className="absolute inset-0 z-0">
          <ProtectedImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
            priority
          />
          {/* Multi-stage luxury dark scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/40" />
          <div className="absolute inset-0 bg-radial-[at_center_center] from-transparent via-stone-950/40 to-stone-950/90" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 backdrop-blur-md mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300 font-semibold">
                {eyebrow}
              </span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-stone-100 tracking-tight leading-[1.1] mb-6 drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-stone-300 font-serif max-w-3xl leading-relaxed mb-8 drop-shadow">
              {subtitle}
            </p>
          )}

          {curatorialQuote && (
            <blockquote className="text-xs sm:text-sm italic text-amber-200/80 font-serif max-w-2xl border-y border-amber-500/30 py-3 mb-10">
              {curatorialQuote}
            </blockquote>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {primaryCtaText && (
              <Button
                asChild
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-8 rounded-full shadow-lg shadow-amber-900/30 transition-all hover:scale-105"
              >
                <Link href={primaryCtaUrl || "#"}>
                  {primaryCtaText} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            )}

            {secondaryCtaText && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-amber-400/50 bg-stone-900/60 hover:bg-stone-900/90 text-amber-200 px-6 rounded-full backdrop-blur-md transition-all hover:border-amber-300"
              >
                <Link href={secondaryCtaUrl || "#"}>
                  <Compass className="w-4 h-4 mr-2 text-amber-400" />
                  {secondaryCtaText}
                </Link>
              </Button>
            )}
          </div>

          {/* Badges footer */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-stone-900/80 border border-stone-700/60 text-stone-300"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Archetype: Interactive Heritage Hotspots
  if (archetype === "heritage-hotspots") {
    return (
      <div className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Interactive Artwork Canvas with Hotspot Pins (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-2xl bg-stone-950 group">
              <div className="relative aspect-[4/3] w-full">
                <ProtectedImage
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors pointer-events-none" />

                {/* Hotspot Pins */}
                {hotspots.map((pin) => {
                  const isActive = selectedPin?.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setSelectedPin(pin)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-1.5 rounded-full transition-all group/pin focus:outline-hidden",
                        isActive ? "scale-125 z-30" : "hover:scale-115"
                      )}
                      title={pin.title}
                    >
                      {/* Pulse rings */}
                      <span className="absolute inset-0 rounded-full bg-amber-400/50 animate-ping" />
                      <span
                        className={cn(
                          "relative flex items-center justify-center w-7 h-7 rounded-full border-2 shadow-lg transition-colors",
                          isActive
                            ? "bg-amber-400 border-stone-900 text-stone-950"
                            : "bg-stone-950/90 border-amber-400 text-amber-400 group-hover/pin:bg-amber-500 group-hover/pin:text-stone-950"
                        )}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom hint banner */}
              <div className="px-4 py-2 bg-stone-900/90 border-t border-amber-600/30 flex items-center justify-between text-xs text-amber-200/90 font-mono">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Click golden pins to reveal Tanjore iconography & musical secrets
                </span>
                <span className="hidden sm:inline text-[11px] text-amber-400 font-bold">
                  {hotspots.length} Masterwork Secrets
                </span>
              </div>
            </div>
          </div>

          {/* Curatorial Details & Active Secret Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {eyebrow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {eyebrow}
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Active Hotspot Reveal Card or Default List */}
            {selectedPin ? (
              <div className="p-5 rounded-xl border-2 border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 space-y-3 relative shadow-md transition-all">
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 rounded-md"
                  title="Close secret"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-600 text-stone-950 font-bold text-[10px] uppercase">
                    Curatorial Secret
                  </Badge>
                  {selectedPin.technique && (
                    <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300">
                      {selectedPin.technique}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-amber-950 dark:text-amber-200">
                  {selectedPin.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  {selectedPin.description}
                </p>
                {selectedPin.ragaName && (
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20 text-xs font-mono text-amber-900 dark:text-amber-300 font-semibold">
                    <Music className="w-3.5 h-3.5 text-amber-500" />
                    Musical Concordance: {selectedPin.ragaName}
                  </div>
                )}
                {selectedPin.goldFoilDetail && (
                  <div className="flex items-center gap-2 pt-1 text-xs font-mono text-amber-700 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {selectedPin.goldFoilDetail}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-card/60 space-y-2">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Select a feature on the painting
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click any glowing gold pin on the left to reveal the sacred iconography, gesso preparation, or melodic raga linkages.
                </p>
                <div className="space-y-1.5 pt-2">
                  {hotspots.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPin(p)}
                      className="w-full text-left p-2 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 flex items-center justify-between border border-transparent hover:border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] flex items-center justify-center font-mono font-bold">
                          {i + 1}
                        </span>
                        {p.title}
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {primaryCtaText && (
                <Button asChild className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold rounded-full px-6">
                  <Link href={primaryCtaUrl || "#"}>
                    {primaryCtaText} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              )}
              {secondaryCtaText && (
                <Button asChild variant="outline" className="border-amber-500/40 hover:bg-amber-500/10 rounded-full px-5 text-xs">
                  <Link href={secondaryCtaUrl || "#"}>
                    <Compass className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    {secondaryCtaText}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default Archetype: Split Exhibition Showcase
  return (
    <div className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Curatorial Title, Monograph Narrative, Badges, CTAs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {eyebrow}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.15]">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
              {subtitle}
            </p>
          )}

          {curatorialQuote && (
            <div className="p-4 rounded-xl border-l-4 border-amber-600 bg-amber-500/5 dark:bg-amber-950/20 text-xs sm:text-sm italic font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
              {curatorialQuote}
            </div>
          )}

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  {b}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {primaryCtaText && (
              <Button
                asChild
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-7 rounded-full shadow-md shadow-amber-900/20 transition-all hover:scale-105"
              >
                <Link href={primaryCtaUrl || "#"}>
                  {primaryCtaText} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            )}

            {secondaryCtaText && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-amber-500/40 hover:bg-amber-500/10 text-foreground px-6 rounded-full font-semibold"
              >
                <Link href={secondaryCtaUrl || "#"}>
                  <Compass className="w-4 h-4 mr-2 text-amber-600" />
                  {secondaryCtaText}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Ornate Tanjore Teak & Gold Framed Showcase Plate (6 cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg">
            {/* Museum Gold Bevel Frame */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#1C1814] via-[#2A231C] to-[#1C1814] shadow-2xl border-4 border-[#D4AF37]/80 ring-1 ring-black/40">
              <div className="p-2 sm:p-2.5 rounded-xl border border-amber-600/40 bg-stone-950">
                <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden">
                  <ProtectedImage
                    src={imageUrl}
                    alt={title}
                    fill
                    useImg={true}
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Placard Tag */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-stone-900/90 backdrop-blur-md border border-amber-500/40 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-0.5">
                      Fine Art Monograph
                    </span>
                    <span className="text-xs sm:text-sm font-serif font-bold text-stone-100 truncate block">
                      {title}
                    </span>
                    <span className="text-[10px] font-serif text-stone-300 italic block">
                      Authentic 22k Gold Leaf on Traditional Gesso
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle glow accent under frame */}
            <div className="absolute -inset-4 bg-amber-500/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
