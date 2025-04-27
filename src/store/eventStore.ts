import { create } from 'zustand';
// Remove persist middleware as we'll fetch from backend
// import { persist } from 'zustand/middleware'; 
import { Event } from '../types';
import { apiService } from '../services/apiService'; // Import the API service
import { toast } from 'sonner'; // For feedback on API errors

interface EventState {
  events: Event[];
  completedEvents: Event[];
  isLoading: boolean; // Track loading state
  fetchEvents: () => Promise<void>; // Function to load events from backend
  addEvent: (event: Event) => Promise<void>; // Make async for API call
  // updateEvent: (event: Event) => Promise<void>; // Keep signature if needed later
  removeEvent: (id: string) => Promise<void>; // Make async for API call
  markEventAsCompleted: (id: string) => Promise<void>; // Make async for API call
  clearEvents: () => void; // Function to clear events on logout
}

export const useEventStore = create<EventState>()(
  (set, get) => ({ 
    events: [],
    completedEvents: [],
    isLoading: false, // Initially not loading

    // Fetch events from backend
    fetchEvents: async () => {
      set({ isLoading: true });
      try {
        const { activeEvents, completedEvents } = await apiService.getEvents();
        set({ events: activeEvents, completedEvents: completedEvents, isLoading: false });
      } catch (error: any) {
        console.error("Failed to fetch events:", error);
        toast.error(`Failed to load events: ${error.message}`);
        set({ isLoading: false, events: [], completedEvents: [] }); // Clear on error
      }
    },

    // Add event via API and update state
    addEvent: async (event) => {
       // Optimistic update (optional): Add locally first for responsiveness
       // set((state) => ({ events: [...state.events, event] })); 
       try {
         // Ensure ID is present before sending (AI service should provide it)
         if (!event.id) {
            console.error("Attempted to add event without ID:", event);
            toast.error("Cannot add event: Missing ID.");
            return; 
         }
         await apiService.addEvent(event);
         // Re-fetch or update state based on success (re-fetch is simpler for now)
         await get().fetchEvents(); // Re-fetch to ensure consistency
         // Or, if API returns the added event, update state directly:
         // set((state) => ({ events: [...state.events, addedEventFromApi] }));
       } catch (error: any) {
         console.error("Failed to add event:", error);
         toast.error(`Failed to add event: ${error.message}`);
         // Rollback optimistic update if implemented
         // await get().fetchEvents(); // Re-fetch to correct state
       }
    },
    
    // updateEvent: async (updatedEvent) => { ... implement if needed ... },

    // Remove event via API and update state
    removeEvent: async (id) => {
      // Optimistic update (optional)
      const originalEvents = get().events;
      const originalCompleted = get().completedEvents;
      set((state) => ({ 
         events: state.events.filter((event) => event.id !== id),
         completedEvents: state.completedEvents.filter((event) => event.id !== id) 
      }));
      try {
        await apiService.deleteEvent(id);
        // No state update needed if optimistic update was successful
      } catch (error: any) {
        console.error("Failed to delete event:", error);
        toast.error(`Failed to delete event: ${error.message}`);
        // Rollback optimistic update
        set({ events: originalEvents, completedEvents: originalCompleted }); 
      }
    },

    // Mark event complete via API and update state
    markEventAsCompleted: async (id) => {
      const eventToComplete = get().events.find((event) => event.id === id);
      if (!eventToComplete) {
         console.warn(`Event with id ${id} not found for completion.`);
         return;
      }
       // Optimistic update
       set((state) => ({
         events: state.events.filter((event) => event.id !== id),
         completedEvents: [...state.completedEvents, eventToComplete],
       }));
      try {
        await apiService.markEventComplete(id);
         // No state update needed if optimistic update was successful
      } catch (error: any) {
        console.error("Failed to mark event complete:", error);
        toast.error(`Failed to mark event complete: ${error.message}`);
         // Rollback optimistic update
         set((state) => ({
            events: [...state.events, eventToComplete], // Add back to active
            completedEvents: state.completedEvents.filter(e => e.id !== id), // Remove from completed
         }));
      }
    },

    // Clear events (e.g., on logout)
    clearEvents: () => {
       set({ events: [], completedEvents: [], isLoading: false });
    }
  })
  // Remove the persist wrapper
  // {
  //   name: 'calendar-events-storage', 
  // }
);
