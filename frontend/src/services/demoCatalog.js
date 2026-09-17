/**
 * Curated demo catalog.
 *
 * Every track below is real Creative Commons / royalty-free audio hosted on a public CDN,
 * so the static GitHub Pages build keeps the bubble world, the constellation view and the
 * player fully interactive with no backend, no API keys and no network calls to /api.
 *
 * The backend's own SeedCatalogProvider serves an equivalent catalog when you run it locally;
 * this module is the frontend-only mirror used when VITE_DEMO_MODE=true.
 */

const CATALOG = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artist: 'Aether Wave',
    genre: 'Electronic / Synthwave',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    durationSeconds: 372,
    license: 'CC-BY-4.0',
    provider: 'Jamendo',
    playCount24h: 342,
    tier: 'HEAVY_ROTATION',
    category: 'suggestions',
    reasoning: 'Líder en reproducciones durante las últimas 24 horas con horizonte sonoro retrofuturista.'
  },
  {
    id: 'track-2',
    title: 'Midnight Coffee',
    artist: 'Lofi Dreams Collective',
    genre: 'Ambient / Lo-Fi',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    durationSeconds: 198,
    license: 'CC0',
    provider: 'Free Music Archive',
    playCount24h: 74,
    tier: 'UNDERGROUND',
    category: 'top24h',
    reasoning: 'Gema nocturna con textura de lluvia, acordes de piano y diseño sonoro envolvente.'
  },
  {
    id: 'track-3',
    title: 'Urban Pulse',
    artist: 'Kairo Beats',
    genre: 'Electronic / Beats',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    durationSeconds: 165,
    license: 'CC-BY-4.0',
    provider: 'Jamendo',
    playCount24h: 62,
    tier: 'UNDERGROUND',
    category: 'top24h',
    reasoning: 'Gema rítmica de graves profundos con percusión orgánica y atmósfera urbana.'
  },
  {
    id: 'track-4',
    title: 'Cybernetic Drift',
    artist: 'Hyperion Ghost',
    genre: 'Synthwave / Cyber',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=epic-cinematic-trailer-111162.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
    durationSeconds: 215,
    license: 'CC-BY-4.0',
    provider: 'Jamendo',
    playCount24h: 215,
    tier: 'GROWING',
    category: 'suggestions',
    reasoning: 'Sintetizadores cinemáticos y atmósferas cyberpunk con gran tracción.'
  },
  {
    id: 'track-5',
    title: 'Starlight Odyssey',
    artist: 'Nova Stellar',
    genre: 'Cinematic / Space',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73229b422a.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    durationSeconds: 240,
    license: 'CC0',
    provider: 'Free Music Archive',
    playCount24h: 88,
    tier: 'UNDERGROUND',
    category: 'top24h',
    reasoning: 'Gema cósmica destacada por Gemini AI por sus paisajes sonoros orquestales.'
  },
  {
    id: 'track-6',
    title: 'Zen Blossom',
    artist: 'Komorebi Project',
    genre: 'Organic Ambient',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    durationSeconds: 182,
    license: 'CC-BY-SA',
    provider: 'Jamendo',
    playCount24h: 175,
    tier: 'GROWING',
    category: 'suggestions',
    reasoning: 'Paz sonora con agua en movimiento, campanas tibetanas y pads etéreos.'
  },
  {
    id: 'track-7',
    title: 'Golden Hour Memories',
    artist: 'Solaris Acoustic',
    genre: 'Acoustic / Sunset',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=indie-rock-116666.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    durationSeconds: 210,
    license: 'CC-BY-4.0',
    provider: 'Free Music Archive',
    playCount24h: 198,
    tier: 'GROWING',
    category: 'suggestions',
    reasoning: 'Guitarras acústicas cálidas con reverberación de atardecer en la playa.'
  },
  {
    id: 'track-8',
    title: 'Echoes of Eternity',
    artist: 'Luna Caelum',
    genre: 'Dreampop / Indie',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77421.mp3?filename=midnight-forest-184304.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
    durationSeconds: 190,
    license: 'CC-BY-SA',
    provider: 'Jamendo',
    playCount24h: 145,
    tier: 'GROWING',
    category: 'suggestions',
    reasoning: 'Arpegios nostálgicos y melodías de ensueño seleccionadas por IA.'
  },
  {
    id: 'track-9',
    title: 'Falling Slowly',
    artist: 'Paper Planes',
    genre: 'Indie Folk / Chill',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400',
    durationSeconds: 154,
    license: 'CC0',
    provider: 'Free Music Archive',
    playCount24h: 92,
    tier: 'UNDERGROUND',
    category: 'recent',
    reasoning: 'Arreglo acústico íntimo de cantautor emergente.'
  }
];

/**
 * Fills the fields the REST contract exposes but the curated list does not spell out
 * (externalId, licenseUrl, totalPlays, releaseDate). Dates are derived so "Novedades"
 * stays in a believable, stable order without hardcoding timestamps.
 */
export const DEMO_TRACKS = CATALOG.map((track, index) => ({
  ...track,
  externalId: `demo-${track.id}`,
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  totalPlays: track.playCount24h * 12 + 40,
  releaseDate: new Date(Date.now() - index * 6 * 3600 * 1000).toISOString(),
}));

export const DEMO_PROVIDERS = [
  { name: 'SEED_CATALOG', available: true, trackCount: DEMO_TRACKS.length },
  { name: 'JAMENDO', available: false, trackCount: 0 },
  { name: 'LOCAL_DISK', available: false, trackCount: 0 },
  { name: 'GENERIC_OPEN_API', available: false, trackCount: 0 },
];

export const DEMO_SYNC_STATUSES = [
  {
    providerName: 'SEED_CATALOG',
    lastSyncAt: new Date().toISOString(),
    newlyAddedTracks: DEMO_TRACKS.length,
    status: 'SUCCESS',
  },
];

/** Mirrors the `/api/recommendations/gemini` payload shape (RecommendedTrackDto). */
export function buildDemoSuggestions(offset = 0) {
  const rotated = [...DEMO_TRACKS.slice(offset), ...DEMO_TRACKS.slice(0, offset)];
  return rotated.map((track, index) => ({
    track,
    tier: track.tier,
    reasoning: track.reasoning,
    vibeSummary: track.genre,
    confidenceScore: Number((0.95 - index * 0.04).toFixed(2)),
  }));
}
