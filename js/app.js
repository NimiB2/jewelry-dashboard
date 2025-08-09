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
            '14k': 230,
            'silver': 8,
            'silver_cast': 8
        },
        laborTime: {
            '14k': 2,
            'silver': 1.5,
            'plating': 1
        },
        profitMultiplier: {
            '14k': 1.53,
            'silver': 1.77,
            'plating': 1.60
        }
    };
    if (window.App && App.SettingsService && typeof App.SettingsService.mergeDefaults === 'function') {
        settings = App.SettingsService.mergeDefaults(defaults);
    } else {
        settings = { ...defaults, ...settings };
        localStorage.setItem('settings', JSON.stringify(settings));
    }
    loadSettingsToUI();
}

function loadSettingsToUI() {
    document.getElementById('vatRate').value = (settings.vatRate * 100).toFixed(1);
    document.getElementById('processingFee').value = (settings.processingFee * 100).toFixed(1);
    document.getElementById('packagingCost').value = settings.packagingCost;
    document.getElementById('fixedCosts').value = settings.fixedCosts;
    document.getElementById('laborHourRate').value = settings.laborHourRate;

    document.getElementById('price_14k').value = settings.materialPrices['14k'];
    document.getElementById('price_silver').value = settings.materialPrices['silver'];
    document.getElementById('price_silver_cast').value = settings.materialPrices['silver_cast'];

    document.getElementById('time_14k').value = settings.laborTime['14k'];
    document.getElementById('time_silver').value = settings.laborTime['silver'];
    document.getElementById('time_plating').value = settings.laborTime['plating'];

    document.getElementById('profit_14k').value = settings.profitMultiplier['14k'];
    document.getElementById('profit_silver').value = settings.profitMultiplier['silver'];
    document.getElementById('profit_plating').value = settings.profitMultiplier['plating'];
}

function saveSettings() {
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

    if (window.App && App.SettingsService && typeof App.SettingsService.set === 'function') {
        App.SettingsService.set(settings);
    } else {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
    
    const savedMsg = document.getElementById('settingsSaved');
    savedMsg.style.display = 'inline';
    setTimeout(() => { savedMsg.style.display = 'none'; }, 2000);

    updatePricing();
    loadExpenseData();
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
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

    document.querySelector(`.nav-tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function toggleWorkHoursField() {
    return window.App && App.Managers && App.Managers.expenseManager
        ? App.Managers.expenseManager.toggleWorkHoursField()
        : null;
}

function showAddExpenseModal() {
    return App.Managers.expenseManager.showAddExpenseModal();
}

function addExpense(e) {
    return App.Managers.expenseManager.addExpense(e);
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
    const expenseType = document.getElementById('editExpenseType').value;
    const workHoursGroup = document.getElementById('editWorkHoursGroup');
    const categorySelect = document.getElementById('editExpenseCategory');
    const descriptionGroup = document.getElementById('editExpenseDescription').parentElement;
    const recurringGroup = document.getElementById('editIsRecurring').parentElement;
    const recurringMonthsGroup = document.getElementById('editRecurringMonths');
    
    if (expenseType === 'income') {
        if (workHoursGroup) workHoursGroup.style.display = 'block';
        // Show description for income and keep it required
        descriptionGroup.style.display = 'block';
        document.getElementById('editExpenseDescription').setAttribute('required', 'required');
        recurringGroup.style.display = 'none';
        if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'none';
        
        // Set income categories
        categorySelect.innerHTML = `
            <option value="">בחר קטגוריה</option>
            <option value="sales">מכירות</option>
            <option value="other">אחר</option>
        `;
    } else {
        if (workHoursGroup) workHoursGroup.style.display = 'none';
        descriptionGroup.style.display = 'block';
        // Ensure description required for expenses as well
        document.getElementById('editExpenseDescription').setAttribute('required', 'required');
        recurringGroup.style.display = 'block';
        
        // Set expense categories
        categorySelect.innerHTML = `
            <option value="">בחר קטגוריה</option>
            <option value="fixed">הוצאות קבועות</option>
            <option value="variable">הוצאות משתנות</option>
            <option value="general">הוצאות כלליות</option>
            <option value="other">אחר</option>
        `;
    }
}

function showEditExpenseModal(id) {
    return App.Managers.expenseManager.showEditExpenseModal(id);
}

function saveEditedExpense(e) {
    return App.Managers.expenseManager.saveEditedExpense(e);
}

function deleteExpense(id) {
    return App.Managers.expenseManager.deleteExpense(id);
}

function loadExpenseData() {
    App.Managers.expenseManager.loadExpenseData();
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
function updatePricing() {
    const material = document.getElementById('material').value;
    const weight = parseFloat(document.getElementById('weight').value) || 0;

    let materialCost = 0, laborCost = 0, totalCost = 0, recommendedPrice = 0;

    if (material.includes('14K')) {
        materialCost = weight * settings.materialPrices['14k'];
        laborCost = settings.laborTime['14k'] * settings.laborHourRate;
        totalCost = materialCost + laborCost + settings.fixedCosts;
        recommendedPrice = totalCost * settings.profitMultiplier['14k'];
    } else if (material.includes('כסף')) {
        materialCost = weight * settings.materialPrices['silver'];
        laborCost = settings.laborTime['silver'] * settings.laborHourRate;
        totalCost = materialCost + laborCost + settings.fixedCosts;
        recommendedPrice = totalCost * settings.profitMultiplier['silver'];
    } 

    document.getElementById('materialCost').innerHTML = formatILS(materialCost);
    document.getElementById('laborCost').innerHTML = formatILS(laborCost);
    document.getElementById('fixedCostDisplay').innerHTML = formatILS(settings.fixedCosts);
    document.getElementById('totalCost').innerHTML = formatILS(totalCost);
    document.getElementById('recommendedPrice').innerHTML = formatILS(recommendedPrice);

    calculateDiscount();
}

function calculateDiscount() {
    const recommendedPrice = parseFloat(document.getElementById('recommendedPrice').textContent.replace('₪', ''));
    const discount = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountedPrice = recommendedPrice * (1 - discount / 100);
    document.getElementById('discountedPrice').innerHTML = formatILS(discountedPrice);
}

function addToProducts() {
    return App.Managers.productManager.addToProducts();
}

function loadProducts() {
    return App.Managers.productManager.loadProducts();
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
    return App.Managers.productManager.saveEditedProduct(e);
}

function deleteProduct(id) {
    return App.Managers.productManager.deleteProduct(id);
}

// Orders Functions
function loadOrders() {
    return App.Managers.orderManager.loadOrders();
}

function showAddOrderModal() {
    return App.Managers.orderManager.showAddOrderModal();
}

function addOrder(e) {
    return App.Managers.orderManager.addOrder(e);
}

function deleteOrder(id) {
    return App.Managers.orderManager.deleteOrder(id);
}

function cycleOrderStatus(id) {
    return App.Managers.orderManager.cycleOrderStatus(id);
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
