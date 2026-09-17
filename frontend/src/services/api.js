import axios from 'axios';
import { DEMO_TRACKS, DEMO_PROVIDERS, DEMO_SYNC_STATUSES, buildDemoSuggestions } from './demoCatalog';

/**
 * Demo mode: the static GitHub Pages build has no backend, so every call resolves against the
 * curated local catalog instead of hitting /api. Enabled at build time with VITE_DEMO_MODE=true.
 * In every other build these branches are dead code and the real REST client below is used.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const byPlayCount = (a, b) => (b.playCount24h || 0) - (a.playCount24h || 0);
const byReleaseDate = (a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);

// Rotating cursor so "Nuevas Sugerencias" visibly reshuffles the curated pool in the demo.
let demoRefreshOffset = 0;

export const trackApi = {
  // Bloque A: Top últimas 24hs
  getTop24h: async (limit = 10) => {
    if (isDemoMode) return [...DEMO_TRACKS].sort(byPlayCount).slice(0, limit);

    const res = await api.get(`/tracks/top-24h?limit=${limit}`);
    return res.data.data || [];
  },

  // Bloque B: Novedades
  getRecent: async (limit = 12) => {
    if (isDemoMode) return [...DEMO_TRACKS].sort(byReleaseDate).slice(0, limit);

    const res = await api.get(`/tracks/recent?limit=${limit}`);
    return res.data.data || [];
  },

  // Track detail
  getById: async (id) => {
    if (isDemoMode) return DEMO_TRACKS.find((t) => t.id === id);

    const res = await api.get(`/tracks/${id}`);
    return res.data.data;
  },

  // Registrar reproducción (telemetría). En modo demo no hay backend que auditar.
  recordPlay: async (id) => {
    if (isDemoMode) return { success: true, message: 'Demo mode: play not persisted' };

    try {
      const res = await api.post(`/tracks/${id}/play`, {
        clientSession: getOrCreateClientSession(),
        userAgent: navigator.userAgent,
      });
      return res.data;
    } catch (err) {
      console.warn('Play event recording skipped:', err.message);
    }
  },
};

export const recommendationApi = {
  // Bloque C: Sugeridos Gemini AI
  getGeminiSuggestions: async (limit = 6) => {
    if (isDemoMode) return buildDemoSuggestions(0).slice(0, limit);

    const res = await api.get(`/recommendations/gemini?limit=${limit}`);
    return res.data.data || [];
  },

  refreshGeminiSuggestions: async (limit = 6) => {
    if (isDemoMode) {
      demoRefreshOffset = (demoRefreshOffset + 2) % DEMO_TRACKS.length;
      return buildDemoSuggestions(demoRefreshOffset).slice(0, limit);
    }

    const res = await api.post(`/recommendations/gemini/refresh?limit=${limit}`);
    return res.data.data || [];
  },
};

export const operationsApi = {
  triggerSync: async () => {
    if (isDemoMode) return { providers: DEMO_PROVIDERS, newlyAddedTracks: 0 };

    const res = await api.post('/internal/sync');
    return res.data.data;
  },

  getSyncStatus: async () => {
    if (isDemoMode) return DEMO_SYNC_STATUSES;

    const res = await api.get('/internal/sync/status');
    return res.data.data || [];
  },

  getProviders: async () => {
    if (isDemoMode) return DEMO_PROVIDERS;

    const res = await api.get('/internal/providers');
    return res.data.data || [];
  },

  getHealth: async () => {
    if (isDemoMode) return { status: 'DEMO', mode: 'static-catalog' };

    const res = await api.get('/health');
    return res.data.data;
  },
};

function getOrCreateClientSession() {
  let sessionId = localStorage.getItem('soundwave_client_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('soundwave_client_session', sessionId);
  }
  return sessionId;
}

export default api;
