"use client";

import * as React from "react";
import { Sparkles, Loader2, Copy, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AiAssistantModalProps {
  initialContext?: string;
  onApply: (generatedText: string) => void;
  triggerLabel?: string;
  triggerClassName?: string;
  mode?: "full" | "button-only";
}

export function AiAssistantModal({
  initialContext = "",
  onApply,
  triggerLabel = "AI Assist",
  triggerClassName = "",
}: AiAssistantModalProps) {
  const [open, setOpen] = React.useState(false);
  const [action, setAction] = React.useState<
    "GENERATE" | "POLISH" | "EXCERPT" | "PROVENANCE" | "DEVOTIONAL_TONE"
  >("GENERATE");
  const [prompt, setPrompt] = React.useState("");
  const [context, setContext] = React.useState(initialContext);
  const [tone, setTone] = React.useState<"DEVOTIONAL" | "SCHOLARLY" | "LUXURY" | "CONCISE">(
    "SCHOLARLY"
  );
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleOpen = () => {
    setContext(initialContext);
    if (initialContext && !prompt) {
      setAction("POLISH");
      setPrompt("Elevate and polish this description with classical Tanjore and Carnatic depth.");
    }
    setOpen(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt or instruction for the AI.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          action,
          context,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");

      setResult(data.text);
      toast.success("AI content generated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!result) return;
    onApply(result);
    setOpen(false);
    toast.success("Applied content into editor!");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={`text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-colors ${triggerClassName}`}
      >
        <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="font-serif text-lg">Curatorial AI Assistant</DialogTitle>
                <DialogDescription className="text-xs">
                  Generate, refine, and polish authentic Indian fine art & Carnatic music prose.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick Action Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Action Preset</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "GENERATE", label: "Compose from Prompt" },
                  { id: "POLISH", label: "Polish & Enhance" },
                  { id: "EXCERPT", label: "SEO Excerpt" },
                  { id: "PROVENANCE", label: "Iconography & Gold Details" },
                  { id: "DEVOTIONAL_TONE", label: "Sacred Bhakti Tone" },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      const newAct = act.id as typeof action;
                      setAction(newAct);
                      if (newAct === "EXCERPT") setPrompt("Generate a 2-sentence SEO excerpt.");
                      else if (newAct === "PROVENANCE") setPrompt("Detail the 22k gold foil, talamana iconometry, and Jaipur gemstones.");
                      else if (newAct === "DEVOTIONAL_TONE") setPrompt("Infuse with sacred devotion and reverence.");
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                      action === act.id
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt & Tone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium">Instruction / Prompt *</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Describe this Thanjavur Krishna painting emphasizing the embossed gesso work..."
                  className="text-xs min-h-[70px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Artistic Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHOLARLY">Scholarly Heritage</SelectItem>
                    <SelectItem value="DEVOTIONAL">Sacred Devotional</SelectItem>
                    <SelectItem value="LUXURY">Fine Art Curatorial</SelectItem>
                    <SelectItem value="CONCISE">Clear & Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source Context (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Source / Reference Text (Optional)</Label>
                <span className="text-[10px] text-muted-foreground">
                  {context.length} characters
                </span>
              </div>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste rough notes, dimensions, raw text, or artist notes here..."
                className="text-xs min-h-[60px] font-mono text-[11px]"
              />
            </div>

            {/* Generate Action Button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full text-xs font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Generating Cultural Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Generate with AI
                </>
              )}
            </Button>

            {/* AI Generated Result Preview */}
            {result && (
              <div className="space-y-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Generated Result
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="text-xs text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto p-2 rounded bg-card/70 border border-border leading-relaxed">
                  {result}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            {result && (
              <Button type="button" size="sm" onClick={handleInsert} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Apply to Editor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
