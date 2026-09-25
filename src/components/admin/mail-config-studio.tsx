"use client";

import * as React from "react";
import {
  Mail,
  Send,
  Sliders,
  Sparkles,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ExternalLink,
  Layers,
  Calendar,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTiptapEditor } from "@/components/admin/email-tiptap-editor";
import { DiscoveredFormCategory, DiscoveredFormItem } from "@/app/api/admin/forms/discover/route";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id?: string;
  triggerType: string;
  name: string;
  adminSubject: string;
  adminBodyTemplate: string;
  sendUserReceipt: boolean;
  userSubject: string | null;
  userBodyTemplate: string | null;
}

interface EmailLog {
  id: string;
  recipient: string;
  sender: string;
  triggerType: string;
  subject: string;
  status: "SENT" | "FAILED" | string;
  errorMessage?: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AVAILABLE_TOKENS = [
  { token: "{name}", label: "Name", desc: "Submitter full name" },
  { token: "{email}", label: "Email", desc: "Submitter email address" },
  { token: "{phone}", label: "Phone", desc: "Contact number / WhatsApp" },
  { token: "{subject}", label: "Subject", desc: "Inquiry or submission subject line" },
  { token: "{message}", label: "Message", desc: "Main comment or inquiry message" },
  { token: "{form_name}", label: "Form Name", desc: "Title or category of dynamic form" },
  { token: "{form_data}", label: "Form Data", desc: "Structured HTML key-value table of all fields" },
  { token: "{event_title}", label: "Event Title", desc: "Recital or exhibition name" },
  { token: "{event_date}", label: "Event Date", desc: "Scheduled date and venue" },
  { token: "{guest_count}", label: "Guest Count", desc: "Number of reserved passes" },
  { token: "{date}", label: "Timestamp", desc: "Current time (IST)" },
];

export function MailConfigStudio() {
  const [subTab, setSubTab] = React.useState<"templates" | "logs">("templates");

  // Template State
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
  const [discoveredCategories, setDiscoveredCategories] = React.useState<DiscoveredFormCategory[]>([]);
  const [discoveredForms, setDiscoveredForms] = React.useState<DiscoveredFormItem[]>([]);
  const [activeFormTrigger, setActiveFormTrigger] = React.useState<string>("contact");
  const [formSearchQuery, setFormSearchQuery] = React.useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = React.useState<string>("all");

  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [savingTemplates, setSavingTemplates] = React.useState(false);

  // Active Subject Input for token insertion
  const [activeSubjectField, setActiveSubjectField] = React.useState<"adminSubject" | "userSubject" | null>(null);

  // Logs State
  const [logs, setLogs] = React.useState<EmailLog[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [logsSearch, setLogsSearch] = React.useState("");
  const [logsTriggerFilter, setLogsTriggerFilter] = React.useState("all");
  const [logsStatusFilter, setLogsStatusFilter] = React.useState("all");
  const [logsStartDate, setLogsStartDate] = React.useState("");
  const [logsEndDate, setLogsEndDate] = React.useState("");
  const [selectedErrorLog, setSelectedErrorLog] = React.useState<EmailLog | null>(null);

  // 1. Fetch Discovered Forms & Existing Templates
  const loadStudioData = React.useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const [tplRes, discRes] = await Promise.all([
        fetch("/api/admin/email-templates"),
        fetch("/api/admin/forms/discover"),
      ]);

      const tplData = await tplRes.json();
      const discData = await discRes.json();

      if (!tplRes.ok) throw new Error(tplData.error || "Failed to load saved templates");
      if (!discRes.ok) throw new Error(discData.error || "Failed to discover forms");

      const existingTemplates: EmailTemplate[] = Array.isArray(tplData.templates) ? tplData.templates : [];
      setTemplates(existingTemplates);

      if (Array.isArray(discData.categories)) {
        setDiscoveredCategories(discData.categories);
      }
      if (Array.isArray(discData.allForms)) {
        setDiscoveredForms(discData.allForms);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error loading form discovery & templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // 2. Fetch Logs
  const fetchLogs = React.useCallback(
    async (pageToLoad = 1) => {
      setLoadingLogs(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(pageToLoad));
        params.set("limit", "20");
        if (logsSearch.trim()) params.set("search", logsSearch.trim());
        if (logsTriggerFilter !== "all") params.set("triggerType", logsTriggerFilter);
        if (logsStatusFilter !== "all") params.set("status", logsStatusFilter);
        if (logsStartDate.trim()) params.set("startDate", logsStartDate.trim());
        if (logsEndDate.trim()) params.set("endDate", logsEndDate.trim());

        const res = await fetch(`/api/admin/email-logs?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load audit logs");
        setLogs(data.logs || []);
        if (data.pagination) setPagination(data.pagination);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error loading email audit logs");
      } finally {
        setLoadingLogs(false);
      }
    },
    [logsSearch, logsTriggerFilter, logsStatusFilter, logsStartDate, logsEndDate]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadStudioData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStudioData]);

  React.useEffect(() => {
    if (subTab === "logs") {
      const timer = setTimeout(() => {
        fetchLogs(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [subTab, fetchLogs]);

  // Find or generate active template object
  const currentDiscoveredForm = React.useMemo(() => {
    return discoveredForms.find((f) => f.triggerType === activeFormTrigger) || {
      triggerType: activeFormTrigger,
      name: "General Inquiry",
      source: "System Core" as const,
      url: "/contact",
    };
  }, [discoveredForms, activeFormTrigger]);

  const currentTemplate = React.useMemo((): EmailTemplate => {
    const found = templates.find((t) => t.triggerType === activeFormTrigger);
    if (found) return found;

    // Generate fallback template for newly selected discovered form
    const isEvent = activeFormTrigger.startsWith("event_rsvp");
    const isPageForm = activeFormTrigger.startsWith("page_form");

    if (isEvent) {
      return {
        triggerType: activeFormTrigger,
        name: currentDiscoveredForm.name,
        adminSubject: `🎫 New RSVP: {event_title} [{name}]`,
        adminBodyTemplate: `<p>A new RSVP has been received for <strong>{event_title}</strong>.</p><p><strong>Patron:</strong> {name} (<a href="mailto:{email}">{email}</a>)<br/><strong>Contact:</strong> {phone}<br/><strong>Reserved Passes:</strong> {guest_count}</p><p><strong>Additional Notes:</strong><br/>{message}</p>`,
        sendUserReceipt: true,
        userSubject: `Your RSVP Confirmation: {event_title}`,
        userBodyTemplate: `<p>Dear {name},</p><p>Thank you for reserving your attendance for <strong>{event_title}</strong>.</p><p><strong>Event Schedule & Venue:</strong> {event_date}<br/><strong>Confirmed Passes:</strong> {guest_count}</p><p>We look forward to welcoming you.</p><p>Warm regards,<br/><strong>Lalita Kapilavai Atelier</strong></p>`,
      };
    }

    if (isPageForm) {
      return {
        triggerType: activeFormTrigger,
        name: currentDiscoveredForm.name,
        adminSubject: `📝 Inbound Form: ${currentDiscoveredForm.name} [{name}]`,
        adminBodyTemplate: `<p>A new submission was received on <strong>${currentDiscoveredForm.name}</strong>.</p><p><strong>From:</strong> {name} (<a href="mailto:{email}">{email}</a>)<br/><strong>Contact:</strong> {phone}</p><p><strong>Message:</strong><br/>{message}</p>{form_data}`,
        sendUserReceipt: true,
        userSubject: `We received your message — Lalita Kapilavai Atelier`,
        userBodyTemplate: `<p>Dear {name},</p><p>Thank you for reaching out regarding ${currentDiscoveredForm.name}. We have received your correspondence and will respond shortly.</p><p>Warm regards,<br/><strong>Lalita Kapilavai Atelier</strong></p>`,
      };
    }

    return {
      triggerType: activeFormTrigger,
      name: currentDiscoveredForm.name,
      adminSubject: `✨ New Inquiry: {subject} [{name}]`,
      adminBodyTemplate: `<p>Inbound inquiry received from {name}...</p>`,
      sendUserReceipt: true,
      userSubject: `Thank you for contacting Lalita Kapilavai Atelier`,
      userBodyTemplate: `<p>Dear {name},</p><p>Thank you for contacting us. We have received your message.</p>`,
    };
  }, [templates, activeFormTrigger, currentDiscoveredForm]);

  // Mutate current template
  const updateCurrentTemplate = (patch: Partial<EmailTemplate>) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.triggerType === activeFormTrigger);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
      } else {
        return [...prev, { ...currentTemplate, ...patch }];
      }
    });
  };

  // Save all templates
  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    try {
      // Ensure the current active template is in the array
      const allToSave = [...templates];
      if (!allToSave.some((t) => t.triggerType === currentTemplate.triggerType)) {
        allToSave.push(currentTemplate);
      }

      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates: allToSave }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save email templates");
      toast.success("Mail message configurations successfully saved!");
      if (data.templates) setTemplates(data.templates);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving templates");
    } finally {
      setSavingTemplates(false);
    }
  };

  // Insert token into active subject input
  const insertTokenIntoSubject = (token: string) => {
    if (!activeSubjectField) {
      toast.info(`Click into the Admin Subject or User Subject input to insert ${token}.`);
      return;
    }
    const prev = currentTemplate[activeSubjectField] || "";
    const updated = prev ? `${prev} ${token}` : token;
    updateCurrentTemplate({ [activeSubjectField]: updated });
    toast.success(`Inserted ${token}`);
  };

  // CSV Export Trigger
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    params.set("export", "csv");
    if (logsSearch.trim()) params.set("search", logsSearch.trim());
    if (logsTriggerFilter !== "all") params.set("triggerType", logsTriggerFilter);
    if (logsStatusFilter !== "all") params.set("status", logsStatusFilter);
    if (logsStartDate.trim()) params.set("startDate", logsStartDate.trim());
    if (logsEndDate.trim()) params.set("endDate", logsEndDate.trim());

    const exportUrl = `/api/admin/email-logs?${params.toString()}`;
    window.open(exportUrl, "_blank");
    toast.success("Generating and downloading CSV audit report...");
  };

  // Filter discovered forms by search and category
  const filteredDiscoveredForms = React.useMemo(() => {
    let list = discoveredForms;
    if (selectedCategoryTab === "core") {
      list = list.filter((f) => f.source === "System Core");
    } else if (selectedCategoryTab === "pages") {
      list = list.filter((f) => f.source === "Page Builder");
    } else if (selectedCategoryTab === "events") {
      list = list.filter((f) => f.source === "Event Registration");
    }

    if (formSearchQuery.trim()) {
      const q = formSearchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.triggerType.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [discoveredForms, selectedCategoryTab, formSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-600" />
            Universal Mail Studio &amp; Dispatch Telemetry
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dynamic form discovery, rich Tiptap email editor, and audit log.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setSubTab("templates")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              subTab === "templates"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-foreground"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            Form Templates Matrix
          </button>
          <button
            type="button"
            onClick={() => setSubTab("logs")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              subTab === "logs"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-foreground"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Outbound Audit Log
            {pagination.total > 0 && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">
                {pagination.total}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: FORM TEMPLATES MATRIX & DYNAMIC FORM DISCOVERY */}
      {/* ========================================================================= */}
      {subTab === "templates" && (
        <div className="space-y-6">
          {loadingTemplates ? (
            <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
              Scanning dynamic forms &amp; loading email templates...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Discovered Forms Directory */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    Discovered Forms ({discoveredForms.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadStudioData}
                    className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Re-scan
                  </Button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "All Forms", count: discoveredForms.length },
                    {
                      id: "core",
                      label: "Core",
                      count: discoveredForms.filter((f) => f.source === "System Core").length,
                    },
                    {
                      id: "pages",
                      label: "Pages",
                      count: discoveredForms.filter((f) => f.source === "Page Builder").length,
                    },
                    {
                      id: "events",
                      label: "Events",
                      count: discoveredForms.filter((f) => f.source === "Event Registration").length,
                    },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryTab(cat.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border",
                        selectedCategoryTab === cat.id
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-xs"
                          : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200"
                      )}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>

                {/* Search input for forms */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={formSearchQuery}
                    onChange={(e) => setFormSearchQuery(e.target.value)}
                    placeholder="Filter forms by name or trigger..."
                    className="text-xs pl-8 h-8 font-mono"
                  />
                </div>

                {/* Form Items List */}
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {filteredDiscoveredForms.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No forms discovered matching your search.
                    </div>
                  ) : (
                    filteredDiscoveredForms.map((item) => {
                      const isSelected = item.triggerType === activeFormTrigger;
                      const hasSavedTemplate = templates.some((t) => t.triggerType === item.triggerType);

                      return (
                        <button
                          key={item.triggerType}
                          type="button"
                          onClick={() => setActiveFormTrigger(item.triggerType)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative group",
                            isSelected
                              ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-100 shadow-xs ring-1 ring-amber-500/30"
                              : "border-border bg-card/70 hover:bg-card text-foreground"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {item.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] shrink-0 font-mono py-0",
                                item.source === "System Core"
                                  ? "border-blue-500/40 text-blue-700 dark:text-blue-300"
                                  : item.source === "Event Registration"
                                  ? "border-purple-500/40 text-purple-700 dark:text-purple-300"
                                  : "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                              )}
                            >
                              {item.source === "System Core"
                                ? "Core"
                                : item.source === "Event Registration"
                                ? "Event"
                                : "Page"}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-muted-foreground line-clamp-1 font-mono">
                            {item.triggerType}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  hasSavedTemplate ? "bg-emerald-500" : "bg-amber-400"
                                )}
                              />
                              {hasSavedTemplate ? "Configured" : "Default Inherited"}
                            </span>
                            {item.url && (
                              <span className="text-[10px] font-mono text-muted-foreground/80 truncate max-w-[120px]">
                                {item.url}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Subject Token Chips */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/40 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Subject Tokens
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Insert into subject</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_TOKENS.slice(0, 8).map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => insertTokenIntoSubject(item.token)}
                        title={item.desc}
                        className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-200 border border-border text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        {item.token}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Tip: The rich text editor below also includes its own dedicated token chips bar.
                  </p>
                </div>
              </div>

              {/* Right Column: Template Configuration Editor */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border border-border/80 shadow-xs">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-serif font-bold text-foreground">
                            {currentTemplate.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {currentTemplate.triggerType}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                          <span>Source: <strong>{currentDiscoveredForm.source}</strong></span>
                          {currentDiscoveredForm.url && (
                            <a
                              href={currentDiscoveredForm.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>{currentDiscoveredForm.url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {currentDiscoveredForm.eventDate && (
                            <span className="text-muted-foreground">
                              • {currentDiscoveredForm.eventDate}
                            </span>
                          )}
                        </CardDescription>
                      </div>

                      <Button
                        type="button"
                        onClick={handleSaveTemplates}
                        disabled={savingTemplates}
                        size="sm"
                        className="cursor-pointer shrink-0"
                      >
                        {savingTemplates ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Save Configuration
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 text-xs">
                    {/* Section 1: Admin Alert Config */}
                    <div className="space-y-3.5 p-4 rounded-xl border border-border/80 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-amber-600" />
                          1. Admin Alert Notification (Atelier Desk)
                        </Label>
                        <Badge variant="outline" className="text-[10px]">
                          Delivered to adminAlertEmail
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Admin Subject Template</Label>
                        <Input
                          value={currentTemplate.adminSubject}
                          onFocus={() => setActiveSubjectField("adminSubject")}
                          onChange={(e) => updateCurrentTemplate({ adminSubject: e.target.value })}
                          placeholder="✨ New Inquiry: {subject} [{name}]"
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">
                          Admin Notification Copy (Universal Tiptap WYSIWYG)
                        </Label>
                        <EmailTiptapEditor
                          content={currentTemplate.adminBodyTemplate}
                          onChange={(html) => updateCurrentTemplate({ adminBodyTemplate: html })}
                          tokens={AVAILABLE_TOKENS}
                          placeholder="Compose admin alert notice..."
                        />
                      </div>
                    </div>

                    {/* Section 2: User Confirmation Receipt */}
                    <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                            2. Patron Confirmation Receipt (Auto-Responder)
                          </Label>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Sends an immediate branded confirmation email to the visitor who submitted the form.
                          </p>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-semibold text-foreground">
                            {currentTemplate.sendUserReceipt ? "Active" : "Disabled"}
                          </span>
                          <input
                            type="checkbox"
                            checked={currentTemplate.sendUserReceipt}
                            onChange={(e) => updateCurrentTemplate({ sendUserReceipt: e.target.checked })}
                            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>

                      {currentTemplate.sendUserReceipt && (
                        <div className="space-y-3.5 pt-2 border-t border-border/50">
                          <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">User Confirmation Subject</Label>
                            <Input
                              value={currentTemplate.userSubject || ""}
                              onFocus={() => setActiveSubjectField("userSubject")}
                              onChange={(e) => updateCurrentTemplate({ userSubject: e.target.value })}
                              placeholder="Thank you for contacting Lalita Kapilavai Atelier"
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">
                              User Confirmation Copy (Universal Tiptap WYSIWYG)
                            </Label>
                            <EmailTiptapEditor
                              content={currentTemplate.userBodyTemplate || ""}
                              onChange={(html) => updateCurrentTemplate({ userBodyTemplate: html })}
                              tokens={AVAILABLE_TOKENS}
                              placeholder="Compose patron confirmation message..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: OUTBOUND EMAIL AUDIT LOG */}
      {/* ========================================================================= */}
      {subTab === "logs" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <Card className="border border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                {/* Search */}
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[11px] font-semibold text-foreground">Search Telemetry</Label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchLogs(1)}
                      placeholder="Search recipient, subject, sender..."
                      className="text-xs pl-8 h-8 font-mono"
                    />
                  </div>
                </div>

                {/* Trigger Filter */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Trigger Form</Label>
                  <Select value={logsTriggerFilter} onValueChange={(val) => setLogsTriggerFilter(val)}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue placeholder="All Triggers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Submission Types</SelectItem>
                      <SelectItem value="contact">Contact Inquiry</SelectItem>
                      <SelectItem value="event_rsvp">Event / Concert RSVP</SelectItem>
                      <SelectItem value="acquisition">Artwork Acquisition</SelectItem>
                      <SelectItem value="custom_form">Custom Form Block</SelectItem>
                      <SelectItem value="test">SMTP Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Status</Label>
                  <Select value={logsStatusFilter} onValueChange={(val) => setLogsStatusFilter(val)}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="SENT">Delivered (SENT)</SelectItem>
                      <SelectItem value="FAILED">Failed (FAILED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={logsStartDate}
                    onChange={(e) => setLogsStartDate(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(1)}
                    disabled={loadingLogs}
                    className="h-8 text-xs flex-1 cursor-pointer"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 mr-1", loadingLogs && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleExportCsv}
                    className="h-8 text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4">Date / Time (IST)</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Trigger Form</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                        Fetching outbound dispatch telemetry...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No outbound email dispatches found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isSent = log.status === "SENT";
                      const dateStr = new Date(log.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                            {dateStr}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                            {log.recipient}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-mono",
                                log.triggerType.includes("receipt")
                                  ? "border-blue-400 text-blue-700 dark:text-blue-300"
                                  : "border-amber-400 text-amber-800 dark:text-amber-300"
                              )}
                            >
                              {log.triggerType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-foreground font-medium" title={log.subject}>
                            {log.subject}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <Badge
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5",
                                isSent
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                              )}
                            >
                              {isSent ? "SENT" : "FAILED"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {log.errorMessage ? (
                              <button
                                type="button"
                                onClick={() => setSelectedErrorLog(log)}
                                className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" /> View Error
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30 text-xs">
              <span className="text-muted-foreground">
                Showing {logs.length} of {pagination.total} records (Page {pagination.page} of {pagination.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loadingLogs}
                  onClick={() => fetchLogs(pagination.page - 1)}
                  className="h-7 text-xs cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages || loadingLogs}
                  onClick={() => fetchLogs(pagination.page + 1)}
                  className="h-7 text-xs cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Error Details Modal */}
          {selectedErrorLog && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Outbound Dispatch Failure Telemetry
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedErrorLog(null)}
                    className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <p><strong>Recipient:</strong> <code className="font-mono">{selectedErrorLog.recipient}</code></p>
                  <p><strong>Subject:</strong> {selectedErrorLog.subject}</p>
                  <p><strong>Trigger:</strong> {selectedErrorLog.triggerType}</p>
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 font-mono text-[11px] whitespace-pre-wrap">
                    {selectedErrorLog.errorMessage || "Unknown dispatch failure"}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedErrorLog(null)}
                    className="cursor-pointer text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
