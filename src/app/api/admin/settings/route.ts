import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    let settings = await prisma.systemSetting.findFirst();

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          siteName: "SavazAI WebApps — Digital Atelier & Cultural Archive",
          siteDescription:
            "Living digital atelier and high-fidelity cultural archive platform engineered by Savazar.",
          adminAlertEmail: "alerts@savazar.com",
          contactEmail: "contact@savazar.com",
          contactPhone: null,
          watermarkText: "© SavazAI WebApps | All Rights Reserved",
          watermarkOpacity: 0.35,
          watermarkFontSize: 28,
          defaultCurrency: "INR",
          defaultTimezone: "Asia/Kolkata",
          storageProvider: "LOCAL",
          r2BucketName: null,
          r2PublicUrl: null,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching settings";
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
    const existing = await prisma.systemSetting.findFirst();

    const data = {
      siteName: body.siteName,
      siteDescription: body.siteDescription,
      adminAlertEmail: body.adminAlertEmail,
      emailHeaderTitle: body.emailHeaderTitle,
      emailHeaderSubtitle: body.emailHeaderSubtitle,
      emailLogoUrl: body.emailLogoUrl,
      emailFooterText: body.emailFooterText,
      contactEmail: body.contactEmail !== undefined ? (body.contactEmail ? String(body.contactEmail).trim() : null) : undefined,
      contactPhone: body.contactPhone !== undefined ? (body.contactPhone ? String(body.contactPhone).trim() : null) : undefined,
      watermarkText: body.watermarkText,
      watermarkOpacity:
        body.watermarkOpacity !== undefined
          ? parseFloat(body.watermarkOpacity)
          : undefined,
      watermarkFontSize:
        body.watermarkFontSize !== undefined
          ? parseInt(body.watermarkFontSize)
          : undefined,
      watermarkStyle: body.watermarkStyle !== undefined ? body.watermarkStyle : undefined,
      defaultCurrency: body.defaultCurrency,
      defaultTimezone: body.defaultTimezone,
      storageProvider: body.storageProvider,
      r2AccountId: body.r2AccountId,
      r2BucketName: body.r2BucketName,
      r2PublicUrl: body.r2PublicUrl,
      s3Region: body.s3Region,
      s3BucketName: body.s3BucketName,
      s3Endpoint: body.s3Endpoint,
      s3AccessKey: body.s3AccessKey,
      s3SecretKey: body.s3SecretKey,
      s3PublicUrl: body.s3PublicUrl,
      instagramUrl: body.instagramUrl,
      youtubeUrl: body.youtubeUrl,
      facebookUrl: body.facebookUrl,
      pinterestUrl: body.pinterestUrl,
      logoUrl: body.logoUrl,
      faviconUrl: body.faviconUrl,
      footerConfig: body.footerConfig !== undefined ? {
        ...body.footerConfig,
        contactEmail: body.footerConfig?.contactEmail !== undefined ? String(body.footerConfig.contactEmail).trim() : undefined,
        contactPhone: body.footerConfig?.contactPhone !== undefined ? String(body.footerConfig.contactPhone).trim() : undefined,
      } : undefined,
      emailConfig: body.emailConfig !== undefined ? body.emailConfig : undefined,
      aiConfig: body.aiConfig !== undefined ? body.aiConfig : undefined,
      adminConfig: body.adminConfig !== undefined ? body.adminConfig : undefined,
      themeConfig: body.themeConfig !== undefined ? body.themeConfig : undefined,
      watermarkConfig: body.watermarkConfig !== undefined ? body.watermarkConfig : undefined,
    };

    let updated;
    if (existing) {
      updated = await prisma.systemSetting.update({
        where: { id: existing.id },
        data,
      });
    } else {
      updated = await prisma.systemSetting.create({
        data,
      });
    }

    // Purge full site cache hierarchy so Navbar, Footer, and Public layouts reflect immediately
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/(public)", "layout");
      revalidatePath("/gallery", "layout");
      revalidatePath("/catalogs", "layout");
      revalidatePath("/admin/settings");
    } catch (revErr) {
      console.warn("Settings cache revalidation notice:", revErr);
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error saving settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
