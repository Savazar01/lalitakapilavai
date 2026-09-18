import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getServerBaseUrl } from "@/lib/get-base-url";
import { checkRateLimit } from "@/lib/rate-limit";

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
      emailSubjectTemplate,
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

    // 2. Dispatch outbound email notification if enabled (notifyEmail !== false)
    if (notifyEmail !== false) {
      try {
        const settings = await prisma.systemSetting.findFirst();
        const emailConfig = (settings?.emailConfig as Record<string, unknown> | null) || {};
        
        // Security Remediation (VULN-002): Client-supplied recipient emails are strictly forbidden
        // Recipient is locked down strictly to the verified administrative alert inbox
        const defaultAdmin = settings?.adminAlertEmail || (emailConfig.fromEmail as string) || "contact@lalitakapilavai.com";
        const targetRecipients = [defaultAdmin];

        const host = (emailConfig.smtpHost as string) || "smtp.gmail.com";
        const port = Number(emailConfig.smtpPort) || 587;
        const user = (emailConfig.smtpUser as string) || "";
        const pass = (emailConfig.smtpPassword as string) || "";
        const fromEmail = (emailConfig.fromEmail as string) || user || "contact@lalitakapilavai.com";
        const fromName = (emailConfig.fromName as string) || "Lalita Kapilavai Archive";

        if (user && pass) {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
              user,
              pass,
            },
            tls: {
              // Security Remediation (VULN-007): Enforce strict TLS certificate verification
              rejectUnauthorized: true,
              minVersion: "TLSv1.2",
            },
          });

          // Compile subject line with template support
          let emailSubject = `✨ New Inquiry: ${titleStr} [${trimmedName}]`;
          if (emailSubjectTemplate && typeof emailSubjectTemplate === "string" && emailSubjectTemplate.trim()) {
            emailSubject = emailSubjectTemplate
              .replace(/\{\{formTitle\}\}/gi, titleStr)
              .replace(/\{\{fullName\}\}/gi, trimmedName)
              .replace(/\{\{name\}\}/gi, trimmedName)
              .replace(/\{\{pageSlug\}\}/gi, pageStr);
          }

          // Format custom fields nicely
          const customRows = Object.entries(customFields || {})
            .map(
              ([k, v]) =>
                `<tr><td style="padding: 8px 12px; color: #E6C65A; font-weight: bold; border-bottom: 1px solid #332E27;">${k}</td><td style="padding: 8px 12px; color: #FAF7F2; border-bottom: 1px solid #332E27;">${typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}</td></tr>`
            )
            .join("");

          const baseUrl = await getServerBaseUrl(req);

          await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: targetRecipients.join(", "),
            replyTo: trimmedEmail,
            subject: emailSubject,
          html: `
            <div style="font-family: Georgia, serif; background: #0F0E0D; color: #FAF7F2; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37;">
              <div style="border-bottom: 1px solid #D4AF37; padding-bottom: 16px; margin-bottom: 20px;">
                <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; font-weight: bold;">
                  Lalita Kapilavai Curatorial Desk
                </span>
                <h2 style="color: #F5EBE1; margin: 8px 0 0 0; font-size: 24px;">${titleStr}</h2>
                <p style="font-size: 12px; color: #A8A29E; margin: 4px 0 0 0;">Received via page: /${pageStr}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 12px; color: #E6C65A; font-weight: bold; width: 140px; border-bottom: 1px solid #332E27;">Collector Name:</td>
                  <td style="padding: 8px 12px; color: #FAF7F2; border-bottom: 1px solid #332E27;">${trimmedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #E6C65A; font-weight: bold; border-bottom: 1px solid #332E27;">Email Address:</td>
                  <td style="padding: 8px 12px; color: #FAF7F2; border-bottom: 1px solid #332E27;"><a href="mailto:${trimmedEmail}" style="color: #E6C65A;">${trimmedEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #E6C65A; font-weight: bold; border-bottom: 1px solid #332E27;">Phone / WhatsApp:</td>
                  <td style="padding: 8px 12px; color: #FAF7F2; border-bottom: 1px solid #332E27;">${phone ? phone.trim() : "Not specified"}</td>
                </tr>
                ${customRows}
              </table>

              <div style="background: #1C1814; border-left: 3px solid #D4AF37; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #E6C65A; font-weight: bold;">Collector Message</p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #FAF7F2; white-space: pre-wrap;">${messageStr}</p>
              </div>

              <div style="border-top: 1px solid #332E27; padding-top: 16px; font-size: 11px; color: #78716C; text-align: center;">
                <p style="margin: 0;">This inquiry has been logged in Admin CRM under <a href="${baseUrl ? `${baseUrl}/admin/leads` : '/admin/leads'}" style="color: #D4AF37;">Leads &amp; Exhibition QR</a>.</p>
              </div>
            </div>
          `,
        });
      }
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
