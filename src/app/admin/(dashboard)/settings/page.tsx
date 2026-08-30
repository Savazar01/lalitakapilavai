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
} from "lucide-react";
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
      { platform: "Instagram", url: "https://instagram.com/lalitakapilavai", isVisible: true },
      { platform: "YouTube", url: "https://youtube.com/@lalitakapilavai", isVisible: true },
      { platform: "Facebook", url: "", isVisible: false },
      { platform: "SoundCloud", url: "", isVisible: false },
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
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

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
      const payload = {
        ...form,
        footerConfig,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Platform & Storage Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global system metadata, watermark vault, R2/S3 storage, dynamic footer, Gmail SMTP, and multi-provider AI engine.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Settings
        </Button>
      </div>

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
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 w-full h-auto p-1 bg-muted/60">
              <TabsTrigger value="general" className="text-xs py-2">
                <Settings className="w-3.5 h-3.5 mr-1" /> General
              </TabsTrigger>
              <TabsTrigger value="watermark" className="text-xs py-2">
                <Shield className="w-3.5 h-3.5 mr-1" /> Watermark
              </TabsTrigger>
              <TabsTrigger value="storage" className="text-xs py-2">
                <Cloud className="w-3.5 h-3.5 mr-1" /> R2 / S3
              </TabsTrigger>
              <TabsTrigger value="footer" className="text-xs py-2">
                <FileText className="w-3.5 h-3.5 mr-1" /> Footer
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs py-2">
                <Mail className="w-3.5 h-3.5 mr-1" /> Gmail / SMTP
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs py-2">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Engine
              </TabsTrigger>
              <TabsTrigger value="socials" className="text-xs py-2">
                <Share2 className="w-3.5 h-3.5 mr-1" /> Socials
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
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">Watermark Stamp Text</Label>
                    <Input
                      value={form.watermarkText}
                      onChange={(e) => setForm({ ...form, watermarkText: e.target.value })}
                      className="text-xs font-serif"
                    />
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
                  <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 space-y-1">
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
          </Tabs>
        </form>
      )}
    </div>
  );
}
