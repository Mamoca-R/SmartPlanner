const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database'); // Import db connection
require('dotenv').config(); // Ensure environment variables are loaded (if needed for other keys)

const router = express.Router();

// Note: Removed TypeScript interface definition. We'll rely on object structure.

// Function to parse the raw AI text response into structured event objects
// (Copied and adapted from frontend useAiService.ts)
const parseAiResponse = (responseText) => { // Removed type annotations
  const events = []; // Removed type annotations
  const lines = responseText.trim().split('\n');
  let currentEvent = {}; // Removed type annotations

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) { // Handles blank lines between events
      // Basic check for required properties before pushing
      if (currentEvent.title && currentEvent.description && currentEvent.startTime && currentEvent.duration && currentEvent.color) {
        events.push(currentEvent); // Removed type assertion
      }
      currentEvent = {};
      continue;
    }

    const parts = trimmedLine.split(': ');
    if (parts.length < 2) continue; // Skip malformed lines

    const key = parts[0].toLowerCase();
    const value = parts.slice(1).join(': ').trim();

    if (key === 'title') currentEvent.title = value;
    else if (key === 'description') currentEvent.description = value;
    else if (key === 'start time') currentEvent.startTime = value;
    // Fix duration key to match the prompt ('duration:')
    else if (key === 'duration') currentEvent.duration = value;
    else if (key === 'color') {
      const originalColor = value;
      // Refined cleanup: Trim whitespace first, then split. Handles potential leading/trailing spaces.
      const cleanedColor = originalColor.trim().split(' ')[0]; 
      // Add specific logging for color processing
      console.log(`[Parser] Processing Color - Original: '${originalColor}', Cleaned: '${cleanedColor}'`); 
      currentEvent.color = cleanedColor; // Assign the cleaned color
    }
  }
  // Add the last event if it's complete
  // Basic check for required properties before pushing
  if (currentEvent.title && currentEvent.description && currentEvent.startTime && currentEvent.duration && currentEvent.color) {
      events.push(currentEvent); // Removed type assertion
  }

  return events; // Removed type annotation
};


// POST /api/ai/generate-tasks
// Requires authentication (middleware will be applied in server.js)
router.post('/generate-tasks', async (req, res) => {
  const userId = req.user.userId; // Get userId from the authenticated user (set by authMiddleware)
  const { userPrompt } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ message: 'User prompt is required.' });
  }

  try {
    // 1. Fetch the user's API key from the database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT apiKey FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(new Error('Error fetching user API key.'));
        if (!row) reject(new Error('User not found or API key missing.'));
        resolve(row);
      });
    });

    if (!user || !user.apiKey) {
       return res.status(404).json({ message: 'API Key not found for this user.' });
    }

    const API_KEY = user.apiKey;

    // 2. Initialize Google Generative AI with the user's key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Ensure model name is correct

    // 3. Construct the prompt including current date/time context
    const now = new Date();
    const currentDateTimeString = now.toLocaleString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', timeZoneName: 'short' 
    }); // Example: "Saturday, April 26, 2025 at 10:06 PM EDT"

    const templatePrompt = `Please design a series of events to accomplish a defined goal. Assume the current date and time is ${currentDateTimeString}.

An event should be formatted like this:
Title: [Event Title]
Description: [Event Description]
Start Time: [YYYY-MM-DDTHH:mm:ss.sssZ format]
Duration: [hh:mm format]
Color: [A valid hex color code like #RRGGBB or a common color name like blue, green, purple]

Here is the user's goal: ${userPrompt}

Provide realistic times and durations. Ensure Start Time is in ISO 8601 format and considers the current date/time mentioned above if the goal is relative (e.g., "plan my afternoon").`;

    // 4. Call the AI model
    console.log('Sending prompt to Google Generative AI for user:', userId);
    const result = await model.generateContent(templatePrompt);
    const response = await result.response;
    const text = response.text();
    // Add logging for raw AI response
    console.log('--- Raw AI Response Text ---');
    console.log(text);
    console.log('----------------------------');
    console.log('Received response from AI for user:', userId); // Keep existing log

    // 5. Parse the response
    const parsedEvents = parseAiResponse(text);
    // Add logging for parsed events
    console.log('--- Parsed Events ---');
    console.log(JSON.stringify(parsedEvents, null, 2)); // Pretty print JSON
    console.log('---------------------');

     if (parsedEvents.length === 0 && text.trim().length > 0) {
         // Basic fallback if parsing fails but text exists
         console.warn("AI response parsing failed for user:", userId, " - Returning raw lines.");
         // Consider a more robust fallback or error reporting
         const fallbackEvents = text.split('\\n').filter(line => line.trim().length > 0).map(line => ({
            title: line.trim(),
            description: 'Raw response line',
            startTime: new Date().toISOString(), // Default time
            duration: '00:30', // Default duration
            color: 'grey' 
         }));
         return res.json(fallbackEvents);
      }

    // 6. Send the parsed events back to the client
    res.json(parsedEvents);

  } catch (error) {
    console.error('Error generating tasks via AI for user:', userId, error);
    // Check for specific AI-related errors (e.g., invalid API key)
    if (error.message.includes('API key not valid')) {
         return res.status(401).json({ message: 'Your stored API Key is invalid. Please update it.' });
    }
    res.status(500).json({ message: 'Server error generating AI tasks.' });
  }
});

module.exports = router;
