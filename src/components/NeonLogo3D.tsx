import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Palette, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface NeonLogo3DProps {
  lang: Language;
}

// Neon Color Presets
const COLOR_PRESETS = [
  {
    name: 'Cyberpunk Pink & Cyan',
    primary: 0xff007f, // Hot Magenta
    secondary: 0x00f0ff, // Electric Cyan
    accent: 0xffeb3b, // Golden Spark
    bg: 0x080812,
  },
  {
    name: 'Gold & Amber Luxury',
    primary: 0xffb703, // Bright Gold
    secondary: 0xfb8500, // Rich Amber
    accent: 0xffffff, // Crisp White
    bg: 0x0e0a05,
  },
  {
    name: 'Emerald & Teal Neon',
    primary: 0x39ff14, // Neon Green
    secondary: 0x00f5d4, // Electric Teal
    accent: 0xf72585, // Neon Violet
    bg: 0x040e0b,
  },
  {
    name: 'Ultra Violet Night',
    primary: 0x9d4edd, // Bright Purple
    secondary: 0xff006e, // Neon Pink
    accent: 0x3a86ff, // Royal Blue
    bg: 0x090514,
  },
];

export const NeonLogo3D: React.FC<NeonLogo3DProps> = ({ lang }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHumSound, setIsHumSound] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);

  // Drag & Inertia state
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: 0 });
  const currentRotationRef = useRef({ x: 0.15, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  // Entry Animation Progress (0 -> 1)
  const entryProgressRef = useRef(0);

  useEffect(() => {
    entryProgressRef.current = 0;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const preset = COLOR_PRESETS[colorIndex];

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(preset.bg);
    scene.fog = new THREE.FogExp2(preset.bg, 0.04);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, (width || 360) / (height || 360), 0.1, 1000);
    camera.position.set(0, 0, 11);

    // 3. Renderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, falling back:', e);
      return;
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Colored Neon Point Lights
    const primaryLight = new THREE.PointLight(preset.primary, 8.0, 18);
    primaryLight.position.set(-3, 2, 4);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(preset.secondary, 8.0, 18);
    secondaryLight.position.set(3, -2, 4);
    scene.add(secondaryLight);

    const centerLight = new THREE.PointLight(preset.accent, 5.0, 12);
    centerLight.position.set(0, 0, 2);
    scene.add(centerLight);

    pointLightsRef.current = [primaryLight, secondaryLight, centerLight];

    // 5. Main Logo Group Construction
    const logoGroup = new THREE.Group();
    logoGroupRef.current = logoGroup;
    logoGroup.scale.set(0.01, 0.01, 0.01); // Initial scale for fade-in animation

    materialsRef.current = [];

    // Helper for neon materials
    const createNeonMat = (colorHex: number, emissiveIntensity = 3.5) => {
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity,
        roughness: 0.1,
        metalness: 0.8,
      });
      materialsRef.current.push(mat);
      return mat;
    };

    const primaryNeonMat = createNeonMat(preset.primary, 4.0);
    const secondaryNeonMat = createNeonMat(preset.secondary, 4.0);
    const accentNeonMat = createNeonMat(preset.accent, 5.0);

    // Smoked Glass Backing Board
    const backGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.2, 48);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x11131a,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const backBoard = new THREE.Mesh(backGeo, backMat);
    backBoard.rotation.x = Math.PI / 2;
    backBoard.position.z = -0.3;
    logoGroup.add(backBoard);

    // Double Outer Neon Rings
    const ringGeo1 = new THREE.TorusGeometry(3.9, 0.09, 16, 64);
    const outerRing1 = new THREE.Mesh(ringGeo1, primaryNeonMat);
    logoGroup.add(outerRing1);

    const ringGeo2 = new THREE.TorusGeometry(3.5, 0.06, 16, 64);
    const outerRing2 = new THREE.Mesh(ringGeo2, secondaryNeonMat);
    outerRing2.position.z = 0.05;
    logoGroup.add(outerRing2);

    // --- TOP CAKE ICON (3D Neon Birthday Cake with Candle) ---
    const cakeGroup = new THREE.Group();
    cakeGroup.position.set(0, 1.8, 0.2);

    // Bottom Cake Tier
    const cakeTier1Geo = new THREE.CylinderGeometry(0.9, 0.95, 0.45, 32);
    const cakeTier1Mat = new THREE.MeshStandardMaterial({ color: 0x222533, roughness: 0.3 });
    const cakeTier1 = new THREE.Mesh(cakeTier1Geo, cakeTier1Mat);
    cakeGroup.add(cakeTier1);

    // Tier 1 Neon Icing Ring
    const icingRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.04, 12, 32), primaryNeonMat);
    icingRing1.rotation.x = Math.PI / 2;
    icingRing1.position.y = 0.22;
    cakeGroup.add(icingRing1);

    // Top Cake Tier
    const cakeTier2Geo = new THREE.CylinderGeometry(0.6, 0.65, 0.4, 32);
    const cakeTier2 = new THREE.Mesh(cakeTier2Geo, cakeTier1Mat);
    cakeTier2.position.y = 0.42;
    cakeGroup.add(cakeTier2);

    // Tier 2 Neon Icing Ring
    const icingRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 12, 32), secondaryNeonMat);
    icingRing2.rotation.x = Math.PI / 2;
    icingRing2.position.y = 0.62;
    cakeGroup.add(icingRing2);

    // Candle Tube
    const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16);
    const candle = new THREE.Mesh(candleGeo, accentNeonMat);
    candle.position.y = 0.8;
    cakeGroup.add(candle);

    // Flame Glow Sphere
    const flameGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffea00,
      emissive: 0xffea00,
      emissiveIntensity: 6.0,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 1.02;
    cakeGroup.add(flame);

    logoGroup.add(cakeGroup);

    // --- 3D "CAKEBUMER" STYLIZED BLOCK LETTERS ---
    const textGroup = new THREE.Group();
    textGroup.position.set(0, -0.4, 0.3);

    // Letter builder helper function using standard geometries
    const createLetterMesh = (char: string, mat1: THREE.Material, mat2: THREE.Material) => {
      const g = new THREE.Group();
      const thick = 0.12;
      const h = 1.1;
      const w = 0.65;

      const vBar = (x: number, y: number, height: number) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(thick, height, thick), mat1);
        mesh.position.set(x, y, 0);
        return mesh;
      };

      const hBar = (x: number, y: number, width: number) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, thick, thick), mat2);
        mesh.position.set(x, y, 0);
        return mesh;
      };

      switch (char) {
        case 'C':
          g.add(vBar(-w / 2, 0, h));
          g.add(hBar(0, h / 2 - thick / 2, w));
          g.add(hBar(0, -h / 2 + thick / 2, w));
          break;
        case 'A':
          g.add(vBar(-w / 2, 0, h));
          g.add(vBar(w / 2, 0, h));
          g.add(hBar(0, h / 2 - thick / 2, w));
          g.add(hBar(0, 0, w));
          break;
        case 'K':
          g.add(vBar(-w / 2, 0, h));
          const kArm1 = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 0.65, thick), mat2);
          kArm1.rotation.z = -Math.PI / 4;
          kArm1.position.set(0.1, 0.25, 0);
          const kArm2 = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 0.65, thick), mat2);
          kArm2.rotation.z = Math.PI / 4;
          kArm2.position.set(0.1, -0.25, 0);
          g.add(kArm1, kArm2);
          break;
        case 'E':
          g.add(vBar(-w / 2, 0, h));
          g.add(hBar(0, h / 2 - thick / 2, w));
          g.add(hBar(0, 0, w * 0.8));
          g.add(hBar(0, -h / 2 + thick / 2, w));
          break;
        case 'B':
          g.add(vBar(-w / 2, 0, h));
          g.add(hBar(0, h / 2 - thick / 2, w));
          g.add(hBar(0, 0, w));
          g.add(hBar(0, -h / 2 + thick / 2, w));
          g.add(vBar(w / 2, h / 4, h / 2));
          g.add(vBar(w / 2, -h / 4, h / 2));
          break;
        case 'U':
          g.add(vBar(-w / 2, 0, h));
          g.add(vBar(w / 2, 0, h));
          g.add(hBar(0, -h / 2 + thick / 2, w));
          break;
        case 'M':
          g.add(vBar(-w / 2, 0, h));
          g.add(vBar(w / 2, 0, h));
          const m1 = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 0.55, thick), mat2);
          m1.rotation.z = Math.PI / 6;
          m1.position.set(-w / 4, h / 4, 0);
          const m2 = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 0.55, thick), mat2);
          m2.rotation.z = -Math.PI / 6;
          m2.position.set(w / 4, h / 4, 0);
          g.add(m1, m2);
          break;
        case 'R':
          g.add(vBar(-w / 2, 0, h));
          g.add(hBar(0, h / 2 - thick / 2, w));
          g.add(hBar(0, 0, w));
          g.add(vBar(w / 2, h / 4, h / 2));
          const rLeg = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 0.65, thick), mat2);
          rLeg.rotation.z = -Math.PI / 4;
          rLeg.position.set(0.1, -0.3, 0);
          g.add(rLeg);
          break;
        default:
          break;
      }

      return g;
    };

    // Spell "CAKEBUMER" across 2 stacked lines or 1 stylish arc
    // Top line: C A K E
    const topLetters = ['C', 'A', 'K', 'E'];
    topLetters.forEach((char, idx) => {
      const mesh = createLetterMesh(char, primaryNeonMat, accentNeonMat);
      mesh.position.set((idx - 1.5) * 0.9, 0.45, 0);
      textGroup.add(mesh);
    });

    // Bottom line: B U M E R
    const bottomLetters = ['B', 'U', 'M', 'E', 'R'];
    bottomLetters.forEach((char, idx) => {
      const mesh = createLetterMesh(char, secondaryNeonMat, accentNeonMat);
      mesh.position.set((idx - 2) * 0.82, -0.75, 0);
      textGroup.add(mesh);
    });

    logoGroup.add(textGroup);

    // Decorative Glowing Stars / Sparkles around the emblem
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const radius = 3.2;
      const starMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.15, 0),
        accentNeonMat
      );
      starMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.2);
      logoGroup.add(starMesh);
    }

    scene.add(logoGroup);

    // 6. Floating 3D Sparkle Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.15 + 0.05;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: preset.primary,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. Interactive Drag & Mouse Tilt Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - mousePosRef.current.x;
        const deltaY = e.clientY - mousePosRef.current.y;

        velocityRef.current.y = deltaX * 0.005;
        velocityRef.current.x = deltaY * 0.005;

        targetRotationRef.current.y += velocityRef.current.y;
        targetRotationRef.current.x += velocityRef.current.x;

        mousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDraggingRef.current = true;
        mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - mousePosRef.current.x;
        const deltaY = e.touches[0].clientY - mousePosRef.current.y;

        velocityRef.current.y = deltaX * 0.005;
        velocityRef.current.x = deltaY * 0.005;

        targetRotationRef.current.y += velocityRef.current.y;
        targetRotationRef.current.x += velocityRef.current.x;

        mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth Fade-in Entry Animation on Page Load
      if (entryProgressRef.current < 1) {
        entryProgressRef.current += 0.02;
        const p = Math.min(entryProgressRef.current, 1);
        const easeScale = Math.sin((p * Math.PI) / 2); // Smooth ease-out
        if (logoGroupRef.current) {
          logoGroupRef.current.scale.set(easeScale, easeScale, easeScale);
        }
      }

      // Auto rotation if enabled and not actively dragging
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.008;
      }

      // Smooth rotation dampening (inertia physics)
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (logoGroupRef.current) {
        logoGroupRef.current.rotation.x = currentRotationRef.current.x;
        logoGroupRef.current.rotation.y = currentRotationRef.current.y;

        // Subtle floating bobbing motion
        logoGroupRef.current.position.y = Math.sin(elapsedTime * 2) * 0.12;
      }

      // Pulse neon light intensity sinewave
      const pulse = Math.sin(elapsedTime * 4) * 0.5 + 1;
      materialsRef.current.forEach((mat) => {
        mat.emissiveIntensity = 3.0 + pulse * 1.5;
      });

      // Slowly drift floating particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
        particlesRef.current.rotation.x = elapsedTime * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 360;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colorIndex, autoRotate]);

  const cyclePreset = () => {
    setColorIndex((prev) => (prev + 1) % COLOR_PRESETS.length);
  };

  const t = translations[lang];
  const currentPreset = COLOR_PRESETS[colorIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-fuchsia-500/40 bg-gradient-to-b from-[#0d0914] via-[#09070f] to-[#040308] shadow-[0_0_35px_rgba(217,70,239,0.25)] my-4 transition-all">
      {/* Glow Header Bar */}
      <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
          <h3 className="font-bold text-sm sm:text-base tracking-wider bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
            {t.neonTitle}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <button
            onClick={cyclePreset}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1.5 border border-white/20 shadow"
            title="Change Neon Color Scheme"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-medium text-[11px]">
              {currentPreset.name.split(' ')[0]}
            </span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition ${
              autoRotate
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                : 'bg-black/40 text-gray-300 border-white/20'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-medium text-[11px]">
              {autoRotate ? '3D Active' : 'Pause'}
            </span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing relative transition-opacity duration-700 select-none"
      />

      {/* Interactive Hint Subtitle Bar */}
      <div className="bg-black/80 backdrop-blur-md p-3 text-center border-t border-white/10">
        <p className="text-xs sm:text-sm font-medium text-fuchsia-200 tracking-wide">
          {t.neonSub}
        </p>
        <div className="flex items-center justify-center gap-2 text-[11px] text-cyan-300/80 mt-1">
          <span>👆 Drag/Touch to rotate logo 360° in 3D</span>
          <span>•</span>
          <span>🎨 Tap color button to switch neon themes</span>
        </div>
      </div>
    </div>
  );
};
