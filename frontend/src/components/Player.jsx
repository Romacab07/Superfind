import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shield, Sparkles } from 'lucide-react';
import { trackApi } from '../services/api';

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const playRecordedRef = useRef(false);

  // Load and play when currentTrack changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      playRecordedRef.current = false;

      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Playback error / Autoplay policy:', err.message);
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
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTrack?.durationSeconds || 0);
    }
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
    <aside aria-label="Reproductor de audio" className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] md:w-[88%] lg:w-[860px] max-w-5xl z-50 player-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 shadow-[0_16px_45px_-10px_rgba(99,102,241,0.18)] border border-white/90">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNextTrack}
      />

      {/* Mini top progress indicator for mobile */}
      <div className="sm:hidden absolute -top-1 left-4 right-4 h-1 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Track Info & Heart Like */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-[220px]">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-slate-200/80 soap-bubble flex items-center justify-center p-0.5">
            <img
              src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-full"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-indigo-900/20 rounded-full flex items-center justify-center pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-display">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Like / Favorite Button */}
          <button
            onClick={() => onToggleLike && onToggleLike(currentTrack)}
            className="p-1.5 rounded-full text-slate-400 hover:text-pink-600 transition cursor-pointer flex-shrink-0"
            title={isLiked ? 'Quitar de Me gusta' : 'Guardar en Me gusta'}
            aria-label={isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex flex-col items-center flex-shrink-0 sm:flex-1 sm:max-w-md">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onPrevTrack}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition active:scale-90 cursor-pointer"
              title="Anterior"
              aria-label="Pista anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition transform active:scale-90 cursor-pointer"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition active:scale-90 cursor-pointer"
              title="Siguiente"
              aria-label="Siguiente pista"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Bar (Desktop) */}
          <div className="hidden sm:flex w-full items-center gap-2.5 text-[11px] font-mono text-slate-500 mt-1">
            <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-200/90 rounded-lg cursor-pointer transition hover:bg-slate-300"
              aria-label="Línea de tiempo de la canción"
            />
            <span className="w-8 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & License Pill */}
        <div className="hidden sm:flex items-center justify-end gap-3 sm:w-[220px]">
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-semibold">
            <Shield className="w-2.5 h-2.5" />
            Libre CC
          </span>

          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-18 h-1.5 bg-slate-200/90 rounded-lg cursor-pointer"
            aria-label="Volumen"
          />
        </div>

      </div>
    </aside>
  );
}
