import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { LeadSource } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limiting (15 scans per 60s per IP)
  const rateLimit = checkRateLimit(request, {
    limit: 15,
    windowMs: 60 * 1000,
    identifier: "leads-qr-scan",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many scan requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { name, phone, email, artworkId, artworkTitle, deviceInfo } = body;

    const trimmedPhone = (phone || "").toString().trim();
    const trimmedName = (name || "").toString().trim();
    const trimmedEmail = (email || "").toString().trim();

    if (!trimmedPhone && !trimmedName) {
      return NextResponse.json(
        { error: "Visitor name and contact phone number are required." },
        { status: 400 }
      );
    }

    const userAgent = deviceInfo || request.headers.get("user-agent") || "Mobile Browser";

    // Form Security & Anti-Bot Verification Check
    const settings = await prisma.systemSetting.findFirst();
    const formSecurity = (settings?.formSecurityConfig as Record<string, unknown> | null) || {};
    const qrSecurity = (formSecurity.qrScanGate as Record<string, unknown> | undefined) || {};

    const requiresCaptcha = Boolean(qrSecurity.enableCaptcha);
    const requiresEmailOtp = Boolean(qrSecurity.enableEmailOtp);
    const isBackground = Boolean(body.isBackgroundTelemetry);

    let isVerifiedUser = false;

    if (!isBackground) {
      // 1. Validate CAPTCHA if enabled
      if (requiresCaptcha) {
        const { verifyCaptchaChallenge } = await import("@/lib/security/captcha-validator");
        const captchaRes = verifyCaptchaChallenge(body.captchaToken, body.captchaAnswer);
        if (!captchaRes.valid) {
          return NextResponse.json(
            { error: captchaRes.error || "Invalid or expired CAPTCHA challenge" },
            { status: 400 }
          );
        }
      }

      // 2. Validate Email OTP if enabled (with Returning User Recognition Bypass)
      if (requiresEmailOtp) {
        const { isReturningVerifiedUser, verifyOtpSessionToken } = await import(
          "@/lib/security/visitor-verification"
        );
        const isBypass = await isReturningVerifiedUser(trimmedName, trimmedEmail);

        if (isBypass) {
          isVerifiedUser = true;
        } else {
          const otpCheck = verifyOtpSessionToken(body.otpSessionToken, trimmedEmail, "QR_SCAN");
          if (!otpCheck.valid) {
            return NextResponse.json(
              { error: otpCheck.error || "Email verification required. Please verify your OTP code." },
              { status: 400 }
            );
          }
          isVerifiedUser = true;
        }
      }
    } else {
      if (trimmedName && trimmedEmail) {
        const { isReturningVerifiedUser } = await import("@/lib/security/visitor-verification");
        const isBypass = await isReturningVerifiedUser(trimmedName, trimmedEmail);
        if (isBypass) {
          isVerifiedUser = true;
        }
      }
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      null;

    // Lookup artwork title if artworkId is given but artworkTitle is missing
    let resolvedTitle = artworkTitle ? String(artworkTitle).trim() : "";
    if (artworkId && !resolvedTitle) {
      const art = await prisma.artwork.findUnique({
        where: { id: artworkId },
        select: { title: true },
      });
      if (art) resolvedTitle = art.title;
    }

    const titleDisplay = resolvedTitle || "Curated Exhibition Masterpiece";

    const newLead = await prisma.lead.create({
      data: {
        name: trimmedName || "Exhibition Patron",
        email: trimmedEmail || null,
        phone: trimmedPhone || null,
        source: LeadSource.QR_SCAN,
        artworkId: artworkId || null,
        sourceArtworkId: artworkId || null,
        artworkTitle: titleDisplay,
        deviceInfo: userAgent.slice(0, 500),
        subject: `Exhibition Floor QR Scan: ${titleDisplay}`,
        message: `Visitor scanned physical gallery QR code for "${titleDisplay}" at the exhibition salon wall.`,
        isEmailVerified: isVerifiedUser,
        verifiedAt: isVerifiedUser ? new Date() : null,
        lastVerifiedIp: clientIp,
        customFields: {
          scannedAt: new Date().toISOString(),
          userAgent: userAgent.slice(0, 500),
          clientTimestamp: new Date().toISOString(),
          ...(requiresCaptcha ? { captchaVerified: true } : {}),
          ...(requiresEmailOtp ? { emailOtpVerified: isVerifiedUser } : {}),
          ...(isBackground ? { backgroundTelemetry: true } : {}),
        },
      },
    });

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: `Masterpiece "${titleDisplay}" unlocked!`,
      visitor: {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error logging QR scan telemetry";
    console.error("[QRScanRoute] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
