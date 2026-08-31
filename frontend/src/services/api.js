import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trackApi = {
  // Bloque A: Top últimas 24hs
  getTop24h: async (limit = 10) => {
    const res = await api.get(`/tracks/top-24h?limit=${limit}`);
    return res.data.data || [];
  },

  // Bloque B: Novedades
  getRecent: async (limit = 12) => {
    const res = await api.get(`/tracks/recent?limit=${limit}`);
    return res.data.data || [];
  },

  // Track detail
  getById: async (id) => {
    const res = await api.get(`/tracks/${id}`);
    return res.data.data;
  },

  // Registrar reproducción (telemetría)
  recordPlay: async (id) => {
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
    const res = await api.get(`/recommendations/gemini?limit=${limit}`);
    return res.data.data || [];
  },

  refreshGeminiSuggestions: async (limit = 6) => {
    const res = await api.post(`/recommendations/gemini/refresh?limit=${limit}`);
    return res.data.data || [];
  },
};

export const operationsApi = {
  triggerSync: async () => {
    const res = await api.post('/internal/sync');
    return res.data.data;
  },

  getSyncStatus: async () => {
    const res = await api.get('/internal/sync/status');
    return res.data.data || [];
  },

  getProviders: async () => {
    const res = await api.get('/internal/providers');
    return res.data.data || [];
  },

  getHealth: async () => {
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
