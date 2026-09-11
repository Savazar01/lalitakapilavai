import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mergeAdminConfig, AdminPortalConfig } from "@/lib/admin-config";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setting = await prisma.systemSetting.findFirst({
      select: { adminConfig: true },
    });

    const config = mergeAdminConfig(setting?.adminConfig);
    return NextResponse.json(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching admin copy config";
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
    let setting = await prisma.systemSetting.findFirst();

    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          siteName: "Lalita Kapilavai — Sacred Art & Carnatic Music Archive",
        },
      });
    }

    const currentConfig = mergeAdminConfig(setting.adminConfig);
    let updatedConfig: AdminPortalConfig = { ...currentConfig };

    // Case 1: Targeted single section heading update from EditablePageHeader
    if (body.sectionKey && body.heading) {
      updatedConfig = {
        ...currentConfig,
        pageHeadings: {
          ...currentConfig.pageHeadings,
          [body.sectionKey]: {
            ...currentConfig.pageHeadings[body.sectionKey],
            title: body.heading.title !== undefined ? body.heading.title : currentConfig.pageHeadings[body.sectionKey]?.title || "",
            subtitle: body.heading.subtitle !== undefined ? body.heading.subtitle : currentConfig.pageHeadings[body.sectionKey]?.subtitle || "",
            badge: body.heading.badge !== undefined ? body.heading.badge : currentConfig.pageHeadings[body.sectionKey]?.badge,
          },
        },
      };
    } else {
      // Case 2: General update from Settings page (dashboard title, sidebar labels, etc.)
      updatedConfig = {
        dashboardTitle: typeof body.dashboardTitle === "string" ? body.dashboardTitle : currentConfig.dashboardTitle,
        sidebarBrandTitle: typeof body.sidebarBrandTitle === "string" ? body.sidebarBrandTitle : currentConfig.sidebarBrandTitle,
        sidebarBrandSubtitle: typeof body.sidebarBrandSubtitle === "string" ? body.sidebarBrandSubtitle : currentConfig.sidebarBrandSubtitle,
        sidebarLabels: {
          ...currentConfig.sidebarLabels,
          ...(body.sidebarLabels && typeof body.sidebarLabels === "object" ? body.sidebarLabels : {}),
        },
        pageHeadings: {
          ...currentConfig.pageHeadings,
          ...(body.pageHeadings && typeof body.pageHeadings === "object" ? body.pageHeadings : {}),
        },
      };
    }

    const saved = await prisma.systemSetting.update({
      where: { id: setting.id },
      data: {
        adminConfig: updatedConfig as unknown as object,
      },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
    } catch {
      // Ignore cache revalidation warnings
    }

    return NextResponse.json(mergeAdminConfig(saved.adminConfig));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error saving admin copy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
