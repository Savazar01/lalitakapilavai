/**
 * Watermark SVG Generation Engine for Lalita Kapilavai Fine Art & Archive
 * Provides responsive, cross-platform SVG overlays with web-safe serif typography.
 */

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export interface WatermarkOptions {
  width: number;
  height: number;
  text: string;
  opacity?: number;
  fontSize?: number;
  style?: "BANNER" | "DIAGONAL";
}

export function generateWatermarkSvg(options: WatermarkOptions): string {
  const { width, height, text, style = "BANNER" } = options;
  const safeText = escapeXml(text || "© Lalita Kapilavai | lalitakapilavai.com");

  // Proportional font sizing
  const computedFontSize =
    options.fontSize && options.fontSize > 0
      ? options.fontSize
      : Math.max(16, Math.min(Math.round(width * 0.026), 44));

  const opacity = Math.min(Math.max(options.opacity ?? 0.85, 0.2), 1.0);

  if (style === "DIAGONAL") {
    // Elegant diagonal watermark across the canvas
    const diagFontSize = Math.max(20, Math.min(Math.round(width * 0.04), 56));
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="diagShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
        </defs>
        <g transform="translate(${width / 2}, ${height / 2}) rotate(-28)">
          <!-- Semi-transparent protective pill -->
          <rect
            x="${-(width * 0.4)}"
            y="${-(diagFontSize * 1.2)}"
            width="${width * 0.8}"
            height="${diagFontSize * 2.4}"
            rx="12"
            fill="#0F0E0D"
            fill-opacity="${opacity * 0.75}"
            stroke="#D4AF37"
            stroke-width="1.5"
            stroke-opacity="${opacity * 0.9}"
          />
          <text
            x="0"
            y="${diagFontSize * 0.35}"
            text-anchor="middle"
            font-family="'Cinzel', Georgia, 'DejaVu Serif', 'Times New Roman', serif"
            font-size="${diagFontSize}px"
            font-weight="700"
            fill="#FAF7F2"
            fill-opacity="${opacity}"
            filter="url(#diagShadow)"
          >
            ${safeText}
          </text>
        </g>
      </svg>
    `;
  }

  // Default: Bottom Protection Banner with Temple-Gold Accent Line
  const bannerHeight = Math.max(42, Math.round(computedFontSize * 2.3));

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wmTextShadow" x="-10%" y="-10%" width="120%" height="120%">
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
        fill-opacity="${Math.max(0.8, opacity)}"
      />
      <!-- Antique Temple-Gold Divider Rule -->
      <line
        x1="0"
        y1="${height - bannerHeight}"
        x2="${width}"
        y2="${height - bannerHeight}"
        stroke="#D4AF37"
        stroke-width="2"
        stroke-opacity="${Math.max(0.85, opacity)}"
      />
      <!-- Watermark Attribution Typography -->
      <text
        x="${width / 2}"
        y="${height - bannerHeight / 2 + computedFontSize / 3}"
        text-anchor="middle"
        font-family="'Cinzel', Georgia, 'DejaVu Serif', 'Times New Roman', serif"
        font-size="${computedFontSize}px"
        font-weight="700"
        fill="#FAF7F2"
        fill-opacity="0.95"
        filter="url(#wmTextShadow)"
      >
        ${safeText}
      </text>
    </svg>
  `;
}
