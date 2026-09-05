import React, { useState } from 'react';
import {
  X, Play, Pause, Heart, ExternalLink, Download, ShieldCheck,
  Sparkles, Music, User, Clock, Share2, Check, Radio, ChevronDown
} from 'lucide-react';
import { extractTrackPalette } from '../utils/paletteExtractor';

/**
 * SoapBubbleNode - Burbuja de Jabón Auténtica idéntica al concepto de la pantalla principal
 * - Esfera circular perfecta con membrana translúcida
 * - Carátula circular con película de jabón iridiscente
 * - Brillo de media luna 'bubble-gleam' superior izquierdo
 * - Punto especular superior derecho y resplandor cáustico inferior
 * - Tag pill flotante superior ('GEMA', 'con IA', 'EN REPRODUCCIÓN')
 * - Título y artista centrados dentro de la burbuja
 * - Ecualizador de onda o botón play integrado
 */
function SoapBubbleNode({
  track,
  isHero = false,
  isPlaying = false,
  isCurrent = false,
  onClick,
  floatAnimation = '',
}) {
  const palette = extractTrackPalette(track);
  const tagLabel = isCurrent ? 'EN REPRODUCCIÓN' : track.tier === 'UNDERGROUND' ? 'GEMA' : 'con IA';

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 hover:scale-105 active:scale-95 ${floatAnimation}`}
      title={`Reproducir "${track.title}" por ${track.artist}`}
    >
      {/* Esfera circular de pompa de jabón */}
      <div
        className="relative rounded-full aspect-square flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
        style={{
          width: isHero ? '184px' : '136px',
          height: isHero ? '184px' : '136px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isCurrent
            ? '2px solid rgba(255, 255, 255, 0.95)'
            : '1.6px solid rgba(255, 255, 255, 0.75)',
          boxShadow: isCurrent
            ? `
              inset 0 0 24px 3px rgba(255, 255, 255, 0.95),
              inset -6px -6px 20px var(--bubble-rim-pink),
              inset 6px 6px 20px var(--bubble-rim-cyan),
              inset 0 -8px 24px var(--bubble-rim-purple),
              0 18px 46px -8px var(--bubble-shadow-color)
            `
            : `
              inset 0 0 18px 2px rgba(255, 255, 255, 0.75),
              inset -4px -4px 16px var(--bubble-rim-pink),
              inset 4px 4px 16px var(--bubble-rim-cyan),
              inset 0 -6px 18px var(--bubble-rim-purple),
              0 12px 32px -8px var(--bubble-shadow-color)
            `,
        }}
      >
        {/* Carátula circular como paisaje interior de la burbuja */}
        <img
          src={track.coverUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300'}
          alt={track.title}
          className={`absolute inset-0 w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110 ${
            isCurrent && isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            animationDuration: '28s',
            opacity: isHero ? 0.75 : 0.60,
          }}
        />

        {/* Película de jabón iridiscente y tinte de cristal */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(135% 135% at 30% 25%, rgba(255, 255, 255, 0.40) 0%, rgba(167, 139, 250, 0.20) 45%, rgba(15, 23, 42, 0.65) 100%)`,
          }}
        />

        {/* Brillo de media luna superior izquierda (Primary Specular Crescent Gleam) */}
        <div className="bubble-gleam !top-[7%] !left-[10%] !w-[38%] !h-[24%] pointer-events-none" />

        {/* Punto de luz especular superior derecha (Secondary Specular Star Dot) */}
        <div className="absolute top-[18%] right-[20%] w-1.5 h-1.5 rounded-full bg-white shadow-sm pointer-events-none opacity-90" />

        {/* Resplandor cáustico inferior (Lower Caustic Bounce Glow) */}
        <div className="bubble-rim-glow pointer-events-none" />

        {/* Tag Pill Flotante dentro del polo superior de la burbuja */}
        <div className="absolute top-2.5 z-10 pointer-events-none">
          <span
            className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider shadow-sm border ${
              isCurrent
                ? 'bg-purple-900/85 text-purple-200 border-purple-400/70'
                : tagLabel === 'GEMA'
                ? 'bg-indigo-950/85 text-indigo-200 border-indigo-400/70'
                : 'bg-cyan-950/85 text-cyan-200 border-cyan-400/70'
            }`}
          >
            {tagLabel}
          </span>
        </div>

        {/* Contenido Central: Título y Artista exactamente como en la pantalla principal */}
        <div className="relative z-10 px-3 text-center flex flex-col items-center justify-center max-w-[92%] pointer-events-none">
          <h4
            className={`font-extrabold text-white font-display leading-tight truncate w-full drop-shadow-md ${
              isHero ? 'text-sm sm:text-base' : 'text-xs'
            }`}
          >
            {track.title}
          </h4>

          <p
            className={`font-semibold text-slate-200 truncate w-full mt-0.5 opacity-90 drop-shadow ${
              isHero ? 'text-xs' : 'text-[10px]'
            }`}
          >
            {track.artist}
          </p>

          {/* Equalizer Waveform si está en reproducción */}
          {isCurrent && isPlaying ? (
            <div className="flex items-center gap-0.5 mt-2 h-3.5">
              {[0.4, 0.8, 0.5, 1.0, 0.7, 0.9, 0.3, 0.6].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-400 via-violet-300 to-pink-400 rounded-full animate-pulse"
                  style={{
                    height: `${h * 14}px`,
                    animationDelay: `${i * 110}ms`,
                    animationDuration: '650ms',
                  }}
                />
              ))}
            </div>
          ) : !isHero ? (
            /* Micro-Orbe de Play que aparece al hover */
            <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-6 h-6 rounded-full bubble-play-hero flex items-center justify-center text-white shadow-md">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * TrackInfoModal - Pestaña Lateral con el concepto original de Pompas de Jabón
 */
export default function TrackInfoModal({
  isOpen,
  onClose,
  track,
  isPlaying,
  onTogglePlay,
  isLiked,
  onToggleLike,
  relatedTracks = [],
  onSelectTrack,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !track) return null;

  const formatDuration = (secs) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getProviderInfo = (provider) => {
    const p = (provider || '').toUpperCase();
    if (p.includes('JAMENDO')) {
      return {
        name: 'Jamendo Music',
        badge: 'Jamendo API',
        url: track.externalId ? `https://www.jamendo.com/track/${track.externalId.replace(/\D/g, '') || track.id}` : 'https://www.jamendo.com',
        artistUrl: `https://www.jamendo.com/search?q=${encodeURIComponent(track.artist)}`,
        accent: 'from-pink-500 to-rose-500',
        desc: 'Catálogo abierto con licencias Creative Commons de artistas independientes de todo el mundo.',
      };
    }
    if (p.includes('FREE MUSIC ARCHIVE') || p.includes('FMA')) {
      return {
        name: 'Free Music Archive',
        badge: 'FMA Library',
        url: 'https://freemusicarchive.org',
        artistUrl: `https://freemusicarchive.org/search?quicksearch=${encodeURIComponent(track.artist)}`,
        accent: 'from-amber-500 to-orange-500',
        desc: 'Biblioteca pública de audio de alta fidelidad para creadores y libre descubrimiento.',
      };
    }
    return {
      name: 'Catálogo de Música Abierta',
      badge: 'Open Audio',
      url: 'https://creativecommons.org',
      artistUrl: `https://creativecommons.org/?s=${encodeURIComponent(track.artist)}`,
      accent: 'from-indigo-500 to-cyan-500',
      desc: 'Grabaciones publicadas bajo licencias abiertas y dominio público internacional.',
    };
  };

  const providerInfo = getProviderInfo(track.provider);

  const handleCopyShare = () => {
    try {
      const shareUrl = `${window.location.origin}/?track=${encodeURIComponent(track.id)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleDownload = () => {
    if (!track.audioUrl) return;
    const anchor = document.createElement('a');
    anchor.href = track.audioUrl;
    anchor.download = `${track.artist} - ${track.title}.mp3`;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const floatStyles = [
    'animate-float-slow',
    'animate-float-delayed',
    'animate-float-alt',
    'animate-float-slow',
    'animate-float-delayed',
    'animate-float-alt',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-track-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-md transition-opacity animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Pestaña Lateral con membrana translúcida de pompa de jabón */}
      <aside
        className="w-full sm:w-[440px] md:w-[480px] h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 relative transition-transform duration-300 select-none"
        style={{
          backdropFilter: 'blur(36px) saturate(170%)',
          WebkitBackdropFilter: 'blur(36px) saturate(170%)',
          background: `radial-gradient(140% 110% at 85% 15%, var(--bubble-bg-start) 0%, var(--bubble-bg-mid) 45%, var(--bubble-bg-end) 95%)`,
          borderLeft: '2px solid var(--bubble-border)',
          boxShadow: `
            inset 2px 0 24px -2px rgba(255, 255, 255, 0.90),
            inset -6px -6px 28px var(--bubble-rim-pink),
            inset 6px 6px 28px var(--bubble-rim-cyan),
            inset 0 -8px 30px var(--bubble-rim-purple),
            -16px 0 50px -10px var(--bubble-shadow-color)
          `,
        }}
      >
        {/* Brillo de luz superior */}
        <div className="bubble-gleam !top-[1.5%] !left-[6%] !w-[42%] !h-[12%] !opacity-70 pointer-events-none" />

        {/* Barra Superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bubble-capsule-chip px-3 py-1 text-xs font-extrabold flex items-center gap-1.5 shadow-sm text-violet-700 dark:text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
              <span>Ficha & Sintonía</span>
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
            </span>

            <span className="bubble-capsule-chip px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{track.license || 'Libre CC'}</span>
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
            </span>
          </div>

          {/* Botón Cerrar: Orbe esférico de cristal */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bubble-surface-orb cursor-pointer flex items-center justify-center text-slate-600 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 transition shadow-md"
            aria-label="Cerrar ficha"
            title="Cerrar pestaña"
          >
            <X className="w-4 h-4" />
            <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 relative z-10 no-scrollbar">
          
          {/* SECCIÓN 1: Pompa Hero de la Canción Actual (Mismo concepto que la pantalla principal) */}
          <div className="flex flex-col items-center text-center">
            <SoapBubbleNode
              track={track}
              isHero={true}
              isPlaying={isPlaying}
              isCurrent={true}
              onClick={() => onTogglePlay && onTogglePlay(track)}
              floatAnimation="animate-float-slow"
            />

            {/* Enlace al artista de la API libre */}
            <a
              href={providerInfo.artistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 mt-2 transition cursor-pointer"
              title={`Ver catálogo de ${track.artist} en ${providerInfo.name}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{track.artist} en {providerInfo.name}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            {/* Micro chips de metadatos */}
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              <span className="bubble-capsule-chip px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                {track.genre || 'Música Abierta'}
                <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
              </span>

              <span className="bubble-capsule-chip px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span>{formatDuration(track.durationSeconds)}</span>
                <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
              </span>

              {track.playCount24h > 0 && (
                <span className="bubble-capsule-chip px-2.5 py-0.5 text-[10.5px] font-bold text-indigo-700 dark:text-cyan-300 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-500 dark:text-cyan-400" />
                  <span>{track.playCount24h} plays hoy</span>
                  <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
                </span>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Botonera de Control en Orbes de Cristal */}
          <div className="flex items-center justify-center gap-3 pt-0.5">
            {/* Botón Principal Reproducir / Pausar */}
            <button
              onClick={() => onTogglePlay && onTogglePlay(track)}
              className="flex-1 max-w-[170px] py-2.5 px-4 rounded-full bubble-play-hero text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl cursor-pointer transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>

            {/* Orbe de Favorito (Me gusta) */}
            <button
              onClick={() => onToggleLike && onToggleLike(track)}
              className={`w-11 h-11 rounded-full bubble-surface-orb transition cursor-pointer shadow-md ${
                isLiked
                  ? 'text-rose-500 ring-2 ring-rose-400/70 shadow-rose-500/30'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
              title={isLiked ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              aria-label="Favorito"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>

            {/* Orbe de Descargar MP3 */}
            <button
              onClick={handleDownload}
              className="w-11 h-11 rounded-full bubble-surface-orb text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-300 transition cursor-pointer shadow-md"
              title="Descargar archivo MP3 libre directamente"
              aria-label="Descargar MP3"
            >
              <Download className="w-4 h-4" />
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>

            {/* Orbe de Compartir Enlace */}
            <button
              onClick={handleCopyShare}
              className="w-11 h-11 rounded-full bubble-surface-orb text-slate-500 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition cursor-pointer shadow-md"
              title="Copiar enlace de descubrimiento"
              aria-label="Compartir"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <div className="bubble-gleam !top-[8%] !left-[12%] !w-[32%]" />
            </button>
          </div>

          {/* SECCIÓN 3: DIRECTAMENTE DEBAJO: "Otras canciones en esta sintonía" COMO BURBUJAS REALES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Music className="w-4 h-4 text-violet-500" />
                <span>Otras canciones en esta sintonía</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bubble-capsule-chip text-slate-500 dark:text-slate-300">
                {relatedTracks.length} burbujas
              </span>
            </div>

            {/* Constelación de Pompas de Jabón Reales (Idénticas a la pantalla principal) */}
            <div className="grid grid-cols-2 gap-4 py-2 place-items-center">
              {relatedTracks.map((rel, idx) => (
                <SoapBubbleNode
                  key={rel.id}
                  track={rel}
                  isHero={false}
                  isPlaying={false}
                  isCurrent={false}
                  onClick={() => onSelectTrack && onSelectTrack(rel)}
                  floatAnimation={floatStyles[idx % floatStyles.length]}
                />
              ))}
            </div>
          </div>

          {/* INDICADOR PARA SEGUIR BAJANDO */}
          <div className="pt-4 pb-1 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bubble-capsule-chip text-[11px] font-bold text-slate-500 dark:text-slate-400 shadow-sm border border-white/60 dark:border-white/10">
              <span>Licencia y fuente libre</span>
              <ChevronDown className="w-3.5 h-3.5 text-violet-500 animate-bounce" />
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
            </div>
          </div>

          {/* SECCIÓN 4: INFORMACIÓN DE MÚSICA LIBRE (Visible solo al scrollear hacia abajo) */}
          <div className="space-y-4 pt-1 border-t border-white/60 dark:border-white/10">
            
            {/* Curaduría Gemini AI */}
            <div className="bubble-card-editorial bubble-organic-fluid-1 p-4 shadow-lg relative border-[1.5px] border-white/85 dark:border-white/20">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-violet-700 dark:text-violet-300 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span>Curaduría Inteligente (Gemini AI)</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {track.reasoning || 'Seleccionada por su excelente atmósfera y resonancia musical en la comunidad de audio libre.'}
              </p>
              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[32%] !h-[22%]" />
            </div>

            {/* Licencia Creative Commons */}
            <div className="bubble-card-editorial bubble-organic-fluid-3 p-4 shadow-lg relative border-[1.5px] border-white/85 dark:border-white/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Licencia Abierta & Términos</span>
                </div>
                <span className="bubble-capsule-chip px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">
                  100% Legal
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Streaming y descarga gratuita sin restricciones.</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Libre de reclamos de copyright para tus proyectos.</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                  <span className="text-violet-500 font-bold">•</span>
                  <span>Atribución: indicar autoría de <strong>{track.artist}</strong>.</span>
                </div>
              </div>

              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[30%] !h-[22%]" />
            </div>

            {/* Proveedor de Catálogo Libre */}
            <div className="bubble-card-editorial bubble-organic-fluid-2 p-4 shadow-lg relative border-[1.5px] border-white/85 dark:border-white/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  Fuente Oficial API
                </span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {providerInfo.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {providerInfo.desc}
                </p>
              </div>

              <a
                href={providerInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bubble-capsule-chip px-3.5 py-2 text-xs font-extrabold text-violet-700 dark:text-cyan-300 hover:scale-105 transition flex items-center gap-1.5 shadow-md flex-shrink-0 cursor-pointer"
                title={`Explorar en ${providerInfo.name}`}
              >
                <span>Explorar</span>
                <ExternalLink className="w-3 h-3" />
                <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[30%]" />
              </a>

              <div className="bubble-gleam !top-[6%] !left-[8%] !w-[28%] !h-[22%]" />
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
