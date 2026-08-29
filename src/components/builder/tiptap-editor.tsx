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

export interface TiptapEditorProps {
  content?: Record<string, unknown> | string;
  onChange?: (json: Record<string, unknown>, html: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  className = "",
  readOnly = false,
}: TiptapEditorProps) {
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
        class: `prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[80px] p-2 ${className}`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter Target URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="w-full relative group">
      {/* Floating / Sticky Inline Action Toolbar (visible when editable) */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-1 mb-2 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-sm z-20 transition-opacity">
          {/* Text Style formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 p-0 ${
              editor.isActive("bold") ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground"
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
              editor.isActive("italic") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("underline") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("heading", { level: 1 }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("heading", { level: 2 }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("heading", { level: 3 }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("heading", { level: 4 }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("bulletList") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("orderedList") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive("blockquote") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive({ textAlign: "left" }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive({ textAlign: "center" }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive({ textAlign: "right" }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
              editor.isActive({ textAlign: "justify" }) ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
            onClick={setLink}
            className={`h-7 w-7 p-0 ${
              editor.isActive("link") ? "bg-primary/20 text-primary" : "text-muted-foreground"
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
    </div>
  );
}
