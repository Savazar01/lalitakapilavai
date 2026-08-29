import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadStatus, Prisma } from "@prisma/client";

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
    const searchParam = searchParams.get("search");
    const exportCsv = searchParams.get("export") === "csv";

    const where: Prisma.LeadWhereInput = {};

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam as LeadStatus;
    }

    if (searchParam) {
      where.OR = [
        { name: { contains: searchParam, mode: "insensitive" } },
        { email: { contains: searchParam, mode: "insensitive" } },
        { phone: { contains: searchParam, mode: "insensitive" } },
        { subject: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
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
        "Source Artwork",
        "Source Event",
        "Message",
        "Created At",
      ];

      const csvRows = leads.map((l) => [
        `"${l.id}"`,
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.email.replace(/"/g, '""')}"`,
        `"${(l.phone || "").replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${(l.subject || "").replace(/"/g, '""')}"`,
        `"${(l.sourceArtwork?.title || "").replace(/"/g, '""')}"`,
        `"${(l.sourceEvent?.title || "").replace(/"/g, '""')}"`,
        `"${l.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${new Date(l.createdAt).toISOString()}"`,
      ]);

      const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="lalita-kapilavai-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(leads);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
