"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ScrollTransitionMode = "none" | "parallax-float" | "book-turn" | "stagger-reveal" | "soft-fade";

export interface CatalogScrollEngineProps {
  children: React.ReactNode;
  mode?: ScrollTransitionMode;
  className?: string;
  style?: React.CSSProperties;
  pageIndex?: number;
  totalPages?: number;
}

export function CatalogScrollEngine({
  children,
  mode = "parallax-float",
  className = "",
  style,
  pageIndex: _pageIndex = 0,
}: CatalogScrollEngineProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax Float transforms
  const parallaxY = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);
  const parallaxScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.99]);

  // Book Turn 3D Page Flip transforms
  const bookRotateY = useTransform(scrollYProgress, [0, 0.45, 0.85], [-24, 0, 10]);
  const bookShadowOpacity = useTransform(scrollYProgress, [0, 0.45, 0.85], [0.45, 0, 0.25]);

  // If user prefers reduced motion or mode is none, render clean static wrapper
  if (prefersReducedMotion || mode === "none") {
    return (
      <div ref={containerRef} className={cn("w-full transition-none", className)} style={style}>
        {children}
      </div>
    );
  }

  if (mode === "book-turn") {
    return (
      <div
        ref={containerRef}
        className={cn("w-full relative [perspective:1400px]", className)}
        style={style}
      >
        <motion.div
          style={{
            rotateY: bookRotateY,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
          className="w-full relative rounded-2xl will-change-transform"
        >
          {children}

          {/* Dynamic 3D Gutter Shadow simulating page curvature */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: bookShadowOpacity }}
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-30 rounded-l-2xl"
          />
        </motion.div>
      </div>
    );
  }

  if (mode === "parallax-float") {
    return (
      <div ref={containerRef} className={cn("w-full relative overflow-visible", className)} style={style}>
        <motion.div
          style={{
            y: parallaxY,
            scale: parallaxScale,
          }}
          className="w-full relative will-change-transform transition-shadow duration-500"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  if (mode === "stagger-reveal") {
    return (
      <motion.div
        ref={containerRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.12,
              delayChildren: 0.05,
            },
          },
        }}
        className={cn("w-full relative", className)}
        style={style}
      >
        {React.Children.map(children, (child, idx) => {
          if (!React.isValidElement(child)) return child;
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 22, scale: 0.98 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="w-full h-full"
            >
              {child}
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  // mode === "soft-fade"
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("w-full relative", className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}
