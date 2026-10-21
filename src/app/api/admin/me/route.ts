import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        mustChangePassword: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
