"use client";

import * as React from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Building,
  Users,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TimelineMilestone {
  id: string;
  period: string;
  category:
    | "Education"
    | "Solo Exhibition"
    | "Group Show"
    | "Award/Honor"
    | "Experience"
    | "Upcoming"
    | string;
  title: string;
  subtitle?: string;
  location?: string;
  description: string;
  badgeColor?: string;
}

export interface TimelineBlockProps {
  items?: TimelineMilestone[];
  layout?: "alternating" | "compact" | "horizontal";
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  className?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Education: GraduationCap,
  "Solo Exhibition": Building,
  "Group Show": Users,
  "Award/Honor": Award,
  Experience: Compass,
  Upcoming: Sparkles,
};

const categoryBadges: Record<string, string> = {
  Education: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  "Solo Exhibition": "border-amber-500/40 bg-amber-500/15 text-amber-300",
  "Group Show": "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Award/Honor": "border-yellow-500/50 bg-yellow-500/15 text-yellow-300 font-bold",
  Experience: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Upcoming: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export function TimelineBlock({
  items = [],
  layout = "alternating",
  title = "Curatorial Journey & Archival Milestones",
  subtitle = "Chronological trajectory of traditional Tanjore masterworks, royal court restorations, and Carnatic synesthetic recitals.",
  showFilters = true,
  className = "",
}: TimelineBlockProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    if (selectedCategory === "ALL") return items;
    return items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  if (items.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-2">
        <Sparkles className="w-8 h-8 text-primary/60 mx-auto" />
        <p className="font-serif text-sm font-semibold text-foreground">
          Artist Heritage Timeline
        </p>
        <p className="text-xs text-muted-foreground">
          Add career milestones, exhibitions, awards, and curatorial chapters in the timeline inspector.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full py-6 space-y-8", className)}>
      {/* Block Header */}
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Artist Trajectory &amp; Provenance
          </div>
          {title && (
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Category Filter Chips */}
      {showFilters && categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            All Milestones ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal Scroll Layout */}
      {layout === "horizontal" && (
        <div className="overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-stretch gap-6 min-w-max relative py-4">
            {/* Horizontal Spine */}
            <div className="absolute top-10 left-8 right-8 h-0.5 bg-gradient-to-r from-amber-600/40 via-yellow-400 to-amber-600/40 z-0" />

            {filteredItems.map((milestone) => {
              const IconComponent =
                categoryIcons[milestone.category] || Sparkles;
              const badgeClass =
                categoryBadges[milestone.category] ||
                "border-primary/40 bg-primary/10 text-primary";

              return (
                <div
                  key={milestone.id}
                  className="w-80 flex flex-col justify-between relative z-10 rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm p-5 shadow-lg space-y-3 hover:border-primary/50 transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Node Pin */}
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary shadow-md">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-mono", badgeClass)}
                      >
                        {milestone.category}
                      </Badge>
                    </div>

                    <div className="text-xs font-mono font-bold text-primary">
                      {milestone.period}
                    </div>

                    <h4 className="font-serif font-bold text-base text-foreground leading-snug">
                      {milestone.title}
                    </h4>

                    {milestone.subtitle && (
                      <p className="text-xs font-medium text-muted-foreground">
                        {milestone.subtitle}
                      </p>
                    )}

                    {milestone.location && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                        <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                        <span>{milestone.location}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alternating Vertical Layout */}
      {layout === "alternating" && (
        <div className="relative max-w-4xl mx-auto py-6">
          {/* Vertical Central Gold Spine */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-500/20 via-yellow-400 to-amber-500/20" />

          <div className="space-y-8 md:space-y-12">
            {filteredItems.map((milestone, idx) => {
              const isEven = idx % 2 === 0;
              const IconComponent =
                categoryIcons[milestone.category] || Sparkles;
              const badgeClass =
                categoryBadges[milestone.category] ||
                "border-primary/40 bg-primary/10 text-primary";

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "relative flex flex-col md:flex-row items-start md:items-center gap-6",
                    isEven ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Content Card */}
                  <div
                    className={cn(
                      "w-full md:w-1/2 pl-10 md:pl-0",
                      isEven ? "md:text-left md:pl-8" : "md:text-right md:pr-8"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-5 shadow-lg space-y-2.5 hover:border-primary/50 transition-all",
                        isEven ? "text-left" : "text-left md:text-right"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 flex-wrap",
                          isEven ? "justify-start" : "justify-start md:justify-end"
                        )}
                      >
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-mono", badgeClass)}
                        >
                          {milestone.category}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-primary flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary/70" />
                          {milestone.period}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base sm:text-lg text-foreground leading-tight">
                        {milestone.title}
                      </h4>

                      {milestone.subtitle && (
                        <p className="text-xs font-medium text-muted-foreground">
                          {milestone.subtitle}
                        </p>
                      )}

                      {milestone.location && (
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[11px] text-muted-foreground/80",
                            isEven ? "justify-start" : "justify-start md:justify-end"
                          )}
                        >
                          <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                          <span>{milestone.location}</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Central Node Pin */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10">
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Spacer for other column */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Vertical Layout */}
      {layout === "compact" && (
        <div className="relative max-w-2xl mx-auto pl-6 border-l-2 border-primary/40 space-y-6">
          {filteredItems.map((milestone) => {
            const IconComponent =
              categoryIcons[milestone.category] || Sparkles;
            const badgeClass =
              categoryBadges[milestone.category] ||
              "border-primary/40 bg-primary/10 text-primary";

            return (
              <div key={milestone.id} className="relative group">
                {/* Node Pin */}
                <div className="absolute -left-[33px] top-1.5 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary shadow-sm">
                  <IconComponent className="w-3 h-3" />
                </div>

                <div className="rounded-lg border border-border/80 bg-card/70 p-4 space-y-2 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-mono", badgeClass)}
                    >
                      {milestone.category}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-primary">
                      {milestone.period}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-foreground">
                    {milestone.title}
                  </h4>

                  {milestone.subtitle && (
                    <p className="text-xs text-muted-foreground font-medium">
                      {milestone.subtitle}
                    </p>
                  )}

                  {milestone.location && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                      <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                      <span>{milestone.location}</span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                    {milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
