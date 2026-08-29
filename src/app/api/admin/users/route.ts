import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching users";
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

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full Name, Email Address, and Initial Password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          role: (role as Role) || Role.ADMIN,
          status: "ACTIVE",
          emailVerified: true,
        },
      });

      await tx.account.create({
        data: {
          userId: u.id,
          accountId: u.id,
          providerId: "credential",
          issuer: "local:credential",
          password: hashedPassword,
        },
      });

      return u;
    });

    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
