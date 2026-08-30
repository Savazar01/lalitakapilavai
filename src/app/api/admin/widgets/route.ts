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

    const widgets = await prisma.dashboardWidget.findMany({
      where: includeArchived ? {} : { isArchived: false },
      orderBy: { order: "asc" },
    });

    // Compute live metric counts for standard system cards
    const [artworks, categories, events, leads, ragas, posts, pages] = await Promise.all([
      prisma.artwork.count().catch(() => 0),
      prisma.artCategory.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.lead.count().catch(() => 0),
      prisma.raga.count().catch(() => 0),
      prisma.blogPost.count().catch(() => 0),
      prisma.page.count().catch(() => 0),
    ]);

    const liveCounts: Record<string, { value: number | string; sub?: string }> = {
      "/admin/artworks": { value: artworks, sub: `${categories} Traditional categories` },
      "/admin/events": { value: events, sub: "Workshops & gallery recitals" },
      "/admin/leads": { value: leads, sub: "Gallery inquiries & collector requests" },
      "/admin/music": { value: ragas, sub: "Synesthetic cultural graph nodes" },
      "/admin/posts": { value: posts, sub: "Published chronicles & articles" },
      "/admin/pages": { value: pages, sub: "Curated layout pages" },
    };

    const enrichedWidgets = widgets.map((w) => {
      if (w.widgetType === "STAT_CARD" && w.targetUrl && liveCounts[w.targetUrl]) {
        return {
          ...w,
          computedMetric: w.metricValue || String(liveCounts[w.targetUrl].value),
          computedSub: w.metricSub || liveCounts[w.targetUrl].sub,
        };
      }
      return {
        ...w,
        computedMetric: w.metricValue || "-",
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
    const { title, description, widgetType, metricValue, metricSub, targetUrl, iconName } = body;

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
