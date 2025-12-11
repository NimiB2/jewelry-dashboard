// ExpenseManager (Phase 2): move expense logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class ExpenseManager {
  async addExpense(e) {
    if (e) e.preventDefault();
    console.log('🔄 addExpense called');
    
    try {
      const repo = window.App.Repositories.ExpenseRepository;
      if (!repo) {
        console.error('❌ ExpenseRepository not found!');
        alert('שגיאה: מאגר הנתונים לא נמצא');
        return;
      }
      
      const expenseType = document.getElementById('expenseType').value;
      const isExpense = expenseType === 'expense';
      const subtypeSelect = document.getElementById('expenseSubtype');
      const categorySelect = document.getElementById('expenseCategory');
      
      const newExpense = {
        id: Date.now(),
        date: document.getElementById('expenseDate').value,
        type: expenseType,
        // For expenses: use subtype (fixed/variable), for income: use category
        category: isExpense ? (subtypeSelect?.value || 'variable') : (categorySelect?.value || ''),
        subtype: isExpense ? (subtypeSelect?.value || 'variable') : null,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        // Only fixed expenses can be recurring
        recurring: isExpense && subtypeSelect?.value === 'fixed' ? document.getElementById('isRecurring').checked : false,
        createdAt: new Date().toISOString()
      };
      
      console.log('📝 New expense data:', newExpense);
      
      if (newExpense.type === 'income') {
        const workHours = parseFloat(document.getElementById('expenseWorkHours').value) || 0;
        newExpense.workHours = workHours;
      }
      
      if (newExpense.type === 'expense' && newExpense.recurring) {
        newExpense.recurringMonths = parseInt(document.getElementById('recurringMonthsCount').value) || 1;
        newExpense.recurrenceGroupId = newExpense.id;
        // For recurring expenses, need to add multiple entries
        await this.addRecurringExpenseToFutureMonths(newExpense);
      } else {
        // Add single expense directly to MongoDB
        const result = await repo.add(newExpense);
        console.log('✅ Expense added to MongoDB:', newExpense.type, newExpense.amount, 'Result:', result);
      }
      
      closeModal('addExpenseModal');
      await this.loadExpenseData();
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      alert('שגיאה בהוספת רשומה: ' + error.message);
    }
  }

  toggleWorkHoursField() {
    const expenseType = document.getElementById('expenseType').value;
    const workHoursGroup = document.getElementById('workHoursGroup');
    const categoryGroup = document.getElementById('categoryGroup');
    const descriptionGroup = document.getElementById('expenseDescription').parentElement;
    const recurringGroup = document.getElementById('recurringGroup');
    const recurringMonthsGroup = document.getElementById('recurringMonths');
    const expenseSubtypeGroup = document.getElementById('expenseSubtypeGroup');
    
    if (expenseType === 'income') {
      // Income: show category (sales/other), work hours, hide recurring and subtype
      if (workHoursGroup) workHoursGroup.style.display = 'block';
      if (descriptionGroup) descriptionGroup.style.display = 'block';
      if (categoryGroup) categoryGroup.style.display = 'block';
      if (expenseSubtypeGroup) expenseSubtypeGroup.style.display = 'none';
      if (recurringGroup) recurringGroup.style.display = 'none';
      if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'none';
    } else {
      // Expense: show subtype (fixed/variable), hide category
      if (workHoursGroup) workHoursGroup.style.display = 'none';
      if (descriptionGroup) descriptionGroup.style.display = 'block';
      if (categoryGroup) categoryGroup.style.display = 'none';
      if (expenseSubtypeGroup) expenseSubtypeGroup.style.display = 'block';
      const workHoursInput = document.getElementById('expenseWorkHours');
      if (workHoursInput) workHoursInput.value = '';
      
      // Show recurring option only for fixed expenses
      this.toggleRecurringBySubtype();
    }
  }
  
  toggleRecurringBySubtype() {
    const subtypeSelect = document.getElementById('expenseSubtype');
    const recurringGroup = document.getElementById('recurringGroup');
    const recurringMonthsGroup = document.getElementById('recurringMonths');
    
    if (subtypeSelect && subtypeSelect.value === 'fixed') {
      // Fixed expense - show recurring option
      if (recurringGroup) recurringGroup.style.display = 'block';
    } else {
      // Variable expense - hide recurring option
      if (recurringGroup) recurringGroup.style.display = 'none';
      if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'none';
      const isRecurringCheckbox = document.getElementById('isRecurring');
      if (isRecurringCheckbox) isRecurringCheckbox.checked = false;
    }
  }

  toggleEditWorkHoursField() {
    const expenseType = document.getElementById('editExpenseType').value;
    const workHoursGroup = document.getElementById('editWorkHoursGroup');
    const categoryGroup = document.getElementById('editCategoryGroup');
    const expenseSubtypeGroup = document.getElementById('editExpenseSubtypeGroup');
    const recurringGroup = document.getElementById('editRecurringGroup');
    const recurringMonthsGroup = document.getElementById('editRecurringMonths');
    const editScopeGroup = document.getElementById('editScopeGroup');
    
    if (expenseType === 'income') {
      // Income: show category, work hours, hide expense-specific fields
      if (workHoursGroup) workHoursGroup.style.display = 'block';
      if (categoryGroup) categoryGroup.style.display = 'block';
      if (expenseSubtypeGroup) expenseSubtypeGroup.style.display = 'none';
      if (recurringGroup) recurringGroup.style.display = 'none';
      if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'none';
      if (editScopeGroup) editScopeGroup.style.display = 'none';
    } else {
      // Expense: show subtype, hide category
      if (workHoursGroup) workHoursGroup.style.display = 'none';
      if (categoryGroup) categoryGroup.style.display = 'none';
      if (expenseSubtypeGroup) expenseSubtypeGroup.style.display = 'block';
      const workHoursInput = document.getElementById('editExpenseWorkHours');
      if (workHoursInput) workHoursInput.value = '';
      
      // Show recurring option only for fixed expenses
      this.toggleEditRecurringBySubtype();
    }
  }
  
  toggleEditRecurringBySubtype() {
    const subtypeSelect = document.getElementById('editExpenseSubtype');
    const recurringGroup = document.getElementById('editRecurringGroup');
    const recurringMonthsGroup = document.getElementById('editRecurringMonths');
    const editScopeGroup = document.getElementById('editScopeGroup');
    const isRecurringCheckbox = document.getElementById('editIsRecurring');
    
    if (subtypeSelect && subtypeSelect.value === 'fixed') {
      // Fixed expense - show recurring option
      if (recurringGroup) recurringGroup.style.display = 'block';
      // Show edit scope if it's a recurring expense
      if (isRecurringCheckbox && isRecurringCheckbox.checked && editScopeGroup) {
        editScopeGroup.style.display = 'block';
      }
    } else {
      // Variable expense - hide recurring option
      if (recurringGroup) recurringGroup.style.display = 'none';
      if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'none';
      if (editScopeGroup) editScopeGroup.style.display = 'none';
      if (isRecurringCheckbox) isRecurringCheckbox.checked = false;
    }
  }

  showAddExpenseModal() {
    document.getElementById('addExpenseForm').reset();
    document.getElementById('expenseWorkHours').value = '';
    setCurrentDate('expenseDate');
    this.toggleWorkHoursField();
    openModal('addExpenseModal');
  }

  async showEditExpenseModal(id) {
    // Coerce id to number in case it came as a quoted string from HTML
    if (typeof id === 'string') {
      const n = parseFloat(id);
      id = isNaN(n) ? id : n;
    }
    // Always work on latest data (await async call)
    const repo = window.App.Repositories.ExpenseRepository;
    expenses = (await repo.getAll() || []).filter(e => e && typeof e === 'object');
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    
    const isExpense = exp.type === 'expense';
    const isRecurringOccurrence = isExpense && (exp.recurring || exp.recurrenceGroupId);
    
    console.log('[Expense] showEditExpenseModal', { id, exp, isExpense, isRecurringOccurrence });
    
    // Set basic fields
    document.getElementById('editExpenseId').value = exp.id;
    document.getElementById('editExpenseDate').value = exp.date;
    document.getElementById('editExpenseType').value = exp.type;
    document.getElementById('editExpenseDescription').value = exp.description || '';
    document.getElementById('editExpenseAmount').value = exp.amount;
    document.getElementById('editExpenseWorkHours').value = exp.workHours || '';
    
    // Set subtype for expenses (fixed/variable)
    const subtypeSelect = document.getElementById('editExpenseSubtype');
    if (subtypeSelect && isExpense) {
      // Use subtype if available, otherwise derive from category or recurring status
      const subtype = exp.subtype || (exp.category === 'fixed' || isRecurringOccurrence ? 'fixed' : 'variable');
      subtypeSelect.value = subtype;
    }
    
    // Set category for income
    const categorySelect = document.getElementById('editExpenseCategory');
    if (categorySelect && !isExpense) {
      categorySelect.value = exp.category || '';
    }
    
    // Set recurring checkbox
    const isRecurringCheckbox = document.getElementById('editIsRecurring');
    if (isRecurringCheckbox) {
      isRecurringCheckbox.checked = isRecurringOccurrence;
    }
    
    // If this is a recurring occurrence, get the actual group size for months count
    let recurringMonthsValue = 1;
    if (isRecurringOccurrence) {
      const groupId = exp.recurrenceGroupId || exp.id;
      const groupEntries = expenses.filter(e => e && ((e.recurrenceGroupId || e.id) === groupId));
      recurringMonthsValue = groupEntries.length || parseInt(exp.recurringMonths || 1, 10);
    }
    document.getElementById('editRecurringMonthsCount').value = recurringMonthsValue;
    
    // Toggle form fields based on type
    this.toggleEditWorkHoursField();
    
    // Show edit scope option for recurring expenses
    const editScopeGroup = document.getElementById('editScopeGroup');
    if (editScopeGroup) {
      editScopeGroup.style.display = isRecurringOccurrence ? 'block' : 'none';
    }
    
    // Force show recurring controls if this is a recurring occurrence
    if (isRecurringOccurrence) {
      const recurringGroup = document.getElementById('editRecurringGroup');
      const recurringMonthsGroup = document.getElementById('editRecurringMonths');
      if (recurringGroup) recurringGroup.style.display = 'block';
      if (recurringMonthsGroup) recurringMonthsGroup.style.display = 'block';
    }
    
    openModal('editExpenseModal');
  }

  async saveEditedExpense(e) {
    console.log('[Expense] saveEditedExpense CALLED - form submitted');
    if (e) e.preventDefault();
    const form = document.getElementById('editExpenseForm');
    if (form) {
      // Surface HTML5 validation errors to the user if any
      if (!form.checkValidity()) {
        console.warn('[Expense] saveEditedExpense: form invalid');
        form.reportValidity();
        return;
      }
      console.log('[Expense] Form validation passed');
    }
    const repo = window.App.Repositories.ExpenseRepository;
    // Ensure latest state (await async call)
    expenses = (await repo.getAll() || []).filter(x => x && typeof x === 'object');
    const id = parseFloat(document.getElementById('editExpenseId').value);
    console.log('[Expense] Looking for expense with id:', id);
    const index = expenses.findIndex(exp => exp.id === id);
    if (index === -1) {
      console.error('[Expense] Expense not found in array', { id, expensesCount: expenses.length });
      return;
    }
    console.log('[Expense] Found expense at index:', index);
    const originalExpense = { ...expenses[index] };
    const expenseType = document.getElementById('editExpenseType').value;
    const isRecurring = expenseType === 'expense' ? document.getElementById('editIsRecurring').checked : false;
    const rmRaw = document.getElementById('editRecurringMonthsCount').value;
    let recurringMonths = isRecurring ? parseInt(rmRaw, 10) : 1;
    if (isRecurring && (!rmRaw || isNaN(recurringMonths))) {
      // Infer from current group size if user left it blank
      const groupId = (originalExpense.recurrenceGroupId || originalExpense.id);
      const groupEntries = (expenses || []).filter(e => e && ((e.recurrenceGroupId || e.id) === groupId));
      recurringMonths = groupEntries.length || parseInt(originalExpense.recurringMonths || 1, 10) || 1;
    }
    if (isRecurring && recurringMonths < 1) {
      alert('מספר חזרות חייב להיות לפחות 1');
      return;
    }
    // Ensure category value remains selected even if options list changed
    const categoryEl = document.getElementById('editExpenseCategory');
    const categoryVal = categoryEl ? categoryEl.value : '';
    if (categoryEl && categoryVal && !Array.from(categoryEl.options).some(o => o.value === categoryVal)) {
      const opt = document.createElement('option');
      opt.value = categoryVal; opt.textContent = categoryVal; opt.selected = true;
      categoryEl.appendChild(opt);
    }
    const isExpense = expenseType === 'expense';
    const subtypeSelect = document.getElementById('editExpenseSubtype');
    const categorySelect = document.getElementById('editExpenseCategory');
    const editScopeSelect = document.getElementById('editScope');
    const editScope = editScopeSelect ? editScopeSelect.value : 'single';
    
    let edited = {
      ...expenses[index],
      type: expenseType,
      // For expenses: use subtype, for income: use category
      category: isExpense ? (subtypeSelect?.value || 'variable') : (categorySelect?.value || ''),
      subtype: isExpense ? (subtypeSelect?.value || 'variable') : null,
      description: document.getElementById('editExpenseDescription').value,
      amount: parseFloat(document.getElementById('editExpenseAmount').value),
      date: document.getElementById('editExpenseDate').value,
      recurring: isRecurring,
      recurringMonths: recurringMonths
    };
    
    console.log('[Expense] resolved recurringMonths', { isRecurring, rmRaw, recurringMonths, editScope });
    
    if (expenseType === 'income') {
      const wh = parseFloat(document.getElementById('editExpenseWorkHours').value) || 0;
      edited.workHours = wh;
      delete edited.recurrenceGroupId;
      delete edited.subtype;
    } else {
      delete edited.workHours;
    }
    
    expenses[index] = edited;
    console.log('[Expense] saveEditedExpense', { originalExpense, edited, editScope });
    
    const origGroup = originalExpense.recurrenceGroupId || originalExpense.id;
    const wasRecurring = originalExpense.type === 'expense' && (originalExpense.recurring || originalExpense.recurrenceGroupId);
    const changedToIncome = originalExpense.type === 'expense' && expenseType === 'income';
    const turnedOffRecurring = originalExpense.type === 'expense' && originalExpense.recurring && !isRecurring;
    
    try {
      if (changedToIncome || turnedOffRecurring) {
        console.log('[Expense] Converting to income or turning off recurring');
        // Remove old recurring group and add the single edited expense
        await repo.removeGroup(origGroup);
        await repo.add(edited);
        console.log('✅ Expense converted and saved to MongoDB');
      } else if (isExpense && isRecurring && editScope === 'all') {
        console.log('[Expense] Editing ALL recurring occurrences');
        // Rebuild the entire recurring group with new values
        edited.recurrenceGroupId = edited.recurrenceGroupId || origGroup;
        await this.addRecurringExpenseToFutureMonths(edited);
        console.log('✅ All recurring expenses updated in MongoDB');
      } else if (isExpense && wasRecurring && editScope === 'single') {
        console.log('[Expense] Editing ONLY this occurrence');
        // Just update this single occurrence, keep recurrence group intact
        await repo.update(edited);
        console.log('✅ Single occurrence updated in MongoDB');
      } else {
        // Simple update - just update the single expense
        await repo.update(edited);
        console.log('✅ Expense updated in MongoDB');
      }
    } catch (err) {
      console.error('[Expense] saveEditedExpense error saving', err);
      alert('שגיאה בשמירת העדכון. רענן ונסה שוב.');
      return;
    }
    console.log('[Expense] Closing modal and reloading data');
    closeModal('editExpenseModal');
    // Auto-switch Year filter to the edited item's year to make the change visible
    const yearSelect = document.getElementById('expenseYear');
    if (yearSelect && edited && edited.date) {
      const y = new Date(edited.date).getFullYear();
      yearSelect.value = String(y);
    }
    await this.loadExpenseData();
  }

  async deleteExpense(id) {
    const repo = window.App.Repositories.ExpenseRepository;
    // Ensure latest state (await async call)
    expenses = (await repo.getAll() || []).filter(x => x && typeof x === 'object');
    // Coerce id from string if needed
    if (typeof id === 'string') {
      const n = parseFloat(id);
      id = isNaN(n) ? id : n;
    }
    const exp = expenses.find(e => e && (e.id === id || String(e.id) === String(id)));
    if (!exp) {
      console.warn('[Expense] deleteExpense: item not found', { id });
      return;
    }
    console.log('[Expense] deleteExpense', { id, exp });
    
    // First confirmation for all deletions
    const typeText = exp.type === 'income' ? 'הכנסה' : 'הוצאה';
    const firstConfirm = confirm(`האם אתה בטוח שברצונך למחוק ${typeText} זו?\n\nתיאור: ${exp.description || 'ללא תיאור'}\nסכום: ${exp.amount} ₪`);
    if (!firstConfirm) return;
    
    if (exp.type === 'expense' && (exp.recurring || exp.recurrenceGroupId)) {
      const groupId = exp.recurrenceGroupId || exp.id;
      const groupEntries = expenses.filter(e => e && ((e.recurrenceGroupId || e.id) === groupId));
      if (groupEntries.length > 1) {
        // Custom dialog for recurring expenses with better button text
        const deleteAll = confirm('רשומה זו היא חלק מהוצאה חוזרת.\n\nלחץ OK למחוק את כל ההוצאות החוזרות\nלחץ Cancel למחוק רק הוצאה זו');
        if (deleteAll) {
          await repo.removeGroup(groupId);
          expenses = expenses.filter(e => e && ((e.recurrenceGroupId || e.id) !== groupId));
        } else {
          await repo.removeById(id);
          expenses = expenses.filter(e => e && !(e.id === id || String(e.id) === String(id)));
        }
      } else {
        await repo.removeById(id);
        expenses = expenses.filter(e => e && !(e.id === id || String(e.id) === String(id)));
      }
    } else {
      await repo.removeById(id);
      expenses = expenses.filter(e => e && !(e.id === id || String(e.id) === String(id)));
    }
    console.log('✅ Expense deleted:', id);
    await this.loadExpenseData();
  }

  async loadExpenseData() {
    const repo = window.App.Repositories.ExpenseRepository;
    // Ensure latest state (await async call)
    expenses = await repo.getAll();
    const yearEl = document.getElementById('expenseYear');
    const monthEl = document.getElementById('expenseMonth');
    const now = new Date();
    // Populate year dropdown from data to support cross-year recurring entries
    const yearsInData = (expenses || [])
      .filter(e => e && e.date)
      .map(e => new Date(e.date).getFullYear());
    const uniqYears = Array.from(new Set(yearsInData.concat([now.getFullYear()]))).sort((a,b) => a - b);
    if (yearEl && yearEl.options && uniqYears.length) {
      const prev = parseInt(yearEl.value || now.getFullYear(), 10);
      const prevExists = uniqYears.includes(prev);
      yearEl.innerHTML = uniqYears.map(y => `<option value="${y}">${y}</option>`).join('');
      yearEl.value = prevExists ? String(prev) : String(now.getFullYear());
    }
    const year = yearEl ? parseInt(yearEl.value, 10) : now.getFullYear();
    const monthVal = monthEl ? parseInt(monthEl.value, 10) : 0; // 0 => all months
    const monthIndex = monthVal === 0 ? null : monthVal - 1;
    const filtered = expenses.filter(exp => {
      if (!exp || !exp.date) return false;
      const d = new Date(exp.date);
      const inYear = d.getFullYear() === year;
      const inMonth = monthIndex === null || d.getMonth() === monthIndex;
      return inYear && inMonth;
    });
    const table = document.getElementById('expenseTable');
    const tbody = table ? table.querySelector('tbody') : null;
    if (tbody) tbody.innerHTML = '';
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalWorkHours = 0;
    filtered.forEach(exp => {
      if (!exp) return;
      if (!tbody) return; // if table not present, skip rendering rows but still compute totals
      const row = tbody.insertRow();
      const d = new Date(exp.date);
      const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
      const categoryMap = {
        sales: 'מכירות', other: 'אחר', fixed: 'הוצאות קבועות', variable: 'הוצאות משתנות', general: 'הוצאות כלליות'
      };
      const categoryLabel = categoryMap[exp.category] || exp.category;
      const workHoursDisplay = exp.type === 'income' ? (exp.workHours || 0) : '';
      row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${exp.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
            <td>${categoryLabel}</td>
            <td>${exp.description || ''}</td>
            <td>${formatILS(exp.amount)}</td>
            <td>${workHoursDisplay}</td>
            <td>${exp.recurring ? 'כן' : 'לא'}</td>
            <td class="action-buttons">
                <button class="btn-small btn-warning" onclick="showEditExpenseModal('${String(exp.id)}')">ערוך</button>
                <button class="btn-small btn-danger" onclick="deleteExpense('${String(exp.id)}')">מחק</button>
            </td>`;
      if (exp.type === 'income') {
        totalIncome += exp.amount;
        totalWorkHours += exp.workHours || 0;
      } else {
        totalExpenses += exp.amount;
      }
    });
    const totalSalary = totalWorkHours * settings.laborHourRate;
    const salaryEl = document.getElementById('totalSalaryFromHours');
    const incomeEl = document.getElementById('totalIncome');
    const expensesEl = document.getElementById('totalExpenses');
    if (salaryEl) salaryEl.innerHTML = formatILS(totalSalary);
    if (incomeEl) incomeEl.innerHTML = formatILS(totalIncome);
    if (expensesEl) expensesEl.innerHTML = formatILS(totalExpenses);
    const netProfit = totalIncome - totalExpenses;
    const profitEl = document.getElementById('netProfit');
    if (profitEl) profitEl.innerHTML = formatILS(netProfit);
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0;
    const marginEl = document.getElementById('profitMargin');
    if (marginEl) marginEl.textContent = `${profitMargin}%`;
    console.log('[Expense] loadExpenseData', { year, monthVal, count: filtered.length, totals: { totalIncome, totalExpenses, totalWorkHours } });
  }

  async addRecurringExpenseToFutureMonths(expense) {
    const repo = window.App.Repositories.ExpenseRepository;
    // Rebuild entire group from the group's base date, applying the updated fields to all
    const groupId = expense.recurrenceGroupId || expense.id;
    expense.recurrenceGroupId = groupId;
    
    // Get current expenses from repo
    expenses = await repo.getAll();
    expenses = (expenses || []).filter(e => e && typeof e === 'object');
    
    const groupEntries = expenses.filter(e => e && ((e.recurrenceGroupId || e.id) === groupId));
    // Determine base: prefer item whose id === groupId, else earliest date
    let baseItem = groupEntries.find(e => e && e.id === groupId) || null;
    if (!baseItem && groupEntries.length) {
      baseItem = groupEntries.reduce((min, cur) => {
        if (!min) return cur;
        return new Date(cur.date) < new Date(min.date) ? cur : min;
      }, null);
    }
    const baseDateObj = new Date((baseItem && baseItem.date) || expense.date);
    const baseYear = baseDateObj.getFullYear();
    const baseMonth = baseDateObj.getMonth();
    const baseDay = baseDateObj.getDate();
    const totalOccurrences = Math.max(1, parseInt(expense.recurringMonths || 1, 10));

    // Remove existing group from MongoDB
    await repo.removeGroup(groupId);

    // Create base (i=0) with id = groupId to preserve main id
    const baseDateString = new Date(baseYear, baseMonth, baseDay).toISOString().split('T')[0];
    const baseExpense = {
      ...expense,
      id: groupId,
      date: baseDateString,
      type: 'expense',
      recurring: true,
      recurrenceGroupId: groupId
    };
    await repo.add(baseExpense);

    // Create future occurrences
    for (let i = 1; i < totalOccurrences; i++) {
      const futureDate = new Date(baseYear, baseMonth + i, baseDay);
      const futureDateString = futureDate.toISOString().split('T')[0];
      const futureExpense = {
        ...expense,
        id: Date.now() + Math.floor(Math.random() * 1000) + i,
        date: futureDateString,
        type: 'expense',
        recurring: true,
        recurrenceGroupId: groupId
      };
      await repo.add(futureExpense);
    }
    console.log('✅ Recurring expenses added to MongoDB', { groupId, totalOccurrences, baseDate: baseDateString });
  }
}

window.App.Managers.expenseManager = new ExpenseManager();
