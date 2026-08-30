"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Palette,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  QrCode,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EventFormModal, EventFormData } from "@/components/admin/event-form-modal";
import { formatEventSchedule } from "@/lib/geo-timezone";
import { formatCurrency } from "@/lib/formatters";

interface ArtworkSummary {
  id: string;
  title: string;
  slug: string;
  medium: string;
  primaryImageUrl: string;
}

interface Registration {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  ticketCount: number;
  registeredAt: string;
}

interface EventItem {
  id: string;
  title: string;
  slug: string;
  eventType: "WORKSHOP" | "ONLINE_CLASSROOM" | "EXHIBITION" | "CONCERT" | "RECITAL" | "PRIVATE_VIEWING" | "OTHER";
  description: string;
  venue: string;
  venueName?: string | null;
  streetAddress?: string | null;
  city: string;
  stateProvince?: string | null;
  postalCode?: string | null;
  country?: string;
  countryCode?: string | null;
  timezone: string;
  startDate: string;
  endDate?: string | null;
  posterUrl?: string | null;
  bannerImage?: string | null;
  galleryImages?: { url: string; caption?: string }[] | null;
  maxCapacity: number | null;
  registrationFee: number | null;
  currency?: string;
  isRegistrationOpen: boolean;
  isPublished?: boolean;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  _count?: { registrations: number; artworks: number };
}

export default function EventsAdminPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [artworksCatalog, setArtworksCatalog] = React.useState<ArtworkSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form Modal State
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventFormData | null>(null);

  // Attendee Viewer Modal
  const [attendeeModalOpen, setAttendeeModalOpen] = React.useState(false);
  const [attendeeEventTitle, setAttendeeEventTitle] = React.useState("");
  const [attendees, setAttendees] = React.useState<Registration[]>([]);
  const [loadingAttendees, setLoadingAttendees] = React.useState(false);

  // Delete Confirm State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetDeleteEvent, setTargetDeleteEvent] = React.useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Exhibition Floor QR Modal State
  const [exhibitionQrModalOpen, setExhibitionQrModalOpen] = React.useState(false);
  const [selectedExhibitionEvent, setSelectedExhibitionEvent] = React.useState<EventItem | null>(null);
  const [exhibitionQrDataUrl, setExhibitionQrDataUrl] = React.useState<string>("");
  const [exhibitionQrTargetUrl, setExhibitionQrTargetUrl] = React.useState<string>("");
  const [exhibitionQrLoading, setExhibitionQrLoading] = React.useState(false);
  const [selectedArtworkForExhibition, setSelectedArtworkForExhibition] = React.useState<string>("");

  const reloadEvents = React.useCallback(() => {
    Promise.all([
      fetch("/api/admin/events").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/admin/artworks").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([eventsData, artworksData]) => {
        setEvents(eventsData);
        setArtworksCatalog(artworksData);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    reloadEvents();
  }, [reloadEvents]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal with full data
  const handleOpenEdit = async (ev: EventItem) => {
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`);
      if (res.ok) {
        const fullEvent = await res.json();
        setEditingEvent({
          id: fullEvent.id,
          title: fullEvent.title,
          slug: fullEvent.slug,
          eventType: fullEvent.eventType,
          description: fullEvent.description || "",
          venue: fullEvent.venue || fullEvent.venueName || "Lalita Kapilavai Heritage Studio",
          venueName: fullEvent.venueName || fullEvent.venue || "Lalita Kapilavai Heritage Studio",
          streetAddress: fullEvent.streetAddress || "",
          city: fullEvent.city || "Bengaluru",
          stateProvince: fullEvent.stateProvince || "",
          postalCode: fullEvent.postalCode || "",
          country: fullEvent.country || "India",
          countryCode: fullEvent.countryCode || "IN",
          timezone: fullEvent.timezone || "Asia/Kolkata",
          startDate: fullEvent.startDate || "",
          endDate: fullEvent.endDate || "",
          posterUrl: fullEvent.posterUrl || "",
          bannerImage: fullEvent.bannerImage || fullEvent.posterUrl || "",
          galleryImages: fullEvent.galleryImages || [],
          maxCapacity: fullEvent.maxCapacity,
          registrationFee: fullEvent.registrationFee ? Number(fullEvent.registrationFee) : 0,
          currency: fullEvent.currency || "INR",
          isRegistrationOpen: fullEvent.isRegistrationOpen,
          isPublished: fullEvent.isPublished !== false,
          contactName: fullEvent.contactName || "",
          contactEmail: fullEvent.contactEmail || "",
          contactPhone: fullEvent.contactPhone || "",
          artworkIds: fullEvent.artworks?.map((a: { artworkId: string }) => a.artworkId) || [],
        });
      } else {
        setEditingEvent(ev as unknown as EventFormData);
      }
    } catch {
      setEditingEvent(ev as unknown as EventFormData);
    }
    setFormModalOpen(true);
  };

  // Delete Handlers
  const handleDeleteClick = (id: string, evTitle: string) => {
    setTargetDeleteEvent({ id, title: evTitle });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteEvent) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${targetDeleteEvent.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted event "${targetDeleteEvent.title}" successfully`);
        setDeleteDialogOpen(false);
        setTargetDeleteEvent(null);
        reloadEvents();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete event");
      }
    } catch {
      toast.error("Error deleting event");
    } finally {
      setDeleting(false);
    }
  };

  // View Attendees Handler
  const handleViewAttendees = async (ev: EventItem) => {
    setAttendeeEventTitle(ev.title);
    setLoadingAttendees(true);
    setAttendeeModalOpen(true);
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`);
      if (res.ok) {
        const full = await res.json();
        setAttendees(full.registrations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Exhibition Floor QR Handler
  const handleOpenExhibitionQR = async (ev: EventItem) => {
    setSelectedExhibitionEvent(ev);
    setSelectedArtworkForExhibition("");
    setExhibitionQrLoading(true);
    setExhibitionQrModalOpen(true);

    try {
      const host = window.location.origin;
      const target = `${host}/events/${ev.slug}`;
      const res = await fetch(`/api/admin/qr?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.dataUrl) {
        setExhibitionQrDataUrl(data.dataUrl);
        setExhibitionQrTargetUrl(target);
      }
    } catch {
      toast.error("Failed to generate exhibition QR code");
    } finally {
      setExhibitionQrLoading(false);
    }
  };

  const handleArtworkQrChange = async (artSlug: string) => {
    setSelectedArtworkForExhibition(artSlug);
    if (!selectedExhibitionEvent) return;
    setExhibitionQrLoading(true);

    try {
      let fetchUrl = `/api/admin/qr?`;
      if (artSlug === "") {
        const host = window.location.origin;
        fetchUrl += `url=${encodeURIComponent(`${host}/events/${selectedExhibitionEvent.slug}`)}`;
      } else {
        fetchUrl += `slug=${encodeURIComponent(artSlug)}&eventId=${encodeURIComponent(selectedExhibitionEvent.slug)}`;
      }
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (data.dataUrl) {
        setExhibitionQrDataUrl(data.dataUrl);
        setExhibitionQrTargetUrl(data.targetUrl || "");
      }
    } catch {
      toast.error("Failed to generate exhibition artwork QR");
    } finally {
      setExhibitionQrLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Exhibitions, Recitals &amp; Workshops
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Curate international schedules, venue coordinates, timezones, and masterwork exhibition linkages.
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="gold" className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Event
        </Button>
      </div>

      {/* Events Grid / Listing */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar className="w-12 h-12 mx-auto text-primary mb-3 opacity-60" />
          <CardTitle className="text-base font-serif">No Events Scheduled</CardTitle>
          <CardDescription className="text-xs mt-1">
            Create your first Tanjore exhibition, classical concert, or workshop masterclass.
          </CardDescription>
          <Button onClick={handleOpenCreate} variant="gold" size="sm" className="mt-4 gap-1">
            <Plus className="w-3.5 h-3.5" />
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const banner = ev.bannerImage || ev.posterUrl;
            return (
              <Card
                key={ev.id}
                className="hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg"
              >
                {/* Optional Hero Banner Preview */}
                {banner && (
                  <div className="relative h-36 w-full bg-muted/30 overflow-hidden border-b border-border/60">
                    <Image
                      src={banner}
                      alt={ev.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="gold" className="text-[10px] uppercase font-mono shadow-md">
                        {ev.eventType}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-2">
                  {!banner && (
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge variant="gold" className="text-[10px] uppercase">
                        {ev.eventType}
                      </Badge>
                      <Badge
                        variant={ev.isRegistrationOpen ? "outline" : "secondary"}
                        className="text-[10px]"
                      >
                        {ev.isRegistrationOpen ? "RSVP Open" : "Closed"}
                      </Badge>
                    </div>
                  )}

                  <CardTitle className="text-base font-serif font-bold text-foreground line-clamp-1">
                    {ev.title}
                  </CardTitle>

                  <CardDescription className="text-xs font-mono text-primary truncate">
                    /{ev.slug}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2.5 pb-4 text-xs text-muted-foreground flex-1">
                  {/* Schedule in Native Event Timezone */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground leading-snug">
                      {formatEventSchedule(ev.startDate, ev.endDate, ev.timezone)}
                    </span>
                  </div>

                  {/* Venue & Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {ev.venueName || ev.venue}
                      {ev.city ? `, ${ev.city}` : ""}
                      {ev.country ? ` • ${ev.country}` : ""}
                    </span>
                  </div>

                  {/* Fee & Capacity */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <span>
                      Fee:{" "}
                      <strong className="text-foreground">
                        {ev.registrationFee
                          ? formatCurrency(ev.registrationFee, ev.currency || "INR")
                          : "Free Admission"}
                      </strong>
                    </span>
                    <span>
                      Cap:{" "}
                      <strong className="text-foreground">
                        {ev.maxCapacity ? `${ev.maxCapacity} seats` : "Unlimited"}
                      </strong>
                    </span>
                  </div>

                  {/* Artworks & Registrations Count */}
                  <div className="flex items-center gap-4 pt-1 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Palette className="w-3 h-3 text-primary" />
                      {ev._count?.artworks || 0} Artworks
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Users className="w-3 h-3 text-primary" />
                      {ev._count?.registrations || 0} RSVPs
                    </span>
                  </div>
                </CardContent>

                {/* Card Action Footer */}
                <div className="p-3 bg-secondary/30 border-t border-border/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/events/${ev.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Public Page
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenExhibitionQR(ev)}
                      className="h-7 text-xs px-2 gap-1"
                      title="Floor QR Codes"
                    >
                      <QrCode className="w-3.5 h-3.5 text-primary" />
                      QR
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAttendees(ev)}
                      className="h-7 text-xs px-2 gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      RSVPs ({ev._count?.registrations || 0})
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(ev)}
                      className="h-7 w-7 p-0"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(ev.id, ev.title)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comprehensive Event Form Modal */}
      <EventFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={reloadEvents}
        initialEvent={editingEvent}
        artworksCatalog={artworksCatalog}
      />

      {/* Exhibition Artwork Linker / Floor QR Modal */}
      <Dialog open={exhibitionQrModalOpen} onOpenChange={setExhibitionQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <QrCode className="w-5 h-5 text-primary" />
              Exhibition Floor QR Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate scannable QR cards for the entrance desk or individual masterwork pedestals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-center">
            {selectedExhibitionEvent && (
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-foreground">Target QR Destination</label>
                <select
                  value={selectedArtworkForExhibition}
                  onChange={(e) => handleArtworkQrChange(e.target.value)}
                  className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="">Full Exhibition Guide ({selectedExhibitionEvent.title})</option>
                  {artworksCatalog.map((art) => (
                    <option key={art.slug} value={art.slug}>
                      Artwork Pedestal: {art.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card">
              {exhibitionQrLoading ? (
                <div className="py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : exhibitionQrDataUrl ? (
                <div className="space-y-3">
                  <div className="relative w-48 h-48 mx-auto bg-white p-2 rounded-lg shadow-sm">
                    <Image
                      src={exhibitionQrDataUrl}
                      alt="Exhibition QR Code"
                      width={192}
                      height={192}
                      className="mx-auto"
                      unoptimized
                    />
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground break-all max-w-xs mx-auto">
                    {exhibitionQrTargetUrl}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {exhibitionQrDataUrl && (
              <a
                href={exhibitionQrDataUrl}
                download={`qr-${selectedExhibitionEvent?.slug || "event"}.png`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExhibitionQrModalOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendee Viewer Modal */}
      <Dialog open={attendeeModalOpen} onOpenChange={setAttendeeModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>RSVP Registrations</DialogTitle>
            <DialogDescription>
              Attendee list for &quot;{attendeeEventTitle}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {loadingAttendees ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : attendees.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                No RSVPs recorded yet for this event.
              </p>
            ) : (
              attendees.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-serif font-bold text-foreground block">
                      {a.attendeeName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {a.attendeeEmail} {a.attendeePhone ? `• ${a.attendeePhone}` : ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <Badge variant="gold" className="text-[10px]">
                      {a.ticketCount} {a.ticketCount === 1 ? "seat" : "seats"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {new Date(a.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAttendeeModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event"
        description={`Are you sure you want to permanently delete event "${targetDeleteEvent?.title}"? All attendee registrations will also be removed.`}
        confirmText={deleting ? "Deleting..." : "Delete Event"}
        isDestructive={true}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
