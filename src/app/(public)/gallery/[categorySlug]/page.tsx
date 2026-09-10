import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await prisma.artCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return { title: "Category Not Found — Lalita Kapilavai" };
  }

  const titleText = category.heroTitle || category.name;

  return {
    title: `${titleText} — Classical Indian Art Collection | Lalita Kapilavai`,
    description:
      category.description ||
      `Explore authentic masterworks of ${category.name} crafted by Lalita Kapilavai using traditional techniques and 22k gold leaf relief.`,
  };
}

export default async function CategoryGalleryPage({ params }: PageProps) {
  const { categorySlug } = await params;

  const [currentCategory, allCategories] = await Promise.all([
    prisma.artCategory.findUnique({
      where: { slug: categorySlug },
    }),
    prisma.artCategory.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  if (!currentCategory) {
    notFound();
  }

  const categoryArtworks = await prisma.artwork.findMany({
    where: { categoryId: currentCategory.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  // Serialize decimals for client components
  const serializedArtworks = categoryArtworks.map((a) => ({
    ...a,
    price: a.price ? a.price.toString() : null,
  }));

  // Dynamic styling configurations
  const bannerHeight = currentCategory.bannerHeight || 360;
  const objectPosition = currentCategory.imagePosition || "center";
  const overlayOpacity =
    currentCategory.overlayOpacity !== null && currentCategory.overlayOpacity !== undefined
      ? currentCategory.overlayOpacity
      : 0.45;
  const badgeLabel = currentCategory.badgeLabel || "Traditional Fine Art School";
  const heroTitle = currentCategory.heroTitle || currentCategory.name;

  // Border style classes
  const borderClass =
    currentCategory.borderStyle === "none"
      ? "border-0 shadow-none"
      : currentCategory.borderStyle === "subtle"
      ? "border border-border/80 shadow-md"
      : "border-2 border-primary/30 shadow-xl";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* 1. Category Switcher Tabs at the Very Top (No 'All Masterworks' tab) */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {allCategories.map((cat) => {
            const isActive = cat.slug === categorySlug;
            return (
              <Link
                key={cat.id}
                href={`/gallery/${cat.slug}`}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-serif transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-md ring-2 ring-primary/40"
                    : "border border-border/80 bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground font-medium shadow-2xs"
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* 2. Category Hero Header */}
        <div className="max-w-5xl mx-auto space-y-6">
          {currentCategory.coverImage ? (
            <div
              className={`relative w-full rounded-2xl overflow-hidden group ${borderClass}`}
              style={{ height: `${bannerHeight}px` }}
            >
              <img
                src={currentCategory.coverImage}
                alt={currentCategory.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ objectPosition }}
              />
              {/* Dynamic Overlay Scrim */}
              <div
                className="absolute inset-0 bg-background"
                style={{ opacity: overlayOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-left z-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-2 bg-background/85 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  {badgeLabel}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground drop-shadow-sm">
                  {heroTitle}
                </h1>

                {/* Curatorial Note / Description Preview */}
                {currentCategory.curatorialNote ? (
                  <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed max-w-3xl mt-2 line-clamp-3 prose-invert [&_p]:m-0">
                    <TiptapRenderer content={currentCategory.curatorialNote} />
                  </div>
                ) : currentCategory.description ? (
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed max-w-2xl mt-1.5 line-clamp-2">
                    {currentCategory.description}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                {badgeLabel}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
                {heroTitle}
              </h1>

              {currentCategory.curatorialNote ? (
                <div className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  <TiptapRenderer content={currentCategory.curatorialNote} />
                </div>
              ) : currentCategory.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {currentCategory.description}
                </p>
              ) : null}
            </div>
          )}

          {/* Full Curatorial Note Expansion if banner had line-clamp */}
          {currentCategory.coverImage && currentCategory.curatorialNote && (
            <div className="bg-card/40 border border-border/70 rounded-xl p-6 sm:p-8 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                Curatorial Overview &amp; Iconography
              </h3>
              <div className="text-sm text-foreground/90 leading-relaxed">
                <TiptapRenderer content={currentCategory.curatorialNote} />
              </div>
            </div>
          )}
        </div>

        {/* 3. Section Title & Plate Count */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-serif font-bold text-lg text-foreground">
            {currentCategory.name} Archive Plates
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {categoryArtworks.length} {categoryArtworks.length === 1 ? "Masterwork" : "Masterworks"}
          </span>
        </div>

        {/* 4. Filterable Gallery Grid strictly for this category */}
        <GalleryGrid artworks={serializedArtworks} />
      </main>

      <Footer />
    </div>
  );
}
