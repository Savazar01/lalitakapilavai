import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Sparkles } from "lucide-react";
import { BlogArchiveClient } from "@/components/public/blog-archive-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sacred Art & Cultural Chronicle — Lalita Kapilavai",
  description:
    "Explore authoritative writings on 22k gold Tanjore painting techniques, Mysore traditional iconography, and Carnatic musical synesthesia by Lalita Kapilavai.",
  alternates: {
    canonical: "/blogs",
  },
};

export default async function BlogsPage() {
  const [rawPosts, pageData] = await Promise.all([
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.page.findUnique({ where: { slug: "blogs" } }).catch(() => null),
  ]);

  const headerTitle = pageData?.title || "Sacred Art & Cultural Chronicle";
  const headerSubtitle =
    pageData?.metaDescription ||
    "Scholarly perspectives on classical South Indian visual arts, sacred iconography, 22-carat gold relief traditions, and Carnatic musical synesthesia.";

  const posts = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featuredImageUrl: p.featuredImageUrl,
    author: p.author,
    tags: p.tags,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Curatorial Chronicle &amp; Insights
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {headerTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {headerSubtitle}
          </p>
        </div>

        {/* 4-Column Card Grid with Search & Filters */}
        <BlogArchiveClient initialPosts={posts} />
      </main>

      <Footer />
    </div>
  );
}
