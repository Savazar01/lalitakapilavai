"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, QrCode, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExhibitionQrModalProps {
  artworkId: string;
  artworkTitle: string;
}

export function ExhibitionQrModal({
  artworkId,
  artworkTitle,
}: ExhibitionQrModalProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);

  React.useEffect(() => {
    const isQr = searchParams.get("qr") === "true";
    const alreadyRegistered = sessionStorage.getItem(`qr_visitor_${artworkId}`);
    if (isQr && !alreadyRegistered) {
      const timer = setTimeout(() => setIsOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, artworkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          sourceArtworkId: artworkId,
          subject: `Exhibition Floor Scan: ${artworkTitle}`,
          message: `Visitor scanned physical gallery QR for artwork: ${artworkTitle}`,
        }),
      });

      if (res.ok) {
        sessionStorage.setItem(`qr_visitor_${artworkId}`, "true");
        setUnlocked(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 1800);
      } else {
        alert("Thank you! Proceeding to exhibition details.");
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md border-2 border-primary/60 shadow-2xl bg-card/95 backdrop-blur-xl">
        {unlocked ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto animate-bounce" />
            <DialogTitle className="text-xl font-serif font-bold text-foreground">
              Welcome to the Exhibition
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Masterwork commentary, 22k gold relief details, and synesthetic raga links unlocked.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
                <QrCode className="w-4 h-4" />
                Exhibition Floor Guide
              </div>
              <DialogTitle className="text-xl font-serif font-bold text-foreground">
                Welcome to the Exhibition
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Enter your details to explore this masterpiece, view 22k gold leaf relief details, and access curator commentary for &quot;{artworkTitle}&quot;.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Your Full Name *
                </label>
                <Input
                  placeholder="e.g. Smt. Radhika Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Email Address (Optional)
                </label>
                <Input
                  type="email"
                  placeholder="radhika@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  WhatsApp / Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98450 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground"
              >
                Skip &amp; View
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={submitting}
                className="gap-2 font-serif font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Unlock Masterwork Details
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
