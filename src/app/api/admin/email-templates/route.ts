import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure all default templates exist
    let templates = await prisma.emailTemplateConfig.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (templates.length < DEFAULT_EMAIL_TEMPLATES.length) {
      for (const def of DEFAULT_EMAIL_TEMPLATES) {
        const found = templates.find((t) => t.triggerType === def.triggerType);
        if (!found) {
          await prisma.emailTemplateConfig.create({
            data: def,
          });
        }
      }
      templates = await prisma.emailTemplateConfig.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch email templates";
    console.error("[EmailTemplates GET] Error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templates } = body;

    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: "Invalid templates payload" }, { status: 400 });
    }

    const updated = [];
    for (const t of templates) {
      if (!t.triggerType) continue;

      const record = await prisma.emailTemplateConfig.upsert({
        where: { triggerType: t.triggerType },
        update: {
          name: t.name || t.triggerType,
          adminSubject: t.adminSubject,
          adminBodyTemplate: t.adminBodyTemplate,
          sendUserReceipt: t.sendUserReceipt !== undefined ? Boolean(t.sendUserReceipt) : true,
          userSubject: t.userSubject || null,
          userBodyTemplate: t.userBodyTemplate || null,
        },
        create: {
          triggerType: t.triggerType,
          name: t.name || t.triggerType,
          adminSubject: t.adminSubject || "Inbound Notification",
          adminBodyTemplate: t.adminBodyTemplate || "<p>{message}</p>",
          sendUserReceipt: t.sendUserReceipt !== undefined ? Boolean(t.sendUserReceipt) : true,
          userSubject: t.userSubject || null,
          userBodyTemplate: t.userBodyTemplate || null,
        },
      });
      updated.push(record);
    }

    return NextResponse.json({ success: true, templates: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update email templates";
    console.error("[EmailTemplates PUT] Error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
