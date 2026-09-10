"use client";

import * as React from "react";
import { Sparkles, Image as ImageIcon, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/admin/media-uploader";
import { BACKGROUND_PATTERNS } from "@/lib/background-patterns";

export interface CatalogBackgroundConfig {
  backgroundType?: "COLOR" | "PATTERN" | "IMAGE";
  backgroundColor?: string;
  backgroundPattern?: string | null;
  patternOpacity?: number;
  backgroundImage?: string | null;
  overlayOpacity?: number;
  frameStyle?: "none" | "gold-fillet" | "double-fillet" | "silk-border";
}

interface CatalogBackgroundControlProps {
  config: CatalogBackgroundConfig;
  onChange: (updated: Partial<CatalogBackgroundConfig>) => void;
  title?: string;
  description?: string;
  showFrameSelector?: boolean;
}

const HERITAGE_COLOR_PRESETS = [
  { name: "Obsidian Night", hex: "#1C1814" },
  { name: "Deep Charcoal", hex: "#121110" },
  { name: "Warm Parchment", hex: "#FBF8F1" },
  { name: "Antique Raw Silk", hex: "#EFECE6" },
  { name: "Sacred Terracotta", hex: "#2A1810" },
  { name: "Temple Teak", hex: "#241E19" },
];

export function CatalogBackgroundControl({
  config,
  onChange,
  title = "Universal Background Suite",
  description = "Select background styling, sacred patterns, and archival gold leaf framing.",
  showFrameSelector = true,
}: CatalogBackgroundControlProps) {
  const currentMode = config.backgroundType || "COLOR";
  const currentColor = config.backgroundColor || "#FAF7F2";
  const currentPattern = config.backgroundPattern || "mandala-filigree";
  const currentPatternOpacity = config.patternOpacity ?? 0.15;
  const currentImage = config.backgroundImage || "";
  const currentOverlayOpacity = config.overlayOpacity ?? 0.2;
  const currentFrameStyle = config.frameStyle || "gold-fillet";

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/15">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <label className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {title}
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-background/80 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onChange({ backgroundType: "COLOR" })}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "COLOR"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Palette className="w-3 h-3" /> Solid Color
          </button>
          <button
            type="button"
            onClick={() => onChange({ backgroundType: "PATTERN" })}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "PATTERN"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3 h-3" /> Sacred Patterns
          </button>
          <button
            type="button"
            onClick={() => onChange({ backgroundType: "IMAGE" })}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "IMAGE"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-3 h-3" /> Background Image
          </button>
        </div>
      </div>

      {/* Mode 1: Solid Color */}
      {currentMode === "COLOR" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="space-y-1 sm:w-60">
              <label className="text-[11px] font-semibold text-foreground">Canvas Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0 bg-transparent"
                />
                <Input
                  value={currentColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="text-xs font-mono h-8"
                  placeholder="#FAF7F2"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Heritage Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {HERITAGE_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onChange({ backgroundColor: preset.hex })}
                    className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentColor.toLowerCase() === preset.hex.toLowerCase()
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/80 hover:border-primary/50 bg-background text-foreground"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border/80 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Sacred Patterns */}
      {currentMode === "PATTERN" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">Base Canvas Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0 bg-transparent"
                />
                <Input
                  value={currentColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="text-xs font-mono h-8"
                  placeholder="#FAF7F2"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground">Pattern Opacity</label>
                <span className="text-xs font-mono text-primary font-bold">
                  {Math.round(currentPatternOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.01"
                value={currentPatternOpacity}
                onChange={(e) => onChange({ patternOpacity: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground block">
              Choose Sacred Heritage Pattern:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {BACKGROUND_PATTERNS.map((p) => {
                const isSelected = currentPattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ backgroundPattern: p.id })}
                    className={`p-2 rounded-lg border text-left flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                        : "border-border/80 hover:border-primary/50 bg-background/80"
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded border border-border/50 bg-stone-900 flex items-center justify-center overflow-hidden mb-1.5 relative"
                      style={{
                        backgroundColor: currentColor,
                        backgroundImage: `url("${p.svgDataUri}")`,
                        backgroundRepeat: "repeat",
                      }}
                    />
                    <span className="text-[11px] font-serif font-bold text-foreground text-center truncate w-full">
                      {p.name}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">
                      {p.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Background Image */}
      {currentMode === "IMAGE" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">Upload Image Asset</label>
              <MediaUploader
                value={currentImage || ""}
                onUploadComplete={(url) => onChange({ backgroundImage: url })}
                onRemove={() => onChange({ backgroundImage: null })}
                mediaType="general"
                description="High-resolution backdrop image for this page."
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground">Scrim / Overlay Darkness</label>
                  <span className="text-xs font-mono text-primary font-bold">
                    {Math.round(currentOverlayOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={currentOverlayOpacity}
                  onChange={(e) => onChange({ overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <p className="text-[10px] text-muted-foreground">
                  Adds a dark veil over the photograph to ensure high text contrast and legibility.
                </p>
              </div>

              {currentImage && (
                <div className="p-2 rounded-lg border border-border bg-background/60 flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded border border-border bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url("${currentImage}")` }}
                  />
                  <div className="truncate text-xs">
                    <span className="font-semibold block text-foreground">Active Backdrop</span>
                    <span className="text-[10px] text-muted-foreground truncate block font-mono">
                      {currentImage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Frame Style Selector */}
      {showFrameSelector && (
        <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-[11px] font-semibold text-foreground block">
              Archival Page Frame Style
            </label>
            <p className="text-[10px] text-muted-foreground">
              Surrounds this page with classical gold leaf fillets or traditional borders.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={currentFrameStyle}
              onValueChange={(val: "none" | "gold-fillet" | "double-fillet" | "silk-border") =>
                onChange({ frameStyle: val })
              }
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Select Frame Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold-fillet">Classical Gold Fillet (22k Temple Border)</SelectItem>
                <SelectItem value="double-fillet">Royal Double Fillet (Museum Archival)</SelectItem>
                <SelectItem value="silk-border">Sacred Silk Border (Terracotta / Parchment)</SelectItem>
                <SelectItem value="none">Minimal Frame (Border-less Modern)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
