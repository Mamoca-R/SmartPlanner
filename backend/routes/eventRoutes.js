const express = require('express');
const db = require('../database');
const authenticateToken = require('../middleware/authMiddleware'); // Import auth middleware

const router = express.Router();

// --- Middleware to apply authentication to all event routes ---
router.use(authenticateToken);

// --- Get all events for the logged-in user ---
router.get('/', (req, res) => {
  const userId = req.user.userId; // Get userId from the authenticated token payload

  // Fetch both active (isCompleted=0) and completed (isCompleted=1) events
  db.all('SELECT id, title, description, startTime, endTime, color, isCompleted FROM events WHERE userId = ? ORDER BY startTime ASC', [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching events:', err.message);
      return res.status(500).json({ message: 'Error fetching events.' });
    }
    // Separate events into active and completed
    const activeEvents = rows.filter(event => event.isCompleted === 0);
    const completedEvents = rows.filter(event => event.isCompleted === 1);
    
    res.json({ activeEvents, completedEvents });
  });
});

// --- Add a new event for the logged-in user ---
router.post('/', (req, res) => {
  const userId = req.user.userId;
  const { id, title, description, startTime, endTime, color } = req.body; // Get event details from request body

  // Basic validation
  if (!id || !title || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required event fields (id, title, startTime, endTime).' });
  }

  const sql = 'INSERT INTO events (id, userId, title, description, startTime, endTime, color, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'; // Default isCompleted to 0
  const params = [id, userId, title, description || '', startTime, endTime, color || null];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error adding event:', err.message);
      // Check for unique constraint violation (duplicate ID)
      if (err.message.includes('UNIQUE constraint failed')) {
         return res.status(409).json({ message: 'Event with this ID already exists.' });
      }
      return res.status(500).json({ message: 'Error adding event.' });
    }
    res.status(201).json({ message: 'Event added successfully.', eventId: id });
  });
});

// --- Mark an event as completed ---
router.patch('/:id/complete', (req, res) => {
  const userId = req.user.userId;
  const eventId = req.params.id;

  const sql = 'UPDATE events SET isCompleted = 1 WHERE id = ? AND userId = ? AND isCompleted = 0'; // Only update if currently active
  
  db.run(sql, [eventId, userId], function(err) {
    if (err) {
      console.error('Error marking event complete:', err.message);
      return res.status(500).json({ message: 'Error marking event complete.' });
    }
    if (this.changes === 0) {
       // Either event not found, doesn't belong to user, or already completed
       return res.status(404).json({ message: 'Event not found, not owned by user, or already completed.' });
    }
    res.json({ message: 'Event marked as complete.' });
  });
});


// --- Delete an event ---
router.delete('/:id', (req, res) => {
  const userId = req.user.userId;
  const eventId = req.params.id;

  const sql = 'DELETE FROM events WHERE id = ? AND userId = ?';
  
  db.run(sql, [eventId, userId], function(err) {
    if (err) {
      console.error('Error deleting event:', err.message);
      return res.status(500).json({ message: 'Error deleting event.' });
    }
    if (this.changes === 0) {
       // Event not found or doesn't belong to user
       return res.status(404).json({ message: 'Event not found or not owned by user.' });
    }
    res.json({ message: 'Event deleted successfully.' });
  });
});


module.exports = router;
