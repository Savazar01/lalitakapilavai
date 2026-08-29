"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  author: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
}

function estimateReadingTime(content: unknown): number {
  if (!content) return 2;
  const str = typeof content === "string" ? content : JSON.stringify(content);
  const words = str.replace(/[^\w\s]/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogGridEmbed({ limit = 4 }: { limit?: number }) {
  const [posts, setPosts] = React.useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function loadBlogs() {
      try {
        const res = await fetch(`/api/blogs?limit=${limit}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load blog embed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadBlogs();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card/60 overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-[16/10] bg-muted/40 w-full" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-muted/50 rounded w-1/3" />
              <div className="h-5 bg-muted/60 rounded w-3/4" />
              <div className="h-3 bg-muted/40 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Curatorial Essays & Chronicle
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-1">
            Latest from the Sacred Arts Archive
          </h3>
        </div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => {
          const displayDate = post.publishedAt || post.createdAt;
          const formattedDate = new Date(displayDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const readTime = estimateReadingTime(post.excerpt);

          return (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-border/80 bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                {post.featuredImageUrl ? (
                  <img
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
                    <Sparkles className="w-10 h-10" />
                  </div>
                )}
                {post.tags && post.tags[0] && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-background/90 text-foreground backdrop-blur-md border border-border/60 uppercase tracking-wider">
                    {post.tags[0]}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> {readTime} min read
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                  {post.title}
                </h4>

                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>
                )}

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-auto">
                  <span className="text-[11px] font-medium text-foreground/80">
                    {post.author || "Lalita Kapilavai"}
                  </span>
                  <span className="text-primary font-semibold text-[11px] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
