// OrderRepository: MongoDB-backed CRUD with localStorage fallback + nextOrderNumber helpers
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'orders';
  const NEXT_TEST_KEY = 'nextTestOrderNumber';  // For "דוגמא" orders (500+)
  const NEXT_REAL_KEY = 'nextRealOrderNumber';  // For real orders (1000+)
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

  // Test orders (דוגמא) - start from 500
  function getLocalNextTestOrderNumber() {
    const n = parseInt(localStorage.getItem(NEXT_TEST_KEY), 10);
    return Number.isFinite(n) && n >= 500 ? n : 500;
  }

  function setLocalNextTestOrderNumber(n) {
    localStorage.setItem(NEXT_TEST_KEY, n);
    return n;
  }

  // Real orders - start from 1000
  function getLocalNextRealOrderNumber() {
    const n = parseInt(localStorage.getItem(NEXT_REAL_KEY), 10);
    return Number.isFinite(n) && n >= 1000 ? n : 1000;
  }

  function setLocalNextRealOrderNumber(n) {
    localStorage.setItem(NEXT_REAL_KEY, n);
    return n;
  }

  // Check if customer name indicates a test order
  function isTestOrder(customerName) {
    return customerName && customerName.trim().startsWith('דוגמא');
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

  // Allocate order number based on customer name
  async function incrementAndGetForCustomer(customerName) {
    const isTest = isTestOrder(customerName);
    
    if (!useMongoDb) {
      // Local fallback
      if (isTest) {
        const next = getLocalNextTestOrderNumber();
        setLocalNextTestOrderNumber(next + 1);
        console.log(`📝 Test order number allocated (local): ${next}`);
        return next;
      } else {
        const next = getLocalNextRealOrderNumber();
        setLocalNextRealOrderNumber(next + 1);
        console.log(`📝 Real order number allocated (local): ${next}`);
        return next;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}/meta/allocate-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTest })
      });
      
      if (!response.ok) throw new Error('Failed to allocate');
      const data = await response.json();
      
      // Sync to localStorage
      if (isTest) {
        setLocalNextTestOrderNumber(data.orderNumber + 1);
      } else {
        setLocalNextRealOrderNumber(data.orderNumber + 1);
      }
      
      console.log(`📝 ${isTest ? 'Test' : 'Real'} order number allocated (MongoDB): ${data.orderNumber}`);
      return data.orderNumber;
    } catch (error) {
      console.warn('⚠️  MongoDB allocate failed, using localStorage:', error.message);
      useMongoDb = false;
      
      if (isTest) {
        const next = getLocalNextTestOrderNumber();
        setLocalNextTestOrderNumber(next + 1);
        return next;
      } else {
        const next = getLocalNextRealOrderNumber();
        setLocalNextRealOrderNumber(next + 1);
        return next;
      }
    }
  }

  // Legacy function - defaults to test order
  async function incrementAndGet() {
    return incrementAndGetForCustomer('דוגמא');
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
    incrementAndGet,
    incrementAndGetForCustomer,
    isTestOrder
  };
})();
