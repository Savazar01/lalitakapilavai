import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findFirst({
      select: {
        siteName: true,
        archiveSubtitle: true,
        siteDescription: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
        faviconUrl: true,
        adminLoginTitle: true,
        adminLoginSubtitle: true,
        adminLoginLogoUrl: true,
        formSecurityConfig: true,
      },
    });

    const formSecurity = (settings?.formSecurityConfig as Record<string, unknown> | null) || {};
    const contactForm = (formSecurity.contactForm as Record<string, unknown> | undefined) || {};
    const qrScanGate = (formSecurity.qrScanGate as Record<string, unknown> | undefined) || {};

    return NextResponse.json(
      {
        siteName: settings?.siteName || "SavazAI WebApps Platform",
        archiveSubtitle: settings?.archiveSubtitle || "",
        siteDescription: settings?.siteDescription || "",
        contactEmail: settings?.contactEmail || "",
        contactPhone: settings?.contactPhone || "",
        logoUrl: settings?.logoUrl || null,
        faviconUrl: settings?.faviconUrl || null,
        adminLoginTitle: settings?.adminLoginTitle || "SavazAI WebApps Platform Admin",
        adminLoginSubtitle: settings?.adminLoginSubtitle || "Sign in with your authorized administrative credentials.",
        adminLoginLogoUrl: settings?.adminLoginLogoUrl || null,
        formSecurityConfig: {
          contactForm: {
            enableCaptcha: Boolean(contactForm.enableCaptcha),
            enableEmailOtp: Boolean(contactForm.enableEmailOtp),
          },
          qrScanGate: {
            enableCaptcha: Boolean(qrScanGate.enableCaptcha),
            enableEmailOtp: Boolean(qrScanGate.enableEmailOtp),
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching public settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
