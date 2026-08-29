"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Check,
  Globe,
  Sliders,
  Video,
  Music,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { ViewportSwitcher, ViewportMode } from "@/components/builder/viewport-switcher";
import { StyleInspector, SectionStyle } from "@/components/builder/style-inspector";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import { ColumnBlock } from "@/components/public/tiptap-renderer";

export function isLightColor(colorStr?: string | null): boolean {
  if (!colorStr) return false;
  const hex = colorStr.trim().replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55;
  }
  const lightPresets = ["#FAF7F2", "#FFFFFF", "#F3EBDD", "#E8DFD1", "#FBF8F1", "white"];
  return lightPresets.some((p) => colorStr.toLowerCase().includes(p.toLowerCase()));
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SubSectionData {
  id?: string;
  title?: string;
  gridSpan: number; // 1 to 12
  content: Record<string, unknown> | string;
  style?: SectionStyle;
}

interface SectionData {
  id: string;
  title: string;
  gridSpan: number;
  backgroundColor?: string;
  customCssClass?: string;
  paddingTop?: number;
  paddingBottom?: number;
  subSections: SubSectionData[];
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  metaDescription?: string;
  isPublished: boolean;
  sections: SectionData[];
}

// Preset Column Configurations
const columnPresets = [
  {
    name: "Full Width (1 Column)",
    description: "12-span single block, ideal for hero banners & recitals",
    columns: [12],
  },
  {
    name: "Two Columns (50 / 50)",
    description: "Equal dual columns for artwork & description side-by-side",
    columns: [6, 6],
  },
  {
    name: "Two Columns (60 / 40)",
    description: "Wide artwork showcase with detailed commentary",
    columns: [7, 5],
  },
  {
    name: "Two Columns (70 / 30)",
    description: "Dominant image canvas with subtle sidebar notes",
    columns: [8, 4],
  },
  {
    name: "Three Columns (33 / 33 / 33)",
    description: "Tri-column grid for trios, triptychs, and raga cards",
    columns: [4, 4, 4],
  },
  {
    name: "Four Columns (25 / 25 / 25 / 25)",
    description: "Quad gallery grid for miniature paintings & metrics",
    columns: [3, 3, 3, 3],
  },
];

// Sortable Section Wrapper
function SortableSection({
  section,
  index,
  isSelected,
  onSelect,
  onDelete,
  onUpdateSubSectionContent,
  onSelectSubSection,
  selectedSubSectionIndex,
}: {
  section: SectionData;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateSubSectionContent: (subIdx: number, content: Record<string, unknown>) => void;
  onSelectSubSection: (subIdx: number) => void;
  selectedSubSectionIndex: number | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: section.backgroundColor || undefined,
    paddingTop: `${section.paddingTop ?? 48}px`,
    paddingBottom: `${section.paddingBottom ?? 48}px`,
  };

  const isSectionLight = isLightColor(section.backgroundColor);

  const addBlockToCol = (colIdx: number, type: ColumnBlock["type"]) => {
    const col = section.subSections[colIdx];
    const colObj = (typeof col.content === "object" ? col.content : {}) as Record<string, unknown>;
    const currentBlocks: ColumnBlock[] = Array.isArray(colObj.blocks) ? [...colObj.blocks] : [];

    if (currentBlocks.length === 0 && col.content && (col.content as Record<string, unknown>).type === "doc") {
      currentBlocks.push({
        id: `blk-${Date.now()}-1`,
        type: "TEXT",
        content: col.content as Record<string, unknown>,
      });
    }

    const newBlock: ColumnBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      ...(type === "TEXT"
        ? {
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "New verse or commentary block..." }],
                },
              ],
            },
          }
        : {}),
      ...(type === "IMAGE"
        ? {
            mediaUrl:
              "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
            mediaAlt: "Classical Masterwork",
            mediaAspectRatio: "auto",
          }
        : {}),
      ...(type === "VIDEO"
        ? { videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        : {}),
      ...(type === "AUDIO"
        ? {
            audioTitle: "Carnatic Recital in Kalyani Raga",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          }
        : {}),
      ...(type === "DIVIDER" ? { dividerStyle: "gold-leaf" } : {}),
      ...(type === "BUTTON"
        ? {
            buttonText: "Explore Masterwork",
            buttonUrl: "/gallery",
            buttonVariant: "gold",
          }
        : {}),
      ...(type === "BLOG_GRID" ? { blogLimit: 4 } : {}),
    };

    currentBlocks.push(newBlock);
    onUpdateSubSectionContent(colIdx, { ...colObj, blocks: currentBlocks });
  };

  const removeBlockFromCol = (colIdx: number, blockId: string) => {
    const col = section.subSections[colIdx];
    const colObj = (typeof col.content === "object" ? col.content : {}) as Record<string, unknown>;
    const currentBlocks: ColumnBlock[] = Array.isArray(colObj.blocks)
      ? colObj.blocks.filter((b) => b.id !== blockId)
      : [];
    onUpdateSubSectionContent(colIdx, { ...colObj, blocks: currentBlocks });
  };

  const moveBlock = (colIdx: number, blockIdx: number, direction: "up" | "down") => {
    const col = section.subSections[colIdx];
    const colObj = (typeof col.content === "object" ? col.content : {}) as Record<string, unknown>;
    if (!Array.isArray(colObj.blocks)) return;
    const targetIdx = direction === "up" ? blockIdx - 1 : blockIdx + 1;
    if (targetIdx < 0 || targetIdx >= colObj.blocks.length) return;
    const newBlocks = [...colObj.blocks];
    const [moved] = newBlocks.splice(blockIdx, 1);
    newBlocks.splice(targetIdx, 0, moved);
    onUpdateSubSectionContent(colIdx, { ...colObj, blocks: newBlocks });
  };

  const updateBlock = (colIdx: number, blockId: string, updates: Partial<ColumnBlock>) => {
    const col = section.subSections[colIdx];
    const colObj = (typeof col.content === "object" ? col.content : {}) as Record<string, unknown>;
    if (!Array.isArray(colObj.blocks)) return;
    const newBlocks = colObj.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    onUpdateSubSectionContent(colIdx, { ...colObj, blocks: newBlocks });
  };

  const [uploadingBlockId, setUploadingBlockId] = React.useState<string | null>(null);

  const handleBlockImageUpload = async (
    colIdx: number,
    blockId: string,
    file: File
  ) => {
    setUploadingBlockId(blockId);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "general");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl;
      updateBlock(colIdx, blockId, { mediaUrl: url });
      toast.success("Image uploaded to column block!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingBlockId(null);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border-2 transition-all my-4 ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-lg"
          : "border-border/60 hover:border-border"
      }`}
    >
      {/* Section Quick Controls Header */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-md px-2 py-1 rounded-md border border-border shadow-sm">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          title="Drag to reorder section"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-semibold text-foreground">
          Section {index + 1}: {section.title}
        </span>
      </div>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSelect}
          className="h-7 text-xs px-2 gap-1 bg-card/90 backdrop-blur-md border border-border"
        >
          <Sliders className="w-3 h-3 text-primary" />
          Style
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-destructive bg-card/90 backdrop-blur-md hover:bg-destructive/10"
          title="Delete Section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* 12-Column Responsive Grid Row */}
      <div className="grid grid-cols-12 gap-4 px-4 sm:px-6">
        {section.subSections.map((col, colIdx) => {
          const colSpanClass =
            col.gridSpan === 12
              ? "col-span-12"
              : col.gridSpan === 8
              ? "col-span-12 md:col-span-8"
              : col.gridSpan === 7
              ? "col-span-12 md:col-span-7"
              : col.gridSpan === 6
              ? "col-span-12 md:col-span-6"
              : col.gridSpan === 5
              ? "col-span-12 md:col-span-5"
              : col.gridSpan === 4
              ? "col-span-12 md:col-span-4"
              : col.gridSpan === 3
              ? "col-span-12 md:col-span-3"
              : "col-span-12";

          const isColSelected = isSelected && selectedSubSectionIndex === colIdx;

          const colObj = (typeof col.content === "object" ? col.content : {}) as Record<string, unknown>;
          const colStyle = (col.style || colObj?._style || {}) as SectionStyle;

          const borderStyleObj: React.CSSProperties = {
            borderColor:
              colStyle.borderColor && colStyle.borderColor !== "transparent"
                ? colStyle.borderColor
                : undefined,
            borderWidth: colStyle.borderWidth ? `${colStyle.borderWidth}px` : undefined,
            borderStyle: (colStyle.borderStyle as React.CSSProperties["borderStyle"]) || undefined,
          };

          let radiusClass = "rounded-lg";
          if (colStyle.borderRadius === "none") radiusClass = "rounded-none";
          if (colStyle.borderRadius === "rounded-md") radiusClass = "rounded-md";
          if (colStyle.borderRadius === "rounded-2xl") radiusClass = "rounded-2xl";
          if (colStyle.borderRadius === "rounded-t-full") radiusClass = "rounded-t-full";

          let glowClass = "";
          if (colStyle.boxShadow === "gold-glow")
            glowClass = "shadow-[0_0_25px_rgba(212,175,55,0.25)]";
          if (colStyle.boxShadow === "soft") glowClass = "shadow-md";

          const bgColClass = isSectionLight
            ? isColSelected
              ? "bg-white/95 border-primary/80"
              : "bg-white/85 border-stone-300/80 hover:border-stone-400 text-stone-900"
            : isColSelected
            ? "bg-primary/5 border-primary/80 text-foreground"
            : "bg-card/40 border-border/40 hover:border-primary/40 text-foreground";

          const blocks = (Array.isArray(colObj.blocks) ? colObj.blocks : null) as ColumnBlock[] | null;

          return (
            <div
              key={colIdx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSubSection(colIdx);
              }}
              style={borderStyleObj}
              className={`${colSpanClass} p-3 transition-all relative ${radiusClass} ${glowClass} ${bgColClass} border`}
            >
              {/* Ornamental Frame Fillets */}
              {colStyle.ornamentalFrame && (
                <>
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
                </>
              )}

              {/* Column label badge */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/30">
                <span
                  className={`text-[10px] uppercase font-mono font-semibold ${
                    isSectionLight ? "text-stone-700" : "text-muted-foreground"
                  }`}
                >
                  Column {colIdx + 1} ({col.gridSpan}/12)
                </span>
                {colStyle.borderColor && colStyle.borderColor !== "transparent" && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Bordered
                  </span>
                )}
              </div>

              {/* Multi-Block Nested Row Rendering */}
              {blocks && blocks.length > 0 ? (
                <div className="space-y-3">
                  {blocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      className={`p-2 rounded border transition-colors ${
                        isSectionLight ? "bg-stone-50/80 border-stone-200" : "bg-muted/20 border-border/50"
                      }`}
                    >
                      {/* Block control bar */}
                      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-border/30 text-[10px] font-mono text-muted-foreground">
                        <span className="font-semibold text-primary">
                          #{bIdx + 1} {block.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(colIdx, bIdx, "up");
                            }}
                            disabled={bIdx === 0}
                            className="p-1 hover:text-foreground disabled:opacity-30"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(colIdx, bIdx, "down");
                            }}
                            disabled={bIdx === blocks.length - 1}
                            className="p-1 hover:text-foreground disabled:opacity-30"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlockFromCol(colIdx, block.id);
                            }}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                            title="Remove Block"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Block Contents */}
                      {block.type === "TEXT" && (
                        <TiptapEditor
                          isLight={isSectionLight}
                          content={block.content}
                          onChange={(json) => updateBlock(colIdx, block.id, { content: json })}
                        />
                      )}

                      {block.type === "IMAGE" && (
                        <div className="space-y-2">
                          {/* Image preview with aspect-ratio styling */}
                          {block.mediaUrl ? (
                            <div className="relative group rounded-md overflow-hidden border border-border/80 bg-background/50 flex items-center justify-center">
                              <img
                                src={block.mediaUrl}
                                alt={block.mediaAlt || "Block image"}
                                className={`w-full object-cover transition-all ${
                                  block.mediaAspectRatio === "1:1"
                                    ? "aspect-square"
                                    : block.mediaAspectRatio === "16:9"
                                    ? "aspect-video"
                                    : block.mediaAspectRatio === "4:3"
                                    ? "aspect-[4/3]"
                                    : block.mediaAspectRatio === "3:4"
                                    ? "aspect-[3/4]"
                                    : "aspect-auto max-h-48"
                                }`}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleBlockImageUpload(colIdx, block.id, file);
                                    }}
                                    disabled={uploadingBlockId === block.id}
                                  />
                                  <span className="px-2 py-1 bg-background/90 text-foreground text-[11px] font-medium rounded shadow hover:bg-background transition-colors flex items-center gap-1 cursor-pointer">
                                    <Upload className="w-3 h-3 text-primary" /> Replace
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => updateBlock(colIdx, block.id, { mediaUrl: "" })}
                                  className="px-2 py-1 bg-destructive text-destructive-foreground text-[11px] font-medium rounded shadow hover:bg-destructive/90 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 bg-muted/30 rounded border border-dashed border-border/80 flex flex-col items-center justify-center text-xs text-muted-foreground p-3 text-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground/60 mb-1" />
                              <span>No image selected</span>
                            </div>
                          )}

                          {/* Dual-Mode Controls: Local Upload + Aspect Ratio */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleBlockImageUpload(colIdx, block.id, file);
                                  }}
                                  disabled={uploadingBlockId === block.id}
                                />
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer shadow-xs">
                                  {uploadingBlockId === block.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1.5 text-primary" />
                                  ) : (
                                    <Upload className="w-3 h-3 mr-1.5 text-primary" />
                                  )}
                                  {uploadingBlockId === block.id ? "Uploading..." : "Upload Image from Computer"}
                                </span>
                              </label>

                              {/* Aspect Ratio Selector */}
                              <div className="flex items-center gap-1 ml-auto">
                                <span className="text-[10px] text-muted-foreground">Aspect:</span>
                                <select
                                  value={block.mediaAspectRatio || "auto"}
                                  onChange={(e) =>
                                    updateBlock(colIdx, block.id, { mediaAspectRatio: e.target.value })
                                  }
                                  className="text-xs py-1 px-1.5 rounded border border-border bg-background text-foreground cursor-pointer"
                                >
                                  <option value="auto">Original</option>
                                  <option value="16:9">16:9 Wide</option>
                                  <option value="1:1">1:1 Square</option>
                                  <option value="4:3">4:3 Standard</option>
                                  <option value="3:4">3:4 Portrait</option>
                                </select>
                              </div>
                            </div>

                            {/* Direct URL + Alt */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                              <input
                                type="text"
                                placeholder="Or paste image URL (https://...)"
                                value={block.mediaUrl || ""}
                                onChange={(e) =>
                                  updateBlock(colIdx, block.id, { mediaUrl: e.target.value })
                                }
                                className="text-xs p-1.5 rounded border border-border bg-background text-foreground font-mono"
                              />
                              <input
                                type="text"
                                placeholder="Alt text / image caption"
                                value={block.mediaAlt || ""}
                                onChange={(e) =>
                                  updateBlock(colIdx, block.id, { mediaAlt: e.target.value })
                                }
                                className="text-xs p-1.5 rounded border border-border bg-background text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "VIDEO" && (
                        <div className="space-y-1.5">
                          <div className="p-2 rounded bg-primary/5 border border-primary/20 flex items-center gap-2">
                            <Video className="w-4 h-4 text-primary shrink-0" />
                            <input
                              type="text"
                              placeholder="Video URL (YouTube/Vimeo/MP4)"
                              value={block.videoUrl || ""}
                              onChange={(e) =>
                                updateBlock(colIdx, block.id, { videoUrl: e.target.value })
                              }
                              className="w-full text-xs p-1 rounded border border-border bg-background text-foreground font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "AUDIO" && (
                        <div className="space-y-1.5">
                          <div className="p-2 rounded bg-card border border-primary/20 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Music className="w-3.5 h-3.5 text-primary shrink-0" />
                              <input
                                type="text"
                                placeholder="Recital Title (e.g. Kalyani Varnam)"
                                value={block.audioTitle || ""}
                                onChange={(e) =>
                                  updateBlock(colIdx, block.id, { audioTitle: e.target.value })
                                }
                                className="w-full text-xs p-1 rounded border border-border bg-background text-foreground"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Audio MP3 URL"
                              value={block.audioUrl || ""}
                              onChange={(e) =>
                                updateBlock(colIdx, block.id, { audioUrl: e.target.value })
                              }
                              className="w-full text-xs p-1 rounded border border-border bg-background text-foreground font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "DIVIDER" && (
                        <div className="py-2 flex items-center justify-center gap-2">
                          <div className="h-px bg-primary/40 flex-1" />
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <div className="h-px bg-primary/40 flex-1" />
                        </div>
                      )}

                      {block.type === "BUTTON" && (
                        <div className="grid grid-cols-2 gap-2 py-1">
                          <input
                            type="text"
                            placeholder="Button Label"
                            value={block.buttonText || ""}
                            onChange={(e) =>
                              updateBlock(colIdx, block.id, { buttonText: e.target.value })
                            }
                            className="text-xs p-1 rounded border border-border bg-background text-foreground"
                          />
                          <input
                            type="text"
                            placeholder="Link URL (e.g. /gallery)"
                            value={block.buttonUrl || ""}
                            onChange={(e) =>
                              updateBlock(colIdx, block.id, { buttonUrl: e.target.value })
                            }
                            className="text-xs p-1 rounded border border-border bg-background text-foreground"
                          />
                        </div>
                      )}

                      {block.type === "BLOG_GRID" && (
                        <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-primary" /> Latest Blog Posts (4-Col Grid)
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground text-[10px]">Limit:</span>
                              <select
                                value={block.blogLimit || 4}
                                onChange={(e) =>
                                  updateBlock(colIdx, block.id, {
                                    blogLimit: parseInt(e.target.value, 10),
                                  })
                                }
                                className="text-xs p-1 rounded border border-border bg-background text-foreground"
                              >
                                <option value={4}>4 Articles (1 Row)</option>
                                <option value={8}>8 Articles (2 Rows)</option>
                                <option value={12}>12 Articles (3 Rows)</option>
                              </select>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Dynamic 4-column feed of published essays with featured covers, reading times, tags, and links to /blogs/[slug].
                          </p>
                          <div className="grid grid-cols-4 gap-1.5 pt-1 opacity-70">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-12 rounded border border-border/60 bg-muted/40 flex flex-col items-center justify-center p-1 text-center"
                              >
                                <span className="text-[9px] font-mono text-muted-foreground">Post {i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Legacy single doc rendering with media preview */
                <div>
                  {/* Column Rich Media Preview */}
                  {(() => {
                    const media = colObj?._media as Record<string, unknown> | undefined;
                    if (!media || !media.mediaType || media.mediaType === "NONE") return null;

                    if (media.mediaType === "IMAGE" && media.mediaUrl) {
                      return (
                        <div className="mb-2 relative rounded overflow-hidden border border-border/80 bg-muted/30">
                          <img
                            src={media.mediaUrl as string}
                            alt={(media.mediaAlt as string) || "Column image"}
                            className="w-full object-cover max-h-48 rounded"
                          />
                        </div>
                      );
                    }

                    if (media.mediaType === "VIDEO" && media.videoUrl) {
                      return (
                        <div className="mb-2 p-2.5 rounded border border-primary/30 bg-primary/5 flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase text-primary block">Video</span>
                            <p className="text-[11px] text-foreground truncate font-mono">{String(media.videoUrl)}</p>
                          </div>
                        </div>
                      );
                    }

                    if (media.mediaType === "AUDIO_PLAYER" && media.audioUrl) {
                      return (
                        <div className="mb-2 p-2 rounded border border-primary/30 bg-card flex items-center gap-2">
                          <Music className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-primary block">Audio Snippet</span>
                            <p className="text-[11px] text-foreground truncate">{String(media.audioTitle || media.audioUrl)}</p>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* Inline Tiptap Rich-Text Editor */}
                  <TiptapEditor
                    isLight={isSectionLight}
                    content={col.content}
                    onChange={(json) => onUpdateSubSectionContent(colIdx, json)}
                  />
                </div>
              )}

              {/* Add Block to Column Action Bar */}
              <div className="mt-3 pt-2 border-t border-border/40 flex flex-wrap items-center gap-1">
                <span
                  className={`text-[9px] font-mono mr-1 ${
                    isSectionLight ? "text-stone-600 font-semibold" : "text-muted-foreground"
                  }`}
                >
                  + Add Row Block:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "TEXT");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Text
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "IMAGE");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Image
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "VIDEO");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Video
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "AUDIO");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Audio
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "DIVIDER");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Divider
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "BUTTON");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/60 hover:border-primary bg-background/80 hover:bg-accent text-foreground transition-all"
                >
                  + Button
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "BLOG_GRID");
                  }}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all cursor-pointer"
                >
                  + 4-Col Blog Grid
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VisualPageBuilder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [page, setPage] = React.useState<PageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Viewport mode: desktop, tablet, mobile
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");

  // Selection state for style inspector
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);
  const [selectedSubIndex, setSelectedSubIndex] = React.useState<number | null>(null);

  // Add Section Modal
  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    let isMounted = true;
    fetch(`/api/admin/pages/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Page not found");
      })
      .then((data) => {
        if (isMounted) {
          setPage(data);
          if (data.sections && data.sections.length > 0) {
            setSelectedSectionId(data.sections[0].id);
          }
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Error loading page:", e);
        if (isMounted) {
          router.push("/admin/pages");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  // Handle Drag Reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !page) return;

    const oldIndex = page.sections.findIndex((s) => s.id === active.id);
    const newIndex = page.sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(page.sections, oldIndex, newIndex);
    setPage({
      ...page,
      sections: reordered,
    });
  };

  // Add Section with Preset
  const handleAddSection = (columns: number[]) => {
    if (!page) return;

    const newSection: SectionData = {
      id: crypto.randomUUID(),
      title: `Section ${page.sections.length + 1}`,
      gridSpan: 12,
      backgroundColor: "#FAF7F2",
      paddingTop: 48,
      paddingBottom: 48,
      subSections: columns.map((span, idx) => ({
        gridSpan: span,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: `Column ${idx + 1}` }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Enter devotional commentary, Tanjore painting background, or Carnatic raga associations...",
                },
              ],
            },
          ],
        },
      })),
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection],
    });

    setSelectedSectionId(newSection.id);
    setSelectedSubIndex(0);
    setPresetDialogOpen(false);
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    if (!page) return;
    setPage({
      ...page,
      sections: page.sections.filter((s) => s.id !== sectionId),
    });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  // Update Subsection content JSON
  const handleUpdateSubContent = (
    sectionId: string,
    subIdx: number,
    content: Record<string, unknown>
  ) => {
    if (!page) return;
    setPage({
      ...page,
      sections: page.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const newSubs = [...s.subSections];
        const prevMedia = (newSubs[subIdx].content as Record<string, unknown>)?._media;
        newSubs[subIdx] = {
          ...newSubs[subIdx],
          content: {
            ...content,
            ...(prevMedia ? { _media: prevMedia } : {}),
          },
        };
        return { ...s, subSections: newSubs };
      }),
    });
  };

  // Save Page
  const handleSave = async (publishOverride?: boolean) => {
    if (!page) return;
    setSaving(true);

    const isPublished =
      publishOverride !== undefined ? publishOverride : page.isPublished;

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          metaDescription: page.metaDescription,
          isPublished,
          sections: page.sections,
        }),
      });

      if (res.ok) {
        setPage({ ...page, isPublished });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        toast.success("Page layout saved successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save changes");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving page");
    } finally {

      setSaving(false);
    }
  };

  if (loading || !page) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-serif">Loading Visual Page Canvas...</span>
      </div>
    );
  }

  // Find currently selected section
  const currentSection = page.sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="fixed inset-0 top-16 z-30 flex flex-col bg-background select-none">
      {/* Top Builder Control Header */}
      <header className="h-14 px-4 sm:px-6 border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between gap-4 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Pages
            </Button>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
              {page.title}
            </span>
            <span className="text-[10px] font-mono text-primary truncate">
              /{page.slug}
            </span>
          </div>
        </div>

        {/* Viewport Frame Switcher */}
        <ViewportSwitcher mode={viewport} onChange={setViewport} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/${page.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 hidden md:inline-flex"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </Button>
          </Link>

          <Button
            variant={page.isPublished ? "gold" : "outline"}
            size="sm"
            onClick={() => handleSave(!page.isPublished)}
            className="h-8 text-xs gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            {page.isPublished ? "Published" : "Draft"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="h-8 text-xs gap-1.5 font-bold"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {savedSuccess ? "Saved!" : "Save"}
          </Button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Viewport Simulator */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/40 flex justify-center">
          <div
            className={`transition-all duration-300 min-h-full ${
              viewport === "desktop"
                ? "w-full max-w-[1440px]"
                : viewport === "tablet"
                ? "w-[768px] border-x border-border/80 shadow-2xl bg-background"
                : "w-[375px] border-x border-border/80 shadow-2xl bg-background"
            }`}
          >
            {/* Sections DND List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={page.sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {page.sections.map((section, idx) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={idx}
                    isSelected={selectedSectionId === section.id}
                    selectedSubSectionIndex={
                      selectedSectionId === section.id ? selectedSubIndex : null
                    }
                    onSelect={() => {
                      setSelectedSectionId(section.id);
                      setSelectedSubIndex(null);
                    }}
                    onSelectSubSection={(subIdx) => {
                      setSelectedSectionId(section.id);
                      setSelectedSubIndex(subIdx);
                    }}
                    onDelete={() => handleDeleteSection(section.id)}
                    onUpdateSubSectionContent={(subIdx, content) =>
                      handleUpdateSubContent(section.id, subIdx, content)
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add Section Action Button */}
            <div className="my-8 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPresetDialogOpen(true)}
                className="border-dashed border-2 border-primary/50 hover:border-primary px-8 py-6 h-auto text-sm font-serif font-bold text-primary gap-2 bg-card/60 backdrop-blur-md"
              >
                <Plus className="w-5 h-5" />
                Add Responsive 12-Column Section
              </Button>
            </div>
          </div>
        </div>

        {/* Right-Hand Property / Style Inspector */}
        {currentSection && (() => {
          const selectedSub =
            selectedSubIndex !== null
              ? currentSection.subSections[selectedSubIndex]
              : null;
          const subObj = (typeof selectedSub?.content === "object"
            ? selectedSub.content
            : {}) as Record<string, unknown>;
          const subMedia = subObj?._media as Record<string, unknown> | undefined;
          const subStyle = (selectedSub?.style || subObj?._style || {}) as SectionStyle;

          return (
            <StyleInspector
              isSubSection={selectedSubIndex !== null}
              style={{
                backgroundColor: currentSection.backgroundColor,
                paddingTop: currentSection.paddingTop,
                paddingBottom: currentSection.paddingBottom,
                gridSpan: selectedSub?.gridSpan,
                mediaType: (subMedia?.mediaType as "NONE" | "IMAGE" | "VIDEO" | "ICON" | "AUDIO_PLAYER") || "NONE",
                mediaUrl: (subMedia?.mediaUrl as string) || "",
                mediaAlt: (subMedia?.mediaAlt as string) || "",
                mediaAspectRatio: (subMedia?.mediaAspectRatio as string) || "auto",
                mediaBorderRadius: (subMedia?.mediaBorderRadius as string) || "rounded-lg",
                iconName: (subMedia?.iconName as string) || "Sparkles",
                iconSize: (subMedia?.iconSize as number) || 36,
                iconColor: (subMedia?.iconColor as string) || "#D4AF37",
                audioTitle: (subMedia?.audioTitle as string) || "",
                audioUrl: (subMedia?.audioUrl as string) || "",
                videoUrl: (subMedia?.videoUrl as string) || "",
                borderColor: subStyle.borderColor || "",
                borderWidth: subStyle.borderWidth ?? 0,
                borderStyle: subStyle.borderStyle || "solid",
                borderRadius: subStyle.borderRadius || "none",
                boxShadow: subStyle.boxShadow || "none",
                ornamentalFrame: !!subStyle.ornamentalFrame,
              }}
              onChange={(updated) => {
                setPage({
                  ...page,
                  sections: page.sections.map((sec) => {
                    if (sec.id !== currentSection.id) return sec;
                    if (selectedSubIndex !== null) {
                      const newSubs = [...sec.subSections];
                      const existingContent = (typeof newSubs[selectedSubIndex].content === "object"
                        ? newSubs[selectedSubIndex].content
                        : {}) as Record<string, unknown>;

                      newSubs[selectedSubIndex] = {
                        ...newSubs[selectedSubIndex],
                        gridSpan: updated.gridSpan || newSubs[selectedSubIndex].gridSpan,
                        content: {
                          ...existingContent,
                          _style: {
                            borderColor: updated.borderColor,
                            borderWidth: updated.borderWidth,
                            borderStyle: updated.borderStyle,
                            borderRadius: updated.borderRadius,
                            boxShadow: updated.boxShadow,
                            ornamentalFrame: updated.ornamentalFrame,
                          },
                          _media: {
                            mediaType: updated.mediaType || "NONE",
                            mediaUrl: updated.mediaUrl || "",
                            mediaAlt: updated.mediaAlt || "",
                            mediaAspectRatio: updated.mediaAspectRatio || "auto",
                            mediaBorderRadius: updated.mediaBorderRadius || "rounded-lg",
                            iconName: updated.iconName || "Sparkles",
                            iconSize: updated.iconSize || 36,
                            iconColor: updated.iconColor || "#D4AF37",
                            audioTitle: updated.audioTitle || "",
                            audioUrl: updated.audioUrl || "",
                            videoUrl: updated.videoUrl || "",
                          },
                        },
                      };
                      return { ...sec, subSections: newSubs };
                    }
                    return {
                      ...sec,
                      backgroundColor: updated.backgroundColor,
                      paddingTop: updated.paddingTop,
                      paddingBottom: updated.paddingBottom,
                    };
                  }),
                });
              }}
            />
          );
        })()}
      </div>

      {/* Column Preset Modal */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select 12-Column Section Preset</DialogTitle>
            <DialogDescription>
              Choose a grid column partition. Columns can be customized with Tiptap text blocks, artwork imagery, or devotional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {columnPresets.map((preset) => (
              <div
                key={preset.name}
                onClick={() => handleAddSection(preset.columns)}
                className="p-4 rounded-lg border border-border hover:border-primary/70 bg-card hover:bg-accent/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-foreground mb-1">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {preset.description}
                  </p>
                </div>

                {/* Grid Visual Preview */}
                <div className="grid grid-cols-12 gap-1.5 h-7 bg-muted/60 p-1 rounded border border-border/40">
                  {preset.columns.map((span, i) => (
                    <div
                      key={i}
                      style={{ gridColumn: `span ${span}` }}
                      className="bg-primary/30 border border-primary/50 rounded flex items-center justify-center text-[9px] font-mono font-bold text-primary"
                    >
                      {span}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
