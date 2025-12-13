// ProductManager (Phase 2): move product logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class ProductManager {
  async addToProducts() {
    // Show button feedback
    const button = document.querySelector('button[onclick="addToProducts()"]');
    const originalText = button ? button.textContent : '';
    if (button) {
      button.textContent = '⏳ שומר...';
      button.disabled = true;
      button.style.backgroundColor = '#6c757d';
    }
    
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = await repo.getAll();
    // Gather additions for persistence (optional, lightweight)
    const additions = Array.from(document.querySelectorAll('#additionsList .row')).map(r => {
      const name = r.querySelector('.addition-name')?.value?.trim() || '';
      const price = parseFloat(r.querySelector('.addition-price')?.value || '0') || 0;
      return { name, price };
    }).filter(a => a.name || a.price);

    // Read selected collections from hidden input populated by the floating dropdown
    let collections = ['כללי'];
    try {
      const hidden = document.getElementById('collectionsSelectedHidden');
      if (hidden && hidden.value) {
        const arr = JSON.parse(hidden.value);
        if (Array.isArray(arr) && arr.length) collections = arr.filter(Boolean);
      } else {
        // Fallback: try reading from floating panel or legacy container
        const selected = [];
        document.querySelectorAll('#collectionsPanelFloating input.collection-checkbox:checked, #collectionsChecklist input.collection-checkbox:checked')
          .forEach(cb => selected.push(cb.value));
        if (selected.length) collections = selected.filter(Boolean);
      }
    } catch(_) {
      // keep default 'כללי'
    }

    const material = document.getElementById('material').value;
    const product = {
      id: Date.now(),
      type: document.getElementById('productType').value,
      name: (document.getElementById('productName')?.value || 'דגם חדש').trim(),
      material: material,
      // According to the model, cost base = Final Expenses (after VAT, before profit multiplier)
      cost: parseFloat((document.getElementById('finalExpenses')?.textContent || '0').replace('₪', '')) || 0,
      price: parseFloat(document.getElementById('recommendedPrice').textContent.replace('₪', '')),
      sitePrice: parseFloat(document.getElementById('sitePriceInput')?.value || '0') || 0,
      weight: parseFloat(document.getElementById('weight')?.value || '0') || 0,
      laborTime: this.getLaborTimeForMaterial(material), // Store labor time at creation
      additions,
      collections
    };
    products.push(product);
    await repo.saveAll(products);
    await this.loadProducts();
    
    // Restore button and show success feedback
    if (button) {
      button.textContent = '✅ נשמר!';
      button.style.backgroundColor = '#28a745';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.backgroundColor = '';
      }, 2000);
    }
  }

  async loadProducts() {
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = await repo.getAll();
    
    // Fix any decimal IDs in existing products
    this.fixDecimalIds();
    
    const tbody = document.getElementById('productsTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    // Update collections filter dropdown
    this.updateCollectionsFilter();
    
    // Apply filters
    const typeFilter = document.getElementById('filterType')?.value || '';
    const materialFilter = document.getElementById('filterMaterial')?.value || '';
    const nameFilter = (document.getElementById('filterName')?.value || '').trim();
    const collectionFilter = (document.getElementById('filterCollection')?.value || '').trim();
    const discountPercent = parseFloat(document.getElementById('listDiscountPercent')?.value || '0') || 0;

    const filtered = products.filter(p => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (materialFilter) {
        if (materialFilter === 'exclude_14k') {
          // Exclude 14K gold products
          if (p.material === 'זהב 14K') return false;
        } else {
          // Regular material filter
          if (p.material !== materialFilter) return false;
        }
      }
      if (nameFilter && !(p.name || '').includes(nameFilter)) return false;
      if (collectionFilter) {
        const cols = Array.isArray(p.collections) ? p.collections : [];
        const match = cols.some(c => (c || '').includes(collectionFilter));
        if (!match) return false;
      }
      return true;
    });

    filtered.forEach((p, index) => {
      const row = tbody.insertRow();
      
      // Calculate collections text
      const collectionsText = Array.isArray(p.collections) ? p.collections.join(', ') : 'כללי';
      
      // Calculate pricing with discount using dynamic cost calculation
      const currentCost = this.calculateDynamicCost(p); // Use dynamic cost based on current settings
      const recommendedMinPrice = currentCost * 1.3; // Fixed 30% profit markup
      const originalPrice = p.sitePrice || p.price || 0;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      const profitAmount = discountedPrice - currentCost;
      const profitPercent = currentCost > 0 ? (profitAmount / currentCost) * 100 : 0;
      
      // Check if profit is below 30% for warning styling
      const isLowProfit = profitPercent < 30;
      
      // Apply warning styling to the entire row if profit is below 30%
      if (isLowProfit) {
        row.style.backgroundColor = '#ffebee';
        row.style.borderLeft = '4px solid #f44336';
        row.classList.add('low-profit-warning');
      }
      
      row.innerHTML = `
            <td class="row-number">${index + 1}</td>
            <td>${p.type || ''}</td>
            <td>${p.name || ''} ${isLowProfit ? '<span style="color: #f44336; font-weight: bold;">⚠️</span>' : ''}</td>
            <td>${p.material || ''}</td>
            <td>${collectionsText}</td>
            <td title="עלות מחושבת דינמית על בסיס ההגדרות הנוכחיות">₪${currentCost.toFixed(2)}</td>
            <td title="מחיר מינימלי לרווח של 30%" style="background-color: #e8f5e8; font-weight: bold;">₪${recommendedMinPrice.toFixed(2)}</td>
            <td class="site-price-cell">
              <div style="display: flex; align-items: center; gap: 3px;">
                <input type="number" 
                       class="inline-price-input" 
                       data-product-id="${p.id}" 
                       data-original-price="${originalPrice.toFixed(0)}"
                       value="${originalPrice.toFixed(0)}" 
                       min="0" 
                       step="1"
                       style="width: 70px; padding: 4px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; text-align: center;">
                <button class="quick-save-btn" data-product-id="${p.id}" title="שמור" style="padding: 3px 6px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; display: none;">✓</button>
                <button class="quick-cancel-btn" data-product-id="${p.id}" data-original="${originalPrice.toFixed(0)}" title="בטל" style="padding: 3px 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; display: none;">✗</button>
              </div>
            </td>
            <td>₪${discountedPrice.toFixed(2)}</td>
            <td style="color: ${profitAmount >= 0 ? 'green' : 'red'}">₪${profitAmount.toFixed(2)}</td>
            <td style="color: ${isLowProfit ? '#f44336' : (profitPercent >= 0 ? 'green' : 'red')}; font-weight: ${isLowProfit ? 'bold' : 'normal'}">${profitPercent.toFixed(1)}% ${isLowProfit ? '⚠️' : ''}</td>
            <td class="action-buttons">
                <button class="btn-small btn-warning" onclick="showEditProductModal(${p.id})">ערוך</button>
                <button class="btn-small btn-danger" onclick="deleteProduct(${p.id})">מחק</button>
            </td>
        `;
    });
    
    // Render mobile cards view
    this.renderProductCards(filtered);
    
    // Set up click handlers for editable price cells
    this.setupPriceEditHandlers();
  }

  // Mobile compact list view with expandable details
  renderProductCards(products) {
    const container = document.getElementById('productCardsContainer');
    if (!container) return;
    
    const discountPercent = parseFloat(document.getElementById('listDiscountPercent')?.value || '0') || 0;
    const hasDiscount = discountPercent > 0;
    
    container.innerHTML = products.map((p, index) => {
      const collectionsText = Array.isArray(p.collections) ? p.collections.join(', ') : 'כללי';
      const currentCost = this.calculateDynamicCost(p);
      const originalPrice = p.sitePrice || p.price || 0;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      const profitAmount = discountedPrice - currentCost;
      const profitPercent = currentCost > 0 ? (profitAmount / currentCost) * 100 : 0;
      const isLowProfit = profitPercent < 30;
      
      return `
        <div class="product-item ${isLowProfit ? 'low-profit' : ''}" data-product-id="${p.id}">
          <div class="product-item-summary" onclick="toggleProductExpand(this)">
            <div class="product-item-main">
              <div class="product-item-name">${p.name || 'ללא שם'} ${isLowProfit ? '⚠️' : ''}</div>
              <div class="product-item-meta">
                <span class="type">${p.type || '-'}</span> · <span class="material">${p.material || '-'}</span>
              </div>
            </div>
            <div class="product-item-stats">
              <div class="product-item-price">₪${originalPrice.toFixed(0)}${hasDiscount ? ` → <span style="color:#28a745;font-weight:bold;">₪${discountedPrice.toFixed(0)}</span>` : ''}</div>
              <div class="product-item-profit ${profitAmount >= 0 ? 'positive' : 'negative'}">
                ₪${profitAmount.toFixed(0)} (${profitPercent.toFixed(0)}%)
              </div>
            </div>
            <div class="product-item-toggle">▼</div>
          </div>
          
          <div class="product-item-details">
            <div class="product-detail-row">
              <span class="product-detail-label">קולקציה:</span>
              <span class="product-detail-value">${collectionsText}</span>
            </div>
            <div class="product-detail-row">
              <span class="product-detail-label">עלות:</span>
              <span class="product-detail-value">₪${currentCost.toFixed(0)}</span>
            </div>
            <div class="product-detail-row" onclick="event.stopPropagation()">
              <span class="product-detail-label">💰 מחיר באתר:</span>
              <div class="mobile-price-edit">
                <input type="number" 
                       class="mobile-price-input" 
                       data-product-id="${p.id}" 
                       data-original-price="${originalPrice.toFixed(0)}"
                       value="${originalPrice.toFixed(0)}" 
                       min="0" 
                       onclick="event.stopPropagation()"
                       onchange="saveMobilePrice(this)">
              </div>
            </div>
            <div class="product-item-actions">
              <button class="btn-small btn-warning" onclick="event.stopPropagation(); showEditProductModal(${p.id})">✏️ עריכה מלאה</button>
              <button class="btn-small btn-danger" onclick="event.stopPropagation(); deleteProduct(${p.id})">🗑️ מחיקה</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  setupPriceEditHandlers() {
    // Handle save buttons
    document.querySelectorAll('.quick-save-btn').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        const input = document.querySelector(`.inline-price-input[data-product-id="${productId}"]`);
        if (input) {
          await this.saveInlinePrice(productId, parseFloat(input.dataset.originalPrice), parseFloat(input.value));
        }
      };
    });
    
    // Handle cancel buttons
    document.querySelectorAll('.quick-cancel-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const productId = btn.dataset.productId;
        const originalPrice = btn.dataset.original;
        const input = document.querySelector(`.inline-price-input[data-product-id="${productId}"]`);
        const saveBtn = document.querySelector(`.quick-save-btn[data-product-id="${productId}"]`);
        if (input) {
          input.value = originalPrice;
        }
        // Hide both buttons
        btn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
      };
    });
    
    // Handle input changes and Enter key
    document.querySelectorAll('.inline-price-input').forEach(input => {
      const productId = input.dataset.productId;
      const saveBtn = document.querySelector(`.quick-save-btn[data-product-id="${productId}"]`);
      const cancelBtn = document.querySelector(`.quick-cancel-btn[data-product-id="${productId}"]`);
      
      // Show/hide buttons on input change
      input.oninput = () => {
        const hasChanged = input.value !== input.dataset.originalPrice;
        if (saveBtn) saveBtn.style.display = hasChanged ? 'inline-block' : 'none';
        if (cancelBtn) cancelBtn.style.display = hasChanged ? 'inline-block' : 'none';
      };
      
      input.onkeydown = async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const productId = parseInt(input.dataset.productId);
          await this.saveInlinePrice(productId, parseFloat(input.dataset.originalPrice), parseFloat(input.value));
        } else if (e.key === 'Escape') {
          e.preventDefault();
          input.value = input.dataset.originalPrice;
          if (saveBtn) saveBtn.style.display = 'none';
          if (cancelBtn) cancelBtn.style.display = 'none';
        }
      };
    });
  }
  
  async saveInlinePrice(productId, originalPrice, newPrice) {
    if (newPrice === originalPrice) return; // No change
    
    const repo = window.App.Repositories.ProductRepository;
    products = await repo.getAll();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      alert('מוצר לא נמצא');
      return;
    }
    
    // Save directly
    product.sitePrice = newPrice;
    await repo.saveAll(products);
    console.log('✅ Price updated:', product.name, '→', newPrice);
    
    // Show notification and reload
    this.showPriceUpdateNotification(product.name, originalPrice, newPrice);
    await this.loadProducts();
  }

  updateCollectionsFilter() {
    const filterSelect = document.getElementById('filterCollection');
    if (!filterSelect) return;
    
    // Get all unique collections from products
    const allCollections = new Set();
    products.forEach(p => {
      if (p.collections && Array.isArray(p.collections)) {
        p.collections.forEach(c => allCollections.add(c));
      }
    });
    
    // Clear and rebuild options
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">הכל</option>';
    
    Array.from(allCollections).sort().forEach(collection => {
      const option = document.createElement('option');
      option.value = collection;
      option.textContent = collection;
      filterSelect.appendChild(option);
    });
    
    // Restore selection if still valid
    if (currentValue && allCollections.has(currentValue)) {
      filterSelect.value = currentValue;
    }
  }

  showAddProductModal() {
    openModal('addProductModal');
  }

  addNewProduct(e) {
    e.preventDefault();
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = repo.getAll();
    const newProduct = {
      id: Date.now(),
      type: document.getElementById('newProductType').value,
      name: document.getElementById('newProductName').value,
      material: document.getElementById('newProductMaterial').value,
      cost: parseFloat(document.getElementById('newProductCost').value),
      price: parseFloat(document.getElementById('newProductPrice').value),
      sitePrice: parseFloat(document.getElementById('newProductSitePrice').value)
    };
    products.push(newProduct);
    repo.saveAll(products);
    closeModal('addProductModal');
    this.loadProducts();
  }

  async showEditProductModal(id) {
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = await repo.getAll();
    
    // Fix any decimal IDs in existing products
    await this.fixDecimalIds();
    
    // Convert id to number to ensure proper comparison
    const numericId = parseInt(id);
    const product = products.find(p => p.id === numericId);
    if (product) {
      document.getElementById('editProductId').value = product.id;
      document.getElementById('editProductType').value = product.type;
      document.getElementById('editProductName').value = product.name;
      document.getElementById('editProductMaterial').value = product.material;
      document.getElementById('editProductWeight').value = product.weight || 0;
      document.getElementById('editProductSitePrice').value = product.sitePrice;
      document.getElementById('editAdditionalWorkHours').value = product.additionalWorkHours || 0;
      
      // Setup collections checklist for edit
      this.renderEditCollectionsChecklist(product.collections || ['כללי']);
      
      // Setup additions for edit
      this.renderEditAdditions(product.additions || []);
      
      // Calculate and show recommended price
      this.updateEditPricing();
      
      openModal('editProductModal');
    } else {
      console.error('Product not found with ID:', id, 'Converted to:', numericId);
      alert('שגיאה: לא נמצא מוצר עם המזהה המבוקש. אנא רענן את הדף ונסה שוב.');
    }
  }

  // Direct save without event (called from button click)
  async saveEditedProductDirect() {
    console.log('🔄 saveEditedProductDirect called');
    
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = await repo.getAll();
    console.log('📦 Loaded', products.length, 'products from repo');
    
    const id = parseInt(document.getElementById('editProductId').value);
    console.log('🔍 Looking for product with ID:', id);
    
    const index = products.findIndex(p => p.id === id);
    console.log('📍 Found at index:', index);
    
    if (index > -1) {
      // Gather additions
      const additions = Array.from(document.querySelectorAll('#editAdditionsList .row')).map(r => {
        const name = r.querySelector('.addition-name')?.value?.trim() || '';
        const price = parseFloat(r.querySelector('.addition-price')?.value || '0') || 0;
        return { name, price };
      }).filter(a => a.name || a.price);

      // Read selected collections
      let collections = ['כללי'];
      try {
        const selected = [];
        document.querySelectorAll('#editCollectionsChecklist input.collection-checkbox:checked')
          .forEach(cb => selected.push(cb.value));
        if (selected.length) collections = selected.filter(Boolean);
      } catch(_) {}

      const newMaterial = document.getElementById('editProductMaterial').value;
      const newWeight = parseFloat(document.getElementById('editProductWeight').value) || 0;
      const newSitePrice = parseFloat(document.getElementById('editProductSitePrice').value) || 0;
      const newName = document.getElementById('editProductName').value;
      const newType = document.getElementById('editProductType').value;
      
      // Build updated product object
      const additionalWorkHours = parseFloat(document.getElementById('editAdditionalWorkHours').value) || 0;
      const updatedProduct = {
        ...products[index],
        id: id, // Ensure ID is preserved
        type: newType,
        name: newName,
        material: newMaterial,
        weight: newWeight,
        sitePrice: newSitePrice,
        laborTime: this.getLaborTimeForMaterial(newMaterial),
        additionalWorkHours: additionalWorkHours,
        additions,
        collections,
        updatedAt: new Date().toISOString()
      };
      
      // Remove MongoDB _id to avoid conflicts
      delete updatedProduct._id;
      
      console.log('💾 Saving product:', updatedProduct);
      
      try {
        await repo.update(updatedProduct);
        console.log('✅ Product saved to repository');
        
        // Update local array
        products[index] = updatedProduct;
        
        // Close modal
        closeModal('editProductModal');
        
        // Reload products to show updated data
        await this.loadProducts();
        
        console.log('✅ Product updated successfully:', updatedProduct.name);
        
        // Stay on products tab
        if (typeof switchTab === 'function') {
          switchTab('pricing');
        }
        
      } catch (err) {
        console.error('❌ Failed to save product:', err);
        alert('שגיאה בשמירת המוצר. אנא נסה שוב.');
      }
    } else {
      console.error('❌ Product not found for update, ID:', id);
      alert('שגיאה: לא נמצא מוצר לעדכון. אנא רענן את הדף ונסה שוב.');
    }
  }

  async saveEditedProduct(e) {
    if (e) e.preventDefault();
    console.log('🔄 saveEditedProduct called');
    
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = await repo.getAll();
    console.log('📦 Loaded', products.length, 'products from repo');
    const id = parseInt(document.getElementById('editProductId').value);
    console.log('🔍 Looking for product with ID:', id);
    const index = products.findIndex(p => p.id === id);
    console.log('📍 Found at index:', index);
    if (index > -1) {
      // Gather additions
      const additions = Array.from(document.querySelectorAll('#editAdditionsList .row')).map(r => {
        const name = r.querySelector('.addition-name')?.value?.trim() || '';
        const price = parseFloat(r.querySelector('.addition-price')?.value || '0') || 0;
        return { name, price };
      }).filter(a => a.name || a.price);

      // Read selected collections
      let collections = ['כללי'];
      try {
        const selected = [];
        document.querySelectorAll('#editCollectionsChecklist input.collection-checkbox:checked')
          .forEach(cb => selected.push(cb.value));
        if (selected.length) collections = selected.filter(Boolean);
      } catch(_) {
        // keep default 'כללי'
      }

      // Calculate final expenses (cost) based on current inputs
      const recommendedPriceText = document.getElementById('editRecommendedPrice')?.textContent || '₪0';
      const recommendedPrice = parseFloat(recommendedPriceText.replace('₪', '')) || 0;
      
      // Calculate cost from recommended price (reverse calculation)
      const material = document.getElementById('editProductMaterial').value;
      const profitMult = this.getProfitMultiplier(material);
      const finalExpenses = profitMult > 0 ? recommendedPrice / profitMult : 0;

      const newMaterial = document.getElementById('editProductMaterial').value;
      
      // Build updated product object
      const updatedProduct = {
        ...products[index],
        type: document.getElementById('editProductType').value,
        name: document.getElementById('editProductName').value,
        material: newMaterial,
        weight: parseFloat(document.getElementById('editProductWeight').value) || 0,
        cost: finalExpenses,
        price: recommendedPrice,
        sitePrice: parseFloat(document.getElementById('editProductSitePrice').value),
        laborTime: this.getLaborTimeForMaterial(newMaterial),
        additions,
        collections,
        updatedAt: new Date().toISOString()
      };
      
      // Remove MongoDB _id to avoid conflicts
      delete updatedProduct._id;
      
      console.log('💾 Calling repo.update with:', updatedProduct);
      
      // Use update method instead of saveAll for single product edit
      try {
        await repo.update(updatedProduct);
        console.log('✅ repo.update completed');
      } catch (err) {
        console.error('❌ repo.update failed:', err);
      }
      
      // Update local array
      products[index] = updatedProduct;
      
      closeModal('editProductModal');
      await this.loadProducts();
      
      console.log('✅ Product updated successfully:', updatedProduct.name);
    } else {
      console.error('❌ Product not found for update, ID:', id);
      alert('שגיאה: לא נמצא מוצר לעדכון. אנא רענן את הדף ונסה שוב.');
    }
  }

  renderEditCollectionsChecklist(selectedCollections) {
    const container = document.getElementById('editCollectionsChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    const collections = getAllCollectionsSync(); // Use sync version for immediate rendering
    
    collections.forEach(name => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'collection-checkbox';
      checkbox.value = name;
      checkbox.checked = selectedCollections.includes(name);
      
      const span = document.createElement('span');
      span.textContent = name;
      span.style.marginLeft = '8px';
      
      label.appendChild(checkbox);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  renderEditAdditions(additions) {
    const container = document.getElementById('editAdditionsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    additions.forEach(addition => {
      this.addEditAdditionRow(addition.name, addition.price);
    });
  }

  addEditAdditionRow(name = '', price = 0) {
    const list = document.getElementById('editAdditionsList');
    if (!list) return;
    
    const row = document.createElement('div');
    row.className = 'row';
    row.style.gap = '8px';
    row.style.marginBottom = '4px';
    row.innerHTML = `
      <input type="text" class="addition-name" placeholder="שם התוספת" value="${name}" />
      <input type="number" class="addition-price" step="0.01" placeholder="מחיר" value="${price}" />
      <button type="button" class="btn-small" aria-label="remove" title="הסר">🗑️</button>
    `;
    
    const [nameInp, priceInp, removeBtn] = row.querySelectorAll('input,button');
    // Pass true to update site price when user changes additions
    priceInp.addEventListener('input', () => this.updateEditPricing(true));
    priceInp.addEventListener('change', () => this.updateEditPricing(true));
    removeBtn.addEventListener('click', () => { 
      row.remove(); 
      this.updateEditPricing(true); 
    });
    
    list.appendChild(row);
  }

  // updateSitePrice: if true, overwrite the site price input with calculated value
  // Default is false to preserve user's custom price
  updateEditPricing(updateSitePrice = false) {
    const material = document.getElementById('editProductMaterial')?.value || '';
    const weight = parseFloat(document.getElementById('editProductWeight')?.value) || 0;
    const sitePriceInput = document.getElementById('editProductSitePrice');

    if (!material || !weight) {
      document.getElementById('editRecommendedPrice').textContent = '₪0';
      // Don't overwrite site price - it may have a saved value
      return;
    }

    // Calculate recommended price using the same logic as main pricing
    const pricePerGram = this.getMaterialPricePerGram(material);
    const materialCost = pricePerGram * weight;
    
    // Sum additions
    let additionsSum = 0;
    document.querySelectorAll('#editAdditionsList input.addition-price').forEach(inp => {
      const val = Number(inp.value || 0);
      if (!isNaN(val)) additionsSum += val;
    });

    // Step B: Use full jewelry pricing constants total (avoids double counting packaging breakdown)
    const jewelryPricingConstants = window.getJewelryPricingConstantsTotal
      ? window.getJewelryPricingConstantsTotal()
      : (this.getPackagingTotal() + this.getDomesticShipping());
    const generalExpenses = materialCost + additionsSum + jewelryPricingConstants;

    const laborTime = this.getLaborTimeForMaterial(material);
    const additionalWorkHours = parseFloat(document.getElementById('editAdditionalWorkHours')?.value) || 0;
    const totalLaborTime = laborTime + additionalWorkHours;
    const laborCost = totalLaborTime * this.getLaborHourRate();
    const workAndExpenses = generalExpenses + laborCost;

    // Step D: Apply combined fees multiplier for consistency with main calculator
    const allFeesMultiplier = window.getAllFeesMultiplier
      ? window.getAllFeesMultiplier()
      : (this.getClearingFeeMultiplier() * this.getFixedExpensesFeeMultiplier() * this.getVatMultiplier());
    const finalExpenses = workAndExpenses * allFeesMultiplier;
    const profitMult = this.getProfitMultiplier(material);
    const recommendedPrice = finalExpenses * profitMult;

    // Update recommended price display
    document.getElementById('editRecommendedPrice').textContent = `₪${recommendedPrice.toFixed(2)}`;
    
    // Only update site price if explicitly requested (e.g., when user changes material/weight)
    // Do NOT update when initially opening the modal
    if (updateSitePrice && sitePriceInput) {
      sitePriceInput.value = recommendedPrice.toFixed(2);
    }
  }

  // Dynamic cost calculation based on current settings
  // Only recalculates components that should be dynamic for existing products
  calculateDynamicCost(product) {
    if (!product.material || !product.weight) {
      return product.cost || 0; // Fallback to stored cost if no material/weight data
    }

    try {
      // Step A: Material costs (DYNAMIC - current material prices)
      const pricePerGram = this.getMaterialPricePerGram(product.material);
      const materialCost = pricePerGram * product.weight;
      
      // Sum additions (STATIC - use stored additions from product)
      let additionsSum = 0;
      if (product.additions && Array.isArray(product.additions)) {
        additionsSum = product.additions.reduce((sum, addition) => {
          return sum + (parseFloat(addition.price) || 0);
        }, 0);
      }

      // Step B: Use jewelry pricing constants total (DYNAMIC - current constants)
      const jewelryPricingConstants = window.getJewelryPricingConstantsTotal
        ? window.getJewelryPricingConstantsTotal()
        : (this.getPackagingTotal() + this.getDomesticShipping());
      const generalExpenses = materialCost + additionsSum + jewelryPricingConstants;

      // Step C: Work and expenses (DYNAMIC - current labor rate AND current labor time from settings)
      const laborTime = this.getLaborTimeForMaterial(product.material); // Always use current settings
      const laborCost = laborTime * this.getLaborHourRate(); // Current labor rate
      const workAndExpenses = generalExpenses + laborCost;

      // Step D: Apply combined fees multiplier (DYNAMIC - current fees)
      const allFeesMultiplier = window.getAllFeesMultiplier
        ? window.getAllFeesMultiplier()
        : (this.getClearingFeeMultiplier() * this.getFixedExpensesFeeMultiplier() * this.getVatMultiplier());
      const finalExpenses = workAndExpenses * allFeesMultiplier;

      return finalExpenses;
    } catch (error) {
      console.warn('Error calculating dynamic cost for product:', product.name, error);
      return product.cost || 0; // Fallback to stored cost
    }
  }

  // Calculate dynamic recommended price based on current settings
  calculateDynamicPrice(product) {
    const dynamicCost = this.calculateDynamicCost(product);
    const profitMultiplier = this.getProfitMultiplier(product.material);
    return dynamicCost * profitMultiplier;
  }

  // Helper methods for pricing calculations
  getMaterialPricePerGram(material) {
    return window.getMaterialPricePerGram ? window.getMaterialPricePerGram(material) : 0;
  }
  
  getLaborTimeForMaterial(material) {
    return window.getLaborTimeForMaterial ? window.getLaborTimeForMaterial(material) : 0;
  }
  
  getProfitMultiplier(material) {
    return window.getProfitMultiplier ? window.getProfitMultiplier(material) : 1;
  }
  
  getPackagingTotal() {
    return window.getPackagingTotal ? window.getPackagingTotal() : 0;
  }
  
  getDomesticShipping() {
    return window.getDomesticShipping ? window.getDomesticShipping() : 0;
  }
  
  getLaborHourRate() {
    return window.getLaborHourRate ? window.getLaborHourRate() : 0;
  }
  
  getClearingFeeMultiplier() {
    return window.getClearingFeeMultiplier ? window.getClearingFeeMultiplier() : 1;
  }
  
  getFixedExpensesFeeMultiplier() {
    return window.getFixedExpensesFeeMultiplier ? window.getFixedExpensesFeeMultiplier() : 1;
  }
  
  getVatMultiplier() {
    return window.getVatMultiplier ? window.getVatMultiplier() : 1;
  }

  async deleteProduct(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      const repo = window.App.Repositories.ProductRepository;
      // Ensure latest state
      products = await repo.getAll();
      // Convert id to number to ensure proper comparison
      const numericId = parseInt(id);
      products = products.filter(p => p.id !== numericId);
      await repo.saveAll(products);
      await this.loadProducts();
    }
  }

  // Fix decimal IDs in existing products
  fixDecimalIds() {
    const repo = window.App.Repositories.ProductRepository;
    let needsUpdate = false;
    
    products.forEach(product => {
      // Check if ID is decimal (not an integer)
      if (product.id !== Math.floor(product.id)) {
        console.log(`Fixing decimal ID: ${product.id} -> ${Math.floor(product.id)} for product: ${product.name}`);
        product.id = Math.floor(product.id);
        needsUpdate = true;
      }
    });
    
    // Save updated products if any changes were made
    if (needsUpdate) {
      repo.saveAll(products);
      console.log('Fixed decimal IDs in products database');
    }
  }

  // Refresh products display when settings change
  // Only refresh if the changes affect existing product calculations
  refreshProductsAfterSettingsChange(changedCategories = []) {
    console.log('🔄 Checking if products need refresh after settings change...');
    console.log('📝 Changed categories:', changedCategories);
    
    // Categories that affect existing product costs:
    const affectingCategories = [
      'עמלות', // Fees (VAT, clearing fee, fixed expenses fee)
      'קבועי תמחור תכשיטים', // Jewelry pricing constants
      'חומרים – עלויות ועבודה', // Materials and labor (material prices, labor hour rate)
      'מכפילי רווח', // Profit multipliers
      'יחסי המרה' // Conversion ratios
    ];
    
    console.log('🎯 Categories that affect products:', affectingCategories);
    
    // Check if any of the changed categories affect product calculations
    const shouldRefresh = changedCategories.length === 0 || // If no specific categories provided, refresh anyway
                         changedCategories.some(category => {
                           const affects = affectingCategories.includes(category);
                           console.log(`📊 Category "${category}" affects products: ${affects}`);
                           return affects;
                         });
    
    console.log(`🚀 Should refresh products: ${shouldRefresh}`);
    
    if (shouldRefresh) {
      console.log('✅ Refreshing products display - changes affect product calculations');
      this.loadProducts();
    } else {
      console.log('⏭️ Skipping products refresh - changes do not affect existing products');
    }
  }

  // Quick price editing directly in the table
  startQuickPriceEdit(productId, currentPrice, cell) {
    // Prevent multiple edits
    if (cell.querySelector('input')) return;
    
    // Create edit container
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; gap: 5px;';
    
    // Create input
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'quick-price-input';
    input.value = currentPrice.toFixed(2);
    input.min = '0';
    input.step = '0.01';
    input.style.cssText = 'width: 80px; padding: 4px; border: 2px solid #667eea; border-radius: 4px; font-size: 14px;';
    input.onclick = (e) => e.stopPropagation();
    input.onkeydown = (e) => this.handleQuickPriceKeydown(e, productId, currentPrice);
    
    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓';
    saveBtn.style.cssText = 'padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;';
    saveBtn.onclick = (e) => { e.stopPropagation(); this.saveQuickPrice(productId, currentPrice); };
    
    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✗';
    cancelBtn.style.cssText = 'padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;';
    cancelBtn.onclick = (e) => { e.stopPropagation(); this.loadProducts(); };
    
    container.appendChild(input);
    container.appendChild(saveBtn);
    container.appendChild(cancelBtn);
    
    // Clear cell and add container
    cell.innerHTML = '';
    cell.appendChild(container);
    
    // Focus on input
    input.focus();
    input.select();
  }

  handleQuickPriceKeydown(event, productId, originalPrice) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveQuickPrice(productId, originalPrice);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.loadProducts(); // Reload to restore original state
    }
  }

  async saveQuickPrice(productId, originalPrice) {
    const input = document.querySelector('.quick-price-input');
    if (!input) return;
    
    const newPrice = parseFloat(input.value) || 0;
    
    // If no change, just reload
    if (newPrice === originalPrice) {
      await this.loadProducts();
      return;
    }
    
    // Find product
    const repo = window.App.Repositories.ProductRepository;
    products = await repo.getAll();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      alert('מוצר לא נמצא');
      await this.loadProducts();
      return;
    }
    
    // Save directly without confirmation for faster workflow
    product.sitePrice = newPrice;
    await repo.saveAll(products);
    console.log('✅ Price updated:', product.name, '→', newPrice);
    
    // Show success notification
    this.showPriceUpdateNotification(product.name, originalPrice, newPrice);
    
    // Reload products
    await this.loadProducts();
  }

  cancelQuickPriceEdit(cell, originalHTML) {
    cell.innerHTML = originalHTML;
  }

  showPriceUpdateNotification(productName, oldPrice, newPrice) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      direction: rtl;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
      <strong>✅ המחיר עודכן</strong><br>
      ${productName}: ₪${oldPrice.toFixed(2)} → ₪${newPrice.toFixed(2)}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

window.App.Managers.productManager = new ProductManager();

// Global function to refresh products when settings change
window.refreshProductsAfterSettingsChange = function(changedCategories = []) {
  if (window.App && window.App.Managers && window.App.Managers.productManager) {
    window.App.Managers.productManager.refreshProductsAfterSettingsChange(changedCategories);
  }
};
