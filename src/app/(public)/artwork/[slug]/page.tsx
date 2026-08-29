import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ArtCanvasViewer } from "@/components/public/art-canvas-viewer";
import { ExhibitionQrModal } from "@/components/public/exhibition-qr-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Sparkles,
  Music,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getArtworkBySlug = cache(async (slug: string) => {
  return await prisma.artwork.findUnique({
    where: { slug },
    include: {
      category: true,
      events: {
        include: { event: true },
      },
      ragaLinks: {
        include: { raga: true },
      },
    },
  });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return { title: "Artwork Not Found — Lalita Kapilavai" };
  }

  return {
    title: `${artwork.title} (${artwork.yearCreated}) — Sacred Art by Lalita Kapilavai`,
    description: `${artwork.medium}. ${artwork.description.slice(0, 160)}...`,
    openGraph: {
      title: artwork.title,
      description: artwork.medium,
      images: [{ url: artwork.watermarkedWebpUrl }],
    },
  };
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Exhibition QR Scan Interactive Lead Capture */}
      <Suspense fallback={null}>
        <ExhibitionQrModal artworkId={artwork.id} artworkTitle={artwork.title} />
      </Suspense>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Art Gallery
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {artwork.category.name}
            </Badge>
            {artwork.hasGoldFoil && (
              <Badge variant="gold" className="text-xs">
                22k Gold Foil
              </Badge>
            )}
          </div>
        </div>

        {/* Two-Column Masterwork Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Protected Canvas Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <ArtCanvasViewer
              title={artwork.title}
              watermarkedUrl={artwork.watermarkedWebpUrl}
              medium={artwork.medium}
              dimensions={artwork.dimensions}
              hasGoldFoil={artwork.hasGoldFoil}
              goldPurity={artwork.goldPurity || undefined}
              yearCreated={artwork.yearCreated}
            />

            {/* Copyright & Provenance Notice */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-foreground block mb-0.5">
                  Archival Provenance &amp; Copyright Notice
                </span>
                Original hand-crafted masterwork by Lalita Kapilavai. Layered on unblemished teakwood planks, gilded with certified 22k gold foil, and finished with semi-precious gemstones. Unauthorized reproduction or digital harvesting is prohibited.
              </div>
            </div>
          </div>

          {/* Right Column: Curatorial Details & Inquiries */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                Classical Indian Fine Art • Year {artwork.yearCreated}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-1 mb-2">
                {artwork.title}
              </h1>

              {/* Price & Availability */}
              <div className="flex items-center gap-3 pt-2">
                {artwork.price ? (
                  <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
                    {formatCurrency(artwork.price, artwork.currency || "INR")}
                  </span>
                ) : (
                  <span className="font-serif italic text-sm text-muted-foreground">
                    Private Collection / Price Upon Request
                  </span>
                )}
                <Badge
                  variant={artwork.isAvailable ? "gold" : "outline"}
                  className="text-xs uppercase"
                >
                  {artwork.isAvailable ? "Available for Acquisition" : "Acquired"}
                </Badge>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="p-4 rounded-xl border border-border bg-card/50 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Medium</span>
                <span className="font-serif text-right text-foreground max-w-[200px]">
                  {artwork.medium}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Dimensions</span>
                <span className="font-mono text-foreground">{artwork.dimensions}</span>
              </div>
              {artwork.goldPurity && (
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">Gold Purity</span>
                  <span className="font-serif text-primary font-semibold">{artwork.goldPurity}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground font-medium">Traditional School</span>
                <span className="font-serif text-foreground">{artwork.category.name}</span>
              </div>
            </div>

            {/* Artistic Commentary & Iconography */}
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider">
                Iconographic Commentary &amp; Symbolism
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {artwork.description}
              </p>
            </div>

            {/* Carnatic Musical Synesthesia Card */}
            {artwork.ragaLinks && artwork.ragaLinks.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-serif font-bold text-sm">
                  <Music className="w-4 h-4" />
                  Carnatic Synesthesia Connection
                </div>
                {artwork.ragaLinks.map((link) => (
                  <div key={link.ragaId} className="text-xs space-y-1 text-muted-foreground">
                    <span className="font-serif font-semibold text-foreground">
                      Raga {link.raga.name}
                    </span>
                    {link.raga.rasa && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Rasa: {link.raga.rasa}
                      </Badge>
                    )}
                    <p className="italic text-[11px]">
                      &quot;{link.harmonyNote || "Visual depiction harmonizes with the contemplative mood of this raga."}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Exhibited At Events */}
            {artwork.events && artwork.events.length > 0 && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-mono text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  Exhibition Provenance:
                </span>
                {artwork.events.map((ae) => (
                  <Link
                    key={ae.eventId}
                    href={`/events/${ae.event.slug}`}
                    className="block font-serif font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    • {ae.event.title} ({ae.event.city})
                  </Link>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <Link href="/commission" className="flex-1">
                <Button variant="gold" className="w-full font-serif font-bold gap-2">
                  <Sparkles className="w-4 h-4" />
                  Inquire for Acquisition
                </Button>
              </Link>
              <Link href={`/media/qr-codes/${artwork.slug}.png`} target="_blank" download>
                <Button variant="outline" size="icon" title="Exhibition Floor QR">
                  <Share2 className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
