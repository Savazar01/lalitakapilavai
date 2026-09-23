"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { ExhibitionWallViewer, MountedArtwork } from "@/components/public/exhibition-wall-viewer";

export interface ExhibitionSimulatorModalProps {
  artwork?: Partial<MountedArtwork>;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function ExhibitionSimulatorModal({
  artwork,
  triggerText = "View on Exhibition Wall",
  triggerVariant = "outline",
  triggerClassName = "",
  children,
}: ExhibitionSimulatorModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant={triggerVariant}
            className={`gap-2 cursor-pointer font-serif ${triggerClassName}`}
          >
            <Compass className="w-4 h-4 text-amber-500" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[92vw] lg:max-w-7xl h-[92vh] p-0 overflow-hidden bg-stone-950 border-stone-800 text-stone-100 rounded-2xl shadow-2xl">
        <ExhibitionWallViewer
          initialArtwork={artwork}
          showCloseButton={true}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
