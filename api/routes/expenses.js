// Expenses API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const expenses = await db.collection('expenses').find({}).toArray();
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Get single expense by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const expenseId = parseInt(req.params.id);
        const expense = await db.collection('expenses').findOne({ id: expenseId });
        
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
});

// Create new expense
router.post('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const expense = req.body;
        
        // Ensure expense has an ID
        if (!expense.id) {
            expense.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        
        const result = await db.collection('expenses').insertOne(expense);
        res.status(201).json({ ...expense, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Update expense
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const expenseId = parseInt(req.params.id);
        const updates = req.body;
        
        // Remove _id from updates
        delete updates._id;
        
        const result = await db.collection('expenses').updateOne(
            { id: expenseId },
            { $set: updates }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete expense
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const expenseId = parseInt(req.params.id);
        
        const result = await db.collection('expenses').deleteOne({ id: expenseId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Delete expense group (for recurring expenses)
router.delete('/group/:groupId', async (req, res) => {
    try {
        const db = await getDatabase();
        const groupId = req.params.groupId;
        
        const result = await db.collection('expenses').deleteMany({
            $or: [
                { recurrenceGroupId: groupId },
                { id: parseInt(groupId) }
            ]
        });
        
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting expense group:', error);
        res.status(500).json({ error: 'Failed to delete expense group' });
    }
});

// Bulk save expenses (for migration)
router.post('/bulk', async (req, res) => {
    try {
        const db = await getDatabase();
        const expenses = req.body;
        
        if (!Array.isArray(expenses)) {
            return res.status(400).json({ error: 'Expected array of expenses' });
        }
        
        // Clear existing expenses and insert new ones
        await db.collection('expenses').deleteMany({});
        
        if (expenses.length > 0) {
            await db.collection('expenses').insertMany(expenses);
        }
        
        res.json({ success: true, count: expenses.length });
    } catch (error) {
        console.error('Error bulk saving expenses:', error);
        res.status(500).json({ error: 'Failed to bulk save expenses' });
    }
});

module.exports = router;
