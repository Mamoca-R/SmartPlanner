require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Import the initialized database connection

const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend requests
app.use(express.json()); // Parse incoming JSON requests

// Basic Route (optional, for testing server is running)
app.get('/', (req, res) => {
  res.send('PlannerSmart Backend is running!');
});

// --- Middleware ---
const authenticateToken = require('./middleware/authMiddleware');

// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Import AI routes

app.use('/api/auth', authRoutes); // Mount authentication routes (public)

// Apply authentication middleware ONLY to protected routes
app.use('/api/events', authenticateToken, eventRoutes); // Protect event routes
app.use('/api/ai', authenticateToken, aiRoutes); // Protect AI routes


// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Note: The database connection is already established in database.js
  // We don't need to explicitly call initializeDatabase() here again.
});

// Graceful shutdown (optional but good practice)
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
