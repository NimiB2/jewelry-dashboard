// SettingsService: wraps settings persistence in localStorage
window.App = window.App || {};
(function() {
  const KEY = 'settings';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }

  function set(settings) {
    localStorage.setItem(KEY, JSON.stringify(settings || {}));
    return settings || {};
  }

  function mergeDefaults(defaults) {
    const current = get();
    const merged = { ...defaults, ...current };
    set(merged);
    return merged;
  }

  window.App.SettingsService = { get, set, mergeDefaults };
})();
