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
      where: { isDeleted: false },
      orderBy: [{ sortOrder: "asc" }, { displayOrder: "asc" }],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isDeleted: false },
          select: { id: true, name: true, slug: true, displayOrder: true, sortOrder: true, isActive: true, showOnHomepage: true },
          orderBy: [{ sortOrder: "asc" }, { displayOrder: "asc" }],
        },
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
    const {
      name,
      slug,
      parentId,
      description,
      curatorialNote,
      coverImage,
      displayOrder,
      sortOrder,
      isActive,
      showOnHomepage,
      badgeLabel,
      heroTitle,
      bannerHeight,
      overlayOpacity,
      imagePosition,
      borderStyle,
    } = body;

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
        parentId: parentId && parentId !== "none" ? parentId : null,
        description: description || null,
        curatorialNote: curatorialNote || description || null,
        coverImage: coverImage || null,
        displayOrder: displayOrder ?? 0,
        sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder), 10) : (displayOrder ?? 0),
        isActive: isActive !== undefined ? !!isActive : true,
        showOnHomepage: showOnHomepage !== undefined ? !!showOnHomepage : false,
        badgeLabel: badgeLabel || "Traditional Fine Art School",
        heroTitle: heroTitle || null,
        bannerHeight: bannerHeight ? parseInt(String(bannerHeight), 10) : 360,
        overlayOpacity: overlayOpacity !== undefined ? parseFloat(String(overlayOpacity)) : 0.45,
        imagePosition: imagePosition || "center",
        borderStyle: borderStyle || "gold-fillet",
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, displayOrder: true },
        },
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
    const {
      id,
      name,
      slug,
      parentId,
      description,
      curatorialNote,
      coverImage,
      displayOrder,
      sortOrder,
      isActive,
      showOnHomepage,
      badgeLabel,
      heroTitle,
      bannerHeight,
      overlayOpacity,
      imagePosition,
      borderStyle,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    // Prevent circular reference
    if (parentId && parentId === id) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
    }

    const resolvedParentId = parentId && parentId !== "none" ? parentId : null;

    const updated = await prisma.artCategory.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: resolvedParentId,
        description: description !== undefined ? (description || null) : undefined,
        curatorialNote: curatorialNote !== undefined ? (curatorialNote || null) : undefined,
        coverImage: coverImage !== undefined ? (coverImage || null) : undefined,
        displayOrder: displayOrder !== undefined ? displayOrder : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder), 10) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
        showOnHomepage: showOnHomepage !== undefined ? !!showOnHomepage : undefined,
        badgeLabel: badgeLabel !== undefined ? badgeLabel : undefined,
        heroTitle: heroTitle !== undefined ? (heroTitle || null) : undefined,
        bannerHeight: bannerHeight ? parseInt(String(bannerHeight), 10) : undefined,
        overlayOpacity: overlayOpacity !== undefined ? parseFloat(String(overlayOpacity)) : undefined,
        imagePosition: imagePosition || undefined,
        borderStyle: borderStyle || undefined,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, displayOrder: true },
        },
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

    const existing = await prisma.artCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has active artworks
    const artworkCount = await prisma.artwork.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (artworkCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${artworkCount} active artworks are assigned to it.` },
        { status: 409 }
      );
    }

    // Soft delete with slug collision guard
    const deletedSlug = `${existing.slug}-deleted-${Date.now()}`;
    await prisma.artCategory.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        slug: deletedSlug,
      },
    });

    return NextResponse.json({ success: true, message: "Category soft-deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
