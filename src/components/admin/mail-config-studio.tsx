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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  { token: "{email}", label: "Email", desc: "Submitter email" },
  { token: "{phone}", label: "Phone", desc: "Contact number / WhatsApp" },
  { token: "{subject}", label: "Subject", desc: "Inquiry or artwork title" },
  { token: "{message}", label: "Message", desc: "Main comment or inquiry copy" },
  { token: "{form_name}", label: "Form Name", desc: "Title of dynamic form" },
  { token: "{form_data}", label: "Form Data", desc: "Key-value attributes table" },
  { token: "{event_title}", label: "Event Title", desc: "Recital or exhibition name" },
  { token: "{event_date}", label: "Event Date", desc: "Date and venue" },
  { token: "{guest_count}", label: "Guest Count", desc: "Number of reserved passes" },
  { token: "{date}", label: "Timestamp", desc: "Current time (IST)" },
];

export function MailConfigStudio() {
  const [subTab, setSubTab] = React.useState<"templates" | "logs">("templates");

  // Template State
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [savingTemplates, setSavingTemplates] = React.useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = React.useState(0);

  // Active Focused Field for token chip insertion
  const [activeField, setActiveField] = React.useState<
    "adminSubject" | "adminBodyTemplate" | "userSubject" | "userBodyTemplate" | null
  >(null);

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
  const [selectedErrorLog, setSelectedErrorLog] = React.useState<EmailLog | null>(null);

  // 1. Load Templates
  const fetchTemplates = React.useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load templates");
      if (Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error loading templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // 2. Load Logs
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
    [logsSearch, logsTriggerFilter, logsStatusFilter]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTemplates]);

  React.useEffect(() => {
    if (subTab === "logs") {
      const timer = setTimeout(() => {
        fetchLogs(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [subTab, fetchLogs]);

  // Save Templates
  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates }),
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

  // Helper to insert token into active input
  const insertToken = (token: string) => {
    if (!activeField || !templates[selectedTemplateIndex]) {
      toast.info(`Click on a subject or message box first, then click "${token}" to insert.`);
      return;
    }
    const current = templates[selectedTemplateIndex];
    const prevVal = (current[activeField] as string) || "";
    const updatedVal = prevVal ? `${prevVal} ${token}` : token;

    const updated = [...templates];
    updated[selectedTemplateIndex] = {
      ...current,
      [activeField]: updatedVal,
    };
    setTemplates(updated);
    toast.success(`Inserted ${token}`);
  };

  // CSV Export Trigger
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    params.set("export", "csv");
    if (logsSearch.trim()) params.set("search", logsSearch.trim());
    if (logsTriggerFilter !== "all") params.set("triggerType", logsTriggerFilter);
    if (logsStatusFilter !== "all") params.set("status", logsStatusFilter);
    if (logsStartDate) params.set("startDate", logsStartDate);
    if (logsEndDate) params.set("endDate", logsEndDate);

    const exportUrl = `/api/admin/email-logs?${params.toString()}`;
    window.open(exportUrl, "_blank");
    toast.success("Generating and downloading CSV audit report...");
  };

  const currentTemplate = templates[selectedTemplateIndex];

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-600" />
            Mail Message Configurator &amp; Dispatch Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fine-tune notification subjects, receipts, and view immutable outbound delivery telemetry.
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
      {/* SUB-TAB 1: FORM TEMPLATES MATRIX */}
      {/* ========================================================================= */}
      {subTab === "templates" && (
        <div className="space-y-6">
          {loadingTemplates ? (
            <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
              Loading email templates matrix...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Trigger Selector */}
              <div className="lg:col-span-4 space-y-3">
                <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                  Submission Types
                </Label>
                <div className="space-y-2">
                  {templates.map((tpl, idx) => {
                    const isSelected = idx === selectedTemplateIndex;
                    return (
                      <button
                        key={tpl.triggerType}
                        type="button"
                        onClick={() => setSelectedTemplateIndex(idx)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group",
                          isSelected
                            ? "border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-950 dark:text-amber-100 shadow-xs ring-1 ring-amber-500/30"
                            : "border-border bg-card/60 hover:bg-card text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {tpl.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-mono",
                              isSelected ? "border-amber-500/50 text-amber-800 dark:text-amber-300" : ""
                            )}
                          >
                            {tpl.triggerType}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tpl.adminSubject}
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                tpl.sendUserReceipt ? "bg-emerald-500" : "bg-slate-400"
                              )}
                            />
                            {tpl.sendUserReceipt ? "User Receipt Active" : "No User Receipt"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Token Palette */}
                <div className="p-4 rounded-xl border border-border/80 bg-card/40 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Dynamic Tokens
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Click to insert</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TOKENS.map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => insertToken(item.token)}
                        title={item.desc}
                        className="px-2 py-1 rounded bg-secondary/80 hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-200 border border-border text-[11px] font-mono transition-colors cursor-pointer"
                      >
                        {item.token}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Tokens are automatically compiled at runtime using the incoming submission payload.
                  </p>
                </div>
              </div>

              {/* Right Column: Template Configuration Editor */}
              {currentTemplate && (
                <div className="lg:col-span-8 space-y-6">
                  <Card className="border border-border/80 shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-serif font-bold text-foreground">
                            {currentTemplate.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Trigger Type: <code className="text-primary font-mono">{currentTemplate.triggerType}</code>
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSaveTemplates}
                          disabled={savingTemplates}
                          size="sm"
                          className="cursor-pointer"
                        >
                          {savingTemplates ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Save Templates
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 text-xs">
                      {/* Section 1: Admin Alert Config */}
                      <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-secondary/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-amber-600" />
                            1. Admin Alert Notification (Atelier Desk)
                          </Label>
                          <Badge variant="outline" className="text-[10px]">
                            Dispatched to adminAlertEmail
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-semibold text-foreground">Admin Subject Template</Label>
                          <Input
                            value={currentTemplate.adminSubject}
                            onFocus={() => setActiveField("adminSubject")}
                            onChange={(e) => {
                              const updated = [...templates];
                              updated[selectedTemplateIndex] = {
                                ...currentTemplate,
                                adminSubject: e.target.value,
                              };
                              setTemplates(updated);
                            }}
                            placeholder="✨ New Inquiry: {subject} [{name}]"
                            className="text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-semibold text-foreground">Admin Email Body Copy (HTML / Tokens)</Label>
                          <Textarea
                            value={currentTemplate.adminBodyTemplate}
                            onFocus={() => setActiveField("adminBodyTemplate")}
                            onChange={(e) => {
                              const updated = [...templates];
                              updated[selectedTemplateIndex] = {
                                ...currentTemplate,
                                adminBodyTemplate: e.target.value,
                              };
                              setTemplates(updated);
                            }}
                            rows={6}
                            placeholder="<p>Inbound inquiry received from {name}...</p>"
                            className="text-xs font-mono"
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
                              Sends an immediate confirmation email to the visitor who submitted the form.
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-semibold text-foreground">
                              {currentTemplate.sendUserReceipt ? "Enabled" : "Disabled"}
                            </span>
                            <input
                              type="checkbox"
                              checked={currentTemplate.sendUserReceipt}
                              onChange={(e) => {
                                const updated = [...templates];
                                updated[selectedTemplateIndex] = {
                                  ...currentTemplate,
                                  sendUserReceipt: e.target.checked,
                                };
                                setTemplates(updated);
                              }}
                              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {currentTemplate.sendUserReceipt && (
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            <div className="space-y-1.5">
                              <Label className="font-semibold text-foreground">User Confirmation Subject</Label>
                              <Input
                                value={currentTemplate.userSubject || ""}
                                onFocus={() => setActiveField("userSubject")}
                                onChange={(e) => {
                                  const updated = [...templates];
                                  updated[selectedTemplateIndex] = {
                                    ...currentTemplate,
                                    userSubject: e.target.value,
                                  };
                                  setTemplates(updated);
                                }}
                                placeholder="Thank you for contacting Lalita Kapilavai Atelier"
                                className="text-xs"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="font-semibold text-foreground">User Confirmation Body Copy (HTML / Tokens)</Label>
                              <Textarea
                                value={currentTemplate.userBodyTemplate || ""}
                                onFocus={() => setActiveField("userBodyTemplate")}
                                onChange={(e) => {
                                  const updated = [...templates];
                                  updated[selectedTemplateIndex] = {
                                    ...currentTemplate,
                                    userBodyTemplate: e.target.value,
                                  };
                                  setTemplates(updated);
                                }}
                                rows={6}
                                placeholder="<p>Dear {name}, thank you for contacting us...</p>"
                                className="text-xs font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Search */}
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[11px] font-semibold text-foreground">Search Telemetry</Label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchLogs(1)}
                      placeholder="Search recipient, subject, or sender..."
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
                    Export CSV
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

          {/* Error Details Modal / Drawer */}
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
