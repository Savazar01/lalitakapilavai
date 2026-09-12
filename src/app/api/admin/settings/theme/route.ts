import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Allowed public token keys — strictly scoped to :root and .dark (no admin-scope)
const ALLOWED_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--border",
  "--muted-foreground",
  "--primary",
  "--primary-foreground",
];

function sanitizeTokenSet(raw: Record<string, string>): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const key of ALLOWED_TOKENS) {
    if (raw[key] && typeof raw[key] === "string") {
      // Only accept valid hex colors or css color strings (basic safety check)
      const val = raw[key].trim();
      if (val.length > 0 && val.length <= 100) {
        safe[key] = val;
      }
    }
  }
  return safe;
}

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

    let themeConfig: Record<string, Record<string, string>> | null = null;

    if (body.themeConfig === null) {
      // Explicit reset to defaults
      themeConfig = null;
    } else if (body.themeConfig && typeof body.themeConfig === "object") {
      themeConfig = {
        light: sanitizeTokenSet((body.themeConfig.light as Record<string, string>) || {}),
        dark: sanitizeTokenSet((body.themeConfig.dark as Record<string, string>) || {}),
      };
      // If both are empty objects after sanitization, treat as null (defaults)
      if (
        Object.keys(themeConfig.light).length === 0 &&
        Object.keys(themeConfig.dark).length === 0
      ) {
        themeConfig = null;
      }
    }

    let updated;
    if (existing) {
      updated = await prisma.systemSetting.update({
        where: { id: existing.id },
        data: { themeConfig: themeConfig ?? undefined },
      });
    } else {
      updated = await prisma.systemSetting.create({
        data: { themeConfig: themeConfig ?? undefined },
      });
    }

    // Revalidate entire site so DynamicThemeProvider picks up the new tokens
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/(public)", "layout");
    } catch (revErr) {
      console.warn("Theme cache revalidation notice:", revErr);
    }

    return NextResponse.json({ themeConfig: updated.themeConfig });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error saving theme config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
