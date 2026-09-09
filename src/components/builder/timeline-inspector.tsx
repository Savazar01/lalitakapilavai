"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Edit2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TimelineMilestone } from "@/components/public/blocks/timeline-block";

export interface TimelineInspectorProps {
  layout?: "alternating" | "compact" | "horizontal";
  items?: TimelineMilestone[];
  title?: string;
  subtitle?: string;
  onChange: (data: {
    layout?: "alternating" | "compact" | "horizontal";
    items?: TimelineMilestone[];
    title?: string;
    subtitle?: string;
  }) => void;
}

const CATEGORY_OPTIONS = [
  "Education",
  "Solo Exhibition",
  "Group Show",
  "Award/Honor",
  "Experience",
  "Upcoming",
];

export function TimelineInspector({
  layout = "alternating",
  items = [],
  title = "Curatorial Journey & Archival Milestones",
  subtitle = "Chronological trajectory of traditional Tanjore masterworks, royal court restorations, and Carnatic synesthetic recitals.",
  onChange,
}: TimelineInspectorProps) {
  const [editingItem, setEditingItem] = React.useState<TimelineMilestone | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [formMilestone, setFormMilestone] = React.useState<TimelineMilestone>({
    id: "",
    period: "2024 – Present",
    category: "Solo Exhibition",
    title: "",
    subtitle: "",
    location: "",
    description: "",
    badgeColor: "gold",
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormMilestone({
      id: `tm-${Date.now()}`,
      period: new Date().getFullYear().toString(),
      category: "Solo Exhibition",
      title: "",
      subtitle: "",
      location: "",
      description: "",
      badgeColor: "gold",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: TimelineMilestone) => {
    setEditingItem(m);
    setFormMilestone({ ...m });
    setDialogOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMilestone.title.trim()) return;

    let updated: TimelineMilestone[];
    if (editingItem) {
      updated = items.map((it) =>
        it.id === editingItem.id ? formMilestone : it
      );
    } else {
      updated = [...items, formMilestone];
    }

    onChange({ items: updated, layout, title, subtitle });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    onChange({ items: updated, layout, title, subtitle });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const clone = [...items];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    onChange({ items: clone, layout, title, subtitle });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Layout Selector */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Timeline Layout Mode
        </Label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ layout: "alternating", items, title, subtitle })}
            className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
              layout === "alternating"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Alternating
          </button>
          <button
            type="button"
            onClick={() => onChange({ layout: "compact", items, title, subtitle })}
            className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
              layout === "compact"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => onChange({ layout: "horizontal", items, title, subtitle })}
            className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
              layout === "horizontal"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Horizontal
          </button>
        </div>
      </div>

      {/* Header Title & Subtitle */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Section Title</Label>
          <Input
            value={title}
            onChange={(e) =>
              onChange({ title: e.target.value, layout, items, subtitle })
            }
            placeholder="e.g. Curatorial Journey"
            className="text-xs h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Description Subtitle</Label>
          <Input
            value={subtitle}
            onChange={(e) =>
              onChange({ subtitle: e.target.value, layout, items, title })
            }
            placeholder="e.g. Classical trajectory..."
            className="text-xs h-8"
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Milestones ({items.length})
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleOpenAdd}
            className="h-7 text-xs gap-1 border-primary/40 hover:border-primary text-primary"
          >
            <Plus className="w-3 h-3" /> Add Milestone
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map((m, idx) => (
            <div
              key={m.id}
              className="p-2.5 rounded-lg border border-border/70 bg-card/60 flex items-center justify-between gap-2 hover:border-primary/40 transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                    {m.category}
                  </Badge>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    {m.period}
                  </span>
                </div>
                <h5 className="font-serif font-bold text-xs text-foreground truncate mt-1">
                  {m.title || "Untitled Milestone"}
                </h5>
                {m.location && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {m.location}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === items.length - 1}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(m)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Edit Milestone"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(m.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Milestone Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg border-border bg-card">
          <form onSubmit={handleSaveMilestone} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold text-foreground">
                {editingItem ? "Edit Milestone" : "Add Career Milestone"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define curatorial category, year/period, exhibition title, and description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Category</Label>
                  <Select
                    value={formMilestone.category}
                    onValueChange={(val) =>
                      setFormMilestone({ ...formMilestone, category: val })
                    }
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground">Date / Period *</Label>
                  <Input
                    required
                    value={formMilestone.period}
                    onChange={(e) =>
                      setFormMilestone({ ...formMilestone, period: e.target.value })
                    }
                    placeholder="e.g. 2018 – 2021"
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-foreground">Title / Exhibition / Honor *</Label>
                <Input
                  required
                  value={formMilestone.title}
                  onChange={(e) =>
                    setFormMilestone({ ...formMilestone, title: e.target.value })
                  }
                  placeholder="e.g. Rashtriya Kala Shiromani Award"
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Subtitle / Institution</Label>
                  <Input
                    value={formMilestone.subtitle || ""}
                    onChange={(e) =>
                      setFormMilestone({ ...formMilestone, subtitle: e.target.value })
                    }
                    placeholder="e.g. National Arts Academy"
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground">Location (City, Country)</Label>
                  <Input
                    value={formMilestone.location || ""}
                    onChange={(e) =>
                      setFormMilestone({ ...formMilestone, location: e.target.value })
                    }
                    placeholder="e.g. London, United Kingdom"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-foreground">Curatorial Description</Label>
                <textarea
                  rows={3}
                  value={formMilestone.description}
                  onChange={(e) =>
                    setFormMilestone({ ...formMilestone, description: e.target.value })
                  }
                  placeholder="Details of works exhibited, artistic technique, or jury citation..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                className="text-xs"
              >
                {editingItem ? "Update Milestone" : "Save Milestone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
