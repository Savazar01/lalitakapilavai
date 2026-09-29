import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const slugsParam = searchParams.get("slugs");

    const ids = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const slugs = slugsParam ? slugsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

    if (ids.length === 0 && slugs.length === 0) {
      return NextResponse.json([]);
    }

    const conditions: Array<{ id?: { in: string[] }; slug?: { in: string[] } }> = [];
    if (ids.length > 0) conditions.push({ id: { in: ids } });
    if (slugs.length > 0) conditions.push({ slug: { in: slugs } });

    const artworks = await prisma.artwork.findMany({
      where: {
        OR: conditions,
        isDeleted: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        medium: true,
        dimensions: true,
        yearCreated: true,
        description: true,
        primaryImageUrl: true,
        watermarkedWebpUrl: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(artworks);
  } catch (error) {
    console.error("Error in /api/artworks/resolve:", error);
    return NextResponse.json([], { status: 500 });
  }
}
