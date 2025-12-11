// ProductRepository: MongoDB-backed CRUD with localStorage fallback
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'products';
  const API_URL = '/api/products';
  
  // Check if MongoDB is available
  let useMongoDb = true;
  
  // Helper to check MongoDB availability
  async function checkMongoDb() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      return data.mongodb === 'connected';
    } catch {
      return false;
    }
  }

  // localStorage fallback functions
  function getLocalAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveLocalAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list || []));
    return list || [];
  }

  // MongoDB functions
  async function getAll() {
    if (!useMongoDb) {
      return getLocalAll();
    }
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const products = await response.json();
      
      // Sync to localStorage as backup
      saveLocalAll(products);
      return products;
    } catch (error) {
      console.warn('⚠️  MongoDB unavailable, using localStorage:', error.message);
      useMongoDb = false;
      return getLocalAll();
    }
  }

  async function saveAll(list) {
    // Always save to localStorage first
    saveLocalAll(list);
    
    if (!useMongoDb) {
      return list || [];
    }
    
    try {
      const response = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return list || [];
    } catch (error) {
      console.warn('⚠️  MongoDB save failed, using localStorage only:', error.message);
      useMongoDb = false;
      return list || [];
    }
  }

  async function add(product) {
    // Add to localStorage first
    const localList = getLocalAll();
    localList.push(product);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      if (!response.ok) throw new Error('Failed to add');
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB add failed, using localStorage only:', error.message);
      useMongoDb = false;
      return localList;
    }
  }

  async function update(updated) {
    console.log('🔧 ProductRepository.update called for ID:', updated.id);
    
    // Update localStorage first
    const localList = getLocalAll().map(p => p.id === updated.id ? { ...p, ...updated } : p);
    saveLocalAll(localList);
    console.log('💾 localStorage updated');
    
    if (!useMongoDb) {
      console.log('⚠️ MongoDB disabled, using localStorage only');
      return localList;
    }
    
    try {
      console.log('📤 Sending PUT request to:', `${API_URL}/${updated.id}`);
      const response = await fetch(`${API_URL}/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PUT response not OK:', response.status, errorText);
        throw new Error('Failed to update');
      }
      
      const result = await response.json();
      console.log('✅ MongoDB update successful:', result);
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB update failed, using localStorage only:', error.message);
      useMongoDb = false;
      return localList;
    }
  }

  async function removeById(id) {
    // Remove from localStorage first
    const localList = getLocalAll().filter(p => p.id !== id);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB delete failed, using localStorage only:', error.message);
      useMongoDb = false;
      return localList;
    }
  }

  // Initialize: check MongoDB on load
  checkMongoDb().then(available => {
    useMongoDb = available;
    if (available) {
      console.log('✅ ProductRepository: MongoDB connected');
    } else {
      console.log('⚠️  ProductRepository: Using localStorage only');
    }
  });

  window.App.Repositories.ProductRepository = {
    getAll,
    saveAll,
    add,
    update,
    removeById
  };
})();
