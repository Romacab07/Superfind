import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Matter from 'matter-js';
import { Sparkles, TrendingUp, Music, Radio, Filter, RefreshCw, Volume2, Shield, Heart } from 'lucide-react';
import { extractTrackPalette } from '../utils/paletteExtractor';

/**
 * BubbleWorld - 4K Persistent Living Soap Bubble Ecosystem
 * 
 * Architectural & Visual Realism Guarantees:
 * 1. SINGLE MOUNT LIFECYCLE: Matter.js engine & requestAnimationFrame loop are created ONCE.
 * 2. IDENTITY PERSISTENCE: Selecting tracks or changing UI state NEVER recreates Matter bodies.
 * 3. TRAJECTORY CONTINUITY: Bubbles move smoothly under physics (dx, dy = v * dt) across state changes.
 * 4. SOFT FILTERING: Filter/search state toggles target visibility without deleting bodies.
 * 5. ALBUM-DERIVED PALETTES: Every song bubble has an individual distinct volumetric chromatic material.
 * 6. VOLUMETRIC SPHERICAL ARTWORK: Soft internal landscape reflection, specular crescent highlights & caustics.
 * 7. REAL METABALL MENISCUS: Mathematical tangent fillet concave arcs with iridescent outer rims.
 * 8. HERO WAVEFORM EQUALIZER: Real-time animated audio visualizer in the active playing bubble.
 * 9. 4K DEPTH & ATMOSPHERE: Multi-layer floating background bokeh & micro-droplets.
 * 10. DIAGNOSTIC DEBUGGER: Exposes window.__superfind_debug__ for automated verification.
 */
export default function BubbleWorld({
  dynamicSections = [],
  suggestions = [],
  topTracks = [],
  recentTracks = [],
  likedTrackIds = [],
  consumedTrackIds = new Set(),
  onConsumeTrack,
  currentTrack,
  isPlaying = false,
  onPlayTrack,
  searchQuery = '',
  selectedGenre = 'all',
  activeCategory = 'all',
  onSelectCategory,
  onRefreshGemini,
  isRefreshingAi = false,
  isDarkMode = true
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const wallsRef = useRef([]);
  const bubblesMapRef = useRef(new Map());
  const microBubblesRef = useRef([]);
  const backgroundBokehRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, isDown: false, vx: 0, vy: 0, lastX: -1000, lastY: -1000 });
  const scrollOffsetRef = useRef({ x: 0, y: 0 });
  const [hoveredTrack, setHoveredTrack] = useState(null);

  // Exact reference constellation anchors & radii
  const ANCHORS = {
    'track-1': { x: 0.54, y: 0.50, r: 136, label: 'EN REPRODUCCIÓN', isHero: true }, // Neon Horizon
    'track-2': { x: 0.31, y: 0.38, r: 98, label: 'GEMA' },                           // Midnight Coffee
    'track-3': { x: 0.45, y: 0.32, r: 76, label: 'GEMA' },                           // Urban Pulse
    'track-4': { x: 0.69, y: 0.30, r: 94, label: 'con IA' },                         // Cybernetic Drift
    'track-5': { x: 0.86, y: 0.44, r: 104, label: 'GEMA' },                          // Starlight Odyssey
    'track-6': { x: 0.25, y: 0.66, r: 96, label: 'con IA' },                         // Zen Blossom
    'track-7': { x: 0.77, y: 0.70, r: 102, label: 'con IA' },                        // Golden Hour Memories
    'track-8': { x: 0.46, y: 0.76, r: 84, label: 'con IA' },                         // Echoes of Eternity
    'track-9': { x: 0.33, y: 0.79, r: 66, label: null },                             // Falling Slowly
  };

  const TOPOLOGY_CONNECTIONS = [
    ['track-1', 'track-2'],
    ['track-1', 'track-3'],
    ['track-1', 'track-4'],
    ['track-1', 'track-5'],
    ['track-1', 'track-6'],
    ['track-1', 'track-7'],
    ['track-1', 'track-8'],
    ['track-2', 'track-3'],
    ['track-2', 'track-6'],
    ['track-4', 'track-5'],
    ['track-7', 'track-5'],
    ['track-7', 'track-8'],
    ['track-8', 'track-9'],
    ['track-8', 'track-6'],
  ];

  // Latest props reference
  const propsRef = useRef({
    dynamicSections,
    currentTrack,
    isPlaying,
    isDarkMode,
    activeCategory,
    onSelectCategory,
    searchQuery,
    selectedGenre,
    likedTrackIds,
    consumedTrackIds,
    onPlayTrack,
    onConsumeTrack,
  });

  const lastSelectedTrackIdRef = useRef(currentTrack?.id || null);

  useEffect(() => {
    propsRef.current = {
      dynamicSections,
      currentTrack,
      isPlaying,
      isDarkMode,
      activeCategory,
      onSelectCategory,
      searchQuery,
      selectedGenre,
      likedTrackIds,
      consumedTrackIds,
      onPlayTrack,
      onConsumeTrack,
    };
  });

  // Aggregated catalog data: Populates each dynamic section with its own galaxy of bubbles
  const allBubblesData = useMemo(() => {
    const list = [];
    const poolMap = new Map();

    (suggestions || []).forEach((item) => {
      const t = item?.track || item;
      if (t && t.id && !poolMap.has(t.id)) {
        poolMap.set(t.id, { ...t, tier: item?.tier || t.tier || 'GROWING', reasoning: item?.reasoning || t.reasoning });
      }
    });
    (topTracks || []).forEach((t) => {
      if (t && t.id && !poolMap.has(t.id)) poolMap.set(t.id, t);
    });
    (recentTracks || []).forEach((t) => {
      if (t && t.id && !poolMap.has(t.id)) poolMap.set(t.id, t);
    });

    const allTracks = Array.from(poolMap.values());
    if (allTracks.length === 0) return [];

    const sections = (dynamicSections && dynamicSections.length > 0) ? dynamicSections : [
      { id: 'top24h', label: 'Top 24hs' },
      { id: 'all', label: 'Todas las burbujas' },
      { id: 'recent', label: 'Novedades' },
    ];

    sections.forEach((sec, secIdx) => {
      let sectionTracks = [];
      if (sec.id === 'top24h') {
        sectionTracks = [...allTracks].sort((a, b) => (b.playCount24h || 0) - (a.playCount24h || 0)).slice(0, 14);
      } else if (sec.id === 'all') {
        sectionTracks = allTracks.slice(0, 20);
      } else if (sec.id === 'recent') {
        sectionTracks = (recentTracks && recentTracks.length > 0 ? recentTracks : allTracks).slice(0, 14);
      } else if (sec.id.startsWith('genre-')) {
        const targetGenre = (sec.genre || sec.label || '').toLowerCase().trim();
        sectionTracks = allTracks.filter((t) => {
          const g = (t.genre || '').toLowerCase().trim();
          return g.includes(targetGenre) || targetGenre.includes(g.split('/')[0].trim());
        }).slice(0, 16);
        if (sectionTracks.length === 0) {
          sectionTracks = allTracks.slice(0, 12);
        }
      } else if (sec.id === 'liked') {
        sectionTracks = allTracks.filter((t) => likedTrackIds && likedTrackIds.includes(t.id));
        if (sectionTracks.length === 0) {
          sectionTracks = allTracks.slice(0, 5);
        }
      } else {
        sectionTracks = allTracks.slice(0, 12);
      }

      // Filter out consumed tracks so they don't block the screen
      const availableTracks = sectionTracks.filter(t => !consumedTrackIds || !consumedTrackIds.has(t.id));

      availableTracks.forEach((t, itemIdx) => {
        let anchor;
        if (itemIdx === 0) {
          anchor = {
            x: 0.51,
            y: 0.49,
            r: sec.id === 'top24h' ? 120 : 110,
            label: sec.id === 'top24h' ? 'Top 1' : sec.label
          };
        } else {
          const phi = itemIdx * 2.399963;
          const dist = 100 + Math.sqrt(itemIdx) * 65;
          anchor = {
            x: Math.max(0.18, Math.min(0.84, 0.51 + (Math.cos(phi) * dist) / 1200)),
            y: Math.max(0.20, Math.min(0.80, 0.50 + (Math.sin(phi) * dist * 0.70) / 800)),
            r: Math.max(68, 98 - itemIdx * 2.2),
            label: t.tier === 'UNDERGROUND' ? 'GEMA' : sec.id === 'top24h' ? 'Top 24h' : sec.id === 'recent' ? 'Novedad' : sec.label,
          };
        }

        const uniqueKey = `${sec.id}__${t.id}`;
        list.push({
          track: t,
          uniqueKey,
          sectionId: sec.id,
          sectionIndex: secIdx,
          category: sec.id,
          categories: new Set(['all', sec.id]),
          categoryLabel: anchor.label,
          tier: t.tier || 'GROWING',
          reasoning: t.reasoning,
          baseRadius: anchor.r,
          anchor,
          assignedAnchorKey: uniqueKey,
        });
      });
    });

    return list;
  }, [dynamicSections, suggestions, topTracks, recentTracks, likedTrackIds, consumedTrackIds]);

  // Synchronize catalog items into persistent bubbles map without recreating existing bodies
  const syncBubblesWithCatalog = useCallback((catalogData) => {
    const engine = engineRef.current;
    if (!engine) return;

    const container = containerRef.current;
    const width = container?.clientWidth || window.innerWidth || 1200;
    const height = Math.max(680, container?.clientHeight || window.innerHeight || 800);
    const bubblesMap = bubblesMapRef.current;
    const activeKeys = new Set();
    const sectionSpacingX = Math.max(width * 0.95, 1200);
    const sectionSpacingY = Math.max(height * 0.90, 850);
    const isMobileScreen = width < 768;

    catalogData.forEach((data) => {
      const uniqueKey = data.uniqueKey || `${data.sectionId || 'all'}__${data.track.id}`;
      activeKeys.add(uniqueKey);

      const anchor = data.anchor || ANCHORS[data.track.id] || ANCHORS[data.assignedAnchorKey];
      const responsiveScale = width < 500 ? 0.68 : width < 900 ? 0.82 : 1.0;
      const radius = (anchor?.r || data.baseRadius) * responsiveScale;
      const secIdx = data.sectionIndex ?? 0;

      if (!bubblesMap.has(uniqueKey)) {
        let seedX = width * (anchor ? anchor.x : 0.53) + (isMobileScreen ? 0 : secIdx * sectionSpacingX);
        let seedY = height * (anchor ? anchor.y : 0.50) + (isMobileScreen ? secIdx * sectionSpacingY : 0);

        const padding = radius + 20;
        seedX = Math.max(padding, seedX);
        seedY = Math.max(padding, seedY);

        const body = Matter.Bodies.circle(seedX, seedY, radius, {
          restitution: 0.85,
          frictionAir: 0.055,
          friction: 0.02,
          mass: radius * 0.15,
        });

        Matter.World.add(engine.world, body);

        bubblesMap.set(uniqueKey, {
          id: data.track.id,
          key: uniqueKey,
          sectionId: data.sectionId,
          sectionIndex: secIdx,
          body,
          bodyId: body.id,
          track: data.track,
          category: data.category,
          categories: data.categories || new Set(['all', data.category]),
          categoryLabel: data.categoryLabel,
          tier: data.tier,
          reasoning: data.reasoning,
          baseRadius: radius,
          radius: radius,
          targetRadius: radius,
          anchor: anchor || null,
          assignedAnchorKey: data.assignedAnchorKey,
          palette: extractTrackPalette(data.track),
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.005 + Math.random() * 0.005,
          driftAngle: Math.random() * Math.PI * 2,
          seed1: Math.random() * 20,
          seed2: Math.random() * 20,
          seed3: Math.random() * 20,
          wobbleSpeed: 0.0008 + Math.random() * 0.0005,
          activeScore: 0,
          alpha: 1,
          targetAlpha: 1,
        });
      } else {
        const existing = bubblesMap.get(uniqueKey);
        existing.id = data.track.id;
        existing.sectionId = data.sectionId;
        existing.sectionIndex = secIdx;
        existing.track = data.track;
        existing.category = data.category;
        existing.categories = data.categories || existing.categories || new Set(['all', data.category]);
        existing.categoryLabel = data.categoryLabel;
        existing.tier = data.tier;
        existing.reasoning = data.reasoning;
        existing.baseRadius = radius;
        existing.anchor = anchor || existing.anchor;
        existing.assignedAnchorKey = data.assignedAnchorKey || existing.assignedAnchorKey;
        existing.palette = extractTrackPalette(data.track);
      }
    });

    // Remove obsolete bodies
    for (const [key, bubble] of bubblesMap.entries()) {
      if (!activeKeys.has(key)) {
        Matter.World.remove(engine.world, bubble.body);
        bubblesMap.delete(key);
      }
    }
  }, []);

  useEffect(() => {
    syncBubblesWithCatalog(allBubblesData);
  }, [allBubblesData, syncBubblesWithCatalog]);

  // Position Delta Verification & Diagnostics on Track Selection
  useEffect(() => {
    const prevId = lastSelectedTrackIdRef.current;
    const currentId = currentTrack?.id || null;

    if (prevId !== currentId) {
      lastSelectedTrackIdRef.current = currentId;

      if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
        const bubbles = Array.from(bubblesMapRef.current.values()).slice(0, 5);
        console.groupCollapsed(`[BubbleWorld Debugger] Selection changed: ${prevId || 'none'} -> ${currentId}`);
        bubbles.forEach(b => {
          const isSelected = b.id === currentId;
          console.log(
            `%c${b.track.title} [id: ${b.id}] | bodyId: ${b.body.id} | pos: (${b.body.position.x.toFixed(1)}, ${b.body.position.y.toFixed(1)}) | status: ${isSelected ? 'SELECTED / CONTINUOUS' : 'CONTINUOUS'}`,
            isSelected ? 'color: #8b5cf6; font-weight: bold;' : 'color: #06b6d4;'
          );
        });
        console.groupEnd();
      }
    }
  }, [currentTrack]);

  // =========================================================================
  // SINGLE MOUNT EFFECT: Initializes Matter Engine & 60fps Loop ONCE
  // =========================================================================
  useEffect(() => {
    console.log('[BubbleWorld] mounted (Persistent Physics & 4K Volumetric Renderer)');

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 1200;
    const height = Math.max(680, container.clientHeight || 800);

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
    });
    engineRef.current = engine;

    // Static containment walls (expanded across 12 sections for continuous multi-constellation world)
    const wallThickness = 160;
    const wallOptions = { isStatic: true, restitution: 0.95, friction: 0 };
    const maxSections = 12;
    const walls = [
      Matter.Bodies.rectangle((width * maxSections) / 2, -wallThickness / 2, width * maxSections * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle((width * maxSections) / 2, height * maxSections + wallThickness / 2, width * maxSections * 2, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, (height * maxSections) / 2, wallThickness, height * maxSections * 2, wallOptions),
      Matter.Bodies.rectangle(width * maxSections + wallThickness / 2, (height * maxSections) / 2, wallThickness, height * maxSections * 2, wallOptions),
    ];
    wallsRef.current = walls;
    Matter.World.add(engine.world, walls);

    // Initial catalog synchronization right after engine creation
    syncBubblesWithCatalog(allBubblesData);

    // Initialize 55 Ambient Floating Micro-Droplets & Cluster Foam Pearls
    const microBubbles = [];
    for (let i = 0; i < 55; i++) {
      const isClusterSatellite = i >= 35;
      let x, y, r;
      if (isClusterSatellite) {
        const angle = (i - 35) * (Math.PI * 2 / 20) + Math.random() * 0.4;
        const dist = 130 + Math.random() * 280;
        x = width * 0.54 + Math.cos(angle) * dist;
        y = height * 0.50 + Math.sin(angle) * dist * 0.7;
        r = 5 + Math.random() * 11;
      } else {
        x = Math.random() * width;
        y = Math.random() * height;
        r = 6 + Math.random() * 22;
      }
      microBubbles.push({
        x,
        y,
        radius: r,
        vx: (Math.random() - 0.5) * (isClusterSatellite ? 0.08 : 0.3),
        vy: (Math.random() - 0.5) * 0.2 - (isClusterSatellite ? 0.02 : 0.08),
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.45,
        isSatellite: isClusterSatellite,
      });
    }
    microBubblesRef.current = microBubbles;

    // Initialize 14 Out-of-Focus Background Bokeh Bubbles
    const backgroundBokeh = [];
    for (let i = 0; i < 14; i++) {
      backgroundBokeh.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 45 + Math.random() * 85,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.06 + Math.random() * 0.12,
        colorType: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'purple' : 'pink',
      });
    }
    backgroundBokehRef.current = backgroundBokeh;

    // Retina / HiDPI setup
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let lastTime = performance.now();
    let isRunning = true;

    const handleVisibilityChange = () => {
      isRunning = !document.hidden;
      lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // =====================================================================
    // ETHEREAL DISCOVERY ENVIRONMENT RENDERERS (REFERENCE 2 FIDELITY)
    // =====================================================================

    // Shimmering reflective water surface at the bottom
    const drawWaterSurfaceReflection = (ctx, w, h, time, isDark) => {
      const waterTop = h * 0.72;
      const waterGrad = ctx.createLinearGradient(0, waterTop, 0, h);
      if (isDark) {
        waterGrad.addColorStop(0, 'rgba(14, 18, 36, 0)');
        waterGrad.addColorStop(0.3, 'rgba(34, 211, 238, 0.05)');
        waterGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)');
        waterGrad.addColorStop(1, 'rgba(8, 11, 24, 0.5)');
      } else {
        waterGrad.addColorStop(0, 'rgba(238, 243, 252, 0)');
        waterGrad.addColorStop(0.25, 'rgba(224, 231, 255, 0.35)');
        waterGrad.addColorStop(0.65, 'rgba(244, 114, 182, 0.14)');
        waterGrad.addColorStop(1, 'rgba(192, 132, 252, 0.22)');
      }

      ctx.save();
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterTop, w, h - waterTop);

      // Gentle caustics / liquid light ripples
      ctx.lineWidth = 1.2;
      const rippleCount = 5;
      for (let ri = 0; ri < rippleCount; ri++) {
        const ry = waterTop + (h - waterTop) * (0.18 + ri * 0.17);
        const waveSpeed = time * 0.0008 + ri * 1.4;
        ctx.strokeStyle = isDark
          ? `rgba(147, 197, 253, ${0.08 + Math.sin(waveSpeed) * 0.04})`
          : `rgba(255, 255, 255, ${0.45 + Math.sin(waveSpeed) * 0.25})`;

        ctx.beginPath();
        ctx.moveTo(0, ry);
        for (let rx = 0; rx <= w; rx += 36) {
          const dy = Math.sin(rx * 0.012 + waveSpeed) * 3.5 + Math.cos(rx * 0.018 - waveSpeed * 0.8) * 2;
          ctx.lineTo(rx, ry + dy);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    // Four-point twinkle star sparkle
    const drawSparkleStar = (ctx, cx, cy, size, alpha, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.fill();
      ctx.restore();
    };

    // Realistic Translucent Soap Bubble Interior & Volumetric Reflection
    const drawSoapBubbleTranslucentInterior = (ctx, b, x, y, r, time, isDark, isCurrent) => {
      ctx.save();
      // Clip to interior
      ctx.beginPath();
      ctx.arc(x, y, r * 0.98, 0, Math.PI * 2);
      ctx.clip();

      // Translucent volumetric sphere gradient
      const sphereGrad = ctx.createRadialGradient(
        x - r * 0.28, y - r * 0.32, r * 0.08,
        x, y, r * 1.02
      );

      if (isDark) {
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
        sphereGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.09)');
        sphereGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.25)');
        sphereGrad.addColorStop(0.95, 'rgba(34, 211, 238, 0.15)');
        sphereGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
      } else {
        // Pearlescent soap liquid (Ref 2)
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
        sphereGrad.addColorStop(0.3, 'rgba(240, 246, 255, 0.42)');
        sphereGrad.addColorStop(0.65, 'rgba(224, 235, 255, 0.18)');
        sphereGrad.addColorStop(0.88, 'rgba(244, 114, 182, 0.16)');
        sphereGrad.addColorStop(1, 'rgba(255, 255, 255, 0.48)');
      }

      ctx.fillStyle = sphereGrad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Subtle track palette color wash in the bubble center
      const colorWash = ctx.createRadialGradient(
        x + r * 0.1, y + r * 0.15, 0,
        x, y, r * 0.85
      );
      colorWash.addColorStop(0, isDark ? b.palette.glowDark : b.palette.glow);
      colorWash.addColorStop(1, 'transparent');
      ctx.fillStyle = colorWash;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      ctx.restore();
    };

    // =====================================================================
    // MAIN 60FPS RENDER & PHYSICS LOOP
    // =====================================================================
    const render = (time) => {
      if (!isRunning) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      Matter.Engine.update(engine, dt);
      
      const dynamicSectionsList = propsRef.current.dynamicSections || [];
      const activeCat = propsRef.current.activeCategory;
      const activeIndex = Math.max(0, dynamicSectionsList.findIndex(s => s.id === activeCat));
      const sectionSpacingX = Math.max(width * 0.95, 1200);
      const sectionSpacingY = Math.max(height * 0.90, 850);
      const isMobileScreen = width < 768;
      
      const targetCamX = isMobileScreen ? 0 : activeIndex * sectionSpacingX;
      const targetCamY = isMobileScreen ? activeIndex * sectionSpacingY : 0;
      scrollOffsetRef.current.x += (targetCamX - scrollOffsetRef.current.x) * 0.08;
      scrollOffsetRef.current.y += (targetCamY - scrollOffsetRef.current.y) * 0.08;

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      
      ctx.save();
      ctx.translate(-scrollOffsetRef.current.x, -scrollOffsetRef.current.y);

      const mouse = mousePosRef.current;
      const worldMouse = { x: mouse.x + scrollOffsetRef.current.x, y: mouse.y + scrollOffsetRef.current.y };
      const bubbles = Array.from(bubblesMapRef.current.values());
      const micros = microBubblesRef.current;
      const bokeh = backgroundBokehRef.current;
      const {
        currentTrack: activeCurTrack,
        isPlaying: activeIsPlaying,
        isDarkMode: activeIsDarkMode,
        activeCategory: currentCat,
        searchQuery: currentSearch,
        selectedGenre: currentGenre,
        likedTrackIds: currentLiked,
      } = propsRef.current;

      const q = (currentSearch || '').toLowerCase().trim();

      // -----------------------------------------------------------------
      // 0. Shimmering Water Floor & Atmospheric Horizon
      // -----------------------------------------------------------------
      drawWaterSurfaceReflection(ctx, width, height, time, activeIsDarkMode);

      // -----------------------------------------------------------------
      // 1. Deep Atmospheric Background Bokeh Layer (4K Depth)
      // -----------------------------------------------------------------
      bokeh.forEach(bk => {
        bk.x += bk.vx;
        bk.y += bk.vy;
        bk.phase += 0.007;

        if (bk.x < -120) bk.x = width + 120;
        if (bk.x > width + 120) bk.x = -120;
        if (bk.y < -120) bk.y = height + 120;
        if (bk.y > height + 120) bk.y = -120;

        const bx = bk.x + Math.cos(bk.phase) * 6;
        const by = bk.y + Math.sin(bk.phase * 0.8) * 6;

        ctx.save();
        const bGrad = ctx.createRadialGradient(bx, by, bk.radius * 0.1, bx, by, bk.radius);
        const color = bk.colorType === 'cyan'
          ? (activeIsDarkMode ? 'rgba(34, 211, 238,' : 'rgba(6, 182, 212,')
          : bk.colorType === 'purple'
          ? (activeIsDarkMode ? 'rgba(192, 132, 252,' : 'rgba(147, 51, 234,')
          : (activeIsDarkMode ? 'rgba(244, 114, 182,' : 'rgba(236, 72, 153,');

        bGrad.addColorStop(0, `${color} ${bk.alpha * 0.65})`);
        bGrad.addColorStop(0.5, `${color} ${bk.alpha * 0.25})`);
        bGrad.addColorStop(1, `${color} 0)`);

        ctx.beginPath();
        ctx.arc(bx, by, bk.radius, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.restore();
      });

      // -----------------------------------------------------------------
      // 2. Ambient Floating Micro-Droplets
      // -----------------------------------------------------------------
      micros.forEach(mb => {
        mb.x += mb.vx;
        mb.y += mb.vy;
        mb.phase += 0.016;

        if (mb.x < -50) mb.x = width + 50;
        if (mb.x > width + 50) mb.x = -50;
        if (mb.y < -50) mb.y = height + 50;
        if (mb.y > height + 50) mb.y = -50;

        const mx = mb.x + Math.cos(mb.phase) * 2;
        const my = mb.y + Math.sin(mb.phase * 0.8) * 2;

        ctx.save();
        const grad = ctx.createRadialGradient(
          mx - mb.radius * 0.35, my - mb.radius * 0.35, mb.radius * 0.1,
          mx, my, mb.radius
        );

        if (activeIsDarkMode) {
          grad.addColorStop(0, `rgba(255, 255, 255, ${mb.alpha * 0.85})`);
          grad.addColorStop(0.4, `rgba(192, 132, 252, ${mb.alpha * 0.45})`);
          grad.addColorStop(0.8, `rgba(34, 211, 238, ${mb.alpha * 0.25})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${mb.alpha * 0.95})`);
          grad.addColorStop(0.5, `rgba(224, 231, 255, ${mb.alpha * 0.5})`);
          grad.addColorStop(0.85, `rgba(244, 114, 182, ${mb.alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.beginPath();
        ctx.arc(mx, my, mb.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx - mb.radius * 0.32, my - mb.radius * 0.36, mb.radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = activeIsDarkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.restore();
      });

      // -----------------------------------------------------------------
      // 2.5 Atmospheric 4-Point Sparkles (Reference 2 Fidelity)
      // -----------------------------------------------------------------
      const sparklePositions = [
        { x: width * 0.33, y: height * 0.28, s: 7, sp: 0.002, ph: 0 },
        { x: width * 0.62, y: height * 0.32, s: 9, sp: 0.0025, ph: 1.8 },
        { x: width * 0.88, y: height * 0.52, s: 8, sp: 0.0018, ph: 3.2 },
        { x: width * 0.48, y: height * 0.40, s: 10, sp: 0.003, ph: 4.5 },
        { x: width * 0.22, y: height * 0.62, s: 6, sp: 0.0022, ph: 2.1 },
        { x: width * 0.72, y: height * 0.65, s: 8, sp: 0.0028, ph: 0.9 },
        { x: width * 0.82, y: height * 0.38, s: 11, sp: 0.002, ph: 5.1 },
        { x: width * 0.52, y: height * 0.78, s: 7, sp: 0.0032, ph: 1.2 },
      ];

      sparklePositions.forEach((sp, spIdx) => {
        const pulse = Math.sin(time * sp.sp + sp.ph);
        const alpha = Math.max(0, pulse * 0.7 + 0.3);
        const curSize = sp.s * (0.8 + Math.max(0, pulse) * 0.4);
        const rot = time * 0.0003 * (spIdx % 2 === 0 ? 1 : -1) + sp.ph;
        drawSparkleStar(ctx, sp.x, sp.y, curSize, alpha * (activeIsDarkMode ? 0.7 : 0.85), rot);
      });

      // -----------------------------------------------------------------
      // 3. Physics & Harmonic Fluid Forces
      // -----------------------------------------------------------------
      bubbles.forEach((b, i) => {
        b.phase += b.phaseSpeed;

        const matchQuery = !q ||
          b.track.title?.toLowerCase().includes(q) ||
          b.track.artist?.toLowerCase().includes(q) ||
          b.track.genre?.toLowerCase().includes(q);

        const matchGenre = currentGenre === 'all' ||
          b.track.genre?.toLowerCase().includes(currentGenre.toLowerCase());

        const isFilteredIn = matchQuery && matchGenre;
        b.targetAlpha = isFilteredIn ? 1 : 0.22;
        b.alpha += (b.targetAlpha - b.alpha) * 0.12;

        // Gentle buoyant drift force
        const forceMag = 0.00016 * b.body.mass;
        const fx = Math.cos(b.phase + b.driftAngle) * forceMag;
        const fy = Math.sin(b.phase * 0.85 + b.driftAngle) * forceMag;
        Matter.Body.applyForce(b.body, b.body.position, { x: fx, y: fy });

        // Stable anchor spring force to maintain the reference constellation
        const isSmallScreen = width < 900;
        const isMobileScreen = width < 500;
        let targetX = width * (b.anchor ? b.anchor.x : 0.53);
        let targetY = height * (b.anchor ? b.anchor.y : 0.50);

        if (isMobileScreen) {
          targetX = width * (0.5 + (b.anchor ? (b.anchor.x - 0.53) * 0.72 : 0));
          targetY = height * (0.50 + (b.anchor ? (b.anchor.y - 0.50) * 0.75 : 0));
        } else if (isSmallScreen) {
          targetX = width * (0.5 + (b.anchor ? (b.anchor.x - 0.53) * 0.85 : 0));
          targetY = height * (0.50 + (b.anchor ? (b.anchor.y - 0.50) * 0.85 : 0));
        }

        const isCurrent = activeCurTrack && activeCurTrack.id === b.id;
        if (isCurrent && !b.anchor) {
          targetX = width * 0.53;
          targetY = height * 0.50;
        }

        // Apply Section Offset: Each bubble uses its own sectionIndex for positioning
        const mySectionIndex = b.sectionIndex ?? 0;
        targetX += isMobileScreen ? 0 : mySectionIndex * sectionSpacingX;
        targetY += isMobileScreen ? mySectionIndex * sectionSpacingY : 0;

        const dxCenter = targetX - b.body.position.x;
        const dyCenter = targetY - b.body.position.y;
        Matter.Body.applyForce(b.body, b.body.position, {
          x: dxCenter * 0.00014 * b.body.mass,
          y: dyCenter * 0.00014 * b.body.mass,
        });

        // Mouse interactive repulsion
        const dxMouse = b.body.position.x - mouse.x;
        const dyMouse = b.body.position.y - mouse.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);

        if (distMouse < b.radius + 75 && distMouse > 0) {
          const pushForce = (1 - distMouse / (b.radius + 75)) * 0.0025 * b.body.mass;
          Matter.Body.applyForce(b.body, b.body.position, {
            x: (dxMouse / distMouse) * pushForce,
            y: (dyMouse / distMouse) * pushForce,
          });
        }

        // Inter-bubble liquid repulsion
        for (let j = i + 1; j < bubbles.length; j++) {
          const b2 = bubbles[j];
          const dx = b2.body.position.x - b.body.position.x;
          const dy = b2.body.position.y - b.body.position.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b.radius + b2.radius + 32;

          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const repForce = overlap * 0.00018;
            const rx = (dx / dist) * repForce;
            const ry = (dy / dist) * repForce;
            Matter.Body.applyForce(b.body, b.body.position, { x: -rx, y: -ry });
            Matter.Body.applyForce(b2.body, b2.body.position, { x: rx, y: ry });
          }
        }

        // Smooth radius scaling
        const isHovered = distMouse <= b.radius && isFilteredIn;
        const targetR = isCurrent
          ? Math.max(b.baseRadius * 1.22, 136)
          : isHovered
          ? b.baseRadius * 1.08
          : b.baseRadius;

        b.radius += (targetR - b.radius) * 0.08;
        const targetActive = isCurrent ? 1 : 0;
        b.activeScore += (targetActive - b.activeScore) * 0.08;
      });

      // -----------------------------------------------------------------
      // 4. True Organic Metaball Meniscus Bridges (Topological Contact)
      // -----------------------------------------------------------------
      TOPOLOGY_CONNECTIONS.forEach(([idA, idB]) => {
        const b1 = bubbles.find(b => b.id === idA || b.assignedAnchorKey === idA);
        const b2 = bubbles.find(b => b.id === idB || b.assignedAnchorKey === idB);
        if (!b1 || !b2 || b1.alpha < 0.3 || b2.alpha < 0.3) return;

        const dx = b2.body.position.x - b1.body.position.x;
        const dy = b2.body.position.y - b1.body.position.y;
        const dist = Math.hypot(dx, dy);
        const contactThreshold = b1.radius + b2.radius + 40;

        if (dist < contactThreshold && dist > Math.abs(b1.radius - b2.radius)) {
          const t = 1 - (dist - (b1.radius + b2.radius)) / 40;
          const alpha = Math.max(0, Math.min(0.85, t * Math.min(b1.alpha, b2.alpha)));
          const angle = Math.atan2(dy, dx);
          const midX = (b1.body.position.x + b2.body.position.x) / 2;
          const midY = (b1.body.position.y + b2.body.position.y) / 2;

          const r1 = b1.radius * 0.94;
          const r2 = b2.radius * 0.94;
          const spread = Math.PI / 3.2 * Math.min(1, Math.max(0.4, t));
          const waistWidth = Math.max(6, (r1 + r2) * 0.22 * t);

          const p1_top = { x: b1.body.position.x + Math.cos(angle + spread) * r1, y: b1.body.position.y + Math.sin(angle + spread) * r1 };
          const p1_bot = { x: b1.body.position.x + Math.cos(angle - spread) * r1, y: b1.body.position.y + Math.sin(angle - spread) * r1 };
          const p2_top = { x: b2.body.position.x + Math.cos(angle + Math.PI - spread) * r2, y: b2.body.position.y + Math.sin(angle + Math.PI - spread) * r2 };
          const p2_bot = { x: b2.body.position.x + Math.cos(angle + Math.PI + spread) * r2, y: b2.body.position.y + Math.sin(angle + Math.PI + spread) * r2 };

          const perpX = -Math.sin(angle);
          const perpY = Math.cos(angle);
          const c_top = { x: midX + perpX * waistWidth, y: midY + perpY * waistWidth };
          const c_bot = { x: midX - perpX * waistWidth, y: midY - perpY * waistWidth };

          ctx.save();
          ctx.globalAlpha = alpha;

          // Fill hollow translucent fluid bridge
          const bridgeGrad = ctx.createLinearGradient(
            b1.body.position.x, b1.body.position.y,
            b2.body.position.x, b2.body.position.y
          );
          if (activeIsDarkMode) {
            bridgeGrad.addColorStop(0, b1.palette.glowDark);
            bridgeGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.15)');
            bridgeGrad.addColorStop(1, b2.palette.glowDark);
          } else {
            bridgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
            bridgeGrad.addColorStop(0.5, 'rgba(238, 244, 255, 0.35)');
            bridgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.55)');
          }

          ctx.beginPath();
          ctx.moveTo(p1_top.x, p1_top.y);
          ctx.quadraticCurveTo(c_top.x, c_top.y, p2_top.x, p2_top.y);
          ctx.lineTo(p2_bot.x, p2_bot.y);
          ctx.quadraticCurveTo(c_bot.x, c_bot.y, p1_bot.x, p1_bot.y);
          ctx.closePath();
          ctx.fillStyle = bridgeGrad;
          ctx.fill();

          // Stroke ONLY the concave outer fillet curves (NO internal lines!)
          ctx.lineWidth = Math.max(1.5, 2.8 * t);
          const rimGrad = ctx.createLinearGradient(
            b1.body.position.x, b1.body.position.y,
            b2.body.position.x, b2.body.position.y
          );
          rimGrad.addColorStop(0, b1.palette.rimGradient[0]);
          rimGrad.addColorStop(0.5, activeIsDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)');
          rimGrad.addColorStop(1, b2.palette.rimGradient[1]);
          ctx.strokeStyle = rimGrad;

          ctx.beginPath();
          ctx.moveTo(p1_top.x, p1_top.y);
          ctx.quadraticCurveTo(c_top.x, c_top.y, p2_top.x, p2_top.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p1_bot.x, p1_bot.y);
          ctx.quadraticCurveTo(c_bot.x, c_bot.y, p1_bot.x, p1_bot.y);
          ctx.stroke();

          // Small liquid droplet on the neck (Reference 2 detail)
          if (dist > (b1.radius + b2.radius) * 0.92) {
            const dropR = Math.max(3.5, Math.min(7.5, waistWidth * 0.45));
            ctx.beginPath();
            ctx.arc(midX, midY, dropR, 0, Math.PI * 2);
            ctx.fillStyle = activeIsDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.75)';
            ctx.fill();
            ctx.strokeStyle = rimGrad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
        }
      });

      // -----------------------------------------------------------------
      // 5. Render Volumetric 3D Soap Bubbles
      // -----------------------------------------------------------------
      bubbles.forEach(b => {
        const x = b.body.position.x;
        const y = b.body.position.y;
        const r = b.radius;
        const isCurrent = activeCurTrack && activeCurTrack.id === b.id;
        const isPlayingThis = isCurrent && activeIsPlaying;
        const dxMouse = x - mouse.x;
        const dyMouse = y - mouse.y;
        const isHovered = Math.hypot(dxMouse, dyMouse) <= r && b.alpha > 0.4;

        // Procedural harmonic organic contour points
        const numPoints = 64;
        const points = [];
        for (let ptIdx = 0; ptIdx < numPoints; ptIdx++) {
          const theta = (ptIdx / numPoints) * Math.PI * 2;
          let deform = 0;
          deform += Math.sin(2 * theta + time * b.wobbleSpeed + b.seed1) * 0.022;
          deform += Math.sin(3 * theta - time * (b.wobbleSpeed * 0.9) + b.seed2) * 0.016;
          deform += Math.sin(5 * theta + time * (b.wobbleSpeed * 1.2) + b.seed3) * 0.010;

          if (isPlayingThis) {
            deform += Math.sin(time * 0.006 + theta * 3) * 0.024;
          }

          const currentR = r * (1 + deform);
          points.push({
            x: x + Math.cos(theta) * currentR,
            y: y + Math.sin(theta) * currentR,
          });
        }

        const traceBubblePath = () => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let p = 1; p < points.length; p++) {
            const xc = (points[p].x + points[(p + 1) % points.length].x) / 2;
            const yc = (points[p].y + points[(p + 1) % points.length].y) / 2;
            ctx.quadraticCurveTo(points[p].x, points[p].y, xc, yc);
          }
          ctx.closePath();
        };

        ctx.save();
        ctx.globalAlpha = b.alpha;

        // A. Atmospheric Outer Glow
        ctx.shadowColor = activeIsDarkMode ? b.palette.glowDark : b.palette.glow;
        ctx.shadowBlur = isCurrent ? 46 : isHovered ? 28 : 16;
        ctx.shadowOffsetY = isCurrent ? 8 : 4;

        // B. Translucent Liquid Soap Bubble Interior
        drawSoapBubbleTranslucentInterior(ctx, b, x, y, r, time, activeIsDarkMode, isCurrent);

        ctx.shadowColor = 'transparent';

        // C. Multi-Chromatic Thin-Film Iridescent Rim Stroke (Soap Bubble Shimmer)
        const rimAngle = time * 0.0004 + b.phase;
        const rimGrad = ctx.createLinearGradient(
          x - r * Math.cos(rimAngle),
          y - r * Math.sin(rimAngle),
          x + r * Math.cos(rimAngle),
          y + r * Math.sin(rimAngle)
        );

        if (activeIsDarkMode) {
          rimGrad.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
          rimGrad.addColorStop(0.28, 'rgba(192, 132, 252, 0.90)');
          rimGrad.addColorStop(0.55, 'rgba(244, 114, 182, 0.85)');
          rimGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.75)');
          rimGrad.addColorStop(1, 'rgba(34, 211, 238, 0.85)');
        } else {
          rimGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
          rimGrad.addColorStop(0.25, 'rgba(192, 132, 252, 0.85)');
          rimGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.8)');
          rimGrad.addColorStop(0.75, 'rgba(251, 191, 36, 0.7)');
          rimGrad.addColorStop(1, 'rgba(56, 189, 248, 0.8)');
        }

        traceBubblePath();
        ctx.lineWidth = isCurrent ? 3.6 : isHovered ? 2.6 : 1.8;
        ctx.strokeStyle = rimGrad;
        ctx.stroke();

        // Crisp White Glass Refractive Outer Edge
        traceBubblePath();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = activeIsDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.92)';
        ctx.stroke();

        // D. Primary Specular Crescent Gleam (Upper Left Curved Highlight)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 3.8 + Math.sin(time * 0.0006) * 0.04);

        const gleamGrad = ctx.createLinearGradient(0, -r * 0.88, 0, -r * 0.45);
        gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gleamGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.40)');
        gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(0, -r * 0.72, r * 0.48, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fillStyle = gleamGrad;
        ctx.fill();

        // Secondary Specular Star Dot (Upper Right Bright Focus)
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.65, r * 0.045, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.fill();

        // Lower Caustic Bounce Light (Bottom Glow Arc)
        const bottomGlow = ctx.createRadialGradient(0, r * 0.7, 0, 0, r * 0.7, r * 0.45);
        bottomGlow.addColorStop(0, activeIsDarkMode ? b.palette.causticColor : 'rgba(244, 114, 182, 0.45)');
        bottomGlow.addColorStop(0.6, activeIsDarkMode ? b.palette.glowDark : 'rgba(192, 132, 252, 0.15)');
        bottomGlow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.ellipse(0, r * 0.70, r * 0.46, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = bottomGlow;
        ctx.fill();

        ctx.restore();

        // E. Center Audio Equalizer Waveform (Active Hero Track - Neon Horizon)
        if (isCurrent || r >= 115) {
          ctx.save();
          const barCount = r >= 120 ? 30 : 22;
          const barWidth = 2.4;
          const barGap = 2.0;
          const totalWidth = barCount * barWidth + (barCount - 1) * barGap;
          const startX = x - totalWidth / 2;
          const waveY = y + r * 0.38;

          for (let bi = 0; bi < barCount; bi++) {
            const normX = bi / barCount;
            const distCenter = Math.abs(normX - 0.5) * 2;
            const envelope = 1 - Math.pow(distCenter, 1.8);
            const animSpeed = isPlayingThis ? 0.009 : 0.003;
            const barH = (Math.abs(Math.sin(time * animSpeed + bi * 0.48)) * 0.75 + 0.25) * (r * 0.22) * envelope + 2.5;

            const bx = startX + bi * (barWidth + barGap);
            const barGrad = ctx.createLinearGradient(bx, waveY - barH, bx, waveY + barH);
            barGrad.addColorStop(0, '#818cf8');
            barGrad.addColorStop(0.5, '#c084fc');
            barGrad.addColorStop(1, '#6366f1');

            ctx.fillStyle = barGrad;
            ctx.beginPath();
            ctx.roundRect(bx, waveY - barH / 2, barWidth, barH, barWidth / 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // F. Floating Pill Badges ("EN REPRODUCCIÓN", "GEMA", "con IA")
        if (b.categoryLabel && r >= 64) {
          ctx.save();
          const pillY = y - r * 0.48;
          const isEnRep = isCurrent;
          const tagText = isEnRep ? 'EN REPRODUCCIÓN' : b.tier === 'UNDERGROUND' ? 'GEMA' : b.categoryLabel;

          ctx.font = `700 ${isEnRep ? 9.5 : r >= 95 ? 9 : 8}px "Plus Jakarta Sans", sans-serif`;
          const tagMetrics = ctx.measureText(tagText);
          const tagW = tagMetrics.width + (isEnRep ? 18 : 14);
          const tagH = isEnRep ? 19 : 16;

          if (isEnRep) {
            ctx.fillStyle = activeIsDarkMode ? 'rgba(147, 51, 234, 0.35)' : 'rgba(238, 242, 255, 0.85)';
            ctx.strokeStyle = activeIsDarkMode ? 'rgba(192, 132, 252, 0.75)' : 'rgba(147, 51, 234, 0.55)';
          } else if (tagText === 'GEMA') {
            ctx.fillStyle = activeIsDarkMode ? 'rgba(99, 102, 241, 0.25)' : 'rgba(238, 242, 255, 0.85)';
            ctx.strokeStyle = activeIsDarkMode ? 'rgba(129, 140, 248, 0.65)' : 'rgba(99, 102, 241, 0.5)';
          } else {
            ctx.fillStyle = activeIsDarkMode ? 'rgba(14, 165, 233, 0.22)' : 'rgba(240, 249, 255, 0.85)';
            ctx.strokeStyle = activeIsDarkMode ? 'rgba(56, 189, 248, 0.65)' : 'rgba(14, 165, 233, 0.5)';
          }

          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.roundRect(x - tagW / 2, pillY - tagH / 2, tagW, tagH, tagH / 2);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (isEnRep) {
            ctx.fillStyle = activeIsDarkMode ? '#e9d5ff' : '#6d28d9';
          } else if (tagText === 'GEMA') {
            ctx.fillStyle = activeIsDarkMode ? '#c7d2fe' : '#4338ca';
          } else {
            ctx.fillStyle = activeIsDarkMode ? '#bae6fd' : '#0369a1';
          }
          ctx.fillText(tagText, x, pillY + 0.5);
          ctx.restore();
        }

        // G. Track Title & Artist Typography
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxTextWidth = r * 1.55;
        let textCenterY = y - (isCurrent ? 14 : 2);

        // Song Title
        const titleFontSize = r >= 115 ? 18 : r >= 95 ? 14.5 : r >= 80 ? 12 : 10;
        ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
        
        ctx.shadowColor = activeIsDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = activeIsDarkMode ? 6 : 4;
        ctx.shadowOffsetY = activeIsDarkMode ? 1.5 : 1;

        ctx.fillStyle = activeIsDarkMode ? '#ffffff' : '#0f172a';

        let title = b.track.title || 'Canción';
        let metrics = ctx.measureText(title);
        if (metrics.width > maxTextWidth) {
          while (metrics.width > maxTextWidth && title.length > 3) {
            title = title.slice(0, -1);
            metrics = ctx.measureText(title + '…');
          }
          title += '…';
        }
        ctx.fillText(title, x, textCenterY);

        // Artist Name
        const artistFontSize = r >= 115 ? 12.5 : r >= 95 ? 11 : r >= 80 ? 9.5 : 8.5;
        ctx.font = `600 ${artistFontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = activeIsDarkMode ? '#cbd5e1' : '#475569';

        let artist = b.track.artist || 'Artista';
        let artistMetrics = ctx.measureText(artist);
        if (artistMetrics.width > maxTextWidth) {
          while (artistMetrics.width > maxTextWidth && artist.length > 3) {
            artist = artist.slice(0, -1);
            artistMetrics = ctx.measureText(artist + '…');
          }
          artist += '…';
        }
        ctx.fillText(artist, x, textCenterY + (r >= 115 ? 20 : 16));

        ctx.restore();
        ctx.restore();
      });

      ctx.restore(); // Restore translate
      ctx.restore(); // Restore dpr scale
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // =====================================================================
    // RESIZE HANDLER
    // =====================================================================
    const handleResize = () => {
      if (!container || !canvas || !wallsRef.current.length) return;
      const newW = container.clientWidth || 1200;
      const newH = Math.max(680, container.clientHeight || 800);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = newW * dpr;
      canvas.height = newH * dpr;
      canvas.style.width = `${newW}px`;
      canvas.style.height = `${newH}px`;

      const wallThickness = 160;
      const maxSections = 12;
      const walls = wallsRef.current;
      if (walls[0]) Matter.Body.setPosition(walls[0], { x: (newW * maxSections) / 2, y: -wallThickness / 2 });
      if (walls[1]) Matter.Body.setPosition(walls[1], { x: (newW * maxSections) / 2, y: newH * maxSections + wallThickness / 2 });
      if (walls[2]) Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: (newH * maxSections) / 2 });
      if (walls[3]) Matter.Body.setPosition(walls[3], { x: newW * maxSections + wallThickness / 2, y: (newH * maxSections) / 2 });
    };

    window.addEventListener('resize', handleResize);

    // =====================================================================
    // DEVELOPMENT DEBUGGER HELPER
    // =====================================================================
    if (typeof window !== 'undefined') {
      window.__superfind_debug__ = {
        captureBubbleSnapshot: () => {
          const bubbles = Array.from(bubblesMapRef.current.values());
          return {
            timestamp: performance.now(),
            selectedTrackId: propsRef.current.currentTrack?.id || null,
            bubbles: bubbles.map(b => ({
              id: b.id,
              bodyId: b.body.id,
              x: Number(b.body.position.x.toFixed(2)),
              y: Number(b.body.position.y.toFixed(2)),
              vx: Number(b.body.velocity.x.toFixed(3)),
              vy: Number(b.body.velocity.y.toFixed(3)),
              radius: Number(b.radius.toFixed(1)),
              palette: b.palette.name,
              alpha: Number(b.alpha.toFixed(2)),
            }))
          };
        },
        compareSnapshots: (snapA, snapB) => {
          const dt = (snapB.timestamp - snapA.timestamp) / 1000;
          const report = [];
          snapA.bubbles.forEach(bA => {
            const bB = snapB.bubbles.find(b => b.id === bA.id);
            if (!bB) return;
            const dx = bB.x - bA.x;
            const dy = bB.y - bA.y;
            const dist = Math.hypot(dx, dy);
            const isStableBody = bA.bodyId === bB.bodyId;
            const isContinuous = dist < 35 || (dist / Math.max(0.016, dt)) < 500;
            report.push({
              trackId: bA.id,
              bodyIdA: bA.bodyId,
              bodyIdB: bB.bodyId,
              bodyStable: isStableBody,
              posA: `(${bA.x}, ${bA.y})`,
              posB: `(${bB.x}, ${bB.y})`,
              delta: `(${dx.toFixed(2)}, ${dy.toFixed(2)})`,
              distance: Number(dist.toFixed(2)),
              status: isContinuous && isStableBody ? 'CONTINUOUS' : 'SUSPICIOUS_JUMP',
            });
          });
          return report;
        },
        getPhysicsStats: () => ({
          bodyCount: engine.world.bodies.length,
          bubbleCount: bubblesMapRef.current.size,
          activeTrack: propsRef.current.currentTrack?.id || null,
          isPlaying: propsRef.current.isPlaying,
        })
      };
    }

    return () => {
      console.log('[BubbleWorld] unmounted (Cleaning up Engine)');
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Pointer Handlers
  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldX = x + scrollOffsetRef.current.x;
    const worldY = y + scrollOffsetRef.current.y;

    mousePosRef.current = {
      x: worldX,
      y: worldY,
      isDown: mousePosRef.current.isDown,
      vx: worldX - mousePosRef.current.lastX,
      vy: worldY - mousePosRef.current.lastY,
      lastX: worldX,
      lastY: worldY,
    };

    const bubbles = Array.from(bubblesMapRef.current.values());
    const hovered = bubbles.find(b => {
      const dx = b.body.position.x - worldX;
      const dy = b.body.position.y - worldY;
      return Math.hypot(dx, dy) <= b.radius;
    });

    if (hovered) {
      setHoveredTrack(hovered);
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredTrack(null);
      canvas.style.cursor = 'default';
    }
  }, []);

  const handlePointerDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldX = x + scrollOffsetRef.current.x;
    const worldY = y + scrollOffsetRef.current.y;

    mousePosRef.current.isDown = true;

    const bubbles = Array.from(bubblesMapRef.current.values());
    const clicked = bubbles.find(b => {
      const dx = b.body.position.x - worldX;
      const dy = b.body.position.y - worldY;
      return Math.hypot(dx, dy) <= b.radius;
    });

    if (clicked && propsRef.current.onPlayTrack) {
      propsRef.current.onPlayTrack(clicked.track);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    mousePosRef.current.isDown = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    mousePosRef.current = { x: -1000, y: -1000, isDown: false, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
    setHoveredTrack(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden touch-none select-none z-0"
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full block cursor-default"
      />

      {/* Hovered Curation Note Tooltip Bubble */}
      {hoveredTrack && hoveredTrack.reasoning && (
        <div
          className="absolute z-30 pointer-events-none px-4 py-2.5 rounded-2xl bubble-capsule max-w-xs transition-all duration-150 animate-fadeIn shadow-xl"
          style={{
            left: `${Math.min(window.innerWidth - 320, Math.max(20, hoveredTrack.body.position.x - 120))}px`,
            top: `${Math.max(20, hoveredTrack.body.position.y - hoveredTrack.radius - 60)}px`,
          }}
        >
          <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nota de Curaduría IA</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-snug">
            "{hoveredTrack.reasoning}"
          </p>
        </div>
      )}
    </div>
  );
}
