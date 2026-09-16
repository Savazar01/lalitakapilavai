import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors"
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, style, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants(), className)}
      style={{
        color: "var(--form-label-color, inherit)",
        ...style,
      }}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
