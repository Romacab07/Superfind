import React from 'react';
import { Sparkles, TrendingUp, Music, Shield, Radio, Flame } from 'lucide-react';

export default function HeroBanner({ totalTracks, total24hPlays }) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-5 sm:p-8 mb-8 sm:mb-12 border border-slate-800/90 shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
        
        {/* Left Column: Heading & Description */}
        <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Curaduría Inteligente & Recomendaciones Continuas
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-display">
            Música libre de derechos impulsada por <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">Curaduría Inteligente</span>.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            Descubre artistas emergentes, bandas sonoras y pistas con licencias abiertas para tus proyectos, transmisiones en vivo y listas personales con sugerencias fundamentadas en tiempo real.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-surfaceLight/90 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Licencias Libres CC0 / CC-BY
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-surfaceLight/90 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> Streaming en Alta Fidelidad
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-surfaceLight/90 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Tendencias 24 Horas
            </span>
          </div>
        </div>

        {/* Right Column: Live Telemetry Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 lg:pt-0">
          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Catálogo Activo</span>
              <Music className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-white font-display">
                {totalTracks > 0 ? totalTracks : '8+'}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Pistas disponibles</span>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Escuchas 24h</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-cyan-400 font-display">
                {total24hPlays > 0 ? total24hPlays : '1.2k+'}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Reproducciones</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
