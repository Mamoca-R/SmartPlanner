import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { Event } from '../../types';
import DayCell from './DayCell';
import { useTheme } from '../../context/ThemeContext';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateClick
}) => {
  const { theme } = useTheme();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });
  
  const getEventsForDay = (day: Date) => {
    // Filter events based on the start time matching the current day
    return events.filter(event => {
      // Ensure startTime is valid before creating a Date object
      if (!event.startTime) return false; 
      try {
        const eventDate = new Date(event.startTime);
        // Check if the date is valid before comparison
        return !isNaN(eventDate.getTime()) && isSameDay(eventDate, day);
      } catch (e) {
        console.error(`Error parsing startTime: ${event.startTime}`, e);
        return false; // Exclude events with invalid startTime
      }
    });
  };

  return (
    <div className={`rounded-lg overflow-hidden border transition-colors ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {/* Day names header */}
      <div className={`grid grid-cols-7 transition-colors ${
        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'
      }`}>
        {dayNames.map((day, index) => (
          <div 
            key={index} 
            className="py-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          return (
            <DayCell
              key={i}
              day={day}
              events={dayEvents}
              isCurrentMonth={isSameMonth(day, monthStart)}
              isSelected={isSameDay(day, selectedDate)}
              isToday={isToday(day)}
              onClick={() => onDateClick(day)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
