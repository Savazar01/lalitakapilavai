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
  QrCode,
} from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import {
  WallEnvironment,
  getWallEnvironment,
} from "./exhibition-environments";
import { cn } from "@/lib/utils";

export type CameraTourStyle = "overview" | "drone" | "walkthrough" | "inspection";
export type WallLayoutMatrix = "salon" | "linear" | "grid";

export interface ExhibitionWallBlockProps {
  items: MediaGalleryItem[];
  environmentId?: string;
  culturalEnvironment?: string;
  customWallUrl?: string;
  customWallBackdropUrl?: string;
  cameraTourStyle?: CameraTourStyle;
  wallLayout?: WallLayoutMatrix;
  autoplayTour?: boolean;
  tourSpeedSeconds?: number;
  overviewDwellSeconds?: number;
  showExhibitionBadge?: boolean;
  maxArtworksPerWall?: number;
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
  frameType: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
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

/**
 * Computes architectural multi-wall corridor coordinates replicating the
 * Classical Fine Art / Salon Wall Architecture.
 * Partitions items across sequential walls (wallSpacing = 14.0).
 */
function computePlacements(
  items: MediaGalleryItem[],
  layout: WallLayoutMatrix = "salon",
  maxPerWall = 4
): ArtworkPlacement[] {
  if (items.length === 0) return [];

  const wallSpacing = 14.0;
  const safeMax = Math.max(2, Math.min(8, maxPerWall));
  const numWalls = Math.ceil(items.length / safeMax);
  const placements: ArtworkPlacement[] = [];

  for (let w = 0; w < numWalls; w++) {
    const wallItems = items.slice(w * safeMax, (w + 1) * safeMax);
    const wallCenterX = w * wallSpacing;

    if (layout === "linear") {
      const count = wallItems.length;
      const spacing = Math.min(2.8, 10.0 / Math.max(1, count - 1 || 1));
      const startX = wallCenterX - ((count - 1) * spacing) / 2;

      wallItems.forEach((item, localIdx) => {
        const globalIdx = w * safeMax + localIdx;
        const ar = parseArtworkAspectRatio(item);
        const { width, height } = calculateFrameSize(ar, 1.6);
        placements.push({
          item,
          x: startX + localIdx * spacing,
          y: 2.3,
          width,
          height,
          wallIndex: w,
          wallCenterX,
          frameType: globalIdx % 2 === 0 ? "gold-teak" : "light-oak",
          index: globalIdx,
        });
      });
    } else if (layout === "grid") {
      const count = wallItems.length;
      const cols = Math.min(count, count > 4 ? 3 : 2);
      const colSpacing = 2.4;
      const rowSpacing = 2.0;
      const startX = wallCenterX - ((cols - 1) * colSpacing) / 2;

      wallItems.forEach((item, localIdx) => {
        const globalIdx = w * safeMax + localIdx;
        const col = localIdx % cols;
        const row = Math.floor(localIdx / cols);
        const ar = parseArtworkAspectRatio(item);
        const { width, height } = calculateFrameSize(ar, 1.45);
        placements.push({
          item,
          x: startX + col * colSpacing,
          y: 3.2 - row * rowSpacing,
          width,
          height,
          wallIndex: w,
          wallCenterX,
          frameType:
            globalIdx % 3 === 0
              ? "gold-teak"
              : globalIdx % 3 === 1
              ? "rosewood-ivory"
              : "light-oak",
          index: globalIdx,
        });
      });
    } else {
      // "salon" layout per wall
      const count = wallItems.length;
      let localSlots: {
        x: number;
        y: number;
        maxDim: number;
        frame: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
      }[] = [];

      if (count === 1) {
        localSlots = [{ x: 0, y: 2.4, maxDim: 2.0, frame: "gold-teak" }];
      } else if (count === 2) {
        localSlots = [
          { x: -1.8, y: 2.4, maxDim: 1.7, frame: "gold-teak" },
          { x: 1.8, y: 2.4, maxDim: 1.7, frame: "rosewood-ivory" },
        ];
      } else if (count === 3) {
        localSlots = [
          { x: 0, y: 2.5, maxDim: 1.8, frame: "gold-teak" },
          { x: -2.3, y: 2.4, maxDim: 1.5, frame: "rosewood-ivory" },
          { x: 2.3, y: 2.4, maxDim: 1.5, frame: "light-oak" },
        ];
      } else if (count === 4) {
        localSlots = [
          { x: 1.5, y: 2.4, maxDim: 1.8, frame: "gold-teak" }, // Right primary focal
          { x: -1.8, y: 3.2, maxDim: 1.3, frame: "light-oak" }, // Left upper
          { x: -1.8, y: 1.6, maxDim: 1.3, frame: "rosewood-ivory" }, // Left lower
          { x: 3.6, y: 2.4, maxDim: 1.1, frame: "white-float" }, // Right flank
        ];
      } else if (count === 5) {
        localSlots = [
          { x: 0, y: 2.5, maxDim: 1.8, frame: "gold-teak" },
          { x: -2.2, y: 3.2, maxDim: 1.2, frame: "light-oak" },
          { x: -2.2, y: 1.6, maxDim: 1.2, frame: "rosewood-ivory" },
          { x: 2.2, y: 3.2, maxDim: 1.2, frame: "light-oak" },
          { x: 2.2, y: 1.6, maxDim: 1.2, frame: "rosewood-ivory" },
        ];
      } else if (count === 6) {
        localSlots = [
          { x: -1.2, y: 3.2, maxDim: 1.3, frame: "gold-teak" },
          { x: 1.2, y: 3.2, maxDim: 1.3, frame: "rosewood-ivory" },
          { x: -1.2, y: 1.6, maxDim: 1.3, frame: "light-oak" },
          { x: 1.2, y: 1.6, maxDim: 1.3, frame: "gold-teak" },
          { x: -3.4, y: 2.4, maxDim: 1.4, frame: "rosewood-ivory" },
          { x: 3.4, y: 2.4, maxDim: 1.4, frame: "light-oak" },
        ];
      } else {
        // 7 or 8 pieces
        localSlots = [
          { x: 0, y: 2.5, maxDim: 1.8, frame: "gold-teak" },
          { x: -2.0, y: 3.3, maxDim: 1.1, frame: "light-oak" },
          { x: -2.0, y: 1.7, maxDim: 1.1, frame: "rosewood-ivory" },
          { x: 2.0, y: 3.3, maxDim: 1.1, frame: "light-oak" },
          { x: 2.0, y: 1.7, maxDim: 1.1, frame: "rosewood-ivory" },
          { x: -3.8, y: 2.5, maxDim: 1.2, frame: "white-float" },
          { x: 3.8, y: 2.5, maxDim: 1.2, frame: "gold-teak" },
          { x: 0, y: 4.1, maxDim: 0.9, frame: "light-oak" },
        ];
      }

      wallItems.forEach((item, localIdx) => {
        const slot = localSlots[localIdx] || {
          x: -3.0 + localIdx * 1.2,
          y: 2.4,
          maxDim: 1.2,
          frame: "gold-teak" as const,
        };
        const globalIdx = w * safeMax + localIdx;
        const ar = parseArtworkAspectRatio(item);
        const { width, height } = calculateFrameSize(ar, slot.maxDim);
        placements.push({
          item,
          x: wallCenterX + slot.x,
          y: slot.y,
          width,
          height,
          wallIndex: w,
          wallCenterX,
          frameType: slot.frame,
          index: globalIdx,
        });
      });
    }
  }

  return placements;
}

export function ExhibitionWallBlock({
  items = [],
  environmentId = "london-school-arts",
  culturalEnvironment,
  customWallUrl,
  customWallBackdropUrl,
  cameraTourStyle = "drone",
  wallLayout = "salon",
  autoplayTour = true,
  tourSpeedSeconds = 5,
  overviewDwellSeconds = 4,
  showExhibitionBadge: _showExhibitionBadge = true,
  maxArtworksPerWall = 4,
  className = "",
}: ExhibitionWallBlockProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const activeEnvId = culturalEnvironment || environmentId || "london-school-arts";
  const activeCustomWallUrl = customWallBackdropUrl || customWallUrl;
  const isCustomBackdrop =
    (activeEnvId === "custom" || activeEnvId.toLowerCase().includes("custom")) &&
    !!activeCustomWallUrl;

  const validItems = React.useMemo(() => {
    return (items || []).filter((item) => item && typeof item.url === "string" && item.url.trim() !== "");
  }, [items]);

  const placements = React.useMemo(() => {
    return computePlacements(validItems, wallLayout, maxArtworksPerWall);
  }, [validItems, wallLayout, maxArtworksPerWall]);

  const safeMax = Math.max(2, Math.min(8, maxArtworksPerWall));
  const numWalls = Math.max(1, Math.ceil(validItems.length / safeMax));

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
    wallMesh: THREE.Mesh;
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
    camera.position.set(0, 2.4, 9.2);

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
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(env.lightingColor),
      0.85
    );
    scene.add(ambientLight);

    // Directional Ceiling Main Tracking Spotlight
    const spotlight = new THREE.SpotLight(
      new THREE.Color(env.lightingColor),
      env.spotlightIntensity * 12,
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
    const wallSpacing = 14.0;
    const corridorLength = Math.max(34, (numWalls - 1) * wallSpacing + 34);
    const corridorCenterX = ((numWalls - 1) * wallSpacing) / 2;

    // Side Fill Lights per wall bay for rich chiaroscuro depth
    for (let w = 0; w < numWalls; w++) {
      const bayX = w * wallSpacing;
      const leftFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 6, 16);
      leftFill.position.set(bayX - 5.0, 4.2, 4.0);
      scene.add(leftFill);

      const rightFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 6, 16);
      rightFill.position.set(bayX + 5.0, 4.2, 4.0);
      scene.add(rightFill);
    }

    // Per-Artwork Radial Falloff Spotlights (Focused Light Pools)
    const artSpotlights: THREE.SpotLight[] = [];
    placements.forEach((placement) => {
      const artSpot = new THREE.SpotLight(
        new THREE.Color(env.lightingColor),
        env.spotlightIntensity * 6,
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

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      bumpMap: bumpTex,
      bumpScale: 0.04,
      roughness: 0.92,
      metalness: 0.02,
      transparent: isCustomBackdrop,
      opacity: isCustomBackdrop ? 0.88 : 1.0,
    });

    if (env.wallTextureUrl) {
      texLoader.load(
        env.wallTextureUrl,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.wrapS = THREE.RepeatWrapping;
          loadedTex.wrapT = THREE.ClampToEdgeWrapping;
          wallMat.map = loadedTex;
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
    scene.add(skirtingMesh);

    // Architectural Divider Pilasters between Wall Bays
    if (numWalls > 1) {
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

      for (let w = 0; w < numWalls - 1; w++) {
        const dividerX = w * wallSpacing + wallSpacing / 2;
        const pilasterGeo = new THREE.BoxGeometry(0.38, 5.8, 0.18);
        const pilasterMesh = new THREE.Mesh(pilasterGeo, pilasterMat);
        pilasterMesh.position.set(dividerX, 2.9, 0.09);
        pilasterMesh.castShadow = true;
        pilasterMesh.receiveShadow = true;
        scene.add(pilasterMesh);

        // Gilded accent fillet capital
        const capGeo = new THREE.BoxGeometry(0.5, 0.12, 0.22);
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set(dividerX, 5.75, 0.11);
        scene.add(capMesh);
      }
    }

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
    scene.add(floorMesh);

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
      let roughness = 0.35;
      let metalness = 0.65;

      if (placement.frameType === "rosewood-ivory") {
        frameColor = 0x3d1f14;
        roughness = 0.48;
        metalness = 0.12;
      } else if (placement.frameType === "light-oak") {
        frameColor = 0xc8ab83;
        roughness = 0.58;
        metalness = 0.06;
      } else if (placement.frameType === "white-float") {
        frameColor = 0xf5f5f3;
        roughness = 0.75;
        metalness = 0.0;
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

      scene.add(artGroup);

      artworkMeshes.push({
        mesh: canvasMesh,
        group: artGroup,
        materials: [frameMat, filletMat, matMaterial, canvasMat, shadowMat],
        placement,
        index: idx,
      });
    });

    const targetCamPos = new THREE.Vector3(0, 2.4, 8.8);
    const targetLookAt = new THREE.Vector3(0, 2.4, 0);
    const currentLookAt = new THREE.Vector3(0, 2.4, 0);
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
      wallMesh,
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

      // Smooth camera interpolation
      state.camera.position.lerp(state.targetCamPos, Math.min(1, delta * 3.2));
      state.currentLookAt.lerp(state.targetLookAt, Math.min(1, delta * 3.5));
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
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, Math.min(1, delta * 5.0));
            mat.visible = mat.opacity > 0.01;
          }
        });
      });

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
  }, [placements, env, activeTourStyle, isCustomBackdrop, numWalls]);

  // Update Environment Lighting dynamically
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    if (isCustomBackdrop) {
      state.scene.background = null;
      state.renderer.setClearColor(0x000000, 0);
    } else {
      state.scene.background = new THREE.Color(env.wallBgColor);
      state.scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.032);
    }
    state.ambientLight.color.set(env.lightingColor);
    state.ambientLight.intensity = 0.85;
    state.spotlight.color.set(env.lightingColor);
    state.spotlight.intensity = env.spotlightIntensity * 12;
    state.artSpotlights.forEach((s) => {
      s.color.set(env.lightingColor);
      s.intensity = env.spotlightIntensity * 6;
    });
  }, [env, isCustomBackdrop]);

  // Camera Target Position Calculator based on Tour Mode and Selected Artwork/Wall
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    if (isOverview) {
      const wallCenterX = activeWallIndex * 14.0;
      state.targetCamPos.set(wallCenterX, 2.4, 8.8);
      state.targetLookAt.set(wallCenterX, 2.4, 0);
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

      if (activeTourStyle === "inspection") {
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
  }, [tourStepIdx, isOverview, activeWallIndex, activePlacement, activeTourStyle]);

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
      setTourStepIdx((prev) => (prev + 1) % tourSequence.length);
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
        style={
          isCustomBackdrop
            ? {
                backgroundImage: `url("${activeCustomWallUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
        className={cn(
          "relative w-full rounded-2xl overflow-hidden border border-border/60 bg-stone-950 select-none shadow-2xl transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "h-[540px] sm:h-[640px]"
        )}
      >
        {/* 3D WebGL Canvas: Edge-to-edge down to the clean floor plane */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer touch-none"
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
                  "Traditional Indian Art"}
              </span>
              <span
                className="font-serif text-[8.5px] sm:text-[9.5px] tracking-wide font-semibold shrink-0"
                style={{ color: "#374151" }}
              >
                Master Artist
              </span>
            </div>

            {/* Title (prominent serif) */}
            <div className="relative z-10 space-y-1">
              <h3
                className="font-serif font-bold text-sm sm:text-base leading-snug italic"
                style={{ color: "#111827" }}
              >
                {activePlacement.item.title || activePlacement.item.artwork?.title || "Masterwork"}
              </h3>

              {/* Medium */}
              <p
                className="text-[10px] sm:text-[10.5px] font-serif italic leading-tight"
                style={{ color: "#374151" }}
              >
                {activePlacement.item.artwork?.medium ||
                  activePlacement.item.medium ||
                  activePlacement.item.description ||
                  "22k Gold Foil, Gesso, Teak Wood"}
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
          {/* Play / Pause Tour Button */}
          <button
            type="button"
            onClick={() => setIsTourPlaying((prev) => !prev)}
            title={isTourPlaying ? "Pause Cinematic Walkthrough" : "Start Director-Guided Walkthrough"}
            className={cn(
              "h-8 px-3 rounded-full border text-xs font-serif flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-xs cursor-pointer",
              isTourPlaying
                ? "bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/40"
                : "bg-white/70 hover:bg-white/90 text-slate-800 border-slate-300 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700"
            )}
          >
            {isTourPlaying ? (
              <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>{isTourPlaying ? "Touring" : "Tour"}</span>
          </button>

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
      </div>

      {/* Artwork details (Title, Medium, Dimensions) ONLY rendered below the exhibition container in standard HTML flow */}
      {!isFullscreen && activePlacement && (() => {
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
          activeArtwork.artwork?.title || activeArtwork.title || "Curated Masterwork";
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
            className="w-full max-w-4xl mx-auto mt-6 p-6 rounded-xl border border-stone-200/90 shadow-xl transition-all text-left isolate [color-scheme:light]"
            style={{ backgroundColor: "#FFFFFF", color: "#111827" }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold tracking-widest uppercase text-amber-800 block">
                  {categoryName}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-950 mt-1">
                  {artworkTitle}
                </h3>
                {artworkMeta && (
                  <p className="text-sm text-stone-600 mt-1 font-serif">
                    {artworkMeta}
                  </p>
                )}
              </div>
              {artworkHref && (
                <Link
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-serif font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-800 transition-colors shrink-0 cursor-pointer shadow-xs"
                  href={artworkHref}
                >
                  View Details
                </Link>
              )}
            </div>
            {artworkDesc && (
              <p className="text-sm text-stone-700 mt-4 pt-4 border-t border-stone-200/90 leading-relaxed font-sans">
                {artworkDesc}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
