import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  getTransporter,
  wrapBrandedEmailHtml,
  getTenantBranding,
  resolveEmailLogoAndAttachments,
} from "@/lib/email-service";

const VERIFICATION_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "savazai_atelier_otp_verification_secret_key_2026";

/**
 * Checks whether the incoming visitor is an authentic returning user whose email
 * has already been verified in the system and matches the exact name provided.
 *
 * Invariant: Returning User Recognition & Bypass Invariant:
 * - If an existing verified record matches BOTH exact email (case-insensitive)
 *   AND name (trimmed, case-insensitive), OTP dispatch is bypassed.
 * - If name differs or email was not previously verified, returns false.
 */
export async function isReturningVerifiedUser(
  name: string,
  email: string
): Promise<boolean> {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedName = (name || "").trim().toLowerCase();

  if (!normalizedEmail || !normalizedName) {
    return false;
  }

  try {
    const verifiedLead = await prisma.lead.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        isEmailVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedLead || !verifiedLead.name) {
      return false;
    }

    const existingName = verifiedLead.name.trim().toLowerCase();
    return existingName === normalizedName;
  } catch (err) {
    console.error("[VisitorVerification] Error checking returning user:", err);
    return false;
  }
}

/**
 * Generates a random 6-digit numeric OTP code.
 */
export function generateNumericOtp(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
}

/**
 * Hashes the 6-digit OTP code using HMAC-SHA256.
 */
export function hashOtpCode(code: string): string {
  return crypto
    .createHmac("sha256", VERIFICATION_SECRET)
    .update(String(code).trim())
    .digest("hex");
}

export interface OtpSessionPayload {
  email: string;
  name: string;
  formType: string;
  targetId?: string | null;
  exp: number; // UNIX timestamp in ms
}

/**
 * Creates a signed verification session ticket that proves this email/name
 * was successfully verified within the last 15 minutes.
 */
export function createOtpSessionToken(payload: {
  email: string;
  name: string;
  formType: string;
  targetId?: string | null;
}): string {
  const data: OtpSessionPayload = {
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    formType: payload.formType,
    targetId: payload.targetId || null,
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes validity
  };

  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", VERIFICATION_SECRET)
    .update(base64Data)
    .digest("hex");

  return `${base64Data}.${signature}`;
}

/**
 * Verifies the validity of an issued OTP session token.
 */
export function verifyOtpSessionToken(
  token: string | null | undefined,
  expectedEmail: string,
  expectedFormType?: string
): { valid: boolean; payload?: OtpSessionPayload; error?: string } {
  if (!token) {
    return { valid: false, error: "Missing OTP verification token." };
  }

  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) {
      return { valid: false, error: "Invalid OTP token format." };
    }

    const expectedSignature = crypto
      .createHmac("sha256", VERIFICATION_SECRET)
      .update(base64Data)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: "Invalid OTP token signature." };
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as OtpSessionPayload;

    if (Date.now() > payload.exp) {
      return { valid: false, error: "OTP verification session has expired. Please verify again." };
    }

    const normalizedExpectedEmail = expectedEmail.trim().toLowerCase();
    if (payload.email !== normalizedExpectedEmail) {
      return { valid: false, error: "Token email does not match form submission." };
    }

    if (expectedFormType && payload.formType !== expectedFormType) {
      return { valid: false, error: "Token form type mismatch." };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("[VisitorVerification] Error decoding OTP session token:", err);
    return { valid: false, error: "Invalid OTP verification token." };
  }
}

/**
 * Dispatches a branded 6-digit OTP verification email to the user.
 */
export async function sendOtpVerificationEmail(
  email: string,
  code: string,
  name: string,
  formTitle: string = "Inquiry & Archival Portal"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { transporter, settings, envelopeFrom, replyTo } = await getTransporter();
    const branding = await getTenantBranding();
    const siteName = branding.name;
    const { logoImgSrc, attachments } = resolveEmailLogoAndAttachments(branding.logoUrl);

    const contentHtml = `
      <p style="margin-top: 0;">Dear <strong>${name || "Patron"}</strong>,</p>
      <p>Please use the following 6-digit verification code to confirm your email address for your request on <strong>${formTitle}</strong>:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; padding: 18px 36px; background: #faf7f2; border: 2px dashed #d4af37; border-radius: 10px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 0.3em; color: #111827;">
            ${code}
          </span>
        </div>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 24px;">
        ⏳ <strong>This verification code will expire in 5 minutes.</strong>
      </p>

      <div style="background: #f9fafb; border-left: 3px solid #6b7280; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #4b5563;">
        <p style="margin: 0;"><strong>Security Note:</strong> If you did not initiate this request on ${siteName}, please disregard this email. Your email will not be recorded without this verification step.</p>
      </div>

      <p style="margin-top: 28px; font-size: 13px; color: #374151;">
        Warm regards,<br/>
        <strong>${siteName} Correspondence Desk</strong>
      </p>
    `;

    const html = wrapBrandedEmailHtml(contentHtml, {
      emailHeaderTitle: branding.name,
      emailHeaderSubtitle: branding.subtitle || "Identity & Verification Desk",
      logoImgSrc,
      emailFooterText: settings?.emailFooterText || `Inbound correspondence and secure notification dispatch • ${branding.name}`,
      organizationName: branding.name,
      brandName: branding.name,
      brandSubtitle: branding.subtitle,
    });

    if (!transporter) {
      const errorMsg = "Outbound SMTP email service is not configured or disabled in Admin Settings.";
      console.error(`[VisitorVerification] ❌ ${errorMsg}`);
      try {
        await prisma.emailDispatchLog.create({
          data: {
            recipient: email,
            sender: branding.fromEmail,
            triggerType: "email_otp",
            subject: `Verification Code Request — ${siteName}`,
            status: "FAILED",
            errorMessage: errorMsg,
          },
        });
      } catch {}
      return { success: false, error: errorMsg };
    }

    const sender = envelopeFrom || branding.fromEmail;
    const info = await transporter.sendMail({
      from: sender,
      to: email,
      replyTo: replyTo || branding.adminAlertEmail || branding.fromAddress,
      subject: `Your Verification Code: ${code} — ${siteName}`,
      html,
      attachments,
    });

    console.log(`[VisitorVerification] ✅ OTP email dispatched to ${email} (Message ID: ${info.messageId})`);

    // Log successful dispatch
    await prisma.emailDispatchLog.create({
      data: {
        recipient: email,
        sender,
        triggerType: "email_otp",
        subject: `Your Verification Code: ${code} — ${siteName}`,
        status: "SENT",
      },
    }).catch(() => {});

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send verification email";
    console.error("[VisitorVerification] ❌ Failed to dispatch OTP email:", errorMsg);

    // Log failed dispatch
    try {
      const branding = await getTenantBranding();
      await prisma.emailDispatchLog.create({
        data: {
          recipient: email,
          sender: branding.fromEmail,
          triggerType: "email_otp",
          subject: `Verification Code Request — ${branding.name}`,
          status: "FAILED",
          errorMessage: errorMsg,
        },
      });
    } catch {
      // Ignore database logging error during failure handling
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
