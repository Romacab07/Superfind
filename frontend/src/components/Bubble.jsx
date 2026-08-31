import React from 'react';

/**
 * Bubble - A luminous, translucent iridescent soap bubble representing a track.
 * 
 * Rules:
 * - Only displays Title and Artist inside the bubble for clean organic exploration.
 * - Displays subtle specular reflection gleam and chromatic inner glows.
 * - When active/playing: receives subtle buoyant glow pulse & visualizer.
 * - Clicking the bubble immediately triggers playback.
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
    hero: 'w-48 h-48 sm:w-56 sm:h-56 p-4 sm:p-5',
    large: 'w-40 h-40 sm:w-48 sm:h-48 p-3.5 sm:p-4',
    medium: 'w-34 h-34 sm:w-40 sm:h-40 p-3 sm:p-3.5',
    small: 'w-28 h-28 sm:w-32 sm:h-32 p-2.5 sm:p-3',
  }[size] || 'w-36 h-36 p-3.5';

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
      className={`soap-bubble flex-shrink-0 flex flex-col items-center justify-center text-center group relative cursor-pointer ${sizeClasses} ${offsetClass} ${
        playingThis ? 'active-playing ring-2 ring-indigo-400/40' : ''
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
      {/* Specular highlights & reflections */}
      <div className="bubble-gleam" />
      <div className="bubble-rim-glow" />

      {/* Tiny decorative upper sheen */}
      <div className="absolute top-[18%] left-[22%] w-2 h-1 bg-white/90 rounded-full rotate-[-30deg] pointer-events-none blur-[0.3px]" />

      {/* Optional Top Mini Tag */}
      {badgeText && (
        <div className="absolute -top-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/90 text-indigo-700 border border-indigo-100 shadow-sm backdrop-blur-sm pointer-events-none">
          {badgeText}
        </div>
      )}

      {/* Bubble Content: Song Title & Artist */}
      <div className="relative z-10 w-full px-2 max-w-full flex flex-col items-center justify-center">
        
        {/* Visualizer Wave when actively playing */}
        {playingThis && (
          <div className="flex items-end gap-1 h-3 mb-1.5 pointer-events-none">
            <span className="w-1 bg-indigo-500 rounded-full animate-wave-1" />
            <span className="w-1 bg-cyan-400 rounded-full animate-wave-2" />
            <span className="w-1 bg-pink-500 rounded-full animate-wave-3" />
            <span className="w-1 bg-indigo-500 rounded-full animate-wave-4" />
          </div>
        )}

        <h4 className={`${titleSizes} text-slate-850 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-2 max-w-[90%] font-display`}>
          {track.title}
        </h4>

        <p className={`${artistSizes} text-slate-500 font-medium group-hover:text-slate-700 transition-colors line-clamp-1 max-w-[85%] mt-0.5`}>
          {track.artist}
        </p>

        {/* Subtle Genre / Vibe indicator if space permits on large bubbles */}
        {(size === 'hero' || size === 'large') && track.genre && (
          <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest opacity-80 group-hover:opacity-100">
            {track.genre}
          </span>
        )}
      </div>
    </div>
  );
}
