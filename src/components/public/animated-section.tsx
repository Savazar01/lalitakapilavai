"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedSection({
  children,
  className = "",
  style,
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}
