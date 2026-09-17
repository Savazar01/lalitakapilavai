"use client";

import * as React from "react";
import { QrCode, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CatalogQrModalProps {
  catalogSlug: string;
  catalogTitle: string;
  catalogSubtitle?: string;
}

export function CatalogQrModal({ catalogSlug, catalogTitle, catalogSubtitle }: CatalogQrModalProps) {
  const [open, setOpen] = React.useState(false);
  const [qrSvg, setQrSvg] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (open && !qrSvg) {
      const fetchQr = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/catalogs/${catalogSlug}/qrcode?format=svg&download=false`);
          if (res.ok) {
            const svg = await res.text();
            if (active) setQrSvg(svg);
          }
        } catch (err) {
          console.error("Error loading QR:", err);
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchQr();
    }
    return () => {
      active = false;
    };
  }, [open, catalogSlug, qrSvg]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary px-3 py-1.5 rounded-md border border-border transition-all cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-primary" />
          <span>Share via QR</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md p-6 bg-card border-border shadow-2xl text-foreground text-center space-y-4">
        <DialogHeader className="space-y-1 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
            <QrCode className="w-5 h-5" />
          </div>
          <DialogTitle className="font-serif text-lg font-bold">
            Scan to Open Digital Monograph
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {catalogSubtitle ? `${catalogTitle} — ${catalogSubtitle}` : catalogTitle}
          </DialogDescription>
        </DialogHeader>

        {/* QR Display */}
        <div className="p-4 rounded-xl bg-white text-slate-900 border border-border/80 shadow-md w-fit mx-auto max-w-[240px] aspect-square flex items-center justify-center">
          {loading ? (
            <div className="text-xs text-muted-foreground animate-pulse">
              Generating High-Res QR...
            </div>
          ) : qrSvg ? (
            <div
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="text-xs text-rose-500">Failed to load QR code</div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
          Scan with any mobile camera at exhibition galleries or private viewings to launch this interactive e-catalog.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          <a
            href={`/api/admin/catalogs/${catalogSlug}/qrcode?format=svg&download=true`}
            download={`${catalogSlug}-qr.svg`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-md bg-secondary hover:bg-secondary/80 border border-border transition-colors text-foreground"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Vector SVG
          </a>
          <a
            href={`/api/admin/catalogs/${catalogSlug}/qrcode?format=png&download=true`}
            download={`${catalogSlug}-qr.png`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            High-Res PNG
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
