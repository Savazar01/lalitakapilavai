import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  isReturningVerifiedUser,
  generateNumericOtp,
  hashOtpCode,
  createOtpSessionToken,
  sendOtpVerificationEmail,
} from "@/lib/security/visitor-verification";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // IP-based Rate limiting (6 requests per 60s)
  const rateLimit = checkRateLimit(request, {
    limit: 6,
    windowMs: 60 * 1000,
    identifier: "otp-request",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many verification requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { name, email, formType = "CONTACT", targetId, formTitle } = body;

    const trimmedName = (name || "").toString().trim();
    const trimmedEmail = (email || "").toString().trim().toLowerCase();

    if (!trimmedEmail || !trimmedName) {
      return NextResponse.json(
        { error: "Name and email address are required for verification." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Invariant: Returning User Recognition & Bypass Invariant
    const isBypass = await isReturningVerifiedUser(trimmedName, trimmedEmail);
    if (isBypass) {
      const otpSessionToken = createOtpSessionToken({
        email: trimmedEmail,
        name: trimmedName,
        formType,
        targetId: targetId || null,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        bypass: true,
        otpSessionToken,
        message: "Identity recognized! Direct submission permitted.",
      });
    }

    // Rate limit per email: max 3 requests in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentTokensCount = await prisma.formVerificationToken.count({
      where: {
        email: trimmedEmail,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentTokensCount >= 3) {
      return NextResponse.json(
        { error: "Too many verification codes requested for this email. Please check your inbox or try again in 10 minutes." },
        { status: 429 }
      );
    }

    // Invalidate existing unused tokens for this email & formType
    await prisma.formVerificationToken.updateMany({
      where: {
        email: trimmedEmail,
        formType,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate 6-digit numeric OTP and 5-minute expiry
    const otpCode = generateNumericOtp();
    const codeHash = hashOtpCode(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save token record in database
    await prisma.formVerificationToken.create({
      data: {
        email: trimmedEmail,
        codeHash,
        formType,
        targetId: targetId || null,
        expiresAt,
      },
    });

    // Dispatch branded email
    const emailRes = await sendOtpVerificationEmail(
      trimmedEmail,
      otpCode,
      trimmedName,
      formTitle || "Archival Portal Inquiry"
    );

    if (!emailRes.success) {
      console.warn("[OtpRequestAPI] Email dispatch reported error:", emailRes.error);
    }

    return NextResponse.json({
      success: true,
      verified: false,
      bypass: false,
      challengeSent: true,
      tokenExpiresAt: expiresAt.toISOString(),
      message: `A 6-digit verification code has been dispatched to ${trimmedEmail}.`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error requesting OTP verification";
    console.error("[OtpRequestAPI] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
