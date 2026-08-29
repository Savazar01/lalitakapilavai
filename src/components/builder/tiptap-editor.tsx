"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
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


export interface TiptapEditorProps {
  content?: Record<string, unknown> | string;
  onChange?: (json: Record<string, unknown>, html: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  isLight?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  className = "",
  readOnly = false,
  isLight = false,
}: TiptapEditorProps) {
  const proseClasses = isLight
    ? "prose prose-stone text-[#1C1814] [&_*]:text-[#1C1814] [&_h1]:text-[#1C1814] [&_h2]:text-[#1C1814] [&_h3]:text-[#1C1814] [&_h4]:text-[#1C1814] [&_p]:text-[#2A2622] [&_li]:text-[#2A2622] [&_strong]:text-[#1C1814] [&_blockquote]:text-[#3A322C] [&_blockquote]:border-[#D4AF37]"
    : "prose prose-stone dark:prose-invert text-[#F5EBE1]";

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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:opacity-80 transition-opacity",
        },
      }),
    ],
    content: content || "<p>Click to compose devotional verses or artwork narrative...</p>",
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON() as Record<string, unknown>, editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: `${proseClasses} max-w-none focus:outline-none min-h-[80px] p-2 ${className}`,
      },
    },
  });

  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

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


  const btnInactiveClass = isLight
    ? "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
    : "text-muted-foreground hover:text-foreground";

  return (
    <div className="w-full relative group">
      {/* Floating / Sticky Inline Action Toolbar (visible when editable) */}
      {!readOnly && (
        <div
          className={`flex flex-wrap items-center gap-1 p-1 mb-2 rounded-lg border transition-opacity z-20 ${
            isLight
              ? "border-stone-300 bg-white/95 text-stone-900 shadow-sm"
              : "border-border bg-card/95 backdrop-blur-md shadow-sm"
          }`}
        >
          {/* Text Style formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 p-0 ${
              editor.isActive("bold")
                ? "bg-primary/20 text-primary font-bold"
                : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive("italic") ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive("underline") ? "bg-primary/20 text-primary" : btnInactiveClass
            }`}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-7 px-1.5 text-xs font-serif font-bold ${
              editor.isActive("heading", { level: 1 }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 px-1.5 text-xs font-serif font-bold ${
              editor.isActive("heading", { level: 2 }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 px-1.5 text-xs font-serif font-bold ${
              editor.isActive("heading", { level: 3 }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 px-1.5 text-xs font-serif font-bold ${
              editor.isActive("heading", { level: 4 }) ? "bg-primary/20 text-primary" : btnInactiveClass
            }`}
            title="Heading 4"
          >
            <Heading4 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Lists & Quotes */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-7 w-7 p-0 ${
              editor.isActive("bulletList") ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive("orderedList") ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive("blockquote") ? "bg-primary/20 text-primary" : btnInactiveClass
            }`}
            title="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Text Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`h-7 w-7 p-0 ${
              editor.isActive({ textAlign: "left" }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive({ textAlign: "center" }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive({ textAlign: "right" }) ? "bg-primary/20 text-primary" : btnInactiveClass
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
            className={`h-7 w-7 p-0 ${
              editor.isActive({ textAlign: "justify" }) ? "bg-primary/20 text-primary" : btnInactiveClass
            }`}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Links */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openLinkModal}
            className={`h-7 w-7 p-0 ${
              editor.isActive("link") ? "bg-primary/20 text-primary" : btnInactiveClass
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
              className="h-7 w-7 p-0 text-destructive"
              title="Remove Link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Live Content Surface */}
      <EditorContent editor={editor} />

      {/* Styled Link Modal Dialog */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <form onSubmit={handleApplyLink} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold text-foreground">
                Insert / Edit Hyperlink
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter target destination (e.g. /gallery, https://lalitakapilavai.com/about)
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
    </div>
  );
}

