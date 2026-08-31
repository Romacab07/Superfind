import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Compass, Heart, Radio, Sparkles } from 'lucide-react';

export default function MainHeader({
  searchQuery = '',
  onSearchChange,
  selectedGenre = 'all',
  onSelectGenre,
  availableGenres = [],
  activeTab = 'discover',
  onSelectTab,
  likedCount = 0
}) {
  const [showFilters, setShowFilters] = useState(false);

  const filterPresets = [
    { id: 'all', label: 'Todos los géneros' },
    { id: 'indie', label: 'Indie' },
    { id: 'electronic', label: 'Electrónica' },
    { id: 'ambient', label: 'Ambient / Lo-Fi' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'rock', label: 'Rock' },
    { id: 'pop', label: 'Pop' },
  ];

  return (
    <header className="mb-10 sm:mb-14 space-y-6 sm:space-y-8">
      
      {/* Mobile Top Navbar (visible on mobile only) */}
      <div className="flex md:hidden items-center justify-between py-2 border-b border-slate-200/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full soap-bubble flex items-center justify-center">
            <Radio className="w-4 h-4 text-indigo-600" />
            <div className="bubble-gleam" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
            SuperFind
          </span>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/70">
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activeTab === 'discover'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Descubrir
          </button>
          <button
            onClick={() => onSelectTab('liked')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'liked'
                ? 'bg-white text-pink-700 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <span>Me gusta</span>
            {likedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-100 text-[10px] flex items-center justify-center font-bold">
                {likedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Editorial Headline */}
      <div className="space-y-1.5 pt-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-tight">
          Descubrí música nueva.
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 font-display leading-tight">
          Sin derechos, sin límites.
        </h2>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar música, artistas, géneros..."
            className="w-full pl-11 pr-10 py-3.5 rounded-full bg-white/85 border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.06)] transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Compact Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
            showFilters || selectedGenre !== 'all'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
              : 'bg-white/85 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-white shadow-[0_4px_20px_-4px_rgba(99,102,241,0.06)]'
          }`}
          title="Filtrar por género"
          aria-label="Filtros de género"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Genre Filter Pills (Toggleable / Smooth) */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-fadeIn">
          {filterPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectGenre(preset.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedGenre === preset.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/70'
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
