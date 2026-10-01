import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadSource, LeadStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const sourceParam = searchParams.get("source");
    const searchParam = searchParams.get("search");
    const exportCsv = searchParams.get("export") === "csv";

    const where: Prisma.LeadWhereInput = {};

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam as LeadStatus;
    }

    if (sourceParam && sourceParam !== "ALL") {
      if (sourceParam === "CONTACT_FORM") {
        where.source = { in: ["CONTACT_FORM", "CUSTOM_FORM"] };
      } else if (sourceParam === "QR_SCAN") {
        where.source = "QR_SCAN";
      } else if (sourceParam === "EVENT_RSVP") {
        where.source = "EVENT_RSVP";
      } else {
        where.source = sourceParam as LeadSource;
      }
    }

    if (searchParam) {
      where.OR = [
        { name: { contains: searchParam, mode: "insensitive" } },
        { email: { contains: searchParam, mode: "insensitive" } },
        { phone: { contains: searchParam, mode: "insensitive" } },
        { subject: { contains: searchParam, mode: "insensitive" } },
        { artworkTitle: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        artwork: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        sourceArtwork: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        sourceEvent: {
          select: {
            id: true,
            title: true,
            venue: true,
          },
        },
      },
    });

    // Handle CSV Export
    if (exportCsv) {
      const headers = [
        "Lead ID",
        "Name",
        "Email",
        "Phone",
        "Status",
        "Subject",
        "Source",
        "Artwork Scanned",
        "Device Info",
        "Subscribed",
        "Form Title",
        "Page Slug",
        "Source Artwork",
        "Source Event",
        "Selected Event Date",
        "Selected Time Slot",
        "Message",
        "Created At",
      ];

      const csvRows = leads.map((l) => {
        const customFields = l.customFields as Record<string, unknown> | null;
        const selectedDateVal = Array.isArray(customFields?.selectedDates) && (customFields.selectedDates as string[]).length > 0
          ? (customFields.selectedDates as string[]).join("; ")
          : String(customFields?.selectedDate || "");
        const selectedSlotVal = String(customFields?.selectedSlot || "");
        const artTitle = l.artworkTitle || l.artwork?.title || l.sourceArtwork?.title || "";

        return [
          `"${l.id}"`,
          `"${(l.name || "").replace(/"/g, '""')}"`,
          `"${(l.email || "").replace(/"/g, '""')}"`,
          `"${(l.phone || "").replace(/"/g, '""')}"`,
          `"${l.status}"`,
          `"${(l.subject || "").replace(/"/g, '""')}"`,
          `"${(l.source || "").replace(/"/g, '""')}"`,
          `"${artTitle.replace(/"/g, '""')}"`,
          `"${(l.deviceInfo || "").replace(/"/g, '""')}"`,
          `"${l.isSubscribed ? "Yes" : "No"}"`,
          `"${(l.formTitle || "").replace(/"/g, '""')}"`,
          `"${(l.pageSlug || "").replace(/"/g, '""')}"`,
          `"${(l.sourceArtwork?.title || l.artwork?.title || "").replace(/"/g, '""')}"`,
          `"${(l.sourceEvent?.title || "").replace(/"/g, '""')}"`,
          `"${selectedDateVal.replace(/"/g, '""')}"`,
          `"${selectedSlotVal.replace(/"/g, '""')}"`,
          `"${(l.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          `"${new Date(l.createdAt).toISOString()}"`,
        ];
      });

      const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="atelier-leads-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(leads);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
