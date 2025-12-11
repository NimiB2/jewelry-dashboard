// App bootstrap: central initialization point
// Loads settings, data and wires events after DOM is ready.

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (typeof initializeSettings === 'function') initializeSettings();
    if (typeof renderCollectionsManager === 'function') renderCollectionsManager();
    if (typeof renderCollectionsChecklist === 'function') renderCollectionsChecklist();
    if (typeof updatePricing === 'function') updatePricing();
    if (typeof setupEventListeners === 'function') setupEventListeners();
    
    // Load data asynchronously
    if (typeof loadExpenseData === 'function') await loadExpenseData();
    if (typeof loadProducts === 'function') await loadProducts();
    if (typeof loadOrders === 'function') await loadOrders();
    
    console.log('✅ App bootstrap completed');
  } catch (err) {
    // Fail safe: basic console logging without breaking the app
    console.error('Bootstrap error:', err);
  }
});
