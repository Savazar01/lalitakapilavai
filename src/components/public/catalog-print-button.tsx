"use client";

import * as React from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogPrintButtonProps {
  catalogTitle: string;
}

export function CatalogPrintButton({ catalogTitle }: CatalogPrintButtonProps) {
  const [printing, setPrinting] = React.useState(false);
  const [statusText, setStatusText] = React.useState<string | null>(null);

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    setStatusText("Preparing High-Res Plates...");

    try {
      // Find all images within the catalog document container
      const container = document.querySelector(".catalog-document") || document;
      const images = Array.from(container.querySelectorAll("img"));

      // Force eager loading & sync decoding on all images
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

      // Barrier: wait for all plate images to download & decode into memory
      await Promise.all(imagePromises);

      // Safety buffer for complex layout settlement
      await new Promise((resolve) => setTimeout(resolve, 500));

      window.print();
    } catch (err) {
      console.error("Catalog print preloader failed, triggering fallback print:", err);
      window.print();
    } finally {
      setTimeout(() => {
        setPrinting(false);
        setStatusText(null);
      }, 1000);
    }
  };

  return (
    <Button
      onClick={handlePrint}
      disabled={printing}
      size="sm"
      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer text-xs font-semibold inline-flex items-center gap-1.5"
      title={`Print or Save "${catalogTitle}" as PDF document`}
    >
      {printing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Printer className="w-3.5 h-3.5" />
      )}
      {statusText || "Download PDF / Print"}
    </Button>
  );
}

