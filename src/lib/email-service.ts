import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export interface EmailDispatchOptions {
  triggerType: "contact" | "event_rsvp" | "acquisition" | "custom_form" | "test";
  userEmail?: string | null;
  recipientOverride?: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    form_name?: string;
    form_data?: string;
    event_title?: string;
    event_date?: string;
    guest_count?: string | number;
    [key: string]: unknown;
  };
}

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    triggerType: "contact",
    name: "General Contact Inquiries",
    adminSubject: "✨ Inbound Inquiry: {subject} [{name}]",
    adminBodyTemplate: `<p>A new visitor inquiry has been submitted through the digital archive.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;"><strong>Name:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Subject:</strong></td><td style="padding: 6px 0; color: #111827;">{subject}</td></tr>
</table>
<div style="background: #faf7f2; border-left: 3px solid #d4af37; padding: 14px; border-radius: 4px; margin: 16px 0; color: #1f2937;">
  <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; font-weight: bold;">Collector Message</p>
  <p style="margin: 0; white-space: pre-wrap;">{message}</p>
</div>
{form_data}`,
    sendUserReceipt: true,
    userSubject: "Thank you for contacting Lalita Kapilavai Atelier",
    userBodyTemplate: `<p>Dear {name},</p>
<p>Thank you for reaching out to the Lalita Kapilavai Atelier. We have received your inquiry regarding <strong>{subject}</strong>.</p>
<p>Our curatorial desk will review your correspondence and respond promptly.</p>
<p style="margin-top: 24px;">With warm regards,<br/><strong>Lalita Kapilavai Atelier</strong><br/><span style="font-size: 12px; color: #6b7280;">Sacred Art &amp; Carnatic Classical Vocal Heritage</span></p>`,
  },
  {
    triggerType: "event_rsvp",
    name: "Exhibition & Concert RSVPs",
    adminSubject: "🎟️ New RSVP: {event_title} [{name}]",
    adminBodyTemplate: `<p>A patron or guest has confirmed attendance for an upcoming recital or exhibition.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Attendee:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Event:</strong></td><td style="padding: 6px 0; color: #111827; font-weight: bold;">{event_title}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Date &amp; Venue:</strong></td><td style="padding: 6px 0; color: #111827;">{event_date}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Ticket / Guests:</strong></td><td style="padding: 6px 0; color: #111827;">{guest_count}</td></tr>
</table>
{form_data}`,
    sendUserReceipt: true,
    userSubject: "Attendance Confirmed: {event_title}",
    userBodyTemplate: `<p>Dear {name},</p>
<p>Your attendance reservation for <strong>{event_title}</strong> on {event_date} has been confirmed.</p>
<p>We look forward to welcoming you to this celebration of sacred art and classical Carnatic music.</p>
<p>Please present this confirmation email upon arrival at the venue reception.</p>
<p style="margin-top: 24px;">Warm regards,<br/><strong>Lalita Kapilavai Archive</strong></p>`,
  },
  {
    triggerType: "acquisition",
    name: "Commission & Acquisition Requests",
    adminSubject: "🏛️ Private Acquisition Request: {subject} [{name}]",
    adminBodyTemplate: `<p>A patron has submitted a private acquisition or commissioning request.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Patron Name:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Artwork / Focus:</strong></td><td style="padding: 6px 0; color: #111827; font-weight: bold;">{subject}</td></tr>
</table>
<div style="background: #faf7f2; border-left: 3px solid #d4af37; padding: 14px; border-radius: 4px; margin: 16px 0; color: #1f2937;">
  <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; font-weight: bold;">Acquisition / Commission Details</p>
  <p style="margin: 0; white-space: pre-wrap;">{message}</p>
</div>
{form_data}`,
    sendUserReceipt: true,
    userSubject: "Private Acquisition Inquiry Received — Lalita Kapilavai",
    userBodyTemplate: `<p>Dear {name},</p>
<p>Thank you for expressing interest in acquiring or commissioning an authentic traditional Tanjore or Mysore masterwork from Lalita Kapilavai Atelier.</p>
<p>Our curatorial team is reviewing your requirements and will contact you with provenance details, dimensions, and schedule availability.</p>
<p style="margin-top: 24px;">With respectful regards,<br/><strong>Lalita Kapilavai Curatorial Desk</strong></p>`,
  },
  {
    triggerType: "custom_form",
    name: "Custom Dynamic Page Builder Forms",
    adminSubject: "📋 Form Submission: {form_name} [{name}]",
    adminBodyTemplate: `<p>A new submission has been received from the digital portfolio page builder form: <strong>{form_name}</strong>.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Respondent:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Form Title:</strong></td><td style="padding: 6px 0; color: #111827;">{form_name}</td></tr>
</table>
<div style="background: #faf7f2; border-left: 3px solid #d4af37; padding: 14px; border-radius: 4px; margin: 16px 0; color: #1f2937;">
  <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; font-weight: bold;">Submitted Message</p>
  <p style="margin: 0; white-space: pre-wrap;">{message}</p>
</div>
{form_data}`,
    sendUserReceipt: true,
    userSubject: "Confirmation: Your submission to {form_name}",
    userBodyTemplate: `<p>Dear {name},</p>
<p>Thank you for submitting your details via <strong>{form_name}</strong>. Your correspondence has been securely logged with our administration.</p>
<p style="margin-top: 24px;">With warm regards,<br/><strong>Lalita Kapilavai Atelier</strong></p>`,
  },
];

/**
 * Replace dynamic tokens in subject and body templates.
 * Supports both {token} and {{token}} syntax.
 */
export function interpolateTokens(template: string, tokens: Record<string, unknown>): string {
  if (!template) return "";
  let result = template;
  for (const [key, val] of Object.entries(tokens)) {
    const stringVal = val === null || val === undefined ? "" : String(val);
    const regex1 = new RegExp(`\\{${key}\\}`, "gi");
    const regex2 = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    result = result.replace(regex1, stringVal).replace(regex2, stringVal);
  }
  return result;
}

/**
 * Wraps compiled email body with dynamic branded header, logo, and footer.
 */
export function wrapBrandedEmailHtml(
  contentHtml: string,
  settings: {
    emailHeaderTitle?: string | null;
    emailHeaderSubtitle?: string | null;
    emailLogoUrl?: string | null;
    emailFooterText?: string | null;
  }
): string {
  const headerTitle = settings.emailHeaderTitle || "Lalita Kapilavai Atelier";
  const headerSubtitle = settings.emailHeaderSubtitle || "Sacred & Traditional Indian Art";
  const footerText = settings.emailFooterText || "Inbound atelier inquiry and archival correspondence.";
  const logoHtml = settings.emailLogoUrl
    ? `<div style="margin-bottom: 12px;"><img src="${settings.emailLogoUrl}" alt="${headerTitle}" style="max-height: 48px; border: 0;" /></div>`
    : "";

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="background: #faf7f2; padding: 24px; text-align: center; border-bottom: 2px solid #d4af37;">
        ${logoHtml}
        <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: bold; letter-spacing: 0.02em;">${headerTitle}</h2>
        <p style="margin: 6px 0 0 0; color: #854d0e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600;">${headerSubtitle}</p>
      </div>
      <div style="padding: 28px 24px; color: #374151; font-size: 14px; line-height: 1.65;">
        ${contentHtml}
      </div>
      <div style="background: #f9fafb; padding: 16px 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; line-height: 1.5;">
        ${footerText}
      </div>
    </div>
  `;
}

/**
 * Creates nodemailer transporter from SystemSetting emailConfig
 */
export async function getTransporter() {
  const settings = await prisma.systemSetting.findFirst();
  const emailConfig = (settings?.emailConfig as Record<string, unknown> | null) || {};

  const host = (emailConfig.smtpHost as string) || "smtp.gmail.com";
  const port = Number(emailConfig.smtpPort) || 587;
  const user = (emailConfig.smtpUser as string) || "";
  const pass = (emailConfig.smtpPassword as string) || "";
  const fromEmail = (emailConfig.fromEmail as string) || user || "contact@lalitakapilavai.com";
  const fromName = (emailConfig.fromName as string) || "Lalita Kapilavai Archive";

  if (!user || !pass) {
    return { transporter: null, settings, fromEmail, fromName };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
  });

  return { transporter, settings, fromEmail, fromName };
}

/**
 * Dispatches an email notification for a specific trigger,
 * compiles dynamic templates, dispatches user receipts if enabled,
 * and records every event in EmailDispatchLog.
 */
export async function sendAtelierEmail(options: EmailDispatchOptions): Promise<{
  adminSent: boolean;
  userSent: boolean;
  adminError?: string;
  userError?: string;
}> {
  const { triggerType, userEmail, recipientOverride, data } = options;

  const defaultTemplate =
    DEFAULT_EMAIL_TEMPLATES.find((t) => t.triggerType === triggerType) || DEFAULT_EMAIL_TEMPLATES[0];

  let dbTemplate = await prisma.emailTemplateConfig.findUnique({
    where: { triggerType },
  });

  // If template not found in DB, fallback to default and seed it
  if (!dbTemplate) {
    try {
      dbTemplate = await prisma.emailTemplateConfig.create({
        data: defaultTemplate,
      });
    } catch {
      // Ignored
    }
  }

  const activeTemplate = dbTemplate || defaultTemplate;

  const { transporter, settings, fromEmail, fromName } = await getTransporter();

  // Tokens dictionary
  const now = new Date();
  const tokens: Record<string, unknown> = {
    name: data.name || "Valued Guest",
    email: data.email || userEmail || "",
    phone: data.phone || "Not specified",
    subject: data.subject || "Atelier Correspondence",
    message: data.message || "",
    form_name: data.form_name || activeTemplate.name || "General Form",
    form_data: data.form_data || "",
    event_title: data.event_title || "Classical Recital / Exhibition",
    event_date: data.event_date || now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
    guest_count: data.guest_count || 1,
    date: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    ...data,
  };

  const senderString = `"${fromName}" <${fromEmail}>`;
  const adminRecipient = recipientOverride || settings?.adminAlertEmail || "info@lalitakapilavai.com";

  let adminSent = false;
  let adminError: string | undefined;
  let userSent = false;
  let userError: string | undefined;

  // 1. Send Admin Notification Email
  const compiledAdminSubject = interpolateTokens(activeTemplate.adminSubject, tokens);
  const compiledAdminBody = interpolateTokens(activeTemplate.adminBodyTemplate, tokens);
  const adminHtml = wrapBrandedEmailHtml(compiledAdminBody, {
    emailHeaderTitle: settings?.emailHeaderTitle,
    emailHeaderSubtitle: settings?.emailHeaderSubtitle,
    emailLogoUrl: settings?.emailLogoUrl,
    emailFooterText: settings?.emailFooterText,
  });

  if (transporter) {
    try {
      await transporter.sendMail({
        from: senderString,
        to: adminRecipient,
        replyTo: (data.email as string) || (userEmail as string) || undefined,
        subject: compiledAdminSubject,
        html: adminHtml,
      });
      adminSent = true;

      // Log success
      await prisma.emailDispatchLog.create({
        data: {
          recipient: adminRecipient,
          sender: fromEmail,
          triggerType,
          subject: compiledAdminSubject,
          status: "SENT",
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch admin email";
      adminError = msg;
      console.error("[EmailService] Admin dispatch failed:", msg);

      // Log failure
      await prisma.emailDispatchLog.create({
        data: {
          recipient: adminRecipient,
          sender: fromEmail,
          triggerType,
          subject: compiledAdminSubject,
          status: "FAILED",
          errorMessage: msg,
        },
      });
    }
  } else {
    adminError = "SMTP credentials are not configured in System Settings";
    await prisma.emailDispatchLog.create({
      data: {
        recipient: adminRecipient,
        sender: fromEmail,
        triggerType,
        subject: compiledAdminSubject,
        status: "FAILED",
        errorMessage: adminError,
      },
    });
  }

  // 2. Send User Confirmation Receipt if enabled and user email exists
  const targetUserEmail = (userEmail || data.email || "").toString().trim();
  if (activeTemplate.sendUserReceipt && targetUserEmail && targetUserEmail.includes("@")) {
    const userSubjectTemplate = activeTemplate.userSubject || "Confirmation: We have received your submission";
    const userBodyTemplate = activeTemplate.userBodyTemplate || "<p>Dear {name},</p><p>We have received your submission.</p>";
    
    const compiledUserSubject = interpolateTokens(userSubjectTemplate, tokens);
    const compiledUserBody = interpolateTokens(userBodyTemplate, tokens);
    const userHtml = wrapBrandedEmailHtml(compiledUserBody, {
      emailHeaderTitle: settings?.emailHeaderTitle,
      emailHeaderSubtitle: settings?.emailHeaderSubtitle,
      emailLogoUrl: settings?.emailLogoUrl,
      emailFooterText: settings?.emailFooterText,
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: senderString,
          to: targetUserEmail,
          subject: compiledUserSubject,
          html: userHtml,
        });
        userSent = true;

        await prisma.emailDispatchLog.create({
          data: {
            recipient: targetUserEmail,
            sender: fromEmail,
            triggerType: `${triggerType}_receipt`,
            subject: compiledUserSubject,
            status: "SENT",
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to dispatch user receipt";
        userError = msg;
        console.error("[EmailService] User receipt dispatch failed:", msg);

        await prisma.emailDispatchLog.create({
          data: {
            recipient: targetUserEmail,
            sender: fromEmail,
            triggerType: `${triggerType}_receipt`,
            subject: compiledUserSubject,
            status: "FAILED",
            errorMessage: msg,
          },
        });
      }
    } else {
      userError = "SMTP not configured";
    }
  }

  return { adminSent, userSent, adminError, userError };
}
