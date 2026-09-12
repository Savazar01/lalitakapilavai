import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sanitizeDetailedThemeConfig, DetailedThemeConfig } from "@/lib/theme-config";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findFirst({
      select: { themeConfig: true },
    });
    return NextResponse.json({ themeConfig: settings?.themeConfig ?? null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching theme config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const existing = await prisma.systemSetting.findFirst();

    let themeConfig: DetailedThemeConfig | null = null;

    if (body.themeConfig === null) {
      // Explicit reset to system defaults
      themeConfig = null;
    } else if (body.themeConfig && typeof body.themeConfig === "object") {
      themeConfig = sanitizeDetailedThemeConfig(body.themeConfig);
    }

    let updated;
    if (existing) {
      updated = await prisma.systemSetting.update({
        where: { id: existing.id },
        data: { themeConfig: themeConfig !== null ? JSON.parse(JSON.stringify(themeConfig)) : null },
      });
    } else {
      updated = await prisma.systemSetting.create({
        data: { themeConfig: themeConfig !== null ? JSON.parse(JSON.stringify(themeConfig)) : null },
      });
    }

    // Revalidate paths so DynamicThemeProvider instantly picks up the new tokens
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/(public)", "layout");
      revalidatePath("/admin", "layout");
    } catch (revErr) {
      console.warn("Theme cache revalidation notice:", revErr);
    }

    return NextResponse.json({ themeConfig: updated.themeConfig });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error saving theme config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
