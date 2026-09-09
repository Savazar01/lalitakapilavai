import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { CatalogPrintButton } from "@/components/public/catalog-print-button";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Sparkles,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await prisma.eCatalog.findUnique({
    where: { slug },
  });

  if (!catalog) {
    return { title: "Catalog Not Found — Lalita Kapilavai" };
  }

  return {
    title: `${catalog.title} — Digital Exhibition e-Catalog | Lalita Kapilavai`,
    description:
      catalog.subtitle ||
      `Explore the digital exhibition catalog and curated plates of ${catalog.title} featuring traditional fine art by Lalita Kapilavai.`,
  };
}

export default async function ECatalogReaderPage({ params }: PageProps) {
  const { slug } = await params;

  const catalog = await prisma.eCatalog.findUnique({
    where: { slug },
    include: {
      event: true,
      items: {
        orderBy: { pageNumber: "asc" },
        include: {
          artwork: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!catalog || (!catalog.isPublished && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const themeConfig = (catalog.themeConfig as Record<string, unknown> | null) || {};
  const coverConfig = (catalog.coverConfig as Record<string, unknown> | null) || {};
  const endPageConfig = (catalog.endPageConfig as Record<string, unknown> | null) || {};

  const orientation = catalog.orientation === "landscape" ? "landscape" : "portrait";
  const frameStyle = (themeConfig.frameStyle as string) || "gold-fillet";

  const frameClass =
    frameStyle === "double-fillet"
      ? "catalog-frame-double border-4 border-double border-primary/60"
      : frameStyle === "silk-border"
      ? "catalog-frame-silk border-2 border-amber-600/70 shadow-[inset_0_0_0_3px_#1C1814,inset_0_0_0_4.5px_#D4AF37]"
      : frameStyle === "none"
      ? "border-none"
      : "catalog-frame-gold border-2 border-primary/50 shadow-[inset_0_0_0_2px_#1C1814,inset_0_0_0_3.5px_#D4AF37]";

  const bgColor = (themeConfig.backgroundColor as string) || "#1C1814";
  const textColor = (themeConfig.textColor as string) || "#FAF7F2";

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground ${
        orientation === "landscape" ? "catalog-landscape" : "catalog-portrait"
      }`}
    >
      {/* Hide standard navbar when printing */}
      <div className="print-hidden">
        <Navbar />
      </div>

      <main className="catalog-document flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12 print:p-0 print:m-0 print:max-w-none print:space-y-0">
        {/* Navigation & Actions Top Bar */}
        <div
          data-catalog-toolbar="true"
          className="flex items-center justify-between border-b border-primary/20 pb-4 print-hidden"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Gallery
          </Link>

          <div className="flex items-center gap-3">
            <CatalogPrintButton catalogTitle={catalog.title} />

            {catalog.downloadablePdfUrl ? (
              <a
                href={catalog.downloadablePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3.5 py-1.5 rounded-md border border-border shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Pre-Compiled PDF
              </a>
            ) : null}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 1: BOOK COVER (Strict Single Page on Print)                   */}
        {/* ------------------------------------------------------------------ */}
        <section className="catalog-page cover-page relative rounded-3xl overflow-hidden p-6 sm:p-12 text-center flex flex-col justify-between print:rounded-none">
          <div className={`catalog-frame ${frameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}>
            {/* Header / Subtitle */}
            <div className="space-y-4 pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Exhibition Monograph &amp; Archival Collection
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-tight max-w-3xl mx-auto drop-shadow-md">
                {catalog.title}
              </h1>

              {catalog.subtitle && (
                <p className="text-sm sm:text-base font-serif italic text-muted-foreground max-w-xl mx-auto">
                  {catalog.subtitle}
                </p>
              )}

              {catalog.forewordBy && (
                <div className="pt-2 text-xs uppercase tracking-widest text-foreground/80 font-mono">
                  Curated by <span className="text-primary font-bold">{catalog.forewordBy}</span>
                </div>
              )}
            </div>

            {/* Visual Cover Plate */}
            {catalog.coverImageUrl && (
              <div className="plate-image-container py-4 flex-1 flex items-center justify-center">
                <div className="rounded-xl overflow-hidden border border-primary/30 shadow-2xl max-h-[44vh] print:max-h-[50vh]">
                  <img
                    src={catalog.coverImageUrl}
                    alt={catalog.title}
                    className="w-full h-auto object-contain max-h-[44vh] print:max-h-[50vh] mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-4 border-t border-primary/20 space-y-1">
              {catalog.event && (
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span>Official Monograph of {catalog.event.title} • {catalog.event.venue}</span>
                </div>
              )}
              <p className="text-[11px] font-mono text-muted-foreground/70">
                Published by the Atelier of Lalita Kapilavai • Sacred Art &amp; Heritage
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 2: CURATORIAL ESSAY (If Present, Strict Single Page on Print) */}
        {/* ------------------------------------------------------------------ */}
        {catalog.curatorialEssay && (
          <section className="catalog-page essay-page relative rounded-3xl overflow-hidden p-6 sm:p-12 flex flex-col justify-between print:rounded-none">
            <div className={`catalog-frame ${frameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}>
              <div className="border-b border-primary/20 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Curatorial Statement &amp; Scholarly Monograph
                </span>
                <BookOpen className="w-4 h-4 text-primary" />
              </div>

              <div className="prose prose-sm sm:prose-base dark:prose-invert font-serif leading-relaxed text-foreground/90 max-w-none flex-1 overflow-y-auto print:overflow-visible py-4 text-justify">
                <TiptapRenderer content={catalog.curatorialEssay} />
              </div>

              <div className="pt-3 border-t border-primary/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{catalog.title}</span>
                <span>Curatorial Preface</span>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGES 3 to N: ARTWORK PLATES (Strictly 1 Masterwork Per Page)      */}
        {/* ------------------------------------------------------------------ */}
        {catalog.items.map((item, idx) => {
          const layoutMode = item.plateLayout || catalog.plateLayout || "SIDE_BY_SIDE";

          return (
            <section
              key={item.id}
              className="catalog-page plate-page relative rounded-3xl overflow-hidden p-6 sm:p-10 flex flex-col justify-between print:rounded-none"
            >
              <div
                className={`catalog-frame ${frameClass} p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}
              >
                {/* Plate Header (Plate number & Traditional school) */}
                <div className="flex items-center justify-between border-b border-primary/20 pb-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/15 text-primary font-mono font-bold text-xs flex items-center justify-center border border-primary/30">
                      {item.pageNumber || idx + 1}
                    </div>
                    <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Plate {item.pageNumber || idx + 1} of {catalog.items.length}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-primary font-bold uppercase">
                    {item.artwork.category?.name || "Traditional Indian School"}
                  </span>
                </div>

                {/* Conditional Plate Layout */}
                {layoutMode === "SIDE_BY_SIDE" ? (
                  <div className="plate-body-grid grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6 items-center flex-1 my-auto overflow-hidden">
                    {/* Left Column: Framed Masterwork Plate */}
                    <div className="plate-image-col md:col-span-7 print:col-span-7 flex items-center justify-center max-h-[68vh] print:max-h-[62vh]">
                      <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-background/50 shadow-2xl group max-h-full">
                        <img
                          src={item.artwork.primaryImageUrl}
                          alt={item.artwork.title}
                          className="max-h-[60vh] print:max-h-[58vh] max-w-full w-auto object-contain rounded shadow-2xl mx-auto group-hover:scale-101 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-primary/30 flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-mono font-semibold text-primary">
                            {item.artwork.hasGoldFoil ? "22k Gold Foil Masterwork" : "Traditional Classical Masterwork"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Curatorial Details & Specifications */}
                    <div className="plate-details-col md:col-span-5 print:col-span-5 flex flex-col justify-center space-y-3.5 text-left">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 rounded mb-2 font-mono uppercase tracking-wider">
                          {item.artwork.category?.name || "Traditional Indian School"}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-serif text-foreground font-bold leading-tight">
                          {item.artwork.title}
                        </h3>
                        <p className="text-sm text-stone-400 font-serif mt-1">
                          {item.artwork.category?.name || "Traditional Fine Art"}
                          {item.artwork.yearCreated ? ` • ${item.artwork.yearCreated}` : ""}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground/90 border-t border-primary/20 pt-3">
                        <p>
                          <strong className="text-muted-foreground font-mono text-[11px] uppercase mr-1">Medium:</strong>
                          <span>{item.artwork.medium || "Natural Mineral Pigments & 22k Jaipur Gold Foil"}</span>
                        </p>
                        {item.artwork.dimensions && (
                          <p>
                            <strong className="text-muted-foreground font-mono text-[11px] uppercase mr-1">Dimensions:</strong>
                            <span>{item.artwork.dimensions}</span>
                          </p>
                        )}
                        {item.artwork.goldPurity && (
                          <p>
                            <strong className="text-muted-foreground font-mono text-[11px] uppercase mr-1">Gold Leaf:</strong>
                            <span>{item.artwork.goldPurity}</span>
                          </p>
                        )}
                      </div>

                      {(item.curatorialNote || item.artwork.description) && (
                        <div className="border-t border-primary/20 pt-3">
                          {item.curatorialNote ? (
                            <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/20 p-3 rounded-lg border border-border/60">
                              &ldquo;{item.curatorialNote}&rdquo;
                            </p>
                          ) : (
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              <TiptapRenderer content={item.artwork.description!} />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="print-hidden pt-1">
                        <Link
                          href={`/artwork/${item.artwork.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                        >
                          View Full Masterwork Archive <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STACKED LAYOUT FALLBACK */
                  <div className="plate-body-stacked flex flex-col items-center justify-between flex-1 my-auto w-full">
                    {/* Centered Visual Container */}
                    <div className="plate-image-container py-2 flex-1 flex items-center justify-center">
                      <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-background/50 shadow-md group max-h-[50vh] print:max-h-[52vh]">
                        <img
                          src={item.artwork.primaryImageUrl}
                          alt={item.artwork.title}
                          className="w-full h-auto object-contain max-h-[48vh] print:max-h-[52vh] mx-auto group-hover:scale-101 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-primary/30 flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-mono font-semibold text-primary">
                            {item.artwork.hasGoldFoil ? "22k Gold Foil Masterwork" : "Traditional Classical Masterwork"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plate Specifications & Curatorial Commentary */}
                    <div className="pt-3 border-t border-primary/20 space-y-2.5 w-full text-left">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground leading-tight">
                            {item.artwork.title}
                          </h3>
                          <p className="text-xs text-stone-400 font-sans mt-0.5">
                            {item.artwork.medium || "Natural Mineral Pigments & 22k Gold Foil"}
                            {item.artwork.dimensions ? ` • ${item.artwork.dimensions}` : ""}
                            {item.artwork.yearCreated ? ` • ${item.artwork.yearCreated}` : ""}
                          </p>
                        </div>
                        <div className="print-hidden">
                          <Link
                            href={`/artwork/${item.artwork.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                          >
                            Archive Provenance <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>

                      {item.curatorialNote ? (
                        <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/20 p-2.5 rounded-lg border border-border/60">
                          &ldquo;{item.curatorialNote}&rdquo;
                        </p>
                      ) : item.artwork.description ? (
                        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          <TiptapRenderer content={item.artwork.description} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Bottom Footer Stamp */}
                <div className="text-[10px] text-muted-foreground/70 text-center border-t border-primary/20 pt-2 mt-auto flex items-center justify-between">
                  <span>© {catalog.title} • Lalita Kapilavai Sacred Art Archive</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider">Plate {item.pageNumber || idx + 1}</span>
                </div>
              </div>
            </section>
          );
        })}

        {/* ------------------------------------------------------------------ */}
        {/* FINAL PAGE: COLOPHON & ATELIER HERITAGE (When Enabled)             */}
        {/* ------------------------------------------------------------------ */}
        {endPageConfig.isEnabled !== false && (
          <section className="catalog-page end-page relative rounded-3xl overflow-hidden p-6 sm:p-12 flex flex-col justify-between print:rounded-none">
            <div className={`catalog-frame ${frameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs text-center space-y-6`}>
              <div className="space-y-3 pt-4">
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Colophon &amp; Publication Details
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                  {(endPageConfig.title as string) || "Colophon & Atelier Heritage"}
                </h2>
              </div>

              <div className="prose prose-sm dark:prose-invert font-serif leading-relaxed text-foreground/85 max-w-xl mx-auto flex-1 flex flex-col justify-center">
                {endPageConfig.contentHtml ? (
                  <TiptapRenderer content={endPageConfig.contentHtml as string} />
                ) : (
                  <p>
                    Published by the Atelier of Lalita Kapilavai. Dedicated to the preservation of authentic 22k gold foil Thanjavur art and classical Carnatic musicianship.
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-primary/20 space-y-2 text-xs text-muted-foreground font-mono">
                <p>
                  {(endPageConfig.contactDetails as string) ||
                    "Atelier of Lalita Kapilavai • contact@lalitakapilavai.com • All rights reserved."}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Reproduction of sacred iconography and Tanjore masterworks strictly prohibited without written consent.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="print-hidden">
        <Footer />
      </div>
    </div>
  );
}
