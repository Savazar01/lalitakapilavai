"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  Settings,
  Shield,
  Cloud,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Mail,
  Send,
  Sparkles,
  FileText,
  Plus,
  Wand2,
  Sliders,
  Palette,
  RotateCcw,
  Type,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import {
  DetailedThemeConfig,
  DEFAULT_DETAILED_THEME_CONFIG,
  HEADING_FONT_OPTIONS,
  BODY_FONT_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  sanitizeDetailedThemeConfig,
  ThemeModeTokens,
} from "@/lib/theme-config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCIES } from "@/lib/formatters";
import { EditablePageHeader } from "@/components/admin/editable-page-header";
import { AdminPortalConfig, DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config";
import { ADMIN_NAV_ITEMS } from "@/components/admin/sidebar";

interface LegalLinkItem {
  label: string;
  url: string;
  isVisible: boolean;
}

interface SocialLinkItem {
  platform: string;
  url: string;
  isVisible: boolean;
}

interface FooterConfig {
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  copyrightText: string;
  socialLinks: SocialLinkItem[];
  legalLinks: LegalLinkItem[];
}

interface EmailConfig {
  provider: "gmail" | "smtp";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
}

interface AiConfig {
  activeProvider: "gemini" | "openai" | "anthropic" | "openrouter" | "grok" | "groq" | "ollama";
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  temperature: number;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [faviconUploading, setFaviconUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Email & AI Test states
  const [testingEmail, setTestingEmail] = React.useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = React.useState("");
  const [showEmailPassword, setShowEmailPassword] = React.useState(false);
  const [showAiKey, setShowAiKey] = React.useState(false);
  const [testingAi, setTestingAi] = React.useState(false);
  const [aiTestPrompt, setAiTestPrompt] = React.useState("Describe the sacred use of 22k gold leaf in Thanjavur art.");
  const [aiTestResult, setAiTestResult] = React.useState<string | null>(null);

  // Admin Portal White-Labeling State
  const [adminConfig, setAdminConfig] = React.useState<AdminPortalConfig>(DEFAULT_ADMIN_CONFIG);
  const [savingBranding, setSavingBranding] = React.useState(false);

  // Theme & Design Studio State
  const [themeConfig, setThemeConfig] = React.useState<DetailedThemeConfig>(DEFAULT_DETAILED_THEME_CONFIG);
  const [activeThemeSubTab, setActiveThemeSubTab] = React.useState<"common" | "light" | "dark">("common");
  const [savingTheme, setSavingTheme] = React.useState(false);

  const PALETTE_TOKEN_DEFINITIONS: { key: keyof ThemeModeTokens; label: string; description: string }[] = [
    { key: "canvasBg", label: "Canvas Background", description: "Base page canvas color (--background)" },
    { key: "cardBg", label: "Card & Surface", description: "Elevated surfaces, panels & dialogs (--card)" },
    { key: "borderColor", label: "Border Color", description: "Structural container lines (--border)" },
    { key: "headingColor", label: "Headings Color", description: "Title & display typography (--headings)" },
    { key: "bodyColor", label: "Body Text Color", description: "Primary readable content (--foreground)" },
    { key: "mutedColor", label: "Secondary / Muted Text", description: "Subtitles, metadata & captions (--muted-foreground)" },
    { key: "btnPrimaryBg", label: "Primary Button Background", description: "Main call-to-action fill (--primary)" },
    { key: "btnPrimaryText", label: "Primary Button Text", description: "Contrast text on primary button (--primary-foreground)" },
    { key: "btnPrimaryHover", label: "Primary Button Hover", description: "Hover state background for primary buttons (--primary-hover)" },
    { key: "btnSecondaryBg", label: "Secondary Button Background", description: "Subtle secondary action fill (--secondary)" },
    { key: "btnSecondaryText", label: "Secondary Button Text", description: "Text on secondary button (--secondary-foreground)" },
    { key: "btnSecondaryHover", label: "Secondary Button Hover", description: "Hover state background for secondary buttons (--secondary-hover)" },
    { key: "activePillBg", label: "Active Pill / Badge Background", description: "Selected filter pills & active tabs (--active-pill-bg)" },
    { key: "activePillText", label: "Active Pill / Badge Text", description: "Text on selected filter pills & tabs (--active-pill-text)" },
    { key: "badgeBg", label: "Eyebrow Badge Background", description: "Earmark & section badge fill (--badge-bg)" },
    { key: "badgeText", label: "Eyebrow Badge Text", description: "Earmark & section badge typography (--badge-text)" },
    { key: "badgeBorder", label: "Eyebrow Badge Border", description: "Earmark & section badge outline (--badge-border)" },
  ];

  // Core Settings Form
  const [form, setForm] = React.useState({
    siteName: "",
    siteDescription: "",
    adminAlertEmail: "",
    contactEmail: "",
    contactPhone: "",
    logoUrl: "",
    faviconUrl: "",
    defaultCurrency: "INR",
    defaultTimezone: "Asia/Kolkata",
    watermarkText: "© Lalita Kapilavai - Sacred Art & Heritage",
    watermarkOpacity: 0.35,
    watermarkFontSize: 28,
    watermarkStyle: "REPEAT_DIAGONAL",
    storageProvider: "R2",
    r2AccountId: "",
    r2BucketName: "lalitakapilavai-media",
    r2PublicUrl: "https://media.lalitakapilavai.com",
    s3Region: "ap-south-1",
    s3BucketName: "lalitakapilavai-backup",
    s3Endpoint: "",
    s3AccessKey: "",
    s3SecretKey: "",
    s3PublicUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    facebookUrl: "",
    pinterestUrl: "",
  });

  // Dedicated Footer Config State
  const [footerConfig, setFooterConfig] = React.useState<FooterConfig>({
    aboutText:
      "Living digital archive documenting classical South Indian Thanjavur (Tanjore) 22k gold leaf relief sacred paintings, Mysore traditional artwork, and Carnatic classical vocal recitals.",
    contactEmail: "contact@lalitakapilavai.com",
    contactPhone: "+91 98450 12345",
    copyrightText: "© 2026 Lalita Kapilavai. All sacred rights reserved.",
    socialLinks: [
      { platform: "Instagram", url: "", isVisible: false },
      { platform: "YouTube", url: "", isVisible: false },
      { platform: "Facebook", url: "", isVisible: false },
      { platform: "Pinterest", url: "", isVisible: false },
    ],
    legalLinks: [
      { label: "Privacy Policy", url: "/privacy", isVisible: true },
      { label: "Terms & Conditions", url: "/terms", isVisible: true },
      { label: "Cookie Notice", url: "/cookies", isVisible: true },
      { label: "Art Licensing & Reproduction", url: "/licensing", isVisible: true },
      { label: "Deployment Diagnostics", url: "/deploy", isVisible: true },
    ],
  });

  // Dedicated Email & Gmail Config State
  const [emailConfig, setEmailConfig] = React.useState<EmailConfig>({
    provider: "gmail",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "contact@lalitakapilavai.com",
    fromName: "Lalita Kapilavai Archive",
    isEnabled: false,
  });

  // Dedicated Universal AI Config State
  const [aiConfig, setAiConfig] = React.useState<AiConfig>({
    activeProvider: "gemini",
    apiKey: "",
    baseUrl: "",
    defaultModel: "gemini-1.5-pro",
    temperature: 0.7,
  });

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setForm({
            siteName: data.siteName || "",
            siteDescription: data.siteDescription || "",
            adminAlertEmail: data.adminAlertEmail || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            defaultCurrency: data.defaultCurrency || "INR",
            defaultTimezone: data.defaultTimezone || "Asia/Kolkata",
            watermarkText: data.watermarkText || "© Lalita Kapilavai - Sacred Art & Heritage",
            watermarkOpacity: data.watermarkOpacity ?? 0.35,
            watermarkFontSize: data.watermarkFontSize ?? 28,
            watermarkStyle: data.watermarkStyle || "REPEAT_DIAGONAL",
            storageProvider: data.storageProvider || "R2",
            r2AccountId: data.r2AccountId || "",
            r2BucketName: data.r2BucketName || "lalitakapilavai-media",
            r2PublicUrl: data.r2PublicUrl || "https://media.lalitakapilavai.com",
            s3Region: data.s3Region || "ap-south-1",
            s3BucketName: data.s3BucketName || "",
            s3Endpoint: data.s3Endpoint || "",
            s3AccessKey: data.s3AccessKey || "",
            s3SecretKey: data.s3SecretKey || "",
            s3PublicUrl: data.s3PublicUrl || "",
            instagramUrl: data.instagramUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            facebookUrl: data.facebookUrl || "",
            pinterestUrl: data.pinterestUrl || "",
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
          });

          if (data.footerConfig) {
            setFooterConfig((prev) => ({ ...prev, ...data.footerConfig }));
          }
          if (data.emailConfig) {
            setEmailConfig((prev) => ({ ...prev, ...data.emailConfig }));
          }
          if (data.aiConfig) {
            setAiConfig((prev) => ({ ...prev, ...data.aiConfig }));
          }
          if (data.adminConfig) {
            setAdminConfig((prev) => ({ ...prev, ...data.adminConfig }));
          }
          if (data.themeConfig) {
            setThemeConfig(sanitizeDetailedThemeConfig(data.themeConfig));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });

    fetch("/api/admin/settings/copy")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAdminConfig(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingBranding(true);
    try {
      const res = await fetch("/api/admin/settings/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminConfig),
      });
      if (res.ok) {
        toast.success("Admin portal white-labeling saved successfully!");
        window.dispatchEvent(new Event("adminConfigUpdated"));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save portal configuration");
      }
    } catch {
      toast.error("Error saving portal configuration");
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveTheme = async () => {
    setSavingTheme(true);
    try {
      const res = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeConfig }),
      });
      if (res.ok) {
        toast.success("Theme configuration saved globally across public app and admin portal!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save theme configuration");
      }
    } catch {
      toast.error("Error saving theme configuration");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleResetTheme = async () => {
    setSavingTheme(true);
    try {
      const res = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeConfig: null }),
      });
      if (res.ok) {
        setThemeConfig({ ...DEFAULT_DETAILED_THEME_CONFIG });
        toast.success("Theme reset to system defaults.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to reset theme");
      }
    } catch {
      toast.error("Error resetting theme");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "logo");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl;
      setForm((prev) => ({ ...prev, logoUrl: url }));
      toast.success("Logo uploaded successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "logo");
    body.append("isArtwork", "false");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl;
      setForm((prev) => ({ ...prev, faviconUrl: url }));
      toast.success("Favicon uploaded successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload favicon");
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Synchronize social URLs bi-directionally with footerConfig.socialLinks
      const updatedFooterSocials = [...(footerConfig.socialLinks || [])];
      const platformMap: Record<string, string> = {
        Instagram: form.instagramUrl?.trim() || "",
        YouTube: form.youtubeUrl?.trim() || "",
        Facebook: form.facebookUrl?.trim() || "",
        Pinterest: form.pinterestUrl?.trim() || "",
      };

      Object.entries(platformMap).forEach(([platform, url]) => {
        const existingIdx = updatedFooterSocials.findIndex(
          (s) => s.platform.toLowerCase() === platform.toLowerCase()
        );
        if (existingIdx >= 0) {
          updatedFooterSocials[existingIdx] = {
            ...updatedFooterSocials[existingIdx],
            url,
            isVisible: Boolean(url),
          };
        } else if (url) {
          updatedFooterSocials.push({
            platform,
            url,
            isVisible: true,
          });
        }
      });

      const updatedFooterConfig = {
        ...footerConfig,
        socialLinks: updatedFooterSocials,
      };

      const payload = {
        ...form,
        footerConfig: updatedFooterConfig,
        emailConfig,
        aiConfig,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSuccessMsg("System configuration updated successfully.");
      toast.success("All platform settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailConfig.smtpUser || !emailConfig.smtpPassword) {
      toast.error("Please provide SMTP User and Password / App Password before testing.");
      return;
    }

    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailConfig,
          testRecipient: testEmailRecipient || form.adminAlertEmail || emailConfig.smtpUser,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test email delivery failed");

      toast.success(data.message || "Test email dispatched successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "SMTP test failed");
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestAi = async () => {
    if (!aiConfig.apiKey && aiConfig.activeProvider !== "ollama") {
      toast.error("Please input an API Key for your selected AI provider.");
      return;
    }

    setTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiTestPrompt,
          action: "POLISH",
          tone: "SCHOLARLY",
          modelOverride: aiConfig.defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI connection test failed");

      setAiTestResult(data.text);
      toast.success(`Success! Connected to ${aiConfig.activeProvider.toUpperCase()}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI test failed");
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <EditablePageHeader
        sectionKey="settings"
        defaultTitle="Platform & Storage Settings"
        defaultSubtitle="Global system metadata, watermark vault, R2/S3 storage, dynamic footer, Gmail SMTP, and multi-provider AI engine."
        badgeLabel="Platform Infrastructure"
      >
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer text-xs"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save All Settings
        </Button>
      </EditablePageHeader>

      {successMsg && (
        <div className="p-3 text-xs rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading system settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <Tabs defaultValue="general" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-1.5 w-full h-auto p-1.5 bg-slate-200/70 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl">
              <TabsTrigger
                value="general"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Settings className="w-3.5 h-3.5 mr-1" /> General
              </TabsTrigger>
              <TabsTrigger
                value="branding"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Sliders className="w-3.5 h-3.5 mr-1" /> White-Labeling
              </TabsTrigger>
              <TabsTrigger
                value="watermark"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Shield className="w-3.5 h-3.5 mr-1" /> Watermark
              </TabsTrigger>
              <TabsTrigger
                value="storage"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Cloud className="w-3.5 h-3.5 mr-1" /> R2 / S3
              </TabsTrigger>
              <TabsTrigger
                value="footer"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <FileText className="w-3.5 h-3.5 mr-1" /> Footer
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Mail className="w-3.5 h-3.5 mr-1" /> Gmail / SMTP
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Engine
              </TabsTrigger>
              <TabsTrigger
                value="socials"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" /> Socials
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="text-xs py-2 rounded-lg font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=active]:border-slate-100 shadow-2xs transition-all"
              >
                <Palette className="w-3.5 h-3.5 mr-1" /> Theme Studio
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: General */}
            <TabsContent value="general">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">General Archive Configuration</CardTitle>
                  <CardDescription className="text-xs">
                    Configure public site identity, administration contact, and default currency.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Website Brand Logo & Favicon */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        Website Brand Logo & Favicon
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload your official brand logo to display across navigation, footer, and admin headers.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      {form.logoUrl ? (
                        <div className="relative group w-32 h-18 rounded border border-border bg-card/80 flex items-center justify-center p-2 shrink-0">
                          <img
                            src={form.logoUrl}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-18 rounded border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/20 shrink-0">
                          <ImageIcon className="w-5 h-5 opacity-40 mb-1" />
                          <span className="text-[10px]">No Logo</span>
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <Label className="text-xs font-medium">Official Brand Logo</Label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/heic,image/heif,image/heic-sequence,.heic,.heics"
                              onChange={handleLogoUpload}
                              disabled={logoUploading}
                              className="hidden"
                            />
                            <div className="inline-flex items-center px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
                              {logoUploading ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Upload Logo
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Favicon Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-border/40">
                      {form.faviconUrl ? (
                        <div className="relative group w-12 h-12 rounded border border-border bg-card/80 flex items-center justify-center p-1 shrink-0">
                          <img
                            src={form.faviconUrl}
                            alt="Favicon"
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, faviconUrl: "" }))}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/20 shrink-0">
                          <span className="text-[9px]">Icon</span>
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <Label className="text-xs font-medium">Favicon</Label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/x-icon,image/png,image/svg+xml"
                              onChange={handleFaviconUpload}
                              disabled={faviconUploading}
                              className="hidden"
                            />
                            <div className="inline-flex items-center px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
                              {faviconUploading ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Upload Favicon
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Site Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Archive Name</Label>
                      <Input
                        value={form.siteName}
                        onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Admin Alert Email</Label>
                      <Input
                        type="email"
                        value={form.adminAlertEmail}
                        onChange={(e) => setForm({ ...form, adminAlertEmail: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">Site Description</Label>
                    <Textarea
                      value={form.siteDescription}
                      onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                      rows={2}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Default Currency</Label>
                      <Select
                        value={form.defaultCurrency}
                        onValueChange={(val) => setForm({ ...form, defaultCurrency: val })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code} — {c.label} ({c.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Timezone</Label>
                      <Input
                        value={form.defaultTimezone}
                        onChange={(e) => setForm({ ...form, defaultTimezone: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Admin Portal White-Labeling */}
            <TabsContent value="branding">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    Admin Portal White-Labeling &amp; Navigation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize the top dashboard brand titles and rename every sidebar navigation menu item to suit institutional or client requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Top Bar and Brand Headers */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
                    <h4 className="font-semibold text-foreground text-sm">Dashboard &amp; Sidebar Branding</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Top Dashboard Title</Label>
                        <Input
                          value={adminConfig.dashboardTitle}
                          onChange={(e) =>
                            setAdminConfig({ ...adminConfig, dashboardTitle: e.target.value })
                          }
                          placeholder="Archive & Platform Dashboard"
                          className="text-xs font-serif"
                        />
                        <p className="text-[10px] text-muted-foreground">Appears on the top sticky navigation bar</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Sidebar Brand Title</Label>
                        <Input
                          value={adminConfig.sidebarBrandTitle}
                          onChange={(e) =>
                            setAdminConfig({ ...adminConfig, sidebarBrandTitle: e.target.value })
                          }
                          placeholder="Lalita Kapilavai"
                          className="text-xs font-serif"
                        />
                        <p className="text-[10px] text-muted-foreground">Primary artist/institution name</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Sidebar Subtitle</Label>
                        <Input
                          value={adminConfig.sidebarBrandSubtitle}
                          onChange={(e) =>
                            setAdminConfig({ ...adminConfig, sidebarBrandSubtitle: e.target.value })
                          }
                          placeholder="Control Center"
                          className="text-xs font-mono"
                        />
                        <p className="text-[10px] text-muted-foreground">Appears under brand name in sidebar</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Navigation Items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">Sidebar Navigation Menu Labels</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAdminConfig({
                            ...adminConfig,
                            sidebarLabels: { ...DEFAULT_ADMIN_CONFIG.sidebarLabels },
                          })
                        }
                        className="text-[11px] h-7"
                      >
                        Reset Menu Defaults
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rename sidebar menu items without altering internal route bindings.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {ADMIN_NAV_ITEMS.map((item) => (
                        <div key={item.id} className="p-3 rounded-lg border border-border bg-card/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-muted-foreground font-semibold">/{item.id}</span>
                            <span className="text-[10px] text-muted-foreground">Default: {item.defaultLabel}</span>
                          </div>
                          <Input
                            value={adminConfig.sidebarLabels?.[item.id] ?? item.defaultLabel}
                            onChange={(e) =>
                              setAdminConfig({
                                ...adminConfig,
                                sidebarLabels: {
                                  ...adminConfig.sidebarLabels,
                                  [item.id]: e.target.value,
                                },
                              })
                            }
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Headings, Eyebrows & Subtitles */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">Admin View Headers, Eyebrow Badges &amp; Descriptions</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAdminConfig({
                            ...adminConfig,
                            pageHeadings: { ...DEFAULT_ADMIN_CONFIG.pageHeadings },
                          })
                        }
                        className="text-[11px] h-7"
                      >
                        Reset Headings Defaults
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customize the eyebrow badges, main titles, and curatorial descriptions across all 11 administrative dashboard pages.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {ADMIN_NAV_ITEMS.map((item) => {
                        const heading = adminConfig.pageHeadings?.[item.id] || DEFAULT_ADMIN_CONFIG.pageHeadings[item.id] || {
                          badge: "",
                          title: item.defaultLabel,
                          subtitle: "",
                        };
                        return (
                          <div key={`heading-${item.id}`} className="p-3.5 rounded-lg border border-border bg-card/60 space-y-2.5">
                            <div className="flex items-center justify-between text-xs pb-1 border-b border-border/50">
                              <span className="font-semibold text-primary flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                {item.defaultLabel} Section
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">/{item.id}</span>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Eyebrow Badge / Tag</Label>
                              <Input
                                value={heading.badge || ""}
                                onChange={(e) =>
                                  setAdminConfig({
                                    ...adminConfig,
                                    pageHeadings: {
                                      ...adminConfig.pageHeadings,
                                      [item.id]: {
                                        ...heading,
                                        badge: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="Eyebrow Tag..."
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Main Heading Title</Label>
                              <Input
                                value={heading.title || ""}
                                onChange={(e) =>
                                  setAdminConfig({
                                    ...adminConfig,
                                    pageHeadings: {
                                      ...adminConfig.pageHeadings,
                                      [item.id]: {
                                        ...heading,
                                        title: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="Page Title..."
                                className="text-xs font-semibold h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Subtitle / Curatorial Description</Label>
                              <Textarea
                                value={heading.subtitle || ""}
                                onChange={(e) =>
                                  setAdminConfig({
                                    ...adminConfig,
                                    pageHeadings: {
                                      ...adminConfig.pageHeadings,
                                      [item.id]: {
                                        ...heading,
                                        subtitle: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="Subtitle or instructions..."
                                rows={2}
                                className="text-xs resize-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => handleSaveBranding()}
                      disabled={savingBranding}
                      className="gap-2 text-xs"
                    >
                      {savingBranding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save White-Label Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Watermark Vault */}
            <TabsContent value="watermark">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Selective Watermarking & Protection</CardTitle>
                  <CardDescription className="text-xs">
                    Protected original high-resolution masters are vaulted in S3/R2 storage, while public derivatives receive dynamic SVG watermark overlays.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Watermark Stamp Text</Label>
                      <Input
                        value={form.watermarkText}
                        onChange={(e) => setForm({ ...form, watermarkText: e.target.value })}
                        className="text-xs font-serif"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Watermark Style &amp; Placement</Label>
                      <Select
                        value={form.watermarkStyle}
                        onValueChange={(val) => setForm({ ...form, watermarkStyle: val })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REPEAT_DIAGONAL">Full Diagonal Repeat (-25° subtle pattern)</SelectItem>
                          <SelectItem value="BANNER">Bottom Protection Banner (Obsidian + Gold Line)</SelectItem>
                          <SelectItem value="CORNER">Crisp Corner Stamp Badge (Bottom-Right)</SelectItem>
                          <SelectItem value="BOTH">Diagonal Repeat + Bottom Protection Banner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Opacity ({form.watermarkOpacity})</Label>
                      <Input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={form.watermarkOpacity}
                        onChange={(e) => setForm({ ...form, watermarkOpacity: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Font Size ({form.watermarkFontSize}px)</Label>
                      <Input
                        type="number"
                        value={form.watermarkFontSize}
                        onChange={(e) => setForm({ ...form, watermarkFontSize: parseInt(e.target.value) || 28 })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: R2 / S3 Storage */}
            <TabsContent value="storage">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Cloudflare R2 & S3 Object Storage</CardTitle>
                  <CardDescription className="text-xs">
                    Configure endpoints for high-throughput image hosting and original master archives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Storage Provider</Label>
                      <Select
                        value={form.storageProvider}
                        onValueChange={(val) => setForm({ ...form, storageProvider: val })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="R2">Cloudflare R2</SelectItem>
                          <SelectItem value="S3">Amazon AWS S3</SelectItem>
                          <SelectItem value="LOCAL">Local Filesystem (/public/media)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">R2 Account ID</Label>
                      <Input
                        value={form.r2AccountId}
                        onChange={(e) => setForm({ ...form, r2AccountId: e.target.value })}
                        className="text-xs font-mono"
                        placeholder="Cloudflare account ID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Bucket Name</Label>
                      <Input
                        value={form.r2BucketName}
                        onChange={(e) => setForm({ ...form, r2BucketName: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Public CDN URL</Label>
                      <Input
                        value={form.r2PublicUrl}
                        onChange={(e) => setForm({ ...form, r2PublicUrl: e.target.value })}
                        className="text-xs font-mono"
                        placeholder="https://media.lalitakapilavai.com or /media"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Dynamic Footer Configuration */}
            <TabsContent value="footer">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Global Footer & Legal Notice Builder</CardTitle>
                  <CardDescription className="text-xs">
                    Customize website brand bio, studio contact channels, copyright notices, and legal links.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Brand Bio */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">Brand Statement / Bio</Label>
                    <Textarea
                      value={footerConfig.aboutText}
                      onChange={(e) => setFooterConfig({ ...footerConfig, aboutText: e.target.value })}
                      rows={3}
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Studio Contact Email</Label>
                      <Input
                        value={footerConfig.contactEmail}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contactEmail: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Studio Phone Number</Label>
                      <Input
                        value={footerConfig.contactPhone}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contactPhone: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Copyright Notice</Label>
                      <Input
                        value={footerConfig.copyrightText}
                        onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Legal Links Manager */}
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Legal & Compliance Links</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Manage links appearing in the bottom copyright strip across all public pages.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFooterConfig({
                            ...footerConfig,
                            legalLinks: [
                              ...footerConfig.legalLinks,
                              { label: "New Legal Notice", url: "/legal", isVisible: true },
                            ],
                          })
                        }
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {footerConfig.legalLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-md border border-border/80 bg-card/60"
                        >
                          <Input
                            value={link.label}
                            onChange={(e) => {
                              const updated = [...footerConfig.legalLinks];
                              updated[idx].label = e.target.value;
                              setFooterConfig({ ...footerConfig, legalLinks: updated });
                            }}
                            placeholder="Link Label"
                            className="text-xs flex-1"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...footerConfig.legalLinks];
                              updated[idx].url = e.target.value;
                              setFooterConfig({ ...footerConfig, legalLinks: updated });
                            }}
                            placeholder="/privacy"
                            className="text-xs font-mono flex-1"
                          />
                          <label className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={link.isVisible}
                              onChange={(e) => {
                                const updated = [...footerConfig.legalLinks];
                                updated[idx].isVisible = e.target.checked;
                                setFooterConfig({ ...footerConfig, legalLinks: updated });
                              }}
                              className="rounded"
                            />
                            Visible
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const updated = footerConfig.legalLinks.filter((_, i) => i !== idx);
                              setFooterConfig({ ...footerConfig, legalLinks: updated });
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Footer Preview Box */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-card space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                      Live Preview
                    </span>
                    <div className="p-4 rounded bg-background border border-border/60 text-xs space-y-2">
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {footerConfig.aboutText}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span>{footerConfig.copyrightText}</span>
                        <div className="flex gap-3">
                          {footerConfig.legalLinks
                            .filter((l) => l.isVisible)
                            .map((l) => (
                              <span key={l.label} className="text-primary hover:underline">
                                {l.label}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Email & Gmail SMTP Setup */}
            <TabsContent value="email">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Gmail & Outbound SMTP Dispatcher</CardTitle>
                  <CardDescription className="text-xs">
                    Configure automated outbound email delivery for exhibition registrations, collector leads, and contact inquiries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Google App Password Notice */}
                  <div className="p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 space-y-1">
                    <p className="font-semibold text-xs flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> Gmail App Password Integration Guide
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      For Gmail accounts with 2-Step Verification enabled, generate a 16-character App Password at{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-mono"
                      >
                        myaccount.google.com/apppasswords
                      </a>{" "}
                      and paste it into the password field below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Email Provider</Label>
                      <Select
                        value={emailConfig.provider}
                        onValueChange={(val: "gmail" | "smtp") =>
                          setEmailConfig({
                            ...emailConfig,
                            provider: val,
                            smtpHost: val === "gmail" ? "smtp.gmail.com" : emailConfig.smtpHost,
                            smtpPort: val === "gmail" ? 587 : emailConfig.smtpPort,
                          })
                        }
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmail">Google Gmail (App Password)</SelectItem>
                          <SelectItem value="smtp">Custom SMTP Server</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">SMTP Host</Label>
                      <Input
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Port</Label>
                      <Input
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                        placeholder="587"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Username / Email *</Label>
                      <Input
                        value={emailConfig.smtpUser}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                        placeholder="artist@gmail.com"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground">Password / App Password *</Label>
                        <button
                          type="button"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          {showEmailPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        type={showEmailPassword ? "text" : "password"}
                        value={emailConfig.smtpPassword}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">From Address</Label>
                      <Input
                        value={emailConfig.fromEmail}
                        onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                        placeholder="contact@lalitakapilavai.com"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">From Display Name</Label>
                      <Input
                        value={emailConfig.fromName}
                        onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                        placeholder="Lalita Kapilavai Archive"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Connectivity Testing Box */}
                  <div className="p-4 rounded-lg border border-border/80 bg-secondary/30 space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                      <Send className="w-4 h-4 text-primary" />
                      Test Outbound Connectivity
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Input
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="Test recipient email (defaults to admin alert email)"
                        className="text-xs flex-1 font-mono"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={testingEmail}
                        onClick={handleTestEmail}
                        className="text-xs shrink-0 cursor-pointer"
                      >
                        {testingEmail ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        )}
                        Send Test Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 6: Universal Multi-Provider AI Assistant */}
            <TabsContent value="ai">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Universal Multi-Provider AI Assistant</CardTitle>
                  <CardDescription className="text-xs">
                    Choose from 7 state-of-the-art AI engines to generate, refine, and translate sacred art provenance, blog chronicles, and event narratives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Active AI Provider</Label>
                      <Select
                        value={aiConfig.activeProvider}
                        onValueChange={(val: typeof aiConfig.activeProvider) => {
                          let defaultModel = "gemini-1.5-pro";
                          let baseUrl = "";
                          if (val === "openai") defaultModel = "gpt-4o";
                          if (val === "anthropic") defaultModel = "claude-3-5-sonnet-20241022";
                          if (val === "openrouter") {
                            defaultModel = "anthropic/claude-3.5-sonnet";
                            baseUrl = "https://openrouter.ai/api/v1";
                          }
                          if (val === "grok") {
                            defaultModel = "grok-2-latest";
                            baseUrl = "https://api.x.ai/v1";
                          }
                          if (val === "groq") {
                            defaultModel = "llama-3.3-70b-versatile";
                            baseUrl = "https://api.groq.com/openai/v1";
                          }
                          if (val === "ollama") {
                            defaultModel = "llama3";
                            baseUrl = "http://localhost:11434";
                          }

                          setAiConfig({
                            ...aiConfig,
                            activeProvider: val,
                            defaultModel,
                            baseUrl,
                          });
                        }}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Google Gemini (Recommended)</SelectItem>
                          <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                          <SelectItem value="anthropic">Anthropic Claude (3.5 Sonnet)</SelectItem>
                          <SelectItem value="groq">Groq (Ultra-fast Llama 3.3)</SelectItem>
                          <SelectItem value="openrouter">OpenRouter (Unified Multi-Model)</SelectItem>
                          <SelectItem value="grok">xAI Grok</SelectItem>
                          <SelectItem value="ollama">Ollama (Self-hosted / Local)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground">API Key *</Label>
                        <button
                          type="button"
                          onClick={() => setShowAiKey(!showAiKey)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          {showAiKey ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        type={showAiKey ? "text" : "password"}
                        value={aiConfig.apiKey}
                        onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                        placeholder={aiConfig.activeProvider === "ollama" ? "Not required for Ollama" : "sk-..."}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Model Identifier</Label>
                      <Input
                        value={aiConfig.defaultModel}
                        onChange={(e) => setAiConfig({ ...aiConfig, defaultModel: e.target.value })}
                        placeholder="gemini-1.5-pro, gpt-4o, claude-3-5-sonnet"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Base URL (For Ollama/OpenRouter)</Label>
                      <Input
                        value={aiConfig.baseUrl}
                        onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">
                        Temperature: {aiConfig.temperature ?? 0.7}
                      </Label>
                      <Input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={aiConfig.temperature ?? 0.7}
                        onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* AI Connection Test */}
                  <div className="p-4 rounded-lg border border-border/80 bg-secondary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                        <Wand2 className="w-4 h-4 text-primary" />
                        Test AI Provider Connectivity
                      </h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={testingAi}
                        onClick={handleTestAi}
                        className="text-xs cursor-pointer"
                      >
                        {testingAi ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        )}
                        Run Connectivity Test
                      </Button>
                    </div>

                    <Input
                      value={aiTestPrompt}
                      onChange={(e) => setAiTestPrompt(e.target.value)}
                      placeholder="Prompt to test"
                      className="text-xs font-serif"
                    />

                    {aiTestResult && (
                      <div className="p-3 rounded bg-card border border-primary/20 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {aiTestResult}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 7: Social Channels */}
            <TabsContent value="socials">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Social Media & Public Channels</CardTitle>
                  <CardDescription className="text-xs">
                    Link external public channels to display in headers, contact cards, and search graph metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Instagram Handle / URL</Label>
                      <Input
                        value={form.instagramUrl}
                        onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/lalitakapilavai"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">YouTube Channel URL</Label>
                      <Input
                        value={form.youtubeUrl}
                        onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@lalitakapilavai"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Facebook Page URL</Label>
                      <Input
                        value={form.facebookUrl}
                        onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/lalitakapilavai"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-foreground">Pinterest Portfolio URL</Label>
                      <Input
                        value={form.pinterestUrl}
                        onChange={(e) => setForm({ ...form, pinterestUrl: e.target.value })}
                        placeholder="https://pinterest.com/lalitakapilavai"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 9: Theme & Design Studio */}
            <TabsContent value="theme">
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Palette className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        Unified Theme &amp; Design System Atelier
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        Configure global typography, structural border thickness, and color palettes applied universally across both the public visitor application and the Admin Portal.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetTheme}
                        disabled={savingTheme}
                        className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        {savingTheme ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Reset to System Defaults
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveTheme}
                        disabled={savingTheme}
                        size="sm"
                        className="text-xs bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 cursor-pointer"
                      >
                        {savingTheme ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Save Theme Configuration
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Sub-Tab Navigation */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl w-fit mb-6">
                    <button
                      type="button"
                      onClick={() => setActiveThemeSubTab("common")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeThemeSubTab === "common"
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Common &amp; Typography
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveThemeSubTab("light")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeThemeSubTab === "light"
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Light Mode Palette
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveThemeSubTab("dark")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeThemeSubTab === "dark"
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Dark Mode Palette
                    </button>
                  </div>

                  {/* Sub-Tab 1: Common & Typography */}
                  {activeThemeSubTab === "common" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Heading Font Family */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                            Primary Headings Font Family
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Applies to h1-h6 display titles, hero banners, and catalog covers.
                          </p>
                          <select
                            value={themeConfig.common.fontHeading}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, fontHeading: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {HEADING_FONT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Body Font Family */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                            Primary Body Font Family
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Applies to paragraphs, card descriptions, data tables, and forms.
                          </p>
                          <select
                            value={themeConfig.common.fontBody}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, fontBody: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {BODY_FONT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Global Border Thickness */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Global Border Thickness
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Governs container lines, cards, inputs, dialogs, and table borders.
                          </p>
                          <select
                            value={themeConfig.common.borderWidth}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, borderWidth: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {BORDER_WIDTH_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Global Border Radius */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Global Corner Radius (--radius)
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Architectural curvature for cards, buttons, modals, and input fields.
                          </p>
                          <select
                            value={themeConfig.common.borderRadius}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, borderRadius: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {BORDER_RADIUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Base Font Size */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Base Font Size
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Universal body typography baseline scaling for readability.
                          </p>
                          <select
                            value={themeConfig.common.baseFontSize}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, baseFontSize: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {FONT_SIZE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Line Height */}
                        <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Base Line Height
                          </Label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Vertical line spacing ratio for curatorial essays and commentary.
                          </p>
                          <select
                            value={themeConfig.common.lineHeight}
                            onChange={(e) =>
                              setThemeConfig((prev) => ({
                                ...prev,
                                common: { ...prev.common, lineHeight: e.target.value },
                              }))
                            }
                            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer outline-none"
                          >
                            {LINE_HEIGHT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 2: Light Mode Palette */}
                  {activeThemeSubTab === "light" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PALETTE_TOKEN_DEFINITIONS.map((def) => (
                          <div
                            key={`light-${def.key}`}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                          >
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`light-${def.key}`}
                                className="text-xs font-bold text-slate-900 dark:text-slate-100 block"
                              >
                                {def.label}
                              </label>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {def.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                id={`light-${def.key}`}
                                type="color"
                                value={themeConfig.light[def.key]}
                                onChange={(e) =>
                                  setThemeConfig((prev) => ({
                                    ...prev,
                                    light: { ...prev.light, [def.key]: e.target.value },
                                  }))
                                }
                                className="h-8 w-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                                title={`${def.label} picker`}
                              />
                              <input
                                type="text"
                                value={themeConfig.light[def.key]}
                                onChange={(e) =>
                                  setThemeConfig((prev) => ({
                                    ...prev,
                                    light: { ...prev.light, [def.key]: e.target.value },
                                  }))
                                }
                                className="w-24 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                placeholder="#FFFFFF"
                                maxLength={25}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 3: Dark Mode Palette */}
                  {activeThemeSubTab === "dark" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PALETTE_TOKEN_DEFINITIONS.map((def) => (
                          <div
                            key={`dark-${def.key}`}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                          >
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`dark-${def.key}`}
                                className="text-xs font-bold text-slate-900 dark:text-slate-100 block"
                              >
                                {def.label}
                              </label>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {def.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                id={`dark-${def.key}`}
                                type="color"
                                value={themeConfig.dark[def.key]}
                                onChange={(e) =>
                                  setThemeConfig((prev) => ({
                                    ...prev,
                                    dark: { ...prev.dark, [def.key]: e.target.value },
                                  }))
                                }
                                className="h-8 w-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                                title={`${def.label} dark picker`}
                              />
                              <input
                                type="text"
                                value={themeConfig.dark[def.key]}
                                onChange={(e) =>
                                  setThemeConfig((prev) => ({
                                    ...prev,
                                    dark: { ...prev.dark, [def.key]: e.target.value },
                                  }))
                                }
                                className="w-24 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                placeholder="#0B0F17"
                                maxLength={25}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Live Preview Sandbox */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        🔍 Interactive Live Preview Sandbox
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Font: {themeConfig.common.fontHeading} / {themeConfig.common.fontBody} | Border: {themeConfig.common.borderWidth} | Radius: {themeConfig.common.borderRadius}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Light Mode Preview Card */}
                      <div
                        className="p-5 space-y-4 border transition-all"
                        style={{
                          backgroundColor: themeConfig.light.canvasBg,
                          borderColor: themeConfig.light.borderColor,
                          borderWidth: themeConfig.common.borderWidth,
                          borderRadius: themeConfig.common.borderRadius,
                        }}
                      >
                        <div
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{
                            color: themeConfig.light.btnPrimaryBg,
                            fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                          }}
                        >
                          ☀️ Light Mode Preview
                        </div>
                        <div
                          className="p-4 space-y-3 border transition-all"
                          style={{
                            backgroundColor: themeConfig.light.cardBg,
                            borderColor: themeConfig.light.borderColor,
                            borderWidth: themeConfig.common.borderWidth,
                            borderRadius: themeConfig.common.borderRadius,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all"
                              style={{
                                backgroundColor: themeConfig.light.badgeBg,
                                color: themeConfig.light.badgeText,
                                borderColor: themeConfig.light.badgeBorder,
                              }}
                            >
                              ✨ Tanjore Classical Plate
                            </span>
                          </div>
                          <h4
                            className="text-base font-bold"
                            style={{
                              color: themeConfig.light.headingColor,
                              fontFamily: `'${themeConfig.common.fontHeading}', Georgia, serif`,
                            }}
                          >
                            Lalita Kapilavai — Sacred Art Archive
                          </h4>
                          <p
                            style={{
                              color: themeConfig.light.bodyColor,
                              fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                              fontSize: themeConfig.common.baseFontSize,
                              lineHeight: themeConfig.common.lineHeight,
                            }}
                          >
                            Tanjore traditional iconography with authentic 22k gold foil relief, paired with timeless South Indian Carnatic vocal traditions.
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              color: themeConfig.light.mutedColor,
                              fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                            }}
                          >
                            Catalog ref: #LK-2026-TANJORE • 48 Artworks Curated
                          </p>

                          {/* Pills */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span
                              className="text-xs px-2.5 py-1 font-bold shadow-xs border transition-all"
                              style={{
                                backgroundColor: themeConfig.light.activePillBg,
                                color: themeConfig.light.activePillText,
                                borderColor: themeConfig.light.activePillBg,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Selected Period
                            </span>
                            <span
                              className="text-xs px-2.5 py-1 font-medium border transition-all"
                              style={{
                                backgroundColor: themeConfig.light.cardBg,
                                color: themeConfig.light.bodyColor,
                                borderColor: themeConfig.light.borderColor,
                                borderWidth: themeConfig.common.borderWidth,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Classical Temple Murals
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              className="text-xs font-semibold px-3 py-1.5 shadow-sm transition-all"
                              style={{
                                backgroundColor: themeConfig.light.btnPrimaryBg,
                                color: themeConfig.light.btnPrimaryText,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Commission Artwork →
                            </button>
                            <button
                              type="button"
                              className="text-xs font-semibold px-3 py-1.5 border transition-all"
                              style={{
                                backgroundColor: themeConfig.light.btnSecondaryBg,
                                color: themeConfig.light.btnSecondaryText,
                                borderColor: themeConfig.light.borderColor,
                                borderWidth: themeConfig.common.borderWidth,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              View Catalog
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dark Mode Preview Card */}
                      <div
                        className="p-5 space-y-4 border transition-all"
                        style={{
                          backgroundColor: themeConfig.dark.canvasBg,
                          borderColor: themeConfig.dark.borderColor,
                          borderWidth: themeConfig.common.borderWidth,
                          borderRadius: themeConfig.common.borderRadius,
                        }}
                      >
                        <div
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{
                            color: themeConfig.dark.btnPrimaryBg,
                            fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                          }}
                        >
                          🌙 Dark Mode Preview
                        </div>
                        <div
                          className="p-4 space-y-3 border transition-all"
                          style={{
                            backgroundColor: themeConfig.dark.cardBg,
                            borderColor: themeConfig.dark.borderColor,
                            borderWidth: themeConfig.common.borderWidth,
                            borderRadius: themeConfig.common.borderRadius,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all"
                              style={{
                                backgroundColor: themeConfig.dark.badgeBg,
                                color: themeConfig.dark.badgeText,
                                borderColor: themeConfig.dark.badgeBorder,
                              }}
                            >
                              ✨ Tanjore Classical Plate
                            </span>
                          </div>
                          <h4
                            className="text-base font-bold"
                            style={{
                              color: themeConfig.dark.headingColor,
                              fontFamily: `'${themeConfig.common.fontHeading}', Georgia, serif`,
                            }}
                          >
                            Lalita Kapilavai — Sacred Art Archive
                          </h4>
                          <p
                            style={{
                              color: themeConfig.dark.bodyColor,
                              fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                              fontSize: themeConfig.common.baseFontSize,
                              lineHeight: themeConfig.common.lineHeight,
                            }}
                          >
                            Tanjore traditional iconography with authentic 22k gold foil relief, paired with timeless South Indian Carnatic vocal traditions.
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              color: themeConfig.dark.mutedColor,
                              fontFamily: `'${themeConfig.common.fontBody}', sans-serif`,
                            }}
                          >
                            Catalog ref: #LK-2026-TANJORE • 48 Artworks Curated
                          </p>

                          {/* Pills */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span
                              className="text-xs px-2.5 py-1 font-bold shadow-xs border transition-all"
                              style={{
                                backgroundColor: themeConfig.dark.activePillBg,
                                color: themeConfig.dark.activePillText,
                                borderColor: themeConfig.dark.activePillBg,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Selected Period
                            </span>
                            <span
                              className="text-xs px-2.5 py-1 font-medium border transition-all"
                              style={{
                                backgroundColor: themeConfig.dark.cardBg,
                                color: themeConfig.dark.bodyColor,
                                borderColor: themeConfig.dark.borderColor,
                                borderWidth: themeConfig.common.borderWidth,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Classical Temple Murals
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              className="text-xs font-semibold px-3 py-1.5 shadow-sm transition-all"
                              style={{
                                backgroundColor: themeConfig.dark.btnPrimaryBg,
                                color: themeConfig.dark.btnPrimaryText,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              Commission Artwork →
                            </button>
                            <button
                              type="button"
                              className="text-xs font-semibold px-3 py-1.5 border transition-all"
                              style={{
                                backgroundColor: themeConfig.dark.btnSecondaryBg,
                                color: themeConfig.dark.btnSecondaryText,
                                borderColor: themeConfig.dark.borderColor,
                                borderWidth: themeConfig.common.borderWidth,
                                borderRadius: themeConfig.common.borderRadius,
                              }}
                            >
                              View Catalog
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      All tokens saved here dynamically propagate to both public exhibition pages and all admin management screens.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      )}
    </div>
  );
}
