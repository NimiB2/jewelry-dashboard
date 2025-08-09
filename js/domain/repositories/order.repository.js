// OrderRepository: localStorage-backed CRUD + nextOrderNumber helpers
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'orders';
  const NEXT_KEY = 'nextOrderNumber';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list || []));
    return list || [];
  }

  function add(order) {
    const list = getAll();
    list.push(order);
    return saveAll(list);
  }

  function update(updated) {
    const list = getAll().map(o => o.id === updated.id ? { ...o, ...updated } : o);
    return saveAll(list);
  }

  function removeById(id) {
    const list = getAll().filter(o => o.id !== id);
    return saveAll(list);
  }

  function getNextOrderNumber() {
    const n = parseInt(localStorage.getItem(NEXT_KEY), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function setNextOrderNumber(n) {
    localStorage.setItem(NEXT_KEY, n);
    return n;
  }

  function incrementAndGet() {
    const next = getNextOrderNumber();
    setNextOrderNumber(next + 1);
    return next;
  }

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
