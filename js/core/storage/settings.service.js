// SettingsService: MongoDB-backed with localStorage fallback
window.App = window.App || {};
(function() {
  const KEY = 'settings';
  const API_URL = '/api/settings';
  
  let useMongoDb = true;

  // Check MongoDB availability
  async function checkMongoDb() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      return data.mongodb === 'connected';
    } catch {
      return false;
    }
  }

  // localStorage functions
  function getLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }

  function setLocal(settings) {
    localStorage.setItem(KEY, JSON.stringify(settings || {}));
    return settings || {};
  }

  // MongoDB functions
  async function get() {
    if (!useMongoDb) {
      return getLocal();
    }
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      // Sync to localStorage
      if (data.categories) {
        setLocal(data);
      }
      
      return data.categories ? data : getLocal();
    } catch (error) {
      console.warn('⚠️  MongoDB unavailable, using localStorage:', error.message);
      useMongoDb = false;
      return getLocal();
    }
  }

  async function set(settings) {
    // Always save to localStorage first
    setLocal(settings);
    
    if (!useMongoDb) {
      return settings || {};
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      console.log('✅ Settings saved to MongoDB');
      return settings || {};
    } catch (error) {
      console.warn('⚠️  MongoDB save failed, using localStorage only:', error.message);
      useMongoDb = false;
      return settings || {};
    }
  }

  async function mergeDefaults(defaults) {
    const current = await get();
    const merged = { ...defaults, ...current };
    await set(merged);
    return merged;
  }

  // Initialize
  checkMongoDb().then(available => {
    useMongoDb = available;
    if (available) {
      console.log('✅ SettingsService: MongoDB connected');
    } else {
      console.log('⚠️  SettingsService: Using localStorage only');
    }
  });

  window.App.SettingsService = { get, set, mergeDefaults };
})();
