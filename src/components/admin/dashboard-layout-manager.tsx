"use client";

import * as React from "react";
import Link from "next/link";
import {
  Palette,
  Calendar,
  Users,
  Music,
  Sparkles,
  BookOpen,
  Database,
  BarChart3,
  Settings,
  Shield,
  Award,
  Layers,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface DashboardWidgetData {
  id: string;
  title: string;
  description?: string | null;
  widgetType: string;
  metricValue?: string | null;
  metricSub?: string | null;
  targetUrl?: string | null;
  iconName?: string | null;
  order: number;
  isArchived: boolean;
  computedMetric?: string;
  computedSub?: string;
}

const iconRegistry: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Calendar,
  Users,
  Music,
  Sparkles,
  BookOpen,
  Database,
  BarChart3,
  Settings,
  Shield,
  Award,
  Layers,
  ExternalLink,
};

export function DashboardLayoutManager({
  initialWidgets,
}: {
  initialWidgets: DashboardWidgetData[];
}) {
  const [widgets, setWidgets] = React.useState<DashboardWidgetData[]>(initialWidgets);
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingWidget, setEditingWidget] = React.useState<DashboardWidgetData | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    widgetType: "STAT_CARD",
    metricValue: "",
    metricSub: "",
    targetUrl: "",
    iconName: "Palette",
  });

  const fetchWidgets = async () => {
    try {
      const res = await fetch("/api/admin/widgets");
      if (res.ok) {
        const data = await res.json();
        setWidgets(data);
      }
    } catch {
      toast.error("Failed to load dashboard widgets");
    }
  };

  const handleOpenAdd = () => {
    setEditingWidget(null);
    setFormData({
      title: "",
      description: "",
      widgetType: "STAT_CARD",
      metricValue: "",
      metricSub: "",
      targetUrl: "/admin",
      iconName: "Sparkles",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (w: DashboardWidgetData) => {
    setEditingWidget(w);
    setFormData({
      title: w.title,
      description: w.description || "",
      widgetType: w.widgetType,
      metricValue: w.metricValue || "",
      metricSub: w.metricSub || "",
      targetUrl: w.targetUrl || "",
      iconName: w.iconName || "Palette",
    });
    setDialogOpen(true);
  };

  const handleSaveWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Widget title is required");
      return;
    }

    try {
      if (editingWidget) {
        const res = await fetch(`/api/admin/widgets/${editingWidget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update widget");
        toast.success("Widget updated successfully");
      } else {
        const res = await fetch("/api/admin/widgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create widget");
        toast.success("New widget tile added");
      }
      setDialogOpen(false);
      fetchWidgets();
    } catch {
      toast.error("Error saving widget");
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm("Are you sure you want to remove this widget from your dashboard?")) return;

    try {
      const res = await fetch(`/api/admin/widgets/${id}?hard=true`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Widget removed");
      setWidgets((prev) => prev.filter((w) => w.id !== id));
    } catch {
      toast.error("Failed to delete widget");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const newWidgets = [...widgets];
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    // Recalculate order indices
    const updatedWithOrder = newWidgets.map((w, idx) => ({
      ...w,
      order: idx + 1,
    }));

    setWidgets(updatedWithOrder);

    try {
      await fetch("/api/admin/widgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedWithOrder.map((w) => ({ id: w.id, order: w.order })),
        }),
      });
    } catch {
      toast.error("Failed to persist widget order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card/60">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {widgets.length} Active Tiles
          </Badge>
          {isCustomizing && (
            <span className="text-xs font-semibold text-primary animate-pulse">
              ● Customization Mode Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCustomizing && (
            <Button size="sm" variant="outline" onClick={handleOpenAdd} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Custom Tile
            </Button>
          )}

          <Button
            size="sm"
            variant={isCustomizing ? "default" : "outline"}
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-xs"
          >
            {isCustomizing ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Done Customizing
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                Customize Dashboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, idx) => {
          const IconComponent =
            iconRegistry[widget.iconName || "Sparkles"] || Sparkles;

          // Special System Status Widget Render
          if (widget.widgetType === "SYSTEM_STATUS") {
            return (
              <Card
                key={widget.id}
                className={`sm:col-span-2 relative transition-all ${
                  isCustomizing ? "ring-2 ring-primary/40 border-primary" : "hover:border-primary/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
                    <Badge variant="gold" className="text-[10px]">
                      Operational
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {widget.description || "Live container and infrastructure status"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Database Port:</span>
                      <span className="font-mono font-semibold text-foreground">5633 (Mapped to 5432)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Vector Extension:</span>
                      <span className="font-mono font-semibold text-emerald-500">pgvector 0.8.2 Active</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Web Platform:</span>
                      <span className="font-mono font-semibold text-foreground">Port 3060 (Next.js 16)</span>
                    </div>
                  </div>
                </CardContent>

                {isCustomizing && (
                  <div className="p-2 border-t border-border/60 bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === widgets.length - 1}
                        onClick={() => handleMove(idx, "down")}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(widget)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteWidget(widget.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          }

          // Special Quick Links Widget Render
          if (widget.widgetType === "QUICK_LINK") {
            return (
              <Card
                key={widget.id}
                className={`sm:col-span-2 relative transition-all ${
                  isCustomizing ? "ring-2 ring-primary/40 border-primary" : "hover:border-primary/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <CardDescription className="text-xs">
                    {widget.description || "Direct access to management operations"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <Link
                    href={widget.targetUrl || "/admin/artworks"}
                    className="flex items-center justify-between p-2.5 rounded-md bg-secondary/50 hover:bg-secondary border border-border/60 transition-colors"
                  >
                    <span>{widget.metricSub || "Manage Core Archive Catalog"}</span>
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </Link>
                </CardContent>

                {isCustomizing && (
                  <div className="p-2 border-t border-border/60 bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === widgets.length - 1}
                        onClick={() => handleMove(idx, "down")}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(widget)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteWidget(widget.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          }

          // Standard STAT_CARD Render
          const cardContent = (
            <Card
              className={`h-full flex flex-col justify-between transition-all ${
                isCustomizing ? "ring-2 ring-primary/40 border-primary" : "hover:border-primary/60 hover:shadow-md cursor-pointer"
              }`}
            >
              <div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground truncate pr-2">
                    {widget.title}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">
                    {widget.computedMetric || widget.metricValue || "0"}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="truncate mr-2">
                      {widget.computedSub || widget.metricSub || widget.description || ""}
                    </span>
                    {widget.targetUrl && (
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        View
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </div>

              {isCustomizing && (
                <div className="p-2 border-t border-border/60 bg-muted/40 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMove(idx, "up");
                      }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={idx === widgets.length - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMove(idx, "down");
                      }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenEdit(widget);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteWidget(widget.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );

          if (!isCustomizing && widget.targetUrl) {
            return (
              <Link key={widget.id} href={widget.targetUrl} className="block">
                {cardContent}
              </Link>
            );
          }

          return <div key={widget.id}>{cardContent}</div>;
        })}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editingWidget ? "Edit Dashboard Tile" : "Add Custom Dashboard Tile"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure tile metrics, links, and styling for your administrative overview.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWidget} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tile Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Blog Chronicles, VIP Inquiries"
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tile Type</Label>
                <Select
                  value={formData.widgetType}
                  onValueChange={(val) => setFormData({ ...formData, widgetType: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAT_CARD">Stat Metric Card</SelectItem>
                    <SelectItem value="QUICK_LINK">Quick Action Link</SelectItem>
                    <SelectItem value="SYSTEM_STATUS">System Status Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Icon</Label>
                <Select
                  value={formData.iconName}
                  onValueChange={(val) => setFormData({ ...formData, iconName: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconRegistry).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.widgetType === "STAT_CARD" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Metric Value (Optional)</Label>
                  <Input
                    value={formData.metricValue}
                    onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                    placeholder="e.g., 24, Live, ₹1.5L"
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to auto-evaluate if linked to core resources.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Sub-label</Label>
                  <Input
                    value={formData.metricSub}
                    onChange={(e) => setFormData({ ...formData, metricSub: e.target.value })}
                    placeholder="e.g., In the last 30 days"
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target URL (On Click)</Label>
              <Input
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="e.g., /admin/artworks, /admin/blogs"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary for this tile"
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingWidget ? "Save Changes" : "Create Tile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
