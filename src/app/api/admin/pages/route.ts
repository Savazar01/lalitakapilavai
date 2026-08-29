import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { sections: true },
        },
      },
    });

    return NextResponse.json(pages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching pages";
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

    const body = await request.json();
    const { title, slug, metaDescription } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.page.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A page with this URL slug already exists" },
        { status: 409 }
      );
    }

    // Create page with an initial Hero Section and SubSection
    const newPage = await prisma.page.create({
      data: {
        title,
        slug: cleanSlug,
        metaDescription,
        sections: {
          create: [
            {
              title: "Hero Section",
              orderIndex: 1,
              gridSpan: 12,
              backgroundColor: "#FAF7F2",
              subSections: {
                create: [
                  {
                    title: "Hero Content",
                    orderIndex: 1,
                    gridSpan: 12,
                    content: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 1 },
                          content: [{ type: "text", text: title }],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Sacred Tanjore gold foil art, classical Mysore paintings, and Carnatic musical archives.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        sections: {
          include: { subSections: true },
        },
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
