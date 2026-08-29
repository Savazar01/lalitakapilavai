"use client";

import * as React from "react";
import {
  Settings,
  Shield,
  Cloud,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  Sliders,
  DollarSign,
  Clock,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [faviconUploading, setFaviconUploading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.watermarkedUrl || data.publicUrl || data.primaryImageUrl;
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

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const url = data.watermarkedUrl || data.publicUrl || data.primaryImageUrl;
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
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSuccessMsg("System configuration updated successfully.");
      toast.success("System settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
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
            Global system metadata, watermark vault controls, S3/R2 storage endpoints, and social channels.
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
          Save Settings
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
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
              <TabsTrigger value="general" className="text-xs py-2">
                <Settings className="w-3.5 h-3.5 mr-1.5" /> General & Locale
              </TabsTrigger>
              <TabsTrigger value="watermark" className="text-xs py-2">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Watermark Vault
              </TabsTrigger>
              <TabsTrigger value="storage" className="text-xs py-2">
                <Cloud className="w-3.5 h-3.5 mr-1.5" /> R2 / S3 Storage
              </TabsTrigger>
              <TabsTrigger value="socials" className="text-xs py-2">
                <Share2 className="w-3.5 h-3.5 mr-1.5" /> Social Channels
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
                        Upload your official brand logo to display across the public navigation bar, footer, and admin dashboard header.
                      </p>
                    </div>

                    {/* Logo Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      {form.logoUrl ? (
                        <div className="relative group w-32 h-18 rounded border border-border bg-card/80 flex items-center justify-center p-2 shrink-0">
                          <img
                            src={form.logoUrl}
                            alt="Website Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, logoUrl: "" })}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-18 rounded border border-dashed border-border/80 flex items-center justify-center text-muted-foreground text-[10px] text-center p-2 shrink-0">
                          No Logo Configured
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff"
                              className="hidden"
                              onChange={handleLogoUpload}
                              disabled={logoUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={logoUploading}
                              className="text-xs h-8 cursor-pointer"
                              asChild
                            >
                              <span>
                                {logoUploading ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                ) : (
                                  <Upload className="w-3 h-3 mr-1.5 text-primary" />
                                )}
                                {logoUploading ? "Uploading..." : "Upload Logo from Computer"}
                              </span>
                            </Button>
                          </label>
                          {form.logoUrl && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Logo Active
                            </span>
                          )}
                        </div>
                        <Input
                          placeholder="Or paste direct image URL (https://...)"
                          value={form.logoUrl || ""}
                          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                          className="text-xs font-mono h-8"
                        />
                      </div>
                    </div>

                    {/* Favicon Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-border/40">
                      {form.faviconUrl ? (
                        <div className="relative group w-12 h-12 rounded border border-border bg-card/80 flex items-center justify-center p-1 shrink-0">
                          <img
                            src={form.faviconUrl}
                            alt="Favicon Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, faviconUrl: "" })}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                            title="Remove Favicon"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded border border-dashed border-border/80 flex items-center justify-center text-muted-foreground text-[9px] text-center p-1 shrink-0">
                          No Favicon
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/tiff,image/x-icon"
                              className="hidden"
                              onChange={handleFaviconUpload}
                              disabled={faviconUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={faviconUploading}
                              className="text-xs h-7 cursor-pointer"
                              asChild
                            >
                              <span>
                                {faviconUploading ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                ) : (
                                  <Upload className="w-3 h-3 mr-1.5 text-primary" />
                                )}
                                {faviconUploading ? "Uploading..." : "Upload Favicon (.ico / .png)"}
                              </span>
                            </Button>
                          </label>
                        </div>
                        <Input
                          placeholder="Or paste favicon URL (https://.../favicon.png)"
                          value={form.faviconUrl || ""}
                          onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                          className="text-xs font-mono h-7"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Archive Site Name</label>
                    <Input
                      value={form.siteName}
                      onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Site Curatorial Tagline</label>
                    <textarea
                      rows={2}
                      value={form.siteDescription}
                      onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-primary" /> Default Display Currency
                      </label>
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
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" /> Default Exhibition Timezone
                      </label>
                      <Select
                        value={form.defaultTimezone}
                        onValueChange={(val) => setForm({ ...form, defaultTimezone: val })}
                      >
                        <SelectTrigger className="text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai (GST - UTC+4)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Admin Alert Email</label>
                      <Input
                        type="email"
                        value={form.adminAlertEmail}
                        onChange={(e) => setForm({ ...form, adminAlertEmail: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Public Contact Email</label>
                      <Input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Studio Phone / WhatsApp</label>
                      <Input
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                        className="text-xs"
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
                  <CardTitle className="font-serif text-lg">Copyright & Watermark Pipeline</CardTitle>
                  <CardDescription className="text-xs">
                    Automated dynamic watermarking stamped onto 22k gold foil high-resolution images via Sharp.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Watermark Stamp Text</label>
                    <Input
                      value={form.watermarkText}
                      onChange={(e) => setForm({ ...form, watermarkText: e.target.value })}
                      placeholder="© Lalita Kapilavai - Sacred Art & Heritage"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-primary" /> Watermark Opacity
                        </span>
                        <span className="font-mono text-primary font-bold">
                          {Math.round(form.watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <Input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={form.watermarkOpacity}
                        onChange={(e) =>
                          setForm({ ...form, watermarkOpacity: parseFloat(e.target.value) })
                        }
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-primary" /> Font Size (pt)
                        </span>
                        <span className="font-mono text-primary font-bold">
                          {form.watermarkFontSize}px
                        </span>
                      </div>
                      <Input
                        type="range"
                        min={16}
                        max={64}
                        step={2}
                        value={form.watermarkFontSize}
                        onChange={(e) =>
                          setForm({ ...form, watermarkFontSize: parseInt(e.target.value) })
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Live Watermark Preview Canvas */}
                  <div className="space-y-2 pt-2">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-primary" /> Live Watermark Overlay Simulator
                    </span>
                    <div className="relative h-44 rounded-lg overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-amber-950 via-amber-800 to-yellow-900 flex items-center justify-center shadow-inner">
                      {/* Gold foil pattern simulator */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Watermark stamp */}
                      <div
                        style={{
                          opacity: form.watermarkOpacity,
                          fontSize: `${form.watermarkFontSize}px`,
                        }}
                        className="text-white font-serif tracking-widest uppercase font-bold text-center px-4 select-none drop-shadow-md transform -rotate-12"
                      >
                        {form.watermarkText}
                      </div>

                      <div className="absolute bottom-2 right-2 text-[10px] text-amber-200/60 font-mono">
                        Sharp SVGO overlay simulation
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Storage */}
            <TabsContent value="storage">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Object Storage & CDN Integration</CardTitle>
                  <CardDescription className="text-xs">
                    Configure Cloudflare R2 or Amazon S3 credentials for masterwork watermarked vault storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Storage Engine</label>
                    <Select
                      value={form.storageProvider}
                      onValueChange={(val) => setForm({ ...form, storageProvider: val })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R2">Cloudflare R2 (Zero Egress Fees)</SelectItem>
                        <SelectItem value="S3">Amazon Web Services S3</SelectItem>
                        <SelectItem value="CUSTOM">Custom S3-Compatible (MinIO, Wasabi, Backblaze)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Bucket Name</label>
                      <Input
                        value={form.r2BucketName}
                        onChange={(e) => setForm({ ...form, r2BucketName: e.target.value })}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Public CDN Domain / URL</label>
                      <Input
                        value={form.r2PublicUrl}
                        onChange={(e) => setForm({ ...form, r2PublicUrl: e.target.value })}
                        placeholder="https://media.lalitakapilavai.com"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Cloudflare Account ID / Region</label>
                      <Input
                        value={form.r2AccountId}
                        onChange={(e) => setForm({ ...form, r2AccountId: e.target.value })}
                        placeholder="Cloudflare account ID or ap-south-1"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Custom Endpoint URL (if applicable)</label>
                      <Input
                        value={form.s3Endpoint}
                        onChange={(e) => setForm({ ...form, s3Endpoint: e.target.value })}
                        placeholder="https://<account-id>.r2.cloudflarestorage.com"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Access Key ID</label>
                      <Input
                        type="password"
                        value={form.s3AccessKey}
                        onChange={(e) => setForm({ ...form, s3AccessKey: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Secret Access Key</label>
                      <Input
                        type="password"
                        value={form.s3SecretKey}
                        onChange={(e) => setForm({ ...form, s3SecretKey: e.target.value })}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Socials */}
            <TabsContent value="socials">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Social Media & Cultural Channels</CardTitle>
                  <CardDescription className="text-xs">
                    Links rendered across the dynamic public footer and exhibition brochures.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Instagram Handle / URL</label>
                      <Input
                        value={form.instagramUrl}
                        onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/lalitakapilavai"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">YouTube Channel URL</label>
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
                      <label className="font-semibold text-foreground">Facebook Page URL</label>
                      <Input
                        value={form.facebookUrl}
                        onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/lalitakapilavai"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Pinterest Portfolio URL</label>
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
