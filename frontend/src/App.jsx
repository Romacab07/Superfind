import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import BubbleWorld from './components/BubbleWorld';
import ThreeBubbleWorld from './components/ThreeBubbleWorld';
import Player from './components/Player';
import SyncStatusModal from './components/SyncStatusModal';
import TrackInfoModal from './components/TrackInfoModal';
import { trackApi, recommendationApi, operationsApi } from './services/api';
import { DEMO_TRACKS } from './services/demoCatalog';
import { buildDynamicCategories } from './utils/categoryManager';

// Curated Creative Commons / Royalty-Free reference catalog, shared with the static demo build.
// Used as the zero-latency first paint and as the fallback whenever the backend is unreachable.
const FALLBACK_TRACKS = DEMO_TRACKS;

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoTrack, setSelectedInfoTrack] = useState(null);
  const [infoModalInitialTab, setInfoModalInitialTab] = useState('info');
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
        trackApi.getTop24h(35),
        trackApi.getRecent(50),
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

  // Open Track & Artist Info Drawer / Modal
  const handleOpenTrackInfo = useCallback((track, tab = 'info') => {
    setSelectedInfoTrack(track || currentTrack);
    setInfoModalInitialTab(tab || 'info');
    setIsInfoModalOpen(true);
  }, [currentTrack]);

  // Compute live dynamic categories
  const dynamicSections = useMemo(() => {
    const allTracks = [
      ...(suggestions || []).map(s => s?.track || s),
      ...(topTracks || []),
      ...(recentTracks || []),
    ].filter(Boolean);
    
    // Dedup by id
    const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.id, t])).values());
    
    return buildDynamicCategories(uniqueTracks);
  }, [suggestions, topTracks, recentTracks]);

  const isCurrentTrackLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] select-none transition-colors duration-500">
      
      {/* LAYER 0: Fullscreen Living Discovery Canvas (Three.js 3D WebGL vs Canvas 2D) */}
      {useThreeJs ? (
        <ThreeBubbleWorld
          dynamicSections={dynamicSections}
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
          dynamicSections={dynamicSections}
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
        dynamicSections={dynamicSections}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'liked') setActiveCategory('liked');
          else if (activeCategory === 'liked') setActiveCategory('all');
        }}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        likedCount={likedTrackIds.length}
        onOpenSyncStatus={() => setIsSyncStatusOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        useThreeJs={useThreeJs}
        onToggleRenderer={toggleRenderer}
        currentTrack={currentTrack}
        onOpenInfo={handleOpenTrackInfo}
      />

      {/* LAYER 2: Floating Header & Filters Top Overlay */}
      <MainHeader
        dynamicSections={dynamicSections}
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
        currentTrack={currentTrack}
        onOpenInfo={handleOpenTrackInfo}
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
        onOpenInfo={handleOpenTrackInfo}
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

      <TrackInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        track={selectedInfoTrack || currentTrack}
        isPlaying={isPlaying && ((selectedInfoTrack?.id || currentTrack?.id) === currentTrack?.id)}
        onTogglePlay={(t) => {
          if (currentTrack?.id === t?.id) {
            handleTogglePlay();
          } else {
            handlePlayTrack(t);
          }
        }}
        isLiked={selectedInfoTrack ? likedTrackIds.includes(selectedInfoTrack.id) : isCurrentTrackLiked}
        onToggleLike={handleToggleLike}
        relatedTracks={useMemo(() => {
          const activeId = selectedInfoTrack?.id || currentTrack?.id;
          const allPool = [
            ...(suggestions || []).map(s => s?.track || s),
            ...(topTracks || []),
            ...(recentTracks || []),
          ].filter(Boolean);
          const seen = new Set();
          const unique = [];
          for (const t of allPool) {
            if (t?.id && t.id !== activeId && !seen.has(t.id)) {
              seen.add(t.id);
              unique.push(t);
            }
          }
          return unique.slice(0, 6);
        }, [suggestions, topTracks, recentTracks, selectedInfoTrack, currentTrack])}
        onSelectTrack={(t) => {
          handlePlayTrack(t);
          setSelectedInfoTrack(t);
        }}
        initialTab={infoModalInitialTab}
      />
    </div>
  );
}
