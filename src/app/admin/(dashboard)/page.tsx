import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { DashboardLayoutManager, DashboardWidgetData } from "@/components/admin/dashboard-layout-manager";
import { EditablePageHeader } from "@/components/admin/editable-page-header";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    artworkCount,
    categoryCount,
    eventCount,
    leadCount,
    ragaCount,
    rawWidgets,
  ] = await Promise.all([
    prisma.artwork.count().catch(() => 0),
    prisma.artCategory.count().catch(() => 0),
    prisma.event.count().catch(() => 0),
    prisma.lead.count().catch(() => 0),
    prisma.raga.count().catch(() => 0),
    prisma.dashboardWidget?.findMany
      ? prisma.dashboardWidget
          .findMany({
            where: { isArchived: false },
            orderBy: { order: "asc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const liveCounts: Record<string, { value: number | string; sub?: string }> = {
    "/admin/artworks": { value: artworkCount, sub: `${categoryCount} Traditional art categories` },
    "/admin/events": { value: eventCount, sub: "Workshops & gallery recitals" },
    "/admin/leads": { value: leadCount, sub: "Gallery inquiries & collector requests" },
    "/admin/music": { value: ragaCount, sub: "Synesthetic cultural graph nodes" },
  };

  let initialWidgets: DashboardWidgetData[] = [];

  if (rawWidgets && rawWidgets.length > 0) {
    initialWidgets = rawWidgets.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      widgetType: w.widgetType,
      metricValue: w.metricValue,
      metricSub: w.metricSub,
      targetUrl: w.targetUrl,
      iconName: w.iconName,
      order: w.order,
      isArchived: w.isArchived,
      computedMetric:
        w.widgetType === "STAT_CARD" && w.targetUrl && liveCounts[w.targetUrl]
          ? String(liveCounts[w.targetUrl].value)
          : w.metricValue || "-",
      computedSub:
        w.widgetType === "STAT_CARD" && w.targetUrl && liveCounts[w.targetUrl]
          ? liveCounts[w.targetUrl].sub
          : w.metricSub || "",
    }));
  } else {
    // Default fallback initial widgets before first seed
    initialWidgets = [
      {
        id: "default-1",
        title: "Artworks Catalog",
        widgetType: "STAT_CARD",
        targetUrl: "/admin/artworks",
        iconName: "Palette",
        order: 1,
        isArchived: false,
        computedMetric: String(artworkCount),
        computedSub: `${categoryCount} Traditional art categories`,
      },
      {
        id: "default-2",
        title: "Exhibitions & Events",
        widgetType: "STAT_CARD",
        targetUrl: "/admin/events",
        iconName: "Calendar",
        order: 2,
        isArchived: false,
        computedMetric: String(eventCount),
        computedSub: "Workshops & gallery recitals",
      },
      {
        id: "default-3",
        title: "Inbound Leads & QR CRM",
        widgetType: "STAT_CARD",
        targetUrl: "/admin/leads",
        iconName: "Users",
        order: 3,
        isArchived: false,
        computedMetric: String(leadCount),
        computedSub: "Gallery inquiries & collector requests",
      },
      {
        id: "default-4",
        title: "Carnatic Ragas & Music",
        widgetType: "STAT_CARD",
        targetUrl: "/admin/music",
        iconName: "Music",
        order: 4,
        isArchived: false,
        computedMetric: String(ragaCount),
        computedSub: "Synesthetic cultural graph nodes",
      },
      {
        id: "default-5",
        title: "System Health & Services",
        widgetType: "SYSTEM_STATUS",
        order: 5,
        isArchived: false,
        description: "Live configuration status of containerized services.",
      },
      {
        id: "default-6",
        title: "Quick Operations",
        widgetType: "QUICK_LINK",
        targetUrl: "/admin/artworks",
        metricSub: "Add New Tanjore or Mysore Artwork",
        iconName: "Database",
        order: 6,
        isArchived: false,
        description: "Direct access to common curation tasks.",
      },
    ];
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <EditablePageHeader
          sectionKey="overview"
          defaultTitle="Welcome to Lalita Kapilavai Archive"
          defaultSubtitle="Manage your sacred artwork catalog with 22k gold specifications, dynamic watermarked assets, exhibitions, physical QR scan leads, and Carnatic music synesthetic models."
          badgeLabel="Administrative Overview"
          className="border-b-0 pb-0"
        >
          <Badge variant="outline" className="shrink-0 text-xs px-3 py-1 font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold">
            PostgreSQL 17 :5633 • Web :3060
          </Badge>
        </EditablePageHeader>
      </div>

      {/* Dynamic Customizable Layout Manager */}
      <DashboardLayoutManager initialWidgets={initialWidgets} />
    </div>
  );
}
