"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";

interface ImportAuditItem {
  row: number;
  title: string;
  slug: string;
  action: "created" | "updated" | "skipped" | "failed";
  details: string;
}

interface ImportAuditResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; title?: string; error: string }>;
  items: ImportAuditItem[];
}

interface ArtworkBulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ArtworkBulkImportModal({
  open,
  onOpenChange,
  onSuccess,
}: ArtworkBulkImportModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false);
  const [auditResult, setAuditResult] = React.useState<ImportAuditResult | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setSelectedFile(null);
    setAuditResult(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const res = await fetch("/api/admin/artworks/template");
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lalita-artworks-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Downloaded Excel import template");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      toast.error(msg);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Please select a valid Excel spreadsheet (.xlsx)");
        return;
      }
      setSelectedFile(file);
      setAuditResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Please upload an Excel workbook (.xlsx)");
        return;
      }
      setSelectedFile(file);
      setAuditResult(null);
    }
  };

  const handlePerformImport = async () => {
    if (!selectedFile) {
      toast.error("Please choose an Excel file to import");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/artworks/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setAuditResult(data);
      toast.success(
        `Import complete: ${data.created} created, ${data.updated} updated!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during bulk import";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseAndRefresh = () => {
    onOpenChange(false);
    if (auditResult && (auditResult.created > 0 || auditResult.updated > 0)) {
      onSuccess();
    }
    setTimeout(handleReset, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCloseAndRefresh();
      } else {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Bulk Import &amp; Catalog Mass Update
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an archival Excel catalog (.xlsx) to create new artworks or bulk update existing works by Slug/ID.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!auditResult ? (
            <>
              {/* File Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-primary bg-primary/10 scale-[0.99]"
                    : "border-border hover:border-primary/60 bg-muted/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to change
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Drag and drop your <span className="text-primary font-bold">.xlsx</span> spreadsheet here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse files from your computer
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions and Download Template Card */}
              <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    Curatorial Spreadsheet Specifications
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={downloadingTemplate}
                    className="h-7 text-xs gap-1"
                  >
                    {downloadingTemplate ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 text-primary" />
                    )}
                    Sample Template (.xlsx)
                  </Button>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Leave the <code className="text-foreground font-mono">ID</code> column blank to create a new artwork.</li>
                  <li>Provide an existing <code className="text-foreground font-mono">ID</code> or <code className="text-foreground font-mono">Slug</code> to update existing attributes.</li>
                  <li>Categories and subcategories will be resolved or automatically registered.</li>
                  <li>Embedded images in Column A are for visual reference; use <code className="text-foreground font-mono">Image URL</code> for source assets.</li>
                </ul>
              </div>
            </>
          ) : (
            /* Curatorial Audit Report */
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 rounded-lg border border-border bg-card/60 text-center">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    Total Processed
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground">
                    {auditResult.totalProcessed}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 block">
                    Created
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {auditResult.created}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700/40 dark:bg-blue-950/60 text-center">
                  <span className="text-[10px] uppercase font-mono text-blue-700 dark:text-blue-300 block">
                    Updated
                  </span>
                  <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
                    {auditResult.updated}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-rose-600 dark:text-rose-400 block">
                    Errors
                  </span>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {auditResult.errors.length}
                  </span>
                </div>
              </div>

              {/* Error Warnings List */}
              {auditResult.errors.length > 0 && (
                <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 space-y-1.5 text-xs text-rose-700 dark:text-rose-300">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Parsing Warnings &amp; Row Skips ({auditResult.errors.length})
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono">
                    {auditResult.errors.map((err, i) => (
                      <div key={i}>
                        Row {err.row}: {err.title ? `"${err.title}" — ` : ""}{err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itemized Audit Ledger */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  Itemized Curatorial Ledger
                </span>
                <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground font-mono text-[10px]">
                      <tr>
                        <th className="p-2 w-14 text-center">Row</th>
                        <th className="p-2">Artwork Title</th>
                        <th className="p-2 w-24">Action</th>
                        <th className="p-2">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {auditResult.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="p-2 text-center font-mono text-[11px] text-muted-foreground">
                            {item.row}
                          </td>
                          <td className="p-2 font-serif font-medium text-foreground">
                            {item.title}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                item.action === "created"
                                  ? "gold"
                                  : item.action === "updated"
                                  ? "outline"
                                  : "destructive"
                              }
                              className="text-[9px] uppercase tracking-wider"
                            >
                              {item.action}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground text-[11px] line-clamp-1">
                            {item.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between">
          {!auditResult ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={handlePerformImport}
                disabled={!selectedFile || uploading}
                className="gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Workbook...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    Execute Bulk Import
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Import Another File
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={handleCloseAndRefresh}
                className="gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done &amp; Refresh Catalog
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
