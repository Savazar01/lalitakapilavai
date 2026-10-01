import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendAtelierEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limiting (5 requests per 60s per IP)
  const rateLimit = checkRateLimit(req, {
    limit: 5,
    windowMs: 60 * 1000,
    identifier: "privacy-erasure",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.resetSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, requestType, notes } = body;

    const trimmedEmail = (email || "").toString().trim().toLowerCase();
    const trimmedPhone = (phone || "").toString().trim();
    const trimmedName = (name || "").toString().trim() || "Website Visitor";
    const reqType = (requestType || "Full Data Erasure & Do Not Sell").toString().trim();
    const userNotes = (notes || "").toString().trim();

    if (!trimmedEmail && !trimmedPhone) {
      return NextResponse.json(
        { error: "Please provide either an Email Address or Phone Number to identify your records." },
        { status: 400 }
      );
    }

    // 1. Immediately record in UnsubscribedContact table if email is present
    if (trimmedEmail && trimmedEmail.includes("@")) {
      await prisma.unsubscribedContact.upsert({
        where: { email: trimmedEmail },
        update: { reason: `GDPR / Privacy Request: ${reqType}` },
        create: {
          email: trimmedEmail,
          reason: `GDPR / Privacy Request: ${reqType}`,
        },
      });

      // Mark leads as unsubscribed
      await prisma.lead.updateMany({
        where: { email: { equals: trimmedEmail, mode: "insensitive" } },
        data: { isSubscribed: false },
      });
    }

    // 2. Dispatch notification to administrative alert email
    const settings = await prisma.systemSetting.findFirst();
    const adminAlertEmail = settings?.adminAlertEmail || "alerts@savazar.com";

    const formattedData = `
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Patron Name:</strong></td><td style="padding: 6px 0; color: #111827;">${trimmedName}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td><td style="padding: 6px 0; color: #111827;">${trimmedEmail || "Not provided"}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone / WhatsApp:</strong></td><td style="padding: 6px 0; color: #111827;">${trimmedPhone || "Not provided"}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Request Type:</strong></td><td style="padding: 6px 0; color: #b45309; font-weight: bold;">${reqType}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Additional Notes:</strong></td><td style="padding: 6px 0; color: #111827;">${userNotes || "None provided"}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Timestamp:</strong></td><td style="padding: 6px 0; color: #111827;">${new Date().toISOString()}</td></tr>
</table>
<div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 12px; color: #92400e; margin-top: 14px;">
  <strong>Action Required:</strong> The visitor has requested personal telemetry and contact data erasure in compliance with GDPR / CCPA / Privacy regulations. Please review CRM records in Admin Portal &gt; Leads to complete manual database purging if desired.
</div>
    `;

    await sendAtelierEmail({
      triggerType: "privacy_erasure_request",
      userEmail: trimmedEmail || undefined,
      recipientOverride: adminAlertEmail,
      data: {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        subject: `⚠️ GDPR Privacy / Data Erasure Request: ${trimmedName}`,
        message: `Visitor submitted formal privacy erasure request (${reqType}) for email: ${trimmedEmail}, phone: ${trimmedPhone}. Notes: ${userNotes}`,
        form_name: "Privacy & Data Removal Portal",
        form_data: formattedData,
      },
    }).catch((err) => console.warn("[PrivacyErasureRoute] Alert dispatch warning:", err));

    return NextResponse.json({
      success: true,
      message: "Your privacy and data removal request has been submitted to the atelier privacy officer. We will process your records promptly.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error submitting privacy request";
    console.error("[PrivacyErasureRoute] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
