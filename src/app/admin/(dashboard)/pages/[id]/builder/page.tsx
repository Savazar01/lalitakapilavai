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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewportSwitcher, ViewportMode } from "@/components/builder/viewport-switcher";
import { StyleInspector, SectionStyle } from "@/components/builder/style-inspector";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
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

          const isColSelected =
            isSelected && selectedSubSectionIndex === colIdx;

          return (
            <div
              key={colIdx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSubSection(colIdx);
              }}
              className={`${colSpanClass} p-3 rounded-lg border transition-all ${
                isColSelected
                  ? "border-primary/80 bg-primary/5"
                  : "border-border/40 hover:border-primary/40 bg-card/40"
              }`}
            >
              {/* Column label badge */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-border/30">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">
                  Column {colIdx + 1} ({col.gridSpan}/12)
                </span>
              </div>

              {/* Inline Tiptap Rich-Text Editor */}
              <TiptapEditor
                content={col.content}
                onChange={(json) => onUpdateSubSectionContent(colIdx, json)}
              />
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
        newSubs[subIdx] = {
          ...newSubs[subIdx],
          content,
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
      } else {
        alert("Failed to save changes");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving page");
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
        {currentSection && (
          <StyleInspector
            isSubSection={selectedSubIndex !== null}
            style={{
              backgroundColor: currentSection.backgroundColor,
              paddingTop: currentSection.paddingTop,
              paddingBottom: currentSection.paddingBottom,
              gridSpan:
                selectedSubIndex !== null
                  ? currentSection.subSections[selectedSubIndex]?.gridSpan
                  : undefined,
            }}
            onChange={(updated) => {
              setPage({
                ...page,
                sections: page.sections.map((sec) => {
                  if (sec.id !== currentSection.id) return sec;
                  if (selectedSubIndex !== null) {
                    const newSubs = [...sec.subSections];
                    newSubs[selectedSubIndex] = {
                      ...newSubs[selectedSubIndex],
                      gridSpan: updated.gridSpan || newSubs[selectedSubIndex].gridSpan,
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
        )}
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
