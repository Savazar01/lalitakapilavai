import prisma from "@/lib/prisma";
import { sanitizeDetailedThemeConfig, generateUnifiedThemeCSS } from "@/lib/theme-config";

/**
 * DynamicThemeProvider — Server Component
 *
 * Fetches SystemSetting.themeConfig from the DB and injects runtime CSS custom properties
 * into <head> targeting BOTH the public application (:root) and the Admin Portal (.admin-scope).
 *
 * When themeConfig is null (default install or after "Reset to System Defaults"),
 * renders nothing, preserving globals.css defaults.
 */
export async function DynamicThemeProvider() {
  const settings = await prisma.systemSetting
    .findFirst({ select: { themeConfig: true } })
    .catch(() => null);

  if (!settings?.themeConfig) {
    return null;
  }

  const themeConfig = sanitizeDetailedThemeConfig(settings.themeConfig);
  const css = generateUnifiedThemeCSS(themeConfig);

  return (
    <style
      id="dynamic-theme-styles"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
