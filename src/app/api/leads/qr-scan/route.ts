import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { LeadSource } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limiting (15 scans per 60s per IP)
  const rateLimit = checkRateLimit(request, {
    limit: 15,
    windowMs: 60 * 1000,
    identifier: "leads-qr-scan",
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many scan requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { name, phone, email, artworkId, artworkTitle, deviceInfo } = body;

    const trimmedPhone = (phone || "").toString().trim();
    const trimmedName = (name || "").toString().trim();
    const trimmedEmail = (email || "").toString().trim();

    if (!trimmedPhone && !trimmedName) {
      return NextResponse.json(
        { error: "Visitor name and contact phone number are required." },
        { status: 400 }
      );
    }

    const userAgent = deviceInfo || request.headers.get("user-agent") || "Mobile Browser";

    // Lookup artwork title if artworkId is given but artworkTitle is missing
    let resolvedTitle = artworkTitle ? String(artworkTitle).trim() : "";
    if (artworkId && !resolvedTitle) {
      const art = await prisma.artwork.findUnique({
        where: { id: artworkId },
        select: { title: true },
      });
      if (art) resolvedTitle = art.title;
    }

    const titleDisplay = resolvedTitle || "Curated Exhibition Masterpiece";

    const newLead = await prisma.lead.create({
      data: {
        name: trimmedName || "Exhibition Patron",
        email: trimmedEmail || null,
        phone: trimmedPhone || null,
        source: LeadSource.QR_SCAN,
        artworkId: artworkId || null,
        sourceArtworkId: artworkId || null,
        artworkTitle: titleDisplay,
        deviceInfo: userAgent.slice(0, 500),
        subject: `Exhibition Floor QR Scan: ${titleDisplay}`,
        message: `Visitor scanned physical gallery QR code for "${titleDisplay}" at the exhibition salon wall.`,
        customFields: {
          scannedAt: new Date().toISOString(),
          userAgent: userAgent.slice(0, 500),
          clientTimestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: `Masterpiece "${titleDisplay}" unlocked!`,
      visitor: {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error logging QR scan telemetry";
    console.error("[QRScanRoute] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
