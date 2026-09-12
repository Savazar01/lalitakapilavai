import prisma from "@/lib/prisma";

// Allowed public CSS token keys — strictly scoped to :root and .dark
// Admin-scope (.admin-scope) tokens are intentionally excluded per AGENTS.md Rule 8.
const ALLOWED_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--border",
  "--muted-foreground",
  "--primary",
  "--primary-foreground",
] as const;

type AllowedToken = (typeof ALLOWED_TOKENS)[number];

/**
 * DynamicThemeProvider — Server Component
 *
 * Fetches SystemSetting.themeConfig from the DB and injects a <style> block
 * with CSS custom property overrides into <head> before ThemeProvider renders.
 *
 * When themeConfig is null (default install or after "Reset to Defaults"), renders
 * nothing and globals.css token defaults take full effect.
 *
 * Security: Only ALLOWED_TOKENS keys are emitted; values are trimmed and length-capped.
 */
export async function DynamicThemeProvider() {
  const settings = await prisma.systemSetting
    .findFirst({ select: { themeConfig: true } })
    .catch(() => null);

  const themeConfig = settings?.themeConfig as
    | { light?: Record<string, string>; dark?: Record<string, string> }
    | null;

  if (!themeConfig) return null;

  const buildCSS = (tokens: Record<string, string> | undefined): string => {
    if (!tokens) return "";
    return ALLOWED_TOKENS.filter(
      (key: AllowedToken) =>
        tokens[key] &&
        typeof tokens[key] === "string" &&
        tokens[key].trim().length > 0 &&
        tokens[key].trim().length <= 100
    )
      .map((key: AllowedToken) => `  ${key}: ${tokens[key].trim()};`)
      .join("\n");
  };

  const lightCSS = buildCSS(themeConfig.light);
  const darkCSS = buildCSS(themeConfig.dark);

  if (!lightCSS && !darkCSS) return null;

  const css = [
    lightCSS ? `:root {\n${lightCSS}\n}` : "",
    darkCSS ? `.dark {\n${darkCSS}\n}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
