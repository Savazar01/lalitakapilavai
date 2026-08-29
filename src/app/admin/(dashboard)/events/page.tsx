"use client";

import * as React from "react";
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
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatLocalizedDateTime,
  SUPPORTED_CURRENCIES,
} from "@/lib/formatters";

interface ArtworkSummary {
  id: string;
  title: string;
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
  eventType: "WORKSHOP" | "ONLINE_CLASSROOM" | "EXHIBITION" | "CONCERT" | "OTHER";
  description: string;
  venue: string;
  city: string;
  timezone: string;
  startDate: string;
  endDate: string;
  posterUrl: string | null;
  maxCapacity: number | null;
  registrationFee: number | null;
  currency?: string;
  isRegistrationOpen: boolean;
  _count?: { registrations: number; artworks: number };
}

const IANA_TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +05:30)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT -05:00)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT -08:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST +00:00)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +04:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +08:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST +10:00)" },
];

export default function EventsAdminPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [artworksCatalog, setArtworksCatalog] = React.useState<ArtworkSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Dialog State (Create / Edit)
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [eventType, setEventType] = React.useState<EventItem["eventType"]>("EXHIBITION");
  const [description, setDescription] = React.useState("");
  const [venue, setVenue] = React.useState("Lalita Kapilavai Heritage Studio");
  const [city, setCity] = React.useState("Bengaluru");
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [maxCapacity, setMaxCapacity] = React.useState("");
  const [registrationFee, setRegistrationFee] = React.useState("");
  const [currency, setCurrency] = React.useState("INR");
  const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(true);
  const [selectedArtworkIds, setSelectedArtworkIds] = React.useState<string[]>([]);

  // Attendee Viewer Modal
  const [attendeeModalOpen, setAttendeeModalOpen] = React.useState(false);
  const [attendeeEventTitle, setAttendeeEventTitle] = React.useState("");
  const [attendees, setAttendees] = React.useState<Registration[]>([]);
  const [loadingAttendees, setLoadingAttendees] = React.useState(false);

  // Artwork Linker Modal
  const [linkerModalOpen, setLinkerModalOpen] = React.useState(false);

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
    let isMounted = true;
    Promise.all([
      fetch("/api/admin/events").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/admin/artworks").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([eventsData, artworksData]) => {
        if (isMounted) {
          setEvents(eventsData);
          setArtworksCatalog(artworksData);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle("");
    setSlug("");
    setEventType("EXHIBITION");
    setDescription("");
    setVenue("Lalita Kapilavai Heritage Studio");
    setCity("Bengaluru");
    setTimezone("Asia/Kolkata");
    setStartDate("");
    setEndDate("");
    setMaxCapacity("100");
    setRegistrationFee("");
    setCurrency("INR");
    setIsRegistrationOpen(true);
    setSelectedArtworkIds([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = async (ev: EventItem) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setSlug(ev.slug);
    setEventType(ev.eventType);
    setDescription(ev.description);
    setVenue(ev.venue);
    setCity(ev.city);
    setTimezone(ev.timezone);
    setStartDate(ev.startDate ? ev.startDate.slice(0, 16) : "");
    setEndDate(ev.endDate ? ev.endDate.slice(0, 16) : "");
    setMaxCapacity(ev.maxCapacity ? ev.maxCapacity.toString() : "");
    setRegistrationFee(ev.registrationFee ? ev.registrationFee.toString() : "");
    setCurrency(ev.currency || "INR");
    setIsRegistrationOpen(ev.isRegistrationOpen);

    // Fetch linked artworks
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`);
      if (res.ok) {
        const fullEvent = await res.json();
        setSelectedArtworkIds(
          fullEvent.artworks?.map((a: { artworkId: string }) => a.artworkId) || []
        );
      }
    } catch (e) {
      console.error(e);
    }

    setDialogOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEvent) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug,
      eventType,
      description,
      venue,
      city,
      timezone,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
      registrationFee: registrationFee ? parseFloat(registrationFee) : null,
      currency,
      isRegistrationOpen,
      artworkIds: selectedArtworkIds,
    };

    try {
      if (editingEvent) {
        const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          reloadEvents();
        }
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setDialogOpen(false);
          reloadEvents();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to create event");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error saving event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, evTitle: string) => {
    if (!confirm(`Delete event "${evTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) reloadEvents();
    } catch (e) {
      console.error(e);
    }
  };

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

  const toggleArtworkSelection = (artId: string) => {
    setSelectedArtworkIds((prev) =>
      prev.includes(artId) ? prev.filter((id) => id !== artId) : [...prev, artId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Exhibitions &amp; Recitals Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Events &amp; Exhibitions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage classical workshops, gallery exhibitions, Carnatic recitals, timezone alignments, and attendee RSVPs.
          </p>
        </div>

        <Button variant="gold" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading event calendar...</span>
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No Events Scheduled</CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Create an exhibition or concert to attach masterworks and start capturing visitor RSVPs.
          </CardDescription>
          <Button variant="gold" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Schedule First Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <Card key={ev.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="gold" className="text-[10px] uppercase">
                    {ev.eventType}
                  </Badge>
                  <Badge variant={ev.isRegistrationOpen ? "outline" : "secondary"} className="text-[10px]">
                    {ev.isRegistrationOpen ? "RSVP Open" : "Closed"}
                  </Badge>
                </div>

                <CardTitle className="text-base font-serif font-bold text-foreground mt-2">
                  {ev.title}
                </CardTitle>

                <CardDescription className="text-xs font-mono text-primary">
                  /{ev.slug}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2.5 pb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {formatLocalizedDateTime(ev.startDate, ev.timezone)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {ev.venue}, {ev.city}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Fee: <strong className="text-foreground">{ev.registrationFee ? formatCurrency(ev.registrationFee, ev.currency || "INR") : "Free Admission"}</strong></span>
                  <span>Cap: <strong className="text-foreground">{ev.maxCapacity ? `${ev.maxCapacity} seats` : "Unlimited"}</strong></span>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-[11px]">
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
                    onClick={() => handleViewAttendees(ev)}
                    className="h-8 text-xs gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    RSVPs ({ev._count?.registrations || 0})
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(ev)}
                    className="h-8 w-8 p-0"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ev.id, ev.title)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Event Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveEvent}>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event / Exhibition" : "Schedule New Event / Exhibition"}
              </DialogTitle>
              <DialogDescription>
                Configure dates, timezones, gallery venue, and attach specific masterworks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-left">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <Input
                    placeholder="e.g. Divine Gold: Tanjore Sacred Retrospective"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">URL Slug</label>
                  <Input
                    placeholder="divine-gold-retrospective"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Event Type & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Event Type</label>
                  <select
                    value={eventType}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="EXHIBITION">EXHIBITION (Gallery Floor)</option>
                    <option value="CONCERT">CONCERT (Carnatic Vocal Recital)</option>
                    <option value="WORKSHOP">WORKSHOP (Tanjore Gilding Class)</option>
                    <option value="ONLINE_CLASSROOM">ONLINE_CLASSROOM (Virtual Raga Masterclass)</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Timezone (IANA)</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {IANA_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date &amp; Time</label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">End Date &amp; Time</label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Venue & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Venue Address / Link</label>
                  <Input
                    placeholder="Lalita Kapilavai Heritage Studio, Indiranagar"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <Input
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Capacity & Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Max Capacity</label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Fee</label>
                  <Input
                    type="number"
                    placeholder="0 for Free entry"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isRegOpen"
                    checked={isRegistrationOpen}
                    onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isRegOpen" className="text-xs font-medium text-foreground">
                    RSVP Open
                  </label>
                </div>
              </div>

              {/* Exhibition Artwork Linker Button */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-xs text-foreground">
                    Exhibition Catalog Linkage
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedArtworkIds.length} masterwork(s) attached to this event.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkerModalOpen(true)}
                  className="text-xs gap-1"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Select Artworks
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description &amp; Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Overview of the exhibition, featured ragas, or workshop curriculum..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exhibition Artwork Linker Modal */}
      <Dialog open={linkerModalOpen} onOpenChange={setLinkerModalOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Attach Masterworks to Exhibition</DialogTitle>
            <DialogDescription>
              Select paintings that will be on physical display in this exhibition.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
            {artworksCatalog.map((art) => {
              const isSelected = selectedArtworkIds.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => toggleArtworkSelection(art.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-foreground">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {art.medium}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={() => setLinkerModalOpen(false)}
            >
              Done ({selectedArtworkIds.length} selected)
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
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      {new Date(a.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
