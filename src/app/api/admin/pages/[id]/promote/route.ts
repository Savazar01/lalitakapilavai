import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const targetPage = await prisma.page.findUnique({
      where: { id, isDeleted: false },
    });

    if (!targetPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Atomically reset existing homepage and promote the target page
    const updatedPage = await prisma.$transaction(async (tx) => {
      await tx.page.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false },
      });

      return tx.page.update({
        where: { id },
        data: {
          isHomepage: true,
          isPublished: true,
          isActive: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Page "${updatedPage.title}" successfully promoted to active Homepage.`,
      page: updatedPage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error promoting page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const updatedPage = await prisma.page.update({
      where: { id },
      data: { isHomepage: false },
    });

    return NextResponse.json({
      success: true,
      message: `Page "${updatedPage.title}" demoted from Homepage. Default fallback restored.`,
      page: updatedPage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error demoting page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
