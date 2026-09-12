"use client";

import * as React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export interface ViewportSwitcherProps {
  mode: ViewportMode;
  onChange: (mode: ViewportMode) => void;
}

export function ViewportSwitcher({ mode, onChange }: ViewportSwitcherProps) {
  const viewports: { mode: ViewportMode; label: string; icon: React.ComponentType<{ className?: string }>; width: string }[] = [
    { mode: "desktop", label: "Desktop", icon: Monitor, width: "1440px" },
    { mode: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
    { mode: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card/80 backdrop-blur-md">
      {viewports.map((item) => {
        const Icon = item.icon;
        const isActive = mode === item.mode;
        return (
          <Button
            key={item.mode}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onChange(item.mode)}
            className={`h-8 px-2.5 text-xs gap-1.5 cursor-pointer font-medium ${
              isActive
                ? "bg-amber-500/15 text-amber-900 border border-amber-600/40 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/40 font-bold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        );
      })}
      <Badge variant="outline" className="text-[10px] ml-1 font-mono">
        {mode === "desktop" ? "1440px" : mode === "tablet" ? "768px" : "375px"}
      </Badge>
    </div>
  );
}
