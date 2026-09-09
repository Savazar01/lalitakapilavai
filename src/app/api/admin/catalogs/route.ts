import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

export async function GET(req: NextRequest) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    const catalogs = await prisma.eCatalog.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: { id: true, title: true, venue: true, city: true, startDate: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json(catalogs);
  } catch (error: unknown) {
    console.error("[API_ADMIN_CATALOGS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await checkAdminAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      subtitle,
      curatorialEssay,
      forewordBy,
      coverImageUrl,
      themeColor,
      isPublished,
      downloadablePdfUrl,
      eventId,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.eCatalog.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A catalog with this slug already exists" },
        { status: 400 }
      );
    }

    const newCatalog = await prisma.eCatalog.create({
      data: {
        title,
        slug: cleanSlug,
        subtitle: subtitle || null,
        curatorialEssay: curatorialEssay || null,
        forewordBy: forewordBy || null,
        coverImageUrl: coverImageUrl || null,
        themeColor: themeColor || "gold",
        isPublished: Boolean(isPublished),
        downloadablePdfUrl: downloadablePdfUrl || null,
        eventId: eventId || null,
      },
    });

    return NextResponse.json(newCatalog, { status: 201 });
  } catch (error: unknown) {
    console.error("[API_ADMIN_CATALOGS_POST_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create catalog" },
      { status: 500 }
    );
  }
}
