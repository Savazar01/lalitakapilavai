import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        category: true,
        events: {
          include: {
            event: true,
          },
        },
        ragaLinks: {
          include: {
            raga: true,
          },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json(artwork);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching artwork";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId,
        description,
        dimensions,
        medium,
        yearCreated: yearCreated ? parseInt(yearCreated, 10) : undefined,
        hasGoldFoil: hasGoldFoil !== undefined ? !!hasGoldFoil : undefined,
        goldPurity,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        isAvailable: isAvailable !== undefined ? !!isAvailable : undefined,
        isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
        primaryImageUrl,
        watermarkedWebpUrl,
        protectedS3Key,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating artwork";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.artwork.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting artwork";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
