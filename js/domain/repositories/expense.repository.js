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
    if (!useMongoDb) {
      const localList = getLocalAll();
      localList.push(expense);
      saveLocalAll(localList);
      return localList;
    }
    
    try {
      // First add to MongoDB
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      
      if (!response.ok) throw new Error('Failed to add');
      
      // Then fetch fresh data from MongoDB to sync localStorage
      const freshResponse = await fetch(API_URL);
      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        saveLocalAll(freshData);
        return freshData;
      }
      
      // Fallback: add to localStorage if refresh failed
      const localList = getLocalAll();
      localList.push(expense);
      saveLocalAll(localList);
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB add failed, using localStorage only:', error.message);
      useMongoDb = false;
      const localList = getLocalAll();
      localList.push(expense);
      saveLocalAll(localList);
      return localList;
    }
  }

  async function update(updated) {
    if (!useMongoDb) {
      const localList = getLocalAll().map(e => e.id === updated.id ? { ...e, ...updated } : e);
      saveLocalAll(localList);
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      // Fetch fresh data from MongoDB to sync localStorage
      const freshResponse = await fetch(API_URL);
      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        saveLocalAll(freshData);
        return freshData;
      }
      
      // Fallback
      const localList = getLocalAll().map(e => e.id === updated.id ? { ...e, ...updated } : e);
      saveLocalAll(localList);
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB update failed, using localStorage only:', error.message);
      useMongoDb = false;
      const localList = getLocalAll().map(e => e.id === updated.id ? { ...e, ...updated } : e);
      saveLocalAll(localList);
      return localList;
    }
  }

  async function removeById(id) {
    if (!useMongoDb) {
      const localList = getLocalAll().filter(e => e.id !== id);
      saveLocalAll(localList);
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      // Fetch fresh data from MongoDB to sync localStorage
      const freshResponse = await fetch(API_URL);
      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        saveLocalAll(freshData);
        return freshData;
      }
      
      const localList = getLocalAll().filter(e => e.id !== id);
      saveLocalAll(localList);
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB delete failed, using localStorage only:', error.message);
      useMongoDb = false;
      const localList = getLocalAll().filter(e => e.id !== id);
      saveLocalAll(localList);
      return localList;
    }
  }

  async function removeGroup(groupId) {
    if (!useMongoDb) {
      const localList = getLocalAll().filter(e => (e.recurrenceGroupId || e.id) !== groupId);
      saveLocalAll(localList);
      return localList;
    }
    
    try {
      const response = await fetch(`${API_URL}/group/${groupId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete group');
      
      // Fetch fresh data from MongoDB to sync localStorage
      const freshResponse = await fetch(API_URL);
      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        saveLocalAll(freshData);
        return freshData;
      }
      
      const localList = getLocalAll().filter(e => (e.recurrenceGroupId || e.id) !== groupId);
      saveLocalAll(localList);
      return localList;
    } catch (error) {
      console.warn('⚠️  MongoDB delete group failed, using localStorage only:', error.message);
      useMongoDb = false;
      const localList = getLocalAll().filter(e => (e.recurrenceGroupId || e.id) !== groupId);
      saveLocalAll(localList);
      return localList;
    }
  }

  // Initialize and sync localStorage to MongoDB if needed
  checkMongoDb().then(async (available) => {
    useMongoDb = available;
    if (available) {
      console.log('✅ ExpenseRepository: MongoDB connected');
      
      // Check if MongoDB is empty but localStorage has data - sync it
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const mongoData = await response.json();
          const localData = getLocalAll();
          
          if (mongoData.length === 0 && localData.length > 0) {
            console.log('🔄 Syncing localStorage expenses to MongoDB...', localData.length, 'items');
            // Sync localStorage to MongoDB
            const bulkResponse = await fetch(`${API_URL}/bulk`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localData)
            });
            if (bulkResponse.ok) {
              console.log('✅ Expenses synced to MongoDB');
            }
          } else if (mongoData.length > 0) {
            // MongoDB has data, sync to localStorage
            saveLocalAll(mongoData);
            console.log('✅ Expenses synced from MongoDB:', mongoData.length, 'items');
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not sync expenses:', err.message);
      }
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
