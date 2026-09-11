import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Palette, ArrowRight, Sparkles, History, CheckCircle2 } from "lucide-react";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";
import { formatEventSchedule } from "@/lib/geo-timezone";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exhibitions, Concerts & Workshops — Lalita Kapilavai",
  description:
    "Explore upcoming Tanjore gold leaf exhibitions, Carnatic classical vocal recitals, and traditional iconography workshops.",
};

export default async function EventsPage() {
  const [events, pageData] = await Promise.all([
    prisma.event.findMany({
      where: { isPublished: true, isArchived: false },
      orderBy: { startDate: "asc" },
      include: {
        _count: { select: { artworks: true, registrations: true } },
      },
    }),
    prisma.page
      .findUnique({
        where: { slug: "events" },
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

  const now = new Date();

  const isPast = (ev: {
    statusOverride?: string | null;
    endDate?: Date | null;
    startDate: Date;
  }) => {
    if (ev.statusOverride === "FORCE_PAST") return true;
    if (ev.statusOverride === "FORCE_UPCOMING") return false;
    const compareDate = ev.endDate ? new Date(ev.endDate) : new Date(ev.startDate);
    return compareDate < now;
  };

  const upcomingEvents = events
    .filter((ev) => !isPast(ev))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastEvents = events
    .filter((ev) => isPast(ev))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const headerTitle = pageData?.title || "Exhibitions & Events";
  const headerSubtitle =
    pageData?.metaDescription ||
    "Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.";

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
            Cultural Calendar &amp; Recitals
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {headerTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {headerSubtitle}
          </p>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-16">
        {/* SECTION 1: UPCOMING EXHIBITIONS & EVENTS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Live Schedules
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                Upcoming Exhibitions &amp; Events
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Forthcoming gallery exhibitions, classical vocal concerts, and traditional iconography masterclasses.
              </p>
            </div>
            <Badge variant="gold" className="text-xs font-mono self-start sm:self-center">
              {upcomingEvents.length} Scheduled
            </Badge>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card className="p-10 text-center border-dashed max-w-md mx-auto bg-card/40">
              <Calendar className="w-10 h-10 mx-auto text-primary mb-2 opacity-50" />
              <CardTitle className="text-base font-serif">No Upcoming Public Events</CardTitle>
              <CardDescription className="text-xs mt-1">
                New exhibition dates, gallery recitals, and masterclasses are published periodically. Please explore our past retrospectives below.
              </CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((ev) => {
                const banner = ev.bannerImage || ev.posterUrl;
                const schedule = formatEventSchedule(ev.startDate, ev.endDate, ev.timezone);

                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} className="group block">
                    <Card className="hover:border-primary/60 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl overflow-hidden bg-card border-border/80">
                      {banner && (
                        <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
                          <Image
                            src={banner}
                            alt={ev.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute top-3 right-3 flex gap-1">
                            <Badge variant="gold" className="text-[10px] uppercase font-mono shadow-md">
                              {ev.eventType}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        {!banner && (
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="gold" className="text-[10px] uppercase font-mono">
                              {ev.eventType}
                            </Badge>
                            <Badge
                              variant={ev.isRegistrationOpen ? "outline" : "secondary"}
                              className="text-[10px]"
                            >
                              {ev.isRegistrationOpen ? "RSVP Open" : "Concluded"}
                            </Badge>
                          </div>
                        )}

                        <CardTitle className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-1 line-clamp-2">
                          {ev.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2.5 text-xs text-muted-foreground pb-4 flex-1">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="font-medium text-foreground leading-snug">
                            {schedule}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="truncate text-foreground/90">
                            {ev.venueName || ev.venue}{ev.city ? `, ${ev.city}` : ""}{ev.country ? ` (${ev.country})` : ""}
                          </span>
                        </div>

                        {ev.description && (
                          <p className="line-clamp-2 text-muted-foreground pt-2 border-t border-border/50">
                            {ev.description}
                          </p>
                        )}

                        <div className="pt-3 flex items-center justify-between text-xs text-primary font-serif font-semibold mt-auto">
                          <span className="inline-flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            {ev._count?.artworks || 0} Artworks on Display
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: PAST EXHIBITIONS & RETROSPECTIVES */}
        {pastEvents.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <History className="w-3.5 h-3.5 text-primary" />
                  Archival Retrospectives
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                  Past Exhibitions &amp; Retrospectives
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Historical archive of celebrated Tanjore masterwork showcases, museum exhibitions, and concert tours.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono self-start sm:self-center border-border/80">
                {pastEvents.length} Concluded
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((ev) => {
                const banner = ev.bannerImage || ev.posterUrl;
                const schedule = formatEventSchedule(ev.startDate, ev.endDate, ev.timezone);

                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} className="group block">
                    <Card className="hover:border-primary/50 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-md overflow-hidden bg-card/60 hover:bg-card/90 border-border/60">
                      {banner && (
                        <div className="relative h-44 w-full bg-muted/40 overflow-hidden">
                          <Image
                            src={banner}
                            alt={ev.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono bg-background/85 backdrop-blur-sm border-border">
                              Concluded
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge variant="gold" className="text-[10px] uppercase font-mono shadow-md">
                              {ev.eventType}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        {!banner && (
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              Concluded
                            </Badge>
                            <Badge variant="gold" className="text-[10px] uppercase font-mono">
                              {ev.eventType}
                            </Badge>
                          </div>
                        )}

                        <CardTitle className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-1 line-clamp-2">
                          {ev.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2.5 text-xs text-muted-foreground pb-4 flex-1">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="font-medium text-foreground/85 leading-snug">
                            {schedule}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="truncate text-foreground/80">
                            {ev.venueName || ev.venue}{ev.city ? `, ${ev.city}` : ""}{ev.country ? ` (${ev.country})` : ""}
                          </span>
                        </div>

                        {ev.description && (
                          <p className="line-clamp-2 text-muted-foreground/80 pt-2 border-t border-border/40">
                            {ev.description}
                          </p>
                        )}

                        <div className="pt-3 flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary font-serif font-semibold mt-auto border-t border-border/40">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-primary/70" />
                            View Retrospective Archive
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
