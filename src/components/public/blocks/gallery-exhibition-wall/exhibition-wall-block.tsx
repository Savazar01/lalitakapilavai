"use client";

import * as React from "react";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
} from "lucide-react";
import { MediaGalleryItem, ArtworkPlacard } from "../media-gallery-block";
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
  customWallUrl?: string;
  cameraTourStyle?: CameraTourStyle;
  wallLayout?: WallLayoutMatrix;
  autoplayTour?: boolean;
  tourSpeedSeconds?: number;
  overviewDwellSeconds?: number;
  showExhibitionBadge?: boolean;
  className?: string;
}

interface ArtworkPlacement {
  item: MediaGalleryItem;
  x: number;
  y: number;
  width: number;
  height: number;
  frameType: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
}

function getHexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return 0;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes architectural salon hanging coordinates replicating the
 * King Charles London School of Arts / Lalita MA Salon Wall.
 */
function computePlacements(
  items: MediaGalleryItem[],
  layout: WallLayoutMatrix = "salon"
): ArtworkPlacement[] {
  if (items.length === 0) return [];

  if (layout === "linear") {
    const spacing = 2.4;
    const startX = -((items.length - 1) * spacing) / 2;
    return items.map((item, idx) => ({
      item,
      x: startX + idx * spacing,
      y: 2.2,
      width: 1.5,
      height: 1.5,
      frameType: idx % 2 === 0 ? "gold-teak" : "light-oak",
    }));
  }

  if (layout === "grid") {
    const cols = Math.min(4, Math.ceil(Math.sqrt(items.length)));
    const colSpacing = 2.2;
    const rowSpacing = 2.0;
    const startX = -((cols - 1) * colSpacing) / 2;
    return items.map((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        item,
        x: startX + col * colSpacing,
        y: 3.2 - row * rowSpacing,
        width: 1.4,
        height: 1.4,
        frameType: idx % 3 === 0 ? "gold-teak" : idx % 3 === 1 ? "rosewood-ivory" : "light-oak",
      };
    });
  }

  // Authentic Salon Hanging Pattern (Lalita MA Gallery Wall)
  // Presets positions for up to 20 masterworks centered around prominent focal pieces.
  const salonSlots: {
    x: number;
    y: number;
    w: number;
    h: number;
    frame: "gold-teak" | "rosewood-ivory" | "light-oak" | "white-float";
  }[] = [
    // 0: Center Primary Focal (Nataraja Tanjore)
    { x: 0, y: 2.5, w: 1.8, h: 1.8, frame: "gold-teak" },
    // 1: Right Primary (Mandala / Sacred Yantra)
    { x: 2.3, y: 2.5, w: 1.7, h: 1.7, frame: "light-oak" },
    // 2: Left Primary (Iconic Floral / Traditional Deity)
    { x: -2.3, y: 2.5, w: 1.4, h: 1.9, frame: "rosewood-ivory" },
    // 3: Below Center (Peacock Gilded Panel)
    { x: 0, y: 0.95, w: 1.5, h: 1.3, frame: "gold-teak" },
    // 4: Above Center (Sacred Folio Top)
    { x: 0, y: 3.9, w: 1.1, h: 0.85, frame: "light-oak" },
    // 5: Above Right (Miniature Folio Top-Right)
    { x: 2.3, y: 3.9, w: 1.1, h: 0.85, frame: "light-oak" },
    // 6: Above Left (Miniature Folio Top-Left)
    { x: -2.3, y: 3.9, w: 1.1, h: 0.85, frame: "light-oak" },
    // 7: Below Right (Elephant Miniature)
    { x: 2.3, y: 0.95, w: 1.1, h: 0.85, frame: "light-oak" },
    // 8: Below Left (Cow & Calf Folio)
    { x: -2.3, y: 0.95, w: 1.1, h: 0.85, frame: "light-oak" },
    // 9: Mid-Left Column Upper (Small Yantra)
    { x: -1.15, y: 2.5, w: 0.65, h: 0.65, frame: "light-oak" },
    // 10: Mid-Left Column Lower (Vertical Miniature)
    { x: -1.15, y: 1.25, w: 0.65, h: 1.1, frame: "light-oak" },
    // 11: Mid-Right Column Upper (Small Yantra)
    { x: 1.15, y: 2.5, w: 0.65, h: 0.65, frame: "light-oak" },
    // 12: Mid-Right Column Lower (Vertical Miniature)
    { x: 1.15, y: 1.25, w: 0.65, h: 1.1, frame: "light-oak" },
    // 13: Right Salon Upper Row 1 (Arched Niche Miniature)
    { x: 4.1, y: 3.3, w: 0.75, h: 0.6, frame: "light-oak" },
    // 14: Right Salon Upper Row 2
    { x: 5.1, y: 3.3, w: 0.75, h: 0.6, frame: "light-oak" },
    // 15: Right Salon Mid Row 1
    { x: 4.1, y: 2.2, w: 0.85, h: 1.1, frame: "light-oak" },
    // 16: Right Salon Mid Row 2
    { x: 5.1, y: 2.2, w: 0.85, h: 1.1, frame: "light-oak" },
    // 17: Right Salon Outer Flank (Blue Deity Miniature)
    { x: 5.8, y: 2.2, w: 0.75, h: 0.75, frame: "light-oak" },
    // 18: Right Salon Lower Row 1
    { x: 4.1, y: 1.15, w: 0.8, h: 0.6, frame: "light-oak" },
    // 19: Right Salon Lower Row 2
    { x: 5.1, y: 1.15, w: 0.8, h: 0.6, frame: "light-oak" },
  ];

  return items.slice(0, 20).map((item, idx) => {
    const slot = salonSlots[idx] || {
      x: -4.0 + (idx % 4) * 1.5,
      y: 2.0,
      w: 1.2,
      h: 1.2,
      frame: "gold-teak",
    };
    return {
      item,
      x: slot.x,
      y: slot.y,
      width: slot.w,
      height: slot.h,
      frameType: slot.frame,
    };
  });
}

export function ExhibitionWallBlock({
  items = [],
  environmentId = "london-school-arts",
  customWallUrl,
  cameraTourStyle = "drone",
  wallLayout = "salon",
  autoplayTour = true,
  tourSpeedSeconds = 5,
  overviewDwellSeconds = 4,
  showExhibitionBadge = true,
  className = "",
}: ExhibitionWallBlockProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Tour Step: -1 represents the Panoramic Overview Wall (all masterworks hung together).
  // 0..(placements.length - 1) represents individual focused artworks.
  const [tourStep, setTourStep] = React.useState<number>(-1);
  const [userTourStyle, setUserTourStyle] = React.useState<CameraTourStyle | null>(null);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = React.useState<number>(0);
  const [isTourPlaying, setIsTourPlaying] = React.useState<boolean>(autoplayTour);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [showBadge, setShowBadge] = React.useState<boolean>(showExhibitionBadge);

  const isOverview = tourStep === -1;
  const activeTourStyle: CameraTourStyle = isOverview
    ? "overview"
    : (userTourStyle ?? (cameraTourStyle === "overview" ? "drone" : cameraTourStyle));

  const validItems = React.useMemo(() => {
    return (items || []).filter((item) => item && typeof item.url === "string" && item.url.trim() !== "");
  }, [items]);

  const placements = React.useMemo(() => {
    return computePlacements(validItems, wallLayout);
  }, [validItems, wallLayout]);

  const activePlacement = placements[selectedArtworkIndex] || placements[0];
  const env: WallEnvironment = React.useMemo(() => {
    const found = getWallEnvironment(environmentId);
    if (environmentId === "custom" && customWallUrl) {
      return { ...found, wallTextureUrl: customWallUrl };
    }
    return found;
  }, [environmentId, customWallUrl]);

  const isLightWall = React.useMemo(() => {
    return getHexLuminance(env.wallBgColor) > 140;
  }, [env.wallBgColor]);

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
    selectedIndex: selectedArtworkIndex,
    tourStyle: activeTourStyle,
  });

  React.useEffect(() => {
    focusRef.current = {
      selectedIndex: selectedArtworkIndex,
      tourStyle: activeTourStyle,
    };
  }, [selectedArtworkIndex, activeTourStyle]);

  // Initialize Three.js WebGL Scene
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || placements.length === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(env.wallBgColor);
    scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.032);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    // Initial camera view: Panoramic Overview Wall
    camera.position.set(0, 2.4, 9.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(env.lightingColor),
      0.9
    );
    scene.add(ambientLight);

    // Directional Ceiling Main Tracking Spotlight
    const spotlight = new THREE.SpotLight(
      new THREE.Color(env.lightingColor),
      env.spotlightIntensity * 28,
      28,
      Math.PI / 4,
      0.45,
      1.3
    );
    spotlight.position.set(0, 5.6, 5.2);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Side Fill Lights for Fine-Art Chiaroscuro Richness
    const leftFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 12, 16);
    leftFill.position.set(-5.0, 4.2, 4.0);
    scene.add(leftFill);

    const rightFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 12, 16);
    rightFill.position.set(5.0, 4.2, 4.0);
    scene.add(rightFill);

    // Per-Artwork Radial Falloff Spotlights (Focused Light Pools)
    const artSpotlights: THREE.SpotLight[] = [];
    placements.forEach((placement) => {
      const artSpot = new THREE.SpotLight(
        new THREE.Color(env.lightingColor),
        env.spotlightIntensity * 14,
        14,
        Math.PI / 5.5,
        0.75, // Soft radial penumbra
        1.5   // Realistic physical decay
      );
      artSpot.position.set(placement.x, 5.4, 2.6);
      artSpot.target.position.set(placement.x, placement.y, 0);
      scene.add(artSpot);
      scene.add(artSpot.target);
      artSpotlights.push(artSpot);
    });

    // Architectural Back Wall
    const wallGeo = new THREE.PlaneGeometry(30, 10);
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 1024;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext("2d")!;
    // Subtle plaster gradient
    const grad = wCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, env.mouldingColor);
    grad.addColorStop(0.06, env.wallBgColor);
    grad.addColorStop(0.94, env.wallBgColor);
    grad.addColorStop(1, env.skirtingColor);
    wCtx.fillStyle = grad;
    wCtx.fillRect(0, 0, 1024, 512);

    // Subtle fine architectural lines
    wCtx.fillStyle = env.mouldingColor;
    wCtx.fillRect(0, 24, 1024, 8);
    wCtx.fillStyle = env.skirtingColor;
    wCtx.fillRect(0, 492, 1024, 20);

    const wallTex = new THREE.CanvasTexture(wallCanvas);

    // Procedural Fine Plaster / Linen Bump Map for Physical Depth
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
    bumpTex.repeat.set(16, 8);

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      bumpMap: bumpTex,
      bumpScale: 0.035,
      roughness: 0.88,
      metalness: 0.05,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 2.5, 0);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // 3D Architectural Crown Moulding Beam along Ceiling
    const crownGeo = new THREE.BoxGeometry(30, 0.28, 0.2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(env.mouldingColor),
      roughness: 0.65,
      metalness: 0.1,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, 5.8, 0.1);
    crownMesh.castShadow = true;
    crownMesh.receiveShadow = true;
    scene.add(crownMesh);

    // 3D Architectural Baseboard / Skirting Mesh along Floor Line
    const skirtingGeo = new THREE.BoxGeometry(30, 0.24, 0.1);
    const skirtingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(env.skirtingColor),
      roughness: 0.7,
      metalness: 0.1,
    });
    const skirtingMesh = new THREE.Mesh(skirtingGeo, skirtingMat);
    skirtingMesh.position.set(0, 0.12, 0.05);
    skirtingMesh.castShadow = true;
    skirtingMesh.receiveShadow = true;
    scene.add(skirtingMesh);

    // Hardwood / Stone Floor Plane
    const floorGeo = new THREE.PlaneGeometry(30, 16);
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext("2d")!;
    fCtx.fillStyle = env.floorBgColor;
    fCtx.fillRect(0, 0, 512, 512);
    // Draw wood plank lines
    fCtx.strokeStyle = "rgba(0, 0, 0, 0.28)";
    fCtx.lineWidth = 2;
    for (let y = 0; y < 512; y += 40) {
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(512, y);
      fCtx.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 4);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.45,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 8);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Build Artwork Meshes & Frames
    const texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = "anonymous";

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

      // Frame Dimensions
      const framePadding = 0.08;
      const frameW = placement.width + framePadding * 2;
      const frameH = placement.height + framePadding * 2;
      const frameDepth = 0.06;

      // Outer Frame Material
      let frameColor = 0xd4af37; // Gold
      let roughness = 0.35;
      let metalness = 0.65;

      if (placement.frameType === "rosewood-ivory") {
        frameColor = 0x3d1f14;
        roughness = 0.5;
        metalness = 0.1;
      } else if (placement.frameType === "light-oak") {
        frameColor = 0xc8ab83;
        roughness = 0.6;
        metalness = 0.05;
      } else if (placement.frameType === "white-float") {
        frameColor = 0xf5f5f5;
        roughness = 0.8;
        metalness = 0.0;
      }

      // Outer Frame Mesh
      const frameGeo = new THREE.BoxGeometry(frameW, frameH, frameDepth);
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

      // Inner Matting Plane
      const matGeo = new THREE.PlaneGeometry(
        placement.width + 0.03,
        placement.height + 0.03
      );
      const matMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        transparent: true,
        opacity: 1.0,
      });
      const matMesh = new THREE.Mesh(matGeo, matMaterial);
      matMesh.position.set(0, 0, frameDepth / 2 + 0.002);
      artGroup.add(matMesh);

      // Canvas Texture Plane
      const canvasGeo = new THREE.PlaneGeometry(placement.width, placement.height);
      const canvasMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.05,
        transparent: true,
        opacity: 1.0,
      });

      // Load texture safely
      texLoader.load(
        placement.item.url,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          canvasMat.map = loadedTex;
          canvasMat.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback if image fails to load
          canvasMat.color.setHex(0x332211);
        }
      );

      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.set(0, 0, frameDepth / 2 + 0.005);
      canvasMesh.castShadow = false;
      canvasMesh.receiveShadow = true;
      artGroup.add(canvasMesh);

      // Museum Placard beside/underneath
      const placardGeo = new THREE.PlaneGeometry(0.25, 0.12);
      const placardMat = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.9,
        transparent: true,
        opacity: 1.0,
      });
      const placardMesh = new THREE.Mesh(placardGeo, placardMat);
      placardMesh.position.set(
        frameW / 2 + 0.16,
        -frameH / 2 + 0.1,
        0.02
      );
      artGroup.add(placardMesh);

      scene.add(artGroup);

      // Save reference for raycasting clicks and opacity fading
      artworkMeshes.push({
        mesh: canvasMesh,
        group: artGroup,
        materials: [frameMat, matMaterial, canvasMat, placardMat],
        placement,
        index: idx,
      });
    });

    const targetCamPos = new THREE.Vector3(0, 2.4, 9.2);
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

      // Smooth camera interpolation (lerp)
      state.camera.position.lerp(state.targetCamPos, Math.min(1, delta * 3.2));
      state.currentLookAt.lerp(state.targetLookAt, Math.min(1, delta * 3.5));
      state.camera.lookAt(state.currentLookAt);

      // Keep main spotlight focused on target
      state.spotlight.target.position.copy(state.currentLookAt);

      // Subtle breathing motion for Curatorial Walkthrough mode
      if (activeTourStyle === "walkthrough") {
        state.camera.position.y += Math.sin(elapsed * 2.2) * 0.0015;
      }

      // Isolated Focus: If not in overview mode, smoothly fade non-target artworks to 0.0 opacity
      // so adjacent frames never clip into the viewport edges
      const { selectedIndex, tourStyle } = focusRef.current;
      const isTourOverview = tourStyle === "overview";
      state.artworkMeshes.forEach((art) => {
        const isTarget = art.index === selectedIndex;
        const targetOpacity = isTourOverview || isTarget ? 1.0 : 0.0;
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
  }, [placements, env, activeTourStyle]);

  // Update Environment Lighting & Color dynamically
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    state.scene.background = new THREE.Color(env.wallBgColor);
    state.scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.032);
    state.ambientLight.color.set(env.lightingColor);
    state.spotlight.color.set(env.lightingColor);
    state.spotlight.intensity = env.spotlightIntensity * 28;
    state.artSpotlights.forEach((s) => {
      s.color.set(env.lightingColor);
      s.intensity = env.spotlightIntensity * 14;
    });
  }, [env]);

  // Camera Target Position Calculator based on Tour Mode and Selected Artwork
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state || !activePlacement) return;

    if (activeTourStyle === "overview") {
      state.targetCamPos.set(0, 2.4, 9.2);
      state.targetLookAt.set(0, 2.4, 0);
    } else {
      // Isolated Focus Framing: Dolly camera directly in front of target piece so it fills ~80% of viewport height
      // with clean 10% margins top and bottom, and 10% margins left and right.
      const frameH = activePlacement.height + 0.16;
      const frameW = activePlacement.width + 0.16;
      const vFovRad = ((state.camera.fov || 50) * Math.PI) / 180;
      const aspect = state.camera.aspect || 1.6;

      const dHeight = (frameH / 0.8) / (2 * Math.tan(vFovRad / 2));
      const dWidth = (frameW / 0.8) / (2 * Math.tan(vFovRad / 2) * aspect);
      const idealDistance = Math.max(dHeight, dWidth, 1.4);

      if (activeTourStyle === "inspection") {
        // Macro archival inspection close-up
        state.targetCamPos.set(
          activePlacement.x,
          activePlacement.y,
          Math.min(idealDistance * 0.6, 1.2)
        );
        state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
      } else if (activeTourStyle === "walkthrough") {
        // First-person eye-level visitor perspective
        state.targetCamPos.set(
          activePlacement.x,
          1.65,
          Math.max(idealDistance, 2.2)
        );
        state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
      } else {
        // Focused Dolly: Centered squarely in front of the artwork at 80% viewport framing
        state.targetCamPos.set(
          activePlacement.x,
          activePlacement.y,
          idealDistance
        );
        state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
      }
    }
  }, [selectedArtworkIndex, activeTourStyle, activePlacement]);

  // Director-Driven Autoplay Tour Sequencer:
  // 1. Begins at Panoramic Overview Wall (dwells for overviewDwellSeconds, default 4s)
  // 2. Smoothly dollies in to Artwork #1 (dwells for tourSpeedSeconds, default 5s)
  // 3. Advances sequentially through all hung masterworks
  // 4. Returns to Panoramic Overview Wall and repeats continuously without visitor intervention!
  React.useEffect(() => {
    if (!isTourPlaying || placements.length === 0) return;

    const dwellTime = tourStep === -1
      ? Math.max(2, overviewDwellSeconds) * 1000
      : Math.max(3, tourSpeedSeconds) * 1000;

    const timer = setTimeout(() => {
      setTourStep((prev) => {
        if (prev === -1) {
          // Transition from Panoramic Overview to first artwork
          setSelectedArtworkIndex(0);
          return 0;
        }
        if (prev + 1 < placements.length) {
          // Transition to next artwork
          setSelectedArtworkIndex(prev + 1);
          return prev + 1;
        }
        // Completed all artworks -> return to Panoramic Overview Wall
        return -1;
      });
    }, dwellTime);

    return () => clearTimeout(timer);
  }, [isTourPlaying, tourStep, placements.length, overviewDwellSeconds, tourSpeedSeconds]);

  // Handle Canvas Click to Focus Artwork
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
        setSelectedArtworkIndex(hit.index);
        setTourStep(hit.index);
        setUserTourStyle("drone");
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

  const handleToggleOverview = () => {
    if (isOverview) {
      setTourStep(selectedArtworkIndex >= 0 ? selectedArtworkIndex : 0);
      setUserTourStyle("drone");
    } else {
      setTourStep(-1);
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
        className={cn(
          "relative w-full rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-950 select-none shadow-2xl transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "h-[540px] sm:h-[640px]"
        )}
      >
        {/* 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer touch-none"
        />

        {/* Top-Left Curatorial Callout Box / Badge with High Contrast */}
        {showBadge && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 max-w-xs sm:max-w-sm z-20 pointer-events-auto transition-all duration-300">
            <div
              className={cn(
                "p-3 sm:p-3.5 rounded-xl shadow-2xl backdrop-blur-md border transition-colors",
                isLightWall
                  ? "bg-white/95 border-amber-600/30 text-slate-900 shadow-amber-950/10"
                  : "bg-stone-950/90 border-amber-400/40 text-stone-100 shadow-black/60"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5",
                    isLightWall ? "text-amber-800" : "text-amber-300"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {isOverview
                    ? "Exhibition Wall • Salon Overview"
                    : `Exhibition Wall • Item ${selectedArtworkIndex + 1} of ${placements.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBadge(false)}
                  title="Dismiss Callout"
                  className={cn(
                    "text-xs p-0.5 rounded-md hover:opacity-100 transition-opacity cursor-pointer",
                    isLightWall ? "text-slate-500 hover:text-slate-900" : "text-stone-400 hover:text-stone-100"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {isOverview ? (
                <div>
                  <h4
                    className={cn(
                      "font-serif font-bold text-xs sm:text-sm leading-tight",
                      isLightWall ? "text-slate-900" : "text-white"
                    )}
                  >
                    {env.name}
                  </h4>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 line-clamp-2",
                      isLightWall ? "text-slate-700" : "text-stone-300"
                    )}
                  >
                    {isTourPlaying
                      ? "Director-Guided Walkthrough Active — Panoramic Wall Overview"
                      : "Click any artwork on the wall or thumbnail strip below to inspect details."}
                  </p>
                </div>
              ) : (
                activePlacement && (
                  <div>
                    <h4
                      className={cn(
                        "font-serif font-bold text-xs sm:text-sm leading-tight",
                        isLightWall ? "text-slate-900" : "text-white"
                      )}
                    >
                      {activePlacement.item.title || "Classical Masterwork Detail"}
                    </h4>
                    {(activePlacement.item.traditionalSchool ||
                      activePlacement.item.medium ||
                      activePlacement.item.dimensions) && (
                      <p
                        className={cn(
                          "text-[11px] mt-0.5 line-clamp-1",
                          isLightWall ? "text-slate-700" : "text-stone-300"
                        )}
                      >
                        {[
                          activePlacement.item.traditionalSchool,
                          activePlacement.item.medium,
                          activePlacement.item.dimensions,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Minimalist High-Contrast Top-Right Floating Actions: Play/Pause tour, Overview & Fullscreen */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-20 pointer-events-auto">
          {/* Info toggle if dismissed */}
          {!showBadge && (
            <button
              type="button"
              onClick={() => setShowBadge(true)}
              title="Show Exhibition Details"
              className="px-2.5 py-1.5 rounded-full bg-stone-950/90 hover:bg-stone-900 border border-amber-500/50 text-amber-300 hover:text-white text-xs font-serif flex items-center gap-1 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Info</span>
            </button>
          )}

          {/* Overview / Focus toggle button */}
          <button
            type="button"
            onClick={handleToggleOverview}
            title={isOverview ? "Focus Selected Artwork" : "View Entire Wall (Salon Overview)"}
            className="px-3 py-1.5 rounded-full bg-stone-950/90 hover:bg-stone-900 border border-amber-500/50 text-amber-300 hover:text-white text-xs font-serif flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            <span>{isOverview ? "Focus Piece" : "Salon View"}</span>
          </button>

          {/* Play / Pause Tour Button with active indicator */}
          <button
            type="button"
            onClick={() => setIsTourPlaying((prev) => !prev)}
            title={isTourPlaying ? "Pause Cinematic Walkthrough" : "Start Director-Guided Walkthrough"}
            className={cn(
              "h-8 px-2.5 rounded-full border text-xs font-serif flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg cursor-pointer",
              isTourPlaying
                ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40"
                : "bg-stone-950/90 hover:bg-stone-900 border-white/20 text-stone-200 hover:text-white"
            )}
          >
            {isTourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden md:inline">{isTourPlaying ? "Touring" : "Tour"}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="w-8 h-8 rounded-full bg-stone-950/90 hover:bg-stone-900 border border-amber-500/50 text-amber-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105 shadow-lg cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Thumbnail Strip for Instant Jump-to-Artwork */}
        <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-20 pointer-events-auto">
          <div className="p-2 rounded-xl bg-stone-950/85 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 shadow-xl">
            {/* Previous chevron */}
            <button
              type="button"
              onClick={() => {
                const nextIdx = (selectedArtworkIndex - 1 + placements.length) % placements.length;
                setSelectedArtworkIndex(nextIdx);
                setTourStep(nextIdx);
                setUserTourStyle("drone");
              }}
              aria-label="Previous artwork"
              className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Thumbnail Rail */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {placements.map((p, idx) => (
                <button
                  key={p.item.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedArtworkIndex(idx);
                    setTourStep(idx);
                    setUserTourStyle("drone");
                  }}
                  className={cn(
                    "relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer group",
                    !isOverview && selectedArtworkIndex === idx
                      ? "border-amber-400 scale-105 shadow-md shadow-amber-500/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  title={p.item.title || `Artwork ${idx + 1}`}
                >
                  <img
                    src={p.item.url}
                    alt={p.item.title || "Thumbnail"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Next chevron */}
            <button
              type="button"
              onClick={() => {
                const nextIdx = (selectedArtworkIndex + 1) % placements.length;
                setSelectedArtworkIndex(nextIdx);
                setTourStep(nextIdx);
                setUserTourStyle("drone");
              }}
              aria-label="Next artwork"
              className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Authentic Museum Placard Rendered CLEANLY BELOW the 3D Canvas Viewport */}
      {!isFullscreen && activePlacement && (
        <ArtworkPlacard item={activePlacement.item} className="mt-3.5" />
      )}
    </div>
  );
}
