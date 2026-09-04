import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shield, Sparkles, Shuffle, Repeat, ListMusic, Plus } from 'lucide-react';
import { trackApi } from '../services/api';
import { extractTrackPalette } from '../utils/paletteExtractor';

/**
 * Player - Organic Soap Bubble Audio Cluster
 * 
 * Features:
 * - Elongated translucent soap bubble capsule membrane with iridescent borders.
 * - Dynamic album-derived palette accent colors with smooth transitions (400-800ms).
 * - Spherical controls: Spinning artwork bubble, glossy hero play/pause sphere, like bubble, volume pill.
 * - Liquid glowing timeline progress slider.
 * - Libre CC badge & floating plus bubble matching the reference.
 */
export default function Player({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onTrackPlayRecorded,
  isLiked = false,
  onToggleLike
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(84); // 1:24 default preview
  const [duration, setDuration] = useState(372); // 6:12 default preview
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const playRecordedRef = useRef(false);

  // Extract dynamic album palette
  const palette = extractTrackPalette(currentTrack);

  // Load and play when currentTrack changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      playRecordedRef.current = false;

      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Playback autoplay policy:', err.message);
        });
      }
    }
  }, [currentTrack]);

  // Handle play/pause toggle
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.warn(err.message));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Record 5s telemetry
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      if (time >= 5 && !playRecordedRef.current && currentTrack) {
        playRecordedRef.current = true;
        trackApi.recordPlay(currentTrack.id).then(() => {
          if (onTrackPlayRecorded) onTrackPlayRecorded(currentTrack.id);
        });
      }
    }
  };

  const handleLoadedMetadata = () => {
    const dur = audioRef.current?.duration;
    setDuration(currentTrack?.durationSeconds || ((!isNaN(dur) && dur > 0) ? dur : 372));
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume > 0 ? volume : 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <aside
        aria-label="Reproductor de audio"
        className="fixed bottom-4 sm:bottom-6 xl:bottom-8 left-1/2 -translate-x-1/2 w-[94%] sm:w-[92%] max-w-4xl xl:max-w-5xl 2xl:max-w-6xl z-30 player-bubble-cluster-asymmetric px-6 sm:px-8 xl:px-10 py-3.5 sm:py-4 xl:py-5 transition-all duration-500 pointer-events-auto shadow-2xl"
      >
        <div className="bubble-gleam !top-[6%] !left-[6%] !w-[28%] !h-[30%]" />
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            if (isRepeat && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } else {
              onNextTrack();
            }
          }}
        />

        <div className="flex items-center justify-between gap-2 sm:gap-5">
          
          {/* Left: Artwork Bubble, Track Info & Heart Like Bubble */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial sm:w-[210px]">
            
            {/* Artwork Bubble */}
            <div
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden flex-shrink-0 bubble-surface flex items-center justify-center p-0.5 shadow-md transition-transform duration-500 border border-violet-400/40"
            >
              <img
                src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'}
                alt={currentTrack.title}
                className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationDuration: '20s' }}
              />
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[35%]" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate font-display">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Glowing Like / Favorite Bubble Orb */}
            <button
              onClick={() => onToggleLike && onToggleLike(currentTrack)}
              className={`w-8 h-8 sm:w-9 sm:h-9 bubble-surface-orb transition cursor-pointer flex-shrink-0 shadow-md ${
                isLiked ? 'text-violet-500 fill-violet-500 ring-1.5 ring-violet-400/60 shadow-violet-500/30' : 'text-slate-400 hover:text-violet-500'
              }`}
              title={isLiked ? 'Quitar de Me gusta' : 'Guardar en Me gusta'}
              aria-label={isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'fill-current' : ''}`} />
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>
          </div>

          {/* Center: Controls Cluster & Liquid Timeline */}
          <div className="flex flex-col items-center flex-shrink-0 sm:flex-1 sm:max-w-md">
            <div className="flex items-center gap-1.5 sm:gap-3 xl:gap-4 mb-0.5">
              {/* Shuffle Bubble */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`hidden sm:flex w-8 h-8 xl:w-9 xl:h-9 bubble-surface-orb transition cursor-pointer ${
                  isShuffle ? 'text-violet-500 font-bold ring-1.5 ring-violet-400/60' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Aleatorio"
              >
                <Shuffle className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
              </button>

              {/* Prev Track Bubble Orb */}
              <button
                onClick={onPrevTrack}
                className="w-8 h-8 sm:w-9 sm:h-9 xl:w-11 xl:h-11 bubble-surface-orb text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
                title="Anterior"
                aria-label="Pista anterior"
              >
                <SkipBack className="w-4 h-4 xl:w-5 xl:h-5" />
                <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
              </button>

              {/* Central Glossy Play/Pause Hero Bubble Sphere */}
              <button
                onClick={onTogglePlay}
                className="w-11 h-11 sm:w-14 sm:h-14 xl:w-16 xl:h-16 bubble-play-hero cursor-pointer relative"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 xl:w-6 xl:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 xl:w-6 xl:h-6 fill-current ml-0.5" />
                )}
                <div className="bubble-gleam !top-[8%] !left-[12%] !w-[38%] !h-[28%]" />
              </button>

              {/* Next Track Bubble Orb */}
              <button
                onClick={onNextTrack}
                className="w-8 h-8 sm:w-9 sm:h-9 xl:w-11 xl:h-11 bubble-surface-orb text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
                title="Siguiente"
                aria-label="Siguiente pista"
              >
                <SkipForward className="w-4 h-4 xl:w-5 xl:h-5" />
                <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
              </button>

              {/* Repeat Bubble */}
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`hidden sm:flex w-8 h-8 xl:w-9 xl:h-9 bubble-surface-orb transition cursor-pointer ${
                  isRepeat ? 'text-violet-500 font-bold ring-1.5 ring-violet-400/60' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Repetir"
              >
                <Repeat className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
              </button>
            </div>

            {/* Liquid Timeline Progress Bar (Violet Gradient matching Reference) */}
            <div className="hidden sm:flex w-full items-center gap-2.5 text-[10.5px] font-mono text-slate-400 dark:text-slate-400">
              <span className="w-7 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="relative flex-1 flex items-center py-0.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-full appearance-none cursor-pointer transition accent-[#8b7cf6]"
                  style={{
                    background: `linear-gradient(to right, #818cf8 0%, #8b7cf6 ${progressPercent}%, rgba(148, 163, 184, 0.25) ${progressPercent}%, rgba(148, 163, 184, 0.25) 100%)`
                  }}
                  aria-label="Línea de tiempo de la canción"
                />
              </div>
              <span className="w-7 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Libre CC Badge, Volume & Extra Floating Bubble Controls */}
          <div className="hidden sm:flex items-center justify-end gap-2.5 sm:w-[230px]">
            
            {/* Libre CC Badge Pill */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-400/50 px-3 py-1 rounded-full bubble-pill shadow-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Libre CC</span>
            </div>

            {/* Volume Control Bubble Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bubble-pill">
              <button
                onClick={toggleMute}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-slate-300 dark:bg-slate-700/60 rounded-full cursor-pointer accent-[#8b7cf6]"
                aria-label="Volumen"
              />
            </div>

            {/* Queue / Playlist Icon Bubble Orb */}
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 bubble-surface-orb text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
              title="Lista de reproducción"
              aria-label="Lista de reproducción"
            >
              <ListMusic className="w-4 h-4" />
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>
          </div>

        </div>
      </aside>

      {/* Floating Action + Bubble Button Adjacent to Soundbar matching Reference 1 & 2 */}
      <button
        className="fixed bottom-14 lg:bottom-16 xl:bottom-20 right-5 lg:right-[calc(50%-495px)] 2xl:right-[calc(50%-605px)] w-11 h-11 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bubble-surface-orb text-slate-800 dark:text-white shadow-xl z-30 pointer-events-auto border border-white/70 dark:border-white/30"
        title="Crear nueva burbuja musical"
        aria-label="Crear"
      >
        <Plus className="w-5 h-5 xl:w-6 xl:h-6" />
        <div className="bubble-gleam !top-[10%] !left-[12%] !w-[36%]" />
      </button>
    </>
  );
}
