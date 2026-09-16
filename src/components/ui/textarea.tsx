import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, style, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500 transition-all font-medium px-3 py-2 text-base sm:text-sm disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        backgroundColor: "var(--form-input-bg)",
        color: "var(--form-input-text)",
        borderColor: "var(--form-input-border)",
        borderWidth: "var(--form-input-border-width, 1.5px)",
        ...style,
      }}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
