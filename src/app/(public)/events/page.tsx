import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Palette, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exhibitions, Concerts & Workshops — Lalita Kapilavai",
  description:
    "Explore upcoming Tanjore gold leaf exhibitions, Carnatic classical vocal recitals, and traditional iconography workshops.",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      _count: { select: { artworks: true, registrations: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Cultural Calendar &amp; Recitals
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            Exhibitions &amp; Events
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.
          </p>
        </div>

        {events.length === 0 ? (
          <Card className="p-12 text-center border-dashed max-w-md mx-auto">
            <Calendar className="w-10 h-10 mx-auto text-primary mb-2 opacity-50" />
            <CardTitle className="text-base font-serif">No Upcoming Public Events</CardTitle>
            <CardDescription className="text-xs mt-1">
              New exhibition dates and concert schedules are published periodically.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.slug}`} className="group block">
                <Card className="hover:border-primary/60 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="gold" className="text-[10px] uppercase">
                        {ev.eventType}
                      </Badge>
                      <Badge
                        variant={ev.isRegistrationOpen ? "outline" : "secondary"}
                        className="text-[10px]"
                      >
                        {ev.isRegistrationOpen ? "RSVP Open" : "Concluded"}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                      {ev.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2 text-xs text-muted-foreground pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {new Date(ev.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="truncate text-foreground/90">
                        {ev.venueName || ev.venue}{ev.city ? `, ${ev.city}` : ""}{ev.country ? ` (${ev.country})` : ""}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-foreground/80 pt-2 border-t border-border/50">
                      {ev.description}
                    </p>

                    <div className="pt-3 flex items-center justify-between text-xs text-primary font-serif font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        {ev._count?.artworks || 0} Artworks on Display
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
