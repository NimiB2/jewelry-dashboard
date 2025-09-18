// App bootstrap: central initialization point
// Loads settings, data and wires events after DOM is ready.

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof initializeSettings === 'function') initializeSettings();
    if (typeof renderCollectionsManager === 'function') renderCollectionsManager();
    if (typeof renderCollectionsChecklist === 'function') renderCollectionsChecklist();
    if (typeof updatePricing === 'function') updatePricing();
    if (typeof loadExpenseData === 'function') loadExpenseData();
    if (typeof loadProducts === 'function') loadProducts();
    if (typeof loadOrders === 'function') loadOrders();
    if (typeof setupEventListeners === 'function') setupEventListeners();
  } catch (err) {
    // Fail safe: basic console logging without breaking the app
    console.error('Bootstrap error:', err);
  }
});
