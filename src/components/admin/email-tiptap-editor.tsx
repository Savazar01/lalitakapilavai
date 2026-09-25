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
  Strikethrough,
  Code,
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
  Link as LinkIcon,
  Unlink,
  Minus,
  Undo2,
  Redo2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface EmailTiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  tokens?: Array<{ token: string; desc?: string }>;
}

export function EmailTiptapEditor({
  content,
  onChange,
  placeholder = "Compose email copy with rich text formatting...",
  className = "",
  tokens = [
    { token: "{name}", desc: "Patron or recipient full name" },
    { token: "{email}", desc: "Sender or attendee email address" },
    { token: "{phone}", desc: "Contact telephone number" },
    { token: "{subject}", desc: "Inquiry or submission subject line" },
    { token: "{message}", desc: "Submitted correspondence or message" },
    { token: "{form_name}", desc: "Title or category of the submission form" },
    { token: "{event_title}", desc: "Exhibition or recital title" },
    { token: "{event_date}", desc: "Date and venue of the scheduled event" },
  ],
}: EmailTiptapEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
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
          style: "color: #b45309; text-decoration: underline;",
        },
      }),
    ],
    content: content || "<p></p>",
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] p-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200 select-text",
          className
        ),
      },
    },
  });

  // Keep editor content synchronized with outside state changes
  React.useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (content !== currentHtml && (content || currentHtml !== "<p></p>")) {
      editor.commands.setContent(content || "<p></p>");
    }
  }, [content, editor]);

  // Insert token chip into editor at current cursor position
  const handleInsertToken = (tokenStr: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(tokenStr).run();
  };

  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string) || "";
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    }
    setLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkModalOpen(false);
  };

  if (!editor) {
    return (
      <div className="border border-border/80 rounded-lg p-6 text-center text-xs text-muted-foreground bg-muted/20">
        Initializing email composer...
      </div>
    );
  }

  return (
    <div className="border border-border/80 rounded-lg overflow-hidden bg-card/60 shadow-xs flex flex-col">
      {/* 1. Dynamic Placeholder Token Chips Bar */}
      {tokens && tokens.length > 0 && (
        <div className="px-3 py-2 border-b border-border/70 bg-amber-500/5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Insert Token:
          </span>
          {tokens.map((item) => (
            <button
              key={item.token}
              type="button"
              onClick={() => handleInsertToken(item.token)}
              title={item.desc}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-500/30 text-[11px] font-mono font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 transition-colors shadow-xs cursor-pointer"
            >
              {item.token}
            </button>
          ))}
        </div>
      )}

      {/* 2. Formatting Toolbar */}
      <div className="p-2 border-b border-border/70 bg-muted/40 flex flex-wrap items-center gap-1">
        {/* Paragraph & Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
          className={cn(
            "p-1.5 rounded text-xs font-serif transition-colors cursor-pointer",
            editor.isActive("paragraph")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Pilcrow className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
          className={cn(
            "p-1.5 rounded text-xs font-serif font-bold transition-colors cursor-pointer",
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
          className={cn(
            "p-1.5 rounded text-xs font-serif font-bold transition-colors cursor-pointer",
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Text Marks: Bold, Italic, Underline, Strikethrough, Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("bold")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("italic")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("underline")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("strike")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
          className={cn(
            "p-1.5 rounded text-xs font-mono transition-colors cursor-pointer",
            editor.isActive("code")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("bulletList")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("orderedList")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("blockquote")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
          className="p-1.5 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-muted transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive({ textAlign: "left" })
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive({ textAlign: "center" })
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive({ textAlign: "right" })
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Link controls */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          title="Insert Link"
          className={cn(
            "p-1.5 rounded text-xs transition-colors cursor-pointer",
            editor.isActive("link")
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-muted"
          )}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={handleRemoveLink}
            title="Remove Link"
            className="p-1.5 rounded text-xs text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className="p-1.5 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className="p-1.5 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Editor Content Canvas */}
      <div className="min-h-[160px] bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-base">Insert Hyperlink</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLink} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://lalitakapilavai.com/gallery"
                className="text-xs font-mono"
                autoFocus
              />
            </div>
            <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
              {editor.isActive("link") ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLink}
                  className="text-rose-600 text-xs"
                >
                  Remove Link
                </Button>
              ) : <div />}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs">
                  Apply Link
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
