"use client";

import * as React from "react";
import Link from "next/link";
import * as THREE from "three";
import QRCode from "qrcode";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  QrCode,
} from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import {
  WallEnvironment,
  getWallEnvironment,
} from "./exhibition-environments";
import { cn, stripHtmlTags } from "@/lib/utils";

export type CameraTourStyle = "overview" | "drone" | "walkthrough" | "inspection";
export type WallLayoutMatrix = "salon" | "linear" | "grid";

export type WallArtworkLayoutType =
  | "auto"
  | "auto-balanced"
  | "single"
  | "single-centered"
  | "single-left"
  | "single-right"
  | "horizontal-2"
  | "vertical-2"
  | "horizontal-3"
  | "vertical-3"
  | "pyramid-1-2"
  | "pyramid-2-1"
  | "inverted-pyramid-2-1"
  | "grid-2x2"
  | "horizontal-4"
  | "stack-1-3"
  | "stack-3-1"
  | "pyramid-1-3"
  | "pyramid-3-1"
  | "salon-4"
  | "centerpiece-flanked"
  | "centerpiece-flanked-5"
  | "grid-2-3"
  | "grid-3-2"
  | "staggered-2-3"
  | "staggered-3-2"
  | "horizontal-5"
  | "grid-3x2"
  | "grid-2x3"
  | "horizontal-6";

export type WallFrameStyle =
  | "gold-gilt"
  | "teak-wood"
  | "gallery-black"
  | "museum-glass"
  | "rosewood"
  | "light-oak"
  | "white-float"
  | "curated-mix";

export interface ExhibitionWallConfig {
  id?: string;
  wallIndex?: number;
  name?: string;
  layoutType?: WallArtworkLayoutType;
  artworkIds?: string[];
  frameStyle?: WallFrameStyle;
  offsetX?: number;
  offsetY?: number;
  spacingMultiplier?: number;
  verticalGap?: number;
  customBackgroundUrl?: string;
}

export interface ExhibitionWallBlockProps {
  items: MediaGalleryItem[];
  environmentId?: string;
  culturalEnvironment?: string;
  customWallUrl?: string;
  customWallBackdropUrl?: string;
  wallBackgroundMode?: "uniform" | "per-wall";
  wallCustomBackgrounds?: string[];
  wallEnvironments?: string[];
  cameraTourStyle?: CameraTourStyle;
  cameraTransitionStyle?: "pan-zoom" | "dolly" | "crossfade" | "cinematic-arc";
  wallLayout?: WallLayoutMatrix;
  autoplayTour?: boolean;
  tourSpeedSeconds?: number;
  overviewDwellSeconds?: number;
  showExhibitionBadge?: boolean;
  maxArtworksPerWall?: number;
  showMetadataCardBelowWall?: boolean;
  wallConfigs?: ExhibitionWallConfig[];
  className?: string;
}

export interface ArtworkPlacement {
  item: MediaGalleryItem;
  x: number;
  y: number;
  width: number;
  height: number;
  wallIndex: number;
  wallCenterX: number;
  frameType: WallFrameStyle | "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
  index: number;
}

export type TourStep =
  | { type: "overview"; wallIndex: number }
  | { type: "artwork"; artworkIndex: number; wallIndex: number };

/**
 * Extracts numerical aspect ratio (width / height) from artwork metadata dimensions.
 * Handles formats like: "30 x 40 in", "36 × 24 cm", "12 x 16", "24\" * 36\"".
 */
function parseArtworkAspectRatio(item: MediaGalleryItem): number {
  const dimStr =
    item.artwork?.dimensions ||
    item.dimensions ||
    item.caption ||
    "";
  if (dimStr) {
    const match = dimStr.match(/(\d+(?:\.\d+)?)\s*(?:x|X|×|by|\*)\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      if (w > 0 && h > 0) {
        return Math.max(0.45, Math.min(2.5, w / h));
      }
    }
  }
  return 1.0;
}

/**
 * Dynamically computes 3D canvas dimensions preserving the natural aspect ratio
 * with natural boundary clamping so landscape or portrait masterworks don't clip walls.
 */
function calculateFrameSize(aspectRatio: number, maxDim = 1.7): { width: number; height: number } {
  const ar = Math.max(0.5, Math.min(2.2, aspectRatio));
  if (ar >= 1.0) {
    const width = Math.min(2.2, maxDim * Math.min(1.25, Math.sqrt(ar)));
    const height = width / ar;
    return { width: Number(width.toFixed(2)), height: Number(height.toFixed(2)) };
  } else {
    const height = Math.min(2.2, maxDim * Math.min(1.25, 1 / Math.sqrt(ar)));
    const width = height * ar;
    return { width: Number(width.toFixed(2)), height: Number(height.toFixed(2)) };
  }
}

export const WALL_SPACING = 20.0;

/**
 * Computes architectural multi-wall corridor coordinates replicating the
 * Classical Fine Art / Salon Wall Architecture.
 * Supports custom per-wall layouts, offsets, and spacing multipliers.
 */
function computePlacements(
  items: MediaGalleryItem[],
  layout: WallLayoutMatrix = "salon",
  maxPerWall = 4,
  wallConfigs?: ExhibitionWallConfig[],
  wallSpacing = WALL_SPACING
): ArtworkPlacement[] {
  if (items.length === 0) return [];

  const placements: ArtworkPlacement[] = [];
  const safeMax = Math.max(1, Math.min(8, maxPerWall));
  const hasConfigs = Boolean(wallConfigs && wallConfigs.length > 0);
  const numWalls = hasConfigs ? wallConfigs!.length : Math.ceil(items.length / safeMax);

  for (let w = 0; w < numWalls; w++) {
    const cfg = hasConfigs ? wallConfigs![w] : undefined;
    let wallItems: MediaGalleryItem[] = [];

    if (cfg?.artworkIds && cfg.artworkIds.length > 0) {
      cfg.artworkIds.forEach((targetId) => {
        const found = items.find(
          (it) =>
            it.id === targetId ||
            it.artworkId === targetId ||
            it.artwork?.id === targetId ||
            it.artwork?.slug === targetId ||
            it.url === targetId
        );
        if (found) wallItems.push(found);
      });
    }

    // Fallback to sequential slicing if no custom artwork IDs matched
    if (wallItems.length === 0) {
      wallItems = items.slice(w * safeMax, (w + 1) * safeMax);
    }

    const wallCenterX = w * wallSpacing;
    const count = wallItems.length;
    if (count === 0) continue;

    const offsetX = cfg?.offsetX ?? 0;
    const offsetY = cfg?.offsetY ?? 0;
    const spacingMult = Math.max(0.4, Math.min(2.5, cfg?.spacingMultiplier ?? 1.0));
    const rawLayout = cfg?.layoutType || "auto";

    // Resolve layout type
    let resolvedLayout: WallArtworkLayoutType = rawLayout;
    if (resolvedLayout === "auto") {
      if (layout === "linear") {
        if (count <= 1) resolvedLayout = "single";
        else if (count === 2) resolvedLayout = "horizontal-2";
        else if (count === 3) resolvedLayout = "horizontal-3";
        else if (count === 4) resolvedLayout = "horizontal-4";
        else if (count === 5) resolvedLayout = "horizontal-5";
        else resolvedLayout = "horizontal-6";
      } else if (layout === "grid") {
        if (count <= 1) resolvedLayout = "single";
        else if (count === 2) resolvedLayout = "horizontal-2";
        else if (count === 3) resolvedLayout = "pyramid-1-2";
        else if (count === 4) resolvedLayout = "grid-2x2";
        else if (count === 5) resolvedLayout = "grid-2-3";
        else resolvedLayout = "grid-3x2";
      } else {
        // "salon"
        if (count <= 1) resolvedLayout = "single";
        else if (count === 2) resolvedLayout = "horizontal-2";
        else if (count === 3) resolvedLayout = "pyramid-1-2";
        else if (count === 4) resolvedLayout = "grid-2x2";
        else if (count === 5) resolvedLayout = "centerpiece-flanked";
        else resolvedLayout = "grid-3x2";
      }
    }

    const VERTICAL_GAP = 0.28 * spacingMult;
    const EYE_LEVEL_Y = 1.55;

    // Tailor max dimension to layout
    let maxDim = 1.35;
    if (resolvedLayout === "single" || count === 1) maxDim = 2.0;
    else if (resolvedLayout === "vertical-3") maxDim = 0.90;
    else if (
      resolvedLayout === "vertical-2" ||
      resolvedLayout === "pyramid-1-2" ||
      resolvedLayout === "pyramid-2-1" ||
      (resolvedLayout as string) === "inverted-pyramid-2-1" ||
      resolvedLayout === "horizontal-4" ||
      resolvedLayout === "stack-1-3" ||
      resolvedLayout === "stack-3-1" ||
      resolvedLayout === "grid-2x2" ||
      resolvedLayout === "salon-4"
    )
      maxDim = 1.15;
    else if (
      resolvedLayout === "horizontal-5" ||
      resolvedLayout === "grid-2-3" ||
      resolvedLayout === "grid-3-2" ||
      resolvedLayout === "centerpiece-flanked"
    )
      maxDim = 1.10;
    else if (
      resolvedLayout === "horizontal-6" ||
      resolvedLayout === "grid-3x2" ||
      resolvedLayout === "grid-2x3"
    )
      maxDim = 0.95;
    else if (count <= 3) maxDim = 1.45;
    else maxDim = 1.15;

    const frameSizes = wallItems.map((item) => {
      const ar = parseArtworkAspectRatio(item);
      return calculateFrameSize(ar, maxDim);
    });

    const baseVerticalGap = cfg?.verticalGap ?? 0.48;
    const vClearance = baseVerticalGap * spacingMult;

    // Helper for 2 stacked artworks with guaranteed vertical clearance accounting for frame padding (0.16m)
    const getStackedY = (topIdx: number, btmIdx: number) => {
      const hTop = (frameSizes[topIdx]?.height || 1.10) + 0.16;
      const hBtm = (frameSizes[btmIdx]?.height || 1.10) + 0.16;
      const centerDist = hTop / 2 + vClearance + hBtm / 2;
      return {
        yTop: EYE_LEVEL_Y + centerDist / 2,
        yBtm: EYE_LEVEL_Y - centerDist / 2,
      };
    };

    let localSlots: {
      x: number;
      y: number;
      frame: WallFrameStyle | "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
    }[] = [];

    if (resolvedLayout === "single" || count === 1) {
      localSlots = [{ x: 0, y: EYE_LEVEL_Y, frame: "gold-teak" }];
    } else if (resolvedLayout === "horizontal-2") {
      const w0 = frameSizes[0].width;
      const w1 = frameSizes[1]?.width || 1.2;
      const colGap = 1.50 * spacingMult;
      const totalSpan = w0 + colGap + w1;
      localSlots = [
        { x: -totalSpan / 2 + w0 / 2, y: EYE_LEVEL_Y, frame: "gold-teak" },
        { x: totalSpan / 2 - w1 / 2, y: EYE_LEVEL_Y, frame: "rosewood-ivory" },
      ];
    } else if (resolvedLayout === "vertical-2") {
      const y = getStackedY(0, 1);
      localSlots = [
        { x: 0, y: y.yTop, frame: "gold-teak" },
        { x: 0, y: y.yBtm, frame: "rosewood-ivory" },
      ];
    } else if (resolvedLayout === "horizontal-3") {
      const w0 = frameSizes[0].width;
      const w1 = frameSizes[1]?.width || 1.2;
      const w2 = frameSizes[2]?.width || 1.2;
      const colGap = 1.25 * spacingMult;
      const totalSpan = w0 + w1 + w2 + 2 * colGap;
      localSlots = [
        { x: -totalSpan / 2 + w0 / 2, y: EYE_LEVEL_Y, frame: "rosewood-ivory" },
        { x: 0, y: EYE_LEVEL_Y + 0.03, frame: "gold-teak" },
        { x: totalSpan / 2 - w2 / 2, y: EYE_LEVEL_Y, frame: "light-oak" },
      ];
    } else if (resolvedLayout === "vertical-3") {
      const h0 = (frameSizes[0]?.height || 0.9) + 0.16;
      const h1 = (frameSizes[1]?.height || 0.9) + 0.16;
      const h2 = (frameSizes[2]?.height || 0.9) + 0.16;
      const centerDistTop = h1 / 2 + vClearance + h0 / 2;
      const centerDistBtm = h1 / 2 + vClearance + h2 / 2;
      localSlots = [
        { x: 0, y: EYE_LEVEL_Y + centerDistTop, frame: "gold-teak" },
        { x: 0, y: EYE_LEVEL_Y, frame: "rosewood-ivory" },
        { x: 0, y: EYE_LEVEL_Y - centerDistBtm, frame: "light-oak" },
      ];
    } else if (resolvedLayout === "pyramid-1-2") {
      const w1 = frameSizes[1]?.width || 1.1;
      const w2 = frameSizes[2]?.width || 1.1;
      const colGap = 1.40 * spacingMult;
      const btmSpan = w1 + colGap + w2;
      const hBtmMax = Math.max(frameSizes[1]?.height || 1.1, frameSizes[2]?.height || 1.1) + 0.16;
      const h0 = (frameSizes[0]?.height || 1.1) + 0.16;
      const centerDist = h0 / 2 + vClearance + hBtmMax / 2;
      localSlots = [
        { x: 0, y: EYE_LEVEL_Y + centerDist / 2, frame: "gold-teak" },
        { x: -btmSpan / 2 + w1 / 2, y: EYE_LEVEL_Y - centerDist / 2, frame: "rosewood-ivory" },
        { x: btmSpan / 2 - w2 / 2, y: EYE_LEVEL_Y - centerDist / 2, frame: "light-oak" },
      ];
    } else if (resolvedLayout === "pyramid-2-1" || (resolvedLayout as string) === "inverted-pyramid-2-1") {
      const w0 = frameSizes[0]?.width || 1.1;
      const w1 = frameSizes[1]?.width || 1.1;
      const colGap = 1.40 * spacingMult;
      const topSpan = w0 + colGap + w1;
      const hTopMax = Math.max(frameSizes[0]?.height || 1.1, frameSizes[1]?.height || 1.1) + 0.16;
      const h2 = (frameSizes[2]?.height || 1.1) + 0.16;
      const centerDist = hTopMax / 2 + vClearance + h2 / 2;
      localSlots = [
        { x: -topSpan / 2 + w0 / 2, y: EYE_LEVEL_Y + centerDist / 2, frame: "rosewood-ivory" },
        { x: topSpan / 2 - w1 / 2, y: EYE_LEVEL_Y + centerDist / 2, frame: "light-oak" },
        { x: 0, y: EYE_LEVEL_Y - centerDist / 2, frame: "gold-teak" },
      ];
    } else if (resolvedLayout === "grid-2x2" || resolvedLayout === "salon-4") {
      const leftColW = Math.max(frameSizes[0].width, frameSizes[1]?.width || 1.1);
      const rightColW = Math.max(frameSizes[2]?.width || 1.1, frameSizes[3]?.width || 1.1);
      const colGap = 1.50 * spacingMult;
      const totalSpan = leftColW + colGap + rightColW;
      const leftColX = -totalSpan / 2 + leftColW / 2;
      const rightColX = totalSpan / 2 - rightColW / 2;
      const leftY = getStackedY(0, 1);
      const rightY = getStackedY(2, 3);
      localSlots = [
        { x: leftColX, y: leftY.yTop, frame: "light-oak" },
        { x: leftColX, y: leftY.yBtm, frame: "rosewood-ivory" },
        { x: rightColX, y: rightY.yTop, frame: "gold-teak" },
        { x: rightColX, y: rightY.yBtm, frame: "white-float" },
      ];
    } else if (resolvedLayout === "horizontal-4") {
      const colGap = 0.95 * spacingMult;
      const totalSpan = frameSizes.slice(0, 4).reduce((sum, s) => sum + s.width, 0) + 3 * colGap;
      let cur = -totalSpan / 2;
      localSlots = frameSizes.slice(0, 4).map((s, idx) => {
        const x = cur + s.width / 2;
        cur += s.width + colGap;
        return {
          x,
          y: EYE_LEVEL_Y,
          frame: idx % 2 === 0 ? ("gold-teak" as const) : ("light-oak" as const),
        };
      });
    } else if (resolvedLayout === "stack-1-3") {
      const btmSizes = frameSizes.slice(1, 4);
      const colGap = 1.05 * spacingMult;
      const btmSpan = btmSizes.reduce((sum, s) => sum + s.width, 0) + (btmSizes.length - 1) * colGap;
      const hBtmMax = Math.max(...btmSizes.map((s) => s.height));
      const h0 = frameSizes[0].height;
      const centerDist = h0 / 2 + VERTICAL_GAP + hBtmMax / 2;
      let cur = -btmSpan / 2;
      const btmSlots = btmSizes.map((s, idx) => {
        const x = cur + s.width / 2;
        cur += s.width + colGap;
        return {
          x,
          y: EYE_LEVEL_Y - centerDist / 2,
          frame: idx === 1 ? ("gold-teak" as const) : ("rosewood-ivory" as const),
        };
      });
      localSlots = [
        { x: 0, y: EYE_LEVEL_Y + centerDist / 2, frame: "gold-teak" },
        ...btmSlots,
      ];
    } else if (resolvedLayout === "stack-3-1") {
      const topSizes = frameSizes.slice(0, 3);
      const colGap = 1.05 * spacingMult;
      const topSpan = topSizes.reduce((sum, s) => sum + s.width, 0) + (topSizes.length - 1) * colGap;
      const hTopMax = Math.max(...topSizes.map((s) => s.height));
      const h3 = frameSizes[3]?.height || 1.1;
      const centerDist = hTopMax / 2 + VERTICAL_GAP + h3 / 2;
      let cur = -topSpan / 2;
      const topSlots = topSizes.map((s, idx) => {
        const x = cur + s.width / 2;
        cur += s.width + colGap;
        return {
          x,
          y: EYE_LEVEL_Y + centerDist / 2,
          frame: idx === 1 ? ("gold-teak" as const) : ("rosewood-ivory" as const),
        };
      });
      localSlots = [
        ...topSlots,
        { x: 0, y: EYE_LEVEL_Y - centerDist / 2, frame: "light-oak" },
      ];
    } else if (resolvedLayout === "centerpiece-flanked") {
      const centerW = frameSizes[0].width;
      const leftColW = Math.max(frameSizes[1]?.width || 1.0, frameSizes[2]?.width || 1.0);
      const rightColW = Math.max(frameSizes[3]?.width || 1.0, frameSizes[4]?.width || 1.0);
      const sideGap = 1.35 * spacingMult;
      const leftColX = -(centerW / 2 + sideGap + leftColW / 2);
      const rightColX = +(centerW / 2 + sideGap + rightColW / 2);
      const leftY = getStackedY(1, 2);
      const rightY = getStackedY(3, 4);
      localSlots = [
        { x: 0, y: EYE_LEVEL_Y, frame: "gold-teak" },
        { x: leftColX, y: leftY.yTop, frame: "light-oak" },
        { x: leftColX, y: leftY.yBtm, frame: "rosewood-ivory" },
        { x: rightColX, y: rightY.yTop, frame: "light-oak" },
        { x: rightColX, y: rightY.yBtm, frame: "rosewood-ivory" },
      ];
    } else if (resolvedLayout === "grid-2-3") {
      const topSizes = frameSizes.slice(0, 2);
      const btmSizes = frameSizes.slice(2, 5);
      const colGap = 1.10 * spacingMult;
      const topSpan = topSizes.reduce((sum, s) => sum + s.width, 0) + colGap;
      const btmSpan = btmSizes.reduce((sum, s) => sum + s.width, 0) + 2 * colGap;
      const hTopMax = Math.max(...topSizes.map((s) => s.height));
      const hBtmMax = Math.max(...btmSizes.map((s) => s.height));
      const centerDist = hTopMax / 2 + VERTICAL_GAP + hBtmMax / 2;
      let curT = -topSpan / 2;
      const topSlots = topSizes.map((s) => {
        const x = curT + s.width / 2;
        curT += s.width + colGap;
        return { x, y: EYE_LEVEL_Y + centerDist / 2, frame: "light-oak" as const };
      });
      let curB = -btmSpan / 2;
      const btmSlots = btmSizes.map((s) => {
        const x = curB + s.width / 2;
        curB += s.width + colGap;
        return { x, y: EYE_LEVEL_Y - centerDist / 2, frame: "rosewood-ivory" as const };
      });
      localSlots = [...topSlots, ...btmSlots];
    } else if (resolvedLayout === "grid-3-2") {
      const topSizes = frameSizes.slice(0, 3);
      const btmSizes = frameSizes.slice(3, 5);
      const colGap = 1.10 * spacingMult;
      const topSpan = topSizes.reduce((sum, s) => sum + s.width, 0) + 2 * colGap;
      const btmSpan = btmSizes.reduce((sum, s) => sum + s.width, 0) + colGap;
      const hTopMax = Math.max(...topSizes.map((s) => s.height));
      const hBtmMax = Math.max(...btmSizes.map((s) => s.height));
      const centerDist = hTopMax / 2 + VERTICAL_GAP + hBtmMax / 2;
      let curT = -topSpan / 2;
      const topSlots = topSizes.map((s) => {
        const x = curT + s.width / 2;
        curT += s.width + colGap;
        return { x, y: EYE_LEVEL_Y + centerDist / 2, frame: "rosewood-ivory" as const };
      });
      let curB = -btmSpan / 2;
      const btmSlots = btmSizes.map((s) => {
        const x = curB + s.width / 2;
        curB += s.width + colGap;
        return { x, y: EYE_LEVEL_Y - centerDist / 2, frame: "light-oak" as const };
      });
      localSlots = [...topSlots, ...btmSlots];
    } else if (resolvedLayout === "horizontal-5") {
      const colGap = 0.85 * spacingMult;
      const totalSpan = frameSizes.slice(0, 5).reduce((sum, s) => sum + s.width, 0) + 4 * colGap;
      let cur = -totalSpan / 2;
      localSlots = frameSizes.slice(0, 5).map((s, idx) => {
        const x = cur + s.width / 2;
        cur += s.width + colGap;
        return { x, y: EYE_LEVEL_Y, frame: idx % 2 === 0 ? ("gold-teak" as const) : ("light-oak" as const) };
      });
    } else if (resolvedLayout === "grid-3x2") {
      const col0W = Math.max(frameSizes[0]?.width || 1.0, frameSizes[1]?.width || 1.0);
      const col1W = Math.max(frameSizes[2]?.width || 1.0, frameSizes[3]?.width || 1.0);
      const col2W = Math.max(frameSizes[4]?.width || 1.0, frameSizes[5]?.width || 1.0);
      const colGap = 1.20 * spacingMult;
      const totalSpan = col0W + colGap + col1W + colGap + col2W;
      const col0X = -totalSpan / 2 + col0W / 2;
      const col1X = 0;
      const col2X = totalSpan / 2 - col2W / 2;
      const yCol0 = getStackedY(0, 1);
      const yCol1 = getStackedY(2, 3);
      const yCol2 = getStackedY(4, 5);
      localSlots = [
        { x: col0X, y: yCol0.yTop, frame: "rosewood-ivory" },
        { x: col0X, y: yCol0.yBtm, frame: "light-oak" },
        { x: col1X, y: yCol1.yTop, frame: "gold-teak" },
        { x: col1X, y: yCol1.yBtm, frame: "rosewood-ivory" },
        { x: col2X, y: yCol2.yTop, frame: "light-oak" },
        { x: col2X, y: yCol2.yBtm, frame: "gold-teak" },
      ];
    } else if (resolvedLayout === "grid-2x3") {
      const col0W = Math.max(frameSizes[0]?.width || 1.0, frameSizes[1]?.width || 1.0, frameSizes[2]?.width || 1.0);
      const col1W = Math.max(frameSizes[3]?.width || 1.0, frameSizes[4]?.width || 1.0, frameSizes[5]?.width || 1.0);
      const colGap = 1.60 * spacingMult;
      const totalSpan = col0W + colGap + col1W;
      const col0X = -totalSpan / 2 + col0W / 2;
      const col1X = totalSpan / 2 - col1W / 2;
      const vGap = 0.18 * spacingMult;
      const getY3 = (i0: number, i1: number, i2: number) => {
        const h0 = frameSizes[i0]?.height || 1.0;
        const h1 = frameSizes[i1]?.height || 1.0;
        const h2 = frameSizes[i2]?.height || 1.0;
        return {
          top: EYE_LEVEL_Y + h1 / 2 + vGap + h0 / 2,
          mid: EYE_LEVEL_Y,
          btm: EYE_LEVEL_Y - (h1 / 2 + vGap + h2 / 2),
        };
      };
      const yL = getY3(0, 1, 2);
      const yR = getY3(3, 4, 5);
      localSlots = [
        { x: col0X, y: yL.top, frame: "gold-teak" },
        { x: col0X, y: yL.mid, frame: "rosewood-ivory" },
        { x: col0X, y: yL.btm, frame: "light-oak" },
        { x: col1X, y: yR.top, frame: "light-oak" },
        { x: col1X, y: yR.mid, frame: "gold-teak" },
        { x: col1X, y: yR.btm, frame: "rosewood-ivory" },
      ];
    } else if (resolvedLayout === "horizontal-6") {
      const colGap = 0.80 * spacingMult;
      const totalSpan = frameSizes.slice(0, 6).reduce((sum, s) => sum + s.width, 0) + 5 * colGap;
      let cur = -totalSpan / 2;
      localSlots = frameSizes.slice(0, 6).map((s, idx) => {
        const x = cur + s.width / 2;
        cur += s.width + colGap;
        return { x, y: EYE_LEVEL_Y, frame: idx % 2 === 0 ? ("gold-teak" as const) : ("light-oak" as const) };
      });
    } else {
      // 4-column multi-row grid (7+ artworks)
      const colWidths = [
        Math.max(frameSizes[0]?.width || 1.15, frameSizes[1]?.width || 1.15),
        Math.max(frameSizes[2]?.width || 1.15, frameSizes[3]?.width || 1.15),
        Math.max(frameSizes[4]?.width || 1.15, frameSizes[5]?.width || 1.15),
        Math.max(frameSizes[6]?.width || 1.15, frameSizes[7]?.width || 1.15),
      ];
      const colGap = 0.95 * spacingMult;
      const totalSpan = colWidths.reduce((a, b) => a + b, 0) + 3 * colGap;
      let cur = -totalSpan / 2;
      const centers = colWidths.map((cw) => {
        const c = cur + cw / 2;
        cur += cw + colGap;
        return c;
      });

      const getColSlots = (
        colIdx: number,
        topItemIdx: number,
        btmItemIdx: number,
        fTop: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float",
        fBtm: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float"
      ) => {
        if (btmItemIdx >= count) {
          return [{ x: centers[colIdx], y: EYE_LEVEL_Y, frame: fTop }];
        }
        const y = getStackedY(topItemIdx, btmItemIdx);
        return [
          { x: centers[colIdx], y: y.yTop, frame: fTop },
          { x: centers[colIdx], y: y.yBtm, frame: fBtm },
        ];
      };

      localSlots = [
        ...getColSlots(0, 0, 1, "gold-teak", "rosewood-ivory"),
        ...getColSlots(1, 2, 3, "light-oak", "gold-teak"),
        ...getColSlots(2, 4, 5, "rosewood-ivory", "light-oak"),
        ...getColSlots(3, 6, 7, "white-float", "gold-teak"),
      ];
    }

    wallItems.forEach((item, localIdx) => {
      const slot = localSlots[localIdx] || {
        x: -3.0 + localIdx * 1.5,
        y: EYE_LEVEL_Y,
        frame: "gold-teak" as const,
      };
      const globalIdx = placements.length;
      const { width, height } = frameSizes[localIdx] || { width: 1.2, height: 1.2 };
      const wallFrameStyle: WallFrameStyle = cfg?.frameStyle || "curated-mix";
      const resolvedFrameType = wallFrameStyle !== "curated-mix" ? wallFrameStyle : slot.frame;
      placements.push({
        item,
        x: wallCenterX + slot.x + offsetX,
        y: slot.y + offsetY,
        width,
        height,
        wallIndex: w,
        wallCenterX,
        frameType: resolvedFrameType,
        index: globalIdx,
      });
    });
  }

  return placements;
}

export function ExhibitionWallBlock({
  items = [],
  environmentId = "modern-minimalist",
  culturalEnvironment,
  customWallUrl,
  customWallBackdropUrl,
  cameraTourStyle = "drone",
  cameraTransitionStyle = "pan-zoom",
  wallLayout = "salon",
  autoplayTour = true,
  tourSpeedSeconds = 5,
  overviewDwellSeconds = 4,
  showExhibitionBadge: _showExhibitionBadge = true,
  wallBackgroundMode = "uniform",
  wallCustomBackgrounds = [],
  wallEnvironments = [],
  maxArtworksPerWall = 4,
  showMetadataCardBelowWall = true,
  wallConfigs = [],
  className = "",
}: ExhibitionWallBlockProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const activeEnvId = culturalEnvironment || environmentId || "modern-minimalist";
  const activeCustomWallUrl = customWallBackdropUrl || customWallUrl;
  const isPerWall = wallBackgroundMode === "per-wall" && wallCustomBackgrounds.some((u) => u && u.trim() !== "");
  const hasWallConfigBackdrops = Boolean(wallConfigs?.some((c) => c.customBackgroundUrl && c.customBackgroundUrl.trim() !== ""));
  const isCustomBackdrop =
    Boolean(activeCustomWallUrl && activeCustomWallUrl.trim() !== "") ||
    isPerWall ||
    hasWallConfigBackdrops ||
    activeEnvId === "custom" ||
    activeEnvId.toLowerCase().includes("custom");

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [liveDbArtworks, setLiveDbArtworks] = React.useState<Array<Record<string, unknown>>>([]);

  const liveItems = React.useMemo<MediaGalleryItem[]>(() => {
    if (liveDbArtworks.length === 0) return items;
    return items.map((it) => {
      const artId = it.artworkId || it.artwork?.id;
      const targetSlug = (it.linkType === "artwork" ? it.linkTarget : null) || it.artwork?.slug || it.slug;
      const match = liveDbArtworks.find(
        (a) => (artId && a.id === artId) || (targetSlug && a.slug === targetSlug)
      );
      if (!match) return it;
      const cat = match.category as { name?: string } | undefined;
      return {
        ...it,
        title: (match.title as string) || it.title,
        medium: (match.medium as string) || it.medium,
        dimensions: (match.dimensions as string) || it.dimensions,
        year: match.yearCreated ? String(match.yearCreated) : it.year,
        traditionalSchool: cat?.name || it.traditionalSchool,
        description: (match.description as string) || it.description,
        url: (match.watermarkedWebpUrl as string) || (match.primaryImageUrl as string) || it.url,
        artwork: {
          ...it.artwork,
          id: (match.id as string) || it.artwork?.id || "",
          title: (match.title as string) || it.artwork?.title || it.title,
          slug: (match.slug as string) || it.artwork?.slug || it.slug || "",
          medium: (match.medium as string) || it.artwork?.medium || it.medium,
          dimensions: (match.dimensions as string) || it.artwork?.dimensions || it.dimensions,
          yearCreated: match.yearCreated !== undefined ? Number(match.yearCreated) : it.artwork?.yearCreated,
          primaryImageUrl: (match.primaryImageUrl as string) || it.artwork?.primaryImageUrl || it.url,
          watermarkedWebpUrl: (match.watermarkedWebpUrl as string) || it.artwork?.watermarkedWebpUrl,
          category: cat ? { name: cat.name || "" } : it.artwork?.category,
        },
      };
    });
  }, [items, liveDbArtworks]);

  React.useEffect(() => {
    const artIds: string[] = [];
    const slugs: string[] = [];

    items.forEach((it) => {
      if (it.artworkId) artIds.push(it.artworkId);
      if (it.artwork?.id) artIds.push(it.artwork.id);
      if (it.linkType === "artwork" && it.linkTarget) slugs.push(it.linkTarget);
      if (it.artwork?.slug) slugs.push(it.artwork.slug);
      if (it.slug) slugs.push(it.slug);
    });

    const uniqueIds = Array.from(new Set(artIds));
    const uniqueSlugs = Array.from(new Set(slugs));

    if (uniqueIds.length === 0 && uniqueSlugs.length === 0) return;

    let cancelled = false;
    const query = new URLSearchParams();
    if (uniqueIds.length > 0) query.set("ids", uniqueIds.join(","));
    if (uniqueSlugs.length > 0) query.set("slugs", uniqueSlugs.join(","));

    fetch(`/api/artworks/resolve?${query.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((dbArtworks: Array<Record<string, unknown>>) => {
        if (cancelled || !Array.isArray(dbArtworks) || dbArtworks.length === 0) return;
        setLiveDbArtworks(dbArtworks);
      })
      .catch((err) => console.warn("Live artwork sync warning:", err));

    return () => {
      cancelled = true;
    };
  }, [items]);

  const validItems = React.useMemo(() => {
    return (liveItems || []).filter((item) => item && typeof item.url === "string" && item.url.trim() !== "");
  }, [liveItems]);

  const placements = React.useMemo(() => {
    return computePlacements(validItems, wallLayout, maxArtworksPerWall, wallConfigs, WALL_SPACING);
  }, [validItems, wallLayout, maxArtworksPerWall, wallConfigs]);

  const safeMax = Math.max(1, Math.min(8, maxArtworksPerWall));
  const hasConfigs = Boolean(wallConfigs && wallConfigs.length > 0);
  const numWalls = hasConfigs ? wallConfigs!.length : Math.max(1, Math.ceil(validItems.length / safeMax));

  // Build sequential tour path:
  // Wall 0 Overview -> Wall 0 Artworks -> Wall 1 Overview -> Wall 1 Artworks -> ...
  const tourSequence: TourStep[] = React.useMemo(() => {
    if (placements.length === 0) return [];
    const seq: TourStep[] = [];
    for (let w = 0; w < numWalls; w++) {
      seq.push({ type: "overview", wallIndex: w });
      const wallArtworks = placements.filter((p) => p.wallIndex === w);
      wallArtworks.forEach((art) => {
        seq.push({ type: "artwork", artworkIndex: art.index, wallIndex: w });
      });
    }
    return seq;
  }, [placements, numWalls]);

  const [tourStepIdx, setTourStepIdx] = React.useState<number>(0);
  const [userTourStyle, setUserTourStyle] = React.useState<CameraTourStyle | null>(null);
  const [isTourPlaying, setIsTourPlaying] = React.useState<boolean>(autoplayTour);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [sidePlacardQrUrl, setSidePlacardQrUrl] = React.useState<string | null>(null);

  const currentStep: TourStep = React.useMemo(() => {
    return tourSequence[tourStepIdx] || { type: "overview", wallIndex: 0 };
  }, [tourSequence, tourStepIdx]);
  const isOverview = currentStep.type === "overview";
  const activeWallIndex = currentStep.wallIndex;
  const selectedArtworkIndex = currentStep.type === "artwork" ? currentStep.artworkIndex : 0;
  const activePlacement = placements[selectedArtworkIndex] || placements[0];

  const activeTourStyle: CameraTourStyle = isOverview
    ? "overview"
    : (userTourStyle ?? (cameraTourStyle === "overview" ? "drone" : cameraTourStyle));

  const env: WallEnvironment = React.useMemo(() => {
    const found = getWallEnvironment(activeEnvId);
    if ((activeEnvId === "custom" || activeEnvId.toLowerCase().includes("custom")) && activeCustomWallUrl) {
      return { ...found, wallTextureUrl: activeCustomWallUrl };
    }
    return found;
  }, [activeEnvId, activeCustomWallUrl]);

  // Synchronized QR Code for side-mounted wall placard
  React.useEffect(() => {
    let active = true;
    if (!activePlacement) return;

    const slug =
      activePlacement.item.artwork?.slug ||
      activePlacement.item.slug ||
      activePlacement.item.linkTarget ||
      "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = slug ? `${origin}/artwork/${slug}?ref=exhibition` : `${origin}/gallery`;

    QRCode.toDataURL(url, {
      width: 160,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((dataUrl) => {
        if (active) setSidePlacardQrUrl(dataUrl);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [activePlacement]);

  // Three.js internal references
  const threeRef = React.useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    artworkMeshes: {
      mesh: THREE.Mesh;
      group: THREE.Group;
      materials: THREE.Material[];
      placement: ArtworkPlacement;
      index: number;
    }[];
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    spotlight: THREE.SpotLight;
    artSpotlights: THREE.SpotLight[];
    ambientLight: THREE.AmbientLight;
    wallMesh?: THREE.Mesh;
    wallMeshes?: THREE.Mesh[];
    decorGroup?: THREE.Group;
    floorMesh?: THREE.Mesh;
    crownMesh?: THREE.Mesh;
    skirtingMesh?: THREE.Mesh;
    pilasterMeshes?: THREE.Mesh[];
    capMeshes?: THREE.Mesh[];
    animationId: number;
    clock: THREE.Clock;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
  } | null>(null);

  const focusRef = React.useRef({
    currentStep,
    tourStyle: activeTourStyle,
  });

  React.useEffect(() => {
    focusRef.current = {
      currentStep,
      tourStyle: activeTourStyle,
    };
  }, [currentStep, activeTourStyle]);

  // Initialize Three.js WebGL Scene
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || placements.length === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    if (isCustomBackdrop) {
      scene.background = null;
    } else {
      scene.background = new THREE.Color(env.wallBgColor);
      scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.032);
    }

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    const initVFovRad = (50 * Math.PI) / 180;
    const initAspect = width / height;
    const initialOverviewZ = Math.min(13.6 / (2 * Math.tan(initVFovRad / 2) * initAspect), 8.2);
    // Museum eye-level camera baseline at 1.85m height, framed with zero adjacent wall bleed
    camera.position.set(0, 1.85, initialOverviewZ);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: isCustomBackdrop,
      powerPreference: "high-performance",
    });
    if (isCustomBackdrop) {
      renderer.setClearColor(0x000000, 0);
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = "anonymous";

    // Ambient Lighting
    const lightColor = isCustomBackdrop ? new THREE.Color(0xffffff) : new THREE.Color(env.lightingColor);
    const ambientLight = new THREE.AmbientLight(
      lightColor,
      isCustomBackdrop ? 1.0 : 0.85
    );
    scene.add(ambientLight);

    // Directional Ceiling Main Tracking Spotlight
    const spotlight = new THREE.SpotLight(
      lightColor,
      isCustomBackdrop ? 7.0 : env.spotlightIntensity * 12,
      36,
      Math.PI / 4,
      0.55,
      1.3
    );
    spotlight.position.set(0, 5.6, 5.2);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Dynamic corridor dimensions based on wall partitions
    const wallSpacing = WALL_SPACING;
    const corridorLength = Math.max(34, (numWalls - 1) * wallSpacing + 34);
    const corridorCenterX = ((numWalls - 1) * wallSpacing) / 2;

    // Side Fill Lights per wall bay for rich chiaroscuro depth
    for (let w = 0; w < numWalls; w++) {
      const bayX = w * wallSpacing;
      const fillColor = isCustomBackdrop ? new THREE.Color(0xffffff) : new THREE.Color(env.lightingColor);
      const leftFill = new THREE.PointLight(fillColor, isCustomBackdrop ? 2.5 : 6, 16);
      leftFill.position.set(bayX - 5.0, 4.2, 4.0);
      scene.add(leftFill);

      const rightFill = new THREE.PointLight(fillColor, isCustomBackdrop ? 2.5 : 6, 16);
      rightFill.position.set(bayX + 5.0, 4.2, 4.0);
      scene.add(rightFill);

      if (!isCustomBackdrop) {
        // Subtle warm visitor gallery floor/bench fill light to illuminate foreground decor
        const visitorFill = new THREE.PointLight(0xffeedd, 1.2, 10);
        visitorFill.position.set(bayX, 2.0, 7.5);
        scene.add(visitorFill);
      }
    }

    // Per-Artwork Radial Falloff Spotlights (Focused Light Pools)
    const artSpotlights: THREE.SpotLight[] = [];
    placements.forEach((placement) => {
      const artSpot = new THREE.SpotLight(
        lightColor,
        isCustomBackdrop ? 3.5 : env.spotlightIntensity * 6,
        14,
        Math.PI / 5.5,
        0.8,
        1.5
      );
      artSpot.position.set(placement.x, 5.4, 2.6);
      artSpot.target.position.set(placement.x, placement.y, 0);
      scene.add(artSpot);
      scene.add(artSpot.target);
      artSpotlights.push(artSpot);
    });

    // Architectural Back Wall spanning all wall bays
    const wallGeo = new THREE.PlaneGeometry(corridorLength, 12);
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 1024;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext("2d")!;

    wCtx.fillStyle = env.wallBgColor;
    wCtx.fillRect(0, 0, 1024, 512);

    const trackLightGrad = wCtx.createRadialGradient(512, 110, 30, 512, 170, 520);
    trackLightGrad.addColorStop(0, "rgba(255, 248, 230, 0.14)");
    trackLightGrad.addColorStop(0.45, "rgba(212, 175, 55, 0.05)");
    trackLightGrad.addColorStop(0.85, "transparent");
    trackLightGrad.addColorStop(1, "rgba(0, 0, 0, 0.12)");
    wCtx.fillStyle = trackLightGrad;
    wCtx.fillRect(0, 0, 1024, 512);

    const wallData = wCtx.getImageData(0, 0, 1024, 512);
    for (let i = 0; i < wallData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      wallData.data[i] = Math.min(255, Math.max(0, wallData.data[i] + n));
      wallData.data[i + 1] = Math.min(255, Math.max(0, wallData.data[i + 1] + n));
      wallData.data[i + 2] = Math.min(255, Math.max(0, wallData.data[i + 2] + n));
    }
    wCtx.putImageData(wallData, 0, 0);

    const topShadow = wCtx.createLinearGradient(0, 0, 0, 36);
    topShadow.addColorStop(0, "rgba(0, 0, 0, 0.35)");
    topShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    wCtx.fillStyle = topShadow;
    wCtx.fillRect(0, 0, 1024, 36);

    const bottomShadow = wCtx.createLinearGradient(0, 476, 0, 512);
    bottomShadow.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomShadow.addColorStop(1, "rgba(0, 0, 0, 0.40)");
    wCtx.fillStyle = bottomShadow;
    wCtx.fillRect(0, 476, 1024, 36);

    const wallTex = new THREE.CanvasTexture(wallCanvas);

    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = 256;
    bumpCanvas.height = 256;
    const bCtx = bumpCanvas.getContext("2d")!;
    const imgData = bCtx.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = 120 + Math.floor(Math.random() * 26);
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
    bCtx.putImageData(imgData, 0, 0);
    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(Math.round(corridorLength / 2), 8);

    const wallMeshes: THREE.Mesh[] = [];

    if (numWalls <= 1) {
      const wallMat = new THREE.MeshStandardMaterial({
        map: isCustomBackdrop ? null : wallTex,
        bumpMap: isCustomBackdrop ? null : bumpTex,
        bumpScale: isCustomBackdrop ? 0 : 0.04,
        roughness: isCustomBackdrop ? 0.35 : 0.92,
        metalness: 0.0,
        color: new THREE.Color(0xffffff),
        transparent: false,
        opacity: 1.0,
      });

      const singleCustomUrl =
        (wallCustomBackgrounds && wallCustomBackgrounds[0]) ||
        activeCustomWallUrl ||
        env.wallTextureUrl;

      if (singleCustomUrl) {
        texLoader.load(
          singleCustomUrl,
          (loadedTex) => {
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            const img = loadedTex.image;
            if (img && img.naturalWidth && img.naturalHeight) {
              const texAspect = img.naturalWidth / img.naturalHeight;
              const planeAspect = corridorLength / 12;
              if (planeAspect > texAspect) {
                loadedTex.repeat.set(1, texAspect / planeAspect);
                loadedTex.offset.set(0, (1 - texAspect / planeAspect) / 2);
              } else {
                loadedTex.repeat.set(planeAspect / texAspect, 1);
                loadedTex.offset.set((1 - planeAspect / texAspect) / 2, 0);
              }
            }
            wallMat.map = loadedTex;
            wallMat.bumpMap = null;
            wallMat.roughness = 0.35;
            wallMat.metalness = 0.0;
            wallMat.transparent = false;
            wallMat.opacity = 1.0;
            wallMat.needsUpdate = true;
          },
          undefined,
          (err) => {
            console.warn("Could not load wall texture:", err);
          }
        );
      }

      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(corridorCenterX, 2.5, 0);
      wallMesh.receiveShadow = true;
      scene.add(wallMesh);
      wallMeshes.push(wallMesh);
    } else {
      // Modular Multi-Wall Bay Architecture: Dedicated Wall Bay Meshes for each corridor section
      for (let w = 0; w < numWalls; w++) {
        const bayCenterX = w * wallSpacing;
        const isFirst = w === 0;
        const isLast = w === numWalls - 1;
        const leftExtension = isFirst ? wallSpacing : 0.0;
        const rightExtension = isLast ? wallSpacing : 0.0;
        const bayWidth = wallSpacing + leftExtension + rightExtension;
        const adjustedCenterX = bayCenterX - leftExtension / 2 + rightExtension / 2;

        const bayGeo = new THREE.PlaneGeometry(bayWidth, 12);
        const bayCustomUrl = wallConfigs?.[w]?.customBackgroundUrl || (isPerWall
          ? (wallCustomBackgrounds?.[w] || activeCustomWallUrl || env.wallTextureUrl)
          : (activeCustomWallUrl || wallCustomBackgrounds?.[w] || env.wallTextureUrl));

        const bayMat = new THREE.MeshStandardMaterial({
          map: isCustomBackdrop ? null : wallTex,
          bumpMap: isCustomBackdrop ? null : bumpTex,
          bumpScale: isCustomBackdrop ? 0 : 0.04,
          roughness: isCustomBackdrop ? 0.35 : 0.92,
          metalness: 0.0,
          color: new THREE.Color(0xffffff),
          transparent: isCustomBackdrop,
          opacity: 1.0,
        });

        if (bayCustomUrl) {
          texLoader.load(
            bayCustomUrl,
            (loadedTex) => {
              loadedTex.colorSpace = THREE.SRGBColorSpace;
              const img = loadedTex.image;
              if (img && img.naturalWidth && img.naturalHeight) {
                const texAspect = img.naturalWidth / img.naturalHeight;
                const planeAspect = bayWidth / 12;
                if (planeAspect > texAspect) {
                  loadedTex.repeat.set(1, texAspect / planeAspect);
                  loadedTex.offset.set(0, (1 - texAspect / planeAspect) / 2);
                } else {
                  loadedTex.repeat.set(planeAspect / texAspect, 1);
                  loadedTex.offset.set((1 - planeAspect / texAspect) / 2, 0);
                }
              }
              bayMat.map = loadedTex;
              bayMat.bumpMap = null;
              bayMat.roughness = 0.35;
              bayMat.metalness = 0.0;
              bayMat.transparent = false;
              bayMat.opacity = 1.0;
              bayMat.needsUpdate = true;
            },
            undefined,
            (err) => {
              console.warn(`Could not load wall texture for wall ${w + 1}:`, err);
            }
          );
        }

        const bayMesh = new THREE.Mesh(bayGeo, bayMat);
        bayMesh.position.set(adjustedCenterX, 2.5, 0);
        bayMesh.receiveShadow = true;
        scene.add(bayMesh);
        wallMeshes.push(bayMesh);
      }
    }

    // 3D Architectural Crown Moulding Beam along Ceiling
    const crownGeo = new THREE.BoxGeometry(corridorLength, 0.28, 0.2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(env.mouldingColor),
      roughness: 0.6,
      metalness: 0.1,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(corridorCenterX, 5.8, 0.1);
    crownMesh.castShadow = true;
    crownMesh.receiveShadow = true;
    crownMesh.visible = !isCustomBackdrop;
    scene.add(crownMesh);

    // 3D Architectural Baseboard / Skirting along Floor Line
    const skirtingGeo = new THREE.BoxGeometry(corridorLength, 0.34, 0.12);
    const skirtingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(env.skirtingColor),
      roughness: 0.55,
      metalness: 0.15,
    });
    const skirtingMesh = new THREE.Mesh(skirtingGeo, skirtingMat);
    skirtingMesh.position.set(corridorCenterX, 0.17, 0.06);
    skirtingMesh.castShadow = true;
    skirtingMesh.receiveShadow = true;
    skirtingMesh.visible = !isCustomBackdrop;
    scene.add(skirtingMesh);

    // Architectural Divider Pilasters framing every Wall Bay symmetrically
    const pilasterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(env.skirtingColor),
      roughness: 0.6,
      metalness: 0.15,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.65,
    });

    const pilasterPositions: number[] = [];
    for (let w = 0; w <= numWalls; w++) {
      pilasterPositions.push(w * wallSpacing - wallSpacing / 2);
    }

    const pilasterMeshes: THREE.Mesh[] = [];
    const capMeshes: THREE.Mesh[] = [];

    pilasterPositions.forEach((dividerX) => {
      const pilasterGeo = new THREE.BoxGeometry(0.38, 5.8, 0.18);
      const pilasterMesh = new THREE.Mesh(pilasterGeo, pilasterMat);
      pilasterMesh.position.set(dividerX, 2.9, 0.09);
      pilasterMesh.castShadow = true;
      pilasterMesh.receiveShadow = true;
      pilasterMesh.visible = !isCustomBackdrop;
      scene.add(pilasterMesh);
      pilasterMeshes.push(pilasterMesh);

      // Gilded accent fillet capital
      const capGeo = new THREE.BoxGeometry(0.5, 0.12, 0.22);
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(dividerX, 5.75, 0.11);
      capMesh.visible = !isCustomBackdrop;
      scene.add(capMesh);
      capMeshes.push(capMesh);
    });

    // Hardwood / Stone Floor Plane spanning corridor
    const floorGeo = new THREE.PlaneGeometry(corridorLength, 20);
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext("2d")!;
    fCtx.fillStyle = env.floorBgColor;
    fCtx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 36) {
      fCtx.fillStyle = (y / 36) % 2 === 0 ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)";
      fCtx.fillRect(0, y, 512, 36);
      fCtx.strokeStyle = "rgba(0, 0, 0, 0.32)";
      fCtx.lineWidth = 1.5;
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(512, y);
      fCtx.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(Math.round(corridorLength / 8), 4);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.42,
      metalness: 0.12,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(corridorCenterX, 0, 10);
    floorMesh.receiveShadow = true;
    floorMesh.visible = !isCustomBackdrop;
    scene.add(floorMesh);

    // Procedural Architectural 3D Decor Objects per Environment (Positioned strictly in visitor foreground z=6.2m or outer flanks)
    const decorGroup = new THREE.Group();
    decorGroup.visible = !isCustomBackdrop;
    if (env.decorType === "minimalist-bench") {
      // Modern Minimalist gallery benches (low visitor seat height 0.32m, pushed to foreground z = 6.2)
      for (let w = 0; w < numWalls; w++) {
        const benchX = w * wallSpacing;

        // Dark walnut / smoked oak base plinth
        const baseGeo = new THREE.BoxGeometry(2.3, 0.08, 0.62);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x2b1e16,
          roughness: 0.65,
          metalness: 0.08,
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.set(benchX, 0.17, 6.2);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        decorGroup.add(baseMesh);

        // Hand-tufted cognac leather cushion
        const cushionGeo = new THREE.BoxGeometry(2.2, 0.12, 0.58);
        const cushionMat = new THREE.MeshStandardMaterial({
          color: 0x8c4a24,
          roughness: 0.45,
          metalness: 0.15,
        });
        const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
        cushionMesh.position.set(benchX, 0.27, 6.2);
        cushionMesh.castShadow = true;
        cushionMesh.receiveShadow = true;
        decorGroup.add(cushionMesh);

        // Satin champagne brass tapered legs
        const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.13, 16);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.8 });
        [[-1.0, -0.22], [1.0, -0.22], [-1.0, 0.22], [1.0, 0.22]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(benchX + lx, 0.065, 6.2 + lz);
          leg.castShadow = true;
          decorGroup.add(leg);
        });
      }
    } else if (env.decorType === "palace-pedestal") {
      // Palatial gilded marble pedestals & urns on outer flanks (strictly clear of artwork bounds)
      for (let w = 0; w < numWalls; w++) {
        const wallX = w * wallSpacing;
        [-6.4, 6.4].forEach((flankOffset) => {
          const pedGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.9, 24);
          const pedMat = new THREE.MeshStandardMaterial({
            color: 0xfaf7f2,
            roughness: 0.3,
            metalness: 0.15,
          });
          const pedMesh = new THREE.Mesh(pedGeo, pedMat);
          pedMesh.position.set(wallX + flankOffset, 0.45, 1.2);
          pedMesh.castShadow = true;
          decorGroup.add(pedMesh);

          const urnGeo = new THREE.SphereGeometry(0.24, 16, 16);
          urnGeo.scale(1, 1.4, 1);
          const urnMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.75,
          });
          const urnMesh = new THREE.Mesh(urnGeo, urnMat);
          urnMesh.position.set(wallX + flankOffset, 1.15, 1.2);
          decorGroup.add(urnMesh);
        });
      }
    } else if (env.decorType === "atelier-brass") {
      // Traditional Indian Brass Urlis & Floor Lamps on outer room flanks
      for (let w = 0; w < numWalls; w++) {
        const wallX = w * wallSpacing;
        [-6.4, 6.4].forEach((flankOffset) => {
          const urliGeo = new THREE.CylinderGeometry(0.45, 0.25, 0.22, 24);
          const urliMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.35,
            metalness: 0.8,
          });
          const urliMesh = new THREE.Mesh(urliGeo, urliMat);
          urliMesh.position.set(wallX + flankOffset, 0.11, 1.0);
          urliMesh.castShadow = true;
          decorGroup.add(urliMesh);

          const candleLight = new THREE.PointLight(0xffaa33, 0.8, 3.5);
          candleLight.position.set(wallX + flankOffset, 0.25, 1.0);
          decorGroup.add(candleLight);
        });
      }
    } else if (env.decorType === "salon-bench") {
      // Classical collector upholstered salon bench (low seat height at z = 6.2)
      for (let w = 0; w < numWalls; w++) {
        const benchX = w * wallSpacing;

        const baseGeo = new THREE.BoxGeometry(2.3, 0.08, 0.62);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x22130c,
          roughness: 0.6,
          metalness: 0.05,
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.set(benchX, 0.17, 6.2);
        baseMesh.castShadow = true;
        decorGroup.add(baseMesh);

        const cushionGeo = new THREE.BoxGeometry(2.2, 0.13, 0.6);
        const cushionMat = new THREE.MeshStandardMaterial({
          color: 0x8c4a24,
          roughness: 0.45,
          metalness: 0.15,
        });
        const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
        cushionMesh.position.set(benchX, 0.27, 6.2);
        cushionMesh.castShadow = true;
        decorGroup.add(cushionMesh);

        const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.13, 16);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x8a6240, roughness: 0.4, metalness: 0.3 });
        [[-1.0, -0.22], [1.0, -0.22], [-1.0, 0.22], [1.0, 0.22]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(benchX + lx, 0.065, 6.2 + lz);
          decorGroup.add(leg);
        });
      }
    } else if (env.decorType === "villa-urn") {
      // Terracotta amphora urns on far flanks
      for (let w = 0; w < numWalls; w++) {
        const wallX = w * wallSpacing;
        [-6.4, 6.4].forEach((flankOffset) => {
          const urnGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.8, 16);
          const urnMat = new THREE.MeshStandardMaterial({
            color: 0x9c5134,
            roughness: 0.9,
            metalness: 0.05,
          });
          const urnMesh = new THREE.Mesh(urnGeo, urnMat);
          urnMesh.position.set(wallX + flankOffset, 0.4, 1.1);
          decorGroup.add(urnMesh);
        });
      }
    } else if (env.decorType === "corporate-bench") {
      // Sleek brushed steel & charcoal leather bench (low seat height at z = 6.2)
      for (let w = 0; w < numWalls; w++) {
        const benchX = w * wallSpacing;
        const cushionGeo = new THREE.BoxGeometry(2.3, 0.12, 0.58);
        const cushionMat = new THREE.MeshStandardMaterial({
          color: 0x181c22,
          roughness: 0.6,
          metalness: 0.2,
        });
        const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
        cushionMesh.position.set(benchX, 0.26, 6.2);
        cushionMesh.castShadow = true;
        decorGroup.add(cushionMesh);

        // Brushed stainless steel cantilever frame
        const frameGeo = new THREE.BoxGeometry(2.36, 0.05, 0.6);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(benchX, 0.17, 6.2);
        decorGroup.add(frameMesh);
      }
    }
    scene.add(decorGroup);

    // Build Artwork Meshes & Frames with Aspect-Ratio Precision
    const artworkMeshes: {
      mesh: THREE.Mesh;
      group: THREE.Group;
      materials: THREE.Material[];
      placement: ArtworkPlacement;
      index: number;
    }[] = [];

    placements.forEach((placement, idx) => {
      const artGroup = new THREE.Group();
      artGroup.position.set(placement.x, placement.y, 0.04);

      const framePadding = 0.08;
      const frameW = placement.width + framePadding * 2;
      const frameH = placement.height + framePadding * 2;
      const frameDepth = 0.06;

      // 1. Fine-Art Mounting Drop Shadow
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sCtx = shadowCanvas.getContext("2d")!;
      const sGrad = sCtx.createRadialGradient(64, 70, 16, 64, 70, 60);
      sGrad.addColorStop(0, "rgba(0, 0, 0, 0.58)");
      sGrad.addColorStop(0.42, "rgba(0, 0, 0, 0.30)");
      sGrad.addColorStop(0.78, "rgba(0, 0, 0, 0.08)");
      sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 128, 128);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);

      let shadowGeo = new THREE.PlaneGeometry(frameW * 1.28, frameH * 1.28);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, -0.05, 0.002);
      artGroup.add(shadowMesh);

      // 2. Outer Frame
      let frameColor = 0xd4af37;
      let roughness = 0.28;
      let metalness = 0.75;
      const ft = placement.frameType;

      if (ft === "teak-wood") {
        frameColor = 0x5c3a21;
        roughness = 0.65;
        metalness = 0.05;
      } else if (ft === "gallery-black") {
        frameColor = 0x18181b;
        roughness = 0.85;
        metalness = 0.0;
      } else if (ft === "museum-glass") {
        frameColor = 0x242426;
        roughness = 0.30;
        metalness = 0.25;
      } else if (ft === "rosewood" || ft === "rosewood-ivory") {
        frameColor = 0x3d1f14;
        roughness = 0.48;
        metalness = 0.12;
      } else if (ft === "light-oak") {
        frameColor = 0xc8ab83;
        roughness = 0.58;
        metalness = 0.06;
      } else if (ft === "white-float") {
        frameColor = 0xf5f5f3;
        roughness = 0.75;
        metalness = 0.0;
      } else {
        // default "gold-gilt" / "gold-teak"
        frameColor = 0xd4af37;
        roughness = 0.28;
        metalness = 0.75;
      }

      let frameGeo = new THREE.BoxGeometry(frameW, frameH, frameDepth);
      const frameMat = new THREE.MeshStandardMaterial({
        color: frameColor,
        roughness,
        metalness,
        transparent: true,
        opacity: 1.0,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      artGroup.add(frameMesh);

      // Inner Gilded Bevel Fillet Step
      let filletGeo = new THREE.BoxGeometry(
        placement.width + 0.04,
        placement.height + 0.04,
        frameDepth + 0.004
      );
      const filletMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 1.0,
      });
      const filletMesh = new THREE.Mesh(filletGeo, filletMat);
      filletMesh.position.set(0, 0, 0.002);
      artGroup.add(filletMesh);

      // 3. Warm Ivory Matting Plane
      let matGeo = new THREE.PlaneGeometry(
        placement.width + 0.03,
        placement.height + 0.03
      );
      const matMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbf8f3,
        roughness: 0.95,
        transparent: true,
        opacity: 1.0,
      });
      const matMesh = new THREE.Mesh(matGeo, matMaterial);
      matMesh.position.set(0, 0, frameDepth / 2 + 0.002);
      artGroup.add(matMesh);

      // 4. Canvas Texture Plane
      let canvasGeo = new THREE.PlaneGeometry(placement.width, placement.height);
      const canvasMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.05,
        transparent: true,
        opacity: 1.0,
      });

      // Load texture safely & adapt geometries dynamically to intrinsic aspect ratio
      texLoader.load(
        placement.item.url,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          canvasMat.map = loadedTex;
          canvasMat.needsUpdate = true;

          const img = loadedTex.image;
          if (img && img.naturalWidth && img.naturalHeight) {
            const naturalRatio = img.naturalWidth / img.naturalHeight;
            const currentRatio = placement.width / placement.height;
            // If aspect ratio differs from parsed placeholder by > 3%, dynamically re-scale geometries
            if (
              Math.abs(naturalRatio - currentRatio) > 0.03 &&
              isFinite(naturalRatio) &&
              naturalRatio > 0.1
            ) {
              const { width: newW, height: newH } = calculateFrameSize(
                naturalRatio,
                Math.max(placement.width, placement.height)
              );
              placement.width = newW;
              placement.height = newH;

              const newFrameW = newW + framePadding * 2;
              const newFrameH = newH + framePadding * 2;

              canvasMesh.geometry.dispose();
              canvasGeo = new THREE.PlaneGeometry(newW, newH);
              canvasMesh.geometry = canvasGeo;

              matMesh.geometry.dispose();
              matGeo = new THREE.PlaneGeometry(newW + 0.03, newH + 0.03);
              matMesh.geometry = matGeo;

              filletMesh.geometry.dispose();
              filletGeo = new THREE.BoxGeometry(
                newW + 0.04,
                newH + 0.04,
                frameDepth + 0.004
              );
              filletMesh.geometry = filletGeo;

              frameMesh.geometry.dispose();
              frameGeo = new THREE.BoxGeometry(
                newFrameW,
                newFrameH,
                frameDepth
              );
              frameMesh.geometry = frameGeo;

              shadowMesh.geometry.dispose();
              shadowGeo = new THREE.PlaneGeometry(
                newFrameW * 1.28,
                newFrameH * 1.28
              );
              shadowMesh.geometry = shadowGeo;
            }
          }
        },
        undefined,
        () => {
          canvasMat.color.setHex(0x332211);
        }
      );

      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.set(0, 0, frameDepth / 2 + 0.005);
      canvasMesh.castShadow = false;
      canvasMesh.receiveShadow = true;
      artGroup.add(canvasMesh);

      const artMaterials: THREE.Material[] = [frameMat, filletMat, matMaterial, canvasMat, shadowMat];

      if (placement.frameType === "museum-glass") {
        const glassGeo = new THREE.PlaneGeometry(placement.width, placement.height);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.94,
          opacity: 0.85,
          transparent: true,
          roughness: 0.04,
          ior: 1.52,
          reflectivity: 0.6,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set(0, 0, frameDepth / 2 + 0.008);
        artGroup.add(glassMesh);
        artMaterials.push(glassMat);
      }

      scene.add(artGroup);

      artworkMeshes.push({
        mesh: canvasMesh,
        group: artGroup,
        materials: artMaterials,
        placement,
        index: idx,
      });
    });

    const targetCamPos = new THREE.Vector3(0, 1.85, 9.4);
    const targetLookAt = new THREE.Vector3(0, 1.55, 0);
    const currentLookAt = new THREE.Vector3(0, 1.55, 0);
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    threeRef.current = {
      scene,
      camera,
      renderer,
      artworkMeshes,
      targetCamPos,
      targetLookAt,
      currentLookAt,
      spotlight,
      artSpotlights,
      ambientLight,
      wallMesh: wallMeshes[0],
      wallMeshes,
      decorGroup,
      floorMesh,
      crownMesh,
      skirtingMesh,
      pilasterMeshes,
      capMeshes,
      animationId: 0,
      clock,
      raycaster,
      mouse,
    };

    // Render loop with smooth cinematic interpolation
    const animate = () => {
      const state = threeRef.current;
      if (!state) return;

      const delta = state.clock.getDelta();
      const elapsed = state.clock.getElapsedTime();

      // Dynamic Smooth Wall-to-Wall Transition Arc Physics
      let effectiveTargetZ = state.targetCamPos.z;
      let effectiveTargetY = state.targetCamPos.y;
      const xDistance = Math.abs(state.targetCamPos.x - state.camera.position.x);

      if (cameraTransitionStyle === "cinematic-arc" && xDistance > 0.4) {
        // Parabolic pullback in Z mid-transit creates an authentic Hollywood crane/Steadicam sweep
        const travelProgress = Math.min(1, xDistance / WALL_SPACING);
        const arcFactor = 4 * travelProgress * (1 - travelProgress * 0.85);
        effectiveTargetZ += arcFactor * 2.2;
        effectiveTargetY += Math.sin(travelProgress * Math.PI) * 0.25;
      }

      const dampSpeed =
        cameraTransitionStyle === "cinematic-arc" ? 2.4 : cameraTransitionStyle === "dolly" ? 2.6 : 3.0;

      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, state.targetCamPos.x, dampSpeed, delta);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, effectiveTargetY, dampSpeed, delta);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, effectiveTargetZ, dampSpeed * 0.85, delta);

      state.currentLookAt.x = THREE.MathUtils.damp(state.currentLookAt.x, state.targetLookAt.x, dampSpeed * 1.1, delta);
      state.currentLookAt.y = THREE.MathUtils.damp(state.currentLookAt.y, state.targetLookAt.y, dampSpeed * 1.1, delta);
      state.currentLookAt.z = THREE.MathUtils.damp(state.currentLookAt.z, state.targetLookAt.z, dampSpeed * 1.1, delta);

      state.camera.lookAt(state.currentLookAt);

      // Keep main spotlight tracking camera center
      state.spotlight.target.position.copy(state.currentLookAt);

      // Subtle breathing motion for Curatorial Walkthrough mode
      if (activeTourStyle === "walkthrough") {
        state.camera.position.y += Math.sin(elapsed * 2.2) * 0.0015;
      }

      // Dynamic Curatorial Isolation per Wall and Artwork
      const { currentStep: step } = focusRef.current;
      const isStepOverview = step.type === "overview";
      const stepWall = step.wallIndex;
      const targetArtIdx = step.type === "artwork" ? step.artworkIndex : -1;
      const dissolveRate = cameraTransitionStyle === "crossfade" ? 2.5 : 5.0;

      // Keep foreground room decor visible during overview wall shots; hide during focus so it never occludes artworks
      if (state.decorGroup) {
        state.decorGroup.visible = !isCustomBackdrop && isStepOverview;
      }

      state.artworkMeshes.forEach((art) => {
        let targetOpacity = 0.0;
        if (isStepOverview) {
          // On overview wall, show all artworks on active wall bay; fade distant walls
          targetOpacity = art.placement.wallIndex === stepWall ? 1.0 : 0.0;
        } else {
          // In focused dolly, target piece is isolated 1.0
          targetOpacity = art.index === targetArtIdx ? 1.0 : 0.0;
        }

        art.materials.forEach((mat) => {
          if ("opacity" in mat) {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, Math.min(1, delta * dissolveRate));
            mat.visible = mat.opacity > 0.01;
          }
        });
      });

      // Modular Backdrop Mesh Dissolve: active wall bay stays solid; distant bays fade out to guarantee zero bleed
      if (state.wallMeshes && state.wallMeshes.length > 1) {
        state.wallMeshes.forEach((mesh, w) => {
          const bayCenter = w * wallSpacing;
          const distToCam = Math.abs(state.camera.position.x - bayCenter);
          // When camera is near this wall (within 10m), bay is fully visible; beyond 14m it fades completely
          const bayTargetOpacity = THREE.MathUtils.clamp(1 - (distToCam - 4) / 10, 0, 1);
          if (mesh.material && !Array.isArray(mesh.material) && "opacity" in mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, bayTargetOpacity, Math.min(1, delta * 8));
            mesh.visible = mesh.material.opacity > 0.01;
          }
        });
      }

      state.renderer.render(state.scene, state.camera);
      state.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 580;
      threeRef.current.camera.aspect = newWidth / newHeight;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animationId);
        threeRef.current.renderer.dispose();
      }
    };
  }, [
    placements,
    env,
    activeTourStyle,
    isCustomBackdrop,
    numWalls,
    cameraTransitionStyle,
    wallBackgroundMode,
    wallCustomBackgrounds,
    activeCustomWallUrl,
    isPerWall,
    wallConfigs,
  ]);

  // Update Environment Lighting dynamically
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    if (state.floorMesh) state.floorMesh.visible = !isCustomBackdrop;
    if (state.crownMesh) state.crownMesh.visible = !isCustomBackdrop;
    if (state.skirtingMesh) state.skirtingMesh.visible = !isCustomBackdrop;
    state.pilasterMeshes?.forEach((p) => (p.visible = !isCustomBackdrop));
    state.capMeshes?.forEach((c) => (c.visible = !isCustomBackdrop));
    if (state.decorGroup && isCustomBackdrop) state.decorGroup.visible = false;

    if (isCustomBackdrop) {
      state.scene.background = null;
      state.scene.fog = null;
      state.renderer.setClearColor(0x000000, 0);
      state.ambientLight.color.set(0xffffff);
      state.ambientLight.intensity = 1.0;
      state.spotlight.color.set(0xffffff);
      state.spotlight.intensity = 7.0;
      state.artSpotlights.forEach((s) => {
        s.color.set(0xffffff);
        s.intensity = 3.5;
      });
    } else {
      state.scene.background = new THREE.Color(env.wallBgColor);
      state.scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.032);
      state.ambientLight.color.set(env.lightingColor);
      state.ambientLight.intensity = 0.85;
      state.spotlight.color.set(env.lightingColor);
      state.spotlight.intensity = env.spotlightIntensity * 12;
      state.artSpotlights.forEach((s) => {
        s.color.set(env.lightingColor);
        s.intensity = env.spotlightIntensity * 6;
      });
    }
  }, [env, isCustomBackdrop]);

  // Camera Target Position Calculator based on Tour Mode and Selected Artwork/Wall
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    if (isOverview) {
      const wallCenterX = activeWallIndex * WALL_SPACING;
      const vFovRad = ((state.camera.fov || 50) * Math.PI) / 180;
      const aspect = state.camera.aspect || 1.6;
      // Bay width is WALL_SPACING (20.0m). Bound visible width <= 13.6m to ensure 0 bleed from adjacent bays
      const dynamicOverviewZ = Math.min(13.6 / (2 * Math.tan(vFovRad / 2) * aspect), 8.2);
      state.targetCamPos.set(wallCenterX, 1.85, dynamicOverviewZ);
      state.targetLookAt.set(wallCenterX, 1.55, 0);
    } else if (activePlacement) {
      const frameH = activePlacement.height + 0.16;
      const frameW = activePlacement.width + 0.16;
      const vFovRad = ((state.camera.fov || 50) * Math.PI) / 180;
      const aspect = state.camera.aspect || 1.6;

      const dHeight = (frameH / 0.75) / (2 * Math.tan(vFovRad / 2));
      const dWidth = (frameW / 0.75) / (2 * Math.tan(vFovRad / 2) * aspect);
      const idealDistance = Math.max(dHeight, dWidth, 1.5);

      const isMobileViewport =
        (containerRef.current?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1024)) < 768;
      const sideShiftX = isMobileViewport ? 0 : idealDistance * Math.tan(vFovRad / 2) * aspect * 0.28;

      if (cameraTransitionStyle === "dolly") {
        state.targetCamPos.set(
          activePlacement.x + sideShiftX,
          2.0,
          Math.max(idealDistance * 0.9, 1.8)
        );
        state.targetLookAt.set(activePlacement.x + sideShiftX, activePlacement.y, 0);
      } else if (activeTourStyle === "inspection") {
        state.targetCamPos.set(
          activePlacement.x + sideShiftX * 0.4,
          activePlacement.y,
          Math.min(idealDistance * 0.6, 1.2)
        );
        state.targetLookAt.set(activePlacement.x + sideShiftX * 0.4, activePlacement.y, 0);
      } else if (activeTourStyle === "walkthrough") {
        state.targetCamPos.set(
          activePlacement.x + sideShiftX,
          1.65,
          Math.max(idealDistance, 2.2)
        );
        state.targetLookAt.set(activePlacement.x + sideShiftX, activePlacement.y, 0);
      } else {
        state.targetCamPos.set(
          activePlacement.x + sideShiftX,
          activePlacement.y,
          idealDistance
        );
        state.targetLookAt.set(activePlacement.x + sideShiftX, activePlacement.y, 0);
      }
    }
  }, [tourStepIdx, isOverview, activeWallIndex, activePlacement, activeTourStyle, cameraTransitionStyle]);

  // Director-Driven Multi-Wall Autoplay Tour Sequencer:
  // Loops across Wall 0 Overview -> Wall 0 pieces -> Wall 1 Overview -> Wall 1 pieces -> ...
  React.useEffect(() => {
    if (!isTourPlaying || tourSequence.length === 0) return;

    const step = tourSequence[tourStepIdx];
    const dwellTime =
      step?.type === "overview"
        ? Math.max(2, overviewDwellSeconds) * 1000
        : Math.max(3, tourSpeedSeconds) * 1000;

    const timer = setTimeout(() => {
      setTourStepIdx((prev) => {
        if (prev >= tourSequence.length - 1) {
          setIsTourPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, dwellTime);

    return () => clearTimeout(timer);
  }, [isTourPlaying, tourStepIdx, tourSequence, overviewDwellSeconds, tourSpeedSeconds]);

  // Handle Canvas Click to Focus Artwork or Return to Wall Overview
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = threeRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    state.raycaster.setFromCamera(new THREE.Vector2(x, y), state.camera);
    const meshes = state.artworkMeshes.map((a) => a.mesh);
    const intersects = state.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = state.artworkMeshes.find((a) => a.mesh === intersects[0].object);
      if (hit) {
        const targetStep = tourSequence.findIndex(
          (s) => s.type === "artwork" && s.artworkIndex === hit.index
        );
        if (targetStep >= 0) {
          setTourStepIdx(targetStep);
          setUserTourStyle("drone");
        }
      }
    } else {
      // Clicked on background wall -> return to overview of the current wall
      const overviewStep = tourSequence.findIndex(
        (s) => s.type === "overview" && s.wallIndex === activeWallIndex
      );
      if (overviewStep >= 0) {
        setTourStepIdx(overviewStep);
      }
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isMounted) {
    return (
      <div className={cn("w-full flex flex-col", className)}>
        <div className="relative w-full rounded-2xl overflow-hidden border border-border/60 bg-stone-950 flex items-center justify-center h-[540px] sm:h-[640px] shadow-2xl">
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
            <span className="text-xs font-serif tracking-widest uppercase text-stone-300">Initializing 3D Exhibition Salon...</span>
          </div>
        </div>
      </div>
    );
  }

  if (validItems.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl border border-dashed border-border/80 flex items-center justify-center text-center p-6 bg-card/40">
        <p className="text-sm font-serif text-muted-foreground">
          No artworks selected for Exhibition Wall. Add items in the inspector.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden border border-border/60 bg-stone-950 select-none shadow-2xl transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "h-[540px] sm:h-[640px]"
        )}
      >
        {/* 3D WebGL Canvas: Edge-to-edge down to the clean floor plane */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer touch-pan-y"
          style={{ touchAction: "pan-y" }}
        />

        {/* Multi-Wall Bay Selector Pills (Visible if more than 1 wall) */}
        {numWalls > 1 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 z-20 pointer-events-auto">
            {Array.from({ length: numWalls }, (_, w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  const targetStep = tourSequence.findIndex(
                    (s) => s.type === "overview" && s.wallIndex === w
                  );
                  if (targetStep >= 0) setTourStepIdx(targetStep);
                }}
                className={cn(
                  "h-7 sm:h-8 px-2.5 sm:px-3 rounded-full text-xs font-serif backdrop-blur-sm transition-all shadow-xs cursor-pointer border",
                  activeWallIndex === w
                    ? "bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-400/40"
                    : "bg-white/70 hover:bg-white/90 text-slate-700 border-slate-300 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 dark:text-slate-300 dark:border-slate-700 font-medium"
                )}
              >
                Wall {w + 1}
              </button>
            ))}
          </div>
        )}

        {/* Synchronized Side-Mounted Artwork Placard on the Gallery Wall - hidden on mobile (< 768px) */}
        {!isOverview && activePlacement && (
          <div
            className={cn(
              "hidden md:block absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2",
              "w-[220px] sm:w-[260px] md:w-[290px]",
              "p-3.5 sm:p-4 rounded-[2px] shadow-2xl",
              "border border-stone-300 dark:border-stone-400 backdrop-blur-md z-20 pointer-events-auto",
              "transition-all duration-500 animate-in fade-in slide-in-from-right-6 isolate [color-scheme:light]"
            )}
            style={{ backgroundColor: "#FFFFFF", color: "#111827" }}
          >
            {/* Subtle Fillet Double Border */}
            <div className="absolute inset-1 border border-amber-600/30 pointer-events-none rounded-[1px]" />

            {/* Top Bar: Category / Traditional School on Left; Artist Name on Right */}
            <div className="relative z-10 flex items-center justify-between border-b border-amber-600/30 pb-1 mb-2">
              <span
                className="font-serif text-[8.5px] sm:text-[9.5px] tracking-wider uppercase font-bold truncate max-w-[130px]"
                style={{ color: "#854D0E" }}
              >
                {activePlacement.item.artwork?.traditionalSchool ||
                  activePlacement.item.artwork?.category?.name ||
                  activePlacement.item.traditionalSchool ||
                  "Fine Art Collection"}
              </span>
              <span
                className="font-serif text-[8.5px] sm:text-[9.5px] tracking-wide font-semibold shrink-0"
                style={{ color: "#374151" }}
              >
                Authentic Archive
              </span>
            </div>

            {/* Title (prominent serif) */}
            <div className="relative z-10 space-y-1">
              <h3
                className="font-serif font-bold text-sm sm:text-base leading-snug italic"
                style={{ color: "#111827" }}
              >
                {activePlacement.item.title || activePlacement.item.artwork?.title || "Exhibition Artwork"}
              </h3>

              {/* Medium */}
              <p
                className="text-[10px] sm:text-[10.5px] font-serif italic leading-tight"
                style={{ color: "#374151" }}
              >
                {activePlacement.item.artwork?.medium ||
                  activePlacement.item.medium ||
                  activePlacement.item.description ||
                  "Original Fine Art"}
              </p>

              {/* Dimensions & Year */}
              <p
                className="text-[8.5px] sm:text-[9px] font-mono leading-tight"
                style={{ color: "#4B5563" }}
              >
                {[
                  activePlacement.item.artwork?.dimensions || activePlacement.item.dimensions,
                  activePlacement.item.artwork?.yearCreated || activePlacement.item.year,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>

            {/* Bottom: QR Code with 'Scan for Provenance' */}
            <div className="relative z-10 mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span
                  className="text-[8px] sm:text-[8.5px] font-serif font-semibold block leading-tight"
                  style={{ color: "#111827" }}
                >
                  Scan for Provenance
                </span>
                <span
                  className="text-[7px] sm:text-[7.5px] block leading-tight"
                  style={{ color: "#4B5563" }}
                >
                  Verified Atelier Archive
                </span>
              </div>
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 p-0.5 rounded border border-stone-300 shadow-xs shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                {sidePlacardQrUrl ? (
                  <img
                    src={sidePlacardQrUrl}
                    alt="Provenance QR"
                    className="w-full h-full object-contain block"
                  />
                ) : (
                  <QrCode className="w-5 h-5 text-stone-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Minimalist Frosted Glass Top-Right Controls: Strictly Touring / Pause & Fullscreen */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-20 pointer-events-auto">
          {/* Play / Pause / Replay Tour Button */}
          {(() => {
            const isTourFinished =
              !isTourPlaying && tourStepIdx >= tourSequence.length - 1 && tourSequence.length > 1;
            return (
              <button
                type="button"
                onClick={() => {
                  if (isTourFinished) {
                    setTourStepIdx(0);
                    setIsTourPlaying(true);
                  } else {
                    setIsTourPlaying((prev) => !prev);
                  }
                }}
                title={
                  isTourFinished
                    ? "Replay Cinematic Walkthrough"
                    : isTourPlaying
                    ? "Pause Cinematic Walkthrough"
                    : "Start Director-Guided Walkthrough"
                }
                className={cn(
                  "h-8 px-3 rounded-full border text-xs font-serif flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-xs cursor-pointer",
                  isTourPlaying
                    ? "bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/40"
                    : "bg-white/70 hover:bg-white/90 text-slate-800 border-slate-300 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700"
                )}
              >
                {isTourFinished ? (
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ) : isTourPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span>{isTourFinished ? "Replay Tour" : isTourPlaying ? "Touring" : "Tour"}</span>
              </button>
            );
          })()}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white/90 text-slate-800 border border-slate-300 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700 flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105 shadow-xs cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Floating Provenance Drawer (Viewport < 768px) */}
        {!isOverview && activePlacement && (
          <div className="md:hidden absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-2xl backdrop-blur-md z-30 flex items-center justify-between gap-3 text-left animate-in fade-in slide-in-from-bottom-2">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">
                {activePlacement.item.artwork?.traditionalSchool || activePlacement.item.traditionalSchool || "Curated Artwork"}
              </span>
              <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 truncate">
                {activePlacement.item.title || activePlacement.item.artwork?.title || "Exhibition Artwork"}
              </h4>
              <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono truncate">
                {[activePlacement.item.artwork?.medium || activePlacement.item.medium, activePlacement.item.artwork?.dimensions || activePlacement.item.dimensions].filter(Boolean).join(" • ")}
              </p>
            </div>
            {(() => {
              const mSlug = activePlacement.item.artwork?.slug || activePlacement.item.slug || (activePlacement.item.linkType === "artwork" ? activePlacement.item.linkTarget : null);
              const mHref = mSlug ? (mSlug.startsWith("/") ? mSlug : `/artwork/${mSlug}`) : activePlacement.item.linkTarget || null;
              return mHref ? (
                <Link
                  href={mHref}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  Details
                </Link>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Artwork details (Title, Medium, Dimensions) rendered below the exhibition container if enabled */}
      {!isFullscreen && showMetadataCardBelowWall && activePlacement && (() => {
        const activeArtwork = activePlacement.item;
        const artworkSlug =
          activeArtwork.artwork?.slug ||
          activeArtwork.slug ||
          (activeArtwork.linkType === "artwork" ? activeArtwork.linkTarget : null);
        const artworkHref = artworkSlug
          ? artworkSlug.startsWith("/")
            ? artworkSlug
            : `/artwork/${artworkSlug}`
          : activeArtwork.linkTarget || null;
        const categoryName =
          activeArtwork.artwork?.category?.name ||
          activeArtwork.artwork?.traditionalSchool ||
          activeArtwork.traditionalSchool ||
          "Curated Work";
        const artworkTitle =
          activeArtwork.artwork?.title || activeArtwork.title || "Curated Artwork";
        const artworkMeta = [
          activeArtwork.artwork?.medium || activeArtwork.medium,
          activeArtwork.artwork?.dimensions || activeArtwork.dimensions,
          activeArtwork.artwork?.yearCreated || activeArtwork.year,
        ]
          .filter(Boolean)
          .join(" • ");
        const artworkDesc =
          activeArtwork.artwork?.description ||
          activeArtwork.description ||
          activeArtwork.caption;

        return (
          <div
            className="w-full max-w-4xl mx-auto mt-6 p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xl transition-all text-left"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] font-mono font-semibold tracking-wider uppercase mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {categoryName}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
                  {artworkTitle}
                </h3>
                {artworkMeta && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-sans flex items-center gap-1.5">
                    {artworkMeta}
                  </p>
                )}
              </div>
              {artworkHref && (
                <Link
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors shrink-0 cursor-pointer"
                  href={artworkHref}
                >
                  View Details
                </Link>
              )}
            </div>
            {artworkDesc && (
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans mt-3 pt-3 border-t border-border/60">
                {stripHtmlTags(artworkDesc)}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
