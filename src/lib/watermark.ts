/**
 * Watermark SVG Generation Engine for Lalita Kapilavai Fine Art & Archive
 * Provides responsive, cross-platform SVG overlays with robust Unicode encoding and Linux system fonts.
 */

export function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[©\u00A9]/g, "&#169;")
    .replace(/[\u2014]/g, "&#8212;")
    .replace(/[\u2013]/g, "&#8211;");
}

export type WatermarkStyle = "REPEAT_DIAGONAL" | "BANNER" | "CORNER" | "BOTH";

export interface WatermarkOptions {
  width: number;
  height: number;
  text: string;
  opacity?: number;
  fontSize?: number;
  style?: WatermarkStyle | string;
}

export function generateWatermarkSvg(options: WatermarkOptions): string {
  const { width, height, text } = options;
  const rawStyle = (options.style || "REPEAT_DIAGONAL").toUpperCase();
  const style: WatermarkStyle =
    rawStyle === "BANNER" ||
    rawStyle === "CORNER" ||
    rawStyle === "BOTH" ||
    rawStyle === "REPEAT_DIAGONAL"
      ? (rawStyle as WatermarkStyle)
      : rawStyle === "DIAGONAL"
      ? "REPEAT_DIAGONAL"
      : "REPEAT_DIAGONAL";

  const safeText = escapeXml(text || "© Lalita Kapilavai | lalitakapilavai.com");

  // Proportional font sizing
  const computedFontSize =
    options.fontSize && options.fontSize > 0
      ? options.fontSize
      : Math.max(16, Math.min(Math.round(width * 0.026), 44));

  const opacity = Math.min(Math.max(options.opacity ?? 0.35, 0.1), 0.95);

  // Cross-platform universal font families (ensured present via Debian fonts-dejavu-core & fonts-freefont-ttf)
  const sansFont = "'DejaVu Sans', 'FreeSans', Arial, Helvetica, sans-serif";

  let bodySvg = "";

  // 1. Full Diagonal Repeated Watermark Pattern across the entire canvas
  if (style === "REPEAT_DIAGONAL" || style === "BOTH") {
    const patternWidth = Math.max(320, Math.round(computedFontSize * 16));
    const patternHeight = Math.max(160, Math.round(computedFontSize * 8));
    const diagOpacity = style === "BOTH" ? Math.min(opacity * 0.7, 0.25) : opacity;

    bodySvg += `
      <defs>
        <pattern id="wm-diagonal-pattern" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
          <text
            x="30"
            y="${patternHeight / 2}"
            font-family="${sansFont}"
            font-size="${computedFontSize}px"
            font-weight="600"
            fill="rgba(255, 255, 255, ${diagOpacity})"
            letter-spacing="2"
          >
            ${safeText}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm-diagonal-pattern)" />
    `;
  }

  // 2. Crisp Bottom Protection Banner with Temple-Gold Divider Line
  if (style === "BANNER" || style === "BOTH") {
    const bannerHeight = Math.max(40, Math.round(computedFontSize * 2.2));
    const bannerOpacity = Math.max(0.8, Math.min(opacity + 0.5, 0.96));

    bodySvg += `
      <defs>
        <filter id="wmBannerShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
      </defs>
      <!-- Obsidian Protection Footer -->
      <rect
        x="0"
        y="${height - bannerHeight}"
        width="${width}"
        height="${bannerHeight}"
        fill="#0F0E0D"
        fill-opacity="${bannerOpacity}"
      />
      <!-- Antique Temple-Gold Divider Rule -->
      <line
        x1="0"
        y1="${height - bannerHeight}"
        x2="${width}"
        y2="${height - bannerHeight}"
        stroke="#D4AF37"
        stroke-width="2"
        stroke-opacity="0.9"
      />
      <!-- Attribution Typography -->
      <text
        x="${width / 2}"
        y="${height - bannerHeight / 2 + computedFontSize / 3}"
        text-anchor="middle"
        font-family="${sansFont}"
        font-size="${computedFontSize}px"
        font-weight="600"
        fill="#FAF7F2"
        fill-opacity="0.95"
        letter-spacing="1"
        filter="url(#wmBannerShadow)"
      >
        ${safeText}
      </text>
    `;
  }

  // 3. Crisp Corner Stamp Badge (Bottom-Right)
  if (style === "CORNER") {
    const badgePadX = 18;
    const badgePadY = 10;
    const badgeWidth = Math.min(width * 0.7, safeText.length * (computedFontSize * 0.6) + badgePadX * 2);
    const badgeHeight = computedFontSize + badgePadY * 2;
    const margin = 20;
    const posX = width - badgeWidth - margin;
    const posY = height - badgeHeight - margin;

    bodySvg += `
      <g transform="translate(${posX}, ${posY})">
        <rect
          width="${badgeWidth}"
          height="${badgeHeight}"
          rx="6"
          fill="#0F0E0D"
          fill-opacity="${Math.max(0.85, opacity)}"
          stroke="#D4AF37"
          stroke-width="1.5"
          stroke-opacity="0.9"
        />
        <text
          x="${badgeWidth / 2}"
          y="${badgeHeight / 2 + computedFontSize / 3}"
          text-anchor="middle"
          font-family="${sansFont}"
          font-size="${computedFontSize}px"
          font-weight="600"
          fill="#FAF7F2"
          fill-opacity="0.95"
          letter-spacing="1"
        >
          ${safeText}
        </text>
      </g>
    `;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${bodySvg}
    </svg>
  `;
}
