"use client";

import * as React from "react";
import { Sparkles, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config";

export interface EditablePageHeaderProps {
  sectionKey: string;
  defaultTitle: string;
  defaultSubtitle: string;
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EditablePageHeader({
  sectionKey,
  defaultTitle,
  defaultSubtitle,
  badgeLabel,
  badgeIcon,
  children,
  className = "",
}: EditablePageHeaderProps) {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  const fallback = DEFAULT_ADMIN_CONFIG.pageHeadings[sectionKey] || {
    title: defaultTitle,
    subtitle: defaultSubtitle,
    badge: badgeLabel,
  };

  const [title, setTitle] = React.useState(fallback.title || defaultTitle);
  const [subtitle, setSubtitle] = React.useState(fallback.subtitle || defaultSubtitle);
  const [badge, setBadge] = React.useState(fallback.badge || badgeLabel);

  // Edit Mode State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(title);
  const [editSubtitle, setEditSubtitle] = React.useState(subtitle);
  const [editBadge, setEditBadge] = React.useState(badge || "");
  const [saving, setSaving] = React.useState(false);

  // Fetch persisted config on mount
  React.useEffect(() => {
    fetch("/api/admin/settings/copy")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pageHeadings?.[sectionKey]) {
          const h = data.pageHeadings[sectionKey];
          if (h.title) setTitle(h.title);
          if (h.subtitle) setSubtitle(h.subtitle);
          if (h.badge !== undefined) setBadge(h.badge);
        }
      })
      .catch(() => {});
  }, [sectionKey]);

  const handleStartEdit = () => {
    setEditTitle(title);
    setEditSubtitle(subtitle);
    setEditBadge(badge || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditSubtitle(subtitle);
    setEditBadge(badge || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setSaving(true);
    const prevTitle = title;
    const prevSubtitle = subtitle;
    const prevBadge = badge;

    // Optimistic update
    setTitle(editTitle.trim());
    setSubtitle(editSubtitle.trim());
    setBadge(editBadge.trim());
    setIsEditing(false);

    try {
      const res = await fetch("/api/admin/settings/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          heading: {
            badge: editBadge.trim(),
            title: editTitle.trim(),
            subtitle: editSubtitle.trim(),
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes");
      }

      window.dispatchEvent(new CustomEvent("adminConfigUpdated"));
      toast.success("Page heading and badge updated successfully");
    } catch {
      setTitle(prevTitle);
      setSubtitle(prevSubtitle);
      setBadge(prevBadge);
      toast.error("Failed to update heading");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 pb-5 ${className}`}
    >
      <div className="flex-1 min-w-0 flex flex-col items-start gap-1 text-left w-full">
        {/* 1. TOP: Eyebrow Tag / Badge */}
        {badge && (
          <div
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-0.5 px-2.5 py-0.5 rounded-full border transition-all"
            style={{
              backgroundColor: "var(--badge-bg, rgba(254, 243, 199, 0.6))",
              color: "var(--badge-text, #78350F)",
              borderColor: "var(--badge-border, #FCD34D)",
            }}
          >
            {badgeIcon || <Sparkles className="w-3 h-3 shrink-0" />}
            <span>{badge}</span>
          </div>
        )}

        {isEditing ? (
          <div className="w-full space-y-3 p-3.5 rounded-lg border border-border bg-card shadow-sm max-w-2xl mt-1 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Eyebrow Badge / Tag
              </label>
              <Input
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
                placeholder="e.g. Navigation Architecture"
                className="text-xs h-9 border-border focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Page Title
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Navigation Menus"
                className="text-xs h-9 border-border focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Description / Subtitle
              </label>
              <Textarea
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                placeholder="Brief summary of section function..."
                rows={2}
                className="text-xs border-border focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="gap-1 h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative flex flex-col items-start w-full text-left">
            {/* 2. MIDDLE: Main Section Title */}
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                {title}
              </h1>

              {/* In-place edit trigger visible to Super Admins */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                  title="Edit eyebrow badge, title, and description"
                  aria-label="Edit page heading"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3. BOTTOM: Subtitle / Description */}
            <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium mt-1 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Header Actions / Buttons */}
      {children && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {children}
        </div>
      )}
    </div>
  );
}
