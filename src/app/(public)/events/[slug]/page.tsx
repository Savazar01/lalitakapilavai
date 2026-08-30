import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { EventRsvpForm } from "@/components/public/event-rsvp-form";
import { formatEventSchedule } from "@/lib/geo-timezone";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Sparkles,
  Palette,
  ArrowLeft,
  User,
  Mail,
  Phone,
  ImageIcon,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

interface GalleryPhoto {
  url: string;
  caption?: string;
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
    description: `${event.venue}, ${event.city}. ${event.description ? event.description.slice(0, 160) : ""}...`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const banner = event.bannerImage || event.posterUrl;
  const gallery = (Array.isArray(event.galleryImages) ? event.galleryImages : []) as unknown as GalleryPhoto[];
  const scheduleFormatted = formatEventSchedule(event.startDate, event.endDate, event.timezone);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        {/* Navigation Breadcrumbs & Event Type Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Calendar
          </Link>

          <Badge variant="gold" className="text-xs uppercase font-mono tracking-wider">
            {event.eventType}
          </Badge>
        </div>

        {/* Hero Banner (if uploaded) */}
        {banner && (
          <div className="relative w-full h-64 sm:h-96 md:h-[440px] rounded-2xl overflow-hidden border border-border shadow-xl bg-card">
            <Image
              src={banner}
              alt={event.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Curated Exhibition &amp; Recital
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground drop-shadow-sm">
                  {event.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Event Details & RSVP Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Logistics, Description & Contacts */}
          <div className="lg:col-span-7 space-y-8">
            {!banner && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Curated Exhibition &amp; Classical Schedule
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-1 mb-4">
                  {event.title}
                </h1>
              </div>
            )}

            {/* Timing & Venue Logistics Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card/70 text-xs shadow-sm">
              <div className="flex items-start gap-3 sm:col-span-2">
                <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block text-xs uppercase tracking-wider mb-0.5">
                    Event Schedule
                  </span>
                  <span className="text-foreground font-medium text-sm">
                    {scheduleFormatted}
                  </span>
                  <span className="text-[11px] text-muted-foreground block font-mono mt-0.5">
                    Timezone: {event.timezone}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-start gap-3 pt-3 border-t border-border/50">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block text-xs uppercase tracking-wider mb-0.5">
                    Location &amp; Venue
                  </span>
                  <span className="text-foreground block text-sm font-medium">
                    {event.venueName || event.venue}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {[
                      event.streetAddress,
                      event.city,
                      [event.stateProvince, event.postalCode].filter(Boolean).join(" "),
                      event.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Curatorial Background & Program Notes */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-foreground tracking-wide">
                Exhibition Overview &amp; Program Notes
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-2">
                {event.description}
              </div>
            </div>

            {/* Dedicated Event Contact / Curatorial Desk */}
            {(event.contactName || event.contactEmail || event.contactPhone) && (
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="font-serif font-bold text-sm text-foreground">
                    Inquiries &amp; Curatorial Desk
                  </h4>
                </div>

                <p className="text-xs text-muted-foreground">
                  For private viewings, seating arrangements, or collector inquiries, please connect with the exhibition organizer:
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs">
                  {event.contactName && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {event.contactName}
                    </span>
                  )}
                  {event.contactEmail && (
                    <a
                      href={`mailto:${event.contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {event.contactEmail}
                    </a>
                  )}
                  {event.contactPhone && (
                    <a
                      href={`tel:${event.contactPhone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {event.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: RSVP Registration Widget */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            <EventRsvpForm
              eventId={event.id}
              eventTitle={event.title}
              isRegistrationOpen={event.isRegistrationOpen}
              registrationFee={event.registrationFee ? Number(event.registrationFee) : null}
              currency={event.currency || "INR"}
              maxCapacity={event.maxCapacity}
            />

            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
              Questions regarding seating or private viewings?{" "}
              <Link href="/commission" className="text-primary underline hover:text-primary/80">
                Contact Studio Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Event Photo Gallery */}
        {gallery.length > 0 && (
          <section className="pt-8 border-t border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Exhibition &amp; Event Gallery
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Photographs of exhibition halls, classical stage setups, and retrospective highlights.
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-mono self-start sm:self-center">
                {gallery.length} Photograph{gallery.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gallery.map((photo, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden border border-border bg-card shadow-sm group hover:border-primary/50 transition-all flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Event Gallery ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  {photo.caption && (
                    <div className="p-3 text-xs text-muted-foreground font-medium">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Attached Exhibition Artworks Gallery */}
        {event.artworks && event.artworks.length > 0 && (
          <section className="pt-8 border-t border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground">
                  Masterworks on Exhibition
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Featured Tanjore gold leaf compositions curated for this specific event.
                </p>
              </div>
              <Badge variant="outline" className="text-xs gap-1 self-start sm:self-center font-mono">
                <Palette className="w-3.5 h-3.5 text-primary" />
                {event.artworks.length} Masterpiece{event.artworks.length === 1 ? "" : "s"}
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
