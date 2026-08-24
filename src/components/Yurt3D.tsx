import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sun, Moon, Maximize2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface Yurt3DProps {
  lang: Language;
}

export const Yurt3D: React.FC<Yurt3DProps> = ({ lang }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const yurtGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{ ambient: THREE.AmbientLight; dir: THREE.DirectionalLight; yurtLight: THREE.PointLight } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNight ? 0x0a1118 : 0xebf2f5);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 1.2, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(isNight ? 0x1f293d : 0xfffaed, isNight ? 0.6 : 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNight ? 0x7393b3 : 0xfff4d6, isNight ? 0.4 : 1.4);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Warm PointLight inside the Yurt (Shányaraq glow)
    const yurtLight = new THREE.PointLight(0xffaa33, isNight ? 4.5 : 2.0, 10);
    yurtLight.position.set(0, 2.2, 0);
    scene.add(yurtLight);

    lightsRef.current = { ambient: ambientLight, dir: dirLight, yurtLight };

    // 5. Yurt (Qara Úy) Procedural Group construction
    const yurtGroup = new THREE.Group();
    yurtGroupRef.current = yurtGroup;

    // A. Ground Platform (National Carpet Base)
    const groundGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.3, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x8b2613, // Rich Terracotta Crimson
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    yurtGroup.add(ground);

    // Carpet Pattern Ring
    const ringGeo = new THREE.RingGeometry(2.2, 4.1, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x008080, // Karakalpak Turquoise
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    yurtGroup.add(ring);

    // B. Yurt Cylinder Walls (Felt / Kerge)
    const wallGeo = new THREE.CylinderGeometry(2.6, 2.7, 1.8, 32, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedc, // Soft Felt White / Cream
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 0.9;
    wall.castShadow = true;
    wall.receiveShadow = true;
    yurtGroup.add(wall);

    // C. Traditional Woven Bands (Basqur / Órmek Ornament Bands)
    const bandGeo1 = new THREE.CylinderGeometry(2.62, 2.62, 0.18, 32, 1, true);
    const bandMat1 = new THREE.MeshStandardMaterial({ color: 0xb23a1f }); // Red band
    const band1 = new THREE.Mesh(bandGeo1, bandMat1);
    band1.position.y = 1.3;
    yurtGroup.add(band1);

    const bandGeo2 = new THREE.CylinderGeometry(2.64, 2.64, 0.12, 32, 1, true);
    const bandMat2 = new THREE.MeshStandardMaterial({ color: 0x0f5257 }); // Turquoise band
    const band2 = new THREE.Mesh(bandGeo2, bandMat2);
    band2.position.y = 0.6;
    yurtGroup.add(band2);

    // D. Dome Roof (Úy / Tomaw)
    const domeGeo = new THREE.ConeGeometry(2.7, 1.4, 32, 1, true);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xede4cd,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 2.5;
    dome.castShadow = true;
    yurtGroup.add(dome);

    // E. Shányaraq (Roof Crown Wheel - Crown of the Yurt)
    const shanyaraqRingGeo = new THREE.TorusGeometry(0.65, 0.08, 12, 24);
    const shanyaraqMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.5 }); // Carved Wood
    const shanyaraqRing = new THREE.Mesh(shanyaraqRingGeo, shanyaraqMat);
    shanyaraqRing.rotation.x = Math.PI / 2;
    shanyaraqRing.position.y = 3.18;
    yurtGroup.add(shanyaraqRing);

    // Shányaraq Cross Spokes (Uwyq spokes)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.28);
      const spoke = new THREE.Mesh(spokeGeo, shanyaraqMat);
      spoke.rotation.x = Math.PI / 2;
      spoke.rotation.z = angle;
      spoke.position.y = 3.18;
      yurtGroup.add(spoke);
    }

    // F. Yurt Door Frame (Ergenek Wooden Entrance)
    const doorFrameGeo = new THREE.BoxGeometry(0.85, 1.3, 0.15);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x42210b, roughness: 0.6 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(0, 0.65, 2.62);
    yurtGroup.add(doorFrame);

    // Door Panel with Gold Ornament
    const doorPanelGeo = new THREE.BoxGeometry(0.72, 1.18, 0.1);
    const doorPanelMat = new THREE.MeshStandardMaterial({ color: 0x8b2613 });
    const doorPanel = new THREE.Mesh(doorPanelGeo, doorPanelMat);
    doorPanel.position.set(0, 0.65, 2.65);
    yurtGroup.add(doorPanel);

    // Door Handle / Gold Ornament Knocker
    const handleGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.2, 0.65, 2.72);
    yurtGroup.add(handle);

    // G. 3D Dish Showcase outside Yurt (Beshbarmak Bowl & Qımız Pitcher)
    const bowlGeo = new THREE.CylinderGeometry(0.5, 0.3, 0.22, 24);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xf5f2eb, roughness: 0.3 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.set(1.4, 0.11, 2.8);
    bowl.castShadow = true;
    yurtGroup.add(bowl);

    // Qımız Pitcher (Torsık)
    const pitcherGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const pitcherMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.4 });
    const pitcher = new THREE.Mesh(pitcherGeo, pitcherMat);
    pitcher.position.set(-1.4, 0.25, 2.8);
    pitcher.castShadow = true;
    yurtGroup.add(pitcher);

    // Add Yurt Group to Scene
    scene.add(yurtGroup);

    // 6. Interactive Drag Controls
    let isDragging = false;
    let previousMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !yurtGroupRef.current) return;
      const deltaX = e.clientX - previousMouseX;
      yurtGroupRef.current.rotation.y += deltaX * 0.008;
      previousMouseX = e.clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !yurtGroupRef.current || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - previousMouseX;
      yurtGroupRef.current.rotation.y += deltaX * 0.008;
      previousMouseX = e.touches[0].clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    domElem.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('touchstart', onTouchStart);
    domElem.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && yurtGroupRef.current && !isDragging) {
        yurtGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Window / Container Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 340;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      domElem.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isNight, autoRotate]);

  // Handle Day/Night illumination changes dynamically
  const toggleNight = () => {
    setIsNight((prev) => !prev);
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(!isNight ? 0x0d1520 : 0xebf2f5);
    }
  };

  const t = translations[lang];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#d4af37]/40 bg-gradient-to-b from-[#f9f6f0] via-[#f2ece1] to-[#e5dccb] shadow-xl my-4">
      {/* Decorative Traditional Top Ribbon */}
      <div className="bg-[#8b2613] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#d4af37]">
        <div className="flex items-center gap-2">
          <span className="text-xl">⛺</span>
          <h3 className="font-bold text-sm sm:text-base tracking-wide font-serif text-[#fbf8f3]">
            {t.yurtTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleNight}
            className="p-1.5 rounded-lg bg-[#008080]/30 hover:bg-[#008080] text-white transition text-xs flex items-center gap-1 border border-white/20"
            title={t.toggleDayNight}
          >
            {isNight ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-200" />}
            <span className="hidden sm:inline text-xs font-medium">
              {isNight ? 'Kún' : 'Tún'}
            </span>
          </button>
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition ${
              autoRotate ? 'bg-[#d4af37] text-gray-900 border-amber-300' : 'bg-black/30 text-white border-white/20'
            }`}
            title={t.rotateSpeed}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-medium">3D Aylanıw</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing relative" />

      {/* Subtitle overlay banner */}
      <div className="bg-gradient-to-t from-[#2c2523]/95 via-[#2c2523]/80 to-transparent p-3 text-center text-[#fbf8f3]">
        <p className="text-xs sm:text-sm font-medium text-amber-200">
          ✨ {t.yurtSub}
        </p>
        <span className="text-[10px] text-gray-300 opacity-90 mt-0.5 block">
          👆 Mouse yamasa barmaǵıńız menen 3D Qara úydi 360° aylantırıń
        </span>
      </div>
    </div>
  );
};
