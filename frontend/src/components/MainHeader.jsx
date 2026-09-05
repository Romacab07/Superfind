import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Radio, Compass, Heart, Moon, Sun, Sparkles, TrendingUp, Music, Info, Headphones } from 'lucide-react';

/**
 * MainHeader - Floating Top Overlay with Soap Bubble Capsules
 * 
 * Features:
 * - Floating top overlay with zero viewport obstruction.
 * - Title capsule: "Descubrí música nueva. Sin derechos, sin límites."
 * - Elongated translucent search bubble + circular filter button with active badge.
 * - Floating category constellation pills with live dynamic counts.
 * - Quick Song & Artist Info pill generated from free music APIs.
 */
export default function MainHeader({
  searchQuery = '',
  onSearchChange,
  selectedGenre = 'all',
  onSelectGenre,
  activeCategory = 'all',
  onSelectCategory,
  onRefreshGemini,
  isRefreshingAi = false,
  activeTab = 'discover',
  onSelectTab,
  likedCount = 0,
  isDarkMode = true,
  onToggleTheme,
  categoryCounts = {},
  currentTrack = null,
  onOpenInfo = null,
  dynamicSections = [],
}) {
  const [showFilters, setShowFilters] = useState(false);

  const filterPresets = [
    { id: 'all', label: 'Todos los géneros' },
    { id: 'electronic', label: 'Electrónica / Synthwave' },
    { id: 'ambient', label: 'Ambient / Lo-Fi' },
    { id: 'cinematic', label: 'Cinematic / Space' },
    { id: 'acoustic', label: 'Acoustic / Sunset' },
    { id: 'indie', label: 'Indie / Dreampop' },
  ];

  return (
    <header className="fixed top-4 sm:top-6 left-3 sm:left-5 lg:left-64 right-3 sm:right-6 z-20 pointer-events-none flex flex-col gap-3.5 transition-all duration-300">
      
      {/* Top Floating Row: Title Capsule & Search Bubble */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Headline Bubble Capsule */}
        <div className="bubble-capsule-asymmetric px-6 py-2.5 sm:px-7 sm:py-3 pointer-events-auto shadow-lg flex flex-col justify-center max-w-sm">
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-primary)] font-display leading-tight">
            Descubrí música nueva.
          </h1>
          <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 font-display leading-tight">
            Sin derechos, sin límites.
          </h2>
          <div className="bubble-gleam !left-[8%] !w-[24%] !top-[12%]" />
        </div>

        {/* Right: Elongated Stretched Search Bubble + Circular Filter Bubble */}
        <div className="flex items-center gap-2.5 pointer-events-auto flex-1 max-w-lg min-w-[280px]">
          <div className="relative flex-1 bubble-stretched flex items-center px-4 py-2 sm:py-2.5 shadow-lg">
            <Search className="w-4 h-4 text-violet-400 dark:text-violet-300 mr-2.5 flex-shrink-0 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar música, artistas, géneros..."
              className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="bubble-gleam !left-[6%] !w-[22%] !top-[14%]" />
          </div>

          {/* Floating Round Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bubble-surface flex items-center justify-center shadow-lg transition cursor-pointer flex-shrink-0 ${
              showFilters || selectedGenre !== 'all'
                ? 'ring-2 ring-violet-400 text-violet-500 dark:text-violet-300 shadow-violet-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Filtrar por género"
            aria-label="Filtros de género"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <div className="bubble-gleam" />
          </button>
        </div>

      </div>

      {/* Second Floating Row: Filter Category Pills & AI Reorder */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5 pointer-events-none">
        
        {/* Category Pills matching Reference 2 with Heterogeneous Sizes and Organic Shapes */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Decorative Floating Pearlescent Micro-Bubbles Left */}
          <div className="hidden sm:flex items-center gap-1.5 pointer-events-none mr-1">
            <div className="w-3 h-3 rounded-full bubble-surface-orb shadow-sm animate-float-slow" />
            <div className="w-2 h-2 rounded-full bubble-surface-orb shadow-sm animate-float-delayed" />
          </div>

          {dynamicSections && dynamicSections.map((section, idx) => {
            let Icon = null;
            if (section.icon === 'trending') Icon = TrendingUp;
            else if (section.icon === 'all') Icon = Sparkles;
            else if (section.icon === 'recent') Icon = Music;
            else if (section.icon === 'heart') Icon = Heart;
            else Icon = Radio;
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  if (onSelectTab && section.id === 'liked') onSelectTab('liked');
                  else if (onSelectTab) onSelectTab('discover');
                  if (onSelectCategory) onSelectCategory(section.id);
                }}
                className={`px-3.5 sm:px-4 py-2 text-xs sm:text-[12px] xl:text-[12.5px] font-bold transition-all cursor-pointer relative shadow-sm bubble-organic-fluid-${(idx % 3) + 1} ${
                  activeCategory === section.id
                    ? 'bubble-capsule-chip-active shadow-md'
                    : 'bubble-capsule-chip text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${activeCategory === section.id ? 'text-white' : 'text-violet-600 dark:text-violet-300'}`} />
                  <span>{section.label}</span>
                  {section.count !== undefined && (
                    <span className="text-[11px] xl:text-xs opacity-90 font-semibold">({section.count})</span>
                  )}
                </span>
                <div className={`bubble-gleam !top-[6%] !left-[8%] !w-[26%] !h-[30%]`} />
              </button>
            );
          })}
        </div>

        {/* AI Reorder Button, Quick Song Info & Satellite Pearls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {currentTrack && onOpenInfo && (
            <button
              onClick={() => onOpenInfo(currentTrack)}
              className="bubble-capsule-chip bubble-organic-fluid-1 px-3 sm:px-4 py-2 text-xs sm:text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1.5 cursor-pointer transition shadow-sm relative"
              title={`Ver ficha completa de "${currentTrack.title}" por ${currentTrack.artist}`}
            >
              <Info className="w-3.5 h-3.5 text-violet-500" />
              <span className="hidden md:inline">Ficha Canción</span>
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[26%] !h-[30%]" />
            </button>
          )}

          {onRefreshGemini && (
            <button
              onClick={onRefreshGemini}
              disabled={isRefreshingAi}
              className="bubble-capsule-chip bubble-organic-fluid-3 px-3.5 sm:px-4 py-2 text-xs sm:text-[12px] xl:text-[12.5px] font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition active:scale-95 shadow-sm relative"
              title="Recalcular constelación con Gemini AI"
            >
              <Sparkles className={`w-3.5 h-3.5 text-violet-500 dark:text-violet-400 ${isRefreshingAi ? 'animate-spin' : ''}`} />
              <span>{isRefreshingAi ? 'Curando...' : 'Reordenar con IA'}</span>
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[26%] !h-[30%]" />
            </button>
          )}

          {/* Decorative Floating Pearlescent Micro-Bubbles Right */}
          <div className="hidden sm:flex items-center gap-1.5 pointer-events-none ml-1">
            <div className="w-4 h-4 rounded-full bubble-surface-orb shadow-sm animate-float" />
            <div className="w-2.5 h-2.5 rounded-full bubble-surface-orb shadow-sm animate-float-slow" />
          </div>
        </div>
      </div>

      {/* Floating Genre Dropdown if open */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bubble-capsule max-w-xl pointer-events-auto animate-fadeIn shadow-xl">
          {filterPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectGenre(preset.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                selectedGenre === preset.id
                  ? 'bubble-pill-active shadow-sm'
                  : 'bubble-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

    </header>
  );
}
