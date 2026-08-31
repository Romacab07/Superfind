import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import BubbleWorld from './components/BubbleWorld';
import Player from './components/Player';
import SyncStatusModal from './components/SyncStatusModal';
import ArchitectureModal from './components/ArchitectureModal';
import { trackApi, recommendationApi, operationsApi } from './services/api';

export default function App() {
  // Data states for 3 blocks
  const [topTracks, setTopTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Navigation & Search/Filter states
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'liked'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Liked tracks state (persisted in localStorage, no account needed!)
  const [likedTrackIds, setLikedTrackIds] = useState(() => {
    try {
      const saved = localStorage.getItem('soundfind_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Player states
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  // Modals & operations
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
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

  // Load all initial data
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

      const topData = top.status === 'fulfilled' ? top.value : [];
      const recentData = recent.status === 'fulfilled' ? recent.value : [];
      const suggestionsData = gemini.status === 'fulfilled' ? gemini.value : [];

      setTopTracks(topData);
      setRecentTracks(recentData);
      setSuggestions(suggestionsData);

      if (provs.status === 'fulfilled') setProviders(provs.value);
      if (statuses.status === 'fulfilled') setSyncStatuses(statuses.value);

      // Build unified playlist for navigation
      const combined = [
        ...suggestionsData.map(s => s.track).filter(Boolean),
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
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Gemini refresh failed:', err);
    } finally {
      setIsRefreshingAi(false);
    }
  };

  // Filter helper
  const filterTrack = useCallback((track) => {
    if (!track) return false;
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      track.title?.toLowerCase().includes(query) ||
      track.artist?.toLowerCase().includes(query) ||
      track.genre?.toLowerCase().includes(query);

    const matchGenre = selectedGenre === 'all' || 
      track.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchQuery && matchGenre;
  }, [searchQuery, selectedGenre]);

  // Filtered tracks
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(item => item.track && filterTrack(item.track));
  }, [suggestions, filterTrack]);

  const filteredTopTracks = useMemo(() => {
    return topTracks.filter(filterTrack);
  }, [topTracks, filterTrack]);

  const filteredRecentTracks = useMemo(() => {
    return recentTracks.filter(filterTrack);
  }, [recentTracks, filterTrack]);

  const likedTracks = useMemo(() => {
    const all = playlist;
    return all.filter(t => likedTrackIds.includes(t.id) && filterTrack(t));
  }, [playlist, likedTrackIds, filterTrack]);

  const isCurrentTrackLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-800 flex relative overflow-x-hidden">
      
      {/* Distant Atmospheric Ambient Soap Bubbles */}
      <div className="ambient-bubble w-72 h-72 top-[-50px] right-[8%] opacity-35 animate-float-slow" />
      <div className="ambient-bubble w-48 h-48 top-[35%] left-[22%] opacity-25 animate-float-delayed" />
      <div className="ambient-bubble w-64 h-64 bottom-[15%] right-[15%] opacity-30 animate-float-alt" />
      <div className="ambient-bubble w-32 h-32 top-[60%] right-[3%] opacity-20 animate-float-slow" />

      {/* Slim Elegant Left Sidebar (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        likedCount={likedTrackIds.length}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSyncStatus={() => setIsSyncStatusOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-36 z-10">
        
        {/* Main Editorial Header with Search & Filter */}
        <MainHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          likedCount={likedTrackIds.length}
        />

        {/* Content: Real Interactive 2D Floating Soap Bubble Canvas World */}
        <div className="w-full">
          <BubbleWorld
            suggestions={suggestions}
            topTracks={topTracks}
            recentTracks={recentTracks}
            likedTrackIds={likedTrackIds}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            activeCategory={activeTab === 'liked' ? 'liked' : 'all'}
            onSelectCategory={(cat) => {
              if (cat === 'liked') {
                setActiveTab('liked');
              } else {
                setActiveTab('discover');
              }
            }}
            onRefreshGemini={handleRefreshGemini}
            isRefreshingAi={isRefreshingAi}
          />
        </div>

      </main>

      {/* Floating Centered Bottom Audio Player */}
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

      {/* Modals */}
      <SyncStatusModal
        isOpen={isSyncStatusOpen}
        onClose={() => setIsSyncStatusOpen(false)}
        providers={providers}
        syncStatuses={syncStatuses}
        onTriggerSync={handleManualSync}
        isSyncing={isSyncing}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
