import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventSidebar from '../events/EventSidebar';
import { addMonths, subMonths } from 'date-fns';
import { useCalendarStore } from '../../store/calendarStore';
import { useEventStore } from '../../store/eventStore';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { setActiveDate } = useCalendarStore();
  const { events } = useEventStore();
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setActiveDate(date);
    setIsSidebarOpen(true);
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setActiveDate(today);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="flex flex-col md:flex-row transition-all duration-300">
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:mr-80' : ''}`}>
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodayClick={handleTodayClick}
        />
        <CalendarGrid 
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          onDateClick={handleDateClick}
        />
      </div>
      
      <EventSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarView;