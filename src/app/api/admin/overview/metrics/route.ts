import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          select: {
            id: true,
            title: true,
            _count: { select: { registrations: true } },
          },
          orderBy: { startDate: "desc" },
        })
        .catch(() => []),
    ]);

    return NextResponse.json({
      metrics: {
        "count:artworks": artworksCount,
        "count:categories": categoriesCount,
        "count:events": eventsCount,
        "count:leads": leadsCount,
        "count:event_rsvps": rsvpsCount,
        "count:catalogs": catalogsCount,
        "count:pages": pagesCount,
        "count:posts": postsCount,
      },
      eventMetrics: activeEvents.map((e) => ({
        id: e.id,
        title: e.title,
        sourceKey: `count:event_rsvps:${e.id}`,
        count: e._count?.registrations ?? 0,
      })),
      events: activeEvents.map((e) => ({
        id: e.id,
        title: e.title,
      })),
    });
  } catch (error) {
    console.error("Failed to calculate overview metrics:", error);
    return NextResponse.json(
      { error: "Failed to calculate overview metrics" },
      { status: 500 }
    );
  }
}
