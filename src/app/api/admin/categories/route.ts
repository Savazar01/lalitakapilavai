import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.artCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { artworks: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching categories";
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
    const { name, slug, description, coverImage, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Category name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.artCategory.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.artCategory.create({
      data: {
        name,
        slug: cleanSlug,
        description: description || null,
        coverImage: coverImage || null,
        displayOrder: displayOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating category";
    return NextResponse.json({ error: message }, { status: 500 });
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
    const { id, name, slug, description, coverImage, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const updated = await prisma.artCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        coverImage,
        displayOrder,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    // Check if category has artworks
    const artworkCount = await prisma.artwork.count({
      where: { categoryId: id },
    });

    if (artworkCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${artworkCount} artworks are assigned to it.` },
        { status: 409 }
      );
    }

    await prisma.artCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
