import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { EventRsvpForm } from "@/components/public/event-rsvp-form";
import { formatLocalizedDateTime } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Sparkles,
  Palette,
  ArrowLeft,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getEventBySlug = cache(async (slug: string) => {
  return await prisma.event.findUnique({
    where: { slug },
    include: {
      artworks: {
        orderBy: { displayOrder: "asc" },
        include: {
          artwork: {
            include: { category: true },
          },
        },
      },
      _count: { select: { registrations: true } },
    },
  });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found — Lalita Kapilavai" };
  }

  return {
    title: `${event.title} (${event.eventType}) — Lalita Kapilavai`,
    description: `${event.venue}, ${event.city}. ${event.description.slice(0, 160)}...`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Calendar
          </Link>

          <Badge variant="gold" className="text-xs uppercase">
            {event.eventType}
          </Badge>
        </div>

        {/* Two-Column Event Header & RSVP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          {/* Event Content & Logistics */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Exhibition &amp; Classical Schedule
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-1 mb-4">
                {event.title}
              </h1>

              {/* Timing & Venue Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-card/60 text-xs">
                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Event Schedule</span>
                    <span className="text-muted-foreground">
                      {formatLocalizedDateTime(event.startDate, event.timezone)}
                      {" – "}
                      {formatLocalizedDateTime(event.endDate, event.timezone)}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start gap-2.5 pt-2 border-t border-border/40">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Location & Venue</span>
                    <span className="text-muted-foreground">
                      {event.venue}, {event.city} ({event.timezone})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview / Agenda */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider">
                Exhibition Overview &amp; Program
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right Column: RSVP Registration Widget */}
          <div className="lg:col-span-5 space-y-4">
            <EventRsvpForm
              eventId={event.id}
              eventTitle={event.title}
              isRegistrationOpen={event.isRegistrationOpen}
              registrationFee={event.registrationFee ? Number(event.registrationFee) : null}
              currency={event.currency || "INR"}
              maxCapacity={event.maxCapacity}
            />

            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
              Questions regarding seating or private viewings?{" "}
              <Link href="/commission" className="text-primary underline">
                Contact Studio Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Attached Exhibition Artworks Gallery */}
        {event.artworks && event.artworks.length > 0 && (
          <section className="pt-8 border-t border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground">
                  Masterworks on Exhibition
                </h3>
                <p className="text-xs text-muted-foreground">
                  Featured Tanjore gold leaf compositions curated for this specific event.
                </p>
              </div>
              <Badge variant="outline" className="text-xs gap-1 self-start sm:self-center">
                <Palette className="w-3.5 h-3.5 text-primary" />
                {event.artworks.length} Paintings
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.artworks.map(({ artwork }) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.slug}`}
                  className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/60 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/5] bg-muted/40 overflow-hidden">
                    <Image
                      src={artwork.watermarkedWebpUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="text-[9px] bg-background/80 backdrop-blur-md">
                        {artwork.category.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-serif font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {artwork.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {artwork.medium}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
