import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import Matter from 'matter-js';

/**
 * ThreeBubbleWorld — Photorealistic 3D Soap Bubble Discovery World
 * 
 * Powered by Three.js (Visual Rendering) + Matter.js (Physics Engine)
 * 
 * Architectural Highlights:
 * 1. TRUE SOAP BUBBLE SHADER: Thin-film interference iridescence, Fresnel reflection,
 *    specular crescent gleam, specular point highlight, and bottom caustic bounce.
 * 2. ELASTIC SURFACE TENSION WOBBLE: Harmonic normal displacement in vertex shader.
 * 3. MATTER.JS PHYSICS DECOUPLING: Rock-solid 2D physics mapped directly to 3D space.
 * 4. ULTRA-CRISP SUBPIXEL TYPOGRAPHY: 2X Retina billboard canvas textures for titles & badges.
 * 5. HERO WAVEFORM EQUALIZER: Integrated volumetric audio visualizer inside active bubble.
 * 6. INSTANCED AMBIENT MICRO-BUBBLES: 50 lightweight floating soap droplets in single draw call.
 * 7. WATER HORIZON PLANE: Reflective liquid caustic floor with ambient wave animation.
 * 8. SHORT-RANGE SURFACE MENISCUS: Organic fluid bridge only when bubbles actually touch.
 */

// Soap Bubble Vertex Shader with Living Elastic Deformation, Velocity Inertia & Audio Reactivity
const bubbleVertexShader = `
uniform float uTime;
uniform float uWobble;
uniform float uAudioPulse;
uniform vec2 uVelocity;
uniform float uRadius;
uniform vec2 uHoverOffset;
uniform float uHoverIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vLocalPosition = position;

  // 1. Organic Breathing Pulse (living harmonic respiration)
  float breathing = sin(uTime * 2.2 + position.y * 0.02) * (uRadius * 0.022);

  // 2. Liquid Surface Tension Waves (asymmetric fluid wobble of soap membrane)
  float tension = (
      sin(normal.x * 2.6 + uTime * 2.5) * 0.45
    + cos(normal.y * 3.4 - uTime * 2.0) * 0.35
    + sin((normal.z + normal.x) * 2.8 + uTime * 2.8) * 0.20
  ) * (uRadius * 0.035 * uWobble);

  // 3. Audio Transients Micro-Oscillation (acoustic surface ripples)
  float acoustic = 0.0;
  if (uAudioPulse > 0.01) {
    acoustic = sin(normal.y * 8.0 + uTime * 9.0) * cos(normal.x * 7.0 - uTime * 7.0) * (uRadius * 0.040 * uAudioPulse);
  }

  // 4. Elastic Inertia (Squash & Stretch along Matter.js velocity vector)
  float speed = length(uVelocity);
  vec2 velDir = speed > 0.001 ? normalize(uVelocity) : vec2(0.0);
  float stretch = dot(normal.xy, velDir) * min(speed * 0.10, uRadius * 0.07);

  // 5. Physical Soap Membrane Hover Compression (Section 2.4)
  float hoverDisp = 0.0;
  if (uHoverIntensity > 0.01) {
    float hLen = length(uHoverOffset);
    vec2 hoverDir = hLen > 0.001 ? uHoverOffset / hLen : vec2(0.0);
    float hoverAlign = dot(normal.xy, hoverDir);
    hoverDisp = -hoverAlign * (uRadius * 0.065 * uHoverIntensity);
  }

  // Total living displacement
  vec3 displacedPosition = position + normal * (breathing + tension + acoustic + hoverDisp) + vec3(velDir * stretch, 0.0);

  vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`;

// Soap Bubble Fragment Shader with Fluid Swirl Iridescence & Anamorphic Soap Gleams
const bubbleFragmentShader = `
uniform float uTime;
uniform float uIsDarkMode;
uniform float uIsCurrent;
uniform float uAudioPulse;
uniform vec3 uPaletteColor;
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

// Fast Simplex 3D Noise for Fluid Soap Film Marbling
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Thin-Film wavelength interference (Vivid Pearlescent Soap of Ref 2: Turquoise, Lilac, Peach, Emerald, Gold)
vec3 soapInterference(float thickness) {
  vec3 phase = vec3(thickness * 6.2) + vec3(0.05, 2.05, 4.15);
  vec3 col = 0.5 + 0.5 * cos(phase);
  // Boost vibrancy of turquoise, lilac, peach and gold spectrum
  col = mix(col, vec3(0.22, 0.88, 0.98), smoothstep(0.25, 0.65, col.b) * 0.40);
  col = mix(col, vec3(0.98, 0.82, 0.50), smoothstep(0.35, 0.80, col.r * col.g) * 0.35);
  col = mix(col, vec3(0.85, 0.65, 0.98), smoothstep(0.30, 0.70, col.r * col.b) * 0.35);
  return col * 1.22;
}

void main() {
  vec3 normal = normalize(vNormal);
  // In Orthographic projection, all view rays are strictly parallel to the Z axis
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Optical Fresnel factor (crystal transparent center, glowing shimmering rim)
  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 2.1);
  float rimEdge = pow(1.0 - NdotV, 6.5);

  // Dynamic Fluid Swirls: Living currents flowing across the soap bubble membrane
  vec3 sphereCoords = normalize(vLocalPosition);
  float flowSpeed = uTime * (0.12 + uAudioPulse * 0.18);
  float noisePattern1 = snoise(sphereCoords * 2.2 + vec3(flowSpeed * 0.3, flowSpeed * 0.5, flowSpeed * 0.2));
  float noisePattern2 = snoise(sphereCoords * 4.0 - vec3(flowSpeed * 0.4, -flowSpeed * 0.3, flowSpeed * 0.5));
  float filmThickness = fresnel * 1.6 + (noisePattern1 * 0.45 + noisePattern2 * 0.25);

  vec3 iridColor = soapInterference(filmThickness);

  // Subtle Track Album Tint (Ultra-translucent interior, zero milky blowout)
  vec3 interiorTint;
  if (uIsDarkMode > 0.5) {
    interiorTint = mix(vec3(0.02, 0.03, 0.06), uPaletteColor, 0.28);
  } else {
    interiorTint = mix(vec3(0.99, 0.99, 1.0), uPaletteColor, 0.05);
  }

  // 1. Crescent Moon Window Highlight (Upper-Left curved gleam matching reference)
  vec2 rimCenter = vec2(-0.50, 0.50);
  float distCrescent = length(normal.xy - rimCenter);
  float crescentGleam = smoothstep(0.42, 0.06, distCrescent) * smoothstep(0.18, 0.88, 1.0 - normal.z);
  vec3 crescentColor = uIsDarkMode > 0.5 ? mix(vec3(0.90, 0.96, 1.0), uGlowColor, 0.25) : vec3(1.0);
  vec3 crescentLight = crescentColor * crescentGleam * (uIsDarkMode > 0.5 ? 0.75 : 1.15);

  // 2. 4-Point Sparkling Star Highlight (Upper-Right matching reference)
  vec2 starPos = vec2(0.52, 0.54);
  vec2 starDelta = abs(normal.xy - starPos);
  float starCross = max(
    smoothstep(0.16, 0.0, starDelta.x) * smoothstep(0.026, 0.0, starDelta.y),
    smoothstep(0.16, 0.0, starDelta.y) * smoothstep(0.026, 0.0, starDelta.x)
  );
  float starCenter = smoothstep(0.06, 0.0, length(normal.xy - starPos));
  float starGlint = (starCross * 0.75 + starCenter * 1.1) * (0.85 + 0.35 * sin(uTime * 3.5 + sphereCoords.x * 5.0));
  vec3 starColor = vec3(1.0) * starGlint * (uIsDarkMode > 0.5 ? 1.05 : 1.35);

  // 3. Lower Soft Caustic Bounce (Ambient water glow)
  float bottomBounce = smoothstep(-0.20, -0.92, normal.y) * fresnel;
  vec3 causticColor = mix(vec3(0.35, 0.75, 1.0), uGlowColor, 0.55) * bottomBounce * (uIsDarkMode > 0.5 ? 0.40 : 0.65);

  // 4. Compose Living Color (G1-bis: Crystal Clean in Light + Thick Multicolor Rim in Dark)
  vec3 finalColor = interiorTint;
  
  if (uIsDarkMode > 0.5) {
    // Dark mode: Deep cosmic interior + thick multicolor rim (8-14% of radius)
    float iridWeight = 0.35 + fresnel * 0.65 + (noisePattern1 * 0.12);
    finalColor = mix(finalColor, iridColor * 1.35, clamp(iridWeight, 0.0, 1.0));
    
    // Thick vibrant multicolor rim matching reference_1_mapa.png
    float thickRim = pow(1.0 - NdotV, 2.5);
    vec3 thickRimColor = soapInterference(thickRim * 2.5 + noisePattern1 * 0.35 + sphereCoords.y * 1.5);
    finalColor += thickRimColor * thickRim * 1.45;
    
    // Razor 1px diamond edge
    finalColor += vec3(0.85, 0.95, 1.0) * rimEdge * 1.3;
  } else {
    // Light mode: Clean crystal transparency with vibrant additive soap shimmer
    float iridWeight = 0.22 + fresnel * 0.78 + (noisePattern1 * 0.08);
    vec3 vibrantShimmer = iridColor * 1.25;
    finalColor = mix(finalColor, vibrantShimmer, clamp(iridWeight, 0.0, 0.85));
    
    // Crisp pure white rim
    finalColor += vec3(1.0) * rimEdge * 1.4;
  }

  // Highlights
  finalColor += crescentLight + starColor + causticColor;

  if (uIsCurrent > 0.5) {
    finalColor += uGlowColor * (fresnel * 0.45 + 0.15 * (1.0 + uAudioPulse));
  }

  // Calibrated Soap Translucency: Clean glass center in Light, deep crystal in Dark
  float baseAlpha = uIsDarkMode > 0.5 ? 0.28 : mix(0.11, 0.22, fresnel);
  float rimAlpha = uIsDarkMode > 0.5 ? 0.92 : 0.85;
  float alpha = mix(baseAlpha, rimAlpha, fresnel) * uOpacity;

  // Add highlights to alpha without clipping
  alpha = clamp(alpha + crescentGleam * 0.50 + starGlint * 0.60 + rimEdge * 0.35, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Water Surface Plane Shaders
const waterVertexShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const waterFragmentShader = `
uniform float uTime;
uniform float uIsDarkMode;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  // Multilayer animated caustics ripple lines
  float y = vUv.y;
  float wave1 = sin(vUv.x * 14.0 + uTime * 0.7) * 0.05;
  float wave2 = cos(vUv.x * 22.0 - uTime * 0.5) * 0.03;
  float wave3 = sin((vUv.x + vUv.y) * 18.0 + uTime * 0.8) * 0.025;
  float caustics = smoothstep(0.30, 0.88, sin((y + wave1 + wave2 + wave3) * 26.0 + uTime * 0.45));
  float sparkle = pow(max(0.0, sin(vUv.x * 35.0 + uTime * 1.2) * cos(vUv.y * 30.0 - uTime * 0.8)), 8.0);

  vec3 waterColor;
  float alpha;

  if (uIsDarkMode > 0.5) {
    waterColor = mix(vec3(0.04, 0.07, 0.20), vec3(0.38, 0.68, 0.98), caustics * 0.55);
    waterColor += vec3(0.65, 0.88, 1.0) * sparkle * 0.5;
    alpha = smoothstep(0.0, 0.92, y) * 0.38;
  } else {
    waterColor = mix(vec3(0.92, 0.96, 1.0), vec3(0.55, 0.80, 0.98), caustics * 0.55);
    waterColor += mix(vec3(0.95, 0.82, 0.98), vec3(1.0), sparkle) * (caustics * 0.35 + sparkle * 0.75);
    alpha = smoothstep(0.0, 0.95, y) * 0.55;
  }

  gl_FragColor = vec4(waterColor, alpha);
}
`;

// Dedicated Soap Membrane Neck Fragment Shader (Luminous, pearlescent fluid bridges)
const neckFragmentShader = `
uniform float uTime;
uniform float uIsDarkMode;
uniform vec3 uPaletteColor;
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

vec3 soapInterference(float thickness) {
  vec3 phase = vec3(thickness * 6.2) + vec3(0.05, 2.05, 4.15);
  vec3 col = 0.5 + 0.5 * cos(phase);
  col = mix(col, vec3(0.22, 0.88, 0.98), smoothstep(0.25, 0.65, col.b) * 0.40);
  col = mix(col, vec3(0.98, 0.82, 0.50), smoothstep(0.35, 0.80, col.r * col.g) * 0.35);
  return col * 1.25;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 2.0);
  float rimEdge = pow(1.0 - NdotV, 5.0);

  // Longitudinal soap flow along the neck
  float flow = sin(vUv.y * 14.0 - uTime * 2.2) * 0.3 + cos(vUv.x * 10.0 + uTime * 1.5) * 0.2;
  vec3 iridColor = soapInterference(fresnel * 1.5 + flow);

  vec3 baseColor;
  if (uIsDarkMode > 0.5) {
    baseColor = mix(vec3(0.06, 0.08, 0.18), uGlowColor, 0.45);
  } else {
    baseColor = mix(vec3(0.95, 0.97, 1.0), uGlowColor, 0.25);
  }

  // Compose neck color
  vec3 finalColor = mix(baseColor, iridColor, fresnel * 0.85 + 0.15);
  finalColor += (uIsDarkMode > 0.5 ? vec3(0.7, 0.85, 1.0) : vec3(1.0)) * rimEdge * 1.1;

  // Specular sheen along the waist of the neck
  float waistGleam = smoothstep(0.3, 0.7, 1.0 - abs(vUv.y - 0.5) * 2.0) * rimEdge;
  finalColor += vec3(1.0) * waistGleam * 0.6;

  float baseAlpha = uIsDarkMode > 0.5 ? 0.32 : 0.30;
  float rimAlpha = uIsDarkMode > 0.5 ? 0.88 : 0.82;
  float alpha = mix(baseAlpha, rimAlpha, fresnel) * uOpacity;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Helper: Custom 3D Catenoid Geometry for Organic Soap Membrane Bridges
function createCatenoidGeometry(rEnd, rMid, height, radialSegs = 28, heightSegs = 12) {
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let yIndex = 0; yIndex <= heightSegs; yIndex++) {
    const v = yIndex / heightSegs;
    const t = (v - 0.5) * 2.0; // -1 to 1
    const currentR = rMid + (rEnd - rMid) * (t * t);
    const y = (v - 0.5) * height;

    for (let xIndex = 0; xIndex <= radialSegs; xIndex++) {
      const u = xIndex / radialSegs;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const x = currentR * cosT;
      const z = currentR * sinT;

      positions.push(x, y, z);
      normals.push(cosT, -t * 0.45, sinT);
      uvs.push(u, v);
    }
  }

  for (let yIndex = 0; yIndex < heightSegs; yIndex++) {
    for (let xIndex = 0; xIndex < radialSegs; xIndex++) {
      const a = yIndex * (radialSegs + 1) + xIndex;
      const b = (yIndex + 1) * (radialSegs + 1) + xIndex;
      const c = (yIndex + 1) * (radialSegs + 1) + (xIndex + 1);
      const d = yIndex * (radialSegs + 1) + (xIndex + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// Helper: Palette extractor
const PALETTE_DEFINITIONS = [
  { name: 'cyan', primary: '#38bdf8', secondary: '#818cf8', glow: 'rgba(56, 189, 248, 0.25)', glowDark: 'rgba(34, 211, 238, 0.35)', causticColor: 'rgba(56, 189, 248, 0.55)' },
  { name: 'purple', primary: '#c084fc', secondary: '#f472b6', glow: 'rgba(192, 132, 252, 0.25)', glowDark: 'rgba(168, 85, 247, 0.35)', causticColor: 'rgba(192, 132, 252, 0.55)' },
  { name: 'pink', primary: '#f472b6', secondary: '#fb7185', glow: 'rgba(244, 114, 182, 0.25)', glowDark: 'rgba(236, 72, 153, 0.35)', causticColor: 'rgba(244, 114, 182, 0.55)' },
  { name: 'amber', primary: '#fbbf24', secondary: '#f472b6', glow: 'rgba(251, 191, 36, 0.25)', glowDark: 'rgba(245, 158, 11, 0.35)', causticColor: 'rgba(251, 191, 36, 0.55)' },
  { name: 'emerald', primary: '#34d399', secondary: '#38bdf8', glow: 'rgba(52, 211, 153, 0.25)', glowDark: 'rgba(16, 185, 129, 0.35)', causticColor: 'rgba(52, 211, 153, 0.55)' },
];

function extractTrackPalette(track) {
  if (!track) return PALETTE_DEFINITIONS[0];
  const str = (track.title || '') + (track.artist || '') + (track.genre || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return PALETTE_DEFINITIONS[Math.abs(hash) % PALETTE_DEFINITIONS.length];
}

export default function ThreeBubbleWorld({
  dynamicSections = [],
  suggestions = [],
  topTracks = [],
  recentTracks = [],
  likedTrackIds = [],
  currentTrack,
  isPlaying = false,
  onPlayTrack,
  consumedTrackIds = new Set(),
  onConsumeTrack,
  searchQuery = '',
  selectedGenre = 'all',
  activeCategory = 'all',
  onSelectCategory,
  onRefreshGemini,
  isRefreshingAi = false,
  isDarkMode = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cameraOffsetRef = useRef({ x: 0, y: 0 });
  const waterMeshRef = useRef(null);
  const rendererRef = useRef(null);
  const bubblesMapRef = useRef(new Map());
  const imageCacheRef = useRef(new Map());
  const animationFrameRef = useRef(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, isDown: false });
  const dragStateRef = useRef({
    isDragging: false,
    bubble: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
  });
  const canvasDragRef = useRef({ isSwiping: false, startX: 0, startY: 0 });
  const activePopsRef = useRef([]);
  const [hoveredTrack, setHoveredTrack] = useState(null);

  // Synchronized prop references for the render loop
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
  }, [dynamicSections, currentTrack, isPlaying, isDarkMode, activeCategory, onSelectCategory, searchQuery, selectedGenre, likedTrackIds, consumedTrackIds, onPlayTrack, onConsumeTrack]);

  // Canonical constellation mapping matching reference_1_mapa.png & reference_2_musica.png
  const ANCHORS = useMemo(() => ({
    'track-1': { x: 0.51, y: 0.49, r: 224, label: 'EN REPRODUCCIÓN', isHero: true }, // Neon Horizon (Central Hero)
    'track-2': { x: 0.33, y: 0.38, r: 156, label: 'GEMA' },                           // Midnight Coffee (Top-Left)
    'track-3': { x: 0.44, y: 0.27, r: 104, label: 'GEMA' },                           // Urban Pulse (Top-Center)
    'track-4': { x: 0.65, y: 0.35, r: 145, label: 'con IA' },                         // Cybernetic Drift (Top-Right)
    'track-5': { x: 0.79, y: 0.45, r: 154, label: 'GEMA' },                          // Starlight Odyssey (Far-Right)
    'track-6': { x: 0.29, y: 0.64, r: 148, label: 'con IA' },                         // Zen Blossom (Bottom-Left)
    'track-7': { x: 0.73, y: 0.66, r: 148, label: 'con IA' },                        // Golden Hour Memories (Bottom-Right)
    'track-8': { x: 0.46, y: 0.71, r: 126, label: 'con IA' },                         // Echoes of Eternity (Bottom-Center)
    'track-9': { x: 0.35, y: 0.76, r: 86, label: null },                              // Falling Slowly
  }), []);

  // Title-based canonical slot resolver to guarantee reference parity regardless of data order
  const resolveAnchorKey = useCallback((track, index) => {
    if (!track) return 'track-1';
    const title = (track.title || '').toLowerCase().trim();
    if (title.includes('neon horizon')) return 'track-1';
    if (title.includes('midnight coffee')) return 'track-2';
    if (title.includes('urban pulse')) return 'track-3';
    if (title.includes('cybernetic drift')) return 'track-4';
    if (title.includes('starlight odyssey')) return 'track-5';
    if (title.includes('zen blossom')) return 'track-6';
    if (title.includes('golden hour')) return 'track-7';
    if (title.includes('echoes of eternity')) return 'track-8';
    if (title.includes('falling slowly')) return 'track-9';
    
    // Fallback based on id or index
    if (ANCHORS[track.id]) return track.id;
    const keys = ['track-1', 'track-2', 'track-3', 'track-4', 'track-5', 'track-6', 'track-7', 'track-8', 'track-9'];
    return keys[index % keys.length];
  }, [ANCHORS]);

  // Aggregated catalog data: Populates each dynamic section with its own galaxy of bubbles
  const allBubblesData = useMemo(() => {
    const list = [];
    const poolMap = new Map();

    // 1. Gather all unique tracks into a catalog pool
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
            r: sec.id === 'top24h' ? 145 : 135,
            label: sec.id === 'top24h' ? 'Top 1' : sec.label
          };
        } else {
          const phi = itemIdx * 2.399963;
          const dist = 115 + Math.sqrt(itemIdx) * 78;
          anchor = {
            x: Math.max(0.18, Math.min(0.84, 0.51 + (Math.cos(phi) * dist) / 1200)),
            y: Math.max(0.20, Math.min(0.80, 0.50 + (Math.sin(phi) * dist * 0.70) / 800)),
            r: Math.max(76, 118 - itemIdx * 2.8),
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

  // Helper: Draw authentic atmospheric landscape/cover art inside bubbles matching reference_1_mapa.png
  const drawAtmosphericLandscape = useCallback((ctx, key, center, radius, scale, isDark) => {
    const r = radius * scale * 0.94;
    ctx.save();

    ctx.globalAlpha = isDark ? 0.78 : 0.28;

    if (key === 'track-1') {
      // Neon Horizon: Sunset Skyline & City Silhouette
      const grad = ctx.createLinearGradient(center, center - r, center, center + r);
      grad.addColorStop(0.0, '#1e1035');
      grad.addColorStop(0.35, '#581c87');
      grad.addColorStop(0.65, '#be185d');
      grad.addColorStop(0.85, '#f97316');
      grad.addColorStop(1.0, '#fbbf24');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);

      // Glowing retro sun
      const sunGrad = ctx.createRadialGradient(center, center + r * 0.25, 0, center, center + r * 0.25, r * 0.45);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.7)');
      sunGrad.addColorStop(1, 'rgba(219, 39, 119, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(center, center + r * 0.25, r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // City skyscraper silhouettes
      ctx.fillStyle = isDark ? '#080a14' : 'rgba(99, 102, 241, 0.20)';
      const baseY = center + r * 0.40;
      const bldgs = [
        [-0.8, 0.35, 0.18], [-0.6, 0.55, 0.14], [-0.42, 0.40, 0.16], [-0.22, 0.70, 0.15],
        [-0.04, 0.85, 0.12], [0.10, 0.50, 0.16], [0.30, 0.65, 0.15], [0.50, 0.45, 0.18], [0.72, 0.35, 0.15]
      ];
      bldgs.forEach(([xRel, hRel, wRel]) => {
        const bx = center + xRel * r;
        const bw = wRel * r;
        const bh = hRel * r * 0.6;
        ctx.fillRect(bx, baseY - bh, bw, bh + r);
      });
    } else if (key === 'track-7') {
      // Golden Hour Memories: Warm Peach Sunset & Palm Trees
      const grad = ctx.createLinearGradient(center, center - r, center, center + r);
      grad.addColorStop(0.0, '#311020');
      grad.addColorStop(0.35, '#831843');
      grad.addColorStop(0.65, '#c2410c');
      grad.addColorStop(0.85, '#f59e0b');
      grad.addColorStop(1.0, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);

      // Palm tree silhouettes
      ctx.fillStyle = isDark ? '#060810' : 'rgba(217, 119, 6, 0.20)';
      ctx.strokeStyle = isDark ? '#060810' : 'rgba(217, 119, 6, 0.20)';
      ctx.lineWidth = 3.5 * scale;
      // Trunk 1
      ctx.beginPath();
      ctx.moveTo(center + r * 0.15, center + r);
      ctx.quadraticCurveTo(center + r * 0.3, center + r * 0.3, center + r * 0.25, center - r * 0.1);
      ctx.stroke();
      // Fronds
      const fx = center + r * 0.25, fy = center - r * 0.1;
      [[-0.45, -0.2], [-0.3, -0.4], [0.1, -0.45], [0.4, -0.3], [0.45, -0.05]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + dx * r * 0.4, fy + dy * r * 0.3, fx + dx * r * 0.65, fy + (dy + 0.15) * r * 0.45);
        ctx.stroke();
      });
    } else if (key === 'track-2') {
      // Midnight Coffee & Rain: Deep Indigo & Pine Silhouettes
      const grad = ctx.createLinearGradient(center, center - r, center, center + r);
      grad.addColorStop(0.0, '#030712');
      grad.addColorStop(0.45, '#0f172a');
      grad.addColorStop(0.80, '#1e1b4b');
      grad.addColorStop(1.0, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);

      // Pine trees
      ctx.fillStyle = isDark ? '#020617' : 'rgba(16, 185, 129, 0.20)';
      [-0.55, -0.25, 0.15, 0.50].forEach((xRel) => {
        const px = center + xRel * r;
        const py = center + r * 0.5;
        const ph = r * 0.55;
        ctx.beginPath();
        ctx.moveTo(px, py - ph);
        ctx.lineTo(px - r * 0.2, py);
        ctx.lineTo(px + r * 0.2, py);
        ctx.closePath();
        ctx.fill();
      });
    } else if (key === 'track-6') {
      // Zen Blossom: Lavender Mist & Pagoda Silhouette
      const grad = ctx.createLinearGradient(center, center - r, center, center + r);
      grad.addColorStop(0.0, '#1e1035');
      grad.addColorStop(0.50, '#581c87');
      grad.addColorStop(0.80, '#9d174d');
      grad.addColorStop(1.0, '#f472b6');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);

      // Pagoda tier silhouette
      ctx.fillStyle = isDark ? '#060814' : 'rgba(168, 85, 247, 0.20)';
      const py = center + r * 0.42;
      ctx.fillRect(center - r * 0.25, py - r * 0.25, r * 0.5, r * 0.35);
      ctx.beginPath();
      ctx.moveTo(center - r * 0.38, py - r * 0.25);
      ctx.lineTo(center, py - r * 0.45);
      ctx.lineTo(center + r * 0.38, py - r * 0.25);
      ctx.closePath();
      ctx.fill();
    } else if (key === 'track-5') {
      // Starlight Odyssey: Nebula & Stars
      const grad = ctx.createRadialGradient(center, center, 0, center, center, r);
      grad.addColorStop(0.0, '#38bdf8');
      grad.addColorStop(0.45, '#7c3aed');
      grad.addColorStop(0.80, '#0c0a2a');
      grad.addColorStop(1.0, '#020210');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);
    } else {
      // Other tracks: Cyber/Twilight atmospheric gradient
      const grad = ctx.createLinearGradient(center, center - r, center, center + r);
      grad.addColorStop(0.0, '#0c102b');
      grad.addColorStop(0.60, '#311042');
      grad.addColorStop(1.0, '#065f46');
      ctx.fillStyle = grad;
      ctx.fillRect(center - r, center - r, r * 2, r * 2);
    }

    // Soft atmospheric vignette for crystal contrast
    const vig = ctx.createRadialGradient(center, center, r * 0.15, center, center, r);
    if (isDark) {
      vig.addColorStop(0, 'rgba(7, 10, 20, 0.40)');
      vig.addColorStop(0.55, 'rgba(7, 10, 20, 0.20)');
      vig.addColorStop(1, 'rgba(7, 10, 20, 0.85)');
    } else {
      vig.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      vig.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
      vig.addColorStop(1, 'rgba(235, 240, 252, 0.70)');
    }
    ctx.fillStyle = vig;
    ctx.fillRect(center - r, center - r, r * 2, r * 2);

    // Soft radial fade-out mask: dissolves edge seamlessly into the 3D crystal sphere (Zero hard circle boundary)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    const edgeFade = ctx.createRadialGradient(center, center, r * 0.50, center, center, r);
    edgeFade.addColorStop(0.0, 'rgba(0, 0, 0, 1.0)');
    edgeFade.addColorStop(0.70, 'rgba(0, 0, 0, 0.82)');
    edgeFade.addColorStop(0.92, 'rgba(0, 0, 0, 0.18)');
    edgeFade.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = edgeFade;
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, []);

  // Helper: Create 2X High-Res Canvas Texture for Crisp Typography & Waveform inside bubble
  const createBubbleLabelTexture = useCallback((track, categoryLabel, radius, isCurrent, isDark, time = 0) => {
    const dpr = 2;
    const canvas = document.createElement('canvas');
    const size = Math.max(256, Math.ceil(radius * 2 * dpr));
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const scale = size / (radius * 2);

    // E. Atmospheric Album Artwork / Cover Landscape inside Bubble (G2)
    const anchorKey = resolveAnchorKey(track, 0);
    drawAtmosphericLandscape(ctx, anchorKey, center, radius, scale, isDark);

    // F. Floating Pill Badges (Centred above title matching reference)
    if (categoryLabel && radius >= 60) {
      ctx.save();
      const isHero = isCurrent || radius >= 150;
      const pillY = center - radius * scale * (isHero ? 0.44 : 0.46);
      const tagText = isCurrent ? 'EN REPRODUCCIÓN' : track.tier === 'UNDERGROUND' ? 'GEMA' : categoryLabel;

      ctx.font = `700 ${Math.round((isCurrent ? 9.5 : 8.5) * scale)}px "Plus Jakarta Sans", sans-serif`;
      const tagMetrics = ctx.measureText(tagText);
      const tagW = tagMetrics.width + (isCurrent ? 22 : 14) * scale;
      const tagH = (isCurrent ? 20 : 16) * scale;

      if (isCurrent) {
        ctx.fillStyle = isDark ? 'rgba(139, 124, 246, 0.45)' : 'rgba(238, 242, 255, 0.92)';
        ctx.strokeStyle = isDark ? 'rgba(192, 132, 252, 0.95)' : 'rgba(139, 124, 246, 0.75)';
      } else if (tagText === 'GEMA') {
        ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.40)' : 'rgba(238, 242, 255, 0.90)';
        ctx.strokeStyle = isDark ? 'rgba(129, 140, 248, 0.85)' : 'rgba(99, 102, 241, 0.65)';
      } else {
        ctx.fillStyle = isDark ? 'rgba(14, 165, 233, 0.35)' : 'rgba(240, 249, 255, 0.90)';
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.85)' : 'rgba(14, 165, 233, 0.65)';
      }

      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.roundRect(center - tagW / 2, pillY - tagH / 2, tagW, tagH, tagH / 2);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isCurrent ? (isDark ? '#f3e8ff' : '#6d28d9') : (isDark ? '#e0f2fe' : '#0369a1');
      ctx.fillText(tagText, center, pillY + 0.5 * scale);
      ctx.restore();
    }

    // G. Track Title & Artist Typography
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextWidth = radius * scale * 1.55;
    const isHeroBubble = isCurrent || radius >= 150;
    const textCenterY = center - (isHeroBubble ? 18 : 3) * scale;

    // Contrast Scrim behind text block (G1-bis: perfect readability over dark artworks)
    if (isDark) {
      ctx.save();
      const scrimRadius = radius * scale * 0.75;
      const textScrim = ctx.createRadialGradient(center, textCenterY + 8 * scale, 0, center, textCenterY + 8 * scale, scrimRadius);
      textScrim.addColorStop(0.0, 'rgba(6, 8, 18, 0.72)');
      textScrim.addColorStop(0.55, 'rgba(6, 8, 18, 0.38)');
      textScrim.addColorStop(1.0, 'rgba(6, 8, 18, 0.0)');
      ctx.fillStyle = textScrim;
      ctx.beginPath();
      ctx.arc(center, textCenterY + 8 * scale, scrimRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const titleFontSize = Math.round((radius >= 160 ? 22 : radius >= 120 ? 16 : radius >= 95 ? 13.5 : 11) * scale);
    ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.98)' : 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = (isDark ? 6.5 : 2.5) * scale;
    ctx.shadowOffsetY = (isDark ? 1.5 : 0.8) * scale;
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';

    let title = track.title || 'Canción';
    let metrics = ctx.measureText(title);
    if (metrics.width > maxTextWidth) {
      while (metrics.width > maxTextWidth && title.length > 3) {
        title = title.slice(0, -1);
        metrics = ctx.measureText(title + '…');
      }
      title += '…';
    }
    ctx.fillText(title, center, textCenterY);

    // Artist Name
    const artistFontSize = Math.round((radius >= 160 ? 13.5 : radius >= 120 ? 11.5 : radius >= 95 ? 9.5 : 8.5) * scale);
    ctx.font = `600 ${artistFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.98)' : 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = (isDark ? 5.5 : 2.0) * scale;
    ctx.fillStyle = isDark ? '#ffffff' : '#475569';
    let artist = track.artist || 'Artista';
    let artistMetrics = ctx.measureText(artist);
    if (artistMetrics.width > maxTextWidth) {
      while (artistMetrics.width > maxTextWidth && artist.length > 3) {
        artist = artist.slice(0, -1);
        artistMetrics = ctx.measureText(artist + '…');
      }
      artist += '…';
    }
    ctx.fillText(artist, center, textCenterY + (radius >= 160 ? 25 : 18) * scale);

    // Dynamic Waveform inside Hero Track
    if (isHeroBubble) {
      const barCount = 28;
      const barWidth = 3.0 * scale;
      const barGap = 2.4 * scale;
      const totalWidth = barCount * barWidth + (barCount - 1) * barGap;
      const startX = center - totalWidth / 2;
      const waveY = center + radius * scale * 0.40;

      for (let bi = 0; bi < barCount; bi++) {
        const normX = bi / barCount;
        const distCenter = Math.abs(normX - 0.5) * 2;
        const envelope = 1 - Math.pow(distCenter, 1.8);
        const animSpeed = 0.006;
        const barH = (Math.abs(Math.sin(time * animSpeed + bi * 0.48)) * 0.75 + 0.25) * (radius * scale * 0.24) * envelope + 4 * scale;

        const bx = startX + bi * (barWidth + barGap);
        const barGrad = ctx.createLinearGradient(bx, waveY - barH, bx, waveY + barH);
        barGrad.addColorStop(0, '#818cf8');
        barGrad.addColorStop(0.5, '#a78bfa');
        barGrad.addColorStop(1, '#6366f1');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(bx, waveY - barH / 2, barWidth, barH, barWidth / 2);
        ctx.fill();
      }
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Synchronize catalog items into Matter.js bodies and Three.js meshes
  const syncBubblesWithCatalog = useCallback((catalogData) => {
    const engine = engineRef.current;
    const scene = sceneRef.current;
    if (!engine || !scene) return;

    const container = containerRef.current;
    const width = container?.clientWidth || window.innerWidth || 1200;
    const height = Math.max(680, container?.clientHeight || window.innerHeight || 800);
    const bubblesMap = bubblesMapRef.current;
    const activeKeys = new Set();

    const sectionSpacingX = Math.max(width * 0.95, 1200);
    const sectionSpacingY = Math.max(height * 0.90, 850);
    const isMobile = width < 768;

    catalogData.forEach((data) => {
      const uniqueKey = data.uniqueKey || `${data.sectionId || 'all'}__${data.track.id}`;
      activeKeys.add(uniqueKey);

      const anchor = data.anchor || ANCHORS[data.track.id] || ANCHORS[data.assignedAnchorKey];
      const baseH = 768;
      const desktopScale = Math.min(1.42, Math.max(1.0, height / baseH));
      const responsiveScale = width < 500 ? 0.68 : width < 900 ? 0.82 : desktopScale;
      const radius = (anchor?.r || data.baseRadius) * responsiveScale;
      const secIdx = data.sectionIndex ?? 0;

      if (!bubblesMap.has(uniqueKey)) {
        let seedX = width * (anchor ? anchor.x : 0.53) + (isMobile ? 0 : secIdx * sectionSpacingX);
        let seedY = height * (anchor ? anchor.y : 0.50) + (isMobile ? secIdx * sectionSpacingY : 0);

        const padding = radius + 20;
        seedX = Math.max(padding, seedX);
        seedY = Math.max(padding, seedY);

        // Matter.js elastic 2D physics body
        const body = Matter.Bodies.circle(seedX, seedY, radius, {
          restitution: 0.85,
          frictionAir: 0.055,
          friction: 0.02,
          mass: radius * 0.15,
        });
        Matter.World.add(engine.world, body);

        // Three.js 3D Soap Bubble Mesh with custom ShaderMaterial
        const sphereGeom = new THREE.SphereGeometry(radius, 48, 48);
        const palette = extractTrackPalette(data.track);
        const paletteColor = new THREE.Color(palette.primary);
        const glowColor = new THREE.Color(palette.secondary);

        const bubbleMat = new THREE.ShaderMaterial({
          vertexShader: bubbleVertexShader,
          fragmentShader: bubbleFragmentShader,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
          uniforms: {
            uTime: { value: 0 },
            uWobble: { value: 1.0 },
            uAudioPulse: { value: 0.0 },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uRadius: { value: radius },
            uHoverOffset: { value: new THREE.Vector2(0, 0) },
            uHoverIntensity: { value: 0.0 },
            uIsDarkMode: { value: isDarkMode ? 1.0 : 0.0 },
            uIsCurrent: { value: 0.0 },
            uPaletteColor: { value: paletteColor },
            uGlowColor: { value: glowColor },
            uOpacity: { value: 1.0 },
          },
        });

        // Three.js 3D Soap Bubble Mesh with custom ShaderMaterial (Membrane on outer layer)
        const bubbleMesh = new THREE.Mesh(sphereGeom, bubbleMat);
        bubbleMesh.renderOrder = 2;
        scene.add(bubbleMesh);

        // Label Texture Billboard Plane (Interior holographic layer)
        const labelGeom = new THREE.PlaneGeometry(radius * 2, radius * 2);
        const labelTexture = createBubbleLabelTexture(data.track, data.categoryLabel, radius, false, isDarkMode);
        const labelMat = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
          depthWrite: false,
        });
        const labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.renderOrder = 1;
        labelMesh.position.z = -radius * 0.04;
        bubbleMesh.add(labelMesh);

        bubblesMap.set(uniqueKey, {
          id: data.track.id,
          key: uniqueKey,
          sectionId: data.sectionId,
          sectionIndex: secIdx,
          body,
          bodyId: body.id,
          mesh: bubbleMesh,
          labelMesh,
          sphereGeom,
          bubbleMat,
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
          palette,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.005 + Math.random() * 0.005,
          driftAngle: Math.random() * Math.PI * 2,
          alpha: 1,
          targetAlpha: 1,
          lastTextureUpdate: 0,
        });
      } else {
        const existing = bubblesMap.get(uniqueKey);
        if (existing.mesh && existing.mesh.parent !== scene) {
          scene.add(existing.mesh);
        }
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
      }
    });

    // Clean up obsolete bodies and meshes
    for (const [key, bubble] of bubblesMap.entries()) {
      if (!activeKeys.has(key)) {
        Matter.World.remove(engine.world, bubble.body);
        scene.remove(bubble.mesh);
        bubble.sphereGeom.dispose();
        bubble.bubbleMat.dispose();
        bubble.labelMesh.geometry.dispose();
        bubble.labelMesh.material.dispose();
        bubblesMap.delete(key);
      }
    }
  }, [ANCHORS, createBubbleLabelTexture, isDarkMode]);

  // Handle catalog updates
  useEffect(() => {
    syncBubblesWithCatalog(allBubblesData);
  }, [allBubblesData, syncBubblesWithCatalog]);

  // SINGLE MOUNT EFFECT: Initializes Matter.js Engine & Three.js WebGL Scene
  useEffect(() => {
    console.log('[ThreeBubbleWorld] Mounting 3D Soap Bubble Canvas (Three.js + Matter.js)');

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Initialize Matter.js Physics Engine
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    engineRef.current = engine;

    const wallThickness = 160;
    const wallOptions = { isStatic: true, restitution: 0.95, friction: 0 };
    const maxSections = 12; // Permitir 12 secciones de expansión
    const walls = [
      Matter.Bodies.rectangle((width * maxSections) / 2, -wallThickness / 2, width * maxSections * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle((width * maxSections) / 2, height * maxSections + wallThickness / 2, width * maxSections * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, (height * maxSections) / 2, wallThickness, height * maxSections * 2, wallOptions),
      Matter.Bodies.rectangle(width * maxSections + wallThickness / 2, (height * maxSections) / 2, wallThickness, height * maxSections * 2, wallOptions),
    ];
    Matter.World.add(engine.world, walls);

    // 2. Initialize Three.js WebGL Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Orthographic camera calibrated 1:1 with screen pixels for precise UI alignment
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.set(0, 0, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 3. Reflective Water Horizon Plane in lower section
    const waterGeom = new THREE.PlaneGeometry(width * 2, height * 0.45);
    const waterMat = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uIsDarkMode: { value: propsRef.current.isDarkMode ? 1.0 : 0.0 },
      },
    });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.set(0, -height / 2 + height * 0.15, -50);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 4. Instanced Ambient Micro-Bubbles & Cluster Foam Pearls
    const microCount = 105;
    const microGeom = new THREE.SphereGeometry(1, 20, 20);
    const microMat = new THREE.ShaderMaterial({
      vertexShader: bubbleVertexShader,
      fragmentShader: bubbleFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uWobble: { value: 0.4 },
        uAudioPulse: { value: 0.0 },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uRadius: { value: 1.0 },
        uIsDarkMode: { value: propsRef.current.isDarkMode ? 1.0 : 0.0 },
        uIsCurrent: { value: 0.0 },
        uPaletteColor: { value: new THREE.Color('#38bdf8') },
        uGlowColor: { value: new THREE.Color('#c084fc') },
        uOpacity: { value: 0.75 },
      },
    });

    const microMesh = new THREE.InstancedMesh(microGeom, microMat, microCount);
    const dummy = new THREE.Object3D();
    const microData = [];

    for (let i = 0; i < microCount; i++) {
      const isDeepBokeh = i < 45;
      const isClusterSatellite = i >= 85;
      let radius, x, y, z;

      if (isClusterSatellite) {
        radius = 5 + Math.random() * 11; // 5px to 16px foam pearls
        const angle = (i - 85) * (Math.PI * 2 / 20) + Math.random() * 0.4;
        const dist = 140 + Math.random() * 320;
        x = Math.cos(angle) * dist + (Math.random() - 0.5) * 40;
        y = Math.sin(angle) * dist * 0.7 + (Math.random() - 0.5) * 40;
        z = 5 + Math.random() * 45;
      } else {
        radius = isDeepBokeh ? 12 + Math.random() * 22 : 4 + Math.random() * 10;
        x = (Math.random() - 0.5) * width * 1.35;
        y = (Math.random() - 0.5) * height * 1.25;
        z = isDeepBokeh ? -135 + Math.random() * 65 : -15 + Math.random() * 55;
      }

      microData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        radius,
        speedX: (Math.random() - 0.5) * (isClusterSatellite ? 0.08 : isDeepBokeh ? 0.15 : 0.35),
        speedY: (Math.random() - 0.5) * 0.12 - (isClusterSatellite ? 0.02 : isDeepBokeh ? 0.03 : 0.08),
        phase: Math.random() * Math.PI * 2,
        isSatellite: isClusterSatellite,
      });
      dummy.position.set(x, y, z);
      dummy.scale.set(radius, radius, radius);
      dummy.updateMatrix();
      microMesh.setMatrixAt(i, dummy.matrix);
    }
    microMesh.instanceMatrix.needsUpdate = true;
    scene.add(microMesh);

    // Initial catalog synchronization
    syncBubblesWithCatalog(allBubblesData);
    console.log('[ThreeBubbleWorld] Initial sync completed. Bubbles in map:', bubblesMapRef.current.size, 'Children in scene:', scene.children.length);

    // 5. Organic Soap Contact Meniscus Group
    const meniscusGroup = new THREE.Group();
    scene.add(meniscusGroup);

    // 6. Main 60 FPS Render & Physics Loop
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Smooth Camera Slide Interpolation
      const dynamicSections = propsRef.current.dynamicSections || [];
      const activeCat = propsRef.current.activeCategory;
      const activeIndex = Math.max(0, dynamicSections.findIndex(s => s.id === activeCat));
      const spacingX = Math.max(width * 0.95, 1200);
      const spacingY = Math.max(height * 0.90, 850);
      const isMobile = width < 768;
      const targetCamX = isMobile ? 0 : activeIndex * spacingX;
      const targetCamY = isMobile ? -activeIndex * spacingY : 0;
      cameraOffsetRef.current.x += (targetCamX - cameraOffsetRef.current.x) * 0.08;
      cameraOffsetRef.current.y += (targetCamY - cameraOffsetRef.current.y) * 0.08;
      camera.position.x = cameraOffsetRef.current.x;
      camera.position.y = cameraOffsetRef.current.y;
      
      if (waterMeshRef.current) {
        waterMeshRef.current.position.x = cameraOffsetRef.current.x;
        waterMeshRef.current.position.y = -height / 2 + height * 0.15 + cameraOffsetRef.current.y;
      }

      // Update Matter.js physical positions
      Matter.Engine.update(engine, dt);

      const bubbles = Array.from(bubblesMapRef.current.values());
      const mouse = mousePosRef.current;
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
      const timeSeconds = time * 0.001;

      // Update Water Horizon
      waterMat.uniforms.uTime.value = timeSeconds;
      waterMat.uniforms.uIsDarkMode.value = activeIsDarkMode ? 1.0 : 0.0;

      // Update Ambient Micro-Bubbles
      microMat.uniforms.uTime.value = timeSeconds;
      microMat.uniforms.uIsDarkMode.value = activeIsDarkMode ? 1.0 : 0.0;
      for (let i = 0; i < microCount; i++) {
        const md = microData[i];
        md.baseX += md.speedX;
        md.baseY += md.speedY;
        md.phase += 0.016;

        if (md.baseX < -width / 2 - 80) md.baseX = width / 2 + 80;
        if (md.baseX > width / 2 + 80) md.baseX = -width / 2 - 80;
        if (md.baseY < -height / 2 - 80) md.baseY = height / 2 + 80;
        if (md.baseY > height / 2 + 80) md.baseY = -height / 2 - 80;

        const curX = md.baseX + Math.cos(md.phase) * 6;
        const curY = md.baseY + Math.sin(md.phase * 0.8) * 6;
        dummy.position.set(curX, curY, md.baseZ);
        dummy.scale.set(md.radius, md.radius, md.radius);
        dummy.updateMatrix();
        microMesh.setMatrixAt(i, dummy.matrix);
      }
      microMesh.instanceMatrix.needsUpdate = true;

      // Apply Spring Constellation & Inter-bubble Liquid Forces
      bubbles.forEach((b, i) => {
        if (b.isPopping) return; // Dedicated activePops loop handles bursting bubbles
        b.phase += b.phaseSpeed;

        const matchQuery = !q ||
          b.track.title?.toLowerCase().includes(q) ||
          b.track.artist?.toLowerCase().includes(q) ||
          b.track.genre?.toLowerCase().includes(q);

        const matchGenre = currentGenre === 'all' ||
          b.track.genre?.toLowerCase().includes(currentGenre.toLowerCase());

        const isFilteredIn = matchQuery && matchGenre;
        b.targetAlpha = isFilteredIn ? 1.0 : 0.22;
        b.alpha += (b.targetAlpha - b.alpha) * 0.12;

        // Gentle buoyant drift
        const forceMag = 0.00016 * b.body.mass;
        Matter.Body.applyForce(b.body, b.body.position, {
          x: Math.cos(b.phase + b.driftAngle) * forceMag,
          y: Math.sin(b.phase * 0.85 + b.driftAngle) * forceMag,
        });

        // Anchor spring attraction with proportional 1080p cohesion
        const baseH = 768;
        const desktopScale = Math.min(1.42, Math.max(1.0, height / baseH));
        const isSmallScreen = width < 900;
        const isMobileScreen = width < 500;
        const clusterSpreadX = Math.min(width - 280, 1380 * desktopScale);
        const centerX = width >= 1024 ? 260 + (width - 260) * 0.50 : width * 0.51;
        const centerY = height * 0.50;

        let targetX = centerX + (b.anchor ? (b.anchor.x - 0.51) * clusterSpreadX : 0);
        let targetY = centerY + (b.anchor ? (b.anchor.y - 0.50) * height * 0.95 : 0);

        if (isMobileScreen) {
          targetX = width * (0.5 + (b.anchor ? (b.anchor.x - 0.51) * 0.72 : 0));
          targetY = height * (0.50 + (b.anchor ? (b.anchor.y - 0.50) * 0.75 : 0));
        } else if (isSmallScreen) {
          targetX = width * (0.5 + (b.anchor ? (b.anchor.x - 0.51) * 0.85 : 0));
          targetY = height * (0.50 + (b.anchor ? (b.anchor.y - 0.50) * 0.85 : 0));
        }

        // Section Offset Logic: Each category has its own galaxy offset along X (desktop) or Y (mobile)
        const mySectionIndex = b.sectionIndex ?? 0;
        const sectionSpacingX = Math.max(width * 0.95, 1200);
        const sectionSpacingY = Math.max(height * 0.90, 850);
        
        targetX += isMobileScreen ? 0 : mySectionIndex * sectionSpacingX;
        targetY += isMobileScreen ? mySectionIndex * sectionSpacingY : 0;

        const isCurrent = activeCurTrack && activeCurTrack.id === b.id;
        if (isCurrent && !b.anchor) {
          targetX = centerX;
          targetY = centerY;
        }

        const dxCenter = targetX - b.body.position.x;
        const dyCenter = targetY - b.body.position.y;
        Matter.Body.applyForce(b.body, b.body.position, {
          x: dxCenter * 0.00014 * b.body.mass,
          y: dyCenter * 0.00014 * b.body.mass,
        });

        // Inter-bubble organic foam cohesion & separation
        for (let j = i + 1; j < bubbles.length; j++) {
          const b2 = bubbles[j];
          const dx = b2.body.position.x - b.body.position.x;
          const dy = b2.body.position.y - b.body.position.y;
          const dist = Math.hypot(dx, dy);
          const touchDist = b.radius + b2.radius;
          const minDist = touchDist - 8; // Allow a natural 8px soap bubble touch overlap

          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const repForce = overlap * 0.00022;
            const rx = (dx / dist) * repForce;
            const ry = (dy / dist) * repForce;
            Matter.Body.applyForce(b.body, b.body.position, { x: -rx, y: -ry });
            Matter.Body.applyForce(b2.body, b2.body.position, { x: rx, y: ry });
          } else if (dist >= minDist && dist < touchDist + 65) {
            // Organic surface tension cohesion: gentle attraction so foam stays connected
            const attraction = (touchDist + 65 - dist) * 0.000035;
            const ax = (dx / dist) * attraction;
            const ay = (dy / dist) * attraction;
            Matter.Body.applyForce(b.body, b.body.position, { x: ax, y: ay });
            Matter.Body.applyForce(b2.body, b2.body.position, { x: -ax, y: -ay });
          }
        }

        // Smooth radius scaling: proportional and balanced (no excessive inflation)
        const dxMouse = b.body.position.x - mouse.x;
        const dyMouse = b.body.position.y - mouse.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        const isHovered = distMouse <= b.radius && isFilteredIn;
        const targetR = isCurrent ? b.baseRadius * 1.10 : isHovered ? b.baseRadius * 1.05 : b.baseRadius;
        b.radius += (targetR - b.radius) * 0.08;

        // Phase 2.4: Physical Hover Repulsion in Matter.js
        if (distMouse < b.radius + 75 && distMouse > 0 && !dragStateRef.current.isDragging) {
          const repForce = (1.0 - distMouse / (b.radius + 75)) * 0.00026 * b.body.mass;
          Matter.Body.applyForce(b.body, b.body.position, {
            x: (dxMouse / distMouse) * repForce,
            y: (dyMouse / distMouse) * repForce,
          });
        }

        // Phase 2.5: Physical Drag & Drop Constraint Force
        if (dragStateRef.current.isDragging && dragStateRef.current.bubble === b) {
          const dfx = (mouse.x - b.body.position.x) * 0.0035 * b.body.mass;
          const dfy = (mouse.y - b.body.position.y) * 0.0035 * b.body.mass;
          Matter.Body.applyForce(b.body, b.body.position, { x: dfx, y: dfy });
          Matter.Body.setVelocity(b.body, {
            x: b.body.velocity.x * 0.86,
            y: b.body.velocity.y * 0.86,
          });
        }

        // Map 2D Matter coordinate to 3D Three.js Scene
        const threeX = b.body.position.x - width / 2;
        const threeY = -(b.body.position.y - height / 2);
        const threeZ = isCurrent ? 25 : Math.sin(time * 0.001 + b.phase) * 12;

        b.mesh.position.set(threeX, threeY, threeZ);
        if (!b.isPopping) {
          const scaleFactor = b.radius / b.baseRadius;
          b.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        // Audio pulse modulation (beat & harmonic transients)
        const isPlayingThis = isCurrent && activeIsPlaying;
        const beatPulse = isPlayingThis
          ? (Math.sin(timeSeconds * 7.0) * 0.5 + 0.5) * 0.75 + (Math.sin(timeSeconds * 14.0) * 0.5 + 0.5) * 0.25
          : 0.0;

        // Update Shader Uniforms with Phase 2 Physical Membrane Dynamics
        const hoverTarget = (distMouse < b.radius + 70) ? (1.0 - distMouse / (b.radius + 70)) : 0.0;
        b.hoverIntensity = (b.hoverIntensity || 0) + (hoverTarget - (b.hoverIntensity || 0)) * 0.14;

        b.bubbleMat.uniforms.uTime.value = timeSeconds;
        b.bubbleMat.uniforms.uWobble.value = dragStateRef.current.isDragging && dragStateRef.current.bubble === b ? 1.85 : 1.0;
        b.bubbleMat.uniforms.uHoverOffset.value.set(-dxMouse, dyMouse);
        b.bubbleMat.uniforms.uHoverIntensity.value = b.hoverIntensity;
        b.bubbleMat.uniforms.uIsDarkMode.value = activeIsDarkMode ? 1.0 : 0.0;
        b.bubbleMat.uniforms.uIsCurrent.value = isCurrent ? 1.0 : 0.0;
        b.bubbleMat.uniforms.uAudioPulse.value = beatPulse;
        b.bubbleMat.uniforms.uVelocity.value.set(
          b.body.velocity.x,
          -b.body.velocity.y
        );
        b.bubbleMat.uniforms.uOpacity.value = b.alpha;

        // Phase 2.6: Organic 3D Independent Ambient Highlight Rotation
        b.mesh.rotation.x = Math.sin(timeSeconds * 0.4 + b.phase) * 0.06;
        b.mesh.rotation.y = Math.cos(timeSeconds * 0.35 + b.driftAngle) * 0.06;
        b.mesh.rotation.z = Math.sin(timeSeconds * 0.25 + b.phase * 1.5) * 0.03;

        // Dynamic Waveform Texture Refresh every ~80ms when playing
        if (isCurrent && activeIsPlaying && (time - b.lastTextureUpdate > 80)) {
          b.lastTextureUpdate = time;
          const newTexture = createBubbleLabelTexture(b.track, b.categoryLabel, b.radius, isCurrent, activeIsDarkMode, time);
          if (b.labelMesh.material.map) b.labelMesh.material.map.dispose();
          b.labelMesh.material.map = newTexture;
          b.labelMesh.material.needsUpdate = true;
        }
      });

      // =====================================================================
      // Phase 2.7 & 2.9: Soap POP Choreography, Sound Flight & Organic Regrowth
      // =====================================================================
      const now = performance.now();
      const activePops = activePopsRef.current;
      for (let pIdx = activePops.length - 1; pIdx >= 0; pIdx--) {
        const pop = activePops[pIdx];
        const elapsed = now - pop.startTime;
        const b = pop.bubble;

        if (elapsed < 120) {
          // Phase 1 — Pre-pop (0–120ms): Surface tension compression
          const prog = elapsed / 120;
          const preScale = 1.0 - 0.15 * prog;
          b.mesh.scale.set(preScale, preScale, preScale);
        } else if (elapsed < 320) {
          // Phase 2 — Pop burst & progressive dissolve (120–320ms): Continuous expansion and smooth dissolve
          const prog = (elapsed - 120) / 200;
          const burstScale = 0.85 + 0.65 * Math.sin(prog * Math.PI * 0.5);
          b.mesh.scale.set(burstScale, burstScale, burstScale);
          b.bubbleMat.uniforms.uOpacity.value = Math.max(0, 1.0 - prog * 1.1);
          // Gently fade label texture
          if (b.labelMesh && b.labelMesh.material) {
            b.labelMesh.material.opacity = Math.max(0, 1.0 - prog * 2.0);
          }
        } else {
          // Phase 3 — Dissolved & Invisible (320ms+): Bubble membrane is completely dissolved
          b.mesh.visible = false;
        }

        const t = Math.min(1.0, elapsed / 580);

        // Update 15 micro-droplets dispersing in 3D
        pop.droplets.forEach((drop) => {
          drop.mesh.position.x += drop.vx;
          drop.mesh.position.y += drop.vy;
          drop.mesh.position.z += drop.vz;
          drop.vy -= 0.16; // gravity
          drop.mesh.material.opacity = Math.max(0, 0.88 * (1.0 - t));
        });

        // Update shock ring expansion
        if (pop.shockRing) {
          const ringScale = 1.0 + t * 0.75;
          pop.shockRing.scale.set(ringScale, ringScale, 1.0);
          pop.shockRing.material.opacity = Math.max(0, 0.85 * (1.0 - t * 1.3));
        }

        // Update sound flight disc (Cubic Bezier curve from popped bubble to current Player position in viewport)
        if (pop.flightMesh) {
          const camX = cameraOffsetRef.current?.x || 0;
          const camY = cameraOffsetRef.current?.y || 0;
          const p0 = pop.origin;
          // Target player at the bottom center of the current screen view
          const p3 = { x: camX, y: camY - height / 2 + 55, z: 20 };
          const p1 = { x: p0.x + (p3.x - p0.x) * 0.25, y: Math.max(p0.y, p3.y) + 40, z: p0.z + 15 };
          const p2 = { x: p3.x + (p0.x - p3.x) * 0.20, y: p3.y + 60, z: 20 };

          const u = 1.0 - t;
          const bx = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
          const by = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
          const bz = u * u * u * p0.z + 3 * u * u * t * p1.z + 3 * u * t * t * p2.z + t * t * t * p3.z;

          pop.flightMesh.position.set(bx, by, bz);
          const discScale = Math.max(0.25, 1.0 - t * 0.72);
          pop.flightMesh.scale.set(discScale, discScale, 1.0);
          pop.flightMesh.material.opacity = Math.max(0, 1.0 - t * 0.9);
        }

        // Complete choreography at 580ms — smoothly finalize track consumption & foam relaxation
        if (t >= 1.0) {
          scene.remove(pop.dropletGroup);
          pop.droplets.forEach((d) => {
            d.mesh.geometry?.dispose();
            d.mesh.material?.dispose();
          });
          if (pop.shockRing) {
            scene.remove(pop.shockRing);
            pop.shockRing.geometry?.dispose();
            pop.shockRing.material?.dispose();
          }
          if (pop.flightMesh) {
            scene.remove(pop.flightMesh);
            pop.flightMesh.geometry?.dispose();
            pop.flightMesh.material?.dispose();
          }

          // Organic foam relaxation: remaining bubbles gently drift toward the freed space
          bubbles.forEach((other) => {
            if (other !== b && other.body) {
              const dx = b.body.position.x - other.body.position.x;
              const dy = b.body.position.y - other.body.position.y;
              const d = Math.hypot(dx, dy);
              if (d < 450 && d > 0) {
                const inwardPull = (1.0 - d / 450) * 0.00032 * other.body.mass;
                Matter.Body.applyForce(other.body, other.body.position, {
                  x: (dx / d) * inwardPull,
                  y: (dy / d) * inwardPull,
                });
              }
            }
          });

          // Dispose popping bubble and notify consumed track
          b.sphereGeom?.dispose();
          b.bubbleMat?.dispose();
          b.labelMesh?.geometry?.dispose();
          b.labelMesh?.material?.dispose();
          scene.remove(b.mesh);
          if (b.body) {
            Matter.World.remove(engine.world, b.body);
          }
          bubblesMapRef.current.delete(b.key);
          activePops.splice(pIdx, 1);

          // Mark track as consumed once animation has gracefully completed!
          propsRef.current.onConsumeTrack?.(pop.track.id);
        }
      }

      // Clear previous contact meniscus meshes
      while (meniscusGroup.children.length > 0) {
        const child = meniscusGroup.children[0];
        child.geometry?.dispose();
        child.material?.dispose();
        meniscusGroup.remove(child);
      }

      // True Organic Surface Contact: Sparkling soap pearl micro-droplets on foam contact (Zero weird tubular catenoids)
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];
          if (b1.alpha < 0.3 || b2.alpha < 0.3 || b1.isPopping || b2.isPopping) continue;

          const dx = b2.body.position.x - b1.body.position.x;
          const dy = b2.body.position.y - b1.body.position.y;
          const dist = Math.hypot(dx, dy);
          const touchDist = b1.radius + b2.radius;

          // Pure tangent contact: place 1 or 2 tiny iridescent pearl droplets in the crease (Zero tubular bridges)
          if (dist <= touchDist + 6.0 && dist > 15.0) {
            const midX = (b1.body.position.x + b2.body.position.x) / 2 - width / 2;
            const midY = -((b1.body.position.y + b2.body.position.y) / 2 - height / 2);
            const midZ = (b1.mesh.position.z + b2.mesh.position.z) / 2 + 4;
            const overlap = Math.max(0, touchDist - dist);

            const dropletRadius = Math.max(3.5, Math.min(8.0, 5.0 + overlap * 0.2));
            const dropletGeom = new THREE.SphereGeometry(dropletRadius, 16, 16);
            const dropletMat = new THREE.ShaderMaterial({
              vertexShader: bubbleVertexShader,
              fragmentShader: bubbleFragmentShader,
              transparent: true,
              depthWrite: false,
              uniforms: {
                uTime: { value: timeSeconds },
                uWobble: { value: 0.3 },
                uAudioPulse: { value: 0.0 },
                uVelocity: { value: new THREE.Vector2(0, 0) },
                uRadius: { value: dropletRadius },
                uIsDarkMode: { value: activeIsDarkMode ? 1.0 : 0.0 },
                uIsCurrent: { value: 0.0 },
                uPaletteColor: { value: new THREE.Color('#38bdf8') },
                uGlowColor: { value: new THREE.Color('#c084fc') },
                uOpacity: { value: 0.85 },
              },
            });
            const dropletMesh = new THREE.Mesh(dropletGeom, dropletMat);
            dropletMesh.position.set(midX, midY, midZ);
            dropletMesh.renderOrder = 3;
            meniscusGroup.add(dropletMesh);
          }
        }
      }

      // Render 3D Scene
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = Math.max(680, container.clientHeight || window.innerHeight);

      camera.left = -newW / 2;
      camera.right = newW / 2;
      camera.top = newH / 2;
      camera.bottom = -newH / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      waterMesh.position.set(0, -newH / 2 + newH * 0.15, -50);
      waterMesh.scale.set(newW * 2 / (width * 2), 1, 1);

      if (walls[0]) Matter.Body.setPosition(walls[0], { x: newW / 2, y: -wallThickness / 2 });
      if (walls[1]) Matter.Body.setPosition(walls[1], { x: newW / 2, y: newH + wallThickness / 2 });
      if (walls[2]) Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: newH / 2 });
      if (walls[3]) Matter.Body.setPosition(walls[3], { x: newW + wallThickness / 2, y: newH / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      for (const bubble of bubblesMapRef.current.values()) {
        bubble.sphereGeom?.dispose();
        bubble.bubbleMat?.dispose();
        bubble.labelMesh?.geometry?.dispose();
        bubble.labelMesh?.material?.dispose();
      }
      bubblesMapRef.current.clear();
      renderer.dispose();
    };
  }, [allBubblesData, syncBubblesWithCatalog, createBubbleLabelTexture]);

  // Phase 2.7: Tactile Liquid Soap Pop Audio Synthesizer (Web Audio API)
  const playSoapPopSound = useCallback((pitchMultiplier = 1.0) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!window.__soundfind_audio_ctx) {
        window.__soundfind_audio_ctx = new AudioContextClass();
      }
      const ctx = window.__soundfind_audio_ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const startFreq = (640 + Math.random() * 80) * pitchMultiplier;
      const endFreq = (1380 + Math.random() * 140) * pitchMultiplier;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.038);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Non-blocking fallback
    }
  }, []);

  // Phase 2.7: Trigger Soap Pop Choreography
  const triggerPop = useCallback((b) => {
    if (!b || b.isPopping) return;
    b.isPopping = true;

    // Immediately trigger track playback so user has zero latency!
    propsRef.current.onPlayTrack?.(b.track);

    // Tactile acoustic pop feedback
    playSoapPopSound(b.radius > 140 ? 0.85 : b.radius < 100 ? 1.25 : 1.0);

    const scene = sceneRef.current;
    if (!scene) return;

    // 14-16 Iridescent Micro-Droplets
    const dropletGroup = new THREE.Group();
    const dropletCount = 15;
    const dropletGeom = new THREE.SphereGeometry(3.0, 10, 10);
    const dropletMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(b.track.tier === 'UNDERGROUND' ? '#38bdf8' : '#c084fc'),
      transparent: true,
      opacity: 0.88,
    });

    const droplets = [];
    for (let i = 0; i < dropletCount; i++) {
      const mesh = new THREE.Mesh(dropletGeom, dropletMat.clone());
      mesh.position.set(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z + 5);
      const angle = (i / dropletCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 3.5 + Math.random() * 4.5;
      droplets.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 4.0,
      });
      dropletGroup.add(mesh);
    }
    scene.add(dropletGroup);

    // Shock Ring
    const ringGeom = new THREE.RingGeometry(b.radius * 0.95, b.radius * 1.05, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const shockRing = new THREE.Mesh(ringGeom, ringMat);
    shockRing.position.set(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z + 2);
    scene.add(shockRing);

    // Sound Release Flight Orb
    const flightGeom = new THREE.CircleGeometry(26, 32);
    const flightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8b5cf6'),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const flightMesh = new THREE.Mesh(flightGeom, flightMat);
    flightMesh.position.set(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z + 10);
    scene.add(flightMesh);

    activePopsRef.current.push({
      bubble: b,
      track: b.track,
      startTime: performance.now(),
      origin: { x: b.mesh.position.x, y: b.mesh.position.y, z: b.mesh.position.z },
      radius: b.radius,
      dropletGroup,
      droplets,
      shockRing,
      flightMesh,
      stage: 'pre-pop',
    });
  }, [playSoapPopSound]);

  const handlePointerMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldX = clientX + (cameraOffsetRef.current?.x || 0);
    const worldY = clientY - (cameraOffsetRef.current?.y || 0);
    mousePosRef.current.x = worldX;
    mousePosRef.current.y = worldY;

    const x = worldX;
    const y = worldY;

    const drag = dragStateRef.current;
    if (drag.bubble) {
      const moved = Math.hypot(x - drag.startX, y - drag.startY);
      if (moved > 6) {
        drag.isDragging = true;
      }
      drag.vx = x - drag.lastX;
      drag.vy = y - drag.lastY;
      drag.lastX = x;
      drag.lastY = y;
    }

    // Detect Hovered Song for Curation Tooltip
    let found = null;
    for (const b of bubblesMapRef.current.values()) {
      if (b.isPopping) continue;
      const dx = b.body.position.x - x;
      const dy = b.body.position.y - y;
      if (Math.hypot(dx, dy) <= b.radius) {
        found = b;
        break;
      }
    }
    setHoveredTrack(found);
  };

  const handlePointerDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldX = clientX + (cameraOffsetRef.current?.x || 0);
    const worldY = clientY - (cameraOffsetRef.current?.y || 0);
    const x = worldX;
    const y = worldY;
    mousePosRef.current.isDown = true;

    let target = null;
    for (const b of bubblesMapRef.current.values()) {
      if (b.isPopping) continue;
      const dx = b.body.position.x - x;
      const dy = b.body.position.y - y;
      if (Math.hypot(dx, dy) <= b.radius) {
        target = b;
        break;
      }
    }

    if (!target) {
      // Swipe on empty canvas water surface for Category Switching (Phase 2.11)
      canvasDragRef.current = { isSwiping: true, startX: clientX, startY: clientY };
    }

    dragStateRef.current = {
      isDragging: false,
      bubble: target,
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      vx: 0,
      vy: 0,
    };
  };

  const handlePointerUp = (e) => {
    mousePosRef.current.isDown = false;
    const drag = dragStateRef.current;
    if (drag.bubble) {
      if (!drag.isDragging) {
        // Clean Tap/Click: Trigger Soap Pop Sequence
        triggerPop(drag.bubble);
      } else {
        // Drag Release: Fling velocity conservation
        Matter.Body.setVelocity(drag.bubble.body, {
          x: Math.max(-14, Math.min(14, drag.vx * 0.45)),
          y: Math.max(-14, Math.min(14, drag.vy * 0.45)),
        });
      }
    } else if (canvasDragRef.current.isSwiping) {
      // Phase 2.11: Horizontal Slide / Swipe Category Transition
      const rect = canvasRef.current?.getBoundingClientRect();
      const curX = e.clientX - (rect?.left || 0);
      const curY = e.clientY - (rect?.top || 0);
      const dxSwipe = curX - canvasDragRef.current.startX;
      const dySwipe = curY - canvasDragRef.current.startY;

      const isMobile = (window.innerWidth || rect?.width || 0) < 768;
      let swipedPrev = false;
      let swipedNext = false;
      let validSwipe = false;

      if (isMobile) {
        if (Math.abs(dySwipe) > 40 && Math.abs(dySwipe) > Math.abs(dxSwipe) * 1.3) {
           validSwipe = true;
           swipedPrev = dySwipe > 0;
           swipedNext = dySwipe < 0;
        }
      } else {
        if (Math.abs(dxSwipe) > 45 && Math.abs(dxSwipe) > Math.abs(dySwipe) * 1.3) {
           validSwipe = true;
           swipedPrev = dxSwipe > 0;
           swipedNext = dxSwipe < 0;
        }
      }

      if (validSwipe) {
        const dynamicSections = propsRef.current.dynamicSections || [];
        const categories = dynamicSections.length > 0 ? dynamicSections.map(s => s.id) : ['top24h', 'recent', 'suggestions', 'all'];
        const curIdx = categories.indexOf(propsRef.current.activeCategory);
        const nextIdx = swipedPrev
          ? (curIdx - 1 + categories.length) % categories.length
          : (curIdx + 1) % categories.length;
        const nextCat = categories[nextIdx];
        propsRef.current.onSelectCategory?.(nextCat);

        // Gentle physical wave drift impulse across the entire bubble mass
        const impulseX = isMobile ? 0 : (swipedPrev ? 1.8 : -1.8);
        const impulseY = isMobile ? (swipedPrev ? 1.8 : -1.8) : 0;
        for (const b of bubblesMapRef.current.values()) {
          Matter.Body.setVelocity(b.body, {
            x: b.body.velocity.x + impulseX,
            y: b.body.velocity.y + impulseY,
          });
        }
      }
      canvasDragRef.current = { isSwiping: false, startX: 0, startY: 0 };
    }

    dragStateRef.current = {
      isDragging: false,
      bubble: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      vx: 0,
      vy: 0,
    };
  };

  const handlePointerLeave = () => {
    mousePosRef.current.x = -1000;
    mousePosRef.current.y = -1000;
    mousePosRef.current.isDown = false;
    dragStateRef.current = {
      isDragging: false,
      bubble: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      vx: 0,
      vy: 0,
    };
    canvasDragRef.current = { isSwiping: false, startX: 0, startY: 0 };
    setHoveredTrack(null);
  };

  // Phase 2.14: Accessible Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const dynamicSections = propsRef.current.dynamicSections || [];
      const categories = dynamicSections.length > 0 ? dynamicSections.map(s => s.id) : ['top24h', 'recent', 'suggestions', 'all'];
      const curIdx = categories.indexOf(propsRef.current.activeCategory);
      const nextIdx = e.key === 'ArrowRight'
        ? (curIdx + 1) % categories.length
        : (curIdx - 1 + categories.length) % categories.length;
      propsRef.current.onSelectCategory?.(categories[nextIdx]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (hoveredTrack && !hoveredTrack.isPopping) {
        triggerPop(hoveredTrack);
      } else {
        const visibleBubble = Array.from(bubblesMapRef.current.values()).find(b => !b.isPopping && b.alpha > 0.6);
        if (visibleBubble) triggerPop(visibleBubble);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 w-screen h-screen overflow-hidden touch-none select-none z-0 outline-none"
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full block cursor-pointer"
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
            <span>✨ Nota de Curaduría IA</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-snug">
            "{hoveredTrack.reasoning}"
          </p>
        </div>
      )}
    </div>
  );
}
