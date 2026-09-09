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

export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface DynamicFormBlockProps {
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
  formTitle = "Send Curatorial Inquiry",
  formSubtitle = "Direct correspondence with the atelier desk of Lalita Kapilavai.",
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
      id: "message",
      label: "Message / Commentary",
      type: "textarea",
      required: true,
      placeholder: "Specify artwork inquiries, dimensions, or bespoke requirements...",
    },
  ],
  pageSlug = "general",
  className = "",
}: DynamicFormBlockProps) {
  const [formData, setFormData] = React.useState<Record<string, string | boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

    fields.forEach((field) => {
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
        formTitle,
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

  if (isSuccess) {
    return (
      <div className={`p-8 sm:p-10 rounded-3xl border border-primary/40 bg-card/95 shadow-xl text-center space-y-4 max-w-xl mx-auto my-6 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto border border-primary/30 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            Correspondence Received
          </span>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {formTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
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
    <div className={`w-full max-w-2xl mx-auto my-6 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md shadow-xl p-6 sm:p-10 transition-colors ${className}`}>
      {/* Form Title & Narrative */}
      <div className="space-y-2 pb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            Atelier Curatorial Desk
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          {formTitle}
        </h3>
        {formSubtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {formSubtitle}
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
          {fields.map((field) => {
            const isEmail = field.type === "email";
            const isTel = field.type === "tel";
            const isTextarea = field.type === "textarea";
            const isSelect = field.type === "select";
            const isCheckbox = field.type === "checkbox";

            if (isCheckbox) {
              return (
                <div key={field.id} className="pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 bg-background/50 cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[field.id])}
                      onChange={(e) => handleInputChange(field.id, e.target.checked)}
                      className="mt-0.5 rounded border-primary text-primary focus:ring-primary"
                      required={field.required}
                    />
                    <span className="text-xs text-foreground/90 leading-snug">
                      {field.label} {field.required && <span className="text-amber-500 font-bold">*</span>}
                    </span>
                  </label>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    {field.label} {field.required && <span className="text-amber-500 font-bold">*</span>}
                  </span>
                  {!field.required && (
                    <span className="text-[10px] text-muted-foreground font-mono font-normal">
                      Optional
                    </span>
                  )}
                </Label>

                {isTextarea ? (
                  <Textarea
                    rows={4}
                    value={(formData[field.id] as string) || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder || "Enter details..."}
                    required={field.required}
                    className="text-xs leading-relaxed bg-background/60 border-border/80 focus:border-primary"
                  />
                ) : isSelect ? (
                  <Select
                    value={(formData[field.id] as string) || ""}
                    onValueChange={(val) => handleInputChange(field.id, val)}
                    required={field.required}
                  >
                    <SelectTrigger className="text-xs bg-background/60 border-border/80">
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={isEmail ? "email" : isTel ? "tel" : "text"}
                    value={(formData[field.id] as string) || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    className="text-xs bg-background/60 border-border/80 focus:border-primary"
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
            className="w-full h-11 text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 shadow-md cursor-pointer transition-all"
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
          <p className="text-[10px] text-center text-muted-foreground mt-2 font-mono">
            Directly encrypted and dispatched to Lalita Kapilavai curatorial records.
          </p>
        </div>
      </form>
    </div>
  );
}
