"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  dimensions: string;
  medium: string;
  yearCreated: number;
  hasGoldFoil: boolean;
  price: string | number | null;
  isAvailable: boolean;
  watermarkedWebpUrl: string;
  category: Category;
  categoryId: string;
}

export function GalleryGrid({
  artworks,
  categories,
}: {
  artworks: Artwork[];
  categories: Category[];
}) {
  const [selectedCat, setSelectedCat] = React.useState("ALL");

  const filtered = artworks.filter((art) => {
    if (selectedCat === "ALL") return true;
    return art.categoryId === selectedCat;
  });

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        <Button
          variant={selectedCat === "ALL" ? "gold" : "outline"}
          size="sm"
          onClick={() => setSelectedCat("ALL")}
          className="text-xs font-serif font-semibold h-8"
        >
          All Masterworks ({artworks.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCat === cat.id ? "gold" : "outline"}
            size="sm"
            onClick={() => setSelectedCat(cat.id)}
            className="text-xs font-serif font-semibold h-8"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Animated Artwork Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Palette className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="font-serif text-sm">No artworks currently listed under this school.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((art) => (
              <motion.div
                key={art.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  href={`/artwork/${art.slug}`}
                  className="group block rounded-xl overflow-hidden border border-border/80 bg-card hover:border-primary/60 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between h-full"
                >
                  {/* Image Container with Copy Deterrence */}
                  <div
                    className="relative aspect-[4/5] bg-muted/30 overflow-hidden select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <Image
                      src={art.watermarkedWebpUrl}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Corner Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <Badge variant="outline" className="text-[10px] bg-background/85 backdrop-blur-md">
                        {art.category.name}
                      </Badge>
                      {art.hasGoldFoil && (
                        <Badge variant="gold" className="text-[9px] shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 mr-1" />
                          22k Gold Foil
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={art.isAvailable ? "gold" : "outline"}
                        className="text-[10px] uppercase bg-background/85 backdrop-blur-md"
                      >
                        {art.isAvailable ? "Available" : "Acquired"}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {art.title}
                        </h3>
                        {art.price && (
                          <span className="font-mono text-xs font-bold text-primary shrink-0">
                            ₹{Number(art.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {art.medium}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground/80">
                        {art.dimensions} • {art.yearCreated}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-primary font-serif font-semibold">
                      <span>Explore Masterwork</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
