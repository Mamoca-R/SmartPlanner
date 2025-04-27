import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BrainCircuit, Loader2, PlusCircle, CheckCircle } from 'lucide-react'; // Added icons
import { useAiService } from '../../services/useAiService';
import { useTheme } from '../../context/ThemeContext';
import { useEventStore } from '../../store/eventStore'; // Added event store import
import { toast } from 'sonner';
import { Event } from '../../types'; // Explicitly import Event type

interface FormData {
  prompt: string;
}

// Define the structure expected from the AI response (matching useAiService)
// Note: This assumes useAiService returns objects with these fields.
interface AiEvent {
  title: string;
  description: string;
  startTime: string; // Expecting a format parseable by new Date()
  duration: string; // Expecting "hh:mm" format
  color: string;
}


const TaskManagerView: React.FC = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<AiEvent[]>([]); // Changed state type
  const [isLoading, setIsLoading] = useState(false);
  const [addedTaskIndices, setAddedTaskIndices] = useState<Set<number>>(new Set()); // State to track added tasks
  const { generateTasks } = useAiService();
  const { addEvent } = useEventStore(); // Get addEvent function from store
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      prompt: ''
    }
  });

  // Helper function to parse duration "hh:mm" into milliseconds
  const parseDuration = (duration: string): number => {
    if (!duration || !duration.includes(':')) {
      console.warn(`Invalid or missing duration format: ${duration}. Defaulting to 1 hour.`);
      return 60 * 60 * 1000; // Default to 1 hour
    }
    const [hours, minutes] = duration.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Invalid duration format: ${duration}. Defaulting to 1 hour.`);
      return 60 * 60 * 1000; // Default to 1 hour
    }
    return (hours * 60 * 60 + minutes * 60) * 1000;
  };

  // Handler to add a generated task as a calendar event
  const handleAddTaskToCalendar = (task: AiEvent, index: number) => {
    try {
      const startDate = new Date(task.startTime);
      if (isNaN(startDate.getTime())) {
        // Handle invalid start time - maybe use current time or prompt user?
        toast.error(`Invalid start time format for task "${task.title}". Cannot add to calendar.`);
        console.error(`Invalid start time format: ${task.startTime}`);
        return;
      }
      
      const durationMs = parseDuration(task.duration);
      const endDate = new Date(startDate.getTime() + durationMs);

      // Convert Date objects to ISO strings for the store
      const newEvent: Event = { // Explicitly type with imported Event type
        id: crypto.randomUUID(), // Generate a unique ID
        title: task.title,
        description: task.description || '', // Ensure description is always a string
        startTime: startDate.toISOString(), // Use ISO string
        endTime: endDate.toISOString(),     // Use ISO string
        color: task.color || '#7c3aed', // Default color if AI doesn't provide one
      };

      addEvent(newEvent); // Pass the correctly typed event
      setAddedTaskIndices(prev => new Set(prev).add(index)); // Mark task as added
      toast.success(`Task "${task.title}" added to calendar!`);

    } catch (error) {
      console.error('Error adding task to calendar:', error);
      toast.error(`Failed to add task "${task.title}" to calendar.`);
    }
  };

  // Handler to add ALL generated tasks to the calendar
  const handleAddAllTasksToCalendar = async () => {
    const tasksToAdd = tasks.filter((_, index) => !addedTaskIndices.has(index));
    if (tasksToAdd.length === 0) {
      toast.info("All generated tasks have already been added.");
      return;
    }

    let addedCount = 0;
    let errorCount = 0;
    const newAddedIndices = new Set(addedTaskIndices); // Copy existing added indices

    // Use Promise.allSettled to handle potential errors for individual adds
    const results = await Promise.allSettled(
      tasksToAdd.map(async (task, originalIndexOffset) => {
        // Find the original index in the `tasks` array
        const originalIndex = tasks.findIndex(t => t.title === task.title && t.startTime === task.startTime); // Basic check, might need refinement if titles/times aren't unique
        
        if (originalIndex === -1 || addedTaskIndices.has(originalIndex)) {
          return; // Skip if not found or already added
        }

        try {
          const startDate = new Date(task.startTime);
          if (isNaN(startDate.getTime())) {
            throw new Error(`Invalid start time format for task "${task.title}".`);
          }
          
          const durationMs = parseDuration(task.duration);
          const endDate = new Date(startDate.getTime() + durationMs);

          const newEvent: Event = {
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description || '',
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            color: task.color || '#7c3aed',
          };

          await addEvent(newEvent); // Use the existing addEvent from the store
          newAddedIndices.add(originalIndex); // Mark as added using original index
          addedCount++;
        } catch (error) {
          console.error(`Error adding task "${task.title}" during Add All:`, error);
          errorCount++;
          // Optionally toast an error for each failed task, or just a summary
        }
      })
    );

    setAddedTaskIndices(newAddedIndices); // Update the state with all newly added indices

    if (addedCount > 0) {
      toast.success(`${addedCount} task(s) added successfully.`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} task(s) could not be added.`);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setTasks([]); // Clear previous tasks
    setAddedTaskIndices(new Set()); // Clear added status
    try {
      const generatedTasks = await generateTasks(data.prompt);
      // Basic validation if needed
      if (!Array.isArray(generatedTasks)) {
         throw new Error("AI service did not return an array.");
      }
      setTasks(generatedTasks);
      if (generatedTasks.length > 0) {
        toast.success('Tasks generated successfully!');
      } else {
        toast.info('AI generated no tasks for this prompt.');
      }
      reset(); // Reset the form input
    } catch (error) {
      toast.error('Failed to generate tasks. Please try again.');
      console.error('Error generating tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className={`p-6 rounded-lg shadow-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center mb-6">
          <BrainCircuit className="w-8 h-8 text-purple-500 mr-2" />
          <h2 className="text-2xl font-semibold">AI Task Manager</h2>
        </div>
        
        <div className="mb-6">
          <p className={`mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Describe your plans or goals, and the AI will generate a list of tasks to help you achieve them.
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <textarea
                {...register('prompt', { 
                  required: 'Please enter a description of your plans or goals' 
                })}
                rows={4}
                placeholder="E.g., I'm planning a vacation to Europe for two weeks in June..."
                className={`w-full px-4 py-3 rounded-md border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${errors.prompt ? 'border-red-500' : ''}`}
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-500">{errors.prompt.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              } disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Tasks...
                </>
              ) : 'Generate Tasks'}
            </button>
          </form>
        </div>
        
        {tasks.length > 0 && (
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Generated Tasks</h3>
              {/* Add All Tasks Button */}
              {tasks.length > 0 && (
                <button
                  onClick={handleAddAllTasksToCalendar}
                  disabled={tasks.every((_, index) => addedTaskIndices.has(index))} // Disable if all are added
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    tasks.every((_, index) => addedTaskIndices.has(index))
                      ? `cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`
                      : `${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`
                  }`}
                  title={tasks.every((_, index) => addedTaskIndices.has(index)) ? "All tasks added" : "Add all remaining tasks to calendar"}
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Add All Tasks
                </button>
              )}
            </div>
            <ul className="space-y-4"> {/* Increased spacing */}
              {tasks.map((task, index) => {
                const isAdded = addedTaskIndices.has(index);
                return (
                  <li 
                    key={index}
                    className={`p-4 rounded-lg ${ // Increased padding
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } shadow-md flex flex-col sm:flex-row sm:items-start`} // Adjusted layout for responsiveness
                  >
                    {/* Task Details */}
                    <div className="flex-grow mb-3 sm:mb-0 sm:mr-4">
                      <div className="flex items-center mb-1">
                         {/* Optional: Display color indicator */}
                         {task.color && (
                           <span 
                             className="w-3 h-3 rounded-full mr-2 inline-block" 
                             style={{ backgroundColor: task.color, border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb' }}
                             title={`Color: ${task.color}`}
                           ></span>
                         )}
                        <h4 className="font-semibold text-lg">{task.title || 'Untitled Task'}</h4>
                      </div>
                      {task.description && (
                        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {task.startTime && <span>Starts: {task.startTime}</span>}
                        {task.duration && <span className="ml-2">Duration: {task.duration}</span>}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAddTaskToCalendar(task, index)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                          isAdded
                            ? `cursor-not-allowed ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'}`
                            : `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`
                        }`}
                        title={isAdded ? "Task already added" : "Add to Calendar"}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4 mr-1.5" />
                            Add Task
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagerView;
