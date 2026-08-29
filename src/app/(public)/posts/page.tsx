import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Insights & Cultural Essays — Lalita Kapilavai",
  description:
    "Explore authoritative writings on 22k gold Tanjore painting techniques, Mysore traditional iconography, and Carnatic musical synesthesia by Lalita Kapilavai.",
};

export default async function BlogArchivePage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Archive Insights &amp; Scholarship
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            Cultural Essays &amp; Notes
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scholarly perspectives on classical South Indian visual arts, sacred iconography, 22-carat gold relief traditions, and Carnatic musical synesthesia.
          </p>
        </div>

        {/* Blog Post Grid */}
        {posts.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              No Published Articles Yet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Curatorial essays and devotional art studies are being transcribed into the digital archive. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const dateStr = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

              // Rough reading time calculation
              const wordCount = post.content ? post.content.split(/\s+/).length : 200;
              const readMinutes = Math.max(1, Math.round(wordCount / 200));

              return (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-border/80 bg-card/60 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  {post.featuredImageUrl && (
                    <Link
                      href={`/posts/${post.slug}`}
                      className="relative aspect-16/9 overflow-hidden bg-muted/40 block"
                    >
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          {readMinutes} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((t, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] py-0">
                            {t}
                          </Badge>
                        ))}
                      </div>

                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-serif font-semibold text-primary hover:underline"
                      >
                        Read Essay
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
