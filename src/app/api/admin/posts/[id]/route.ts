import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImageUrl,
      author,
      tags,
      metaTitle,
      metaDescription,
      isPublished,
    } = body;

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const cleanSlug = slug
      ? slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-")
      : existing.slug;

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : existing.tags;

    const structuredJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: metaTitle || title || existing.title,
      description: metaDescription || excerpt || existing.excerpt || "",
      image: featuredImageUrl || existing.featuredImageUrl || undefined,
      author: {
        "@type": "Person",
        name: author || existing.author || "Lalita Kapilavai",
      },
      keywords: tagArray.join(", "),
      datePublished:
        existing.publishedAt?.toISOString() ||
        (isPublished ? new Date().toISOString() : undefined),
      dateModified: new Date().toISOString(),
    };

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: cleanSlug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        featuredImageUrl:
          featuredImageUrl !== undefined ? featuredImageUrl : existing.featuredImageUrl,
        author: author !== undefined ? author : existing.author,
        tags: tagArray,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription:
          metaDescription !== undefined ? metaDescription : existing.metaDescription,
        structuredJsonLd,
        isPublished:
          isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
        publishedAt:
          isPublished && !existing.isPublished
            ? new Date()
            : existing.publishedAt,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
