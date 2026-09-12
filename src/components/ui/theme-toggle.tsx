"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card/80 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer ${
        className || ""
      }`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Current: ${isDark ? "Dark" : "Light"} mode. Click for ${isDark ? "Light" : "Dark"} mode.`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-800 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}
