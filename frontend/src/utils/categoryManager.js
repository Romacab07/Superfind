/**
 * src/utils/categoryManager.js
 * Extractor y gestor dinámico de categorías y géneros.
 */

export function buildDynamicCategories(catalogTracks) {
  const genreStats = {};
  
  catalogTracks.forEach(track => {
    if (!track || !track.genre) return;
    const rawGenre = track.genre.split('/')[0].trim();
    if (!genreStats[rawGenre]) {
      genreStats[rawGenre] = { count: 0, playCount24h: 0, name: rawGenre };
    }
    genreStats[rawGenre].count += 1;
    genreStats[rawGenre].playCount24h += (track.playCount24h || 0);
  });

  const sortedGenres = Object.values(genreStats).map(g => ({
    ...g,
    score: (g.playCount24h * 0.6) + (g.count * 0.4)
  })).sort((a, b) => b.score - a.score);

  const topGenres = sortedGenres.slice(0, 3);

  const categories = [
    { id: 'top24h', label: 'Top 24hs', type: 'system', isPrimary: true, icon: 'trending' },
    { id: 'all', label: 'Todas las burbujas', type: 'system', icon: 'all' },
    { id: 'recent', label: 'Novedades', type: 'system', icon: 'recent' },
  ];

  topGenres.forEach((g, index) => {
    categories.push({
      id: `genre-${index}`,
      label: g.name,
      genre: g.name,
      count: g.count,
      type: 'genre'
    });
  });

  categories.push({ id: 'liked', label: 'Me gusta', type: 'user', icon: 'heart' });

  return categories;
}

export function isTrackInSection(track, sectionId, likedIds, dynamicSections = []) {
  if (!track) return false;
  
  switch(sectionId) {
    case 'top24h':
      return track.category === 'top24h';
    case 'all':
      return true;
    case 'recent':
      return track.category === 'recent';
    case 'liked':
      return likedIds.includes(track.id);
    default:
      if (sectionId.startsWith('genre-')) {
        const section = dynamicSections.find(s => s.id === sectionId);
        if (!section) return false;
        const rawGenre = track.genre ? track.genre.split('/')[0].trim() : '';
        return rawGenre === section.genre;
      }
      return false;
  }
}
