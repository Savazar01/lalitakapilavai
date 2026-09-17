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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Image as ImageSingle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaVaultItem {
  id: string;
  url: string;
  fileName: string;
  title?: string;
  source: "artwork" | "event" | "catalog" | "storage";
  category?: string;
  createdAt?: string;
}

interface MediaVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaVaultDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Select from Media Vault",
}: MediaVaultDialogProps) {
  const [items, setItems] = React.useState<MediaVaultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [source, setSource] = React.useState("all");
  const [selectedUrl, setSelectedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    if (open) {
      const loadData = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            search,
            source,
            limit: "50",
          });
          const res = await fetch("/api/admin/media?" + params.toString());
          if (res.ok) {
            const data = await res.json();
            if (active) setItems(data.items || []);
          }
        } catch (err) {
          console.error("Failed to load media items:", err);
        } finally {
          if (active) setLoading(false);
        }
      };
      loadData();
    }
    return () => {
      active = false;
    };
  }, [open, search, source]);

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4l max-h-[85vh] flex flex-col p-6 bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lw font-serif font-bold text-foreground flex items-center gap-2">
            <ImageSingle className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Browse and reuse existing archival masterworks, high-res plates, exhibition banners, and stored media.
          </DialogDescription>
        </DialogHeader>


        <div className="flex flex-col sm:flex-row items-center gap-2 py-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, filename, or category..."
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>


          <div className="flex items-center gap-1 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Assets" },
              { id: "artwork", label: "Artworks" },
              { id: "event", label: "Events" },
              { id: "catalog", label: "Catalogs" },
              { id: "storage", label: "Vault Files" },
            ].map((s) => (
              <Button
                key={s.id}
                type="button"
                variant={source === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSource(s.id)}
                className={cn(
                  "h-8 text-[11px] px-2.5 font-medium cursor-pointer shrink-0",
                  source === s.id ? "bg-primary text-primary-foreground font-semibold" : ""
                )}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>


        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[460px] pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Accessing Server Media Vault...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed rounded-xl border-border/80">
              <ImageSingle className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">No media assets found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Try searching with a different keyword or upload files using the local uploader.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {items.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={cn(
                      "group relative rounded-xl border overflow-hidden cursor-pointer transition-all bg-background/60 hover:shadow-md flex flex-col",
                      isSelected
                        ? "border-primary ring-2 ring-primary shadow-md"
                        : "border-border/80 hover:border-primary/50"
                    )}
                  >
                    <div className="aspect-square relative bg-muted/30 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title || item.fileName}
                        className="w-full h-ull object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = "0.3";
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1">
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 bg-background/90 backdrop-blur-xs font-mono"
                        >
                          {item.source}
                        </Badge>
                      </div>
                    </div>


                    <div className="p-2 text-left space-y-0.5 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate" title={item.title || item.fileName}>
                        {item.title || item.fileName}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate font-mono">
                        {item.category || item.fileName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedUrl ? (
              <span className="truncate max-w-xs block font-mono text-[10px]">
                Selected: {selectedUrl.split("/").pop()}
              </span>
            ) : (
              "Select an image to attach"
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedUrl}
              onClick={handleConfirm}
              className="text-xs font-semibold cursor-pointer bg-primary text-primary-foreground"
            >
              Choose Asset
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
