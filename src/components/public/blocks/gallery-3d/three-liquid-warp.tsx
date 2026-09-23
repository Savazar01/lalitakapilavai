"use client";

import * as React from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, Waves, ExternalLink } from "lucide-react";
import { MediaGalleryItem } from "../media-gallery-block";
import { cn } from "@/lib/utils";

interface ThreeLiquidWarpProps {
  items: MediaGalleryItem[];
  autoplayTimer?: number;
  aspectRatio?: string;
  frameStyle?: string;
  className?: string;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Wave displacement calculation
    float wavePhase = uProgress * 3.14159265;
    float waveIntensity = sin(wavePhase) * 0.08;
    
    // Fluid ripple distortion vectors
    vec2 waveDir = vec2(
      sin(uv.y * 12.0 + uTime * 2.5),
      cos(uv.x * 12.0 + uTime * 2.5)
    );
    
    vec2 distortedUv1 = uv + waveDir * waveIntensity * (1.0 - uProgress);
    vec2 distortedUv2 = uv - waveDir * waveIntensity * uProgress;
    
    vec4 color1 = texture2D(uTexture1, distortedUv1);
    vec4 color2 = texture2D(uTexture2, distortedUv2);
    
    // Specular highlight ripple in the center of the wave
    float sheen = sin(wavePhase) * 0.15 * smoothstep(0.4, 0.6, abs(sin(uv.x * 10.0 + uv.y * 10.0 + uTime * 4.0)));
    vec4 goldSheen = vec4(0.83, 0.68, 0.21, 1.0) * sheen;
    
    vec4 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, uProgress)) + goldSheen;
    gl_FragColor = finalColor;
  }
`;

export function ThreeLiquidWarp({
  items,
  autoplayTimer = 5,
  aspectRatio = "landscape",
  className = "",
}: ThreeLiquidWarpProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [nextIndex, setNextIndex] = React.useState<number>(1);
  const [isTransitioning, setIsTransitioning] = React.useState<boolean>(false);

  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = React.useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = React.useRef<Map<string, THREE.Texture>>(new Map());
  const progressRef = React.useRef<number>(0);
  const animFrameIdRef = React.useRef<number | null>(null);

  const totalItems = items.length;

  // Pre-load textures into map
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    items.forEach((item) => {
      if (!texturesRef.current.has(item.url)) {
        loader.load(item.url, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          texturesRef.current.set(item.url, tex);
          // If first texture loads, update material
          if (items[0]?.url === item.url && materialRef.current) {
            materialRef.current.uniforms.uTexture1.value = tex;
            materialRef.current.uniforms.uTexture2.value = tex;
          }
        });
      }
    });
  }, [items]);

  // Setup WebGL Scene
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create 1x1 quad covering orthographic clip space
    const geometry = new THREE.PlaneGeometry(2, 2);

    const initialTex = texturesRef.current.get(items[0]?.url) || new THREE.Texture();
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture1: { value: initialTex },
        uTexture2: { value: initialTex },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
      },
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const startTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsed;

        if (isTransitioning) {
          progressRef.current += 0.025;
          if (progressRef.current >= 1.0) {
            progressRef.current = 1.0;
            materialRef.current.uniforms.uProgress.value = 1.0;
            // Finish transition: texture2 becomes texture1
            setCurrentIndex(nextIndex);
            setIsTransitioning(false);
          } else {
            materialRef.current.uniforms.uProgress.value = progressRef.current;
          }
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [items, isTransitioning, nextIndex]);

  // Trigger transition to a target index
  const transitionTo = React.useCallback(
    (targetIdx: number) => {
      if (isTransitioning || targetIdx === currentIndex || totalItems <= 1) return;

      const currentItem = items[currentIndex];
      const targetItem = items[targetIdx];

      const tex1 = texturesRef.current.get(currentItem?.url);
      const tex2 = texturesRef.current.get(targetItem?.url);

      if (materialRef.current && tex1 && tex2) {
        materialRef.current.uniforms.uTexture1.value = tex1;
        materialRef.current.uniforms.uTexture2.value = tex2;
        materialRef.current.uniforms.uProgress.value = 0.0;
        progressRef.current = 0.0;
        setNextIndex(targetIdx);
        setIsTransitioning(true);
      } else {
        // Fallback immediate index switch if textures pending
        setCurrentIndex(targetIdx);
      }
    },
    [currentIndex, isTransitioning, items, totalItems]
  );

  // Autoplay timer
  React.useEffect(() => {
    if (autoplayTimer <= 0 || totalItems <= 1) return;
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % totalItems;
      transitionTo(next);
    }, autoplayTimer * 1000);
    return () => clearInterval(interval);
  }, [autoplayTimer, currentIndex, totalItems, transitionTo]);

  const activeItem = items[currentIndex] || items[0];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-stone-950 select-none shadow-2xl group",
        className
      )}
      style={{ height: aspectRatio === "portrait" ? "560px" : aspectRatio === "square" ? "480px" : "440px" }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Badge: Liquid Displacement */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
          <Waves className="w-3.5 h-3.5 text-amber-400" />
          WebGL Liquid Displacement Warp
        </span>
      </div>

      {/* Slide Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => transitionTo((currentIndex - 1 + totalItems) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer disabled:opacity-50"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => transitionTo((currentIndex + 1) % totalItems)}
          className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-stone-900 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer disabled:opacity-50"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Caption Placard */}
      {activeItem && (
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-12 z-20 pointer-events-none">
          <div className="p-4 sm:p-5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Artwork Plate {currentIndex + 1} of {totalItems}
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
