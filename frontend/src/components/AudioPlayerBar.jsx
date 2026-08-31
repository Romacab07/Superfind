import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shield, Music } from 'lucide-react';
import { trackApi } from '../services/api';

export default function AudioPlayerBar({ currentTrack, isPlaying, onTogglePlay, onNextTrack, onPrevTrack, onTrackPlayRecorded }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
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
          console.warn('Auto-play blocked or error:', err.message);
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

  // Listen telemetry after 5 seconds of active playback
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
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 bg-[#0c0e18]/95 backdrop-blur-2xl shadow-2xl py-2.5 sm:py-3.5 px-3 sm:px-6">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNextTrack}
      />

      {/* Top mini progress line for mobile */}
      <div className="sm:hidden absolute top-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Track Info (Left) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial sm:w-1/4">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-slate-700/50">
            <img
              src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-cyan-400 animate-wave-1 rounded-full" />
                  <span className="w-0.5 bg-cyan-400 animate-wave-2 rounded-full" />
                  <span className="w-0.5 bg-cyan-400 animate-wave-3 rounded-full" />
                </div>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-display">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              {currentTrack.artist}
            </p>
            <div className="hidden sm:flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                <Shield className="w-2.5 h-2.5" />
                {currentTrack.license || 'Licencia Libre CC'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Controls (Mobile + Desktop) */}
        <div className="flex flex-col items-center flex-shrink-0 sm:flex-1 sm:max-w-xl">
          <div className="flex items-center gap-2.5 sm:gap-5">
            <button
              onClick={onPrevTrack}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
              title="Pista anterior"
              aria-label="Pista anterior"
            >
              <SkipBack className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition transform active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
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
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
              title="Siguiente pista"
              aria-label="Siguiente pista"
            >
              <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Mobile Mute button */}
            <button
              onClick={toggleMute}
              className="sm:hidden p-1.5 text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Timeline Bar (Desktop & Tablets) */}
          <div className="hidden sm:flex w-full items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
            <span className="w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer transition hover:bg-slate-700"
              aria-label="Progreso de reproducción"
            />
            <span className="w-9 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Details (Desktop Right) */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/4">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
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
            className="w-20 h-1.5 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700"
            aria-label="Control de volumen"
          />
        </div>

      </div>
    </div>
  );
}
