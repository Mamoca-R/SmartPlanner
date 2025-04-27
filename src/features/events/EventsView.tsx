import React from 'react';
import { useEventStore } from '../../store/eventStore';
import { format } from 'date-fns';
import { Check, Trash2 } from 'lucide-react'; // Import icons
import { toast } from 'sonner'; // For feedback

const EventsView: React.FC = () => {
  // Get functions from the store
  const { events, removeEvent, markEventAsCompleted } = useEventStore();

  // Sort events chronologically by start time
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h2>
      
      {sortedEvents.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">You have no upcoming events.</p>
      ) : (
        <ul className="space-y-4">
          {sortedEvents.map((event) => (
            <li key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">{event.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-1">{event.description}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Starts: {format(new Date(event.startTime), 'PPP p')} 
                </p>
                <p>
                  Ends: {format(new Date(event.endTime), 'PPP p')}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    markEventAsCompleted(event.id);
                    toast.success(`Event "${event.title}" marked as complete.`);
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm flex items-center"
                  title="Mark as Complete"
                >
                  <Check size={16} className="mr-1" />
                  Complete
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                      removeEvent(event.id);
                      toast.success(`Event "${event.title}" deleted.`);
                    }
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm flex items-center"
                  title="Delete Event"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsView;
