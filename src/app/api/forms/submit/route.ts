import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendAtelierEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Enforce IP rate limiting (5 submissions per 60s per IP)
  const rateLimit = checkRateLimit(req, {
    limit: 5,
    windowMs: 60 * 1000,
    identifier: "forms-submit",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many inquiries submitted. Please wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const {
      fullName,
      name,
      email,
      phone,
      message,
      comments,
      formTitle,
      pageSlug,
      notifyEmail,
      customFields,
    } = body;

    const trimmedName = (fullName || name || "").trim();
    const trimmedEmail = (email || "").trim();

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json(
        { error: "Name and Email are required to submit an inquiry." },
        { status: 400 }
      );
    }

    const titleStr = (formTitle || "General Atelier Inquiry").trim();
    const pageStr = (pageSlug || "contact").trim();
    const messageStr = (message || comments || "Inquiry submitted through website form.").trim();

    // 1. Record lead in database
    const lead = await prisma.lead.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        phone: phone ? phone.trim() : null,
        subject: `[${titleStr}] Inbound Request from ${trimmedName}`,
        message: messageStr,
        formTitle: titleStr,
        pageSlug: pageStr,
        source: "PAGE_FORM",
        customFields: customFields && typeof customFields === "object" ? customFields : {},
      },
    });

    // 2. Dispatch dynamic outbound email notification & user receipt if enabled
    if (notifyEmail !== false) {
      try {
        const lowerTitle = titleStr.toLowerCase();
        const lowerMessage = messageStr.toLowerCase();
        const isAcquisition =
          lowerTitle.includes("acquisition") ||
          lowerTitle.includes("commission") ||
          lowerMessage.includes("acquisition") ||
          lowerMessage.includes("commission") ||
          lowerTitle.includes("private viewing");
        
        const isContact =
          lowerTitle.includes("contact") ||
          pageStr.toLowerCase() === "contact" ||
          lowerTitle.includes("general inquiry");

        const triggerType = isAcquisition ? "acquisition" : isContact ? "contact" : "custom_form";

        let customRows = "";
        if (customFields && typeof customFields === "object" && Object.keys(customFields).length > 0) {
          customRows =
            `<table style="width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; background: #fdfcf9; border: 1px solid #e7e2d9; border-radius: 6px;">` +
            `<tr><th colspan="2" style="background: #faf7f2; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; border-bottom: 1px solid #e7e2d9;">Additional Form Specifications</th></tr>` +
            Object.entries(customFields)
              .map(
                ([k, v]) =>
                  `<tr><td style="padding: 8px 12px; color: #6b7280; font-weight: 600; width: 140px; border-bottom: 1px solid #f0eae1;">${k}</td><td style="padding: 8px 12px; color: #111827; border-bottom: 1px solid #f0eae1;">${typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}</td></tr>`
              )
              .join("") +
            `</table>`;
        }

        await sendAtelierEmail({
          triggerType,
          userEmail: trimmedEmail,
          data: {
            name: trimmedName,
            email: trimmedEmail,
            phone: phone ? phone.trim() : "Not specified",
            subject: `[${titleStr}] Inbound Request from ${trimmedName}`,
            message: messageStr,
            form_name: titleStr,
            form_data: customRows,
            page_slug: pageStr,
          },
        });
      } catch (emailErr) {
        console.warn("Outbound email notification notice:", emailErr);
      }
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit inquiry";
    console.error("Form submit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
