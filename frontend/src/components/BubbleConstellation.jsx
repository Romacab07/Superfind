import React, { useState } from 'react';
import Bubble from './Bubble';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * BubbleConstellation - Organic cluster of floating soap bubbles
 */
export default function BubbleConstellation({
  title,
  subtitle,
  badge = null,
  tracks = [],
  currentTrack,
  isPlaying,
  onPlayTrack,
  showAiBadge = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const layoutPatterns = [
    { size: 'hero', offset: 'translate-y-1', delay: '0s' },
    { size: 'medium', offset: '-translate-y-4', delay: '0.6s' },
    { size: 'large', offset: 'translate-y-3', delay: '1.2s' },
    { size: 'small', offset: '-translate-y-2', delay: '1.8s' },
    { size: 'medium', offset: 'translate-y-2', delay: '0.4s' },
    { size: 'large', offset: '-translate-y-3', delay: '1.5s' },
    { size: 'medium', offset: 'translate-y-4', delay: '0.9s' },
    { size: 'small', offset: '-translate-y-1', delay: '2.1s' },
  ];

  if (!tracks || tracks.length === 0) return null;

  const displayTracks = isExpanded ? tracks : tracks.slice(0, 8);

  return (
    <section className="mb-10 sm:mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 px-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
              {title}
            </h2>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-0.5 rounded-full shadow-sm">
                {showAiBadge && <Sparkles className="w-3 h-3 text-indigo-500" />}
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        </div>

        {/* View All Action */}
        {tracks.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition py-1 px-3 rounded-full bubble-pill cursor-pointer group"
          >
            <span>{isExpanded ? 'Ver menos' : 'Ver todo'}</span>
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
          </button>
        )}
      </div>

      {/* Constellation Container */}
      {isExpanded ? (
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-4 px-2">
          {displayTracks.map((item, index) => {
            const track = item.track ? item.track : item;
            const reasoning = item.reasoning || null;
            const pattern = layoutPatterns[index % layoutPatterns.length];
            const isCurrent = currentTrack && currentTrack.id === track.id;

            return (
              <Bubble
                key={track.id || index}
                track={track}
                size={pattern.size}
                offsetClass=""
                isCurrent={isCurrent}
                isPlaying={isPlaying}
                onPlay={onPlayTrack}
                reasoning={reasoning}
                badgeText={item.tier === 'UNDERGROUND' ? 'Gema' : item.tier === 'GROWING' ? 'En alza' : null}
              />
            );
          })}
        </div>
      ) : (
        <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-8 pt-6 px-2 scrollbar-none no-scrollbar scroll-smooth">
            {displayTracks.map((item, index) => {
              const track = item.track ? item.track : item;
              const reasoning = item.reasoning || null;
              const pattern = layoutPatterns[index % layoutPatterns.length];
              const isCurrent = currentTrack && currentTrack.id === track.id;

              return (
                <React.Fragment key={track.id || index}>
                  <Bubble
                    track={track}
                    size={pattern.size}
                    offsetClass={pattern.offset}
                    isCurrent={isCurrent}
                    isPlaying={isPlaying}
                    onPlay={onPlayTrack}
                    reasoning={reasoning}
                    badgeText={item.tier === 'UNDERGROUND' ? 'Gema' : item.tier === 'GROWING' ? 'En alza' : null}
                    animationDelay={pattern.delay}
                  />

                  {/* Ambient Micro-Bubbles */}
                  {index % 3 === 1 && (
                    <div className="hidden sm:block flex-shrink-0 pointer-events-none">
                      <div className="w-8 h-8 rounded-full bubble-surface opacity-60 transform translate-y-6 scale-90" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
