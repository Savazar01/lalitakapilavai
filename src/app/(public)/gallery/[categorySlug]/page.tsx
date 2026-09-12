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

  const [currentCategory, rootCategories] = await Promise.all([
    prisma.artCategory.findUnique({
      where: { slug: categorySlug },
      include: {
        parent: {
          include: {
            children: { orderBy: { displayOrder: "asc" } },
          },
        },
        children: {
          orderBy: { displayOrder: "asc" },
        },
      },
    }),
    prisma.artCategory.findMany({
      where: { parentId: null, isActive: true, isDeleted: false },
      orderBy: [{ sortOrder: "asc" }, { displayOrder: "asc" }],
    }),
  ]);

  if (!currentCategory || !currentCategory.isActive || currentCategory.isDeleted) {
    notFound();
  }

  // Hierarchy Resolution:
  // Is this category a parent or a sub-category?
  const isChild = !!currentCategory.parent;
  const rootCategory = isChild ? currentCategory.parent! : currentCategory;
  const subCategories = isChild
    ? currentCategory.parent!.children
    : currentCategory.children;
  const hasSubCategories = subCategories.length > 0;

  // Artwork aggregation:
  // If parent: fetch artworks in parent AND all child sub-categories
  // If sub-category: fetch strictly for this sub-category
  const categoryIdsToQuery = isChild
    ? [currentCategory.id]
    : [currentCategory.id, ...currentCategory.children.map((c) => c.id)];

  const categoryArtworks = await prisma.artwork.findMany({
    where: {
      categoryId: { in: categoryIdsToQuery },
      isActive: true,
      isDeleted: false,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
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
  const badgeLabel = currentCategory.badgeLabel || (isChild ? `${rootCategory.name} Sub-School` : "Traditional Fine Art School");
  const heroTitle = currentCategory.heroTitle || currentCategory.name;

  // Border style classes
  const borderClass =
    currentCategory.borderStyle === "none"
      ? "border-0 shadow-none"
      : currentCategory.borderStyle === "subtle"
      ? "border border-stone-300 dark:border-stone-800 shadow-md"
      : "border-2 border-primary/40 shadow-xl";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* 1. Primary Root Category Switcher Tabs at the Very Top */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {rootCategories.map((cat) => {
            const isRootActive = cat.slug === rootCategory.slug;
            return (
              <Link
                key={cat.id}
                href={`/gallery/${cat.slug}`}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-serif transition-all duration-200",
                  isRootActive
                    ? "bg-amber-700 text-white font-bold shadow-md border border-amber-800 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-400"
                    : "border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 font-semibold shadow-2xs"
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
              className={`relative w-full rounded-2xl overflow-hidden group shadow-md border border-stone-300 dark:border-stone-800 ${borderClass}`}
              style={{ height: `${bannerHeight}px` }}
            >
              <img
                src={currentCategory.coverImage}
                alt={currentCategory.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ objectPosition }}
              />
              {/* Dynamic Overlay Scrim: Permanent Dark Scrim Invariant (AGENTS.md Section 7.2) */}
              <div
                className="absolute inset-0 bg-black/60"
                style={{ opacity: Math.max(0.6, overlayOpacity) }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-left z-10 [color-scheme:dark]">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/40 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  {badgeLabel}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-md">
                  {heroTitle}
                </h1>

                {/* Curatorial Note / Description Preview */}
                {currentCategory.curatorialNote ? (
                  <div className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-3xl mt-2 line-clamp-3 prose prose-invert [&_p]:m-0">
                    <TiptapRenderer content={currentCategory.curatorialNote} contrast="dark-bg" />
                  </div>
                ) : currentCategory.description ? (
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-2xl mt-1.5 line-clamp-2 font-medium">
                    {currentCategory.description}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                {badgeLabel}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
                {heroTitle}
              </h1>

              {currentCategory.curatorialNote ? (
                <div className="text-sm text-stone-800 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
                  <TiptapRenderer content={currentCategory.curatorialNote} />
                </div>
              ) : currentCategory.description ? (
                <p className="text-sm text-stone-800 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto font-medium">
                  {currentCategory.description}
                </p>
              ) : null}
            </div>
          )}

          {/* Full Curatorial Note Expansion if banner had line-clamp */}
          {currentCategory.coverImage && currentCategory.curatorialNote && (
            <div className="bg-white dark:bg-[#151B26] border border-stone-300 dark:border-stone-800 rounded-xl p-6 sm:p-8 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-900 dark:text-amber-400 font-bold">
                Curatorial Overview &amp; Iconography
              </h3>
              <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                <TiptapRenderer content={currentCategory.curatorialNote} />
              </div>
            </div>
          )}
        </div>

        {/* 2.5 Secondary Sub-Category Pill Bar (When Root has Sub-categories) */}
        {hasSubCategories && (
          <div className="max-w-5xl mx-auto pt-1">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 dark:text-amber-400 font-bold">
                  {rootCategory.name} Schools:
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                {/* Pill 1: All Root */}
                <Link
                  href={`/gallery/${rootCategory.slug}`}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-serif transition-all",
                    !isChild
                      ? "bg-amber-700 text-white font-bold border border-amber-800 shadow-xs dark:bg-amber-500 dark:text-stone-950 dark:border-amber-400"
                      : "bg-white text-stone-800 hover:bg-stone-100 hover:text-stone-950 font-semibold border border-stone-300 shadow-2xs dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-slate-800 dark:hover:text-white dark:border-stone-800"
                  )}
                >
                  All {rootCategory.name}
                </Link>

                {/* Sub-Category Pills */}
                {subCategories.map((sub) => {
                  const isSubActive = currentCategory.slug === sub.slug;
                  return (
                    <Link
                      key={sub.id}
                      href={`/gallery/${sub.slug}`}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-serif transition-all",
                        isSubActive
                          ? "bg-amber-700 text-white font-bold border border-amber-800 shadow-xs dark:bg-amber-500 dark:text-stone-950 dark:border-amber-400"
                          : "bg-white text-stone-800 hover:bg-stone-100 hover:text-stone-950 font-semibold border border-stone-300 shadow-2xs dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-slate-800 dark:hover:text-white dark:border-stone-800"
                      )}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
