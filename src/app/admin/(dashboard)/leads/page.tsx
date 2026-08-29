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
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_DISCUSSION" | "QUALIFIED" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  sourceArtwork: {
    id: string;
    title: string;
    slug: string;
  } | null;
  sourceEvent: {
    id: string;
    title: string;
    venue: string;
  } | null;
}

const statusColors: Record<string, string> = {
  NEW: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  CONTACTED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  IN_DISCUSSION: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  QUALIFIED: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  CLOSED: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<LeadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
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
  }, [statusFilter, search]);

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
    if (search.trim()) url.searchParams.set("search", search.trim());
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Leads & Exhibition QR CRM
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visitor captures from physical gallery QR cards, artwork acquisition inquiries, and event RSVPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            className="text-xs border-border/80 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Export CSV
          </Button>
        </div>
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
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
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
            placeholder="Search collector name, email, phone..."
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
            Captured Collector Leads ({leads.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Retrieving CRM leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No Leads Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "ALL"
                  ? "QR floor scans and web inquiry forms will automatically populate here."
                  : `No leads with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Collector Details</th>
                    <th className="py-3 px-4">Source / Origin</th>
                    <th className="py-3 px-4">Subject & Message</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground text-sm font-serif">
                          {lead.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-primary/70" /> {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-primary/70" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {lead.sourceArtwork ? (
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1"
                            >
                              <QrCode className="w-3 h-3" /> Exhibition Floor QR
                            </Badge>
                            <Link
                              href={`/artwork/${lead.sourceArtwork.slug}`}
                              target="_blank"
                              className="text-[11px] text-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                              {lead.sourceArtwork.title}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        ) : lead.sourceEvent ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit text-[10px]">
                              Event RSVP
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {lead.sourceEvent.title}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Inbound Web
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-foreground truncate">
                          {lead.subject || "General Acquisition Inquiry"}
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
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>

                        </div>
                      </td>
                    </tr>
                  ))}
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
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold border rounded-full ${
                    statusColors[selectedLead.status]
                  }`}
                >
                  {selectedLead.status.replace("_", " ")}
                </Badge>
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
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="hover:underline text-primary"
                    >
                      {selectedLead.email}
                    </a>
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
                        className="hover:underline text-foreground"
                      >
                        {selectedLead.phone}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                </div>
              </div>

              {selectedLead.sourceArtwork && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> Scanned Exhibition Floor QR Code
                  </span>
                  <p className="text-foreground font-semibold mt-1">
                    {selectedLead.sourceArtwork.title}
                  </p>
                  <Link
                    href={`/artwork/${selectedLead.sourceArtwork.slug}`}
                    target="_blank"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View Masterwork Detail <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Subject
                </span>
                <p className="font-medium text-foreground">
                  {selectedLead.subject || "General Acquisition Inquiry"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Collector Message / Notes
                </span>
                <div className="p-3 rounded-md bg-card border border-border text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border">
                <span className="text-xs font-semibold text-foreground">Update Lead Status:</span>
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
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Patron Lead Record"
        description={
          targetDeleteLead
            ? `Are you sure you want to delete the acquisition lead record for "${targetDeleteLead.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this lead record?"
        }
        confirmText="Delete Lead"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

