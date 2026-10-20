"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getPhysicalDimensions,
  getFontFamilyCss,
  type PlacardStylingConfig,
  type PlacardPrintFormat,
  type PlacardFieldStyle,
} from "@/lib/print-isolated-html";

export interface PlacardCardData {
  id: string;
  title: string;
  artistName: string;
  category: string;
  medium: string;
  dimensions: string;
  year: string;
  price?: string;
  currency?: string;
  additionalNotes?: string;
  thumbnail?: string;
  slug: string;
}

export interface PlacardCardProps {
  itemData: PlacardCardData;
  qrDataUrl?: string;
  styling: PlacardStylingConfig;
  cardFormat: PlacardPrintFormat;
  orientation: "landscape" | "portrait";
  className?: string;
  style?: React.CSSProperties;
  showAcrylicGuide?: boolean;
}

/**
 * Resolves per-field typography styling (font family, weight, style, color, size, transform)
 * falling back gracefully to global typography tokens and card scale.
 */
export function getResolvedFieldStyle(
  fieldKey: "title" | "medium" | "dimensions" | "year" | "price" | "category" | "artist" | "notes" | "qrLabel",
  styling: PlacardStylingConfig,
  _cardFormat?: PlacardPrintFormat
): React.CSSProperties {
  const f: PlacardFieldStyle | undefined = styling.fieldStyles?.[fieldKey];
  const style: React.CSSProperties = {};

  // 1. Font Family
  if (f?.fontFamily && f.fontFamily !== "inherit") {
    style.fontFamily = getFontFamilyCss(f.fontFamily);
  }

  // 2. Font Weight
  if (f?.fontWeight && f.fontWeight !== "inherit") {
    style.fontWeight =
      f.fontWeight === "bold"
        ? 700
        : f.fontWeight === "semibold"
        ? 600
        : f.fontWeight === "medium"
        ? 500
        : 400;
  }

  // 3. Font Style
  if (f?.fontStyle && f.fontStyle !== "inherit") {
    style.fontStyle = f.fontStyle;
  }

  // 4. Text Decoration
  if (f?.textDecoration && f.textDecoration !== "none") {
    style.textDecoration = f.textDecoration;
  }

  // 5. Text Transform
  if (f?.textTransform && f.textTransform !== "none") {
    style.textTransform = f.textTransform;
  }

  // 6. Text Color
  if (f?.color && f.color.trim()) {
    style.color = f.color;
  }

  // 7. Font Size
  if (f?.fontSize && f.fontSize !== "inherit") {
    style.fontSize = f.fontSize;
  }

  return style;
}

export function PlacardCard({
  itemData,
  qrDataUrl,
  styling,
  cardFormat,
  orientation,
  className,
  style,
  showAcrylicGuide = true,
}: PlacardCardProps) {
  const dim = getPhysicalDimensions(cardFormat, orientation);
  const activeFontFamilyCss = getFontFamilyCss(styling.fontFamily);

  // Clamp padding calculation to eliminate dead space
  const clampMargin = styling.clampMargin || "minimal";
  const clampPaddingStyle: React.CSSProperties = {
    paddingBottom:
      clampMargin === "none"
        ? "0mm"
        : clampMargin === "minimal"
        ? "3mm"
        : clampMargin === "standard"
        ? "7mm"
        : "16mm", // acrylic-clamp
  };

  // Base typography scale factors for large formats
  const isLargeFormat = cardFormat === "museum-large" || cardFormat === "museum-xlarge";
  const isXLarge = cardFormat === "museum-xlarge";

  // Thumbnail dimensions based on configuration
  const thumbSize = styling.thumbnailSize || "standard";
  const thumbDimClass =
    thumbSize === "compact"
      ? "w-8 h-8 sm:w-9 sm:h-9"
      : thumbSize === "large"
      ? isLargeFormat
        ? "w-16 h-16 sm:w-20 sm:h-20"
        : "w-14 h-14 sm:w-16 sm:h-16"
      : thumbSize === "xlarge"
      ? isLargeFormat
        ? "w-20 h-20 sm:w-24 sm:h-24"
        : "w-16 h-16 sm:w-18 sm:h-18"
      : isLargeFormat
      ? "w-12 h-12 sm:w-14 sm:h-14"
      : "w-10 h-10 sm:w-11 sm:h-11";

  const thumbShapeClass =
    styling.thumbnailShape === "circle"
      ? "rounded-full"
      : styling.thumbnailShape === "square"
      ? "rounded-none"
      : "rounded";

  // QR Code dimensions based on configuration
  const qrSize = styling.qrSize || "standard";
  const qrDimClass =
    qrSize === "compact"
      ? "w-8 h-8 sm:w-9 sm:h-9"
      : qrSize === "large"
      ? isLargeFormat
        ? "w-14 h-14 sm:w-16 sm:h-16"
        : "w-12 h-12 sm:w-13 sm:h-13"
      : isLargeFormat
      ? "w-11 h-11 sm:w-12 sm:h-12"
      : "w-9 h-9 sm:w-10 sm:h-10";

  // Media placement in landscape
  const mediaPlacement = styling.mediaPlacement || "top-right";
  const mediaLayout = styling.mediaLayout || "side-by-side";

  // Default font sizing scales if not overridden per-field
  const titleClass = cn(
    "card-title leading-snug break-words hyphens-auto",
    !styling.fieldStyles?.title?.fontWeight && "font-bold",
    !styling.fieldStyles?.title?.fontStyle && "italic",
    !styling.fieldStyles?.title?.fontSize && [
      styling.titleScale === "compact" && (isXLarge ? "text-[16px]" : isLargeFormat ? "text-[14px]" : "text-[12px] sm:text-[13px]"),
      styling.titleScale === "standard" && (isXLarge ? "text-[20px]" : isLargeFormat ? "text-[18px]" : "text-[15px] sm:text-[16px]"),
      styling.titleScale === "large" && (isXLarge ? "text-[24px]" : isLargeFormat ? "text-[22px]" : "text-[18px] sm:text-[20px]"),
      styling.titleScale === "xlarge" && (isXLarge ? "text-[28px]" : isLargeFormat ? "text-[26px]" : "text-[22px] sm:text-[24px]"),
      styling.titleScale === "jumbo" && (isXLarge ? "text-[32px]" : isLargeFormat ? "text-[30px]" : "text-[26px] sm:text-[28px]"),
    ]
  );

  const mediumClass = cn(
    "card-medium leading-snug break-words",
    !styling.fieldStyles?.medium?.fontStyle && "italic",
    !styling.fieldStyles?.medium?.fontSize && [
      styling.bodyScale === "compact" && (isLargeFormat ? "text-[11px]" : "text-[8.5px] sm:text-[9px]"),
      styling.bodyScale === "standard" && (isLargeFormat ? "text-[12.5px]" : "text-[10px] sm:text-[10.5px]"),
      styling.bodyScale === "large" && (isLargeFormat ? "text-[14px]" : "text-[11.5px] sm:text-[12px]"),
      styling.bodyScale === "xlarge" && (isLargeFormat ? "text-[16px]" : "text-[13px] sm:text-[14px]"),
      styling.bodyScale === "jumbo" && (isLargeFormat ? "text-[18px]" : "text-[15px] sm:text-[16px]"),
    ]
  );

  const dimensionsClass = cn(
    "card-dimensions font-mono leading-tight break-words",
    !styling.fieldStyles?.dimensions?.fontSize && (isLargeFormat ? "text-[9.5px]" : "text-[8px]")
  );

  const priceClass = cn(
    "card-price-value leading-tight",
    styling.priceStyle === "badge"
      ? "font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/30"
      : "font-sans font-medium",
    !styling.fieldStyles?.price?.fontSize && (isLargeFormat ? "text-[11px]" : "text-[9.5px]")
  );

  const notesClass = cn(
    "card-additional-notes leading-snug break-words",
    !styling.fieldStyles?.notes?.fontStyle && "italic",
    !styling.fieldStyles?.notes?.fontSize && (isLargeFormat ? "text-[9px]" : "text-[7.5px]")
  );

  // Render Visual Media Cluster (Thumbnail + QR)
  const renderMediaCluster = (extraClasses: string = "") => {
    if (!styling.showThumbnail && !styling.showQr) return null;

    return (
      <div
        className={cn(
          "card-media-cluster shrink-0 flex items-center gap-2",
          mediaLayout === "stacked" ? "flex-col items-center" : "flex-row items-center",
          extraClasses
        )}
      >
        {styling.showThumbnail && itemData.thumbnail && (
          <div
            className={cn(
              "overflow-hidden shrink-0 shadow-xs",
              thumbDimClass,
              thumbShapeClass,
              styling.thumbnailBorder !== false && "border border-stone-300 dark:border-stone-700"
            )}
          >
            <img
              src={itemData.thumbnail}
              alt={itemData.title}
              className="w-full h-full object-cover block"
            />
          </div>
        )}

        {styling.showQr && qrDataUrl && (
          <div className="flex flex-col items-center shrink-0">
            <div
              className={cn(
                "bg-white p-0.5 rounded border border-stone-300 shadow-xs print:shadow-none shrink-0",
                qrDimClass
              )}
            >
              <img
                src={qrDataUrl}
                alt={`QR for ${itemData.title}`}
                className="w-full h-full object-contain block"
              />
            </div>
            <span
              className="text-[6.5px] font-sans text-stone-500 tracking-tight mt-0.5 whitespace-nowrap"
              style={getResolvedFieldStyle("qrLabel", styling, cardFormat)}
            >
              Scan Provenance
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render Valuation / Price (Unstyled by default or optional badge)
  const renderPrice = (inline: boolean = false) => {
    if (styling.showPrice === false || !itemData.price) return null;

    return (
      <div
        className={cn(
          "card-price-container shrink-0",
          inline ? "inline-flex items-center" : "flex items-center"
        )}
      >
        <span
          className={priceClass}
          style={{
            color: styling.priceStyle === "badge" ? styling.headerColor : styling.textColor,
            ...getResolvedFieldStyle("price", styling, cardFormat),
          }}
        >
          {formatCurrency(itemData.price, itemData.currency || "INR")}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${dim.widthMm}mm`,
        height: `${dim.heightMm}mm`,
        minWidth: `${dim.widthMm}mm`,
        minHeight: `${dim.heightMm}mm`,
        maxWidth: `${dim.widthMm}mm`,
        maxHeight: `${dim.heightMm}mm`,
        backgroundColor: styling.cardBgColor,
        fontFamily: activeFontFamilyCss,
        textAlign: styling.textAlign,
        pageBreakInside: "avoid",
        breakInside: "avoid",
        ...style,
      }}
      className={cn(
        "placard-card-item relative border border-stone-200/80 p-3 sm:p-3.5 print:p-2.5 transition-all flex flex-col justify-between overflow-hidden shrink-0 select-none box-border",
        styling.showCropMarks &&
          "outline outline-1 outline-dashed outline-stone-300 print:outline-stone-400 -outline-offset-1",
        className
      )}
    >
      {/* 1. Border Styles */}
      {styling.borderStyle === "double-fillet" && (
        <div
          className="absolute inset-1.5 border pointer-events-none rounded-[1px]"
          style={{ borderColor: styling.headerColor + "55" }}
        >
          <div
            className="absolute inset-0.5 border pointer-events-none"
            style={{ borderColor: styling.headerColor + "25" }}
          />
        </div>
      )}
      {styling.borderStyle === "single-rule" && (
        <div className="absolute inset-1.5 border border-stone-300 print:border-black pointer-events-none rounded-[1px]" />
      )}

      {/* 2. Professional Trimmer Guides / Crop Marks */}
      {styling.showCropMarks && (
        <>
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-stone-400 print:border-black pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-stone-400 print:border-black pointer-events-none" />
        </>
      )}

      {/* 3. Header: Category / School on Left, Artist on Right */}
      {(styling.showCategory || styling.showArtist) && (
        <div
          className="relative z-10 flex items-center justify-between border-b pb-0.5 mb-1.5 shrink-0"
          style={{
            borderColor: styling.headerColor + "40",
            color: styling.headerColor,
          }}
        >
          <span
            className="tracking-widest text-[8px] sm:text-[8.5px] uppercase font-bold truncate max-w-[55%]"
            style={getResolvedFieldStyle("category", styling, cardFormat)}
          >
            {styling.showCategory ? itemData.category : ""}
          </span>
          <span
            className="tracking-wide text-[8px] sm:text-[8.5px] font-semibold shrink-0"
            style={getResolvedFieldStyle("artist", styling, cardFormat)}
          >
            {styling.showArtist ? itemData.artistName : ""}
          </span>
        </div>
      )}

      {/* 4. Orientation-Aware Layout Body */}
      {orientation === "portrait" ? (
        /* PORTRAIT ORIENTATION */
        <div
          className="relative z-10 flex-1 flex flex-col justify-between overflow-hidden"
          style={clampPaddingStyle}
        >
          {/* Top Section: Title & Medium */}
          <div className="space-y-1">
            {styling.showTitle !== false && (
              <h4
                className={titleClass}
                style={{
                  color: styling.titleColor,
                  ...getResolvedFieldStyle("title", styling, cardFormat),
                }}
              >
                {itemData.title || "Untitled Masterwork"}
              </h4>
            )}

            {styling.showMedium !== false && itemData.medium && (
              <p
                className={mediumClass}
                style={{
                  color: styling.textColor,
                  ...getResolvedFieldStyle("medium", styling, cardFormat),
                }}
              >
                {itemData.medium}
              </p>
            )}

            {(styling.showDimensions !== false || styling.showYear !== false) && (
              <p
                className={dimensionsClass}
                style={{
                  color: styling.textColor + "cc",
                  ...getResolvedFieldStyle("dimensions", styling, cardFormat),
                }}
              >
                {[
                  styling.showDimensions !== false ? itemData.dimensions : "",
                  styling.showYear !== false && itemData.year ? `Year: ${itemData.year}` : "",
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}
          </div>

          {/* Middle Section: Media Cluster */}
          {renderMediaCluster(
            styling.textAlign === "center"
              ? "justify-center my-1.5"
              : styling.textAlign === "right"
              ? "justify-end my-1.5"
              : "justify-start my-1.5"
          )}

          {/* Bottom Section: Unstyled Price & Curatorial Notes */}
          <div className="space-y-1 mt-auto shrink-0">
            {renderPrice()}

            {styling.showNotes !== false && itemData.additionalNotes && (
              <p
                className={notesClass}
                style={{
                  color: styling.textColor,
                  ...getResolvedFieldStyle("notes", styling, cardFormat),
                }}
              >
                {itemData.additionalNotes}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* LANDSCAPE ORIENTATION: Intelligent Flexible Flow */
        <div
          className="relative z-10 flex-1 flex flex-col justify-between overflow-hidden"
          style={clampPaddingStyle}
        >
          {mediaPlacement === "top-right" ? (
            /* TOP-RIGHT MEDIA PLACEMENT (Default balanced museum style) */
            <>
              <div className="flex items-start justify-between gap-3 flex-1 overflow-hidden">
                {/* Left: Title & Medium with generous wrap space */}
                <div className="flex-1 space-y-1 overflow-hidden pr-1">
                  {styling.showTitle !== false && (
                    <h4
                      className={titleClass}
                      style={{
                        color: styling.titleColor,
                        ...getResolvedFieldStyle("title", styling, cardFormat),
                      }}
                    >
                      {itemData.title || "Untitled Masterwork"}
                    </h4>
                  )}

                  {styling.showMedium !== false && itemData.medium && (
                    <p
                      className={mediumClass}
                      style={{
                        color: styling.textColor,
                        ...getResolvedFieldStyle("medium", styling, cardFormat),
                      }}
                    >
                      {itemData.medium}
                    </p>
                  )}
                </div>

                {/* Right: Media Cluster */}
                {renderMediaCluster("shrink-0 pt-0.5")}
              </div>

              {/* Bottom: Dimensions, Year, Notes, Price */}
              <div className="flex items-end justify-between gap-2 pt-1.5 mt-auto border-t border-stone-200/40">
                <div className="space-y-0.5 flex-1 overflow-hidden">
                  {(styling.showDimensions !== false || styling.showYear !== false) && (
                    <p
                      className={dimensionsClass}
                      style={{
                        color: styling.textColor + "cc",
                        ...getResolvedFieldStyle("dimensions", styling, cardFormat),
                      }}
                    >
                      {[
                        styling.showDimensions !== false ? itemData.dimensions : "",
                        styling.showYear !== false && itemData.year ? `Year: ${itemData.year}` : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}

                  {styling.showNotes !== false && itemData.additionalNotes && (
                    <p
                      className={notesClass}
                      style={{
                        color: styling.textColor,
                        ...getResolvedFieldStyle("notes", styling, cardFormat),
                      }}
                    >
                      {itemData.additionalNotes}
                    </p>
                  )}
                </div>

                {/* Clean Unstyled Price */}
                {renderPrice()}
              </div>
            </>
          ) : mediaPlacement === "bottom-right" ? (
            /* BOTTOM-RIGHT MEDIA PLACEMENT */
            <>
              {/* Full Width Top: Title & Medium */}
              <div className="space-y-1">
                {styling.showTitle !== false && (
                  <h4
                    className={titleClass}
                    style={{
                      color: styling.titleColor,
                      ...getResolvedFieldStyle("title", styling, cardFormat),
                    }}
                  >
                    {itemData.title || "Untitled Masterwork"}
                  </h4>
                )}

                {styling.showMedium !== false && itemData.medium && (
                  <p
                    className={mediumClass}
                    style={{
                      color: styling.textColor,
                      ...getResolvedFieldStyle("medium", styling, cardFormat),
                    }}
                  >
                    {itemData.medium}
                  </p>
                )}
              </div>

              {/* Bottom Split: Metadata on Left, Media Cluster on Right */}
              <div className="flex items-end justify-between gap-3 mt-auto pt-1">
                <div className="space-y-1 flex-1 overflow-hidden">
                  {(styling.showDimensions !== false || styling.showYear !== false) && (
                    <p
                      className={dimensionsClass}
                      style={{
                        color: styling.textColor + "cc",
                        ...getResolvedFieldStyle("dimensions", styling, cardFormat),
                      }}
                    >
                      {[
                        styling.showDimensions !== false ? itemData.dimensions : "",
                        styling.showYear !== false && itemData.year ? `Year: ${itemData.year}` : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}

                  {renderPrice()}

                  {styling.showNotes !== false && itemData.additionalNotes && (
                    <p
                      className={notesClass}
                      style={{
                        color: styling.textColor,
                        ...getResolvedFieldStyle("notes", styling, cardFormat),
                      }}
                    >
                      {itemData.additionalNotes}
                    </p>
                  )}
                </div>

                {renderMediaCluster("shrink-0")}
              </div>
            </>
          ) : mediaPlacement === "stacked" ? (
            /* STACKED RIGHT COLUMN (Compact side panel giving 74%+ width to titles) */
            <div className="flex items-stretch justify-between gap-3 flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col justify-between overflow-hidden pr-1">
                <div className="space-y-1">
                  {styling.showTitle !== false && (
                    <h4
                      className={titleClass}
                      style={{
                        color: styling.titleColor,
                        ...getResolvedFieldStyle("title", styling, cardFormat),
                      }}
                    >
                      {itemData.title || "Untitled Masterwork"}
                    </h4>
                  )}

                  {styling.showMedium !== false && itemData.medium && (
                    <p
                      className={mediumClass}
                      style={{
                        color: styling.textColor,
                        ...getResolvedFieldStyle("medium", styling, cardFormat),
                      }}
                    >
                      {itemData.medium}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5 mt-auto pt-1">
                  {(styling.showDimensions !== false || styling.showYear !== false) && (
                    <p
                      className={dimensionsClass}
                      style={{
                        color: styling.textColor + "cc",
                        ...getResolvedFieldStyle("dimensions", styling, cardFormat),
                      }}
                    >
                      {[
                        styling.showDimensions !== false ? itemData.dimensions : "",
                        styling.showYear !== false && itemData.year ? `Year: ${itemData.year}` : "",
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}

                  {renderPrice()}

                  {styling.showNotes !== false && itemData.additionalNotes && (
                    <p
                      className={notesClass}
                      style={{
                        color: styling.textColor,
                        ...getResolvedFieldStyle("notes", styling, cardFormat),
                      }}
                    >
                      {itemData.additionalNotes}
                    </p>
                  )}
                </div>
              </div>

              {renderMediaCluster("shrink-0 justify-center flex-col")}
            </div>
          ) : (
            /* INLINE FLOW (100% Full Width Flow) */
            <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-1">
              <div className="space-y-1">
                {styling.showTitle !== false && (
                  <h4
                    className={titleClass}
                    style={{
                      color: styling.titleColor,
                      ...getResolvedFieldStyle("title", styling, cardFormat),
                    }}
                  >
                    {itemData.title || "Untitled Masterwork"}
                  </h4>
                )}

                {styling.showMedium !== false && itemData.medium && (
                  <p
                    className={mediumClass}
                    style={{
                      color: styling.textColor,
                      ...getResolvedFieldStyle("medium", styling, cardFormat),
                    }}
                  >
                    {itemData.medium}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 my-1">
                {(styling.showDimensions !== false || styling.showYear !== false) && (
                  <p
                    className={dimensionsClass}
                    style={{
                      color: styling.textColor + "cc",
                      ...getResolvedFieldStyle("dimensions", styling, cardFormat),
                    }}
                  >
                    {[
                      styling.showDimensions !== false ? itemData.dimensions : "",
                      styling.showYear !== false && itemData.year ? `Year: ${itemData.year}` : "",
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}

                {renderMediaCluster()}
              </div>

              <div className="flex items-center justify-between gap-2 mt-auto">
                {styling.showNotes !== false && itemData.additionalNotes ? (
                  <p
                    className={notesClass}
                    style={{
                      color: styling.textColor,
                      ...getResolvedFieldStyle("notes", styling, cardFormat),
                    }}
                  >
                    {itemData.additionalNotes}
                  </p>
                ) : (
                  <div />
                )}

                {renderPrice()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Acrylic Base Margin Indicator (visible in UI guide, hidden when printing) */}
      {showAcrylicGuide && clampMargin !== "none" && (
        <div
          data-acrylic-guide="true"
          className="absolute bottom-0 inset-x-0 border-t border-dashed border-stone-300/60 bg-stone-50/50 print:hidden flex items-center justify-center pointer-events-none"
          style={{
            height: clampMargin === "minimal" ? "3mm" : clampMargin === "standard" ? "7mm" : "16mm",
          }}
        >
          <span className="text-[6px] uppercase tracking-wider text-stone-400 font-mono">
            {clampMargin === "acrylic-clamp" ? "Acrylic Stand Base Safe Zone (16mm)" : "Base Clamp Margin"}
          </span>
        </div>
      )}
    </div>
  );
}
