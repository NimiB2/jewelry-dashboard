// Income API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Get all income
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const income = await db.collection('income').find({}).toArray();
        res.json(income);
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ error: 'Failed to fetch income' });
    }
});

// Get single income by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const incomeId = parseFloat(req.params.id);
        const income = await db.collection('income').findOne({ id: incomeId });
        
        if (!income) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json(income);
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ error: 'Failed to fetch income' });
    }
});

// Create new income
router.post('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const income = req.body;
        
        // Ensure income has an ID
        if (!income.id) {
            income.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        
        const result = await db.collection('income').insertOne(income);
        res.status(201).json({ ...income, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ error: 'Failed to create income' });
    }
});

// Update income
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const incomeId = parseFloat(req.params.id);
        const updates = req.body;
        
        // Remove _id from updates
        delete updates._id;
        
        const result = await db.collection('income').updateOne(
            { id: incomeId },
            { $set: updates }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ error: 'Failed to update income' });
    }
});

// Delete income
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const incomeId = parseFloat(req.params.id);
        
        const result = await db.collection('income').deleteOne({ id: incomeId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Income not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Failed to delete income' });
    }
});

// Bulk save income (for migration)
router.post('/bulk', async (req, res) => {
    try {
        const db = await getDatabase();
        const incomeList = req.body;
        
        if (!Array.isArray(incomeList)) {
            return res.status(400).json({ error: 'Expected array of income' });
        }
        
        // Clear existing income and insert new ones
        await db.collection('income').deleteMany({});
        
        if (incomeList.length > 0) {
            await db.collection('income').insertMany(incomeList);
        }
        
        res.json({ success: true, count: incomeList.length });
    } catch (error) {
        console.error('Error bulk saving income:', error);
        res.status(500).json({ error: 'Failed to bulk save income' });
    }
});

module.exports = router;
