"use client";

import * as React from "react";
import { Mail, Clock, RefreshCw, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface FormOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  name: string;
  formType: "CONTACT" | "EVENT_RSVP" | "QR_SCAN" | "CUSTOM_PAGE";
  targetId?: string;
  formTitle?: string;
  initialDevCode?: string;
  onVerified: (otpSessionToken: string) => void;
}

export function FormOtpDialog({
  open,
  onOpenChange,
  email,
  name,
  formType,
  targetId,
  formTitle = "Archival Portal",
  initialDevCode,
  onVerified,
}: FormOtpDialogProps) {
  const [code, setCode] = React.useState<string>("");
  const [verifying, setVerifying] = React.useState<boolean>(false);
  const [resending, setResending] = React.useState<boolean>(false);
  const [timeLeft, setTimeLeft] = React.useState<number>(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = React.useState<number>(60); // 60 seconds cooldown
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Timer countdown
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) {
      setCode("");
      setErrorMsg(null);
      return;
    }

    setTimeLeft(300);
    setResendCooldown(60);
    if (initialDevCode) {
      setCode(initialDevCode);
      toast.info(`[Dev Mode] Verification code: ${initialDevCode}`);
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [open, initialDevCode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/security/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          code: cleanCode,
          formType,
          targetId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      toast.success("Email verified successfully!");
      onVerified(data.otpSessionToken);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/security/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          formType,
          targetId,
          formTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      if (data.bypass && data.otpSessionToken) {
        toast.success("Identity recognized! Direct submission permitted.");
        onVerified(data.otpSessionToken);
        onOpenChange(false);
        return;
      }

      toast.success("A fresh verification code has been dispatched!");
      setTimeLeft(300);
      setResendCooldown(60);
      if (data.devCode) {
        setCode(data.devCode);
        toast.info(`[Dev Mode] Verification code: ${data.devCode}`);
      } else {
        setCode("");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-md p-6 bg-card/98 border border-primary/40 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <Mail className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-xl font-bold text-foreground">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            To ensure visitor authenticity, we sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground underline">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">6-Digit Code</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                Expires in {formatTimer(timeLeft)}
              </span>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={verifying}
              autoFocus
              className="h-13 text-center font-mono text-2xl font-bold tracking-[0.5em] selection:bg-primary selection:text-primary-foreground"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${resending ? "animate-spin" : ""}`}
              />
              {resendCooldown > 0
                ? `Resend Code (${resendCooldown}s)`
                : "Resend Code"}
            </Button>

            <span className="text-[11px] text-muted-foreground">
              Checked your spam folder?
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={verifying}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={verifying || code.trim().length !== 6 || timeLeft === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-xs cursor-pointer min-w-28"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Verify &amp; Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
