const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Import db connection
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

// --- Registration Route ---
router.post('/register', async (req, res) => {
  const { username, password, apiKey } = req.body; // Destructure apiKey

  // Basic validation
  if (!username || !password || !apiKey) { // Add apiKey check
    return res.status(400).json({ message: 'Username, password, and API Key are required.' });
  }
  if (password.length < 6) {
     return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }
  // Basic check for API key presence - could add more specific validation if needed
  if (apiKey.length < 10) { 
    return res.status(400).json({ message: 'API Key appears invalid.' });
  }

  try {
    // Check if username already exists
    const userExists = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (userExists) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user into the database, including the apiKey
    db.run('INSERT INTO users (username, password, apiKey) VALUES (?, ?, ?)', [username, hashedPassword, apiKey], function(err) {
      if (err) {
        console.error('Error registering user:', err.message);
        // Consider more specific error handling, e.g., if API key format is wrong for DB
        return res.status(500).json({ message: 'Error registering user.' });
      }
      console.log(`User registered with ID: ${this.lastID}`);
      res.status(201).json({ message: 'User registered successfully.', userId: this.lastID });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Find user by username
    db.get('SELECT id, username, password FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Error finding user:', err.message);
        return res.status(500).json({ message: 'Server error during login.' });
      }
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' }); // Generic message for security
      }

      // Compare provided password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password.' }); // Generic message
      }

      // Passwords match - Generate JWT
      const payload = { userId: user.id, username: user.username }; // Include necessary user info in token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

      res.json({ message: 'Login successful.', token: token, userId: user.id, username: user.username });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
