"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  QrCode,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Eye,
  Loader2,
  ExternalLink,
  Smartphone,
  MessageSquare,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditablePageHeader } from "@/components/admin/editable-page-header";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_DISCUSSION" | "QUALIFIED" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  source?: string;
  formTitle?: string | null;
  pageSlug?: string | null;
  customFields?: Record<string, unknown> | null;
  artworkId?: string | null;
  artworkTitle?: string | null;
  deviceInfo?: string | null;
  isSubscribed?: boolean;
  isEmailVerified?: boolean;
  verifiedAt?: string | null;
  lastVerifiedIp?: string | null;
  artwork?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  sourceArtwork?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  sourceEvent?: {
    id: string;
    title: string;
    venue: string;
  } | null;
}

const statusColors: Record<string, string> = {
  NEW: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  CONTACTED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  IN_DISCUSSION: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-600/40",
  QUALIFIED: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  CLOSED: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<LeadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sourceFilter, setSourceFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedLead, setSelectedLead] = React.useState<LeadItem | null>(null);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [targetDeleteLead, setTargetDeleteLead] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchLeads = React.useCallback(() => {
    const url = new URL("/api/admin/leads", window.location.origin);
    if (statusFilter !== "ALL") {
      url.searchParams.set("status", statusFilter);
    }
    if (sourceFilter !== "ALL") {
      url.searchParams.set("source", sourceFilter);
    }
    if (search.trim()) {
      url.searchParams.set("search", search.trim());
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeads(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading leads:", err);
        setLoading(false);
      });
  }, [statusFilter, sourceFilter, search]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? { ...l, status: newStatus as LeadItem["status"] }
              : l
          )
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev) =>
            prev ? { ...prev, status: newStatus as LeadItem["status"] } : null
          );
        }
        toast.success(`Lead status updated to ${newStatus}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update lead status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Error updating status");
    }
  };

  const handleDeleteClick = (leadId: string, leadName: string) => {
    setTargetDeleteLead({ id: leadId, name: leadName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteLead) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${targetDeleteLead.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== targetDeleteLead.id));
        if (selectedLead?.id === targetDeleteLead.id) setSelectedLead(null);
        toast.success(`Deleted lead record for "${targetDeleteLead.name}"`);
        setDeleteDialogOpen(false);
        setTargetDeleteLead(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete lead");
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
      toast.error("Error deleting lead");
    } finally {
      setDeleting(false);
    }
  };


  const handleExportCsv = () => {
    const url = new URL("/api/admin/leads", window.location.origin);
    url.searchParams.set("export", "csv");
    if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
    if (sourceFilter !== "ALL") url.searchParams.set("source", sourceFilter);
    if (search.trim()) url.searchParams.set("search", search.trim());
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <EditablePageHeader
        sectionKey="leads"
        defaultTitle="Inbound Leads & QR CRM"
        defaultSubtitle="Visitor captures from physical gallery QR cards, artwork acquisition inquiries, and event RSVPs."
        badgeLabel="Inbound Inquiries & QR Scans"
      >
        <Button
          onClick={handleExportCsv}
          variant="outline"
          className="text-xs border-border/80 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Export CSV
        </Button>
      </EditablePageHeader>

      {/* Primary Category / Source Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-lg border border-border">
        {[
          { id: "ALL", label: "All Inquiries", icon: Layers },
          { id: "CONTACT_FORM", label: "Contact Messages", icon: MessageSquare },
          { id: "EVENT_RSVP", label: "Event RSVPs", icon: Calendar },
          { id: "QR_SCAN", label: "QR Artwork Scans", icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = sourceFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSourceFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "NEW", "CONTACTED", "IN_DISCUSSION", "QUALIFIED", "CLOSED", "ARCHIVED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs"
                    : "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 font-semibold"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patron name, email, phone, artwork..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-serif uppercase tracking-wider text-muted-foreground">
            {sourceFilter === "QR_SCAN"
              ? `Exhibition Floor QR Scans (${leads.length})`
              : `Captured Leads & Inquiries (${leads.length})`}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Retrieving CRM records...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No Records Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {sourceFilter === "QR_SCAN"
                  ? "Visitor scans from physical gallery QR placards will appear here in real time."
                  : statusFilter === "ALL"
                  ? "QR floor scans and web inquiry forms will automatically populate here."
                  : `No records matching status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                {sourceFilter === "QR_SCAN" ? (
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Visitor / Contact</th>
                      <th className="py-3 px-4">Artwork Scanned</th>
                      <th className="py-3 px-4">Device &amp; Environment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Scanned At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                ) : (
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Patron Details</th>
                      <th className="py-3 px-4">Source / Origin</th>
                      <th className="py-3 px-4">Subject &amp; Message</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-border/60">
                  {leads.map((lead) => {
                    const artworkObj = lead.artwork || lead.sourceArtwork;
                    const artworkTitle = lead.artworkTitle || artworkObj?.title || "Exhibition Floor Masterpiece";
                    const artworkSlug = artworkObj?.slug;

                    if (sourceFilter === "QR_SCAN") {
                      return (
                        <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground text-sm font-serif">
                              {lead.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                              {lead.phone ? (
                                <span className="flex items-center gap-1 font-mono text-primary font-medium">
                                  <Phone className="w-3 h-3 text-primary" /> {lead.phone}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">No phone</span>
                              )}
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-muted-foreground" /> {lead.email}
                                  {lead.isEmailVerified && (
                                    <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-1 py-0 h-4">
                                      OTP Verified
                                    </Badge>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="w-fit text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 flex items-center gap-1 font-semibold"
                              >
                                <QrCode className="w-3 h-3 text-primary" /> Floor QR Placard
                              </Badge>
                              {artworkSlug ? (
                                <Link
                                  href={`/artwork/${artworkSlug}`}
                                  target="_blank"
                                  className="text-[12px] font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {artworkTitle}
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="text-[12px] font-medium text-foreground">
                                  {artworkTitle}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px] truncate" title={lead.deviceInfo || "Web Browser"}>
                              <Smartphone className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
                              <span className="truncate">{lead.deviceInfo || "Web Browser"}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <Select
                              value={lead.status}
                              onValueChange={(val) => handleStatusChange(lead.id, val)}
                            >
                              <SelectTrigger
                                className={`h-7 w-32 text-[10px] font-semibold border rounded-full ${
                                  statusColors[lead.status] || ""
                                }`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NEW">New</SelectItem>
                                <SelectItem value="CONTACTED">Contacted</SelectItem>
                                <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3" />
                              {new Date(lead.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedLead(lead)}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="View Full Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(lead.id, lead.name)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Erase Contact & Personal Data (GDPR)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Standard row for ALL, CONTACT_FORM, EVENT_RSVP
                    return (
                      <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground text-sm font-serif">
                            {lead.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-primary/70" /> {lead.email}
                                {lead.isEmailVerified && (
                                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-1 py-0 h-4">
                                    OTP Verified
                                  </Badge>
                                )}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-primary/70" /> {lead.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {lead.source === "QR_SCAN" || lead.artworkId || lead.sourceArtwork ? (
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="w-fit text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 flex items-center gap-1 font-semibold"
                              >
                                <QrCode className="w-3 h-3 text-primary" /> Floor QR Placard
                              </Badge>
                              {artworkSlug ? (
                                <Link
                                  href={`/artwork/${artworkSlug}`}
                                  target="_blank"
                                  className="text-[11px] text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {artworkTitle}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              ) : (
                                <span className="text-[11px] text-foreground">
                                  {artworkTitle}
                                </span>
                              )}
                            </div>
                          ) : lead.sourceEvent || lead.source === "EVENT_RSVP" ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="outline" className="w-fit text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                Event RSVP
                              </Badge>
                              <span className="text-[11px] font-medium text-foreground truncate max-w-[180px]">
                                {lead.sourceEvent?.title || "Special Event"}
                              </span>
                              {Boolean(lead.customFields?.selectedDate || lead.customFields?.selectedDates || lead.customFields?.selectedSlot) && (
                                <span className="text-[10px] font-mono text-primary">
                                  {Array.isArray(lead.customFields?.selectedDates) && (lead.customFields?.selectedDates as string[]).length > 0
                                    ? (lead.customFields?.selectedDates as string[]).join(", ")
                                    : String(lead.customFields?.selectedDate || "")} {lead.customFields?.selectedSlot ? `(${String(lead.customFields?.selectedSlot)})` : ""}
                                </span>
                              )}
                            </div>
                          ) : lead.formTitle || lead.pageSlug ? (
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="w-fit text-[10px] bg-primary/10 text-primary border-primary/30"
                              >
                                {lead.formTitle || "Page Form"}
                              </Badge>
                              {lead.pageSlug && (
                                <Link
                                  href={`/${lead.pageSlug}`}
                                  target="_blank"
                                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                  /{lead.pageSlug}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              {lead.source || "Inbound Web"}
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-foreground truncate">
                            {lead.subject || "General Inquiry"}
                          </div>
                          <p className="text-muted-foreground truncate text-[11px]">
                            {lead.message}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <Select
                            value={lead.status}
                            onValueChange={(val) => handleStatusChange(lead.id, val)}
                          >
                            <SelectTrigger
                              className={`h-7 w-32 text-[10px] font-semibold border rounded-full ${
                                statusColors[lead.status] || ""
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">New</SelectItem>
                              <SelectItem value="CONTACTED">Contacted</SelectItem>
                              <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                              <SelectItem value="QUALIFIED">Qualified</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                              <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedLead(lead)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(lead.id, lead.name)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Erase Contact & Personal Data (GDPR)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Inspection Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        {selectedLead && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="font-serif text-xl">
                  {selectedLead.name}
                </DialogTitle>
                <div className="flex items-center gap-1.5">
                  {selectedLead.isSubscribed === false && (
                    <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
                      Unsubscribed
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold border rounded-full ${
                      statusColors[selectedLead.status]
                    }`}
                  >
                    {selectedLead.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <DialogDescription className="text-xs">
                Captured on{" "}
                {new Date(selectedLead.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Email Address
                  </span>
                  <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-primary" />
                    {selectedLead.email ? (
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="hover:underline text-primary"
                      >
                        {selectedLead.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Phone / WhatsApp
                  </span>
                  <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-primary" />
                    {selectedLead.phone ? (
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="hover:underline text-foreground font-mono"
                      >
                        {selectedLead.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Security Verification Status */}
              <div className="p-2.5 rounded-lg border text-[11px] flex items-center justify-between gap-2 bg-muted/20 border-border">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Email Security Verification:
                </span>
                {selectedLead.isEmailVerified ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
                    Verified via 6-Digit OTP {selectedLead.verifiedAt ? `(${new Date(selectedLead.verifiedAt).toLocaleDateString()})` : ""}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">
                    Unverified / Standard Intake
                  </Badge>
                )}
              </div>

              {selectedLead.deviceInfo && (
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-[11px] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-medium">Device Environment:</span>
                  <span className="font-mono text-foreground truncate">{selectedLead.deviceInfo}</span>
                </div>
              )}

              {(selectedLead.artwork || selectedLead.sourceArtwork || selectedLead.artworkTitle) && (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase font-semibold flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-primary" /> Scanned Exhibition Floor QR Code
                  </span>
                  <p className="text-foreground font-semibold mt-1">
                    {selectedLead.artworkTitle || selectedLead.artwork?.title || selectedLead.sourceArtwork?.title || "Exhibition Floor Masterpiece"}
                  </p>
                  {(selectedLead.artwork?.slug || selectedLead.sourceArtwork?.slug) && (
                    <Link
                      href={`/artwork/${selectedLead.artwork?.slug || selectedLead.sourceArtwork?.slug}`}
                      target="_blank"
                      className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      View Masterwork Detail <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              )}

              {(selectedLead.sourceEvent || selectedLead.source === "EVENT_RSVP" || Boolean(selectedLead.customFields?.selectedDate) || Boolean(selectedLead.customFields?.selectedSlot)) && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Event Attendance Reservation
                  </span>
                  {selectedLead.sourceEvent && (
                    <p className="text-foreground font-semibold">
                      {selectedLead.sourceEvent.title}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-[11px] pt-0.5">
                    {Boolean(selectedLead.customFields?.selectedDate || selectedLead.customFields?.selectedDates) && (
                      <span className="text-muted-foreground">
                        Attendance Date(s):{" "}
                        <strong className="text-foreground font-mono">
                          {Array.isArray(selectedLead.customFields?.selectedDates) && (selectedLead.customFields?.selectedDates as string[]).length > 0
                            ? (selectedLead.customFields?.selectedDates as string[]).join(", ")
                            : String(selectedLead.customFields?.selectedDate || "")}
                        </strong>
                      </span>
                    )}
                    {Boolean(selectedLead.customFields?.selectedSlot) && (
                      <span className="text-muted-foreground">
                        Time Slot: <strong className="text-primary font-mono">{String(selectedLead.customFields?.selectedSlot)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(selectedLead.formTitle || selectedLead.pageSlug) && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-[10px] text-primary uppercase font-semibold flex items-center gap-1">
                    Originating Visual Page Form
                  </span>
                  <p className="text-foreground font-semibold mt-1">
                    {selectedLead.formTitle || "Custom Form Submission"}
                  </p>
                  {selectedLead.pageSlug && (
                    <Link
                      href={`/${selectedLead.pageSlug}`}
                      target="_blank"
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1"
                    >
                      View Live Page: /{selectedLead.pageSlug} <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Subject
                </span>
                <p className="font-medium text-foreground">
                  {selectedLead.subject || "General Inquiry"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Inquiry Message / Notes
                </span>
                <div className="p-3 rounded-md bg-card border border-border text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              {selectedLead.customFields && typeof selectedLead.customFields === "object" && Object.keys(selectedLead.customFields).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Dynamic Form Custom Fields
                  </span>
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-[10px] text-muted-foreground uppercase">
                        <tr>
                          <th className="p-2">Field</th>
                          <th className="p-2">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {Object.entries(selectedLead.customFields).map(([key, val]) => (
                          <tr key={key} className="hover:bg-muted/10">
                            <td className="p-2 font-medium text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </td>
                            <td className="p-2 text-foreground font-mono text-[11px]">
                              {typeof val === "boolean"
                                ? val ? "Yes / Selected" : "No / Unselected"
                                : typeof val === "object"
                                ? JSON.stringify(val)
                                : String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-border gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const target = { id: selectedLead.id, name: selectedLead.name };
                    setSelectedLead(null);
                    handleDeleteClick(target.id, target.name);
                  }}
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Erase Data (GDPR)
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Status:</span>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(val) => handleStatusChange(selectedLead.id, val)}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Erase Contact & Personal Data (GDPR Compliance)"
        description={
          targetDeleteLead
            ? `Are you sure you want to permanently erase all records and personal telemetry for "${targetDeleteLead.name}"? In accordance with GDPR data protection compliance, this action permanently deletes all associated inquiries, QR scans, and contact identifiers.`
            : "Are you sure you want to permanently erase this contact record?"
        }
        confirmText="Erase Personal Data (GDPR)"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

