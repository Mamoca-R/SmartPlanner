// Define your API base URL - should match the backend server address
const API_BASE_URL = 'http://localhost:3001/api'; 

// Helper function to get the auth token from local storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Interface for standard API responses (optional but good practice)
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Core function for making authenticated API requests
// Add 'export' keyword here
export const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', 
  body?: any // Optional body for POST, PUT, PATCH
): Promise<T> => {
  
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
     // Handle cases where a token is expected but missing for protected routes
     // This might indicate an issue with login state or accessing protected routes when logged out
     console.warn(`Attempted API request to ${endpoint} without auth token.`);
     // Depending on the endpoint, you might want to throw an error or handle differently
     // For now, we proceed, but the backend middleware will likely reject it.
  }

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Attempt to parse JSON regardless of status code, as error messages might be in the body
    let responseData;
    try {
       responseData = await response.json();
    } catch (jsonError) {
       // Handle cases where the response is not JSON (e.g., plain text error from server)
       if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
       }
       // If response is ok but not JSON, maybe return null or handle as needed
       return null as T; 
    }


    if (!response.ok) {
      // Use message from response body if available, otherwise use status text
      const errorMessage = responseData?.message || `API Error: ${response.status} ${response.statusText}`;
      console.error(`API Error (${endpoint}):`, errorMessage, responseData);
      throw new Error(errorMessage);
    }

    return responseData as T; // Return the parsed JSON data

  } catch (error: any) {
    console.error(`API Request Failed (${method} ${endpoint}):`, error);
    // Re-throw the error to be caught by the calling function
    throw error; 
  }
};

// Export specific API functions using the core request function
export const apiService = {
  getEvents: () => apiRequest<{ activeEvents: Event[], completedEvents: Event[] }>('/events', 'GET'),
  addEvent: (eventData: Omit<Event, 'userId' | 'isCompleted'>) => apiRequest('/events', 'POST', eventData),
  deleteEvent: (eventId: string) => apiRequest(`/events/${eventId}`, 'DELETE'),
  markEventComplete: (eventId: string) => apiRequest(`/events/${eventId}/complete`, 'PATCH'),
  // Add other API calls as needed (e.g., updateEvent if full updates are required)
};

// Re-export Event type if needed elsewhere, assuming it's defined in ../types
import { Event } from '../types';
