import * as React from "react";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { BookOpen } from "lucide-react";

export interface MatrixCellSegmentData {
  id: string;
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  title?: string;
  contentHtml: string;
}

interface CatalogMatrixPageProps {
  pageNumber?: number | string;
  pageTitle?: string | null;
  pageSubtitle?: string | null;
  matrixRows?: number;
  matrixCols?: number;
  rowHeights?: string | null;
  colWidths?: string | null;
  hasHeader?: boolean;
  headerHtml?: string | null;
  hasFooter?: boolean;
  footerHtml?: string | null;
  verticalSpineMode?: "NONE" | "LEFT" | "RIGHT" | string;
  verticalSpineHtml?: string | null;
  verticalSpineWidth?: string | null;
  segments?: MatrixCellSegmentData[] | null;
  frameClass?: string;
  backgroundColor?: string | null;
  backgroundLayer?: React.ReactNode;
  catalogTitle: string;
  fallbackContentHtml?: string | null;
}

export function CatalogMatrixPage({
  pageNumber,
  pageTitle,
  pageSubtitle,
  matrixRows = 2,
  matrixCols = 2,
  rowHeights = "1fr 1fr",
  colWidths = "1fr 1fr",
  hasHeader = false,
  headerHtml,
  hasFooter = false,
  footerHtml,
  verticalSpineMode = "NONE",
  verticalSpineHtml,
  verticalSpineWidth = "25%",
  segments = [],
  frameClass = "catalog-frame-gold border-2 border-primary/50",
  backgroundColor,
  backgroundLayer,
  catalogTitle,
  fallbackContentHtml,
}: CatalogMatrixPageProps) {
  // Determine covered cells from rowSpan / colSpan
  const coveredCells = React.useMemo(() => {
    const covered = new Set<string>();
    if (!segments || !Array.isArray(segments)) return covered;
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

  const hasMatrixCells = Array.isArray(segments) && segments.length > 0;
  const isSpineActive = verticalSpineMode === "LEFT" || verticalSpineMode === "RIGHT";

  return (
    <section
      className="catalog-page catalog-matrix-page-wrapper editorial-page relative rounded-3xl overflow-hidden p-6 sm:p-10 flex flex-col justify-between print:rounded-none"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {backgroundLayer}

      <div
        className={`catalog-frame relative z-10 ${frameClass} p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full bg-card/40 backdrop-blur-xs`}
      >
        {/* Running Header */}
        {hasHeader && headerHtml ? (
          <header className="catalog-running-header border-b border-primary/20 pb-3 mb-4 text-xs font-serif font-bold text-foreground">
            <TiptapRenderer content={headerHtml} />
          </header>
        ) : (pageTitle || pageSubtitle) ? (
          <header className="catalog-running-header border-b border-primary/20 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                Editorial Monograph • Page {pageNumber}
              </span>
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
            </div>
            {pageTitle && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground leading-tight">
                {pageTitle}
              </h2>
            )}
            {pageSubtitle && (
              <p className="text-xs sm:text-sm font-serif italic text-muted-foreground mt-1">
                {pageSubtitle}
              </p>
            )}
          </header>
        ) : null}

        {/* Central Body (Vertical Spine + Matrix Canvas) */}
        <div
          className="catalog-matrix-body flex-1 flex gap-6 w-full my-auto overflow-hidden"
          style={{
            flexDirection: verticalSpineMode === "RIGHT" ? "row-reverse" : "row",
          }}
        >
          {/* Vertical Sidebar Spine */}
          {isSpineActive && (
            <aside
              className="catalog-matrix-spine shrink-0 border-primary/25 flex flex-col justify-center text-center overflow-y-auto print:overflow-visible font-serif p-2"
              style={{
                width: verticalSpineWidth || "25%",
                borderRightWidth: verticalSpineMode === "LEFT" ? "1px" : "0px",
                borderLeftWidth: verticalSpineMode === "RIGHT" ? "1px" : "0px",
              }}
            >
              {verticalSpineHtml ? (
                <TiptapRenderer content={verticalSpineHtml} />
              ) : (
                <div className="text-xs font-mono uppercase tracking-widest text-primary/70">
                  Archival Spine
                </div>
              )}
            </aside>
          )}

          {/* Central Matrix Grid */}
          {hasMatrixCells ? (
            <div
              className="catalog-matrix-grid flex-1 grid gap-4 w-full h-full"
              style={{
                gridTemplateRows: rowHeights || `repeat(${matrixRows}, 1fr)`,
                gridTemplateColumns: colWidths || `repeat(${matrixCols}, 1fr)`,
              }}
            >
              {segments.map((cell) => {
                const cellKey = `${cell.row}-${cell.col}`;
                if (coveredCells.has(cellKey)) return null;

                const rSpan = cell.rowSpan || 1;
                const cSpan = cell.colSpan || 1;

                return (
                  <div
                    key={cell.id || cellKey}
                    style={{
                      gridRow: `span ${rSpan}`,
                      gridColumn: `span ${cSpan}`,
                    }}
                    className="catalog-matrix-cell overflow-y-auto print:overflow-visible prose prose-sm dark:prose-invert font-serif leading-relaxed text-foreground/90 text-justify flex flex-col"
                  >
                    {cell.title && (
                      <h4 className="font-serif text-base font-bold text-foreground mb-1 not-prose">
                        {cell.title}
                      </h4>
                    )}
                    <TiptapRenderer content={cell.contentHtml} />
                  </div>
                );
              })}
            </div>
          ) : fallbackContentHtml ? (
            <div className="catalog-matrix-cell flex-1 overflow-y-auto print:overflow-visible prose prose-sm sm:prose-base dark:prose-invert font-serif leading-relaxed text-foreground/90 text-justify">
              <TiptapRenderer content={fallbackContentHtml} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center italic text-muted-foreground text-xs">
              No matrix editorial content compiled for this page.
            </div>
          )}
        </div>

        {/* Running Footer */}
        {hasFooter && footerHtml ? (
          <footer className="catalog-running-footer border-t border-primary/20 pt-3 mt-auto text-center text-xs font-mono text-muted-foreground">
            <TiptapRenderer content={footerHtml} />
          </footer>
        ) : (
          <footer className="catalog-running-footer pt-3 border-t border-primary/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-auto">
            <span>{catalogTitle} • Atelier Monograph</span>
            <span>Page {pageNumber}</span>
          </footer>
        )}
      </div>
    </section>
  );
}
