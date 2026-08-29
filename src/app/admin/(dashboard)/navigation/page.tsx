"use client";

import * as React from "react";
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


interface MenuItemNode {
  id: string;
  label: string;
  path: string;
  position: string;
  orderIndex: number;
  openInNewTab: boolean;
  parentId: string | null;
  children?: MenuItemNode[];
}

const positions = [
  { key: "TOP_CENTER", label: "Top Center (Main Header)" },
  { key: "TOP_LEFT", label: "Top Left" },
  { key: "TOP_RIGHT", label: "Top Right (Action / CTA)" },
  { key: "SIDEBAR_LEFT", label: "Sidebar Left" },
  { key: "DRAWER_RIGHT", label: "Mobile Drawer" },
];

export default function NavigationManagerPage() {
  const [selectedPosition, setSelectedPosition] = React.useState("TOP_CENTER");
  const [items, setItems] = React.useState<MenuItemNode[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Dialog State (Add / Edit)
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItemNode | null>(null);
  const [parentTargetId, setParentTargetId] = React.useState<string | null>(null);

  const [label, setLabel] = React.useState("");
  const [path, setPath] = React.useState("");
  const [openInNewTab, setOpenInNewTab] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetDeleteNav, setTargetDeleteNav] = React.useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const reloadMenu = React.useCallback(() => {
    fetch(`/api/admin/navigation?position=${selectedPosition}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load navigation:", e);
        setLoading(false);
      });
  }, [selectedPosition]);

  React.useEffect(() => {
    let isMounted = true;
    fetch(`/api/admin/navigation?position=${selectedPosition}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load navigation:", e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPosition]);

  const openAddDialog = (parentId: string | null = null) => {
    setEditingItem(null);
    setParentTargetId(parentId);
    setLabel("");
    setPath("");
    setOpenInNewTab(false);
    setDialogOpen(true);
  };

  const openEditDialog = (item: MenuItemNode) => {
    setEditingItem(item);
    setParentTargetId(null);
    setLabel(item.label);
    setPath(item.path);
    setOpenInNewTab(item.openInNewTab);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingItem) {
        // Edit existing
        const res = await fetch("/api/admin/navigation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            label,
            path,
            openInNewTab,
          }),
        });
        if (res.ok) {
          toast.success("Navigation item updated");
          setDialogOpen(false);
          reloadMenu();
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || "Failed to update navigation item");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label,
            path,
            position: selectedPosition,
            parentId: parentTargetId,
            openInNewTab,
          }),
        });
        if (res.ok) {
          toast.success("Navigation item created");
          setDialogOpen(false);
          reloadMenu();
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || "Failed to create navigation item");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving navigation item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, itemLabel: string) => {
    setTargetDeleteNav({ id, label: itemLabel });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteNav) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/navigation?id=${targetDeleteNav.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Deleted "${targetDeleteNav.label}" successfully`);
        setDeleteDialogOpen(false);
        setTargetDeleteNav(null);
        reloadMenu();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete navigation item");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting navigation item");
    } finally {
      setDeleting(false);
    }
  };

  const moveOrder = async (
    list: MenuItemNode[],
    index: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const swapped = [...list];
    const temp = swapped[index];
    swapped[index] = swapped[targetIndex];
    swapped[targetIndex] = temp;

    const reorderedPayload = swapped.map((item, idx) => ({
      id: item.id,
      orderIndex: idx + 1,
    }));

    try {
      await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedPayload }),
      });
      reloadMenu();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Navigation Matrix Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Hierarchical Menu Engine
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure primary, secondary, and nested 2-tier dropdown navigation across all header and drawer positions.
          </p>
        </div>

        <Button
          variant="gold"
          onClick={() => openAddDialog(null)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Root Nav Item
        </Button>
      </div>

      {/* Position Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-md">
        {positions.map((pos) => {
          const isActive = selectedPosition === pos.key;
          return (
            <Button
              key={pos.key}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPosition(pos.key)}
              className={`h-8 text-xs font-medium ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pos.label}
            </Button>
          );
        })}
      </div>

      {/* Menu Tree List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading navigation hierarchy...</span>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Menu className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No Navigation Items in this Position</CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Click &quot;Add Root Nav Item&quot; to configure links for {selectedPosition}.
          </CardDescription>
          <Button variant="gold" onClick={() => openAddDialog(null)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Link
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((root, rootIdx) => (
            <Card key={root.id} className="overflow-hidden border-border/80">
              {/* Root Item Header */}
              <div className="p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center font-mono font-bold text-xs text-primary">
                    {rootIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-foreground">
                        {root.label}
                      </span>
                      {root.openInNewTab && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <ExternalLink className="w-2.5 h-2.5" /> _blank
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-primary">
                      {root.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Reorder Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={rootIdx === 0}
                    onClick={() => moveOrder(items, rootIdx, "up")}
                    className="h-8 w-8 p-0"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={rootIdx === items.length - 1}
                    onClick={() => moveOrder(items, rootIdx, "down")}
                    className="h-8 w-8 p-0"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>

                  {/* Add Tier 2 Sub-item */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddDialog(root.id)}
                    className="h-8 text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Sub-item
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(root)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(root.id, root.label)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Tier 2 Sub-menu Children */}
              {root.children && root.children.length > 0 && (
                <CardContent className="pt-0 pb-3 pl-8 sm:pl-12 pr-4 border-t border-border/40 bg-muted/20 space-y-2">
                  <div className="pt-2 text-[10px] uppercase font-mono text-muted-foreground">
                    Tier 2 Dropdown Links ({root.children.length})
                  </div>
                  {root.children.map((tier2, tier2Idx) => (
                    <div
                      key={tier2.id}
                      className="p-3 rounded-lg border border-border/60 bg-card/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <div>
                          <span className="font-medium text-xs text-foreground">
                            {tier2.label}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground ml-2">
                            {tier2.path}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={tier2Idx === 0}
                          onClick={() => moveOrder(root.children || [], tier2Idx, "up")}
                          className="h-7 w-7 p-0"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={tier2Idx === (root.children?.length ?? 0) - 1}
                          onClick={() => moveOrder(root.children || [], tier2Idx, "down")}
                          className="h-7 w-7 p-0"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>

                        {/* Add Tier 3 Child */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddDialog(tier2.id)}
                          className="h-7 text-[11px] px-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nested
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tier2)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(tier2.id, tier2.label)}
                          className="h-7 w-7 p-0 text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Tier 3 Grandchildren */}
                      {tier2.children && tier2.children.length > 0 && (
                        <div className="w-full pl-6 pt-2 space-y-1 border-t border-border/40 mt-1">
                          <span className="text-[9px] uppercase font-mono text-muted-foreground">
                            Tier 3 Nested Items:
                          </span>
                          {tier2.children.map((tier3) => (
                            <div
                              key={tier3.id}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/40"
                            >
                              <span>{tier3.label} ({tier3.path})</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(tier3.id, tier3.label)}
                                className="h-6 w-6 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>

              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Navigation Link" : "Add Navigation Link"}
              </DialogTitle>
              <DialogDescription>
                {parentTargetId
                  ? "Configure a nested sub-menu dropdown item."
                  : `Configure top-level item for ${selectedPosition}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Menu Label
                </label>
                <Input
                  placeholder="e.g. Tanjore Gold Leaf"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Target URL / Path
                </label>
                <Input
                  placeholder="e.g. /gallery/tanjore-paintings or https://..."
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 text-left">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="openInNewTab" className="text-xs text-foreground font-medium">
                  Open link in new browser tab (_blank)
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Navigation Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Navigation Item"
        description={
          targetDeleteNav
            ? `Are you sure you want to delete "${targetDeleteNav.label}" and all its associated sub-links? This action cannot be undone.`
            : "Are you sure you want to delete this navigation item?"
        }
        confirmText="Delete Link"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

