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
  Settings,
  Eye,
  EyeOff,
  Home,
  SlidersHorizontal,
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
import { EditablePageHeader } from "@/components/admin/editable-page-header";


interface PageConfig {
  upcomingBadge?: string;
  upcomingTitle?: string;
  upcomingSubtitle?: string;
  upcomingEmptyTitle?: string;
  upcomingEmptySubtitle?: string;
  pastBadge?: string;
  pastTitle?: string;
  pastSubtitle?: string;
  [key: string]: unknown;
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  metaDescription: string | null;
  eyebrowTag?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  config?: PageConfig | null;
  isActive: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
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

  // Settings & Copy Modal State
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<PageItem | null>(null);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsForm, setSettingsForm] = React.useState({
    title: "",
    eyebrowTag: "",
    heroTitle: "",
    heroSubtitle: "",
    metaDescription: "",
    sortOrder: 0,
    isActive: true,
    showOnHomepage: false,
    config: {
      upcomingBadge: "",
      upcomingTitle: "",
      upcomingSubtitle: "",
      upcomingEmptyTitle: "",
      upcomingEmptySubtitle: "",
      pastBadge: "",
      pastTitle: "",
      pastSubtitle: "",
    } as PageConfig,
  });

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

  const handleOpenSettings = (page: PageItem) => {
    setEditingPage(page);
    setSettingsForm({
      title: page.title,
      eyebrowTag: page.eyebrowTag || "",
      heroTitle: page.heroTitle || "",
      heroSubtitle: page.heroSubtitle || "",
      metaDescription: page.metaDescription || "",
      sortOrder: page.sortOrder || 0,
      isActive: page.isActive !== undefined ? page.isActive : true,
      showOnHomepage: page.showOnHomepage !== undefined ? page.showOnHomepage : false,
      config: {
        upcomingBadge: page.config?.upcomingBadge || "Exhibition Schedule",
        upcomingTitle: page.config?.upcomingTitle || "Upcoming Exhibitions & Events",
        upcomingSubtitle:
          page.config?.upcomingSubtitle ||
          "Discover forthcoming sacred Tanjore exhibitions, classical gallery showcases, and Carnatic music recitals.",
        upcomingEmptyTitle: page.config?.upcomingEmptyTitle || "No Upcoming Exhibitions Scheduled",
        upcomingEmptySubtitle:
          page.config?.upcomingEmptySubtitle ||
          "New sacred art exhibitions and recital programs will be announced soon. Explore our past retrospectives below.",
        pastBadge: page.config?.pastBadge || "Archival Showcase",
        pastTitle: page.config?.pastTitle || "Past Exhibitions & Retrospectives",
        pastSubtitle:
          page.config?.pastSubtitle ||
          "A curated retrospective of past masterwork exhibitions, private gallery viewings, and heritage recitals.",
        ...(page.config || {}),
      },
    });
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setPages((prev) => prev.map((p) => (p.id === editingPage.id ? { ...p, ...updated } : p)));
        toast.success(`Updated settings for "${editingPage.title}"`);
        setSettingsModalOpen(false);
        setEditingPage(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update page settings");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving page settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleActive = async (page: PageItem) => {
    const nextVal = !page.isActive;
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, isActive: nextVal } : p)));
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextVal }),
      });
      if (!res.ok) {
        setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, isActive: page.isActive } : p)));
        toast.error("Failed to toggle active status");
      } else {
        toast.success(`Page "${page.title}" is now ${nextVal ? "Active" : "Inactive"}`);
      }
    } catch {
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, isActive: page.isActive } : p)));
      toast.error("Error toggling active status");
    }
  };

  const handleToggleHomepage = async (page: PageItem) => {
    const nextVal = !page.showOnHomepage;
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, showOnHomepage: nextVal } : p)));
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHomepage: nextVal }),
      });
      if (!res.ok) {
        setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, showOnHomepage: page.showOnHomepage } : p)));
        toast.error("Failed to toggle homepage display");
      } else {
        toast.success(`Page "${page.title}" homepage display ${nextVal ? "enabled" : "disabled"}`);
      }
    } catch {
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, showOnHomepage: page.showOnHomepage } : p)));
      toast.error("Error toggling homepage display");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Dialog */}
      <EditablePageHeader
        sectionKey="pages"
        defaultTitle="Custom Page Layouts"
        defaultSubtitle="Build dynamic 12-column pages with inline Tiptap editing and responsive preview emulators."
        badgeLabel="Visual Page Builder"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2 shrink-0 text-xs">
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
      </EditablePageHeader>

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
          {pages.map((p) => {
            const isCorePage = ["home", "blogs", "gallery", "events", "categories"].includes(p.slug);
            return (
              <Card key={p.id} className="hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {p.eyebrowTag && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                          {p.eyebrowTag}
                        </span>
                      )}
                      <CardTitle className="text-base font-serif font-bold text-foreground">
                        {p.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isCorePage && (
                        <Badge variant="outline" className="text-[9px] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                          Core
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          p.isPublished
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600/40"
                            : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">/{p.slug}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Order: {p.sortOrder || 0}</span>
                  </CardDescription>

                  {/* Visibility & Display Toggles */}
                  <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        p.isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600/40 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                      }`}
                      title="Click to toggle Active status"
                    >
                      {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.isActive ? "Active" : "Inactive"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleHomepage(p)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        p.showOnHomepage
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-600/40 hover:bg-blue-200"
                          : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200 opacity-70 hover:opacity-100"
                      }`}
                      title="Click to toggle Homepage visibility"
                    >
                      <Home className="w-3 h-3" />
                      {p.showOnHomepage ? "On Home" : "Not on Home"}
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.heroSubtitle || p.metaDescription || "No hero description or meta summary provided."}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span>{p._count?.sections || 0} Sections</span>
                    <span>•</span>
                    <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>

                <div className="p-3 bg-secondary/30 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
                  <Link
                    href={`/${p.slug === "home" ? "" : p.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Live
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSettings(p)}
                      className="h-8 text-xs gap-1 cursor-pointer hover:border-primary/50"
                      title="Edit Page Copy & Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings & Copy
                    </Button>

                    {!isCorePage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(p.id, p.title)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Link href={`/admin/pages/${p.id}/builder`}>
                      <Button variant="default" size="sm" className="h-8 text-xs gap-1.5 font-semibold">
                        <Pencil className="w-3.5 h-3.5" />
                        Builder
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Page Settings & Dynamic Copy Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {editingPage && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-serif">
                  Page Settings & Verbiage: /{editingPage.slug}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Configure page-level hero verbiage, eyebrow badges, sorting, and sub-section copy.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-left text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-foreground">
                      Page Title
                    </label>
                    <Input
                      value={settingsForm.title}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-foreground">
                      Eyebrow Tag / Badge
                    </label>
                    <Input
                      placeholder="e.g. SACRED EXHIBITIONS"
                      value={settingsForm.eyebrowTag}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, eyebrowTag: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-foreground">
                    Hero Main Heading
                  </label>
                  <Input
                    placeholder="e.g. Sacred Exhibitions & Classical Recitals"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, heroTitle: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-foreground">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Hero description paragraph displayed directly below the main heading..."
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, heroSubtitle: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-foreground">
                      Sort Order (Lower appears first)
                    </label>
                    <Input
                      type="number"
                      value={settingsForm.sortOrder}
                      onChange={(e) =>
                        setSettingsForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-foreground">
                      Meta Description (SEO)
                    </label>
                    <Input
                      placeholder="Search engine summary..."
                      value={settingsForm.metaDescription}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-border/50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.isActive}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-medium text-foreground">Active (Visible to public)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.showOnHomepage}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, showOnHomepage: e.target.checked }))}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-medium text-foreground">Feature on Homepage</span>
                  </label>
                </div>

                {/* Event-Specific Section Copy Controls */}
                {editingPage.slug === "events" && (
                  <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
                    <h4 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                      Live Schedules & Event Sections Verbiage
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Customize section headers, eyebrow tags, and empty states rendered on the public /events page.
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="font-semibold text-[11px] text-primary uppercase tracking-wider border-b border-primary/20 pb-1">
                        Upcoming Exhibitions Section
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Upcoming Eyebrow Badge</label>
                          <Input
                            value={settingsForm.config.upcomingBadge || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, upcomingBadge: e.target.value },
                              }))
                            }
                            placeholder="Exhibition Schedule"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Upcoming Heading Title</label>
                          <Input
                            value={settingsForm.config.upcomingTitle || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, upcomingTitle: e.target.value },
                              }))
                            }
                            placeholder="Upcoming Exhibitions & Events"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Upcoming Subtitle</label>
                        <Input
                          value={settingsForm.config.upcomingSubtitle || ""}
                          onChange={(e) =>
                            setSettingsForm((f) => ({
                              ...f,
                              config: { ...f.config, upcomingSubtitle: e.target.value },
                            }))
                          }
                          placeholder="Discover forthcoming sacred Tanjore exhibitions..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Empty State Title</label>
                          <Input
                            value={settingsForm.config.upcomingEmptyTitle || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, upcomingEmptyTitle: e.target.value },
                              }))
                            }
                            placeholder="No Upcoming Exhibitions Scheduled"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Empty State Subtitle</label>
                          <Input
                            value={settingsForm.config.upcomingEmptySubtitle || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, upcomingEmptySubtitle: e.target.value },
                              }))
                            }
                            placeholder="New exhibitions will be announced soon..."
                          />
                        </div>
                      </div>

                      <div className="font-semibold text-[11px] text-primary uppercase tracking-wider border-b border-primary/20 pb-1 pt-3">
                        Past Exhibitions Section
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Past Eyebrow Badge</label>
                          <Input
                            value={settingsForm.config.pastBadge || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, pastBadge: e.target.value },
                              }))
                            }
                            placeholder="Archival Showcase"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Past Heading Title</label>
                          <Input
                            value={settingsForm.config.pastTitle || ""}
                            onChange={(e) =>
                              setSettingsForm((f) => ({
                                ...f,
                                config: { ...f.config, pastTitle: e.target.value },
                              }))
                            }
                            placeholder="Past Exhibitions & Retrospectives"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Past Subtitle</label>
                        <Input
                          value={settingsForm.config.pastSubtitle || ""}
                          onChange={(e) =>
                            setSettingsForm((f) => ({
                              ...f,
                              config: { ...f.config, pastSubtitle: e.target.value },
                            }))
                          }
                          placeholder="A curated retrospective of past masterwork exhibitions..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettingsModalOpen(false)}
                  disabled={savingSettings}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={savingSettings}>
                  {savingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings & Copy"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

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

