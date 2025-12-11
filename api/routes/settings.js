// Settings API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Get settings
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const settings = await db.collection('settings').findOne({ key: 'appSettings' });
        
        if (!settings) {
            return res.json({ categories: null });
        }
        
        res.json(settings.data || { categories: null });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Save settings
router.post('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const settingsData = req.body;
        
        const result = await db.collection('settings').updateOne(
            { key: 'appSettings' },
            { 
                $set: { 
                    key: 'appSettings',
                    data: settingsData,
                    updatedAt: new Date()
                } 
            },
            { upsert: true }
        );
        
        res.json({ success: true, modified: result.modifiedCount || result.upsertedCount });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Get collections
router.get('/collections', async (req, res) => {
    try {
        const db = await getDatabase();
        const collections = await db.collection('settings').findOne({ key: 'collections' });
        
        if (!collections) {
            return res.json([]);
        }
        
        res.json(collections.data || []);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

// Save collections
router.post('/collections', async (req, res) => {
    try {
        const db = await getDatabase();
        const collectionsData = req.body;
        
        const result = await db.collection('settings').updateOne(
            { key: 'collections' },
            { 
                $set: { 
                    key: 'collections',
                    data: collectionsData,
                    updatedAt: new Date()
                } 
            },
            { upsert: true }
        );
        
        res.json({ success: true, modified: result.modifiedCount || result.upsertedCount });
    } catch (error) {
        console.error('Error saving collections:', error);
        res.status(500).json({ error: 'Failed to save collections' });
    }
});

module.exports = router;
