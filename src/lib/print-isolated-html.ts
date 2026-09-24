/**
 * Isolated Iframe Print Driver
 * Injects HTML content directly into a clean, unstyled hidden <iframe> with dedicated
 * print stylesheets, isolated from parent Radix Dialogs, overlays, and Next.js DOM trees.
 */

export interface PrintIsolatedOptions {
  title?: string;
  orientation?: "landscape" | "portrait";
  columns?: number;
}

export function printIsolatedElement(
  htmlContent: string,
  title: string = "Artwork Placards",
  options: PrintIsolatedOptions = {}
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

  const pageOrientation = options.orientation || "auto";

  // 4. Assemble isolated print HTML document
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
            size: ${pageOrientation};
            margin: 6mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box;
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
          }
          .isolated-print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .placard-card-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .print\\:hidden,
          [data-acrylic-guide="true"] {
            display: none !important;
            visibility: hidden !important;
          }
        </style>
      </head>
      <body>
        <div class="isolated-print-container">
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // 5. Wait for images to load, then trigger print driver
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
    let loadedCount = 0;
    const totalCount = images.length;
    let finished = false;

    const checkAllLoaded = () => {
      if (finished) return;
      loadedCount++;
      if (loadedCount >= totalCount) {
        finished = true;
        setTimeout(triggerPrint, 150);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
      }
    });

    // Fallback safety timeout if any remote image stalls
    setTimeout(() => {
      if (!finished) {
        finished = true;
        triggerPrint();
      }
    }, 600);
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
