import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Music,
  Paintbrush,
  Sun,
  Flame,
  Crown,
  BookOpen,
  Award,
  Shield,
  Heart,
  Compass,
  Volume2,
} from "lucide-react";

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

interface MediaBlockConfig {
  mediaType?: "NONE" | "IMAGE" | "VIDEO" | "ICON" | "AUDIO_PLAYER";
  mediaUrl?: string;
  mediaAlt?: string;
  mediaAspectRatio?: string;
  mediaBorderRadius?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  audioTitle?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface TiptapRendererProps {
  content: Record<string, unknown> | string | null | undefined;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles,
  Music,
  Palette: Paintbrush,
  Sun,
  Flame,
  Crown,
  BookOpen,
  Award,
  Shield,
  Heart,
  Compass,
};

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
        <ul key={key} className="list-disc list-inside mb-4 space-y-1 text-foreground/85">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal list-inside mb-4 space-y-1 text-foreground/85">
          {children}
        </ol>
      );

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-primary pl-4 italic text-foreground/80 my-4 font-serif"
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

function renderMediaBlock(media: MediaBlockConfig): React.ReactNode {
  if (!media.mediaType || media.mediaType === "NONE") return null;

  if (media.mediaType === "IMAGE" && media.mediaUrl) {
    const aspectClass =
      media.mediaAspectRatio === "1:1"
        ? "aspect-square"
        : media.mediaAspectRatio === "16:9"
        ? "aspect-video"
        : media.mediaAspectRatio === "3:4"
        ? "aspect-[3/4]"
        : media.mediaAspectRatio === "4:3"
        ? "aspect-[4/3]"
        : "aspect-auto max-h-[500px]";

    const radiusClass =
      media.mediaBorderRadius === "rounded-none"
        ? "rounded-none"
        : media.mediaBorderRadius === "rounded-md"
        ? "rounded-md"
        : media.mediaBorderRadius === "rounded-2xl"
        ? "rounded-2xl"
        : media.mediaBorderRadius === "rounded-full"
        ? "rounded-full aspect-square max-w-[240px] mx-auto"
        : "rounded-lg";

    return (
      <div className="mb-6 overflow-hidden flex justify-center">
        <img
          src={media.mediaUrl}
          alt={media.mediaAlt || "Cultural archive imagery"}
          className={`w-full object-cover shadow-lg border border-border/80 ${aspectClass} ${radiusClass}`}
          loading="lazy"
        />
      </div>
    );
  }

  if (media.mediaType === "VIDEO" && media.videoUrl) {
    const url = media.videoUrl;
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isVimeo = url.includes("vimeo.com");

    let embedSrc = url;
    if (isYouTube) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) embedSrc = `https://www.youtube-nocookie.com/embed/${match[1]}`;
    } else if (isVimeo) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) embedSrc = `https://player.vimeo.com/video/${match[1]}`;
    }

    if (isYouTube || isVimeo) {
      return (
        <div className="mb-6 aspect-video w-full rounded-xl overflow-hidden shadow-xl border border-border">
          <iframe
            src={embedSrc}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Direct MP4 / WebM
    return (
      <div className="mb-6 w-full rounded-xl overflow-hidden shadow-xl border border-border">
        <video src={url} controls className="w-full max-h-[480px] bg-black" />
      </div>
    );
  }

  if (media.mediaType === "ICON") {
    const SelectedIcon = iconMap[media.iconName || "Sparkles"] || Sparkles;
    return (
      <div className="mb-4 flex items-center justify-center p-4 rounded-xl bg-primary/5 border border-primary/20 w-fit mx-auto shadow-sm">
        <SelectedIcon
          style={{
            width: `${media.iconSize || 40}px`,
            height: `${media.iconSize || 40}px`,
            color: media.iconColor || "#D4AF37",
          }}
        />
      </div>
    );
  }

  if (media.mediaType === "AUDIO_PLAYER" && media.audioUrl) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-primary/40 bg-card/90 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-bold block">
              Carnatic Classical Recital
            </span>
            <span className="font-serif font-bold text-sm text-foreground">
              {media.audioTitle || "Lalita Kapilavai Vocal Performance"}
            </span>
          </div>
        </div>
        <audio controls src={media.audioUrl} className="w-full h-8 mt-2" />
      </div>
    );
  }

  return null;
}

export function TiptapRenderer({ content, className = "" }: TiptapRendererProps) {
  if (!content) return null;

  if (typeof content === "string") {
    return (
      <div className={`prose prose-stone dark:prose-invert max-w-none ${className}`}>
        <p>{content}</p>
      </div>
    );
  }

  const mediaConfig = (content as Record<string, unknown>)?._media as MediaBlockConfig | undefined;
  const doc = content as unknown as TiptapNode;

  return (
    <div className={`prose-container ${className}`}>
      {mediaConfig && renderMediaBlock(mediaConfig)}
      {doc.type === "doc" && renderNode(doc, "root")}
    </div>
  );
}
