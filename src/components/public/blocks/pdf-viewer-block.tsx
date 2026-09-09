"use client";

import * as React from "react";
import { FileText, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PdfViewerBlockProps {
  fileUrl?: string;
  fileName?: string;
  title?: string;
  height?: number;
  allowDownload?: boolean;
  className?: string;
}

export function PdfViewerBlock({
  fileUrl,
  fileName = "Document.pdf",
  title = "Archival Document & Curatorial Catalog",
  height = 650,
  allowDownload = true,
  className = "",
}: PdfViewerBlockProps) {
  const [loadError, setLoadError] = React.useState(false);

  if (!fileUrl) {
    return (
      <div className="w-full rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-2">
        <FileText className="w-8 h-8 text-muted-foreground/60 mx-auto" />
        <p className="font-serif text-sm font-semibold text-foreground">
          No PDF Document Selected
        </p>
        <p className="text-xs text-muted-foreground">
          Upload an archival monograph, catalog, or curatorial brochure.
        </p>
      </div>
    );
  }

  const effectiveHeight = Math.max(350, height || 650);

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-4 transition-all",
        className
      )}
    >
      {/* Document Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-foreground">
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground font-mono">
                {fileName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 uppercase tracking-widest font-mono">
                <ShieldCheck className="w-3 h-3" /> Archival Document
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-all cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>

          {allowDownload && (
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-serif uppercase tracking-wider bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 rounded-md font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          )}
        </div>
      </div>

      {/* Embedded Document Frame */}
      <div
        className="w-full rounded-lg border border-border/60 overflow-hidden bg-muted/20 relative shadow-inner"
        style={{ height: `${effectiveHeight}px` }}
      >
        {!loadError ? (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            title={title}
            className="w-full h-full border-0"
            onError={() => setLoadError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <FileText className="w-12 h-12 text-primary/40" />
            <div>
              <p className="font-serif font-bold text-foreground text-sm">
                Embedded Preview Unavailable
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Your browser may not support inline PDF rendering. You can download the document directly below.
              </p>
            </div>
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif uppercase tracking-wider bg-primary text-primary-foreground rounded shadow hover:bg-primary/90 transition-all"
            >
              <Download className="w-4 h-4" /> Download Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
