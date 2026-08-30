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

    if (!title || !slug || !eventType || !startDate) {
      return NextResponse.json(
        { error: "Title, slug, event type, and start date are required" },
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
          venue: venue || venueName || "Lalita Kapilavai Heritage Studio",
          venueName: venueName || venue || null,
          streetAddress: streetAddress || null,
          city: city || "Bengaluru",
          stateProvince: stateProvince || null,
          postalCode: postalCode || null,
          country: country || "India",
          countryCode: countryCode || null,
          timezone: timezone || "Asia/Kolkata",
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          posterUrl: posterUrl || bannerImage || null,
          bannerImage: bannerImage || posterUrl || null,
          galleryImages: galleryImages ? galleryImages : undefined,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
          registrationFee: registrationFee ? parseFloat(registrationFee) : null,
          currency: body.currency || "INR",
          isRegistrationOpen: isRegistrationOpen !== undefined ? !!isRegistrationOpen : true,
          isPublished: isPublished !== undefined ? !!isPublished : true,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
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
