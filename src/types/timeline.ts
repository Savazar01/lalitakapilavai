/**
 * Universal Multi-Tenant Timeline & Event Schedule Engine Types
 * Supports both macro-historical career milestones and micro-level event agendas.
 */

export type TimelineGranularity = 
  | "YEAR"
  | "YEAR_MONTH"
  | "DATE"
  | "DATE_TIME";

export type TimelineLayout = 
  | "alternating" 
  | "compact" 
  | "horizontal-serpentine"
  | "horizontal"; // Alias for backward compatibility

export interface TimelineItem {
  id: string;
  title: string;
  category: string;
  customCategory?: string;

  // Temporal Definition
  granularity?: TimelineGranularity;
  period?: string; // Legacy period string
  startDateTime?: string; // ISO string
  endDateTime?: string; // ISO string
  isOngoing?: boolean;
  timezone?: string;
  displayOverride?: string;
  // Content & Context
  subtitle?: string;
  location?: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  sortOrder?: number;
  badgeColor?: string;
}

export type TimelineMilestone = TimelineItem;

export interface TimelineBlockConfig {
  granularity?: TimelineGranularity;
  layout?: TimelineLayout;
  sortDirection?: "asc" | "desc";
  itemsPerRow?: number;
  showCategoryFilter?: boolean;
  showDateClusters?: boolean;
  defaultCategory?: string;
}

export const TIMELINE_CATEGORY_PRESETS = [
  "Exhibition",
  "Solo Show",
  "Group Show",
  "Concert / Recital",
  "Workshop",
  "Masterclass",
  "Keynote",
  "Panel Discussion",
  "Education",
  "Award / Honor",
  "Experience",
  "Upcoming",
  "Other",
] as const;

export function getTimelineItemTimestamp(item: TimelineItem): number {
  if (item.startDateTime) {
    const parsed = new Date(item.startDateTime).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  if (item.period) {
    const match = item.period.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const year = parseInt(match[1], 10);
      return new Date(year, 0, 1).getTime();
    }
  }

  return 0;
}

export function sortTimelineItems(
  items: TimelineItem[],
  direction: "asc" | "desc" = "desc"
): TimelineItem[] {
  return [...items].sort((a, b) => {
    if (direction === "desc") {
      if (a.isOngoing && !b.isOngoing) return -1;
      if (!a.isOngoing && b.isOngoing) return 1;
    }

    const tA = getTimelineItemTimestamp(a);
    const tB = getTimelineItemTimestamp(b);

    if (tA !== tB) {
      return direction === "asc" ? tA - tB : tB - tA;
    }

    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    return orderA - orderB;
  });
}

export function formatTimelineTemporalDisplay(item: TimelineItem): string {
  if (item.displayOverride && item.displayOverride.trim()) {
    return item.displayOverride;
  }

  const gran = item.granularity || "YEAR";

  if (gran === "YEAR") {
    if (item.isOngoing) {
      const startYear = item.startDateTime ? new Date(item.startDateTime).getFullYear() : (item.period || "");
      return `${startYear ? `${startYear} – ` : ""}Present`;
    }
    if (item.startDateTime) {
      const startY = new Date(item.startDateTime).getFullYear();
      if (item.endDateTime) {
        const endY = new Date(item.endDateTime).getFullYear();
        return startY === endY ? String(startY) : `${startY} – ${endY}`;
      }
      return String(startY);
    }
    return item.period || "Current";
  }

  if (gran === "YEAR_MONTH") {
    if (item.startDateTime) {
      const date = new Date(item.startDateTime);
      const startStr = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (item.isOngoing) return `${startStr} – Present`;
      if (item.endDateTime) {
        const endStr = new Date(item.endDateTime).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return `${startStr} – ${endStr}`;
      }
      return startStr;
    }
    return item.period || "Current";
  }

  if (gran === "DATE") {
    if (item.startDateTime) {
      const date = new Date(item.startDateTime);
      const startStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (item.endDateTime) {
        const endStr = new Date(item.endDateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
      }
      return startStr;
    }
    return item.period || "Current";
  }

  if (gran === "DATE_TIME") {
    if (item.startDateTime) {
      const startDate = new Date(item.startDateTime);
      const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const startTime = startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const tz = item.timezone ? ` ${item.timezone.split("/")[1] || item.timezone}` : "";

      if (item.endDateTime) {
        const endDate = new Date(item.endDateTime);
        const endTime = endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        return `${dateStr} | ${startTime} – ${endTime}${tz}`;
      }

      return `${dateStr} | ${startTime}${tz}`;
    }
    return item.period || "Scheduled";
  }

  return item.period || "";
}

export function getTimelineDateClusterKey(item: TimelineItem): string {
  if (item.startDateTime) {
    try {
      const d = new Date(item.startDateTime);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      }
    } catch {
      // fallback
    }
  }
  return item.period || "General Timeline";
}

