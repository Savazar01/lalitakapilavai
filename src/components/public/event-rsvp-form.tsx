"use client";

import * as React from "react";
import { CheckCircle, Loader2, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


export interface EventRsvpCustomField {
  id: string;
  label: string;
  type: "text" | "select" | "checkbox";
  options?: string[];
  required: boolean;
}

export interface EventRsvpConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  requirePhone?: boolean;
  allowGuestCount?: boolean;
  maxGuestsPerRsvp?: number;
  submitButtonLabel?: string;
  successMessage?: string;
  customFields?: EventRsvpCustomField[];
}

interface EventRsvpFormProps {
  eventId: string;
  eventTitle: string;
  isRegistrationOpen: boolean;
  registrationFee: number | null;
  currency?: string;
  maxCapacity: number | null;
  rsvpConfig?: EventRsvpConfig | null;
}

export function EventRsvpForm({
  eventId,
  eventTitle,
  isRegistrationOpen,
  registrationFee,
  currency = "INR",
  rsvpConfig,
}: EventRsvpFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [tickets, setTickets] = React.useState("1");
  const [customAnswers, setCustomAnswers] = React.useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  const isEnabled = rsvpConfig?.enabled !== false && isRegistrationOpen;

  if (!isEnabled) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Ticket className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <CardTitle className="text-base font-serif">Registrations Closed</CardTitle>
        <CardDescription className="text-xs mt-1">
          RSVPs for this event have reached capacity or have concluded.
        </CardDescription>
      </Card>
    );
  }

  const title = rsvpConfig?.title || "Reserve Your Attendance";
  const subtitle = rsvpConfig?.subtitle || "Complimentary exhibition catalog and reserved recital seating.";
  const requirePhone = rsvpConfig?.requirePhone === true;
  const allowGuestCount = rsvpConfig?.allowGuestCount !== false;
  const maxGuests = rsvpConfig?.maxGuestsPerRsvp || 4;
  const buttonLabel = rsvpConfig?.submitButtonLabel || "Confirm RSVP";
  const successMsg = rsvpConfig?.successMessage || `We look forward to welcoming you to "${eventTitle}". A confirmation has been registered with our desk.`;
  const customFields = rsvpConfig?.customFields || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          attendeeName: name,
          attendeeEmail: email,
          attendeePhone: phone || undefined,
          ticketCount: allowGuestCount ? (parseInt(tickets, 10) || 1) : 1,
          customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Registration confirmed! We look forward to welcoming you.");
        setRegistered(true);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to submit RSVP");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error submitting registration");
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <Card className="p-6 text-center border-primary/60 bg-primary/5 space-y-3">
        <CheckCircle className="w-10 h-10 text-primary mx-auto animate-bounce" />
        <CardTitle className="font-serif font-bold text-lg text-foreground">
          RSVP Confirmed
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {successMsg}
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/80 shadow-lg">
      <CardHeader className="pb-3 text-left">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif font-bold text-lg text-foreground">
            {title}
          </CardTitle>
          <span className="text-xs font-mono font-bold text-primary">
            {registrationFee
              ? formatCurrency(registrationFee * parseInt(tickets || "1", 10), currency)
              : "Free Admission"}
          </span>
        </div>
        <CardDescription className="text-xs">
          {subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name *</label>
            <Input
              placeholder="e.g. Smt. Gayatri Iyer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs h-8"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email Address *</label>
            <Input
              type="email"
              placeholder="gayatri@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-8"
              required
            />
          </div>

          <div className={cn("grid gap-2", allowGuestCount ? "grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Phone / WhatsApp {requirePhone && "*"}
              </label>
              <Input
                type="tel"
                placeholder="+91 98450 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-8"
                required={requirePhone}
              />
            </div>

            {allowGuestCount && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Attendees</label>
                <select
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: Math.min(Math.max(maxGuests, 1), 10) }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1} {i === 0 ? "Person" : "Persons"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {customFields.map((field) => (
            <div key={field.id} className="space-y-1">
              {field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(customAnswers[field.id])}
                    onChange={(e) =>
                      setCustomAnswers({ ...customAnswers, [field.id]: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary rounded"
                    required={field.required}
                  />
                  <span>
                    {field.label} {field.required && "*"}
                  </span>
                </label>
              ) : (
                <>
                  <label className="text-xs font-semibold text-foreground">
                    {field.label} {field.required && "*"}
                  </label>
                  <Input
                    value={String(customAnswers[field.id] || "")}
                    onChange={(e) =>
                      setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                    }
                    placeholder="Your answer..."
                    className="text-xs h-8"
                    required={field.required}
                  />
                </>
              )}
            </div>
          ))}

          <Button
            type="submit"
            variant="gold"
            disabled={submitting}
            className="w-full font-serif font-bold text-xs h-9 mt-2 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Reserving...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {buttonLabel}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
