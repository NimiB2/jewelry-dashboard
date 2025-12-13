// OrderManager (Phase 2): move order logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class OrderManager {
  constructor() {
    this.selectedProducts = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Set up event listeners when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeOrderForm();
      });
    } else {
      // DOM is already ready
      setTimeout(() => this.initializeOrderForm(), 100);
    }
  }

  initializeOrderForm() {
    // Set today's date as default
    const orderDateInput = document.getElementById('orderDate');
    if (orderDateInput) {
      const today = new Date().toISOString().split('T')[0];
      orderDateInput.value = today;
    }

    // Set up product search - remove existing listeners first
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      // Remove existing event listeners by cloning the element
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      // Add new event listeners
      newSearchInput.addEventListener('input', (e) => this.handleProductSearch(e));
      newSearchInput.addEventListener('focus', (e) => this.handleProductSearch(e));
      newSearchInput.addEventListener('blur', () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => this.hideSuggestions(), 150);
      });
    }

    // Set up add product button - remove existing listeners first
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      const newAddProductBtn = addProductBtn.cloneNode(true);
      addProductBtn.parentNode.replaceChild(newAddProductBtn, addProductBtn);
      newAddProductBtn.addEventListener('click', () => this.addManualProduct());
    }

    // Set up discount checkbox
    const hasDiscountCheckbox = document.getElementById('hasDiscount');
    if (hasDiscountCheckbox) {
      hasDiscountCheckbox.addEventListener('change', (e) => this.toggleDiscountSection(e.target.checked));
    }

    // Set up final paid amount input
    const finalPaidInput = document.getElementById('finalPaidAmount');
    if (finalPaidInput) {
      finalPaidInput.addEventListener('input', () => this.updateAmountDisplay());
    }
  }

  async handleProductSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 1) {
      this.hideSuggestions();
      return;
    }

    const availableProducts = await this.getAvailableProducts();
    console.log('Searching in products:', availableProducts.length, 'Query:', query);
    
    const filtered = availableProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const type = (product.type || '').toLowerCase();
      const material = (product.material || '').toLowerCase();
      const searchQuery = query.toLowerCase();
      
      return name.includes(searchQuery) || 
             type.includes(searchQuery) ||
             material.includes(searchQuery);
    }).slice(0, 10); // Limit to 10 suggestions

    console.log('Filtered products:', filtered.length);
    this.showSuggestions(filtered);
  }

  async getAvailableProducts() {
    // Try multiple sources for products
    let availableProducts = [];
    
    // First try global products array (already loaded)
    if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
      availableProducts = products;
    }
    // Then try repository (async)
    else if (window.App?.Repositories?.ProductRepository) {
      const repo = window.App.Repositories.ProductRepository;
      availableProducts = await repo.getAll();
    }
    // Finally try localStorage directly
    else {
      try {
        const stored = localStorage.getItem('products');
        if (stored) {
          availableProducts = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load products from localStorage:', e);
      }
    }
    
    // Ensure we have an array
    if (!Array.isArray(availableProducts)) {
      availableProducts = [];
    }
    
    console.log('Available products:', availableProducts.length);
    return availableProducts;
  }

  showSuggestions(products) {
    const suggestionsDiv = document.getElementById('productSuggestions');
    if (!suggestionsDiv) return;

    if (products.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }

    suggestionsDiv.innerHTML = products.map(product => `
      <div class="suggestion-item" onclick="window.App.Managers.orderManager.selectProduct(${product.id})">
        <div class="suggestion-info">
          <div class="suggestion-name">${product.name || 'ללא שם'}</div>
          <div class="suggestion-details">${product.type} - ${product.material}</div>
        </div>
        <div class="suggestion-price">₪${(product.sitePrice || product.price || 0).toFixed(2)}</div>
      </div>
    `).join('');

    suggestionsDiv.style.display = 'block';
  }

  hideSuggestions() {
    const suggestionsDiv = document.getElementById('productSuggestions');
    if (suggestionsDiv) {
      suggestionsDiv.style.display = 'none';
    }
  }

  async selectProduct(productId) {
    const products = await this.getAvailableProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.warn('Product not found:', productId);
      return;
    }

    // Check if already selected - if yes, increase quantity
    const existingProduct = this.selectedProducts.find(p => p.id === productId && !p.isManual);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      this.selectedProducts.push({
        id: product.id,
        name: product.name || 'ללא שם',
        type: product.type,
        material: product.material,
        price: product.sitePrice || product.price || 0,
        quantity: 1,
        isManual: false
      });
    }

    this.updateSelectedProductsList();
    this.updateAmountDisplay();
    
    // Clear search input
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    this.hideSuggestions();
    console.log('✅ Product added to order:', product.name);
  }

  addManualProduct() {
    const searchInput = document.getElementById('productSearchInput');
    const productName = searchInput?.value?.trim();
    
    if (!productName) {
      alert('הכנס שם מוצר');
      return;
    }

    // Add as manual product with price 0 (user will need to set price manually)
    const manualProduct = {
      id: Date.now(), // Temporary ID for manual products
      name: productName,
      type: 'הזנה ידנית',
      material: '',
      price: 0,
      quantity: 1,
      isManual: true
    };

    this.selectedProducts.push(manualProduct);
    this.updateSelectedProductsList();
    this.updateAmountDisplay();
    
    // Clear search input
    searchInput.value = '';
    this.hideSuggestions();
  }

  updateSelectedProductsList() {
    const listDiv = document.getElementById('selectedProductsList');
    if (!listDiv) return;

    if (this.selectedProducts.length === 0) {
      listDiv.innerHTML = '<p style="color: #666; font-style: italic;">לא נבחרו מוצרים</p>';
      return;
    }

    listDiv.innerHTML = this.selectedProducts.map((product, index) => `
      <div class="selected-product-item">
        <div class="selected-product-info">
          <div class="selected-product-name">${product.name}</div>
          <div class="selected-product-details">
            ${product.type}${product.material ? ' - ' + product.material : ''}
            ${product.isManual ? ' (הזנה ידנית)' : ''}
          </div>
        </div>
        <div class="selected-product-quantity">
          <button class="quantity-btn" onclick="window.App.Managers.orderManager.decreaseQuantity(${index})" 
                  ${product.quantity <= 1 ? 'disabled' : ''}>-</button>
          <span class="quantity-display">${product.quantity}</span>
          <button class="quantity-btn" onclick="window.App.Managers.orderManager.increaseQuantity(${index})">+</button>
        </div>
        <div class="selected-product-price">
          ${product.isManual ? 
            `<input type="number" min="0" step="0.01" value="${product.price}" 
                    onchange="window.App.Managers.orderManager.updateProductPrice(${index}, this.value)" 
                    style="width: 80px; padding: 2px;">` : 
            `₪${product.price.toFixed(2)}`
          }
          ${product.quantity > 1 ? `<div style="font-size: 11px; color: #666;">סה"כ: ₪${(product.price * product.quantity).toFixed(2)}</div>` : ''}
        </div>
        <button class="remove-product-btn" onclick="window.App.Managers.orderManager.removeProduct(${index})" 
                title="${product.quantity > 1 ? 'הסר את כל הפריטים' : 'הסר מוצר'}">
          ${product.quantity > 1 ? `הסר הכל (${product.quantity})` : 'הסר'}
        </button>
      </div>
    `).join('');
  }

  updateProductPrice(index, newPrice) {
    const price = parseFloat(newPrice) || 0;
    if (this.selectedProducts[index]) {
      this.selectedProducts[index].price = price;
      this.updateAmountDisplay();
    }
  }

  increaseQuantity(index) {
    if (this.selectedProducts[index]) {
      this.selectedProducts[index].quantity += 1;
      this.updateSelectedProductsList();
      this.updateAmountDisplay();
    }
  }

  decreaseQuantity(index) {
    if (this.selectedProducts[index] && this.selectedProducts[index].quantity > 1) {
      this.selectedProducts[index].quantity -= 1;
      this.updateSelectedProductsList();
      this.updateAmountDisplay();
    }
  }

  removeProduct(index) {
    this.selectedProducts.splice(index, 1);
    this.updateSelectedProductsList();
    this.updateAmountDisplay();
  }

  updateAmountDisplay() {
    const calculatedAmountInput = document.getElementById('calculatedAmount');
    if (!calculatedAmountInput) return;

    const totalAmount = this.selectedProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);

    calculatedAmountInput.value = totalAmount.toFixed(2);
  }

  toggleDiscountSection(show) {
    const discountDetails = document.getElementById('discountDetails');
    if (discountDetails) {
      discountDetails.style.display = show ? 'block' : 'none';
      
      if (!show) {
        // Clear discount fields when hiding
        const finalPaidInput = document.getElementById('finalPaidAmount');
        const discountReasonInput = document.getElementById('discountReason');
        const discountPercentInput = document.getElementById('discountPercent');
        if (finalPaidInput) finalPaidInput.value = '';
        if (discountReasonInput) discountReasonInput.value = '';
        if (discountPercentInput) discountPercentInput.value = '';
        document.getElementById('calculatedFinalPrice').textContent = '';
      }
    }
  }

  // Toggle between discount type (amount vs percent)
  toggleDiscountType(type) {
    const amountGroup = document.getElementById('discountAmountGroup');
    const percentGroup = document.getElementById('discountPercentGroup');
    
    if (type === 'amount') {
      amountGroup.style.display = 'block';
      percentGroup.style.display = 'none';
    } else {
      amountGroup.style.display = 'none';
      percentGroup.style.display = 'block';
      // Recalculate if there's already a percent value
      this.calculateFromPercent();
    }
  }

  // Calculate final price from percentage discount
  calculateFromPercent() {
    const percentInput = document.getElementById('discountPercent');
    const calculatedAmountInput = document.getElementById('calculatedAmount');
    const calculatedFinalPriceDiv = document.getElementById('calculatedFinalPrice');
    const finalPaidInput = document.getElementById('finalPaidAmount');
    
    const percent = parseFloat(percentInput?.value) || 0;
    const originalAmount = parseFloat(calculatedAmountInput?.value) || 0;
    
    if (percent > 0 && originalAmount > 0) {
      const finalPrice = originalAmount * (1 - percent / 100);
      const discountAmount = originalAmount - finalPrice;
      calculatedFinalPriceDiv.innerHTML = `💰 מחיר סופי: <strong>₪${finalPrice.toFixed(2)}</strong> (חיסכון: ₪${discountAmount.toFixed(2)})`;
      calculatedFinalPriceDiv.style.display = 'block';
      // Also update the hidden final paid amount for saving
      if (finalPaidInput) finalPaidInput.value = finalPrice.toFixed(2);
    } else {
      calculatedFinalPriceDiv.style.display = 'none';
      calculatedFinalPriceDiv.innerHTML = '';
    }
  }

  // Update discount display when amount changes
  updateDiscountDisplay() {
    // This is called when the user types in the final paid amount
    // No action needed here, the value is already in the input
  }

  // Get the final amount considering discount type
  getFinalAmount() {
    const hasDiscount = document.getElementById('hasDiscount')?.checked;
    const calculatedAmount = parseFloat(document.getElementById('calculatedAmount')?.value) || 0;
    
    if (!hasDiscount) return calculatedAmount;
    
    const discountType = document.querySelector('input[name="discountType"]:checked')?.value || 'amount';
    
    if (discountType === 'percent') {
      const percent = parseFloat(document.getElementById('discountPercent')?.value) || 0;
      return calculatedAmount * (1 - percent / 100);
    } else {
      return parseFloat(document.getElementById('finalPaidAmount')?.value) || calculatedAmount;
    }
  }
  async loadOrders() {
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state (await async call)
    orders = await repo.getAll();
    const month = document.getElementById('orderMonth').value;
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      const matchesMonth = month == 0 || (orderDate.getMonth() + 1) == month;
      const notDeleted = !o.isDeleted; // Hide deleted orders
      const notCompleted = !o.isCompleted; // Hide completed orders
      return matchesMonth && notDeleted && notCompleted;
    });
    const tbody = document.getElementById('ordersTable').querySelector('tbody');
    tbody.innerHTML = '';
    filteredOrders.forEach((o, index) => {
      const row = tbody.insertRow();
      
      // Handle amount display - show discount info if applicable
      let amountDisplay = '';
      if (o.hasDiscount && o.finalAmount !== o.amount) {
        const discountAmount = o.amount - o.finalAmount;
        const discountPercent = ((discountAmount / o.amount) * 100).toFixed(1);
        amountDisplay = `
          <div style="text-decoration: line-through; color: #999; font-size: 12px;">${formatILS(o.amount)}</div>
          <div style="color: #28a745; font-weight: bold;">${formatILS(o.finalAmount)}</div>
          <div style="color: #dc3545; font-size: 11px;">הנחה: ${discountPercent}%</div>
        `;
      } else {
        amountDisplay = formatILS(o.finalAmount || o.amount);
      }
      
      row.innerHTML = `
            <td style="text-align: center; font-weight: bold; color: #666;">${index + 1}</td>
            <td>${o.number}</td>
            <td>${this.formatDateHebrew(o.date)}</td>
            <td>${o.customer}</td>
            <td title="${o.products}">${o.products.length > 50 ? o.products.substring(0, 50) + '...' : o.products}</td>
            <td>${amountDisplay}</td>
            <td><span class="receipt-badge ${o.receiptSent ? 'receipt-sent' : 'receipt-not-sent'}" onclick="toggleReceiptStatus(${o.id})" style="cursor: pointer;" title="לחץ לשינוי סטטוס הקבלה">${o.receiptSent ? 'נשלחה' : 'לא נשלחה'}</span></td>
            <td><span class="status-badge status-${o.status}" onclick="cycleOrderStatus(${o.id})" style="cursor: pointer;" title="לחץ לשינוי סטטוס">${this.getStatusLabel(o.status)}</span></td>
            <td class="action-buttons">
                <button class="btn-small btn-info" onclick="showOrderDetails(${o.id})" title="פרטים">👁️</button>
                <button class="btn-small btn-warning" onclick="showEditOrderModal(${o.id})" title="עריכה">✏️</button>
                <button class="btn-small btn-danger" onclick="deleteOrder(${o.id})">מחק</button>
            </td>
        `;
    });
  }

  showAddOrderModal() {
    // Reset form and selected products
    this.selectedProducts = [];
    
    // Reset form fields first
    const form = document.getElementById('addOrderForm');
    if (form) {
      form.reset();
    }
    
    // Open modal first
    openModal('addOrderModal');
    
    // Initialize form after modal is open
    setTimeout(() => {
      this.initializeOrderForm();
      this.updateSelectedProductsList();
      this.updateAmountDisplay();
      this.toggleDiscountSection(false);
      
      // Set today's date
      const orderDateInput = document.getElementById('orderDate');
      if (orderDateInput) {
        const today = new Date().toISOString().split('T')[0];
        orderDateInput.value = today;
      }
      
      // Focus on search input
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) {
        searchInput.focus();
      }
    }, 200);
  }

  showEditOrderModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Set current order for editing
    this.editingOrderId = orderId;
    this.selectedProducts = [...(order.selectedProducts || [])];

    // Populate form fields
    document.getElementById('editCustomerName').value = order.customer || '';
    document.getElementById('editOrderDate').value = order.date || '';
    document.getElementById('editOrderNotes').value = order.notes || '';
    document.getElementById('editReceiptSent').checked = order.receiptSent || false;
    
    // Handle discount section
    const hasDiscount = order.hasDiscount || false;
    document.getElementById('editHasDiscount').checked = hasDiscount;
    this.toggleEditDiscountSection(hasDiscount);
    
    if (hasDiscount) {
      document.getElementById('editFinalPaidAmount').value = order.finalAmount || order.amount || 0;
      document.getElementById('editDiscountReason').value = order.discountReason || '';
    }
    
    // Update products list and amount
    this.updateEditSelectedProductsList();
    this.updateEditAmountDisplay();
    
    // Initialize edit form functionality
    this.initializeEditOrderForm();
    
    openModal('editOrderModal');
  }

  updateEditSelectedProductsList() {
    const listDiv = document.getElementById('editSelectedProductsList');
    if (!listDiv) return;

    if (this.selectedProducts.length === 0) {
      listDiv.innerHTML = '<p style="color: #666; font-style: italic;">לא נבחרו מוצרים</p>';
      return;
    }

    listDiv.innerHTML = this.selectedProducts.map((product, index) => `
      <div class="selected-product-item">
        <div class="selected-product-info">
          <div class="selected-product-name">${product.name}</div>
          <div class="selected-product-details">
            ${product.type}${product.material ? ' - ' + product.material : ''}
            ${product.isManual ? ' (הזנה ידנית)' : ''}
          </div>
        </div>
        <div class="selected-product-quantity">
          <button class="quantity-btn" onclick="window.App.Managers.orderManager.decreaseEditQuantity(${index})" 
                  ${product.quantity <= 1 ? 'disabled' : ''}>-</button>
          <span class="quantity-display">${product.quantity}</span>
          <button class="quantity-btn" onclick="window.App.Managers.orderManager.increaseEditQuantity(${index})">+</button>
        </div>
        <div class="selected-product-price">
          ${product.isManual ? 
            `<input type="number" min="0" step="0.01" value="${product.price}" 
                    onchange="window.App.Managers.orderManager.updateEditProductPrice(${index}, this.value)" 
                    style="width: 80px; padding: 2px;">` : 
            `₪${product.price.toFixed(2)}`
          }
          ${product.quantity > 1 ? `<div style="font-size: 11px; color: #666;">סה"כ: ₪${(product.price * product.quantity).toFixed(2)}</div>` : ''}
        </div>
        <button class="remove-product-btn" onclick="window.App.Managers.orderManager.removeEditProduct(${index})" 
                title="${product.quantity > 1 ? 'הסר את כל הפריטים' : 'הסר מוצר'}">
          ${product.quantity > 1 ? `הסר הכל (${product.quantity})` : 'הסר'}
        </button>
      </div>
    `).join('');
  }

  updateEditProductPrice(index, newPrice) {
    const price = parseFloat(newPrice) || 0;
    if (this.selectedProducts[index]) {
      this.selectedProducts[index].price = price;
      this.updateEditAmountDisplay();
    }
  }

  increaseEditQuantity(index) {
    if (this.selectedProducts[index]) {
      this.selectedProducts[index].quantity += 1;
      this.updateEditSelectedProductsList();
      this.updateEditAmountDisplay();
    }
  }

  decreaseEditQuantity(index) {
    if (this.selectedProducts[index] && this.selectedProducts[index].quantity > 1) {
      this.selectedProducts[index].quantity -= 1;
      this.updateEditSelectedProductsList();
      this.updateEditAmountDisplay();
    }
  }

  removeEditProduct(index) {
    this.selectedProducts.splice(index, 1);
    this.updateEditSelectedProductsList();
    this.updateEditAmountDisplay();
  }

  updateEditAmountDisplay() {
    const calculatedAmountInput = document.getElementById('editCalculatedAmount');
    if (!calculatedAmountInput) return;

    const totalAmount = this.selectedProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);

    calculatedAmountInput.value = totalAmount.toFixed(2);
  }

  toggleEditDiscountSection(show) {
    const discountDetails = document.getElementById('editDiscountDetails');
    if (discountDetails) {
      discountDetails.style.display = show ? 'block' : 'none';
      
      if (!show) {
        // Clear discount fields when hiding
        const finalPaidInput = document.getElementById('editFinalPaidAmount');
        const discountReasonInput = document.getElementById('editDiscountReason');
        if (finalPaidInput) finalPaidInput.value = '';
        if (discountReasonInput) discountReasonInput.value = '';
      }
    }
  }

  async saveEditedOrder(e) {
    e.preventDefault();
    
    if (!this.editingOrderId) return false;
    
    // Validate that products are selected
    if (this.selectedProducts.length === 0) {
      alert('יש לבחור לפחות מוצר אחד');
      return false;
    }

    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state (await async call)
    orders = await repo.getAll();
    
    const orderIndex = orders.findIndex(o => o.id === this.editingOrderId);
    if (orderIndex === -1) return false;

    // Calculate amounts
    const calculatedAmount = this.selectedProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    
    const hasDiscount = document.getElementById('editHasDiscount').checked;
    const finalPaidAmount = hasDiscount ? 
      parseFloat(document.getElementById('editFinalPaidAmount').value) || calculatedAmount :
      calculatedAmount;
    
    // Create products summary string
    const productsString = this.selectedProducts.map(p => 
      `${p.name} (₪${p.price.toFixed(2)})`
    ).join(', ');
    
    // Update the order
    const updatedOrder = {
      ...orders[orderIndex],
      date: document.getElementById('editOrderDate').value,
      customer: document.getElementById('editCustomerName').value,
      products: productsString,
      selectedProducts: this.selectedProducts,
      amount: calculatedAmount,
      finalAmount: finalPaidAmount,
      hasDiscount: hasDiscount,
      discountReason: hasDiscount ? document.getElementById('editDiscountReason').value : '',
      receiptSent: document.getElementById('editReceiptSent').checked,
      notes: document.getElementById('editOrderNotes').value,
      updatedAt: new Date().toISOString()
    };
    
    orders[orderIndex] = updatedOrder;
    await repo.update(updatedOrder);
    console.log('✅ Order updated:', updatedOrder.number);
    
    // Update income entry if exists
    await this.updateOrderIncome(updatedOrder);
    
    closeModal('editOrderModal');
    await this.loadOrders();
    
    // Reset editing state
    this.editingOrderId = null;
    this.selectedProducts = [];
    
    return false; // Prevent form submission
  }

  async addOrder(e) {
    if (e) e.preventDefault();
    await this.addOrderDirect();
  }
  
  // Direct add without event (called from button click)
  async addOrderDirect() {
    console.log('🔄 addOrderDirect called');
    
    // Validate that products are selected
    if (this.selectedProducts.length === 0) {
      alert('יש לבחור לפחות מוצר אחד');
      return;
    }

    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state (await async call)
    orders = await repo.getAll();
    
    // Use repository-managed order numbering
    const existingNext = localStorage.getItem('nextOrderNumber');
    if (existingNext === null && typeof nextOrderNumber !== 'undefined' && Number.isFinite(parseInt(nextOrderNumber, 10))) {
      await repo.setNextOrderNumber(parseInt(nextOrderNumber, 10));
    }
    const nextNo = await repo.incrementAndGet();
    nextOrderNumber = nextNo + 0; // keep global in sync
    
    // Calculate amounts
    const calculatedAmount = this.selectedProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    
    const hasDiscount = document.getElementById('hasDiscount').checked;
    const finalPaidAmount = hasDiscount ? this.getFinalAmount() : calculatedAmount;
    
    // Create products summary string
    const productsString = this.selectedProducts.map(p => 
      `${p.name} (₪${p.price.toFixed(2)})`
    ).join(', ');
    
    const newOrder = {
      id: Date.now(),
      number: nextNo,
      date: document.getElementById('orderDate').value,
      customer: document.getElementById('customerName').value,
      products: productsString,
      selectedProducts: this.selectedProducts,
      amount: calculatedAmount,
      finalAmount: finalPaidAmount,
      hasDiscount: hasDiscount,
      discountReason: hasDiscount ? document.getElementById('discountReason').value : '',
      receiptSent: document.getElementById('receiptSent').checked,
      notes: document.getElementById('orderNotes').value,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    
    try {
      // Use repo.add() for single order
      await repo.add(newOrder);
      orders.push(newOrder);
      
      console.log('✅ Order added:', newOrder.number);
      
      // Income is added only when order status becomes "paid"
      // (not on creation)
      
      // Close modal
      closeModal('addOrderModal');
      
      // Reload orders
      await this.loadOrders();
      
      // Stay on orders tab
      if (typeof switchTab === 'function') {
        switchTab('orders');
      }
    } catch (err) {
      console.error('❌ Failed to add order:', err);
      alert('שגיאה בהוספת ההזמנה. אנא נסה שוב.');
    }
  }

  showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let detailsHTML = `
      <div class="order-details">
        <h3>הזמנה מספר: ${order.number}</h3>
        <div class="detail-row"><strong>תאריך:</strong> ${this.formatDateHebrew(order.date)}</div>
        <div class="detail-row"><strong>לקוח:</strong> ${order.customer}</div>
        <div class="detail-row"><strong>סטטוס:</strong> ${this.getStatusLabel(order.status)}</div>
        
        <h4>מוצרים:</h4>
        <div class="products-details">
    `;

    if (order.selectedProducts && Array.isArray(order.selectedProducts)) {
      order.selectedProducts.forEach(product => {
        detailsHTML += `
          <div class="product-detail-item">
            <span class="product-name">${product.name}</span>
            <span class="product-info">${product.type}${product.material ? ' - ' + product.material : ''}</span>
            <span class="product-price">₪${product.price.toFixed(2)}</span>
          </div>
        `;
      });
    } else {
      detailsHTML += `<div class="product-detail-item">${order.products}</div>`;
    }

    detailsHTML += `</div>`;

    // Amount details
    detailsHTML += `
      <h4>פרטי תשלום:</h4>
      <div class="payment-details">
        <div class="detail-row"><strong>סכום מקורי:</strong> ₪${order.amount.toFixed(2)}</div>
    `;

    if (order.hasDiscount) {
      const discountAmount = order.amount - order.finalAmount;
      const discountPercent = ((discountAmount / order.amount) * 100).toFixed(1);
      detailsHTML += `
        <div class="detail-row"><strong>הנחה:</strong> ₪${discountAmount.toFixed(2)} (${discountPercent}%)</div>
        <div class="detail-row"><strong>סיבת הנחה:</strong> ${order.discountReason || 'לא צוין'}</div>
        <div class="detail-row" style="color: #28a745;"><strong>סכום סופי:</strong> ₪${order.finalAmount.toFixed(2)}</div>
      `;
    } else {
      detailsHTML += `<div class="detail-row"><strong>סכום סופי:</strong> ₪${(order.finalAmount || order.amount).toFixed(2)}</div>`;
    }

    detailsHTML += `
      </div>
      <div class="detail-row"><strong>קבלה נשלחה:</strong> ${order.receiptSent ? 'כן' : 'לא'}</div>
    `;

    if (order.notes) {
      detailsHTML += `<div class="detail-row"><strong>הערות:</strong> ${order.notes}</div>`;
    }

    detailsHTML += `</div>`;

    // Show in modal or alert (for now using alert, can be improved with a proper modal)
    const detailsWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=yes');
    detailsWindow.document.write(`
      <html>
        <head>
          <title>פרטי הזמנה ${order.number}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
            .order-details { max-width: 500px; }
            .detail-row { margin: 8px 0; }
            .product-detail-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px; 
              border-bottom: 1px solid #eee; 
            }
            .product-name { font-weight: bold; }
            .product-info { color: #666; font-size: 12px; }
            .product-price { color: #667eea; font-weight: bold; }
            h3, h4 { color: #333; margin-top: 20px; }
          </style>
        </head>
        <body>${detailsHTML}</body>
      </html>
    `);
  }

  async deleteOrder(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
      const repo = window.App.Repositories.OrderRepository;
      // Ensure latest state
      orders = await repo.getAll();
      
      // Find order to get its number before deleting
      const orderToDelete = orders.find(o => o.id === id);
      
      await repo.removeById(id);
      orders = orders.filter(o => o.id !== id);
      console.log('✅ Order deleted:', id);
      
      // Also delete from income
      if (orderToDelete) {
        await this.deleteOrderFromIncome(orderToDelete);
      }
      
      await this.loadOrders();
    }
  }
  
  // Delete income entry when order is deleted
  async deleteOrderFromIncome(order) {
    try {
      console.log('🗑️ Deleting income for order:', order.id, order.number);
      
      // Get all income from API (separate collection)
      const response = await fetch('/api/income');
      if (!response.ok) return;
      
      const incomeList = await response.json();
      
      // Find income entry for this order by orderId (most reliable)
      const incomeEntry = incomeList.find(e => e.orderId === order.id);
      
      if (incomeEntry) {
        console.log('🔍 Found income entry to delete:', incomeEntry.id, incomeEntry.description);
        
        // Delete via API
        const deleteResponse = await fetch(`/api/income/${incomeEntry.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Income entry deleted for order:', order.number || order.id);
          
          // Also update localStorage
          const localIncome = JSON.parse(localStorage.getItem('income') || '[]');
          const filtered = localIncome.filter(e => e.id !== incomeEntry.id);
          localStorage.setItem('income', JSON.stringify(filtered));
        } else {
          console.error('❌ Failed to delete income:', deleteResponse.status);
        }
      } else {
        console.log('⚠️ No income entry found for order:', order.id);
      }
    } catch (error) {
      console.error('Error deleting order from income:', error);
    }
  }

  async cycleOrderStatus(id) {
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state
    orders = await repo.getAll();
    const order = orders.find(o => o.id === id);
    
    const statuses = [
      { key: 'new', label: 'חדשה - לא שולם' },
      { key: 'paid_preparing', label: 'שולם ובהכנה' },
      { key: 'ready', label: 'מוכנה' },
      { key: 'shipped', label: 'נשלחה' }
    ];
    
    const currentIndex = statuses.findIndex(s => s.key === order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const currentStatusLabel = statuses[currentIndex]?.label || this.getStatusLabel(order.status);
    const nextStatusLabel = nextStatus.label;
    
    if (confirm(`האם לשנות את סטטוס ההזמנה מ"${currentStatusLabel}" ל"${nextStatusLabel}"?`)) {
      const oldStatus = order.status;
      order.status = nextStatus.key;
      
      // Add income when order status changes to "paid_preparing" (customer paid)
      // Also handle undefined/null status as 'new' (for older orders)
      const wasUnpaid = oldStatus === 'new' || !oldStatus;
      if (wasUnpaid && nextStatus.key === 'paid_preparing') {
        console.log('💰 Order paid - adding to income:', order.number, '(old status:', oldStatus, ')');
        await this.addOrderToIncome(order);
      }
      
      await repo.update(order);
      
      // Check if order is completed and mark as deleted
      await this.checkAndMarkCompletedOrder(order);
      
      await this.loadOrders();
    }
  }

  async toggleReceiptStatus(id) {
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state
    orders = await repo.getAll();
    const order = orders.find(o => o.id === id);
    
    const currentStatus = order.receiptSent ? 'נשלחה' : 'לא נשלחה';
    const newStatus = order.receiptSent ? 'לא נשלחה' : 'נשלחה';
    
    if (confirm(`האם לשנות את סטטוס הקבלה מ"${currentStatus}" ל"${newStatus}"?`)) {
      order.receiptSent = !order.receiptSent;
      await repo.update(order);
      
      // Check if order is completed and mark as deleted
      await this.checkAndMarkCompletedOrder(order);
      
      await this.loadOrders();
    }
  }

  getStatusLabel(statusKey) {
    const statusMap = {
      'new': 'חדשה - לא שולם',
      'paid_preparing': 'שולם ובהכנה',
      'ready': 'מוכנה',
      'shipped': 'נשלחה',
      // Legacy statuses for backward compatibility
      'paid': 'שולם ובהכנה',
      'in_work': 'שולם ובהכנה',
      'processing': 'שולם ובהכנה',
      'delivered': 'נשלחה'
    };
    return statusMap[statusKey] || statusKey;
  }

  formatDateHebrew(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }

  calculateWorkHours(selectedProducts) {
    // Get labor time settings from settings
    const laborTimeSettings = {
      'כסף': 1,
      'זהב 14K': 1.875,
      'ציפוי זהב': 1,
      'יציקה כסף': 1,
      'יציקה ציפוי זהב': 1
    };

    let totalHours = 0;
    const productDetails = [];

    selectedProducts.forEach(product => {
      // Try to match product type/material to labor time settings
      let hours = 0;
      const productType = product.type || '';
      const productMaterial = product.material || '';
      
      // Check for matches in labor time settings
      for (const [material, time] of Object.entries(laborTimeSettings)) {
        if (productType.includes(material) || productMaterial.includes(material)) {
          hours = time;
          break;
        }
      }
      
      // Default to 1 hour if no match found
      if (hours === 0) hours = 1;
      
      totalHours += hours;
      productDetails.push({
        name: product.name,
        hours: hours,
        material: productMaterial || productType
      });
    });

    return { totalHours, productDetails };
  }

  initializeEditOrderForm() {
    console.log('🔧 initializeEditOrderForm called');
    
    // Set up product search for edit form
    const searchInput = document.getElementById('editProductSearchInput');
    console.log('🔍 Edit search input found:', !!searchInput);
    
    if (searchInput) {
      // Remove existing event listeners by cloning the element
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      // Add new event listeners
      newSearchInput.addEventListener('input', (e) => {
        console.log('📝 Edit input event:', e.target.value);
        this.handleEditProductSearch(e);
      });
      newSearchInput.addEventListener('focus', (e) => {
        console.log('🎯 Edit focus event');
        if (e.target.value.trim().length > 0) {
          this.handleEditProductSearch(e);
        }
      });
      newSearchInput.addEventListener('blur', () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => this.hideEditSuggestions(), 200);
      });
      
      console.log('✅ Edit search event listeners added');
    }

    // Set up add product button for edit form
    const addProductBtn = document.getElementById('editAddProductBtn');
    if (addProductBtn) {
      const newAddProductBtn = addProductBtn.cloneNode(true);
      addProductBtn.parentNode.replaceChild(newAddProductBtn, addProductBtn);
      newAddProductBtn.addEventListener('click', () => this.addEditManualProduct());
    }
  }

  async handleEditProductSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 1) {
      this.hideEditSuggestions();
      return;
    }

    const availableProducts = await this.getAvailableProducts();
    console.log('Edit: Searching in products:', availableProducts.length, 'Query:', query);
    
    const filtered = availableProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const type = (product.type || '').toLowerCase();
      const material = (product.material || '').toLowerCase();
      const searchQuery = query.toLowerCase();
      
      return name.includes(searchQuery) || 
             type.includes(searchQuery) ||
             material.includes(searchQuery);
    }).slice(0, 10); // Limit to 10 suggestions

    console.log('Edit: Filtered products:', filtered.length);
    this.showEditSuggestions(filtered);
  }

  showEditSuggestions(products) {
    console.log('📋 showEditSuggestions called with', products.length, 'products');
    const suggestionsDiv = document.getElementById('editProductSuggestions');
    console.log('📦 Edit suggestions div found:', !!suggestionsDiv);
    
    if (!suggestionsDiv) return;

    if (products.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }

    suggestionsDiv.innerHTML = products.map(product => `
      <div class="suggestion-item" onclick="window.App.Managers.orderManager.selectEditProduct(${product.id})">
        <div class="suggestion-info">
          <div class="suggestion-name">${product.name || 'ללא שם'}</div>
          <div class="suggestion-details">${product.type} - ${product.material}</div>
        </div>
        <div class="suggestion-price">₪${(product.sitePrice || product.price || 0).toFixed(2)}</div>
      </div>
    `).join('');

    suggestionsDiv.style.display = 'block';
    console.log('✅ Edit suggestions displayed');
  }

  hideEditSuggestions() {
    const suggestionsDiv = document.getElementById('editProductSuggestions');
    if (suggestionsDiv) {
      suggestionsDiv.style.display = 'none';
    }
  }

  async selectEditProduct(productId) {
    const availableProducts = await this.getAvailableProducts();
    const product = availableProducts.find(p => p.id === productId);
    
    if (product) {
      // Check if product already exists in selected products
      const existingProduct = this.selectedProducts.find(p => p.id === productId && !p.isManual);
      
      if (existingProduct) {
        // Increase quantity of existing product
        existingProduct.quantity += 1;
      } else {
        // Add new product
        const selectedProduct = {
          id: product.id,
          name: product.name || 'מוצר ללא שם',
          type: product.type || '',
          material: product.material || '',
          price: product.sitePrice || product.price || 0,
          quantity: 1,
          isManual: false
        };
        
        this.selectedProducts.push(selectedProduct);
      }
      
      this.updateEditSelectedProductsList();
      this.updateEditAmountDisplay();
      
      // Clear search input and hide suggestions
      const searchInput = document.getElementById('editProductSearchInput');
      if (searchInput) searchInput.value = '';
      this.hideEditSuggestions();
      console.log('✅ Product added to order (edit):', product.name);
    }
  }

  addEditManualProduct() {
    const searchInput = document.getElementById('editProductSearchInput');
    const productName = searchInput ? searchInput.value.trim() : '';
    
    if (!productName) {
      alert('יש להזין שם מוצר');
      return;
    }
    
    const manualProduct = {
      id: Date.now(),
      name: productName,
      type: 'מוצר ידני',
      material: '',
      price: 0,
      quantity: 1,
      isManual: true
    };
    
    this.selectedProducts.push(manualProduct);
    this.updateEditSelectedProductsList();
    this.updateEditAmountDisplay();
    
    // Clear search input
    if (searchInput) searchInput.value = '';
    this.hideEditSuggestions();
  }

  async checkAndMarkCompletedOrder(order) {
    // Check if order is completed: status is "shipped" AND receipt is sent
    if (order.status === 'shipped' && order.receiptSent) {
      // Automatically complete the order without asking for confirmation
      order.isCompleted = true;
      order.completedDate = new Date().toISOString().split('T')[0]; // Today's date
      
      // Note: Income is already added when status changes to "paid_preparing"
      
      const repo = window.App.Repositories.OrderRepository;
      // Ensure latest state
      orders = await repo.getAll();
      const orderIndex = orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        orders[orderIndex] = order;
        await repo.update(order);
      }
      
      // Show completed orders automatically
      this.showCompletedOrdersAutomatically();
      
      // Simple notification without blocking the user
      this.showNotification(`✅ הזמנה #${order.number} הושלמה והועברה לרשימת ההזמנות המושלמות`);
    }
  }

  toggleCompletedOrders() {
    const section = document.getElementById('completedOrdersSection');
    const button = document.getElementById('toggleCompletedBtn');
    
    if (section.style.display === 'none') {
      section.style.display = 'block';
      button.textContent = '🔼 הסתר הזמנות מושלמות';
      this.loadCompletedOrders();
    } else {
      section.style.display = 'none';
      button.textContent = '📋 הצג הזמנות מושלמות';
    }
  }

  async loadCompletedOrders() {
    const repo = window.App.Repositories.OrderRepository;
    orders = await repo.getAll();
    
    const completedOrders = orders.filter(o => o.isCompleted);
    const tbody = document.getElementById('completedOrdersTable').querySelector('tbody');
    tbody.innerHTML = '';
    
    completedOrders.forEach((o, index) => {
      const row = tbody.insertRow();
      
      // Handle amount display
      let amountDisplay = '';
      if (o.hasDiscount && o.finalAmount !== o.amount) {
        const discountAmount = o.amount - o.finalAmount;
        const discountPercent = ((discountAmount / o.amount) * 100).toFixed(1);
        amountDisplay = `
          <div style="text-decoration: line-through; color: #999; font-size: 11px;">${formatILS(o.amount)}</div>
          <div style="color: #28a745; font-weight: bold;">${formatILS(o.finalAmount)}</div>
          <div style="color: #dc3545; font-size: 11px;">הנחה: ${discountPercent}%</div>
        `;
      } else {
        amountDisplay = formatILS(o.finalAmount || o.amount);
      }
      
      row.innerHTML = `
        <td style="text-align: center; font-weight: bold; color: #666;">${index + 1}</td>
        <td>${o.number}</td>
        <td>${this.formatDateHebrew(o.date)}</td>
        <td>${o.customer}</td>
        <td title="${o.products}">${o.products.length > 30 ? o.products.substring(0, 30) + '...' : o.products}</td>
        <td>${amountDisplay}</td>
        <td>${this.formatDateHebrew(o.completedDate)}</td>
        <td class="action-buttons">
          <button class="btn-small btn-info" onclick="showOrderDetails(${o.id})" title="פרטים">👁️</button>
          <button class="btn-small btn-warning" onclick="restoreOrder(${o.id})" title="החזר לרשימה הרגילה">↩️</button>
        </td>
      `;
    });
  }

  showCompletedOrdersAutomatically() {
    const section = document.getElementById('completedOrdersSection');
    const button = document.getElementById('toggleCompletedBtn');
    
    if (section && section.style.display === 'none') {
      section.style.display = 'block';
      if (button) {
        button.textContent = '🔼 הסתר הזמנות מושלמות';
      }
      this.loadCompletedOrders();
    }
  }

  showNotification(message) {
    // Create a non-blocking notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      font-weight: bold;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }

  restoreOrder(orderId) {
    if (confirm('האם להחזיר את ההזמנה לרשימה הרגילה?')) {
      const repo = window.App.Repositories.OrderRepository;
      orders = repo.getAll();
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        order.isCompleted = false;
        delete order.completedDate;
        repo.saveAll(orders);
        
        this.loadOrders();
        this.loadCompletedOrders();
        this.showNotification('ההזמנה הוחזרה לרשימה הרגילה');
      }
    }
  }

  // Update income entry when order is updated
  async updateOrderIncome(order) {
    try {
      // Use IncomeRepository (not ExpenseRepository) for income entries
      const incomeRepo = window.App?.Repositories?.IncomeRepository;
      if (!incomeRepo) {
        console.warn('⚠️ IncomeRepository not available');
        return;
      }
      
      let incomeList = await incomeRepo.getAll();
      
      // Find existing income entry for this order
      const existingIndex = incomeList.findIndex(e => 
        e.orderId === order.id || e.orderNumber === order.number
      );
      
      if (existingIndex === -1) {
        console.log(`No income entry found for order #${order.number}`);
        return;
      }
      
      // Calculate work hours
      const workHoursData = this.calculateWorkHours(order.selectedProducts || []);
      const totalWorkHours = workHoursData.totalHours;
      
      // Create products description
      const productsDescription = order.selectedProducts && order.selectedProducts.length > 0 
        ? order.selectedProducts.map(p => p.name).join(', ')
        : order.products || 'מוצרים';
      
      // Update the existing entry
      const updatedEntry = {
        ...incomeList[existingIndex],
        date: order.date,
        description: productsDescription,
        amount: order.finalAmount || order.amount,
        workHours: totalWorkHours,
        updatedAt: new Date().toISOString()
      };
      
      await incomeRepo.update(updatedEntry);
      console.log('✅ Income entry updated for order:', order.number);
      
    } catch (error) {
      console.error('Error updating order income:', error);
    }
  }

  async addOrderToIncome(order) {
    console.log('🔄 addOrderToIncome called with order:', order);
    
    try {
      // Calculate work hours
      const workHoursData = this.calculateWorkHours(order.selectedProducts || []);
      const totalWorkHours = workHoursData.totalHours || 0;
      
      // Create products description
      const productsDescription = order.selectedProducts && order.selectedProducts.length > 0 
        ? order.selectedProducts.map(p => p.name).join(', ')
        : order.products || 'מוצרים';

      const orderNumber = order.number || order.id;

      // Create income entry
      const incomeEntry = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        date: order.date || new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'sales',
        description: productsDescription,
        amount: order.finalAmount || order.amount,
        workHours: totalWorkHours,
        // Store current labor hour rate with income entry (locked at creation time)
        laborHourRate: window.getLaborHourRate ? window.getLaborHourRate() : 80,
        orderNumber: orderNumber,
        orderId: order.id,
        createdAt: new Date().toISOString()
      };
      
      console.log('📝 Creating income entry:', incomeEntry);

      // Use income API (separate collection)
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeEntry)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Income added for order #' + orderNumber, result);
        
        // Also update localStorage
        const localIncome = JSON.parse(localStorage.getItem('income') || '[]');
        localIncome.push(incomeEntry);
        localStorage.setItem('income', JSON.stringify(localIncome));
      } else {
        console.error('❌ Failed to add income:', response.status, await response.text());
      }
      
    } catch (error) {
      console.error('❌ Error adding order to income:', error);
    }
  }
}

window.App.Managers.orderManager = new OrderManager();

// Global shorthand for HTML onclick handlers
window.orderManager = window.App.Managers.orderManager;
