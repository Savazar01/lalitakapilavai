"use client";

import * as React from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogPrintButtonProps {
  catalogTitle: string;
}

export function CatalogPrintButton({ catalogTitle }: CatalogPrintButtonProps) {
  const [printing, setPrinting] = React.useState(false);

  const handlePrint = () => {
    setPrinting(true);
    // Brief timeout allows any deferred styles or images to settle
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 250);
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
      Download PDF / Print
    </Button>
  );
}
