import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Event } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { addMinutes, setHours, setMinutes } from 'date-fns';

interface EventFormProps {
  selectedDate: Date;
  event: Event | null;
  onClose: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  startHour: string;
  startMinute: string;
  startAmPm: 'AM' | 'PM';
  duration: string;
  color: string;
}

const EventForm: React.FC<EventFormProps> = ({
  selectedDate,
  event,
  onClose
}) => {
  const { theme } = useTheme();
  const { addEvent, updateEvent } = useEventStore();
  
  const isEditing = !!event;
  
  let defaultStartHour = '9';
  let defaultStartMinute = '00';
  let defaultStartAmPm: 'AM' | 'PM' = 'AM';
  let defaultDuration = '60';
  let defaultColor = 'blue';
  
  if (isEditing && event) {
    const startDate = new Date(event.startTime);
    let hours = startDate.getHours();
    defaultStartAmPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    defaultStartHour = hours === 0 ? '12' : hours.toString();
    defaultStartMinute = startDate.getMinutes().toString().padStart(2, '0');
    
    const endDate = new Date(event.endTime);
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    defaultDuration = durationMinutes.toString();
    
    defaultColor = event.color || 'blue';
  }
  
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      title: isEditing ? event?.title : '',
      description: isEditing ? event?.description : '',
      startHour: defaultStartHour,
      startMinute: defaultStartMinute,
      startAmPm: defaultStartAmPm,
      duration: defaultDuration,
      color: defaultColor
    }
  });
  
  const onSubmit = (data: EventFormData) => {
    // Convert form time to Date objects
    let startHour = parseInt(data.startHour);
    if (data.startAmPm === 'PM' && startHour < 12) startHour += 12;
    if (data.startAmPm === 'AM' && startHour === 12) startHour = 0;
    
    const startMinute = parseInt(data.startMinute);
    const durationMinutes = parseInt(data.duration);
    
    let startTime = new Date(selectedDate);
    startTime = setHours(startTime, startHour);
    startTime = setMinutes(startTime, startMinute);
    
    const endTime = addMinutes(startTime, durationMinutes);
    
    const eventData: Event = {
      id: isEditing && event ? event.id : crypto.randomUUID(),
      title: data.title,
      description: data.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      color: data.color
    };
    
    if (isEditing) {
      updateEvent(eventData);
      toast.success('Event updated successfully');
    } else {
      addEvent(eventData);
      toast.success('Event added successfully');
    }
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`w-full max-w-md rounded-lg shadow-xl transition-colors
          ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className={`w-full px-3 py-2 rounded-md transition-colors
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                  }
                  ${errors.title ? 'border-red-500' : 'border'}
                `}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className={`w-full px-3 py-2 rounded-md transition-colors
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                  }
                  border
                `}
              />
            </div>
            
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <div className="flex space-x-2">
                <select
                  {...register('startHour')}
                  className={`w-24 px-3 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                    }
                    border
                  `}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                
                <select
                  {...register('startMinute')}
                  className={`w-24 px-3 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                    }
                    border
                  `}
                >
                  {Array.from({ length: 4 }, (_, i) => i * 15).map((minute) => (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                
                <select
                  {...register('startAmPm')}
                  className={`w-24 px-3 py-2 rounded-md transition-colors
                    ${theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                    }
                    border
                  `}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <select
                id="duration"
                {...register('duration')}
                className={`w-full px-3 py-2 rounded-md transition-colors
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                  }
                  border
                `}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Color
              </label>
              <div className="flex space-x-2">
                {['blue', 'green', 'purple', 'orange', 'pink'].map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input
                      type="radio"
                      {...register('color')}
                      value={color}
                      className="sr-only"
                    />
                    <div 
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === 'blue' ? 'bg-blue-500' : 
                        color === 'green' ? 'bg-green-500' : 
                        color === 'purple' ? 'bg-purple-500' : 
                        color === 'orange' ? 'bg-orange-500' : 
                        'bg-pink-500'
                      } border-2 hover:scale-110`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;