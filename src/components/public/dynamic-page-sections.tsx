import * as React from "react";
import { AnimatedSection } from "@/components/public/animated-section";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";

export interface DynamicSubSectionItem {
  id?: string;
  title?: string | null;
  gridSpan: number;
  content: unknown;
}

export interface DynamicSectionItem {
  id: string;
  title?: string | null;
  gridSpan?: number;
  backgroundColor?: string | null;
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
      {sections.map((section) => (
        <AnimatedSection
          key={section.id}
          className={`w-full relative ${section.customCssClass || ""}`}
          style={{
            backgroundColor: section.backgroundColor || undefined,
            paddingTop: "48px",
            paddingBottom: "48px",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                };

                const borderStyleObj: React.CSSProperties = {
                  borderColor:
                    colStyle.borderColor && colStyle.borderColor !== "transparent"
                      ? colStyle.borderColor
                      : undefined,
                  borderWidth: colStyle.borderWidth ? `${colStyle.borderWidth}px` : undefined,
                  borderStyle:
                    (colStyle.borderStyle as React.CSSProperties["borderStyle"]) || undefined,
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
                  colStyle.borderColor ||
                  colStyle.borderWidth ||
                  colStyle.borderRadius ||
                  colStyle.boxShadow ||
                  colStyle.ornamentalFrame
                );

                return (
                  <div
                    key={col.id || `col-${colIdx}`}
                    className={`${colSpanClass} w-full relative ${radiusClass} ${glowClass} ${
                      hasCustomStyling ? "p-4" : ""
                    }`}
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
                    <TiptapRenderer content={col.content as Record<string, unknown>} />
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
