import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      orderBy: { startDate: "asc" },
      include: {
        _count: {
          select: {
            registrations: true,
            artworks: true,
          },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching events";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    if (!title || !slug || !eventType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, slug, event type, start and end dates are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.event.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An event with this URL slug already exists" },
        { status: 409 }
      );
    }

    const newEvent = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.create({
        data: {
          title,
          slug: cleanSlug,
          eventType: eventType as EventType,
          description: description || "",
          venue: venue || "Lalita Kapilavai Heritage Studio",
          city: city || "Bengaluru",
          timezone: timezone || "Asia/Kolkata",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          posterUrl: posterUrl || null,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
          registrationFee: registrationFee ? parseFloat(registrationFee) : null,
          currency: body.currency || "INR",
          isRegistrationOpen: isRegistrationOpen !== undefined ? !!isRegistrationOpen : true,
        },
      });

      if (Array.isArray(artworkIds) && artworkIds.length > 0) {
        for (let i = 0; i < artworkIds.length; i++) {
          await tx.artworkOnEvent.create({
            data: {
              eventId: ev.id,
              artworkId: artworkIds[i],
              displayOrder: i + 1,
            },
          });
        }
      }

      return ev;
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
