import React from 'react';
import { Sparkles, Play, Pause, RefreshCw, Lightbulb, Music2 } from 'lucide-react';

export default function BlockCSuggested({ suggestions, currentTrack, isPlaying, onPlayTrack, onRefreshSuggestions, isRefreshing }) {
  
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'UNDERGROUND':
        return {
          label: 'Gema Oculta',
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
          dot: 'bg-purple-400',
        };
      case 'GROWING':
        return {
          label: 'En Crecimiento',
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400',
        };
      case 'HEAVY_ROTATION':
      default:
        return {
          label: 'Tendencia Top',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
        };
    }
  };

  return (
    <section className="mb-10 sm:mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Curaduría IA
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                Sugerencias para Ti
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Recomendaciones personalizadas basadas en patrones de tracción y descubrimiento musical
            </p>
          </div>
        </div>

        {/* Refresh AI Button */}
        <button
          onClick={onRefreshSuggestions}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-200 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Explorar nuevas sugerencias"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Actualizando...' : 'Nuevas Sugerencias'}</span>
        </button>
      </div>

      {/* Grid of Recommended Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((item, index) => {
            const track = item.track;
            if (!track) return null;

            const isCurrent = currentTrack && currentTrack.id === track.id;
            const playingThis = isCurrent && isPlaying;
            const badge = getTierBadge(item.tier);

            return (
              <div
                key={track.id || index}
                className={`glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 group border cursor-pointer ${
                  isCurrent ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/40' : 'border-slate-800/80 hover:border-indigo-500/40'
                }`}
                onClick={() => onPlayTrack(track)}
              >
                {/* Background subtle radial glow */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-600/10 rounded-full blur-xl pointer-events-none" />

                <div>
                  {/* Top: Track Preview & Play Button */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTrack(track);
                        }}
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition opacity-0 group-hover:opacity-100 ${
                          playingThis ? 'opacity-100 bg-black/60' : ''
                        }`}
                        aria-label={playingThis ? 'Pausar' : 'Reproducir'}
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition">
                          {playingThis ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </div>
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {track.playCount24h} escuchas
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition font-display">
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Explainable Curation Note */}
                  <div className="p-3 rounded-xl bg-surfaceLight/80 border border-slate-700/40 text-xs text-slate-300 leading-relaxed mb-3">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px] mb-1">
                      <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Nota de curaduría:</span>
                    </div>
                    <p className="italic text-slate-300 text-[11px]">
                      "{item.reasoning}"
                    </p>
                  </div>
                </div>

                {/* Bottom: Vibe Mood & Playing Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400 truncate max-w-[170px] flex items-center gap-1">
                    <Music2 className="w-3 h-3 text-indigo-400 inline" />
                    <span>{item.vibeSummary || track.genre || 'Indie'}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {playingThis ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-indigo-400 animate-wave-1 rounded-full" />
                        <span className="w-0.5 bg-indigo-400 animate-wave-2 rounded-full" />
                        <span className="w-0.5 bg-indigo-400 animate-wave-3 rounded-full" />
                      </div>
                    ) : null}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      {playingThis ? 'Pausar' : 'Escuchar'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-slate-400 glass-panel rounded-2xl">
            {isRefreshing ? 'Descubriendo recomendaciones para ti...' : 'Cargando sugerencias curadas...'}
          </div>
        )}
      </div>
    </section>
  );
}
