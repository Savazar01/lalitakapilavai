"use client";

import * as React from "react";
import {
  Paintbrush,
  Type,
  LayoutGrid,
  Maximize,
  Sliders,
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  UploadCloud,
  Heart,
  Sun,
  Flame,
  Crown,
  BookOpen,
  Award,
  Compass,
  Shield,
  Volume2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export interface SectionStyle {
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number;
  fontFamily?: string;
  textColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  gridSpan?: number;
  // Rich Column Media Block
  mediaType?: "NONE" | "IMAGE" | "VIDEO" | "ICON" | "AUDIO_PLAYER";
  mediaUrl?: string;
  mediaAlt?: string;
  mediaAspectRatio?: string;
  mediaBorderRadius?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  audioTitle?: string;
  audioUrl?: string;
  videoUrl?: string;
  // Artistic Accents & Fine Art Framing
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "double" | "inset" | "dashed";
  borderRadius?: "none" | "rounded-md" | "rounded-2xl" | "rounded-t-full";
  boxShadow?: "none" | "soft" | "gold-glow";
  ornamentalFrame?: boolean;
}

export interface StyleInspectorProps {
  style: SectionStyle;
  onChange: (updated: SectionStyle) => void;
  isSubSection?: boolean;
}

const colorPresets = [
  { name: "Parchment", hex: "#FAF7F2" },
  { name: "Obsidian", hex: "#0D0E12" },
  { name: "Raw Silk", hex: "#F3EBDD" },
  { name: "Antique Gold", hex: "#D4AF37" },
  { name: "Madder Terracotta", hex: "#A3281E" },
  { name: "Deep Teak", hex: "#1E1B18" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Charcoal", hex: "#1A1A1A" },
];

const artisticBorderPresets = [
  { name: "None", hex: "transparent" },
  { name: "Antique Gold", hex: "#D4AF37" },
  { name: "Temple Terracotta", hex: "#A3281E" },
  { name: "Raw Silk Ivory", hex: "#E8DFD1" },
  { name: "Subtle Charcoal", hex: "#2A2622" },
];

const fontFamilies = [
  { label: "Playfair Display (Classical Serif)", value: "font-serif" },
  { label: "Cormorant Garamond (Fine Heritage)", value: "'Cormorant Garamond', serif" },
  { label: "Cinzel (Architectural Devotional)", value: "'Cinzel', serif" },
  { label: "Inter (Clean Sans)", value: "font-sans" },
  { label: "Plus Jakarta Sans (Modern Editorial)", value: "'Plus Jakarta Sans', sans-serif" },
];

const availableIcons = [
  { label: "Sparkles (Sacred Aura)", value: "Sparkles", Icon: Sparkles },
  { label: "Music (Carnatic Swaras)", value: "Music", Icon: Music },
  { label: "Palette (Traditional Arts)", value: "Palette", Icon: Paintbrush },
  { label: "Sun (Surya Bhagavan)", value: "Sun", Icon: Sun },
  { label: "Flame (Deepam)", value: "Flame", Icon: Flame },
  { label: "Crown (Divine Regalia)", value: "Crown", Icon: Crown },
  { label: "Book Open (Shastras & Vedas)", value: "BookOpen", Icon: BookOpen },
  { label: "Award (Masterwork Provenance)", value: "Award", Icon: Award },
  { label: "Shield (Watermarked Vault)", value: "Shield", Icon: Shield },
  { label: "Heart (Devotion & Bhakti)", value: "Heart", Icon: Heart },
  { label: "Compass (Orientation)", value: "Compass", Icon: Compass },
];

export function StyleInspector({
  style,
  onChange,
  isSubSection = false,
}: StyleInspectorProps) {
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const update = (key: keyof SectionStyle, value: unknown) => {
    onChange({
      ...style,
      [key]: value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      update("mediaUrl", data.watermarkedUrl || data.rawUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Media upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <aside className="w-80 border-l border-border bg-card/60 backdrop-blur-md p-4 overflow-y-auto max-h-screen text-xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2 font-serif font-bold text-sm text-foreground">
          <Sliders className="w-4 h-4 text-primary" />
          <span>{isSubSection ? "Column Inspector" : "Section Inspector"}</span>
        </div>
      </div>

      {/* Grid Span (if Column/SubSection) */}
      {isSubSection && (
        <div className="space-y-2">
          <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            Column Span (1 - 12)
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min={1}
              max={12}
              value={style.gridSpan || 12}
              onChange={(e) => update("gridSpan", parseInt(e.target.value))}
              className="flex-1 cursor-pointer"
            />
            <span className="font-mono font-bold text-foreground text-sm w-8 text-center">
              {style.gridSpan || 12}/12
            </span>
          </div>
        </div>
      )}

      {/* Column Media Block (When in SubSection) */}
      {isSubSection && (
        <div className="space-y-3 p-3 rounded-lg bg-muted/40 border border-border">
          <label className="font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" /> Rich Media Block
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">Per Column</span>
          </label>

          {/* Media Type Selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground font-medium">Block Type</label>
            <Select
              value={style.mediaType || "NONE"}
              onValueChange={(val) => update("mediaType", val)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None (Inline Text Only)</SelectItem>
                <SelectItem value="IMAGE">Image Showcase</SelectItem>
                <SelectItem value="VIDEO">Video Embed / Player</SelectItem>
                <SelectItem value="ICON">Devotional Icon</SelectItem>
                <SelectItem value="AUDIO_PLAYER">Classical Audio Snippet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IMAGE Block Controls */}
          {style.mediaType === "IMAGE" && (
            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                  <span>Image URL</span>
                  <label className="cursor-pointer text-[10px] text-primary hover:underline flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" />
                    {uploadingImage ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </label>
                <Input
                  value={style.mediaUrl || ""}
                  onChange={(e) => update("mediaUrl", e.target.value)}
                  placeholder="https://..."
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Aspect Ratio</label>
                <Select
                  value={style.mediaAspectRatio || "auto"}
                  onValueChange={(val) => update("mediaAspectRatio", val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Original / Auto</SelectItem>
                    <SelectItem value="1:1">1:1 Square (Miniatures & Deities)</SelectItem>
                    <SelectItem value="16:9">16:9 Landscape (Gallery Murals)</SelectItem>
                    <SelectItem value="3:4">3:4 Portrait (Traditional Tanjore)</SelectItem>
                    <SelectItem value="4:3">4:3 Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Border Radius</label>
                <Select
                  value={style.mediaBorderRadius || "rounded-lg"}
                  onValueChange={(val) => update("mediaBorderRadius", val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded-none">Sharp / Framed (0px)</SelectItem>
                    <SelectItem value="rounded-md">Subtle (6px)</SelectItem>
                    <SelectItem value="rounded-lg">Modern (8px)</SelectItem>
                    <SelectItem value="rounded-2xl">High Elegance (16px)</SelectItem>
                    <SelectItem value="rounded-full">Circular (Avatar/Medallion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Alt Text / Accessibility</label>
                <Input
                  value={style.mediaAlt || ""}
                  onChange={(e) => update("mediaAlt", e.target.value)}
                  placeholder="Artwork description for screen readers..."
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* VIDEO Block Controls */}
          {style.mediaType === "VIDEO" && (
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Video className="w-3 h-3 text-primary" /> Video URL (MP4, YouTube, Vimeo)
                </label>
                <Input
                  value={style.videoUrl || ""}
                  onChange={(e) => update("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or .mp4"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* ICON Block Controls */}
          {style.mediaType === "ICON" && (
            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Select Icon</label>
                <Select
                  value={style.iconName || "Sparkles"}
                  onValueChange={(val) => update("iconName", val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((ic) => {
                      const CurrentIcon = ic.Icon;
                      return (
                        <SelectItem key={ic.value} value={ic.value}>
                          <span className="flex items-center gap-2">
                            <CurrentIcon className="w-3.5 h-3.5 text-primary" />
                            {ic.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Icon Size</span>
                  <span className="font-mono text-primary">{style.iconSize || 36}px</span>
                </div>
                <Input
                  type="range"
                  min={20}
                  max={72}
                  step={4}
                  value={style.iconSize || 36}
                  onChange={(e) => update("iconSize", parseInt(e.target.value))}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Icon Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.iconColor || "#D4AF37"}
                    onChange={(e) => update("iconColor", e.target.value)}
                    className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={style.iconColor || "#D4AF37"}
                    onChange={(e) => update("iconColor", e.target.value)}
                    className="text-xs font-mono flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AUDIO PLAYER Block Controls */}
          {style.mediaType === "AUDIO_PLAYER" && (
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Music className="w-3 h-3 text-primary" /> Recital / Audio Title
                </label>
                <Input
                  value={style.audioTitle || ""}
                  onChange={(e) => update("audioTitle", e.target.value)}
                  placeholder="e.g. Endaro Mahanubhavulu (Raga Sri)"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-primary" /> Audio Stream URL (.mp3 / .wav)
                </label>
                <Input
                  value={style.audioUrl || ""}
                  onChange={(e) => update("audioUrl", e.target.value)}
                  placeholder="https://media.lalitakapilavai.com/audio/..."
                  className="text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Background Section */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5 text-primary" />
          Background Styling
        </label>

        {/* Color Presets */}
        <div className="grid grid-cols-4 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => update("backgroundColor", preset.hex)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-full h-7 rounded border transition-all ${
                  style.backgroundColor === preset.hex
                    ? "ring-2 ring-primary ring-offset-1 border-transparent"
                    : "border-border/60 hover:scale-105"
                }`}
                style={{ backgroundColor: preset.hex }}
              />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center group-hover:text-foreground">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Hex */}
        <div className="flex items-center gap-2 pt-1">
          <label className="text-[11px] text-muted-foreground font-medium">Hex Color:</label>
          <div className="flex-1 flex items-center gap-1">
            <input
              type="color"
              value={style.backgroundColor || "#FAF7F2"}
              onChange={(e) => update("backgroundColor", e.target.value)}
              className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
            />
            <Input
              value={style.backgroundColor || ""}
              onChange={(e) => update("backgroundColor", e.target.value)}
              placeholder="#FFFFFF"
              className="font-mono text-xs h-7 uppercase"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Typography Styling */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-primary" />
          Typography
        </label>

        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium">Font Family</label>
          <Select
            value={style.fontFamily || "font-serif"}
            onValueChange={(val) => update("fontFamily", val)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Traditional Indian Framing & Artistic Accents */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Fine Art Borders &amp; Accents
        </label>

        {/* Border Color Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground">Border Tone</label>
          <div className="grid grid-cols-5 gap-1.5">
            {artisticBorderPresets.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => update("borderColor", b.hex)}
                className={`h-7 rounded border text-[9px] font-semibold flex items-center justify-center transition-all ${
                  style.borderColor === b.hex
                    ? "border-primary ring-1 ring-primary scale-105"
                    : "border-border/60 hover:border-primary/50"
                }`}
                style={{
                  backgroundColor: b.hex === "transparent" ? "transparent" : b.hex,
                  color: b.hex === "#FFFFFF" || b.hex === "#E8DFD1" || b.hex === "transparent" ? "#000" : "#FFF",
                }}
                title={b.name}
              >
                {b.name.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>

        {/* Border Width & Style */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Border Width</label>
            <Select
              value={String(style.borderWidth ?? 0)}
              onValueChange={(val) => update("borderWidth", parseInt(val, 10))}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None (0px)</SelectItem>
                <SelectItem value="1">Thin (1px)</SelectItem>
                <SelectItem value="2">Medium (2px)</SelectItem>
                <SelectItem value="3">Bold (3px)</SelectItem>
                <SelectItem value="4">Heavy (4px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Border Style</label>
            <Select
              value={style.borderStyle || "solid"}
              onValueChange={(val) => update("borderStyle", val as SectionStyle["borderStyle"])}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Leaf</SelectItem>
                <SelectItem value="double">Double Border</SelectItem>
                <SelectItem value="inset">Inset Traditional</SelectItem>
                <SelectItem value="dashed">Dashed Fillet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Corner Radius & Glow */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Corner Radius</label>
            <Select
              value={style.borderRadius || "none"}
              onValueChange={(val) => update("borderRadius", val as SectionStyle["borderRadius"])}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Square (none)</SelectItem>
                <SelectItem value="rounded-md">Subtle (md)</SelectItem>
                <SelectItem value="rounded-2xl">Elegant (2xl)</SelectItem>
                <SelectItem value="rounded-t-full">Temple Arch (Top)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Glow / Elevation</label>
            <Select
              value={style.boxShadow || "none"}
              onValueChange={(val) => update("boxShadow", val as SectionStyle["boxShadow"])}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="soft">Soft Shadow</SelectItem>
                <SelectItem value="gold-glow">Temple Gold Glow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ornamental Frame Fillet Toggle */}
        <div className="flex items-center justify-between pt-1 p-2 rounded bg-muted/30 border border-border/60">
          <div>
            <span className="text-xs font-semibold text-foreground block">Gold Corner Fillets</span>
            <span className="text-[10px] text-muted-foreground">Traditional Indian framing corner accent</span>
          </div>
          <input
            type="checkbox"
            checked={!!style.ornamentalFrame}
            onChange={(e) => update("ornamentalFrame", e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
          />
        </div>
      </div>

      <Separator />

      {/* Spacing & Padding */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-primary" />
          Section Spacing (Padding)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Top (px)</label>
            <Input
              type="number"
              min={0}
              max={240}
              step={8}
              value={style.paddingTop ?? 64}
              onChange={(e) => update("paddingTop", parseInt(e.target.value) || 0)}
              className="text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Bottom (px)</label>
            <Input
              type="number"
              min={0}
              max={240}
              step={8}
              value={style.paddingBottom ?? 64}
              onChange={(e) => update("paddingBottom", parseInt(e.target.value) || 0)}
              className="text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
