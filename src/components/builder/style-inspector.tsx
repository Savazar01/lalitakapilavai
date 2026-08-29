"use client";

import * as React from "react";
import {
  Paintbrush,
  Type,
  LayoutGrid,
  Maximize,
  Sliders,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const fontFamilies = [
  { label: "Playfair Display (Classical Serif)", value: "font-serif" },
  { label: "Cormorant Garamond (Fine Heritage)", value: "'Cormorant Garamond', serif" },
  { label: "Cinzel (Architectural Devotional)", value: "'Cinzel', serif" },
  { label: "Inter (Clean Sans)", value: "font-sans" },
  { label: "Plus Jakarta Sans (Modern Editorial)", value: "'Plus Jakarta Sans', sans-serif" },
];

export function StyleInspector({
  style,
  onChange,
  isSubSection = false,
}: StyleInspectorProps) {
  const update = (key: keyof SectionStyle, value: unknown) => {
    onChange({
      ...style,
      [key]: value,
    });
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

      {/* Background Section */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5 text-primary" />
          Background Styling
        </label>

        {/* Color Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {colorPresets.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => update("backgroundColor", preset.hex)}
              className="h-7 rounded border border-border flex items-center justify-center text-[10px] transition-transform hover:scale-105"
              style={{ backgroundColor: preset.hex }}
              title={`${preset.name} (${preset.hex})`}
            >
              <span className="sr-only">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Hex Input */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded border border-border shrink-0"
            style={{ backgroundColor: style.backgroundColor || "#FAF7F2" }}
          />
          <Input
            value={style.backgroundColor || ""}
            onChange={(e) => update("backgroundColor", e.target.value)}
            placeholder="#FAF7F2 or rgba(...)"
            className="h-8 font-mono text-xs"
          />
        </div>

        {/* Background Image URL */}
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">Background Image URL:</span>
          <Input
            value={style.backgroundImageUrl || ""}
            onChange={(e) => update("backgroundImageUrl", e.target.value)}
            placeholder="https://... or /media/..."
            className="h-8 text-xs"
          />
        </div>

        {style.backgroundImageUrl && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Dark Overlay Opacity:</span>
              <span className="font-mono">{Math.round((style.backgroundOverlayOpacity || 0.4) * 100)}%</span>
            </div>
            <Input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={style.backgroundOverlayOpacity ?? 0.4}
              onChange={(e) => update("backgroundOverlayOpacity", parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Typography Section */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-primary" />
          Typography
        </label>

        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">Font Family:</span>
          <Select
            value={style.fontFamily || "font-serif"}
            onValueChange={(val) => update("fontFamily", val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select typography" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">Text Color Hex:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded border border-border shrink-0"
              style={{ backgroundColor: style.textColor || "#1A1A1A" }}
            />
            <Input
              value={style.textColor || ""}
              onChange={(e) => update("textColor", e.target.value)}
              placeholder="#1A1A1A"
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Spacing Controls */}
      <div className="space-y-3">
        <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-primary" />
          Section Spacing (Padding)
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Top (px):</span>
            <Input
              type="number"
              min={0}
              max={240}
              value={style.paddingTop ?? 64}
              onChange={(e) => update("paddingTop", parseInt(e.target.value) || 0)}
              className="h-8 font-mono text-xs"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Bottom (px):</span>
            <Input
              type="number"
              min={0}
              max={240}
              value={style.paddingBottom ?? 64}
              onChange={(e) => update("paddingBottom", parseInt(e.target.value) || 0)}
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>

        {/* Quick spacing presets */}
        <div className="flex gap-1">
          {[
            { label: "Compact", pt: 32, pb: 32 },
            { label: "Standard", pt: 64, pb: 64 },
            { label: "Spacious", pt: 112, pb: 112 },
          ].map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                update("paddingTop", preset.pt);
                update("paddingBottom", preset.pb);
              }}
              className="flex-1 text-[10px] h-7 px-1"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
