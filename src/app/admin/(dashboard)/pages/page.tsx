"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


interface PageItem {
  id: string;
  title: string;
  slug: string;
  metaDescription: string | null;
  isPublished: boolean;
  updatedAt: string;
  _count?: { sections: number };
}

export default function PagesAdminPage() {
  const router = useRouter();
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetDeletePage, setTargetDeletePage] = React.useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/pages")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          setPages(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, metaDescription }),
      });

      if (res.ok) {
        const newPage = await res.json();
        toast.success("Page created successfully! Launching visual builder...");
        setDialogOpen(false);
        router.push(`/admin/pages/${newPage.id}/builder`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to create page");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error creating page");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (id: string, pageTitle: string) => {
    setTargetDeletePage({ id, title: pageTitle });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeletePage) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${targetDeletePage.id}`, { method: "DELETE" });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== targetDeletePage.id));
        toast.success(`Deleted page "${targetDeletePage.title}" successfully`);
        setDeleteDialogOpen(false);
        setTargetDeletePage(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete page");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting page");
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header with Title and Create Dialog */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Visual Page Builder
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Custom Page Layouts
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Build dynamic 12-column pages with inline Tiptap editing and responsive preview emulators.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Create New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreatePage}>
              <DialogHeader>
                <DialogTitle>Create Custom Page</DialogTitle>
                <DialogDescription>
                  Define the page title and URL slug to initialize the 12-column visual canvas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Page Title
                  </label>
                  <Input
                    placeholder="e.g. Tanjore Technique & Heritage"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground font-mono">/</span>
                    <Input
                      placeholder="tanjore-technique"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Meta Description (Optional)
                  </label>
                  <Input
                    placeholder="Brief description for search engines..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Launch Visual Canvas"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Grid / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading page catalog...</span>
        </div>
      ) : pages.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No Custom Pages Created</CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Click &quot;Create New Page&quot; to begin designing bespoke sections, devotional essays, or exhibition portfolios.
          </CardDescription>
          <Button variant="gold" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Page
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <Card key={p.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-serif font-bold text-foreground">
                    {p.title}
                  </CardTitle>
                  <Badge variant={p.isPublished ? "gold" : "outline"} className="text-[10px] uppercase">
                    {p.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardDescription className="text-xs font-mono text-primary">
                  /{p.slug}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {p.metaDescription || "No meta description provided."}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span>{p._count?.sections || 0} Sections</span>
                  <span>•</span>
                  <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>

              <div className="p-3 bg-secondary/30 border-t border-border/60 flex items-center justify-between gap-2">
                <Link
                  href={`/${p.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(p.id, p.title)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  <Link href={`/admin/pages/${p.id}/builder`}>
                    <Button variant="default" size="sm" className="h-8 text-xs gap-1.5 font-semibold">
                      <Pencil className="w-3.5 h-3.5" />
                      Visual Builder
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Custom Page"
        description={
          targetDeletePage
            ? `Are you sure you want to delete "${targetDeletePage.title}"? This will permanently delete the page layout, blocks, and routing. This action cannot be undone.`
            : "Are you sure you want to delete this page?"
        }
        confirmText="Delete Page"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

