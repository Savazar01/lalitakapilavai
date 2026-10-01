"use client";

import * as React from "react";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PrivacyRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyRequestModal({ open, onOpenChange }: PrivacyRequestModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [requestType, setRequestType] = React.useState("Full Data Erasure & Do Not Sell");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      toast.error("Please enter either an email or phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/privacy/erasure-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          requestType,
          notes: notes.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Privacy request registered successfully.");
        // If user submitted on this device, clear local visitor identity as well!
        if (typeof window !== "undefined") {
          localStorage.removeItem("savazai_visitor_identity");
          document.cookie = "savazai_visitor_identity=; path=/; max-age=0";
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (submitted) {
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[94vw] max-w-md max-h-[92dvh] sm:max-h-[85dvh] flex flex-col justify-between border-2 border-primary/50 shadow-2xl bg-card/98 backdrop-blur-xl p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto animate-bounce" />
            <DialogTitle className="text-xl font-serif font-bold text-foreground">
              Request Received
            </DialogTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your request for personal data erasure and communication suppression has been dispatched to our privacy team and recorded in our opt-out database.
            </p>
            <div className="pt-2">
              <Button onClick={handleClose} variant="outline" size="sm" className="text-xs">
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between gap-4">
            <DialogHeader className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Data Protection &amp; Privacy Rights
              </div>
              <DialogTitle className="text-lg sm:text-xl font-serif font-bold text-foreground">
                Privacy Rights &amp; Data Erasure
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Submit this form to exercise your rights under GDPR, CCPA, or regional privacy regulations to purge your personal telemetry, inquiry history, or opt out of correspondence.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1 text-left text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Your Full Name (Optional)</label>
                <Input
                  placeholder="e.g. Smt. Radhika Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address *</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone / WhatsApp (Optional)</label>
                <Input
                  type="tel"
                  placeholder="+91 98450 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Request Scope</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Full Data Erasure & Do Not Sell">Full Data Erasure &amp; Do Not Sell</option>
                  <option value="Marketing & RSVP Suppression Only">Marketing &amp; RSVP Suppression Only</option>
                  <option value="Erase QR Scan Telemetry">Erase QR Scan Telemetry</option>
                  <option value="Subject Access Request (SAR)">Subject Access Request (SAR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Additional Context (Optional)</label>
                <Textarea
                  placeholder="Provide any additional identifiers or specific requests..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/50 sticky bottom-0 bg-card/95 backdrop-blur-sm -mx-2 px-2 pb-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-xs text-muted-foreground order-2 sm:order-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={submitting || (!email.trim() && !phone.trim())}
                className="gap-2 font-serif font-bold order-1 sm:order-2 w-full sm:w-auto cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Submit Erasure Request
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

export function PrivacyModalTrigger({
  className = "hover:text-primary transition-colors cursor-pointer text-left bg-transparent p-0 border-0 text-[11px]",
  label = "Privacy Rights / Data Removal",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>
      <PrivacyRequestModal open={open} onOpenChange={setOpen} />
    </>
  );
}
