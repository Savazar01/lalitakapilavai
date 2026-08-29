import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: Prisma.BlogPostWhereInput = {};

    if (status === "PUBLISHED") {
      where.isPublished = true;
    } else if (status === "DRAFT") {
      where.isPublished = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching posts";
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

    const existing = await prisma.blogPost.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Construct structured Schema.org JSON-LD for AI search engines & Google
    const structuredJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: metaTitle || title,
      description: metaDescription || excerpt || "",
      image: featuredImageUrl || undefined,
      author: {
        "@type": "Person",
        name: author || "Lalita Kapilavai",
        jobTitle: "Traditional Indian Fine Artist & Carnatic Classical Vocalist",
      },
      publisher: {
        "@type": "Organization",
        name: "Lalita Kapilavai Archive",
        logo: {
          "@type": "ImageObject",
          url: "https://media.lalitakapilavai.com/logo.png",
        },
      },
      keywords: tagArray.join(", "),
      datePublished: isPublished ? new Date().toISOString() : undefined,
      dateModified: new Date().toISOString(),
    };

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt: excerpt || "",
        content: content || "",
        featuredImageUrl: featuredImageUrl || null,
        author: author || "Lalita Kapilavai",
        tags: tagArray,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        structuredJsonLd,
        isPublished: Boolean(isPublished),
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
