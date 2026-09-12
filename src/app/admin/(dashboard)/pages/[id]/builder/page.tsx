"use client";

export const dynamic = "force-dynamic";

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
  Copy,
  ArrowUp,
  ArrowDown,
  FileText,
  History,
  Images,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { ViewportSwitcher, ViewportMode } from "@/components/builder/viewport-switcher";
import { StyleInspector, SectionStyle } from "@/components/builder/style-inspector";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import { ColumnBlock } from "@/components/public/tiptap-renderer";
import { getPatternById } from "@/lib/background-patterns";
import { PdfViewerBlock } from "@/components/public/blocks/pdf-viewer-block";
import { TimelineBlock, TimelineMilestone } from "@/components/public/blocks/timeline-block";
import { TimelineInspector } from "@/components/builder/timeline-inspector";
import { FormBlockInspector, FormFieldConfig } from "@/components/builder/form-block-inspector";
import { DynamicFormBlock } from "@/components/public/blocks/dynamic-form-block";
import { MediaGalleryInspector } from "@/components/builder/media-gallery-inspector";
import { MediaGalleryBlock, MediaGalleryItem } from "@/components/public/blocks/media-gallery-block";
import {
  PageMatrixStudio,
  type PageMatrixConfig,
  reconcilePageMatrixCells,
} from "@/components/builder/page-matrix-studio";
import {
  resolveContainerContrast,
  getContrastTypographyClasses,
  isLightColor as themeIsLightColor,
} from "@/lib/theme-contrast";

export const isLightColor = themeIsLightColor;
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
  layoutType?: "PRESET" | "MATRIX" | string;
  matrixConfig?: PageMatrixConfig | null;
  backgroundColor?: string | null;
  backgroundType?: "COLOR" | "PATTERN" | "IMAGE" | null;
  backgroundPattern?: string | null;
  backgroundImage?: string | null;
  backgroundOverlayOpacity?: number | null;
  backgroundSize?: "cover" | "contain" | null;
  customCssClass?: string | null;
  paddingTop?: number | null;
  paddingBottom?: number | null;
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
  totalSections,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onUpdateSubSectionContent,
  onSelectSubSection,
  selectedSubSectionIndex,
  onUpdateMatrixConfig,
}: {
  section: SectionData;
  index: number;
  totalSections: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onUpdateSubSectionContent: (subIdx: number, content: Record<string, unknown>) => void;
  onSelectSubSection: (subIdx: number) => void;
  selectedSubSectionIndex: number | null;
  onUpdateMatrixConfig?: (updated: Partial<PageMatrixConfig>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const isImageBg = section.backgroundType === "IMAGE" && !!section.backgroundImage;
  const isPatternBg = section.backgroundType === "PATTERN" && !!section.backgroundPattern;
  const pattern = isPatternBg ? getPatternById(section.backgroundPattern) : null;
  const overlayOpacity = section.backgroundOverlayOpacity ?? 0.5;

  const isContain =
    section.backgroundSize === "contain" ||
    (section.customCssClass && section.customCssClass.includes("bg-contain"));

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: section.backgroundColor || undefined,
    paddingTop: `${section.paddingTop ?? 48}px`,
    paddingBottom: `${section.paddingBottom ?? 48}px`,
    ...(isImageBg
      ? {
          backgroundImage: `url("${section.backgroundImage}")`,
          backgroundSize: isContain ? "contain" : "cover",
          backgroundPosition: "center",
          backgroundRepeat: isContain ? "no-repeat" : "no-repeat",
        }
      : {}),
  };

  const sectionContrast = resolveContainerContrast({
    backgroundType: section.backgroundType || undefined,
    backgroundColor: section.backgroundColor,
    backgroundImage: section.backgroundImage,
    overlayOpacity: section.backgroundOverlayOpacity,
    backgroundPattern: section.backgroundPattern,
  });
  const isSectionLight = sectionContrast === "light-bg";
  const sectionTypographyClasses = getContrastTypographyClasses(sectionContrast);

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
      ...(type === "PDF_VIEWER"
        ? {
            fileUrl: "",
            fileName: "Catalog.pdf",
            title: "Archival Monograph & Curatorial Catalog",
            height: 650,
            allowDownload: true,
          }
        : {}),
      ...(type === "ARTIST_TIMELINE"
        ? {
            title: "Artistic Journey & Honors",
            subtitle: "A chronological trajectory of Thanjavur mastery, solo recitals, and prestigious recognitions.",
            timelineLayout: "alternating",
            showFilters: true,
            timelineItems: [
              {
                id: "m-1",
                period: "1985 - 1992",
                category: "Education",
                title: "Traditional Gurukula Training",
                subtitle: "Rigorous Tanjore Iconography Apprenticeship",
                location: "Thanjavur, Tamil Nadu",
                description:
                  "Mastered 22-karat gold foil embossing, natural mineral pigments, and Mukha-varnam facial iconography under senior traditional acharyas.",
              },
              {
                id: "m-2",
                period: "2004",
                category: "Solo Exhibition",
                title: "Swarna Devatha: Golden Pantheon",
                subtitle: "Retrospective Exhibition",
                location: "National Gallery of Modern Art, New Delhi",
                description:
                  "Curated exhibition of 28 classical Thanjavur devotional panels depicting Navagrahas and Ashta Lakshmis.",
              },
              {
                id: "m-3",
                period: "2018",
                category: "Award/Honor",
                title: "Rashtriya Kala Ratna",
                subtitle: "National Heritage Recognition",
                location: "Chennai, Tamil Nadu",
                description:
                  "Conferred in recognition of four decades of preservation of authentic 22k gold leaf Thanjavur technique and classical Carnatic musicianship.",
              },
            ],
          }
        : {}),
      ...(type === "FORM_BLOCK"
        ? {
            formTitle: "Send Curatorial Inquiry",
            formSubtitle: "Direct correspondence with the atelier desk of Lalita Kapilavai.",
            submitButtonText: "Submit Inquiry",
            successMessage: "Thank you for your correspondence. The curatorial desk will respond shortly.",
            fields: [
              {
                id: "name",
                label: "Full Name",
                type: "text" as const,
                required: true,
                placeholder: "e.g. Smt. Gayatri Iyer",
              },
              {
                id: "email",
                label: "Email Address",
                type: "email" as const,
                required: true,
                placeholder: "curator@example.com",
              },
              {
                id: "phone",
                label: "Phone / WhatsApp",
                type: "tel" as const,
                required: false,
                placeholder: "+91 98450 12345",
              },
              {
                id: "inquiry_type",
                label: "Inquiry Type",
                type: "select" as const,
                required: false,
                placeholder: "Select an option",
                options: [
                  "Artwork Acquisition",
                  "Commission Work",
                  "Private Viewing / RSVP",
                  "Carnatic Music Recital",
                  "General Curatorial Question",
                ],
              },
              {
                id: "message",
                label: "Message / Commentary",
                type: "textarea" as const,
                required: true,
                placeholder: "Specify masterwork inquiries, dimensions, or bespoke requirements...",
              },
            ],
          }
        : {}),
      ...(type === "MEDIA_GALLERY"
        ? {
            galleryDisplayMode: "carousel" as const,
            galleryAutoplayTimer: 5,
            galleryAspectRatio: "landscape" as const,
            galleryFrameStyle: "heritage" as const,
            galleryItems: [
              {
                id: "mg-1",
                url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200",
                title: "Thanjavur Gold Embossing",
                caption: "Sacred gold relief work rendered with 22-carat leaf on seasoned teakwood.",
                alt: "Tanjore painting detail",
                linkType: "none" as const,
              },
              {
                id: "mg-2",
                url: "https://images.unsplash.com/photo-1582561121160-b610c3b8794c?auto=format&fit=crop&q=80&w=1200",
                title: "Mysore Traditional Pigments",
                caption: "Natural mineral colors and classical South Indian iconography.",
                alt: "Mysore painting technique",
                linkType: "none" as const,
              },
            ],
          }
        : {}),
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

  const handleBlockPdfUpload = async (
    colIdx: number,
    blockId: string,
    file: File
  ) => {
    setUploadingBlockId(blockId);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "document");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.publicUrl || data.url;
      updateBlock(colIdx, blockId, {
        fileUrl: url,
        fileName: file.name,
      });
      toast.success("PDF document uploaded successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploadingBlockId(null);
    }
  };

  const [activeTimelineModal, setActiveTimelineModal] = React.useState<{
    colIdx: number;
    blockId: string;
    items?: TimelineMilestone[];
    layout?: "alternating" | "compact" | "horizontal";
    title?: string;
    subtitle?: string;
  } | null>(null);

  const [activeFormModal, setActiveFormModal] = React.useState<{
    colIdx: number;
    blockId: string;
    formTitle?: string;
    formSubtitle?: string;
    submitButtonText?: string;
    successMessage?: string;
    notifyEmail?: boolean;
    recipientEmails?: string;
    emailSubjectTemplate?: string;
    fields?: FormFieldConfig[];
  } | null>(null);

  const [activeGalleryModal, setActiveGalleryModal] = React.useState<{
    colIdx: number;
    blockId: string;
    displayMode?: "carousel" | "scroll" | "collage";
    autoplayTimer?: number;
    aspectRatio?: "landscape" | "portrait" | "square" | "natural";
    frameStyle?: "heritage" | "minimal" | "floating" | "none";
    items?: MediaGalleryItem[];
  } | null>(null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border-2 transition-all my-4 overflow-hidden ${
        isSelected
          ? "border-slate-800 dark:border-slate-300 ring-2 ring-slate-400/20 shadow-lg"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
      }`}
    >
      {/* Background Image Dark Overlay */}
      {isImageBg && (
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-0"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Background Pattern Layer */}
      {pattern && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            backgroundImage: `url("${pattern.svgDataUri}")`,
            backgroundRepeat: "repeat",
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Section Dedicated Header & Rearranging Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-card/95 backdrop-blur-md rounded-t-[10px] border-b border-border/80 text-xs select-none relative z-20 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Drag to reorder section"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-mono font-bold">
              {index + 1}
            </span>
            {section.title || `Section ${index + 1}`}
          </span>
          {section.backgroundType === "PATTERN" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              Pattern: {section.backgroundPattern || "none"}
            </span>
          )}
          {section.backgroundType === "IMAGE" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
              Image Bg ({Math.round((section.backgroundOverlayOpacity ?? 0.5) * 100)}% overlay)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Move Up */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="h-6 w-6 p-0 hover:bg-accent disabled:opacity-30 cursor-pointer"
            title="Move Section Up (↑)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>

          {/* Move Down */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalSections - 1}
            className="h-6 w-6 p-0 hover:bg-accent disabled:opacity-30 cursor-pointer"
            title="Move Section Down (↓)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>

          {/* Duplicate Section */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="h-6 w-6 p-0 hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          {/* Style Section Inspector Trigger */}
          <Button
            type="button"
            variant={isSelected && selectedSubSectionIndex === null ? "default" : "secondary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="h-6 text-[11px] px-2 gap-1 cursor-pointer"
            title="Configure Section Background & Spacing"
          >
            <Sliders className="w-3 h-3 text-primary" />
            Style
          </Button>

          {/* Delete Section */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/15 cursor-pointer"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Matrix Canvas or 12-Column Responsive Grid Row */}
      {section.layoutType === "MATRIX" ? (
        <div className="px-4 sm:px-6 relative z-10">
          <PageMatrixStudio
            config={
              section.matrixConfig || {
                matrixRows: 2,
                matrixCols: 2,
                rowHeights: "1fr 1fr",
                colWidths: "1fr 1fr",
                hasHeader: false,
                headerHtml: "",
                hasFooter: false,
                footerHtml: "",
                verticalSpineMode: "NONE",
                verticalSpineHtml: "",
                verticalSpineWidth: "25%",
                segments: reconcilePageMatrixCells(2, 2, []),
              }
            }
            onChange={(updated) => onUpdateMatrixConfig?.(updated)}
            sectionTitle={section.title}
            contrast={sectionContrast}
            backgroundColor={section.backgroundColor}
          />
        </div>
      ) : (
        /* 12-Column Responsive Grid Row with relative z-10 */
        <div className="grid grid-cols-12 gap-4 px-4 sm:px-6 relative z-10">
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

          const isZeroBorder = colStyle.borderWidth === 0 || colStyle.borderStyle === "none";

          const borderStyleObj: React.CSSProperties = {
            borderColor:
              !isZeroBorder && colStyle.borderColor && colStyle.borderColor !== "transparent"
                ? colStyle.borderColor
                : undefined,
            borderWidth: isZeroBorder ? "0px" : colStyle.borderWidth ? `${colStyle.borderWidth}px` : undefined,
            borderStyle: isZeroBorder ? "none" : (colStyle.borderStyle as React.CSSProperties["borderStyle"]) || undefined,
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

          const borderClass = isZeroBorder
            ? "border-0"
            : isColSelected
            ? "border-primary/80 border"
            : isSectionLight
            ? "border-stone-300/80 hover:border-stone-400 border"
            : "border-border/40 hover:border-primary/40 border";

          const bgColClass = isSectionLight
            ? isColSelected
              ? "bg-white/95"
              : "bg-white/85 text-stone-900"
            : isColSelected
            ? "bg-primary/5 text-foreground"
            : "bg-card/40 text-foreground";

          const blocks = (Array.isArray(colObj.blocks) ? colObj.blocks : null) as ColumnBlock[] | null;

          return (
            <div
              key={colIdx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSubSection(colIdx);
              }}
              style={borderStyleObj}
              className={`${colSpanClass} p-3 transition-all relative ${radiusClass} ${glowClass} ${bgColClass} ${borderClass}`}
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
                          contrast={sectionContrast}
                          isLight={isSectionLight}
                          content={block.content}
                          onChange={(json) => updateBlock(colIdx, block.id, { content: json })}
                        />
                      )}

                      {block.type === "IMAGE" && (
                        <div className="space-y-2">
                          {/* Image preview with aspect-ratio styling */}
                          {block.mediaUrl ? (
                            <div
                              className={`relative group rounded-md overflow-hidden bg-background/50 flex items-center justify-center transition-all ${
                                block.hasBorder === false
                                  ? "border-0 shadow-none"
                                  : "border border-border/80 shadow-xs"
                              }`}
                            >
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
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff,image/heic,image/heif,image/heic-sequence,.heic,.heics"
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
                                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff,image/heic,image/heif,image/heic-sequence,.heic,.heics"
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

                              {/* Image Border Toggle */}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">Border:</span>
                                <select
                                  value={block.hasBorder === false ? "none" : "framed"}
                                  onChange={(e) =>
                                    updateBlock(colIdx, block.id, { hasBorder: e.target.value === "framed" })
                                  }
                                  className="text-xs py-1 px-1.5 rounded border border-border bg-background text-foreground cursor-pointer"
                                >
                                  <option value="framed">Framed</option>
                                  <option value="none">None (0px)</option>
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

                      {block.type === "PDF_VIEWER" && (
                        <div className="p-3 rounded-lg border border-primary/40 bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-primary" /> PDF Monograph / Curatorial Catalog
                            </span>
                            {block.fileUrl && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Document Attached
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-1">Catalog / Document Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Lalita Kapilavai Tanjore Retrospective Catalog"
                                value={block.title || ""}
                                onChange={(e) => updateBlock(colIdx, block.id, { title: e.target.value })}
                                className="w-full text-xs p-1.5 rounded border border-border bg-background text-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-1">Download Filename</label>
                              <input
                                type="text"
                                placeholder="Catalog.pdf"
                                value={block.fileName || ""}
                                onChange={(e) => updateBlock(colIdx, block.id, { fileName: e.target.value })}
                                className="w-full text-xs p-1.5 rounded border border-border bg-background text-foreground font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleBlockPdfUpload(colIdx, block.id, file);
                                }}
                                disabled={uploadingBlockId === block.id}
                              />
                              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded text-xs font-medium border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer shadow-xs">
                                {uploadingBlockId === block.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                                )}
                                {uploadingBlockId === block.id ? "Uploading PDF..." : "Upload PDF from Computer"}
                              </span>
                            </label>

                            <div className="flex-1 min-w-[180px]">
                              <input
                                type="text"
                                placeholder="Or direct PDF URL (https://...)"
                                value={block.fileUrl || ""}
                                onChange={(e) => updateBlock(colIdx, block.id, { fileUrl: e.target.value })}
                                className="w-full text-xs p-1.5 rounded border border-border bg-background text-foreground font-mono"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">Height:</span>
                              <input
                                type="number"
                                min={350}
                                max={1200}
                                step={50}
                                value={block.height || 650}
                                onChange={(e) => updateBlock(colIdx, block.id, { height: parseInt(e.target.value, 10) || 650 })}
                                className="w-16 text-xs p-1 rounded border border-border bg-background text-foreground"
                              />
                              <span className="text-[10px] text-muted-foreground">px</span>
                            </div>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground">
                              <input
                                type="checkbox"
                                checked={block.allowDownload !== false}
                                onChange={(e) => updateBlock(colIdx, block.id, { allowDownload: e.target.checked })}
                                className="rounded border-border"
                              />
                              Allow Download
                            </label>
                          </div>

                          {block.fileUrl ? (
                            <div className="pt-2">
                              <PdfViewerBlock
                                fileUrl={block.fileUrl}
                                fileName={block.fileName}
                                title={block.title}
                                height={Math.min(block.height || 450, 450)}
                                allowDownload={block.allowDownload}
                              />
                            </div>
                          ) : (
                            <div className="p-4 rounded border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                              No PDF selected. Upload or paste a URL to preview.
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === "ARTIST_TIMELINE" && (
                        <div className="p-3 rounded-lg border border-primary/40 bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <History className="w-4 h-4 text-primary" /> Interactive Artist Heritage Timeline
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setActiveTimelineModal({
                                  colIdx,
                                  blockId: block.id,
                                  items: (block.timelineItems || []) as TimelineMilestone[],
                                  layout: block.timelineLayout || "alternating",
                                  title: block.title,
                                  subtitle: block.subtitle,
                                })
                              }
                              className="text-xs h-7 border-primary/40 text-primary hover:bg-primary/10 gap-1"
                            >
                              <Sliders className="w-3 h-3" /> Configure Milestones ({(block.timelineItems || []).length})
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Timeline Title (e.g. Artistic Trajectory & Honors)"
                              value={block.title || ""}
                              onChange={(e) => updateBlock(colIdx, block.id, { title: e.target.value })}
                              className="text-xs p-1.5 rounded border border-border bg-background text-foreground"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground shrink-0">Layout:</span>
                              <select
                                value={block.timelineLayout || "alternating"}
                                onChange={(e) =>
                                  updateBlock(colIdx, block.id, {
                                    timelineLayout: e.target.value as "alternating" | "compact" | "horizontal",
                                  })
                                }
                                className="w-full text-xs p-1.5 rounded border border-border bg-background text-foreground"
                              >
                                <option value="alternating">Alternating Zig-Zag</option>
                                <option value="compact">Compact Left Rail</option>
                                <option value="horizontal">Horizontal Scroll Rail</option>
                              </select>
                            </div>
                          </div>

                          {/* Embedded Timeline Preview */}
                          <div className="pt-2 border-t border-border/40 max-h-96 overflow-y-auto rounded bg-background/50 p-2">
                            <TimelineBlock
                              items={(block.timelineItems || []) as TimelineMilestone[]}
                              layout={block.timelineLayout || "alternating"}
                              title={block.title}
                              subtitle={block.subtitle}
                              showFilters={block.showFilters !== false}
                            />
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

                      {block.type === "FORM_BLOCK" && (
                        <div className="p-3.5 rounded-xl border border-primary/40 bg-card space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-primary" /> Curatorial Inquiry &amp; Lead Form
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setActiveFormModal({
                                  colIdx,
                                  blockId: block.id,
                                  formTitle: block.formTitle,
                                  formSubtitle: block.formSubtitle,
                                  submitButtonText: block.submitButtonText,
                                  successMessage: block.successMessage,
                                  notifyEmail: block.notifyEmail,
                                  recipientEmails: block.recipientEmails,
                                  emailSubjectTemplate: block.emailSubjectTemplate,
                                  fields: block.fields,
                                })
                              }
                              className="text-xs h-7 border-primary/40 text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" /> Configure Form ({(block.fields || []).length} fields)
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Form Title (e.g. Send Curatorial Inquiry)"
                              value={block.formTitle || ""}
                              onChange={(e) => updateBlock(colIdx, block.id, { formTitle: e.target.value })}
                              className="text-xs p-1.5 rounded border border-border bg-background text-foreground"
                            />
                            <input
                              type="text"
                              placeholder="Button Text (e.g. Submit Inquiry)"
                              value={block.submitButtonText || ""}
                              onChange={(e) => updateBlock(colIdx, block.id, { submitButtonText: e.target.value })}
                              className="text-xs p-1.5 rounded border border-border bg-background text-foreground"
                            />
                          </div>

                          {/* Interactive Preview of the Form */}
                          <div className="pt-2 border-t border-border/40 max-h-96 overflow-y-auto rounded bg-background/40 p-2">
                            <DynamicFormBlock
                              formTitle={block.formTitle}
                              formSubtitle={block.formSubtitle}
                              submitButtonText={block.submitButtonText}
                              successMessage={block.successMessage}
                              notifyEmail={block.notifyEmail}
                              recipientEmails={block.recipientEmails}
                              emailSubjectTemplate={block.emailSubjectTemplate}
                              fields={block.fields}
                              pageSlug="page-builder"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "MEDIA_GALLERY" && (
                        <div className="p-3.5 rounded-xl border border-primary/40 bg-card space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Images className="w-4 h-4 text-primary" /> Media Gallery ({block.galleryDisplayMode === "collage" ? "Bento Collage" : block.galleryDisplayMode === "scroll" ? "Horizontal Scroll" : "Carousel"})
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setActiveGalleryModal({
                                  colIdx,
                                  blockId: block.id,
                                  displayMode: block.galleryDisplayMode,
                                  autoplayTimer: block.galleryAutoplayTimer,
                                  aspectRatio: block.galleryAspectRatio,
                                  frameStyle: block.galleryFrameStyle,
                                  items: block.galleryItems,
                                })
                              }
                              className="text-xs h-7 border-primary/40 text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" /> Configure Gallery ({(block.galleryItems || []).length} photos)
                            </Button>
                          </div>

                          {/* Interactive Preview of the Gallery Block */}
                          <div className="pt-2 border-t border-border/40 rounded bg-background/40 p-2">
                            <MediaGalleryBlock
                              items={block.galleryItems}
                              displayMode={block.galleryDisplayMode}
                              autoplayTimer={block.galleryAutoplayTimer}
                              aspectRatio={block.galleryAspectRatio}
                              frameStyle={block.galleryFrameStyle}
                            />
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
                    contrast={sectionContrast}
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
                    isSectionLight ? "text-slate-600 font-semibold" : "text-slate-400 font-semibold"
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
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Text
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "IMAGE");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Image
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "VIDEO");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Video
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "AUDIO");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Audio
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "DIVIDER");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Divider
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "BUTTON");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-medium ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + Button
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "BLOG_GRID");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-semibold ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  + 4-Col Blog Grid
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "PDF_VIEWER");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-semibold flex items-center gap-1 ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  <FileText className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" /> + PDF Document
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "ARTIST_TIMELINE");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-semibold flex items-center gap-1 ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  <History className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" /> + Artist Timeline
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "FORM_BLOCK");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-semibold flex items-center gap-1 ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  <FileText className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" /> + Contact / Lead Form
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlockToCol(colIdx, "MEDIA_GALLERY");
                  }}
                  className={`px-1.5 py-0.5 text-[9px] rounded border transition-all cursor-pointer font-semibold flex items-center gap-1 ${
                    isSectionLight
                      ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs"
                      : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-2xs"
                  }`}
                >
                  <Images className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" /> + Media Gallery (Carousel/Collage)
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Timeline Configuration Dialog */}
      {activeTimelineModal && (
        <Dialog
          open={!!activeTimelineModal}
          onOpenChange={(open) => {
            if (!open) setActiveTimelineModal(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
                <History className="w-5 h-5" /> Configure Artist Heritage Milestones
              </DialogTitle>
              <DialogDescription>
                Add, reorder, or edit milestone achievements, exhibitions, and recognitions for this timeline block.
              </DialogDescription>
            </DialogHeader>

            <TimelineInspector
              items={activeTimelineModal.items}
              layout={activeTimelineModal.layout}
              title={activeTimelineModal.title}
              subtitle={activeTimelineModal.subtitle}
              onChange={(data) => {
                updateBlock(activeTimelineModal.colIdx, activeTimelineModal.blockId, {
                  timelineItems: data.items,
                  timelineLayout: data.layout,
                  title: data.title,
                  subtitle: data.subtitle,
                });
                setActiveTimelineModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        items: data.items,
                        layout: data.layout,
                        title: data.title,
                        subtitle: data.subtitle,
                      }
                    : null
                );
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Form Configuration Dialog */}
      {activeFormModal && (
        <Dialog
          open={!!activeFormModal}
          onOpenChange={(open) => {
            if (!open) setActiveFormModal(null);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" /> Configure Dynamic Curatorial Form
              </DialogTitle>
              <DialogDescription>
                Customize form title, submit button label, success notices, and dynamic visitor input fields.
              </DialogDescription>
            </DialogHeader>

            <FormBlockInspector
              data={{
                formTitle: activeFormModal.formTitle,
                formSubtitle: activeFormModal.formSubtitle,
                submitButtonText: activeFormModal.submitButtonText,
                successMessage: activeFormModal.successMessage,
                notifyEmail: activeFormModal.notifyEmail,
                recipientEmails: activeFormModal.recipientEmails,
                emailSubjectTemplate: activeFormModal.emailSubjectTemplate,
                fields: activeFormModal.fields,
              }}
              onChange={(updated) => {
                updateBlock(activeFormModal.colIdx, activeFormModal.blockId, {
                  formTitle: updated.formTitle,
                  formSubtitle: updated.formSubtitle,
                  submitButtonText: updated.submitButtonText,
                  successMessage: updated.successMessage,
                  notifyEmail: updated.notifyEmail,
                  recipientEmails: updated.recipientEmails,
                  emailSubjectTemplate: updated.emailSubjectTemplate,
                  fields: updated.fields,
                });
                setActiveFormModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        formTitle: updated.formTitle,
                        formSubtitle: updated.formSubtitle,
                        submitButtonText: updated.submitButtonText,
                        successMessage: updated.successMessage,
                        notifyEmail: updated.notifyEmail,
                        recipientEmails: updated.recipientEmails,
                        emailSubjectTemplate: updated.emailSubjectTemplate,
                        fields: updated.fields,
                      }
                    : null
                );
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Media Gallery Configuration Dialog */}
      {activeGalleryModal && (
        <Dialog
          open={!!activeGalleryModal}
          onOpenChange={(open) => {
            if (!open) setActiveGalleryModal(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary flex items-center gap-2">
                <Images className="w-5 h-5" /> Configure Media Gallery (Carousel, Scroll, Collage)
              </DialogTitle>
              <DialogDescription>
                Select presentation mode, autoplay timing, aspect ratio, frame styling, and media items with links.
              </DialogDescription>
            </DialogHeader>

            <MediaGalleryInspector
              data={{
                displayMode: activeGalleryModal.displayMode,
                autoplayTimer: activeGalleryModal.autoplayTimer,
                aspectRatio: activeGalleryModal.aspectRatio,
                frameStyle: activeGalleryModal.frameStyle,
                items: activeGalleryModal.items,
              }}
              onChange={(updated) => {
                updateBlock(activeGalleryModal.colIdx, activeGalleryModal.blockId, {
                  galleryDisplayMode: updated.displayMode,
                  galleryAutoplayTimer: updated.autoplayTimer,
                  galleryAspectRatio: updated.aspectRatio,
                  galleryFrameStyle: updated.frameStyle,
                  galleryItems: updated.items,
                });
                setActiveGalleryModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        displayMode: updated.displayMode,
                        autoplayTimer: updated.autoplayTimer,
                        aspectRatio: updated.aspectRatio,
                        frameStyle: updated.frameStyle,
                        items: updated.items,
                      }
                    : null
                );
              }}
            />
          </DialogContent>
        </Dialog>
      )}
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

  // Add Advanced Matrix Grid Section
  const handleAddMatrixSection = () => {
    if (!page) return;
    const initialSegments = reconcilePageMatrixCells(2, 2, []);
    const newSection: SectionData = {
      id: crypto.randomUUID(),
      title: `Matrix Grid Section ${page.sections.length + 1}`,
      gridSpan: 12,
      layoutType: "MATRIX",
      backgroundColor: "#FAF7F2",
      paddingTop: 48,
      paddingBottom: 48,
      matrixConfig: {
        matrixRows: 2,
        matrixCols: 2,
        rowHeights: "1fr 1fr",
        colWidths: "1fr 1fr",
        hasHeader: false,
        headerHtml: "",
        hasFooter: false,
        footerHtml: "",
        verticalSpineMode: "NONE",
        verticalSpineHtml: "",
        verticalSpineWidth: "25%",
        segments: initialSegments,
      },
      subSections: [],
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection],
    });

    setSelectedSectionId(newSection.id);
    setSelectedSubIndex(null);
    setPresetDialogOpen(false);
    toast.success("Added InDesign-Grade Matrix Grid Section");
  };

  // Update Matrix Config for Section
  const handleUpdateMatrixConfig = (
    sectionId: string,
    updated: Partial<PageMatrixConfig>
  ) => {
    if (!page) return;
    setPage({
      ...page,
      sections: page.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const currentConfig = s.matrixConfig || {
          matrixRows: 2,
          matrixCols: 2,
          rowHeights: "1fr 1fr",
          colWidths: "1fr 1fr",
          hasHeader: false,
          headerHtml: "",
          hasFooter: false,
          footerHtml: "",
          verticalSpineMode: "NONE",
          verticalSpineHtml: "",
          verticalSpineWidth: "25%",
          segments: [],
        };
        return {
          ...s,
          matrixConfig: { ...currentConfig, ...updated },
        };
      }),
    });
  };

  // Move Section Up or Down
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!page) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= page.sections.length) return;
    const reordered = arrayMove(page.sections, index, targetIndex);
    setPage({
      ...page,
      sections: reordered,
    });
    toast.success(`Moved section ${direction === "up" ? "up" : "down"}`);
  };

  // Duplicate Section
  const handleDuplicateSection = (index: number) => {
    if (!page) return;
    const src = page.sections[index];
    const newSec: SectionData = {
      ...src,
      id: crypto.randomUUID(),
      title: `${src.title || "Section"} (Copy)`,
      subSections: src.subSections.map((sub, sIdx) => ({
        ...sub,
        id: crypto.randomUUID(),
        title: sub.title ? `${sub.title} (Copy)` : `Column ${sIdx + 1}`,
      })),
    };
    const newSections = [...page.sections];
    newSections.splice(index + 1, 0, newSec);
    setPage({
      ...page,
      sections: newSections,
    });
    setSelectedSectionId(newSec.id);
    setSelectedSubIndex(null);
    toast.success("Section duplicated successfully!");
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
        if (isPublished) {
          toast.success("Page layout published live! Public website cache revalidated.");
        } else {
          toast.success("Page saved as draft.");
        }
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
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
              {page.title}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold truncate">
              /{page.slug}
            </span>
          </div>
        </div>

        {/* Viewport Frame Switcher */}
        <ViewportSwitcher mode={viewport} onChange={setViewport} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 hidden md:inline-flex cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </Button>
          </Link>

          {/* Save as Draft */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            Save as Draft
          </Button>

          {/* Save & Publish */}
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-8 text-xs gap-1.5 font-bold shadow-md cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-foreground" />
            ) : savedSuccess && page.isPublished ? (
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            )}
            {saving ? "Saving..." : page.isPublished ? "Published" : "Save & Publish"}
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
                    totalSections={page.sections.length}
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
                    onMoveUp={() => handleMoveSection(idx, "up")}
                    onMoveDown={() => handleMoveSection(idx, "down")}
                    onDuplicate={() => handleDuplicateSection(idx)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onUpdateSubSectionContent={(subIdx, content) =>
                      handleUpdateSubContent(section.id, subIdx, content)
                    }
                    onUpdateMatrixConfig={(updated) =>
                      handleUpdateMatrixConfig(section.id, updated)
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
                className="border-dashed border-2 border-primary/50 hover:border-primary px-8 py-6 h-auto text-sm font-serif font-bold text-primary gap-2 bg-card/60 backdrop-blur-md cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Responsive Section (Presets & Matrix Engine)
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
                backgroundColor:
                  (selectedSubIndex !== null
                    ? (subStyle.backgroundColor as string) || currentSection.backgroundColor
                    : currentSection.backgroundColor) || undefined,
                backgroundType:
                  selectedSubIndex !== null
                    ? (subStyle.backgroundType as "COLOR" | "PATTERN" | "IMAGE") || "COLOR"
                    : (currentSection.backgroundType as "COLOR" | "PATTERN" | "IMAGE") || "COLOR",
                backgroundPattern:
                  selectedSubIndex !== null
                    ? subStyle.backgroundPattern || ""
                    : currentSection.backgroundPattern || "",
                backgroundImage:
                  selectedSubIndex !== null
                    ? subStyle.backgroundImage || ""
                    : currentSection.backgroundImage || "",
                backgroundImageUrl:
                  selectedSubIndex !== null
                    ? subStyle.backgroundImage || ""
                    : currentSection.backgroundImage || "",
                backgroundOverlayOpacity:
                  selectedSubIndex !== null
                    ? subStyle.backgroundOverlayOpacity ?? 0.5
                    : currentSection.backgroundOverlayOpacity ?? 0.5,
                backgroundSize:
                  selectedSubIndex !== null
                    ? subStyle.backgroundSize || "cover"
                    : currentSection.backgroundSize ||
                      (currentSection.customCssClass?.includes("bg-contain") ? "contain" : "cover"),
                paddingTop: currentSection.paddingTop ?? undefined,
                paddingBottom: currentSection.paddingBottom ?? undefined,
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
                            backgroundColor: updated.backgroundColor,
                            backgroundType: updated.backgroundType || "COLOR",
                            backgroundPattern: updated.backgroundPattern || null,
                            backgroundImage: updated.backgroundImage || null,
                            backgroundOverlayOpacity: updated.backgroundOverlayOpacity ?? 0.5,
                            backgroundSize: updated.backgroundSize || "cover",
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
                    // Section-level update
                    const updatedClasses = (sec.customCssClass || "")
                      .split(" ")
                      .filter((c) => c && c !== "bg-contain" && c !== "bg-cover");
                    if (updated.backgroundSize === "contain") {
                      updatedClasses.push("bg-contain");
                    }
                    return {
                      ...sec,
                      backgroundColor: updated.backgroundColor,
                      backgroundType: updated.backgroundType || "COLOR",
                      backgroundPattern: updated.backgroundPattern || null,
                      backgroundImage: updated.backgroundImage || null,
                      backgroundOverlayOpacity: updated.backgroundOverlayOpacity ?? 0.5,
                      backgroundSize: updated.backgroundSize || "cover",
                      customCssClass: updatedClasses.join(" ").trim() || null,
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

      {/* Section Creation Modal: InDesign Matrix Engine + 12-Column Presets */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Add Responsive Section</DialogTitle>
            <DialogDescription>
              Launch an advanced InDesign-grade Matrix Grid canvas or pick from classical 12-column presets.
            </DialogDescription>
          </DialogHeader>

          {/* Featured InDesign Matrix Engine Card */}
          <div
            onClick={handleAddMatrixSection}
            className="p-4 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all shadow-md group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                    ⚡ Advanced Matrix Grid Engine
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
                    InDesign Grade
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Multi-row (1–6) × multi-column (1–6) responsive matrix grid with custom track proportions, spanned featured zones, vertical sidebar spine, and running headers.
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 text-xs gap-1.5 shadow-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Launch Matrix
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Or Select Preserved 12-Column Preset
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            {columnPresets.map((preset) => (
              <div
                key={preset.name}
                onClick={() => handleAddSection(preset.columns)}
                className="p-3.5 rounded-lg border border-border hover:border-primary/70 bg-card hover:bg-accent/40 cursor-pointer transition-all flex flex-col justify-between"
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
