"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PrivacyConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  id?: string;
  className?: string;
}

export function PrivacyConsentCheckbox({
  checked,
  onChange,
  required = true,
  id = "privacy-consent",
  className,
}: PrivacyConsentCheckboxProps) {
  return (
    <div className={cn("flex items-start gap-2.5 pt-2 text-xs text-muted-foreground select-none", className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 cursor-pointer accent-primary"
      />
      <label htmlFor={id} className="cursor-pointer leading-relaxed">
        I have read and agree to the{" "}
        <Link
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline hover:text-primary/80 font-medium inline-flex items-center gap-0.5"
        >
          Privacy Policy
        </Link>
        .
      </label>
    </div>
  );
}
