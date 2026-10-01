import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  hashOtpCode,
  createOtpSessionToken,
} from "@/lib/security/visitor-verification";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limiting (10 verify attempts per 60s per IP)
  const rateLimit = checkRateLimit(request, {
    limit: 10,
    windowMs: 60 * 1000,
    identifier: "otp-verify",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { name, email, code, formType = "CONTACT", targetId } = body;

    const trimmedName = (name || "").toString().trim();
    const trimmedEmail = (email || "").toString().trim().toLowerCase();
    const cleanedCode = (code || "").toString().trim();

    if (!trimmedEmail || !cleanedCode) {
      return NextResponse.json(
        { error: "Email address and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    // Find the latest active token
    const tokenRecord = await prisma.formVerificationToken.findFirst({
      where: {
        email: trimmedEmail,
        formType,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "No active verification code found or the code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempt lockout (max 3 attempts)
    if (tokenRecord.attempts >= 3) {
      await prisma.formVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true },
      });
      return NextResponse.json(
        { error: "Maximum attempts exceeded. This verification code has been invalidated. Please request a fresh code." },
        { status: 400 }
      );
    }

    // Verify hash
    const candidateHash = hashOtpCode(cleanedCode);
    const candBuf = Buffer.from(candidateHash);
    const targetBuf = Buffer.from(tokenRecord.codeHash);

    const isMatch =
      candBuf.length === targetBuf.length &&
      crypto.timingSafeEqual(candBuf, targetBuf);

    if (!isMatch) {
      const nextAttempts = tokenRecord.attempts + 1;
      const willInvalidate = nextAttempts >= 3;

      await prisma.formVerificationToken.update({
        where: { id: tokenRecord.id },
        data: {
          attempts: nextAttempts,
          isUsed: willInvalidate,
        },
      });

      const remaining = Math.max(0, 3 - nextAttempts);
      const attemptNote = willInvalidate
        ? "Code invalidated due to repeated incorrect entries. Please request a new code."
        : `${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`;

      return NextResponse.json(
        { error: `Incorrect verification code. ${attemptNote}` },
        { status: 400 }
      );
    }

    // Success: Mark token as used
    await prisma.formVerificationToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true },
    });

    // Mark any existing matching leads with this email as verified
    try {
      await prisma.lead.updateMany({
        where: {
          email: { equals: trimmedEmail, mode: "insensitive" },
        },
        data: {
          isEmailVerified: true,
          verifiedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.warn("[OtpVerifyAPI] Could not update existing lead records:", dbErr);
    }

    // Issue signed OTP session token (valid for 15 minutes)
    const otpSessionToken = createOtpSessionToken({
      email: trimmedEmail,
      name: trimmedName,
      formType,
      targetId: targetId || null,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      otpSessionToken,
      message: "Email successfully verified!",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error verifying OTP code";
    console.error("[OtpVerifyAPI] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
