"use client";

import * as React from "react";
import * as THREE from "three";
import Link from "next/link";
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  ZoomIn,
} from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import {
  WALL_ENVIRONMENTS,
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
  tourSpeedSeconds = 7,
  className = "",
}: ExhibitionWallBlockProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [activeTourStyle, setActiveTourStyle] = React.useState<CameraTourStyle>(cameraTourStyle);
  const [activeEnvId, setActiveEnvId] = React.useState<string>(environmentId);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = React.useState<number>(0);
  const [isTourPlaying, setIsTourPlaying] = React.useState<boolean>(autoplayTour);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  const validItems = React.useMemo(() => {
    return (items || []).filter((item) => item && typeof item.url === "string" && item.url.trim() !== "");
  }, [items]);

  const placements = React.useMemo(() => {
    return computePlacements(validItems, wallLayout);
  }, [validItems, wallLayout]);

  const activePlacement = placements[selectedArtworkIndex] || placements[0];
  const env: WallEnvironment = React.useMemo(() => {
    const found = getWallEnvironment(activeEnvId);
    if (activeEnvId === "custom" && customWallUrl) {
      return { ...found, wallTextureUrl: customWallUrl };
    }
    return found;
  }, [activeEnvId, customWallUrl]);

  // Three.js internal references
  const threeRef = React.useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    artworkMeshes: { mesh: THREE.Mesh; placement: ArtworkPlacement; index: number }[];
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    spotlight: THREE.SpotLight;
    ambientLight: THREE.AmbientLight;
    wallMesh: THREE.Mesh;
    animationId: number;
    clock: THREE.Clock;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
  } | null>(null);

  // Initialize Three.js WebGL Scene
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || placements.length === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(env.wallBgColor);
    scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    // Initial camera view
    camera.position.set(0, 2.4, 8.8);

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
    renderer.toneMappingExposure = 1.05;

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(env.lightingColor),
      0.85
    );
    scene.add(ambientLight);

    // Directional Ceiling Track Spotlights
    const spotlight = new THREE.SpotLight(
      new THREE.Color(env.lightingColor),
      env.spotlightIntensity * 25,
      25,
      Math.PI / 4,
      0.35,
      1.2
    );
    spotlight.position.set(0, 5.2, 5.0);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Additional side fill lights for fine-art exhibition richness
    const leftFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 10, 15);
    leftFill.position.set(-4.5, 4.0, 3.5);
    scene.add(leftFill);

    const rightFill = new THREE.PointLight(new THREE.Color(env.lightingColor), 10, 15);
    rightFill.position.set(4.5, 4.0, 3.5);
    scene.add(rightFill);

    // Architectural Back Wall
    const wallGeo = new THREE.PlaneGeometry(28, 9);
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 1024;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext("2d")!;
    // Subtle plaster gradient with top crown moulding & baseboard
    const grad = wCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, env.mouldingColor);
    grad.addColorStop(0.08, env.wallBgColor);
    grad.addColorStop(0.92, env.wallBgColor);
    grad.addColorStop(1, env.skirtingColor);
    wCtx.fillStyle = grad;
    wCtx.fillRect(0, 0, 1024, 512);

    // Architectural Moulding line
    wCtx.fillStyle = env.mouldingColor;
    wCtx.fillRect(0, 30, 1024, 12);
    wCtx.fillStyle = env.skirtingColor;
    wCtx.fillRect(0, 485, 1024, 27);

    const wallTex = new THREE.CanvasTexture(wallCanvas);
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 2.5, 0);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // Hardwood Floor Plane
    const floorGeo = new THREE.PlaneGeometry(28, 16);
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext("2d")!;
    fCtx.fillStyle = env.floorBgColor;
    fCtx.fillRect(0, 0, 512, 512);
    // Draw wood plank lines
    fCtx.strokeStyle = "rgba(0, 0, 0, 0.25)";
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

      // Museum Placard (beside or underneath)
      const placardGeo = new THREE.PlaneGeometry(0.25, 0.12);
      const placardMat = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.9,
      });
      const placardMesh = new THREE.Mesh(placardGeo, placardMat);
      placardMesh.position.set(
        frameW / 2 + 0.16,
        -frameH / 2 + 0.1,
        0.02
      );
      artGroup.add(placardMesh);

      scene.add(artGroup);

      // Save reference for raycasting clicks
      artworkMeshes.push({
        mesh: canvasMesh,
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

      // Keep spotlight focused on target artwork
      state.spotlight.target.position.copy(state.targetLookAt);

      // Subtle breathing motion for Curatorial Walkthrough mode
      if (activeTourStyle === "walkthrough") {
        state.camera.position.y += Math.sin(elapsed * 2.2) * 0.0015;
      }

      state.renderer.render(state.scene, state.camera);
      state.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 560;
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
    state.scene.fog = new THREE.FogExp2(new THREE.Color(env.wallBgColor), 0.035);
    state.ambientLight.color.set(env.lightingColor);
    state.spotlight.color.set(env.lightingColor);
    state.spotlight.intensity = env.spotlightIntensity * 25;
  }, [env]);

  // Camera Target Position Calculator based on Tour Mode and Selected Artwork
  React.useEffect(() => {
    const state = threeRef.current;
    if (!state || !activePlacement) return;

    if (activeTourStyle === "overview") {
      state.targetCamPos.set(0, 2.4, 9.0);
      state.targetLookAt.set(0, 2.4, 0);
    } else if (activeTourStyle === "drone") {
      // Smooth drone dolly into the artwork
      state.targetCamPos.set(
        activePlacement.x * 0.85,
        activePlacement.y + 0.15,
        3.2
      );
      state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
    } else if (activeTourStyle === "walkthrough") {
      // First-person eye-level visitor perspective
      state.targetCamPos.set(
        activePlacement.x,
        1.65, // Standard eye-level 1.65m
        2.6
      );
      state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
    } else if (activeTourStyle === "inspection") {
      // Macro archival inspection close-up
      state.targetCamPos.set(
        activePlacement.x,
        activePlacement.y,
        1.4
      );
      state.targetLookAt.set(activePlacement.x, activePlacement.y, 0);
    }
  }, [selectedArtworkIndex, activeTourStyle, activePlacement]);

  // Autoplay Tour Sequencer
  React.useEffect(() => {
    if (!isTourPlaying || placements.length <= 1 || activeTourStyle === "overview") return;

    const interval = setInterval(() => {
      setSelectedArtworkIndex((prev) => (prev + 1) % placements.length);
    }, Math.max(3, tourSpeedSeconds) * 1000);

    return () => clearInterval(interval);
  }, [isTourPlaying, placements.length, activeTourStyle, tourSpeedSeconds]);

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
        if (activeTourStyle === "overview") {
          setActiveTourStyle("drone");
        }
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
    <div
      ref={containerRef}
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-stone-950 select-none shadow-2xl transition-all duration-300",
        isFullscreen ? "h-screen w-screen rounded-none border-none" : "h-[540px] sm:h-[640px]",
        className
      )}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer touch-none"
      />

      {/* Top Floating Curatorial Bar */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-5 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Environment Badge */}
          <div className="px-3 py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-serif font-bold shadow-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{env.name}</span>
            <span className="sm:hidden">{env.name.split(" ")[0]}</span>
          </div>

          {/* Environment Switcher Quick Menu */}
          <div className="hidden md:flex items-center gap-1 bg-stone-950/80 backdrop-blur-md p-1 rounded-full border border-white/10 text-[11px]">
            {WALL_ENVIRONMENTS.slice(0, 5).map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setActiveEnvId(e.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full font-serif transition-colors cursor-pointer",
                  activeEnvId === e.id
                    ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                    : "text-stone-300 hover:text-white"
                )}
              >
                {e.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right Controls: Tour Style, Play/Pause, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Tour Style Selector */}
          <div className="bg-stone-950/85 backdrop-blur-md p-1 rounded-full border border-white/15 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTourStyle("overview")}
              title="Overview Salon View"
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer",
                activeTourStyle === "overview"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-stone-300 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTourStyle("drone")}
              title="Drone Glide Pan & Zoom"
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer",
                activeTourStyle === "drone"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-stone-300 hover:text-white"
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Drone Pan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTourStyle("walkthrough")}
              title="Curatorial Eye-Level Walkthrough"
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer",
                activeTourStyle === "walkthrough"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-stone-300 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Visitor Walk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTourStyle("inspection")}
              title="Archival 22k Gold Macro Inspection"
              className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer",
                activeTourStyle === "inspection"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-stone-300 hover:text-white"
              )}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Macro Detail</span>
            </button>
          </div>

          {/* Play / Pause Tour Button */}
          <button
            type="button"
            onClick={() => setIsTourPlaying((prev) => !prev)}
            title={isTourPlaying ? "Pause Cinematic Tour" : "Play Cinematic Tour"}
            className="w-8 h-8 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-white/15 text-amber-300 flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
          >
            {isTourPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="w-8 h-8 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-white/15 text-stone-200 hover:text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Curatorial Card when an artwork is focused */}
      {activeTourStyle !== "overview" && activePlacement && (
        <div className="absolute top-16 left-4 sm:left-6 max-w-sm z-20 pointer-events-auto">
          <div className="p-3.5 rounded-xl bg-stone-950/85 backdrop-blur-md border border-amber-500/30 text-stone-100 shadow-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Exhibition Wall • Item {selectedArtworkIndex + 1} of {placements.length}
            </span>
            <h4 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
              {activePlacement.item.title || "Traditional Fine Art Masterwork"}
            </h4>
            {activePlacement.item.caption && (
              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                {activePlacement.item.caption}
              </p>
            )}
            {activePlacement.item.linkTarget && (
              <div className="pt-1.5">
                <Link
                  href={
                    activePlacement.item.linkTarget.startsWith("/")
                      ? activePlacement.item.linkTarget
                      : `/artwork/${activePlacement.item.linkTarget}`
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
                >
                  <span>Examine Provenance</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Thumbnail Strip for Instant Jump-to-Artwork */}
      <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-20 pointer-events-auto">
        <div className="p-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 shadow-xl">
          {/* Previous / Next chevrons */}
          <button
            type="button"
            onClick={() =>
              setSelectedArtworkIndex((prev) => (prev - 1 + placements.length) % placements.length)
            }
            aria-label="Previous artwork"
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer"
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
                  if (activeTourStyle === "overview") setActiveTourStyle("drone");
                }}
                className={cn(
                  "relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer group",
                  selectedArtworkIndex === idx
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

          <button
            type="button"
            onClick={() => setSelectedArtworkIndex((prev) => (prev + 1) % placements.length)}
            aria-label="Next artwork"
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
