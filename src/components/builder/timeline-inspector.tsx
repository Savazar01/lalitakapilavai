"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Edit2,
  Layers,
  Sparkles,
  Link as LinkIcon,
  MapPin,
  Globe,
  Tag,
  ArrowUpDown,
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
import {
  TimelineItem,
  TimelineGranularity,
  TimelineLayout,
  TIMELINE_CATEGORY_PRESETS,
  formatTimelineTemporalDisplay,
} from "@/types/timeline";

export interface TimelineInspectorProps {
  layout?: TimelineLayout;
  granularity?: TimelineGranularity;
  sortDirection?: "asc" | "desc";
  items?: TimelineItem[];
  title?: string;
  subtitle?: string;
  onChange: (data: {
    layout?: TimelineLayout;
    granularity?: TimelineGranularity;
    sortDirection?: "asc" | "desc";
    items?: TimelineItem[];
    title?: string;
    subtitle?: string;
  }) => void;
}

const COMMON_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST - UTC+5:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US PT)" },
  { value: "America/Chicago", label: "Central Time (US CT)" },
  { value: "Europe/London", label: "British Time (GMT / BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST - UTC+4)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT - UTC+8)" },
  { value: "Australia/Sydney", label: "Australian Eastern (AEST)" },
];

export function TimelineInspector({
  layout = "alternating",
  granularity = "YEAR",
  sortDirection = "desc",
  items = [],
  title = "Curatorial Journey & Archival Milestones",
  subtitle = "Chronological trajectory of traditional Tanjore masterworks, royal court restorations, and Carnatic synesthetic recitals.",
  onChange,
}: TimelineInspectorProps) {
  const [editingItem, setEditingItem] = React.useState<TimelineItem | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Form state for creating / editing an item
  const [formItem, setFormItem] = React.useState<TimelineItem>({
    id: "",
    title: "",
    category: "Solo Show",
    customCategory: "",
    granularity: granularity || "YEAR",
    period: "2025 – Present",
    startDateTime: "",
    endDateTime: "",
    isOngoing: false,
    timezone: "Asia/Kolkata",
    displayOverride: "",
    subtitle: "",
    location: "",
    description: "",
    actionUrl: "",
    actionLabel: "",
  });

  const [yearOnlyVal, setYearOnlyVal] = React.useState<string>(new Date().getFullYear().toString());
  const [endYearOnlyVal, setEndYearOnlyVal] = React.useState<string>("");
  const [yearMonthVal, setYearMonthVal] = React.useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );
  const [endYearMonthVal, setEndYearMonthVal] = React.useState<string>("");

  const handleOpenAdd = () => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentYearMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayIso = now.toISOString().split("T")[0];
    const nowIsoMinutes = `${todayIso}T10:00`;

    setEditingItem(null);
    setYearOnlyVal(currentYear);
    setEndYearOnlyVal("");
    setYearMonthVal(currentYearMonth);
    setEndYearMonthVal("");

    setFormItem({
      id: `tm-${Date.now()}`,
      title: "",
      category: "Exhibition",
      customCategory: "",
      granularity: granularity || "YEAR",
      period: currentYear,
      startDateTime:
        granularity === "DATE"
          ? todayIso
          : granularity === "DATE_TIME"
          ? nowIsoMinutes
          : `${currentYear}-01-01`,
      endDateTime: "",
      isOngoing: false,
      timezone: "Asia/Kolkata",
      displayOverride: "",
      subtitle: "",
      location: "",
      description: "",
      actionUrl: "",
      actionLabel: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: TimelineItem) => {
    setEditingItem(m);
    const itemGran = m.granularity || granularity || "YEAR";

    if (m.startDateTime) {
      try {
        const d = new Date(m.startDateTime);
        if (!isNaN(d.getTime())) {
          setYearOnlyVal(d.getFullYear().toString());
          setYearMonthVal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }
      } catch {
        // fallback
      }
    } else if (m.period) {
      const match = m.period.match(/\b(19\d{2}|20\d{2})\b/);
      if (match) setYearOnlyVal(match[1]);
    }

    if (m.endDateTime) {
      try {
        const d = new Date(m.endDateTime);
        if (!isNaN(d.getTime())) {
          setEndYearOnlyVal(d.getFullYear().toString());
          setEndYearMonthVal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }
      } catch {
        // fallback
      }
    } else {
      setEndYearOnlyVal("");
      setEndYearMonthVal("");
    }

    const isPreset = (TIMELINE_CATEGORY_PRESETS as readonly string[]).includes(m.category);
    setFormItem({
      ...m,
      granularity: itemGran,
      customCategory: m.customCategory || (isPreset ? "" : m.category),
      category: isPreset ? m.category : "Other",
      timezone: m.timezone || "Asia/Kolkata",
    });
    setDialogOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.title.trim()) return;

    const effectiveCategory =
      formItem.category === "Other" && formItem.customCategory?.trim()
        ? formItem.customCategory.trim()
        : formItem.category;

    let finalStart = formItem.startDateTime;
    let finalEnd = formItem.endDateTime;
    let computedPeriod = formItem.period;

    const itemGran = formItem.granularity || granularity || "YEAR";

    if (itemGran === "YEAR") {
      const sY = yearOnlyVal.trim() || new Date().getFullYear().toString();
      finalStart = `${sY}-01-01`;
      if (formItem.isOngoing) {
        finalEnd = undefined;
        computedPeriod = `${sY} – Present`;
      } else if (endYearOnlyVal.trim()) {
        finalEnd = `${endYearOnlyVal.trim()}-12-31`;
        computedPeriod = `${sY} – ${endYearOnlyVal.trim()}`;
      } else {
        finalEnd = undefined;
        computedPeriod = sY;
      }
    } else if (itemGran === "YEAR_MONTH") {
      finalStart = `${yearMonthVal}-01`;
      if (formItem.isOngoing) {
        finalEnd = undefined;
        computedPeriod = `${yearMonthVal} – Present`;
      } else if (endYearMonthVal.trim()) {
        finalEnd = `${endYearMonthVal.trim()}-28`;
        computedPeriod = `${yearMonthVal} – ${endYearMonthVal.trim()}`;
      } else {
        finalEnd = undefined;
        computedPeriod = yearMonthVal;
      }
    }

    const compiledItem: TimelineItem = {
      ...formItem,
      category: effectiveCategory,
      customCategory: formItem.category === "Other" ? formItem.customCategory : undefined,
      startDateTime: finalStart,
      endDateTime: finalEnd,
      period: computedPeriod,
    };

    let updated: TimelineItem[];
    if (editingItem) {
      updated = items.map((it) => (it.id === editingItem.id ? compiledItem : it));
    } else {
      updated = [...items, compiledItem];
    }

    onChange({
      items: updated,
      layout,
      granularity,
      sortDirection,
      title,
      subtitle,
    });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    onChange({ items: updated, layout, granularity, sortDirection, title, subtitle });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const clone = [...items];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    onChange({ items: clone, layout, granularity, sortDirection, title, subtitle });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Timeline Layout & Engine Configuration */}
      <div className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-3">
        {/* Layout Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Timeline Layout Mode
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {layout === "horizontal-serpentine" || layout === "horizontal"
                ? "Horizontal Z-Serpentine"
                : layout === "compact"
                ? "Compact Rail"
                : "Alternating Zig-Zag"}
            </span>
          </Label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ layout: "alternating", granularity, sortDirection, items, title, subtitle })}
              className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
                layout === "alternating"
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Alternating
            </button>
            <button
              type="button"
              onClick={() => onChange({ layout: "compact", granularity, sortDirection, items, title, subtitle })}
              className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
                layout === "compact"
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({ layout: "horizontal-serpentine", granularity, sortDirection, items, title, subtitle })
              }
              className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-all ${
                layout === "horizontal-serpentine" || layout === "horizontal"
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Serpentine
            </button>
          </div>
        </div>

        {/* Temporal Granularity & Chronological Sorting */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> Temporal Granularity
            </Label>
            <Select
              value={granularity}
              onValueChange={(val: TimelineGranularity) =>
                onChange({ granularity: val, layout, sortDirection, items, title, subtitle })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEAR">Year Only (Milestones)</SelectItem>
                <SelectItem value="YEAR_MONTH">Year & Month</SelectItem>
                <SelectItem value="DATE">Specific Date</SelectItem>
                <SelectItem value="DATE_TIME">Date & Time (Event Schedule)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-primary" /> Chronological Sort
            </Label>
            <Select
              value={sortDirection}
              onValueChange={(val: "asc" | "desc") =>
                onChange({ sortDirection: val, layout, granularity, items, title, subtitle })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First (Descending)</SelectItem>
                <SelectItem value="asc">Oldest / Schedule First (Ascending)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2. Header Title & Subtitle */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Section Title</Label>
          <Input
            value={title}
            onChange={(e) =>
              onChange({ title: e.target.value, layout, granularity, sortDirection, items, subtitle })
            }
            placeholder="e.g. Curatorial Journey & Archival Milestones"
            className="text-xs h-8 bg-background"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Description Subtitle</Label>
          <Input
            value={subtitle}
            onChange={(e) =>
              onChange({ subtitle: e.target.value, layout, granularity, sortDirection, items, title })
            }
            placeholder="e.g. Chronological trajectory of traditional Tanjore masterworks..."
            className="text-xs h-8 bg-background"
          />
        </div>
      </div>

      {/* 3. Milestones / Schedule Items List */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Timeline Items ({items.length})
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleOpenAdd}
            className="h-7 text-xs gap-1 border-primary/40 hover:border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="w-3 h-3" /> Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border rounded-lg bg-card/30">
            <p className="text-xs text-muted-foreground mb-2">No timeline items added yet.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenAdd}
              className="text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Milestone
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((m, idx) => {
              const displayDate = formatTimelineTemporalDisplay(m);
              return (
                <div
                  key={m.id || `idx-${idx}`}
                  className="p-2.5 rounded-lg border border-border/70 bg-card/60 flex items-center justify-between gap-2 hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0 bg-background/80">
                        {m.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {displayDate}
                      </span>
                      {m.isOngoing && (
                        <Badge className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-0 px-1">
                          Active
                        </Badge>
                      )}
                    </div>
                    <h5 className="font-serif font-bold text-xs text-foreground truncate mt-1">
                      {m.title || "Untitled Milestone"}
                    </h5>
                    {(m.subtitle || m.location) && (
                      <p className="text-[10px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                        {m.subtitle && <span>{m.subtitle}</span>}
                        {m.subtitle && m.location && <span>•</span>}
                        {m.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-primary/70 inline" />
                            {m.location}
                          </span>
                        )}
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
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
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
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
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
                      title="Edit Item"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Milestone Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl border-border bg-card max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveMilestone} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {editingItem ? "Edit Timeline / Schedule Item" : "Add Timeline / Schedule Item"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure temporal dates, custom categories, session schedules, and curatorial annotations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {/* Category & Custom Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3 text-primary" /> Category Preset
                  </Label>
                  <Select
                    value={formItem.category}
                    onValueChange={(val) =>
                      setFormItem({ ...formItem, category: val })
                    }
                  >
                    <SelectTrigger className="text-xs h-8 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {TIMELINE_CATEGORY_PRESETS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formItem.category === "Other" ? (
                  <div className="space-y-1">
                    <Label className="text-foreground text-primary font-semibold">
                      Custom Category Name *
                    </Label>
                    <Input
                      required
                      value={formItem.customCategory || ""}
                      onChange={(e) =>
                        setFormItem({ ...formItem, customCategory: e.target.value })
                      }
                      placeholder="e.g. Royal Court Restoration"
                      className="text-xs h-8 bg-background border-primary/50"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-foreground">Item Granularity</Label>
                    <Select
                      value={formItem.granularity || granularity}
                      onValueChange={(val: TimelineGranularity) =>
                        setFormItem({ ...formItem, granularity: val })
                      }
                    >
                      <SelectTrigger className="text-xs h-8 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YEAR">Year (Milestone)</SelectItem>
                        <SelectItem value="YEAR_MONTH">Year & Month</SelectItem>
                        <SelectItem value="DATE">Specific Date</SelectItem>
                        <SelectItem value="DATE_TIME">Date & Time Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Dynamic Temporal Inputs based on Granularity */}
              <div className="p-3 rounded-md bg-muted/40 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Temporal Range & Timing
                  </Label>
                  {(formItem.granularity === "YEAR" || formItem.granularity === "YEAR_MONTH") && (
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={formItem.isOngoing || false}
                        onChange={(e) =>
                          setFormItem({ ...formItem, isOngoing: e.target.checked })
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Present / Ongoing</span>
                    </label>
                  )}
                </div>

                {/* Mode A: YEAR */}
                {(formItem.granularity === "YEAR" || (!formItem.granularity && granularity === "YEAR")) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Start Year *</Label>
                      <Input
                        required
                        value={yearOnlyVal}
                        onChange={(e) => setYearOnlyVal(e.target.value)}
                        placeholder="e.g. 2022"
                        className="text-xs h-8 font-mono bg-background"
                      />
                    </div>
                    {!formItem.isOngoing && (
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">End Year (Optional)</Label>
                        <Input
                          value={endYearOnlyVal}
                          onChange={(e) => setEndYearOnlyVal(e.target.value)}
                          placeholder="e.g. 2026"
                          className="text-xs h-8 font-mono bg-background"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Mode B: YEAR_MONTH */}
                {formItem.granularity === "YEAR_MONTH" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Start Year & Month *</Label>
                      <Input
                        type="month"
                        required
                        value={yearMonthVal}
                        onChange={(e) => setYearMonthVal(e.target.value)}
                        className="text-xs h-8 font-mono bg-background"
                      />
                    </div>
                    {!formItem.isOngoing && (
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">End Year & Month (Optional)</Label>
                        <Input
                          type="month"
                          value={endYearMonthVal}
                          onChange={(e) => setEndYearMonthVal(e.target.value)}
                          className="text-xs h-8 font-mono bg-background"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Mode C: DATE */}
                {formItem.granularity === "DATE" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Start Date *</Label>
                      <Input
                        type="date"
                        required
                        value={formItem.startDateTime ? formItem.startDateTime.split("T")[0] : ""}
                        onChange={(e) =>
                          setFormItem({ ...formItem, startDateTime: e.target.value })
                        }
                        className="text-xs h-8 font-mono bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formItem.endDateTime ? formItem.endDateTime.split("T")[0] : ""}
                        onChange={(e) =>
                          setFormItem({ ...formItem, endDateTime: e.target.value })
                        }
                        className="text-xs h-8 font-mono bg-background"
                      />
                    </div>
                  </div>
                )}

                {/* Mode D: DATE_TIME */}
                {formItem.granularity === "DATE_TIME" && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Start Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          required
                          value={formItem.startDateTime || ""}
                          onChange={(e) =>
                            setFormItem({ ...formItem, startDateTime: e.target.value })
                          }
                          className="text-xs h-8 font-mono bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">End Date & Time (Optional)</Label>
                        <Input
                          type="datetime-local"
                          value={formItem.endDateTime || ""}
                          onChange={(e) =>
                            setFormItem({ ...formItem, endDateTime: e.target.value })
                          }
                          className="text-xs h-8 font-mono bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3 text-primary" /> Timezone
                      </Label>
                      <Select
                        value={formItem.timezone || "Asia/Kolkata"}
                        onValueChange={(tz) => setFormItem({ ...formItem, timezone: tz })}
                      >
                        <SelectTrigger className="text-xs h-8 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {COMMON_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Display Override (Optional) */}
                <div className="space-y-1 pt-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Display Override String (Optional)</span>
                    <span className="font-mono text-[9px]">Custom badge label</span>
                  </Label>
                  <Input
                    value={formItem.displayOverride || ""}
                    onChange={(e) =>
                      setFormItem({ ...formItem, displayOverride: e.target.value })
                    }
                    placeholder="e.g. Autumn 2026 | Royal Court Special"
                    className="text-xs h-7 bg-background"
                  />
                </div>
              </div>

              {/* Title / Heading */}
              <div className="space-y-1">
                <Label className="text-foreground">Title / Exhibition / Honor *</Label>
                <Input
                  required
                  value={formItem.title}
                  onChange={(e) =>
                    setFormItem({ ...formItem, title: e.target.value })
                  }
                  placeholder="e.g. Rashtriya Kala Shiromani Award / Keynote Recital"
                  className="text-xs h-8 bg-background"
                />
              </div>

              {/* Subtitle / Institution & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Subtitle / Institution / Track</Label>
                  <Input
                    value={formItem.subtitle || ""}
                    onChange={(e) =>
                      setFormItem({ ...formItem, subtitle: e.target.value })
                    }
                    placeholder="e.g. National Arts Academy / Main Auditorium"
                    className="text-xs h-8 bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground">Location (City, Country / Venue)</Label>
                  <Input
                    value={formItem.location || ""}
                    onChange={(e) =>
                      setFormItem({ ...formItem, location: e.target.value })
                    }
                    placeholder="e.g. London, UK / Bharat Bhavan"
                    className="text-xs h-8 bg-background"
                  />
                </div>
              </div>

              {/* Action Link & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-primary" /> Action URL (Optional)
                  </Label>
                  <Input
                    value={formItem.actionUrl || ""}
                    onChange={(e) =>
                      setFormItem({ ...formItem, actionUrl: e.target.value })
                    }
                    placeholder="https://... or /events/..."
                    className="text-xs h-8 bg-background font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground">Action Button Label</Label>
                  <Input
                    value={formItem.actionLabel || ""}
                    onChange={(e) =>
                      setFormItem({ ...formItem, actionLabel: e.target.value })
                    }
                    placeholder="e.g. View Catalog / Register"
                    className="text-xs h-8 bg-background"
                  />
                </div>
              </div>

              {/* Curatorial Description */}
              <div className="space-y-1">
                <Label className="text-foreground">Curatorial Description / Session Agenda</Label>
                <textarea
                  rows={3}
                  value={formItem.description}
                  onChange={(e) =>
                    setFormItem({ ...formItem, description: e.target.value })
                  }
                  placeholder="Details of works exhibited, artistic technique, session itinerary, or jury citation..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
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
                {editingItem ? "Update Item" : "Save Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
