import React from 'react';
import { Play, Pause, Radio, Shield } from 'lucide-react';

export default function BlockBRecent({ tracks, currentTrack, isPlaying, onPlayTrack }) {
  return (
    <section className="mb-10 sm:mb-14">
      {/* Section Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-500/10">
            <Radio className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Novedades
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                Lanzamientos Recientes
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nuevas incorporaciones sincronizadas desde catálogos abiertos y música libre
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start xs:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Actualización continua
        </span>
      </div>

      {/* Grid of New Releases */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {tracks && tracks.length > 0 ? (
          tracks.map((track, index) => {
            const isCurrent = currentTrack && currentTrack.id === track.id;
            const playingThis = isCurrent && isPlaying;

            return (
              <div
                key={track.id || index}
                onClick={() => onPlayTrack(track)}
                className={`glass-card p-3 rounded-2xl cursor-pointer group flex flex-col justify-between transition duration-200 ${
                  isCurrent ? 'border-cyan-500/60 bg-cyan-950/20 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40' : 'hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Artwork Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 sm:mb-3 shadow-md">
                    <img
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />

                    <div className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-300 uppercase tracking-wider border border-white/10">
                      {track.provider || 'JAMENDO'}
                    </div>

                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition opacity-0 group-hover:opacity-100 ${
                      playingThis ? 'opacity-100 bg-black/60' : ''
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition">
                        {playingThis ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <h4 className={`text-xs sm:text-sm font-semibold truncate font-display ${
                    isCurrent ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
                  }`}>
                    {track.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2 border-t border-slate-800/60 text-[10px] sm:text-[11px] text-slate-400">
                  <span className="truncate max-w-[80px] sm:max-w-[90px] font-medium text-slate-300">
                    {track.genre || 'Indie'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <Shield className="w-2.5 h-2.5" />
                    CC-Free
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-8 text-slate-400 glass-panel rounded-2xl">
            Sincronizando últimas novedades...
          </div>
        )}
      </div>
    </section>
  );
}
