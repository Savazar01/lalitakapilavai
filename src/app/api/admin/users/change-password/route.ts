import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "better-auth/crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Find the user's credential account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
      },
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { error: "Credential account not found." },
        { status: 404 }
      );
    }

    // Verify current password if provided or required
    if (currentPassword) {
      const isValid = await verifyPassword({
        password: currentPassword,
        hash: account.password,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }
    }

    // Hash and update password
    const hashed = await hashPassword(newPassword);

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashed },
    });

    // Mark mustChangePassword as false
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mustChangePassword: false },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now access the control center.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error changing password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
