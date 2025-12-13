const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Check if user is authorized by Firebase UID
router.get('/check/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        if (!uid) {
            return res.status(400).json({ authorized: false, error: 'UID is required' });
        }

        const db = await getDatabase();
        const collection = db.collection('authorizedUsers');
        
        const user = await collection.findOne({ uid: uid });
        
        if (user) {
            console.log(`✅ User authorized: ${user.email || uid}`);
            return res.json({ 
                authorized: true, 
                user: {
                    uid: user.uid,
                    email: user.email,
                    name: user.name
                }
            });
        } else {
            console.log(`❌ User not authorized: ${uid}`);
            return res.json({ authorized: false });
        }
    } catch (error) {
        console.error('❌ Authorization check error:', error);
        return res.status(500).json({ authorized: false, error: 'Server error' });
    }
});

// Get all authorized users (for admin purposes)
router.get('/users', async (req, res) => {
    try {
        const db = await getDatabase();
        const collection = db.collection('authorizedUsers');
        
        const users = await collection.find({}).toArray();
        
        res.json({ users });
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add authorized user
router.post('/users', async (req, res) => {
    try {
        const { uid, email, name } = req.body;
        
        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        const db = await getDatabase();
        const collection = db.collection('authorizedUsers');
        
        // Check if user already exists
        const existing = await collection.findOne({ uid: uid });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const newUser = {
            uid,
            email: email || null,
            name: name || null,
            createdAt: new Date().toISOString()
        };
        
        await collection.insertOne(newUser);
        
        console.log(`✅ Added authorized user: ${email || uid}`);
        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('❌ Add user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove authorized user
router.delete('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        const db = await getDatabase();
        const collection = db.collection('authorizedUsers');
        
        const result = await collection.deleteOne({ uid: uid });
        
        if (result.deletedCount > 0) {
            console.log(`✅ Removed authorized user: ${uid}`);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Remove user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
