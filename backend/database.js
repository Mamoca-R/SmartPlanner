const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path for the SQLite database file within the backend directory
const dbPath = path.resolve(__dirname, 'planner_smart.db');

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Function to initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        apiKey TEXT NOT NULL -- Add column for user's API key
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });

    // Create Events table
    // Note: We store boolean as INTEGER (0 for false, 1 for true) in SQLite
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY, 
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        startTime TEXT NOT NULL, -- ISO String
        endTime TEXT NOT NULL,   -- ISO String
        color TEXT,
        isCompleted INTEGER DEFAULT 0, -- 0 = false, 1 = true
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE 
      )
    `, (err) => {
      if (err) {
        console.error('Error creating events table:', err.message);
      } else {
        console.log('Events table created or already exists.');
      }
    });
  });
}

module.exports = db; // Export the database connection
