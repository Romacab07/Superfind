import React from 'react';
import { Compass, Heart, Radio, ShieldCheck, RefreshCw, Moon, Sun } from 'lucide-react';

/**
 * Sidebar - Floating Organic Bubble Navigation Overlay
 * 
 * In Reference 2:
 * - Floating iridescent logo bubble orb at the top.
 * - Pill bubble navigation for "Descubrir" & "Me gusta".
 * - Translucent platform controls.
 * - Floating editorial bubble with heart at the bottom.
 * - Zero blockage of the discovery canvas.
 */
export default function Sidebar({
  activeTab = 'discover',
  onSelectTab,
  likedCount = 0,
  onOpenSyncStatus,
  onManualSync,
  isSyncing = false,
  isDarkMode = true,
  onToggleTheme,
  useThreeJs = true,
  onToggleRenderer,
}) {
  return (
    <aside className="fixed top-3 sm:top-5 left-3 sm:left-5 bottom-28 z-20 pointer-events-none flex flex-col justify-between w-52 sm:w-56 hidden lg:flex transition-all duration-300">
      
      {/* Top Floating Section: Brand Sphere & Navigation Capsules */}
      <div className="space-y-3.5">
        
        {/* Brand Spherical Bubble matching Reference 2 */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full bubble-capsule flex flex-col items-center justify-center p-3 text-center shadow-xl pointer-events-auto group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-0.5 text-indigo-500 dark:text-cyan-300">
            <Radio className="w-5 h-5 animate-pulse-subtle" />
          </div>
          
          <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-primary)] font-display leading-tight">
            SuperFind
          </h1>
          
          <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
            Find what floats.
          </p>

          <div className="bubble-gleam !top-[10%] !left-[14%] !w-[36%] !h-[22%]" />
        </div>

        {/* Floating Navigation Pill Bubbles with Organic Fluid Silhouettes */}
        <nav className="space-y-2 pointer-events-auto">
          <button
            onClick={() => onSelectTab('discover')}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer relative overflow-hidden bubble-organic-fluid-2 ${
              activeTab === 'discover'
                ? 'bubble-capsule-chip-active shadow-lg'
                : 'bubble-capsule-chip text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass className={`w-3.5 h-3.5 ${activeTab === 'discover' ? 'text-white' : 'text-violet-500 dark:text-violet-300'}`} />
              <span>Descubrir</span>
            </div>
            {activeTab === 'discover' && (
              <span className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse" />
            )}
            <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
          </button>

          <button
            onClick={() => onSelectTab('liked')}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer relative overflow-hidden bubble-organic-fluid-1 ${
              activeTab === 'liked'
                ? 'bubble-capsule-chip-active shadow-lg'
                : 'bubble-capsule-chip text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'liked' ? 'text-white fill-white' : 'text-rose-500 dark:text-rose-400'}`} />
              <span>Me gusta</span>
            </div>
            {likedCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                activeTab === 'liked'
                  ? 'bg-white text-violet-700'
                  : 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300'
              }`}>
                {likedCount}
              </span>
            )}
            <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
          </button>
        </nav>

        {/* Theme Toggle Pill */}
        <div className="pointer-events-auto space-y-1.5">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 bubble-capsule-chip bubble-organic-fluid-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
              <span>{isDarkMode ? 'Burbuja Clara' : 'Burbuja Oscura'}</span>
            </div>
            <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
              {isDarkMode ? 'DARK' : 'LIGHT'}
            </span>
          </button>

          {/* Graphic Engine Toggle Pill (Three.js 3D WebGL vs Canvas 2D) */}
          {onToggleRenderer && (
            <button
              onClick={onToggleRenderer}
              className="w-full flex items-center justify-between px-3.5 py-1.5 bubble-capsule-chip bubble-organic-fluid-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 transition cursor-pointer"
              title="Alternar motor visual (Three.js WebGL / Canvas 2D)"
            >
              <span>Motor visual</span>
              <span className={`text-[8.5px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${
                useThreeJs
                  ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/30'
                  : 'bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
              }`}>
                {useThreeJs ? 'THREE.JS 3D' : 'CANVAS 2D'}
              </span>
            </button>
          )}
        </div>

        {/* Platform Utility Bubbles */}
        <div className="pt-2 border-t border-slate-300/30 dark:border-slate-800/40 space-y-1.5 pointer-events-auto">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3">
            PLATAFORMA
          </span>

          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 bubble-capsule-chip bubble-organic-fluid-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Sincronizar novedades de catálogo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Actualizar catálogo'}</span>
          </button>

          <button
            onClick={onOpenSyncStatus}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 bubble-capsule-chip bubble-organic-fluid-3 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fuentes conectadas</span>
          </button>
        </div>

      </div>

      {/* Decorative Floating Micro-Bubbles along Sidebar Margin */}
      <div className="absolute -right-3 top-36 pointer-events-none flex flex-col gap-10 opacity-70">
        <div className="w-3.5 h-3.5 rounded-full bubble-surface-orb shadow-sm animate-float-slow" />
        <div className="w-2.5 h-2.5 rounded-full bubble-surface-orb shadow-sm animate-float-delayed" />
        <div className="w-3 h-3 rounded-full bubble-surface-orb shadow-sm animate-float" />
      </div>

      {/* Bottom Floating Soap Bubble Editorial Card (Asymmetric Fluid, leaves water visible) */}
      <div className="relative pointer-events-auto">
        <div className="bubble-capsule-asymmetric p-4 pr-7 space-y-1 shadow-lg">
          <h5 className="text-[11px] font-bold text-slate-900 dark:text-white font-display leading-tight">
            Música libre. <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">Talento real.</span>
          </h5>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-snug">
            Descubrí y apoyá a artistas independientes que comparten su música sin restricciones.
          </p>
          <div className="bubble-gleam !top-[8%] !left-[10%] !w-[30%]" />
        </div>

        {/* Mini Floating Heart Bubble */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bubble-surface-orb flex items-center justify-center shadow-lg border border-violet-400/40 animate-float-slow z-10">
          <Heart className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
          <div className="bubble-gleam !left-[10%] !w-[30%]" />
        </div>
      </div>

    </aside>
  );
}
