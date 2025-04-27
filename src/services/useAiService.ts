import { toast } from 'sonner';
// Remove GoogleGenerativeAI import
// import { GoogleGenerativeAI } from '@google/generative-ai'; 
import { apiRequest } from './apiService'; // Import the apiRequest helper

// Define the structure expected from the AI response (still needed for typing)
interface AiEvent {
  title: string;
  description: string;
  startTime: string; // Assuming ISO format string for now
  duration: string; // Assuming "hh:mm" format
  color: string;
}

export const useAiService = () => {
  // Remove the parseAiResponse function, as parsing is now done on the backend.

  // Function to call the backend AI endpoint
  const generateTasks = async (userPrompt: string): Promise<AiEvent[]> => {
    try {
      console.log('Sending prompt to backend AI service:', userPrompt);
      
      // Call the backend endpoint using apiRequest
      // apiRequest handles the auth token automatically
      const generatedEvents = await apiRequest<AiEvent[]>('/ai/generate-tasks', 'POST', { userPrompt });

      console.log('Received structured events from backend:', generatedEvents);
      
      // The backend now returns the parsed events directly
      return generatedEvents || []; // Return empty array if backend returns null/undefined

    } catch (error: any) {
      console.error('Error generating tasks via backend:', error);
      // Display the error message from the backend API if available
      const errorMessage = error.message || 'Failed to generate tasks via backend service.';
      toast.error(errorMessage); 
      return []; // Return empty array on error
    }
  };
  
  return { generateTasks }; // Export the updated function
};
