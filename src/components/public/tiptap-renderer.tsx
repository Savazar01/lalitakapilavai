import * as React from "react";
import Link from "next/link";

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

interface TiptapRendererProps {
  content: Record<string, unknown> | string | null | undefined;
  className?: string;
}

function renderMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "underline":
        return <u>{acc}</u>;
      case "link": {
        const href = (mark.attrs?.href as string) || "#";
        const isExternal = href.startsWith("http");
        return (
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-primary underline hover:opacity-80 transition-opacity"
          >
            {acc}
          </Link>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TiptapNode, key: React.Key): React.ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  const textAlign = node.attrs?.textAlign as string | undefined;
  const alignClass =
    textAlign === "center"
      ? "text-center"
      : textAlign === "right"
      ? "text-right"
      : textAlign === "justify"
      ? "text-justify"
      : "";

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;

    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const sizeClasses =
        level === 1
          ? "text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4"
          : level === 2
          ? "text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3"
          : level === 3
          ? "text-xl sm:text-2xl font-serif font-semibold text-foreground mb-2"
          : "text-lg sm:text-xl font-serif font-semibold text-foreground mb-2";

      if (level === 1) {
        return <h1 key={key} className={`${sizeClasses} ${alignClass}`}>{children}</h1>;
      }
      if (level === 2) {
        return <h2 key={key} className={`${sizeClasses} ${alignClass}`}>{children}</h2>;
      }
      if (level === 3) {
        return <h3 key={key} className={`${sizeClasses} ${alignClass}`}>{children}</h3>;
      }
      return <h4 key={key} className={`${sizeClasses} ${alignClass}`}>{children}</h4>;
    }

    case "paragraph":
      return (
        <p key={key} className={`text-base leading-relaxed text-foreground/85 mb-4 ${alignClass}`}>
          {children || "\u00A0"}
        </p>
      );

    case "bulletList":
      return (
        <ul key={key} className="list-disc list-inside space-y-1.5 mb-4 text-foreground/85">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal list-inside space-y-1.5 mb-4 text-foreground/85">
          {children}
        </ol>
      );

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-primary pl-4 py-1 italic font-serif text-muted-foreground my-4"
        >
          {children}
        </blockquote>
      );

    case "text":
      return renderMarks(node.text || "", node.marks);

    default:
      if (children) {
        return <div key={key}>{children}</div>;
      }
      return null;
  }
}

export function TiptapRenderer({ content, className = "" }: TiptapRendererProps) {
  if (!content) return null;

  if (typeof content === "string") {
    // Plain string fallback
    return (
      <div className={`prose prose-stone dark:prose-invert max-w-none ${className}`}>
        <p>{content}</p>
      </div>
    );
  }

  const doc = content as unknown as TiptapNode;
  return (
    <div className={`prose-container ${className}`}>
      {renderNode(doc, "root")}
    </div>
  );
}
