"use client";

import * as React from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Palette,
  Upload,
  Trash2,
  Info,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Check,
  Globe,
  FileText,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AiAssistantModal } from "@/components/admin/ai-assistant-modal";
import { ModernDateTimePicker } from "@/components/admin/modern-datetime-picker";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import {
  getAllCountries,
  findCountry,
  getTimezonesForCountry,
  formatEventSchedule,
} from "@/lib/geo-timezone";
import { SUPPORTED_CURRENCIES } from "@/lib/formatters";

export interface GalleryImageItem {
  id?: string;
  url: string;
  caption?: string;
  title?: string;
  alt?: string;
  linkType?: "none" | "artwork" | "category" | "custom";
  linkTarget?: string;
}

export interface EventFormData {
  id?: string;
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
  country: string;
  countryCode?: string | null;
  timezone: string;
  startDate: string; // ISO string
  endDate?: string | null; // ISO string
  posterUrl?: string | null;
  bannerImage?: string | null;
  galleryImages?: GalleryImageItem[] | null;
  galleryDisplayMode?: string | null;
  galleryAutoplayTimer?: number | null;
  brochurePdfUrl?: string | null;
  brochureTitle?: string | null;
  brochureDownloadable?: boolean | null;
  maxCapacity?: number | null;
  registrationFee?: number | null;
  currency: string;
  isRegistrationOpen: boolean;
  isPublished: boolean;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  artworkIds?: string[];
}

interface ArtworkSummary {
  id: string;
  title: string;
  slug: string;
  medium: string;
  primaryImageUrl: string;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialEvent?: EventFormData | null;
  artworksCatalog: ArtworkSummary[];
}

export function EventFormModal({
  isOpen,
  onClose,
  onSaved,
  initialEvent,
  artworksCatalog,
}: EventFormModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <EventFormContent
        key={initialEvent?.id || "create-event-dialog"}
        onClose={onClose}
        onSaved={onSaved}
        initialEvent={initialEvent}
        artworksCatalog={artworksCatalog}
      />
    </Dialog>
  );
}

function EventFormContent({
  onClose,
  onSaved,
  initialEvent,
  artworksCatalog,
}: {
  onClose: () => void;
  onSaved: () => void;
  initialEvent?: EventFormData | null;
  artworksCatalog: ArtworkSummary[];
}) {
  const isEditing = !!initialEvent?.id;

  // Active Tab State
  const [activeTab, setActiveTab] = React.useState("general");

  // Form Fields Initial State
  const [title, setTitle] = React.useState(initialEvent?.title || "");
  const [slug, setSlug] = React.useState(initialEvent?.slug || "");
  const [eventType, setEventType] = React.useState<EventFormData["eventType"]>(
    initialEvent?.eventType || "EXHIBITION"
  );
  const [description, setDescription] = React.useState(initialEvent?.description || "");
  const [country, setCountry] = React.useState(initialEvent?.country || "India");
  const [countryCode, setCountryCode] = React.useState(initialEvent?.countryCode || "IN");
  const [timezone, setTimezone] = React.useState(initialEvent?.timezone || "Asia/Kolkata");
  const [startDate, setStartDate] = React.useState(initialEvent?.startDate || "");
  const [endDate, setEndDate] = React.useState(initialEvent?.endDate || "");
  const [venue, setVenue] = React.useState(
    initialEvent?.venue || initialEvent?.venueName || "Lalita Kapilavai Heritage Studio"
  );
  const [venueName, setVenueName] = React.useState(
    initialEvent?.venueName || initialEvent?.venue || "Lalita Kapilavai Heritage Studio"
  );
  const [streetAddress, setStreetAddress] = React.useState(initialEvent?.streetAddress || "");
  const [city, setCity] = React.useState(initialEvent?.city || "Bengaluru");
  const [stateProvince, setStateProvince] = React.useState(initialEvent?.stateProvince || "Karnataka");
  const [postalCode, setPostalCode] = React.useState(initialEvent?.postalCode || "560038");
  const [maxCapacity, setMaxCapacity] = React.useState(
    initialEvent?.maxCapacity ? initialEvent.maxCapacity.toString() : "100"
  );
  const [registrationFee, setRegistrationFee] = React.useState(
    initialEvent?.registrationFee ? initialEvent.registrationFee.toString() : "0"
  );
  const [currency, setCurrency] = React.useState(initialEvent?.currency || "INR");
  const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(
    initialEvent?.isRegistrationOpen !== false
  );
  const [isPublished, setIsPublished] = React.useState(initialEvent?.isPublished !== false);
  const [contactName, setContactName] = React.useState(
    initialEvent?.contactName || "Smt. Lalita Kapilavai"
  );
  const [contactEmail, setContactEmail] = React.useState(
    initialEvent?.contactEmail || "events@lalitakapilavai.com"
  );
  const [contactPhone, setContactPhone] = React.useState(
    initialEvent?.contactPhone || "+91 98450 00000"
  );
  const [bannerImage, setBannerImage] = React.useState<string>(
    initialEvent?.bannerImage || initialEvent?.posterUrl || ""
  );
  const [galleryImages, setGalleryImages] = React.useState<GalleryImageItem[]>(
    Array.isArray(initialEvent?.galleryImages) ? initialEvent.galleryImages : []
  );
  const [galleryDisplayMode, setGalleryDisplayMode] = React.useState<string>(
    initialEvent?.galleryDisplayMode || "CAROUSEL"
  );
  const [galleryAutoplayTimer, setGalleryAutoplayTimer] = React.useState<number>(
    initialEvent?.galleryAutoplayTimer ?? 4
  );
  const [brochurePdfUrl, setBrochurePdfUrl] = React.useState<string>(
    initialEvent?.brochurePdfUrl || ""
  );
  const [brochureTitle, setBrochureTitle] = React.useState<string>(
    initialEvent?.brochureTitle || "Exhibition Monograph & Program Brochure"
  );
  const [brochureDownloadable, setBrochureDownloadable] = React.useState<boolean>(
    initialEvent?.brochureDownloadable !== false
  );
  const [selectedArtworkIds, setSelectedArtworkIds] = React.useState<string[]>(
    initialEvent?.artworkIds || []
  );

  // Helpers
  const [saving, setSaving] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const [uploadingGallery, setUploadingGallery] = React.useState(false);
  const [uploadingBrochure, setUploadingBrochure] = React.useState(false);

  // Countries and Timezones Data
  const countries = React.useMemo(() => getAllCountries(), []);
  const availableTimezones = React.useMemo(() => {
    return getTimezonesForCountry(countryCode);
  }, [countryCode]);

  const selectedCountryInfo = React.useMemo(() => {
    return findCountry(countryCode) || findCountry(country) || countries[0];
  }, [countryCode, country, countries]);

  // Country Selection Change Handler
  const handleCountryChange = (cCode: string) => {
    const found = countries.find((c) => c.code === cCode);
    if (!found) return;

    setCountryCode(found.code);
    setCountry(found.name);
    setCurrency(found.defaultCurrency);

    // Auto-populate country's default timezone
    if (found.defaultTimezone) {
      setTimezone(found.defaultTimezone);
    }

    // Auto-fill dialing code on contact phone if blank or generic
    if (!contactPhone || contactPhone.trim() === "" || contactPhone.startsWith("+")) {
      setContactPhone(`${found.dialCode} `);
    }
  };

  // Generate URL slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Upload Hero Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const body = new FormData();
    body.append("file", file);
    body.append("watermark", "false");

    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload banner");

      const imgUrl = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl || data.rawUrl;
      setBannerImage(imgUrl);
      toast.success("Hero banner uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Banner upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Upload Gallery Images
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newItems: GalleryImageItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const body = new FormData();
        body.append("file", file);
        body.append("watermark", "false");

        const res = await fetch("/api/admin/media/upload", { method: "POST", body });
        const data = await res.json();
        if (res.ok) {
          const imgUrl = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl || data.rawUrl;
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          newItems.push({
            id: `gal-${Date.now()}-${i}`,
            url: imgUrl,
            title: cleanName,
            caption: "",
            alt: cleanName,
            linkType: "none",
            linkTarget: "",
          });
        }
      }

      setGalleryImages((prev) => [...prev, ...newItems]);
      toast.success(`Uploaded ${newItems.length} gallery image(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gallery upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    setGalleryImages((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const updateGalleryItemField = (index: number, field: keyof GalleryImageItem, val: string) => {
    setGalleryImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  // Upload Brochure PDF
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a valid PDF file");
      return;
    }

    setUploadingBrochure(true);
    const body = new FormData();
    body.append("file", file);
    body.append("watermark", "false");

    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload brochure");

      const pdfUrl = data.publicUrl || data.rawUrl;
      setBrochurePdfUrl(pdfUrl);
      if (!brochureTitle || brochureTitle === "Exhibition Monograph & Program Brochure") {
        setBrochureTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      toast.success("PDF Brochure uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Brochure upload failed");
    } finally {
      setUploadingBrochure(false);
    }
  };

  // Toggle artwork selection
  const toggleArtworkSelection = (artId: string) => {
    setSelectedArtworkIds((prev) =>
      prev.includes(artId) ? prev.filter((id) => id !== artId) : [...prev, artId]
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim() || !startDate) {
      toast.error("Please fill in Title, Slug, and Start Date & Time");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      eventType,
      description,
      venue: venueName || venue || "Lalita Kapilavai Heritage Studio",
      venueName: venueName || venue || "Lalita Kapilavai Heritage Studio",
      streetAddress: streetAddress || null,
      city: city.trim() || "Bengaluru",
      stateProvince: stateProvince || null,
      postalCode: postalCode || null,
      country: country || "India",
      countryCode: countryCode || "IN",
      timezone: timezone || "Asia/Kolkata",
      startDate,
      endDate: endDate || null,
      posterUrl: bannerImage || null,
      bannerImage: bannerImage || null,
      galleryImages: galleryImages.length > 0 ? galleryImages : null,
      galleryDisplayMode,
      galleryAutoplayTimer,
      brochurePdfUrl: brochurePdfUrl.trim() || null,
      brochureTitle: brochureTitle.trim() || "Exhibition Monograph & Program Brochure",
      brochureDownloadable,
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
      registrationFee: registrationFee ? parseFloat(registrationFee) : 0,
      currency: currency || "INR",
      isRegistrationOpen,
      isPublished,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      artworkIds: selectedArtworkIds,
    };

    try {
      const url = isEditing ? `/api/admin/events/${initialEvent.id}` : "/api/admin/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      toast.success(isEditing ? "Event updated successfully!" : "Event scheduled successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving event");
    } finally {
      setSaving(false);
    }
  };

  // Live formatted schedule string
  const liveSchedulePreview = React.useMemo(() => {
    if (!startDate) return null;
    return formatEventSchedule(startDate, endDate, timezone);
  }, [startDate, endDate, timezone]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl">
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {isEditing ? "Curate Event & Exhibition" : "Schedule New Event / Exhibition"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Configure international timezone, multi-day schedule, venue logistics, gallery media, and curatorial contacts.
            </DialogDescription>
          </div>

          <Badge variant="gold" className="text-xs uppercase font-mono">
            {eventType}
          </Badge>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3 border-b border-border/60 bg-card">
            <TabsList className="grid grid-cols-7 h-9 bg-muted/40 p-1 text-xs">
              <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
              <TabsTrigger value="dates" className="text-xs">Dates &amp; Timezone</TabsTrigger>
              <TabsTrigger value="venue" className="text-xs">Venue &amp; Address</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Curator Contact</TabsTrigger>
              <TabsTrigger value="media" className="text-xs">Banner &amp; Gallery</TabsTrigger>
              <TabsTrigger value="brochure" className="text-xs">Brochure (PDF)</TabsTrigger>
              <TabsTrigger value="artworks" className="text-xs">Artworks ({selectedArtworkIds.length})</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: GENERAL DETAILS */}
            <TabsContent value="general" className="m-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event Title *</label>
                  <Input
                    required
                    placeholder="e.g. NYC Madison Art Exhibition"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">URL Slug *</label>
                  <Input
                    required
                    placeholder="e.g. nyc-madison-art-exhibition"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventFormData["eventType"])}
                    className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="EXHIBITION">EXHIBITION (Gallery Floor)</option>
                    <option value="CONCERT">CONCERT (Classical Vocal Recital)</option>
                    <option value="RECITAL">RECITAL (Solo Chamber Concert)</option>
                    <option value="WORKSHOP">WORKSHOP (Tanjore 22k Gold Masterclass)</option>
                    <option value="PRIVATE_VIEWING">PRIVATE VIEWING (Collector Salon)</option>
                    <option value="ONLINE_CLASSROOM">ONLINE CLASSROOM (Virtual Archive)</option>
                    <option value="OTHER">OTHER (Special Cultural Gathering)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Capacity &amp; Commercials</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Max Capacity"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Fee (0 for Free)"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Rich Description with WYSIWYG Tiptap Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Description &amp; Program Notes (WYSIWYG)
                  </label>
                  <AiAssistantModal
                    initialContext={`${title ? `Event: ${title}\n` : ""}${venueName || venue ? `Venue: ${venueName || venue}\n` : ""}${description || ""}`}
                    onApply={(generated: string) => {
                      setDescription((prev) => (prev ? `${prev}<br/><br/>${generated}` : generated));
                    }}
                    triggerLabel="✨ AI Assist"
                    triggerClassName="h-6 text-[11px] px-2 text-primary border-primary/40 hover:bg-primary/10"
                  />
                </div>
                <div className="rounded-md border border-border bg-card/60 p-1 shadow-xs">
                  <TiptapEditor
                    content={description}
                    onChange={(_, html) => setDescription(html)}
                    placeholder="Provide curatorial background, featured ragas, traditional techniques, or collector notes..."
                    className="min-h-[160px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRegistrationOpen}
                    onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  RSVP Registration Open
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  Published on Website
                </label>
              </div>
            </TabsContent>

            {/* TAB 2: DATES & TIMEZONE */}
            <TabsContent value="dates" className="m-0 space-y-5">
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 text-xs flex items-start gap-3">
                <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-foreground block">
                    Timezone-Protected Scheduling Engine
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Selecting the host Country and Timezone guarantees that entered dates and times reflect the local venue wall-clock schedule with zero offset corruption across international time zones.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Global Country Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Host Country (Global 240+) *</span>
                    <span className="text-[10px] text-muted-foreground">Auto-configures currency &amp; timezones</span>
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.defaultCurrency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country-Filtered Timezone Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Venue Timezone (IANA) *</span>
                    <span className="font-mono text-[10px] text-primary">{timezone}</span>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {availableTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DateTime Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ModernDateTimePicker
                  value={startDate}
                  onChange={setStartDate}
                  timeZone={timezone}
                  label="Start Date &amp; Time *"
                  placeholder="Select start date &amp; time"
                />

                <ModernDateTimePicker
                  value={endDate}
                  onChange={setEndDate}
                  timeZone={timezone}
                  label="End Date &amp; Time (Multi-Day or Concluding Time)"
                  placeholder="Select end date &amp; time"
                />
              </div>

              {/* Live Formatted Schedule Preview */}
              {liveSchedulePreview && (
                <div className="p-3.5 rounded-xl border border-border bg-card/60 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block font-semibold">
                        Live Public Schedule Display
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {liveSchedulePreview}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                    {timezone}
                  </Badge>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: VENUE & ADDRESS */}
            <TabsContent value="venue" className="m-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Venue / Gallery Hall *</label>
                  <Input
                    required
                    placeholder="e.g. Lalita Kapilavai Heritage Studio or Carnegie Hall"
                    value={venueName}
                    onChange={(e) => {
                      setVenueName(e.target.value);
                      setVenue(e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Street Address / Landmark</label>
                  <Input
                    placeholder="e.g. 1 Madison Avenue, Flatiron District"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">City *</label>
                  <Input
                    required
                    placeholder="e.g. New York or Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {selectedCountryInfo.stateLabel}
                  </label>
                  <Input
                    placeholder={`e.g. ${selectedCountryInfo.stateLabel}`}
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {selectedCountryInfo.postalLabel}
                  </label>
                  <Input
                    placeholder={`e.g. ${selectedCountryInfo.postalLabel}`}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: CURATOR & ORGANIZER CONTACT */}
            <TabsContent value="contacts" className="m-0 space-y-4">
              <div className="p-3.5 rounded-xl border border-border bg-card/40 text-xs flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-foreground block">
                    Dedicated Event Desk
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    These contact details are displayed on the public event page under &quot;Inquiries &amp; Curatorial Desk&quot; so attendees and patrons can contact the exhibition organizer directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Contact Person / Curator
                  </label>
                  <Input
                    placeholder="e.g. Smt. Lalita Kapilavai"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Dedicated Email
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. events@lalitakapilavai.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    WhatsApp / Phone
                  </label>
                  <Input
                    placeholder="e.g. +1 212-555-0199"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: HERO BANNER & EVENT GALLERY */}
            <TabsContent value="media" className="m-0 space-y-6">
              {/* Hero Banner Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Exhibition Hero Banner
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Wide banner rendered prominently at the top of the event page.
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-input/50 hover:bg-input text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    {uploadingBanner ? "Uploading..." : "Upload Banner"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBanner}
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {bannerImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border h-48 sm:h-64 w-full group bg-card">
                    <Image
                      src={bannerImage}
                      alt="Hero Banner Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setBannerImage("")}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove Banner
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground bg-muted/10">
                    <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                    No hero banner uploaded. Recommended size: 1920x800px.
                  </div>
                )}
              </div>

              {/* Multi-Image Event Gallery Studio */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Event Photo Gallery Studio ({galleryImages.length})
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Multi-mode media showcase supporting auto-carousels, smooth scroll tracks, and heritage collages.
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-input/50 hover:bg-input text-xs font-medium cursor-pointer transition-colors self-start sm:self-auto">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    {uploadingGallery ? "Uploading..." : "Add Photos"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingGallery}
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Display Mode & Settings Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-border bg-muted/20">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                      Gallery Display Engine
                    </label>
                    <select
                      value={galleryDisplayMode}
                      onChange={(e) => setGalleryDisplayMode(e.target.value)}
                      className="w-full bg-card border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="CAROUSEL">Auto-playing Carousel (High-Fidelity Slides)</option>
                      <option value="SCROLL">Smooth Horizontal Scroll Track (Swipeable)</option>
                      <option value="COLLAGE">5-Photo Heritage Collage (Bento Grid)</option>
                    </select>
                  </div>

                  {galleryDisplayMode === "CAROUSEL" ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-primary" />
                          Autoplay Transition Interval
                        </label>
                        <span className="font-mono text-xs text-primary font-semibold">
                          {galleryAutoplayTimer}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={10}
                        step={1}
                        value={galleryAutoplayTimer}
                        onChange={(e) => setGalleryAutoplayTimer(parseInt(e.target.value, 10))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>2s (Fast)</span>
                        <span>4s (Default)</span>
                        <span>10s (Slow)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-muted-foreground flex flex-col justify-center">
                      <span className="font-medium text-foreground">Presentation Mode</span>
                      <p className="text-[11px] leading-relaxed">
                        {galleryDisplayMode === "SCROLL"
                          ? "Displays full-height responsive cards along an overflow-x scroll container."
                          : "Curates the first 5 images in a golden ratio masonry collage; extras open in lightbox."}
                      </p>
                    </div>
                  )}
                </div>

                {galleryImages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground bg-muted/10">
                    No gallery photos attached. Click &quot;Add Photos&quot; to upload multiple images.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="rounded-lg border border-border bg-card overflow-hidden flex flex-col space-y-2 p-2.5 shadow-xs"
                      >
                        <div className="relative h-36 w-full rounded-md overflow-hidden bg-muted/30">
                          <Image
                            src={img.url}
                            alt={img.title || img.caption || `Gallery ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                            #{idx + 1}
                          </div>

                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveGalleryImage(idx, "up")}
                              className="bg-black/70 hover:bg-primary disabled:opacity-30 text-white p-1 rounded transition-colors"
                              title="Move Left / Earlier"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === galleryImages.length - 1}
                              onClick={() => moveGalleryImage(idx, "down")}
                              className="bg-black/70 hover:bg-primary disabled:opacity-30 text-white p-1 rounded transition-colors"
                              title="Move Right / Later"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="bg-black/70 hover:bg-destructive text-white p-1 rounded transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Input
                            placeholder="Photo Title / Heading..."
                            value={img.title || ""}
                            onChange={(e) => updateGalleryItemField(idx, "title", e.target.value)}
                            className="text-xs h-7"
                          />
                          <Input
                            placeholder="Photo Caption / Commentary..."
                            value={img.caption || ""}
                            onChange={(e) => updateGalleryItemField(idx, "caption", e.target.value)}
                            className="text-xs h-7"
                          />

                          {/* Optional Link Configuration */}
                          <div className="pt-1 flex items-center gap-1.5">
                            <select
                              value={img.linkType || "none"}
                              onChange={(e) => updateGalleryItemField(idx, "linkType", e.target.value)}
                              className="bg-muted/40 border border-border text-foreground text-[10px] rounded px-1.5 py-1 focus:outline-none"
                            >
                              <option value="none">No Link</option>
                              <option value="artwork">Link to Artwork</option>
                              <option value="custom">Custom URL</option>
                            </select>

                            {img.linkType === "artwork" ? (
                              <select
                                value={img.linkTarget || ""}
                                onChange={(e) => updateGalleryItemField(idx, "linkTarget", e.target.value)}
                                className="flex-1 bg-card border border-border text-foreground text-[10px] rounded px-1.5 py-1 focus:outline-none truncate"
                              >
                                <option value="">Select Artwork...</option>
                                {artworksCatalog.map((art) => (
                                  <option key={art.id} value={art.slug}>
                                    {art.title}
                                  </option>
                                ))}
                              </select>
                            ) : img.linkType === "custom" ? (
                              <Input
                                placeholder="https://... or /page"
                                value={img.linkTarget || ""}
                                onChange={(e) => updateGalleryItemField(idx, "linkTarget", e.target.value)}
                                className="text-[10px] h-6 flex-1 py-0"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 6: EVENT PDF BROCHURE / MONOGRAPH */}
            <TabsContent value="brochure" className="m-0 space-y-6">
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-xs flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-foreground block text-sm">
                    Exhibition Monograph &amp; Event Brochure Engine
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    Upload a high-fidelity archival PDF catalog, concert program, or exhibition monograph. An interactive document viewer with download capabilities will be embedded directly into the public event page.
                  </p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">
                      Program Brochure File (PDF)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Upload archival document in PDF format (up to 50MB).
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-input/50 hover:bg-input text-xs font-medium cursor-pointer transition-colors self-start sm:self-auto">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    {uploadingBrochure ? "Uploading PDF..." : "Upload Brochure (PDF)"}
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingBrochure}
                      onChange={handleBrochureUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Document Title
                    </label>
                    <Input
                      placeholder="e.g. Exhibition Monograph & Program Brochure"
                      value={brochureTitle}
                      onChange={(e) => setBrochureTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Direct PDF URL (Manual / CDN)
                    </label>
                    <Input
                      placeholder="https://... or /uploads/brochure.pdf"
                      value={brochurePdfUrl}
                      onChange={(e) => setBrochurePdfUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brochureDownloadable}
                      onChange={(e) => setBrochureDownloadable(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Enable Attendee PDF Download Button on Public Page
                  </label>
                </div>
              </div>

              {/* PDF Preview Card */}
              {brochurePdfUrl ? (
                <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-foreground">
                          {brochureTitle || "Exhibition Monograph"}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-mono truncate max-w-md block">
                          {brochurePdfUrl}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={brochurePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-border hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview
                      </a>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setBrochurePdfUrl("")}
                        className="h-7 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Embedded PDF iframe preview */}
                  <div className="rounded-lg overflow-hidden border border-border h-64 bg-muted/20">
                    <iframe
                      src={`${brochurePdfUrl}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={brochureTitle}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground bg-muted/10">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2 opacity-40" />
                  No brochure attached. Click &quot;Upload Brochure (PDF)&quot; above to attach a monograph.
                </div>
              )}
            </TabsContent>

            {/* TAB 7: EXHIBITION ARTWORKS CATALOG */}
            <TabsContent value="artworks" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Attach Masterworks to Exhibition Floor
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Selected works are linked and displayed on the event page.
                  </span>
                </div>

                <Badge variant="outline" className="text-xs font-mono">
                  {selectedArtworkIds.length} Selected
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {artworksCatalog.map((art) => {
                  const isSelected = selectedArtworkIds.includes(art.id);
                  return (
                    <div
                      key={art.id}
                      onClick={() => toggleArtworkSelection(art.id)}
                      className={`cursor-pointer rounded-lg border p-2.5 flex items-center gap-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-muted/40 shrink-0">
                        {art.primaryImageUrl ? (
                          <Image
                            src={art.primaryImageUrl}
                            alt={art.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Palette className="w-5 h-5 m-auto text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {art.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {art.medium}
                        </span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>

          <DialogFooter className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {liveSchedulePreview ? (
                <span className="truncate max-w-sm block">
                  <span className="font-semibold text-foreground">Schedule:</span> {liveSchedulePreview}
                </span>
              ) : (
                "All times strictly preserved in the event's selected IANA timezone."
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="min-w-[100px]"
              >
                {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </DialogFooter>
        </Tabs>
      </form>
    </DialogContent>
  );
}
