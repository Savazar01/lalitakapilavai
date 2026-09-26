"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Palette,
  Image as ImageIcon,
  Minus,
  UploadCloud,
  Loader2,
  Shapes,
  Music,
  Table,
  Maximize2,
  Minimize2,
  Type,
  Columns,
  FileDown,
  Clock,
  Sparkles,
  FolderOpen,
  Search,
  Check,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AiAssistantModal } from "@/components/admin/ai-assistant-modal";
import { cn } from "@/lib/utils";
import { type ContrastMode, getContrastTypographyClasses } from "@/lib/theme-contrast";
import { CustomDividerNode } from "@/components/builder/tiptap-divider-node";
import { CustomShapeNode } from "@/components/builder/tiptap-shape-node";
import { FloatingLayerNode } from "@/components/builder/tiptap-floating-layer-node";
import { CustomImageNode } from "@/components/builder/tiptap-image-node";
import { TextOrientationExtension, type TextOrientationType } from "@/components/builder/tiptap-text-orientation-extension";
import { type CatalogPageSize, type CatalogOrientation } from "@/lib/catalog-geometry";
import { CatalogEditorContext } from "@/lib/catalog-editor-context";

export { CustomImageNode };

export const TextStyleMark = Mark.create({
  name: "textStyle",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const hasColor = el.style.color;
          const hasFontSize = el.style.fontSize;
          const hasFontFamily = el.style.fontFamily;
          if (!hasColor && !hasFontSize && !hasFontFamily) return false;
          return {};
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const styles: string[] = [];
    if (HTMLAttributes.color) {
      const c = String(HTMLAttributes.color).trim().toLowerCase();
      // Exclude hardcoded monochrome white/black so the text inherits theme foreground
      if (
        c !== "#ffffff" &&
        c !== "#fff" &&
        c !== "#000000" &&
        c !== "#000" &&
        c !== "rgb(255, 255, 255)" &&
        c !== "rgb(0, 0, 0)" &&
        c !== "rgba(255, 255, 255, 1)" &&
        c !== "rgba(0, 0, 0, 1)"
      ) {
        styles.push(`color: ${HTMLAttributes.color}`);
      }
    }
    if (HTMLAttributes.fontSize) styles.push(`font-size: ${HTMLAttributes.fontSize}`);
    if (HTMLAttributes.fontFamily) styles.push(`font-family: ${HTMLAttributes.fontFamily}`);
    const filteredAttrs = { ...HTMLAttributes };
    delete filteredAttrs.color;
    delete filteredAttrs.fontSize;
    delete filteredAttrs.fontFamily;
    if (styles.length > 0) {
      filteredAttrs.style = styles.join("; ");
      return ["span", mergeAttributes(this.options.HTMLAttributes, filteredAttrs), 0];
    }
    // If no styles apply, avoid creating a redundant styled wrapper
    return ["span", mergeAttributes(this.options.HTMLAttributes, filteredAttrs), 0];
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.color || null,
      },
      fontSize: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.fontSize || null,
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.fontFamily || null,
      },
    };
  },
});

const COLOR_PRESETS = [
  { label: "Temple Gold", color: "#D4AF37" },
  { label: "Madder Terracotta", color: "#A3281E" },
  { label: "Deep Ochre", color: "#C25E34" },
  { label: "Royal Lapis", color: "#2E5B88" },
  { label: "Forest Malachite", color: "#2D6A4F" },
];


const FONT_SIZES = [
  { label: "Size: Auto", value: "default" },
  { label: "12px (Extra Small)", value: "12px" },
  { label: "16px (Body Regular)", value: "16px" },
  { label: "20px (Medium)", value: "20px" },
  { label: "24px (Large)", value: "24px" },
  { label: "32px (Sub-Heading H3)", value: "32px" },
  { label: "40px (Section H2)", value: "40px" },
  { label: "48px (Title H1)", value: "48px" },
  { label: "64px (Hero Display)", value: "64px" },
  { label: "72px (Grand Display)", value: "72px" },
];

const FONT_FAMILIES = [
  { label: "Font: Default", value: "default" },
  { label: "Playfair Display (Classical Serif)", value: "'Playfair Display', serif" },
  { label: "Cormorant Garamond (Fine Art Serif)", value: "'Cormorant Garamond', serif" },
  { label: "Cinzel (Royal Header)", value: "'Cinzel', serif" },
  { label: "Inter (Clean Modern)", value: "'Inter', sans-serif" },
  { label: "Outfit (Heritage Sans)", value: "'Outfit', sans-serif" },
];

export interface TiptapEditorProps {
  content?: Record<string, unknown> | string;
  onChange?: (json: Record<string, unknown>, html: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  isLight?: boolean;
  contrast?: ContrastMode;
  onEditorReady?: (editor: import("@tiptap/react").Editor) => void;
  catalogPageSize?: CatalogPageSize;
  catalogOrientation?: CatalogOrientation;
}

export function TiptapEditor({
  content,
  onChange,
  className = "",
  placeholder = "Start typing commentary, narrative, or documentation...",
  readOnly = false,
  isLight = false,
  contrast,
  onEditorReady,
  catalogPageSize = "A4",
  catalogOrientation = "portrait",
}: TiptapEditorProps) {
  const effectiveContrast: ContrastMode = contrast
    ? contrast
    : isLight
    ? "light-bg"
    : "auto";

  const proseClasses = cn(
    getContrastTypographyClasses(effectiveContrast),
    "max-w-none focus:outline-none min-h-[80px] p-2 leading-relaxed"
  );

  const parsedContent = React.useMemo(() => {
    if (!content) return undefined;
    if (typeof content === "string") {
      const trimmed = content.trim();
      if (trimmed.startsWith("{") && trimmed.includes('"type":"doc"')) {
        try {
          let jsonStr = trimmed;
          const lastBraceIdx = trimmed.lastIndexOf("}");
          if (lastBraceIdx > 0) {
            jsonStr = trimmed.slice(0, lastBraceIdx + 1);
          }
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {
          // fallback to raw string
        }
      }
      return content;
    }
    return content;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextOrientationExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:opacity-80 transition-opacity",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Heading...";
          }
          return placeholder || "Start typing commentary, narrative, or documentation...";
        },
        emptyEditorClass: "is-editor-empty",
      }),
      TextStyleMark,
      CustomImageNode,
      CustomDividerNode,
      CustomShapeNode,
      FloatingLayerNode,
    ],
    content: parsedContent || "",
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON() as Record<string, unknown>, editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: cn(proseClasses, className),
      },
      transformPastedHTML(html) {
        return html.replace(/&lt;p&gt;/g, "<p>").replace(/&lt;\/p&gt;/g, "</p>");
      },
      transformPastedText(text) {
        if (text.includes("<p>") || text.includes("<div>")) {
          return text.replace(/<[^>]*>?/gm, "");
        }
        return text;
      },
    },
  });

  React.useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: cn(proseClasses, className),
          },
        },
      });
    }
  }, [editor, proseClasses, className]);

  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  React.useEffect(() => {
    if (!editor || !parsedContent) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const incomingJson = typeof parsedContent === "object" ? JSON.stringify(parsedContent) : parsedContent;
    if (currentJson !== incomingJson && editor.getHTML() !== parsedContent) {
      editor.commands.setContent(parsedContent);
    }
  }, [editor, parsedContent]);

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [imageModalTab, setImageModalTab] = React.useState<"vault" | "upload" | "url">("vault");
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageCaption, setImageCaption] = React.useState("");
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [vaultItems, setVaultItems] = React.useState<Array<{ id: string; url: string; fileName: string; title?: string }>>([]);
  const [vaultLoading, setVaultLoading] = React.useState(false);
  const [vaultSearch, setVaultSearch] = React.useState("");
  const [vaultSource, setVaultSource] = React.useState("all");

  React.useEffect(() => {
    if (imageModalOpen && imageModalTab === "vault") {
      let active = true;
      const loadVault = async () => {
        setVaultLoading(true);
        try {
          const params = new URLSearchParams({
            search: vaultSearch,
            source: vaultSource,
            limit: "40",
          });
          const res = await fetch("/api/admin/media?" + params.toString());
          if (res.ok) {
            const data = await res.json();
            if (active) {
              setVaultItems(Array.isArray(data) ? data : data.items || []);
            }
          }
        } catch (e) {
          console.error("Vault load error:", e);
        } finally {
          if (active) setVaultLoading(false);
        }
      };
      const debounce = setTimeout(loadVault, 200);
      return () => {
        active = false;
        clearTimeout(debounce);
      };
    }
  }, [imageModalOpen, imageModalTab, vaultSearch, vaultSource]);

  React.useEffect(() => {
    if (isFullscreen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = origOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isFullscreen]);

  const editorText = editor ? editor.getText() : "";
  const wordCount = React.useMemo(() => {
    const trimmed = editorText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [editorText]);
  const charCount = editorText.length;

  if (!editor) {
    return null;
  }

  const openLinkModal = () => {
    const previousUrl = (editor.getAttributes("link").href as string) || "";

    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    }
    setLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkModalOpen(false);
  };

  const handleImageModalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", "general");
    body.append("isArtwork", "false");
    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const uploaded = data.publicUrl || data.watermarkedUrl || data.primaryImageUrl;
      setImageUrl(uploaded);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInsertImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: imageUrl.trim(),
          alt: imageCaption.trim() || "Illustration",
          title: imageCaption.trim() || undefined,
        },
      })
      .run();
    setImageUrl("");
    setImageCaption("");
    setImageModalOpen(false);
  };

  const btnBaseClass = "h-8 w-8 p-0 inline-flex items-center justify-center rounded transition-all";
  const btnInactiveClass = "text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 font-medium";
  const btnActiveClass = "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-xs";

  const editorContent = (
    <div
      className={cn(
        "w-full relative group transition-all flex flex-col bg-card text-card-foreground",
        isFullscreen
          ? "fixed inset-0 z-[9999] h-screen w-screen bg-background/98 backdrop-blur-md p-6 sm:p-10 overflow-hidden shadow-2xl"
          : "rounded-xl border border-border"
      )}
    >
      {/* Floating / Sticky Inline Action Toolbar (visible when editable) */}
      {!readOnly && (
        <div
          className="flex flex-wrap items-center gap-1 p-1 mb-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-opacity z-20"
        >
          {/* Text Style formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${btnBaseClass} ${
              editor.isActive("bold") ? btnActiveClass : btnInactiveClass
            }`}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${btnBaseClass} ${
              editor.isActive("italic") ? btnActiveClass : btnInactiveClass
            }`}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${btnBaseClass} ${
              editor.isActive("underline") ? btnActiveClass : btnInactiveClass
            }`}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${btnBaseClass} ${
              editor.isActive("strike") ? btnActiveClass : btnInactiveClass
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`${btnBaseClass} ${
              editor.isActive("code") ? btnActiveClass : btnInactiveClass
            }`}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Typography Sizing (12px to 72px) */}
          <div className="flex items-center gap-1">
            <select
              value={(editor.getAttributes("textStyle").fontSize as string) || "default"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "default") {
                  editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
                } else {
                  editor.chain().focus().setMark("textStyle", { fontSize: val }).run();
                }
              }}
              className="h-7 text-[11px] font-medium px-1.5 rounded border border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-slate-500 cursor-pointer outline-none"
              title="Font Size Presets"
            >
              {FONT_SIZES.map((fs) => (
                <option key={fs.value} value={fs.value}>
                  {fs.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Family Selector */}
          <div className="flex items-center gap-1">
            <select
              value={(editor.getAttributes("textStyle").fontFamily as string) || "default"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "default") {
                  editor.chain().focus().setMark("textStyle", { fontFamily: null }).run();
                } else {
                  editor.chain().focus().setMark("textStyle", { fontFamily: val }).run();
                }
              }}
              className="h-7 text-[11px] font-medium px-1.5 rounded border border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-slate-500 cursor-pointer outline-none max-w-[140px]"
              title="Font Family Presets"
            >
              {FONT_FAMILIES.map((ff) => (
                <option key={ff.value} value={ff.value}>
                  {ff.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Palette Selector */}
          <div className="flex items-center gap-1 pl-0.5">
            <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-700 rounded p-0.5 bg-slate-50 dark:bg-slate-900/70">
              {/* Default / Auto Theme-Adaptive Swatch */}
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().setMark("textStyle", { color: null }).run()
                }
                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-125 transition-transform cursor-pointer overflow-hidden relative shadow-2xs group/auto"
                title="Default / Auto (Theme-Adaptive Text Color)"
              >
                <span className="absolute inset-0 bg-gradient-to-tr from-stone-900 via-stone-500 to-stone-200" />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white opacity-0 group-hover/auto:opacity-100 drop-shadow-xs">
                  A
                </span>
              </button>
              <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setMark("textStyle", { color: preset.color }).run()
                  }
                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer"
                  style={{ backgroundColor: preset.color }}
                  title={`${preset.label} (${preset.color})`}
                />
              ))}
              <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
              {/* Custom Color Input */}
              <label
                className="w-4 h-4 rounded-full border border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative"
                title="Custom Hex Color"
              >
                <input
                  type="color"
                  value={(editor.getAttributes("textStyle").color as string) || "#D4AF37"}
                  onChange={(e) =>
                    editor.chain().focus().setMark("textStyle", { color: e.target.value }).run()
                  }
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <Palette className="w-2.5 h-2.5 text-primary pointer-events-none" />
              </label>
              {editor.getAttributes("textStyle").color && (
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setMark("textStyle", { color: null }).run()}
                  className="text-[10px] text-muted-foreground hover:text-destructive px-1 font-bold"
                  title="Reset Color"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Paragraph & Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${btnBaseClass} ${
              editor.isActive("paragraph") && !editor.isActive("heading") ? btnActiveClass : btnInactiveClass
            }`}
            title="Normal Text / Paragraph"
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${btnBaseClass} font-serif ${
              editor.isActive("heading", { level: 1 }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${btnBaseClass} font-serif ${
              editor.isActive("heading", { level: 2 }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${btnBaseClass} font-serif ${
              editor.isActive("heading", { level: 3 }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`${btnBaseClass} font-serif ${
              editor.isActive("heading", { level: 4 }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Heading 4"
          >
            <Heading4 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Lists & Quotes */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btnBaseClass} ${
              editor.isActive("bulletList") ? btnActiveClass : btnInactiveClass
            }`}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btnBaseClass} ${
              editor.isActive("orderedList") ? btnActiveClass : btnInactiveClass
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btnBaseClass} ${
              editor.isActive("blockquote") ? btnActiveClass : btnInactiveClass
            }`}
            title="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Text Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`${btnBaseClass} ${
              editor.isActive({ textAlign: "left" }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`${btnBaseClass} ${
              editor.isActive({ textAlign: "center" }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`${btnBaseClass} ${
              editor.isActive({ textAlign: "right" }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`${btnBaseClass} ${
              editor.isActive({ textAlign: "justify" }) ? btnActiveClass : btnInactiveClass
            }`}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>

          {/* Text Orientation Selector */}
          <div className="flex items-center gap-1">
            <select
              value={
                (editor.getAttributes("heading").textOrientation as string) ||
                (editor.getAttributes("paragraph").textOrientation as string) ||
                "horizontal"
              }
              onChange={(e) => {
                const val = e.target.value as TextOrientationType;
                editor.chain().focus().setTextOrientation(val).run();
              }}
              className="h-7 text-[11px] font-medium px-1.5 rounded border border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-slate-500 cursor-pointer outline-none max-w-[130px]"
              title="Text Orientation (Horizontal, Vertical, Rotated, Diagonal)"
            >
              <option value="horizontal">Orientation: Normal</option>
              <option value="vertical-rl">Vertical (Top-Down)</option>
              <option value="vertical-lr">Vertical (Bottom-Up)</option>
              <option value="rotate-90">Rotate 90°</option>
              <option value="rotate-270">Rotate 270°</option>
              <option value="diagonal-neg45">Diagonal (-45°)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Links */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openLinkModal}
            className={`${btnBaseClass} ${
              editor.isActive("link") ? btnActiveClass : btnInactiveClass
            }`}
            title="Add Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>

          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={`${btnBaseClass} text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50`}
              title="Remove Link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </Button>
          )}

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Image Insertion */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageModalOpen(true)}
            className={`${btnBaseClass} ${btnInactiveClass}`}
            title="Insert Artwork / Illustration Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>

          {/* Custom Architectural Divider */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "customDivider",
                  attrs: {
                    style: "solid",
                    thickness: 2,
                    color: "#D4AF37",
                    width: "100%",
                    alignment: "center",
                  },
                })
                .run()
            }
            className={`${btnBaseClass} ${btnInactiveClass}`}
            title="Insert Custom Gold / Architectural Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          {/* Custom Shape Container */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "customShape",
                  attrs: {
                    shapeType: "temple-arch",
                    fillType: "solid",
                    fillColor: "rgba(251, 248, 241, 0.9)",
                    borderColor: "#D4AF37",
                    borderWidth: 2,
                    borderStyle: "solid",
                    shadow: "md",
                    alignment: "center",
                    width: "100%",
                    minHeight: "160px",
                    padding: "32px 24px",
                  },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Enter devotional verse, raga meditation, or philosophical quote...",
                        },
                      ],
                    },
                  ],
                })
                .run()
            }
            className={`${btnBaseClass} ${btnInactiveClass}`}
            title="Insert Shape Container (Cartouche / Arch / Pill)"
          >
            <Shapes className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Inline AI Assistant */}
          <AiAssistantModal
            initialContext={editor.getText()}
            onApply={(aiText) => {
              editor.chain().focus().insertContent(aiText).run();
            }}
            triggerLabel="AI Polish"
            triggerClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold px-3 py-1 rounded border border-slate-800 dark:border-slate-200 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm"
          />

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Fullscreen Expansion Studio Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-accent ml-auto cursor-pointer"
            title={isFullscreen ? "Restore Window (Esc)" : "Expand to Full View"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 text-primary" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span>Expand</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Live Content Surface */}
      <div className={cn("relative overflow-y-auto", isFullscreen ? "flex-1 p-4 max-w-5xl mx-auto w-full" : "min-h-[80px] p-2")}>
        <EditorContent
          editor={editor}
          className={cn(
            getContrastTypographyClasses(effectiveContrast),
            isFullscreen ? "min-h-[500px]" : "min-h-[80px]",
            "outline-none"
          )}
        />
      </div>

      {/* Standardized Bottom Quick-Block Inserters Bar */}
      {editor && !readOnly && (
        <div className="mt-3 pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 px-2 pb-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold mr-1">
            + Quick Blocks:
          </span>

          {/* 1. Text Paragraph */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent("<p>Write reflective narrative, verse, or commentary...</p>")
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Paragraph Block"
          >
            <Type className="w-3 h-3 text-primary" />
            Text
          </button>

          {/* 2. Large Heading */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent("<h2>Sacred Section Heading</h2>")
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Section Heading"
          >
            <Heading2 className="w-3 h-3 text-primary" />
            Heading
          </button>

          {/* 3. Callout Quote */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "blockquote",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "“The essence of Carnatic nada and Tanjore gold relief coalesce into pure contemplation.”",
                        },
                      ],
                    },
                  ],
                })
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Callout Epigraph Quote"
          >
            <Quote className="w-3 h-3 text-primary" />
            Callout Quote
          </button>

          {/* 4. Visual Divider */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "customDivider",
                  attrs: {
                    style: "solid",
                    thickness: 2,
                    color: "#D4AF37",
                    width: "100%",
                    alignment: "center",
                  },
                })
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Architectural Divider"
          >
            <Minus className="w-3 h-3 text-primary" />
            Divider
          </button>

          {/* 5. Cultural Shape & Geometry */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "customShape",
                  attrs: {
                    shapeType: "cartouche",
                    fillColor: "rgba(251, 248, 241, 0.7)",
                    borderColor: "#D4AF37",
                    borderWidth: 2,
                    shadow: "sm",
                    alignment: "center",
                  },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Devotional verse, raga meditation, or philosophical quote...",
                        },
                      ],
                    },
                  ],
                })
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Shape Container"
          >
            <Shapes className="w-3 h-3 text-primary" />
            Shape Block
          </button>

          {/* 5b. Freeform Draggable Z-Layer */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "floatingLayer",
                  attrs: {
                    x: 20,
                    y: 20,
                    width: "320px",
                    height: "auto",
                    zIndex: 10,
                    isDraggable: true,
                    opacity: 1.0,
                    blendMode: "normal",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    borderColor: "#D4AF37",
                    borderWidth: 1,
                  },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Floating Callout / Caption Overlay (Drag to reposition freely)",
                        },
                      ],
                    },
                  ],
                })
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer shadow-2xs font-semibold"
            title="Insert Freeform Draggable Z-Index Layer"
          >
            <Layers className="w-3 h-3 text-primary" />
            Floating Z-Layer
          </button>

          {/* 6. High-Res Image Block */}
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Upload / Insert Artwork Image"
          >
            <ImageIcon className="w-3 h-3 text-primary" />
            Image Block
          </button>

          {/* 7. Audio / Raga Meditation Snippet */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<div class="my-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
                    <span class="text-xl">🎵</span>
                    <div>
                      <h4 class="font-serif font-bold text-sm text-foreground">Carnatic Raga Meditation: Kalyani</h4>
                      <p class="text-xs text-muted-foreground">Adi Tala • Tyagaraja Kriti • Classical Rendition</p>
                    </div>
                  </div>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Audio / Raga Meditation Snippet"
          >
            <Music className="w-3 h-3 text-primary" />
            Audio / Raga
          </button>

          {/* 8. Curatorial Specs Table */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<table class="my-4 w-full border-collapse border border-border text-xs">
                    <thead>
                      <tr class="bg-muted/40">
                        <th class="border border-border p-2 text-left font-serif font-bold">Medium &amp; Materials</th>
                        <th class="border border-border p-2 text-left font-serif font-bold">Archival Dimensions</th>
                        <th class="border border-border p-2 text-left font-serif font-bold">Iconographic Canon</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-border p-2">22k Gold Leaf on Teakwood</td>
                        <td class="border border-border p-2">24 x 36 in (Framed)</td>
                        <td class="border border-border p-2">Thanjavur Traditional Guild</td>
                      </tr>
                    </tbody>
                  </table>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Curatorial Specs Table"
          >
            <Table className="w-3 h-3 text-primary" />
            Specs Table
          </button>

          {/* 9. CTA Button / Commission Link */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<p class="my-3 text-center"><a href="/contact" class="inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs tracking-wide shadow-sm hover:opacity-90">Inquire for Private Commission</a></p>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert CTA Button"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            CTA Button
          </button>

          {/* 10. Responsive Two-Column Layout */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<div class="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-3.5 rounded-lg border border-border bg-card/60">
                      <h4 class="font-serif font-semibold text-sm">Column 1: Iconographic Lineage</h4>
                      <p class="text-xs text-muted-foreground mt-1">Detailed descriptions of traditional Tanjore gold embossing methods.</p>
                    </div>
                    <div class="p-3.5 rounded-lg border border-border bg-card/60">
                      <h4 class="font-serif font-semibold text-sm">Column 2: Musical Symbiosis</h4>
                      <p class="text-xs text-muted-foreground mt-1">Devotional lyrical parallels corresponding to the visual depiction.</p>
                    </div>
                  </div>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert 2-Column Responsive Layout"
          >
            <Columns className="w-3 h-3 text-primary" />
            2-Col Layout
          </button>

          {/* 11. Curatorial PDF Dossier Card */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<div class="my-4 p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">📄</span>
                      <div>
                        <div class="font-serif font-bold text-xs text-foreground">Curatorial Catalog &amp; Provenance Dossier</div>
                        <div class="text-[10px] text-muted-foreground">Archival PDF • Atelier Master Collection</div>
                      </div>
                    </div>
                    <a href="#" class="text-xs font-mono text-primary font-semibold hover:underline">Download Archive</a>
                  </div>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Curatorial PDF Card"
          >
            <FileDown className="w-3 h-3 text-primary" />
            PDF Dossier
          </button>

          {/* 12. Cultural Timeline / Milestones */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent(
                  `<div class="my-4 space-y-2 border-l-2 border-primary/50 pl-3">
                    <div class="text-xs font-serif font-bold text-foreground">Phase I: Sacred Gesso &amp; Embossing</div>
                    <p class="text-xs text-muted-foreground">Preparation of unbleached muslin, tamarind seed paste, and French chalk relief.</p>
                    <div class="text-xs font-serif font-bold text-foreground mt-2">Phase II: 22k Gold Foil Gilding</div>
                    <p class="text-xs text-muted-foreground">Precision application of authentic gold leaf with semi-precious Jaipur gemstones.</p>
                  </div>`
                )
                .run()
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Insert Timeline Milestones"
          >
            <Clock className="w-3 h-3 text-primary" />
            Timeline
          </button>

          {/* Word & Character Counts + AI Polish */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-[11px] font-mono text-muted-foreground select-none hidden sm:inline-flex items-center gap-1.5">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
            </div>
            <AiAssistantModal
              initialContext={editor.getText()}
              onApply={(aiText) => {
                editor.chain().focus().insertContent(aiText).run();
              }}
              triggerLabel="AI Polish"
              triggerClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold px-2.5 py-1 text-xs rounded border border-slate-800 dark:border-slate-200 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-2xs cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Styled Link Modal Dialog */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <form onSubmit={handleApplyLink} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold text-foreground">
                Insert / Edit Hyperlink
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter target destination (e.g. /gallery, https://savazar.com/about)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-1">
              <Input
                type="text"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="text-xs font-mono"
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {editor.isActive("link") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLink}
                  className="text-xs text-destructive hover:text-destructive mr-auto"
                >
                  Unlink
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLinkModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                className="text-xs"
              >
                Apply Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Styled Image Insertion Modal Dialog with 3 Tabs */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col border-border bg-card">
          <form onSubmit={handleInsertImage} className="flex-1 flex flex-col min-h-0 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold text-foreground">
                Insert Image Block
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select an archived asset from the Media Vault, upload a local file, or specify a remote URL.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={imageModalTab}
              onValueChange={(v) => setImageModalTab(v as "vault" | "upload" | "url")}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="grid grid-cols-3 bg-muted/50 p-1 mb-2">
                <TabsTrigger value="vault" className="text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <FolderOpen className="w-3.5 h-3.5" /> Media Vault
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload Local
                </TabsTrigger>
                <TabsTrigger value="url" className="text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <LinkIcon className="w-3.5 h-3.5" /> Remote URL
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: MEDIA VAULT */}
              <TabsContent value="vault" className="m-0 space-y-2.5 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search archive title or filename..."
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      className="pl-8 text-xs h-8"
                    />
                  </div>
                  <div className="flex gap-1">
                    {["all", "artwork", "event", "storage"].map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setVaultSource(src)}
                        className={`px-2 py-1 text-[11px] rounded capitalize transition-all cursor-pointer ${
                          vaultSource === src
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] max-h-[250px] overflow-y-auto border border-border/70 rounded-lg p-2 bg-muted/20">
                  {vaultLoading ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2 py-12">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading media assets...
                    </div>
                  ) : vaultItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-12">
                      No matching assets found in Media Vault.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {vaultItems.map((item) => {
                        const isSelected = imageUrl === item.url;
                        return (
                          <button
                            key={item.id + item.url}
                            type="button"
                            onClick={() => {
                              setImageUrl(item.url);
                              if (item.title && !imageCaption) {
                                setImageCaption(item.title);
                              }
                            }}
                            className={`relative group rounded-md overflow-hidden border aspect-square text-left cursor-pointer transition-all ${
                              isSelected
                                ? "ring-2 ring-primary border-primary shadow-md"
                                : "border-border/60 hover:border-primary/50 hover:shadow-xs"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.title || item.fileName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1">
                              <p className="text-[10px] text-white font-medium truncate leading-tight">
                                {item.title || item.fileName}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: UPLOAD LOCAL */}
              <TabsContent value="upload" className="m-0 space-y-3 py-2">
                <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff,image/heic,image/heif,image/heic-sequence,.heic,.heics"
                    id="tiptap-modal-image-upload"
                    className="hidden"
                    onChange={handleImageModalUpload}
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="tiptap-modal-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-primary" />
                    )}
                    <span className="text-xs font-semibold text-foreground">
                      {uploadingImage ? "Uploading clean asset to Media Vault..." : "Click to select or drag & drop image"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      JPG, PNG, WebP (Bypasses watermarks for editorial blocks)
                    </span>
                  </label>
                </div>
              </TabsContent>

              {/* TAB 3: REMOTE URL */}
              <TabsContent value="url" className="m-0 space-y-3 py-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Direct Image URL</label>
                  <Input
                    type="text"
                    placeholder="https://... or /media/public/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Selection & Caption Bar */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              {imageUrl && (
                <div className="rounded border border-border p-1.5 bg-muted/20 flex items-center gap-2.5">
                  <img
                    src={imageUrl}
                    alt="Selected Preview"
                    className="w-10 h-10 object-cover rounded border border-border/80 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-foreground truncate">{imageUrl}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Selected for Insertion</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-[10px] text-rose-500 hover:underline px-2 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Caption / Subtitle (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Traditional Tanjore gold relief detail"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImageModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!imageUrl || uploadingImage}
                className="text-xs"
              >
                Insert Block
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  const wrappedContent = (
    <CatalogEditorContext.Provider value={{ pageSize: catalogPageSize, orientation: catalogOrientation }}>
      {editorContent}
    </CatalogEditorContext.Provider>
  );

  if (isFullscreen && mounted && typeof document !== "undefined") {
    return createPortal(wrappedContent, document.body);
  }

  return wrappedContent;
}

// Universal Standardized WYSIWYG Suite Alias
export const UniversalWysiwygEditor = TiptapEditor;
