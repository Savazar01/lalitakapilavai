"use client";

import * as React from "react";
import {
  Sparkles,
  Layout,
  Maximize2,
  MapPin,
  Plus,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Compass,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UniversalMediaDialog } from "@/components/admin/universal-media-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HeroArchetype, HotspotPin } from "@/components/public/blocks/hero-showcase-block";

export interface HeroBlockData {
  archetype?: HeroArchetype;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  curatorialQuote?: string;
  imageUrl?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  badges?: string[];
  hotspots?: HotspotPin[];
}

export interface HeroBlockInspectorProps {
  data: HeroBlockData;
  onChange: (updated: HeroBlockData) => void;
}

export function HeroBlockInspector({ data, onChange }: HeroBlockInspectorProps) {
  const archetype = data.archetype || "split-showcase";
  const title = data.title || "";
  const subtitle = data.subtitle || "";
  const eyebrow = data.eyebrow || "";
  const curatorialQuote = data.curatorialQuote || "";
  const imageUrl = data.imageUrl || "";
  const primaryCtaText = data.primaryCtaText || "";
  const primaryCtaUrl = data.primaryCtaUrl || "";
  const secondaryCtaText = data.secondaryCtaText || "";
  const secondaryCtaUrl = data.secondaryCtaUrl || "";
  const badges = data.badges || [];
  const hotspots = data.hotspots || [];

  const [isMediaOpen, setIsMediaOpen] = React.useState(false);
  const [badgeInput, setBadgeInput] = React.useState("");

  const update = (patch: Partial<HeroBlockData>) => {
    onChange({ ...data, ...patch });
  };

  const handleAddBadge = () => {
    if (!badgeInput.trim()) return;
    update({ badges: [...badges, badgeInput.trim()] });
    setBadgeInput("");
  };

  const handleRemoveBadge = (idx: number) => {
    update({ badges: badges.filter((_, i) => i !== idx) });
  };

  const handleAddHotspot = () => {
    const newPin: HotspotPin = {
      id: `pin-${Date.now()}`,
      x: 50,
      y: 50,
      title: "New Iconographical Element",
      description: "Explain historical gesso relief technique, symbolism, or court patronage...",
    };
    update({ hotspots: [...hotspots, newPin] });
  };

  const handleUpdateHotspot = (idx: number, patch: Partial<HotspotPin>) => {
    const updated = [...hotspots];
    updated[idx] = { ...updated[idx], ...patch };
    update({ hotspots: updated });
  };

  const handleRemoveHotspot = (idx: number) => {
    update({ hotspots: hotspots.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {/* 1. Archetype Selector */}
      <div className="p-4 rounded-xl border border-amber-600/30 bg-amber-500/5 space-y-3">
        <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hero Layout Archetype
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => update({ archetype: "split-showcase" })}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              archetype === "split-showcase"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layout className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Split Showcase</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Curatorial narrative with ornate gold framed plate.
            </p>
          </button>

          <button
            type="button"
            onClick={() => update({ archetype: "monograph-bleed" })}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              archetype === "monograph-bleed"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Maximize2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Monograph Bleed</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              100vh full-bleed cinematic hero with dark scrim.
            </p>
          </button>

          <button
            type="button"
            onClick={() => update({ archetype: "heritage-hotspots" })}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              archetype === "heritage-hotspots"
                ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/40"
                : "border-border bg-card/60 hover:bg-card text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-xs">Heritage Hotspots</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Interactive pulsing gold pins revealing artwork secrets.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Hero Typography & Editorial Narrative */}
      <div className="space-y-3.5 p-4 rounded-xl border border-border/70 bg-card/40">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Eyebrow Tag</Label>
          <Input
            value={eyebrow}
            onChange={(e) => update({ eyebrow: e.target.value })}
            placeholder="e.g. Masterwork Monograph & Living Archive"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Hero Title</Label>
          <Input
            value={title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Sacred Tanjore & Carnatic Archival Opus"
            className="text-xs font-serif"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Curatorial Subtitle / Description</Label>
          <Textarea
            value={subtitle}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="Enter curatorial preface or aesthetic exposition..."
            rows={2}
            className="text-xs font-serif"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Curatorial Quote (Optional)</Label>
          <Textarea
            value={curatorialQuote}
            onChange={(e) => update({ curatorialQuote: e.target.value })}
            placeholder="“Every brushstroke is a silent prayer...”"
            rows={2}
            className="text-xs italic"
          />
        </div>
      </div>

      {/* 3. Hero Visual Asset & Media Vault Integration */}
      <div className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-3">
        <Label className="text-xs font-semibold flex items-center justify-between">
          <span>Primary Artwork / Image Asset</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMediaOpen(true)}
            className="h-7 text-xs border-amber-500/40 text-amber-900 dark:text-amber-200 gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Media Vault
          </Button>
        </Label>

        <div className="flex gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => update({ imageUrl: e.target.value })}
            placeholder="https://... or select from Media Vault"
            className="text-xs font-mono"
          />
        </div>

        {imageUrl && (
          <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-border bg-stone-950 mt-2">
            <img src={imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* 4. Action Call-To-Action (CTAs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border/70 bg-card/40">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Primary CTA</Label>
          <Input
            value={primaryCtaText}
            onChange={(e) => update({ primaryCtaText: e.target.value })}
            placeholder="Button Text (e.g. Explore Collection)"
            className="text-xs"
          />
          <Input
            value={primaryCtaUrl}
            onChange={(e) => update({ primaryCtaUrl: e.target.value })}
            placeholder="Button URL (e.g. /gallery)"
            className="text-xs font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Secondary CTA</Label>
          <Input
            value={secondaryCtaText}
            onChange={(e) => update({ secondaryCtaText: e.target.value })}
            placeholder="Button Text (e.g. Wall Simulator)"
            className="text-xs"
          />
          <Input
            value={secondaryCtaUrl}
            onChange={(e) => update({ secondaryCtaUrl: e.target.value })}
            placeholder="Button URL (e.g. /exhibition-simulator)"
            className="text-xs font-mono"
          />
        </div>
      </div>

      {/* 5. Highlight Badges */}
      <div className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-3">
        <Label className="text-xs font-semibold">Provenance & Technique Badges</Label>
        <div className="flex gap-2">
          <Input
            value={badgeInput}
            onChange={(e) => setBadgeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddBadge();
              }
            }}
            placeholder="Add badge (e.g. 22k Gold Relief, Raga Kalyani)..."
            className="text-xs"
          />
          <Button type="button" size="sm" onClick={handleAddBadge} className="h-8 text-xs shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {badges.map((b, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs py-1 px-2.5 flex items-center gap-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/30"
            >
              {b}
              <button
                type="button"
                onClick={() => handleRemoveBadge(idx)}
                className="hover:text-red-500 ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* 6. Interactive Heritage Hotspots Editor (Visible when archetype is heritage-hotspots) */}
      {archetype === "heritage-hotspots" && (
        <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Interactive Hotspots ({hotspots.length})
            </Label>
            <Button
              type="button"
              size="sm"
              onClick={handleAddHotspot}
              className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pin
            </Button>
          </div>

          <div className="space-y-3">
            {hotspots.map((pin, idx) => (
              <div
                key={pin.id}
                className="p-3 rounded-lg border border-border bg-card/90 space-y-2.5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    Pin Coordinates: ({pin.x}%, {pin.y}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHotspot(idx)}
                    className="text-destructive hover:opacity-80 p-1"
                    title="Delete Pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">X Position (%)</Label>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={pin.x}
                      onChange={(e) => handleUpdateHotspot(idx, { x: Number(e.target.value) })}
                      className="w-full accent-amber-600 h-1.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Y Position (%)</Label>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={pin.y}
                      onChange={(e) => handleUpdateHotspot(idx, { y: Number(e.target.value) })}
                      className="w-full accent-amber-600 h-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Pin Title</Label>
                  <Input
                    value={pin.title}
                    onChange={(e) => handleUpdateHotspot(idx, { title: e.target.value })}
                    placeholder="e.g. Sukka Chunam Gesso Substrate"
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Curatorial Explanation</Label>
                  <Textarea
                    value={pin.description}
                    onChange={(e) => handleUpdateHotspot(idx, { description: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Melodic Raga Linkage (Optional)</Label>
                    <Input
                      value={pin.ragaName || ""}
                      onChange={(e) => handleUpdateHotspot(idx, { ragaName: e.target.value })}
                      placeholder="e.g. Raga Kalyani"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Technique / Gold Detail</Label>
                    <Input
                      value={pin.technique || pin.goldFoilDetail || ""}
                      onChange={(e) => handleUpdateHotspot(idx, { technique: e.target.value })}
                      placeholder="e.g. 22k Gold Foil Relief"
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Universal Media Dialog */}
      <UniversalMediaDialog
        open={isMediaOpen}
        onOpenChange={setIsMediaOpen}
        onSelect={(item) => {
          update({ imageUrl: item.url });
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
