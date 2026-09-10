import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { CatalogPrintButton } from "@/components/public/catalog-print-button";
import { getPatternById } from "@/lib/background-patterns";
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

function getFrameClass(style?: string | null) {
  if (style === "double-fillet") {
    return "catalog-frame-double border-4 border-double border-primary/60";
  }
  if (style === "silk-border") {
    return "catalog-frame-silk border-2 border-amber-600/70 shadow-[inset_0_0_0_3px_#1C1814,inset_0_0_0_4.5px_#D4AF37]";
  }
  if (style === "none") {
    return "border-none";
  }
  return "catalog-frame-gold border-2 border-primary/50 shadow-[inset_0_0_0_2px_#1C1814,inset_0_0_0_3.5px_#D4AF37]";
}

function getMagazineGridClass(layoutType?: string | null, fallbackLayout?: string | null) {
  const type = layoutType || (fallbackLayout === "TWO_COLUMN" ? "2_COL" : "1_COL");
  switch (type) {
    case "1_COL":
      return "grid grid-cols-1 gap-6 magazine-grid-1col";
    case "2_COL":
      return "grid grid-cols-1 md:grid-cols-2 gap-8 magazine-grid-2col";
    case "ASYMMETRIC_70_30":
      return "grid grid-cols-1 md:grid-cols-[70%_30%] gap-8 magazine-grid-asym-70-30";
    case "ASYMMETRIC_30_70":
      return "grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 magazine-grid-asym-30-70";
    case "3_COL":
      return "grid grid-cols-1 md:grid-cols-3 gap-6 magazine-grid-3col";
    case "4_COL":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 magazine-grid-4col";
    case "6_COL":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 magazine-grid-6col";
    default:
      return "grid grid-cols-1 md:grid-cols-2 gap-8 magazine-grid-2col";
  }
}

function CatalogBackgroundLayer({
  bgType,
  patternId,
  patternOpacity,
  bgImage,
  overlayOpacity,
  fallbackBgMode,
  fallbackPattern,
  fallbackPatternOpacity,
  fallbackBgImage,
  fallbackOverlayOpacity,
}: {
  bgType?: string;
  patternId?: string;
  patternOpacity?: number;
  bgImage?: string;
  overlayOpacity?: number;
  fallbackBgMode: string;
  fallbackPattern?: ReturnType<typeof getPatternById>;
  fallbackPatternOpacity: number;
  fallbackBgImage?: string;
  fallbackOverlayOpacity: number;
}) {
  const mode = bgType
    ? bgType.toUpperCase()
    : bgImage
    ? "IMAGE"
    : fallbackBgMode.toUpperCase();

  if (mode === "PATTERN") {
    const pat = getPatternById(patternId) || fallbackPattern;
    const op = typeof patternOpacity === "number" ? patternOpacity : fallbackPatternOpacity;
    if (pat) {
      return (
        <div
          aria-hidden="true"
          className="catalog-bg-layer absolute inset-0 pointer-events-none z-0 overflow-hidden"
          style={{
            backgroundImage: `url("${pat.svgDataUri}")`,
            backgroundRepeat: "repeat",
            opacity: op,
          }}
        />
      );
    }
  }

  if (mode === "IMAGE") {
    const img = bgImage || fallbackBgImage;
    const op = typeof overlayOpacity === "number" ? overlayOpacity : fallbackOverlayOpacity;
    if (img) {
      return (
        <div
          aria-hidden="true"
          className="catalog-bg-layer absolute inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url("${img}")` }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: op }}
          />
        </div>
      );
    }
  }

  // Fallback to global catalog background
  if (fallbackBgMode.toUpperCase() === "PATTERN" && fallbackPattern) {
    return (
      <div
        aria-hidden="true"
        className="catalog-bg-layer absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundImage: `url("${fallbackPattern.svgDataUri}")`,
          backgroundRepeat: "repeat",
          opacity: fallbackPatternOpacity,
        }}
      />
    );
  }

  if (fallbackBgMode.toUpperCase() === "IMAGE" && fallbackBgImage) {
    return (
      <div
        aria-hidden="true"
        className="catalog-bg-layer absolute inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${fallbackBgImage}")` }}
        />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: fallbackOverlayOpacity }}
        />
      </div>
    );
  }

  return null;
}

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
      customPages: {
        orderBy: { pageNumber: "asc" },
      },
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
  const essayConfig = (catalog.essayConfig as Record<string, unknown> | null) || {};
  const endPageConfig = (catalog.endPageConfig as Record<string, unknown> | null) || {};

  const orientation = catalog.orientation === "landscape" ? "landscape" : "portrait";
  const frameStyle = (themeConfig.frameStyle as string) || "gold-fillet";
  const frameClass = getFrameClass(frameStyle);

  const bgColor = (themeConfig.backgroundColor as string) || "#1C1814";
  const textColor = (themeConfig.textColor as string) || "#FAF7F2";

  const bgMode = (themeConfig.backgroundMode as string) || "color";
  const bgPatternId = themeConfig.backgroundPattern as string | undefined;
  const patternOpacity =
    typeof themeConfig.patternOpacity === "number" ? themeConfig.patternOpacity : 0.15;
  const bgImage = themeConfig.backgroundImage as string | undefined;
  const overlayOpacity =
    typeof themeConfig.overlayOpacity === "number" ? themeConfig.overlayOpacity : 0.4;
  const pattern = getPatternById(bgPatternId);

  // Cover Page configuration
  const coverFrameClass = getFrameClass((coverConfig.frameStyle as string) || frameStyle);
  const coverBgColor = (coverConfig.backgroundColor as string) || undefined;
  const coverBgType = (coverConfig.backgroundType as string) || (coverConfig.backgroundImage ? "IMAGE" : undefined);
  const coverBgPattern = coverConfig.backgroundPattern as string | undefined;
  const coverPatternOpacity = typeof coverConfig.patternOpacity === "number" ? coverConfig.patternOpacity : undefined;
  const coverBgImage = (coverConfig.backgroundImage as string) || undefined;
  const coverOverlayOpacity = typeof coverConfig.overlayOpacity === "number" ? coverConfig.overlayOpacity : undefined;

  // Curatorial Essay configuration
  const essayFrameClass = getFrameClass((essayConfig.frameStyle as string) || frameStyle);
  const essayBgColor = (essayConfig.backgroundColor as string) || undefined;
  const essayBgType = (essayConfig.backgroundType as string) || (essayConfig.backgroundImage ? "IMAGE" : undefined);
  const essayBgPattern = essayConfig.backgroundPattern as string | undefined;
  const essayPatternOpacity = typeof essayConfig.patternOpacity === "number" ? essayConfig.patternOpacity : undefined;
  const essayBgImage = (essayConfig.backgroundImage as string) || undefined;
  const essayOverlayOpacity = typeof essayConfig.overlayOpacity === "number" ? essayConfig.overlayOpacity : undefined;
  const essayTitle = (essayConfig.title as string) || "Curatorial Statement & Scholarly Monograph";

  // End Page configuration
  const endFrameClass = getFrameClass((endPageConfig.frameStyle as string) || frameStyle);
  const endBgColor = (endPageConfig.backgroundColor as string) || undefined;
  const endBgType = (endPageConfig.backgroundType as string) || (endPageConfig.backgroundImage ? "IMAGE" : undefined);
  const endBgPattern = endPageConfig.backgroundPattern as string | undefined;
  const endPatternOpacity = typeof endPageConfig.patternOpacity === "number" ? endPageConfig.patternOpacity : undefined;
  const endBgImage = (endPageConfig.backgroundImage as string) || undefined;
  const endOverlayOpacity = typeof endPageConfig.overlayOpacity === "number" ? endPageConfig.overlayOpacity : undefined;

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
        <section
          className="catalog-page cover-page relative rounded-3xl overflow-hidden p-6 sm:p-12 text-center flex flex-col justify-between print:rounded-none"
          style={coverBgColor ? { backgroundColor: coverBgColor } : undefined}
        >
          <CatalogBackgroundLayer
            bgType={coverBgType}
            patternId={coverBgPattern}
            patternOpacity={coverPatternOpacity}
            bgImage={coverBgImage}
            overlayOpacity={coverOverlayOpacity}
            fallbackBgMode={bgMode}
            fallbackPattern={pattern}
            fallbackPatternOpacity={patternOpacity}
            fallbackBgImage={bgImage}
            fallbackOverlayOpacity={overlayOpacity}
          />
          <div className={`catalog-frame relative z-10 ${coverFrameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}>
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
          <section
            className="catalog-page essay-page relative rounded-3xl overflow-hidden p-6 sm:p-12 flex flex-col justify-between print:rounded-none"
            style={essayBgColor ? { backgroundColor: essayBgColor } : undefined}
          >
            <CatalogBackgroundLayer
              bgType={essayBgType}
              patternId={essayBgPattern}
              patternOpacity={essayPatternOpacity}
              bgImage={essayBgImage}
              overlayOpacity={essayOverlayOpacity}
              fallbackBgMode={bgMode}
              fallbackPattern={pattern}
              fallbackPatternOpacity={patternOpacity}
              fallbackBgImage={bgImage}
              fallbackOverlayOpacity={overlayOpacity}
            />
            <div className={`catalog-frame relative z-10 ${essayFrameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}>
              <div className="border-b border-primary/20 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  {essayTitle}
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
        {/* EDITORIAL & MAGAZINE PAGES: (Multi-Segment Layouts & Per-Page BG)  */}
        {/* ------------------------------------------------------------------ */}
        {catalog.customPages && catalog.customPages.map((page, pIdx) => {
          const pageFrameClass = getFrameClass(page.frameStyle || frameStyle);
          const gridClass = getMagazineGridClass(page.layoutType, page.pageLayout);
          const segments = Array.isArray(page.segments)
            ? (page.segments as unknown as { id: string; colSpan: number; contentHtml: string }[])
            : [];

          return (
            <section
              key={page.id}
              className="catalog-page catalog-magazine-page editorial-page relative rounded-3xl overflow-hidden p-6 sm:p-12 flex flex-col justify-between print:rounded-none"
              style={page.backgroundColor ? { backgroundColor: page.backgroundColor } : undefined}
            >
              <CatalogBackgroundLayer
                bgType={page.backgroundType || undefined}
                patternId={page.backgroundPattern || undefined}
                patternOpacity={page.patternOpacity ?? undefined}
                bgImage={page.backgroundImage || undefined}
                overlayOpacity={page.overlayOpacity ?? undefined}
                fallbackBgMode={bgMode}
                fallbackPattern={pattern}
                fallbackPatternOpacity={patternOpacity}
                fallbackBgImage={bgImage}
                fallbackOverlayOpacity={overlayOpacity}
              />
              <div className={`catalog-frame relative z-10 ${pageFrameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}>
                {/* Editorial Page Header */}
                {(page.title || page.subtitle) && (
                  <div className="border-b border-primary/20 pb-4 mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                        Editorial Monograph • Page {page.pageNumber || pIdx + 1}
                      </span>
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    </div>
                    {page.title && (
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground leading-tight">
                        {page.title}
                      </h2>
                    )}
                    {page.subtitle && (
                      <p className="text-xs sm:text-sm font-serif italic text-muted-foreground mt-1">
                        {page.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Editorial Multi-Segment Content Layout */}
                <div className={`magazine-layout-container flex-1 overflow-y-auto print:overflow-visible font-serif leading-relaxed text-foreground/90 py-2 ${gridClass}`}>
                  {segments.length > 0 ? (
                    segments.map((seg, sIdx) => (
                      <div
                        key={seg.id || sIdx}
                        className="magazine-col prose prose-sm dark:prose-invert font-serif leading-relaxed text-foreground/90 overflow-y-auto print:overflow-visible text-justify"
                      >
                        <TiptapRenderer content={seg.contentHtml} />
                      </div>
                    ))
                  ) : page.contentHtml ? (
                    <div className="magazine-col prose prose-sm sm:prose-base dark:prose-invert font-serif leading-relaxed text-foreground/90 overflow-y-auto print:overflow-visible text-justify">
                      <TiptapRenderer content={page.contentHtml} />
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground">No editorial content compiled for this page.</p>
                  )}
                </div>

                {/* Editorial Page Footer Stamp */}
                <div className="pt-3 border-t border-primary/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-auto">
                  <span>{catalog.title} • Atelier Monograph</span>
                  <span>Page {page.pageNumber || pIdx + 1}</span>
                </div>
              </div>
            </section>
          );
        })}

        {/* ------------------------------------------------------------------ */}
        {/* PAGES 3 to N: ARTWORK PLATES (Strictly 1 Masterwork Per Page)      */}
        {/* ------------------------------------------------------------------ */}
        {catalog.items.map((item, idx) => {
          const layoutMode = item.plateLayout || catalog.plateLayout || "SIDE_BY_SIDE";
          const displayTitle = item.customTitle?.trim() || item.artwork.title;
          const displaySubtitle =
            item.customSubtitle?.trim() ||
            item.artwork.category?.name ||
            "Traditional Fine Art";
          const showPlateNumber = item.showPlateNumber !== false;

          return (
            <section
              key={item.id}
              className="catalog-page plate-page relative rounded-3xl overflow-hidden p-6 sm:p-10 flex flex-col justify-between print:rounded-none"
            >
              <CatalogBackgroundLayer
                fallbackBgMode={bgMode}
                fallbackPattern={pattern}
                fallbackPatternOpacity={patternOpacity}
                fallbackBgImage={bgImage}
                fallbackOverlayOpacity={overlayOpacity}
              />
              <div
                className={`catalog-frame relative z-10 ${frameClass} p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}
              >
                {/* Plate Header (Plate number & Traditional school) */}
                <div className="flex items-center justify-between border-b border-primary/20 pb-2.5 mb-2">
                  {showPlateNumber ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/15 text-primary font-mono font-bold text-xs flex items-center justify-center border border-primary/30">
                        {item.pageNumber || idx + 1}
                      </div>
                      <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                        Plate {item.pageNumber || idx + 1} of {catalog.items.length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono uppercase text-primary/80 font-medium tracking-wide">
                      Masterwork Plate
                    </span>
                  )}
                  <span className="text-xs font-mono text-primary font-bold uppercase">
                    {item.artwork.category?.name || "Traditional Indian School"}
                  </span>
                </div>

                {/* Conditional Plate Layout */}
                {layoutMode === "SIDE_BY_SIDE" ? (
                  <div
                    className="catalog-plate-body plate-body-grid flex-1 my-auto overflow-hidden w-full"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "58% 38%",
                      gap: "4%",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {/* Left Column: Framed Masterwork Plate */}
                    <div className="plate-image-col flex items-center justify-center max-h-[64vh] print:max-h-[60vh] w-full">
                      <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-background/50 shadow-2xl group max-h-full">
                        <img
                          src={item.artwork.primaryImageUrl}
                          alt={displayTitle}
                          className="max-h-[58vh] print:max-h-[56vh] max-w-full w-auto object-contain rounded shadow-2xl mx-auto group-hover:scale-101 transition-transform duration-500"
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
                    <div className="plate-details-col flex flex-col justify-center space-y-3.5 text-left w-full overflow-hidden">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 rounded mb-2 font-mono uppercase tracking-wider">
                          {item.artwork.category?.name || "Traditional Indian School"}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-serif text-foreground font-bold leading-tight">
                          {displayTitle}
                        </h3>
                        <p className="text-sm text-stone-400 font-serif mt-1">
                          {displaySubtitle}
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
                          alt={displayTitle}
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
                            {displayTitle}
                          </h3>
                          <p className="text-xs text-stone-400 font-sans mt-0.5">
                            {displaySubtitle}
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
                  {showPlateNumber ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      Plate {item.pageNumber || idx + 1}
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      Atelier Monograph
                    </span>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* ------------------------------------------------------------------ */}
        {/* FINAL PAGE: COLOPHON & ATELIER HERITAGE (When Enabled)             */}
        {/* ------------------------------------------------------------------ */}
        {endPageConfig.isEnabled !== false && (
          <section
            className="catalog-page end-page relative rounded-3xl overflow-hidden p-6 sm:p-12 flex flex-col justify-between print:rounded-none"
            style={endBgColor ? { backgroundColor: endBgColor } : undefined}
          >
            <CatalogBackgroundLayer
              bgType={endBgType}
              patternId={endBgPattern}
              patternOpacity={endPatternOpacity}
              bgImage={endBgImage}
              overlayOpacity={endOverlayOpacity}
              fallbackBgMode={bgMode}
              fallbackPattern={pattern}
              fallbackPatternOpacity={patternOpacity}
              fallbackBgImage={bgImage}
              fallbackOverlayOpacity={overlayOpacity}
            />
            <div className={`catalog-frame relative z-10 ${endFrameClass} p-6 sm:p-10 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs text-center space-y-6`}>
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
