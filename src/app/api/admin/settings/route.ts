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
          siteName: "Lalita Kapilavai — Sacred Art & Carnatic Music Archive",
          siteDescription:
            "Living digital archive of traditional Indian Tanjore paintings with 22k gold leaf, Mysore classical fine art, and Carnatic classical vocal recitals.",
          adminAlertEmail: "admin@lalitakapilavai.com",
          contactEmail: "contact@lalitakapilavai.com",
          contactPhone: "+91 98450 12345",
          watermarkText: "© Lalita Kapilavai - Sacred Art & Heritage",
          watermarkOpacity: 0.35,
          watermarkFontSize: 28,
          defaultCurrency: "INR",
          defaultTimezone: "Asia/Kolkata",
          storageProvider: "R2",
          r2BucketName: "lalitakapilavai-media",
          r2PublicUrl: "https://media.lalitakapilavai.com",
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
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
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
      footerConfig: body.footerConfig !== undefined ? body.footerConfig : undefined,
      emailConfig: body.emailConfig !== undefined ? body.emailConfig : undefined,
      aiConfig: body.aiConfig !== undefined ? body.aiConfig : undefined,
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
