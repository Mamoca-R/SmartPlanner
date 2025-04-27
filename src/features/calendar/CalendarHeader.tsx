import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayClick: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTodayClick
}) => {
  const { theme } = useTheme();
  const monthYear = format(currentDate, 'MMMM yyyy');
  
  return (
    <div className={`flex items-center justify-between py-4 mb-6 transition-colors ${
      theme === 'dark' ? 'text-white' : 'text-gray-800'
    }`}>
      <h2 className="text-2xl font-semibold">{monthYear}</h2>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onTodayClick}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Today
        </button>
        
        <div className="flex items-center">
          <button
            onClick={onPrevMonth}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-100'
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={onNextMonth}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-100'
            }`}
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;