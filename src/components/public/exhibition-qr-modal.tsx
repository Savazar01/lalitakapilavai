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
import { PrivacyConsentCheckbox } from "@/components/ui/privacy-consent-checkbox";
import { FormCaptcha, FormCaptchaValue } from "@/components/ui/form-captcha";
import { FormOtpDialog } from "@/components/ui/form-otp-dialog";
import { toast } from "sonner";

export interface VisitorIdentity {
  visitorId: string;
  name: string;
  phone: string;
  email?: string;
}

const STORAGE_KEY = "savazai_visitor_identity";

export function getStoredVisitorIdentity(): VisitorIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.phone || parsed.name)) {
        return parsed as VisitorIdentity;
      }
    }
  } catch (err) {
    console.warn("Could not read visitor identity from localStorage", err);
  }

  // Fallback to cookie
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${STORAGE_KEY}=`));
    if (match) {
      const val = decodeURIComponent(match.split("=")[1]);
      const parsed = JSON.parse(val);
      if (parsed && (parsed.phone || parsed.name)) {
        return parsed as VisitorIdentity;
      }
    }
  } catch (err) {
    console.warn("Could not read visitor identity from cookie", err);
  }

  return null;
}

export function saveVisitorIdentity(data: VisitorIdentity) {
  if (typeof window === "undefined") return;
  try {
    const jsonStr = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    // 30 days cookie
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(jsonStr)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn("Could not save visitor identity", err);
  }
}

export interface ExhibitionQrModalProps {
  artworkId: string;
  artworkTitle: string;
  enableCaptcha?: boolean;
  enableEmailOtp?: boolean;
}

export function ExhibitionQrModal({
  artworkId,
  artworkTitle,
  enableCaptcha = false,
  enableEmailOtp = false,
}: ExhibitionQrModalProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [privacyConsent, setPrivacyConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);

  // Form Security & Anti-Bot States
  const [captchaValue, setCaptchaValue] = React.useState<FormCaptchaValue>({ token: "", answer: "" });
  const [otpDialogOpen, setOtpDialogOpen] = React.useState<boolean>(false);
  const [otpSessionToken, setOtpSessionToken] = React.useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = React.useState<{ payload: Record<string, unknown>; visitorData: VisitorIdentity } | null>(null);

  React.useEffect(() => {
    const isQr = searchParams.get("qr") === "true";
    if (!isQr) return;

    const existingIdentity = getStoredVisitorIdentity();

    if (existingIdentity && (existingIdentity.phone || existingIdentity.name)) {
      // Recognized Device: auto-log telemetry & skip gate
      const sessionScanKey = `qr_scan_logged_${artworkId}`;
      if (!sessionStorage.getItem(sessionScanKey)) {
        sessionStorage.setItem(sessionScanKey, "true");
        fetch("/api/leads/qr-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: existingIdentity.name,
            phone: existingIdentity.phone,
            email: existingIdentity.email,
            artworkId,
            artworkTitle,
            deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile",
            isBackgroundTelemetry: true,
          }),
        }).catch((err) => console.warn("Failed background QR telemetry log:", err));

        toast.success(`Welcome back, ${existingIdentity.name}! Masterpiece commentary unlocked.`);
      }
      return;
    }

    const alreadyRegistered = sessionStorage.getItem(`qr_visitor_${artworkId}`);
    if (!alreadyRegistered) {
      const timer = setTimeout(() => setIsOpen(true), 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, artworkId, artworkTitle]);

  const executeQrSubmission = async (payloadToSubmit: Record<string, unknown>, visitorData: VisitorIdentity) => {
    setSubmitting(true);
    try {
      // 1. Persist visitor identity for frictionless subsequent scans
      saveVisitorIdentity(visitorData);

      // 2. Dispatch QR scan lead telemetry
      const res = await fetch("/api/leads/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSubmit),
      });

      if (res.ok) {
        sessionStorage.setItem(`qr_visitor_${artworkId}`, "true");
        sessionStorage.setItem(`qr_scan_logged_${artworkId}`, "true");
        toast.success("Welcome! Exhibition provenance unlocked.");
        setUnlocked(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error) {
          toast.error(data.error);
        } else {
          sessionStorage.setItem(`qr_visitor_${artworkId}`, "true");
          toast.info("Thank you! Proceeding to exhibition details.");
          setIsOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerified = (token: string) => {
    setOtpSessionToken(token);
    if (pendingPayload) {
      executeQrSubmission(
        {
          ...pendingPayload.payload,
          otpSessionToken: token,
        },
        pendingPayload.visitorData
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your WhatsApp / phone number.");
      return;
    }
    if (enableEmailOtp && !email.trim()) {
      toast.error("Email address is required for verification.");
      return;
    }
    if (!privacyConsent) {
      toast.error("Please agree to the Privacy Policy to proceed.");
      return;
    }
    if (enableCaptcha && (!captchaValue.token || !captchaValue.answer.trim())) {
      toast.error("Please solve the bot protection math problem.");
      return;
    }

    const visitorId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `vis_${Date.now()}`;

    const visitorData: VisitorIdentity = {
      visitorId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    };

    const basePayload = {
      ...visitorData,
      artworkId,
      artworkTitle,
      deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile",
      enableCaptcha,
      captchaToken: enableCaptcha ? captchaValue.token : undefined,
      captchaAnswer: enableCaptcha ? captchaValue.answer : undefined,
      enableEmailOtp,
    };

    if (enableEmailOtp) {
      if (otpSessionToken) {
        await executeQrSubmission({ ...basePayload, otpSessionToken }, visitorData);
        return;
      }

      setSubmitting(true);
      try {
        const otpRes = await fetch("/api/security/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: visitorData.name,
            email: visitorData.email,
            formType: "QR_SCAN",
            targetId: artworkId,
            formTitle: artworkTitle,
          }),
        });

        const otpData = await otpRes.json();
        if (!otpRes.ok) {
          throw new Error(otpData.error || "Failed to initiate verification");
        }

        if (otpData.bypass && otpData.otpSessionToken) {
          setOtpSessionToken(otpData.otpSessionToken);
          await executeQrSubmission(
            { ...basePayload, otpSessionToken: otpData.otpSessionToken },
            visitorData
          );
          return;
        }

        setPendingPayload({ payload: basePayload, visitorData });
        setOtpDialogOpen(true);
        setSubmitting(false);
        return;
      } catch (err: unknown) {
        setSubmitting(false);
        const msg = err instanceof Error ? err.message : "Error initiating verification";
        toast.error(msg);
        return;
      }
    }

    await executeQrSubmission(basePayload, visitorData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[94vw] max-w-md max-h-[92dvh] sm:max-h-[85dvh] flex flex-col justify-between border-2 border-primary/60 shadow-2xl bg-card/98 backdrop-blur-xl p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto">
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between gap-4">
              <DialogHeader className="text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
                  <QrCode className="w-4 h-4" />
                  Exhibition Floor Guide
                </div>
                <DialogTitle className="text-lg sm:text-xl font-serif font-bold text-foreground">
                  Welcome to the Exhibition
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Enter your details to explore this masterpiece, view 22k gold leaf relief details, and access curator commentary for &quot;{artworkTitle}&quot;.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Your Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Smt. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    WhatsApp / Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 98450 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Email Address {enableEmailOtp ? "*" : "(Optional)"}
                  </label>
                  <Input
                    type="email"
                    placeholder="radhika@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={enableEmailOtp}
                    className="text-xs h-9"
                  />
                </div>

                {/* Arithmetic Bot Challenge */}
                {enableCaptcha && (
                  <FormCaptcha
                    value={captchaValue}
                    onChange={setCaptchaValue}
                    disabled={submitting}
                    className="pt-1"
                  />
                )}

                {/* Universal Privacy Policy Consent Checkbox */}
                <PrivacyConsentCheckbox
                  id="qr-privacy-consent"
                  checked={privacyConsent}
                  onChange={setPrivacyConsent}
                  required
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/50 sticky bottom-0 bg-card/95 backdrop-blur-sm -mx-2 px-2 pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground order-2 sm:order-1 cursor-pointer"
                >
                  Skip &amp; View
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={
                    submitting ||
                    !privacyConsent ||
                    !name.trim() ||
                    !phone.trim() ||
                    (enableEmailOtp && !email.trim()) ||
                    (enableCaptcha && (!captchaValue.token || !captchaValue.answer.trim()))
                  }
                  className="gap-2 font-serif font-bold order-1 sm:order-2 w-full sm:w-auto cursor-pointer"
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

      {/* 6-Digit Email OTP Challenge Dialog */}
      {enableEmailOtp && (
        <FormOtpDialog
          open={otpDialogOpen}
          onOpenChange={setOtpDialogOpen}
          email={email}
          name={name}
          formType="QR_SCAN"
          targetId={artworkId}
          onVerified={handleOtpVerified}
        />
      )}
    </>
  );
}

// Re-export alias for QrScanGateModal
export const QrScanGateModal = ExhibitionQrModal;
