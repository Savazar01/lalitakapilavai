import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { GalleryGrid } from "@/components/public/gallery-grid";
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

  return {
    title: `${category.name} — Classical Indian Art Collection | Lalita Kapilavai`,
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
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Traditional Fine Art School
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {currentCategory.name}
          </h1>
          {currentCategory.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {currentCategory.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curated masterworks representing centuries of sacred iconography, authentic craftsmanship, and traditional gold leaf relief by Lalita Kapilavai.
            </p>
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
