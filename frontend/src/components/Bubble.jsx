import React from 'react';

/**
 * Bubble - Translucent Organic Soap Bubble Component
 * 
 * Features:
 * - Organic non-circular deformation.
 * - Multi-chromatic iridescent rim & primary/secondary gleams.
 * - Audio visualizer wave bar when actively playing.
 * - Seamless light and dark mode styles.
 */
export default function Bubble({
  track,
  size = 'medium',
  offsetClass = '',
  isCurrent = false,
  isPlaying = false,
  onPlay,
  badgeText = null,
  reasoning = null,
  animationDelay = '0s'
}) {
  if (!track) return null;

  const sizeClasses = {
    hero: 'w-52 h-52 sm:w-60 sm:h-60 p-4 sm:p-5',
    large: 'w-42 h-42 sm:w-50 sm:h-50 p-3.5 sm:p-4',
    medium: 'w-36 h-36 sm:w-42 sm:h-42 p-3 sm:p-3.5',
    small: 'w-28 h-28 sm:w-34 sm:h-34 p-2.5 sm:p-3',
  }[size] || 'w-38 h-38 p-3.5';

  const titleSizes = {
    hero: 'text-sm sm:text-base font-bold',
    large: 'text-xs sm:text-sm font-bold',
    medium: 'text-xs font-semibold',
    small: 'text-[11px] font-semibold',
  }[size] || 'text-xs font-semibold';

  const artistSizes = {
    hero: 'text-xs sm:text-xs',
    large: 'text-[11px] sm:text-xs',
    medium: 'text-[10px] sm:text-[11px]',
    small: 'text-[9px] sm:text-[10px]',
  }[size] || 'text-[10px]';

  const playingThis = isCurrent && isPlaying;

  return (
    <div
      onClick={() => onPlay(track)}
      className={`bubble-surface flex-shrink-0 flex flex-col items-center justify-center text-center group relative cursor-pointer ${sizeClasses} ${offsetClass} ${
        playingThis ? 'ring-2 ring-indigo-400 dark:ring-indigo-300 shadow-xl' : ''
      }`}
      style={{ animationDelay }}
      title={reasoning ? `"${reasoning}"` : `${track.title} — ${track.artist}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(track);
        }
      }}
    >
      {/* Specular gleams & reflections */}
      <div className="bubble-gleam" />
      <div className="bubble-rim-glow" />

      {/* Tiny decorative upper sheen dot */}
      <div className="absolute top-[18%] left-[22%] w-2 h-1 bg-white/90 rounded-full rotate-[-30deg] pointer-events-none blur-[0.3px]" />

      {/* Optional Top Category / Tier Pill Tag */}
      {badgeText && (
        <div className="absolute -top-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-sm backdrop-blur-sm pointer-events-none">
          {badgeText}
        </div>
      )}

      {/* Bubble Content: Song Title & Artist */}
      <div className="relative z-10 w-full px-2 max-w-full flex flex-col items-center justify-center">
        
        {/* Visualizer Wave when actively playing */}
        {playingThis && (
          <div className="flex items-end gap-1 h-3 mb-1.5 pointer-events-none">
            <span className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-eq-1" />
            <span className="w-1 bg-cyan-400 rounded-full animate-eq-2" />
            <span className="w-1 bg-pink-500 rounded-full animate-eq-3" />
            <span className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-eq-4" />
          </div>
        )}

        <h4 className={`${titleSizes} text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2 max-w-[90%] font-display`}>
          {track.title}
        </h4>

        <p className={`${artistSizes} text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors line-clamp-1 max-w-[85%] mt-0.5`}>
          {track.artist}
        </p>

        {/* Subtle Genre / Vibe indicator on large bubbles */}
        {(size === 'hero' || size === 'large') && track.genre && (
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest opacity-80 group-hover:opacity-100">
            {track.genre}
          </span>
        )}
      </div>
    </div>
  );
}
