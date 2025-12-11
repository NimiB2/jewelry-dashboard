// Products API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Get all products
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const products = await db.collection('products').find({}).toArray();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const productId = parseInt(req.params.id);
        const product = await db.collection('products').findOne({ id: productId });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create new product
router.post('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const product = req.body;
        
        // Ensure product has an ID
        if (!product.id) {
            product.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        
        const result = await db.collection('products').insertOne(product);
        res.status(201).json({ ...product, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const productId = parseInt(req.params.id);
        const updates = { ...req.body };
        
        // Remove _id from updates to avoid MongoDB error
        delete updates._id;
        
        // Ensure id is preserved
        updates.id = productId;
        
        console.log(`📝 Updating product ${productId}:`, updates.name);
        
        const result = await db.collection('products').updateOne(
            { id: productId },
            { $set: updates }
        );
        
        if (result.matchedCount === 0) {
            console.log(`⚠️ Product ${productId} not found for update`);
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log(`✅ Product ${productId} updated successfully`);
        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const productId = parseInt(req.params.id);
        
        const result = await db.collection('products').deleteOne({ id: productId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Bulk save products (for migration)
router.post('/bulk', async (req, res) => {
    try {
        const db = await getDatabase();
        let products = req.body;
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Expected array of products' });
        }
        
        // Remove _id fields to avoid MongoDB duplicate key errors
        products = products.map(p => {
            const { _id, ...productWithoutId } = p;
            return productWithoutId;
        });
        
        // Clear existing products and insert new ones
        await db.collection('products').deleteMany({});
        
        if (products.length > 0) {
            await db.collection('products').insertMany(products);
        }
        
        res.json({ success: true, count: products.length });
    } catch (error) {
        console.error('Error bulk saving products:', error);
        res.status(500).json({ error: 'Failed to bulk save products' });
    }
});

module.exports = router;
