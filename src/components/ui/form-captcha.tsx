"use client";

import * as React from "react";
import { ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormCaptchaValue {
  token: string;
  answer: string;
}

export interface FormCaptchaProps {
  value?: FormCaptchaValue;
  onChange: (val: FormCaptchaValue) => void;
  className?: string;
  disabled?: boolean;
}

export function FormCaptcha({
  value = { token: "", answer: "" },
  onChange,
  className,
  disabled = false,
}: FormCaptchaProps) {
  const [question, setQuestion] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const fetchChallenge = React.useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/security/captcha/generate", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load security challenge");
      const data = await res.json();
      setQuestion(data.question);
      onChange({ token: data.token, answer: "" });
    } catch (err) {
      console.error("[FormCaptcha] Fetch error:", err);
      setFetchError("Could not load challenge. Click to retry.");
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  React.useEffect(() => {
    if (!question && !value.token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchChallenge();
    }
  }, [fetchChallenge, question, value.token]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      token: value.token,
      answer: e.target.value.trim(),
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 p-3 sm:p-4 backdrop-blur-xs space-y-2.5 shadow-2xs transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Bot Protection Challenge
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={fetchChallenge}
          disabled={loading || disabled}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          title="Refresh challenge"
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5 mr-1", loading && "animate-spin")}
          />
          New Problem
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground font-mono text-sm font-semibold tracking-wide select-none">
          {loading ? (
            <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Generating math challenge...
            </span>
          ) : fetchError ? (
            <span className="text-xs text-destructive">{fetchError}</span>
          ) : (
            question || "Loading..."
          )}
        </div>

        <div className="w-full sm:w-36">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Answer"
            value={value.answer}
            onChange={handleAnswerChange}
            disabled={loading || disabled}
            required
            aria-label="CAPTCHA answer"
            className="h-10 text-center font-mono font-medium text-sm tracking-wider"
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-normal">
        Solve the quick arithmetic challenge above to verify human submission.
      </p>
    </div>
  );
}
