import * as React from "react";
import { AnimatedSection } from "@/components/public/animated-section";
import { TiptapRenderer, renderColumnBlock } from "@/components/public/tiptap-renderer";
import { getPatternById } from "@/lib/background-patterns";
import type { PageMatrixConfig } from "@/components/builder/page-matrix-studio";
import { cn } from "@/lib/utils";
import { resolveContainerContrast, getContrastTypographyClasses } from "@/lib/theme-contrast";

export interface DynamicSubSectionItem {
  id?: string;
  title?: string | null;
  gridSpan: number;
  content: unknown;
  backgroundType?: string | null;
  backgroundPattern?: string | null;
  backgroundImage?: string | null;
  backgroundOverlayOpacity?: number | null;
}

export interface DynamicSectionItem {
  id: string;
  title?: string | null;
  gridSpan?: number;
  layoutType?: string | null;
  matrixConfig?: PageMatrixConfig | unknown | null;
  backgroundColor?: string | null;
  backgroundType?: string | null;
  backgroundPattern?: string | null;
  backgroundImage?: string | null;
  backgroundOverlayOpacity?: number | null;
  customCssClass?: string | null;
  subSections: DynamicSubSectionItem[];
}

interface DynamicPageSectionsProps {
  sections?: DynamicSectionItem[] | null;
  className?: string;
}

export function DynamicPageSections({
  sections,
  className = "",
}: DynamicPageSectionsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {sections.map((section) => {
        const isImageBg = section.backgroundType === "IMAGE" && !!section.backgroundImage;
        const isPatternBg = section.backgroundType === "PATTERN" && !!section.backgroundPattern;
        const pattern = isPatternBg ? getPatternById(section.backgroundPattern) : null;
        const overlayOpacity =
          section.backgroundOverlayOpacity !== undefined && section.backgroundOverlayOpacity !== null
            ? Number(section.backgroundOverlayOpacity)
            : 0.5;

        const sectionContrast = resolveContainerContrast({
          backgroundType: section.backgroundType || undefined,
          backgroundColor: section.backgroundColor,
          backgroundImage: section.backgroundImage,
          overlayOpacity: section.backgroundOverlayOpacity,
          backgroundPattern: section.backgroundPattern,
        });
        const sectionTypographyClasses = getContrastTypographyClasses(sectionContrast);

        const isContain =
          section.customCssClass?.includes("bg-contain") ||
          (section as unknown as { backgroundSize?: string }).backgroundSize === "contain";

        const bgSizeStyle: React.CSSProperties = isContain
          ? {
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }
          : {
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            };

        const sectionStyle: React.CSSProperties = {
          backgroundColor: section.backgroundColor || undefined,
          paddingTop: "48px",
          paddingBottom: "48px",
          ...(isImageBg
            ? {
                backgroundImage: `url("${section.backgroundImage}")`,
                ...bgSizeStyle,
              }
            : {}),
        };

        return (
          <AnimatedSection
            key={section.id}
            className={cn("w-full relative overflow-hidden", sectionTypographyClasses, section.customCssClass)}
            style={sectionStyle}
          >
            {/* Background Image Dark Overlay */}
            {isImageBg && (
              <div
                className="absolute inset-0 bg-stone-950/60 pointer-events-none transition-opacity duration-300 z-0"
                style={{ opacity: overlayOpacity }}
              />
            )}

            {/* Background Pattern Layer */}
            {pattern && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
                style={{
                  backgroundImage: `url("${pattern.svgDataUri}")`,
                  backgroundRepeat: "repeat",
                  opacity: overlayOpacity,
                }}
              />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {section.layoutType === "MATRIX" && section.matrixConfig ? (
                (() => {
                  const matrix = section.matrixConfig as PageMatrixConfig;
                  const coveredCells = new Set<string>();
                  for (const cell of matrix.segments || []) {
                    const rSpan = cell.rowSpan || 1;
                    const cSpan = cell.colSpan || 1;
                    if (rSpan > 1 || cSpan > 1) {
                      for (let r = cell.row; r < cell.row + rSpan; r++) {
                        for (let c = cell.col; c < cell.col + cSpan; c++) {
                          if (r !== cell.row || c !== cell.col) {
                            coveredCells.add(`${r}-${c}`);
                          }
                        }
                      }
                    }
                  }

                  return (
                    <div className="w-full space-y-6">
                      {/* Section Running Header */}
                      {matrix.hasHeader && matrix.headerHtml && (
                        <header className="running-header-public w-full pb-3 border-b border-primary/20 text-center">
                          <TiptapRenderer content={matrix.headerHtml} contrast={sectionContrast} />
                        </header>
                      )}

                      {/* Main Matrix Body with optional vertical spine */}
                      <div
                        className="flex flex-col lg:flex-row gap-6 items-stretch w-full"
                        style={{
                          flexDirection: matrix.verticalSpineMode === "RIGHT" ? "row-reverse" : "row",
                        }}
                      >
                        {/* Vertical Sidebar Spine */}
                        {matrix.verticalSpineMode !== "NONE" && matrix.verticalSpineHtml && (
                          <div
                            className="w-full lg:shrink-0 p-5 rounded-2xl border border-amber-600/30 bg-amber-500/5 backdrop-blur-xs flex flex-col justify-center"
                            style={{
                              width: undefined,
                            }}
                          >
                            <div className="lg:w-64 max-w-full">
                              <TiptapRenderer content={matrix.verticalSpineHtml} contrast={sectionContrast} />
                            </div>
                          </div>
                        )}

                        {/* Central Matrix Grid */}
                        <div
                          className="flex-1 grid gap-6 items-start matrix-grid-layout"
                          style={{
                            gridTemplateRows: matrix.rowHeights || `repeat(${matrix.matrixRows || 2}, auto)`,
                            gridTemplateColumns: matrix.colWidths || `repeat(${matrix.matrixCols || 2}, 1fr)`,
                          }}
                        >
                          {(matrix.segments || []).map((cell) => {
                            const cellKey = `${cell.row}-${cell.col}`;
                            if (coveredCells.has(cellKey)) return null;

                            const cellContrast = cell.bgConfig?.backgroundColor
                              ? resolveContainerContrast({
                                  backgroundColor: cell.bgConfig.backgroundColor,
                                })
                              : sectionContrast;
                            const cellTypographyClasses = getContrastTypographyClasses(cellContrast);

                            return (
                              <div
                                key={cell.id || cellKey}
                                className={cn(
                                  "matrix-cell w-full relative p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-xs transition-all",
                                  cellTypographyClasses
                                )}
                                style={{
                                  gridRow: `span ${cell.rowSpan || 1}`,
                                  gridColumn: `span ${cell.colSpan || 1}`,
                                  backgroundColor: cell.bgConfig?.backgroundColor || undefined,
                                }}
                              >
                                {cell.title && (
                                  <h4 className="font-serif font-bold text-lg sm:text-xl mb-3 pb-1 border-b border-border/30">
                                    {cell.title}
                                  </h4>
                                )}

                                {Array.isArray(cell.blocks) && cell.blocks.length > 0 ? (
                                  <div className="space-y-4">
                                    {cell.blocks.map((block) => renderColumnBlock(block, cellContrast))}
                                  </div>
                                ) : cell.contentHtml ? (
                                  <TiptapRenderer content={cell.contentHtml} contrast={cellContrast} />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section Running Footer */}
                      {matrix.hasFooter && matrix.footerHtml && (
                        <footer className="running-footer-public w-full pt-3 border-t border-primary/20 text-center">
                          <TiptapRenderer content={matrix.footerHtml} contrast={sectionContrast} />
                        </footer>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="grid grid-cols-12 gap-6 items-start">
                  {section.subSections.map((col, colIdx) => {
                    const colSpanClass =
                      col.gridSpan === 12
                        ? "col-span-12"
                        : col.gridSpan === 8
                        ? "col-span-12 md:col-span-8"
                        : col.gridSpan === 7
                        ? "col-span-12 md:col-span-7"
                        : col.gridSpan === 6
                        ? "col-span-12 md:col-span-6"
                        : col.gridSpan === 5
                        ? "col-span-12 md:col-span-5"
                        : col.gridSpan === 4
                        ? "col-span-12 md:col-span-4"
                        : col.gridSpan === 3
                        ? "col-span-12 md:col-span-3"
                        : "col-span-12";

                    const colObj = (typeof col.content === "object" && col.content !== null
                      ? col.content
                      : {}) as Record<string, unknown>;

                    const colStyle = (colObj?._style || {}) as {
                      borderColor?: string;
                      borderWidth?: number;
                      borderStyle?: string;
                      borderRadius?: string;
                      boxShadow?: string;
                      ornamentalFrame?: boolean;
                      backgroundType?: string;
                      backgroundPattern?: string;
                      backgroundImage?: string;
                      backgroundOverlayOpacity?: number;
                      backgroundColor?: string;
                      backgroundSize?: "cover" | "contain";
                      fontFamily?: string;
                    };

                    const colContrast = (colStyle.backgroundColor || colStyle.backgroundImage)
                      ? resolveContainerContrast({
                          backgroundType: colStyle.backgroundType,
                          backgroundColor: colStyle.backgroundColor,
                          backgroundImage: colStyle.backgroundImage,
                          overlayOpacity: colStyle.backgroundOverlayOpacity,
                          backgroundPattern: colStyle.backgroundPattern,
                        })
                      : sectionContrast;
                    const colTypographyClasses = getContrastTypographyClasses(colContrast);

                    const isColContain = colStyle.backgroundSize === "contain";
                    const isZeroBorder =
                      colStyle.borderWidth === 0 || colStyle.borderColor === "transparent";

                    const borderStyleObj: React.CSSProperties = {
                      borderColor: isZeroBorder ? "transparent" : colStyle.borderColor || undefined,
                      borderWidth: isZeroBorder
                        ? "0px"
                        : colStyle.borderWidth
                        ? `${colStyle.borderWidth}px`
                        : undefined,
                      borderStyle: isZeroBorder
                        ? "none"
                        : (colStyle.borderStyle as React.CSSProperties["borderStyle"]) || undefined,
                      border: isZeroBorder ? "none" : undefined,
                      backgroundColor: colStyle.backgroundColor || undefined,
                      fontFamily: colStyle.fontFamily || undefined,
                      ...(colStyle.backgroundType === "IMAGE" && colStyle.backgroundImage
                        ? {
                            backgroundImage: `url("${colStyle.backgroundImage}")`,
                            backgroundSize: isColContain ? "contain" : "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                          }
                        : {}),
                    };

                    let radiusClass = "";
                    if (colStyle.borderRadius === "rounded-md") radiusClass = "rounded-md";
                    if (colStyle.borderRadius === "rounded-2xl") radiusClass = "rounded-2xl";
                    if (colStyle.borderRadius === "rounded-t-full")
                      radiusClass = "rounded-t-full overflow-hidden";

                    let glowClass = "";
                    if (colStyle.boxShadow === "gold-glow")
                      glowClass = "shadow-[0_0_25px_rgba(212,175,55,0.25)]";
                    if (colStyle.boxShadow === "soft") glowClass = "shadow-lg";

                    const hasCustomStyling = !!(
                      (!isZeroBorder && (colStyle.borderColor || colStyle.borderWidth)) ||
                      colStyle.borderRadius ||
                      colStyle.boxShadow ||
                      colStyle.ornamentalFrame ||
                      colStyle.backgroundColor ||
                      colStyle.backgroundImage
                    );

                    return (
                      <div
                        key={col.id || `col-${colIdx}`}
                        className={cn(
                          colSpanClass,
                          "w-full relative",
                          radiusClass,
                          glowClass,
                          colTypographyClasses,
                          hasCustomStyling ? "p-4" : ""
                        )}
                        style={borderStyleObj}
                      >
                        {colStyle.ornamentalFrame && (
                          <>
                            <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
                            <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none z-10" />
                            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none z-10" />
                          </>
                        )}
                        <TiptapRenderer content={col.content as Record<string, unknown>} contrast={colContrast} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>
        );
      })}
    </div>
  );
}
