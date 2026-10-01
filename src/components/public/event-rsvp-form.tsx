"use client";

import * as React from "react";
import { CheckCircle, Clock, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PrivacyConsentCheckbox } from "@/components/ui/privacy-consent-checkbox";
import { FormCaptcha, FormCaptchaValue } from "@/components/ui/form-captcha";
import { FormOtpDialog } from "@/components/ui/form-otp-dialog";

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
  requireDateSelection?: boolean; // Default true
  allowMultipleDates?: boolean; // Default false
  timeSlotRequirement?: "MANDATORY" | "OPTIONAL" | "DISABLED"; // Default "MANDATORY"
  slotIntervalMinutes?: number; // 15, 30, 45, 60, 120, or custom
  slotCapacity?: number | null;
  enableCaptcha?: boolean;
  enableEmailOtp?: boolean;
  customFields?: EventRsvpCustomField[];
}

export interface EventDailySchedule {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  label?: string; // e.g. "Day 1 - Vernissage"
}

interface EventRsvpFormProps {
  eventId: string;
  eventTitle: string;
  isRegistrationOpen: boolean;
  registrationFee: number | null;
  currency?: string;
  maxCapacity: number | null;
  rsvpConfig?: EventRsvpConfig | null;
  startDate?: string;
  endDate?: string | null;
  timezone?: string;
  dailySchedules?: EventDailySchedule[] | null;
}

function formatTime12h(timeStr: string): string {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const mFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mFormatted} ${ampm}`;
}

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 30): string[] {
  const [startH, startM] = (startTime || "10:00").split(":").map((v) => parseInt(v, 10));
  const [endH, endM] = (endTime || "18:00").split(":").map((v) => parseInt(v, 10));

  const startTotalMinutes = (isNaN(startH) ? 10 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  let endTotalMinutes = (isNaN(endH) ? 18 : endH) * 60 + (isNaN(endM) ? 0 : endM);

  const step = Math.max(5, intervalMinutes || 30);

  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes = startTotalMinutes + step;
  }

  const slots: string[] = [];
  for (let min = startTotalMinutes; min + step <= endTotalMinutes; min += step) {
    const slotStartH = Math.floor(min / 60);
    const slotStartM = min % 60;
    const slotEndH = Math.floor((min + step) / 60);
    const slotEndM = (min + step) % 60;

    const slotStartStr = `${String(slotStartH).padStart(2, "0")}:${String(slotStartM).padStart(2, "0")}`;
    const slotEndStr = `${String(slotEndH).padStart(2, "0")}:${String(slotEndM).padStart(2, "0")}`;

    slots.push(`${formatTime12h(slotStartStr)} - ${formatTime12h(slotEndStr)}`);
  }

  if (slots.length === 0) {
    slots.push(`${formatTime12h(startTime)} - ${formatTime12h(endTime)}`);
  }
  return slots;
}

export function EventRsvpForm({
  eventId,
  eventTitle,
  isRegistrationOpen,
  registrationFee,
  currency = "INR",
  rsvpConfig,
  startDate,
  endDate,
  dailySchedules,
}: EventRsvpFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [tickets, setTickets] = React.useState("1");
  const [customAnswers, setCustomAnswers] = React.useState<Record<string, string | boolean>>({});
  const [privacyConsent, setPrivacyConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  // Multi-Day & Slot Booking State
  const hasDailySchedules = Array.isArray(dailySchedules) && dailySchedules.length > 0;
  const allowMultipleDates = rsvpConfig?.allowMultipleDates === true;
  const requireDateSelection = rsvpConfig?.requireDateSelection !== false;
  const slotRequirement = rsvpConfig?.timeSlotRequirement || "MANDATORY";
  const slotInterval = rsvpConfig?.slotIntervalMinutes || 30;

  const [selectedDates, setSelectedDates] = React.useState<string[]>(() => {
    if (hasDailySchedules && dailySchedules[0]?.date) {
      return [dailySchedules[0].date];
    }
    return [];
  });
  const [activeDayIdx, setActiveDayIdx] = React.useState(0);
  const [selectedSlot, setSelectedSlot] = React.useState<string>("");

  // Determine active date string for single or primary date
  const activeDate = React.useMemo(() => {
    if (selectedDates.length > 0) {
      return selectedDates.join(", ");
    }
    if (hasDailySchedules) {
      return dailySchedules[activeDayIdx]?.date || "";
    }
    if (startDate) {
      try {
        return new Date(startDate).toISOString().slice(0, 10);
      } catch {
        return "";
      }
    }
    return "";
  }, [selectedDates, hasDailySchedules, dailySchedules, activeDayIdx, startDate]);

  const activeSlots = React.useMemo(() => {
    if (slotRequirement === "DISABLED") return [];

    if (hasDailySchedules) {
      const day = dailySchedules[activeDayIdx] || dailySchedules[0];
      return generateTimeSlots(day?.startTime || "10:00", day?.endTime || "18:00", slotInterval);
    }

    let startH = "10:00";
    let endH = "18:00";

    if (startDate) {
      try {
        const d = new Date(startDate);
        startH = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      } catch {}
    }

    if (endDate) {
      try {
        const d = new Date(endDate);
        endH = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      } catch {}
    }

    return generateTimeSlots(startH, endH, slotInterval);
  }, [slotRequirement, hasDailySchedules, dailySchedules, activeDayIdx, slotInterval, startDate, endDate]);

  // Form Security & Anti-Bot States
  const enableCaptcha = rsvpConfig?.enableCaptcha === true;
  const enableEmailOtp = rsvpConfig?.enableEmailOtp === true;

  const [captchaValue, setCaptchaValue] = React.useState<FormCaptchaValue>({ token: "", answer: "" });
  const [otpDialogOpen, setOtpDialogOpen] = React.useState<boolean>(false);
  const [otpSessionToken, setOtpSessionToken] = React.useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = React.useState<Record<string, unknown> | null>(null);

  const executeRegistration = async (payloadToSubmit: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSubmit),
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

  const handleOtpVerified = (token: string) => {
    setOtpSessionToken(token);
    if (pendingPayload) {
      executeRegistration({
        ...pendingPayload,
        otpSessionToken: token,
      });
    }
  };

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

  const handleToggleDate = (dateStr: string, idx: number) => {
    setActiveDayIdx(idx);
    if (allowMultipleDates) {
      setSelectedDates((prev) => {
        if (prev.includes(dateStr)) {
          // If unselecting, keep at least one if required
          const updated = prev.filter((d) => d !== dateStr);
          return updated;
        } else {
          return [...prev, dateStr];
        }
      });
    } else {
      setSelectedDates([dateStr]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyConsent) {
      toast.error("Please agree to the Privacy Policy to complete your RSVP.");
      return;
    }

    if (hasDailySchedules && requireDateSelection && selectedDates.length === 0) {
      toast.error("Please select at least one attendance date");
      return;
    }

    if (slotRequirement === "MANDATORY" && activeSlots.length > 0 && !selectedSlot) {
      toast.error("Please select an arrival time slot");
      return;
    }

    if (enableCaptcha && (!captchaValue.token || !captchaValue.answer.trim())) {
      toast.error("Please solve the bot protection math problem.");
      return;
    }

    const datesToSubmit = selectedDates.length > 0 ? selectedDates : (activeDate ? [activeDate] : []);
    const basePayload = {
      eventId,
      attendeeName: name,
      attendeeEmail: email,
      attendeePhone: phone || undefined,
      ticketCount: allowGuestCount ? (parseInt(tickets, 10) || 1) : 1,
      selectedDate: datesToSubmit.join(", ") || undefined,
      selectedDates: datesToSubmit,
      selectedSlot: selectedSlot || (slotRequirement === "OPTIONAL" ? "Anytime / Flexible Arrival" : undefined),
      customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
      enableCaptcha,
      captchaToken: enableCaptcha ? captchaValue.token : undefined,
      captchaAnswer: enableCaptcha ? captchaValue.answer : undefined,
      enableEmailOtp,
    };

    if (enableEmailOtp) {
      if (otpSessionToken) {
        await executeRegistration({ ...basePayload, otpSessionToken });
        return;
      }

      setSubmitting(true);
      try {
        const otpRes = await fetch("/api/security/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            formType: "EVENT_RSVP",
            targetId: eventId,
            formTitle: eventTitle,
          }),
        });

        const otpData = await otpRes.json();
        if (!otpRes.ok) {
          throw new Error(otpData.error || "Failed to initiate verification");
        }

        if (otpData.bypass && otpData.otpSessionToken) {
          setOtpSessionToken(otpData.otpSessionToken);
          await executeRegistration({ ...basePayload, otpSessionToken: otpData.otpSessionToken });
          return;
        }

        setPendingPayload(basePayload);
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

    await executeRegistration(basePayload);
  };

  if (registered) {
    return (
      <Card className="p-6 text-center border-primary/60 bg-primary/5 space-y-3">
        <CheckCircle className="w-10 h-10 text-primary mx-auto animate-bounce" />
        <CardTitle className="font-serif font-bold text-lg text-foreground">
          RSVP Confirmed
        </CardTitle>
        <div className="space-y-1 text-xs text-muted-foreground">
          {selectedDates.length > 0 ? (
            <p className="font-medium text-foreground">
              Date{selectedDates.length > 1 ? "s" : ""}:{" "}
              <span className="font-mono text-primary">{selectedDates.join(", ")}</span>
            </p>
          ) : activeDate ? (
            <p className="font-medium text-foreground">
              Date: <span className="font-mono text-primary">{activeDate}</span>
            </p>
          ) : null}
          {selectedSlot && (
            <p className="font-medium text-foreground">
              Time Slot: <span className="font-mono text-primary">{selectedSlot}</span>
            </p>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
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
          {/* Multi-Day Schedule Selector */}
          {hasDailySchedules && dailySchedules && dailySchedules.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {allowMultipleDates ? "Select Attendance Dates (Multi-Select)" : "Select Attendance Date"} {requireDateSelection && "*"}
                </label>
                {allowMultipleDates && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {selectedDates.length} day{selectedDates.length === 1 ? "" : "s"} selected
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {dailySchedules.map((day, idx) => {
                  const isDaySelected = selectedDates.includes(day.date);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDate(day.date, idx)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer",
                        isDaySelected
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                          : "border-border/80 bg-background hover:border-primary/40 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {allowMultipleDates && (
                          <input
                            type="checkbox"
                            checked={isDaySelected}
                            readOnly
                            className="w-3.5 h-3.5 accent-primary rounded pointer-events-none"
                          />
                        )}
                        <div>
                          <span className="block text-foreground font-medium">
                            {day.label || `Day ${idx + 1}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-primary font-medium">
                        {formatTime12h(day.startTime)} – {formatTime12h(day.endTime)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Time Slots (Mandatory or Optional) */}
          {slotRequirement !== "DISABLED" && activeSlots.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Select Time Slot {slotRequirement === "MANDATORY" ? "*" : "(Optional)"}
                </label>
                {selectedSlot ? (
                  <span className="text-[10px] font-mono text-primary font-bold">Selected</span>
                ) : slotRequirement === "MANDATORY" ? (
                  <span className="text-[10px] text-destructive font-mono">* Required</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono">Optional</span>
                )}
              </div>

              {slotRequirement === "OPTIONAL" && (
                <div className="mb-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot("Anytime / Flexible Arrival")}
                    className={cn(
                      "w-full py-1.5 px-3 rounded-md border text-xs font-medium transition-all text-center cursor-pointer",
                      selectedSlot === "Anytime / Flexible Arrival"
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border-border/80 bg-background hover:border-primary/50 text-foreground"
                    )}
                  >
                    ✨ Anytime / Flexible Arrival (Full Day Access)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {activeSlots.map((slot) => {
                  const isSlotSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "text-center py-2 px-1 rounded-md border text-[11px] font-mono transition-all cursor-pointer",
                        isSlotSelected
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                          : "border-border/80 bg-background hover:border-primary/50 text-foreground"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
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
              ) : field.type === "select" && field.options ? (
                <>
                  <label className="text-xs font-semibold text-foreground">
                    {field.label} {field.required && "*"}
                  </label>
                  <select
                    value={String(customAnswers[field.id] || "")}
                    onChange={(e) =>
                      setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                    }
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    required={field.required}
                  >
                    <option value="">Select an option...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="text-xs font-semibold text-foreground">
                    {field.label} {field.required && "*"}
                  </label>
                  <Input
                    placeholder={field.label}
                    value={String(customAnswers[field.id] || "")}
                    onChange={(e) =>
                      setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                    }
                    className="text-xs h-8"
                    required={field.required}
                  />
                </>
              )}
            </div>
          ))}

          {/* In-House Bot Protection CAPTCHA Challenge */}
          {enableCaptcha && (
            <div className="pt-2">
              <FormCaptcha
                value={captchaValue}
                onChange={setCaptchaValue}
                disabled={submitting}
              />
            </div>
          )}

          <PrivacyConsentCheckbox
            id={`rsvp-privacy-${eventId}`}
            checked={privacyConsent}
            onChange={setPrivacyConsent}
            required
            className="pt-3 pb-1"
          />

          <Button
            type="submit"
            disabled={submitting || !privacyConsent}
            className="w-full mt-2 h-9 text-xs font-semibold cursor-pointer"
          >
            {submitting ? "Confirming..." : buttonLabel}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center pt-1">
            Privacy Protected. Pass details will be emailed to your inbox.
          </p>
        </form>
      </CardContent>

      {/* Email OTP Verification Dialog */}
      <FormOtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        email={email}
        name={name}
        formType="EVENT_RSVP"
        targetId={eventId}
        formTitle={eventTitle}
        onVerified={handleOtpVerified}
      />
    </Card>
  );
}
