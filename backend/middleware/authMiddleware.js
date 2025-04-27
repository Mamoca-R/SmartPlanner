const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure environment variables are loaded

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1); // Exit if JWT secret is missing
}

const authenticateToken = (req, res, next) => {
  // Get token from the Authorization header (e.g., "Bearer TOKEN")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided
    return res.status(401).json({ message: 'Authentication token required.' }); 
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' }); 
    }

    // Token is valid, attach user payload (which should contain user ID) to the request object
    req.user = user; 
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
