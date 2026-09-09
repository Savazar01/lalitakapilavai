"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  FileText,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select dropdown
}

export interface FormBlockData {
  formTitle?: string;
  formSubtitle?: string;
  submitButtonText?: string;
  successMessage?: string;
  notifyEmail?: boolean;
  fields?: FormFieldConfig[];
}

export interface FormBlockInspectorProps {
  data: FormBlockData;
  onChange: (updated: FormBlockData) => void;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Short Text",
  email: "Email Address",
  tel: "Phone / WhatsApp",
  textarea: "Multi-line Textarea",
  select: "Dropdown Menu",
  checkbox: "Single Checkbox",
};

export function FormBlockInspector({ data, onChange }: FormBlockInspectorProps) {
  const formTitle = data.formTitle ?? "Send Curatorial Inquiry";
  const formSubtitle =
    data.formSubtitle ??
    "Direct correspondence with the atelier desk of Lalita Kapilavai.";
  const submitButtonText = data.submitButtonText ?? "Submit Inquiry";
  const successMessage =
    data.successMessage ??
    "Thank you for your correspondence. The curatorial desk will respond shortly.";
  const fields = data.fields ?? [
    {
      id: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "e.g. Smt. Gayatri Iyer",
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "curator@example.com",
    },
    {
      id: "phone",
      label: "Phone / WhatsApp",
      type: "tel",
      required: false,
      placeholder: "+91 98450 12345",
    },
    {
      id: "inquiry_type",
      label: "Inquiry Type",
      type: "select",
      required: false,
      placeholder: "Select an option",
      options: [
        "Artwork Acquisition",
        "Commission Work",
        "Private Viewing / RSVP",
        "Carnatic Music Recital",
        "General Curatorial Question",
      ],
    },
    {
      id: "message",
      label: "Message / Commentary",
      type: "textarea",
      required: true,
      placeholder: "Specify masterwork inquiries, dimensions, or bespoke requirements...",
    },
  ];

  // Field Edit Modal State
  const [editingField, setEditingField] = React.useState<FormFieldConfig | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = React.useState(false);
  const [optionsStr, setOptionsStr] = React.useState("");

  const updateConfig = (patch: Partial<FormBlockData>) => {
    onChange({
      formTitle,
      formSubtitle,
      submitButtonText,
      successMessage,
      fields,
      ...patch,
    });
  };

  const handleOpenAddField = () => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter details...",
      options: [],
    };
    setEditingField(newField);
    setOptionsStr("");
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (f: FormFieldConfig) => {
    setEditingField({ ...f });
    setOptionsStr((f.options || []).join(", "));
    setIsFieldModalOpen(true);
  };

  const handleSaveFieldModal = () => {
    if (!editingField) return;
    const cleanOptions =
      editingField.type === "select"
        ? optionsStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const finalized: FormFieldConfig = {
      ...editingField,
      label: editingField.label.trim() || "Untitled Field",
      options: cleanOptions,
    };

    const existingIndex = fields.findIndex((item) => item.id === finalized.id);
    let updatedList: FormFieldConfig[];
    if (existingIndex >= 0) {
      updatedList = [...fields];
      updatedList[existingIndex] = finalized;
    } else {
      updatedList = [...fields, finalized];
    }

    updateConfig({ fields: updatedList });
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    updateConfig({ fields: updated });
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    updateConfig({ fields: copy });
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Meta Settings */}
      <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-card/60">
        <h4 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-primary" />
          Form Header &amp; Notifications
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground">Form Title</Label>
            <Input
              value={formTitle}
              onChange={(e) => updateConfig({ formTitle: e.target.value })}
              className="text-xs"
              placeholder="e.g. Inquire on Tanjore Acquisition"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground">Submit Button Text</Label>
            <Input
              value={submitButtonText}
              onChange={(e) => updateConfig({ submitButtonText: e.target.value })}
              className="text-xs font-semibold"
              placeholder="Submit Inquiry"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Form Subtitle / Narrative</Label>
          <Textarea
            value={formSubtitle}
            onChange={(e) => updateConfig({ formSubtitle: e.target.value })}
            rows={2}
            className="text-xs leading-relaxed"
            placeholder="Direct correspondence with Lalita Kapilavai studio..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Success Notice</Label>
          <Input
            value={successMessage}
            onChange={(e) => updateConfig({ successMessage: e.target.value })}
            className="text-xs"
            placeholder="Thank you for your correspondence..."
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <h4 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Dynamic Fields ({fields.length})
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Configure visitor inputs, required validation, and dropdown choices.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleOpenAddField}
            className="text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground font-mono text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-xs truncate">
                      {field.label}
                    </span>
                    {field.required && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono"
                      >
                        Required
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Type: {FIELD_TYPE_LABELS[field.type] || field.type}
                    {field.type === "select" && field.options?.length
                      ? ` (${field.options.length} options)`
                      : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={idx === 0}
                  onClick={() => handleMoveField(idx, "up")}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={idx === fields.length - 1}
                  onClick={() => handleMoveField(idx, "down")}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] cursor-pointer"
                  onClick={() => handleOpenEditField(field)}
                >
                  <Edit2 className="w-3 h-3 mr-1 text-primary" /> Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => handleDeleteField(field.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Configuration Dialog */}
      <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editingField?.id.startsWith("field_") ? "Add Form Field" : "Edit Field"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure label, input behavior, and placeholders for this field.
            </DialogDescription>
          </DialogHeader>

          {editingField && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="font-semibold text-foreground">Field Label *</Label>
                <Input
                  value={editingField.label}
                  onChange={(e) =>
                    setEditingField({ ...editingField, label: e.target.value })
                  }
                  placeholder="e.g. Preferred Artwork Dimension"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Input Type</Label>
                  <Select
                    value={editingField.type}
                    onValueChange={(val: FormFieldConfig["type"]) =>
                      setEditingField({ ...editingField, type: val })
                    }
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="tel">Phone / WhatsApp</SelectItem>
                      <SelectItem value="textarea">Multi-line Textarea</SelectItem>
                      <SelectItem value="select">Dropdown Menu</SelectItem>
                      <SelectItem value="checkbox">Single Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-md border border-border bg-card/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingField.required ?? false}
                      onChange={(e) =>
                        setEditingField({ ...editingField, required: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="font-semibold text-foreground text-xs">
                      Required Field
                    </span>
                  </label>
                </div>
              </div>

              {editingField.type !== "checkbox" && (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Placeholder Text</Label>
                  <Input
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      setEditingField({ ...editingField, placeholder: e.target.value })
                    }
                    placeholder="e.g. 24 x 36 inches..."
                    className="text-xs"
                  />
                </div>
              )}

              {editingField.type === "select" && (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">
                    Dropdown Options (comma-separated)
                  </Label>
                  <Textarea
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    rows={3}
                    className="text-xs font-mono"
                    placeholder="Tanjore Gold Foil, Mysore Traditional, Temple Mural, Classical Recital"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separate multiple choices with commas.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFieldModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveFieldModal}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
