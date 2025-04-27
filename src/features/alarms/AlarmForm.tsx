import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Alarm } from '../../types';
import { useAlarmStore } from '../../store/alarmStore';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { setHours, setMinutes } from 'date-fns';

interface AlarmFormProps {
  selectedDate: Date;
  alarm: Alarm | null;
  onClose: () => void;
}

interface AlarmFormData {
  title: string;
  description: string;
  hour: string;
  minute: string;
  amPm: 'AM' | 'PM';
}

const AlarmForm: React.FC<AlarmFormProps> = ({
  selectedDate,
  alarm,
  onClose
}) => {
  const { theme } = useTheme();
  const { addAlarm, updateAlarm } = useAlarmStore();
  
  const isEditing = !!alarm;
  
  let defaultHour = '9';
  let defaultMinute = '00';
  let defaultAmPm: 'AM' | 'PM' = 'AM';
  
  if (isEditing && alarm) {
    const alarmDate = new Date(alarm.time);
    let hours = alarmDate.getHours();
    defaultAmPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    defaultHour = hours === 0 ? '12' : hours.toString();
    defaultMinute = alarmDate.getMinutes().toString().padStart(2, '0');
  }
  
  const { register, handleSubmit, formState: { errors } } = useForm<AlarmFormData>({
    defaultValues: {
      title: isEditing ? alarm?.title : '',
      description: isEditing ? alarm?.description : '',
      hour: defaultHour,
      minute: defaultMinute,
      amPm: defaultAmPm
    }
  });
  
  const onSubmit = (data: AlarmFormData) => {
    // Convert form time to Date objects
    let hour = parseInt(data.hour);
    if (data.amPm === 'PM' && hour < 12) hour += 12;
    if (data.amPm === 'AM' && hour === 12) hour = 0;
    
    const minute = parseInt(data.minute);
    
    let alarmTime = new Date(selectedDate);
    alarmTime = setHours(alarmTime, hour);
    alarmTime = setMinutes(alarmTime, minute);
    
    const alarmData: Alarm = {
      id: isEditing && alarm ? alarm.id : crypto.randomUUID(),
      title: data.title,
      description: data.description,
      time: alarmTime.toISOString(),
      isActive: true
    };
    
    if (isEditing) {
      updateAlarm(alarmData);
      toast.success('Alarm updated successfully');
    } else {
      addAlarm(alarmData);
      toast.success('Alarm added successfully');
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
            {isEditing ? 'Edit Alarm' : 'Add Alarm'}
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
            
            {/* Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Alarm Time
              </label>
              <div className="flex space-x-2">
                <select
                  {...register('hour')}
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
                  {...register('minute')}
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
                  {...register('amPm')}
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
              {isEditing ? 'Update Alarm' : 'Add Alarm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlarmForm;