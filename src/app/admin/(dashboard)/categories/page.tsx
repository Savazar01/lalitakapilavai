"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Palette,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaUploader } from "@/components/admin/media-uploader";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import { AiAssistantModal } from "@/components/admin/ai-assistant-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface ArtCategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: {
    id: string;
    name: string;
    slug: string;
    displayOrder: number;
  }[];
  description: string | null;
  curatorialNote?: string | null;
  coverImage: string | null;
  displayOrder: number;
  badgeLabel?: string | null;
  heroTitle?: string | null;
  bannerHeight?: number | null;
  overlayOpacity?: number | null;
  imagePosition?: string | null;
  borderStyle?: string | null;
  _count?: {
    artworks: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<ArtCategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ArtCategoryItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetDelete, setTargetDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Form fields
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    parentId: "none",
    description: "",
    curatorialNote: "",
    coverImage: "",
    displayOrder: 0,
    badgeLabel: "Traditional Fine Art School",
    heroTitle: "",
    bannerHeight: 360,
    overlayOpacity: 0.45,
    imagePosition: "center",
    borderStyle: "gold-fillet",
  });

  const fetchCategories = React.useCallback(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      parentId: "none",
      description: "",
      curatorialNote: "",
      coverImage: "",
      displayOrder: categories.length + 1,
      badgeLabel: "Traditional Fine Art School",
      heroTitle: "",
      bannerHeight: 360,
      overlayOpacity: 0.45,
      imagePosition: "center",
      borderStyle: "gold-fillet",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ArtCategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || "none",
      description: cat.description || "",
      curatorialNote: cat.curatorialNote || cat.description || "",
      coverImage: cat.coverImage || "",
      displayOrder: cat.displayOrder,
      badgeLabel: cat.badgeLabel || "Traditional Fine Art School",
      heroTitle: cat.heroTitle || "",
      bannerHeight: cat.bannerHeight || 360,
      overlayOpacity: cat.overlayOpacity !== undefined && cat.overlayOpacity !== null ? cat.overlayOpacity : 0.45,
      imagePosition: cat.imagePosition || "center",
      borderStyle: cat.borderStyle || "gold-fillet",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleAutoSlug = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, name: nameVal, slug: editingCategory ? prev.slug : slugVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const isEdit = !!editingCategory;
      const url = "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { id: editingCategory.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(isEdit ? "Category updated successfully" : "Category created successfully");
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving category";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setTargetDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${targetDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete category");
        return;
      }
      toast.success(`Deleted category "${targetDelete.name}" successfully`);
      setDeleteDialogOpen(false);
      setTargetDelete(null);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting category");
    } finally {
      setDeleting(false);
    }
  };


  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FolderTree className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Art Categories
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage classical Indian fine art painting schools, display hierarchy, and visual metadata.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading classical art categories...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <FolderTree className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No Categories Found</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Initialize your collection by adding your first art category.
          </p>
          <Button onClick={handleOpenCreate} size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((cat) => (
            <Card
              key={cat.id}
              className="border border-border/80 bg-card hover:border-primary/40 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {cat.coverImage ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-border/80 bg-background shrink-0 mt-0.5 shadow-sm">
                        <img
                          src={cat.coverImage}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="truncate">{cat.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <code className="text-[11px] text-muted-foreground font-mono">
                          /{cat.slug}
                        </code>
                        {cat.parent && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/20 font-medium">
                            Sub of {cat.parent.name}
                          </Badge>
                        )}
                        {cat.children && cat.children.length > 0 && (
                          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-medium">
                            {cat.children.length} Sub-categories
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    Order: {cat.displayOrder}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {cat.description || "No specific curatorial description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>
                      <strong>{cat._count?.artworks ?? 0}</strong> Artworks Cataloged
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(cat)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(cat.id, cat.name)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingCategory ? "Edit Art Category" : "Add Art Category"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure fine art school metadata, dynamic hero banner presentation, and rich curatorial notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {error && (
              <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Core Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleAutoSlug(e.target.value)}
                  placeholder="e.g. Tanjore Paintings"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Slug (URL identifier) *</label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. tanjore-paintings"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Parent Category (Hierarchy)</label>
                <Select
                  value={formData.parentId}
                  onValueChange={(val) => setFormData({ ...formData, parentId: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Root Fine Art School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {categories
                      .filter((c) => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground">Select a parent to make this a sub-category.</span>
              </div>
            </div>

            {/* Hero Header Customization */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Hero Banner &amp; Typography Customization
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Badge Pill Label</label>
                  <Input
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                    placeholder="e.g. Traditional Fine Art School"
                    className="text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">Appears above the hero title in an illuminated badge.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Hero Title Override</label>
                  <Input
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    placeholder="Defaults to Category Name if blank"
                    className="text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">Leave blank to inherit the Category Name.</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Category Cover Image
                </label>
                <MediaUploader
                  value={formData.coverImage}
                  onUploadComplete={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                  mediaType="general"
                  description="High-resolution banner artwork (WebP, JPG, PNG up to 25MB)."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">Banner Height</label>
                    <span className="text-[11px] font-mono text-primary font-bold">{formData.bannerHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={600}
                    step={10}
                    value={formData.bannerHeight}
                    onChange={(e) => setFormData({ ...formData, bannerHeight: parseInt(e.target.value) || 360 })}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-border rounded-lg"
                  />
                  <span className="text-[10px] text-muted-foreground">Range: 200px (compact) to 600px (cinematic).</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">Overlay Scrim Opacity</label>
                    <span className="text-[11px] font-mono text-primary font-bold">{Math.round(formData.overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={formData.overlayOpacity}
                    onChange={(e) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) || 0 })}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-border rounded-lg"
                  />
                  <span className="text-[10px] text-muted-foreground">Dark gradient scrim for optimal text contrast.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Image Focal Point</label>
                  <Select
                    value={formData.imagePosition}
                    onValueChange={(val) => setFormData({ ...formData, imagePosition: val })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Border Framing Style</label>
                  <Select
                    value={formData.borderStyle}
                    onValueChange={(val) => setFormData({ ...formData, borderStyle: val })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Border Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold-fillet">Classical Gold Fillet</SelectItem>
                      <SelectItem value="subtle">Subtle Minimal</SelectItem>
                      <SelectItem value="none">None (Full Bleed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-primary" /> Display Order
                  </label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Curatorial Description & Note (WYSIWYG) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Curatorial Note &amp; Historical Context
                </label>
                <AiAssistantModal
                  initialContext={`${formData.name ? `School: ${formData.name}\n` : ""}${formData.curatorialNote || formData.description || ""}`}
                  onApply={(aiText) => {
                    setFormData((prev) => {
                      const newParagraph = `<p>${aiText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
                      const updated = prev.curatorialNote ? `${prev.curatorialNote}${newParagraph}` : newParagraph;
                      return {
                        ...prev,
                        curatorialNote: updated,
                        description: prev.description || aiText.slice(0, 180),
                      };
                    });
                  }}
                  triggerLabel="✨ AI Curatorial Note"
                />
              </div>

              <div className="rounded-md border border-input bg-card/60 p-1 shadow-sm">
                <TiptapEditor
                  content={formData.curatorialNote}
                  onChange={(_, html) =>
                    setFormData((prev) => ({
                      ...prev,
                      curatorialNote: html,
                      // keep plain text description excerpt in sync for SEO fallback
                      description: prev.description || html.replace(/<[^>]+>/g, "").slice(0, 180),
                    }))
                  }
                  placeholder="Elaborate on classical school heritage, gold foil application, natural mineral pigments, and iconography..."
                  className="min-h-[160px]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rich text will be formatted curating this collection on public gallery headers.
              </p>
            </div>

            <DialogFooter className="pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Art Category"
        description={
          targetDelete
            ? `Are you sure you want to delete "${targetDelete.name}"? This action cannot be undone and will permanently remove this category.`
            : "Are you sure you want to delete this category?"
        }
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

