"use client";

import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Sliders, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DividerNodeAttributes {
  style: "solid" | "dashed" | "dotted" | "double" | "groove";
  thickness: number;
  color: string;
  width: string;
  alignment: "left" | "center" | "right";
}

const DIVIDER_COLORS = [
  { label: "Theme Gold", value: "#D4AF37" },
  { label: "Deep Charcoal", value: "#1C1814" },
  { label: "Neutral Slate", value: "#64748B" },
  { label: "Terracotta", value: "#C25E34" },
  { label: "Subtle Gray", value: "#CBD5E1" },
];

const STYLES: DividerNodeAttributes["style"][] = ["solid", "dashed", "dotted", "double", "groove"];
const WIDTHS = ["25%", "50%", "75%", "100%"];
const THICKNESSES = [1, 2, 3, 4, 5, 6];

function DividerViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props;
  const attrs: DividerNodeAttributes = {
    style: node.attrs.style || "solid",
    thickness: Number(node.attrs.thickness) || 1,
    color: node.attrs.color || "#D4AF37",
    width: node.attrs.width || "100%",
    alignment: node.attrs.alignment || "center",
  };

  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const alignClass =
    attrs.alignment === "left"
      ? "mr-auto ml-0"
      : attrs.alignment === "right"
      ? "ml-auto mr-0"
      : "mx-auto";

  return (
    <NodeViewWrapper className="my-6 relative group select-none py-1">
      <div className="relative flex items-center justify-center">
        <hr
          data-tiptap-divider="true"
          className={`${alignClass} transition-all cursor-pointer`}
          style={{
            border: "none",
            borderTopWidth: `${attrs.thickness}px`,
            borderTopStyle: attrs.style,
            borderTopColor: attrs.color,
            width: attrs.width,
            margin: 0,
          }}
          onClick={() => setPopoverOpen(true)}
          title="Click to customize divider"
        />

        {/* Floating Quick Settings Trigger on Hover or Click */}
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/90 backdrop-blur-xs border border-border px-1.5 py-0.5 rounded-full shadow-xs">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1 text-slate-700 dark:text-slate-300 hover:text-primary rounded cursor-pointer"
                title="Divider Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3 bg-card border-border shadow-xl text-foreground text-xs" align="end">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold">
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
                  <Palette className="w-3.5 h-3.5" /> Architectural Divider
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deleteNode}
                  className="h-6 px-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                  title="Delete Divider"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>

              {/* Style Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Style</label>
                <div className="grid grid-cols-5 gap-1">
                  {STYLES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateAttributes({ style: st })}
                      className={`px-1.5 py-1 text-[10px] rounded border capitalize transition-all cursor-pointer ${
                        attrs.style === st
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-slate-900 dark:border-slate-100"
                          : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thickness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Thickness</label>
                  <span className="text-[10px] font-mono font-bold text-foreground">{attrs.thickness}px</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {THICKNESSES.map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => updateAttributes({ thickness: th })}
                      className={`px-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${
                        attrs.thickness === th
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-slate-900 dark:border-slate-100"
                          : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {th}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets & Custom Hex */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Color Tone</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DIVIDER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateAttributes({ color: c.value })}
                      className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={attrs.color.startsWith("#") ? attrs.color : "#D4AF37"}
                    onChange={(e) => updateAttributes({ color: e.target.value })}
                    className="w-5 h-5 rounded border border-border p-0 cursor-pointer bg-transparent"
                    title="Custom color picker"
                  />
                  <input
                    type="text"
                    value={attrs.color}
                    onChange={(e) => updateAttributes({ color: e.target.value })}
                    className="w-20 text-[10px] font-mono p-1 border border-border rounded bg-background"
                    placeholder="#D4AF37"
                  />
                </div>
              </div>

              {/* Width & Alignment */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Width</label>
                  <select
                    value={attrs.width}
                    onChange={(e) => updateAttributes({ width: e.target.value })}
                    className="w-full text-xs p-1 border border-border rounded bg-background text-foreground cursor-pointer"
                  >
                    {WIDTHS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Align</label>
                  <select
                    value={attrs.alignment}
                    onChange={(e) =>
                      updateAttributes({
                        alignment: e.target.value as DividerNodeAttributes["alignment"],
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
            className="p-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 rounded cursor-pointer"
            title="Delete Divider"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CustomDividerNode = Node.create({
  name: "customDivider",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      style: { default: "solid" },
      thickness: { default: 1 },
      color: { default: "#D4AF37" },
      width: { default: "100%" },
      alignment: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "hr[data-tiptap-divider]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            style: el.getAttribute("data-style") || "solid",
            thickness: Number(el.getAttribute("data-thickness")) || 1,
            color: el.getAttribute("data-color") || "#D4AF37",
            width: el.getAttribute("data-width") || "100%",
            alignment: el.getAttribute("data-alignment") || "center",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style || "solid";
    const thickness = HTMLAttributes.thickness || 1;
    const color = HTMLAttributes.color || "#D4AF37";
    const width = HTMLAttributes.width || "100%";
    const alignment = HTMLAttributes.alignment || "center";

    const marginStyle =
      alignment === "left"
        ? "margin: 1.5rem auto 1.5rem 0;"
        : alignment === "right"
        ? "margin: 1.5rem 0 1.5rem auto;"
        : "margin: 1.5rem auto;";

    return [
      "hr",
      mergeAttributes(HTMLAttributes, {
        "data-tiptap-divider": "true",
        "data-style": style,
        "data-thickness": thickness,
        "data-color": color,
        "data-width": width,
        "data-alignment": alignment,
        style: `border: none; border-top: ${thickness}px ${style} ${color}; width: ${width}; ${marginStyle}`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DividerViewComponent);
  },
});
