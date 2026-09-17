"use client";

import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Shapes, Trash2, Shield, FolderOpen, Grid3X3, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaVaultDialog } from "@/components/admin/media-vault-dialog";

export type ShapeType =
  | "cartouche"
  | "circle"
  | "oval"
  | "rounded"
  | "square"
  | "diamond"
  | "pill"
  | "templeArch";

export type ShapeSize = "sm" | "md" | "lg" | "full";

export interface ShapeNodeAttributes {
  shapeType: ShapeType;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  shadow: "none" | "sm" | "md" | "lg";
  alignment: "left" | "center" | "right";
  size?: ShapeSize;
  imageUrl?: string;
  imageFit?: "cover" | "contain" | "fill";
  imageOpacity?: number;
  scrimOpacity?: number;
  scrimColor?: string;
  focalPosition?: string;
}

const SHAPES: { type: ShapeType; label: string }[] = [
  { type: "cartouche", label: "Classical Cartouche" },
  { type: "templeArch", label: "Temple Arch" },
  { type: "oval", label: "Classical Oval" },
  { type: "pill", label: "Pill Banner" },
  { type: "rounded", label: "Rounded Rect" },
  { type: "square", label: "Square / Box" },
  { type: "circle", label: "Circle Frame" },
  { type: "diamond", label: "Diamond Motif" },
];

const SIZE_PRESETS: { size: ShapeSize; label: string; desc: string }[] = [
  { size: "sm", label: "S", desc: "Small (280px)" },
  { size: "md", label: "M", desc: "Medium (420px)" },
  { size: "lg", label: "L", desc: "Large (680px)" },
  { size: "full", label: "Full", desc: "Full Width (100%)" },
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
  { label: "Subtle Warm Parchment", value: "rgba(251, 248, 241, 0.9)" },
  { label: "Raw Silk", value: "rgba(244, 241, 234, 0.85)" },
  { label: "Obsidian Teak", value: "rgba(21, 27, 38, 0.95)" },
  { label: "Temple Gold Wash", value: "rgba(212, 175, 55, 0.12)" },
  { label: "Terracotta Tint", value: "rgba(194, 94, 52, 0.1)" },
  { label: "Transparent", value: "transparent" },
];

const PRESET_BORDERS = [
  { label: "Antique Gold", value: "#D4AF37" },
  { label: "Slate Boundary", value: "#CBD5E1" },
  { label: "Dark Teak", value: "#1E293B" },
  { label: "Terracotta", value: "#C25E34" },
];

function ShapeViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props;
  const attrs: ShapeNodeAttributes = {
    shapeType: (node.attrs.shapeType as ShapeType) || "cartouche",
    fillColor: node.attrs.fillColor || "rgba(251, 248, 241, 0.7)",
    borderColor: node.attrs.borderColor || "#D4AF37",
    borderWidth: Number(node.attrs.borderWidth) || 2,
    shadow: node.attrs.shadow || "sm",
    alignment: node.attrs.alignment || "center",
    size: (node.attrs.size as ShapeSize) || "md",
    imageUrl: node.attrs.imageUrl || "",
    imageFit: node.attrs.imageFit || "cover",
    imageOpacity: typeof node.attrs.imageOpacity === "number" ? node.attrs.imageOpacity : 1,
    scrimOpacity: typeof node.attrs.scrimOpacity === "number" ? node.attrs.scrimOpacity : 0.35,
    scrimColor: node.attrs.scrimColor || "#000000",
    focalPosition: node.attrs.focalPosition || "center center",
  };

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [vaultOpen, setVaultOpen] = React.useState(false);

  const shapeStyle: React.CSSProperties = {
    backgroundColor: attrs.fillColor,
    borderColor: attrs.borderColor,
    borderWidth: `${attrs.borderWidth}px`,
    borderStyle: "solid",
  };

  let containerClass = "p-5 my-6 relative group transition-all overflow-hidden";

  if (attrs.shapeType === "circle") {
    containerClass += " rounded-full aspect-square flex items-center justify-center text-center max-w-[340px] mx-auto";
  } else if (attrs.shapeType === "oval") {
    containerClass += " rounded-[50%/35%] aspect-[16/10] flex items-center justify-center text-center p-8";
    shapeStyle.borderRadius = "50% / 35%";
  } else if (attrs.shapeType === "pill") {
    containerClass += " rounded-full px-8 py-4";
  } else if (attrs.shapeType === "templeArch") {
    containerClass += " rounded-t-[100px] rounded-b-xl pt-10 pb-6 px-6";
  } else if (attrs.shapeType === "diamond") {
    containerClass += " rounded-2xl";
  } else if (attrs.shapeType === "cartouche") {
    containerClass += " rounded-[32px] border-double px-8 py-6";
    shapeStyle.borderStyle = "double";
    shapeStyle.borderWidth = `${Math.max(attrs.borderWidth, 3)}px`;
  } else if (attrs.shapeType === "rounded") {
    containerClass += " rounded-2xl";
  } else {
    containerClass += " rounded-none";
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

  const sizeClass =
    attrs.size === "sm"
      ? "max-w-[280px]"
      : attrs.size === "lg"
      ? "max-w-[680px]"
      : attrs.size === "full"
      ? "w-full max-w-full"
      : "max-w-[440px]";

  return (
    <NodeViewWrapper className={`my-6 relative group ${alignClass} ${sizeClass} w-full`}>
      {/* Floating Toolbar Header */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-background/90 backdrop-blur-xs border border-border px-2 py-0.5 rounded-full shadow-xs">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-primary rounded cursor-pointer"
              title="Shape Geometry & Focal Studio"
            >
              <Shapes className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-88 p-3 space-y-3 bg-card border-border shadow-2xl text-foreground text-xs max-h-[85vh] overflow-y-auto" align="end">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
                <Shield className="w-3.5 h-3.5" /> Shape Geometry &amp; Focal Studio
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

            {/* Shape Types */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Geometry Archetype</label>
              <div className="grid grid-cols-2 gap-1">
                {SHAPES.map((sh) => (
                  <button
                    key={sh.type}
                    type="button"
                    onClick={() => updateAttributes({ shapeType: sh.type })}
                    className={`px-2 py-1 text-[10px] rounded border text-left truncate transition-all cursor-pointer ${
                      attrs.shapeType === sh.type
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-slate-900 dark:border-slate-100"
                        : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing Presets */}
            <div className="space-y-1 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-primary" /> Scale Dimension
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SIZE_PRESETS.map((sp) => (
                  <button
                    key={sp.size}
                    type="button"
                    onClick={() => updateAttributes({ size: sp.size })}
                    className={`py-1 px-2 text-[10px] font-medium rounded border text-center transition-all cursor-pointer ${
                      attrs.size === sp.size
                        ? "bg-primary text-primary-foreground font-bold border-primary"
                        : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                    }`}
                    title={sp.desc}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Image Media Ingestion */}
            <div className="space-y-2 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-primary uppercase font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> Image Media Fill
                </span>
                {attrs.imageUrl && (
                  <button
                    type="button"
                    onClick={() => updateAttributes({ imageUrl: "" })}
                    className="text-rose-500 hover:underline text-[9px] lowercase font-normal"
                  >
                    remove image
                  </button>
                )}
              </label>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={attrs.imageUrl}
                  onChange={(e) => updateAttributes({ imageUrl: e.target.value })}
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
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Image Fit</label>
                      <select
                        value={attrs.imageFit}
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

                  {/* 9-Point Focal Alignment Matrix */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Grid3X3 className="w-3 h-3 text-primary" /> 9-Point Focal Alignment
                      </span>
                      <span className="text-primary font-bold lowercase">{attrs.focalPosition}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1 w-32 mx-auto bg-muted/40 p-1 rounded-md border border-border/70">
                      {FOCAL_POINTS.map((fp) => (
                        <button
                          key={fp.value}
                          type="button"
                          onClick={() => updateAttributes({ focalPosition: fp.value })}
                          className={`h-6 rounded text-[9px] font-mono font-semibold transition-all cursor-pointer flex items-center justify-center ${
                            attrs.focalPosition === fp.value
                              ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary"
                              : "bg-background hover:bg-muted text-muted-foreground border border-border/50"
                          }`}
                          title={`Align image focal center: ${fp.pos}`}
                        >
                          {fp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Fill Tone */}
            <div className="space-y-1 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Background Fill Tone</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_FILLS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => updateAttributes({ fillColor: f.value })}
                    className="w-5 h-5 rounded border border-border transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: f.value }}
                    title={f.label}
                  />
                ))}
                <input
                  type="text"
                  value={attrs.fillColor}
                  onChange={(e) => updateAttributes({ fillColor: e.target.value })}
                  className="w-28 text-[10px] font-mono p-1 border border-border rounded bg-background"
                  placeholder="#FAF8F5 or rgba(...)"
                />
              </div>
            </div>

            {/* Border Tone & Width */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Border Outline</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {PRESET_BORDERS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => updateAttributes({ borderColor: b.value })}
                      className="w-5 h-5 rounded-full border border-border cursor-pointer hover:scale-110"
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
                    {[1, 2, 3, 4, 5].map((bw) => (
                      <option key={bw} value={bw}>
                        {bw}px
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Shadow & Alignment */}
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
                  onChange={(e) =>
                    updateAttributes({
                      alignment: e.target.value as ShapeNodeAttributes["alignment"],
                    })
                  }
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
        onSelect={(url) => updateAttributes({ imageUrl: url })}
        title="Select Shape Background Image"
      />

      {/* The Shape Container with Live Editable Content inside */}
      <div
        className={`${containerClass} ${shadowClass}`}
        style={shapeStyle}
      >
        {/* Background Image Fill Layer when present */}
        {attrs.imageUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          >
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
        <div className="relative z-10 w-full h-full">
          <NodeViewContent className="min-h-[40px] focus:outline-none" />
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
      shapeType: { default: "cartouche" },
      fillColor: { default: "rgba(251, 248, 241, 0.7)" },
      borderColor: { default: "#D4AF37" },
      borderWidth: { default: 2 },
      shadow: { default: "sm" },
      alignment: { default: "center" },
      size: { default: "md" },
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
            shapeType: el.getAttribute("data-shape-type") || "cartouche",
            fillColor: el.getAttribute("data-fill-color") || "rgba(251, 248, 241, 0.7)",
            borderColor: el.getAttribute("data-border-color") || "#D4AF37",
            borderWidth: Number(el.getAttribute("data-border-width")) || 2,
            shadow: el.getAttribute("data-shadow") || "sm",
            alignment: el.getAttribute("data-alignment") || "center",
            size: el.getAttribute("data-size") || "md",
            imageUrl: el.getAttribute("data-image-url") || "",
            imageFit: el.getAttribute("data-image-fit") || "cover",
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
    const shapeType = HTMLAttributes.shapeType || "cartouche";
    const fillColor = HTMLAttributes.fillColor || "rgba(251, 248, 241, 0.7)";
    const borderColor = HTMLAttributes.borderColor || "#D4AF37";
    const borderWidth = HTMLAttributes.borderWidth || 2;
    const shadow = HTMLAttributes.shadow || "sm";
    const alignment = HTMLAttributes.alignment || "center";
    const size = HTMLAttributes.size || "md";
    const imageUrl = HTMLAttributes.imageUrl || "";
    const imageFit = HTMLAttributes.imageFit || "cover";
    const imageOpacity = HTMLAttributes.imageOpacity ?? 1;
    const scrimOpacity = HTMLAttributes.scrimOpacity ?? 0.35;
    const scrimColor = HTMLAttributes.scrimColor || "#000000";
    const focalPosition = HTMLAttributes.focalPosition || "center center";

    let radius = "1rem";
    let borderStyle = "solid";
    if (shapeType === "pill") radius = "9999px";
    if (shapeType === "oval") radius = "50% / 35%";
    if (shapeType === "templeArch") radius = "80px 80px 12px 12px";
    if (shapeType === "cartouche") {
      radius = "32px";
      borderStyle = "double";
    }
    if (shapeType === "circle") radius = "50%";
    if (shapeType === "square") radius = "0px";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-tiptap-shape": "true",
        "data-shape-type": shapeType,
        "data-fill-color": fillColor,
        "data-border-color": borderColor,
        "data-border-width": borderWidth,
        "data-shadow": shadow,
        "data-alignment": alignment,
        "data-size": size,
        "data-image-url": imageUrl,
        "data-image-fit": imageFit,
        "data-image-opacity": imageOpacity,
        "data-scrim-opacity": scrimOpacity,
        "data-scrim-color": scrimColor,
        "data-focal-position": focalPosition,
        class: "my-6 p-6 border transition-all relative overflow-hidden",
        style: `background-color: ${fillColor}; border-color: ${borderColor}; border-width: ${borderWidth}px; border-style: ${borderStyle}; border-radius: ${radius};`,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShapeViewComponent);
  },
});
