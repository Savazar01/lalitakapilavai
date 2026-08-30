import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!prisma.dashboardWidget?.update) {
      return NextResponse.json({ error: "Dashboard widgets service temporarily unavailable" }, { status: 503 });
    }

    const widget = await prisma.dashboardWidget.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        widgetType: body.widgetType,
        metricValue: body.metricValue,
        metricSub: body.metricSub,
        targetUrl: body.targetUrl,
        iconName: body.iconName,
        order: body.order,
        isArchived: body.isArchived,
      },
    });

    return NextResponse.json(widget);
  } catch (error) {
    console.error("Failed to update widget:", error);
    return NextResponse.json({ error: "Failed to update widget" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    if (!prisma.dashboardWidget?.delete || !prisma.dashboardWidget?.update) {
      return NextResponse.json({ error: "Dashboard widgets service temporarily unavailable" }, { status: 503 });
    }

    if (hardDelete) {
      await prisma.dashboardWidget.delete({ where: { id } });
    } else {
      await prisma.dashboardWidget.update({
        where: { id },
        data: { isArchived: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete widget:", error);
    return NextResponse.json({ error: "Failed to delete widget" }, { status: 500 });
  }
}
