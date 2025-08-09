// ExpenseRepository: localStorage-backed CRUD with recurring group helpers
window.App = window.App || {};
window.App.Repositories = window.App.Repositories || {};
(function() {
  const KEY = 'expenses';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list || []));
    return list || [];
  }

  function add(expense) {
    const list = getAll();
    list.push(expense);
    return saveAll(list);
  }

  function update(updated) {
    const list = getAll().map(e => e.id === updated.id ? { ...e, ...updated } : e);
    return saveAll(list);
  }

  function removeById(id) {
    const list = getAll().filter(e => e.id !== id);
    return saveAll(list);
  }

  function removeGroup(groupId) {
    const list = getAll().filter(e => (e.recurrenceGroupId || e.id) !== groupId);
    return saveAll(list);
  }

  window.App.Repositories.ExpenseRepository = {
    getAll,
    saveAll,
    add,
    update,
    removeById,
    removeGroup
  };
})();
