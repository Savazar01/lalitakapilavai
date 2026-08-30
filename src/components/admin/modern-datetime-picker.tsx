"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  zonedTimeToUtc,
  utcToZonedParts,
} from "@/lib/geo-timezone";

interface ModernDateTimePickerProps {
  value: string; // UTC ISO string or empty
  onChange: (isoUtcString: string) => void;
  timeZone: string; // Target IANA timezone, e.g. "America/New_York"
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ModernDateTimePicker({
  value,
  onChange,
  timeZone = "Asia/Kolkata",
  label,
  placeholder = "Select date & time...",
  disabled = false,
}: ModernDateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract current zoned parts from the incoming UTC value
  const zoned = React.useMemo(() => {
    return value ? utcToZonedParts(value, timeZone) : null;
  }, [value, timeZone]);

  const defaultParts = React.useMemo(() => {
    return utcToZonedParts(new Date(), timeZone);
  }, [timeZone]);

  // Calendar month/year navigation state
  const [viewYear, setViewYear] = React.useState(zoned ? zoned.year : defaultParts.year);
  const [viewMonth, setViewMonth] = React.useState(zoned ? zoned.month : defaultParts.month);

  const selectedYear = zoned ? zoned.year : null;
  const selectedMonth = zoned ? zoned.month : null;
  const selectedDay = zoned ? zoned.day : null;
  const selectedHour12 = zoned ? zoned.hour12 : 9;
  const selectedMinute = zoned ? zoned.minute : 0;
  const selectedAmPm = zoned ? zoned.ampm : "AM";

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Compute number of days in the viewing month
  const daysInMonth = React.useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);

  // First day index of viewing month (0 = Sun, 6 = Sat)
  const firstDayOfMonth = React.useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).getDay();
  }, [viewYear, viewMonth]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Emit updated UTC Date whenever user chooses a day or time
  const emitChange = (
    y: number,
    m: number,
    d: number,
    h12: number,
    min: number,
    ampm: "AM" | "PM"
  ) => {
    let h24 = h12 % 12;
    if (ampm === "PM") h24 += 12;

    const utcDate = zonedTimeToUtc(y, m, d, h24, min, timeZone);
    onChange(utcDate.toISOString());
  };

  const handleSelectDay = (day: number) => {
    emitChange(viewYear, viewMonth, day, selectedHour12, selectedMinute, selectedAmPm);
  };

  const handleTimeChange = (newHour: number, newMin: number, newAmPm: "AM" | "PM") => {
    if (selectedYear && selectedMonth && selectedDay) {
      emitChange(selectedYear, selectedMonth, selectedDay, newHour, newMin, newAmPm);
    } else {
      // If day not picked yet, default to viewing year, month, and today's day
      const today = Math.min(new Date().getDate(), daysInMonth);
      emitChange(viewYear, viewMonth, today, newHour, newMin, newAmPm);
    }
  };

  // Format display string on trigger button
  const displayLabel = React.useMemo(() => {
    if (!value || !selectedDay || !selectedMonth || !selectedYear) {
      return null;
    }
    const mName = MONTH_NAMES[selectedMonth - 1]?.slice(0, 3);
    const minStr = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
    return `${mName} ${selectedDay}, ${selectedYear} • ${selectedHour12}:${minStr} ${selectedAmPm}`;
  }, [value, selectedDay, selectedMonth, selectedYear, selectedHour12, selectedMinute, selectedAmPm]);

  const liveTzBadge = React.useMemo(() => {
    if (!timeZone) return "";
    try {
      const dtf = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" });
      const parts = dtf.formatToParts(new Date());
      return parts.find((p) => p.type === "timeZoneName")?.value || "";
    } catch {
      return "";
    }
  }, [timeZone]);

  // Year options for quick select (current year - 5 to + 10)
  const currentYear = new Date().getFullYear();
  const yearOptions = React.useMemo(() => {
    const list = [];
    for (let y = currentYear - 5; y <= currentYear + 10; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>{label}</span>
          {liveTzBadge && (
            <span className="text-[10px] font-mono text-primary font-normal">
              [{liveTzBadge}]
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-all ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 bg-card text-foreground"
            : "border-border bg-input/40 hover:bg-input/70 text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className={displayLabel ? "font-medium" : "text-muted-foreground"}>
            {displayLabel || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {liveTzBadge && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/40 text-primary font-mono">
              {liveTzBadge}
            </Badge>
          )}
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="p-0.5 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
              title="Clear Date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </div>
      </button>

      {/* Interactive Luxury Popover Grid */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-full min-w-[310px] sm:min-w-[340px] p-3.5 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/50 gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-card border border-border/70 text-foreground text-xs font-semibold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-card border border-border/70 text-foreground text-xs font-semibold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Weekday Names */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
            {SHORT_DAYS.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-muted-foreground">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {/* Blank filler cells before the first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Actual day buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDay === day &&
                selectedMonth === viewMonth &&
                selectedYear === viewYear;

              const isToday =
                day === new Date().getDate() &&
                viewMonth === new Date().getMonth() + 1 &&
                viewYear === new Date().getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 mx-auto rounded-md text-xs font-medium transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : isToday
                      ? "border border-primary/50 text-primary hover:bg-primary/20"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Selector Divider */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary" />
                Select Time
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {timeZone}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 bg-card/60 p-2 rounded-lg border border-border/40">
              {/* Hour Dropdown */}
              <select
                value={selectedHour12}
                onChange={(e) =>
                  handleTimeChange(parseInt(e.target.value, 10), selectedMinute, selectedAmPm)
                }
                className="bg-card border border-border text-foreground font-mono font-bold text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {Array.from({ length: 12 }).map((_, idx) => {
                  const h = idx + 1;
                  return (
                    <option key={h} value={h}>
                      {h < 10 ? `0${h}` : `${h}`}
                    </option>
                  );
                })}
              </select>

              <span className="text-muted-foreground font-bold">:</span>

              {/* Minute Dropdown (5m steps: 00 to 55) */}
              <select
                value={selectedMinute}
                onChange={(e) =>
                  handleTimeChange(selectedHour12, parseInt(e.target.value, 10), selectedAmPm)
                }
                className="bg-card border border-border text-foreground font-mono font-bold text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>
                    {m < 10 ? `0${m}` : `${m}`}
                  </option>
                ))}
              </select>

              {/* AM / PM Segmented Control */}
              <div className="flex items-center rounded-md border border-border bg-input/40 p-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleTimeChange(selectedHour12, selectedMinute, "AM")}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                    selectedAmPm === "AM"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeChange(selectedHour12, selectedMinute, "PM")}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                    selectedAmPm === "PM"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const parts = utcToZonedParts(now, timeZone);
                const roundedMin = Math.round(parts.minute / 5) * 5 % 60;
                setViewYear(parts.year);
                setViewMonth(parts.month);
                emitChange(parts.year, parts.month, parts.day, parts.hour12, roundedMin, parts.ampm);
              }}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              Current Time
            </button>

            <Button
              type="button"
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setIsOpen(false)}
            >
              <Check className="w-3 h-3 mr-1" />
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
