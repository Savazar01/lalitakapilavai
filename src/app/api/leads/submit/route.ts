import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      sourceArtworkId,
      sourceEventId,
      subject,
      message,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newLead = await prisma.lead.create({
      data: {
        name,
        email: email || "exhibition-visitor@lalitakapilavai.com",
        phone: phone || null,
        sourceArtworkId: sourceArtworkId || null,
        sourceEventId: sourceEventId || null,
        subject: subject || (sourceArtworkId ? "Exhibition QR Scan Visitor" : "Web Inquiry"),
        message:
          message ||
          "Scanned exhibition QR code on the gallery floor to explore masterwork commentary.",
      },
    });

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: "Welcome to the exhibition archive!",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error submitting inquiry";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
