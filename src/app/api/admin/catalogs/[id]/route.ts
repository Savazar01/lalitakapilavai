import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return null;
  }
  return session;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const catalog = await prisma.eCatalog.findUnique({
      where: { id },
      include: {
        event: true,
        customPages: {
          orderBy: { pageNumber: "asc" },
        },
        items: {
          orderBy: { pageNumber: "asc" },
          include: {
            artwork: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!catalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    return NextResponse.json(catalog);
  } catch (error: unknown) {
    console.error("[API_ADMIN_CATALOG_GET_ID_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      slug,
      subtitle,
      curatorialEssay,
      forewordBy,
      coverImageUrl,
      themeColor,
      orientation,
      plateLayout,
      themeConfig,
      coverConfig,
      essayConfig,
      endPageConfig,
      isPublished,
      downloadablePdfUrl,
      eventId,
      customPages, // array of { id?, pageNumber, title, subtitle, pageLayout, contentHtml, frameStyle, backgroundImage, backgroundColor }
      items, // array of { id?, artworkId, pageNumber, curatorialNote, highlightPlate }
    } = body;

    const existing = await prisma.eCatalog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    let cleanSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slugConflict = await prisma.eCatalog.findFirst({
        where: { slug: cleanSlug, NOT: { id } },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "Another catalog already uses this slug" },
          { status: 400 }
        );
      }
    }

    // Update catalog core metadata
    await prisma.eCatalog.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: cleanSlug,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        curatorialEssay: curatorialEssay !== undefined ? curatorialEssay : existing.curatorialEssay,
        forewordBy: forewordBy !== undefined ? forewordBy : existing.forewordBy,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : existing.coverImageUrl,
        themeColor: themeColor !== undefined ? themeColor : existing.themeColor,
        orientation: orientation !== undefined ? orientation : (existing.orientation || "portrait"),
        plateLayout: plateLayout !== undefined ? plateLayout : (existing.plateLayout || "SIDE_BY_SIDE"),
        themeConfig: themeConfig !== undefined ? themeConfig : existing.themeConfig,
        coverConfig: coverConfig !== undefined ? coverConfig : existing.coverConfig,
        essayConfig: essayConfig !== undefined ? essayConfig : existing.essayConfig,
        endPageConfig: endPageConfig !== undefined ? endPageConfig : existing.endPageConfig,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
        downloadablePdfUrl: downloadablePdfUrl !== undefined ? downloadablePdfUrl : existing.downloadablePdfUrl,
        eventId: eventId !== undefined ? (eventId || null) : existing.eventId,
      },
    });

    // If customPages array provided, synchronize eCatalogCustomPage entries
    if (Array.isArray(customPages)) {
      await prisma.$transaction(async (tx) => {
        await tx.eCatalogCustomPage.deleteMany({
          where: { catalogId: id },
        });

        if (customPages.length > 0) {
          await tx.eCatalogCustomPage.createMany({
            data: customPages.map((page: {
              pageNumber?: number;
              title?: string;
              subtitle?: string;
              layoutType?: string;
              pageLayout?: string;
              contentHtml?: string;
              sections?: unknown;
              segments?: unknown;
              backgroundType?: string;
              backgroundColor?: string;
              backgroundPattern?: string;
              patternOpacity?: number;
              backgroundImage?: string;
              overlayOpacity?: number;
              frameStyle?: string;
            }, idx: number) => {
              const layoutType = page.layoutType || page.pageLayout || "2_COL";
              let contentHtml = page.contentHtml || null;
              if (!contentHtml && Array.isArray(page.segments) && page.segments.length > 0) {
                contentHtml = page.segments
                  .map((s: { contentHtml?: string }) => s.contentHtml || "")
                  .filter(Boolean)
                  .join("");
              }

              return {
                catalogId: id,
                pageNumber: typeof page.pageNumber === "number" ? page.pageNumber : idx + 1,
                title: page.title ? page.title.trim() : null,
                subtitle: page.subtitle ? page.subtitle.trim() : null,
                layoutType,
                pageLayout: layoutType,
                contentHtml,
                sections: page.sections !== undefined ? (page.sections as unknown as Prisma.InputJsonValue) : undefined,
                segments: page.segments !== undefined ? (page.segments as unknown as Prisma.InputJsonValue) : undefined,
                backgroundType: page.backgroundType || "COLOR",
                backgroundColor: page.backgroundColor || "#FAF7F2",
                backgroundPattern: page.backgroundPattern || null,
                patternOpacity: typeof page.patternOpacity === "number" ? page.patternOpacity : 0.15,
                backgroundImage: page.backgroundImage || null,
                overlayOpacity: typeof page.overlayOpacity === "number" ? page.overlayOpacity : 0.2,
                frameStyle: page.frameStyle || "gold-fillet",
              };
            }),
          });
        }
      });
    }

    // If items array provided, synchronize eCatalogItem entries
    if (Array.isArray(items)) {
      // Transaction to replace or update plates
      await prisma.$transaction(async (tx) => {
        // Remove existing items
        await tx.eCatalogItem.deleteMany({
          where: { catalogId: id },
        });

        // Re-insert sorted plates
        if (items.length > 0) {
          await tx.eCatalogItem.createMany({
            data: items.map((item: {
              artworkId: string;
              pageNumber?: number;
              curatorialNote?: string;
              highlightPlate?: boolean;
              plateLayout?: string;
              customTitle?: string;
              customSubtitle?: string;
              showPlateNumber?: boolean;
            }, idx: number) => ({
              catalogId: id,
              artworkId: item.artworkId,
              pageNumber: typeof item.pageNumber === "number" ? item.pageNumber : idx + 1,
              curatorialNote: item.curatorialNote || null,
              highlightPlate: Boolean(item.highlightPlate),
              plateLayout: item.plateLayout || null,
              customTitle: item.customTitle ? item.customTitle.trim() : null,
              customSubtitle: item.customSubtitle ? item.customSubtitle.trim() : null,
              showPlateNumber: item.showPlateNumber !== false,
            })),
          });
        }
      });
    }

    // Fetch and return the updated catalog
    const updated = await prisma.eCatalog.findUnique({
      where: { id },
      include: {
        event: true,
        customPages: {
          orderBy: { pageNumber: "asc" },
        },
        items: {
          orderBy: { pageNumber: "asc" },
          include: {
            artwork: {
              include: { category: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[API_ADMIN_CATALOG_PUT_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update catalog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.eCatalog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    await prisma.eCatalog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Catalog deleted successfully" });
  } catch (error: unknown) {
    console.error("[API_ADMIN_CATALOG_DELETE_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete catalog" },
      { status: 500 }
    );
  }
}
