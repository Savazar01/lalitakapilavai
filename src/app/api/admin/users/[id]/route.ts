import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { Role } from "@prisma/client";

export async function PATCH(
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

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, status, newPassword } = body;

    // If changing to SUSPENDED, revoke active sessions
    if (status === "SUSPENDED") {
      await prisma.session.deleteMany({
        where: { userId: id },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        role: role ? (role as Role) : undefined,
        status: status ? status : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // If password reset requested
    if (newPassword && typeof newPassword === "string" && newPassword.length >= 8) {
      const hashedPassword = await hashPassword(newPassword);
      await prisma.account.updateMany({
        where: {
          userId: id,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      });

      // Invalidate all active sessions to force re-login with new password
      await prisma.session.deleteMany({
        where: { userId: id },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating user";
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

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Superadmin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent self-deletion of the active Superadmin
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Action Denied: You cannot delete your own active Superadmin account." },
        { status: 400 }
      );
    }

    // Cascade delete accounts and sessions
    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
