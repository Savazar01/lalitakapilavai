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
      venueName,
      streetAddress,
      city,
      stateProvince,
      postalCode,
      country,
      countryCode,
      timezone,
      startDate,
      endDate,
      posterUrl,
      bannerImage,
      galleryImages,
      maxCapacity,
      registrationFee,
      isRegistrationOpen,
      isPublished,
      contactName,
      contactEmail,
      contactPhone,
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
          venue: venue || venueName,
          venueName: venueName !== undefined ? venueName : undefined,
          streetAddress: streetAddress !== undefined ? streetAddress : undefined,
          city,
          stateProvince: stateProvince !== undefined ? stateProvince : undefined,
          postalCode: postalCode !== undefined ? postalCode : undefined,
          country: country !== undefined ? country : undefined,
          countryCode: countryCode !== undefined ? countryCode : undefined,
          timezone,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
          posterUrl: posterUrl !== undefined ? posterUrl : undefined,
          bannerImage: bannerImage !== undefined ? bannerImage : undefined,
          galleryImages: galleryImages !== undefined ? galleryImages : undefined,
          maxCapacity: maxCapacity !== undefined ? (maxCapacity ? parseInt(maxCapacity, 10) : null) : undefined,
          registrationFee: registrationFee !== undefined ? (registrationFee ? parseFloat(registrationFee) : null) : undefined,
          currency: body.currency !== undefined ? body.currency : undefined,
          isRegistrationOpen: isRegistrationOpen !== undefined ? !!isRegistrationOpen : undefined,
          isPublished: isPublished !== undefined ? !!isPublished : undefined,
          contactName: contactName !== undefined ? contactName : undefined,
          contactEmail: contactEmail !== undefined ? contactEmail : undefined,
          contactPhone: contactPhone !== undefined ? contactPhone : undefined,
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
