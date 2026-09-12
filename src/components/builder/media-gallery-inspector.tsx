"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  UploadCloud,
  Clock,
  Layers,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MediaGalleryItem } from "@/components/public/blocks/media-gallery-block";

export interface MediaGalleryBlockData {
  displayMode?: "carousel" | "scroll" | "collage";
  autoplayTimer?: number;
  aspectRatio?: "landscape" | "portrait" | "square" | "natural";
  frameStyle?: "heritage" | "minimal" | "floating" | "none";
  items?: MediaGalleryItem[];
}

export interface MediaGalleryInspectorProps {
  data: MediaGalleryBlockData;
  onChange: (updated: MediaGalleryBlockData) => void;
}

export function MediaGalleryInspector({ data, onChange }: MediaGalleryInspectorProps) {
  const displayMode = data.displayMode ?? "carousel";
  const autoplayTimer = data.autoplayTimer ?? 5;
  const aspectRatio = data.aspectRatio ?? "landscape";
  const frameStyle = data.frameStyle ?? "heritage";
  const items = data.items ?? [];

  const [activeItemIndex, setActiveItemIndex] = React.useState<number>(0);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cached artworks and categories for item linking
  const [artworksList, setArtworksList] = React.useState<{ id: string; title: string; slug: string }[]>([]);
  const [categoriesList, setCategoriesList] = React.useState<{ id: string; name: string; slug: string }[]>([]);

  React.useEffect(() => {
    // Fetch artworks
    fetch("/api/admin/artworks")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setArtworksList(data.map((a: { id: string; title: string; slug: string }) => ({ id: a.id, title: a.title, slug: a.slug })));
        }
      })
      .catch(() => {});

    // Fetch categories
    fetch("/api/admin/art-categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoriesList(data.map((c: { id: string; name: string; slug: string }) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
      })
      .catch(() => {});
  }, []);

  const handleModeChange = (mode: "carousel" | "scroll" | "collage") => {
    onChange({
      ...data,
      displayMode: mode,
    });
  };

  const handleTimerChange = (val: number) => {
    onChange({
      ...data,
      autoplayTimer: val,
    });
  };

  const handleAspectChange = (ratio: "landscape" | "portrait" | "square" | "natural") => {
    onChange({
      ...data,
      aspectRatio: ratio,
    });
  };

  const handleFrameChange = (style: "heritage" | "minimal" | "floating" | "none") => {
    onChange({
      ...data,
      frameStyle: style,
    });
  };

  const handleAddItem = (newUrl = "") => {
    const newItem: MediaGalleryItem = {
      id: `mg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: newUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200",
      title: "Classical Masterwork Detail",
      caption: "Sacred iconographic panel rendered in authentic 22k gold foil.",
      alt: "Sacred painting plate",
      linkType: "none",
      linkTarget: "",
    };
    const updated = [...items, newItem];
    onChange({
      ...data,
      items: updated,
    });
    setActiveItemIndex(updated.length - 1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange({
      ...data,
      items: updated,
    });
    if (activeItemIndex >= updated.length) {
      setActiveItemIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange({
      ...data,
      items: copy,
    });
    setActiveItemIndex(targetIndex);
  };

  const handleUpdateItem = (index: number, updates: Partial<MediaGalleryItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...updates };
    onChange({
      ...data,
      items: copy,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "general");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.publicUrl || json.watermarkedUrl || json.primaryImageUrl;
        if (uploadedUrl) {
          handleAddItem(uploadedUrl);
          toast.success("Image uploaded to gallery!");
        } else {
          toast.error("Upload succeeded but URL was missing.");
        }
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Network error during image upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeItem = items[activeItemIndex];

  return (
    <div className="space-y-6">
      {/* 1. Gallery Presentation Mode Switcher */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
        <Label className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Gallery Presentation Engine
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("carousel")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "carousel"
                ? "border-[#D4AF37] bg-stone-900 text-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-xs">A. Carousel</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Auto-playing slide reel with pause-on-hover and gold chevron arrows.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("scroll")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "scroll"
                ? "border-[#D4AF37] bg-stone-900 text-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-xs">B. Horizontal Scroll</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Swipeable snap-point reel for exhibition plates or series flows.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("collage")}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              displayMode === "collage"
                ? "border-[#D4AF37] bg-stone-900 text-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Square className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-xs">C. Curated Bento</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Asymmetrical fine-art masonry collage supporting up to 5 photos.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Mode Settings (Timer, Aspect Ratio, Frame) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/70 bg-card/40">
        {displayMode === "carousel" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Autoplay Duration</span>
              <span className="text-primary font-mono text-xs">{autoplayTimer}s</span>
            </Label>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={autoplayTimer}
              onChange={(e) => handleTimerChange(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground">Slides advance automatically (2s - 10s)</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Aspect Ratio</Label>
          <Select value={aspectRatio} onValueChange={(val: "landscape" | "portrait" | "square" | "natural") => handleAspectChange(val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landscape">Landscape (16:10)</SelectItem>
              <SelectItem value="portrait">Portrait (3:4)</SelectItem>
              <SelectItem value="square">Square (1:1)</SelectItem>
              <SelectItem value="natural">Fixed Height (420px)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Frame & Border Style</Label>
          <Select value={frameStyle} onValueChange={(val: "heritage" | "minimal" | "floating" | "none") => handleFrameChange(val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heritage">Heritage 22k Gold Glow</SelectItem>
              <SelectItem value="minimal">Minimalist Border</SelectItem>
              <SelectItem value="floating">Floating Deep Shadow</SelectItem>
              <SelectItem value="none">No Border / Flush</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Media Items Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-serif font-bold text-sm text-foreground">
              Gallery Media Items ({items.length})
            </h4>
            {displayMode === "collage" && items.length > 5 && (
              <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Notice: Bento mode displays first 5 items
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.heic,.heics"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7 gap-1 border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <UploadCloud className="w-3 h-3" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleAddItem()}
              className="text-xs h-7 gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/80 rounded-xl space-y-2">
            <ImageIcon className="w-7 h-7 text-muted-foreground/60 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No photos added yet</p>
            <p className="text-[11px] text-muted-foreground">Click &quot;Upload Photo&quot; or &quot;Add Item&quot; to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Item Selector List */}
            <div className="md:col-span-4 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer text-left ${
                    activeItemIndex === idx
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/70 bg-card hover:bg-muted/40"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title || "thumbnail"}
                    className="w-10 h-10 object-cover rounded shrink-0 border border-border/80"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">
                      {idx + 1}. {item.title || "Untitled Plate"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.linkType && item.linkType !== "none" ? `Linked: ${item.linkType}` : "No link"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, "up")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveItem(idx, "down")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Active Item Detail Editor */}
            {activeItem && (
              <div className="md:col-span-8 p-4 rounded-xl border border-border/80 bg-card space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold text-foreground">
                    Editing Photo #{activeItemIndex + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ID: {activeItem.id.slice(0, 10)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Image URL</Label>
                  <Input
                    type="url"
                    value={activeItem.url}
                    onChange={(e) => handleUpdateItem(activeItemIndex, { url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Title / Heading</Label>
                    <Input
                      type="text"
                      value={activeItem.title || ""}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { title: e.target.value })}
                      placeholder="e.g. Ashta Lakshmi Tanjore Gold Foil"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Alt Text (Accessibility)</Label>
                    <Input
                      type="text"
                      value={activeItem.alt || ""}
                      onChange={(e) => handleUpdateItem(activeItemIndex, { alt: e.target.value })}
                      placeholder="e.g. Tanjore panel showing 22k gold embossing"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Caption / Narrative Commentary</Label>
                  <Textarea
                    rows={2}
                    value={activeItem.caption || ""}
                    onChange={(e) => handleUpdateItem(activeItemIndex, { caption: e.target.value })}
                    placeholder="Brief curatorial commentary or historical details shown on hover/overlay..."
                    className="text-xs"
                  />
                </div>

                {/* Linking Configuration */}
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-primary" /> Destination Link on Click
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Link Type</span>
                      <Select
                        value={activeItem.linkType || "none"}
                        onValueChange={(val: "none" | "artwork" | "category" | "custom") => {
                          let defaultTarget = "";
                          if (val === "artwork" && artworksList.length > 0) defaultTarget = artworksList[0].slug;
                          if (val === "category" && categoriesList.length > 0) defaultTarget = categoriesList[0].slug;
                          handleUpdateItem(activeItemIndex, {
                            linkType: val,
                            linkTarget: defaultTarget,
                          });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (View Only)</SelectItem>
                          <SelectItem value="artwork">Specific Artwork</SelectItem>
                          <SelectItem value="category">Art Category / School</SelectItem>
                          <SelectItem value="custom">Custom URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {activeItem.linkType === "artwork" && (
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Select Masterwork</span>
                        <Select
                          value={activeItem.linkTarget || (artworksList[0]?.slug ?? "")}
                          onValueChange={(val) => handleUpdateItem(activeItemIndex, { linkTarget: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose an artwork" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {artworksList.map((art) => (
                              <SelectItem key={art.id} value={art.slug}>
                                {art.title} (/artwork/{art.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {activeItem.linkType === "category" && (
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Select Art Category</span>
                        <Select
                          value={activeItem.linkTarget || (categoriesList[0]?.slug ?? "")}
                          onValueChange={(val) => handleUpdateItem(activeItemIndex, { linkTarget: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {categoriesList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.slug}>
                                {cat.name} (/gallery/{cat.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {activeItem.linkType === "custom" && (
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Target URL (Internal or External)</span>
                        <Input
                          type="text"
                          value={activeItem.linkTarget || ""}
                          onChange={(e) => handleUpdateItem(activeItemIndex, { linkTarget: e.target.value })}
                          placeholder="e.g. /concerts or https://..."
                          className="h-8 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
