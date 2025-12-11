// OrderRepository: MongoDB-backed CRUD with localStorage fallback + nextOrderNumber helpers
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'orders';
  const NEXT_KEY = 'nextOrderNumber';
  const API_URL = '/api/orders';
  
  let useMongoDb = true;
  
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

  function getLocalNextOrderNumber() {
    const n = parseInt(localStorage.getItem(NEXT_KEY), 10);
    return Number.isFinite(n) && n >= 1000 ? n : 1000;
  }

  function setLocalNextOrderNumber(n) {
    localStorage.setItem(NEXT_KEY, n);
    return n;
  }

  // MongoDB functions
  async function getAll() {
    if (!useMongoDb) {
      return getLocalAll();
    }
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const orders = await response.json();
      
      saveLocalAll(orders);
      return orders;
    } catch (error) {
      console.warn('⚠️  MongoDB unavailable, using localStorage:', error.message);
      useMongoDb = false;
      return getLocalAll();
    }
  }

  async function saveAll(list) {
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

  async function add(order) {
    const localList = getLocalAll();
    localList.push(order);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
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
    const localList = getLocalAll().map(o => o.id === updated.id ? { ...o, ...updated } : o);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!response.ok) throw new Error('Failed to update');
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB update failed, using localStorage only:', error.message);
      useMongoDb = false;
      return localList;
    }
  }

  async function removeById(id) {
    const localList = getLocalAll().filter(o => o.id !== id);
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

  async function getNextOrderNumber() {
    if (!useMongoDb) {
      return getLocalNextOrderNumber();
    }
    
    try {
      const response = await fetch(`${API_URL}/meta/next-number`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      // Sync to localStorage
      setLocalNextOrderNumber(data.nextOrderNumber);
      return data.nextOrderNumber;
    } catch (error) {
      console.warn('⚠️  MongoDB unavailable, using localStorage:', error.message);
      useMongoDb = false;
      return getLocalNextOrderNumber();
    }
  }

  async function setNextOrderNumber(n) {
    setLocalNextOrderNumber(n);
    // Note: MongoDB manages this automatically via allocate-number
    return n;
  }

  async function incrementAndGet() {
    if (!useMongoDb) {
      const next = getLocalNextOrderNumber();
      setLocalNextOrderNumber(next + 1);
      return next;
    }
    
    try {
      const response = await fetch(`${API_URL}/meta/allocate-number`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to allocate');
      const data = await response.json();
      
      // Sync to localStorage
      setLocalNextOrderNumber(data.orderNumber + 1);
      return data.orderNumber;
    } catch (error) {
      console.warn('⚠️  MongoDB allocate failed, using localStorage:', error.message);
      useMongoDb = false;
      const next = getLocalNextOrderNumber();
      setLocalNextOrderNumber(next + 1);
      return next;
    }
  }

  // Initialize
  checkMongoDb().then(available => {
    useMongoDb = available;
    if (available) {
      console.log('✅ OrderRepository: MongoDB connected');
    } else {
      console.log('⚠️  OrderRepository: Using localStorage only');
    }
  });

  window.App.Repositories.OrderRepository = {
    getAll,
    saveAll,
    add,
    update,
    removeById,
    getNextOrderNumber,
    setNextOrderNumber,
    incrementAndGet
  };
})();
