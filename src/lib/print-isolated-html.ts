/**
 * Isolated Iframe Print Driver
 * Injects HTML content directly into a clean, unstyled hidden <iframe> with dedicated
 * print stylesheets, isolated from parent Radix Dialogs, overlays, and Next.js DOM trees.
 * Enforces true physical metric/imperial dimensions and anti-splitting page break rules.
 */

export interface PlacardStylingConfig {
  fontFamily: "cinzel" | "cormorant" | "inter" | "georgia";
  textAlign: "left" | "center" | "right";
  cardBgColor: string;
  titleColor: string;
  textColor: string;
  headerColor: string;
  borderStyle: "double-fillet" | "single-rule" | "none";
  titleScale: "compact" | "standard" | "large";
  bodyScale: "compact" | "standard" | "large";
  showThumbnail: boolean;
  showQr: boolean;
  showCategory: boolean;
  showArtist: boolean;
  showCropMarks: boolean;
  showTitle?: boolean;
  showMedium?: boolean;
  showDimensions?: boolean;
  showYear?: boolean;
  showPrice?: boolean;
  showNotes?: boolean;
  fieldOrder?: string[];
}

export interface PlacardPrintOptions {
  title?: string;
  format?: "visiting-card" | "museum-placard";
  orientation?: "landscape" | "portrait";
  borderStyle?: "double-fillet" | "single-rule" | "none";
  showCropMarks?: boolean;
  styling?: PlacardStylingConfig;
}

export function getFontFamilyCss(font?: string): string {
  switch (font) {
    case "cinzel":
      return "'Cinzel', Georgia, serif";
    case "cormorant":
      return "'Cormorant Garamond', Garamond, Georgia, serif";
    case "inter":
      return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case "georgia":
    default:
      return "Georgia, 'Times New Roman', serif";
  }
}

export interface PhysicalDimensions {
  widthMm: number;
  heightMm: number;
  widthIn: string;
  heightIn: string;
}

export function getPhysicalDimensions(
  format: "visiting-card" | "museum-placard" = "visiting-card",
  orientation: "landscape" | "portrait" = "landscape"
): PhysicalDimensions {
  if (format === "museum-placard") {
    return orientation === "portrait"
      ? { widthMm: 63.5, heightMm: 101.6, widthIn: "2.5in", heightIn: "4in" }
      : { widthMm: 101.6, heightMm: 63.5, widthIn: "4in", heightIn: "2.5in" };
  }
  // Default: Visiting Card (3.5" x 2")
  return orientation === "portrait"
    ? { widthMm: 50.8, heightMm: 88.9, widthIn: "2in", heightIn: "3.5in" }
    : { widthMm: 88.9, heightMm: 50.8, widthIn: "3.5in", heightIn: "2in" };
}

export function printIsolatedElement(
  htmlContent: string,
  title: string = "Artwork Placards",
  options: PlacardPrintOptions = {}
) {
  if (typeof document === "undefined") return;

  // 1. Remove any previous print iframe
  const existingFrame = document.getElementById("isolated-print-iframe");
  if (existingFrame) {
    existingFrame.remove();
  }

  // 2. Create hidden iframe
  const iframe = document.createElement("iframe");
  iframe.id = "isolated-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // 3. Collect active stylesheets and font declarations from parent
  const parentStyles = Array.from(
    document.querySelectorAll("style, link[rel='stylesheet']")
  )
    .map((node) => node.outerHTML)
    .join("\n");

  const dim = getPhysicalDimensions(options.format, options.orientation);

  // 4. Assemble isolated print HTML document with physical scale & anti-split grid
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
        ${parentStyles}
        <style>
          @page {
            size: auto;
            margin: 10mm 8mm 10mm 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Georgia, serif;
          }
          /* Clean Gang-Run Grid: fixed cell widths prevent full-width page stretching */
          .isolated-print-container,
          .placard-sheet-grid {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 6mm 8mm !important;
            align-content: flex-start !important;
            justify-content: flex-start !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          /* Fixed physical scale card container - NEVER stretches to 100% width of the page */
          .placard-card-item {
            width: ${dim.widthMm}mm !important;
            min-width: ${dim.widthMm}mm !important;
            max-width: ${dim.widthMm}mm !important;
            height: ${dim.heightMm}mm !important;
            min-height: ${dim.heightMm}mm !important;
            max-height: ${dim.heightMm}mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            position: relative !important;
            background-color: ${options.styling?.cardBgColor || "#ffffff"} !important;
            font-family: ${getFontFamilyCss(options.styling?.fontFamily)} !important;
            text-align: ${options.styling?.textAlign || "left"} !important;
            padding: 3mm 3.5mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            margin: 0 !important;
          }
          .print\\:hidden,
          [data-acrylic-guide="true"] {
            display: none !important;
            visibility: hidden !important;
          }
        </style>
      </head>
      <body>
        <div class="isolated-print-container placard-sheet-grid">
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // 5. Wait for images to load and decode, then trigger print driver
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Print execution failed:", err);
    }
  };

  const images = Array.from(doc.images || []);
  if (images.length === 0) {
    setTimeout(triggerPrint, 150);
  } else {
    const imagePromises = images.map((img) => {
      img.loading = "eager";
      img.decoding = "sync";
      if (img.complete && img.naturalHeight !== 0) {
        return img.decode().catch(() => Promise.resolve());
      }
      return new Promise<void>((resolve) => {
        img.onload = () => {
          img.decode().then(() => resolve()).catch(() => resolve());
        };
        img.onerror = () => resolve();
      });
    });

    Promise.all(imagePromises).then(() => {
      setTimeout(triggerPrint, 300);
    });
  }

  // 6. Cleanup iframe after print
  const cleanup = () => {
    try {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    } catch {
      // Ignore cleanup error if already removed
    }
  };

  iframe.contentWindow?.addEventListener("afterprint", cleanup);
  setTimeout(cleanup, 60000); // 1 minute safety GC
}

/**
 * Headless Isolated HTML Print Driver with Asynchronous Preloader Barrier
 * Forces all images to eager/sync decoding and guarantees all nested images
 * are completely downloaded & decoded before triggering print rasterization.
 */
export async function printIsolatedHtml(
  htmlContent: string,
  title: string = "Document"
): Promise<void> {
  if (typeof document === "undefined") return;

  return new Promise<void>((resolve) => {
    const existing = document.getElementById("isolated-html-print-iframe");
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "isolated-html-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      resolve();
      return;
    }

    // Force all images to eager loading & sync decoding
    const normalizedHtml = htmlContent
      .replace(/loading=["']lazy["']/gi, 'loading="eager"')
      .replace(/decoding=["']async["']/gi, 'decoding="sync"');

    // Collect parent stylesheets and font declarations
    const parentStyles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']")
    )
      .map((node) => node.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
          ${parentStyles}
          <style>
            @media print {
              @page {
                size: auto;
                margin: 0 !important;
              }
              *, *::before, *::after {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                overflow: visible !important;
              }
              img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .catalog-plate-page, .plate-page, .catalog-page {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .print-hidden, .print\\:hidden {
                display: none !important;
                visibility: hidden !important;
              }
            }
          </style>
        </head>
        <body class="bg-white text-black p-0 m-0">
          ${normalizedHtml}
        </body>
      </html>
    `);
    doc.close();

    // Asynchronous image preloader decoding barrier
    const images = Array.from(doc.images);
    const imagePromises = images.map((img) => {
      img.loading = "eager";
      img.decoding = "sync";
      if (img.complete && img.naturalHeight !== 0) {
        return img.decode().catch(() => Promise.resolve());
      }
      return new Promise<void>((imgResolve) => {
        img.onload = () => {
          img.decode().then(() => imgResolve()).catch(() => imgResolve());
        };
        img.onerror = () => imgResolve();
      });
    });

    Promise.all(imagePromises).then(() => {
      // 500ms safety buffer for SVG filters or layout recalculation
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print execution failed:", e);
        } finally {
          setTimeout(() => {
            if (iframe && iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            resolve();
          }, 1000);
        }
      }, 500);
    });
  });
}

