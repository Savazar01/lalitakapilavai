import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";

    if (!identifier) {
      return NextResponse.json({ email: null }, { status: 400 });
    }

    // 1. If it's already an email, return as-is
    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier.toLowerCase() });
    }

    // 2. Query user by username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: "insensitive" } },
          { name: { equals: identifier, mode: "insensitive" } },
        ],
      },
      select: {
        email: true,
        mustChangePassword: true,
      },
    });

    if (user?.email) {
      return NextResponse.json({
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      });
    }

    // Fallback for default local bootstrap admin username
    if (identifier.toLowerCase() === "savazai_admin") {
      const fallbackAdmin = await prisma.user.findFirst({
        where: {
          role: "SUPER_ADMIN",
        },
        select: {
          email: true,
          mustChangePassword: true,
        },
      });
      if (fallbackAdmin?.email) {
        return NextResponse.json({
          email: fallbackAdmin.email,
          mustChangePassword: fallbackAdmin.mustChangePassword,
        });
      }
    }

    return NextResponse.json({ email: null, error: "Identifier not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error resolving identifier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
