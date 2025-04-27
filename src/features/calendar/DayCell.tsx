import React from 'react';
import { format } from 'date-fns';
import { Event } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DayCellProps {
  day: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  events,
  isCurrentMonth,
  isSelected,
  isToday,
  onClick
}) => {
  const { theme } = useTheme();
  const dayNumber = format(day, 'd');
  const maxEventsToShow = 3;
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  // Limit the number of events to display
  const visibleEvents = sortedEvents.slice(0, maxEventsToShow);
  const remainingCount = events.length - maxEventsToShow;
  
  return (
    <div 
      onClick={onClick}
      className={`min-h-[100px] p-2 border transition-all cursor-pointer relative 
        ${isCurrentMonth 
          ? theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50' 
          : theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-400'
        }
        ${isSelected 
          ? theme === 'dark' ? 'ring-2 ring-blue-500 ring-inset' : 'ring-2 ring-blue-500 ring-inset'
          : ''
        }
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}
    >
      <div className="flex justify-between items-start">
        <span 
          className={`text-sm font-medium inline-flex items-center justify-center
            ${isToday 
              ? 'h-6 w-6 rounded-full bg-blue-500 text-white' 
              : ''
            }
          `}
        >
          {dayNumber}
        </span>
      </div>
      
      <div className="mt-2 space-y-1 overflow-hidden"> {/* Added overflow-hidden */}
        {visibleEvents.map((event) => {
          // Determine style based on color format (hex vs named)
          let style = {};
          let className = `text-xs truncate p-1 rounded `;
          let textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800'; // Default text color

          if (event.color?.startsWith('#')) {
            style = { backgroundColor: event.color };
            // Basic contrast check - set text to white for dark backgrounds
            // This is a simple heuristic and might need refinement
            const hex = event.color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            textColor = brightness < 128 ? 'text-white' : 'text-black'; 
            className += textColor; // Apply text color class
          } else {
            // Handle predefined color names with classes
            switch (event.color) {
              case 'blue': className += 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'; break;
              case 'green': className += 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'; break;
              case 'purple': className += 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'; break;
              case 'orange': className += 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'; break;
              case 'pink': className += 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'; break;
              default: className += 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'; // Default/fallback
            }
          }

          return (
            <div 
              key={event.id} // Use event.id for key
              className={className}
              style={style}
              title={event.title} // Add title attribute for full text on hover
            >
              {event.title}
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div className={`text-xs font-medium px-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
