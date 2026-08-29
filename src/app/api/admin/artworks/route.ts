import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateAndStoreArtworkQR } from "@/lib/qr";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isAvailable = searchParams.get("isAvailable");
    const isFeatured = searchParams.get("isFeatured");
    const q = searchParams.get("q");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    if (isAvailable !== null && isAvailable !== undefined && isAvailable !== "") {
      where.isAvailable = isAvailable === "true";
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
      where.isFeatured = isFeatured === "true";
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { medium: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const artworks = await prisma.artwork.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: {
            events: true,
            leads: true,
          },
        },
      },
    });

    return NextResponse.json(artworks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching artworks";
    return NextResponse.json({ error: message }, { status: 500 });
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
      slug,
      categoryId,
      description,
      dimensions,
      medium,
      yearCreated,
      hasGoldFoil,
      goldPurity,
      price,
      isAvailable,
      isFeatured,
      primaryImageUrl,
      watermarkedWebpUrl,
      protectedS3Key,
    } = body;

    if (!title || !slug || !categoryId || !primaryImageUrl) {
      return NextResponse.json(
        { error: "Title, slug, category, and primary image are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.artwork.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An artwork with this URL slug already exists" },
        { status: 409 }
      );
    }

    // Auto-generate high-res Exhibition QR Code pointing to /artwork/[slug]?qr=true
    await generateAndStoreArtworkQR(cleanSlug).catch((err) => {
      console.warn("QR generation background notice:", err);
    });

    const artwork = await prisma.artwork.create({
      data: {
        title,
        slug: cleanSlug,
        categoryId,
        description: description || "",
        dimensions: dimensions || "24 x 36 inches",
        medium: medium || "22k Gold Foil, Teakwood, Semi-Precious Gemstones",
        yearCreated: parseInt(yearCreated, 10) || new Date().getFullYear(),
        hasGoldFoil: !!hasGoldFoil,
        goldPurity: goldPurity || (hasGoldFoil ? "22 Carat Jaipur Gold Leaf" : null),
        price: price ? parseFloat(price) : null,
        currency: body.currency || "INR",
        isAvailable: isAvailable !== undefined ? !!isAvailable : true,
        isFeatured: !!isFeatured,
        primaryImageUrl,
        watermarkedWebpUrl: watermarkedWebpUrl || primaryImageUrl,
        protectedS3Key: protectedS3Key || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(artwork, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating artwork";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
