"use client";

import React, { useState, useRef, useEffect } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  Sliders,
  GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FloatingLayerAttributes {
  x: number;
  y: number;
  width: string;
  height: string;
  zIndex: number;
  isDraggable: boolean;
  opacity: number;
  blendMode: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: string;
  padding?: string;
}

const BLEND_MODES = [
  { value: "normal", label: "Normal (Standard)" },
  { value: "multiply", label: "Multiply (Ink Blend)" },
  { value: "screen", label: "Screen (Luminous Highlight)" },
  { value: "overlay", label: "Overlay (High Contrast)" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge (Gold Gleam)" },
  { value: "luminosity", label: "Luminosity" },
];

function FloatingLayerViewComponent(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;

  const x = typeof node.attrs.x === "number" ? node.attrs.x : 24;
  const y = typeof node.attrs.y === "number" ? node.attrs.y : 24;
  const width = (node.attrs.width as string) || "340px";
  const height = (node.attrs.height as string) || "auto";
  const zIndex = typeof node.attrs.zIndex === "number" ? node.attrs.zIndex : 10;
  const isDraggable = node.attrs.isDraggable ?? true;
  const opacity = typeof node.attrs.opacity === "number" ? node.attrs.opacity : 1;
  const blendMode = (node.attrs.blendMode as string) || "normal";
  const backgroundColor = (node.attrs.backgroundColor as string) || "rgba(255, 255, 255, 0.9)";
  const borderColor = (node.attrs.borderColor as string) || "#D4AF37";
  const borderWidth = typeof node.attrs.borderWidth === "number" ? node.attrs.borderWidth : 1;
  const borderRadius = (node.attrs.borderRadius as string) || "12px";
  const padding = (node.attrs.padding as string) || "16px";

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(0, Math.round(dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.round(dragStartRef.current.startY + deltaY));

      updateAttributes({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updateAttributes]);

  return (
    <NodeViewWrapper
      className="floating-layer-node-wrapper relative my-3 group"
      style={{
        zIndex,
      }}
    >
      <div
        className={`floating-layer-box relative transition-shadow duration-200 shadow-md ${
          selected || isDragging ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"
        }`}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
          width,
          height: height === "auto" ? undefined : height,
          minHeight: "80px",
          opacity,
          mixBlendMode: (blendMode as React.CSSProperties["mixBlendMode"]) || "normal",
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius,
          padding,
        }}
      >
        {/* Floating Layer Control Header Ribbon */}
        <div
          contentEditable={false}
          className="layer-controls-header flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-border/40 select-none bg-muted/30 -mx-2 -mt-2 px-2.5 py-1.5 rounded-t-xl"
        >
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            title="Drag to reposition layer over canvas"
          >
            <GripHorizontal className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
              Layer #{zIndex} ({x}px, {y}px)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Z-Index controls */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateAttributes({ zIndex: Math.min(100, zIndex + 1) })}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Bring Forward (+1)"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateAttributes({ zIndex: Math.max(1, zIndex - 1) })}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Send Backward (-1)"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>

            {/* Comprehensive Layer Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  title="Layer Properties &amp; Blend Mode"
                >
                  <Sliders className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 space-y-3.5 text-xs" align="end">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Freeform Layer Settings
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Z-Index: {zIndex}
                  </span>
                </div>

                {/* Z-Stack Management */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Layer Stacking Order</label>
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateAttributes({ zIndex: 100 })}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Bring to Front"
                    >
                      <ChevronsUp className="w-3 h-3" /> Front
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateAttributes({ zIndex: Math.min(100, zIndex + 1) })}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Bring Forward"
                    >
                      <ArrowUp className="w-3 h-3" /> Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateAttributes({ zIndex: Math.max(1, zIndex - 1) })}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Send Backward"
                    >
                      <ArrowDown className="w-3 h-3" /> Down
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateAttributes({ zIndex: 1 })}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Send to Back"
                    >
                      <ChevronsDown className="w-3 h-3" /> Back
                    </Button>
                  </div>
                </div>

                {/* Coordinates & Dimensions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">X Offset (px)</label>
                    <Input
                      type="number"
                      value={x}
                      onChange={(e) => updateAttributes({ x: parseInt(e.target.value, 10) || 0 })}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Y Offset (px)</label>
                    <Input
                      type="number"
                      value={y}
                      onChange={(e) => updateAttributes({ y: parseInt(e.target.value, 10) || 0 })}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Width</label>
                    <Input
                      value={width}
                      onChange={(e) => updateAttributes({ width: e.target.value })}
                      placeholder="e.g. 340px, 50%"
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Height</label>
                    <Input
                      value={height}
                      onChange={(e) => updateAttributes({ height: e.target.value })}
                      placeholder="auto or 200px"
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Opacity & Blend Mode */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-muted-foreground">Opacity</span>
                    <span className="font-mono font-bold text-primary">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => updateAttributes({ opacity: parseFloat(e.target.value) })}
                    className="w-full accent-primary h-1.5 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">CSS Blend Mode</label>
                  <Select
                    value={blendMode}
                    onValueChange={(val) => updateAttributes({ blendMode: val })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select Blend Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLEND_MODES.map((bm) => (
                        <SelectItem key={bm.value} value={bm.value}>
                          {bm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Background & Border Styling */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Background Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={backgroundColor.startsWith("#") ? backgroundColor : "#FAF7F2"}
                        onChange={(e) => updateAttributes({ backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => updateAttributes({ backgroundColor: e.target.value })}
                        className="h-7 text-[10px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Border Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={borderColor.startsWith("#") ? borderColor : "#D4AF37"}
                        onChange={(e) => updateAttributes({ borderColor: e.target.value })}
                        className="w-6 h-6 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <Input
                        value={borderColor}
                        onChange={(e) => updateAttributes({ borderColor: e.target.value })}
                        className="h-7 text-[10px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={deleteNode}
              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              title="Delete Floating Layer"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Freeform Content Block Area */}
        <NodeViewContent className="floating-layer-content min-h-[50px] outline-none" />
      </div>
    </NodeViewWrapper>
  );
}

export const FloatingLayerNode = Node.create({
  name: "floatingLayer",
  group: "block",
  content: "block+",
  defining: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      x: { default: 24 },
      y: { default: 24 },
      width: { default: "340px" },
      height: { default: "auto" },
      zIndex: { default: 10 },
      isDraggable: { default: true },
      opacity: { default: 1.0 },
      blendMode: { default: "normal" },
      backgroundColor: { default: "rgba(255, 255, 255, 0.9)" },
      borderColor: { default: "#D4AF37" },
      borderWidth: { default: 1 },
      borderRadius: { default: "12px" },
      padding: { default: "16px" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-floating-layer]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            x: Number(el.getAttribute("data-x")) || 24,
            y: Number(el.getAttribute("data-y")) || 24,
            width: el.getAttribute("data-width") || "340px",
            height: el.getAttribute("data-height") || "auto",
            zIndex: Number(el.getAttribute("data-z-index")) || 10,
            isDraggable: el.getAttribute("data-is-draggable") !== "false",
            opacity: Number(el.getAttribute("data-opacity")) || 1.0,
            blendMode: el.getAttribute("data-blend-mode") || "normal",
            backgroundColor: el.getAttribute("data-bg-color") || "rgba(255, 255, 255, 0.9)",
            borderColor: el.getAttribute("data-border-color") || "#D4AF37",
            borderWidth: Number(el.getAttribute("data-border-width")) || 1,
            borderRadius: el.getAttribute("data-border-radius") || "12px",
            padding: el.getAttribute("data-padding") || "16px",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const x = HTMLAttributes.x ?? 24;
    const y = HTMLAttributes.y ?? 24;
    const width = HTMLAttributes.width || "340px";
    const height = HTMLAttributes.height || "auto";
    const zIndex = HTMLAttributes.zIndex ?? 10;
    const opacity = HTMLAttributes.opacity ?? 1.0;
    const blendMode = HTMLAttributes.blendMode || "normal";
    const backgroundColor = HTMLAttributes.backgroundColor || "rgba(255, 255, 255, 0.9)";
    const borderColor = HTMLAttributes.borderColor || "#D4AF37";
    const borderWidth = HTMLAttributes.borderWidth ?? 1;
    const borderRadius = HTMLAttributes.borderRadius || "12px";
    const padding = HTMLAttributes.padding || "16px";

    const styleParts: string[] = [
      `position: relative`,
      `transform: translate3d(${x}px, ${y}px, 0)`,
      `width: ${width}`,
      `z-index: ${zIndex}`,
      `opacity: ${opacity}`,
      `mix-blend-mode: ${blendMode}`,
      `background-color: ${backgroundColor}`,
      `border: ${borderWidth}px solid ${borderColor}`,
      `border-radius: ${borderRadius}`,
      `padding: ${padding}`,
    ];

    if (height && height !== "auto") {
      styleParts.push(`height: ${height}`);
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-floating-layer": "true",
        "data-x": x,
        "data-y": y,
        "data-width": width,
        "data-height": height,
        "data-z-index": zIndex,
        "data-opacity": opacity,
        "data-blend-mode": blendMode,
        "data-bg-color": backgroundColor,
        "data-border-color": borderColor,
        "data-border-width": borderWidth,
        "data-border-radius": borderRadius,
        "data-padding": padding,
        class: "floating-layer-container my-3 relative shadow-md pointer-events-auto",
        style: styleParts.join("; "),
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FloatingLayerViewComponent);
  },
});
