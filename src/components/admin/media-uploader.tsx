"use client";

import * as React from "react";
import {
  UploadCloud,
  X,
  Loader2,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface MediaUploaderProps {
  value?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  mediaType?: "general" | "artwork" | "logo" | "document";
  className?: string;
  description?: string;
}

export function MediaUploader({
  value = "",
  onUploadComplete,
  onRemove,
  accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff,image/heic,image/heif,image/heic-sequence,.heic,.heics",
  mediaType = "general",
  className = "",
  description,
}: MediaUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [isHeicFile, setIsHeicFile] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [mode, setMode] = React.useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = React.useState(value || "");
  const [prevValue, setPrevValue] = React.useState(value);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setUrlInput(value || "");
  }

  const handleProcessFile = async (file: File) => {
    const isHeic =
      file.type.includes("heic") ||
      file.type.includes("heif") ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heics");
    setIsHeicFile(isHeic);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType);
    formData.append("isArtwork", mediaType === "artwork" ? "true" : "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const finalUrl =
        data.publicUrl ||
        data.watermarkedUrl ||
        data.primaryImageUrl ||
        data.fileUrl;

      if (!finalUrl) {
        throw new Error("Upload succeeded but URL was not returned.");
      }

      onUploadComplete(finalUrl);
      setUrlInput(finalUrl);
      toast.success("Media uploaded successfully");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error("Please enter a valid media URL");
      return;
    }
    onUploadComplete(urlInput.trim());
    toast.success("Media URL applied");
  };

  const isPdf = value && (value.endsWith(".pdf") || value.includes(".pdf?"));

  return (
    <div className={cn("space-y-2", className)}>
      {/* Existing Value Preview */}
      {value ? (
        <div className="relative rounded-lg border border-border/80 bg-card/70 p-3 shadow-sm transition-all flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isPdf ? (
              <div className="w-12 h-12 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-md overflow-hidden border border-border/80 bg-background/80 shrink-0 flex items-center justify-center">
                <img
                  src={value}
                  alt="Media preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground truncate block">
                  {value.split("/").pop() || "Uploaded Asset"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[280px] sm:max-w-xs">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="h-7 text-xs px-2.5 cursor-pointer"
              disabled={uploading}
            >
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Remove Media"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Empty Upload State */
        <div className="space-y-2">
          {/* Mode Switcher */}
          <div className="flex items-center justify-end gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={cn(
                "px-2 py-0.5 rounded transition-colors cursor-pointer",
                mode === "file"
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upload Local File
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "px-2 py-0.5 rounded transition-colors cursor-pointer",
                mode === "url"
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Paste Remote URL
            </button>
          </div>

          {mode === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!uploading && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={cn(
                "relative rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-border/80 hover:border-primary/60 bg-card/40 hover:bg-card/70",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {isHeicFile
                      ? "Converting Apple HEIC to Archival Format..."
                      : "Uploading & processing asset..."}
                  </span>
                  {isHeicFile && (
                    <span className="text-[10px] text-muted-foreground">
                      Transcoding uncompressed buffer &amp; optimizing derivatives via Sharp
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      Click to upload or drag &amp; drop
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {description || "WebP, JPG, PNG, TIFF, and Apple HEIC/HEICS up to 50MB"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /media/public/..."
                  className="pl-8 text-xs font-mono h-8"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyUrl}
                variant="secondary"
                className="h-8 text-xs shrink-0 cursor-pointer"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
