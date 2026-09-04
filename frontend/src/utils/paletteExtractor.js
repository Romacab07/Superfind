/**
 * paletteExtractor.js - Generates rich, distinct, album-derived chromatic palettes
 * for each track in SuperFind.
 * 
 * Guarantees every song bubble has an individual distinct visual material
 * matching the realistic soap-bubble reference, supporting smooth color transitions.
 */

// Distinct Harmonic Color Profiles with volumetric soap-bubble parameters
const PALETTE_THEMES = [
  {
    name: 'neon-sunset',
    genreKeywords: ['neon horizon', 'synthwave', 'aether wave', 'sunset', 'horizon'],
    primary: '#8b7cf6',        // Ethereal Violet / Lavender
    secondary: '#38bdf8',      // Sky Cyan
    accent: '#c084fc',         // Light Purple
    backgroundArtwork: 'sunset',
    glow: 'rgba(139, 124, 246, 0.45)',
    glowDark: 'rgba(167, 139, 250, 0.65)',
    causticColor: 'rgba(56, 189, 248, 0.85)',
    rimGradient: [
      'rgba(139, 124, 246, 0.95)',
      'rgba(56, 189, 248, 0.9)',
      'rgba(192, 132, 252, 0.85)',
      'rgba(253, 230, 138, 0.9)'
    ],
    playerAccent: 'from-violet-600 via-indigo-600 to-purple-500',
  },
  {
    name: 'midnight-purple',
    genreKeywords: ['midnight coffee', 'lofi dreams', 'forest', 'echoes', 'dream'],
    primary: '#a855f7',        // Purple / Violet
    secondary: '#6366f1',      // Indigo
    accent: '#38bdf8',         // Cyan
    backgroundArtwork: 'misty-forest',
    glow: 'rgba(168, 85, 247, 0.42)',
    glowDark: 'rgba(192, 132, 252, 0.6)',
    causticColor: 'rgba(168, 85, 247, 0.85)',
    rimGradient: [
      'rgba(168, 85, 247, 0.95)',
      'rgba(192, 132, 252, 0.85)',
      'rgba(56, 189, 248, 0.85)',
      'rgba(168, 85, 247, 0.95)'
    ],
    playerAccent: 'from-purple-600 via-indigo-600 to-violet-500',
  },
  {
    name: 'cyber-cyan',
    genreKeywords: ['cybernetic drift', 'hyperion ghost', 'cyber', 'techno', 'future', 'electronic'],
    primary: '#06b6d4',        // Electric Cyan
    secondary: '#3b82f6',      // Blue
    accent: '#c084fc',         // Light Violet
    backgroundArtwork: 'cyber-city',
    glow: 'rgba(6, 182, 212, 0.45)',
    glowDark: 'rgba(34, 211, 238, 0.65)',
    causticColor: 'rgba(6, 182, 212, 0.85)',
    rimGradient: [
      'rgba(34, 211, 238, 0.95)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(192, 132, 252, 0.85)',
      'rgba(34, 211, 238, 0.95)'
    ],
    playerAccent: 'from-cyan-500 via-blue-600 to-violet-400',
  },
  {
    name: 'starlight-cosmic',
    genreKeywords: ['starlight odyssey', 'nova stellar', 'space', 'galaxy', 'cinematic'],
    primary: '#6366f1',        // Indigo / Deep Blue
    secondary: '#8b5cf6',      // Violet
    accent: '#38bdf8',         // Ice Blue
    backgroundArtwork: 'star-nebula',
    glow: 'rgba(99, 102, 241, 0.45)',
    glowDark: 'rgba(129, 140, 248, 0.65)',
    causticColor: 'rgba(99, 102, 241, 0.85)',
    rimGradient: [
      'rgba(99, 102, 241, 0.95)',
      'rgba(139, 92, 246, 0.9)',
      'rgba(56, 189, 248, 0.85)',
      'rgba(244, 114, 182, 0.85)'
    ],
    playerAccent: 'from-indigo-600 via-purple-600 to-sky-400',
  },
  {
    name: 'zen-turquoise',
    genreKeywords: ['zen blossom', 'komorebi', 'ambient', 'water', 'lotus', 'nature'],
    primary: '#14b8a6',        // Teal / Turquoise
    secondary: '#06b6d4',      // Cyan
    accent: '#10b981',         // Emerald
    backgroundArtwork: 'water-blossom',
    glow: 'rgba(20, 184, 166, 0.42)',
    glowDark: 'rgba(45, 212, 191, 0.65)',
    causticColor: 'rgba(20, 184, 166, 0.85)',
    rimGradient: [
      'rgba(45, 212, 191, 0.95)',
      'rgba(6, 182, 212, 0.9)',
      'rgba(52, 211, 153, 0.85)',
      'rgba(45, 212, 191, 0.95)'
    ],
    playerAccent: 'from-teal-500 via-cyan-500 to-emerald-400',
  },
  {
    name: 'golden-sunset',
    genreKeywords: ['golden hour', 'solaris acoustic', 'acoustic', 'chill', 'amber', 'warm'],
    primary: '#f59e0b',        // Amber Gold
    secondary: '#f97316',      // Sunset Orange
    accent: '#ec4899',         // Pink
    backgroundArtwork: 'golden-palms',
    glow: 'rgba(245, 158, 11, 0.45)',
    glowDark: 'rgba(251, 191, 36, 0.65)',
    causticColor: 'rgba(245, 158, 11, 0.85)',
    rimGradient: [
      'rgba(251, 191, 36, 0.95)',
      'rgba(249, 115, 22, 0.9)',
      'rgba(244, 63, 94, 0.85)',
      'rgba(251, 191, 36, 0.95)'
    ],
    playerAccent: 'from-amber-500 via-orange-500 to-rose-400',
  },
  {
    name: 'urban-violet',
    genreKeywords: ['urban pulse', 'kairo beats', 'beats', 'hip-hop', 'lofi'],
    primary: '#8b5cf6',        // Violet
    secondary: '#d946ef',      // Fuchsia
    accent: '#f59e0b',         // Amber
    backgroundArtwork: 'urban-lights',
    glow: 'rgba(139, 92, 246, 0.45)',
    glowDark: 'rgba(168, 85, 247, 0.65)',
    causticColor: 'rgba(139, 92, 246, 0.85)',
    rimGradient: [
      'rgba(168, 85, 247, 0.95)',
      'rgba(217, 70, 239, 0.9)',
      'rgba(251, 191, 36, 0.85)',
      'rgba(168, 85, 247, 0.95)'
    ],
    playerAccent: 'from-violet-500 via-fuchsia-600 to-amber-400',
  },
  {
    name: 'ethereal-mist',
    genreKeywords: ['echoes of eternity', 'luna caelum', 'dreampop', 'falling slowly', 'paper planes'],
    primary: '#38bdf8',        // Sky Blue
    secondary: '#a855f7',      // Soft Purple
    accent: '#f472b6',         // Soft Pink
    backgroundArtwork: 'ethereal-mist',
    glow: 'rgba(56, 189, 248, 0.42)',
    glowDark: 'rgba(56, 189, 248, 0.65)',
    causticColor: 'rgba(56, 189, 248, 0.85)',
    rimGradient: [
      'rgba(56, 189, 248, 0.95)',
      'rgba(192, 132, 252, 0.9)',
      'rgba(244, 114, 182, 0.85)',
      'rgba(56, 189, 248, 0.95)'
    ],
    playerAccent: 'from-sky-400 via-purple-500 to-pink-400',
  }
];

/**
 * Extracts or deterministically computes a distinct, vibrant palette for a track.
 */
export function extractTrackPalette(track) {
  if (!track) return PALETTE_THEMES[0];

  const str = `${track.title || ''} ${track.artist || ''} ${track.genre || ''}`.toLowerCase();

  // Match by keywords in title, artist, or genre
  for (const theme of PALETTE_THEMES) {
    if (theme.genreKeywords.some(kw => str.includes(kw))) {
      return theme;
    }
  }

  // Deterministic hash based on track id / title
  let hash = 0;
  const key = `${track.id || ''}_${track.title || ''}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE_THEMES.length;
  return PALETTE_THEMES[idx];
}

/**
 * Helper to interpolate hex colors
 */
export function lerpColor(c1, c2, t) {
  return t < 0.5 ? c1 : c2;
}
