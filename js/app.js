let expenses = (window.App && App.Repositories && App.Repositories.ExpenseRepository && typeof App.Repositories.ExpenseRepository.getAll === 'function')
    ? App.Repositories.ExpenseRepository.getAll()
    : JSON.parse(localStorage.getItem('expenses') || '[]');
let products = (window.App && App.Repositories && App.Repositories.ProductRepository && typeof App.Repositories.ProductRepository.getAll === 'function')
    ? App.Repositories.ProductRepository.getAll()
    : JSON.parse(localStorage.getItem('products') || '[]');
let orders = (window.App && App.Repositories && App.Repositories.OrderRepository && typeof App.Repositories.OrderRepository.getAll === 'function')
    ? App.Repositories.OrderRepository.getAll()
    : JSON.parse(localStorage.getItem('orders') || '[]');
let settings = JSON.parse(localStorage.getItem('settings') || '{}');
let nextOrderNumber = (window.App && App.Repositories && App.Repositories.OrderRepository && typeof App.Repositories.OrderRepository.getNextOrderNumber === 'function')
    ? App.Repositories.OrderRepository.getNextOrderNumber()
    : parseInt(localStorage.getItem('nextOrderNumber') || '2021');

function initializeSettings() {
    const defaults = {
        vatRate: 0.17,
        processingFee: 0.025,
        packagingCost: 15,
        fixedCosts: 50,
        laborHourRate: 100,
        salaryHourRate: 50,
        materialPrices: {
            'כסף': 6,
            'זהב 14K': 270,
            'ציפוי זהב': 10,
            'יציקה כסף': 9,
            'יציקה ציפוי זהב': 10
        },
        laborTime: {
            'כסף': 1,
            'זהב 14K': 1.875,
            'ציפוי זהב': 1,
            'יציקה כסף': 1,
            'יציקה ציפוי זהב': 1
        },
        profitMultiplier: {
            'כסף': 1.5,
            'זהב 14K': 1.3,
            'ציפוי זהב': 1.5,
            'יציקה כסף': 1.5,
            'יציקה ציפוי זהב': 1.5
        },
        conversionRatio: {
            'כסף': 10.4,
            'זהב 14K': 13.4
        }
    };
    
    // Load from localStorage first (synchronous)
    try {
        const stored = JSON.parse(localStorage.getItem('settings') || '{}');
        settings = { ...defaults, ...stored };
    } catch {
        settings = defaults;
    }
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Then sync with MongoDB (async, in background)
    if (window.App && App.SettingsService && typeof App.SettingsService.mergeDefaults === 'function') {
        App.SettingsService.mergeDefaults(defaults).then(merged => {
            settings = merged;
            localStorage.setItem('settings', JSON.stringify(settings));
        });
    }
    loadSettingsToUI();
}

// Collections Management Functions
async function getAllCollections() {
    // Try to load from MongoDB first
    try {
        const response = await fetch('/api/settings/collections');
        if (response.ok) {
            const mongoCollections = await response.json();
            if (mongoCollections && mongoCollections.length > 0) {
                // Sync to localStorage
                localStorage.setItem('collections', JSON.stringify(mongoCollections));
                return mongoCollections;
            }
        }
    } catch (error) {
        console.warn('⚠️  MongoDB unavailable for collections, using localStorage');
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('collections');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn('Failed to parse stored collections, reinitializing:', e);
            const permanent = getPermanentCollections();
            await saveCollections(permanent);
            return permanent;
        }
    } else {
        // Initialize with permanent collections if none exist
        const permanent = getPermanentCollections();
        await saveCollections(permanent);
        return permanent;
    }
}

// Synchronous version for immediate access
function getAllCollectionsSync() {
    const stored = localStorage.getItem('collections');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return getPermanentCollections();
        }
    }
    return getPermanentCollections();
}

function getEditableCollections() {
    const collections = getAllCollectionsSync();
    // Return only editable collections (exclude permanent ones)
    return collections.filter(c => c !== 'הזמנה אישית' && c !== 'כללי');
}

function getPermanentCollections() {
    return ['כללי', 'הזמנה אישית'];
}

async function saveCollections(collections) {
    // Ensure permanent collections are always included
    const permanentCollections = getPermanentCollections();
    const filtered = collections.filter(c => !permanentCollections.includes(c));
    const finalCollections = [...permanentCollections, ...filtered];
    
    // Save to localStorage immediately
    localStorage.setItem('collections', JSON.stringify(finalCollections));
    
    // Save to MongoDB in background
    try {
        const response = await fetch('/api/settings/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalCollections)
        });
        
        if (response.ok) {
            console.log('✅ Collections saved to MongoDB');
        }
    } catch (error) {
        console.warn('⚠️  MongoDB save failed for collections:', error.message);
    }
}

async function addCollection() {
    const input = document.getElementById('newCollectionName');
    if (!input) return;
    
    const name = input.value.trim();
    if (!name) {
        alert('אנא הכנס שם קולקציה');
        return;
    }
    
    // Get collections (await the async function)
    const collections = await getAllCollections();
    if (collections.includes(name)) {
        alert('קולקציה זו כבר קיימת');
        return;
    }
    
    collections.push(name);
    await saveCollections(collections);
    input.value = '';
    
    // Show success feedback
    const successMsg = document.createElement('span');
    successMsg.textContent = '✅ הקולקציה נוספה בהצלחה';
    successMsg.style.color = 'green';
    successMsg.style.fontSize = '12px';
    successMsg.style.marginRight = '8px';
    input.parentNode.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
    
    // Re-render both sections
    renderCollectionsManager();
    await renderCollectionsChecklist();
    
    // Update collections filter in products list
    if (window.App && App.Managers && App.Managers.productManager) {
        App.Managers.productManager.updateCollectionsFilter();
    }
    
    console.log('✅ Collection added:', name);
}

async function renameCollection(oldName, newName) {
    if (!newName || !newName.trim()) return;
    
    const collections = await getAllCollections();
    const index = collections.indexOf(oldName);
    if (index === -1) return;
    
    if (collections.includes(newName.trim()) && newName.trim() !== oldName) {
        alert('קולקציה בשם זה כבר קיימת');
        return;
    }
    
    collections[index] = newName.trim();
    await saveCollections(collections);
    renderCollectionsManager();
    await renderCollectionsChecklist();
    
    // Update collections filter in products list
    if (window.App && App.Managers && App.Managers.productManager) {
        App.Managers.productManager.updateCollectionsFilter();
    }
}

async function deleteCollection(name) {
    const permanentCollections = getPermanentCollections();
    if (permanentCollections.includes(name)) {
        alert(`לא ניתן למחוק את הקולקציה "${name}"`);
        return;
    }
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הקולקציה "${name}"?`)) {
        return;
    }
    
    const collections = (await getAllCollections()).filter(c => c !== name);
    await saveCollections(collections);
    renderCollectionsManager();
    await renderCollectionsChecklist();
    
    // Update collections filter in products list
    if (window.App && App.Managers && App.Managers.productManager) {
        App.Managers.productManager.updateCollectionsFilter();
    }
}

function renderCollectionsManager() {
    const container = document.getElementById('collectionsManagerList');
    if (!container) return;
    
    const editableCollections = getEditableCollections();
    const permanentCollections = getPermanentCollections();
    container.innerHTML = '';
    
    // קולקציות קבועות
    const permanentSection = document.createElement('div');
    permanentSection.style.marginBottom = '16px';
    
    const permanentLabel = document.createElement('div');
    permanentLabel.textContent = 'קולקציות קבועות:';
    permanentLabel.style.fontSize = '13px';
    permanentLabel.style.fontWeight = 'bold';
    permanentLabel.style.marginBottom = '8px';
    permanentLabel.style.color = '#333';
    
    const permanentList = document.createElement('div');
    permanentList.style.border = '1px solid #ddd';
    permanentList.style.borderRadius = '4px';
    permanentList.style.backgroundColor = '#f8f9fa';
    
    permanentCollections.forEach((name, index) => {
        const item = document.createElement('div');
        item.textContent = name;
        item.style.padding = '8px 12px';
        item.style.fontSize = '13px';
        item.style.borderBottom = index < permanentCollections.length - 1 ? '1px solid #eee' : 'none';
        permanentList.appendChild(item);
    });
    
    permanentSection.appendChild(permanentLabel);
    permanentSection.appendChild(permanentList);
    container.appendChild(permanentSection);
    
    // קולקציות לעריכה
    const editableSection = document.createElement('div');
    
    const editableLabel = document.createElement('div');
    editableLabel.textContent = 'קולקציות נוספות:';
    editableLabel.style.fontSize = '13px';
    editableLabel.style.fontWeight = 'bold';
    editableLabel.style.marginBottom = '8px';
    editableLabel.style.color = '#333';
    
    if (editableCollections.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = 'אין קולקציות נוספות';
        emptyMsg.style.padding = '12px';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = '#666';
        emptyMsg.style.fontSize = '12px';
        emptyMsg.style.border = '1px dashed #ccc';
        emptyMsg.style.borderRadius = '4px';
        editableSection.appendChild(editableLabel);
        editableSection.appendChild(emptyMsg);
    } else {
        const editableDropdown = document.createElement('select');
        editableDropdown.style.width = '100%';
        editableDropdown.style.padding = '6px 8px';
        editableDropdown.style.border = '1px solid #ddd';
        editableDropdown.style.borderRadius = '4px';
        editableDropdown.style.fontSize = '13px';
        editableDropdown.style.marginBottom = '8px';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'בחר קולקציה לעריכה...';
        editableDropdown.appendChild(defaultOption);
        
        editableCollections.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            editableDropdown.appendChild(option);
        });
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '8px';
        
        const renameBtn = document.createElement('button');
        renameBtn.textContent = 'שנה שם';
        renameBtn.className = 'btn-small';
        renameBtn.disabled = true;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'מחק';
        deleteBtn.className = 'btn-small btn-danger';
        deleteBtn.disabled = true;
        
        editableDropdown.addEventListener('change', () => {
            const selected = editableDropdown.value;
            renameBtn.disabled = !selected;
            deleteBtn.disabled = !selected;
        });
        
        renameBtn.onclick = () => {
            const selected = editableDropdown.value;
            if (selected) {
                const newName = prompt('שם חדש לקולקציה:', selected);
                if (newName !== null && newName.trim() !== selected) {
                    renameCollection(selected, newName.trim());
                }
            }
        };
        
        deleteBtn.onclick = () => {
            const selected = editableDropdown.value;
            if (selected) {
                deleteCollection(selected);
            }
        };
        
        actionsDiv.appendChild(renameBtn);
        actionsDiv.appendChild(deleteBtn);
        
        editableSection.appendChild(editableLabel);
        editableSection.appendChild(editableDropdown);
        editableSection.appendChild(actionsDiv);
    }
    
    container.appendChild(editableSection);
}

// Collections checklist render: simple native dropdown (single select) listing all collections
async function renderCollectionsChecklist() {
    const container = document.getElementById('collectionsChecklist');
    if (!container) {
        console.log('collectionsChecklist container not found');
        return;
    }
    
    console.log('Rendering collections checklist...');
    container.innerHTML = '';

    // Cleanup any previous floating assets/handlers
    const prevPanel = document.getElementById('collectionsPanelFloating');
    if (prevPanel) prevPanel.remove();
    if (window.__collectionsOutsideHandler) {
        document.removeEventListener('click', window.__collectionsOutsideHandler);
        window.__collectionsOutsideHandler = null;
    }
    if (window.__collectionsRepositionHandler) {
        window.removeEventListener('scroll', window.__collectionsRepositionHandler, true);
        window.removeEventListener('resize', window.__collectionsRepositionHandler);
        window.__collectionsRepositionHandler = null;
    }

    // Hidden input to persist selection for product saving (as array with one item)
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'collectionsSelectedHidden';

    // Visual facade styled like a native select (for reliable custom toggling)
    const facade = document.createElement('div');
    facade.style.width = '100%';
    facade.style.padding = '6px 8px';
    facade.style.border = '1px solid #ddd';
    facade.style.borderRadius = '4px';
    facade.style.fontSize = '13px';
    facade.style.backgroundColor = '#fff';
    facade.style.cursor = 'pointer';
    facade.style.display = 'flex';
    facade.style.alignItems = 'center';
    facade.style.justifyContent = 'space-between';
    facade.tabIndex = 0;
    facade.setAttribute('role', 'button');
    facade.setAttribute('aria-expanded', 'false');
    
    const facadeLabel = document.createElement('span');
    const facadeArrow = document.createElement('span');
    facadeArrow.textContent = '▼';
    facadeArrow.style.color = '#666';
    facade.appendChild(facadeLabel);
    facade.appendChild(facadeArrow);

    const all = await getAllCollections();
    // Ensure 'כללי' is present first
    const ordered = Array.from(new Set(['כללי', ...all]));

    // Initialize facade label
    facadeLabel.textContent = 'כללי';

    // Build floating panel with checkboxes for multi-select (keeps the same select visual)
    const panel = document.createElement('div');
    panel.id = 'collectionsPanelFloating';
    panel.style.display = 'none';
    panel.style.position = 'absolute';
    panel.style.backgroundColor = '#fff';
    panel.style.border = '2px solid #667eea';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = '9999';
    panel.style.maxHeight = '250px';
    panel.style.width = '100%';
    panel.style.minWidth = '300px';
    panel.style.overflowY = 'auto';
    panel.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
    panel.style.top = '100%';
    panel.style.left = '0';
    panel.style.right = '0';
    panel.style.marginTop = '2px';

    // Render items with checkboxes
    ordered.forEach((name, index) => {
        const item = document.createElement('label');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '12px';
        item.style.padding = '12px 16px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        item.style.fontWeight = '500';
        item.style.borderBottom = index < ordered.length - 1 ? '1px solid #e9ecef' : 'none';
        item.style.transition = 'background-color 0.2s';
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f8f9fa';
        });
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'collection-checkbox';
        cb.value = name;
        cb.style.width = '16px';
        cb.style.height = '16px';
        cb.style.accentColor = '#667eea';
        
        // default to 'כללי'
        if (name === 'כללי') cb.checked = true;
        
        const span = document.createElement('span');
        span.textContent = name;
        span.style.color = '#333';
        span.style.userSelect = 'none';
        
        item.appendChild(cb);
        item.appendChild(span);
        cb.addEventListener('change', updateSelectText);
        panel.appendChild(item);
    });

    // Make container relative positioned so absolute panel positions correctly
    container.style.position = 'relative';
    // Attach reposition handlers so the panel follows the trigger
    if (window.__collectionsRepositionHandler) {
        window.removeEventListener('scroll', window.__collectionsRepositionHandler, true);
        window.removeEventListener('resize', window.__collectionsRepositionHandler);
    }
    window.__collectionsRepositionHandler = () => {
        if (panel.style.display === 'block') positionPanel();
    };
    window.addEventListener('scroll', window.__collectionsRepositionHandler, true);
    window.addEventListener('resize', window.__collectionsRepositionHandler);

    function updateSelectText() {
        const checked = panel.querySelectorAll('input.collection-checkbox:checked');
        const values = Array.from(checked).map(cb => cb.value);
        if (values.length === 0) {
            const general = panel.querySelector('input.collection-checkbox[value="כללי"]');
            if (general) { general.checked = true; values.push('כללי'); }
        }
        // Update hidden
        hidden.value = JSON.stringify(values);
        // Update facade display
        if (values.length === 1) {
            facadeLabel.textContent = values[0];
        } else {
            facadeLabel.textContent = `נבחרו ${values.length} קולקציות`;
        }
    }

    // Simple click handler for opening/closing the panel
    function togglePanel(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('Toggle panel clicked');
        const open = panel.style.display === 'block';
        if (!open) {
            console.log('Opening panel');
            panel.style.display = 'block';
            facade.setAttribute('aria-expanded', 'true');
        } else {
            console.log('Closing panel');
            panel.style.display = 'none';
            facade.setAttribute('aria-expanded', 'false');
        }
    }
    
    // Use simple click events
    facade.addEventListener('click', togglePanel);
    
    // Keyboard support
    facade.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePanel(e);
        }
    });

    // Close on outside click
    if (window.__collectionsOutsideHandler) {
        document.removeEventListener('click', window.__collectionsOutsideHandler);
    }
    window.__collectionsOutsideHandler = (e) => {
        if (!panel.contains(e.target) && !container.contains(e.target)) {
            panel.style.display = 'none';
        }
    };
    document.addEventListener('click', window.__collectionsOutsideHandler);

    // Mount and initial state
    updateSelectText();
    container.appendChild(facade);
    container.appendChild(panel);
    container.appendChild(hidden);
}

// Initialize collections on page load
async function initializeCollections() {
    // Ensure collections are initialized with permanent ones
    await getAllCollections();
    // Render both sections
    renderCollectionsManager();
    await renderCollectionsChecklist();
}

// Auto-initialize when DOM is ready and scroll to top
async function onPageLoad() {
    // Scroll to top of page
    window.scrollTo(0, 0);
    // Initialize collections
    await initializeCollections();
    // Initialize order manager if it exists
    if (window.App && App.Managers && App.Managers.orderManager) {
        App.Managers.orderManager.initializeOrderForm();
    }
    // Fix any decimal IDs in products on page load
    setTimeout(() => {
        if (window.fixAllProductIds) {
            fixAllProductIds();
        }
    }, 1000);
    
    // Set default tab to orders (ניהול הזמנות)
    setTimeout(() => {
        switchTab('orders');
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageLoad);
} else {
    onPageLoad();
}

// Expose collection functions to window to ensure inline handlers work
window.addCollection = addCollection;
window.renameCollection = renameCollection;
window.fixAllProductIds = fixAllProductIds;
window.deleteCollection = deleteCollection;
window.renderCollectionsManager = renderCollectionsManager;
window.renderCollectionsChecklist = renderCollectionsChecklist;
window.initializeCollections = initializeCollections;

// Keep site price synced with recommended price always
function syncSitePriceDefault(recommendedPrice) {
    const input = document.getElementById('sitePriceInput');
    if (!input) return;
    // Always sync site price with recommended price
    input.value = (recommendedPrice || 0).toFixed(2);
    input.placeholder = `ברירת מחדל: ${(recommendedPrice || 0).toFixed(2)}₪`;
}

// Mark manual changes to site price but still allow auto-sync on pricing changes
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'sitePriceInput') {
        // Recalculate profit when site price changes manually
        calculateDiscount();
    }
});

// Function to reset site price when starting new product calculation
function resetSitePriceToDefault() {
    const input = document.getElementById('sitePriceInput');
    if (input) {
        input.value = '';
        input.placeholder = 'ברירת מחדל: מחיר מומלץ';
    }
}

function loadSettingsToUI() {
    const setValueIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };

    setValueIfExists('vatRate', (settings.vatRate * 100).toFixed(1));
    setValueIfExists('processingFee', (settings.processingFee * 100).toFixed(1));
    setValueIfExists('packagingCost', settings.packagingCost);
    setValueIfExists('fixedCosts', settings.fixedCosts);
    setValueIfExists('laborHourRate', settings.laborHourRate);

    setValueIfExists('price_14k', settings.materialPrices['14k']);
    setValueIfExists('price_silver', settings.materialPrices['silver']);
    setValueIfExists('price_silver_cast', settings.materialPrices['silver_cast']);

    setValueIfExists('time_14k', settings.laborTime['14k']);
    setValueIfExists('time_silver', settings.laborTime['silver']);
    setValueIfExists('time_plating', settings.laborTime['plating']);

    setValueIfExists('profit_14k', settings.profitMultiplier['14k']);
    setValueIfExists('profit_silver', settings.profitMultiplier['silver']);
    setValueIfExists('profit_plating', settings.profitMultiplier['plating']);
}

async function saveSettings() {
    settings.vatRate = parseFloat(document.getElementById('vatRate').value) / 100;
    settings.processingFee = parseFloat(document.getElementById('processingFee').value) / 100;
    settings.packagingCost = parseFloat(document.getElementById('packagingCost').value);
    settings.fixedCosts = parseFloat(document.getElementById('fixedCosts').value);
    settings.laborHourRate = parseFloat(document.getElementById('laborHourRate').value);

    settings.materialPrices['14k'] = parseFloat(document.getElementById('price_14k').value);
    settings.materialPrices['silver'] = parseFloat(document.getElementById('price_silver').value);
    settings.materialPrices['silver_cast'] = parseFloat(document.getElementById('price_silver_cast').value);

    settings.laborTime['14k'] = parseFloat(document.getElementById('time_14k').value);
    settings.laborTime['silver'] = parseFloat(document.getElementById('time_silver').value);
    settings.laborTime['plating'] = parseFloat(document.getElementById('time_plating').value);

    settings.profitMultiplier['14k'] = parseFloat(document.getElementById('profit_14k').value);
    settings.profitMultiplier['silver'] = parseFloat(document.getElementById('profit_silver').value);
    settings.profitMultiplier['plating'] = parseFloat(document.getElementById('profit_plating').value);

    // Save to both localStorage and MongoDB
    localStorage.setItem('settings', JSON.stringify(settings));
    if (window.App && App.SettingsService && typeof App.SettingsService.set === 'function') {
        await App.SettingsService.set(settings);
        console.log('✅ Settings saved to MongoDB');
    }
    
    const savedMsg = document.getElementById('settingsSaved');
    savedMsg.style.display = 'inline';
    setTimeout(() => { savedMsg.style.display = 'none'; }, 2000);

    updatePricing();
    await loadExpenseData();
    
    // Refresh products display to reflect new settings
    // These old settings affect material prices and labor, so they impact existing products
    if (window.refreshProductsAfterSettingsChange) {
        window.refreshProductsAfterSettingsChange(['חומרים – עלויות ועבודה']);
    }
}

function setupEventListeners() {
    document.getElementById('addExpenseForm').addEventListener('submit', addExpense);
    document.getElementById('editExpenseForm').addEventListener('submit', saveEditedExpense);
    document.getElementById('addProductForm').addEventListener('submit', addNewProduct);
    document.getElementById('editProductForm').addEventListener('submit', saveEditedProduct);
    document.getElementById('addOrderForm').addEventListener('submit', addOrder);

    document.getElementById('expenseType').addEventListener('change', toggleWorkHoursField);
    document.getElementById('isRecurring').addEventListener('change', toggleRecurringMonths);
    
    // Add listener for edit modal if it exists
    const editExpenseType = document.getElementById('editExpenseType');
    if (editExpenseType) {
        editExpenseType.addEventListener('change', toggleEditWorkHoursField);
    }
    
    // Add listener for edit recurring checkbox
    const editIsRecurring = document.getElementById('editIsRecurring');
    if (editIsRecurring) {
        editIsRecurring.addEventListener('change', toggleEditRecurringMonths);
    }

    // Add listeners for pricing inputs to trigger calculations
    const pricingInputs = ['material', 'weight', 'productType', 'productName'];
    pricingInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updatePricing);
            element.addEventListener('input', updatePricing);
        }
    });

    // Reset site price when starting new calculation
    let __sitePriceDirty = false;
    const productFormInputs = ['productType', 'productName', 'material', 'weight'];
    productFormInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('focus', () => {
                if (!__sitePriceDirty) {
                    resetSitePriceToDefault();
                }
            });
        }
    });
}

async function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

    document.querySelector(`.nav-tab[onclick="switchTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById(tabName)?.classList.add('active');
    
    // Load data when switching to specific tabs (await async functions)
    if (tabName === 'pricing') {
        await loadProducts();
    } else if (tabName === 'expenses') {
        // Load expense data automatically when entering expenses page
        if (window.App && App.Managers && App.Managers.expenseManager) {
            await App.Managers.expenseManager.loadExpenseData();
        }
    } else if (tabName === 'orders') {
        // Load orders data automatically when entering orders page
        if (window.App && App.Managers && App.Managers.orderManager) {
            await App.Managers.orderManager.loadOrders();
        }
    }
}

function toggleWorkHoursField() {
    return window.App && App.Managers && App.Managers.expenseManager
        ? App.Managers.expenseManager.toggleWorkHoursField()
        : null;
}

function toggleRecurringBySubtype() {
    return window.App && App.Managers && App.Managers.expenseManager
        ? App.Managers.expenseManager.toggleRecurringBySubtype()
        : null;
}

function toggleEditRecurringBySubtype() {
    return window.App && App.Managers && App.Managers.expenseManager
        ? App.Managers.expenseManager.toggleEditRecurringBySubtype()
        : null;
}

function showAddExpenseModal() {
    return App.Managers.expenseManager.showAddExpenseModal();
}

async function addExpense(e) {
    if (e) e.preventDefault();
    await App.Managers.expenseManager.addExpense(e);
}

function toggleEditRecurringMonths() {
    const isRecurring = document.getElementById('editIsRecurring').checked;
    const recurringMonthsGroup = document.getElementById('editRecurringMonths');
    
    if (isRecurring) {
        recurringMonthsGroup.style.display = 'block';
    } else {
        recurringMonthsGroup.style.display = 'none';
    }
}

function toggleEditWorkHoursField() {
    return window.App && App.Managers && App.Managers.expenseManager
        ? App.Managers.expenseManager.toggleEditWorkHoursField()
        : null;
}

async function showEditExpenseModal(id) {
    await App.Managers.expenseManager.showEditExpenseModal(id);
}

async function saveEditedExpense(e) {
    if (e) e.preventDefault();
    await App.Managers.expenseManager.saveEditedExpense(e);
}

async function deleteExpense(id) {
    await App.Managers.expenseManager.deleteExpense(id);
}

async function loadExpenseData() {
    await App.Managers.expenseManager.loadExpenseData();
    // Apply stat card colors based on current DOM totals (backward-compatible behavior)
    const incomeCard = document.getElementById('totalIncome')?.parentElement;
    const expensesCard = document.getElementById('totalExpenses')?.parentElement;
    const profitCard = document.getElementById('netProfit')?.parentElement;
    const profitMarginCard = document.getElementById('profitMargin')?.parentElement;
    const salaryCard = document.getElementById('totalSalaryFromHours')?.parentElement;

    const netProfitText = document.getElementById('netProfit')?.textContent || '0';
    const netProfit = parseFloat(netProfitText.replace(/[^\d.-]/g, '')) || 0;

    if (incomeCard) incomeCard.className = 'stat-card stat-card-green';
    if (expensesCard) expensesCard.className = 'stat-card stat-card-red';
    if (profitCard) profitCard.className = netProfit >= 0 ? 'stat-card stat-card-green' : 'stat-card stat-card-red';
    if (profitMarginCard) profitMarginCard.className = netProfit >= 0 ? 'stat-card stat-card-green' : 'stat-card stat-card-red';
    if (salaryCard) salaryCard.className = 'stat-card stat-card-blue';
}

function addRecurringExpenseToFutureMonths(expense) {
    return App.Managers.expenseManager.addRecurringExpenseToFutureMonths(expense);
}

// Old salary calculation functions removed since the section was deleted from HTML

// Pricing Functions
// ---------- Pricing helpers bound to SettingsService categories ----------
function getSettingsObject() {
    // Always read from localStorage for synchronous access
    // SettingsService syncs MongoDB → localStorage automatically
    try { return JSON.parse(localStorage.getItem('settings') || '{}'); } catch { return {}; }
}

function findCategory(settingsObj, name) {
    const cats = Array.isArray(settingsObj?.categories) ? settingsObj.categories : [];
    return cats.find(c => c?.name === name);
}

function findItemValueInCategory(cat, itemName) {
    if (!cat) return undefined;
    const fromItems = Array.isArray(cat.items) ? cat.items.find(i => i?.name === itemName) : undefined;
    if (fromItems) return Number(fromItems.value);
    // Search subcategories items
    for (const sc of (cat.subcategories || [])) {
        const it = Array.isArray(sc.items) ? sc.items.find(i => i?.name === itemName) : undefined;
        if (it) return Number(it.value);
    }
    return undefined;
}

function getMaterialPricePerGram(materialLabel) {
    const settingsObj = getSettingsObject();
    
    // Try to find the material price in the settings structure
    let price = 0;
    
    // FIRST try categories structure (new dynamic settings)
    if (settingsObj?.categories) {
        const materialCategory = settingsObj.categories.find(cat => 
            cat.name === 'חומרים – עלויות ועבודה'
        );
        if (materialCategory) {
            const priceSubcat = materialCategory.subcategories?.find(sub => 
                sub.name === 'עלות חומרים לגרם'
            );
            if (priceSubcat) {
                const materialItem = priceSubcat.items?.find(item => 
                    item.name === materialLabel
                );
                if (materialItem) {
                    price = Number(materialItem.value);
                    console.log('getMaterialPricePerGram: Found in categories:', materialLabel, '=', price);
                    return price;
                }
            }
        }
    }
    
    // Fallback to old direct lookup structure
    if (settingsObj?.materialPrices?.[materialLabel]) {
        price = Number(settingsObj.materialPrices[materialLabel]);
        console.log('getMaterialPricePerGram: Found in old materialPrices:', materialLabel, '=', price);
    }
    
    return price;
}

function getLaborTimeForMaterial(materialLabel) {
    const settingsObj = getSettingsObject();
    
    // Try to find the labor time in the settings structure
    let time = 0;
    
    // FIRST try categories structure (new dynamic settings)
    if (settingsObj?.categories) {
        const materialCategory = settingsObj.categories.find(cat => 
            cat.name === 'חומרים – עלויות ועבודה'
        );
        if (materialCategory) {
            const timeSubcat = materialCategory.subcategories?.find(sub => 
                sub.name === 'זמן עבודה (שעות)' || 
                sub.name === 'זמן עבודה לחומר (שעות)' || 
                sub.name.includes('זמן עבודה')
            );
            if (timeSubcat) {
                const materialItem = timeSubcat.items?.find(item => 
                    item.name === materialLabel
                );
                if (materialItem) {
                    time = Number(materialItem.value);
                    console.log('getLaborTimeForMaterial: Found in categories:', materialLabel, '=', time);
                    return time;
                }
            }
        }
    }
    
    // Fallback to old direct lookup structure
    if (settingsObj?.laborTime?.[materialLabel]) {
        time = Number(settingsObj.laborTime[materialLabel]);
        console.log('getLaborTimeForMaterial: Found in old laborTime:', materialLabel, '=', time);
    }
    
    return time;
}

function getProfitMultiplier(materialLabel) {
    const settingsObj = getSettingsObject();
    
    // Try to find the profit multiplier in the settings structure
    let multiplier = 1;
    
    // FIRST try categories structure (new dynamic settings)
    if (settingsObj?.categories) {
        const profitCategory = settingsObj.categories.find(cat => 
            cat.name === 'מכפילי רווח'
        );
        if (profitCategory) {
            // Map material names to profit multiplier names
            const materialToProfitMap = {
                'כסף': 'מכפלת כסף',
                'יציקה כסף': 'מכפלת יציקה כסף',
                'זהב 14K': 'מכפלת זהב',
                'ציפוי זהב': 'מכפלת ציפוי זהב',
                'יציקה ציפוי זהב': 'מכפלת יציקה ציפוי זהב'
            };
            
            const profitItemName = materialToProfitMap[materialLabel];
            if (profitItemName) {
                const profitItem = profitCategory.items?.find(item => 
                    item.name === profitItemName
                );
                if (profitItem) {
                    multiplier = Number(profitItem.value);
                    console.log('getProfitMultiplier: Found in categories:', profitItemName, '=', multiplier);
                    return multiplier;
                }
            }
        }
    }
    
    // Fallback to old direct lookup structure
    if (settingsObj?.profitMultiplier?.[materialLabel]) {
        multiplier = Number(settingsObj.profitMultiplier[materialLabel]);
        console.log('getProfitMultiplier: Found in old profitMultiplier:', materialLabel, '=', multiplier);
    }
    
    return multiplier;
}

function getCorePricingConstant(name) {
    const settingsObj = getSettingsObject();
    const coreCat = findCategory(settingsObj, 'קבועי תמחור תכשיטים');
    const result = Number(findItemValueInCategory(coreCat, name) || 0);
    
    // Debug: show all available items in the core category
    if (name === 'סה"כ אריזה' && result === 0) {
        console.log('Available items in core category:', coreCat?.subcategories?.map(sub => ({
            subcategory: sub.name,
            items: sub.items?.map(item => item.name)
        })));
    }
    
    console.log('getCorePricingConstant:', { 
        name, 
        coreCat: coreCat?.name, 
        result,
        settingsCategories: settingsObj?.categories?.map(c => c.name)
    });
    return result;
}

function getPackagingTotal() {
    const result = getCorePricingConstant('סה"כ אריזה');
    console.log('getPackagingTotal result:', result);
    
    // If the stored value is 0, update it to the correct value and return it
    if (result === 0) {
        console.log('Packaging total is 0, updating to correct value: 17.88');
        
        // Update the settings with the correct value
        const settingsObj = getSettingsObject();
        if (settingsObj?.categories) {
            const coreCat = settingsObj.categories.find(cat => cat.name === 'קבועי תמחור תכשיטים');
            if (coreCat?.items) {
                const packagingItem = coreCat.items.find(item => item.name === 'סה"כ אריזה');
                if (packagingItem) {
                    packagingItem.value = 17.88;
                    // Save the updated settings
                    if (window.App?.SettingsService?.save) {
                        window.App.SettingsService.save(settingsObj);
                    } else {
                        localStorage.setItem('settings', JSON.stringify(settingsObj));
                    }
                    console.log('Updated packaging total in settings');
                }
            }
        }
        
        return 17.88;
    }
    
    return result;
}

function getDomesticShipping() {
    return getCorePricingConstant('משלוח בארץ');
}

function getVatMultiplier() {
    const settingsObj = getSettingsObject();
    const feesCategory = findCategory(settingsObj, 'עמלות');
    const result = Number(findItemValueInCategory(feesCategory, 'מע"מ') || 0);
    return result && result > 1 ? result : (1 + Number(result || 0));
}

function getClearingFeeMultiplier() {
    const settingsObj = getSettingsObject();
    const feesCategory = findCategory(settingsObj, 'עמלות');
    return Number(findItemValueInCategory(feesCategory, 'מקדם עמלת סליקה (5.7%)') || 1);
}

function getFixedExpensesFeeMultiplier() {
    const settingsObj = getSettingsObject();
    const feesCategory = findCategory(settingsObj, 'עמלות');
    return Number(findItemValueInCategory(feesCategory, 'מקדם עמלת הוצאות קבועות') || 1.17);
}

function getLaborHourRate() {
    const settingsObj = getSettingsObject();
    const workCategory = findCategory(settingsObj, 'חומרים – עלויות ועבודה');
    return Number(findItemValueInCategory(workCategory, 'מחיר עבודה לשעה') || 0);
}

function getPricingConstantsTotal() {
    const settingsObj = getSettingsObject();
    if (!settingsObj?.categories) return 0;
    
    let total = 0;
    
    // חישוב סכום מכל הקטגוריות חוץ מ"עמלות"
    settingsObj.categories.forEach(category => {
        if (category.name === 'עמלות') return; // דילוג על קטגוריית העמלות
        
        // חישוב סכום מהפריטים של הקטגוריה
        if (Array.isArray(category.items)) {
            category.items.forEach(item => {
                const value = Number(item.value || 0);
                if (!isNaN(value)) total += value;
            });
        }
        
        // חישוב סכום מתת-קטגוריות
        if (Array.isArray(category.subcategories)) {
            category.subcategories.forEach(subcategory => {
                if (Array.isArray(subcategory.items)) {
                    subcategory.items.forEach(item => {
                        const value = Number(item.value || 0);
                        if (!isNaN(value)) total += value;
                    });
                }
            });
        }
    });
    
    console.log('getPricingConstantsTotal result:', total);
    return total;
}

// פונקציה לחישוב מכפלת כל העמלות (דינמית - כוללת כל העמלות בקטגוריה)
function getAllFeesMultiplier() {
    const settingsObj = getSettingsObject();
    const feesCategory = findCategory(settingsObj, 'עמלות');
    
    if (!feesCategory) {
        console.warn('לא נמצאה קטגוריית עמלות, משתמש בערכי ברירת מחדל');
        return 1.0;
    }
    
    let totalMultiplier = 1.0;
    const feeDetails = {};
    
    // עבור על כל הפריטים בקטגוריית עמלות
    if (feesCategory.items && Array.isArray(feesCategory.items)) {
        feesCategory.items.forEach(item => {
            if (item && item.name && item.value !== undefined) {
                let multiplier = Number(item.value) || 0;
                
                // אם הערך קטן מ-1, זה כנראה אחוז (כמו 0.18 למע"מ 18%)
                // אז נהפוך אותו למכפיל (1.18)
                if (multiplier > 0 && multiplier < 1) {
                    multiplier = 1 + multiplier;
                }
                
                // אם הערך גדול מ-1, זה כבר מכפיל (כמו 1.18)
                if (multiplier >= 1) {
                    totalMultiplier *= multiplier;
                    feeDetails[item.name] = multiplier;
                }
            }
        });
    }
    
    // עבור על תת-קטגוריות אם יש
    if (feesCategory.subcategories && Array.isArray(feesCategory.subcategories)) {
        feesCategory.subcategories.forEach(subcat => {
            if (subcat.items && Array.isArray(subcat.items)) {
                subcat.items.forEach(item => {
                    if (item && item.name && item.value !== undefined) {
                        let multiplier = Number(item.value) || 0;
                        
                        if (multiplier > 0 && multiplier < 1) {
                            multiplier = 1 + multiplier;
                        }
                        
                        if (multiplier >= 1) {
                            totalMultiplier *= multiplier;
                            feeDetails[`${subcat.name} - ${item.name}`] = multiplier;
                        }
                    }
                });
            }
        });
    }
    
    console.log('🧮 Dynamic fees calculation:', {
        feesFound: Object.keys(feeDetails).length,
        feeDetails,
        totalMultiplier: totalMultiplier.toFixed(4)
    });
    
    return totalMultiplier;
}

// פונקציה לבדיקת כל העמלות הקיימות
function testAllFees() {
    console.log('🧮 === בדיקת כל העמלות ===');
    const settingsObj = getSettingsObject();
    const feesCategory = findCategory(settingsObj, 'עמלות');
    
    if (!feesCategory) {
        console.log('❌ לא נמצאה קטגוריית עמלות');
        return;
    }
    
    console.log('📋 עמלות קיימות:');
    
    if (feesCategory.items && Array.isArray(feesCategory.items)) {
        feesCategory.items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name}: ${item.value}`);
        });
    }
    
    if (feesCategory.subcategories && Array.isArray(feesCategory.subcategories)) {
        feesCategory.subcategories.forEach(subcat => {
            console.log(`📁 תת-קטגוריה: ${subcat.name}`);
            if (subcat.items && Array.isArray(subcat.items)) {
                subcat.items.forEach((item, index) => {
                    console.log(`    ${index + 1}. ${item.name}: ${item.value}`);
                });
            }
        });
    }
    
    const totalMultiplier = getAllFeesMultiplier();
    console.log(`🎯 מכפלת כל העמלות: ${totalMultiplier.toFixed(4)}`);
}

// פונקציה לקבלת סכום קבועי תמחור תכשיטים בלבד
function getJewelryPricingConstantsTotal() {
    const settingsObj = getSettingsObject();
    const jewelryCategory = findCategory(settingsObj, 'קבועי תמחור תכשיטים');
    if (!jewelryCategory) return 0;
    
    let total = 0;
    
    // חישוב סכום מהפריטים של הקטגוריה (כולל 'סה"כ אריזה' ו'משלוח בארץ')
    const categoryItems = Array.isArray(jewelryCategory.items) ? jewelryCategory.items : [];
    const hasPackagingTotalItem = categoryItems.some(it => (it?.name || '') === 'סה"כ אריזה');
    categoryItems.forEach(item => {
        const value = Number(item.value || 0);
        if (!isNaN(value)) total += value;
    });
    
    // חישוב סכום מתת-קטגוריות, תוך הימנעות מכפל: אם יש 'סה"כ אריזה' ברמת הקטגוריה,
    // לא נסכום את פרטי 'פירוט אריזה' שוב.
    if (Array.isArray(jewelryCategory.subcategories)) {
        jewelryCategory.subcategories.forEach(subcategory => {
            const isPackagingBreakdown = (subcategory?.name || '') === 'פירוט אריזה';
            if (hasPackagingTotalItem && isPackagingBreakdown) return;
            if (Array.isArray(subcategory.items)) {
                subcategory.items.forEach(item => {
                    const value = Number(item.value || 0);
                    if (!isNaN(value)) total += value;
                });
            }
        });
    }
    
    console.log('getJewelryPricingConstantsTotal result:', total, hasPackagingTotalItem ? '(using category-level packaging total)' : '');
    return total;
}

// פונקציה לבדיקת השינויים החדשים
function testNewPricingStructure() {
    console.log('=== בדיקת המבנה החדש ===');
    console.log('מע"מ:', getVatMultiplier());
    console.log('מקדם עמלת סליקה:', getClearingFeeMultiplier());
    console.log('מקדם עמלת הוצאות קבועות:', getFixedExpensesFeeMultiplier());
    console.log('🆕 מכפלת כל העמלות (דינמית):', getAllFeesMultiplier());
    console.log('מחיר עבודה לשעה:', getLaborHourRate());
    console.log('סכום קבועי תמחור תכשיטים:', getJewelryPricingConstantsTotal());
    
    // בדיקת הנתונים המחושבים החדשים
    const settingsObj = getSettingsObject();
    if (settingsObj?.categories) {
        const fixedCat = settingsObj.categories.find(cat => cat.name === 'הוצאות קבועות');
        if (fixedCat) {
            const totalItem = fixedCat.items?.find(item => item.name === 'סה"כ הוצאות קבועות');
            console.log('סה"כ הוצאות קבועות (מחושב):', totalItem?.value || 0);
        }
        
        const pricingCat = settingsObj.categories.find(cat => cat.name === 'קבועי תמחור תכשיטים');
        if (pricingCat) {
            const packagingItem = pricingCat.items?.find(item => item.name === 'סה"כ אריזה');
            console.log('סה"כ אריזה (מחושב):', packagingItem?.value || 0);
        }
    }
    console.log('=== סיום בדיקה ===');
}

// הפעלת הבדיקה כשהעמוד נטען
window.addEventListener('load', () => {
    setTimeout(() => {
        testNewPricingStructure();
        // בדיקה נוספת של השיפורים החדשים
        console.log('=== בדיקת שיפורי התמחור החדשים ===');
        const jewelryTotal = getJewelryPricingConstantsTotal();
        const allFees = getAllFeesMultiplier();
        console.log('סכום קבועי תמחור תכשיטים:', jewelryTotal);
        console.log('מכפלת כל העמלות:', allFees);
        console.log('שיפורי התמחור הושלמו בהצלחה!');
        console.log('שלבי התמחור החדשים:');
        console.log('שלב ב\': הוצאות חומרים + תוספות + קבועי תמחור תכשיטים');
        console.log('שלב ד\': הוצאות ועבודה × מכפלת כל העמלות');
        console.log('=== סיום בדיקה נוספת ===');
    }, 1000);
});

function readAdditionsSum() {
    const container = document.getElementById('additionsList');
    if (!container) return 0;
    let sum = 0;
    container.querySelectorAll('input.addition-price').forEach(inp => {
        const val = Number(inp.value || 0);
        if (!isNaN(val)) sum += val;
    });
    return sum;
}

function updatePricing() {
    const material = document.getElementById('material')?.value || '';
    const weight = parseFloat(document.getElementById('weight')?.value) || 0;

    // Debug logging
    console.log('updatePricing called:', { material, weight });
    
    // Step A: הוצאות חומרים = סוג חומר × משקל
    const pricePerGram = getMaterialPricePerGram(material);
    const materialCost = pricePerGram * weight;
    
    console.log('Material calculation:', { pricePerGram, materialCost });
    const additionsSum = readAdditionsSum();
    const additionsSumEl = document.getElementById('additionsSum');
    if (additionsSumEl) additionsSumEl.innerHTML = formatILS(additionsSum);

    // Step B: הוצאות כללי = הוצאות חומרים + תוספות + קבועי תמחור תכשיטים
    const jewelryPricingConstants = getJewelryPricingConstantsTotal();
    console.log('General expenses calculation:', { 
        materialCost, 
        additionsSum, 
        jewelryPricingConstants,
        note: 'קבועי תמחור תכשיטים כוללים: אריזה, משלוח וכל הקבועים מהקטגוריה'
    });
    const generalExpenses = materialCost + additionsSum + jewelryPricingConstants;

    // Step C: הוצאות ועבודה = הוצאות כללי + (זמן עבודה × שעת עבודה) + (שעות נוספות × שעת עבודה)
    const laborTime = getLaborTimeForMaterial(material);
    const additionalHours = parseFloat(document.getElementById('additionalWorkHours')?.value || '0') || 0;
    const totalLaborTime = laborTime + additionalHours;
    const laborHourRate = getLaborHourRate();
    const laborCost = totalLaborTime * laborHourRate;
    console.log('Labor calculation:', { 
        laborTime, 
        additionalHours,
        totalLaborTime,
        laborHourRate, 
        laborCost 
    });
    const workAndExpenses = generalExpenses + laborCost;

    // Step D: הוצאות סופי = הוצאות ועבודה × מכפלת כל העמלות
    const allFeesMultiplier = getAllFeesMultiplier();
    const finalExpenses = workAndExpenses * allFeesMultiplier;
    console.log('Final expenses calculation:', { 
        workAndExpenses, 
        allFeesMultiplier, 
        finalExpenses 
    });

    // Step E: מחיר מחושב סופי = הוצאות סופי × מכפלת רווח
    const profitMult = getProfitMultiplier(material);
    const recommendedPrice = finalExpenses * profitMult;
    console.log('Final price calculation:', { 
        finalExpenses, 
        profitMult, 
        recommendedPrice 
    });

    // Write to DOM
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = formatILS(val); };
    setText('materialCost', materialCost);
    setText('generalExpenses', generalExpenses);
    setText('workAndExpenses', workAndExpenses);
    setText('finalExpenses', finalExpenses);
    setText('recommendedPrice', recommendedPrice);

    syncSitePriceDefault(recommendedPrice);
    // Update recommended profit display
    updateProfitDisplays({ finalExpenses, recommendedPrice });
    calculateDiscount();
}

function calculateDiscount() {
    const sitePrice = parseFloat(document.getElementById('sitePriceInput')?.value || '0') || 0;
    const discount = parseFloat(document.getElementById('discountPercent')?.value || '0') || 0;
    const discountedPrice = sitePrice * (1 - discount / 100);
    
    // Get final expenses - clean the text by removing all HTML tags and symbols
    const finalExpensesText = document.getElementById('finalExpenses')?.innerHTML || '0';
    const finalExpenses = parseFloat(finalExpensesText.replace(/<[^>]*>/g, '').replace(/[^\d.-]/g, '')) || 0;

    const discountedPriceEl = document.getElementById('discountedPrice');
    if (discountedPriceEl) discountedPriceEl.innerHTML = formatILS(discountedPrice);

    // Profit vs site price (₪ and %)
    const siteProfitMoney = sitePrice - finalExpenses;
    const siteProfitPercent = finalExpenses > 0 ? (siteProfitMoney / finalExpenses) * 100 : 0;
    const siteProfitMoneyEl = document.getElementById('siteProfitMoney');
    const siteProfitPercentEl = document.getElementById('siteProfitPercent');
    if (siteProfitMoneyEl) siteProfitMoneyEl.innerHTML = formatILS(siteProfitMoney);
    if (siteProfitPercentEl) siteProfitPercentEl.textContent = `${siteProfitPercent.toFixed(2)}%`;

    // Discounted site price profit (for middle section calculator if exists)
    const discountedProfitEl = document.getElementById('discountedProfit');
    if (discountedProfitEl) discountedProfitEl.innerHTML = formatILS(discountedPrice - finalExpenses);
}

function updateProfitDisplays({ finalExpenses, recommendedPrice }) {
    const money = recommendedPrice - finalExpenses;
    const percent = finalExpenses > 0 ? (money / finalExpenses) * 100 : 0;
    const moneyEl = document.getElementById('recommendedProfitMoney');
    const percentEl = document.getElementById('recommendedProfitPercent');
    if (moneyEl) moneyEl.innerHTML = formatILS(money);
    if (percentEl) percentEl.textContent = `${percent.toFixed(2)}%`;
}

// Dynamic additions UI
function addAdditionRow() {
    const list = document.getElementById('additionsList');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'row addition-row';
    row.style.gap = '8px';
    row.style.marginBottom = '4px';
    row.innerHTML = `
      <select class="addition-type" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <option value="">בחר סוג תוספת...</option>
        <option value="עגילים">עגילים</option>
        <option value="שרשרת">שרשרת</option>
        <option value="ציפוי">ציפוי</option>
        <option value="אבנים">אבנים</option>
        <option value="שיבוץ">שיבוץ</option>
        <option value="אחר">אחר</option>
      </select>
      <input type="text" class="addition-name-other" placeholder="פרט..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; display: none;" />
      <input type="number" class="addition-price" step="0.01" placeholder="מחיר" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
      <button type="button" class="btn-small" aria-label="remove" title="הסר">🗑️</button>
    `;
    
    const typeSelect = row.querySelector('.addition-type');
    const otherInput = row.querySelector('.addition-name-other');
    const priceInp = row.querySelector('.addition-price');
    const removeBtn = row.querySelector('button');
    
    // Show/hide "other" text field based on selection
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'אחר') {
            otherInput.style.display = 'block';
            otherInput.focus();
        } else {
            otherInput.style.display = 'none';
            otherInput.value = '';
        }
        updatePricing();
    });
    
    otherInput.addEventListener('input', updatePricing);
    priceInp.addEventListener('input', updatePricing);
    priceInp.addEventListener('change', updatePricing);
    removeBtn.addEventListener('click', () => { row.remove(); updatePricing(); });
    
    list.appendChild(row);
    
    // Trigger update immediately to show the new row
    updatePricing();
}

function addToProducts() {
    return App.Managers.productManager.addToProducts();
}

async function loadProducts() {
    await App.Managers.productManager.loadProducts();
}

function showAddProductModal() {
    return App.Managers.productManager.showAddProductModal();
}

function addNewProduct(e) {
    return App.Managers.productManager.addNewProduct(e);
}

function showEditProductModal(id) {
    return App.Managers.productManager.showEditProductModal(id);
}

function saveEditedProduct(e) {
    if (e) e.preventDefault();
    return App.Managers.productManager.saveEditedProduct(e);
}

// Click handler for edit product button (avoids form submit issues)
async function saveEditedProductClick() {
    console.log('🔘 saveEditedProductClick called');
    await App.Managers.productManager.saveEditedProductDirect();
}

function deleteProduct(id) {
    return App.Managers.productManager.deleteProduct(id);
}

// Orders Functions
async function loadOrders() {
    await App.Managers.orderManager.loadOrders();
}

// Utility function to fix all decimal IDs in products
function fixAllProductIds() {
    if (window.App && App.Managers && App.Managers.productManager) {
        const repo = window.App.Repositories.ProductRepository;
        let products = repo.getAll();
        let fixedCount = 0;
        
        products.forEach(product => {
            if (product.id !== Math.floor(product.id)) {
                console.log(`Fixing ID: ${product.id} -> ${Math.floor(product.id)} for "${product.name}"`);
                product.id = Math.floor(product.id);
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            repo.saveAll(products);
            console.log(`✅ Fixed ${fixedCount} decimal IDs in products database`);
            // Reload the products display
            App.Managers.productManager.loadProducts();
        } else {
            console.log('✅ All product IDs are already integers - no fixes needed');
        }
        
        return fixedCount;
    } else {
        console.error('Product manager not available');
        return 0;
    }
}

function showAddOrderModal() {
    return App.Managers.orderManager.showAddOrderModal();
}

async function addOrder(e) {
    if (e) e.preventDefault();
    await App.Managers.orderManager.addOrder(e);
}

// Click handler for add order button (avoids form submit issues)
async function addOrderClick() {
    console.log('🔘 addOrderClick called');
    await App.Managers.orderManager.addOrderDirect();
}

async function deleteOrder(id) {
    await App.Managers.orderManager.deleteOrder(id);
}

async function cycleOrderStatus(id) {
    await App.Managers.orderManager.cycleOrderStatus(id);
}

function showOrderDetails(id) {
    return App.Managers.orderManager.showOrderDetails(id);
}

async function toggleReceiptStatus(id) {
    await App.Managers.orderManager.toggleReceiptStatus(id);
}

function showEditOrderModal(id) {
    return App.Managers.orderManager.showEditOrderModal(id);
}

async function saveEditedOrder(event) {
    event.preventDefault();
    await App.Managers.orderManager.saveEditedOrder(event);
}

function toggleCompletedOrders() {
    return App.Managers.orderManager.toggleCompletedOrders();
}

function restoreOrder(id) {
    return App.Managers.orderManager.restoreOrder(id);
}

// Modal Functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Utility Functions
function setCurrentDate(elementId = 'expenseDate') {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    document.getElementById(elementId).value = `${year}-${month}-${day}`;
}

function toggleRecurringOptions() {
    const type = document.getElementById('expenseType').value;
    const recurringGroup = document.getElementById('isRecurring').parentElement;
    if (type === 'expense') {
        recurringGroup.style.display = 'block';
    } else {
        recurringGroup.style.display = 'none';
        document.getElementById('isRecurring').checked = false;
        toggleRecurringMonths();
    }
}

function toggleRecurringMonths() {
    const isRecurring = document.getElementById('isRecurring').checked;
    document.getElementById('recurringMonths').style.display = isRecurring ? 'block' : 'none';
}

// Toggle functions for collapsible sections
function toggleCollectionsManager() {
    const content = document.getElementById('collectionsManagerContent');
    const icon = document.getElementById('collectionsToggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

function togglePricingCalculator() {
    const content = document.getElementById('pricingCalculatorContent');
    const icon = document.getElementById('pricingToggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Global functions for edit modal
// Pass updateSitePrice=true to recalculate and update the site price field
function updateEditPricing(updateSitePrice = false) {
    if (window.App && App.Managers && App.Managers.productManager) {
        App.Managers.productManager.updateEditPricing(updateSitePrice);
    }
}

function addEditAdditionRow() {
    if (window.App && App.Managers && App.Managers.productManager) {
        App.Managers.productManager.addEditAdditionRow();
    }
}

// Make test functions globally available
window.testAllFees = testAllFees;
