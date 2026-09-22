"use client";

import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlignCenter,
  Maximize,
  AlignLeft,
  AlignRight,
  Maximize2,
  Trash2,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCatalogDimensions } from "@/lib/catalog-geometry";
import { useCatalogEditorContext } from "@/lib/catalog-editor-context";

export type ImageLayoutMode = "centered" | "full-width" | "cover-column" | "float-left" | "float-right";
export type ImageAspectRatio = "auto" | "catalog" | "1/1" | "16/9" | "4/3" | "21/9";

export interface CustomImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  layoutMode?: ImageLayoutMode;
  aspectRatio?: ImageAspectRatio;
  maxHeight?: string;
  focalPosition?: string;
}

const LAYOUT_MODES: { mode: ImageLayoutMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: "centered", label: "Standard (Centered)", icon: AlignCenter },
  { mode: "full-width", label: "Full Width (100%)", icon: Maximize },
  { mode: "cover-column", label: "Cover / Fill Cell", icon: Maximize2 },
  { mode: "float-left", label: "Float Left (Wrap Right)", icon: AlignLeft },
  { mode: "float-right", label: "Float Right (Wrap Left)", icon: AlignRight },
];

const ASPECT_RATIOS: { ratio: ImageAspectRatio; label: string }[] = [
  { ratio: "auto", label: "Auto Aspect" },
  { ratio: "catalog", label: "Catalog Canvas" },
  { ratio: "1/1", label: "1:1 Square" },
  { ratio: "4/3", label: "4:3 Classical" },
  { ratio: "16/9", label: "16:9 Cinema" },
  { ratio: "21/9", label: "21:9 Ultrawide" },
];

function ImageViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props;
  const attrs = node.attrs as CustomImageAttributes;
  const layoutMode = attrs.layoutMode || "centered";
  const aspectRatio = attrs.aspectRatio || "auto";
  const maxHeight = attrs.maxHeight || "500px";
  const focalPosition = attrs.focalPosition || "center";

  const { pageSize, orientation } = useCatalogEditorContext();
  const geometry = getCatalogDimensions(pageSize, orientation);

  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const isCover = layoutMode === "cover-column";
  const isCatalogAspect = aspectRatio === "catalog" || isCover;

  let containerClass = "my-6 relative group transition-all clear-both";
  let imgClass = "rounded-xl border border-border/80 shadow-md transition-all";

  if (layoutMode === "float-left") {
    containerClass = "float-left mr-6 mb-4 max-w-[50%] relative group";
    imgClass += " w-full object-cover";
  } else if (layoutMode === "float-right") {
    containerClass = "float-right ml-6 mb-4 max-w-[50%] relative group";
    imgClass += " w-full object-cover";
  } else if (isCover) {
    containerClass = "my-4 w-full relative group clear-both overflow-hidden rounded-2xl";
    imgClass += " w-full h-full object-cover";
  } else if (layoutMode === "full-width") {
    containerClass = "my-6 w-full text-center relative group clear-both";
    imgClass += " w-full object-contain mx-auto";
  } else {
    // centered
    containerClass = "my-6 text-center mx-auto relative group clear-both max-w-2xl";
    imgClass += " mx-auto object-contain";
  }

  // Aspect Ratio class
  if (aspectRatio === "1/1") imgClass += " aspect-square";
  else if (aspectRatio === "4/3") imgClass += " aspect-[4/3]";
  else if (aspectRatio === "16/9") imgClass += " aspect-video";
  else if (aspectRatio === "21/9") imgClass += " aspect-[21/9]";

  const imageStyle: React.CSSProperties = {
    objectPosition: focalPosition,
  };

  if (isCatalogAspect) {
    imageStyle.aspectRatio = `${geometry.ratio}`;
    imageStyle.width = "100%";
    imageStyle.objectFit = "cover";
  } else {
    imageStyle.maxHeight = maxHeight;
  }

  return (
    <NodeViewWrapper className={containerClass}>
      {/* Floating Toolbar on Hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-background/95 backdrop-blur-xs border border-border px-2 py-0.5 rounded-full shadow-lg">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-primary rounded cursor-pointer"
              title="Image Layout & Framing Controls"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-84 p-3 space-y-3 bg-card border-border shadow-2xl text-foreground text-xs" align="end">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-semibold">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
                <ImageIcon className="w-3.5 h-3.5" /> Image Layout &amp; Coverage
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deleteNode}
                className="h-6 px-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                title="Remove Image"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>

            {/* Layout Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Placement &amp; Flow Mode</label>
              <div className="grid grid-cols-1 gap-1">
                {LAYOUT_MODES.map((lm) => {
                  const Icon = lm.icon;
                  return (
                    <button
                      key={lm.mode}
                      type="button"
                      onClick={() => updateAttributes({ layoutMode: lm.mode })}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded border text-left text-[11px] transition-all cursor-pointer ${
                        layoutMode === lm.mode
                          ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                          : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{lm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Aspect Ratio Crop</label>
              <div className="grid grid-cols-3 gap-1">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.ratio}
                    type="button"
                    onClick={() => updateAttributes({ aspectRatio: ar.ratio })}
                    className={`px-1.5 py-1 text-[10px] rounded border text-center transition-all cursor-pointer ${
                      aspectRatio === ar.ratio
                        ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                        : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>

              {/* Match Catalog Canvas Quick Action */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => updateAttributes({ aspectRatio: "catalog" })}
                  className={`w-full py-1 px-2 text-[10px] rounded border font-mono flex items-center justify-between transition-all cursor-pointer ${
                    aspectRatio === "catalog"
                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                      : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span>📐 Match Catalog Canvas ({geometry.size})</span>
                  <span className="font-bold">
                    {geometry.isSquare
                      ? "1:1 Square"
                      : geometry.isLandscape
                      ? `Landscape (${geometry.ratio.toFixed(2)}:1)`
                      : `Portrait (${geometry.ratio.toFixed(2)}:1)`}
                  </span>
                </button>
              </div>
            </div>

            {/* Focal Position Selector */}
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Focal Point Alignment</label>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { pos: "center", label: "Center" },
                  { pos: "top", label: "Top" },
                  { pos: "bottom", label: "Bottom" },
                  { pos: "left", label: "Left" },
                  { pos: "right", label: "Right" },
                ].map((fp) => (
                  <button
                    key={fp.pos}
                    type="button"
                    onClick={() => updateAttributes({ focalPosition: fp.pos })}
                    className={`px-1 py-1 text-[9px] rounded border text-center transition-all cursor-pointer ${
                      focalPosition === fp.pos
                        ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                        : "border-border bg-muted/30 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div className="space-y-1 border-t border-border/60 pt-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Caption / Subtitle</label>
              <input
                type="text"
                value={attrs.title || ""}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="Add curatorial caption or artwork provenance..."
                className="w-full text-xs p-1.5 border border-border rounded bg-background"
              />
            </div>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
          title="Remove Image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image Element */}
      <figure className="m-0 p-0 w-full h-full">
        <img
          src={attrs.src}
          alt={attrs.alt || "Heritage artwork illustration"}
          className={imgClass}
          style={imageStyle}
          loading="lazy"
        />
        {attrs.title && (
          <figcaption className="mt-1.5 text-xs font-serif italic text-muted-foreground text-center">
            {attrs.title}
          </figcaption>
        )}
      </figure>
    </NodeViewWrapper>
  );
}

export const CustomImageNode = Node.create({
  name: "image",
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      layoutMode: { default: "centered" },
      aspectRatio: { default: "auto" },
      maxHeight: { default: "500px" },
      focalPosition: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-tiptap-image]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const img = el.querySelector("img");
          return {
            src: img?.getAttribute("src") || null,
            alt: img?.getAttribute("alt") || null,
            title: el.getAttribute("data-caption") || img?.getAttribute("title") || null,
            layoutMode: el.getAttribute("data-layout-mode") || "centered",
            aspectRatio: el.getAttribute("data-aspect-ratio") || "auto",
            maxHeight: el.getAttribute("data-max-height") || "500px",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const img = element as HTMLElement;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            layoutMode: img.getAttribute("data-layout-mode") || "centered",
            aspectRatio: img.getAttribute("data-aspect-ratio") || "auto",
            maxHeight: img.getAttribute("data-max-height") || "500px",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const layoutMode = HTMLAttributes.layoutMode || "centered";
    const aspectRatio = HTMLAttributes.aspectRatio || "auto";
    const maxHeight = HTMLAttributes.maxHeight || "500px";

    let figureClass = "my-6 text-center clear-both";
    let imgClass = "rounded-xl border border-border shadow-md";

    if (layoutMode === "float-left") {
      figureClass = "float-left mr-6 mb-4 max-w-[50%]";
      imgClass += " w-full object-cover";
    } else if (layoutMode === "float-right") {
      figureClass = "float-right ml-6 mb-4 max-w-[50%]";
      imgClass += " w-full object-cover";
    } else if (layoutMode === "cover-column") {
      figureClass = "my-6 w-full clear-both";
      imgClass += " w-full h-full min-h-[320px] object-cover";
    } else if (layoutMode === "full-width") {
      figureClass = "my-6 w-full text-center clear-both";
      imgClass += " w-full object-contain mx-auto";
    } else {
      figureClass = "my-6 text-center mx-auto clear-both";
      imgClass += " max-h-[500px] object-contain mx-auto";
    }

    if (aspectRatio === "1/1") imgClass += " aspect-square";
    else if (aspectRatio === "4/3") imgClass += " aspect-[4/3]";
    else if (aspectRatio === "16/9") imgClass += " aspect-video";
    else if (aspectRatio === "21/9") imgClass += " aspect-[21/9]";

    return [
      "figure",
      mergeAttributes(HTMLAttributes, {
        "data-tiptap-image": "true",
        "data-layout-mode": layoutMode,
        "data-aspect-ratio": aspectRatio,
        "data-max-height": maxHeight,
        "data-caption": HTMLAttributes.title || "",
        class: figureClass,
      }),
      [
        "img",
        {
          src: HTMLAttributes.src,
          alt: HTMLAttributes.alt || "Heritage artwork illustration",
          class: imgClass,
          loading: "lazy",
        },
      ],
      HTMLAttributes.title
        ? [
            "figcaption",
            { class: "text-xs font-serif italic text-muted-foreground mt-1.5 text-center" },
            HTMLAttributes.title,
          ]
        : "",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageViewComponent);
  },
});
