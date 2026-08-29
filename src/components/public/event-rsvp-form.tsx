"use client";

import * as React from "react";
import { CheckCircle, Loader2, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface EventRsvpFormProps {
  eventId: string;
  eventTitle: string;
  isRegistrationOpen: boolean;
  registrationFee: number | null;
  currency?: string;
  maxCapacity: number | null;
}

export function EventRsvpForm({
  eventId,
  eventTitle,
  isRegistrationOpen,
  registrationFee,
  currency = "INR",
}: EventRsvpFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [tickets, setTickets] = React.useState("1");
  const [submitting, setSubmitting] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  if (!isRegistrationOpen) {
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
          ticketCount: parseInt(tickets, 10) || 1,
        }),
      });

      if (res.ok) {
        setRegistered(true);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit RSVP");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting registration");
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
          We look forward to welcoming you to &quot;{eventTitle}&quot;. A confirmation has been registered with our desk.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/80 shadow-lg">
      <CardHeader className="pb-3 text-left">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif font-bold text-lg text-foreground">
            Reserve Your Attendance
          </CardTitle>
          <span className="text-xs font-mono font-bold text-primary">
            {registrationFee
              ? formatCurrency(registrationFee * parseInt(tickets || "1", 10), currency)
              : "Free Admission"}
          </span>
        </div>
        <CardDescription className="text-xs">
          Complimentary exhibition catalog and reserved recital seating.
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone / WhatsApp</label>
              <Input
                type="tel"
                placeholder="+91 98450 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Attendees</label>
              <select
                value={tickets}
                onChange={(e) => setTickets(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1">1 Person</option>
                <option value="2">2 Persons</option>
                <option value="3">3 Persons</option>
                <option value="4">4 Persons</option>
              </select>
            </div>
          </div>

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
                Confirm RSVP
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
