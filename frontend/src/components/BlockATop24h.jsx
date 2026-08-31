import React from 'react';
import { Flame, Play, Pause, Headphones, Clock } from 'lucide-react';

export default function BlockATop24h({ tracks, currentTrack, isPlaying, onPlayTrack }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '3:20';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="mb-10 sm:mb-14">
      {/* Section Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/10">
            <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Tendencias
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                Top Últimas 24 Horas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Las pistas con mayor tracción e interacción en la comunidad durante el último día
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline self-start xs:self-auto bg-surfaceLight/60 px-2.5 py-1 rounded-full border border-slate-700/40">
          Ventana móvil 24h
        </span>
      </div>

      {/* Top Tracks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tracks && tracks.length > 0 ? (
          tracks.map((track, index) => {
            const isCurrent = currentTrack && currentTrack.id === track.id;
            const playingThis = isCurrent && isPlaying;

            return (
              <div
                key={track.id || index}
                onClick={() => onPlayTrack(track)}
                className={`glass-card p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all duration-200 ${
                  isCurrent ? 'border-indigo-500/60 bg-indigo-950/25 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40' : 'hover:border-slate-700'
                }`}
              >
                {/* Left: Position & Cover */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span className={`w-5 text-center font-mono font-bold text-xs sm:text-sm flex-shrink-0 ${
                    index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-200' : index === 2 ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    #{index + 1}
                  </span>

                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition opacity-0 group-hover:opacity-100 ${
                      playingThis ? 'opacity-100 bg-black/60' : ''
                    }`}>
                      {playingThis ? (
                        <Pause className="w-5 h-5 text-white fill-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate font-display ${
                      isCurrent ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surfaceLight text-slate-300 font-medium truncate max-w-[90px]">
                        {track.genre || 'Indie'}
                      </span>
                      {playingThis && (
                        <div className="flex items-end gap-0.5 h-2.5 ml-1">
                          <span className="w-0.5 bg-amber-400 animate-wave-1 rounded-full" />
                          <span className="w-0.5 bg-amber-400 animate-wave-2 rounded-full" />
                          <span className="w-0.5 bg-amber-400 animate-wave-3 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Plays */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 text-right">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-400">
                      <Headphones className="w-3 h-3" />
                      <span>{track.playCount24h || 0}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">escuchas</span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono hidden xs:inline">
                    {formatDuration(track.durationSeconds)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-400 glass-panel rounded-2xl">
            Cargando ranking de las últimas 24 horas...
          </div>
        )}
      </div>
    </section>
  );
}
