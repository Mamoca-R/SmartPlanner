import React from 'react';
import { useAlarmStore } from '../../store/alarmStore';
import { format } from 'date-fns';
import { Bell, BellOff } from 'lucide-react'; // Icons for toggle

const AlarmsView: React.FC = () => {
  const { alarms, toggleAlarm, removeAlarm } = useAlarmStore();

  // Sort alarms chronologically by time
  const sortedAlarms = [...alarms].sort((a, b) => 
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleAlarm(id, !currentStatus);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Alarms</h2>
      
      {/* TODO: Add button/form to create new alarms */}

      {sortedAlarms.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">You have no alarms set.</p>
      ) : (
        <ul className="space-y-4">
          {sortedAlarms.map((alarm) => (
            <li key={alarm.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className={`text-xl font-semibold mb-2 ${alarm.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 line-through'}`}>{alarm.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-1">{alarm.description}</p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {format(new Date(alarm.time), 'PPP p')}
                </p>
                {/* TODO: Add custom sound selection/display here */}
              </div>
              <div className="flex items-center space-x-2">
                 <button 
                   onClick={() => handleToggle(alarm.id, alarm.isActive)}
                   className={`p-2 rounded-full transition-colors ${alarm.isActive ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800' : 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800'}`}
                   aria-label={alarm.isActive ? 'Deactivate Alarm' : 'Activate Alarm'}
                 >
                   {alarm.isActive ? <Bell size={20} className="text-green-600 dark:text-green-400" /> : <BellOff size={20} className="text-red-600 dark:text-red-400" />}
                 </button>
                 <button 
                   onClick={() => removeAlarm(alarm.id)}
                   className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                   aria-label="Delete Alarm"
                 >
                   {/* Add a Trash icon or similar */}
                   <span className="text-red-500">Del</span> 
                 </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlarmsView;
