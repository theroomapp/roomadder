// Backend Integration Example for The Room Admin Dashboard
// This example shows how to create API endpoints that integrate with your existing app

// Option 1: Express.js Server Example
const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();

// Initialize Firebase Admin (server-side)
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'the-room-92cdd.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Authentication middleware (verify admin access)
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No valid authorization header' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Check if user is admin (you can implement your own admin check logic)
        const adminEmails = ['admin@theroom.com', 'manager@theroom.com'];
        if (!adminEmails.includes(decodedToken.email)) {
            return res.status(403).json({ error: 'Access denied - admin privileges required' });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};

// Routes

// 1. Upload room images
app.post('/api/upload', authenticateAdmin, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const timestamp = Date.now();
        const fileName = `rooms/${timestamp}_${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Upload file to Firebase Storage
        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        // Make file publicly accessible
        await file.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        res.json({ 
            success: true, 
            url: publicUrl,
            fileName: fileName 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// 2. Create new room (matches your iOS app's room structure)
app.post('/api/rooms', authenticateAdmin, async (req, res) => {
    try {
        const {
            name,
            type,
            status = 'available',
            description,
            hotspot,
            location,
            images
        } = req.body;

        // Validation
        if (!name || !type || !location || !location.coordinates) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, location.coordinates' 
            });
        }

        // Create room document matching your iOS app's structure
        const roomData = {
            name: name.trim(),
            type,
            status,
            description: description || '',
            hotspot: hotspot || 50,
            location: {
                type: "Point",
                coordinates: location.coordinates // [longitude, latitude]
            },
            images: {
                url1: images?.url1 || null,
                url2: images?.url2 || null
            },
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            created_by: req.user.uid,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add to Firestore
        const docRef = await db.collection('rooms').add(roomData);
        
        res.json({ 
            success: true, 
            id: docRef.id,
            roomId: docRef.id,
            message: 'Room created successfully' 
        });

        console.log(`✅ Room created: ${name} (${docRef.id})`);
    } catch (error) {
        console.error('Room creation error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// 3. Get all rooms
app.get('/api/rooms', authenticateAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('rooms').orderBy('created_at', 'desc').get();
        const rooms = [];

        snapshot.forEach(doc => {
            rooms.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ success: true, rooms });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// 4. Update room
app.put('/api/rooms/:id', authenticateAdmin, async (req, res) => {
    try {
        const roomId = req.params.id;
        const updateData = {
            ...req.body,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('rooms').doc(roomId).update(updateData);
        
        res.json({ 
            success: true, 
            message: 'Room updated successfully' 
        });
    } catch (error) {
        console.error('Room update error:', error);
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// 5. Delete room
app.delete('/api/rooms/:id', authenticateAdmin, async (req, res) => {
    try {
        const roomId = req.params.id;
        
        // Get room data first to delete associated images
        const roomDoc = await db.collection('rooms').doc(roomId).get();
        if (!roomDoc.exists) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const roomData = roomDoc.data();
        
        // Delete associated images from storage
        if (roomData.images?.url1) {
            try {
                const fileName = roomData.images.url1.split('/').pop();
                await bucket.file(`rooms/${fileName}`).delete();
            } catch (err) {
                console.log('Error deleting image 1:', err);
            }
        }
        
        if (roomData.images?.url2) {
            try {
                const fileName = roomData.images.url2.split('/').pop();
                await bucket.file(`rooms/${fileName}`).delete();
            } catch (err) {
                console.log('Error deleting image 2:', err);
            }
        }

        // Delete room document
        await db.collection('rooms').doc(roomId).delete();
        
        res.json({ 
            success: true, 
            message: 'Room deleted successfully' 
        });
    } catch (error) {
        console.error('Room deletion error:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'The Room Admin API'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Max 10MB allowed.' });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 The Room Admin API running on port ${PORT}`);
});

// Option 2: Firebase Functions Example
// If you prefer to use Firebase Functions instead of Express

const functions = require('firebase-functions');

// Create room via Firebase Function
exports.createRoomAdmin = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Authenticate user (similar to Express example)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Admin check
        const adminEmails = ['admin@theroom.com', 'manager@theroom.com'];
        if (!adminEmails.includes(decodedToken.email)) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        // Create room (same logic as Express example)
        const roomData = {
            name: req.body.name,
            type: req.body.type,
            status: req.body.status || 'available',
            description: req.body.description || '',
            hotspot: req.body.hotspot || 50,
            location: req.body.location,
            images: req.body.images || { url1: null, url2: null },
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            created_by: decodedToken.uid
        };

        const docRef = await admin.firestore().collection('rooms').add(roomData);
        
        res.json({ 
            success: true, 
            id: docRef.id,
            message: 'Room created successfully' 
        });

    } catch (error) {
        console.error('Firebase Function error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Export the Express app for serverless deployment (e.g., Vercel, Netlify)
module.exports = app; 