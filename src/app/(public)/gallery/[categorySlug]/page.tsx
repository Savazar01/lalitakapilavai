import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { Sparkles, ArrowLeft } from "lucide-react";

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

  const [currentCategory, allCategories, artworks] = await Promise.all([
    prisma.artCategory.findUnique({
      where: { slug: categorySlug },
    }),
    prisma.artCategory.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.artwork.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  if (!currentCategory) {
    notFound();
  }

  // Count artworks under this specific school
  const categoryArtworksCount = artworks.filter(
    (a) => a.categoryId === currentCategory.id
  ).length;

  // Serialize decimals for client components
  const serializedArtworks = artworks.map((a) => ({
    ...a,
    price: a.price ? a.price.toString() : null,
  }));

  // Dynamic styling configurations
  const bannerHeight = currentCategory.bannerHeight || 360;
  const objectPosition = currentCategory.imagePosition || "center";
  const overlayOpacity = currentCategory.overlayOpacity !== null && currentCategory.overlayOpacity !== undefined 
    ? currentCategory.overlayOpacity 
    : 0.45;
  const badgeLabel = currentCategory.badgeLabel || "Traditional Fine Art School";
  const heroTitle = currentCategory.heroTitle || currentCategory.name;

  // Border style classes
  const borderClass = currentCategory.borderStyle === "none"
    ? "border-0 shadow-none"
    : currentCategory.borderStyle === "subtle"
    ? "border border-border/80 shadow-md"
    : "border-2 border-primary/30 shadow-xl"; // "gold-fillet" default

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Masterworks
          </Link>

          <span className="text-xs font-mono text-muted-foreground">
            {categoryArtworksCount} {categoryArtworksCount === 1 ? "Artwork" : "Artworks"} in Archive
          </span>
        </div>

        {/* Category Hero Header */}
        <div className="max-w-5xl mx-auto mb-12 space-y-6">
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
            <div className="text-center max-w-3xl mx-auto space-y-4">
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
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Curated masterworks representing centuries of sacred iconography, authentic craftsmanship, and traditional gold leaf relief by Lalita Kapilavai.
                </p>
              )}
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

        {/* Filterable Gallery Grid initialized to this category */}
        <GalleryGrid
          artworks={serializedArtworks}
          categories={allCategories}
          initialCategorySlug={categorySlug}
        />
      </main>

      <Footer />
    </div>
  );
}
