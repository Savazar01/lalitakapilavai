import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    if (!prisma.dashboardWidget?.findMany) {
      return NextResponse.json([]);
    }

    const widgets = await prisma.dashboardWidget.findMany({
      where: includeArchived ? {} : { isArchived: false },
      orderBy: { order: "asc" },
    });

    // Compute live metric counts for dynamic metric sources
    const [
      artworksCount,
      categoriesCount,
      eventsCount,
      leadsCount,
      rsvpsCount,
      catalogsCount,
      pagesCount,
      postsCount,
      activeEvents,
    ] = await Promise.all([
      prisma.artwork.count({ where: { isDeleted: false } }).catch(() => 0),
      prisma.artCategory.count({ where: { isDeleted: false } }).catch(() => 0),
      prisma.event.count({ where: { isDeleted: false } }).catch(() => 0),
      prisma.lead.count().catch(() => 0),
      prisma.eventRegistration.count().catch(() => 0),
      prisma.eCatalog.count({ where: { isDeleted: false } }).catch(() => 0),
      prisma.page.count({ where: { isDeleted: false } }).catch(() => 0),
      prisma.blogPost.count().catch(() => 0),
      prisma.event
        .findMany({
          where: { isDeleted: false },
          select: { id: true, _count: { select: { registrations: true } } },
        })
        .catch(() => []),
    ]);

    const eventRegistrationMap = new Map<string, number>();
    for (const e of activeEvents) {
      eventRegistrationMap.set(e.id, e._count?.registrations ?? 0);
    }

    const metricMap: Record<string, number> = {
      "count:artworks": artworksCount,
      "count:categories": categoriesCount,
      "count:events": eventsCount,
      "count:leads": leadsCount,
      "count:event_rsvps": rsvpsCount,
      "count:catalogs": catalogsCount,
      "count:pages": pagesCount,
      "count:posts": postsCount,
    };

    const targetUrlMetricFallback: Record<string, number> = {
      "/admin/artworks": artworksCount,
      "/admin/categories": categoriesCount,
      "/admin/events": eventsCount,
      "/admin/leads": leadsCount,
      "/admin/catalogs": catalogsCount,
      "/admin/pages": pagesCount,
      "/admin/posts": postsCount,
    };

    const enrichedWidgets = widgets.map((w) => {
      let resolvedCount: string | number | null = null;

      if (w.metricSource && w.metricSource !== "static:manual") {
        if (w.metricSource === "count:event_specific_rsvp" && w.metricFilterId) {
          resolvedCount = eventRegistrationMap.get(w.metricFilterId) ?? 0;
        } else if (w.metricSource.startsWith("count:event_rsvps:") && w.metricFilterId) {
          resolvedCount = eventRegistrationMap.get(w.metricFilterId) ?? 0;
        } else if (metricMap[w.metricSource] !== undefined) {
          resolvedCount = metricMap[w.metricSource];
        }
      }

      if (resolvedCount === null && w.targetUrl && targetUrlMetricFallback[w.targetUrl] !== undefined) {
        resolvedCount = targetUrlMetricFallback[w.targetUrl];
      }

      const displayMetric =
        resolvedCount !== null
          ? String(resolvedCount)
          : w.metricValue || "-";

      return {
        ...w,
        computedMetric: displayMetric,
        computedSub: w.metricSub || "",
      };
    });

    return NextResponse.json(enrichedWidgets);
  } catch (error) {
    console.error("Failed to fetch dashboard widgets:", error);
    return NextResponse.json({ error: "Failed to fetch widgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      widgetType,
      metricValue,
      metricSub,
      targetUrl,
      iconName,
      metricSource,
      metricFilterId,
    } = body;

    if (!title || !widgetType) {
      return NextResponse.json({ error: "Title and widgetType are required" }, { status: 400 });
    }

    const highestOrder = await prisma.dashboardWidget.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (highestOrder?.order ?? 0) + 1;

    const widget = await prisma.dashboardWidget.create({
      data: {
        title,
        description: description || null,
        widgetType: widgetType || "STAT_CARD",
        metricValue: metricValue || null,
        metricSub: metricSub || null,
        targetUrl: targetUrl || null,
        iconName: iconName || "Sparkles",
        metricSource: metricSource || "static:manual",
        metricFilterId: metricFilterId || null,
        order: newOrder,
        isArchived: false,
      },
    });

    return NextResponse.json(widget);
  } catch (error) {
    console.error("Failed to create widget:", error);
    return NextResponse.json({ error: "Failed to create widget" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; order: number }> };

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.dashboardWidget.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder widgets:", error);
    return NextResponse.json({ error: "Failed to reorder widgets" }, { status: 500 });
  }
}
