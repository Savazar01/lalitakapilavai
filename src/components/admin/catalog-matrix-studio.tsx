"use client";

import * as React from "react";
import {
  Grid,
  Columns,
  Rows,
  Sparkles,
  Save,
  FolderOpen,
  PanelLeft,
  PanelRight,
  LayoutTemplate,
  Trash2,
  Plus,
  Sliders,
  Check,
  ChevronDown,
  Layers,
  Heading,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TiptapEditor } from "@/components/builder/tiptap-editor";
import { AiAssistantModal } from "@/components/admin/ai-assistant-modal";

export interface MatrixCellSegment {
  id: string;
  row: number; // 1-indexed
  col: number; // 1-indexed
  rowSpan: number; // >= 1
  colSpan: number; // >= 1
  title?: string;
  contentHtml: string;
  bgConfig?: {
    backgroundColor?: string;
    frameStyle?: string;
  };
}

export interface CatalogMatrixConfig {
  matrixRows: number;
  matrixCols: number;
  rowHeights?: string;
  colWidths?: string;
  hasHeader: boolean;
  headerHtml?: string | null;
  hasFooter: boolean;
  footerHtml?: string | null;
  verticalSpineMode: "NONE" | "LEFT" | "RIGHT";
  verticalSpineHtml?: string | null;
  verticalSpineWidth?: string;
  segments: MatrixCellSegment[];
}

export interface CatalogTemplateItem {
  id: string;
  title: string;
  description?: string | null;
  targetPageType: string;
  matrixRows: number;
  matrixCols: number;
  rowHeights?: string | null;
  colWidths?: string | null;
  hasHeader: boolean;
  headerHtml?: string | null;
  hasFooter: boolean;
  footerHtml?: string | null;
  verticalSpineMode: string;
  verticalSpineHtml?: string | null;
  verticalSpineWidth?: string | null;
  segments?: MatrixCellSegment[] | null;
  frameStyle?: string | null;
  backgroundType?: string | null;
  backgroundColor?: string | null;
  backgroundPattern?: string | null;
  patternOpacity?: number | null;
}

interface CatalogMatrixStudioProps {
  config: CatalogMatrixConfig;
  onChange: (updated: Partial<CatalogMatrixConfig>) => void;
  pageTitle?: string;
  pageType?: "COVER" | "MAGAZINE" | "END_PAGE";
}

/**
 * Initializes or reconciles matrix cells based on matrixRows and matrixCols.
 * Preserves existing cell content wherever coordinates overlap.
 */
export function reconcileMatrixCells(
  rows: number,
  cols: number,
  existingSegments: MatrixCellSegment[] = [],
  fallbackHtml?: string
): MatrixCellSegment[] {
  const result: MatrixCellSegment[] = [];
  const existingMap = new Map<string, MatrixCellSegment>();

  for (const seg of existingSegments) {
    existingMap.set(`${seg.row}-${seg.col}`, seg);
  }

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`;
      const existing = existingMap.get(key);
      if (existing) {
        // Clamp spans so they don't exceed current dimensions
        const maxColSpan = cols - c + 1;
        const maxRowSpan = rows - r + 1;
        result.push({
          ...existing,
          row: r,
          col: c,
          colSpan: Math.min(existing.colSpan || 1, maxColSpan),
          rowSpan: Math.min(existing.rowSpan || 1, maxRowSpan),
          contentHtml: existing.contentHtml || (r === 1 && c === 1 && fallbackHtml ? fallbackHtml : ""),
        });
      } else {
        result.push({
          id: `cell-${r}-${c}-${Date.now() + Math.random()}`,
          row: r,
          col: c,
          rowSpan: 1,
          colSpan: 1,
          title: `Cell (${r}, ${c})`,
          contentHtml: r === 1 && c === 1 && fallbackHtml ? fallbackHtml : "",
        });
      }
    }
  }

  return result;
}

export function CatalogMatrixStudio({
  config,
  onChange,
  pageTitle = "Page",
  pageType = "MAGAZINE",
}: CatalogMatrixStudioProps) {
  const {
    matrixRows = 2,
    matrixCols = 2,
    rowHeights = "1fr 1fr",
    colWidths = "1fr 1fr",
    hasHeader = false,
    headerHtml = "",
    hasFooter = false,
    footerHtml = "",
    verticalSpineMode = "NONE",
    verticalSpineHtml = "",
    verticalSpineWidth = "25%",
    segments = [],
  } = config;

  // Active cell currently selected for editing in inspector
  const [selectedCellKey, setSelectedCellKey] = React.useState<string>("1-1");

  // Template Save / Load modal states
  const [saveModalOpen, setSaveModalOpen] = React.useState(false);
  const [templateTitle, setTemplateTitle] = React.useState("");
  const [templateDesc, setTemplateDesc] = React.useState("");
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false);

  const [loadModalOpen, setLoadModalOpen] = React.useState(false);
  const [templates, setTemplates] = React.useState<CatalogTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);

  // Active view: Visual Canvas vs Cell Editor List
  const [activeViewTab, setActiveViewTab] = React.useState<"canvas" | "cells" | "zones">("canvas");

  // Ensure segments are initialized
  React.useEffect(() => {
    if (!segments || segments.length === 0) {
      const initial = reconcileMatrixCells(matrixRows, matrixCols, []);
      onChange({ segments: initial });
    }
  }, [matrixRows, matrixCols]);

  // Dimension changes
  const handleRowsChange = (newRows: number) => {
    const clamped = Math.min(6, Math.max(1, newRows));
    const newRowHeights = Array(clamped).fill("1fr").join(" ");
    const reconciled = reconcileMatrixCells(clamped, matrixCols, segments);
    onChange({
      matrixRows: clamped,
      rowHeights: newRowHeights,
      segments: reconciled,
    });
  };

  const handleColsChange = (newCols: number) => {
    const clamped = Math.min(6, Math.max(1, newCols));
    const newColWidths = Array(clamped).fill("1fr").join(" ");
    const reconciled = reconcileMatrixCells(matrixRows, clamped, segments);
    onChange({
      matrixCols: clamped,
      colWidths: newColWidths,
      segments: reconciled,
    });
  };

  // Cell updates
  const updateCell = (row: number, col: number, updates: Partial<MatrixCellSegment>) => {
    const updated = segments.map((cell) => {
      if (cell.row === row && cell.col === col) {
        return { ...cell, ...updates };
      }
      return cell;
    });
    onChange({ segments: updated });
  };

  // Find cell by row/col
  const getCell = (row: number, col: number): MatrixCellSegment | undefined => {
    return segments.find((c) => c.row === row && c.col === col);
  };

  // Determine which cells are covered by an active cell's colSpan / rowSpan > 1
  const coveredCells = React.useMemo(() => {
    const covered = new Set<string>();
    for (const cell of segments) {
      const rSpan = cell.rowSpan || 1;
      const cSpan = cell.colSpan || 1;
      if (rSpan > 1 || cSpan > 1) {
        for (let r = cell.row; r < cell.row + rSpan; r++) {
          for (let c = cell.col; c < cell.col + cSpan; c++) {
            if (r !== cell.row || c !== cell.col) {
              covered.add(`${r}-${c}`);
            }
          }
        }
      }
    }
    return covered;
  }, [segments]);

  // Fetch templates for Load modal
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/catalogs/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Save as Template
  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) return;
    setIsSavingTemplate(true);
    try {
      const payload = {
        title: templateTitle.trim(),
        description: templateDesc.trim() || null,
        targetPageType: pageType,
        matrixRows,
        matrixCols,
        rowHeights,
        colWidths,
        hasHeader,
        headerHtml: headerHtml || null,
        hasFooter,
        footerHtml: footerHtml || null,
        verticalSpineMode,
        verticalSpineHtml: verticalSpineHtml || null,
        verticalSpineWidth,
        segments,
      };

      const res = await fetch("/api/admin/catalogs/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveModalOpen(false);
        setTemplateTitle("");
        setTemplateDesc("");
      }
    } catch (err) {
      console.error("Failed to save template:", err);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Apply a loaded template
  const applyTemplate = (tpl: CatalogTemplateItem) => {
    const rows = tpl.matrixRows || 2;
    const cols = tpl.matrixCols || 2;
    const tplSegments = (tpl.segments as MatrixCellSegment[]) || [];
    const reconciled = reconcileMatrixCells(rows, cols, tplSegments);

    onChange({
      matrixRows: rows,
      matrixCols: cols,
      rowHeights: tpl.rowHeights || Array(rows).fill("1fr").join(" "),
      colWidths: tpl.colWidths || Array(cols).fill("1fr").join(" "),
      hasHeader: Boolean(tpl.hasHeader),
      headerHtml: tpl.headerHtml || "",
      hasFooter: Boolean(tpl.hasFooter),
      footerHtml: tpl.footerHtml || "",
      verticalSpineMode: (tpl.verticalSpineMode as "NONE" | "LEFT" | "RIGHT") || "NONE",
      verticalSpineHtml: tpl.verticalSpineHtml || "",
      verticalSpineWidth: tpl.verticalSpineWidth || "25%",
      segments: reconciled,
    });
    setLoadModalOpen(false);
  };

  const selectedCell = segments.find(
    (c) => `${c.row}-${c.col}` === selectedCellKey
  ) || segments[0];

  return (
    <div className="catalog-matrix-studio space-y-4 border border-border/80 rounded-2xl p-4 sm:p-5 bg-card/60 backdrop-blur-xs">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-serif font-bold text-foreground">
                InDesign Matrix Studio • {matrixRows} Rows × {matrixCols} Cols
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                {segments.length} Cells
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Define interactive grid tracks, spanned featured zones, vertical sidebar spines, and running headers.
            </p>
          </div>
        </div>

        {/* Action Buttons: Save/Load Template */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              fetchTemplates();
              setLoadModalOpen(true);
            }}
            className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/5 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-primary" />
            <span>Load Template</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSaveModalOpen(true)}
            className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-primary" />
            <span>Save as Template</span>
          </Button>
        </div>
      </div>

      {/* Matrix Controls & Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-muted/20 p-3.5 rounded-xl border border-border/60">
        {/* Rows Stepper */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Rows className="w-3.5 h-3.5 text-primary" /> Matrix Rows
            </span>
            <span className="text-[11px] font-mono text-primary font-bold">{matrixRows}</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <button
                key={`r-${r}`}
                type="button"
                onClick={() => handleRowsChange(r)}
                className={`flex-1 py-1 text-xs font-mono font-semibold rounded border transition-all cursor-pointer ${
                  matrixRows === r
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card hover:bg-muted/50 border-border text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Columns Stepper */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-primary" /> Matrix Columns
            </span>
            <span className="text-[11px] font-mono text-primary font-bold">{matrixCols}</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((c) => (
              <button
                key={`c-${c}`}
                type="button"
                onClick={() => handleColsChange(c)}
                className={`flex-1 py-1 text-xs font-mono font-semibold rounded border transition-all cursor-pointer ${
                  matrixCols === c
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card hover:bg-muted/50 border-border text-muted-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Column Track Width Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" /> Col Proportions
          </label>
          <Select
            value={colWidths || "1fr 1fr"}
            onValueChange={(val) => onChange({ colWidths: val })}
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Proportions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Array(matrixCols).fill("1fr").join(" ")}>
                Balanced Equal ({Array(matrixCols).fill("1fr").join(":")})
              </SelectItem>
              {matrixCols === 2 && (
                <>
                  <SelectItem value="7fr 3fr">Asymmetric Hero-Left (70:30)</SelectItem>
                  <SelectItem value="3fr 7fr">Asymmetric Hero-Right (30:70)</SelectItem>
                  <SelectItem value="2fr 1fr">Editorial Contrast (2:1)</SelectItem>
                  <SelectItem value="1fr 2fr">Editorial Contrast (1:2)</SelectItem>
                </>
              )}
              {matrixCols === 3 && (
                <>
                  <SelectItem value="1fr 2fr 1fr">Feature Center (1:2:1)</SelectItem>
                  <SelectItem value="2fr 1fr 1fr">Feature Left (2:1:1)</SelectItem>
                  <SelectItem value="1fr 1fr 2fr">Feature Right (1:1:2)</SelectItem>
                </>
              )}
              {matrixCols === 4 && (
                <>
                  <SelectItem value="2fr 1fr 1fr 1fr">Lead Hero (2:1:1:1)</SelectItem>
                  <SelectItem value="1fr 2fr 1fr 1fr">Internal Spread</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Vertical Sidebar Spine */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PanelLeft className="w-3.5 h-3.5 text-primary" /> Vertical Sidebar Spine
            </span>
          </label>
          <Select
            value={verticalSpineMode}
            onValueChange={(val: "NONE" | "LEFT" | "RIGHT") =>
              onChange({ verticalSpineMode: val })
            }
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Spine Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">No Spine (Full Canvas)</SelectItem>
              <SelectItem value="LEFT">Left Spine (Full-Height)</SelectItem>
              <SelectItem value="RIGHT">Right Spine (Full-Height)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Structural Zone Toggles: Running Header & Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/10 text-xs">
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => onChange({ hasHeader: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <span className="font-semibold flex items-center gap-1.5">
              <Heading className="w-3.5 h-3.5 text-primary" /> Full-Width Running Header
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasFooter}
              onChange={(e) => onChange({ hasFooter: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <span className="font-semibold flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-primary" /> Full-Width Running Footer
            </span>
          </label>
        </div>

        {verticalSpineMode !== "NONE" && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-[11px]">Spine Width:</span>
            {["18%", "22%", "25%", "30%"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ verticalSpineWidth: w })}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  verticalSpineWidth === w
                    ? "bg-primary text-primary-foreground border-primary font-bold"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workspace Tabs: Interactive Visual Canvas vs Cell Editors vs Structural Zones */}
      <Tabs
        value={activeViewTab}
        onValueChange={(v) => setActiveViewTab(v as "canvas" | "cells" | "zones")}
        className="w-full"
      >
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <TabsList className="h-8 p-0.5 bg-muted/40">
            <TabsTrigger value="canvas" className="text-xs h-7 px-3 gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Visual Matrix Canvas</span>
            </TabsTrigger>
            <TabsTrigger value="cells" className="text-xs h-7 px-3 gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Cell Content Editors ({segments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="text-xs h-7 px-3 gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Header, Footer &amp; Spine</span>
            </TabsTrigger>
          </TabsList>

          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            Click any cell in the canvas to configure span &amp; copy
          </span>
        </div>

        {/* TAB 1: VISUAL MATRIX CANVAS */}
        <TabsContent value="canvas" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left/Main Column: Visual Representation of the Complete Sheet */}
            <div className="lg:col-span-8 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Interactive Page Wireframe</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {verticalSpineMode !== "NONE" ? `Includes ${verticalSpineMode} Spine` : "Full-Width Matrix"}
                </span>
              </div>

              {/* Complete Sheet Simulation */}
              <div className="matrix-sheet-preview rounded-2xl border-2 border-primary/40 p-4 bg-card/80 shadow-md min-h-[380px] flex flex-col justify-between gap-3 relative overflow-hidden">
                {/* Simulated Running Header */}
                {hasHeader && (
                  <div className="running-header-box p-2.5 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-center text-xs font-mono">
                    <span className="text-primary font-semibold uppercase tracking-wider text-[10px]">
                      [Top Running Header Zone]
                    </span>
                    {headerHtml ? (
                      <div
                        className="text-xs text-foreground/80 line-clamp-1 mt-0.5"
                        dangerouslySetInnerHTML={{ __html: headerHtml }}
                      />
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">Header copy unassigned</p>
                    )}
                  </div>
                )}

                {/* Central Body (Spine + Matrix) */}
                <div
                  className="flex-1 flex gap-3 w-full"
                  style={{
                    flexDirection: verticalSpineMode === "RIGHT" ? "row-reverse" : "row",
                  }}
                >
                  {/* Vertical Spine Bar */}
                  {verticalSpineMode !== "NONE" && (
                    <div
                      style={{ width: verticalSpineWidth || "25%" }}
                      className="vertical-spine-box rounded-xl border border-dashed border-amber-600/60 bg-amber-500/5 p-2.5 flex flex-col justify-between text-center shrink-0"
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                        {verticalSpineMode} Spine ({verticalSpineWidth})
                      </span>
                      <div className="text-[11px] text-foreground/80 font-serif my-auto line-clamp-4 overflow-hidden">
                        {verticalSpineHtml ? (
                          <div dangerouslySetInnerHTML={{ __html: verticalSpineHtml }} />
                        ) : (
                          <span className="italic text-muted-foreground">Vertical spine text</span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">Spine Band</span>
                    </div>
                  )}

                  {/* Central Matrix Grid */}
                  <div
                    className="flex-1 grid gap-2.5 w-full"
                    style={{
                      gridTemplateRows: rowHeights || `repeat(${matrixRows}, 1fr)`,
                      gridTemplateColumns: colWidths || `repeat(${matrixCols}, 1fr)`,
                    }}
                  >
                    {segments.map((cell) => {
                      const cellKey = `${cell.row}-${cell.col}`;
                      const isCovered = coveredCells.has(cellKey);
                      if (isCovered) return null; // Covered by previous spanned cell

                      const isSelected = selectedCellKey === cellKey;
                      const rSpan = cell.rowSpan || 1;
                      const cSpan = cell.colSpan || 1;

                      return (
                        <div
                          key={cell.id || cellKey}
                          onClick={() => setSelectedCellKey(cellKey)}
                          style={{
                            gridRow: `span ${rSpan}`,
                            gridColumn: `span ${cSpan}`,
                          }}
                          className={`matrix-wireframe-cell rounded-xl p-3 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                              : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          {/* Cell Badge & Coordinates */}
                          <div className="flex items-center justify-between gap-1 pb-1">
                            <span className="w-5 h-5 rounded-md bg-primary/20 text-primary font-mono font-bold text-[10px] flex items-center justify-center">
                              {cell.row},{cell.col}
                            </span>
                            <div className="flex items-center gap-1">
                              {(rSpan > 1 || cSpan > 1) && (
                                <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
                                  {cSpan}W × {rSpan}H
                                </Badge>
                              )}
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>
                          </div>

                          {/* Cell Title & Content Preview */}
                          <div className="my-auto py-1">
                            <h5 className="text-xs font-serif font-bold text-foreground line-clamp-1">
                              {cell.title || `Cell (${cell.row}, ${cell.col})`}
                            </h5>
                            <div className="text-[10px] text-muted-foreground font-serif line-clamp-2 mt-0.5">
                              {cell.contentHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: cell.contentHtml.replace(/<[^>]+>/g, " ") }} />
                              ) : (
                                <span className="italic text-muted-foreground/60">Empty segment copy</span>
                              )}
                            </div>
                          </div>

                          {/* Footer Indicator */}
                          <div className="text-[9px] font-mono text-muted-foreground/60 text-right pt-1 border-t border-border/40">
                            Click to edit
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Running Footer */}
                {hasFooter && (
                  <div className="running-footer-box p-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-center text-xs font-mono">
                    <span className="text-primary font-semibold uppercase tracking-wider text-[10px]">
                      [Bottom Running Footer Zone]
                    </span>
                    {footerHtml ? (
                      <div
                        className="text-xs text-foreground/80 line-clamp-1 mt-0.5"
                        dangerouslySetInnerHTML={{ __html: footerHtml }}
                      />
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">Footer copy unassigned</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Selected Cell Quick Inspector */}
            {selectedCell && (
              <div className="lg:col-span-4 space-y-3.5 border-l border-border/60 pl-0 lg:pl-5">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center">
                      {selectedCell.row},{selectedCell.col}
                    </div>
                    <div>
                      <h5 className="text-xs font-serif font-bold text-foreground">
                        Cell Inspector
                      </h5>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Row {selectedCell.row}, Col {selectedCell.col}
                      </span>
                    </div>
                  </div>

                  <AiAssistantModal
                    initialContext={`Cell (${selectedCell.row}, ${selectedCell.col}) Title: ${selectedCell.title || "Editorial Segment"}\n${selectedCell.contentHtml || ""}`}
                    onApply={(aiText) => {
                      const newP = `<p>${aiText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
                      updateCell(
                        selectedCell.row,
                        selectedCell.col,
                        {
                          contentHtml: selectedCell.contentHtml
                            ? `${selectedCell.contentHtml}${newP}`
                            : newP,
                        }
                      );
                    }}
                    triggerLabel="✨ AI Polish"
                  />
                </div>

                {/* Cell Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Cell Segment Heading</label>
                  <Input
                    value={selectedCell.title || ""}
                    onChange={(e) =>
                      updateCell(selectedCell.row, selectedCell.col, { title: e.target.value })
                    }
                    placeholder={`e.g. Lead Feature (${selectedCell.row}, ${selectedCell.col})`}
                    className="text-xs h-8"
                  />
                </div>

                {/* Steppers for Col Span & Row Span */}
                <div className="grid grid-cols-2 gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/60">
                  {/* Col Span */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                      Col Span (Width)
                    </label>
                    <Select
                      value={String(selectedCell.colSpan || 1)}
                      onValueChange={(v) =>
                        updateCell(selectedCell.row, selectedCell.col, { colSpan: Number(v) })
                      }
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: matrixCols - selectedCell.col + 1 },
                          (_, i) => i + 1
                        ).map((span) => (
                          <SelectItem key={`cspan-${span}`} value={String(span)}>
                            {span} {span === 1 ? "Column" : "Columns"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row Span */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                      Row Span (Height)
                    </label>
                    <Select
                      value={String(selectedCell.rowSpan || 1)}
                      onValueChange={(v) =>
                        updateCell(selectedCell.row, selectedCell.col, { rowSpan: Number(v) })
                      }
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: matrixRows - selectedCell.row + 1 },
                          (_, i) => i + 1
                        ).map((span) => (
                          <SelectItem key={`rspan-${span}`} value={String(span)}>
                            {span} {span === 1 ? "Row" : "Rows"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* In-Cell Tiptap Editor */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                    <span>Cell Visual Content</span>
                    <span className="text-[10px] font-mono text-muted-foreground">WYSIWYG Tiptap</span>
                  </label>
                  <div className="rounded-lg border border-input bg-card p-1 shadow-xs max-h-[260px] overflow-y-auto">
                    <TiptapEditor
                      content={selectedCell.contentHtml}
                      onChange={(_, html) =>
                        updateCell(selectedCell.row, selectedCell.col, { contentHtml: html })
                      }
                      placeholder={`Compose copy, headings, or add photos for Cell (${selectedCell.row}, ${selectedCell.col})...`}
                      className="min-h-[160px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: CELL CONTENT EDITORS LIST */}
        <TabsContent value="cells" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((cell) => {
              const cellKey = `${cell.row}-${cell.col}`;
              const isCovered = coveredCells.has(cellKey);
              if (isCovered) return null;

              return (
                <div
                  key={cell.id || cellKey}
                  className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/10 text-primary border border-primary/30 flex items-center justify-center text-xs font-mono font-bold">
                        {cell.row},{cell.col}
                      </span>
                      <Input
                        value={cell.title || ""}
                        onChange={(e) => updateCell(cell.row, cell.col, { title: e.target.value })}
                        placeholder={`Cell (${cell.row}, ${cell.col}) Title`}
                        className="text-xs h-7 w-48 font-serif font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <AiAssistantModal
                        initialContext={`Cell (${cell.row}, ${cell.col}) Title: ${cell.title || "Editorial Segment"}\n${cell.contentHtml || ""}`}
                        onApply={(aiText) => {
                          const newP = `<p>${aiText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
                          updateCell(cell.row, cell.col, {
                            contentHtml: cell.contentHtml ? `${cell.contentHtml}${newP}` : newP,
                          });
                        }}
                        triggerLabel="AI"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-input bg-card/60 p-1 flex-1">
                    <TiptapEditor
                      content={cell.contentHtml}
                      onChange={(_, html) => updateCell(cell.row, cell.col, { contentHtml: html })}
                      placeholder={`Compose copy for Cell (${cell.row}, ${cell.col})...`}
                      className="min-h-[140px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 3: STRUCTURAL ZONES (HEADER, FOOTER, VERTICAL SPINE) */}
        <TabsContent value="zones" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Header Zone Editor */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5">
                  <Heading className="w-3.5 h-3.5 text-primary" /> Top Running Header
                </span>
                <Badge variant={hasHeader ? "default" : "outline"} className="text-[10px]">
                  {hasHeader ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="rounded-md border border-input bg-card/60 p-1">
                <TiptapEditor
                  content={headerHtml || ""}
                  onChange={(_, html) => onChange({ headerHtml: html })}
                  placeholder="e.g. Curatorial Statement • Chapter 1 • Sacred Lineage"
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Vertical Sidebar Spine Editor */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5">
                  <PanelLeft className="w-3.5 h-3.5 text-primary" /> Vertical Spine ({verticalSpineMode})
                </span>
                <Badge variant={verticalSpineMode !== "NONE" ? "default" : "outline"} className="text-[10px]">
                  {verticalSpineMode}
                </Badge>
              </div>
              <div className="rounded-md border border-input bg-card/60 p-1">
                <TiptapEditor
                  content={verticalSpineHtml || ""}
                  onChange={(_, html) => onChange({ verticalSpineHtml: html })}
                  placeholder="Vertical metadata, archival provenance notes, or atelier imprint..."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Footer Zone Editor */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-serif font-bold text-foreground flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-primary" /> Bottom Running Footer
                </span>
                <Badge variant={hasFooter ? "default" : "outline"} className="text-[10px]">
                  {hasFooter ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="rounded-md border border-input bg-card/60 p-1">
                <TiptapEditor
                  content={footerHtml || ""}
                  onChange={(_, html) => onChange({ footerHtml: html })}
                  placeholder="e.g. Published by the Atelier of Lalita Kapilavai • All rights reserved."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: SAVE AS TEMPLATE */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Save Layout as Reusable Template</DialogTitle>
            <DialogDescription className="text-xs">
              Persist this {matrixRows}×{matrixCols} grid structure, vertical spine, and framing settings to the template library.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Template Title</Label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g. Royal Atelier 3x2 Editorial Spread"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description (Optional)</Label>
              <Input
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="e.g. Features left vertical spine, 2fr top hero, and twin commentary columns"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate || !templateTitle.trim()}
              className="bg-primary text-primary-foreground"
            >
              {isSavingTemplate ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: LOAD TEMPLATE GALLERY */}
      <Dialog open={loadModalOpen} onOpenChange={setLoadModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <span>Publication Template Library</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select a pre-configured matrix layout template. Applying a template will adjust grid tracks and structure.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            {loadingTemplates ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No templates found in library.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="group border border-border/80 hover:border-primary rounded-xl p-3.5 bg-card/90 hover:bg-primary/5 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                          {tpl.title}
                        </h5>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {tpl.matrixRows}R × {tpl.matrixCols}C
                        </Badge>
                      </div>

                      {tpl.description && (
                        <p className="text-[11px] text-muted-foreground font-serif leading-relaxed line-clamp-2">
                          {tpl.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
                      <span>Spine: {tpl.verticalSpineMode || "NONE"}</span>
                      <span className="text-primary font-semibold group-hover:underline">Apply Template &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setLoadModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
