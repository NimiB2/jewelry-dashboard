// OrderManager (Phase 2): move order logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class OrderManager {
  loadOrders() {
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state
    orders = repo.getAll();
    const month = document.getElementById('orderMonth').value;
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      return month == 0 || (orderDate.getMonth() + 1) == month;
    });
    const tbody = document.getElementById('ordersTable').querySelector('tbody');
    tbody.innerHTML = '';
    filteredOrders.forEach(o => {
      const row = tbody.insertRow();
      row.innerHTML = `
            <td>${o.number}</td>
            <td>${o.date}</td>
            <td>${o.customer}</td>
            <td>${o.products}</td>
            <td>${formatILS(o.amount)}</td>
            <td><span class="receipt-badge ${o.receiptSent ? 'receipt-sent' : 'receipt-not-sent'}">${o.receiptSent ? 'נשלחה' : 'לא נשלחה'}</span></td>
            <td><span class="status-badge status-${o.status}" onclick="cycleOrderStatus(${o.id})">${o.status}</span></td>
            <td class="action-buttons">
                <button class="btn-small btn-danger" onclick="deleteOrder(${o.id})">מחק</button>
            </td>
        `;
    });
  }

  showAddOrderModal() {
    openModal('addOrderModal');
  }

  addOrder(e) {
    e.preventDefault();
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state
    orders = repo.getAll();
    // Use repository-managed order numbering
    // If NEXT_KEY not initialized but global nextOrderNumber exists, initialize it to keep continuity
    const existingNext = localStorage.getItem('nextOrderNumber');
    if (existingNext === null && typeof nextOrderNumber !== 'undefined' && Number.isFinite(parseInt(nextOrderNumber, 10))) {
      repo.setNextOrderNumber(parseInt(nextOrderNumber, 10));
    }
    const nextNo = repo.incrementAndGet();
    nextOrderNumber = nextNo + 0; // keep global in sync
    const newOrder = {
      id: Date.now(),
      number: nextNo,
      date: new Date().toISOString().split('T')[0],
      customer: document.getElementById('customerName').value,
      products: document.getElementById('orderProducts').value,
      amount: parseFloat(document.getElementById('orderAmount').value),
      receiptSent: document.getElementById('receiptSent').checked,
      notes: document.getElementById('orderNotes').value,
      status: 'new'
    };
    orders.push(newOrder);
    repo.saveAll(orders);
    closeModal('addOrderModal');
    this.loadOrders();
  }

  deleteOrder(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
      const repo = window.App.Repositories.OrderRepository;
      // Ensure latest state
      orders = repo.getAll();
      orders = orders.filter(o => o.id !== id);
      repo.saveAll(orders);
      this.loadOrders();
    }
  }

  cycleOrderStatus(id) {
    const repo = window.App.Repositories.OrderRepository;
    // Ensure latest state
    orders = repo.getAll();
    const order = orders.find(o => o.id === id);
    const statuses = ['new', 'processing', 'ready', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    order.status = statuses[(currentIndex + 1) % statuses.length];
    repo.saveAll(orders);
    this.loadOrders();
  }
}

window.App.Managers.orderManager = new OrderManager();
