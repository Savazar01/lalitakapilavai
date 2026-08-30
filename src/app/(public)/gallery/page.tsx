import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { Sparkles } from "lucide-react";

import { DynamicPageSections } from "@/components/public/dynamic-page-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fine Art Gallery & Tanjore Archive — Lalita Kapilavai",
  description:
    "Explore authentic 22k gold foil Tanjore paintings, classical Mysore traditional art, and sacred Indian iconography by Lalita Kapilavai.",
};

export default async function GalleryPage() {
  const [artworks, categories, pageData] = await Promise.all([
    prisma.artwork.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.artCategory.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.page
      .findUnique({
        where: { slug: "gallery" },
        include: {
          sections: {
            orderBy: { orderIndex: "asc" },
            include: {
              subSections: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      })
      .catch(() => null),
  ]);

  const headerTitle = pageData?.title || "Traditional Art Gallery";
  const headerSubtitle =
    pageData?.metaDescription ||
    "Five centuries of classical sacred painting traditions preserved through authentic 22-carat gold foil relief work, purified gesso, and semi-precious Jaipur gemstones.";

  // Serialize decimals for client components
  const serializedArtworks = artworks.map((a) => ({
    ...a,
    price: a.price ? a.price.toString() : null,
  }));

  const hasCustomSections = pageData?.sections && pageData.sections.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Dynamic Page Builder Sections or Fallback Header */}
      {hasCustomSections ? (
        <DynamicPageSections sections={pageData.sections} />
      ) : (
        <div className="text-center max-w-2xl mx-auto pt-12 sm:pt-16 pb-6 px-4 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Sacred Vault
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {headerTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {headerSubtitle}
          </p>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">

        {/* Dynamic Filterable Gallery Grid */}
        <GalleryGrid artworks={serializedArtworks} categories={categories} />
      </main>

      <Footer />
    </div>
  );
}
