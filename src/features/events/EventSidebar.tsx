import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Plus, Clock, AlertCircle, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import EventForm from './EventForm';
import AlarmForm from '../alarms/AlarmForm';
import { Event, Alarm } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { useAlarmStore } from '../../store/alarmStore';
import { useTheme } from '../../context/ThemeContext';

interface EventSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'events' | 'alarms'>('events');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  
  const { events, removeEvent } = useEventStore();
  const { alarms, removeAlarm } = useAlarmStore();
  
  // Filter events for the selected date
  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === selectedDate.toDateString();
  });
  
  // Filter alarms for the selected date
  const dateAlarms = alarms.filter(alarm => {
    const alarmDate = new Date(alarm.time);
    return alarmDate.toDateString() === selectedDate.toDateString();
  });
  
  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };
  
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };
  
  const handleAddAlarm = () => {
    setEditingAlarm(null);
    setShowAlarmForm(true);
  };
  
  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setShowAlarmForm(true);
  };
  
  const handleFormClose = () => {
    setShowEventForm(false);
    setShowAlarmForm(false);
    setEditingEvent(null);
    setEditingAlarm(null);
  };
  
  return (
    <>
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-80 transition-transform duration-300 transform z-20
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          shadow-lg border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b 
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b 
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
          <button
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'events'
                ? (theme === 'dark' 
                    ? 'border-b-2 border-blue-500 text-blue-500' 
                    : 'border-b-2 border-blue-500 text-blue-500')
                : ''
            }`}
            onClick={() => setActiveTab('events')}
          >
            <span className="flex items-center justify-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Events</span>
            </span>
          </button>
          <button
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'alarms'
                ? (theme === 'dark' 
                    ? 'border-b-2 border-blue-500 text-blue-500' 
                    : 'border-b-2 border-blue-500 text-blue-500')
                : ''
            }`}
            onClick={() => setActiveTab('alarms')}
          >
            <span className="flex items-center justify-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Alarms</span>
            </span>
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'events' ? (
          <div className="p-4">
            {dateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dateEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => removeEvent(event.id)}
                  />
                ))}
              </div>
            )}
            
            <button
              onClick={handleAddEvent}
              className={`mt-4 w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        ) : (
          <div className="p-4">
            {dateAlarms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No alarms for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dateAlarms.map((alarm) => (
                  <AlarmItem 
                    key={alarm.id} 
                    alarm={alarm} 
                    onEdit={() => handleEditAlarm(alarm)}
                    onDelete={() => removeAlarm(alarm.id)}
                  />
                ))}
              </div>
            )}
            
            <button
              onClick={handleAddAlarm}
              className={`mt-4 w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Alarm</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Forms */}
      {showEventForm && (
        <EventForm
          selectedDate={selectedDate}
          event={editingEvent}
          onClose={handleFormClose}
        />
      )}
      
      {showAlarmForm && (
        <AlarmForm
          selectedDate={selectedDate}
          alarm={editingAlarm}
          onClose={handleFormClose}
        />
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-10"
          onClick={onClose}
        />
      )}
    </>
  );
};

interface EventItemProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const startTime = format(new Date(event.startTime), 'h:mm a');
  const endTime = format(new Date(event.endTime), 'h:mm a');
  
  return (
    <div 
      onClick={onEdit}
      className={`p-3 rounded-md cursor-pointer transition-colors 
        ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
      }
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{event.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-300'
          }`}
          aria-label="Delete event"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      <div className="mt-1 text-sm flex items-center text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        <span>{startTime} - {endTime}</span>
      </div>
      {event.description && (
        <p className="mt-2 text-sm truncate">{event.description}</p>
      )}
    </div>
  );
};

interface AlarmItemProps {
  alarm: Alarm;
  onEdit: () => void;
  onDelete: () => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const alarmTime = format(new Date(alarm.time), 'h:mm a');
  
  return (
    <div 
      onClick={onEdit}
      className={`p-3 rounded-md cursor-pointer transition-colors 
        ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
      }
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{alarm.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-300'
          }`}
          aria-label="Delete alarm"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      <div className="mt-1 text-sm flex items-center text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        <span>{alarmTime}</span>
      </div>
      {alarm.description && (
        <p className="mt-2 text-sm truncate">{alarm.description}</p>
      )}
    </div>
  );
};

export default EventSidebar;