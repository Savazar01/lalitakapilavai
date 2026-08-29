"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: unknown;
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

export function BlogArchiveClient({ initialPosts }: { initialPosts: BlogPostData[] }) {
  const [search, setSearch] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string>("ALL");

  // Collect all unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    initialPosts.forEach((post) => {
      post.tags?.forEach((t) => tagSet.add(t.trim()));
    });
    return Array.from(tagSet).filter(Boolean);
  }, [initialPosts]);

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch =
        !search.trim() ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase())) ||
        post.author.toLowerCase().includes(search.toLowerCase());

      const matchesTag =
        selectedTag === "ALL" ||
        post.tags?.some((t) => t.trim().toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [initialPosts, search, selectedTag]);

  return (
    <div className="space-y-10 w-full">
      {/* Search & Tag Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search articles, iconography, ragas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs bg-card/60 border-border/80 rounded-full h-10 shadow-sm focus-visible:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTag("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTag === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card/60 border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            All Essays ({initialPosts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card/60 border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Responsive Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary" />
          <h3 className="font-serif text-lg font-bold text-foreground">
            No Articles Found
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {search || selectedTag !== "ALL"
              ? "No writings match your selected filters. Try clearing search keywords."
              : "Curatorial essays and devotional art studies are being transcribed into the digital archive. Please check back soon."}
          </p>
          {(search || selectedTag !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedTag("ALL");
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPosts.map((post, index) => {
              const displayDate = post.publishedAt || post.createdAt;
              const formattedDate = new Date(displayDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const readTime = estimateReadingTime(post.excerpt);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                  className="flex"
                >
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="group flex flex-col w-full rounded-2xl border border-border/80 bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Card Cover Image */}
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

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Meta stats */}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" /> {formattedDate}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" /> {readTime} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-serif font-bold">
                            {post.author ? post.author.charAt(0) : "L"}
                          </div>
                          <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[110px]">
                            {post.author || "Lalita Kapilavai"}
                          </span>
                        </div>
                        <span className="text-primary font-semibold text-[11px] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
