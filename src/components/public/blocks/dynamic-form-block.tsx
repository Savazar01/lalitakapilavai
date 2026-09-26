"use client";

import * as React from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface DynamicFormConfig {
  title?: string;
  subtitle?: string;
  fields?: FormFieldConfig[];
  cardBg?: string;          // Overrides global --form-card-bg for this block
  labelColor?: string;      // Overrides global --form-label-color for this block
  inputBg?: string;         // Overrides global --form-input-bg for this block
  inputBorderColor?: string;// Overrides global --form-input-border
  btnBg?: string;           // Overrides global --form-btn-bg
  btnText?: string;         // Overrides global --form-btn-text
}

export interface DynamicFormBlockProps {
  formConfig?: DynamicFormConfig;
  formTitle?: string;
  formSubtitle?: string;
  submitButtonText?: string;
  successMessage?: string;
  notifyEmail?: boolean;
  recipientEmails?: string;
  emailSubjectTemplate?: string;
  fields?: FormFieldConfig[];
  pageSlug?: string;
  className?: string;
}

export function DynamicFormBlock({
  formConfig,
  formTitle = "Send Curatorial Inquiry",
  formSubtitle = "Direct correspondence with the curatorial atelier desk.",
  submitButtonText = "Submit Inquiry",
  successMessage = "Thank you for your correspondence. The curatorial desk will respond shortly.",
  notifyEmail = true,
  recipientEmails = "",
  emailSubjectTemplate = "",
  fields = [
    {
      id: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "e.g. Smt. Gayatri Iyer",
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "curator@example.com",
    },
    {
      id: "phone",
      label: "Phone / WhatsApp",
      type: "tel",
      required: false,
      placeholder: "+91 98450 12345",
    },
    {
      id: "inquiry_type",
      label: "Inquiry Type",
      type: "select",
      required: false,
      placeholder: "Select an option",
      options: [
        "Artwork Acquisition",
        "Commission Work",
        "Private Viewing / RSVP",
        "Carnatic Music Recital",
        "General Curatorial Question",
      ],
    },
    {
      id: "message",
      label: "Message / Commentary",
      type: "textarea",
      required: true,
      placeholder: "Specify masterwork inquiries, dimensions, or bespoke requirements...",
    },
  ],
  pageSlug = "general",
  className = "",
}: DynamicFormBlockProps) {
  const [formData, setFormData] = React.useState<Record<string, string | boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const effectiveTitle = formConfig?.title || formTitle;
  const effectiveSubtitle = formConfig?.subtitle !== undefined ? formConfig.subtitle : formSubtitle;
  const effectiveFields = formConfig?.fields && formConfig.fields.length > 0 ? formConfig.fields : fields;

  const handleInputChange = (fieldId: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Identify standard fields vs custom fields
    let fullName = "";
    let email = "";
    let phone = "";
    let message = "";
    const customFields: Record<string, unknown> = {};

    effectiveFields.forEach((field) => {
      const val = formData[field.id];
      const lower = field.label.toLowerCase();

      if (field.id === "name" || lower.includes("full name") || lower.includes("name")) {
        if (!fullName && typeof val === "string") fullName = val;
      } else if (field.id === "email" || lower.includes("email")) {
        if (!email && typeof val === "string") email = val;
      } else if (field.id === "phone" || lower.includes("phone") || lower.includes("whatsapp")) {
        if (!phone && typeof val === "string") phone = val;
      } else if (field.id === "message" || lower.includes("message") || lower.includes("notes") || lower.includes("comment")) {
        if (!message && typeof val === "string") message = val;
      } else if (val !== undefined && val !== "") {
        customFields[field.label] = val;
      }
    });

    // Fallbacks if not mapped by labels
    if (!fullName && typeof formData["name"] === "string") fullName = formData["name"];
    if (!email && typeof formData["email"] === "string") email = formData["email"];

    if (!fullName.trim() || !email.trim()) {
      setIsSubmitting(false);
      setErrorMessage("Please provide both your Name and a valid Email Address.");
      return;
    }

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        formTitle: effectiveTitle,
        pageSlug,
        notifyEmail,
        recipientEmails: recipientEmails.trim() || undefined,
        emailSubjectTemplate: emailSubjectTemplate.trim() || undefined,
        customFields,
      };

      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send inquiry.");

      setIsSuccess(true);
      toast.success("Inquiry sent successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit inquiry";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    ...(formConfig?.cardBg
      ? { ["--form-card-bg" as string]: formConfig.cardBg, backgroundColor: formConfig.cardBg }
      : { backgroundColor: "var(--form-card-bg, var(--card))" }),
    ...(formConfig?.labelColor ? { ["--form-label-color" as string]: formConfig.labelColor } : {}),
    ...(formConfig?.inputBg ? { ["--form-input-bg" as string]: formConfig.inputBg } : {}),
    ...(formConfig?.inputBorderColor
      ? { ["--form-input-border" as string]: formConfig.inputBorderColor, borderColor: formConfig.inputBorderColor }
      : { borderColor: "var(--form-input-border, var(--border))" }),
    ...(formConfig?.btnBg ? { ["--form-btn-bg" as string]: formConfig.btnBg } : {}),
    ...(formConfig?.btnText ? { ["--form-btn-text" as string]: formConfig.btnText } : {}),
  };

  if (isSuccess) {
    return (
      <div
        data-form-container="true"
        className={cn(
          "p-8 sm:p-10 rounded-2xl border border-primary/40 bg-card text-card-foreground shadow-xl text-center space-y-4 max-w-xl mx-auto my-6",
          className
        )}
        style={containerStyle}
      >
        <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto border border-primary/30 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Correspondence Received
          </span>
          <h3
            className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50"
            style={{ color: "var(--headings, var(--foreground))" }}
          >
            {effectiveTitle}
          </h3>
          <p
            className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {successMessage}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsSuccess(false);
            setFormData({});
          }}
          className="text-xs mt-4 cursor-pointer"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div
      data-form-container="true"
      className={cn(
        "w-full max-w-2xl mx-auto my-6 rounded-2xl border p-6 sm:p-10 shadow-sm transition-colors text-card-foreground",
        className
      )}
      style={containerStyle}
    >
      {/* Form Title & Narrative */}
      <div className="space-y-2 pb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Atelier Curatorial Desk
          </span>
        </div>
        <h3
          className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50"
          style={{ color: "var(--headings, var(--foreground))" }}
        >
          {effectiveTitle}
        </h3>
        {effectiveSubtitle && (
          <p
            className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {effectiveSubtitle}
          </p>
        )}
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleSubmit} className="space-y-5 pt-6 text-left">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          {effectiveFields.map((field) => {
            const isEmail = field.type === "email";
            const isTel = field.type === "tel";
            const isTextarea = field.type === "textarea";
            const isSelect = field.type === "select";
            const isCheckbox = field.type === "checkbox";

            if (isCheckbox) {
              return (
                <div key={field.id} className="pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 cursor-pointer hover:border-amber-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[field.id])}
                      onChange={(e) => handleInputChange(field.id, e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      required={field.required}
                    />
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">
                      {field.label} {field.required && <span className="text-amber-600 dark:text-amber-400 font-bold">*</span>}
                    </span>
                  </label>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <Label
                  htmlFor={field.id}
                  className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide select-none flex items-center justify-between"
                  style={{ color: "var(--form-label-color)" }}
                >
                  <span>
                    {field.label} {field.required && <span className="text-amber-600 dark:text-amber-400 font-bold">*</span>}
                  </span>
                  {!field.required && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">
                      Optional
                    </span>
                  )}
                </Label>

                {isTextarea ? (
                  <Textarea
                    id={field.id}
                    rows={4}
                    value={(formData[field.id] as string) || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder || "Enter details..."}
                    required={field.required}
                    className="text-xs sm:text-sm leading-relaxed"
                  />
                ) : isSelect ? (
                  <Select
                    value={(formData[field.id] as string) || ""}
                    onValueChange={(val) => handleInputChange(field.id, val)}
                    required={field.required}
                  >
                    <SelectTrigger id={field.id} className="text-xs sm:text-sm">
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs sm:text-sm">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={isEmail ? "email" : isTel ? "tel" : "text"}
                    value={(formData[field.id] as string) || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    className="text-xs sm:text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 h-11 text-xs font-bold tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950"
            style={{
              backgroundColor: "var(--form-btn-bg)",
              color: "var(--form-btn-text)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Dispatching Inquiry...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>
          <p
            className="text-[11px] text-center text-slate-600 dark:text-slate-400 mt-2.5 font-mono"
            style={{ color: "var(--form-placeholder-color, var(--muted-foreground))" }}
          >
            Directly encrypted and dispatched to atelier curatorial records.
          </p>
        </div>
      </form>
    </div>
  );
}
