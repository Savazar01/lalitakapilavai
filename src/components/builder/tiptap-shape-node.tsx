"use client";

import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Shapes,
  Trash2,
  Shield,
  FolderOpen,
  Grid3X3,
  Maximize2,
  MoveDiagonal2,
  Palette,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaVaultDialog } from "@/components/admin/media-vault-dialog";
import {
  SHAPE_REGISTRY,
  SHAPE_CATEGORIES,
  getShapeDefinition,
  type ShapeCategory,
} from "@/components/builder/shapes/shape-definitions";

export type ShapeSize = "sm" | "md" | "lg" | "full" | "custom";

export interface ShapeNodeAttributes {
  shapeType: string;
  fillType?: "color" | "gradient" | "image";
  fillColor: string;
  gradient?: string;
  borderColor: string;
  borderWidth: number;
  shadow: "none" | "sm" | "md" | "lg";
  alignment: "left" | "center" | "right";
  size?: ShapeSize;
  width?: string;
  height?: string;
  imageUrl?: string;
  imageFit?: "cover" | "contain" | "fill";
  imageOpacity?: number;
  scrimOpacity?: number;
  scrimColor?: string;
  focalPosition?: string;
}

const SIZE_PRESETS: { size: ShapeSize; label: string; desc: string; width: string }[] = [
  { size: "sm", label: "S", desc: "Compact (240px)", width: "240px" },
  { size: "md", label: "M", desc: "Medium (380px)", width: "380px" },
  { size: "lg", label: "L", desc: "Large (520px)", width: "520px" },
  { size: "full", label: "Full", desc: "Full Width (100%)", width: "100%" },
];

const FOCAL_POINTS: { label: string; value: string; pos: string }[] = [
  { label: "TL", value: "top left", pos: "Top-Left" },
  { label: "TC", value: "top center", pos: "Top-Center" },
  { label: "TR", value: "top right", pos: "Top-Right" },
  { label: "ML", value: "center left", pos: "Center-Left" },
  { label: "CC", value: "center center", pos: "Center" },
  { label: "MR", value: "center right", pos: "Center-Right" },
  { label: "BL", value: "bottom left", pos: "Bottom-Left" },
  { label: "BC", value: "bottom center", pos: "Bottom-Center" },
  { label: "BR", value: "bottom right", pos: "Bottom-Right" },
];

const PRESET_FILLS = [
  { label: "Subtle Warm Parchment", value: "rgba(251, 248, 241, 0.95)" },
  { label: "Raw Silk", value: "rgba(244, 241, 234, 0.9)" },
  { label: "Obsidian Teak", value: "rgba(21, 27, 38, 0.95)" },
  { label: "Temple Gold Wash", value: "rgba(212, 175, 55, 0.16)" },
  { label: "Terracotta Tint", value: "rgba(194, 94, 52, 0.12)" },
  { label: "Transparent", value: "transparent" },
];

const PRESET_GRADIENTS = [
  { label: "Temple Gold Radiance", value: "linear-gradient(135deg, rgba(212,175,55,0.28) 0%, rgba(251,248,241,0.9) 100%)" },
  { label: "Raw Silk Shimmer", value: "linear-gradient(180deg, rgba(251,248,241,0.98) 0%, rgba(235,228,216,0.92) 100%)" },
  { label: "Deep Teak & Obsidian", value: "linear-gradient(145deg, rgba(28,24,20,0.98) 0%, rgba(15,14,13,0.95) 100%)" },
  { label: "Sacred Terracotta Glow", value: "linear-gradient(135deg, rgba(194,94,52,0.25) 0%, rgba(251,248,241,0.9) 100%)" },
];

const PRESET_BORDERS = [
  { label: "Antique Gold", value: "#D4AF37" },
  { label: "Slate Boundary", value: "#CBD5E1" },
  { label: "Dark Teak", value: "#1E293B" },
  { label: "Terracotta", value: "#C25E34" },
  { label: "Lapis Royal", value: "#2E5B88" },
];

function ShapeViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props;
  const attrs: ShapeNodeAttributes = {
    shapeType: node.attrs.shapeType || "temple-arch",
    fillType: node.attrs.fillType || "color",
    fillColor: node.attrs.fillColor || "rgba(251, 248, 241, 0.85)",
    gradient: node.attrs.gradient || "",
    borderColor: node.attrs.borderColor || "#D4AF37",
    borderWidth: Number(node.attrs.borderWidth) || 2,
    shadow: node.attrs.shadow || "sm",
    alignment: node.attrs.alignment || "center",
    size: (node.attrs.size as ShapeSize) || "md",
    width: node.attrs.width || "",
    height: node.attrs.height || "",
    imageUrl: node.attrs.imageUrl || "",
    imageFit: node.attrs.imageFit || "cover",
    imageOpacity: typeof node.attrs.imageOpacity === "number" ? node.attrs.imageOpacity : 1,
    scrimOpacity: typeof node.attrs.scrimOpacity === "number" ? node.attrs.scrimOpacity : 0.35,
    scrimColor: node.attrs.scrimColor || "#000000",
    focalPosition: node.attrs.focalPosition || "center center",
  };

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [vaultOpen, setVaultOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<ShapeCategory>("basic");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);

  // Definition for the selected shape
  const def = getShapeDefinition(attrs.shapeType);

  // Interactive Live Drag Resize
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = containerRef.current?.offsetWidth || 380;
    const startHeight = containerRef.current?.offsetHeight || 280;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWidth = Math.max(160, startWidth + deltaX);
      const newHeight = Math.max(100, startHeight + deltaY);

      updateAttributes({
        size: "custom",
        width: `${Math.round(newWidth)}px`,
        height: `${Math.round(newHeight)}px`,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Build styles
  const shapeStyle: React.CSSProperties = {
    backgroundColor: attrs.fillType === "gradient" ? undefined : attrs.fillColor,
    backgroundImage: attrs.fillType === "gradient" ? attrs.gradient : undefined,
    width: attrs.width || undefined,
    height: attrs.height || undefined,
  };

  if (def.clipPath) {
    shapeStyle.clipPath = def.clipPath;
  } else {
    shapeStyle.borderRadius = def.borderRadius || "0px";
    shapeStyle.borderColor = attrs.borderColor;
    shapeStyle.borderWidth = `${attrs.borderWidth}px`;
    shapeStyle.borderStyle = def.borderStyle || "solid";
  }

  const shadowClass =
    attrs.shadow === "none"
      ? ""
      : attrs.shadow === "sm"
      ? "shadow-sm"
      : attrs.shadow === "md"
      ? "shadow-md"
      : "shadow-xl";

  const alignClass =
    attrs.alignment === "left"
      ? "mr-auto ml-0"
      : attrs.alignment === "right"
      ? "ml-auto mr-0"
      : "mx-auto";

  let sizeClass = "max-w-[380px]";
  if (attrs.size === "sm") sizeClass = "max-w-[240px]";
  if (attrs.size === "lg") sizeClass = "max-w-[520px]";
  if (attrs.size === "full") sizeClass = "w-full max-w-full";
  if (attrs.size === "custom" || attrs.width) sizeClass = "";

  const paddingClass = def.contentPadding || "p-6";

  return (
    <NodeViewWrapper className={`my-6 relative group ${alignClass} ${sizeClass} w-full`}>
      {/* Floating Toolbar Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-background/95 backdrop-blur-xs border border-border px-2 py-0.5 rounded-full shadow-lg">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-primary rounded cursor-pointer"
              title="Shape Geometry, Fill & Sizing Studio"
            >
              <Shapes className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 p-3 space-y-3 bg-card border-border shadow-2xl text-foreground text-xs max-h-[85vh] overflow-y-auto"
            align="end"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
                <Shield className="w-3.5 h-3.5" /> Word-Grade Vector Shape Studio
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deleteNode}
                className="h-6 px-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                title="Delete Shape Container"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>

            {/* Shape Categories & Geometry Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3 text-primary" /> Shape Geometry (20+ Archetypes)
                </label>
                <span className="text-[10px] font-semibold text-primary">{def.label}</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 border-b border-border/60 pb-1 overflow-x-auto">
                {SHAPE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>

              {/* Shape Grid for Active Category */}
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-1 bg-muted/20 rounded-md border border-border/50">
                {SHAPE_REGISTRY.filter((s) => s.category === activeCategory).map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => updateAttributes({ shapeType: sh.id })}
                    className={`p-1.5 text-left rounded border text-[10px] transition-all cursor-pointer flex flex-col justify-between ${
                      attrs.shapeType === sh.id
                        ? "bg-primary/10 border-primary text-primary font-bold ring-1 ring-primary/40"
                        : "border-border/60 bg-background hover:bg-muted/60 text-muted-foreground"
                    }`}
                    title={sh.description}
                  >
                    <span className="truncate">{sh.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing & Dimension Studio */}
            <div className="space-y-2 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-primary" /> Dimensions &amp; Scale
                </span>
                {attrs.width && <span className="text-primary font-mono">{attrs.width} × {attrs.height || "auto"}</span>}
              </label>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-1">
                {SIZE_PRESETS.map((sp) => (
                  <button
                    key={sp.size}
                    type="button"
                    onClick={() =>
                      updateAttributes({
                        size: sp.size,
                        width: sp.size === "full" ? "100%" : sp.width,
                        height: "",
                      })
                    }
                    className={`py-1 px-1.5 text-[10px] font-medium rounded border text-center transition-all cursor-pointer ${
                      attrs.size === sp.size
                        ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                        : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                    }`}
                    title={sp.desc}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>

              {/* Discrete Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Width (px or %)</span>
                  <Input
                    value={attrs.width || ""}
                    onChange={(e) => updateAttributes({ width: e.target.value, size: "custom" })}
                    placeholder="e.g. 380px or 100%"
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Height (px or auto)</span>
                  <Input
                    value={attrs.height || ""}
                    onChange={(e) => updateAttributes({ height: e.target.value, size: "custom" })}
                    placeholder="e.g. 420px or auto"
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fill Mode Studio: Solid, Gradient, Image */}
            <div className="space-y-2 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Palette className="w-3 h-3 text-primary" /> Fill Style &amp; Background
                </span>
                <span className="text-primary uppercase font-bold">{attrs.fillType || "color"}</span>
              </label>

              {/* Fill Type Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-muted/40 p-0.5 rounded border border-border/60">
                {(["color", "gradient", "image"] as const).map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => updateAttributes({ fillType: ft })}
                    className={`py-0.5 text-[10px] font-semibold capitalize rounded transition-all cursor-pointer ${
                      (attrs.fillType || "color") === ft
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>

              {/* Fill Option 1: Solid Color */}
              {(attrs.fillType || "color") === "color" && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_FILLS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => updateAttributes({ fillColor: f.value, fillType: "color" })}
                        className="w-5 h-5 rounded border border-border transition-transform hover:scale-110 cursor-pointer shadow-xs"
                        style={{ backgroundColor: f.value }}
                        title={f.label}
                      />
                    ))}
                    <input
                      type="text"
                      value={attrs.fillColor}
                      onChange={(e) => updateAttributes({ fillColor: e.target.value, fillType: "color" })}
                      className="w-28 text-[10px] font-mono p-1 border border-border rounded bg-background"
                      placeholder="#FAF8F5 or rgba(...)"
                    />
                  </div>
                </div>
              )}

              {/* Fill Option 2: Heritage Gradients */}
              {attrs.fillType === "gradient" && (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-2 gap-1">
                    {PRESET_GRADIENTS.map((g) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => updateAttributes({ gradient: g.value, fillType: "gradient" })}
                        className={`p-1.5 rounded border text-[9px] text-left transition-all cursor-pointer h-10 flex items-end ${
                          attrs.gradient === g.value
                            ? "ring-2 ring-primary border-primary font-bold"
                            : "border-border/80 hover:opacity-90"
                        }`}
                        style={{ background: g.value }}
                      >
                        <span className="bg-background/80 px-1 rounded text-[8px] truncate">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fill Option 3: Media Image Fill */}
              {attrs.fillType === "image" && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={attrs.imageUrl || ""}
                      onChange={(e) => updateAttributes({ imageUrl: e.target.value, fillType: "image" })}
                      className="flex-1 text-xs font-mono p-1.5 border border-border rounded bg-background text-foreground"
                      placeholder="https://... or /media/..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVaultOpen(true)}
                      className="h-8 px-2 text-xs border-dashed border-primary/60 hover:bg-primary/10 shrink-0 cursor-pointer"
                      title="Choose from Media Vault"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-primary" />
                    </Button>
                  </div>

                  {attrs.imageUrl && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Fit Mode</label>
                          <select
                            value={attrs.imageFit || "cover"}
                            onChange={(e) => updateAttributes({ imageFit: e.target.value as "cover" | "contain" | "fill" })}
                            className="w-full text-[11px] p-1 border border-border rounded bg-background"
                          >
                            <option value="cover">Cover (Fill &amp; Clip)</option>
                            <option value="contain">Contain (Fit inside)</option>
                            <option value="fill">Stretch to Fill</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">
                            Contrast Scrim ({Math.round((attrs.scrimOpacity ?? 0.35) * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={attrs.scrimOpacity ?? 0.35}
                            onChange={(e) => updateAttributes({ scrimOpacity: parseFloat(e.target.value) })}
                            className="w-full cursor-pointer h-2 accent-primary"
                          />
                        </div>
                      </div>

                      {/* 9-Point Focal Alignment */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-muted-foreground uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Grid3X3 className="w-3 h-3 text-primary" /> 9-Point Focal Alignment
                          </span>
                          <span className="text-primary font-bold lowercase">{attrs.focalPosition}</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1 w-28 mx-auto bg-muted/40 p-1 rounded-md border border-border/70">
                          {FOCAL_POINTS.map((fp) => (
                            <button
                              key={fp.value}
                              type="button"
                              onClick={() => updateAttributes({ focalPosition: fp.value })}
                              className={`h-5 rounded text-[8px] font-mono font-semibold transition-all cursor-pointer flex items-center justify-center ${
                                attrs.focalPosition === fp.value
                                  ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary"
                                  : "bg-background hover:bg-muted text-muted-foreground border border-border/50"
                              }`}
                              title={fp.pos}
                            >
                              {fp.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Border & Stroke Controls */}
            <div className="space-y-1 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Border Outline &amp; Fillet</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {PRESET_BORDERS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => updateAttributes({ borderColor: b.value })}
                      className="w-5 h-5 rounded-full border border-border cursor-pointer hover:scale-110 shadow-xs"
                      style={{ backgroundColor: b.value }}
                      title={b.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={attrs.borderColor.startsWith("#") ? attrs.borderColor : "#D4AF37"}
                    onChange={(e) => updateAttributes({ borderColor: e.target.value })}
                    className="w-5 h-5 rounded border border-border p-0 cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] text-muted-foreground">Width:</span>
                  <select
                    value={attrs.borderWidth}
                    onChange={(e) => updateAttributes({ borderWidth: Number(e.target.value) })}
                    className="text-xs p-1 border border-border rounded bg-background cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 6].map((bw) => (
                      <option key={bw} value={bw}>
                        {bw}px
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Elevation & Alignment */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Elevation</label>
                <select
                  value={attrs.shadow}
                  onChange={(e) => updateAttributes({ shadow: e.target.value })}
                  className="w-full text-xs p-1 border border-border rounded bg-background text-foreground cursor-pointer"
                >
                  <option value="none">Flat (None)</option>
                  <option value="sm">Subtle (sm)</option>
                  <option value="md">Raised (md)</option>
                  <option value="lg">Archival (lg)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Align</label>
                <select
                  value={attrs.alignment}
                  onChange={(e) => updateAttributes({ alignment: e.target.value as ShapeNodeAttributes["alignment"] })}
                  className="w-full text-xs p-1 border border-border rounded bg-background text-foreground cursor-pointer"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
          title="Delete Shape"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Media Vault Picker Dialog */}
      <MediaVaultDialog
        open={vaultOpen}
        onOpenChange={setVaultOpen}
        onSelect={(url) => updateAttributes({ imageUrl: url, fillType: "image" })}
        title="Select Shape Background Image"
      />

      {/* The Shape Container with Live Editable Content inside */}
      <div
        ref={containerRef}
        className={`my-4 relative transition-all overflow-hidden ${isResizing ? "ring-2 ring-primary select-none " : ""}${shadowClass} ${paddingClass}`}
        style={shapeStyle}
      >
        {/* SVG Border Stroke Overlay for non-rectangular polygon shapes */}
        {def.polygonPoints && attrs.borderWidth > 0 && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            <polygon
              points={def.polygonPoints}
              fill="none"
              stroke={attrs.borderColor}
              strokeWidth={attrs.borderWidth}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Background Image Fill Layer when present */}
        {attrs.fillType === "image" && attrs.imageUrl && (
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={attrs.imageUrl}
              alt=""
              className={`w-full h-full ${
                attrs.imageFit === "contain"
                  ? "object-contain"
                  : attrs.imageFit === "fill"
                  ? "object-fill"
                  : "object-cover"
              }`}
              style={{
                opacity: attrs.imageOpacity ?? 1,
                objectPosition: attrs.focalPosition || "center center",
              }}
            />
            {/* Contrast Scrim */}
            {(attrs.scrimOpacity ?? 0) > 0 && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: attrs.scrimColor || "#000000",
                  opacity: attrs.scrimOpacity ?? 0.35,
                }}
              />
            )}
          </div>
        )}

        {/* Live Editable Text Content on Top */}
        <div className="relative z-20 w-full h-full flex flex-col justify-center">
          <NodeViewContent className="min-h-[40px] focus:outline-none" />
        </div>

        {/* Interactive Drag Resize Handle */}
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-se-resize p-1 text-muted-foreground hover:text-primary bg-background/80 rounded"
          title="Drag to resize width and height"
        >
          <MoveDiagonal2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CustomShapeNode = Node.create({
  name: "customShape",
  group: "block",
  content: "block+",
  defining: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      shapeType: { default: "temple-arch" },
      fillType: { default: "color" },
      fillColor: { default: "rgba(251, 248, 241, 0.85)" },
      gradient: { default: "" },
      borderColor: { default: "#D4AF37" },
      borderWidth: { default: 2 },
      shadow: { default: "sm" },
      alignment: { default: "center" },
      size: { default: "md" },
      width: { default: "" },
      height: { default: "" },
      imageUrl: { default: "" },
      imageFit: { default: "cover" },
      imageOpacity: { default: 1 },
      scrimOpacity: { default: 0.35 },
      scrimColor: { default: "#000000" },
      focalPosition: { default: "center center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-tiptap-shape]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            shapeType: el.getAttribute("data-shape-type") || "temple-arch",
            fillType: (el.getAttribute("data-fill-type") as "color" | "gradient" | "image") || "color",
            fillColor: el.getAttribute("data-fill-color") || "rgba(251, 248, 241, 0.85)",
            gradient: el.getAttribute("data-gradient") || "",
            borderColor: el.getAttribute("data-border-color") || "#D4AF37",
            borderWidth: Number(el.getAttribute("data-border-width")) || 2,
            shadow: (el.getAttribute("data-shadow") as "none" | "sm" | "md" | "lg") || "sm",
            alignment: (el.getAttribute("data-alignment") as "left" | "center" | "right") || "center",
            size: (el.getAttribute("data-size") as ShapeSize) || "md",
            width: el.getAttribute("data-width") || "",
            height: el.getAttribute("data-height") || "",
            imageUrl: el.getAttribute("data-image-url") || "",
            imageFit: (el.getAttribute("data-image-fit") as "cover" | "contain" | "fill") || "cover",
            imageOpacity: Number(el.getAttribute("data-image-opacity")) || 1,
            scrimOpacity: Number(el.getAttribute("data-scrim-opacity")) || 0.35,
            scrimColor: el.getAttribute("data-scrim-color") || "#000000",
            focalPosition: el.getAttribute("data-focal-position") || "center center",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const shapeType = HTMLAttributes.shapeType || "temple-arch";
    const fillType = HTMLAttributes.fillType || "color";
    const fillColor = HTMLAttributes.fillColor || "rgba(251, 248, 241, 0.85)";
    const gradient = HTMLAttributes.gradient || "";
    const borderColor = HTMLAttributes.borderColor || "#D4AF37";
    const borderWidth = HTMLAttributes.borderWidth || 2;
    const shadow = HTMLAttributes.shadow || "sm";
    const alignment = HTMLAttributes.alignment || "center";
    const size = HTMLAttributes.size || "md";
    const width = HTMLAttributes.width || "";
    const height = HTMLAttributes.height || "";
    const imageUrl = HTMLAttributes.imageUrl || "";
    const imageFit = HTMLAttributes.imageFit || "cover";
    const imageOpacity = HTMLAttributes.imageOpacity ?? 1;
    const scrimOpacity = HTMLAttributes.scrimOpacity ?? 0.35;
    const scrimColor = HTMLAttributes.scrimColor || "#000000";
    const focalPosition = HTMLAttributes.focalPosition || "center center";

    const def = getShapeDefinition(shapeType);

    const styleParts: string[] = [];
    if (fillType === "gradient" && gradient) {
      styleParts.push(`background-image: ${gradient}`);
    } else {
      styleParts.push(`background-color: ${fillColor}`);
    }

    if (def.clipPath) {
      styleParts.push(`clip-path: ${def.clipPath}`);
    } else {
      styleParts.push(`border-radius: ${def.borderRadius || "0px"}`);
      styleParts.push(`border-color: ${borderColor}`);
      styleParts.push(`border-width: ${borderWidth}px`);
      styleParts.push(`border-style: ${def.borderStyle || "solid"}`);
    }

    if (width) styleParts.push(`width: ${width}`);
    if (height) styleParts.push(`height: ${height}`);

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-tiptap-shape": "true",
        "data-shape-type": shapeType,
        "data-fill-type": fillType,
        "data-fill-color": fillColor,
        "data-gradient": gradient,
        "data-border-color": borderColor,
        "data-border-width": borderWidth,
        "data-shadow": shadow,
        "data-alignment": alignment,
        "data-size": size,
        "data-width": width,
        "data-height": height,
        "data-image-url": imageUrl,
        "data-image-fit": imageFit,
        "data-image-opacity": imageOpacity,
        "data-scrim-opacity": scrimOpacity,
        "data-scrim-color": scrimColor,
        "data-focal-position": focalPosition,
        class: `my-6 relative overflow-hidden transition-all ${def.contentPadding || "p-6"}`,
        style: styleParts.join("; "),
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShapeViewComponent);
  },
});
