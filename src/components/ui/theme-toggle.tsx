"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  // Idiomatic React 19 pattern to prevent hydration mismatch without cascading setState render
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-md border border-border bg-card/60 animate-pulse ${
          className || ""
        }`}
        aria-hidden="true"
      />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card/80 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer ${
        className || ""
      }`}
      aria-label={`Toggle theme (Current: ${theme})`}
      title={`Current Theme: ${theme}. Click to switch.`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-primary transition-transform duration-200 rotate-0 scale-100" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4 text-primary transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Laptop className="h-4 w-4 text-primary transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}
