import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground print:bg-white print:text-black">
      {/* Hide standard navbar when printing */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-16">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4 print:hidden">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Gallery
          </Link>

          <div className="flex items-center gap-3">
            {catalog.downloadablePdfUrl ? (
              <a
                href={catalog.downloadablePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 rounded-md shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Edition
              </a>
            ) : null}
          </div>
        </div>

        {/* BOOK COVER SECTION (Foil-Embossed Editorial Style) */}
        <section className="relative rounded-3xl overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-card via-background to-card shadow-2xl p-8 sm:p-14 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Exhibition Monograph &amp; Digital Archive
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
            {catalog.title}
          </h1>

          {catalog.subtitle && (
            <p className="text-sm sm:text-lg font-serif italic text-muted-foreground max-w-2xl mx-auto">
              {catalog.subtitle}
            </p>
          )}

          {catalog.forewordBy && (
            <div className="pt-2 text-xs uppercase tracking-widest text-foreground/80 font-mono">
              Curated by <span className="text-primary font-bold">{catalog.forewordBy}</span>
            </div>
          )}

          {catalog.event && (
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Official Monograph of {catalog.event.title} • {catalog.event.venue}, {catalog.event.city}</span>
            </div>
          )}

          {catalog.coverImageUrl && (
            <div className="pt-6 max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-primary/30 shadow-2xl">
                <img
                  src={catalog.coverImageUrl}
                  alt={catalog.title}
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            </div>
          )}
        </section>

        {/* CURATORIAL ESSAY & FOREWORD SECTION */}
        {catalog.curatorialEssay && (
          <section className="space-y-6 max-w-3xl mx-auto bg-card/40 border border-border/80 rounded-2xl p-8 sm:p-12 shadow-sm">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                Curatorial Monograph
              </span>
              <BookOpen className="w-4 h-4 text-primary" />
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert font-serif leading-relaxed text-foreground/90 max-w-none">
              <TiptapRenderer content={catalog.curatorialEssay} />
            </div>
          </section>
        )}

        {/* ARTWORK PLATES CATALOG SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Plates &amp; Iconography
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Exhibition Plates ({catalog.items.length})
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Masterworks presented in curatorial sequence with fine art specifications and spiritual iconography.
            </p>
          </div>

          <div className="space-y-16">
            {catalog.items.map((item, idx) => (
              <article
                key={item.id}
                className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg p-6 sm:p-10 transition-all hover:border-primary/40 break-inside-avoid print:shadow-none print:border print:p-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Plate Artwork Visual */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-background shadow-md group">
                      <img
                        src={item.artwork.primaryImageUrl}
                        alt={item.artwork.title}
                        className="w-full h-auto max-h-[550px] object-contain mx-auto group-hover:scale-102 transition-transform duration-500"
                      />
                      {/* Purity & Medium Badge */}
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-primary/30 flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono font-semibold text-primary">
                          22k Gold Foil Masterwork
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plate Information & Provenance */}
                  <div className="lg:col-span-5 space-y-5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center border border-primary/20">
                        {item.pageNumber || idx + 1}
                      </div>
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        Plate {item.pageNumber || idx + 1} of {catalog.items.length}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                        {item.artwork.title}
                      </h3>
                      <p className="text-xs text-primary font-mono mt-1">
                        {item.artwork.category?.name || "Traditional Indian School"}
                      </p>
                    </div>

                    <div className="space-y-2 py-3 border-y border-border/60 text-xs text-muted-foreground font-mono">
                      <div className="flex justify-between">
                        <span>Medium:</span>
                        <span className="text-foreground font-sans font-medium">{item.artwork.medium || "Natural Pigments & 22k Gold Foil"}</span>
                      </div>
                      {item.artwork.yearCreated && (
                        <div className="flex justify-between">
                          <span>Year of Creation:</span>
                          <span className="text-foreground">{item.artwork.yearCreated}</span>
                        </div>
                      )}
                      {item.artwork.dimensions && (
                        <div className="flex justify-between">
                          <span>Dimensions:</span>
                          <span className="text-foreground">{item.artwork.dimensions}</span>
                        </div>
                      )}
                    </div>

                    {/* Curatorial Plate Note */}
                    {item.curatorialNote ? (
                      <div className="text-xs text-foreground/90 leading-relaxed italic bg-muted/20 p-4 rounded-xl border border-border/60">
                        &ldquo;{item.curatorialNote}&rdquo;
                      </div>
                    ) : item.artwork.description ? (
                      <div className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        <TiptapRenderer content={item.artwork.description} />
                      </div>
                    ) : null}

                    {/* Link to full artwork view */}
                    <div className="pt-2 print:hidden">
                      <Link
                        href={`/artwork/${item.artwork.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                      >
                        View Full Masterwork Archive <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Publication Colophon / Footer */}
        <section className="border-t-2 border-primary/20 pt-10 text-center space-y-3 pb-8">
          <p className="text-xs font-serif italic text-muted-foreground">
            Digital Archive &amp; Scholarly Monograph published by the Atelier of Lalita Kapilavai.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/70">
            All rights reserved. Reproduction of sacred iconography and Tanjore masterworks strictly prohibited without written consent.
          </p>
        </section>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
