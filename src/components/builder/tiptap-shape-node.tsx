"use client";

import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Shapes, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ShapeType =
  | "cartouche"
  | "circle"
  | "rounded"
  | "square"
  | "diamond"
  | "pill"
  | "templeArch";

export interface ShapeNodeAttributes {
  shapeType: ShapeType;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  shadow: "none" | "sm" | "md" | "lg";
  alignment: "left" | "center" | "right";
}

const SHAPES: { type: ShapeType; label: string }[] = [
  { type: "cartouche", label: "Classical Cartouche" },
  { type: "templeArch", label: "Temple Arch" },
  { type: "pill", label: "Pill Banner" },
  { type: "rounded", label: "Rounded Rect" },
  { type: "square", label: "Square / Box" },
  { type: "circle", label: "Circle Frame" },
  { type: "diamond", label: "Diamond Motif" },
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
  };

  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const shapeStyle: React.CSSProperties = {
    backgroundColor: attrs.fillColor,
    borderColor: attrs.borderColor,
    borderWidth: `${attrs.borderWidth}px`,
    borderStyle: "solid",
  };

  let containerClass = "p-5 my-6 relative group transition-all";

  if (attrs.shapeType === "circle") {
    containerClass += " rounded-full aspect-square flex items-center justify-center text-center max-w-[340px] mx-auto";
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

  return (
    <NodeViewWrapper className={`my-6 relative group ${alignClass} max-w-2xl`}>
      {/* Floating Toolbar Header */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1 bg-background/90 backdrop-blur-xs border border-border px-2 py-0.5 rounded-full shadow-xs">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-primary rounded cursor-pointer"
              title="Shape Geometry & Style"
            >
              <Shapes className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-3 bg-card border-border shadow-2xl text-foreground text-xs" align="end">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
                <Shield className="w-3.5 h-3.5" /> Custom Shape Geometry
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
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Geometry</label>
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

            {/* Fill Tone */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Fill Color</label>
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

      {/* The Shape Container with Live Editable Content inside */}
      <div
        className={`${containerClass} ${shadowClass}`}
        style={shapeStyle}
      >
        <NodeViewContent className="min-h-[40px] focus:outline-none" />
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

  addAttributes() {
    return {
      shapeType: { default: "cartouche" },
      fillColor: { default: "rgba(251, 248, 241, 0.7)" },
      borderColor: { default: "#D4AF37" },
      borderWidth: { default: 2 },
      shadow: { default: "sm" },
      alignment: { default: "center" },
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

    let radius = "1rem";
    let borderStyle = "solid";
    if (shapeType === "pill") radius = "9999px";
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
        class: "my-6 p-6 border transition-all",
        style: `background-color: ${fillColor}; border-color: ${borderColor}; border-width: ${borderWidth}px; border-style: ${borderStyle}; border-radius: ${radius};`,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShapeViewComponent);
  },
});
