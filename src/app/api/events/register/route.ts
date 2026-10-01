import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Enforce IP rate limiting (10 registrations per 60s per IP)
  const rateLimit = checkRateLimit(request, {
    limit: 10,
    windowMs: 60 * 1000,
    identifier: "events-register",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { eventId, attendeeName, attendeeEmail, attendeePhone, ticketCount, selectedDate, selectedDates, selectedSlot, customAnswers } = body;

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: "Event ID, full name, and email address are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isRegistrationOpen) {
      return NextResponse.json(
        { error: "Registrations for this event are currently closed" },
        { status: 400 }
      );
    }

    const tickets = parseInt(ticketCount, 10) || 1;

    if (event.maxCapacity && event._count.registrations + tickets > event.maxCapacity) {
      return NextResponse.json(
        { error: "Sorry, this event has reached maximum capacity" },
        { status: 409 }
      );
    }

    // Security & Anti-Bot Verification Check
    const rsvpConfig = (event.rsvpConfig as Record<string, unknown> | null) || {};
    const requiresCaptcha = Boolean(rsvpConfig.enableCaptcha);
    const requiresEmailOtp = Boolean(rsvpConfig.enableEmailOtp);

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
    let isVerifiedUser = false;
    if (requiresEmailOtp) {
      const { isReturningVerifiedUser, verifyOtpSessionToken } = await import(
        "@/lib/security/visitor-verification"
      );
      const isBypass = await isReturningVerifiedUser(attendeeName, attendeeEmail);

      if (isBypass) {
        isVerifiedUser = true;
      } else {
        const otpCheck = verifyOtpSessionToken(body.otpSessionToken, attendeeEmail, "EVENT_RSVP");
        if (!otpCheck.valid) {
          return NextResponse.json(
            { error: otpCheck.error || "Email verification required. Please verify your OTP code." },
            { status: 400 }
          );
        }
        isVerifiedUser = true;
      }
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      null;

    // Format attendance dates
    const datesArray: string[] = Array.isArray(selectedDates) && selectedDates.length > 0
      ? selectedDates
      : (selectedDate ? [selectedDate] : []);
    const dateFormatted = datesArray.length > 0 ? datesArray.join(", ") : (selectedDate || null);

    // Format custom answers if provided
    let customAnswersText = "";
    if (customAnswers && typeof customAnswers === "object") {
      customAnswersText = Object.entries(customAnswers)
        .map(([k, v]) => `\n- ${k}: ${String(v)}`)
        .join("");
    }

    // Atomic creation of registration and lead record
    const result = await prisma.$transaction(async (tx) => {
      const reg = await tx.eventRegistration.create({
        data: {
          eventId,
          attendeeName,
          attendeeEmail,
          attendeePhone: attendeePhone || null,
          ticketCount: tickets,
          paymentStatus: "CONFIRMED",
          selectedDate: dateFormatted,
          selectedSlot: selectedSlot || null,
        },
      });

      // Also record as inbound Lead
      const dateDisplay = dateFormatted || event.startDate.toLocaleDateString();
      const slotDisplay = selectedSlot ? ` [Slot: ${selectedSlot}]` : "";
      await tx.lead.create({
        data: {
          name: attendeeName,
          email: attendeeEmail,
          phone: attendeePhone || null,
          subject: `RSVP: ${event.title}`,
          message: `Registered for ${event.title} (${tickets} ticket(s)). Attendance Date(s): ${dateDisplay}${slotDisplay}.${customAnswersText ? `\n\nCustom Intake Responses:${customAnswersText}` : ""}`,
          source: "EVENT_RSVP",
          formTitle: "Event Attendance RSVP",
          isEmailVerified: isVerifiedUser,
          verifiedAt: isVerifiedUser ? new Date() : null,
          lastVerifiedIp: isVerifiedUser ? clientIp : null,
          customFields: {
            selectedDate: dateFormatted,
            selectedDates: datesArray,
            selectedSlot: selectedSlot || null,
            ticketCount: tickets,
            ...(customAnswers && typeof customAnswers === "object" ? customAnswers : {}),
          },
          sourceEventId: eventId,
        },
      });

      return reg;
    });

    // Dispatch outbound administrative alert and attendee confirmation receipt
    try {
      const { sendAtelierEmail } = await import("@/lib/email-service");
      await sendAtelierEmail({
        triggerType: `event_rsvp_${event.slug}`,
        userEmail: attendeeEmail,
        data: {
          name: attendeeName,
          email: attendeeEmail,
          phone: attendeePhone || "Not specified",
          subject: `RSVP: ${event.title}`,
          event_title: event.title,
          event_date: `${selectedDate || event.startDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}${selectedSlot ? ` (${selectedSlot})` : ""}${event.venue ? ` — ${event.venue}` : ""}`,
          guest_count: tickets,
          message: customAnswersText || `Registration confirmed for ${tickets} attendee(s).`,
          form_data: customAnswersText
            ? `<div style="background: #faf7f2; padding: 12px; border-radius: 4px; border: 1px solid #e7e2d9; margin-top: 12px; font-size: 13px;"><strong>Attendee Intake Notes:</strong><br/>${customAnswersText.replace(/\n/g, "<br/>")}</div>`
            : "",
        },
      });
    } catch (emailErr) {
      console.warn("Event RSVP outbound notification notice:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Registration confirmed. We look forward to welcoming you!",
      registrationId: result.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing registration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
