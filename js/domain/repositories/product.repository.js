// ProductRepository: localStorage-backed CRUD
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'products';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list || []));
    return list || [];
  }

  function add(product) {
    const list = getAll();
    list.push(product);
    return saveAll(list);
  }

  function update(updated) {
    const list = getAll().map(p => p.id === updated.id ? { ...p, ...updated } : p);
    return saveAll(list);
  }

  function removeById(id) {
    const list = getAll().filter(p => p.id !== id);
    return saveAll(list);
  }

  window.App.Repositories.ProductRepository = {
    getAll,
    saveAll,
    add,
    update,
    removeById
  };
})();
