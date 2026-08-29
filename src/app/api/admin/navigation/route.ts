import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MenuPosition } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") as MenuPosition | null;

    const where = position ? { position, parentId: null } : { parentId: null };

    // Fetch top-level menu items with 2 levels of nested children
    const items = await prisma.menuItem.findMany({
      where,
      orderBy: { orderIndex: "asc" },
      include: {
        children: {
          orderBy: { orderIndex: "asc" },
          include: {
            children: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching menu";
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
    const { label, path, position, parentId, openInNewTab, iconName } = body;

    if (!label || !path) {
      return NextResponse.json(
        { error: "Label and path are required" },
        { status: 400 }
      );
    }

    // Determine next orderIndex
    const lastItem = await prisma.menuItem.findFirst({
      where: {
        position: position || MenuPosition.TOP_CENTER,
        parentId: parentId || null,
      },
      orderBy: { orderIndex: "desc" },
    });

    const nextOrder = (lastItem?.orderIndex ?? 0) + 1;

    const newItem = await prisma.menuItem.create({
      data: {
        label,
        path,
        position: position || MenuPosition.TOP_CENTER,
        parentId: parentId || null,
        orderIndex: nextOrder,
        openInNewTab: !!openInNewTab,
        iconName: iconName || null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating menu item";
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

    // Check if updating single item or reordering hierarchy
    if (body.id) {
      const { id, label, path, openInNewTab, isActive, orderIndex, parentId } = body;
      const updated = await prisma.menuItem.update({
        where: { id },
        data: {
          label,
          path,
          openInNewTab,
          isActive,
          orderIndex,
          parentId,
        },
      });
      return NextResponse.json(updated);
    }

    // Bulk reordering payload
    if (Array.isArray(body.items)) {
      await prisma.$transaction(
        body.items.map((item: { id: string; orderIndex: number; parentId?: string | null }) =>
          prisma.menuItem.update({
            where: { id: item.id },
            data: {
              orderIndex: item.orderIndex,
              parentId: item.parentId !== undefined ? item.parentId : undefined,
            },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating menu";
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
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting menu item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
