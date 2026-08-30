import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

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

    // Send test email
    const sender = fromName ? `"${fromName}" <${fromEmail || user}>` : fromEmail || user;
    const info = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "✨ [Lalita Kapilavai Platform] SMTP / Gmail Connectivity Test",
      text: `Greetings from Lalita Kapilavai Archive & Platform.\n\nYour outbound email delivery system is functioning perfectly.\n\nProvider: ${provider || "SMTP"}\nHost: ${host}:${port}\nUser: ${user}\nTimestamp: ${new Date().toISOString()}\n\nSacred Art & Carnatic Music Archive.`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #D4AF37; border-radius: 8px; background-color: #FBF8F1; color: #1C1814;">
          <div style="text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #C25E34; margin: 0; font-size: 24px;">Lalita Kapilavai Archive</h2>
            <p style="color: #8C7355; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Sacred Art &amp; Carnatic Classical Vocal Heritage</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6;">
            Your outbound email configuration has been <strong>successfully verified</strong> and is online.
          </p>
          <div style="background-color: #FFFFFF; padding: 16px; border-radius: 6px; border: 1px solid #E5E0D8; font-family: monospace; font-size: 13px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Provider:</strong> ${provider || "SMTP"}</p>
            <p style="margin: 4px 0;"><strong>Server Host:</strong> ${host}:${port}</p>
            <p style="margin: 4px 0;"><strong>Sender Account:</strong> ${user}</p>
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          </div>
          <p style="font-size: 13px; color: #666;">
            Inbound gallery inquiries, concert registrations, and commissioning notifications will be routed cleanly through this outbound gateway.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${recipient}`,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error("SMTP Test Error:", error);
    const message = error instanceof Error ? error.message : "SMTP Connection Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
