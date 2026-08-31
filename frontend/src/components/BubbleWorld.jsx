import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Sparkles, TrendingUp, Music, Radio, Filter, RefreshCw } from 'lucide-react';

/**
 * BubbleWorld - 2D Interactive Physics & Organic Soap Bubble Canvas.
 * 
 * Features:
 * - Matter.js physics engine with soft buoyancy, gentle drift & inter-bubble repulsion.
 * - Fluid surface tension meniscus connecting adjacent touching bubbles.
 * - Pearlescent iridescent soap-film rendering with specular highlights & refraction.
 * - Integrated typography (Title & Artist) inside each bubble.
 * - No horizontal rails or grids: true free-floating 2D musical constellation.
 * - Filter/Cluster switcher to explore by category (Todos, Sugeridos IA, Top 24h, Novedades, Me gusta).
 */
export default function BubbleWorld({
  suggestions = [],
  topTracks = [],
  recentTracks = [],
  likedTrackIds = [],
  currentTrack,
  isPlaying,
  onPlayTrack,
  searchQuery = '',
  selectedGenre = 'all',
  activeCategory = 'all',
  onSelectCategory,
  onRefreshGemini,
  isRefreshingAi = false
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const bubblesRef = useRef([]); // holds { body, track, category, radius, targetRadius, baseRadius, isHovered, phase, gleamAngle }
  const animationFrameRef = useRef(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, isDown: false });
  const draggedBubbleRef = useRef(null);

  const [hoveredTrack, setHoveredTrack] = useState(null);

  // Combine and deduplicate all tracks into a rich collection with assigned cluster tags
  const allBubblesData = React.useMemo(() => {
    const map = new Map();

    // 1. Suggestions (AI) - high visual hierarchy
    suggestions.forEach((item, idx) => {
      const t = item.track || item;
      if (t && t.id) {
        map.set(t.id, {
          track: t,
          category: 'suggestions',
          categoryLabel: 'con IA',
          tier: item.tier || 'GROWING',
          reasoning: item.reasoning,
          baseRadius: idx === 0 ? 82 : idx < 3 ? 72 : 62,
        });
      }
    });

    // 2. Top 24h
    topTracks.forEach((t, idx) => {
      if (t && t.id && !map.has(t.id)) {
        map.set(t.id, {
          track: t,
          category: 'top24h',
          categoryLabel: 'Top 24h',
          tier: null,
          reasoning: null,
          baseRadius: idx === 0 ? 76 : idx < 4 ? 66 : 58,
        });
      }
    });

    // 3. Recent releases
    recentTracks.forEach((t, idx) => {
      if (t && t.id && !map.has(t.id)) {
        map.set(t.id, {
          track: t,
          category: 'recent',
          categoryLabel: 'Novedad',
          tier: null,
          reasoning: null,
          baseRadius: idx < 3 ? 64 : 54,
        });
      }
    });

    return Array.from(map.values());
  }, [suggestions, topTracks, recentTracks]);

  // Filter items based on search query, genre, and active category
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allBubblesData.filter(item => {
      const t = item.track;
      // Search query filter
      const matchQuery = !q ||
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q);

      // Genre filter
      const matchGenre = selectedGenre === 'all' ||
        t.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

      // Category filter
      const matchCat = activeCategory === 'all' ||
        (activeCategory === 'suggestions' && item.category === 'suggestions') ||
        (activeCategory === 'top24h' && item.category === 'top24h') ||
        (activeCategory === 'recent' && item.category === 'recent') ||
        (activeCategory === 'liked' && likedTrackIds.includes(t.id));

      return matchQuery && matchGenre && matchCat;
    });
  }, [allBubblesData, searchQuery, selectedGenre, activeCategory, likedTrackIds]);

  // Initialize and update Matter.js physics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 900;
    const height = Math.max(550, container.clientHeight || 650);

    // Create Matter Engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
    });
    engineRef.current = engine;

    // Walls to keep bubbles inside
    const wallOptions = { isStatic: true, restitution: 0.9, friction: 0 };
    const wallThickness = 120;
    const walls = [
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions),
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions),
    ];
    Matter.World.add(engine.world, walls);

    // Spawn bubbles in pleasant spatial clusters
    const newBubbles = filteredData.map((data, index) => {
      // Determine initial organic position based on category
      let seedX, seedY;
      const count = filteredData.length;

      if (data.category === 'suggestions') {
        seedX = width * 0.28 + (Math.random() - 0.5) * (width * 0.35);
        seedY = height * 0.35 + (Math.random() - 0.5) * (height * 0.35);
      } else if (data.category === 'top24h') {
        seedX = width * 0.72 + (Math.random() - 0.5) * (width * 0.35);
        seedY = height * 0.40 + (Math.random() - 0.5) * (height * 0.35);
      } else {
        seedX = width * 0.50 + (Math.random() - 0.5) * (width * 0.6);
        seedY = height * 0.70 + (Math.random() - 0.5) * (height * 0.3);
      }

      // Keep inside boundaries
      const padding = data.baseRadius + 20;
      seedX = Math.max(padding, Math.min(width - padding, seedX));
      seedY = Math.max(padding, Math.min(height - padding, seedY));

      const body = Matter.Bodies.circle(seedX, seedY, data.baseRadius, {
        restitution: 0.85,
        frictionAir: 0.05,
        friction: 0.05,
        mass: data.baseRadius * 0.1,
      });

      Matter.World.add(engine.world, body);

      return {
        id: data.track.id,
        body,
        track: data.track,
        category: data.category,
        categoryLabel: data.categoryLabel,
        tier: data.tier,
        reasoning: data.reasoning,
        baseRadius: data.baseRadius,
        radius: data.baseRadius,
        targetRadius: data.baseRadius,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.008 + Math.random() * 0.012,
        driftAngle: Math.random() * Math.PI * 2,
      };
    });

    bubblesRef.current = newBubbles;

    // Resize canvas to display crisp Retina / HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Render loop
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Update Matter Physics
      Matter.Engine.update(engine, dt);

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Soft atmospheric background ambient lights
      ctx.save();
      const gradBg = ctx.createRadialGradient(width * 0.3, height * 0.3, 50, width * 0.3, height * 0.3, width * 0.6);
      gradBg.addColorStop(0, 'rgba(238, 242, 255, 0.45)');
      gradBg.addColorStop(0.5, 'rgba(253, 242, 248, 0.3)');
      gradBg.addColorStop(1, 'rgba(248, 250, 255, 0)');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      const bubbles = bubblesRef.current;

      // 2. Physics & Fluid Forces (Brownian drift + gentle repulsion + mouse displacement)
      const mouse = mousePosRef.current;

      bubbles.forEach((b, i) => {
        b.phase += b.phaseSpeed;

        // Subtle buoyant wander force
        const forceMagnitude = 0.00012 * b.body.mass;
        const fx = Math.cos(b.phase + b.driftAngle) * forceMagnitude;
        const fy = Math.sin(b.phase * 0.8 + b.driftAngle) * forceMagnitude;
        Matter.Body.applyForce(b.body, b.body.position, { x: fx, y: fy });

        // Center gravity pull towards category centroids to keep clusters coherent
        let targetX = width / 2;
        let targetY = height / 2;
        if (b.category === 'suggestions') {
          targetX = width * 0.32;
          targetY = height * 0.38;
        } else if (b.category === 'top24h') {
          targetX = width * 0.68;
          targetY = height * 0.40;
        } else {
          targetX = width * 0.50;
          targetY = height * 0.68;
        }

        const dxCenter = targetX - b.body.position.x;
        const dyCenter = targetY - b.body.position.y;
        Matter.Body.applyForce(b.body, b.body.position, {
          x: dxCenter * 0.000015 * b.body.mass,
          y: dyCenter * 0.000015 * b.body.mass,
        });

        // Mouse interaction push / repulsion
        const dxMouse = b.body.position.x - mouse.x;
        const dyMouse = b.body.position.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < b.radius + 60 && distMouse > 0) {
          const pushForce = (1 - distMouse / (b.radius + 60)) * 0.0018 * b.body.mass;
          Matter.Body.applyForce(b.body, b.body.position, {
            x: (dxMouse / distMouse) * pushForce,
            y: (dyMouse / distMouse) * pushForce,
          });
        }

        // Soft Inter-bubble repulsion (prevents stacking, creates organic liquid spacing)
        for (let j = i + 1; j < bubbles.length; j++) {
          const b2 = bubbles[j];
          const dx = b2.body.position.x - b.body.position.x;
          const dy = b2.body.position.y - b.body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.radius + b2.radius + 12;

          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const repForce = overlap * 0.00008;
            const rx = (dx / dist) * repForce;
            const ry = (dy / dist) * repForce;
            Matter.Body.applyForce(b.body, b.body.position, { x: -rx, y: -ry });
            Matter.Body.applyForce(b2.body, b2.body.position, { x: rx, y: ry });
          }
        }

        // Smooth radius transition on hover
        const isCurrentTrackPlaying = currentTrack && currentTrack.id === b.track.id;
        const isHovered = distMouse <= b.radius;
        b.targetRadius = isHovered
          ? b.baseRadius * 1.08
          : isCurrentTrackPlaying
          ? b.baseRadius * 1.04
          : b.baseRadius;

        b.radius += (b.targetRadius - b.radius) * 0.1;
      });

      // 3. Surface Tension Meniscus / Touching Soap Bubble Bridges
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];
          const dx = b2.body.position.x - b1.body.position.x;
          const dy = b2.body.position.y - b1.body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const touchThreshold = b1.radius + b2.radius + 28;

          if (dist < touchThreshold && dist > Math.abs(b1.radius - b2.radius)) {
            // Draw iridescent fluid meniscus connecting the two touching soap bubbles
            const t = 1 - (dist - (b1.radius + b2.radius)) / 28;
            const alpha = Math.max(0, Math.min(0.55, t * 0.65));

            const angle = Math.atan2(dy, dx);
            const midX = (b1.body.position.x + b2.body.position.x) / 2;
            const midY = (b1.body.position.y + b2.body.position.y) / 2;

            ctx.save();
            const bridgeGrad = ctx.createLinearGradient(
              b1.body.position.x, b1.body.position.y,
              b2.body.position.x, b2.body.position.y
            );
            bridgeGrad.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.7})`);
            bridgeGrad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.9})`);
            bridgeGrad.addColorStop(1, `rgba(236, 72, 153, ${alpha * 0.7})`);

            ctx.strokeStyle = bridgeGrad;
            ctx.lineWidth = Math.max(2, 8 * t);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(
              b1.body.position.x + Math.cos(angle) * (b1.radius * 0.85),
              b1.body.position.y + Math.sin(angle) * (b1.radius * 0.85)
            );
            ctx.lineTo(
              b2.body.position.x - Math.cos(angle) * (b2.radius * 0.85),
              b2.body.position.y - Math.sin(angle) * (b2.radius * 0.85)
            );
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 4. Render Each Individual Soap Bubble
      bubbles.forEach(b => {
        const x = b.body.position.x;
        const y = b.body.position.y;
        const r = b.radius;
        const isCurrent = currentTrack && currentTrack.id === b.track.id;
        const isPlayingThis = isCurrent && isPlaying;
        const dxMouse = x - mouse.x;
        const dyMouse = y - mouse.y;
        const isHovered = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) <= r;

        ctx.save();

        // A. Subtle atmospheric drop shadow
        ctx.shadowColor = isCurrent ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.08)';
        ctx.shadowBlur = isCurrent ? 28 : isHovered ? 20 : 14;
        ctx.shadowOffsetY = isCurrent ? 8 : 6;

        // B. Translucent pearlescent soap bubble body fill
        const bodyGrad = ctx.createRadialGradient(
          x - r * 0.35, y - r * 0.35, r * 0.05,
          x, y, r
        );
        bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        bodyGrad.addColorStop(0.28, 'rgba(245, 249, 255, 0.65)');
        bodyGrad.addColorStop(0.60, 'rgba(235, 243, 255, 0.32)');
        bodyGrad.addColorStop(0.88, 'rgba(224, 235, 255, 0.12)');
        bodyGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        ctx.shadowColor = 'transparent'; // clear shadow

        // C. Multi-chromatic Iridescent Outer Rim
        const rimGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        rimGrad.addColorStop(0, 'rgba(6, 182, 212, 0.55)');   // cyan
        rimGrad.addColorStop(0.35, 'rgba(139, 92, 246, 0.55)'); // lavender
        rimGrad.addColorStop(0.7, 'rgba(236, 72, 153, 0.5)');   // pink
        rimGrad.addColorStop(1, 'rgba(6, 182, 212, 0.55)');   // cyan

        ctx.lineWidth = isCurrent ? 2.5 : isHovered ? 2 : 1.4;
        ctx.strokeStyle = rimGrad;
        ctx.stroke();

        // Extra outer white crisp border
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.stroke();

        // D. Inner Specular Gleam Highlight (Crescent in upper-left quadrant)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4.2);

        const gleamGrad = ctx.createLinearGradient(0, -r * 0.82, 0, -r * 0.4);
        gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(0, -r * 0.65, r * 0.38, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fillStyle = gleamGrad;
        ctx.fill();

        // Tiny upper reflection dot
        ctx.beginPath();
        ctx.arc(r * 0.35, -r * 0.62, r * 0.045, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        // Secondary bottom-right warm refraction bounce
        const bottomGlow = ctx.createRadialGradient(0, r * 0.68, 0, 0, r * 0.68, r * 0.35);
        bottomGlow.addColorStop(0, 'rgba(244, 114, 182, 0.25)');
        bottomGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
        bottomGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(0, r * 0.65, r * 0.42, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = bottomGlow;
        ctx.fill();

        ctx.restore(); // restore rotation

        // E. Playing Pulsing Aura
        if (isCurrent) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r + 4 + Math.sin(time * 0.005) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = isPlayingThis ? 'rgba(99, 102, 241, 0.45)' : 'rgba(99, 102, 241, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }

        // F. Inside Typography: Title & Artist
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxTextWidth = r * 1.55;

        // Visualizer bar if actively playing
        let textCenterY = y;
        if (isPlayingThis) {
          textCenterY = y + 5;
          const barW = 2.5;
          const gap = 2;
          const barCount = 4;
          const totalW = barCount * barW + (barCount - 1) * gap;
          const startX = x - totalW / 2;

          for (let bIdx = 0; bIdx < barCount; bIdx++) {
            const barH = 3 + Math.abs(Math.sin(time * 0.008 + bIdx * 0.9)) * 9;
            ctx.fillStyle = bIdx % 2 === 0 ? '#6366f1' : '#06b6d4';
            ctx.fillRect(startX + bIdx * (barW + gap), y - r * 0.38 - barH, barW, barH);
          }
        }

        // Category / Tier Pill at Top
        if (b.categoryLabel && r >= 60) {
          const pillY = y - r * 0.48;
          ctx.font = '600 8.5px "Plus Jakarta Sans", sans-serif';
          const tagText = b.tier === 'UNDERGROUND' ? 'GEMA' : b.categoryLabel;
          const tagMetrics = ctx.measureText(tagText);
          const tagW = tagMetrics.width + 10;
          const tagH = 13;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(x - tagW / 2, pillY - tagH / 2, tagW, tagH, 7);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = b.category === 'suggestions' ? '#4f46e5' : '#0f172a';
          ctx.fillText(tagText, x, pillY + 0.5);
        }

        // Title
        const titleFontSize = r >= 75 ? 12 : r >= 60 ? 11 : 9.5;
        ctx.font = `700 ${titleFontSize}px "Outfit", "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isHovered ? '#4338ca' : '#0f172a';

        // Wrap or truncate title
        let title = b.track.title || 'Canción';
        let metrics = ctx.measureText(title);
        if (metrics.width > maxTextWidth) {
          while (metrics.width > maxTextWidth && title.length > 3) {
            title = title.slice(0, -1);
            metrics = ctx.measureText(title + '…');
          }
          title += '…';
        }
        ctx.fillText(title, x, textCenterY - 4);

        // Artist
        const artistFontSize = r >= 75 ? 10 : r >= 60 ? 9 : 8;
        ctx.font = `500 ${artistFontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#64748b';

        let artist = b.track.artist || 'Artista';
        let artistMetrics = ctx.measureText(artist);
        if (artistMetrics.width > maxTextWidth) {
          while (artistMetrics.width > maxTextWidth && artist.length > 3) {
            artist = artist.slice(0, -1);
            artistMetrics = ctx.measureText(artist + '…');
          }
          artist += '…';
        }
        ctx.fillText(artist, x, textCenterY + 11);

        ctx.restore();

        ctx.restore();
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // Resize handling
    const handleResize = () => {
      if (!container || !canvas) return;
      const newW = container.clientWidth || 900;
      const newH = Math.max(550, container.clientHeight || 650);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = newW * dpr;
      canvas.height = newH * dpr;
      canvas.style.width = `${newW}px`;
      canvas.style.height = `${newH}px`;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [filteredData, currentTrack, isPlaying]);

  // Pointer Interaction Handlers
  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePosRef.current = { x, y, isDown: mousePosRef.current.isDown };

    // Check hovered bubble for tooltips
    const bubbles = bubblesRef.current;
    const hovered = bubbles.find(b => {
      const dx = b.body.position.x - x;
      const dy = b.body.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= b.radius;
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

    mousePosRef.current = { x, y, isDown: true };

    const bubbles = bubblesRef.current;
    const clicked = bubbles.find(b => {
      const dx = b.body.position.x - x;
      const dy = b.body.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= b.radius;
    });

    if (clicked) {
      onPlayTrack(clicked.track);
    }
  }, [onPlayTrack]);

  const handlePointerLeave = useCallback(() => {
    mousePosRef.current = { x: -1000, y: -1000, isDown: false };
    setHoveredTrack(null);
  }, []);

  return (
    <div className="w-full relative">
      
      {/* Category Constellation Navigation Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-full border border-slate-200/80 shadow-sm backdrop-blur-md">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Todas las burbujas ({allBubblesData.length})
          </button>

          <button
            onClick={() => onSelectCategory('suggestions')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'suggestions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Sugeridos IA ({suggestions.length})</span>
          </button>

          <button
            onClick={() => onSelectCategory('top24h')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'top24h'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-cyan-500" />
            <span>Top 24hs ({topTracks.length})</span>
          </button>

          <button
            onClick={() => onSelectCategory('recent')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'recent'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Music className="w-3 h-3 text-teal-500" />
            <span>Novedades ({recentTracks.length})</span>
          </button>
        </div>

        {/* Refresh AI recommendations button */}
        {onRefreshGemini && (
          <button
            onClick={onRefreshGemini}
            disabled={isRefreshingAi}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 hover:bg-indigo-100 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Recalcular constelación con Gemini AI"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingAi ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAi ? 'Curando...' : 'Reordenar con IA'}</span>
          </button>
        )}
      </div>

      {/* Main Interactive Floating Bubble Canvas World */}
      <div
        ref={containerRef}
        className="w-full h-[580px] sm:h-[680px] rounded-3xl relative overflow-hidden border border-slate-200/70 bg-gradient-to-b from-white/90 via-indigo-50/20 to-pink-50/15 shadow-[0_12px_45px_-12px_rgba(99,102,241,0.08)] backdrop-blur-xl touch-none select-none"
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full block"
        />

        {/* Hovered Curation Tooltip Pill */}
        {hoveredTrack && hoveredTrack.reasoning && (
          <div
            className="absolute z-30 pointer-events-none px-3.5 py-2 rounded-2xl bg-white/95 border border-indigo-200/80 shadow-lg text-slate-800 text-xs max-w-xs transition-all duration-150 animate-fadeIn"
            style={{
              left: `${Math.min(window.innerWidth - 280, Math.max(20, hoveredTrack.body.position.x - 100))}px`,
              top: `${Math.max(15, hoveredTrack.body.position.y - hoveredTrack.radius - 48)}px`,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 text-[10px] uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Nota de Curaduría IA</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              "{hoveredTrack.reasoning}"
            </p>
          </div>
        )}

        {/* Bottom Explorer Hint */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] text-slate-400 font-medium pointer-events-none">
          <span>✨ Hacé clic en cualquier burbuja para reproducir</span>
          <span className="hidden sm:inline">Tensión superficial & constelaciones conectadas</span>
        </div>
      </div>

    </div>
  );
}
