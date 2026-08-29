import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  User,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return { title: "Article Not Found — Lalita Kapilavai" };
  }

  const title = post.metaTitle || `${post.title} — Lalita Kapilavai`;
  const description =
    post.metaDescription ||
    post.excerpt ||
    "Authoritative writings on classical Tanjore art and Carnatic music heritage.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: post.featuredImageUrl ? [{ url: post.featuredImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const wordCount = post.content ? post.content.split(/\s+/).length : 300;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  // Generative Engine Optimization (AEO) JSON-LD Schema
  const jsonLd = post.structuredJsonLd || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: "Traditional Indian Fine Artist & Carnatic Classical Vocalist",
      url: "https://lalitakapilavai.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Lalita Kapilavai Digital Archive",
      logo: {
        "@type": "ImageObject",
        url: "https://lalitakapilavai.com/logo.png",
      },
    },
    keywords: post.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lalitakapilavai.com/posts/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Generative Engine Structured Data (AEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Essays
          </Link>

          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Author Provenance & Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-y border-border/60 py-3 font-mono">
            <span className="flex items-center gap-1.5 text-foreground font-semibold font-serif">
              <User className="w-3.5 h-3.5 text-primary" />
              {post.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {dateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {readMinutes} min read
            </span>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.featuredImageUrl && (
          <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden border border-border/80 mb-10 shadow-md">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt / Lead Paragraph */}
        {post.excerpt && (
          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 mb-10">
            <p className="font-serif italic text-base sm:text-lg text-foreground/90 leading-relaxed">
              &quot;{post.excerpt}&quot;
            </p>
          </div>
        )}

        {/* Article Body Rendered via High-Fidelity Tiptap Engine */}
        <article className="prose prose-stone dark:prose-invert max-w-none text-foreground/90 font-serif leading-relaxed space-y-6">
          <TiptapRenderer content={post.content} />
        </article>

        {/* Post-Article Acquisition & Engagement Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Curatorial Inquiries &amp; Fine Art Commissions
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Lalita Kapilavai accepts private commissions for authentic Tanjore masterworks with certified 22k gold foil relief, Mysore traditional paintings, and vocal recital engagements.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/commission">
              <Button variant="gold" size="sm" className="font-serif font-bold text-xs gap-1.5 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" />
                Commission a Masterwork
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                View Artwork Catalog
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
