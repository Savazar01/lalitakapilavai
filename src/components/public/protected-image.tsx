"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProtectedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function ProtectedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  sizes,
  quality = 85,
  style,
  unoptimized,
  onContextMenu,
}: ProtectedImageProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={cn("relative overflow-hidden select-none", containerClassName, fill && "w-full h-full")}
      onContextMenu={handleContextMenu}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn("protect-image transition-all duration-300", className)}
        priority={priority}
        sizes={sizes}
        quality={quality}
        style={style}
        unoptimized={unoptimized}
        draggable={false}
      />
      {/* Transparent Protective Click-Catcher Scrim */}
      <div
        className="protect-image-scrim"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        aria-hidden="true"
      />
    </div>
  );
}
