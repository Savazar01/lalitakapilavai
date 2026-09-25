import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { wrapBrandedEmailHtml } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      provider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
      testRecipient,
    } = body;

    const host = smtpHost || (provider === "gmail" ? "smtp.gmail.com" : "");
    const port = Number(smtpPort) || (provider === "gmail" ? 587 : 587);
    const user = smtpUser || "";
    const pass = smtpPassword || "";

    if (!host || !user || !pass) {
      return NextResponse.json(
        { error: "Incomplete SMTP credentials. Please provide Host, User/Email, and Password/App Password." },
        { status: 400 }
      );
    }

    const systemSettings = await prisma.systemSetting.findFirst();
    const recipient = testRecipient || systemSettings?.adminAlertEmail || session.user.email || user;

    // Create transport
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send test email with dynamic branding from settings
    const sender = fromName ? `"${fromName}" <${fromEmail || user}>` : fromEmail || user;
    const testSubject = `✨ [${systemSettings?.emailHeaderTitle || "Lalita Kapilavai Platform"}] SMTP / Gmail Connectivity Test`;

    const bodyHtml = `
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Your outbound email delivery system has been <strong>successfully verified</strong> and is fully operational.
      </p>
      <div style="background-color: #faf7f2; padding: 16px; border-radius: 6px; border: 1px solid #e7e2d9; font-family: monospace; font-size: 13px; margin: 20px 0; color: #1f2937;">
        <p style="margin: 4px 0;"><strong>Provider:</strong> ${provider || "SMTP"}</p>
        <p style="margin: 4px 0;"><strong>Server Host:</strong> ${host}:${port}</p>
        <p style="margin: 4px 0;"><strong>Sender Account:</strong> ${user}</p>
        <p style="margin: 4px 0;"><strong>Admin Alert Recipient:</strong> ${systemSettings?.adminAlertEmail || recipient}</p>
        <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
        Inbound gallery inquiries, concert RSVPs, and commissioning notifications will be routed cleanly through this outbound gateway.
      </p>
    `;

    const finalHtml = wrapBrandedEmailHtml(bodyHtml, {
      emailHeaderTitle: systemSettings?.emailHeaderTitle,
      emailHeaderSubtitle: systemSettings?.emailHeaderSubtitle,
      emailLogoUrl: systemSettings?.emailLogoUrl,
      emailFooterText: systemSettings?.emailFooterText,
    });

    const info = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: testSubject,
      text: `Greetings from ${systemSettings?.emailHeaderTitle || "Lalita Kapilavai Atelier"}.\n\nYour outbound email delivery system is functioning perfectly.\n\nProvider: ${provider || "SMTP"}\nHost: ${host}:${port}\nUser: ${user}\nTimestamp: ${new Date().toISOString()}`,
      html: finalHtml,
    });

    // Log the test dispatch
    await prisma.emailDispatchLog.create({
      data: {
        recipient,
        sender: fromEmail || user,
        triggerType: "test",
        subject: testSubject,
        status: "SENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${recipient}`,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error("SMTP Test Error:", error);
    const message = error instanceof Error ? error.message : "SMTP Connection Failed";

    try {
      const systemSettings = await prisma.systemSetting.findFirst();
      await prisma.emailDispatchLog.create({
        data: {
          recipient: (await request.clone().json().then((b) => b.testRecipient).catch(() => "")) || systemSettings?.adminAlertEmail || "unknown",
          sender: "system",
          triggerType: "test",
          subject: "SMTP Connectivity Test",
          status: "FAILED",
          errorMessage: message,
        },
      });
    } catch {
      // Ignore logging failure on error
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
