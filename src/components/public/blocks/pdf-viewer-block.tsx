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
    <div className={cn("w-full transition-all", className)}>
      {/* 1. Mobile & Tablet Fallback Card (< md: <768px) */}
      <div className="block md:hidden w-full bg-[#1C1814] border border-amber-500/30 rounded-xl p-6 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
          <FileText className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 uppercase tracking-widest font-mono">
            <ShieldCheck className="w-3 h-3" /> Archival Document
          </div>
          <h4 className="text-stone-100 font-serif font-bold text-base line-clamp-2 pt-1">
            {title || "Archival Document"}
          </h4>
          <p className="text-stone-400 text-xs font-mono truncate max-w-xs mx-auto">
            {fileName}
          </p>
          <p className="text-stone-400 text-xs pt-1">
            PDF Document • Tap below to view in full resolution or download.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Open in PDF Viewer
          </a>

          {allowDownload && (
            <a
              href={fileUrl}
              download={fileName || "document.pdf"}
              className="w-full py-2.5 px-4 rounded-lg border border-amber-600/40 hover:bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Document
            </a>
          )}
        </div>
      </div>

      {/* 2. Desktop Embedded Frame & Toolbar (>= md: >=768px) */}
      <div className="hidden md:block w-full rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-5 shadow-lg space-y-4">
        {/* Document Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-foreground">
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
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-all cursor-pointer"
              title="Open in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open</span>
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
    </div>
  );
}
