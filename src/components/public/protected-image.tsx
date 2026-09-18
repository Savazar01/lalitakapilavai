"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  containerClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  useImg?: boolean;
  children?: React.ReactNode;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function ProtectedImage({
  src,
  alt,
  className,
  wrapperClassName,
  containerClassName,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  quality = 85,
  style,
  unoptimized,
  useImg = false,
  children,
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

  const effectiveWrapperClass = wrapperClassName || containerClassName;

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden",
        fill && "w-full h-full",
        effectiveWrapperClass
      )}
      onContextMenu={handleContextMenu}
    >
      {useImg ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "protect-image select-none pointer-events-none transition-all duration-300",
            className
          )}
          draggable={false}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          style={style}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          sizes={sizes}
          quality={quality}
          style={style}
          unoptimized={unoptimized}
          className={cn(
            "protect-image select-none pointer-events-none transition-all duration-300",
            className
          )}
          draggable={false}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        />
      )}

      {/* Transparent Protective Click-Catcher Scrim */}
      <div
        className="protect-image-scrim absolute inset-0 z-10 select-none bg-transparent"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        draggable={false}
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
