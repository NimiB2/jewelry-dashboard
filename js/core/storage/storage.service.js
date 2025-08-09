// Storage service placeholder for future DB/Vercel API.
// For now, we continue using localStorage (no behavior change).
// Later we can swap implementation to fetch('/api/...') under the same interface.

window.App = window.App || {};
window.App.Storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
