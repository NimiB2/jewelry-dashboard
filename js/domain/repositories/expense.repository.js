// ExpenseRepository: MongoDB-backed CRUD with localStorage fallback + recurring group helpers
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'expenses';
  const API_URL = '/api/expenses';
  
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

  // MongoDB functions
  async function getAll() {
    if (!useMongoDb) {
      return getLocalAll();
    }
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const expenses = await response.json();
      
      saveLocalAll(expenses);
      return expenses;
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

  async function add(expense) {
    const localList = getLocalAll();
    localList.push(expense);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
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
    const localList = getLocalAll().map(e => e.id === updated.id ? { ...e, ...updated } : e);
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
    const localList = getLocalAll().filter(e => e.id !== id);
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

  async function removeGroup(groupId) {
    const localList = getLocalAll().filter(e => (e.recurrenceGroupId || e.id) !== groupId);
    saveLocalAll(localList);
    
    if (!useMongoDb) {
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/group/${groupId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete group');
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB delete group failed, using localStorage only:', error.message);
      useMongoDb = false;
      return localList;
    }
  }

  // Initialize
  checkMongoDb().then(available => {
    useMongoDb = available;
    if (available) {
      console.log('✅ ExpenseRepository: MongoDB connected');
    } else {
      console.log('⚠️  ExpenseRepository: Using localStorage only');
    }
  });

  window.App.Repositories.ExpenseRepository = {
    getAll,
    saveAll,
    add,
    update,
    removeById,
    removeGroup
  };
})();
