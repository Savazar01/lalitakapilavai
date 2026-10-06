"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Box,
  Palette,
  Eye,
  Calendar,
  Users,
  Compass,
  Zap,
  Globe,
  Sliders,
  Award,
  FileText,
  Printer,
  Grid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Box,
  Palette,
  Eye,
  Calendar,
  Users,
  Compass,
  Zap,
  Globe,
  Sliders,
  Award,
  FileText,
  Printer,
  Grid,
};

// ============================================================================
// 1. DYNAMIC HERO BLOCK (100% Data-Driven, Zero Hardcoded Fallbacks)
// ============================================================================
export interface HeroBlockData {
  badge?: string;
  headline?: string;
  subtext?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}

export function HeroBlock({
  block,
  className = "",
}: {
  block: Record<string, unknown>;
  className?: string;
}) {
  const data = ((block.data || block) as Record<string, unknown>) || {};
  const badge = String(data.badge || "");
  const headline = String(data.headline || block.headline || "");
  const subtext = String(data.subtext || data.subheadline || data.description || block.subtext || "");
  const primaryCtaText = String(data.primaryCtaText || block.primaryCtaText || "");
  const primaryCtaUrl = String(data.primaryCtaUrl || block.primaryCtaUrl || "");
  const secondaryCtaText = String(data.secondaryCtaText || block.secondaryCtaText || "");
  const secondaryCtaUrl = String(data.secondaryCtaUrl || block.secondaryCtaUrl || "");

  if (!headline && !subtext && !primaryCtaText && !secondaryCtaText) {
    return null;
  }

  return (
    <div className={cn("w-full py-8 md:py-12", className)}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        {/* Dynamic Badge */}
        {badge ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/25 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        ) : null}

        {/* Dynamic Headline */}
        {headline ? (
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight leading-[1.12]">
            {headline}
          </h1>
        ) : null}

        {/* Dynamic Subtext */}
        {subtext ? (
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-normal">
            {subtext}
          </p>
        ) : null}

        {/* Dynamic Dual CTA Buttons */}
        {(primaryCtaText || secondaryCtaText) ? (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {primaryCtaText && primaryCtaUrl ? (
              <Link
                href={primaryCtaUrl}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}

            {secondaryCtaText && secondaryCtaUrl ? (
              <Link
                href={secondaryCtaUrl}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-background text-foreground hover:bg-accent border border-border hover:border-primary/40 shadow-xs transition-all cursor-pointer"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

// ============================================================================
// 2. DYNAMIC METRIC GRID BLOCK (100% Data-Driven)
// ============================================================================
export interface MetricItem {
  value?: string;
  label?: string;
  change?: string;
  description?: string;
}

export function MetricGridBlock({
  block,
  className = "",
}: {
  block: Record<string, unknown>;
  className?: string;
}) {
  const data = ((block.data || block) as Record<string, unknown>) || {};
  const metrics = (
    Array.isArray(data.metrics)
      ? data.metrics
      : Array.isArray(block.metrics)
      ? block.metrics
      : Array.isArray(block.data)
      ? block.data
      : []
  ) as MetricItem[];

  if (!metrics || metrics.length === 0) {
    return null;
  }

  const gridColsClass =
    metrics.length === 1
      ? "grid-cols-1 max-w-sm"
      : metrics.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
      : metrics.length === 3
      ? "grid-cols-1 sm:grid-cols-3 max-w-4xl"
      : "grid-cols-2 lg:grid-cols-4 max-w-6xl";

  return (
    <div className={cn("w-full py-4", className)}>
      <div className={cn("grid gap-4 sm:gap-6 mx-auto", gridColsClass)}>
        {metrics.map((metric, idx) => {
          if (!metric.value && !metric.label) return null;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all text-center flex flex-col justify-center items-center"
            >
              {metric.value ? (
                <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary tracking-tight">
                  {metric.value}
                </span>
              ) : null}

              {metric.label ? (
                <span className="text-xs sm:text-sm font-medium text-foreground uppercase tracking-wider mt-2">
                  {metric.label}
                </span>
              ) : null}

              {metric.change ? (
                <span className="text-[10px] font-mono text-muted-foreground mt-1 px-2 py-0.5 rounded bg-muted/60">
                  {metric.change}
                </span>
              ) : metric.description ? (
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  {metric.description}
                </p>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 3. DYNAMIC TABBED FEATURE BLOCK (100% Data-Driven)
// ============================================================================
export interface PersonaTabItem {
  id?: string;
  label?: string;
  title?: string;
  copy?: string;
  description?: string;
  badge?: string;
  bulletPoints?: string[];
}

export function TabbedFeatureBlock({
  block,
  className = "",
}: {
  block: Record<string, unknown>;
  className?: string;
}) {
  const data = ((block.data || block) as Record<string, unknown>) || {};
  const tabs = (
    Array.isArray(data.tabs)
      ? data.tabs
      : Array.isArray(block.tabs)
      ? block.tabs
      : Array.isArray(block.data)
      ? block.data
      : []
  ) as PersonaTabItem[];

  const [activeIdx, setActiveIdx] = React.useState(0);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTab = tabs[activeIdx] || tabs[0];
  const tabCopy = activeTab?.copy || activeTab?.description || "";

  return (
    <div className={cn("w-full py-4 space-y-6 max-w-5xl mx-auto", className)}>
      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/80">
        {tabs.map((tab, idx) => {
          const isActive = activeIdx === idx;
          const label = tab.label || tab.title || `Workflow ${idx + 1}`;

          return (
            <button
              type="button"
              key={tab.id || idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-medium transition-all cursor-pointer flex items-center gap-2",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              )}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab.id || activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-md space-y-4 text-left"
          >
            {activeTab.badge ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <span>{activeTab.badge}</span>
              </div>
            ) : null}

            {activeTab.title ? (
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                {activeTab.title}
              </h3>
            ) : null}

            {tabCopy ? (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                {tabCopy}
              </p>
            ) : null}

            {Array.isArray(activeTab.bulletPoints) && activeTab.bulletPoints.length > 0 ? (
              <ul className="pt-2 space-y-2">
                {activeTab.bulletPoints.map((bp, bpIdx) => (
                  <li key={bpIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 4. DYNAMIC FEATURE GRID BLOCK (100% Data-Driven)
// ============================================================================
export interface FeatureGridItem {
  title?: string;
  description?: string;
  badge?: string;
  iconName?: string;
}

export function FeatureGridBlock({
  block,
  className = "",
}: {
  block: Record<string, unknown>;
  className?: string;
}) {
  const data = ((block.data || block) as Record<string, unknown>) || {};
  const features = (
    Array.isArray(data.features)
      ? data.features
      : Array.isArray(block.features)
      ? block.features
      : Array.isArray(block.data)
      ? block.data
      : []
  ) as FeatureGridItem[];

  if (!features || features.length === 0) {
    return null;
  }

  const requestedCols = typeof data.columns === "number" ? data.columns : features.length;
  const gridClass =
    requestedCols >= 4 || features.length >= 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : requestedCols === 2 || features.length === 2
      ? "grid-cols-1 md:grid-cols-2 max-w-4xl"
      : "grid-cols-1 md:grid-cols-3 max-w-6xl";

  return (
    <div className={cn("w-full py-4", className)}>
      <div className={cn("grid gap-5 sm:gap-6 mx-auto", gridClass)}>
        {features.map((feat, idx) => {
          if (!feat.title && !feat.description) return null;

          const IconComponent = feat.iconName && ICON_MAP[feat.iconName] ? ICON_MAP[feat.iconName] : null;

          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {IconComponent ? (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  ) : (
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  )}

                  {feat.badge ? (
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {feat.badge}
                    </span>
                  ) : null}
                </div>

                {feat.title ? (
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                ) : null}

                {feat.description ? (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. DYNAMIC ACCORDION BLOCK (100% Data-Driven)
// ============================================================================
export interface AccordionBlockItem {
  title?: string;
  description?: string;
  content?: string;
  badge?: string;
}

export function AccordionBlock({
  block,
  className = "",
}: {
  block: Record<string, unknown>;
  className?: string;
}) {
  const data = ((block.data || block) as Record<string, unknown>) || {};
  const items = (
    Array.isArray(data.items)
      ? data.items
      : Array.isArray(block.items)
      ? block.items
      : Array.isArray(block.data)
      ? block.data
      : []
  ) as AccordionBlockItem[];

  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full py-4 max-w-4xl mx-auto space-y-3", className)}>
      {items.map((item, idx) => {
        if (!item.title && !item.description && !item.content) return null;

        const isOpen = openIdx === idx;
        const itemBody = item.description || item.content || "";

        return (
          <div
            key={idx}
            className="rounded-2xl bg-card border border-border overflow-hidden transition-colors shadow-xs"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif font-semibold text-base sm:text-lg text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{item.title}</span>
                {item.badge ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0",
                  isOpen ? "rotate-180 text-primary" : ""
                )}
              />
            </button>

            <AnimatePresence>
              {isOpen && itemBody && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {itemBody}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
