"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Check,
  FolderOpen,
  UploadCloud,
} from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { UniversalMediaDialog } from "@/components/admin/universal-media-dialog";
import { STANDARD_RIBBON_PATTERNS } from "@/lib/catalog-ribbon-patterns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpineDecoratorSlot } from "@/types/catalog";

export interface SinglePlateConfigState {
  primaryImageUrl?: string;
  presentation?: "contained" | "full-bleed";
  mattingBgColor?: string;
  outerBorderColor?: string;
  innerBorderColor?: string;
  borderWidth?: number;
  focalPosition?: string;
  headerSlot?: SpineDecoratorSlot;
  footerSlot?: SpineDecoratorSlot;
  leftSpineSlot?: SpineDecoratorSlot;
  rightSpineSlot?: SpineDecoratorSlot;
}

interface CatalogSinglePlateEditorProps {
  config: SinglePlateConfigState;
  onChange: (updated: Partial<SinglePlateConfigState>) => void;
  sectionLabel?: string;
  isUniversalSyncActive?: boolean;
}

const MATTING_PRESETS = [
  { name: "Warm Parchment", hex: "#FAF7F2" },
  { name: "Deep Obsidian", hex: "#0B0F17" },
  { name: "Antique Raw Silk", hex: "#F4EFEA" },
  { name: "Sacred Teak", hex: "#1C130D" },
  { name: "Imperial Charcoal", hex: "#151B26" },
  { name: "Temple Terracotta", hex: "#2A1810" },
];

export function CatalogSinglePlateEditor({
  config,
  onChange,
  sectionLabel = "Page",
  isUniversalSyncActive = false,
}: CatalogSinglePlateEditorProps) {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [activeSlotTab, setActiveSlotTab] = useState<"header" | "footer" | "left" | "right">("header");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [targetSlotForMedia, setTargetSlotForMedia] = useState<
    "headerSlot" | "footerSlot" | "leftSpineSlot" | "rightSpineSlot"
  >("headerSlot");

  const presentation = config.presentation || "contained";
  const mattingBgColor = config.mattingBgColor || "#FAF7F2";
  const focalPosition = config.focalPosition || "center center";

  const headerSlot: SpineDecoratorSlot = config.headerSlot || { visible: false, heightPx: 44, bgColor: "transparent", textColor: "#D4AF37" };
  const footerSlot: SpineDecoratorSlot = config.footerSlot || { visible: false, heightPx: 44, bgColor: "transparent", textColor: "#D4AF37" };
  const leftSpineSlot: SpineDecoratorSlot = config.leftSpineSlot || { visible: false, widthPx: 48, bgColor: "transparent", textColor: "#D4AF37" };
  const rightSpineSlot: SpineDecoratorSlot = config.rightSpineSlot || { visible: false, widthPx: 48, bgColor: "transparent", textColor: "#D4AF37" };

  const updateSlot = (
    slotName: "headerSlot" | "footerSlot" | "leftSpineSlot" | "rightSpineSlot",
    upd: Partial<SpineDecoratorSlot>
  ) => {
    const current = config[slotName] || {};
    onChange({
      [slotName]: {
        ...current,
        ...upd,
      },
    });
  };

  const activeSlot =
    activeSlotTab === "header"
      ? headerSlot
      : activeSlotTab === "footer"
      ? footerSlot
      : activeSlotTab === "left"
      ? leftSpineSlot
      : rightSpineSlot;

  const activeSlotKey: "headerSlot" | "footerSlot" | "leftSpineSlot" | "rightSpineSlot" =
    activeSlotTab === "header"
      ? "headerSlot"
      : activeSlotTab === "footer"
      ? "footerSlot"
      : activeSlotTab === "left"
      ? "leftSpineSlot"
      : "rightSpineSlot";

  return (
    <div className="space-y-4">
      {/* 1. Primary Plate Media Uploader */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-primary" /> {sectionLabel} Primary Image Plate *
        </label>
        <MediaUploader
          value={config.primaryImageUrl || ""}
          onUploadComplete={(url) => onChange({ primaryImageUrl: url })}
          onRemove={() => onChange({ primaryImageUrl: "" })}
          mediaType="general"
          description={`High-resolution visual representing the principal artwork or feature visual for this ${sectionLabel.toLowerCase()}.`}
        />
      </div>

      {/* 2. Plate Presentation & Matting Controls */}
      <div className="p-4 rounded-xl border border-border/80 bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div>
            <label className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> Plate Presentation Mode
            </label>
            <p className="text-[11px] text-muted-foreground">
              Choose between an edge-to-edge full bleed display or a framed plate with custom matting margins.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
            <button
              type="button"
              onClick={() => onChange({ presentation: "contained" })}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                presentation === "contained"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Contained with Matting
            </button>
            <button
              type="button"
              onClick={() => onChange({ presentation: "full-bleed" })}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                presentation === "full-bleed"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Bleed (Fill Canvas)
            </button>
          </div>
        </div>

        {/* Matting Canvas Background Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" /> Matting Canvas Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mattingBgColor}
                onChange={(e) => onChange({ mattingBgColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
              />
              <Input
                value={mattingBgColor}
                onChange={(e) => onChange({ mattingBgColor: e.target.value })}
                placeholder="#FAF7F2"
                className="text-xs font-mono"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {MATTING_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => onChange({ mattingBgColor: preset.hex })}
                  className="px-1.5 py-0.5 text-[9px] rounded border border-border/80 bg-background hover:bg-muted font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  title={preset.name}
                >
                  <span
                    className="w-2 h-2 rounded-full border border-black/20"
                    style={{ backgroundColor: preset.hex }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Focal Position for Full Bleed */}
          {presentation === "full-bleed" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Focal Alignment Position</label>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: "Center", value: "center center" },
                  { label: "Top", value: "center top" },
                  { label: "Bottom", value: "center bottom" },
                  { label: "Left", value: "left center" },
                  { label: "Right", value: "right center" },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => onChange({ focalPosition: pos.value })}
                    className={`px-2 py-1 rounded text-[11px] border font-mono transition-all cursor-pointer ${
                      focalPosition === pos.value
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "border-border/80 bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Framing Fillet &amp; Matting Margins</label>
                {isUniversalSyncActive && (
                  <Badge variant="outline" className="text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                    🔗 Universal Frame Active
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isUniversalSyncActive
                  ? "This section automatically inherits master matting margins and ornamental fillets configured on the Cover Page."
                  : "Matting margins and inner gold fillet borders frame the artwork cleanly on the physical sheet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Expandable Accordion: Spine & Margin Embellishments */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setAccordionOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <div>
              <h4 className="text-xs font-serif font-bold text-foreground flex items-center gap-2">
                Spine &amp; Margin Embellishments
                {(headerSlot.visible || footerSlot.visible || leftSpineSlot.visible || rightSpineSlot.visible) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Top Header, Bottom Footer, Left Spine, and Right Spine ribbons for titles, invocations, patterns, and publisher credits.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {[
                headerSlot.visible && "Top",
                footerSlot.visible && "Bottom",
                leftSpineSlot.visible && "Left",
                rightSpineSlot.visible && "Right",
              ].filter(Boolean).length || 0}{" "}
              Active
            </Badge>
            {accordionOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {accordionOpen && (
          <div className="p-4 border-t border-primary/20 bg-card space-y-4">
            {/* Slot Tab Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-lg bg-muted/60 border border-border/60">
              <button
                type="button"
                onClick={() => setActiveSlotTab("header")}
                className={`py-1.5 px-2 text-xs rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSlotTab === "header"
                    ? "bg-card text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PanelTop className="w-3.5 h-3.5 text-primary" />
                <span>Top Header</span>
                {headerSlot.visible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveSlotTab("footer")}
                className={`py-1.5 px-2 text-xs rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSlotTab === "footer"
                    ? "bg-card text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PanelBottom className="w-3.5 h-3.5 text-primary" />
                <span>Bottom Footer</span>
                {footerSlot.visible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveSlotTab("left")}
                className={`py-1.5 px-2 text-xs rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSlotTab === "left"
                    ? "bg-card text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5 text-primary" />
                <span>Left Spine</span>
                {leftSpineSlot.visible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveSlotTab("right")}
                className={`py-1.5 px-2 text-xs rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSlotTab === "right"
                    ? "bg-card text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PanelRight className="w-3.5 h-3.5 text-primary" />
                <span>Right Spine</span>
                {rightSpineSlot.visible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            </div>

            {/* Active Slot Configuration Form */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/15 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-foreground capitalize">
                    {activeSlotTab} Embellishment Configuration
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <span>Show Slot:</span>
                  <input
                    type="checkbox"
                    checked={activeSlot.visible ?? false}
                    onChange={(e) => updateSlot(activeSlotKey, { visible: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
              </div>

              {activeSlot.visible && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        {activeSlotTab === "left" || activeSlotTab === "right"
                          ? "Vertical Spine Text"
                          : "Header / Footer Banner Text"}
                      </label>
                      <Input
                        value={activeSlot.text || ""}
                        onChange={(e) => updateSlot(activeSlotKey, { text: e.target.value })}
                        placeholder={
                          activeSlotTab === "left" || activeSlotTab === "right"
                            ? "e.g. THAṄJAVUR ARCHIVAL FOLIO • 22K GOLD"
                            : "e.g. ॐ SHREE MAHALAKSHMI ATELIER COLLECTION • MONOGRAPH"
                        }
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        {activeSlotTab === "left" || activeSlotTab === "right"
                          ? "Spine Width (px)"
                          : "Ribbon Height (px)"}
                      </label>
                      <Input
                        type="number"
                        value={
                          activeSlotTab === "left" || activeSlotTab === "right"
                            ? activeSlot.widthPx ?? 48
                            : activeSlot.heightPx ?? 44
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 40;
                          if (activeSlotTab === "left" || activeSlotTab === "right") {
                            updateSlot(activeSlotKey, { widthPx: val });
                          } else {
                            updateSlot(activeSlotKey, { heightPx: val });
                          }
                        }}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeSlot.textColor?.startsWith("#") ? activeSlot.textColor : "#D4AF37"}
                          onChange={(e) => updateSlot(activeSlotKey, { textColor: e.target.value })}
                          className="w-7 h-7 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <Input
                          value={activeSlot.textColor || ""}
                          onChange={(e) => updateSlot(activeSlotKey, { textColor: e.target.value })}
                          placeholder="#D4AF37"
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeSlot.bgColor?.startsWith("#") ? activeSlot.bgColor : "#1C1814"}
                          onChange={(e) => updateSlot(activeSlotKey, { bgColor: e.target.value })}
                          className="w-7 h-7 rounded border border-border cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <Input
                          value={activeSlot.bgColor || ""}
                          onChange={(e) => updateSlot(activeSlotKey, { bgColor: e.target.value })}
                          placeholder="#1C1814 or transparent"
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Ribbon Image & Border Pattern Picker */}
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          Decorative Ribbon Image &amp; Border Pattern
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          Choose a classical 22k gold zari pattern preset, pick from your Media Library, or upload a custom ribbon image.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetSlotForMedia(activeSlotKey);
                            setMediaDialogOpen(true);
                          }}
                          className="h-7 text-xs gap-1.5 border-primary/40 hover:border-primary text-foreground cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-primary" />
                          <span>Media Library &amp; Upload</span>
                        </Button>
                        {activeSlot.imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateSlot(activeSlotKey, {
                                imageUrl: "",
                                patternId: undefined,
                              })
                            }
                            className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Standard Presets Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Standard Classical Indian Ribbon Presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STANDARD_RIBBON_PATTERNS.map((pat) => {
                          const isSelected =
                            activeSlot.patternId === pat.id || activeSlot.imageUrl === pat.svgDataUri;
                          return (
                            <button
                              key={pat.id}
                              type="button"
                              onClick={() =>
                                updateSlot(activeSlotKey, {
                                  imageUrl: pat.svgDataUri,
                                  patternId: pat.id,
                                  imageMode: "repeat-pattern",
                                })
                              }
                              className={cn(
                                "group relative flex flex-col items-stretch p-2 rounded-lg border text-left transition-all cursor-pointer overflow-hidden",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                                  : "border-border/70 bg-card hover:bg-muted/50 hover:border-border"
                              )}
                              title={pat.description}
                            >
                              {/* SVG Pattern Strip Preview */}
                              <div
                                className="w-full h-6 rounded border border-border/50 mb-1.5 overflow-hidden"
                                style={{
                                  backgroundImage: `url("${pat.svgDataUri}")`,
                                  backgroundRepeat: "repeat-x",
                                  backgroundColor: activeSlot.bgColor?.startsWith("#") ? activeSlot.bgColor : "#1C1814",
                                }}
                              />
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-medium text-foreground truncate">
                                  {pat.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                              </div>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                {pat.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Ribbon Image Preview & Mode Controls */}
                    {activeSlot.imageUrl && (
                      <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-foreground flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3 text-primary" /> Active Ribbon Graphic:
                          </span>
                          <Badge variant="outline" className="text-[9px] font-mono">
                            {activeSlot.patternId ? "Preset Pattern" : "Custom Media"}
                          </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {/* Ribbon Mini Preview Bar */}
                          <div
                            className="flex-1 h-8 rounded-md border border-primary/30 relative overflow-hidden flex items-center justify-center"
                            style={{
                              backgroundColor: activeSlot.bgColor?.startsWith("#") ? activeSlot.bgColor : "#1C1814",
                              backgroundImage:
                                activeSlot.imageMode === "contain-center"
                                  ? undefined
                                  : `url("${activeSlot.imageUrl}")`,
                              backgroundRepeat:
                                activeSlotTab === "left" || activeSlotTab === "right"
                                  ? "repeat-y"
                                  : "repeat-x",
                              backgroundSize: activeSlot.imageMode === "cover" ? "cover" : "auto",
                            }}
                          >
                            {activeSlot.imageMode === "contain-center" && (
                              <img
                                src={activeSlot.imageUrl}
                                alt="Ribbon preview"
                                className="max-h-full object-contain"
                              />
                            )}
                            {activeSlot.text && (
                              <span
                                className="relative z-10 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase bg-black/60 rounded backdrop-blur-xs"
                                style={{ color: activeSlot.textColor || "#D4AF37" }}
                              >
                                {activeSlot.text}
                              </span>
                            )}
                          </div>

                          {/* Display Mode Switcher */}
                          <div className="flex items-center gap-1 bg-muted/80 p-0.5 rounded-lg border border-border/50 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateSlot(activeSlotKey, { imageMode: "repeat-pattern" })}
                              className={cn(
                                "px-2 py-1 text-[10px] rounded font-medium transition-all cursor-pointer",
                                (activeSlot.imageMode === "repeat-pattern" || !activeSlot.imageMode)
                                  ? "bg-card text-foreground shadow-xs font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Repeat Ribbon
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSlot(activeSlotKey, { imageMode: "contain-center" })}
                              className={cn(
                                "px-2 py-1 text-[10px] rounded font-medium transition-all cursor-pointer",
                                activeSlot.imageMode === "contain-center"
                                  ? "bg-card text-foreground shadow-xs font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Contained Crest
                            </button>
                          </div>
                        </div>

                        {/* Manual URL input fallback / edit */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-mono text-muted-foreground">
                            Image / Pattern Source URL:
                          </label>
                          <Input
                            value={activeSlot.imageUrl || ""}
                            onChange={(e) =>
                              updateSlot(activeSlotKey, {
                                imageUrl: e.target.value,
                                patternId: undefined,
                              })
                            }
                            placeholder="https://... / pattern SVG or gold leaf frieze banner"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {!activeSlot.imageUrl && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-muted-foreground">
                          Direct Image URL (Optional):
                        </label>
                        <Input
                          value={activeSlot.imageUrl || ""}
                          onChange={(e) =>
                            updateSlot(activeSlotKey, {
                              imageUrl: e.target.value,
                              patternId: undefined,
                            })
                          }
                          placeholder="https://... or select from presets/media library above"
                          className="text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Universal Media Dialog for Ribbon & Embellishment selection */}
      <UniversalMediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelect={(media) => {
          updateSlot(targetSlotForMedia, {
            imageUrl: media.url,
            patternId: undefined,
            imageMode: activeSlot.imageMode || "repeat-pattern",
          });
          setMediaDialogOpen(false);
        }}
        title={`Select Ribbon / Embellishment Image for ${
          targetSlotForMedia === "headerSlot"
            ? "Top Header"
            : targetSlotForMedia === "footerSlot"
            ? "Bottom Footer"
            : targetSlotForMedia === "leftSpineSlot"
            ? "Left Spine"
            : "Right Spine"
        }`}
        acceptedTypes="image"
      />
    </div>
  );
}

export function EditorialModeSwitcher({
  mode,
  onChange,
  label,
}: {
  mode: "SINGLE_PLATE" | "WYSIWYG" | "MATRIX";
  onChange: (mode: "SINGLE_PLATE" | "WYSIWYG" | "MATRIX") => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/80 bg-muted/20">
      <div>
        <label className="text-xs font-serif font-bold text-foreground">
          {label || "Editorial Page Presentation Mode"}
        </label>
        <p className="text-[11px] text-muted-foreground">
          Select between an Archival Single Image Plate, Bespoke WYSIWYG Editor, or Modular Matrix Studio.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60 shrink-0">
        <button
          type="button"
          onClick={() => onChange("SINGLE_PLATE")}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "SINGLE_PLATE"
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Single Image Plate</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("WYSIWYG")}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "WYSIWYG"
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Bespoke WYSIWYG</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("MATRIX")}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "MATRIX"
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Matrix Studio</span>
        </button>
      </div>
    </div>
  );
}
