import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        artworks: {
          orderBy: { displayOrder: "asc" },
          include: {
            artwork: {
              include: { category: true },
            },
          },
        },
        registrations: {
          orderBy: { registeredAt: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      eventType,
      description,
      venue,
      city,
      timezone,
      startDate,
      endDate,
      posterUrl,
      maxCapacity,
      registrationFee,
      isRegistrationOpen,
      artworkIds,
    } = body;

    const updated = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.update({
        where: { id },
        data: {
          title,
          slug,
          eventType: eventType ? (eventType as EventType) : undefined,
          description,
          venue,
          city,
          timezone,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          posterUrl,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
          registrationFee: registrationFee ? parseFloat(registrationFee) : null,
          currency: body.currency !== undefined ? body.currency : undefined,
          isRegistrationOpen: isRegistrationOpen !== undefined ? !!isRegistrationOpen : undefined,
        },
      });

      // If artworkIds array provided, replace attached artworks
      if (Array.isArray(artworkIds)) {
        await tx.artworkOnEvent.deleteMany({ where: { eventId: id } });
        for (let i = 0; i < artworkIds.length; i++) {
          await tx.artworkOnEvent.create({
            data: {
              eventId: id,
              artworkId: artworkIds[i],
              displayOrder: i + 1,
            },
          });
        }
      }

      return ev;
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
