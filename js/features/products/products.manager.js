// ProductManager (Phase 2): move product logic into an OOP class.
// Global functions in app.js will call into this manager to preserve behavior.

window.App = window.App || {};
window.App.Managers = window.App.Managers || {};

class ProductManager {
  addToProducts() {
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = repo.getAll();
    const product = {
      id: Date.now(),
      type: document.getElementById('productType').value,
      name: 'דגם חדש',
      material: document.getElementById('material').value,
      cost: parseFloat(document.getElementById('totalCost').textContent.replace('₪', '')),
      price: parseFloat(document.getElementById('recommendedPrice').textContent.replace('₪', '')),
      sitePrice: 0
    };
    products.push(product);
    repo.saveAll(products);
    this.loadProducts();
  }

  loadProducts() {
    const repo = window.App.Repositories.ProductRepository;
    // Ensure latest state
    products = repo.getAll();
    const tbody = document.getElementById('productsTable').querySelector('tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
      const row = tbody.insertRow();
      const profit = p.sitePrice > 0 ? ((p.sitePrice - p.cost) / p.cost * 100).toFixed(2) : 0;
      row.innerHTML = `
            <td>${p.type}</td>
            <td>${p.name}</td>
            <td>${p.material}</td>
            <td>${formatILS(p.cost)}</td>
            <td>${formatILS(p.price)}</td>
            <td>${formatILS(p.sitePrice)}</td>
            <td>${profit}%</td>
            <td class="action-buttons">
                <button class="btn-small btn-warning" onclick="showEditProductModal(${p.id})">ערוך</button>
                <button class="btn-small btn-danger" onclick="deleteProduct(${p.id})">מחק</button>
            </td>
        `;
    });
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
      document.getElementById('editProductCost').value = product.cost;
      document.getElementById('editProductPrice').value = product.price;
      document.getElementById('editProductSitePrice').value = product.sitePrice;
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
      products[index] = {
        ...products[index],
        type: document.getElementById('editProductType').value,
        name: document.getElementById('editProductName').value,
        material: document.getElementById('editProductMaterial').value,
        cost: parseFloat(document.getElementById('editProductCost').value),
        price: parseFloat(document.getElementById('editProductPrice').value),
        sitePrice: parseFloat(document.getElementById('editProductSitePrice').value)
      };
      repo.saveAll(products);
      closeModal('editProductModal');
      this.loadProducts();
    }
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
