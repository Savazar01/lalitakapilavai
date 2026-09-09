"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Palette,
  FileText,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  Eye,
  FileDown,
  Star,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MediaUploader } from "@/components/admin/media-uploader";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import { AiAssistantModal } from "@/components/admin/ai-assistant-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ArtworkOption {
  id: string;
  title: string;
  slug: string;
  medium: string;
  dimensions?: string | null;
  primaryImageUrl: string;
  yearCreated: number | null;
  category?: {
    name: string;
  };
}

interface CatalogPlate {
  id?: string;
  artworkId: string;
  pageNumber: number;
  curatorialNote?: string | null;
  highlightPlate: boolean;
  artwork: ArtworkOption;
}

interface ECatalogDetail {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  curatorialEssay: string | null;
  forewordBy: string | null;
  coverImageUrl: string | null;
  themeColor: string;
  isPublished: boolean;
  downloadablePdfUrl: string | null;
  eventId: string | null;
  event?: {
    id: string;
    title: string;
  } | null;
  items: CatalogPlate[];
}

export default function AdminCatalogStudioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [catalog, setCatalog] = React.useState<ECatalogDetail | null>(null);
  const [availableArtworks, setAvailableArtworks] = React.useState<ArtworkOption[]>([]);
  const [events, setEvents] = React.useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Studio form state
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [curatorialEssay, setCuratorialEssay] = React.useState("");
  const [forewordBy, setForewordBy] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [themeColor, setThemeColor] = React.useState("gold");
  const [isPublished, setIsPublished] = React.useState(false);
  const [downloadablePdfUrl, setDownloadablePdfUrl] = React.useState("");
  const [eventId, setEventId] = React.useState<string>("none");

  // Artwork plates state
  const [plates, setPlates] = React.useState<CatalogPlate[]>([]);
  const [artworkPickerOpen, setArtworkPickerOpen] = React.useState(false);
  const [artworkSearch, setArtworkSearch] = React.useState("");

  React.useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [catRes, artRes, evtRes] = await Promise.all([
          fetch(`/api/admin/catalogs/${id}`),
          fetch("/api/admin/artworks?limit=100"),
          fetch("/api/admin/events"),
        ]);

        const [catData, artData, evtData] = await Promise.all([
          catRes.json(),
          artRes.json(),
          evtRes.json(),
        ]);

        if (!ignore && catRes.ok && catData) {
          setCatalog(catData);
          setTitle(catData.title || "");
          setSlug(catData.slug || "");
          setSubtitle(catData.subtitle || "");
          setCuratorialEssay(catData.curatorialEssay || "");
          setForewordBy(catData.forewordBy || "");
          setCoverImageUrl(catData.coverImageUrl || "");
          setThemeColor(catData.themeColor || "gold");
          setIsPublished(Boolean(catData.isPublished));
          setDownloadablePdfUrl(catData.downloadablePdfUrl || "");
          setEventId(catData.eventId || "none");
          setPlates(catData.items || []);
        }

        if (!ignore && artRes.ok) {
          if (Array.isArray(artData)) {
            setAvailableArtworks(artData);
          } else if (artData && Array.isArray(artData.artworks)) {
            setAvailableArtworks(artData.artworks);
          }
        }

        if (!ignore && evtRes.ok && Array.isArray(evtData)) {
          setEvents(evtData);
        }
      } catch (err) {
        console.error("Failed to load catalog studio data:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [id]);

  // Save All Changes
  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        subtitle: subtitle.trim() || null,
        curatorialEssay: curatorialEssay || null,
        forewordBy: forewordBy.trim() || null,
        coverImageUrl: coverImageUrl || null,
        themeColor,
        isPublished,
        downloadablePdfUrl: downloadablePdfUrl.trim() || null,
        eventId: eventId === "none" ? null : eventId,
        items: plates.map((p, idx) => ({
          artworkId: p.artworkId,
          pageNumber: idx + 1,
          curatorialNote: p.curatorialNote || null,
          highlightPlate: p.highlightPlate,
        })),
      };

      const res = await fetch(`/api/admin/catalogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save catalog");
      }

      toast.success("Catalog updated successfully!");
      setCatalog(data);
      setPlates(data.items || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving catalog");
    } finally {
      setSaving(false);
    }
  };

  // Reorder Plates
  const movePlate = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= plates.length) return;

    const newPlates = [...plates];
    const temp = newPlates[index];
    newPlates[index] = newPlates[targetIdx];
    newPlates[targetIdx] = temp;

    // re-assign page numbers
    const updated = newPlates.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPlates(updated);
  };

  const removePlate = (index: number) => {
    const updated = plates.filter((_, i) => i !== index).map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPlates(updated);
  };

  const toggleHighlightPlate = (index: number) => {
    setPlates((prev) => {
      const copy = [...prev];
      copy[index].highlightPlate = !copy[index].highlightPlate;
      return copy;
    });
  };

  const toggleArtworkPlate = (art: ArtworkOption) => {
    const existingIndex = plates.findIndex((p) => p.artworkId === art.id);
    if (existingIndex >= 0) {
      removePlate(existingIndex);
      toast.info(`Removed "${art.title}" from catalog plates`);
    } else {
      const newPlate: CatalogPlate = {
        artworkId: art.id,
        pageNumber: plates.length + 1,
        curatorialNote: "",
        highlightPlate: false,
        artwork: art,
      };
      setPlates((prev) => [...prev, newPlate]);
      toast.success(`Added "${art.title}" to catalog plates`);
    }
  };


  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading e-Catalog Studio...</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-destructive">Catalog not found.</p>
        <Button onClick={() => router.push("/admin/catalogs")} variant="outline" size="sm">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Catalogs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/catalogs")}
            className="h-8 w-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground truncate max-w-md">
                {title || "Untitled Catalog"}
              </h1>
              <Badge
                variant={isPublished ? "default" : "secondary"}
                className={`text-[10px] ${isPublished ? "bg-primary/20 text-primary border-primary/30" : ""}`}
              >
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              /catalogs/{slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/catalogs/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-3 py-1.5 rounded-md border border-border bg-card"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Reader
          </Link>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Catalog
          </Button>
        </div>
      </div>

      {/* Curation Studio Tabs */}
      <Tabs defaultValue="metadata" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border/80">
          <TabsTrigger value="metadata" className="text-xs flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> 1. Metadata &amp; Cover
          </TabsTrigger>
          <TabsTrigger value="editorial" className="text-xs flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> 2. Curatorial Essay
          </TabsTrigger>
          <TabsTrigger value="plates" className="text-xs flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> 3. Artwork Plates ({plates.length})
          </TabsTrigger>
          <TabsTrigger value="pdf" className="text-xs flex items-center gap-1.5">
            <FileDown className="w-3.5 h-3.5" /> 4. Publication &amp; PDF
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Metadata & Cover */}
        <TabsContent value="metadata" className="space-y-5">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif font-bold">Catalog Identity</CardTitle>
              <CardDescription className="text-xs">
                Exhibition title, monograph subtitle, associated showcase, and publication status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Catalog Title *</label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Swarna Bindu: Sacred Tanjore Masterworks"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Slug (URL Permalink) *</label>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. swarna-bindu-tanjore-masterworks"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subtitle / Monograph Theme</label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. An Exhibition Monograph on 22k Gold Foil Iconography"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Linked Exhibition / Event</label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Associate with an Event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Standalone Monograph (No Event)</SelectItem>
                      {events.map((evt) => (
                        <SelectItem key={evt.id} value={evt.id}>
                          {evt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Catalog Foil Theme</label>
                  <Select value={themeColor} onValueChange={setThemeColor}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Foil Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Antique Temple Gold (22k)</SelectItem>
                      <SelectItem value="terracotta">Sacred Terracotta</SelectItem>
                      <SelectItem value="obsidian">Deep Obsidian Royal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Front Cover Image
                </label>
                <MediaUploader
                  value={coverImageUrl}
                  onUploadComplete={(url) => setCoverImageUrl(url)}
                  onRemove={() => setCoverImageUrl("")}
                  mediaType="general"
                  description="High-resolution visual representing the front cover of the digital book."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Curatorial Essay & Foreword */}
        <TabsContent value="editorial" className="space-y-5">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-serif font-bold">Curatorial Foreword &amp; Essay</CardTitle>
                  <CardDescription className="text-xs">
                    Curatorial statement, scholarly foreword, and historical commentary introducing the collection.
                  </CardDescription>
                </div>
                <AiAssistantModal
                  initialContext={`${title ? `Catalog: ${title}\n` : ""}${forewordBy ? `Foreword: ${forewordBy}\n` : ""}${curatorialEssay || ""}`}
                  onApply={(aiText) => {
                    setCuratorialEssay((prev) => {
                      const newParagraph = `<p>${aiText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
                      return prev ? `${prev}${newParagraph}` : newParagraph;
                    });
                  }}
                  triggerLabel="✨ AI Curatorial Essay"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Foreword / Curated By</label>
                <Input
                  value={forewordBy}
                  onChange={(e) => setForewordBy(e.target.value)}
                  placeholder="e.g. Lalita Kapilavai &amp; Dr. R. Swaminathan (Art Historian)"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Curatorial Monograph Body</label>
                <div className="rounded-md border border-input bg-card/60 p-1 shadow-sm">
                  <TiptapEditor
                    content={curatorialEssay}
                    onChange={(_, html) => setCuratorialEssay(html)}
                    placeholder="Compose the scholastic curatorial statement, historical lineage of the paintings, and thematic spiritual symbolism..."
                    className="min-h-[280px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Artwork Plates */}
        <TabsContent value="plates" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-foreground">
                Exhibition Artwork Plates ({plates.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Sequence the masterworks in order of exhibition display. Add custom curatorial notes for each plate.
              </p>
            </div>
            <Button
              onClick={() => setArtworkPickerOpen(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Artworks to Catalog
            </Button>
          </div>

          {plates.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <Palette className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No Artwork Plates Added</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Select paintings from your collection to include as high-fidelity plates in this e-catalog.
              </p>
              <Button onClick={() => setArtworkPickerOpen(true)} size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" /> Select Artworks
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {plates.map((plate, index) => (
                <Card
                  key={plate.artworkId}
                  className="border border-border/80 bg-card p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Artwork Preview & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {index + 1}
                      </div>

                      <div className="w-14 h-14 rounded-md overflow-hidden border border-border bg-background shrink-0 shadow-sm">
                        <img
                          src={plate.artwork.primaryImageUrl}
                          alt={plate.artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-serif font-bold text-foreground truncate">
                            {plate.artwork.title}
                          </h4>
                          {plate.highlightPlate && (
                            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                              Highlight
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {plate.artwork.medium || "Traditional Classical Fine Art"}
                          {plate.artwork.yearCreated ? ` • ${plate.artwork.yearCreated}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Controls & Ordering */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <Button
                        variant={plate.highlightPlate ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleHighlightPlate(index)}
                        className={`h-7 px-2 text-[11px] gap-1 cursor-pointer ${
                          plate.highlightPlate
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Toggle Exhibition Highlight Plate"
                      >
                        <Star className={`w-3 h-3 ${plate.highlightPlate ? "fill-current" : ""}`} />
                        {plate.highlightPlate ? "Highlight" : "Feature"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => movePlate(index, "up")}
                        disabled={index === 0}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => movePlate(index, "down")}
                        disabled={index === plates.length - 1}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePlate(index)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Remove Plate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Curatorial Plate Note */}
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <Input
                      value={plate.curatorialNote || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlates((prev) => {
                          const copy = [...prev];
                          copy[index].curatorialNote = val;
                          return copy;
                        });
                      }}
                      placeholder="Add plate commentary, iconographic symbolism, or provenance note for this artwork..."
                      className="text-xs bg-muted/20"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Publication & PDF */}
        <TabsContent value="pdf" className="space-y-5">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif font-bold">
                Publication Status &amp; PDF Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Publish this volume to the public directory and attach pre-rendered printable PDF brochures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/80 bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Public Availability</span>
                  <p className="text-[11px] text-muted-foreground">
                    When published, visitors can access the full interactive e-catalog at <span className="font-mono text-primary">/catalogs/{slug}</span>.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isPublished ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPublished(!isPublished)}
                  className="cursor-pointer text-xs"
                >
                  {isPublished ? "Published (Live)" : "Draft (Private)"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 text-primary" /> Downloadable PDF Catalog Document
                </label>
                <MediaUploader
                  value={downloadablePdfUrl}
                  onUploadComplete={(url) => setDownloadablePdfUrl(url)}
                  onRemove={() => setDownloadablePdfUrl("")}
                  mediaType="document"
                  description="Upload a print-ready PDF monograph (supports high-res vector catalogs up to 50MB)."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Artwork Picker Dialog */}
      <Dialog open={artworkPickerOpen} onOpenChange={setArtworkPickerOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Select Masterworks for Catalog</DialogTitle>
            <DialogDescription className="text-xs">
              Click any artwork card to toggle its inclusion in this digital exhibition catalog. Selected masterworks will appear in the plate sequence.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search artworks by title, school, or medium..."
                value={artworkSearch}
                onChange={(e) => setArtworkSearch(e.target.value)}
                className="text-xs pl-8"
              />
            </div>
            <Badge variant="outline" className="text-xs shrink-0 font-mono py-1 px-2.5">
              {plates.length} of {availableArtworks.length} Selected
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
            {availableArtworks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                No artworks found in your collection archive. Add masterworks in the Artwork Catalog first.
              </div>
            ) : availableArtworks.filter((a) =>
                a.title.toLowerCase().includes(artworkSearch.toLowerCase()) ||
                (a.medium && a.medium.toLowerCase().includes(artworkSearch.toLowerCase())) ||
                (a.category?.name && a.category.name.toLowerCase().includes(artworkSearch.toLowerCase()))
              ).length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                No artworks matched your search query &ldquo;{artworkSearch}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableArtworks
                  .filter((a) =>
                    a.title.toLowerCase().includes(artworkSearch.toLowerCase()) ||
                    (a.medium && a.medium.toLowerCase().includes(artworkSearch.toLowerCase())) ||
                    (a.category?.name && a.category.name.toLowerCase().includes(artworkSearch.toLowerCase()))
                  )
                  .map((art) => {
                    const isSelected = plates.some((p) => p.artworkId === art.id);
                    const plateIndex = plates.findIndex((p) => p.artworkId === art.id);

                    return (
                      <div
                        key={art.id}
                        onClick={() => toggleArtworkPlate(art)}
                        className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "border-primary/80 bg-primary/10 shadow-sm ring-2 ring-primary/30"
                            : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        {/* Artwork Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-background shrink-0 shadow-sm relative">
                          <img
                            src={art.primaryImageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold shadow-md">
                              {plateIndex + 1}
                            </div>
                          )}
                        </div>

                        {/* Artwork Metadata */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-serif font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {art.title}
                            </h4>
                            {isSelected ? (
                              <Badge className="text-[10px] bg-primary text-primary-foreground shrink-0 px-1.5 py-0">
                                <Check className="w-2.5 h-2.5 mr-0.5" /> Included
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0 px-1.5 py-0">
                                + Add
                              </Badge>
                            )}
                          </div>

                          <p className="text-[11px] text-primary/90 font-mono truncate">
                            {art.category?.name || "Traditional School"}
                          </p>

                          <p className="text-[10px] text-muted-foreground truncate">
                            {art.medium}
                            {art.dimensions ? ` • ${art.dimensions}` : ""}
                            {art.yearCreated ? ` • ${art.yearCreated}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {plates.length} plate{plates.length === 1 ? "" : "s"} ready for sequencing
            </span>
            <Button size="sm" onClick={() => setArtworkPickerOpen(false)} className="cursor-pointer">
              Done Selecting ({plates.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
