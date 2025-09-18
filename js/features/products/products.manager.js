// ProductManager (Phase 2): move product logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class ProductManager {
  addToProducts() {
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
    products = repo.getAll();
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

    const product = {
      id: Date.now(),
      type: document.getElementById('productType').value,
      name: (document.getElementById('productName')?.value || 'דגם חדש').trim(),
      material: document.getElementById('material').value,
      // According to the model, cost base = Final Expenses (after VAT, before profit multiplier)
      cost: parseFloat((document.getElementById('finalExpenses')?.textContent || '0').replace('₪', '')) || 0,
      price: parseFloat(document.getElementById('recommendedPrice').textContent.replace('₪', '')),
      sitePrice: parseFloat(document.getElementById('sitePriceInput')?.value || '0') || 0,
      weight: parseFloat(document.getElementById('weight')?.value || '0') || 0,
      additions,
      collections
    };
    products.push(product);
    repo.saveAll(products);
    this.loadProducts();
    
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

  loadProducts() {
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = repo.getAll();
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

    filtered.forEach(p => {
      const row = tbody.insertRow();
      
      // Calculate collections text
      const collectionsText = Array.isArray(p.collections) ? p.collections.join(', ') : 'כללי';
      
      // Calculate pricing with discount
      const currentCost = p.cost || 0;
      const originalPrice = p.sitePrice || p.price || 0;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      const profitAmount = discountedPrice - currentCost;
      const profitPercent = currentCost > 0 ? (profitAmount / currentCost) * 100 : 0;
      
      row.innerHTML = `
            <td>${p.type || ''}</td>
            <td>${p.name || ''}</td>
            <td>${p.material || ''}</td>
            <td>${collectionsText}</td>
            <td>₪${currentCost.toFixed(2)}</td>
            <td>₪${originalPrice.toFixed(2)}</td>
            <td>₪${discountedPrice.toFixed(2)}</td>
            <td style="color: ${profitAmount >= 0 ? 'green' : 'red'}">₪${profitAmount.toFixed(2)}</td>
            <td style="color: ${profitPercent >= 0 ? 'green' : 'red'}">${profitPercent.toFixed(1)}%</td>
            <td class="action-buttons">
                <button class="btn-small btn-warning" onclick="showEditProductModal(${p.id})">ערוך</button>
                <button class="btn-small btn-danger" onclick="deleteProduct(${p.id})">מחק</button>
            </td>
        `;
    });
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

  showEditProductModal(id) {
    const product = products.find(p => p.id === id);
    if (product) {
      document.getElementById('editProductId').value = product.id;
      document.getElementById('editProductType').value = product.type;
      document.getElementById('editProductName').value = product.name;
      document.getElementById('editProductMaterial').value = product.material;
      document.getElementById('editProductWeight').value = product.weight || 0;
      document.getElementById('editProductSitePrice').value = product.sitePrice;
      
      // Setup collections checklist for edit
      this.renderEditCollectionsChecklist(product.collections || ['כללי']);
      
      // Setup additions for edit
      this.renderEditAdditions(product.additions || []);
      
      // Calculate and show recommended price
      this.updateEditPricing();
      
      openModal('editProductModal');
    }
  }

  saveEditedProduct(e) {
    e.preventDefault();
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = repo.getAll();
    const id = parseInt(document.getElementById('editProductId').value);
    const index = products.findIndex(p => p.id === id);
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

      products[index] = {
        ...products[index],
        type: document.getElementById('editProductType').value,
        name: document.getElementById('editProductName').value,
        material: document.getElementById('editProductMaterial').value,
        weight: parseFloat(document.getElementById('editProductWeight').value) || 0,
        cost: finalExpenses,
        price: recommendedPrice,
        sitePrice: parseFloat(document.getElementById('editProductSitePrice').value),
        additions,
        collections
      };
      repo.saveAll(products);
      closeModal('editProductModal');
      this.loadProducts();
    }
  }

  renderEditCollectionsChecklist(selectedCollections) {
    const container = document.getElementById('editCollectionsChecklist');
    if (!container) return;
    
    container.innerHTML = '';
    const collections = getAllCollections();
    
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
    priceInp.addEventListener('input', () => this.updateEditPricing());
    priceInp.addEventListener('change', () => this.updateEditPricing());
    removeBtn.addEventListener('click', () => { 
      row.remove(); 
      this.updateEditPricing(); 
    });
    
    list.appendChild(row);
  }

  updateEditPricing() {
    const material = document.getElementById('editProductMaterial')?.value || '';
    const weight = parseFloat(document.getElementById('editProductWeight')?.value) || 0;
    const sitePriceInput = document.getElementById('editProductSitePrice');

    if (!material || !weight) {
      document.getElementById('editRecommendedPrice').textContent = '₪0';
      if (sitePriceInput) sitePriceInput.value = '0';
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

    const packaging = this.getPackagingTotal();
    const shipping = this.getDomesticShipping();
    const generalExpenses = materialCost + additionsSum + packaging + shipping;

    const laborTime = this.getLaborTimeForMaterial(material);
    const laborCost = laborTime * this.getLaborHourRate();
    const workAndExpenses = generalExpenses + laborCost;

    const expensesWithFees = workAndExpenses * this.getClearingFeeMultiplier() * this.getFixedExpensesFeeMultiplier();
    const finalExpenses = expensesWithFees * this.getVatMultiplier();
    const profitMult = this.getProfitMultiplier(material);
    const recommendedPrice = finalExpenses * profitMult;

    // Update display
    document.getElementById('editRecommendedPrice').textContent = `₪${recommendedPrice.toFixed(2)}`;
    
    // Always sync site price with recommended price
    if (sitePriceInput) {
      sitePriceInput.value = recommendedPrice.toFixed(2);
    }
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

  deleteProduct(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      const repo = window.App.Repositories.ProductRepository;
      // Ensure latest state
      products = repo.getAll();
      products = products.filter(p => p.id !== id);
      repo.saveAll(products);
      this.loadProducts();
    }
  }
}

window.App.Managers.productManager = new ProductManager();
