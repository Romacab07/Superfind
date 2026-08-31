import React from 'react';
import { Sparkles, RefreshCw, Layers, ShieldCheck, Radio } from 'lucide-react';

export default function Navbar({ onOpenArchitecture, onOpenSyncStatus, onManualSync, isSyncing }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <div className="w-full h-full bg-surface rounded-xl flex items-center justify-center">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 font-display">
                SoundWave
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                Libre CC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              Música independiente y de libre uso para creadores
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-surfaceLight hover:bg-slate-800 hover:text-white border border-slate-700/60 transition shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Sincronizar novedades de catálogo"
            aria-label="Sincronizar catálogo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <button
            onClick={onOpenSyncStatus}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-surfaceLight hover:bg-slate-800 hover:text-white border border-slate-700/60 transition shadow-sm active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
            title="Ver catálogo y estado de fuentes"
            aria-label="Fuentes de catálogo"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Fuentes</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Ver arquitectura técnica del sistema"
            aria-label="Arquitectura del sistema"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden xs:inline">Arquitectura</span>
          </button>
        </div>
      </div>
    </header>
  );
}
