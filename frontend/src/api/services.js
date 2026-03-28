/**
 * api/services.js — All API call functions
 *
 * Centralizes all backend calls so components stay clean.
 * Import specific functions where needed.
 */

import api from "./axios";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ─── Bots ─────────────────────────────────────────────────────────────────────
export const botsAPI = {
  getAll: () => api.get("/bots"),
  getById: (id) => api.get(`/bots/${id}`),
  create: (data) => api.post("/bots", data),
  update: (id, data) => api.put(`/bots/${id}`, data),
  delete: (id) => api.delete(`/bots/${id}`),
  getConversations: (id, page = 1) => api.get(`/bots/${id}/conversations?page=${page}`),
  getPublicInfo: (id) => api.get(`/bots/public/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview"),
  getBotAnalytics: (botId) => api.get(`/analytics/${botId}`),
};
