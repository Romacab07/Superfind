import React from 'react';
import { Compass, Heart, Radio, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Sidebar({
  activeTab = 'discover',
  onSelectTab,
  likedCount = 0,
  onOpenArchitecture,
  onOpenSyncStatus,
  onManualSync,
  isSyncing = false
}) {
  return (
    <aside className="w-64 flex-shrink-0 min-h-screen border-r border-slate-200/70 p-6 flex flex-col justify-between glass-panel-light z-30 sticky top-0 h-screen hidden md:flex">
      
      {/* Top Section: Logo & Nav */}
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {/* Iridescent Bubble Logo Icon */}
            <div className="relative w-9 h-9 rounded-full soap-bubble flex items-center justify-center shadow-sm">
              <Radio className="w-4 h-4 text-indigo-600 animate-pulse-subtle" />
              <div className="bubble-gleam" />
            </div>
            
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                SuperFind
              </span>
            </div>
          </div>
          
          <p className="text-[11px] font-semibold tracking-wider text-indigo-600 pl-0.5">
            Find what floats.
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          <button
            onClick={() => onSelectTab('discover')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/90 text-indigo-700 border border-indigo-200/80 shadow-[0_2px_12px_-3px_rgba(99,102,241,0.18)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass className={`w-4 h-4 ${activeTab === 'discover' ? 'text-indigo-600' : 'text-slate-600'}`} />
              <span>Descubrir</span>
            </div>
            {activeTab === 'discover' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('liked')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'liked'
                ? 'bg-gradient-to-r from-pink-50/90 to-purple-50/90 text-pink-700 border border-pink-200/80 shadow-[0_2px_12px_-3px_rgba(236,72,153,0.18)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'text-pink-500 fill-pink-500' : 'text-slate-600'}`} />
              <span>Me gusta</span>
            </div>
            {likedCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'liked' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {likedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Sync & Sources Tools */}
        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3">
            Plataforma
          </span>

          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition cursor-pointer disabled:opacity-50"
            title="Sincronizar novedades de catálogo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Actualizar catálogo'}</span>
          </button>

          <button
            onClick={onOpenSyncStatus}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fuentes conectadas</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-white/60 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Arquitectura Cloud</span>
          </button>
        </div>

      </div>

      {/* Bottom Editorial Message */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-white/90 to-indigo-50/40 border border-slate-200/70 shadow-sm space-y-2">
        <div>
          <h5 className="text-xs font-bold text-slate-900 font-display leading-tight">
            Música libre.
          </h5>
          <h5 className="text-xs font-bold text-indigo-600 font-display leading-tight">
            Talento real.
          </h5>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Descubrí y apoyá a artistas independientes que comparten su música sin restricciones de copyright.
        </p>
      </div>

    </aside>
  );
}
