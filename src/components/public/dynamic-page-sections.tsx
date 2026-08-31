import * as React from "react";
import { AnimatedSection } from "@/components/public/animated-section";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { getPatternById } from "@/lib/background-patterns";

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

        const sectionStyle: React.CSSProperties = {
          backgroundColor: section.backgroundColor || undefined,
          paddingTop: "48px",
          paddingBottom: "48px",
          ...(isImageBg
            ? {
                backgroundImage: `url("${section.backgroundImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {}),
        };

        return (
          <AnimatedSection
            key={section.id}
            className={`w-full relative overflow-hidden ${section.customCssClass || ""}`}
            style={sectionStyle}
          >
            {/* Background Image Dark Overlay */}
            {isImageBg && (
              <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-0"
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
                  };

                  const borderStyleObj: React.CSSProperties = {
                    borderColor:
                      colStyle.borderColor && colStyle.borderColor !== "transparent"
                        ? colStyle.borderColor
                        : undefined,
                    borderWidth: colStyle.borderWidth ? `${colStyle.borderWidth}px` : undefined,
                    borderStyle:
                      (colStyle.borderStyle as React.CSSProperties["borderStyle"]) || undefined,
                    backgroundColor: colStyle.backgroundColor || undefined,
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
                    colStyle.ornamentalFrame ||
                    colStyle.backgroundColor
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
        );
      })}
    </div>
  );
}
