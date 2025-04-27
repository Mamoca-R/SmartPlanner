import React from 'react';
import { useEventStore } from '../../store/eventStore';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react'; // Import icon for potential future use (e.g., permanent delete)
import { toast } from 'sonner';

const CompletedTasksView: React.FC = () => {
  // Get completed events and the remove function (to potentially allow deletion from completed list)
  const { completedEvents, removeEvent } = useEventStore();

  // Sort completed events, e.g., by completion time if stored, or end time
  // For now, sorting by end time as a proxy
  const sortedCompletedEvents = [...completedEvents].sort((a, b) => 
    new Date(b.endTime).getTime() - new Date(a.endTime).getTime() // Sort descending by end time
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Completed Tasks</h2>
      
      {sortedCompletedEvents.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">You have no completed tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {sortedCompletedEvents.map((event) => (
            <li key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow opacity-70 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400 line-through">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">{event.description}</p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                <p>
                  Completed (Originally Started: {format(new Date(event.startTime), 'PPP p')})
                </p>
                <p>
                  Ended: {format(new Date(event.endTime), 'PPP p')}
                </p>
              </div>
               {/* Optional: Add a button to permanently delete from completed list */}
               <div className="mt-3 flex justify-end">
                 <button
                   onClick={() => {
                     if (window.confirm(`Permanently delete completed task "${event.title}"? This cannot be undone.`)) {
                       removeEvent(event.id); // removeEvent handles removing from both lists
                       toast.info(`Completed task "${event.title}" permanently deleted.`);
                     }
                   }}
                   className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors text-xs flex items-center"
                   title="Permanently Delete"
                 >
                   <Trash2 size={14} className="mr-1" />
                   Delete Permanently
                 </button>
               </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedTasksView;
