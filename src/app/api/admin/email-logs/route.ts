import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const triggerType = searchParams.get("triggerType")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const isExport = searchParams.get("export") === "csv";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: Prisma.EmailDispatchLogWhereInput = {};

    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: "insensitive" } },
        { sender: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { errorMessage: { contains: search, mode: "insensitive" } },
      ];
    }

    if (triggerType && triggerType !== "all") {
      where.triggerType = { startsWith: triggerType };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (isExport) {
      // Export all matching logs up to 1000
      const logs = await prisma.emailDispatchLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      // Generate RFC-compliant CSV
      const headers = ["ID", "Timestamp (IST)", "Recipient", "Sender", "Trigger Type", "Subject", "Status", "Error Message"];
      const escapeCsv = (str: string | null | undefined) => {
        if (!str) return '""';
        return `"${str.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
      };

      const rows = logs.map((log) => [
        escapeCsv(log.id),
        escapeCsv(new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })),
        escapeCsv(log.recipient),
        escapeCsv(log.sender),
        escapeCsv(log.triggerType),
        escapeCsv(log.subject),
        escapeCsv(log.status),
        escapeCsv(log.errorMessage || ""),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="atelier-email-audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const [total, logs] = await Promise.all([
      prisma.emailDispatchLog.count({ where }),
      prisma.emailDispatchLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch email logs";
    console.error("[EmailLogs GET] Error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
