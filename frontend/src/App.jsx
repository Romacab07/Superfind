import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import BlockATop24h from './components/BlockATop24h';
import BlockBRecent from './components/BlockBRecent';
import BlockCSuggested from './components/BlockCSuggested';
import AudioPlayerBar from './components/AudioPlayerBar';
import SyncStatusModal from './components/SyncStatusModal';
import ArchitectureModal from './components/ArchitectureModal';
import { trackApi, recommendationApi, operationsApi } from './services/api';

export default function App() {
  // Data states for 3 blocks
  const [topTracks, setTopTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

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

  // Load all initial data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [top, recent, gemini, provs, statuses] = await Promise.allSettled([
        trackApi.getTop24h(10),
        trackApi.getRecent(12),
        recommendationApi.getGeminiSuggestions(6),
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

      // Build unified playlist for smooth next/previous navigation
      const combined = [...topData, ...recentData];
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

  // Manual multi-provider sync
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
      const newSuggestions = await recommendationApi.refreshGeminiSuggestions(6);
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Gemini refresh failed:', err);
    } finally {
      setIsRefreshingAi(false);
    }
  };

  const totalPlaysCount = topTracks.reduce((acc, t) => acc + (t.playCount24h || 0), 0);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col pb-28">
      {/* Navbar */}
      <Navbar
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSyncStatus={() => setIsSyncStatusOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <HeroBanner
          totalTracks={playlist.length}
          total24hPlays={totalPlaysCount}
        />

        {/* Bloque C: Sugeridos (Gemini AI) - High visual priority */}
        <BlockCSuggested
          suggestions={suggestions}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
          onRefreshSuggestions={handleRefreshGemini}
          isRefreshing={isRefreshingAi}
        />

        {/* Bloque A: Top últimas 24hs. */}
        <BlockATop24h
          tracks={topTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
        />

        {/* Bloque B: Novedades del Catálogo */}
        <BlockBRecent
          tracks={recentTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
        />
      </main>

      {/* Persistent Bottom Audio Player */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onTrackPlayRecorded={handleTrackPlayRecorded}
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
