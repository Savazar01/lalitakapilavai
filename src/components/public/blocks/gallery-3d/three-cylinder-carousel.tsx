"use client";

import * as React from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import { cn } from "@/lib/utils";

interface ThreeCylinderCarouselProps {
  items: MediaGalleryItem[];
  autoplayTimer?: number;
  aspectRatio?: string;
  frameStyle?: string;
  className?: string;
}

export function ThreeCylinderCarousel({
  items,
  autoplayTimer = 5,
  aspectRatio = "landscape",
  className = "",
}: ThreeCylinderCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  // References for Three.js state
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const cylinderGroupRef = React.useRef<THREE.Group | null>(null);
  const targetRotationRef = React.useRef<number>(0);
  const currentRotationRef = React.useRef<number>(0);
  const animFrameIdRef = React.useRef<number | null>(null);

  const totalItems = items.length;
  const angleStep = totalItems > 0 ? (Math.PI * 2) / totalItems : 0;

  // Initialize Three.js Scene
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || totalItems === 0) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7e6, 1.2);
    scene.add(ambientLight);

    const warmSpotlight = new THREE.SpotLight(0xd4af37, 2.5, 20, Math.PI / 4, 0.4);
    warmSpotlight.position.set(0, 5, 8);
    scene.add(warmSpotlight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Group for all carousel planes
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);
    cylinderGroupRef.current = cylinderGroup;

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    const radius = Math.max(3.8, totalItems * 0.7);

    // Create cards for each item
    const meshes: THREE.Mesh[] = [];
    const cardWidth = 3.6;
    const cardHeight = aspectRatio === "portrait" ? 4.2 : aspectRatio === "square" ? 3.6 : 2.5;

    items.forEach((item, idx) => {
      const angle = idx * angleStep;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 16, 16);

      // Default material while texture loads
      const material = new THREE.MeshStandardMaterial({
        color: 0x221f1c,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });

      textureLoader.load(item.url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        material.map = texture;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = angle;
      mesh.userData = { index: idx, item };

      cylinderGroup.add(mesh);
      meshes.push(mesh);
    });

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    const animate = () => {
      // Smooth inertia dampening toward target rotation
      currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.08;
      if (cylinderGroupRef.current) {
        cylinderGroupRef.current.rotation.y = currentRotationRef.current;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      meshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      });
    };
  }, [items, totalItems, angleStep, aspectRatio]);

  // Rotate to active index
  React.useEffect(() => {
    targetRotationRef.current = -activeIndex * angleStep;
  }, [activeIndex, angleStep]);

  // Autoplay timer
  React.useEffect(() => {
    if (isDragging || autoplayTimer <= 0 || totalItems <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalItems);
    }, autoplayTimer * 1000);
    return () => clearInterval(interval);
  }, [isDragging, autoplayTimer, totalItems]);

  // Drag interaction
  const dragStartXRef = React.useRef<number>(0);
  const dragStartRotationRef = React.useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartRotationRef.current = targetRotationRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    targetRotationRef.current = dragStartRotationRef.current + deltaX * 0.005;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest item
    const currentRot = targetRotationRef.current;
    const nearestIndex = Math.round(-currentRot / angleStep);
    const normalizedIndex = ((nearestIndex % totalItems) + totalItems) % totalItems;
    setActiveIndex(normalizedIndex);
  };

  const activeItem = items[activeIndex] || items[0];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-stone-950 select-none shadow-2xl group",
        className
      )}
      style={{ height: aspectRatio === "portrait" ? "580px" : "480px" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Badge: 3D Exhibition Carousel */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          3D Cylindrical Exhibition Carousel
        </span>
      </div>

      {/* Slide Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Placard for Active Slide */}
      {activeItem && (
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-12 z-20 pointer-events-none">
          <div className="p-4 sm:p-5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Masterwork Plate {activeIndex + 1} of {totalItems}
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white leading-tight">
                {activeItem.title || activeItem.alt || "Classical Fine Art"}
              </h4>
              {activeItem.caption && (
                <p className="text-xs text-stone-300 line-clamp-1 max-w-xl">{activeItem.caption}</p>
              )}
            </div>

            {activeItem.linkTarget && (
              <a
                href={activeItem.linkTarget.startsWith("/") ? activeItem.linkTarget : `/artwork/${activeItem.linkTarget}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold pointer-events-auto transition-colors self-start sm:self-auto"
              >
                <span>View Masterwork</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
