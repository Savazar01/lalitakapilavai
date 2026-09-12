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
  Clock,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type TimelineItem,
  type TimelineMilestone,
  type TimelineLayout,
  type TimelineGranularity,
  formatTimelineTemporalDisplay,
  sortTimelineItems,
  getTimelineDateClusterKey,
} from "@/types/timeline";
import {
  type ContrastMode,
  type DynamicContrastScope,
} from "@/lib/theme-contrast";

export type { TimelineItem, TimelineMilestone };

export interface TimelineBlockProps {
  items?: TimelineItem[];
  layout?: TimelineLayout;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  granularity?: TimelineGranularity;
  sortDirection?: "asc" | "desc";
  itemsPerRow?: number;
  showDateClusters?: boolean;
  contrast?: ContrastMode | DynamicContrastScope;
  className?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Education: GraduationCap,
  "Solo Show": Building,
  "Solo Exhibition": Building,
  Exhibition: Building,
  "Group Show": Users,
  "Award / Honor": Award,
  "Award/Honor": Award,
  Experience: Compass,
  Upcoming: Sparkles,
  "Concert / Recital": Sparkles,
  Workshop: GraduationCap,
  Masterclass: Award,
  Keynote: Users,
  "Panel Discussion": Users,
};

export function TimelineBlock({
  items = [],
  layout = "alternating",
  title = "Curatorial Journey & Archival Milestones",
  subtitle = "Chronological trajectory of traditional Tanjore masterworks, royal court restorations, and Carnatic synesthetic recitals.",
  showFilters = true,
  granularity,
  sortDirection = "desc",
  itemsPerRow = 3,
  showDateClusters,
  contrast = "auto",
  className = "",
}: TimelineBlockProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  // Determine container luminance mode
  const isLight = contrast === "light-surface" || contrast === "light-bg";

  // Dynamic category extraction (including custom 'Other' categories)
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const cat = (item.customCategory && item.category === "Other") 
        ? item.customCategory 
        : item.category;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [items]);

  // Deterministically sort items
  const sortedItems = React.useMemo(() => {
    return sortTimelineItems(items, sortDirection);
  }, [items, sortDirection]);

  // Filter items based on active category
  const filteredItems = React.useMemo(() => {
    if (selectedCategory === "ALL") return sortedItems;
    return sortedItems.filter((it) => {
      const cat = (it.customCategory && it.category === "Other")
        ? it.customCategory
        : it.category;
      return cat === selectedCategory;
    });
  }, [sortedItems, selectedCategory]);

  // Group by day/period if clusters requested or in DATE_TIME mode
  const clusters = React.useMemo(() => {
    const shouldCluster = showDateClusters ?? (granularity === "DATE_TIME");
    if (!shouldCluster) return null;

    const map = new Map<string, TimelineItem[]>();
    filteredItems.forEach((item) => {
      const key = getTimelineDateClusterKey(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([dateLabel, groupItems]) => ({
      dateLabel,
      groupItems,
    }));
  }, [filteredItems, showDateClusters, granularity]);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-dashed p-8 text-center space-y-2",
          isLight
            ? "border-slate-300 bg-slate-50 text-slate-900"
            : "border-slate-700 bg-slate-900/40 text-slate-100"
        )}
      >
        <Sparkles className="w-8 h-8 text-primary mx-auto" />
        <p className="font-serif text-sm font-semibold">Artist Heritage Timeline</p>
        <p className="text-xs text-muted-foreground">
          Add career milestones, exhibitions, awards, or scheduled sessions in the timeline inspector.
        </p>
      </div>
    );
  }

  // Active Layout Mode
  const isHorizontal = layout === "horizontal" || layout === "horizontal-serpentine";
  const isCompact = layout === "compact";
  const isAlternating = layout === "alternating" || (!isHorizontal && !isCompact);

  return (
    <div
      className={cn("w-full py-6 space-y-8 select-text", className)}
      style={{
        ["--timeline-font-heading" as string]: "var(--font-heading, inherit)",
        ["--timeline-font-body" as string]: "var(--font-body, inherit)",
      }}
    >
      {/* Block Header */}
      {(title || subtitle) && (
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
            <Sparkles className="w-3.5 h-3.5" />
            Artist Trajectory &amp; Provenance
          </div>
          {title && (
            <h3
              className={cn(
                "text-2xl sm:text-3xl font-bold tracking-tight",
                isLight ? "text-slate-900" : "text-white"
              )}
              style={{ fontFamily: "var(--timeline-font-heading)" }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className={cn(
                "text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto",
                isLight ? "text-slate-700" : "text-slate-300"
              )}
              style={{ fontFamily: "var(--timeline-font-body)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Category Filter Pills */}
      {showFilters && categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs",
              selectedCategory === "ALL"
                ? isLight
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-amber-500 text-slate-950 font-bold"
                : isLight
                ? "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:text-slate-900"
                : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
            )}
          >
            All Milestones ({items.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs",
                  isSelected
                    ? isLight
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-amber-500 text-slate-950 font-bold"
                    : isLight
                    ? "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:text-slate-900"
                    : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* 1. HORIZONTAL SERPENTINE "Z" LAYOUT */}
      {isHorizontal && (
        <div className="w-full">
          {/* Mobile Fallback: Vertical on screens < 768px */}
          <div className="block md:hidden">
            <VerticalTimelineRail
              items={filteredItems}
              isLight={isLight}
              clusters={clusters}
            />
          </div>

          {/* Desktop Serpentine Grid with Multi-Row 'Z' flow */}
          <div className="hidden md:block w-full">
            <HorizontalSerpentineGrid
              items={filteredItems}
              isLight={isLight}
              itemsPerRow={itemsPerRow}
            />
          </div>
        </div>
      )}

      {/* 2. ALTERNATING VERTICAL TIMELINE */}
      {isAlternating && (
        <div className="relative max-w-5xl mx-auto py-6">
          {clusters ? (
            <div className="space-y-12">
              {clusters.map((cluster) => (
                <div key={cluster.dateLabel} className="space-y-6">
                  {/* Day Anchor Header */}
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        "px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm z-20",
                        isLight
                          ? "bg-slate-900 text-white border-slate-700"
                          : "bg-amber-500 text-slate-950 border-amber-400"
                      )}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {cluster.dateLabel}
                    </div>
                  </div>

                  <AlternatingTimelineList
                    items={cluster.groupItems}
                    isLight={isLight}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AlternatingTimelineList items={filteredItems} isLight={isLight} />
          )}
        </div>
      )}

      {/* 3. COMPACT RAIL TIMELINE */}
      {isCompact && (
        <div className="relative max-w-3xl mx-auto pl-6 border-l-2 border-primary/40 space-y-6">
          {clusters ? (
            <div className="space-y-10">
              {clusters.map((cluster) => (
                <div key={cluster.dateLabel} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider",
                        isLight
                          ? "bg-slate-900 text-white"
                          : "bg-amber-500 text-slate-950"
                      )}
                    >
                      {cluster.dateLabel}
                    </span>
                  </div>
                  <CompactTimelineList
                    items={cluster.groupItems}
                    isLight={isLight}
                  />
                </div>
              ))}
            </div>
          ) : (
            <CompactTimelineList items={filteredItems} isLight={isLight} />
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Milestone Card
// -----------------------------------------------------------------------------
function MilestoneCard({
  item,
  isLight,
  showFullDetails = true,
}: {
  item: TimelineItem;
  isLight: boolean;
  showFullDetails?: boolean;
}) {
  const displayCategory =
    item.customCategory && item.category === "Other"
      ? item.customCategory
      : item.category;
  const IconComponent = categoryIcons[item.category] || Sparkles;
  const temporalStr = formatTimelineTemporalDisplay(item);

  return (
    <div
      className={cn(
        "rounded-2xl p-5 sm:p-6 transition-all duration-200 space-y-3",
        isLight
          ? "bg-white border border-slate-300 text-slate-900 shadow-sm hover:border-amber-500/60 hover:shadow-md"
          : "bg-slate-900/90 border border-slate-700/80 text-white shadow-md hover:border-amber-500/60 hover:shadow-lg"
      )}
    >
      {/* Category Pill & Temporal Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
            isLight
              ? "bg-slate-100 text-slate-800 border-slate-300"
              : "bg-slate-800 text-amber-300 border-slate-700"
          )}
        >
          <IconComponent className="w-2.5 h-2.5" />
          {displayCategory}
        </Badge>

        <span
          className={cn(
            "text-xs font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5",
            isLight
              ? "bg-amber-100 text-amber-900 border-amber-300"
              : "bg-amber-950/70 text-amber-300 border-amber-600/40"
          )}
        >
          {item.granularity === "DATE_TIME" ? (
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          ) : (
            <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          )}
          {temporalStr}
        </span>
      </div>

      {/* Main Title */}
      <h4
        className={cn(
          "font-bold text-base sm:text-lg leading-snug",
          isLight ? "text-slate-900" : "text-white"
        )}
        style={{ fontFamily: "var(--timeline-font-heading)" }}
      >
        {item.title}
      </h4>

      {/* Subtitle / Venue / Speaker */}
      {item.subtitle && (
        <p
          className={cn(
            "text-xs sm:text-sm font-medium",
            isLight ? "text-slate-700" : "text-slate-200"
          )}
          style={{ fontFamily: "var(--timeline-font-body)" }}
        >
          {item.subtitle}
        </p>
      )}

      {/* Location / Room Tag */}
      {item.location && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            isLight ? "text-slate-600" : "text-slate-400"
          )}
        >
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{item.location}</span>
        </div>
      )}

      {/* Description */}
      {showFullDetails && item.description && (
        <p
          className={cn(
            "text-xs sm:text-sm leading-relaxed pt-2 border-t",
            isLight
              ? "text-slate-800 border-slate-200"
              : "text-slate-300 border-slate-800"
          )}
          style={{ fontFamily: "var(--timeline-font-body)" }}
        >
          {item.description}
        </p>
      )}

      {/* Call to Action Link / Button */}
      {item.actionUrl && (
        <div className="pt-2">
          <a
            href={item.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              isLight
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
            )}
          >
            <span>{item.actionLabel || "View Details"}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Horizontal Serpentine Multi-Row 'Z' Grid
// -----------------------------------------------------------------------------
function HorizontalSerpentineGrid({
  items,
  isLight,
  itemsPerRow = 3,
}: {
  items: TimelineItem[];
  isLight: boolean;
  itemsPerRow?: number;
}) {
  const perRow = Math.max(1, Math.min(4, itemsPerRow));

  // Chunk items into rows
  const rows = React.useMemo(() => {
    const res: TimelineItem[][] = [];
    for (let i = 0; i < items.length; i += perRow) {
      res.push(items.slice(i, i + perRow));
    }
    return res;
  }, [items, perRow]);

  return (
    <div className="space-y-12 relative py-4">
      {rows.map((rowItems, rowIdx) => {
        const isOddRow = rowIdx % 2 === 1;
        const hasNextRow = rowIdx < rows.length - 1;

        // Visual order: row 0 is normal (0 -> 1 -> 2), row 1 is reversed (5 <- 4 <- 3)
        const displayItems = isOddRow ? [...rowItems].reverse() : rowItems;

        return (
          <div key={`row-${rowIdx}`} className="relative">
            {/* Horizontal Row Spine */}
            <div
              className={cn(
                "absolute top-6 left-12 right-12 h-1 z-0 rounded-full",
                isLight
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-amber-600/40 via-yellow-400 to-amber-600/40"
              )}
            />

            {/* Row Transition U-Turn SVG Connector */}
            {hasNextRow && (
              <div
                className={cn(
                  "absolute pointer-events-none z-0 hidden lg:block",
                  isOddRow
                    ? "-bottom-12 -left-6 w-12 h-20" // Left-side turn for odd rows
                    : "-bottom-12 -right-6 w-12 h-20" // Right-side turn for even rows
                )}
              >
                <svg
                  className="w-full h-full stroke-amber-500 fill-none"
                  viewBox="0 0 48 80"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  {isOddRow ? (
                    // Curve from bottom-left to next row
                    <path d="M 40,0 C 0,0 0,80 40,80" />
                  ) : (
                    // Curve from bottom-right to next row
                    <path d="M 8,0 C 48,0 48,80 8,80" />
                  )}
                </svg>
              </div>
            )}

            {/* Cards Grid in Row */}
            <div
              className="grid gap-6 relative z-10"
              style={{
                gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`,
              }}
            >
              {displayItems.map((milestone) => {
                const IconComponent =
                  categoryIcons[milestone.category] || Sparkles;

                return (
                  <div key={milestone.id} className="space-y-3 relative">
                    {/* Node Pin Marker */}
                    <div className="flex items-center justify-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center shadow-md z-10",
                          isLight
                            ? "bg-white text-primary shadow-slate-300"
                            : "bg-slate-950 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <MilestoneCard item={milestone} isLight={isLight} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Alternating Timeline List
// -----------------------------------------------------------------------------
function AlternatingTimelineList({
  items,
  isLight,
}: {
  items: TimelineItem[];
  isLight: boolean;
}) {
  return (
    <div className="relative">
      {/* Central Gold Spine */}
      <div
        className={cn(
          "absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 rounded-full",
          isLight
            ? "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400"
            : "bg-gradient-to-b from-amber-500/20 via-yellow-400 to-amber-500/20"
        )}
      />

      <div className="space-y-8 md:space-y-12">
        {items.map((milestone, idx) => {
          const isEven = idx % 2 === 0;
          const IconComponent = categoryIcons[milestone.category] || Sparkles;

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
                  isEven ? "md:text-left md:pl-8" : "md:text-left md:pr-8"
                )}
              >
                <MilestoneCard item={milestone} isLight={isLight} />
              </div>

              {/* Central Node Pin */}
              <div
                className={cn(
                  "absolute left-4 md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center z-10",
                  isLight
                    ? "bg-white text-primary shadow-md shadow-slate-300"
                    : "bg-slate-950 text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                )}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Spacer for other column */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Compact Timeline List
// -----------------------------------------------------------------------------
function CompactTimelineList({
  items,
  isLight,
}: {
  items: TimelineItem[];
  isLight: boolean;
}) {
  return (
    <div className="space-y-6">
      {items.map((milestone) => {
        const IconComponent = categoryIcons[milestone.category] || Sparkles;

        return (
          <div key={milestone.id} className="relative group">
            {/* Node Pin on Left Rail */}
            <div
              className={cn(
                "absolute -left-[33px] top-4 w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center z-10",
                isLight
                  ? "bg-white text-primary shadow-xs"
                  : "bg-slate-950 text-amber-300 shadow-sm"
              )}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>

            <MilestoneCard item={milestone} isLight={isLight} />
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Vertical Timeline Rail (Mobile Fallback)
// -----------------------------------------------------------------------------
function VerticalTimelineRail({
  items,
  isLight,
  clusters,
}: {
  items: TimelineItem[];
  isLight: boolean;
  clusters: { dateLabel: string; groupItems: TimelineItem[] }[] | null;
}) {
  if (clusters) {
    return (
      <div className="relative pl-6 border-l-2 border-primary/40 space-y-8">
        {clusters.map((c) => (
          <div key={c.dateLabel} className="space-y-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-mono font-bold uppercase",
                isLight
                  ? "bg-slate-900 text-white"
                  : "bg-amber-500 text-slate-950"
              )}
            >
              {c.dateLabel}
            </span>
            <CompactTimelineList items={c.groupItems} isLight={isLight} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-primary/40 space-y-6">
      <CompactTimelineList items={items} isLight={isLight} />
    </div>
  );
}

