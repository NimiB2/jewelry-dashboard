// Orders API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const orders = await db.collection('orders').find({}).toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const orderId = parseInt(req.params.id);
        const order = await db.collection('orders').findOne({ id: orderId });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Get next order number
router.get('/meta/next-number', async (req, res) => {
    try {
        const db = await getDatabase();
        const meta = await db.collection('metadata').findOne({ key: 'nextOrderNumber' });
        const nextNumber = meta ? meta.value : 1000;
        res.json({ nextOrderNumber: nextNumber });
    } catch (error) {
        console.error('Error fetching next order number:', error);
        res.status(500).json({ error: 'Failed to fetch next order number' });
    }
});

// Allocate next order number (atomic operation)
router.post('/meta/allocate-number', async (req, res) => {
    try {
        const db = await getDatabase();
        
        // Use findOneAndUpdate with $inc for atomic increment
        const result = await db.collection('metadata').findOneAndUpdate(
            { key: 'nextOrderNumber' },
            { $inc: { value: 1 } },
            { 
                upsert: true, 
                returnDocument: 'before',
                projection: { value: 1 }
            }
        );
        
        const allocatedNumber = result.value ? result.value.value : 1000;
        
        // If this was the first allocation, ensure we start from 1000
        if (!result.value) {
            await db.collection('metadata').updateOne(
                { key: 'nextOrderNumber' },
                { $set: { value: 1001 } }
            );
        }
        
        res.json({ orderNumber: allocatedNumber });
    } catch (error) {
        console.error('Error allocating order number:', error);
        res.status(500).json({ error: 'Failed to allocate order number' });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const order = req.body;
        
        // Ensure order has an ID
        if (!order.id) {
            order.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        
        const result = await db.collection('orders').insertOne(order);
        res.status(201).json({ ...order, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const orderId = parseInt(req.params.id);
        const updates = req.body;
        
        // Remove _id from updates
        delete updates._id;
        
        const result = await db.collection('orders').updateOne(
            { id: orderId },
            { $set: updates }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Delete order
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const orderId = parseInt(req.params.id);
        
        const result = await db.collection('orders').deleteOne({ id: orderId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Bulk save orders (for migration)
router.post('/bulk', async (req, res) => {
    try {
        const db = await getDatabase();
        const orders = req.body;
        
        if (!Array.isArray(orders)) {
            return res.status(400).json({ error: 'Expected array of orders' });
        }
        
        // Clear existing orders and insert new ones
        await db.collection('orders').deleteMany({});
        
        if (orders.length > 0) {
            await db.collection('orders').insertMany(orders);
        }
        
        res.json({ success: true, count: orders.length });
    } catch (error) {
        console.error('Error bulk saving orders:', error);
        res.status(500).json({ error: 'Failed to bulk save orders' });
    }
});

module.exports = router;
