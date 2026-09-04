import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import BubbleWorld from './components/BubbleWorld';
import ThreeBubbleWorld from './components/ThreeBubbleWorld';
import Player from './components/Player';
import SyncStatusModal from './components/SyncStatusModal';
import { trackApi, recommendationApi, operationsApi } from './services/api';

// Curated Creative Commons / Royalty-Free Reference Tracks with Audio Previews
const FALLBACK_TRACKS = [
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

export default function App() {
  // Theme state: persisted in localStorage ('light' | 'dark')
  // Default to light ethereal pearlescent discovery world matching reference 2
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('theme') === 'light') return false;
      if (urlParams.get('theme') === 'dark') return true;
      const saved = localStorage.getItem('soundfind_theme');
      if (saved) return saved === 'dark';
      return false; // Default light mode as in reference 2
    } catch {
      return false;
    }
  });

  // Apply dark class to documentElement
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get('theme');
      const activeDark = urlTheme === 'light' ? false : urlTheme === 'dark' ? true : isDarkMode;

      if (activeDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('soundfind_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('soundfind_theme', 'light');
      }
    } catch (e) {
      console.warn('Theme preference storage error:', e);
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Renderer state: Three.js 3D (Primary Production World) vs Canvas 2D (Legacy)
  const [useThreeJs, setUseThreeJs] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('renderer') === '2d') return false;
      if (urlParams.get('renderer') === 'three') return true;
      const saved = localStorage.getItem('soundfind_renderer');
      if (saved) return saved === 'three';
      return true; // Three.js 3D default for true soap bubble discovery world
    } catch {
      return true;
    }
  });

  const toggleRenderer = () => {
    setUseThreeJs(prev => {
      const next = !prev;
      localStorage.setItem('soundfind_renderer', next ? 'three' : '2d');
      return next;
    });
  };

  // Data states for 3 blocks initialized with curated reference catalog for instant zero-latency discovery
  const [topTracks, setTopTracks] = useState(() => FALLBACK_TRACKS.slice(0, 4));
  const [recentTracks, setRecentTracks] = useState(() => FALLBACK_TRACKS.slice(3, 9));
  const [suggestions, setSuggestions] = useState(() =>
    FALLBACK_TRACKS.slice(0, 6).map(t => ({
      track: t,
      tier: t.tier,
      reasoning: t.reasoning
    }))
  );

  // Navigation & Search/Filter states - default to 'top24h' (Top Songs) as base experience per Phase 2
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'liked'
  const [activeCategory, setActiveCategory] = useState('top24h'); // 'all' | 'suggestions' | 'top24h' | 'recent' | 'liked'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Consumed Tracks Registry (in-memory per session: resets on page refresh so bubbles return)
  const [consumedTrackIds, setConsumedTrackIds] = useState(() => new Set());

  const markTrackConsumed = useCallback((trackId) => {
    if (!trackId) return;
    setConsumedTrackIds((prev) => {
      const next = new Set(prev);
      next.add(trackId);
      return next;
    });
  }, []);

  // Liked tracks state (persisted in localStorage)
  const [likedTrackIds, setLikedTrackIds] = useState(() => {
    try {
      const saved = localStorage.getItem('soundfind_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Player states - default to Neon Horizon as in Reference 2
  const [currentTrack, setCurrentTrack] = useState(() => FALLBACK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playlist, setPlaylist] = useState(() => FALLBACK_TRACKS);

  // Modals & operations
  const [isSyncStatusOpen, setIsSyncStatusOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [syncStatuses, setSyncStatuses] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  // Save liked tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('soundfind_liked_tracks', JSON.stringify(likedTrackIds));
    } catch (err) {
      console.warn('Could not persist liked tracks:', err);
    }
  }, [likedTrackIds]);

  // Load all initial data with robust fallback
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [top, recent, gemini, provs, statuses] = await Promise.allSettled([
        trackApi.getTop24h(12),
        trackApi.getRecent(14),
        recommendationApi.getGeminiSuggestions(8),
        operationsApi.getProviders(),
        operationsApi.getSyncStatus(),
      ]);

      const topData = (top.status === 'fulfilled' && top.value?.length > 0)
        ? top.value
        : FALLBACK_TRACKS.slice(0, 4);

      const recentData = (recent.status === 'fulfilled' && recent.value?.length > 0)
        ? recent.value
        : FALLBACK_TRACKS.slice(3, 8);

      const suggestionsData = (gemini.status === 'fulfilled' && gemini.value?.length > 0)
        ? gemini.value
        : FALLBACK_TRACKS.slice(0, 5).map(t => ({
            track: t,
            tier: t.tier,
            reasoning: t.reasoning
          }));

      setTopTracks(topData);
      setRecentTracks(recentData);
      setSuggestions(suggestionsData);

      if (provs.status === 'fulfilled' && provs.value?.length > 0) {
        setProviders(provs.value);
      } else {
        setProviders([
          { name: 'Jamendo Music API', available: true },
          { name: 'Free Music Archive', available: true },
          { name: 'Audius Protocol', available: false }
        ]);
      }

      if (statuses.status === 'fulfilled' && statuses.value?.length > 0) {
        setSyncStatuses(statuses.value);
      } else {
        setSyncStatuses([
          { providerName: 'Jamendo Music API', lastSyncAt: new Date().toISOString(), newlyAddedTracks: 12, totalTracksSynced: 148 },
          { providerName: 'Free Music Archive', lastSyncAt: new Date(Date.now() - 3600000).toISOString(), newlyAddedTracks: 6, totalTracksSynced: 82 }
        ]);
      }

      // Build unified playlist for navigation
      const combined = [
        ...suggestionsData.map(s => s.track || s).filter(Boolean),
        ...topData,
        ...recentData
      ];
      const uniqueTracks = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setPlaylist(uniqueTracks);

      // Default current track if none set
      if (!currentTrack && uniqueTracks.length > 0) {
        setCurrentTrack(uniqueTracks[0]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTrack]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Player controls
  const handlePlayTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  // Called when 5s listen telemetry occurs
  const handleTrackPlayRecorded = (trackId) => {
    setTopTracks(prev =>
      prev.map(t => t.id === trackId ? { ...t, playCount24h: (t.playCount24h || 0) + 1 } : t)
    );
  };

  // Toggle favorite / like for a track
  const handleToggleLike = (track) => {
    if (!track) return;
    setLikedTrackIds(prev => {
      if (prev.includes(track.id)) {
        return prev.filter(id => id !== track.id);
      } else {
        return [...prev, track.id];
      }
    });
  };

  // Manual catalog sync
  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await operationsApi.triggerSync();
      await loadDashboardData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Force refresh Gemini AI recommendations
  const handleRefreshGemini = async () => {
    try {
      setIsRefreshingAi(true);
      const newSuggestions = await recommendationApi.refreshGeminiSuggestions(8);
      if (newSuggestions && newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
      } else {
        // Fallback reshuffle
        setSuggestions(prev => [...prev].reverse());
      }
    } catch (err) {
      console.error('Gemini refresh failed, reshuffling local curation:', err);
      setSuggestions(prev => [...prev].reverse());
    } finally {
      setIsRefreshingAi(false);
    }
  };

  const isCurrentTrackLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] select-none transition-colors duration-500">
      
      {/* LAYER 0: Fullscreen Living Discovery Canvas (Three.js 3D WebGL vs Canvas 2D) */}
      {useThreeJs ? (
        <ThreeBubbleWorld
          suggestions={suggestions}
          topTracks={topTracks}
          recentTracks={recentTracks}
          likedTrackIds={likedTrackIds}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
          consumedTrackIds={consumedTrackIds}
          onConsumeTrack={markTrackConsumed}
          searchQuery={searchQuery}
          selectedGenre={selectedGenre}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onRefreshGemini={handleRefreshGemini}
          isRefreshingAi={isRefreshingAi}
          isDarkMode={isDarkMode}
        />
      ) : (
        <BubbleWorld
          suggestions={suggestions}
          topTracks={topTracks}
          recentTracks={recentTracks}
          likedTrackIds={likedTrackIds}
          consumedTrackIds={consumedTrackIds}
          onConsumeTrack={markTrackConsumed}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
          searchQuery={searchQuery}
          selectedGenre={selectedGenre}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onRefreshGemini={handleRefreshGemini}
          isRefreshingAi={isRefreshingAi}
          isDarkMode={isDarkMode}
        />
      )}

      {/* LAYER 1: Floating Navigation Sidebar Overlay */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'liked') setActiveCategory('liked');
          else if (activeCategory === 'liked') setActiveCategory('all');
        }}
        likedCount={likedTrackIds.length}
        onOpenSyncStatus={() => setIsSyncStatusOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        useThreeJs={useThreeJs}
        onToggleRenderer={toggleRenderer}
      />

      {/* LAYER 2: Floating Header & Filters Top Overlay */}
      <MainHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onRefreshGemini={handleRefreshGemini}
        isRefreshingAi={isRefreshingAi}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        likedCount={likedTrackIds.length}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* LAYER 3: Floating Bottom Audio Player Overlay */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onTrackPlayRecorded={handleTrackPlayRecorded}
        isLiked={isCurrentTrackLiked}
        onToggleLike={handleToggleLike}
      />

      {/* LAYER 4: Modals with Glass Bubble Aesthetics */}
      <SyncStatusModal
        isOpen={isSyncStatusOpen}
        onClose={() => setIsSyncStatusOpen(false)}
        providers={providers}
        syncStatuses={syncStatuses}
        onTriggerSync={handleManualSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}
