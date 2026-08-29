import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, attendeeName, attendeeEmail, attendeePhone, ticketCount } = body;

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
        },
      });

      // Also record as inbound Lead
      await tx.lead.create({
        data: {
          name: attendeeName,
          email: attendeeEmail,
          phone: attendeePhone || null,
          subject: `RSVP: ${event.title}`,
          message: `Registered for ${event.title} (${tickets} ticket(s)). Event date: ${event.startDate.toLocaleDateString()}`,
          sourceEventId: eventId,
        },
      });

      return reg;
    });

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
